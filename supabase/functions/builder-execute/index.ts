// builder-execute — реальный запуск workflow через Claude API.
//
// Поток:
//   1. JWT-авторизация.
//   2. Принять { executionId (uuid с клиента), workflowId, input }.
//   3. Проверить владение workflow (admin обходит RLS — проверяем вручную!).
//   4. Расшифровать API-ключ пользователя.
//   5. Создать execution-строку (status running) с переданным id.
//   6. Топологический порядок узлов → по каждому:
//        • trigger  — seed входных данных
//        • agent    — вызов Claude с роль-промптом + накопленный контекст
//        • tool     — пока не выполняется (реальные интеграции = B-3), лог-пометка
//        • output   — собрать финальный результат
//      Каждый шаг пишет лог-строку (Realtime → frontend видит вживую).
//   7. Обновить execution → completed/failed + tokens_used + output.
//
// Деплой: supabase functions deploy builder-execute
//
// Лимит времени edge function ~150с — для небольших workflow (4-7 узлов) ок.

import { getUser, adminClient, json, cors } from '../_shared/auth.ts';
import { decrypt } from '../_shared/crypto.ts';
import { systemPromptForRole, roleLabel } from '../_shared/rolePrompts.ts';

const CLAUDE_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-5';
const MAX_NODES = 25; // защита от runaway: не больше 25 узлов за запуск

// Размер результата → max_tokens на агент-вызов (см. outputTiers.js на клиенте).
const TIER_MAX_TOKENS: Record<string, number> = { s: 512, m: 2048, l: 4096 };
const DEFAULT_TIER = 's';

// Локаль → язык ответа. Добавляется директивой в system, чтобы результат был
// на языке пользователя независимо от языка инструкции.
const LANG_NAME: Record<string, string> = { ru: 'Russian', en: 'English', fi: 'Finnish' };
function langDirective(locale: string): string {
  const lang = LANG_NAME[locale] || 'English';
  return `\n\nAlways write your response in ${lang}.`;
}

type Node = { client_id: string; node_type: string; role: string | null; def_id: string; config?: Record<string, unknown> };
type Edge = { source_client_id: string; target_client_id: string };

// Топологическая сортировка (Kahn). Возвращает порядок client_id.
function topoOrder(nodes: Node[], edges: Edge[]): string[] {
  const indeg = new Map<string, number>();
  const adj = new Map<string, string[]>();
  for (const n of nodes) { indeg.set(n.client_id, 0); adj.set(n.client_id, []); }
  for (const e of edges) {
    if (!adj.has(e.source_client_id) || !indeg.has(e.target_client_id)) continue;
    adj.get(e.source_client_id)!.push(e.target_client_id);
    indeg.set(e.target_client_id, (indeg.get(e.target_client_id) || 0) + 1);
  }
  const queue = nodes.filter(n => (indeg.get(n.client_id) || 0) === 0).map(n => n.client_id);
  const order: string[] = [];
  while (queue.length) {
    const id = queue.shift()!;
    order.push(id);
    for (const next of adj.get(id) || []) {
      indeg.set(next, (indeg.get(next) || 0) - 1);
      if (indeg.get(next) === 0) queue.push(next);
    }
  }
  // Узлы в циклах (если есть) — добавим в конец, чтобы не потерять.
  for (const n of nodes) if (!order.includes(n.client_id)) order.push(n.client_id);
  return order;
}

// ─── Web-инструмент (Фаза 4): реальная загрузка страниц ──────────────────────
// Извлекаем URL из текста (вход/контекст).
function extractUrls(text: string): string[] {
  const re = /https?:\/\/[^\s)<>"'`]+/gi;
  return [...new Set(text.match(re) || [])].slice(0, 3);
}

// SSRF-защита: не ходим на localhost/приватные/metadata-адреса.
function isBlockedHost(host: string): boolean {
  const h = host.toLowerCase();
  if (h === 'localhost' || h.endsWith('.localhost') || h === '0.0.0.0') return true;
  const m = h.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (m) {
    const a = Number(m[1]), b = Number(m[2]);
    if (a === 127 || a === 10 || a === 0) return true;       // loopback / private / reserved
    if (a === 169 && b === 254) return true;                  // link-local / cloud metadata
    if (a === 192 && b === 168) return true;                  // private
    if (a === 172 && b >= 16 && b <= 31) return true;         // private
  }
  return false;
}

// Загружаем страницу и превращаем HTML в плоский текст (с лимитами и таймаутом).
async function fetchPageText(url: string): Promise<string | null> {
  let u: URL;
  try { u = new URL(url); } catch { return null; }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
  if (isBlockedHost(u.hostname)) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(u.toString(), {
      signal: ctrl.signal,
      redirect: 'follow',
      headers: { 'user-agent': 'AtlasBuilderBot/1.0 (+https://105atlas)' },
    });
    const ct = res.headers.get('content-type') || '';
    const raw = (await res.text()).slice(0, 200000); // не тянем гигантов
    let text = raw;
    if (ct.includes('html') || /<html/i.test(raw)) {
      text = raw
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<!--[\s\S]*?-->/g, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim();
    }
    return text.slice(0, 6000) || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function callClaude(apiKey: string, system: string, userContent: string, maxTokens: number) {
  const res = await fetch(CLAUDE_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: userContent }],
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `claude_http_${res.status}`);
  }
  const text = (data.content || []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n');
  const tokens = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);
  return { text, tokens };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const user = await getUser(req);
  if (!user) return json({ error: 'unauthorized' }, 401);

  let body: { executionId?: string; workflowId?: string; input?: string; tier?: string; locale?: string };
  try { body = await req.json(); } catch { return json({ error: 'bad_json' }, 400); }

  const executionId = body.executionId;
  const workflowId = body.workflowId;
  const input = (body.input || '').trim();
  const tier = (body.tier || DEFAULT_TIER).toLowerCase();
  const maxTokens = TIER_MAX_TOKENS[tier] || TIER_MAX_TOKENS[DEFAULT_TIER];
  const locale = (body.locale || 'en').toLowerCase();
  const langSuffix = langDirective(locale);
  if (!executionId || !workflowId) return json({ error: 'missing_params' }, 400);

  const admin = adminClient();

  // Проверка владения workflow (admin обходит RLS — проверяем сами).
  const { data: wf, error: wfErr } = await admin
    .from('builder_workflows').select('id, user_id').eq('id', workflowId).single();
  if (wfErr || !wf) return json({ error: 'workflow_not_found' }, 404);
  if (wf.user_id !== user.id) return json({ error: 'forbidden' }, 403);

  // Ключ пользователя.
  const { data: conn } = await admin
    .from('builder_api_connections')
    .select('encrypted_key, is_active').eq('user_id', user.id).eq('provider', 'anthropic').maybeSingle();
  if (!conn || !conn.is_active) return json({ error: 'no_api_key' }, 400);

  let apiKey: string;
  try { apiKey = await decrypt(conn.encrypted_key); }
  catch { return json({ error: 'key_decrypt_failed' }, 500); }

  // Telegram-токен (опционально) — для узлов доставки в Telegram.
  let telegramToken = '';
  const { data: tgConn } = await admin
    .from('builder_api_connections')
    .select('encrypted_key, is_active').eq('user_id', user.id).eq('provider', 'telegram').maybeSingle();
  if (tgConn?.is_active) {
    try { telegramToken = await decrypt(tgConn.encrypted_key); } catch { telegramToken = ''; }
  }

  // Узлы и рёбра.
  const [{ data: nodes }, { data: edges }] = await Promise.all([
    admin.from('builder_workflow_nodes').select('client_id, node_type, role, def_id, config').eq('workflow_id', workflowId),
    admin.from('builder_workflow_edges').select('source_client_id, target_client_id').eq('workflow_id', workflowId),
  ]);
  if (!nodes || nodes.length === 0) return json({ error: 'empty_workflow' }, 400);
  if (nodes.length > MAX_NODES) return json({ error: 'too_many_nodes' }, 400);

  // Создаём execution-строку (status running) с клиентским id.
  await admin.from('builder_executions').insert({
    id: executionId, workflow_id: workflowId, user_id: user.id,
    status: 'running', input_data: { input, tier },
  });

  const log = async (nodeId: string | null, level: string, message: string, data?: unknown) => {
    await admin.from('builder_execution_logs').insert({
      execution_id: executionId, node_client_id: nodeId, level, message, data: data || null,
    });
  };

  const order = topoOrder(nodes as Node[], (edges || []) as Edge[]);
  const byId = new Map((nodes as Node[]).map(n => [n.client_id, n]));
  const outputs = new Map<string, string>(); // client_id → text result
  let totalTokens = 0;
  let failed = false;
  let lastText = '';

  await log(null, 'info', input ? `Starting run with input: "${input.slice(0, 80)}"` : 'Starting run');

  for (const id of order) {
    const node = byId.get(id);
    if (!node) continue;
    await log(id, 'info', '', { status: 'running' });

    try {
      if (node.node_type === 'trigger') {
        outputs.set(id, input || '(no input)');
        await log(id, 'info', 'Input received', { status: 'completed' });
        continue;
      }
      if (node.node_type === 'output') {
        // Собираем результаты входящих узлов.
        const incoming = (edges || []).filter((e: Edge) => e.target_client_id === id)
          .map((e: Edge) => outputs.get(e.source_client_id)).filter(Boolean);
        const collected = incoming.join('\n\n---\n\n') || lastText;
        lastText = collected;
        outputs.set(id, collected);

        // Доставка в Telegram (роль telegram + config.chatId + подключённый токен).
        // ВАЖНО: «не доставлено» помечаем status:'failed' (красным) — иначе
        // пользователь видит зелёный узел и думает, что сообщение ушло.
        if (node.role === 'telegram') {
          const chatId = typeof node.config?.chatId === 'string' ? node.config.chatId.trim() : '';
          if (!telegramToken) {
            failed = true;
            await log(id, 'error', 'Telegram bot not connected — connect a bot token in “My keys”.', { status: 'failed' });
          } else if (!chatId) {
            failed = true;
            await log(id, 'error', 'No chat ID set on this Telegram node — open it and enter a numeric chat ID.', { status: 'failed' });
          } else {
            try {
              const tgRes = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: collected.slice(0, 4000) }),
              });
              const tgData = await tgRes.json().catch(() => ({}));
              if (tgRes.ok && tgData?.ok) {
                await log(id, 'info', `Sent to Telegram ✓ (chat ${chatId})`, { status: 'completed' });
              } else {
                failed = true;
                const desc = tgData?.description || `http_${tgRes.status}`;
                await log(id, 'error', `Telegram did not deliver: ${desc}. Tip: chat_id must be your numeric ID or a @channel where the bot is admin — not the bot's own @username.`, { status: 'failed' });
              }
            } catch (err) {
              failed = true;
              await log(id, 'error', `Telegram send failed: ${(err as Error).message}`, { status: 'failed' });
            }
          }
          continue;
        }

        await log(id, 'info', 'Result collected', { status: 'completed' });
        continue;
      }
      if (node.node_type === 'tool') {
        // Инструменты — это СПОСОБНОСТИ (ATTACH): исполняются в рамках агента,
        // к которому прикреплены. Сам узел-инструмент только помечаем.
        const note = node.role === 'web_search'
          ? 'Web access — provided to the connected agent'
          : 'Capability attached to the connected agent';
        await log(id, 'info', note, { status: 'completed' });
        continue;
      }
      // agent → Claude
      const incoming = (edges || []).filter((e: Edge) => e.target_client_id === id)
        .map((e: Edge) => outputs.get(e.source_client_id)).filter(Boolean);
      let context = incoming.length ? incoming.join('\n\n') : input;

      // Прикреплённые инструменты. Связь инструмент↔агент пользователь мог
      // нарисовать в любую сторону — учитываем оба направления (другой конец
      // ребра является инструментом).
      const attachedToolRoles = (edges || [])
        .filter((e: Edge) => e.source_client_id === id || e.target_client_id === id)
        .map((e: Edge) => {
          const otherId = e.source_client_id === id ? e.target_client_id : e.source_client_id;
          return byId.get(otherId);
        })
        .filter((n): n is Node => !!n && n.node_type === 'tool')
        .map((n) => n.role || '');

      // Web-инструмент: реально открываем ссылки из задачи/контекста (Фаза 4).
      if (attachedToolRoles.includes('web_search')) {
        const urls = extractUrls(`${context}\n${input}`);
        for (const url of urls.slice(0, 2)) {
          await log(id, 'info', `Opening ${url} …`, { status: 'running' });
          const page = await fetchPageText(url);
          if (page) {
            context += `\n\n[Web content fetched from ${url}]:\n${page}`;
            await log(id, 'info', `Fetched ${url} (${page.length} chars)`, { status: 'running' });
          } else {
            await log(id, 'warn', `Could not open ${url} (blocked, timeout, or non-text)`, {});
          }
        }
      }
      // Если у узла задана своя инструкция (config.prompt) — используем её,
      // иначе встроенный роль-дефолт.
      const customPrompt = typeof node.config?.prompt === 'string' ? node.config.prompt.trim() : '';
      const system = (customPrompt || systemPromptForRole(node.role || 'main')) + langSuffix;
      await log(id, 'info', `${roleLabel(node.role || 'main')} is thinking…`, { status: 'running' });
      const { text, tokens } = await callClaude(apiKey, system, context || 'Proceed.', maxTokens);
      totalTokens += tokens;
      outputs.set(id, text);
      lastText = text;
      await log(id, 'info', text.slice(0, 4000), { status: 'completed', tokens });
    } catch (e) {
      failed = true;
      await log(id, 'error', (e as Error).message || 'Node failed', { status: 'failed' });
      break; // останавливаем на первой ошибке
    }
  }

  // Обновляем last_used_at ключа.
  await admin.from('builder_api_connections')
    .update({ last_used_at: new Date().toISOString() })
    .eq('user_id', user.id).eq('provider', 'anthropic');

  const finalStatus = failed ? 'failed' : 'completed';
  await admin.from('builder_executions').update({
    status: finalStatus,
    output_data: { text: lastText },
    tokens_used: totalTokens,
    completed_at: new Date().toISOString(),
  }).eq('id', executionId);

  await log(null, failed ? 'error' : 'info',
    failed ? 'Run failed' : `Run finished · ${totalTokens} tokens used`,
    { status: finalStatus, tokens: totalTokens });

  return json({ ok: !failed, executionId, status: finalStatus, tokensUsed: totalTokens, output: lastText });
});

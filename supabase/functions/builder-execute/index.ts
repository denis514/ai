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
type Edge = { source_client_id: string; target_client_id: string; config?: Record<string, unknown> };

// Ключ ребра (с учётом ветки sourceHandle) — для блокировки невыбранной ветки.
function edgeKey(e: Edge): string {
  return `${e.source_client_id}>${e.target_client_id}>${(e.config?.sourceHandle as string) || ''}`;
}
// Ветка ребра, выходящего из Condition: 'false' только если явно помечено, иначе 'true'.
function edgeBranch(e: Edge): 'true' | 'false' {
  return (e.config?.sourceHandle as string) === 'false' ? 'false' : 'true';
}

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

type ImageInput = { data: string; mime: string };

type McpServer = { type: 'url'; url: string; name: string; authorization_token?: string };

async function callClaude(apiKey: string, system: string, userContent: string, maxTokens: number, images: ImageInput[] = [], mcpServers: McpServer[] = []) {
  // Если есть картинки (Vision) — собираем мультимодальное сообщение: блоки
  // image + текст. Иначе обычная строка.
  const content = images.length
    ? [
        ...images.map((img) => ({
          type: 'image',
          source: { type: 'base64', media_type: img.mime || 'image/png', data: img.data },
        })),
        { type: 'text', text: userContent },
      ]
    : userContent;
  const headers: Record<string, string> = {
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json',
  };
  const payload: Record<string, unknown> = {
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content }],
  };
  // MCP-коннектор Anthropic (beta): Claude сам вызывает инструменты сервера.
  if (mcpServers.length) {
    headers['anthropic-beta'] = 'mcp-client-2025-04-04';
    payload.mcp_servers = mcpServers;
  }
  const res = await fetch(CLAUDE_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `claude_http_${res.status}`);
  }
  const text = (data.content || []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n');
  const tokens = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);
  return { text, tokens };
}

// ─── Google Calendar (ADR-0009) ──────────────────────────────────────────────
async function gcalAccessToken(refresh: string): Promise<string | null> {
  const id = Deno.env.get('GOOGLE_CLIENT_ID') || '';
  const sec = Deno.env.get('GOOGLE_CLIENT_SECRET') || '';
  if (!id || !sec) return null;
  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: id, client_secret: sec, refresh_token: refresh, grant_type: 'refresh_token' }).toString(),
    });
    const d = await res.json();
    return res.ok ? (d.access_token || null) : null;
  } catch { return null; }
}

// Извлекаем событие из ответа агента: строгий JSON {title,start,end,description}.
// Fallback: title = первая строка, start = now+1ч, end = +1ч.
function parseEvent(text: string): { title: string; start: string; end: string; description?: string } {
  try {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) {
      const o = JSON.parse(m[0]);
      if (o.title && o.start) {
        const start = new Date(o.start);
        const end = o.end ? new Date(o.end) : new Date(start.getTime() + 60 * 60 * 1000);
        if (!isNaN(start.getTime())) {
          return { title: String(o.title), start: start.toISOString(), end: end.toISOString(), description: o.description ? String(o.description) : undefined };
        }
      }
    }
  } catch { /* fallthrough */ }
  const title = (text.split('\n').find(l => l.trim()) || 'Событие').slice(0, 120).trim();
  const start = new Date(Date.now() + 60 * 60 * 1000);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return { title, start: start.toISOString(), end: end.toISOString(), description: text.slice(0, 2000) };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  let body: { executionId?: string; workflowId?: string; input?: string; tier?: string; locale?: string; variables?: Record<string, string>; userId?: string };
  try { body = await req.json(); } catch { return json({ error: 'bad_json' }, 400); }

  // Сервисный режим: серверный планировщик (builder-scheduler) запускает схему
  // БЕЗ JWT пользователя — по секрету BUILDER_SERVICE_SECRET + body.userId.
  // Так схема исполняется на сервере, даже когда браузер закрыт.
  const serviceSecret = Deno.env.get('BUILDER_SERVICE_SECRET') || '';
  const isService = !!serviceSecret && req.headers.get('x-builder-service') === serviceSecret;

  let userId: string;
  if (isService) {
    if (!body.userId) return json({ error: 'missing_user' }, 400);
    userId = body.userId;
  } else {
    const user = await getUser(req);
    if (!user) return json({ error: 'unauthorized' }, 401);
    userId = user.id;
  }

  const executionId = body.executionId;
  const workflowId = body.workflowId;
  const input = (body.input || '').trim();
  const tier = (body.tier || DEFAULT_TIER).toLowerCase();
  const maxTokens = TIER_MAX_TOKENS[tier] || TIER_MAX_TOKENS[DEFAULT_TIER];
  const locale = (body.locale || 'en').toLowerCase();
  const langSuffix = langDirective(locale);
  if (!executionId || !workflowId) return json({ error: 'missing_params' }, 400);

  // Переменные для подстановки {{ключ}} в задачу/инструкции (переиспользуемые схемы).
  // Встроенные: {{input}} (текст задачи), {{date}}/{{today}} (сегодня, YYYY-MM-DD).
  const today = new Date().toISOString().slice(0, 10);
  const vars: Record<string, string> = {
    input, task: input, date: today, today,
    ...(body.variables && typeof body.variables === 'object' ? body.variables : {}),
  };
  const applyVars = (text: string): string =>
    String(text || '').replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (m, key) => {
      const v = vars[key] ?? vars[String(key).toLowerCase()];
      return v != null ? String(v) : m; // неизвестные плейсхолдеры оставляем как есть
    });

  const admin = adminClient();

  // Проверка владения workflow (admin обходит RLS — проверяем сами).
  const { data: wf, error: wfErr } = await admin
    .from('builder_workflows').select('id, user_id').eq('id', workflowId).single();
  if (wfErr || !wf) return json({ error: 'workflow_not_found' }, 404);
  if (wf.user_id !== userId) return json({ error: 'forbidden' }, 403);

  // Ключ пользователя.
  const { data: conn } = await admin
    .from('builder_api_connections')
    .select('encrypted_key, is_active').eq('user_id', userId).eq('provider', 'anthropic').maybeSingle();
  if (!conn || !conn.is_active) return json({ error: 'no_api_key' }, 400);

  let apiKey: string;
  try { apiKey = await decrypt(conn.encrypted_key); }
  catch { return json({ error: 'key_decrypt_failed' }, 500); }

  // Telegram-токен (опционально) — для узлов доставки в Telegram.
  let telegramToken = '';
  const { data: tgConn } = await admin
    .from('builder_api_connections')
    .select('encrypted_key, is_active').eq('user_id', userId).eq('provider', 'telegram').maybeSingle();
  if (tgConn?.is_active) {
    try { telegramToken = await decrypt(tgConn.encrypted_key); } catch { telegramToken = ''; }
  }

  // Resend-ключ (опционально) — для узлов доставки на email.
  let resendKey = '';
  const { data: rsConn } = await admin
    .from('builder_api_connections')
    .select('encrypted_key, is_active').eq('user_id', userId).eq('provider', 'resend').maybeSingle();
  if (rsConn?.is_active) {
    try { resendKey = await decrypt(rsConn.encrypted_key); } catch { resendKey = ''; }
  }

  // Google Calendar refresh-токен (опционально) — для узлов-событий.
  let gcalRefresh = '';
  const { data: gcConn } = await admin
    .from('builder_api_connections')
    .select('encrypted_key, is_active').eq('user_id', userId).eq('provider', 'gcal').maybeSingle();
  if (gcConn?.is_active) {
    try { gcalRefresh = await decrypt(gcConn.encrypted_key); } catch { gcalRefresh = ''; }
  }

  // MCP-серверы пользователя (опционально) — для узла «MCP-коннектор».
  // Расшифровываем токены; передаём в запрос Claude, когда узел прикреплён.
  // _id храним внутри для фильтрации по выбору узла; перед отправкой Claude — убираем.
  const mcpServers: (McpServer & { _id: string })[] = [];
  const { data: mcpRows } = await admin
    .from('builder_mcp_servers')
    .select('id, name, url, encrypted_token, enabled').eq('user_id', userId).eq('enabled', true);
  for (const row of mcpRows || []) {
    let tok = '';
    if (row.encrypted_token) { try { tok = await decrypt(row.encrypted_token); } catch { tok = ''; } }
    mcpServers.push({ _id: row.id, type: 'url', url: row.url, name: row.name, ...(tok ? { authorization_token: tok } : {}) });
  }

  // Узлы и рёбра.
  const [{ data: nodes }, { data: edges }] = await Promise.all([
    admin.from('builder_workflow_nodes').select('client_id, node_type, role, def_id, config').eq('workflow_id', workflowId),
    admin.from('builder_workflow_edges').select('source_client_id, target_client_id, config').eq('workflow_id', workflowId),
  ]);
  if (!nodes || nodes.length === 0) return json({ error: 'empty_workflow' }, 400);
  if (nodes.length > MAX_NODES) return json({ error: 'too_many_nodes' }, 400);

  // Создаём execution-строку (status running) с клиентским id.
  await admin.from('builder_executions').insert({
    id: executionId, workflow_id: workflowId, user_id: userId,
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
  const transcript: string[] = [];           // лента всех шагов — для инструмента «Память»
  const blocked = new Set<string>();         // ключи рёбер невыбранной ветки Condition
  let totalTokens = 0;
  let failed = false;
  let lastText = '';

  const allEdges = (edges || []) as Edge[];
  // DATA-входы узла (рёбра-данные; инструменты прикрепляются через ATTACH и не считаются).
  const dataInEdges = (id: string) =>
    allEdges.filter(e => e.target_client_id === id && byId.get(e.source_client_id)?.node_type !== 'tool');

  // DATA-смежность (без tool-рёбер) — для вычисления тела цикла.
  const dataEdgesOnly = allEdges.filter(e =>
    byId.get(e.source_client_id)?.node_type !== 'tool' && byId.get(e.target_client_id)?.node_type !== 'tool');
  const reach = (start: string, fwd: boolean): Set<string> => {
    const seen = new Set<string>([start]);
    const stack = [start];
    while (stack.length) {
      const cur = stack.pop()!;
      for (const e of dataEdgesOnly) {
        const [from, to] = fwd ? [e.source_client_id, e.target_client_id] : [e.target_client_id, e.source_client_id];
        if (from === cur && !seen.has(to)) { seen.add(to); stack.push(to); }
      }
    }
    return seen;
  };

  // Один прогон агент-узла с заданным контекстом (для повторов «Цикла»).
  const runAgentNode = async (node: Node, ctx: string): Promise<string> => {
    const cpRaw = typeof node.config?.prompt === 'string' ? node.config.prompt.trim() : '';
    const sys = (applyVars(cpRaw) || systemPromptForRole(node.role || 'main')) + langSuffix;
    const { text, tokens } = await callClaude(apiKey, sys, applyVars(ctx) || 'Proceed.', maxTokens);
    totalTokens += tokens;
    return text;
  };

  await log(null, 'info', input ? `Starting run with input: "${input.slice(0, 80)}"` : 'Starting run');

  for (const id of order) {
    const node = byId.get(id);
    if (!node) continue;

    // Ветвление: если у узла есть входы-данные, но ни один из них не «активен»
    // (источник не отработал или ребро заблокировано невыбранной веткой) — пропускаем.
    if (node.node_type !== 'trigger') {
      const din = dataInEdges(id);
      if (din.length > 0) {
        const active = din.some(e => outputs.has(e.source_client_id) && !blocked.has(edgeKey(e)));
        if (!active) {
          await log(id, 'info', 'Пропущено — ветка не выбрана', { status: 'skipped' });
          continue;
        }
      }
    }

    await log(id, 'info', '', { status: 'running' });

    try {
      if (node.node_type === 'trigger') {
        outputs.set(id, input || '(no input)');
        await log(id, 'info', 'Input received', { status: 'completed' });
        continue;
      }
      if (node.node_type === 'logic') {
        // Берём входной текст (без заблокированных веток).
        const inText = dataInEdges(id)
          .filter(e => !blocked.has(edgeKey(e)))
          .map(e => outputs.get(e.source_client_id)).filter(Boolean).join('\n\n') || input;

        // ── Цикл (bounded loop) ──────────────────────────────────────────────
        if (node.role === 'loop') {
          const loopBackTo = String(node.config?.loopBackTo || '').trim();
          const maxLoops = Math.min(Math.max(parseInt(String(node.config?.maxLoops ?? 3), 10) || 3, 1), 8);
          const srcEdge = dataInEdges(id)[0];
          const loopSrc = srcEdge?.source_client_id;
          let result = inText;

          if (!loopBackTo || !byId.get(loopBackTo) || !loopSrc) {
            await log(id, 'warn', 'Цикл без цели — пропускаем повторы', { status: 'completed' });
          } else {
            // Тело цикла = узлы, что одновременно потомки loopBackTo и предки источника.
            const desc = reach(loopBackTo, true);
            const anc = reach(loopSrc, false);
            const body = new Set([...desc].filter(x => anc.has(x)));
            body.add(loopBackTo); body.add(loopSrc);
            const bodyOrder = order.filter(x => body.has(x));
            // Первый прогон уже сделан в основном проходе → добавляем (maxLoops-1).
            for (let i = 1; i < maxLoops && !failed; i++) {
              const iterOut = new Map<string, string>();
              for (const bid of bodyOrder) {
                const bnode = byId.get(bid)!;
                const ctx = bid === loopBackTo
                  ? result
                  : dataInEdges(bid).map(e => iterOut.get(e.source_client_id) ?? outputs.get(e.source_client_id)).filter(Boolean).join('\n\n');
                if (bnode.node_type === 'agent') iterOut.set(bid, await runAgentNode(bnode, ctx));
                else iterOut.set(bid, ctx);
              }
              result = iterOut.get(loopSrc) ?? result;
              await log(id, 'info', `Повтор ${i + 1} из ${maxLoops}`, { status: 'running' });
            }
          }
          outputs.set(id, result);
          lastText = result;
          await log(id, 'info', `Цикл завершён (${maxLoops} прогон(ов))`, { status: 'completed' });
          continue;
        }

        let result = true;
        let detail = '';

        if (node.role === 'condition-agent') {
          // Ветку решает Claude по вопросу пользователя — отвечает строго ДА/НЕТ.
          const question = String(node.config?.question || '').trim() || 'Подходит ли этот текст?';
          const sys = 'Ты — маршрутизатор потока. Ответь СТРОГО одним словом: ДА или НЕТ. ' +
            'Без пояснений, только одно слово.';
          const userMsg = `Вопрос: ${question}\n\nТекст для оценки:\n${inText || '(пусто)'}`;
          try {
            const { text, tokens } = await callClaude(apiKey, sys, userMsg, 8);
            totalTokens += tokens;
            const ans = text.trim().toLowerCase();
            result = ans.startsWith('да') || ans.startsWith('yes') || ans.startsWith('true');
            detail = ` (агент: «${question}» → ${text.trim().slice(0, 20)})`;
          } catch (err) {
            await log(id, 'warn', `Агент-условие не ответил, идём по «Да»: ${(err as Error).message}`, {});
            result = true;
          }
        } else {
          // Детерминированное правило: содержит / не содержит / равно.
          const op = String(node.config?.operator || 'contains');
          const val = String(node.config?.condValue || '').trim();
          const hay = inText.toLowerCase();
          const needle = val.toLowerCase();
          if (op === 'contains') result = needle ? hay.includes(needle) : true;
          else if (op === 'not_contains') result = needle ? !hay.includes(needle) : true;
          else if (op === 'equals') result = needle ? hay.trim() === needle : true;
          detail = val ? ` (${op}: «${val}»)` : '';
        }

        const taken: 'true' | 'false' = result ? 'true' : 'false';
        outputs.set(id, inText); // пропускаем данные дальше по выбранной ветке
        for (const e of allEdges.filter(e => e.source_client_id === id)) {
          if (edgeBranch(e) !== taken) blocked.add(edgeKey(e));
        }
        await log(id, 'info',
          `Условие: ${result ? '«Да»' : '«Нет»'}${detail}`,
          { status: 'completed', branch: taken });
        continue;
      }
      if (node.node_type === 'output') {
        // Собираем результаты входящих узлов (без заблокированных веток).
        const incoming = (edges || []).filter((e: Edge) => e.target_client_id === id && !blocked.has(edgeKey(e)))
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

        // Доставка на email через Resend (роль email + config.toEmail + ключ Resend).
        if (node.role === 'email') {
          const toEmail = typeof node.config?.toEmail === 'string' ? node.config.toEmail.trim() : '';
          const subject = (typeof node.config?.subject === 'string' && node.config.subject.trim())
            ? node.config.subject.trim() : 'Atlas — результат автоматизации';
          // from: Resend test-адрес (onboarding@resend.dev) или верифицированный домен.
          const fromAddr = typeof node.config?.fromEmail === 'string' && node.config.fromEmail.trim()
            ? node.config.fromEmail.trim() : 'Atlas <onboarding@resend.dev>';
          if (!resendKey) {
            failed = true;
            await log(id, 'error', 'Email not connected — add a Resend API key in “My keys”.', { status: 'failed' });
          } else if (!toEmail) {
            failed = true;
            await log(id, 'error', 'No recipient set on this Email node — open it and enter an address.', { status: 'failed' });
          } else {
            try {
              const rsRes = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: { Authorization: `Bearer ${resendKey}`, 'content-type': 'application/json' },
                body: JSON.stringify({ from: fromAddr, to: [toEmail], subject, text: collected.slice(0, 100000) }),
              });
              const rsData = await rsRes.json().catch(() => ({}));
              if (rsRes.ok && rsData?.id) {
                await log(id, 'info', `Sent email ✓ (to ${toEmail})`, { status: 'completed' });
              } else {
                failed = true;
                const msg = rsData?.message || rsData?.error?.message || `http_${rsRes.status}`;
                await log(id, 'error', `Email not delivered: ${msg}. Tip: with the test sender (onboarding@resend.dev) you can only email your own Resend account address; verify a domain to send anywhere.`, { status: 'failed' });
              }
            } catch (err) {
              failed = true;
              await log(id, 'error', `Email send failed: ${(err as Error).message}`, { status: 'failed' });
            }
          }
          continue;
        }

        // Создание события в Google Calendar (роль calendar + подключённый gcal).
        if (node.role === 'calendar') {
          if (!gcalRefresh) {
            failed = true;
            await log(id, 'error', 'Google Calendar not connected — connect it in “My keys”.', { status: 'failed' });
          } else {
            try {
              const accessToken = await gcalAccessToken(gcalRefresh);
              if (!accessToken) {
                failed = true;
                await log(id, 'error', 'Could not refresh Google access token — reconnect Google Calendar.', { status: 'failed' });
              } else {
                const calId = typeof node.config?.calendarId === 'string' && node.config.calendarId.trim()
                  ? node.config.calendarId.trim() : 'primary';
                const ev = parseEvent(collected);
                const gRes = await fetch(
                  `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events`,
                  {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' },
                    body: JSON.stringify({
                      summary: ev.title,
                      description: ev.description || collected.slice(0, 4000),
                      start: { dateTime: ev.start },
                      end: { dateTime: ev.end },
                    }),
                  },
                );
                const gData = await gRes.json().catch(() => ({}));
                if (gRes.ok && gData?.id) {
                  await log(id, 'info', `Event created ✓ (${ev.title}, ${ev.start.slice(0, 16).replace('T', ' ')})`, { status: 'completed' });
                } else {
                  failed = true;
                  const msg = gData?.error?.message || `http_${gRes.status}`;
                  await log(id, 'error', `Calendar event not created: ${msg}`, { status: 'failed' });
                }
              }
            } catch (err) {
              failed = true;
              await log(id, 'error', `Calendar failed: ${(err as Error).message}`, { status: 'failed' });
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
          : node.role === 'memory'
          ? 'Memory — connected agent recalls all prior steps'
          : node.role === 'file_read'
          ? (node.config?.fileName ? `File ready: ${node.config.fileName}` : 'Files — upload a file on this node')
          : node.role === 'vision'
          ? (node.config?.imageData ? 'Image ready for the connected agent' : 'Vision — upload an image on this node')
          : 'Capability attached to the connected agent';
        await log(id, 'info', note, { status: 'completed' });
        continue;
      }
      // agent → Claude (без заблокированных веток)
      const incoming = (edges || []).filter((e: Edge) => e.target_client_id === id && !blocked.has(edgeKey(e)))
        .map((e: Edge) => outputs.get(e.source_client_id)).filter(Boolean);
      let context = incoming.length ? incoming.join('\n\n') : input;

      // Прикреплённые инструменты. Связь инструмент↔агент пользователь мог
      // нарисовать в любую сторону — учитываем оба направления (другой конец
      // ребра является инструментом).
      const attachedTools = (edges || [])
        .filter((e: Edge) => e.source_client_id === id || e.target_client_id === id)
        .map((e: Edge) => {
          const otherId = e.source_client_id === id ? e.target_client_id : e.source_client_id;
          return byId.get(otherId);
        })
        .filter((n): n is Node => !!n && n.node_type === 'tool');
      const attachedToolRoles = attachedTools.map((n) => n.role || '');

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
      // Файлы (Фаза 4): прикреплённый tool-file с загруженным текстом → в контекст.
      for (const tn of attachedTools.filter(n => n.role === 'file_read')) {
        const ft = typeof tn.config?.fileText === 'string' ? tn.config.fileText : '';
        const fn = typeof tn.config?.fileName === 'string' ? tn.config.fileName : 'file';
        if (ft.trim()) {
          context += `\n\n[Файл «${fn}», приложен к агенту]:\n${ft}`;
          await log(id, 'info', `File attached: ${fn} (${ft.length} chars)`, { status: 'running' });
        }
      }

      // Vision (Фаза 4): прикреплённый tool-vision с картинкой → image-блок Claude.
      const visionImages: ImageInput[] = [];
      for (const tn of attachedTools.filter(n => n.role === 'vision')) {
        const data = typeof tn.config?.imageData === 'string' ? tn.config.imageData : '';
        const mime = typeof tn.config?.imageMime === 'string' ? tn.config.imageMime : 'image/png';
        if (data) {
          visionImages.push({ data, mime });
          await log(id, 'info', `Image attached (${tn.config?.imageName || 'image'})`, { status: 'running' });
        }
      }

      // Память (Фаза 4): агент с прикреплённым tool-memory получает ВЕСЬ контекст
      // прогона (все прошлые шаги), а не только прямых предшественников.
      if (attachedToolRoles.includes('memory') && transcript.length) {
        context += `\n\n[Память прогона — что уже было сделано на предыдущих шагах]:\n${transcript.join('\n\n')}`;
        await log(id, 'info', `Memory: recalled ${transcript.length} prior step(s)`, { status: 'running' });
      }

      // Если у узла задана своя инструкция (config.prompt) — используем её,
      // иначе встроенный роль-дефолт.
      const customPromptRaw = typeof node.config?.prompt === 'string' ? node.config.prompt.trim() : '';
      const customPrompt = applyVars(customPromptRaw); // подстановка {{переменных}}
      context = applyVars(context);
      const system = (customPrompt || systemPromptForRole(node.role || 'main')) + langSuffix;
      // MCP: если к агенту прикреплён узел «MCP-коннектор» — отдаём Claude серверы,
      // ВЫБРАННЫЕ в этом узле (config.mcpServerIds); если ничего не выбрано — все.
      const mcpNode = attachedTools.find((n) => n.role === 'mcp');
      let pickedMcp: (McpServer & { _id: string })[] = [];
      if (mcpNode && mcpServers.length) {
        const ids = Array.isArray(mcpNode.config?.mcpServerIds) ? mcpNode.config.mcpServerIds as string[] : [];
        pickedMcp = ids.length ? mcpServers.filter((s) => ids.includes(s._id)) : mcpServers;
      }
      // Убираем внутренний _id перед отправкой в Anthropic API.
      const sendMcp: McpServer[] = pickedMcp.map(({ _id, ...s }) => { void _id; return s; });
      if (sendMcp.length) await log(id, 'info', `MCP: ${sendMcp.length} server(s) provided`, { status: 'running' });
      await log(id, 'info', `${roleLabel(node.role || 'main')} is thinking…`, { status: 'running' });
      const { text, tokens } = await callClaude(apiKey, system, context || 'Proceed.', maxTokens, visionImages, sendMcp);
      totalTokens += tokens;
      outputs.set(id, text);
      transcript.push(`${roleLabel(node.role || 'main')}: ${text.slice(0, 1200)}`);
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
    .eq('user_id', userId).eq('provider', 'anthropic');

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

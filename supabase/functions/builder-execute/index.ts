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
const MAX_TOKENS = 1024;
const MAX_NODES = 25; // защита от runaway: не больше 25 узлов за запуск

type Node = { client_id: string; node_type: string; role: string | null; def_id: string };
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

async function callClaude(apiKey: string, system: string, userContent: string) {
  const res = await fetch(CLAUDE_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
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

  let body: { executionId?: string; workflowId?: string; input?: string };
  try { body = await req.json(); } catch { return json({ error: 'bad_json' }, 400); }

  const executionId = body.executionId;
  const workflowId = body.workflowId;
  const input = (body.input || '').trim();
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

  // Узлы и рёбра.
  const [{ data: nodes }, { data: edges }] = await Promise.all([
    admin.from('builder_workflow_nodes').select('client_id, node_type, role, def_id').eq('workflow_id', workflowId),
    admin.from('builder_workflow_edges').select('source_client_id, target_client_id').eq('workflow_id', workflowId),
  ]);
  if (!nodes || nodes.length === 0) return json({ error: 'empty_workflow' }, 400);
  if (nodes.length > MAX_NODES) return json({ error: 'too_many_nodes' }, 400);

  // Создаём execution-строку (status running) с клиентским id.
  await admin.from('builder_executions').insert({
    id: executionId, workflow_id: workflowId, user_id: user.id,
    status: 'running', input_data: { input },
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
        lastText = incoming.join('\n\n---\n\n') || lastText;
        outputs.set(id, lastText);
        await log(id, 'info', 'Result collected', { status: 'completed' });
        continue;
      }
      if (node.node_type === 'tool') {
        // Реальные интеграции инструментов — Phase B-3. Пока пропускаем.
        await log(id, 'warn', 'Tool nodes are not executed yet (coming in a later phase)', { status: 'completed' });
        continue;
      }
      // agent → Claude
      const incoming = (edges || []).filter((e: Edge) => e.target_client_id === id)
        .map((e: Edge) => outputs.get(e.source_client_id)).filter(Boolean);
      const context = incoming.length ? incoming.join('\n\n') : input;
      const system = systemPromptForRole(node.role || 'main');
      await log(id, 'info', `${roleLabel(node.role || 'main')} is thinking…`, { status: 'running' });
      const { text, tokens } = await callClaude(apiKey, system, context || 'Proceed.');
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

// builder-webhook — запуск схемы по внешнему событию (Builder Phase B-3, триггер).
//
// Публичная функция (деплой с --no-verify-jwt). Принимает POST на
//   <project>/functions/v1/builder-webhook/<token>
// Находит вебхук по токену → запускает builder-execute в СЕРВИСНОМ режиме.
// Данные запроса становятся задачей: { input?, variables? } или сырой текст тела;
// если тело пустое — движок берёт задачу из узла «Старт» (строго как на холсте).
//
// Защита:
//   • токен длинный/случайный (генерируется клиентом, хранится в builder_webhooks);
//   • enabled=false → 403;
//   • min-интервал между срабатываниями (анти-флуд);
//   • «защита кошелька» (анти-наложение + суточные лимиты) — в builder-execute.
//
// Деплой: supabase functions deploy builder-webhook --no-verify-jwt

import { adminClient, json, cors } from '../_shared/auth.ts';

const FN_BASE = Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.functions.supabase.co') || '';
const EXECUTE_URL = `${FN_BASE}/builder-execute`;
const SERVICE_SECRET = Deno.env.get('BUILDER_SERVICE_SECRET') || '';
const ANON = Deno.env.get('SUPABASE_ANON_KEY') || '';
const MIN_INTERVAL_MS = 5000; // не чаще раза в 5 секунд на один вебхук

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  // Токен — последний сегмент пути: /builder-webhook/<token>
  const url = new URL(req.url);
  const token = url.pathname.split('/').filter(Boolean).pop() || '';
  if (!token || token === 'builder-webhook') return json({ error: 'missing_token' }, 400);

  const admin = adminClient();
  const { data: hook } = await admin
    .from('builder_webhooks')
    .select('id, workflow_id, user_id, enabled, tier, locale, last_triggered_at')
    .eq('token', token)
    .maybeSingle();

  if (!hook) return json({ error: 'not_found' }, 404);
  if (!hook.enabled) return json({ error: 'disabled' }, 403);

  // Анти-флуд: не чаще, чем раз в MIN_INTERVAL_MS. Время — ТОЛЬКО серверное
  // (Date.now()); никаких параметров запроса, иначе атакующий обойдёт лимит.
  if (hook.last_triggered_at) {
    const last = new Date(hook.last_triggered_at).getTime();
    const nowMs = Date.now();
    if (Number.isFinite(last) && nowMs - last < MIN_INTERVAL_MS) {
      return json({ error: 'too_frequent', retry_after_ms: MIN_INTERVAL_MS - (nowMs - last) }, 429);
    }
  }

  // Разбираем тело: JSON { input, variables } либо сырой текст.
  let input = '';
  let variables: Record<string, string> | undefined;
  try {
    const ct = req.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const body = await req.json().catch(() => ({}));
      if (typeof body?.input === 'string') input = body.input;
      else if (typeof body === 'string') input = body;
      if (body && typeof body.variables === 'object' && body.variables) {
        variables = {};
        for (const [k, v] of Object.entries(body.variables)) variables[k] = String(v ?? '');
      }
    } else {
      input = (await req.text().catch(() => '')).trim();
    }
  } catch { /* пустое тело → задача из «Старта» */ }

  const nowIso = new Date().toISOString();
  await admin.from('builder_webhooks').update({ last_triggered_at: nowIso }).eq('id', hook.id);

  // Запускаем builder-execute в сервисном режиме (без ожидания полного результата).
  const execRes = await fetch(EXECUTE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-builder-service': SERVICE_SECRET, apikey: ANON },
    body: JSON.stringify({
      executionId: crypto.randomUUID(),
      workflowId: hook.workflow_id,
      userId: hook.user_id,
      input,                                   // пусто → движок возьмёт из «Старта»
      ...(variables ? { variables } : {}),
      tier: hook.tier || 's',
      locale: hook.locale || 'ru',
    }),
  }).catch(() => null);

  // Возвращаем результат запуска (или хотя бы «принято»).
  if (execRes && execRes.ok) {
    const out = await execRes.json().catch(() => ({}));
    return json({ ok: true, ...out });
  }
  // Запуск мог отклониться защитой кошелька (already_running / daily_limit) — отдаём как есть.
  if (execRes) {
    const out = await execRes.json().catch(() => ({}));
    return json({ ok: false, ...out }, execRes.status);
  }
  return json({ ok: true, queued: true });
});

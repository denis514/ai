// builder-scheduler — серверный планировщик автоматизации (Builder Phase B-3).
//
// Вызывается ПО CRON (pg_cron / Supabase scheduled function / внешний cron),
// а НЕ из браузера. Находит «созревшие» расписания (next_run_at <= now, enabled)
// и для каждого запускает workflow через builder-execute в СЕРВИСНОМ режиме
// (секрет BUILDER_SERVICE_SECRET + userId). Так схема исполняется на сервере,
// даже когда компьютер пользователя выключен.
//
// После запуска сдвигает next_run_at на следующий слот (hourly/daily/weekly).
//
// Деплой:
//   supabase functions deploy builder-scheduler --no-verify-jwt
//   supabase secrets set BUILDER_SERVICE_SECRET=<32+ случайных символов>
// Cron (пример pg_cron, каждую минуту дёргает функцию):
//   select cron.schedule('builder-tick','* * * * *', $$
//     select net.http_post(
//       url:='https://<project>.functions.supabase.co/builder-scheduler',
//       headers:='{"x-builder-cron":"<BUILDER_SERVICE_SECRET>"}'::jsonb) $$);

import { adminClient, json } from '../_shared/auth.ts';

const FN_BASE = Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.functions.supabase.co') || '';
const EXECUTE_URL = `${FN_BASE}/builder-execute`;
const SERVICE_SECRET = Deno.env.get('BUILDER_SERVICE_SECRET') || '';
const ANON = Deno.env.get('SUPABASE_ANON_KEY') || '';
const BATCH = 20; // максимум расписаний за один тик (защита от перегрузки)

// Следующий запуск по частоте. Всё в UTC. Возвращает ISO-строку.
function computeNext(now: Date, freq: string, hour: number, minute: number, weekday: number | null): string {
  const next = new Date(now);
  next.setUTCSeconds(0, 0);
  if (freq === 'minutes') {
    // «Каждые N минут»: minute хранит интервал N (1..59).
    const n = Math.min(Math.max(minute || 1, 1), 59);
    next.setUTCMinutes(next.getUTCMinutes() + n);
    return next.toISOString();
  }
  if (freq === 'hourly') {
    next.setUTCMinutes(minute);
    if (next <= now) next.setUTCHours(next.getUTCHours() + 1);
    return next.toISOString();
  }
  if (freq === 'weekly') {
    next.setUTCHours(hour, minute, 0, 0);
    const target = ((weekday ?? 1) % 7 + 7) % 7;
    let add = (target - next.getUTCDay() + 7) % 7;
    if (add === 0 && next <= now) add = 7;
    next.setUTCDate(next.getUTCDate() + add);
    return next.toISOString();
  }
  // daily (по умолчанию)
  next.setUTCHours(hour, minute, 0, 0);
  if (next <= now) next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString();
}

// uuid v4 без зависимостей.
function uuid(): string {
  return crypto.randomUUID();
}

Deno.serve(async (req) => {
  // Защита: дёргать может только cron, знающий секрет.
  const secret = req.headers.get('x-builder-cron') || '';
  if (!SERVICE_SECRET || secret !== SERVICE_SECRET) {
    return json({ error: 'forbidden' }, 403);
  }

  const admin = adminClient();
  const nowIso = new Date().toISOString();

  const { data: due, error } = await admin
    .from('builder_schedules')
    .select('id, workflow_id, user_id, frequency, hour, minute, weekday, input, tier, locale')
    .eq('enabled', true)
    .lte('next_run_at', nowIso)
    .order('next_run_at', { ascending: true })
    .limit(BATCH);

  if (error) return json({ error: 'query_failed', detail: error.message }, 500);
  if (!due || due.length === 0) return json({ ok: true, ran: 0 });

  let ran = 0;
  for (const s of due) {
    // Сдвигаем next_run_at СРАЗУ (до запуска), чтобы тик не продублировал запуск.
    const next = computeNext(new Date(), s.frequency, s.hour, s.minute, s.weekday);
    await admin.from('builder_schedules')
      .update({ last_run_at: nowIso, next_run_at: next })
      .eq('id', s.id);

    try {
      await fetch(EXECUTE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-builder-service': SERVICE_SECRET,
          apikey: ANON,
        },
        body: JSON.stringify({
          executionId: uuid(),
          workflowId: s.workflow_id,
          userId: s.user_id,
          input: s.input || '',
          tier: s.tier || 's',
          locale: s.locale || 'ru',
        }),
      });
      ran++;
    } catch (_e) {
      // Ошибку отдельного запуска не валим весь тик — следующий тик попробует снова.
    }
  }

  return json({ ok: true, ran });
});

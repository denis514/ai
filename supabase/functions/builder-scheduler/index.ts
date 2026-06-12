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

import { adminClient, json, safeEqual } from '../_shared/auth.ts';

const FN_BASE = Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.functions.supabase.co') || '';
const EXECUTE_URL = `${FN_BASE}/builder-execute`;
const SERVICE_SECRET = Deno.env.get('BUILDER_SERVICE_SECRET') || '';
const ANON = Deno.env.get('SUPABASE_ANON_KEY') || '';
const BATCH = 20; // максимум расписаний за один тик (защита от перегрузки)

// Следующий запуск по частоте. Всё в UTC. Возвращает ISO-строку.
// Последний день месяца (UTC) — для безопасного дня (31 в феврале → 28/29).
function lastDayOfMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}
function atDate(year: number, monthIndex: number, dom: number, hour: number, minute: number): Date {
  const day = Math.min(Math.max(dom || 1, 1), lastDayOfMonth(year, monthIndex));
  return new Date(Date.UTC(year, monthIndex, day, hour, minute, 0, 0));
}

function computeNext(
  now: Date, freq: string, hour: number, minute: number,
  weekday: number | null, dayOfMonth?: number | null, month?: number | null,
): string {
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
  if (freq === 'monthly') {
    // День месяца в hour:minute, каждый месяц. День > длины месяца → последний день.
    const dom = dayOfMonth ?? 1;
    let cand = atDate(now.getUTCFullYear(), now.getUTCMonth(), dom, hour, minute);
    if (cand <= now) {
      const y = now.getUTCMonth() === 11 ? now.getUTCFullYear() + 1 : now.getUTCFullYear();
      const m = (now.getUTCMonth() + 1) % 12;
      cand = atDate(y, m, dom, hour, minute);
    }
    return cand.toISOString();
  }
  if (freq === 'yearly') {
    // Месяц + день в hour:minute, каждый год.
    const mIdx = Math.min(Math.max((month ?? 1) - 1, 0), 11);
    const dom = dayOfMonth ?? 1;
    let cand = atDate(now.getUTCFullYear(), mIdx, dom, hour, minute);
    if (cand <= now) cand = atDate(now.getUTCFullYear() + 1, mIdx, dom, hour, minute);
    return cand.toISOString();
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
  if (!SERVICE_SECRET || !safeEqual(secret, SERVICE_SECRET)) {
    return json({ error: 'forbidden' }, 403);
  }

  const admin = adminClient();
  const nowIso = new Date().toISOString();

  const { data: due, error } = await admin
    .from('builder_schedules')
    .select('id, workflow_id, user_id, frequency, hour, minute, weekday, day_of_month, month, input, tier, locale')
    .eq('enabled', true)
    .lte('next_run_at', nowIso)
    .order('next_run_at', { ascending: true })
    .limit(BATCH);

  if (error) return json({ error: 'query_failed', detail: error.message }, 500);
  if (!due || due.length === 0) return json({ ok: true, ran: 0 });

  // Предохранитель: схема могла быть удалена (мягко → is_archived=true) или
  // отсутствовать. Расписания таких схем не запускаем и сразу гасим, чтобы они
  // не тикали в фоне и не тратили токены. Один запрос на все workflow из выборки.
  const wfIds = [...new Set(due.map((s) => s.workflow_id).filter(Boolean))];
  const liveWf = new Set<string>();
  if (wfIds.length) {
    const { data: wfs } = await admin
      .from('builder_workflows')
      .select('id, is_archived')
      .in('id', wfIds);
    for (const w of wfs || []) {
      if (!w.is_archived) liveWf.add(w.id as string);
    }
  }

  let ran = 0;
  let disabled = 0;
  for (const s of due) {
    // Схема удалена/в архиве → выключаем это расписание и пропускаем запуск.
    if (!liveWf.has(s.workflow_id)) {
      await admin.from('builder_schedules').update({ enabled: false }).eq('id', s.id);
      disabled++;
      continue;
    }
    // «Один раз»: после срабатывания НЕ двигаем next_run_at, а выключаем —
    // иначе бы повторилось. Для повторяющихся — сдвигаем слот СРАЗУ (до запуска),
    // чтобы тик не продублировал запуск.
    if (s.frequency === 'once') {
      await admin.from('builder_schedules')
        .update({ last_run_at: nowIso, enabled: false })
        .eq('id', s.id);
    } else {
      const next = computeNext(new Date(), s.frequency, s.hour, s.minute, s.weekday, s.day_of_month, s.month);
      await admin.from('builder_schedules')
        .update({ last_run_at: nowIso, next_run_at: next })
        .eq('id', s.id);
    }

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
          // Задачу НЕ передаём: движок берёт её из узла «Старт» текущей схемы
          // («строго как на холсте», без замороженной копии в расписании).
          input: '',
          tier: s.tier || 's',
          locale: s.locale || 'ru',
        }),
      });
      ran++;
    } catch (_e) {
      // Ошибку отдельного запуска не валим весь тик — следующий тик попробует снова.
    }
  }

  return json({ ok: true, ran, disabled });
});

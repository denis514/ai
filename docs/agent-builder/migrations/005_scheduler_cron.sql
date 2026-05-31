-- ============================================================================
-- Builder Phase B-3 — Cron-будильник для серверного планировщика
-- ============================================================================
-- Раз в минуту дёргает edge-функцию builder-scheduler, которая находит
-- «созревшие» расписания (builder_schedules) и запускает их БЕЗ браузера.
--
-- ПЕРЕД ЗАПУСКОМ замени два плейсхолдера:
--   <PROJECT_REF>  — ref проекта (Settings → General; начало адреса дашборда)
--   <SERVICE_SECRET> — значение BUILDER_SERVICE_SECRET (то же, что задал в CLI)
--
-- ГДЕ ЗАПУСКАТЬ: Supabase → SQL Editor → New query → вставить → Run.
-- (или psql -f этим файлом). Идемпотентно: повторный запуск пересоздаёт задание.
--
-- ВАЖНО: builder-scheduler должна быть развёрнута с флагом --no-verify-jwt,
-- иначе cron-вызов без JWT не дойдёт (защита — секретный заголовок).
-- ============================================================================

-- 1. Расширения: «будильник» (pg_cron) + «интернет-запросы из БД» (pg_net).
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 2. Снять старое задание с тем же именем (чтобы можно было перезапускать файл).
select cron.unschedule('builder-tick')
where exists (select 1 from cron.job where jobname = 'builder-tick');

-- 3. Создать задание: каждую минуту POST на builder-scheduler с секретом.
select cron.schedule(
  'builder-tick',
  '* * * * *',
  $$
  select net.http_post(
    url     := 'https://<PROJECT_REF>.supabase.co/functions/v1/builder-scheduler',
    headers := jsonb_build_object('x-builder-cron', '<SERVICE_SECRET>')
  );
  $$
);

-- ───────────────────────────────────────────────────────────────────────────
-- Проверка после Run:
--   select jobname, schedule, active from cron.job;
--   select status, return_message, start_time
--     from cron.job_run_details order by start_time desc limit 5;
-- Снять будильник (если нужно): select cron.unschedule('builder-tick');
-- ───────────────────────────────────────────────────────────────────────────

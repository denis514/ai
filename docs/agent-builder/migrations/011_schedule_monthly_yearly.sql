-- 011_schedule_monthly_yearly.sql — расписания «ежемесячно» и «ежегодно».
--
-- Добавляет два необязательных поля к builder_schedules:
--   • day_of_month (1-31) — для 'monthly' и 'yearly'
--   • month        (1-12) — для 'yearly'
-- frequency теперь принимает также 'monthly' и 'yearly' (хранится как text,
-- ограничения нет — валидируем в коде). hour/minute уже есть.
--
-- Применить: Supabase → SQL Editor → Run. Идемпотентно. После — редеплой
-- builder-scheduler (он считает next_run_at для новых частот).

ALTER TABLE public.builder_schedules
  ADD COLUMN IF NOT EXISTS day_of_month int,   -- 1..31 (для monthly/yearly)
  ADD COLUMN IF NOT EXISTS month        int;   -- 1..12 (для yearly)

-- VERIFICATION:
--   SELECT column_name FROM information_schema.columns
--     WHERE table_name='builder_schedules' AND column_name IN ('day_of_month','month');

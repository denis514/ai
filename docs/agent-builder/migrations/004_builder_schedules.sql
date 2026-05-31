-- ============================================================================
-- Builder Phase B-3 — Schedules (server-side automation, trigger «по расписанию»)
-- ============================================================================
-- Хранит расписания запусков workflow. Серверный планировщик (edge-функция
-- builder-scheduler, вызывается по cron) находит «созревшие» строки и запускает
-- их БЕЗ участия браузера — даже когда компьютер пользователя выключен.
--
-- ДЕПЛОЙ: Supabase Dashboard → SQL Editor → Run. Идемпотентно.
-- Зависит от: 001 (builder_workflows), auth.users.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.builder_schedules (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id  uuid NOT NULL REFERENCES public.builder_workflows(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Тип расписания: 'hourly' | 'daily' | 'weekly' (MVP). Параметры в полях ниже.
  frequency    text NOT NULL DEFAULT 'daily',
  hour         int  NOT NULL DEFAULT 9,    -- час дня (0-23), UTC
  minute       int  NOT NULL DEFAULT 0,    -- минута (0-59)
  weekday      int,                        -- 0=вс..6=сб, для weekly
  input        text NOT NULL DEFAULT '',   -- задача, подаётся в схему при запуске
  tier         text NOT NULL DEFAULT 's',  -- размер ответа s|m|l
  locale       text NOT NULL DEFAULT 'ru',
  enabled      boolean NOT NULL DEFAULT true,
  last_run_at  timestamptz,
  next_run_at  timestamptz NOT NULL DEFAULT now(),  -- когда «созреет» в следующий раз
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Планировщик ищет по next_run_at среди enabled — индекс ускоряет.
CREATE INDEX IF NOT EXISTS idx_builder_schedules_due
  ON public.builder_schedules(next_run_at) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS idx_builder_schedules_user
  ON public.builder_schedules(user_id);

ALTER TABLE public.builder_schedules ENABLE ROW LEVEL SECURITY;

-- Владелец видит/меняет только свои расписания.
DROP POLICY IF EXISTS "builder_schedules: owner" ON public.builder_schedules;
CREATE POLICY "builder_schedules: owner"
  ON public.builder_schedules
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Планировщик (service role) обходит RLS — это норм, он серверный.

-- ───────────────────────────────────────────────────────────────────────────
-- Проверка после Run:
--   SELECT id, frequency, hour, minute, enabled, next_run_at FROM public.builder_schedules;
-- ───────────────────────────────────────────────────────────────────────────

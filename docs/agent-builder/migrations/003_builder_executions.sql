-- ============================================================================
-- Builder Phase B-2.2 — Executions + logs (real workflow runs)
-- ============================================================================
-- Хранит запуски workflow и пошаговые логи. Frontend подписывается на логи
-- через Supabase Realtime → статус узлов обновляется вживую.
--
-- ДЕПЛОЙ: Supabase Dashboard → SQL Editor → Run. Идемпотентно.
-- Зависит от: 001 (builder_workflows), auth.users.
-- ============================================================================

-- ───────────────────────────────────────────────────────────────────────────
-- 1. Executions — один запуск workflow
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.builder_executions (
  id            uuid PRIMARY KEY,                    -- генерится на клиенте (для подписки до старта)
  workflow_id   uuid REFERENCES public.builder_workflows(id) ON DELETE SET NULL,
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status        text NOT NULL DEFAULT 'pending',     -- pending | running | completed | failed
  input_data    jsonb,
  output_data   jsonb,
  error_message text,
  tokens_used   int NOT NULL DEFAULT 0,
  started_at    timestamptz NOT NULL DEFAULT now(),
  completed_at  timestamptz
);
CREATE INDEX IF NOT EXISTS idx_builder_exec_user ON public.builder_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_builder_exec_wf   ON public.builder_executions(workflow_id);

ALTER TABLE public.builder_executions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "builder_exec: own all" ON public.builder_executions;
CREATE POLICY "builder_exec: own all"
  ON public.builder_executions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ───────────────────────────────────────────────────────────────────────────
-- 2. Execution logs — пошаговые события (для live-статуса)
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.builder_execution_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id    uuid NOT NULL REFERENCES public.builder_executions(id) ON DELETE CASCADE,
  node_client_id  text,                              -- React Flow node id (для подсветки узла)
  level           text NOT NULL DEFAULT 'info',      -- info | warn | error
  message         text,
  data            jsonb,                             -- { status: 'running'|'completed'|'failed', tokens?, ... }
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_builder_logs_exec ON public.builder_execution_logs(execution_id);

ALTER TABLE public.builder_execution_logs ENABLE ROW LEVEL SECURITY;

-- Доступ к логам — через владение родительским execution.
DROP POLICY IF EXISTS "builder_logs: via execution" ON public.builder_execution_logs;
CREATE POLICY "builder_logs: via execution"
  ON public.builder_execution_logs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.builder_executions e
      WHERE e.id = execution_id AND e.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.builder_executions e
      WHERE e.id = execution_id AND e.user_id = auth.uid()
    )
  );

-- ───────────────────────────────────────────────────────────────────────────
-- 3. Realtime — публикуем обе таблицы, чтобы frontend ловил изменения вживую
-- ───────────────────────────────────────────────────────────────────────────
-- Идемпотентно: добавляем в публикацию supabase_realtime, если ещё не там.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'builder_executions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.builder_executions;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'builder_execution_logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.builder_execution_logs;
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- SELECT tablename FROM pg_publication_tables WHERE pubname='supabase_realtime'
--   AND tablename LIKE 'builder_exec%';   -- ожидаем 2 строки
-- ============================================================================

-- 007_builder_webhooks.sql — вебхук-триггеры: запуск схемы по внешнему событию.
--
-- Каждая схема может иметь один вебхук с секретным токеном. POST на
--   <project>/functions/v1/builder-webhook/<token>
-- запускает схему (в сервисном режиме), данные запроса → задача (input/variables).
--
-- Защита: токен длинный и случайный; включается вручную (enabled);
-- min-интервал между срабатываниями проверяется в функции; общая «защита
-- кошелька» (анти-наложение + суточные лимиты) действует в builder-execute.
--
-- Применить: Supabase → SQL Editor. RLS owner-only.

CREATE TABLE IF NOT EXISTS public.builder_webhooks (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id      uuid NOT NULL REFERENCES public.builder_workflows(id) ON DELETE CASCADE,
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token            text NOT NULL UNIQUE,           -- секрет в URL
  enabled          boolean NOT NULL DEFAULT true,
  tier             text NOT NULL DEFAULT 's',
  locale           text NOT NULL DEFAULT 'ru',
  last_triggered_at timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workflow_id)                              -- один вебхук на схему
);

CREATE INDEX IF NOT EXISTS idx_builder_webhooks_token ON public.builder_webhooks(token);
CREATE INDEX IF NOT EXISTS idx_builder_webhooks_user  ON public.builder_webhooks(user_id);

ALTER TABLE public.builder_webhooks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "builder_webhooks: own all" ON public.builder_webhooks;
CREATE POLICY "builder_webhooks: own all"
  ON public.builder_webhooks
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- Builder Phase B-2.2 — API key storage (encrypted)
-- ============================================================================
-- Хранит API-ключи провайдеров (Anthropic) пользователей в зашифрованном виде.
-- Ключ шифруется в edge function (AES-GCM, секрет в env BUILDER_KEY_ENCRYPTION_SECRET)
-- ПЕРЕД записью — в базе только ciphertext. Расшифровка только на сервере.
--
-- ДЕПЛОЙ: Supabase Dashboard → SQL Editor → Run. Идемпотентно.
-- Зависит от: 001_builder_core.sql (auth.users).
--
-- Безопасность:
--   • RLS owner-only — пользователь видит только свои строки.
--   • encrypted_key — это ciphertext; ключ дешифровки (env secret) НИКОГДА не
--     попадает в браузер. Даже владелец, прочитав свою строку, не расшифрует её
--     на клиенте.
--   • key_hint — последние 4 символа (для отображения «••••1234»), не секрет.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.builder_api_connections (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider      text NOT NULL DEFAULT 'anthropic',  -- 'anthropic' (позже: 'openai' и др.)
  encrypted_key text NOT NULL,                       -- AES-GCM ciphertext (base64)
  key_hint      text,                                -- последние 4 символа для UI
  is_active     boolean NOT NULL DEFAULT true,
  last_used_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Один активный ключ на (пользователь, провайдер).
CREATE UNIQUE INDEX IF NOT EXISTS idx_builder_api_unique
  ON public.builder_api_connections(user_id, provider);

ALTER TABLE public.builder_api_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "builder_api: own all" ON public.builder_api_connections;
CREATE POLICY "builder_api: own all"
  ON public.builder_api_connections
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- SELECT table_name FROM information_schema.tables
--   WHERE table_schema='public' AND table_name='builder_api_connections';
-- SELECT relrowsecurity FROM pg_class WHERE relname='builder_api_connections'; -- true
-- SELECT policyname FROM pg_policies WHERE tablename='builder_api_connections';
-- ============================================================================

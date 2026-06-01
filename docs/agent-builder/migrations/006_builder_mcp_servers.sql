-- ============================================================================
-- Builder — MCP servers (пользовательские подключения к удалённым MCP-серверам)
-- ============================================================================
-- Хранит сохранённые пользователем MCP-серверы (URL + опциональный токен).
-- При запуске схемы builder-execute прокидывает их в запрос к Claude
-- (mcp_servers, beta-коннектор) — Claude сам вызывает их инструменты. ADR/MCP.
--
-- ДЕПЛОЙ: Supabase Dashboard → SQL Editor → Run. Идемпотентно.
-- Токен шифруется на сервере (как builder_api_connections.encrypted_key).
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.builder_mcp_servers (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name           text NOT NULL,
  url            text NOT NULL,
  encrypted_token text,                 -- null = сервер без авторизации
  token_hint     text,                  -- последние символы для UI
  enabled        boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_builder_mcp_user
  ON public.builder_mcp_servers(user_id) WHERE enabled = true;

ALTER TABLE public.builder_mcp_servers ENABLE ROW LEVEL SECURITY;

-- Владелец видит/меняет только свои серверы. Метаданные (name/url/hint) клиент
-- читает напрямую; encrypted_token расшифровывается только на сервере (service role).
DROP POLICY IF EXISTS "builder_mcp: owner" ON public.builder_mcp_servers;
CREATE POLICY "builder_mcp: owner"
  ON public.builder_mcp_servers
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ───────────────────────────────────────────────────────────────────────────
-- Проверка: SELECT id, name, url, enabled FROM public.builder_mcp_servers;
-- ───────────────────────────────────────────────────────────────────────────

-- 008_builder_multi_keys.sql — мультиключи: несколько именованных ключей на провайдер.
--
-- Было: один ключ на (user_id, provider) — жёсткий уникальный индекс.
-- Стало: много ключей на провайдер, у каждого имя (label) и флаг «по умолчанию».
--   • label    — человекочитаемое имя («Бот маркетинга», «sales@») для выбора в узле.
--   • is_default — какой ключ берёт исполнение, пока узел не выбрал конкретный
--                  (Этап 1: исполнение всегда берёт default).
--
-- Полностью аддитивно и идемпотентно. Существующие строки получают label=''
-- и is_default=true — поведение для текущих пользователей не меняется.
--
-- Применить: Supabase → SQL Editor → Run. Зависит от 002_builder_api_keys.sql.

ALTER TABLE public.builder_api_connections
  ADD COLUMN IF NOT EXISTS label      text    NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_default boolean NOT NULL DEFAULT true;

-- Снимаем старое ограничение «один на провайдера».
DROP INDEX IF EXISTS public.idx_builder_api_unique;

-- Уникальность теперь по (пользователь, провайдер, имя) — имена в рамках
-- провайдера не должны повторяться.
CREATE UNIQUE INDEX IF NOT EXISTS idx_builder_api_unique_label
  ON public.builder_api_connections(user_id, provider, label);

-- Быстрый поиск default-ключа провайдера при исполнении.
CREATE INDEX IF NOT EXISTS idx_builder_api_default
  ON public.builder_api_connections(user_id, provider, is_default);

-- ============================================================================
-- VERIFICATION
--   SELECT column_name FROM information_schema.columns
--     WHERE table_name='builder_api_connections' AND column_name IN ('label','is_default');
--   SELECT indexname FROM pg_indexes WHERE tablename='builder_api_connections';
-- ============================================================================

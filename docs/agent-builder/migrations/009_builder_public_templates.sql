-- 009_builder_public_templates.sql — публичная галерея «От сообщества» (Фаза 2).
--
-- Отдельная таблица-СНИМОК. При «Опубликовать» сохраняется ОБЕЗЛИЧЕННАЯ копия схемы
-- (без chatId/почты/календаря/MCP/ключей — обезличивание делает клиент через
-- toShareGraph, как в «Поделиться кодом»). Видна всем ТОЛЬКО после одобрения
-- (approved=true). Приватные таблицы builder_workflows/nodes/edges НЕ трогаем —
-- доступ к рабочим схемам пользователя не открывается.
--
-- Применить: Supabase → SQL Editor → Run. Зависит от 001_builder_core.sql.
-- Идемпотентно (IF NOT EXISTS / DROP POLICY IF EXISTS).

CREATE TABLE IF NOT EXISTS public.builder_public_templates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name text,                       -- отображаемое имя автора (необязательно)
  title       text NOT NULL,
  industry    text,                        -- категория-индустрия (store/services/…)
  difficulty  text,
  graph       jsonb NOT NULL,              -- обезличенный { nodes:[…], edges:[…] }
  approved    boolean NOT NULL DEFAULT false,
  use_count   integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bpt_approved ON public.builder_public_templates(approved, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bpt_author   ON public.builder_public_templates(author_id);

ALTER TABLE public.builder_public_templates ENABLE ROW LEVEL SECURITY;

-- Чтение: одобренные шаблоны — всем; свои (в т.ч. на модерации) — автору.
DROP POLICY IF EXISTS "bpt: read approved or own" ON public.builder_public_templates;
CREATE POLICY "bpt: read approved or own"
  ON public.builder_public_templates
  FOR SELECT
  USING (approved = true OR auth.uid() = author_id);

-- Вставка: только от своего имени и ВСЕГДА не одобрено (самоодобрение невозможно).
DROP POLICY IF EXISTS "bpt: insert own unapproved" ON public.builder_public_templates;
CREATE POLICY "bpt: insert own unapproved"
  ON public.builder_public_templates
  FOR INSERT
  WITH CHECK (auth.uid() = author_id AND approved = false);

-- Удаление: только свои строки.
DROP POLICY IF EXISTS "bpt: delete own" ON public.builder_public_templates;
CREATE POLICY "bpt: delete own"
  ON public.builder_public_templates
  FOR DELETE
  USING (auth.uid() = author_id);

-- UPDATE-политики НЕТ намеренно: обычный пользователь не может менять approved.
-- Модерация — вручную владельцем проекта через SQL Editor (service role):
--   UPDATE public.builder_public_templates SET approved = true WHERE id = '…';
--   -- посмотреть очередь на модерацию:
--   SELECT id, title, industry, author_name, created_at
--     FROM public.builder_public_templates WHERE approved = false ORDER BY created_at;

-- ============================================================================
-- VERIFICATION
--   SELECT tablename FROM pg_tables WHERE tablename = 'builder_public_templates';
--   SELECT polname FROM pg_policies WHERE tablename = 'builder_public_templates';
-- ============================================================================

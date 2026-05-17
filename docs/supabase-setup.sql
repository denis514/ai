-- =====================================================
-- Claude Atlas — Supabase Phase 1 Setup
-- Запускать в Supabase SQL Editor (один раз)
-- Регион: EU Central (Frankfurt) — GDPR
-- =====================================================

-- ============================================
-- TABLE: profiles
-- Минимальные данные пользователя (GDPR-safe)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id              uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email           text,                          -- берётся из auth, для удобства
  display_name    text,                          -- необязательное, пользователь задаёт сам
  locale          text DEFAULT 'en',             -- предпочитаемый язык
  consent_at      timestamptz NOT NULL,          -- момент принятия Privacy Policy
  consent_version text NOT NULL DEFAULT '1.0',  -- версия Privacy Policy
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- ============================================
-- RLS: profiles
-- Пользователь видит и редактирует только своё
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: own select"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: own insert"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles: own update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "profiles: own delete"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- ============================================
-- TABLE: learning_progress
-- Прогресс туториалов (Phase 3)
-- ============================================
CREATE TABLE IF NOT EXISTS public.learning_progress (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tutorial_id      text NOT NULL,
  completed_steps  text[] DEFAULT '{}',
  last_step_index  int DEFAULT 0,
  completed_at     timestamptz,
  updated_at       timestamptz DEFAULT now(),
  UNIQUE (user_id, tutorial_id)
);

ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "progress: own all"
  ON public.learning_progress
  USING (auth.uid() = user_id);

-- ============================================
-- TABLE: node_progress
-- Статус узлов карты (viewed / review) (Phase 3)
-- ============================================
CREATE TABLE IF NOT EXISTS public.node_progress (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  node_id    text NOT NULL,
  status     text CHECK (status IN ('viewed', 'review')) NOT NULL,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, node_id)
);

ALTER TABLE public.node_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "node_progress: own all"
  ON public.node_progress
  USING (auth.uid() = user_id);

-- ============================================
-- TABLE: favorites
-- Закладки (Phase 3)
-- ============================================
CREATE TABLE IF NOT EXISTS public.favorites (
  id        uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id   uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_type text NOT NULL,  -- 'node' | 'prompt' | 'tutorial'
  item_id   text NOT NULL,
  added_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, item_type, item_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "favorites: own all"
  ON public.favorites
  USING (auth.uid() = user_id);

-- ============================================
-- Триггер: auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_learning_progress_updated_at
  BEFORE UPDATE ON public.learning_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_node_progress_updated_at
  BEFORE UPDATE ON public.node_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================
-- DONE. Таблицы созданы, RLS включён на всех.
-- Следующий шаг: добавить VITE_SUPABASE_URL и
-- VITE_SUPABASE_ANON_KEY в .env и на Vercel.
-- =====================================================

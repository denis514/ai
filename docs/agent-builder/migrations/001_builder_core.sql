-- ============================================================================
-- Builder Phase B-2.1 — Core persistence schema
-- ============================================================================
-- Создаёт таблицы для сохранения workflow авторизованных пользователей.
-- Изолированный namespace `builder_*` — не пересекается с Atlas-таблицами.
--
-- ДЕПЛОЙ: выполнить в Supabase Dashboard → SQL Editor → New query → Run.
-- Идемпотентно (IF NOT EXISTS) — безопасно запускать повторно.
--
-- Зависимости: auth.users (встроенная таблица Supabase Auth).
-- RLS: owner-only. Пользователь видит/меняет только свои workflow.
--
-- Что НЕ здесь (Phase B-2.2+):
--   builder_api_connections, builder_executions, builder_execution_logs,
--   builder_tools, builder_templates — добавятся при real API execution.
-- ============================================================================

-- ───────────────────────────────────────────────────────────────────────────
-- 1. Workflows — верхнеуровневая запись
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.builder_workflows (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          text NOT NULL DEFAULT 'Untitled workflow',
  description   text,
  template_id   text,                          -- если создан из template (TEMPLATES[].id)
  version       int  NOT NULL DEFAULT 1,        -- инкремент на каждый save
  is_archived   boolean NOT NULL DEFAULT false, -- soft-delete
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_builder_workflows_user
  ON public.builder_workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_builder_workflows_active
  ON public.builder_workflows(user_id, is_archived);

ALTER TABLE public.builder_workflows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "builder_workflows: own all" ON public.builder_workflows;
CREATE POLICY "builder_workflows: own all"
  ON public.builder_workflows
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ───────────────────────────────────────────────────────────────────────────
-- 2. Nodes — узлы canvas
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.builder_workflow_nodes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id   uuid NOT NULL REFERENCES public.builder_workflows(id) ON DELETE CASCADE,
  client_id     text NOT NULL,                  -- React Flow node id (стабилен для edges)
  node_type     text NOT NULL,                  -- 'agent' | 'tool' | 'trigger' | 'output'
  role          text,                           -- 'main' | 'research' | 'ux' | ...
  def_id        text NOT NULL,                  -- ключ из NODE_DEFS (e.g. 'agent-main')
  position_x    float NOT NULL,
  position_y    float NOT NULL,
  config        jsonb NOT NULL DEFAULT '{}',    -- prompt, tools, memory, label overrides
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_builder_nodes_workflow
  ON public.builder_workflow_nodes(workflow_id);
-- client_id уникален в рамках одного workflow (нужно для edge-резолва)
CREATE UNIQUE INDEX IF NOT EXISTS idx_builder_nodes_client
  ON public.builder_workflow_nodes(workflow_id, client_id);

ALTER TABLE public.builder_workflow_nodes ENABLE ROW LEVEL SECURITY;

-- RLS: доступ к node только если владеешь parent workflow.
DROP POLICY IF EXISTS "builder_nodes: via workflow" ON public.builder_workflow_nodes;
CREATE POLICY "builder_nodes: via workflow"
  ON public.builder_workflow_nodes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.builder_workflows w
      WHERE w.id = workflow_id AND w.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.builder_workflows w
      WHERE w.id = workflow_id AND w.user_id = auth.uid()
    )
  );

-- ───────────────────────────────────────────────────────────────────────────
-- 3. Edges — связи между узлами
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.builder_workflow_edges (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id     uuid NOT NULL REFERENCES public.builder_workflows(id) ON DELETE CASCADE,
  client_id       text NOT NULL,                -- React Flow edge id
  source_client_id text NOT NULL,               -- ссылается на nodes.client_id
  target_client_id text NOT NULL,
  label           text,
  config          jsonb NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_builder_edges_workflow
  ON public.builder_workflow_edges(workflow_id);

ALTER TABLE public.builder_workflow_edges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "builder_edges: via workflow" ON public.builder_workflow_edges;
CREATE POLICY "builder_edges: via workflow"
  ON public.builder_workflow_edges
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.builder_workflows w
      WHERE w.id = workflow_id AND w.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.builder_workflows w
      WHERE w.id = workflow_id AND w.user_id = auth.uid()
    )
  );

-- ───────────────────────────────────────────────────────────────────────────
-- 4. updated_at автообновление на builder_workflows
-- ───────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.builder_touch_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_builder_workflows_touch ON public.builder_workflows;
CREATE TRIGGER trg_builder_workflows_touch
  BEFORE UPDATE ON public.builder_workflows
  FOR EACH ROW EXECUTE FUNCTION public.builder_touch_updated_at();

-- ============================================================================
-- VERIFICATION QUERIES (запустить после миграции для проверки)
-- ============================================================================
-- 1. Таблицы созданы:
--    SELECT table_name FROM information_schema.tables
--    WHERE table_schema = 'public' AND table_name LIKE 'builder_%';
--    Ожидаем: builder_workflows, builder_workflow_nodes, builder_workflow_edges
--
-- 2. RLS включён:
--    SELECT relname, relrowsecurity FROM pg_class
--    WHERE relname LIKE 'builder_%';
--    Ожидаем: relrowsecurity = true для всех трёх
--
-- 3. Политики на месте:
--    SELECT tablename, policyname FROM pg_policies
--    WHERE tablename LIKE 'builder_%';
--    Ожидаем: 3 политики (по одной FOR ALL на таблицу)
--
-- 4. Тест изоляции (выполнить от имени реального user через клиент, НЕ в SQL editor
--    с service-role — там RLS обходится):
--    - INSERT workflow от user A → OK
--    - SELECT от user B → 0 строк (не видит чужое)
-- ============================================================================

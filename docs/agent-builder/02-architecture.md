# 02 — Architecture для Agent Builder

> Frontend / Backend / DB schema / Security. Сначала MVP-минимум, потом Beta.

---

## 1. High-level architecture

```
┌─────────────────────────────────────────┐
│  ATLAS (existing — unchanged)            │
│  React 18 + Vite + Hash routing          │
│  src/App.jsx + src/components/*          │
└────────────┬────────────────────────────┘
             │ (shared: Auth, Locale, Theme)
             │
             ▼
┌─────────────────────────────────────────┐
│  AGENT BUILDER (new — isolated)          │
│  src/builder/BuilderApp.jsx              │
│  React Flow canvas + own components      │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  BACKEND (existing Supabase + new fns)   │
│  - Supabase tables (auth, profiles)     │
│  - NEW: builder_workflows, executions   │
│  - NEW: edge functions для AI calls     │
└────────────┬────────────────────────────┘
             │ (only Beta phase)
             ▼
┌─────────────────────────────────────────┐
│  AI PROVIDERS (Beta only)                │
│  - Claude API (Anthropic)                │
│  - OpenAI API (optional)                 │
│  - MCP servers (future)                  │
└─────────────────────────────────────────┘
```

---

## 2. Frontend architecture

### Folder structure (`src/builder/`)

```
src/builder/
├── BuilderApp.jsx           # entry point, routing внутри builder
├── BuilderApp.css           # scoped CSS под .builder-app namespace
├── pages/
│   ├── BuilderHome.jsx      # template gallery + создать новый
│   ├── BuilderCanvas.jsx    # React Flow canvas + sidebar
│   └── BuilderTemplates.jsx # template library detail
├── components/
│   ├── canvas/
│   │   ├── WorkflowCanvas.jsx       # React Flow wrapper
│   │   ├── AgentNode.jsx            # role-based agent node
│   │   ├── ToolNode.jsx             # tool/integration node
│   │   ├── TriggerNode.jsx          # input/trigger node
│   │   ├── OutputNode.jsx           # output destination node
│   │   └── EdgeComponent.jsx        # connection с label
│   ├── panels/
│   │   ├── AgentSidebar.jsx         # detail panel selected node
│   │   ├── ExecutionPanel.jsx       # logs + status
│   │   ├── TemplateGallery.jsx      # template picker
│   │   └── ToolboxPanel.jsx         # node palette (drag-and-drop)
│   ├── education/
│   │   ├── ConceptTooltip.jsx       # inline education
│   │   ├── EmptyState.jsx           # onboarding empty canvas
│   │   └── AtlasLink.jsx            # deep-link к Atlas узлам
│   └── shared/
│       ├── BuilderHeader.jsx        # top bar + nav
│       └── BuilderToast.jsx         # status notifications (использует useToast)
├── hooks/
│   ├── useWorkflow.js               # workflow state + persistence
│   ├── useMockExecution.js          # mock execution для MVP
│   ├── useTemplates.js              # template loading
│   └── useBuilderRouter.js          # internal navigation
├── data/
│   ├── templates.js                 # MVP templates (UX Audit, Analytics, etc)
│   ├── agentRoles.js                # role definitions
│   ├── toolDefinitions.js           # available tools (MVP mocks)
│   └── educationContent.js          # inline education snippets
├── services/
│   ├── workflowStorage.js           # localStorage (MVP) / Supabase (Beta)
│   ├── mockExecutor.js              # MVP: simulates execution с timing
│   └── apiClient.js                 # Beta: real API через backend proxy
└── README.md                        # internal docs для разработчиков
```

### Tech choices

**React Flow** для node-based canvas:
- Industry standard, accessible
- ~150 KB gzip — добавляем через React.lazy(), не в main bundle
- License: MIT (free для commercial)
- Alternative: D3-based custom — too expensive в effort

**State management** для workflow:
- Local React state в MVP (useReducer)
- Persisted в localStorage в MVP
- Migrate в Supabase в Beta
- НЕ Redux, НЕ Zustand глобально — workflow state локальный

**Styling:**
- Tailwind НЕ используем (проект на чистом CSS, не вводим новые tooling)
- Scoped CSS `src/builder/BuilderApp.css` под `.builder-app` namespace
- Переиспользуем CSS variables из основного App.css (themes work automatically)

**Drag-and-drop:**
- React Flow built-in (для node positioning)
- HTML5 DnD для adding new nodes from toolbox
- НЕ react-dnd (heavy)

### Routing внутри Builder

`#/builder` — Home (templates)
`#/builder/new` — новый пустой canvas
`#/builder/wf/{id}` — открытый workflow
`#/builder/templates` — template gallery
`#/builder/templates/{id}` — template detail + «Use this»

Парсится через extension of `parseHash()` или внутренний router в `useBuilderRouter`.

---

## 3. Backend architecture

### MVP (Phase B-1, 30 days)

**Storage:** localStorage only. Никаких backend changes.

**Что хранится в localStorage:**
- `atlas:builder:workflows` — JSON array of saved workflows
- `atlas:builder:active` — currently open workflow ID

**Лимиты MVP:**
- max 5 workflows per user
- max 50 nodes per workflow
- Mock execution только (no API calls)

### Beta (Phase B-2, days 30-90)

**Supabase tables новые** (изолированный namespace `builder_*`):

```sql
-- Workflows
CREATE TABLE builder_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  template_id text,  -- если создан из template
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_archived boolean DEFAULT false,
  version int DEFAULT 1
);
CREATE INDEX idx_builder_workflows_user ON builder_workflows(user_id);

-- Workflow nodes
CREATE TABLE builder_workflow_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid REFERENCES builder_workflows(id) ON DELETE CASCADE,
  node_type text NOT NULL,  -- 'agent' | 'tool' | 'trigger' | 'output'
  role text,                -- 'main' | 'research' | 'ux' | etc.
  position_x float NOT NULL,
  position_y float NOT NULL,
  config jsonb NOT NULL,    -- agent config (prompt, tools, memory)
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_builder_nodes_workflow ON builder_workflow_nodes(workflow_id);

-- Workflow edges (connections)
CREATE TABLE builder_workflow_edges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid REFERENCES builder_workflows(id) ON DELETE CASCADE,
  source_node_id uuid REFERENCES builder_workflow_nodes(id) ON DELETE CASCADE,
  target_node_id uuid REFERENCES builder_workflow_nodes(id) ON DELETE CASCADE,
  label text,
  config jsonb               -- connection metadata
);

-- Tool library (global, shared across users)
CREATE TABLE builder_tools (
  id text PRIMARY KEY,        -- 'claude_api', 'figma_read', etc
  name text NOT NULL,
  description text,
  category text,              -- 'ai' | 'design' | 'analytics' | 'integration'
  config_schema jsonb,        -- JSON schema для tool params
  requires_api_key boolean DEFAULT false,
  is_premium boolean DEFAULT false,  -- для будущего Pro tier
  created_at timestamptz DEFAULT now()
);

-- User's API connections (encrypted)
CREATE TABLE builder_api_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id text REFERENCES builder_tools(id),
  encrypted_key text,         -- AES-encrypted via Supabase Vault
  is_active boolean DEFAULT true,
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX idx_builder_api_unique ON builder_api_connections(user_id, tool_id);

-- Execution history
CREATE TABLE builder_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid REFERENCES builder_workflows(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL,       -- 'pending' | 'running' | 'completed' | 'failed'
  input_data jsonb,
  output_data jsonb,
  error_message text,
  tokens_used int DEFAULT 0,
  duration_ms int,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);
CREATE INDEX idx_builder_executions_user ON builder_executions(user_id);
CREATE INDEX idx_builder_executions_workflow ON builder_executions(workflow_id);

-- Detailed execution logs per node
CREATE TABLE builder_execution_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id uuid REFERENCES builder_executions(id) ON DELETE CASCADE,
  node_id uuid REFERENCES builder_workflow_nodes(id) ON DELETE SET NULL,
  log_level text NOT NULL,    -- 'info' | 'warn' | 'error'
  message text,
  data jsonb,
  timestamp timestamptz DEFAULT now()
);
CREATE INDEX idx_builder_logs_execution ON builder_execution_logs(execution_id);

-- Templates (global, curated)
CREATE TABLE builder_templates (
  id text PRIMARY KEY,        -- 'ux-audit-agent', 'analytics-agent', etc.
  name text NOT NULL,
  description text,
  category text,
  difficulty text,            -- 'beginner' | 'intermediate' | 'advanced'
  workflow_data jsonb NOT NULL,  -- pre-built nodes + edges
  preview_image text,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
```

### RLS policies (Beta)

```sql
-- workflows: только owner может read/write
ALTER TABLE builder_workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workflows_owner" ON builder_workflows
  FOR ALL USING (auth.uid() = user_id);

-- nodes + edges: через workflow ownership
ALTER TABLE builder_workflow_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nodes_via_workflow" ON builder_workflow_nodes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM builder_workflows w
      WHERE w.id = workflow_id AND w.user_id = auth.uid()
    )
  );

-- (analogous для edges, executions, logs, api_connections)

-- tools + templates: read-only для всех auth users
ALTER TABLE builder_tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tools_read_all" ON builder_tools FOR SELECT USING (true);

ALTER TABLE builder_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "templates_read_all" ON builder_templates FOR SELECT USING (true);
```

### Edge Functions (Beta)

**`builder-execute-workflow`** (Supabase Edge Function):
- Input: `workflow_id`, `input_data`
- Process: load workflow, walk nodes в topological order, call AI APIs через user's stored keys, log everything
- Output: execution_id (client poll for status)

**`builder-validate-api-key`** (Supabase Edge Function):
- Input: `tool_id`, `api_key`
- Process: тест запрос к provider API, return OK/error
- Output: validation result + capability summary

**Critical:** API ключи юзера **никогда** не идут на frontend в plain text. Encrypted в Supabase Vault, decrypted только в Edge Function context.

---

## 4. AI Layer

### Phase MVP: Mock only

`src/builder/services/mockExecutor.js`:
- Симулирует execution: каждый node меняет статус с delay (idle → running 1-3s → completed)
- Возвращает hardcoded mock outputs per agent role
- Generates fake logs: `[Research Agent] Analyzing inputs...` / `[UX Agent] Generating wireframes...`
- Configurable failure rate (5%) — для демонстрации failed status

**Никаких реальных API calls.**

### Phase Beta: Real execution через backend proxy

**Flow:**
1. User clicks "Run" в Builder
2. Frontend → POST `/functions/v1/builder-execute-workflow`
3. Edge function: load workflow, decrypt API keys, execute через AI provider SDKs
4. Real-time updates: Supabase Realtime подписка на `builder_executions` table
5. Frontend поллит status + reads execution_logs

**Providers поддерживаемые в Beta:**
- Claude API (Anthropic) — primary
- OpenAI API — secondary
- Mock executor — fallback для testing

**MCP integration:** **defer to Phase B-3** (post-Beta). Слишком сложно для первого rollout.

---

## 5. Security architecture

### MVP

**Низкие риски** потому что:
- Нет real API calls
- Нет user data персистится в backend (только localStorage)
- Нет user-provided secrets

**Defenses:**
- localStorage сегрегирован (`atlas:builder:*` prefix)
- XSS-проверки на template-renderable text
- CSP заголовки (если deploy via Vercel)

### Beta

**Threat model:**
1. User input (workflow content, tool configs) — sanitize on display
2. API keys storage — encrypt at rest, never log
3. Execution outputs — могут содержать sensitive data, не cache long-term
4. Rate limiting — prevent abuse через monthly token allowance

**Implementations:**

**API keys:**
- Stored: Supabase Vault (encrypted at rest)
- Encryption: pgsodium с user-specific key derivation
- Access: только Edge Functions, никогда не возвращаются в frontend
- Rotation: user может revoke + create new

**Backend proxy:**
- Все AI calls идут через Edge Functions
- Frontend никогда не имеет AI provider credentials
- Rate limit: 100 executions/day для Pro, 10 для Free
- Token budget: 100k tokens/month Pro, 10k Free

**Audit logging:**
- `builder_executions` table = audit log
- Содержит: who, what workflow, when, status, tokens used
- Retention: 90 days для Pro, 30 days для Free
- Doesn't store: actual prompts/outputs (privacy)

**User permissions:**
- RLS на всех таблицах (см. § 3)
- Tool definitions read-only для всех
- Workflows isolated per user

**Compliance (Beta):**
- GDPR: explicit consent для AI execution
- Data deletion: cascade delete на user removal
- Export: user может download all workflows как JSON

---

## 6. Performance considerations

### MVP

- Builder загружается через React.lazy() — не affects main bundle
- React Flow ~150 KB добавляется только при route enter
- Mock execution — все client-side, no network

### Beta

- Workflow load: ~100ms (Supabase + parse)
- Save: ~200-500ms (Supabase write)
- Execution start: ~500ms (Edge function cold start)
- Real-time status: Supabase Realtime (WebSocket)

**Bottleneck:** AI provider latency (1-30s per node). Mitigated через async execution + status polling.

---

## 7. Migration path

```
PHASE B-0 (Strategy + structure):     текущий момент
PHASE B-1 (MVP, 30 days):             только frontend + localStorage
PHASE B-2 (Beta, 30-90 days):         + Supabase + Edge functions + real APIs
PHASE B-3 (Post-Beta, 90+ days):      + MCP + advanced features
```

**Между phases — clean breakpoint.** Phase B-1 user data в localStorage не теряется
при upgrade — migration tool копирует в Supabase при first Pro signup.

---

## 8. Code quality conventions

- TypeScript НЕ вводим (проект на JS, не меняем стек)
- Tests: добавляем для critical paths в Beta (Vitest + RTL уже available?)
- Linting: ESLint config от Atlas
- File size limit: 300 строк на компонент, делим если больше
- No external state libraries: useReducer + Context достаточно

---

_Архитектура спроектирована для гибкости MVP → Beta без переписывания core._

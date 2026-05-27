# 03 — MVP Plan: 30 days

> Цель: рабочая визуальная концепция Agent Builder. Demo-only, без backend,
> без auth, без реальных API. Можно показывать людям и собирать feedback.

---

## Definition of Done — MVP

После 30 дней работающее demo:

- ✅ Откроется по `#/builder` без ошибок
- ✅ Empty canvas + toolbox + ability добавить ноды
- ✅ 4 готовых templates можно загрузить
- ✅ Drag-and-drop ноды на canvas, соединение edges
- ✅ Кнопка «Run» запускает mock execution с status changes
- ✅ Execution panel показывает fake логи в реальном времени
- ✅ Sidebar показывает details выбранного агента
- ✅ Inline education tooltips на каждом node-type
- ✅ Deep-links на Atlas узлы из tooltips работают
- ✅ Builder выглядит professional на dark + light theme
- ✅ Локализован в ru/en/fi (UI strings, не deep contents)
- ✅ Не ломает существующие Atlas функции
- ✅ Не блокирует main bundle (lazy loaded)

**Не required в MVP:**
- ❌ Persistence (save/load workflows)
- ❌ Auth integration
- ❌ Real API calls
- ❌ User accounts
- ❌ Mobile responsiveness (desktop-first, mobile в Beta)
- ❌ Cross-browser testing beyond Chrome/Safari (Firefox в Beta)

---

## Weekly breakdown

### Week 1: Foundation (days 1-7)

**Цели:** Builder route работает, React Flow loads, layout structure готов.

#### Day 1-2 — Routing + entry point
- [ ] В `App.jsx` добавить route handler:
  ```jsx
  if (route?.type === 'builder') {
    const BuilderApp = React.lazy(() => import('./builder/BuilderApp.jsx'));
    return <Suspense fallback={<LoadingScreen/>}><BuilderApp/></Suspense>;
  }
  ```
- [ ] Создать `src/builder/BuilderApp.jsx` с placeholder content
- [ ] Создать `src/builder/BuilderApp.css` с `.builder-app` namespace
- [ ] Проверить hash routing: `#/builder`, `#/ru/builder`, `#/en/builder` все работают

#### Day 3 — React Flow setup
- [ ] `npm install reactflow` (~150 KB gzip)
- [ ] Verify lazy loading: main bundle не растёт
- [ ] Создать `src/builder/components/canvas/WorkflowCanvas.jsx` с empty React Flow
- [ ] Test базовая pan/zoom функциональность

#### Day 4-5 — Layout structure
- [ ] `BuilderHeader` (top bar: logo, "Atlas | Builder", user menu placeholder)
- [ ] Left toolbox panel (placeholder)
- [ ] Right sidebar panel (placeholder)
- [ ] Bottom execution panel (placeholder, collapsed)
- [ ] CSS Grid layout, scoped через `.builder-app`

#### Day 6-7 — Theme + i18n integration
- [ ] CSS variables inheritance из Atlas
- [ ] `useT()` для UI strings: добавить `builder.*` namespace в ui.json × 3 locales
- [ ] Hardcode strings вначале, переводы делаем когда UI stable

**Outcome week 1:** Builder route opens, empty canvas visible, layout готов, theme работает.

---

### Week 2: Node system + interaction (days 8-14)

**Цели:** ноды появляются, можно drag-drop, можно соединять edges.

#### Day 8-9 — Custom node types

Создать 4 базовых node component:
- [ ] `AgentNode.jsx` — главный agent (role + icon + name)
- [ ] `ToolNode.jsx` — tool/integration
- [ ] `TriggerNode.jsx` — input source
- [ ] `OutputNode.jsx` — output destination

Каждая нода имеет:
- Visual style под role (color from `LEVEL_COLOR` или новые)
- Top handle (input) + bottom handle (output)
- Status indicator (idle/running/completed/failed)
- Click → opens AgentSidebar

#### Day 10 — Toolbox (drag-from-palette)
- [ ] `ToolboxPanel.jsx` с 4 категориями ноды
- [ ] HTML5 drag-and-drop → onDragOver на canvas → onDrop adds new node
- [ ] Auto-position новой ноды в visible area

#### Day 11 — Edge connections
- [ ] React Flow built-in connection mode
- [ ] Custom `EdgeComponent` с label поддержкой
- [ ] Validation: agent → agent OK, tool → agent OK, output → agent NOT OK
- [ ] Visual feedback при invalid connection (red dash)

#### Day 12-13 — Selection + actions
- [ ] Click node → select → show in AgentSidebar
- [ ] Multi-select (shift+click) для bulk operations
- [ ] Delete key removes selected nodes/edges
- [ ] Copy/paste (Cmd+C/Cmd+V) для node reuse

#### Day 14 — Polish + testing
- [ ] Empty state когда canvas пустой
- [ ] Smooth animations (CSS transitions)
- [ ] Keyboard shortcuts list (`?` opens shortcuts modal)

**Outcome week 2:** Builder canvas полностью функционален как visual editor.

---

### Week 3: Templates + execution (days 15-21)

**Цели:** 4 готовых template работают, mock execution показывает статусы и логи.

#### Day 15-16 — Template system
- [ ] `src/builder/data/templates.js` — структура templates
- [ ] 4 готовых templates:

**1. UX Audit Agent**
```
[User Input: URL/screenshot]
        ↓
[Main Agent: UX Auditor]
    ├→ [Research Agent: Heuristic check]
    ├→ [Accessibility Agent: WCAG]
    └→ [Visual Agent: Design analysis]
        ↓
[Output: Markdown report]
```

**2. Analytics Agent**
```
[User Input: GA4 data export]
        ↓
[Main Agent: Analytics]
    ├→ [Trend Agent: Pattern detection]
    └→ [Anomaly Agent: Outlier flag]
        ↓
[Output: Insights + recommendations]
```

**3. Content Agent**
```
[User Input: Brief + brand voice]
        ↓
[Main Agent: Content Director]
    ├→ [Research Agent: SERP analysis]
    ├→ [Draft Agent: Writing]
    └→ [SEO Agent: Optimization]
        ↓
[Output: Markdown draft]
```

**4. Research Agent**
```
[User Input: Research question]
        ↓
[Main Agent: Research Lead]
    ├→ [Search Agent: Web search]
    ├→ [Synthesis Agent: Pattern matching]
    └→ [Critic Agent: Source validation]
        ↓
[Output: Structured report]
```

- [ ] `TemplateGallery.jsx` — UI для просмотра + «Use template»
- [ ] Loading template populates canvas

#### Day 17-18 — Mock execution

`src/builder/services/mockExecutor.js`:
- [ ] `executeWorkflow(workflow)` → returns ExecutionState
- [ ] Topological sort of nodes (process dependencies in order)
- [ ] Each node: status idle → running (1-3s delay) → completed
- [ ] 5% random failure rate per node для realism
- [ ] Generates fake logs at each step

#### Day 19-20 — Execution panel

`ExecutionPanel.jsx`:
- [ ] Toggleable bottom panel (Cmd+J shortcut)
- [ ] Real-time log streaming (append as execution proceeds)
- [ ] Color-coded log levels (info/warn/error)
- [ ] Status summary header (X/Y nodes completed)
- [ ] Stop button (kill current execution)
- [ ] Clear button (reset state)

#### Day 21 — Run button + visual feedback
- [ ] Header «Run» button прогресс indicator
- [ ] Node visual changes: pulse during running, checkmark on complete, red on fail
- [ ] Edge flow animation от source к target
- [ ] Toast notifications: «Execution started», «3 of 5 nodes complete», «Failed at Step X»

**Outcome week 3:** Press «Run» → watching agents execute step-by-step → reading логи. Это main «wow» moment MVP.

---

### Week 4: Education + polish (days 22-30)

**Цели:** Inline education tooltips, deep-links на Atlas, демо-ready quality.

#### Day 22-23 — Education layer

`src/builder/data/educationContent.js`:
- [ ] Per node-type short education snippets:
  - AgentNode: «An agent is an AI that can use tools, не только chat»
  - ToolNode: «Tools allow agents to do actions: search, fetch, calculate»
  - TriggerNode: «Triggers initiate the workflow: user input, schedule, webhook»
- [ ] Per role (research/ux/analytics) inline rationale: «Why this role here?»

`ConceptTooltip.jsx`:
- [ ] Hover на node-type icon → tooltip с education snippet
- [ ] Click on «Learn more» → opens Atlas узел в side panel или new tab

#### Day 24 — Empty state + onboarding

`EmptyState.jsx`:
- [ ] Когда canvas пустой: 3 large buttons
  - «Start from template» → TemplateGallery
  - «Build from scratch» → close empty state + show toolbox tour
  - «Learn first» → opens `agents` tutorial в Atlas

#### Day 25-26 — Atlas deep-links + cross-references

- [ ] `AtlasLink.jsx` component: renders `[[node:agents]]` syntax → click opens Atlas узел
- [ ] AgentSidebar shows «Related Atlas content» section
- [ ] Header «← Back to Atlas» link

#### Day 27 — i18n completion
- [ ] Финализировать `builder.*` keys в ru/en/fi ui.json
- [ ] Verify все strings локализованы

#### Day 28 — Visual polish
- [ ] Loading skeletons для template gallery
- [ ] Smooth transitions / animations everywhere
- [ ] Empty/error states everywhere
- [ ] Mobile baseline (no-go message + advise desktop, full mobile в Beta)
- [ ] Light/Dark theme final pass

#### Day 29 — Demo recording prep
- [ ] Test full happy path: empty → template → run → success
- [ ] Test failure path: template → modify → run → failure → understand log
- [ ] Test cross-link: builder → atlas → builder

#### Day 30 — Soft launch
- [ ] Add «Agent Builder (Beta)» link в Atlas CanvasHeader + Cmd+K
- [ ] Update Atlas IntroModal: optional «Try the new Agent Builder» CTA в slide 1
- [ ] Tweet/share с recording
- [ ] Collect first feedback (Google Form or Calendly)

**Outcome MVP:** demonstrable visual product, no users persist data, no API costs.

---

## Effort estimation

| Week | Hours | Critical path |
|------|-------|---------------|
| Week 1 (Foundation) | 20-25h | Routing, React Flow setup |
| Week 2 (Node system) | 25-30h | Custom nodes, edge logic, drag-and-drop |
| Week 3 (Templates + execution) | 25-30h | Mock executor, animation, logs |
| Week 4 (Education + polish) | 20-25h | i18n, education content, polish |
| **Total MVP** | **90-110 hours** | ~2-3 weeks full-time, или 4-5 weeks part-time |

---

## Dependencies (что нужно купить/настроить)

- [ ] `reactflow` npm package (free MIT)
- [ ] Опционально: Figma для UI design draft (~$15/mo если ещё нет)
- [ ] Опционально: ScreenStudio для demo recording (~$15/mo один месяц)

**Total cost MVP:** ~$0-30 (только tooling). No backend cost.

---

## Что НЕ делаем в MVP

- ❌ Save workflows к Supabase (localStorage только)
- ❌ Auth gate на Builder (открыт всем)
- ❌ User profiles в Builder
- ❌ Любые AI provider integrations (mock only)
- ❌ Token tracking / billing (irrelevant без real APIs)
- ❌ Sharing workflows между users (no backend = no sharing)
- ❌ Mobile UI optimization (desktop-first)
- ❌ Internationalized content beyond UI strings
- ❌ Marketplace для third-party templates
- ❌ Plugin system / extensibility
- ❌ Version history workflows
- ❌ Comments / collaboration
- ❌ Webhooks / external triggers

Все эти — Beta или later.

---

## Milestones для measure progress

**Day 7:** «Builder route works, canvas renders, layout exists»
**Day 14:** «Can build a workflow visually with nodes and edges»
**Day 21:** «Can run a mock workflow and see status changes»
**Day 30:** «MVP ships, first 3-5 user demos scheduled»

---

## Success metrics (post-MVP launch)

| Metric | Target в 14 дней после launch |
|--------|------------------------------|
| Builder page views | 200-500 |
| Time on Builder | 2-5 min average |
| Templates loaded | 50+ |
| Mock executions run | 100+ |
| Feedback responses | 10-20 |
| Critical bugs | 0-2 |
| User quotes «I want to save this» | 5+ (signal для Beta) |

---

## Risk register (MVP)

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| React Flow learning curve | Medium | Allocate день 3 для docs + examples |
| Animation performance laggy при 50+ nodes | Low | Throttle status updates, React Flow handles это |
| Confusion «is this real or demo?» | High | Banner «Demo Mode — Beta with real API coming» |
| Builder competes attention с Atlas | Medium | Clear navigation, не cross-promote aggressive |
| MVP scope creep (хочется добавить save) | High | Strict scope control, save в Beta |
| Mobile pretty broken | Medium | Polite no-go message + screenshot of desktop UX |

---

_План создан 2026-05-24. Ready для execution после approval._

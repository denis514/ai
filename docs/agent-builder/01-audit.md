# 01 — Audit текущего проекта для Agent Builder

> Что реально есть, что переиспользуем, что не трогаем.

---

## 1. Текущая архитектура (relevant для Builder)

**Стек:**
- React 18 + Vite
- Чистый CSS (App.css, index.css)
- Hash-based routing (`#/locale/type/id`)
- Supabase Auth (Magic Link + Google OAuth) + DB
- i18n через `STRINGS[locale]` + lazy load узлов и tutorials
- Hugeicons через central Icon.jsx registry
- 247 узлов, 32 tutorials, 42 prompts в 3 локалях

**Bundle:**
- index: ~365 KB (104 KB gzip)
- nodes per locale: ~110-135 KB gzip
- tutorials per locale: ~90-112 KB gzip

---

## 2. Что переиспользуем (read-only или через extension)

### ✅ Routing infrastructure
- `useHashRoute()` хук + `parseHash()` уже поддерживает `type: 'builder'`
- Локализация в URL уже работает (`#/ru/builder` тоже валиден)

### ✅ Auth context
- `useAuth()` из `src/context/AuthContext.jsx`
- Builder сможет читать `{ user, session, loading }` без модификации
- Сохранение workflow требует `user.id` — берём отсюда

### ✅ Locale context
- `useT()` + `useLocale()` — Builder UI локализуется в ru/en/fi с первого дня
- i18n ключи под `builder.*` namespace в `src/locales/{lang}/ui.json`

### ✅ Theme context (light/dark)
- `useTheme()` — Builder unconditionally инхеритит тему
- CSS-vars из `App.css` доступны через `:root[data-theme="dark"]`

### ✅ Toast system
- `useToast()` + `ToastContainer` уже глобальны
- Builder использует для status notifications («Workflow saved», «Execution failed»)

### ✅ Modal patterns
- `useFocusReturn()` + `useBodyScrollLock()` — для Builder modals
- `useConfirm()` — для destructive actions

### ✅ Icon registry
- `<Icon name="brain" />` доступен глобально
- Builder использует существующие icons + при необходимости добавляем в Icon.jsx

### ✅ Atlas content (read-only через imports)
- `import { mindmapData } from '../data/mindmapData.js'` — Builder может deep-link на узлы
- `import { tutorials } from '../data/tutorials.js'` — для inline education
- НИКОГДА не модифицируем эти данные из Builder

---

## 3. Что НЕ трогаем (do-not-touch list)

### 🚨 Существующие routes
- `#/`, `#/locale/node/*`, `#/locale/tutorial/*`, `#/locale/courses`, etc.
- Любая существующая навигация ОБЯЗАНА работать как раньше
- Builder добавляет только `#/locale/builder/*` — новый top-level segment

### 🚨 Существующий контент
- `src/data/mindmapData.js`, `tutorials.js`, `prompts.js` — read-only для Builder
- Если нужна новая connection между Atlas и Builder — через UI CTA, не через data
- НЕ добавляем `builderTemplate: '...'` поля в узлы — это связь через ID lookup в Builder, не через data coupling

### 🚨 Существующие компоненты `src/components/`
- НЕ модифицируем `Mindmap.jsx`, `DetailPanel.jsx`, `TutorialModal.jsx`, etc.
- НЕ переиспользуем их внутри Builder — Builder делает свои аналоги
- Исключение: shared infra (Toast, Confirm, Icon, Skeleton) — это OK

### 🚨 `src/App.jsx` главный routing
- В App.jsx добавляем ОДНУ ветку: `if (route?.type === 'builder') return <BuilderApp />;`
- BuilderApp живёт в `src/builder/BuilderApp.jsx`
- НЕ интегрируем Builder UI с Mindmap UI на одном экране — это будет каша

### 🚨 Supabase tables существующие
- `profiles`, `bookmarks`, `tutorial_progress`, `node_progress` — read-only из Builder
- НЕ добавляем foreign keys из новых builder-таблиц в существующие за пределами `user_id`
- Новые builder-таблицы — отдельная namespace (см. `02-architecture.md`)

### 🚨 Bundle size основного приложения
- React Flow весит ~150 KB gzip — НЕ импортируем в main bundle
- Builder загружается через React.lazy() / dynamic import
- main bundle Atlas не растёт от Builder

### 🚨 i18n namespace conflicts
- НЕ переименовываем существующие ключи
- Builder использует `builder.*` префикс — изолирован

---

## 4. Что уже есть из Educational Layer (Level 1)

### Atlas узлы про agents и связанные концепции

| Concept | Узел / Tutorial |
|---------|-----------------|
| Что такое agent | `agents` (parent), `ag-principles`, `ag-code`, `ag-ux`, `ag-research`, `ag-designer`, `ag-pm`, `ag-managed` |
| Tool calling | `cap-tools` (нужен upgrade — Backlog #34) |
| Memory | `cap-memory` (нужен upgrade — Backlog #35) |
| MCP | `mcp` (parent) + 5 children: `m-protocol`, `m-servers`, `m-clients`, `m-ready`, `m-claude-code` |
| Workflows | `ai-workflows` (Systems) + `sys-workflows-basics`, `sys-linear-chain`, `sys-quality-gates` |
| Agent vs chat | `ag-principles` + `sys-multi-agent-patterns` |
| Multi-agent | `sys-multi-agent-patterns`, `cc-subagents`, `subagents` (tutorial) |
| Skills | `skills` (parent) + 5 children |

### Tutorials релевантные для Builder onboarding

- `agents` tutorial — base understanding
- `subagents` tutorial — multi-agent patterns
- `tool-use` tutorial — tool calling specifics
- `mcp` tutorial — protocol layer

**Гипотеза:** для MVP Builder onboarding достаточно текущего educational контента +
3-5 inline education tooltips в Builder UI. **Не нужно создавать новый content layer.**

### Что докинуть позже (P1 Builder content)

После MVP, как часть Beta plan:
- Новый tutorial `building-your-first-agent` — 5-step guide через Builder
- Новый узел `workflow-design-patterns` под Systems
- Updated `cap-tools` / `cap-memory` (уже в backlog #34-#35)

---

## 5. Где Builder вписывается в текущий UI

### Точки входа в Builder из Atlas

1. **CanvasHeader** — Atlas menu добавляется новый item «Agent Builder» (Beta badge)
2. **CommandPalette (Cmd+K)** — search «builder» возвращает result «Open Agent Builder»
3. **Tutorial `agents`** — последний шаг с CTA «Try in Builder»
4. **Узел `agents`** — sidebar CTA «Build an agent now»
5. **WorkflowsModal** — секция «Agent templates» с превью

### Точки входа в Atlas из Builder

1. **Empty state** — «New to agents? Start with [agents-basics tutorial]»
2. **AgentNode tooltip** — «Learn more about agents → [Atlas узел]»
3. **Header link** — «Atlas» в Builder header → возврат на mindmap

### Что НЕ объединяем

- Mindmap и Builder canvas — **разные views, не один UI**
- В одном browser tab пользователь либо в Atlas, либо в Builder
- Переключение через явный navigation, не через side-by-side

---

## 6. Risks for Atlas от Builder

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Bundle size основного приложения растёт | Low | React.lazy для Builder routes |
| Routing conflict | Low | Новый top-level type `builder` — изолирован |
| CSS conflicts | Medium | Builder CSS под `.builder-app` namespace |
| Auth state caching issues | Low | Shared context, протестировать sign-out scenarios |
| Supabase rate limits | Medium | Builder писать только при save (не в realtime) |
| User confusion «two products in one» | High | Чёткое navigation + onboarding копи «Builder is part of Atlas» |
| Maintenance burden 2× | High | Изолированная папка + own components — не оптимально для shared, но защищает от coupling |

---

## 7. Готовность инфраструктуры

| Требование Builder | Статус Atlas | Action |
|--------------------|-------------|--------|
| Auth flow | ✅ Magic Link + Google | Reuse |
| User profile | ✅ Supabase profiles table | Reuse |
| GDPR-compliant | ✅ Yes (consent + delete) | Inherit |
| Edge functions для backend logic | ⚠️ Не используются | Add for Beta phase |
| Stripe billing | ❌ Не подключен | Add (планируется для Atlas Pro независимо) |
| Logging / observability | ⚠️ Minimal | Add for Beta (Posthog или similar) |
| API rate limiting | ❌ Не нужно сейчас | Add when real API integration |
| Encrypted secrets storage | ❌ Не нужно сейчас | Add for user API keys в Beta |

**Большая часть инфраструктуры готова или подходит для расширения.** Реальный
build из 0 — только Builder-specific UI и new Supabase tables.

---

_Audit complete: 2026-05-24. Безопасно начать MVP — нет блокеров._

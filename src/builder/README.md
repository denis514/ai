# src/builder/ — Agent Builder

> 🚧 **Empty placeholder folder.** Strategy ready, implementation в Phase B-1 (MVP, 30 days).

---

## Status

- ✅ Strategy: `docs/agent-builder/` (6 docs)
- ✅ Skills: `skills/{agent-architecture, ux-flow-designer, ai-education-designer, technical-risk-auditor, mvp-planner}/`
- 🚧 Implementation: starts Day 1 of MVP plan

## Entry point (when built)

`src/builder/BuilderApp.jsx` — main component. Loaded via `React.lazy()` in `src/App.jsx`:

```jsx
if (route?.type === 'builder') {
  const BuilderApp = React.lazy(() => import('./builder/BuilderApp.jsx'));
  return (
    <Suspense fallback={<LoadingScreen/>}>
      <BuilderApp/>
    </Suspense>
  );
}
```

## Что НЕ делать в этой папке

- ❌ Не импортируй `src/components/*` (используй свои analogous)
- ❌ Не модифицируй `src/data/*` (read-only)
- ❌ Не модифицируй `src/locales/*` за пределами `builder.*` namespace
- ❌ Не модифицируй существующее routing
- ❌ Не пихай Builder code в main bundle (lazy load)

## Файловая структура (планируемая)

```
src/builder/
├── BuilderApp.jsx           # entry point + internal routing
├── BuilderApp.css           # scoped CSS под .builder-app namespace
├── pages/
│   ├── BuilderHome.jsx
│   ├── BuilderCanvas.jsx
│   └── BuilderTemplates.jsx
├── components/
│   ├── canvas/              # AgentNode, ToolNode, EdgeComponent
│   ├── panels/              # AgentSidebar, ExecutionPanel, ToolboxPanel
│   ├── education/           # ConceptTooltip, EmptyState, AtlasLink
│   └── shared/              # BuilderHeader
├── hooks/
│   ├── useWorkflow.js
│   ├── useMockExecution.js
│   ├── useTemplates.js
│   └── useBuilderRouter.js
├── data/
│   ├── templates.js
│   ├── agentRoles.js
│   ├── toolDefinitions.js
│   └── educationContent.js
└── services/
    ├── workflowStorage.js
    ├── mockExecutor.js
    └── apiClient.js
```

См. `docs/agent-builder/02-architecture.md` для полной спецификации.

---

_Created: 2026-05-24. Implementation: starts after MVP approval._

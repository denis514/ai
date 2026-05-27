# ADR-0004: Bundle splitting strategy — per-locale sections + lazy modals + audience-based tutorials

**Status:** accepted
**Date:** 2026-05-27
**Tags:** architecture, performance, frontend

## Context

После завершения phase #21 (Systems layer 10→35 nodes) и #24 (3 advanced workflows) контент достиг размеров, при которых **single-bundle подход стал заметным UX-debt**:

- `nodes-{locale}.json`: 459-469 KB raw / 118-148 KB gzip (per-locale chunk)
- `tutorials-{locale}`: 255-265 KB raw / 90-113 KB gzip
- Initial JS bundle: 112 KB gzip (3 модалки eager-bundled — CommandPalette, ProfilePanel, WhatsNewPanel)
- CSS: 24.9 KB gzip (159.5 KB raw, замусорено dead-классами)

Атлас рендерит mindmap-дерево immediately, но **content-чанк ждёт первого DetailPanel-открытия** — пользователь видит спиннер 200-400 мс при slow connection. На mobile это критично.

Дополнительная боль: `sys-*` секция (35 узлов, 152 KB raw) — это контент для senior devs, **большинство пользователей его не смотрит**. Грузить 152 KB ради 5-10% посетителей — расточительно.

Альтернативы рассмотрены:

1. **Path A (aggressive lazy)**: каждый узел = отдельный chunk, lazy на DetailPanel-open. ROI большой, но требует переписать 8+ компонентов-consumer'ов под "not yet loaded" state. Высокий risk.
2. **Path B (parallel parallel-load)**: split в секции, но грузить ВСЕ через `Promise.all` параллельно. Vite даёт separate chunks → HTTP/2 multiplexing + independent caching. Низкий risk, **модестный win** (тот же total bytes).
3. **Path C (eager core + lazy secondary)**: split на `core` (eager, 80% usage) + `sys`/`commerce` (lazy on-demand). **Sweet spot** между ROI и refactor scope.

## Decision

**Принят Path C — eager core + on-demand secondary sections.**

### Splitting axes:

**Nodes (273 total) — split по тематике-аудитории:**
- `core.json` (187 nodes, ~228 KB raw): foundation, Claude basics, capabilities (cap-*), fundamentals (af-*), MCP, instructions, prompts. **Eager-loaded.**
- `sys.json` (35 nodes, ~153 KB raw): production patterns (`sys-*`). **Lazy on first sys-* access.**
- `commerce.json` (51 nodes, ~88 KB raw): eCommerce (`ec-*`), use cases (`uc-*`, `cs-*`, `mk-*`, `pd-*`). **Lazy on first commerce-* access.**

**Tutorials (35 total) — split по аудитории:**
- `everyone.json`: beginner/общий контент.
- `developers.json`: техническая аудитория (api-basics, mcp, claude-code, agents, mcp-advanced, claude-code-project, building-evaluations).
- `business.json`: бизнес-роли (claude-for-business, scenarios, role-use-cases).
- **Все три eager-loaded** (total < 200 KB gzip — не критично splitить дальше).

**Modals — React.lazy:**
- `CommandPalette.jsx` (Cmd+K — открывается user-action).
- `ProfilePanel.jsx` (sidebar — открывается user-action).
- `WhatsNewPanel.jsx` (badge-trigger — открывается user-action).

### Loading orchestration:

```js
// src/i18n/content-{locale}.js (per locale)
export async function loadContent() {  // eager initial
  const [nodesCore, tutEveryone, tutDevelopers, tutBusiness, library] =
    await Promise.all([
      import('../locales/ru/nodes/core.json'),
      import('../locales/ru/tutorials/everyone.json'),
      ...
    ]);
  return { nodes: nodesCore.default, tutorials: {...}, library };
}

export async function loadNodeSection(section) {  // lazy on-demand
  const SECTION_LOADERS = {
    sys:      () => import('../locales/ru/nodes/sys.json').then(m => m.default),
    commerce: () => import('../locales/ru/nodes/commerce.json').then(m => m.default),
  };
  return SECTION_LOADERS[section]();
}
```

Consumer (DetailPanel / useNode hook):
- Если `STRINGS[locale].nodes[id]` существует → render immediately.
- Если нет, проверить `id.startsWith('sys-')` или commerce-prefix → trigger `loadNodeSection()` → set merged state.

### Splitter automation:

`scripts/split-nodes.mjs` — переcоздаёт секции из `nodes.json` после контент-изменений. Идемпотентно. Запускается вручную при добавлении новых узлов (или после контент-batch'ей).

## Consequences

**Positive:**
- **Initial bundle**: 112 → 102 KB gzip (-10 KB) от React.lazy на 3 модалках.
- **Max tutorials chunk**: 138 → 61 KB gzip (-56%) от audience split.
- **Initial nodes-load**: 148 → ~75 KB gzip (~-50%) — только `core` eager.
- **sys-* пользователи**: дополнительная 50-70 KB загрузка **только** при первом sys-узле, не при первом узле вообще.
- **Independent caching**: контент-update в `sys.json` не инвалидирует `core.json` browser-cache.
- **HTTP/2 multiplexing**: 3+ параллельных chunks вместо одного большого.

**Negative / trade-offs:**
- **Сложность**: 2-stage loader API + section-aware consumers (`useNode`).
- **First sys-access latency**: пользователь видит +200-400 мс при первом клике на sys-узел (mitigated background-preload — см. ниже).
- **Splitter coupling**: при добавлении узла с НОВЫМ префиксом нужно обновить `scripts/split-nodes.mjs` (catch-all → `core`).
- **Refactor scope**: ~5 файлов в `src/i18n/` + DetailPanel + 2 hooks.

**Mitigation для first-access latency:**
- Background-preload через `requestIdleCallback`: после `loadContent` завершения, если idle — пре-грузить `sys` и `commerce` в фоне. User-action будет мгновенным.

## Метрики после внедрения (2026-05-27)

| Метрика | До | После | Δ |
|---------|----|-------|---|
| Initial JS (gzip) | 112 KB | 102 KB | -10 KB |
| Max nodes chunk | 148 KB | ~83 KB (core) | -44% |
| Max tutorials chunk | 138 KB | 61 KB | -56% |
| Total chunks | 14 | 34 | +20 (parallel-friendly) |
| Build warnings | 1 | 0 | clean |
| perf-audit status | 1 Warning | 0 Crit, 0 Warn | ✅ |

## Связанные решения

- ADR-0001 (workflow schema) — определил структуру tutorials, что упростило audience-split.
- ADR-0002 (af/cap separation) — повлияло на nodes-секционирование (оба остаются в `core`).
- ADR-0005 (CSS cleanup methodology) — параллельная perf-инициатива на CSS-фронте.

## Будущие итерации

- **Phase 2 (deferred)**: per-id lazy для тяжёлых узлов внутри секций (если sys.json > 200 KB).
- **Phase 3 (deferred)**: prefetch hints в HTML для secondary sections, чтобы CDN мог упреждающе доставлять.
- **При добавлении новой локали** (es/de/...): автоматически наследует split-структуру.

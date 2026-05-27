---
name: performance-auditor
description: Аудит performance Atlas — bundle size, lazy-load opportunities, lighthouse score, render bottlenecks. Запускается еженедельно ИЛИ перед каждой большой content/feature-фазой. Защищает основное UX-качество от деградации по мере роста контента.
type: skill
category: tech-health
triggers:
  - "запусти performance-аудит"
  - "проверь bundle size"
  - "посмотри lighthouse"
  - "проверь что Atlas не тормозит"
  - "сколько весит nodes-чанк"
inputs:
  - (опц.) фокус: "bundle" | "runtime" | "lighthouse" | "all" (default: all)
  - (опц.) baseline: предыдущий отчёт для diff
outputs:
  - топ-5 weight-offender'ов с рекомендациями
  - тренд vs baseline (если есть)
  - actionable list для tasks/current.md
  - запись в `tasks/perf-audit-<date>.md`
---

# performance-auditor

## Назначение

Atlas — knowledge-tool. UX-качество = первичное конкурентное преимущество. С ростом контента (273 nodes / 35 tutorials / 64 prompts) bundle растёт неконтролируемо. Этот skill — раннее предупреждение, не пожарная команда.

## Когда вызывать

- **Еженедельно** (рутинная проверка)
- **Перед merge** большой content-фазы (>10 новых узлов / >5 новых workflow)
- **После добавления** новых dependencies в package.json
- **Когда чувствуешь** что Atlas «стал тормозить»

## Что проверяется

### 1. Bundle size (через `vite build`)

| Метрика | Threshold OK | Warning | Critical |
|---------|-------------|---------|----------|
| Initial JS bundle (gzip) | < 120 KB | 120-180 KB | > 180 KB |
| Initial JS bundle (raw) | < 400 KB | 400-600 KB | > 600 KB |
| nodes lazy chunk (gzip per locale) | < 130 KB | 130-180 KB | > 180 KB |
| tutorials lazy chunk (gzip per locale) | < 100 KB | 100-150 KB | > 150 KB |
| CSS bundle (gzip) | < 25 KB | 25-40 KB | > 40 KB |
| Vendor chunks total (gzip) | < 130 KB | 130-180 KB | > 180 KB |

### 2. Lazy-load opportunities

Сканируем:
- `src/App.jsx` — статические импорты тяжёлых компонентов (BuilderApp, WorkflowsModal, PromptLibraryModal)
- Все `import * from '...'` (намёк на barrel-exports)
- Использование `@hugeicons/*` за пределами `Icon.jsx` (правило CLAUDE.md §5)
- Любые `import 'reactflow'` вне `src/builder/`
- Crisp circular deps между data layers

### 3. Render bottlenecks (статический анализ)

- Компоненты с `useEffect` без deps array
- Компоненты, рендерящие списки > 50 items без virtualization
- `Mindmap.jsx` — pan/zoom performance — frame budget < 16ms
- `<InlineText>` — proportion of inline-link parsing per render

### 4. Lighthouse (when ready)

Требует Vercel deploy URL или local serve. Запуск через `npx lighthouse <url>`.
Метрики:
- LCP < 2.5s
- TBT < 200ms
- CLS < 0.1
- TTI < 3.5s
- Performance score >= 90

## Алгоритм работы

1. **Build:** запустить `npm run build`, парсить stdout для размеров чанков.
2. **Compare:** если есть `tasks/perf-audit-<previous>.md`, diff'нуть размеры.
3. **Scan code:** grep по правилам выше.
4. **Lighthouse (optional):** если есть URL — запустить, иначе skip.
5. **Report:** `tasks/perf-audit-<date>.md` по шаблону ниже.
6. **Update current.md:** если есть Critical — добавить в активные задачи.

## Формат отчёта

```markdown
# Performance Audit — YYYY-MM-DD

## Bundle Status
| Chunk | Size (gzip) | Threshold | Status | Δ vs <prev-date> |
|-------|------------|-----------|--------|------------------|
| index.js | 111 KB | < 120 KB | ✅ OK | +2 KB |
| nodes-ru.js | 149 KB | 130-180 | 🟡 Warning | +12 KB |
| ...

## Top weight offenders
1. **<chunk>** — что внутри + рекомендация
2. ...

## Lazy-load opportunities found
- ...

## Render bottlenecks
- ...

## Action items
🔴 Critical (block merge):
- ...
🟡 Warning (next sprint):
- ...
🟢 Nice-to-have:
- ...
```

## Companion script

Если используется регулярно — собрать `scripts/perf-audit.mjs` который автоматизирует пункты 1, 2, 3. Lighthouse оставляем manual (требует URL).

## Анти-паттерны (НЕ делать)

- НЕ рекомендовать «refactor everything» — поинтово фиксировать топ-3 offender'а
- НЕ оптимизировать преждевременно — пока размер в ✅, не трогать
- НЕ удалять content для bundle reduction (это бизнес-решение, не tech)
- НЕ предлагать смену стека (React → Svelte, Vite → Webpack) — это разрушительно

## История запусков

Каждый прогон создаёт `tasks/perf-audit-<date>.md`. Diff между ними = тренд.

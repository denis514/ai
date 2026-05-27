# ADR-0005: CSS cleanup methodology — audit-driven manual verification

**Status:** accepted
**Date:** 2026-05-27
**Tags:** architecture, performance, frontend, tooling

## Context

`src/App.css` накопил **9037 строк / 159.5 KB raw / 24.9 KB gzip** за 6 месяцев итераций. Подозрение на dead-классы есть всегда, но **массовое автоматическое удаление опасно**: template-literal паттерны (`` `prefix-${variant}` ``) делают static-grep ненадёжным.

Реальные false-positive паттерны в codebase:
- `className={\`builder-node__status--${status}\`}` → static grep НЕ найдёт `builder-node__status--running`
- `className={\`inline-link inline-link--${kind}\`}` → `inline-link--tutorial` не найдётся
- `className={\`mm-edge--depth-${n}\`}` → `mm-edge--depth-2` не найдётся
- React Flow `react-flow__*` классы — applied at runtime библиотекой

Слепое удаление по static-grep вырезает реально используемые классы → визуальные регрессии.

Альтернативы:
1. **Runtime-coverage tool** (chrome devtools coverage tab): требует ручного прокликивания всех путей → не воспроизводимо.
2. **PurgeCSS / постилонг-плагин**: false negatives те же (template literals), плюс vendor-чанки игнорируются — может удалить React Flow классы.
3. **AST-парсинг JSX** для извлечения classNames — большой проект сам по себе.
4. **Audit-driven manual verification** (выбран): автоматизированный сбор кандидатов + ручная верификация перед удалением.

## Decision

**Принят 3-stage workflow с manual gate перед удалением.**

### Stage 1: Audit (automated)

`scripts/css-audit.mjs`:
- Парсит все CSS-классы из `src/App.css` через regex `\.([\w-]+)`.
- Сканирует `src/**/*.{jsx,js,html}` (исключая CSS, чтобы не матчить selector definitions).
- Для каждого класса проверяет: `(^|[^A-Za-z0-9_-])className([^A-Za-z0-9_-]|$)` — word-boundary через **non-CSS-class-char**. Это покрывает:
  - `"className"`, `'className'`, `` `className` ``
  - `` `prefix-${var}className` `` (variable + literal mix)
  - `className suffix`, `prefix className`
- Группирует кандидатов по префиксу (`toolbar`, `builder`, `welcome`, etc).
- Output: `tasks/css-audit-<date>.md` со списком и контекстом.

### Stage 2: Manual verification

Per-bucket grep с разными паттернами:
```bash
grep -rln "<class-prefix>" src/ --include="*.jsx" --include="*.js"
grep -rn "className={\`<prefix>" src/ --include="*.jsx"
# Для каждой кандидат-группы проверяем:
# 1. Нет ли использования через template literal с переменной
# 2. Не используется ли вариант через CSS-only (e.g. .parent .candidate)
# 3. Не нужен ли для библиотеки (react-flow, react-dnd, etc.)
```

**Гейт**: удалять только класс, для которого **3 проверки выше дали 0 совпадений**.

### Stage 3: Surgical deletion

`scripts/_css-cleanup.mjs` (one-shot, удалён после выполнения):
- Принимает hardcoded set DEAD-классов из manual verification.
- Парсит CSS с brace-counting (не regex для блоков).
- Удаляет правило **только если EVERY `.className` в селекторе** в DEAD set.
- **Multi-selector rules (с запятыми) — SKIP**, выводит в "manual review" список.
- Multi-rule с `@media` — SKIP (фигурные скобки nested).

### Поддерживающие принципы:

1. **No commit без manual verification**: невозможно автоматически удалить класс без явного добавления его в DEAD set.
2. **Idempotent re-runs**: audit можно запускать после каждой контент-фазы; cleanup-скрипт one-shot.
3. **Skipped rules logged**: multi-selector skip всегда даёт список для manual review.
4. **Build-gate**: после cleanup обязателен `npm run build` без warnings.

## Results (2026-05-27 первый запуск)

| Bucket | Кандидаты (audit) | Удалены | False positives kept |
|--------|-------------------|---------|---------------------|
| toolbar | 20 | 20 | 0 |
| welcome-lesson | 10 | 9 (1 skip multi-sel) | 0 |
| profile-panel__streak | 8 | 8 | 0 |
| prompt-card | 8 | 8 | 0 |
| pg cosmos variants | 9 | 8 (1 skip multi-sel) | 0 |
| **Total verified-dead** | **55** | **53** | **0** |
| **Detected variants (KEPT)** | 75+ | 0 | All correctly preserved |

**Результат**: App.css **205.6 → 194.2 KB raw (-11.4 KB / -5.6%)**. Built CSS chunk **24.90 → 23.67 KB gzip (-1.2 KB)**. **Zero визуальных регрессий**.

Бонус: pre-existing CSS-syntax warning при минификации (`.minimized-pill--mobile, @media (...)`) обнаружен и исправлен — invalid селектор-список с `@media` внутри.

## Consequences

**Positive:**
- **Воспроизводимость**: процедура зафиксирована, может запускаться regularly (раз в 2-3 месяца).
- **Безопасность**: 3-stage gate исключает false-positive удаления.
- **Tooling stays**: `css-audit.mjs` остаётся в `scripts/` — не one-shot, можно re-run.
- **Documentation**: каждый удалённый класс имеет rationale в commit message.

**Negative / trade-offs:**
- **Manual time**: ~30-60 мин на cleanup pass (verification доминирует).
- **Не покрывает CSS-vars и mixins** — только classes.
- **Variant patterns не detected automatically**: template-literal классы остаются в audit как "unused", приходится skip-ать вручную.

## Будущие улучшения

- **css-audit v2**: автоматически детектить variant pattern (`prefix--*` в audit → ищет `\`prefix--\${` в source → flag как "variant, keep").
- **Vendor-class whitelist**: hardcoded skip для `react-flow__*`, `react-dnd__*`, etc.
- **CI-integration**: weekly cron запускает audit, открывает GitHub issue если кандидаты появились.

## Связанные решения

- ADR-0004 (bundle splitting) — параллельная perf-инициатива; CSS cleanup закрыл последний 🟡 Warning в perf-audit.
- Связан с `scripts/verify-inline-links.mjs` (#23) и `scripts/perf-audit.mjs` — common pattern «automated detection + manual gate + build-verification».

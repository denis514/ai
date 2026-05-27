# ADR-0001: Workflow schema v1 — recipe-style fields

**Status:** accepted
**Date:** 2026-05-27
**Tags:** content, business

## Context

Tutorials в Atlas были позиционированы как «обучающий материал». Audit `tasks/product-audit-2026-05-24.md` показал: за «обучение» пользователи не платят, за «готовые рецепты работы» — да. Это блокировало Pro positioning ($29/мес).

Альтернативы:
1. Переименовать tutorials → workflows только в UI labels (косметика).
2. Добавить новые поля схемы: trigger / inputs / outputs / tools / savings.
3. Полностью переписать tutorials.json под workflow-shape (breaking).

## Decision

We will add 5 optional localized fields per workflow: `trigger`, `inputs`, `outputs`, `tools`, `savings`. Render them as separate "Workflow card" in TutorialDetail between `whatItIs` and `outcomes`. Backward-compatible — workflows без этих полей продолжают рендериться как раньше.

## Consequences

**Positive:**
- Pro positioning unblocked — каждый workflow читается как «рецепт с явным ROI».
- Backward compat — нулевой риск для existing 32 workflow.
- Builder feeder: schema (`inputs/outputs/tools`) напрямую конвертится в Builder node-graph.

**Negative / trade-offs:**
- 32 workflows × 3 locales = 96 entries требуют ручного fill'а (делегировано сабагенту).
- 5 новых i18n-ключей × 3 локали = 15 строк.
- Bundle +5KB на tutorials-чанк.

**Neutral observations:**
- Имя «workflow» уже было в UI labels — рендер v1 закрепил namespace.
- `tutorials` в data layer остался — переименование БД-структуры считается излишним (нарушает CLAUDE.md §13).

## References

- Commits: `98a5b92` (v1 + pilot), `0d4d206` (scale to 29)
- Related ADRs: ADR-0002 (workflow scale to all 32)
- Discussions: `tasks/product-audit-2026-05-24.md`

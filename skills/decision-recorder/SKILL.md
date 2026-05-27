---
name: decision-recorder
description: Записывает product/architecture decisions в ADR-формате (`docs/decisions/`). Запускается явно после значимого решения ИЛИ Claude'ом автоматически когда detect decision в разговоре. Защищает project memory от потерь при компрессии контекста и смене сессий.
type: skill
category: governance
triggers:
  - "запиши решение"
  - "сохрани ADR"
  - "это решение надо зафиксировать"
  - (auto) detect decision phrasing в conversation
inputs:
  - (опц.) decision: краткое описание
  - (опц.) context: ситуация, alternatives, тradeoffs
  - (опц.) date: default сегодня
outputs:
  - `docs/decisions/NNNN-<slug>.md` (sequential numbering)
  - запись в `tasks/current.md` если decision блокирует другие задачи
  - update в CLAUDE.md `§ 15a` если decision меняет архитектурное правило
---

# decision-recorder

## Назначение

Project memory — самый недооценённый актив. Через 3 месяца забываешь **почему** сделал X, и решения переоткрываются заново. ADR-журнал — это «inverse-engineering protection».

Этот skill **не сохраняет всё подряд** — он фильтрует на «решения, которые стоит помнить через 6 месяцев».

## Что считается decision (фильтр)

✅ **Записывать:**
- Архитектурный выбор (React vs другой framework, plain CSS vs Tailwind)
- Контентная политика (workflow schema v1, какие категории, max children)
- Бизнес-направление (pivot product-first, заморозка distribution)
- Pricing-решения (когда появятся)
- Удаление чего-то существующего (deprecation, removed feature)
- Принципиальный отказ от чего-то (NOT building XYZ)

❌ **НЕ записывать:**
- Bugfix решения (это в коммите достаточно)
- Малые UX-выборы (цвет кнопки, label текст)
- Решения, обратимые за 5 минут
- Технические детали implementation'а (`useState` vs `useReducer`)

## Когда вызывать

**Явно:**
- После значимого разговора с founder'ом про направление
- После выбора между 2+ альтернативами
- После архитектурного refactoring'а

**Автоматически (Claude должен инициировать):**
- Когда видишь паттерн «мы решили X / делаем Y / отказываемся от Z»
- Когда CLAUDE.md меняется
- Когда `tasks/current.md` фокус меняется

## ADR формат

`docs/decisions/NNNN-<slug>.md`:

```markdown
# ADR-NNNN: <Short Title>

**Status:** proposed | accepted | superseded by ADR-MMMM | deprecated
**Date:** YYYY-MM-DD
**Tags:** architecture, content, business, infra, ux

## Context

What problem are we solving? What constraints? What alternatives were on the table?
(2-5 предложений, не больше.)

## Decision

We will <do X>.

(1-3 предложения, что именно решили.)

## Consequences

**Positive:**
- ...

**Negative / trade-offs:**
- ...

**Neutral observations:**
- ...

## References

- Commits: `<hash>`
- Related ADRs: ADR-NNNN
- Discussions: (file, line, или дата conversation)
```

## Нумерация

Sequential, padded to 4 digits: `0001-`, `0002-`, ..., `0042-`.
Никогда не переиспользуй удалённый номер. Если ADR deprecated — статус меняется, номер остаётся.

## Что в `docs/decisions/INDEX.md`

Автогенерируемый индекс — таблица:

| ID | Date | Title | Status | Tags |
|----|------|-------|--------|------|

Skill при добавлении нового ADR обновляет индекс.

## Примеры decisions, которые УЖЕ были (но не записаны)

Эти могут быть первыми ADR при первом запуске skill'а — back-fill:

1. **Workflow schema v1** (#20) — почему добавили trigger/inputs/outputs/tools/savings → Pro-positioning
2. **af-* vs cap-* separation** (#22) — два слоя foundation вместо одного
3. **Builder как отдельный workspace** — почему не в Atlas, а в `src/builder/`
4. **Pivot product-first** (2026-05-27) — заморозка distribution
5. **Pre-commit hook без husky** (#23) — почему native git hooks
6. **Inline-links syntax `[[type:id|label]]`** — почему этот формат
7. **3 локали (RU/EN/FI)** — почему именно эти
8. **Plain CSS вместо Tailwind/CSS-in-JS** — почему

## Анти-паттерны

- ❌ Записывать сразу 50 historical decisions — back-fill постепенно, по 3-5 в неделю
- ❌ Длинные ADR (> 1 страница) — это значит решение ещё не сформулировано
- ❌ Записывать «может быть» decisions — только accepted
- ❌ Менять старые ADR — для пересмотра делать новый со статусом `supersedes ADR-NNNN`

## Output check

Перед записью skill убеждается:
- ✅ Decision falls into "write" filter (не bugfix, не trivial)
- ✅ Context даёт понять кому через 6 месяцев почему так сделали
- ✅ Trade-offs честные (есть downsides)
- ✅ References ведут на git commits / files

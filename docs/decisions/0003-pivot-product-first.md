# ADR-0003: Pivot — product-first focus, freeze distribution processes

**Status:** accepted
**Date:** 2026-05-27
**Tags:** business, strategy

## Context

К моменту решения существовала большая distribution-инфраструктура:
- `tasks/interviews/` — Phase 1 validation playbook (target lists, search URLs, message templates, interview questions)
- `tasks/linkedin-outreach-nordic.md` — Nordic LinkedIn campaign plan
- 7 strategy-документов в `docs/business-strategy/`
- 4 skill-агента под distribution (growth-strategist, monetization-architect, competitive-intelligence, proposal-generator)

При этом продукт (Atlas content + Builder MVP) ещё не готов к публичному запуску. Distribution-усилия тратили внимание founder'а на канал, который не имеет чего продавать.

Альтернативы:
1. Параллельно дорабатывать продукт + запускать interviews + растить content в LinkedIn (распыление, мало прогресса в каждой).
2. Заморозить distribution полностью, focus 100% на продукт.
3. Сохранить minimal distribution (только passive — SEO content) — но это всё равно отвлечение.

## Decision

We will freeze all distribution processes completely:
- Удалить операционные artifacts (`tasks/interviews/`, `tasks/linkedin-outreach-nordic.md`).
- Сохранить strategy-документы в `docs/business-strategy/` как research (history, не processes).
- Skill-агенты (growth-strategist, proposal-generator, competitive-intelligence, monetization-architect) перевести в dormant — physical файлы остаются, но не вызываются.
- Focus 100% на product: Atlas content depth + Builder MVP→Beta path + technical health.

## Consequences

**Positive:**
- Меньше cognitive overhead для founder'а — один трек, не три.
- Бюджет времени идёт в actual product velocity.
- Когда distribution возобновится — продукт будет реальным предложением, не маркетинговым обещанием.

**Negative / trade-offs:**
- Нет market feedback в реальном времени — продукт может уйти в неправильном направлении.
- Митigation: founder сам активный пользователь Atlas, и validation Phase 1 уже дала baseline ICP (Product/Ops leads).
- Time-to-revenue откладывается на 2-3 месяца.

**Neutral observations:**
- Решение обратимо за час: git restore удалённых файлов + un-freeze skill'ов.
- Условие возврата зафиксировано: Builder Beta ready OR Atlas Pro has 5+ case-кандидатов от existing users.

## References

- Commits: `2183d98` (pivot commit)
- Related ADRs: —
- Discussions: conversation 2026-05-27, files `docs/business-strategy/PIVOT-PRODUCT-FIRST.md`, `tasks/current.md` блок «🎯 Текущий фокус»

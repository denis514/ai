# UX-аудит — каденция и процесс

Периодический аудит опыта продукта силами UX/product-экспертов. Цель — ловить
трение и предлагать улучшения **регулярно**, а не «когда сломалось».

## Как это работает
1. **Расписание.** GitHub Action `ux-audit.yml` (1-й и 3-й понедельник месяца)
   запускает `scripts/ux-audit-review.mjs` → создаёт агенду
   `docs/ux-audit/ux-audit-{YYYY-MM-DD}.md` (скоуп, что менялось в UI, чек-лист,
   пустые секции находок и топ-5 предложений). Можно дёрнуть вручную
   (workflow_dispatch) или локально: `node scripts/ux-audit-review.mjs`.
2. **Аудит.** Claude по скиллу `skills/ux-audit/` заполняет агенду: прогоняет
   `heuristic-evaluator`, `product-experience-auditor`, `ux-interaction-tester`,
   `accessibility-review`, проходит ключевые задачи пользователя, снимает
   скриншоты ключевых экранов (десктоп + мобайл, светлая/тёмная).
3. **Приоритеты.** Выносится **топ-5** предложений по impact × effort
   (high-impact / low-effort вперёд), а не список из 50 пунктов.
4. **Внедрение.** Принятые правки идут обычным циклом (skill → `quality-gate` /
   `mobile-gate`). Что внедрили — фиксируется в журнале следующего аудита.

## Принципы
- Конкретика, обоснованная эвристикой/задачей/данными — не вкусовщина.
- Не нарушать позиционирование (`docs/strategy/01-positioning.md`) и
  правила обучения (`docs/learning-design-rules.md`).
- Решения, влияющие на стратегию, дублировать в
  `docs/business-strategy/07-decisions.md`.

## Файлы
- `skills/ux-audit/` — оркестратор.
- `skills/heuristic-evaluator/`, `skills/product-experience-auditor/` — эксперты.
- `scripts/ux-audit-review.mjs`, `.github/workflows/ux-audit.yml` — каденция.
- `docs/ux-audit/ux-audit-*.md` — отчёты по датам.

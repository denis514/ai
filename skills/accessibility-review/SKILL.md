---
name: accessibility-review
description: Базовый WCAG 2.1 AA-ревью UI слоя (mindmap, modals, toolbar, detail panel) — контраст, размер touch-таргетов, focus state, клавиатурная навигация, semantic HTML. Не основной фокус проекта, но обязательная гигиена перед merge заметных UI-правок.
type: skill
category: frontend
triggers:
  - "доступность / a11y"
  - "контраст / contrast"
  - "клавиатурная навигация"
  - "WCAG"
  - "screen reader"
inputs:
  - изменённый компонент / страница
outputs:
  - чек-лист с пройденными и провалившимися пунктами
  - конкретные правки (CSS / разметка / aria-*)
---

# accessibility-review

## Назначение
Лёгкая, но обязательная проверка UI-изменений на критичные проблемы доступности.
Не блокирует merge сама по себе, но фиксирует риски.

## Чек-лист
- [ ] **Контраст** текста ≥ 4.5:1 (≥ 3:1 для крупного).
- [ ] **Touch target** ≥ 44×44 px (mobile-first).
- [ ] **Focus state** виден у всех кликабельных элементов.
- [ ] **Клавиатурная навигация:** все интерактивные элементы достижимы Tab.
- [ ] **Esc** закрывает модальные окна (`CoursesModal`, `TutorialModal`).
- [ ] **aria-label** на иконочных кнопках без текста.
- [ ] **role / aria-expanded** на узлах mindmap, у которых есть `+ −`.
- [ ] **Цвет ≠ единственный носитель смысла** (категории дублированы текстом/иконкой).
- [ ] **Анимация / pulse** уважает `prefers-reduced-motion`.
- [ ] **Семантика:** кнопки = `<button>`, не `<div onClick>`.

## Workflow
1. **Просмотри diff.** Что именно изменилось в UI.
2. **Прогон по чек-листу.** Каждый пункт — pass / fail / n/a.
3. **Зафиксируй fails.** Конкретный CSS / разметочный фикс.
4. **Mobile spot-check.** Touch targets на 360-px ширине.

## Rules
- Не вводить новые библиотеки a11y (axe, react-aria) ради одного ревью.
- Лучше 5 минимальных правок, чем большой redesign.
- Если изменения не касаются UI — возвращай `not applicable` без шума.

## Output format
```markdown
## A11y review
- ✅ contrast
- ❌ focus state on `.mindmap-node` → добавить `:focus-visible { outline: 2px solid ... }`
- ✅ keyboard nav
- ⚠️ aria-expanded отсутствует на `+ −` (low priority)
```

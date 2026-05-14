---
name: mindmap-expander
description: Безопасно добавляет, изменяет или удаляет узлы в src/data/mindmapData.js — соблюдает схему (id/title/icon/category/details/children), проверяет дубли, валидирует синтаксис JS после правки. Основной skill для расширения knowledge base.
type: skill
category: content
triggers:
  - "добавь узел"
  - "расширь раздел"
  - "новая ветка в mindmap"
  - "обнови описание узла"
  - "удалить устаревший узел"
inputs:
  - название и тема узла (или список)
  - целевой родитель (id) — если известен; иначе вызвать `knowledge-architect`
outputs:
  - точечная правка `src/data/mindmapData.js`
  - подтверждение валидности (id уникален, схема полна, синтаксис ок)
---

# mindmap-expander

## Назначение
Единственный «правильный» способ модифицировать `mindmapData.js`.
Гарантирует консистентность схемы и отсутствие поломок layout-а.

## Pre-flight checklist
- [ ] Знаю `parent_id`. Если нет → `knowledge-architect`.
- [ ] Знаю `category` (одна из 5).
- [ ] `id` уникален (grep по файлу).
- [ ] Заполнены все 6 полей `details` (what / why / when / impact / example / mistakes).
- [ ] `icon` — семантическое kebab-case имя, существующее в реестре
      `src/components/Icon.jsx` (НЕ эмодзи). Проверить через `grep "<name>:" src/components/Icon.jsx`.
- [ ] Если иконки нет в реестре — добавить её в `Icon.jsx` ОТДЕЛЬНЫМ шагом:
      импорт из `@hugeicons/core-free-icons` + запись в `REGISTRY`.
- [ ] Контент на русском, id — латиница.

## Workflow
1. **Locate parent.** Найди объект родителя в файле.
2. **Insert child.** Добавь в массив `children` нового потомка с полной схемой.
3. **Use helper `D(...)`.** В файле определён хелпер `D(what, why, when, impact, example, mistakes)`.
4. **Validate.** Прочитай файл после правки, убедись что JS валиден.
5. **Test mentally.** Запусти в голове `useMindmapLayout` — нет ли overflow / коллизий.
6. **Запиши в `tasks/current.md`** или `tasks/backlog.md`, если узел сырой.

## Edit / delete
- **Edit:** правь только нужные поля, не переписывай объект целиком.
- **Delete:** не удаляй молча; помечай в `tasks/backlog.md` со статусом `deprecate`,
  затем убирай отдельным шагом с обоснованием.

## Rules
- Не превышай **глубину 4** (root → раздел → подраздел → лист).
- Не превышай **ширину 12** у одного родителя — иначе разбей.
- Не используй `id` повторно даже после удаления.
- Не смешивай категории в одной ветке без явной причины.

## Output format
```markdown
**Что сделано:** added `b-tooluse` to `basics`
**Категория:** основы
**Risks:** none / depth / overflow / duplicate
**Next:** проверить через `npm run dev`
```

# Prompt: add-new-topic

**Назначение:** добавить новый узел в mindmap по теме, которой пока нет.

**Inputs:**
- `{{topic}}` — короткое название темы
- `{{context}}` — 1-3 предложения, что это
- `{{preferred_parent_id}}` (опционально)

**Outputs:**
- Кандидат на узел по схеме mindmap
- Предложенный `parent_id`, `category`, `id`
- Точечная правка `src/data/mindmapData.js`

---

# Роль
Ты — Senior Knowledge Architect проекта 105 Atlas.

# Контекст
Источник правды для узлов — `src/data/mindmapData.js`. Схема каждого узла:
`id, title, icon, category, details: { what, why, when, impact, example, mistakes }, children`.
Категории: `основы | настройка | автоматизация | промпты | агенты`.

Тема: **{{topic}}**
Описание: {{context}}
Предложенный родитель: {{preferred_parent_id}}

# Задача
Подготовь и внеси один новый узел в `mindmapData.js`:
1. Подбери `parent_id` (если не задан) — самого близкого по семантике.
2. Назначь `category`.
3. Сгенерируй уникальный `id` (kebab-case, латиница).
4. Заполни `title`, `icon`, и все 6 полей `details`.
5. Сделай точечную правку файла.

# Ограничения
- Не создавай новый родительский узел, если можно положить в существующий.
- Не дублируй существующие узлы (проверь grep).
- Все 6 полей `details` обязательны.
- `title` ≤ 30 символов, `icon` — один эмодзи.
- Контент — на русском, `id` — латиница.

# Формат вывода
```yaml
proposal:
  parent_id: ...
  new_node:
    id: ...
    title: ...
    icon: ...
    category: ...
    details:
      what: ...
      why: ...
      when: ...
      impact: ...
      example: ...
      mistakes: ...
file_edit: "src/data/mindmapData.js — добавлено в children узла <parent_id>"
```

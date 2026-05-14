# Prompt: create-learning-node

**Назначение:** создать обучающий узел (микро-урок) — узел mindmap + расширенный
блок в `src/data/tutorials.js`.

**Inputs:**
- `{{topic}}` — тема урока
- `{{prerequisites}}` — что пользователь должен знать заранее

**Outputs:**
- Узел в `mindmapData.js` по 6-вопросной схеме
- Соответствующая запись в `tutorials.js`: цели, шаги, проверка усвоения

---

# Роль
Ты — Knowledge Architect и Learning Designer.

# Контекст
Микро-урок состоит из двух частей:
1. **Узел mindmap** (`mindmapData.js`) — атомарное знание.
2. **Tutorial entry** (`tutorials.js`) — пошаговый разбор, связанный через тот же `id`.

Тема: **{{topic}}**
Предусловия: {{prerequisites}}

# Задача
1. Сделай узел по 6-вопросной схеме (используй `prompts/add-new-topic.md` как образец).
2. Сделай tutorial entry со структурой:
   - `id` (тот же, что у узла)
   - `title`
   - `goal` — что пользователь сможет делать после
   - `steps[]` — 3-7 шагов, каждый: instruction + ожидаемый результат
   - `checkpoint` — мини-задание для самопроверки
3. Не дублируй текст между узлом и tutorial: узел — атомарное знание, tutorial — практика.

# Ограничения
- Шагов в tutorial — не больше 7.
- Каждый шаг — одно действие.
- Checkpoint — проверяемый, не «подумайте об этом».
- Tutorial не должен «учить теории» повторно — теория в узле.

# Формат вывода
```yaml
node: <см. add-new-topic.md>
tutorial:
  id: ...
  title: ...
  goal: ...
  steps:
    - instruction: ...
      expected: ...
  checkpoint: ...
```

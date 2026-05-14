# Prompt: expand-mcp-section

**Назначение:** прицельное расширение раздела про MCP в mindmap — серверы,
транспорты, паттерны проектирования, безопасность.

**Inputs:**
- `{{focus}}` — `servers | clients | transport | tools | resources | security | patterns | all`
- `{{depth}}` — `survey | deep`

**Outputs:**
- Список кандидат-узлов для раздела MCP
- Конкретные правки `mindmapData.js`

---

# Роль
Ты — MCP Specialist, расширяющий раздел `настройка / MCP` в mindmap.

# Контекст
Model Context Protocol — стандарт связи Claude с внешними системами через
**серверы**, выставляющие **tools / resources / prompts**. Транспорты:
**stdio** (локальные) и **HTTP/SSE** (удалённые).

Существующий раздел MCP — в `src/data/mindmapData.js`.
Фокус: **{{focus}}**
Глубина: {{depth}}

# Задача
1. Проведи аудит текущего раздела MCP (найди по тегу `mcp` или категории `настройка`).
2. Определи пробелы по фокусу:
   - `servers` — известные серверы (filesystem, github, slack, jira, atlassian, linear, ...).
   - `clients` — Claude Code, claude.ai (Apps), кастомные.
   - `transport` — когда stdio, когда HTTP/SSE.
   - `tools` — design patterns (минимальная поверхность, наименование, schema).
   - `resources` — read-only данные с URI.
   - `security` — auth, scoping, destructive-confirm.
   - `patterns` — composition, namespacing, server discovery.
3. Подготовь 3-7 кандидатов в узлы по 6-вопросной схеме.
4. Внеси правки в `mindmapData.js`.

# Ограничения
- Не дублируй уже существующие узлы.
- Не уходить глубже 4 уровней (root → настройка → MCP → подраздел → лист).
- Не выставлять конкретные ENV / токены / секреты в `example`.
- Не обещать функциональность, которой нет в текущей спеке MCP.

# Формат вывода
```yaml
audit:
  existing_ids: [...]
  gaps: [...]
new_nodes:
  - <см. add-new-topic.md>
file_edit: "src/data/mindmapData.js — добавлено N узлов в ветку <id>"
```

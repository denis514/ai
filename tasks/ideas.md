# Ideas

Сырые гипотезы. Минимум фильтрации, чтобы ничего не терять.
Раз в N итераций — promote в `backlog.md` или удаление.

## Контент / mindmap
- Узел «Prompt caching» (как работает, когда экономит, антипаттерны).
- Узел «Tool use / function calling» — отделить от Skills и MCP.
- Узел «Computer use» (если фича актуальна) — границы, риски.
- Узел «Memory» в Claude — что это, чем отличается от Projects.
- Узел «Citation / references» — когда модель ссылается на источники.
- Узел «Vision» — работа с изображениями.
- Расширить «Идеи агентов» под конкретные ниши: research, code review,
  customer support, content audit.

## AI infrastructure
- Skill `verify-mindmap-integrity` — линт по схеме, прогонять перед коммитом.
- Skill `news-watcher` — отслеживание релизов Anthropic, предложение узлов.
- Prompt `generate-tutorial-from-node` — авто-черновик tutorial по узлу.
- Prompt `cross-reference` — найти связанные узлы по семантике.

## UI (вторично)
- Кнопка «show only my path» — фильтр по последовательности узлов.
- Локальные закладки в mindmap (localStorage, без backend).
- Темная тема (опционально, если не размывает фокус с контента).

## Эксперименты
- Идея: «AI Companion mode» — кнопка «спросить Claude об этом узле»,
  передающая контекст узла в чат.
- Идея: автогенерация графа связей (помимо радиального дерева) —
  показать, какие узлы цитируют друг друга.

---

## Новые курсы — аудит vs Anthropic Academy (2026-05-19)

### Источник: https://anthropic.skilljar.com

Anthropic Academy предлагает 18 курсов в 4 категориях. Сопоставление с Atlas:

| Курс Anthropic | Статус в Atlas | Приоритет |
|----------------|----------------|-----------|
| Claude 101 | ✅ покрыт (intro + basics) | — |
| Introduction to Claude Cowork | ✅ покрыт (claude-cowork) | — |
| AI Capabilities and Limitations | ✅ покрыт (capabilities + ai-limitations) | — |
| Claude Code 101 | ✅ покрыт (claude-code) | — |
| Claude Code in Action | ⚠️ частично (нет практического проекта) | P2 |
| Building with the Claude API | ✅ покрыт (api-basics) | — |
| Introduction to MCP | ✅ покрыт (mcp) | — |
| MCP: Advanced Topics | ❌ отсутствует | P2 |
| Introduction to agent skills | ✅ покрыт (skills) | — |
| Introduction to subagents | ✅ покрыт (subagents) | — |
| Claude with Amazon Bedrock | ❌ отсутствует | P3 |
| Claude with Google Cloud Vertex AI | ❌ отсутствует | P3 |
| AI Fluency: Framework & Foundations | ❌ отсутствует | **P1** |
| AI Fluency for educators | ❌ отсутствует | **P1** |
| AI Fluency for Small Businesses | ⚠️ частично (scenarios) | **P1** |
| AI Fluency for nonprofits | ❌ отсутствует | P3 |
| AI Fluency for students | ❌ отсутствует | P2 |
| Teaching AI Fluency | ❌ отсутствует | P3 |

### Вывод по аудиту

**Главный разрыв:** аудитория `business` почти пуста — 1 курс из 26.
Anthropic Academy делает ставку на AI Fluency (6 курсов для разных аудиторий).

**Нет вообще в Atlas:** educators-трек, AI Fluency framework, cloud-интеграции.

→ Promoted в backlog. См. `tasks/backlog.md#новые-курсы`.

## Заметки
- Не пытаемся реализовать всё. Это пул для разговора.
- Идея → backlog: должна пройти через `knowledge-architect` или
  `ai-system-designer` (для архитектурных).

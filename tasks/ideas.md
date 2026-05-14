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

## Заметки
- Не пытаемся реализовать всё. Это пул для разговора.
- Идея → backlog: должна пройти через `knowledge-architect` или
  `ai-system-designer` (для архитектурных).

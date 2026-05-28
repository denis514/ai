# 11 — Дорожная карта каталога узлов

> Какие узлы есть, что добавляем и в каком порядке. Каждый узел заземлён на
> концепт Atlas (привязка «Подробнее»). Модель связей — см. `10-node-capability-model.md`.

## Принципы

- Каждый узел опирается на существующий узел Atlas (`atlasAnchor`).
- Добавление узла = декларация в `NODE_DEFS` + порты (если новый kind) + i18n×3 +
  группа палитры. Проверяется `npm run lint:builder`. Процедура — скилл
  `builder-node-architect`.
- Узел может быть «виден, но исполняется позже»: visible ≠ executable.

## Batch A — реализовано (2026-05-28)

**Агенты (+4):** `agent-code` (ag-code), `agent-designer` (ag-designer),
`agent-pm` (ag-pm), `agent-content` (sc-content).
**Инструменты (+4):** `tool-code-exec` (cap-code-exec), `tool-computer`
(cap-computer), `tool-citations` (cap-citations), `tool-mcp` (mcp).
**Выход:** `output-telegram` (роль telegram; бэкенд доставки готов).

Работают в текущей модели: агенты исполняются как роли (системный промпт),
инструменты прикрепляются к агенту (ATTACH). Реальная работа инструментов —
Фаза 4.

## Batch B — нужен бэкенд (Фаза 4 / B-3)

**Триггеры:** `trigger-webhook` (sys-event-driven), `trigger-schedule`
(sys-batch-vs-realtime). Нужен серверный приём событий/cron.
**Выходы:** `output-email`, `output-webhook` (sys-api-patterns). Нужны
серверные интеграции доставки.
**Категория «логика/контроль» (новый kind `logic`):** `logic-gate`
(sys-quality-gates), `logic-branch` (sys-branching-logic), `logic-approval`
(sys-approval-flows), `logic-loop` (sys-loop-patterns).
- Требует: порты для `logic` в `KIND_PORTS`, исполнение в edge-функции,
  пересмотр правила «без циклов» для `logic-loop` (контролируемый цикл с лимитом
  итераций, не свободная петля).

## Фаза 4 — исполнение (B-3)

Согласовать edge-функцию с моделью:
- ATTACH-инструменты → передавать агенту как реальные tool-defs (function calling).
- Реальные интеграции: web search, files, code execution, computer use, MCP.
- Триггеры/выходы Batch B → серверные обработчики.
- Логика → ветвление/циклы/гейты в раннере.

## Идеи на потом (не зафиксировано)

- Под-workflow как узел (вложенность).
- Пользовательские узлы (свой системный промпт = сохранить как тип).
- Узел-источник данных (RAG / vector store) → sys-rag-architecture.

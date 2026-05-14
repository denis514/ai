---
name: automation-architect
description: Проектирует автоматизации поверх Claude — расписания (cron / scheduled tasks), хуки в Claude Code, webhook-триггеры, фоновые агенты, повторяющиеся workflows. Используется при работе с категорией "автоматизация" в mindmap.
type: skill
category: workflows
triggers:
  - "автоматизировать рутину"
  - "по расписанию"
  - "hook / webhook"
  - "background agent"
  - "watch / triggered task"
inputs:
  - рутина / повторяющаяся задача
  - частота / триггер
outputs:
  - схема автоматизации (trigger → action → notify)
  - что используется (Claude Code hooks, scheduled tasks, MCP, внешний планировщик)
  - rollback / safety
---

# automation-architect

## Назначение
Превращает «я каждый день делаю X» в работающую автоматизацию,
минимизируя число движущихся частей.

## Trigger taxonomy
- **time-based** — cron / scheduled task (раз в N часов, по дате)
- **event-based** — webhook от внешней системы
- **file-based** — изменение файла / коммит / PR
- **manual** — кнопка / slash-команда / chat-trigger

## Action taxonomy
- **read-only** — собрать данные, отчитаться (низкий риск)
- **mutating** — изменить файл / отправить сообщение / закрыть тикет (требует confirm)
- **destructive** — удалить / overwrite (запрещено без явного approval-а в каждой итерации)

## Workflow
1. **Frequency.** Реально ли это нужно каждый день? Если раз в месяц — может, не стоит.
2. **Trigger choice.** Минимум абстракций. Cron > webhook > file-watch.
3. **Action class.** read-only / mutating / destructive.
4. **Notification.** Куда приходит результат? (chat, email, log).
5. **Failure mode.** Что если шаг упал — retry, alert, silent?
6. **Approval gates.** На каждый mutating шаг — кто и как подтверждает.

## Rules
- Никаких destructive шагов без явного approval-а.
- Любая автоматизация имеет «kill switch» — способ отключить её одним действием.
- Логирование результата обязательно (хотя бы в файл / в чат).
- Не плодить таски, если есть существующая (проверь `mcp__scheduled-tasks__list_scheduled_tasks`).

## Output format
```yaml
automation:
  name: "..."
  trigger: cron("0 9 * * *") | webhook | file_change | manual
  action_class: read_only | mutating | destructive
  steps: [...]
  notify: "..."
  on_failure: retry | alert | silent
  kill_switch: "..."
```

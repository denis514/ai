---
name: ai-workflow-builder
description: Собирает многошаговые AI-сценарии — последовательность действий Claude (или связки Claude + MCP + Claude Code + автоматизация) с явными inputs / outputs / failure modes. Результат пригоден для записи в mindmap (категория "агенты") и в prompts/.
type: skill
category: workflows
triggers:
  - "придумай агентный сценарий"
  - "собери workflow"
  - "автоматизация для ..."
  - "scenario / playbook"
  - "agentic flow"
inputs:
  - цель сценария (что должно случиться в результате)
  - доступные инструменты (Claude Code? MCP? какие?)
outputs:
  - пронумерованные шаги
  - роль / инструмент на каждом шаге
  - триггер запуска и условие остановки
  - обработка ошибок
---

# ai-workflow-builder

## Назначение
Превращает абстрактную идею «было бы круто, если бы Claude делал X»
в конкретный воспроизводимый workflow.

## Шаблон workflow
```yaml
name: "<глагольное имя в kebab-case>"
goal: "одно предложение"
trigger: cron | manual | webhook | file_change
stop_condition: "когда сценарий считается завершённым"
steps:
  - n: 1
    actor: claude | claude-code | mcp:<name> | human
    action: "что делает"
    input: "что приходит"
    output: "что отдаёт"
  - n: 2
    ...
failure_modes:
  - signal: "..."
    mitigation: "..."
out_of_scope:
  - "..."
```

## Workflow построения
1. **Goal in one line.** Если не получается — сценарий слишком широкий.
2. **Trigger and stop.** Что запускает, что останавливает.
3. **Decompose.** Разбей на 3-7 шагов. Больше — декомпозируй на под-workflow.
4. **Assign actor.** Каждый шаг получает одного исполнителя (Claude / Code / MCP / human).
5. **Define IO.** На каждом шаге — что вход, что выход.
6. **Failure modes.** Минимум 2 — сеть, неполный контекст, refusal.
7. **Connect to mindmap.** Если сценарий ценный — оформи узлом в категории `агенты`.

## Rules
- Шагов больше 7 — переусложнено.
- На каждом шаге ровно один actor.
- Без явных inputs / outputs шаг неприемлем.
- Не использовать MCP-сервер, если задачу решает чистый Claude.

## Output format
- YAML по шаблону выше.
- 1 абзац обоснования: почему именно эти примитивы.

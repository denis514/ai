---
name: ai-system-designer
description: Проектирует AI-системы и архитектуру AI-решений на основе экосистемы Claude — выбирает правильную комбинацию (Project / Skill / MCP / Agent / Claude Code / API), описывает поток данных, риски и точки расширения. Используется при ответе на вопросы "как построить X с Claude".
type: skill
category: architecture
triggers:
  - "как построить AI-систему для ..."
  - "архитектура AI workflow"
  - "выбрать инструмент Claude под задачу"
  - "Project vs Skill vs Agent"
  - "спроектируй AI-решение"
inputs:
  - описание задачи / use case
  - ограничения (бюджет, latency, приватность, объём данных)
outputs:
  - компонентная схема (что использовать и зачем)
  - data flow (откуда → куда)
  - failure modes и mitigations
  - оценка стоимости/сложности
---

# ai-system-designer

## Назначение
Отвечает на вопрос «**как** собрать решение для X из инструментов Claude».
Не пишет код — пишет архитектуру и обоснование выбора.

## Decision matrix
| Сигнал                                  | Рекомендуемый инструмент         |
|------------------------------------------|----------------------------------|
| Повторяющийся контекст / база знаний     | **Projects** + Custom Instructions |
| Воспроизводимая процедура / playbook     | **Skill** (SKILL.md)             |
| Внешние данные / API / системы           | **MCP server**                   |
| Код в репозитории, рефакторинг, ревью    | **Claude Code**                  |
| Автономная многошаговая задача           | **Sub-agent** в Claude Code      |
| Программный доступ, embed в продукт      | **Anthropic API**                |
| Визуальный артефакт «здесь и сейчас»     | **Artifact** в claude.ai         |

## Workflow
1. **Frame the goal.** Сформулируй желаемый результат в 1 предложении.
2. **Map the data.** Откуда приходит контекст, куда уходит результат.
3. **Pick primitives.** Выбери 1-3 компонента из матрицы.
4. **Sketch the flow.** Нарисуй data flow: triggers → context → tools → output.
5. **List failure modes.** Что сломается? Как обнаружишь?
6. **Cost & scope.** Оцени порядок токенов и время реализации.

## Rules
- Никогда не предлагай «всё сразу» — минимальный набор примитивов.
- Если можно обойтись Project — не предлагай Skill или MCP.
- Если решение требует > 3 компонентов — это, скорее всего, неверная декомпозиция.
- Обязательно укажи **что НЕ делать** (антипаттерны для этого случая).

## Output format
```markdown
## Цель
…

## Архитектура
- **Primary:** Project / Skill / MCP / Agent / API / Code
- **Supporting:** …

## Data flow
trigger → context → tools → output

## Failure modes
- … → mitigation: …

## Out of scope
- …
```

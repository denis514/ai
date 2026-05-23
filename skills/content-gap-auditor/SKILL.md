---
name: content-gap-auditor
description: Сравнивает текущий контент 105 Atlas с реальным набором фич/возможностей Claude и выдаёт список пробелов с приоритетами. Используется регулярно (раз в месяц) или после релизов Anthropic, чтобы Atlas не отставал от экосистемы.
type: skill
category: content
triggers:
  - "что у нас отсутствует"
  - "проведи аудит контента"
  - "чего не хватает в Atlas"
  - "сравни Atlas с фичами Claude"
  - "найди пробелы"
inputs:
  - (опц.) фокус: "models" | "platforms" | "limits" | "features" | "all"
  - (опц.) уровень глубины аудита: quick / thorough
outputs:
  - список отсутствующих тем
  - приоритизация (critical / important / nice-to-have)
  - рекомендация: добавить узел / расширить раздел / создать новый раздел
---

# content-gap-auditor

## Назначение
Поддерживает Atlas в актуальном состоянии. Без регулярного аудита mindmap
устаревает за 3-6 месяцев — Anthropic выкатывает фичи быстрее.

## Категории проверки

### 1. Models (модели и их свойства)
- Перечень моделей: Opus, Sonnet, Haiku (текущие версии)
- Контекстные окна каждой
- Сильные/слабые стороны
- Цена / скорость
- Доступность по тарифам

### 2. Platforms (где использовать Claude)
- claude.ai (web)
- Mobile apps (iOS / Android)
- Desktop apps (Mac / Windows)
- Claude Code (CLI)
- VS Code / JetBrains extensions
- Anthropic API
- AWS Bedrock / Vertex AI

### 3. Limits & Plans (тарифы и ограничения)
- Free / Pro / Team / Enterprise — что включает каждый
- 5-часовые лимиты на Pro
- Недельные лимиты
- Доступность моделей по плану («Sonnet only на Free» и т.п.)
- Rate limits API
- Когда лимиты сбрасываются

### 4. Features (технические возможности)
- Projects (claude.ai)
- Artifacts
- Skills (на стороне claude.ai)
- Sub-agents (Claude Code)
- MCP (Model Context Protocol)
- Vision / Image understanding
- Web search
- Files / Documents (PDF, .docx и т.п.)
- Memory / Long-term memory
- Computer use
- Prompt caching
- Tool use / function calling
- Code execution / sandbox
- Citations / источники

### 5. Privacy & Trust
- Что Anthropic хранит из переписки
- Train-on-data settings
- Region / data residency
- GDPR compliance

### 6. Ecosystem & Community
- Anthropic docs (где основная документация)
- Где задать вопрос (community / support)
- Changelog / release notes
- Cookbook / examples

## Workflow

1. **Скан текущего mindmap** (`src/data/mindmapData.js`) — выпиши все titles.
2. **Сравни** с шестью категориями выше.
3. **Категоризируй пробелы**:
   - `critical` — пользователь сразу спотыкается (например, нет узла «лимиты Free»)
   - `important` — теряется ценность Claude (например, нет «Vision»)
   - `nice-to-have` — углубление (например, «Citations»)
4. **Для каждого пробела** дай рекомендацию:
   - Куда положить (parent_id)
   - Какая категория
   - Уровень (beginner / intermediate / advanced)
   - Примерное содержание `details.what`

## Rules

- Не выдумывай фичи. Если не уверен, что Claude умеет X — пиши «требует проверки».
- Не дублируй существующие узлы — проверь grep по title перед предложением.
- Не предлагай узлы для каждой отдельной модели/фичи без явного смысла — группируй.
- Учитывай эволюцию: «прошлые поколения моделей» — это **deprecate-watch**, не новые узлы.
- Лимиты и цены — **deprecate-watch** обязательно, пишутся с пометкой даты.

## Output format

```yaml
audit_summary:
  total_nodes_today: 84
  estimated_missing: 25
  oldest_drift: "models — Opus 4.5 → 4.7 не отражено"

gaps:
  critical:
    - topic: "Что такое Claude (определение)"
      reason: "Нет фундаментального определения, новички теряются"
      parent_id: "basics"
      category: "основы"
      level: "beginner"
    - topic: "Тарифные планы"
      reason: "Пользователь не понимает что в Free / Pro / Team"
      parent_id: NEW_TOP_LEVEL  # предлагается новая ветка
      category: "основы"
      level: "beginner"

  important:
    - topic: "Vision / работа с изображениями"
      ...

  nice_to_have:
    - topic: "Citations"
      ...

recommendations:
  - "Создать новую ветку «Платформа и доступ» (планы, лимиты, интерфейсы)"
  - "Расширить «Основы» нодами что-такое-Claude / Anthropic / FAQ"
  - "Создать раздел «Возможности» — vision / files / web search / computer use"
```

---
name: claude-expert
description: Авторитетный источник знаний о самом Claude — модели (Opus/Sonnet/Haiku), контекстное окно, system prompt, constitutional AI, разница API/claude.ai/Claude Code, лимиты, ценообразование. Используется когда нужно "как Claude устроен" или проверить факт перед записью в mindmap.
type: skill
category: knowledge
triggers:
  - "как устроен Claude"
  - "Opus vs Sonnet vs Haiku"
  - "контекст / context window"
  - "лимиты Claude"
  - "разница API и claude.ai"
  - "constitutional AI"
inputs:
  - конкретный вопрос о Claude
outputs:
  - фактический ответ
  - источник (если применимо)
  - предупреждение, если знание может быть устаревшим
---

# claude-expert

## Назначение
Гарантирует фактологическую точность контента про Claude в mindmap.
Любой узел категории `основы` или упоминание модели проходит через этот skill.

## Зона ответственности
- семейство моделей Claude (Opus, Sonnet, Haiku) и их позиционирование
- контекстное окно, токенизация, prompt caching
- system prompt, message roles, tool use
- Constitutional AI, safety, refusals
- claude.ai vs Anthropic API vs Claude Code vs Claude in Apps
- Projects, Artifacts, Skills (на стороне claude.ai)
- лимиты, тарификация (без точных цифр, которые часто меняются)

## Workflow
1. **Identify scope.** Это про модель / интерфейс / тарификацию?
2. **State the fact.** Один абзац, без воды.
3. **Flag volatility.** Если знание про цены/лимиты/новые фичи — отметь
   «может устареть, проверь в docs.anthropic.com».
4. **Add a hook.** Если факт идёт в mindmap-узел — сразу предложи поля
   `why / when / impact / example / mistakes`.

## Rules
- Никаких выдуманных бенчмарков и цифр.
- Если не уверен — пиши «требует проверки» и предлагай источник.
- Не путать **Skills** (claude.ai) и **sub-agents** (Claude Code) — это разные сущности.
- Не путать **Projects** (claude.ai) и **CLAUDE.md** (Claude Code) — разные слои контекста.

## Output format
```markdown
**Факт:** …
**Контекст:** …
**Источник / verify:** …
**Mindmap hook (если нужно):** what / why / when / impact / example / mistakes
```

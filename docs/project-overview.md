# Project Overview

## Что это
**Claude Atlas** — AI-native knowledge system о Claude и его экосистеме.
Интерактивная радиальная mindmap + structured AI infrastructure поверх React-приложения.

## Аудитория
- Люди, которые осваивают Claude и хотят увидеть «всю карту сразу».
- Команды, которым нужна общая точка истины по Skills / MCP / Agents / Claude Code.
- Сам Claude — как агент, который развивает и поддерживает эту базу знаний.

## Слои проекта
1. **Knowledge layer** — `src/data/` (mindmap-узлы, prompts, tutorials).
2. **UI layer** — `src/components/`, `src/hooks/`, `App.css`.
3. **AI infrastructure layer** — `CLAUDE.md`, `skills/`, `prompts/`, `docs/`, `tasks/`.

Слои **не смешиваются**. AI-инфраструктура управляет contentom через skills,
а не правит UI или vice-versa.

## Стек
- React 18 + Vite, чистый CSS, без TypeScript.
- HTML-узлы поверх SVG-линий в одном transform-контейнере.
- Локальное состояние, никакого глобального стора.

## Контент
- 11 разделов верхнего уровня. См. README.
- Узлы оформлены по схеме **what / why / when / impact / example / mistakes**.
- Контент — на русском, идентификаторы — латиница.

## Принципы
1. AI-first архитектура.
2. Атомарность знания (узел самодостаточен).
3. Skills вместо ad-hoc промптов.
4. Расширение, а не переписывание.

## Where to look next
- Архитектура и стек → `architecture.md`
- Как устроена структура знаний → `knowledge-structure.md`
- Как строить и применять AI workflows → `ai-workflows.md`
- Правила промптов → `prompt-guidelines.md`
- Правила масштабирования → `scaling-rules.md`
- Правила контента → `content-rules.md`

# Project Overview

## Что это
**105 Atlas** — AI-Native Transformation Map. Операционная карта для людей, команд и компаний, переходящих на AI-native workflows.
Интерактивный knowledge graph (mindmap) + structured AI infrastructure поверх React-приложения.

## Позиционирование

**Atlas — это НЕ:**
- AI-курсы / LMS / академия
- Энциклопедия Claude tools

**Atlas — это:**
- Visual systems thinking — карта компонентов, систем и трансформаций
- AI Transformation maps — пути от current process к AI-native operations
- Workflows + orchestration — реальные паттерны вместо «учебных» концептов

## Архитектура — 4 уровня

```
LEVEL 4 — USE CASES        — именованные пути через узлы (13 UC)
         ↑ применяет
LEVEL 3 — TRANSFORMATION   — 5 directions: Ops / Mk / CS / Product / Enterprise
         ↑ применяется через
LEVEL 2 — SYSTEMS          — 6 sub-разделов: workflows, data, orchestration, ops, etc.
         ↑ строится из
LEVEL 1 — FOUNDATION       — 141 узел: 8 ai-fundamentals + 133 Claude-specific
```

Пользователь входит с любого уровня и движется вверх или вниз через явные cross-links.

## Аудитория (5 ролей)

| Audience | Где работать |
|----------|--------------|
| Practitioners (learning AI) | Foundation → AI Fundamentals |
| Operations / Marketing / Support teams | Transformation L3 directions |
| Product / Design teams | ai-native-product |
| Tech leads / Architects | Systems patterns + ai-native-enterprise |
| Executives / CIOs | ai-native-enterprise + Use Cases |

## Слои проекта

1. **Knowledge layer** — `src/data/` (mindmap structure) + `src/locales/<lang>/nodes.json` (контент в 3 локалях)
2. **UI layer** — `src/components/`, `src/hooks/`, `App.css`
3. **AI infrastructure layer** — `CLAUDE.md`, `skills/`, `prompts/`, `docs/`, `tasks/`
4. **Strategy layer** — `docs/strategy/` (10 architect-level документов)

Слои **не смешиваются**. AI-инфраструктура управляет контентом через skills, а не правит UI или vice-versa.

## Стек

- React 18 + Vite, чистый CSS, без TypeScript
- HTML-узлы поверх SVG-линий в одном transform-контейнере (pan/zoom)
- Локальное состояние, без глобального стора
- Supabase (Auth + DB), Vercel (deploy)
- i18n: ru / en / fi через lazy-loaded chunks per locale

## Контент

- **213 узлов** (133 старых Claude-specific + 80 новых)
- **17 Transformation узлов** в 5 directions
- **17 Systems узлов** в 6 sub-разделах
- **13 Use Cases** (cross-layer paths)
- Узлы оформлены по схеме **what / why / when / impact / example / mistakes**
- ru / en / fi синхронизированы

## Принципы

1. **AI-first архитектура** — Claude может работать здесь автономно
2. **Атомарность знания** — узел самодостаточен, не требует чтения соседей
3. **Skills вместо ad-hoc промптов** — повторяемое в `skills/`
4. **Cross-layer linking** — каждый узел имеет relatedIds к смежным
5. **Use Cases как entry-point** — не «учить с нуля», а «найти путь к цели»
6. **Расширение, а не переписывание** — миграция всегда expand-not-rebuild

## Where to look next

- Архитектура (3+1 layers, design rules) → `docs/strategy/02-architecture.md`
- Стратегия позиционирования → `docs/strategy/01-positioning.md`
- Migration plan (как был выполнен) → `docs/strategy/08-migration-plan.md`
- Финальные решения по архитектуре → `docs/strategy/00-DECISIONS.md`
- Strategy pack overview → `docs/strategy/README.md`
- Технический стек → `docs/architecture.md`
- Knowledge structure (узлы) → `docs/knowledge-structure.md`
- Контент-правила → `docs/content-rules.md`

## Status

**Architecture migration: IMPLEMENTED (2026-05-22)**

Все 5 фаз стратегии выполнены за одну сессию. Atlas теперь — MVP новой архитектуры с реальным контентом во всех 4 уровнях. Bundle 92.61 KB gzip.

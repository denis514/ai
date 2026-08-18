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
LEVEL 4 — USE CASES        — именованные пути через узлы (18 узлов)
         ↑ применяет
LEVEL 3 — TRANSFORMATION   — направления перестройки работы (64 узла)
         ↑ применяется через
LEVEL 2 — SYSTEMS          — паттерны систем и оркестрации (51 узел)
         ↑ строится из
LEVEL 1 — FOUNDATION       — основы AI + Claude-specific (156 узлов)
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
3. **Product layer #2 — Agent Builder** — `src/builder/` (холст, 24 типа узлов,
   33 шаблона) + `supabase/functions/` (реальное исполнение, планировщик, вебхук).
   Изолирован от Atlas: общие только Auth/Locale/Theme-контексты.
4. **AI infrastructure layer** — `CLAUDE.md`, `skills/`, `prompts/`, `docs/`, `tasks/`
5. **Strategy layer** — `docs/strategy/` (позиционирование) + `docs/business-strategy/`
   (модель дохода, монетизация; distribution заморожен — см. `PIVOT-PRODUCT-FIRST.md`)

Слои **не смешиваются**. AI-инфраструктура управляет контентом через skills, а не правит UI или vice-versa.

## Стек

- React 18 + Vite, чистый CSS, без TypeScript
- HTML-узлы поверх SVG-линий в одном transform-контейнере (pan/zoom)
- Локальное состояние, без глобального стора
- Supabase (Auth + DB), Vercel (deploy)
- i18n: ru / en / fi через lazy-loaded chunks per locale

## Контент (проверено 2026-08-18 линтерами)

- **299 узлов** в карте (290 в дереве + узлы вне основного обхода)
- **261 обучающий материал**, **13 маршрутов обучения**
- **64 промпта** + **42 шаблона** библиотеки промптов
- **33 шаблона** Agent Builder, **24 типа** узлов конструктора
- Узлы оформлены по схеме **what / why / when / impact / example / mistakes**
- ru / en / fi синхронизированы (`npm run lint:data`, `npm run lint:links`)

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

## Status (2026-08-18)

- **Architecture migration: IMPLEMENTED** (2026-05-22) — все 4 уровня наполнены.
- **Atlas: в проде**, открыт без пароля с 2026-06-09.
- **Agent Builder: рабочая бета** — реальный запуск, автозапуск по расписанию и
  вебхуку, доставка в Telegram / e-mail / календарь, MCP, защита кошелька.
  Не доделано: `tool-computer` в движке, узлы-триггеры в палитре, платные тарифы.
- **Пауза в разработке**: с 13 июня по 18 августа 2026 в `main` шли только
  авто-коммиты сторожей. Текущее состояние и приоритеты — `tasks/current.md`.
- **Вес первой загрузки за критическим порогом**: JS 185.8 KB gzip, CSS 50.8 KB
  (`tasks/perf-audit-2026-08-18.md`) — отдельная задача.

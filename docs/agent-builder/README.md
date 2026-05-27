# Agent Builder — стратегическое расширение 105 Atlas

> Новое направление продукта: визуальная платформа для **изучения** и **создания**
> AI-агентов. Дополняет существующий Atlas (knowledge map), не заменяет.
>
> _Создано: 2026-05-24 | Status: STRATEGY APPROVED, MVP PLANNING_

---

## Главный принцип

> **Сначала ценность визуально + образовательная польза. Потом сохранение.
> Потом реальные запуски. Потом платные функции.**

Не строим SaaS multi-agent платформу за месяц. Не подключаем все API сразу.
Не делаем marketplace на старте. **Никогда не ломаем существующий Atlas.**

---

## 3 уровня продукта

```
LEVEL 1 — Educational Atlas (✅ частично уже есть)
  └─ Что такое агент, tool calling, memory, MCP, workflow
  └─ Atlas узлы: agents (7), subagents, mcp, skills, cap-tools, cap-memory
  └─ Дополнить: 5-10 новых education nodes под Builder concepts

LEVEL 2 — Interactive Demo (MVP — 30 дней)
  └─ Визуальная карта: agents как ноды, edges как connections
  └─ Mock execution: статусы idle/running/completed/failed
  └─ Fake logs, не реальные API
  └─ 4 готовых template (UX Audit / Analytics / Content / Research)

LEVEL 3 — Functional Agent Builder (Beta — 90 дней)
  └─ Save workflow в Supabase
  └─ Real API execution (Claude/OpenAI через backend proxy)
  └─ Tool library + MCP integrations
  └─ Token limits, billing, audit logs
```

---

## Структура документов

| # | Файл | Что внутри |
|---|------|------------|
| 01 | [01-audit.md](./01-audit.md) | Аудит текущего проекта: что переиспользуем, что не трогаем |
| 02 | [02-architecture.md](./02-architecture.md) | Frontend / Backend / DB schema / Security |
| 03 | [03-mvp-30day.md](./03-mvp-30day.md) | 30-day MVP план с конкретными task'ами |
| 04 | [04-beta-90day.md](./04-beta-90day.md) | 90-day Beta план: auth, real API, billing |
| 05 | [05-risks.md](./05-risks.md) | Риски + do-not-touch list |
| 06 | [06-skills.md](./06-skills.md) | Спецификация 5 новых skill-агентов |

---

## Где живёт Agent Builder

**Routing:** `#/builder` (новый top-level type)

**Папка:** `src/builder/` — изолировано от `src/components/` основного Atlas.
Свои компоненты, hooks, state. Shared только: AuthContext, LocaleContext, ThemeContext.

**URL примеры:**
- `#/builder` — главная страница Builder (template gallery)
- `#/builder/new` — новый workflow
- `#/builder/wf/{id}` — открытый workflow
- `#/builder/templates` — библиотека шаблонов

**Atlas остаётся в существующих routes:**
- `#/` или `#/locale` — mindmap
- `#/locale/node/{id}` — узел
- `#/locale/tutorial/{id}` — туториал
- `#/locale/courses` — workflows tab
- ... всё прежнее

---

## Связь Atlas ↔ Builder

**Atlas → Builder:**
- В узлах `agents/*` появляется CTA «Try in Builder» → открывает relevant template
- В tutorial `agents-basics` шаг 5 предлагает «Build your first agent in 5 minutes»
- Mindmap-узел `agents` показывает status badge «Builder available»

**Builder → Atlas:**
- В Builder каждый AgentNode имеет «Learn more» → открывает Atlas узел в side panel
- Tooltip с inline теорией («Что такое tool calling?» → краткий what + link to `cap-tools`)
- Empty state в Builder — «New to agents? Start with [tutorial:agents-basics]»

**Архитектурно:** обоюдные deep-links через `parseHash`. Atlas не знает о Builder
кроме CTA-строк в i18n. Builder читает Atlas данные read-only.

---

## Связь с бизнес-стратегией V2

Phase 0-3 (паид Atlas Pro tier) **продолжается параллельно**. Agent Builder —
это **отдельный продуктовый pillar**, не замена.

**Будущая монетизация Builder (Phase 4-5+):**
- Free: 1 workflow, 5 nodes max, mock execution only
- Pro: 5 workflows, unlimited nodes, real API execution с monthly token allowance
- Team: shared workflows, version history, audit logs
- Enterprise: dedicated infrastructure, custom MCP servers

**НЕ маркетируем Builder pricing до working Beta.** Сначала product-market fit
для Builder, потом pricing.

**Возможный pricing add-on:**
- Atlas Pro $29/mo → bundle с Builder Free
- Builder Pro $49/mo (включает Atlas Pro)
- Atlas + Builder Team $249/mo

Это **гипотеза**, не план. Phase 4 валидация.

---

## Что НЕ делаем

- ❌ Полная SaaS multi-agent платформа за 30 дней
- ❌ Real API execution в MVP (только mock)
- ❌ User-supplied API keys без security layer
- ❌ Marketplace шаблонов в первые 90 дней
- ❌ Сложный billing/subscription в MVP
- ❌ Любой код в Builder, который импортируется из/в `src/components/` основного Atlas
- ❌ Изменения в `mindmapData.js`, `tutorials.js`, `prompts.js` ради Builder
- ❌ Пере-роутинг существующих URLs

---

## Что делаем сейчас (Phase B-0 — подготовка)

1. ✅ Создать `docs/agent-builder/` — стратегические документы (этот коммит)
2. ✅ Создать 5 новых skills для эксперт-агентов
3. ✅ Создать `src/builder/` — пустая папка с README, не imported
4. ✅ Update CLAUDE.md § 16 — entry points для Agent Builder
5. ⏳ Phase B-1 (MVP 30-day) — execution по плану `03-mvp-30day.md`

**Status:** Phase B-0 в работе сейчас. Phase B-1 — после approval плана пользователем.

---

## Skills для исполнения

В `skills/`:

| Skill | Назначение | Status |
|-------|-----------|--------|
| `product-strategist` | Проверка соответствия Atlas стратегии | ✅ exists |
| `monetization-architect` | Pricing / paywall / tiers | ✅ exists |
| `agent-architecture` | Проектирует agents, tools, workflow связи | 🆕 NEW |
| `ux-flow-designer` | Visual builder, canvas, onboarding | 🆕 NEW |
| `ai-education-designer` | Превращает AI-концепции в обучающие блоки | 🆕 NEW |
| `technical-risk-auditor` | Проверяет что новая интеграция не ломает Atlas | 🆕 NEW |
| `mvp-planner` | Делит большие идеи на MVP / Beta / Future | 🆕 NEW |

---

## Roadmap высокого уровня

```
Day 0    | Strategy docs + skills (этот коммит)
Day 1-3  | Setup React Flow + builder route + empty canvas
Day 4-10 | AgentNode / EdgeNode + mock execution + status states
Day 10-20| Templates × 4 + sidebar + execution log panel
Day 20-25| Education tooltips + Atlas deep-links
Day 25-30| Polish + demo recording + community share

Day 30   | MVP launch (demo-only, no auth, no save)

Day 30-45| Auth flow + Supabase tables
Day 45-60| Save/load workflows + user workspace
Day 60-75| Real Claude API execution через backend proxy
Day 75-85| Token limits + simple billing + audit logs
Day 85-90| Security review + version history

Day 90   | Beta launch (real product)
```

---

_Версия 1.0 — 2026-05-24. Прочесть в первую очередь._

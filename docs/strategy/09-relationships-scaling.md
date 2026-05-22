# 09 — Node Relationships & Scaling Rules

> **TL;DR**: Atlas — это knowledge graph, не tree. Связи между узлами имеют **семантику** (uses / extends / applies / instantiates). Правила scaling: vertical depth > horizontal breadth, fan-out лимиты, связь density ≥2. Архитектура должна выдержать 500+ узлов без потери UX.

---

## 1. Anatomy связей

### 1.1 Текущие типы связей (mindmapData.js)

```js
{
  id: 'b-claude',
  children: [...],     // Hierarchical (parent → child)
  relatedIds: [...]    // Cross-links (semantic, undirected currently)
}
```

Сейчас `relatedIds` — opaque (нет семантики). Это работает на 133 узлах, но не масштабируется до 500+.

### 1.2 Предлагаемое расширение

Добавить семантику связей через `relationships`:

```js
{
  id: 'ec-pdp-gen',
  relationships: {
    uses: ['prompting', 'b-system', 'cap-files'],          // L3 → L1
    applies: ['ai-workflows', 'ai-operations'],            // L3 → L2
    extends: [],                                            // same level
    relatedTo: ['ec-search-opt', 'ec-merchandising']        // L3 ↔ L3
  }
}
```

Тогда:
- UI может ВИЗУАЛИЗИРОВАТЬ связь по-разному (uses = пунктир, extends = жирная линия)
- Lint может validate (L1-узел не может `apply` к Transformation)
- Search может ранжировать по «depth of integration»

### 1.3 Backward compatibility

`relatedIds` остаётся как fallback (concatenation всех relationships).

---

## 2. Семантика связей

### 2.1 `uses` (L3 → L1, L2 → L1, L3 → L2)

«Этот узел использует компонент / паттерн».

Пример: `ec-pdp-gen` uses `prompting`, `b-system`.

### 2.2 `applies` (L3 → L2)

«Этот use case применяет данный systems-паттерн».

Пример: `ec-pdp-gen` applies `ai-workflows/linear-chain`.

### 2.3 `extends` (same level)

«Этот узел расширяет / детализирует другой».

Пример: `cap-vision` extends `capabilities`.

### 2.4 `relatedTo` (cross-cutting, same level)

«Этот узел тематически связан».

Пример: `ec-pdp-gen` relatedTo `ec-search-opt`.

### 2.5 `prerequisites` (только в Use Cases и Tutorials)

«Для понимания этого требуется знать X сначала».

Уже существует в `tutorials.js`. Расширить на узлы.

---

## 3. Validation rules (lint-able)

Architecture lint должен проверять:

| Rule | Description |
|------|-------------|
| R1 | L1-узел не может иметь `applies` к чему-либо |
| R2 | L3-узел обязан иметь ≥1 `uses` к L1 |
| R3 | L3-узел обязан иметь ≥1 `applies` к L2 |
| R4 | L2-узел обязан иметь ≥1 `uses` к L1 |
| R5 | `extends` валиден только same level |
| R6 | Циклические `extends` запрещены |
| R7 | `relatedTo` — minimum 1 per node (recommendation) |
| R8 | Каждый узел имеет минимум `title` в ru/en/fi |

Реализация: `scripts/lint-architecture.mjs` — runs in CI.

---

## 4. Visual representation в UI

### 4.1 Цветовая семантика связей

В mindmap при выборе узла:
- `uses` → синяя пунктирная линия вниз
- `applies` → циан стрелка вниз
- `extends` → серая жирная линия same level
- `relatedTo` → серая тонкая линия

### 4.2 Inspector panel

При hover/click на узел показывает:

```
ec-pdp-gen (Transformation L3)
├── Uses (3): prompting, b-system, cap-files
├── Applies (2): ai-workflows, ai-operations
├── Related (2): ec-search-opt, ec-merchandising
└── Used by: (back-references, computed)
```

---

## 5. Scaling — depth vs breadth

### 5.1 Правило depth

```
Foundation:     max 4 уровней (root → section → topic → concept)
Systems:        max 3 уровня (root → group → pattern)
Transformation: max 5 уровней (root → direction → vertical → workflow → step)
Use Cases:      flat (use case = atomic, не tree)
```

### 5.2 Правило breadth (fan-out)

| Level | Max children | Rationale |
|-------|--------------|-----------|
| Root | 3-5 | 3 layer + 1-2 utility |
| Layer | 10-12 | Поглощаемо взглядом |
| Section | 8-12 | Cognitive load |
| Topic | 6-10 | Detail level |
| Leaf | 0 | Terminal |

При превышении — реструктурировать в подразделы.

### 5.3 Total scale targets

| Метрика | Сейчас | Year 1 target | Year 2 target |
|---------|--------|---------------|---------------|
| Узлов | 133 | 250 | 500 |
| Use Cases | 0 | 30 | 80 |
| Туториалов | 32 | 50 | 80 |
| Learning Paths | 6 | 12 | 25 |
| Языков | 3 | 5 (+es, de) | 7 |
| Bundle (initial gzip) | 85 KB | <100 KB | <150 KB |

---

## 6. Performance constraints

### 6.1 Mindmap render

- 250 nodes — текущий layout справится
- 500 nodes — потребует:
  - Виртуализация (рендерить только видимые узлы)
  - Lazy expand (children по запросу)
  - Cluster collapse при низком zoom

### 6.2 Search

- Full-text search над 500 узлами + 100 use cases + 80 туториалов
- Решение: build-time index (already есть `searchableById`), client-side TF-IDF

### 6.3 Bundle

- Lazy chunks per locale: nodes / tutorials / use cases / prompts
- Code splitting per layer: foundation / systems / transformation chunks (опционально при 500+ nodes)

---

## 7. Когда реструктурировать

### Signals (нужна реструктуризация)

- Узел имеет >12 детей → split на подразделы
- Узел имеет 0 `relatedIds` → orphan, либо связать, либо удалить
- Узел имеет >10 `relatedIds` → возможно слишком общий, разбить
- Lint error R2/R3 — нарушение architectural invariants
- Глубина >5 уровней — слишком далеко от root

### Anti-signals (НЕ реструктурировать)

- «Чувствуется устаревшим» — нужны данные, не intuition
- «Категории не нравятся» — без data о user confusion не трогаем

---

## 8. Internationalization scaling

### Current (3 locales)

- ru / en / fi — manual translation
- ~133 nodes × 6 fields × 3 locales = 2394 string entries
- Bundle: 3 lazy chunks per locale

### Year 1 (5 locales)

- + es (Spanish), de (German)
- ~250 × 6 × 5 = 7500 entries
- Translation budget: $15-20k per locale (professional)
- ИЛИ: AI-translated + human review

### Strategy

- Master locale: **EN** (если выходим на global), сейчас RU
- AI-assisted translation pipeline (Claude API + review)
- Per-locale lazy loading сохраняется

---

## 9. Maintenance lifecycle узла

### 9.1 Stages

```
DRAFT       → создан, но не опубликован
PUBLISHED   → виден пользователям
DEPRECATED  → устарел, но не удалён (показывается с пометкой)
ARCHIVED    → скрыт из UI, остаётся в коде для backward links
```

### 9.2 Triggers

- DEPRECATED: фича Anthropic убрала (например, computer use в подвешенном состоянии)
- ARCHIVED: 6+ месяцев в DEPRECATED, 0 трафика
- Deletion НИКОГДА — нарушает ID immutability

### 9.3 Audit periodicity

- Раз в квартал — review nodes с status=DEPRECATED
- Раз в месяц — `content-gap-auditor` skill проверяет outdated nodes

---

## 10. Future architecture extensions

### 10.1 Personalized paths (Year 1+)

Use Cases ranked per user based on:
- Role (Supabase profile)
- Industry
- Progress history

### 10.2 Community contributions (Year 2)

Other authors могут предлагать Use Cases (PR-based). Atlas остаётся opinionated, но открывается community.

### 10.3 Premium tier

Premium Use Cases — глубокие playbooks для enterprise:
- Step-by-step с screenshots
- Конкретные prompts для копирования
- Templates (Notion, Airtable, ...) для скачивания
- Office hours / consulting (опционально)

### 10.4 API access

Atlas как knowledge graph через API:
- `GET /api/nodes/<id>` — данные узла
- `GET /api/use-cases?audience=ecommerce` — поиск use cases
- Используется external tools (например, AI assistants Atlas reference)

---

## 11. Anti-scaling — что точно НЕ делаем

| ❌ Антипаттерн | Почему |
|---------------|--------|
| Linkdump (узлы без semantic) | Превращает граф в шум |
| «AI overview» landing pages | Дублирует Transformation overview |
| Quote/citation узлы | Не атомарны, не self-contained |
| Branding-узлы (про себя, Atlas) | Не knowledge, это marketing |
| Туториалы внутри узлов | Узлы — атомарны, туториалы — отдельная сущность |
| External-only узлы (только редирект) | Узел без своего контента не имеет ценности |

---

## 12. Governance

### 12.1 Кто решает что добавлять

- **Strategic content** (новые directions, Use Cases) — owner architecture team
- **Foundation gaps** — discovered by usage analytics + content-gap-auditor
- **Systems patterns** — based on real Use Case needs
- **Translation** — automated + reviewed

### 12.2 Decision matrix

```
Adding new Transformation direction → architecture team approval
Adding new Foundation node          → content team approval
Adding new Use Case                 → product team approval
Adding new Tutorial                 → content team approval
Deprecating node                    → architecture team + analytics review
Removing node                       → NEVER without backup + redirects
```

---

## 13. Метрики здоровья архитектуры

KPI для measuring architecture health:

| Метрика | Target | Текущее |
|---------|--------|---------|
| Avg `relatedIds` per node | ≥3 | ~2 (нужна аудит) |
| Orphan nodes (0 связей) | <5% | TBD |
| Architecture lint errors | 0 | N/A (lint не существует) |
| Avg depth from root | 3-4 | 3.2 |
| Max breadth (children) | ≤12 | 12 (claude-code) |
| Outdated nodes (>6 mo no update) | <10% | TBD |
| Locale coverage (full ru/en/fi) | 100% | ~99% |

---

## 14. Acceptance — архитектура готова, когда

1. ✅ 3-layer model implemented
2. ✅ `level` field в каждом узле
3. ✅ `relationships` field у ≥80% узлов
4. ✅ Lint passes 0 errors
5. ✅ ≥30 Use Cases
6. ✅ Bundle size в budget
7. ✅ Mindmap UI render 250+ nodes <500ms
8. ✅ Documentation `docs/strategy/` в `IMPLEMENTED` status
9. ✅ Onboarding update для new positioning
10. ✅ Analytics показывает Use Cases как primary user journey

---

## Заключение strategy pack

Документы 01-09 — это **architectural blueprint** для перехода 105 Atlas из Claude-documentation в AI-Native Transformation OS.

Ничего не имплементировано. Все архитектурные решения требуют approval перед началом Phase 1.

Следующий шаг: review этого strategy pack → решения по Q1-Q22 (вопросы в каждом документе) → старт Phase 1.

---

_Status: IMPLEMENTED (2026-05-22) | Prev: [08 — Migration Plan](./08-migration-plan.md) | Index: [README](./README.md)_

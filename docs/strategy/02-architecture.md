# 02 — Three-Layer Architecture

> **TL;DR**: Atlas строится на трёх уровнях абстракции: **Foundation** (компоненты), **Systems** (как они соединяются), **Transformation** (как меняют бизнес). Пользователь входит с любого уровня и движется вверх или вниз через явные связи. Существующие 133 узла = Foundation. Systems и Transformation — НОВЫЕ слои.

---

## 1. Принцип архитектуры

```
                   ┌─────────────────────────────────────┐
                   │  LEVEL 3 — TRANSFORMATION           │
                   │  «Как AI меняет бизнес»             │
                   │  eCommerce / Marketing / Product /  │
                   │  CS / Operations / Enterprise        │
                   └────────────────▲────────────────────┘
                                    │ применяет
                                    │
                   ┌────────────────┴────────────────────┐
                   │  LEVEL 2 — SYSTEMS                  │
                   │  «Как AI работает как система»      │
                   │  Workflows / Orchestration /        │
                   │  RAG / Human-AI / AI Ops             │
                   └────────────────▲────────────────────┘
                                    │ строится из
                                    │
                   ┌────────────────┴────────────────────┐
                   │  LEVEL 1 — FOUNDATION               │
                   │  «Как работают AI-компоненты»       │
                   │  LLM / Prompting / Tools / Skills / │
                   │  MCP / Agents / AI fundamentals      │
                   └─────────────────────────────────────┘
```

### Ключевое: каждый уровень — самодостаточен

Пользователь не обязан читать Foundation, чтобы понять Transformation.
Но если хочет — может опуститься. И наоборот.

Это **non-linear knowledge graph**, а не линейный курс.

---

## 2. Определения уровней

### LEVEL 1 — FOUNDATION

**Что это:** базовые AI-компоненты, технологии, инструменты, концепции.

**Что включает:**
- Технологии: LLM, Embeddings, Vector DB, RAG, Fine-tuning
- Инструменты: Claude (текущие 133 узла), Claude Code, MCP, Skills, Agents
- Концепции: Prompting, Context, Tokens, Memory, Multimodal
- Infrastructure: Inference, Latency, Cost, Security

**Признак узла L1:** отвечает на вопрос *«Что это и как работает?»*

**Пример:** `b-context` (Контекстное окно) — описывает технический концепт без привязки к workflow или бизнесу.

---

### LEVEL 2 — SYSTEMS

**Что это:** паттерны соединения Foundation-компонентов в работающие системы.

**Что включает:**
- AI Workflows: input → process → output, async/sync, quality gates
- Orchestration: multi-agent, task decomposition, context passing
- Data Systems: RAG architecture, vector search pipelines
- Human Collaboration: handoff, review, trust calibration
- AI Operations: observability, evals, cost management

**Признак узла L2:** отвечает на вопрос *«Как соединить компоненты, чтобы получить рабочую систему?»*

**Пример:** `ai-orchestration` (Multi-agent coordination) — не описывает конкретный инструмент, а паттерн взаимодействия нескольких агентов.

---

### LEVEL 3 — TRANSFORMATION

**Что это:** применение Systems к конкретным бизнес-доменам и ролям.

**Что включает:**
- Departmental: AI-Native Marketing, Product, Operations, Customer Support
- Vertical: AI-Native eCommerce, SaaS, Enterprise
- Cross-cutting: AI Governance, AI ROI, AI Change Management

**Признак узла L3:** отвечает на вопрос *«Как этот бизнес/команда меняется, становясь AI-native?»*

**Пример:** `ai-pdp-generation` (AI-Native Product Detail Pages) — конкретный workflow трансформации в eCommerce.

---

## 3. Root-структура mindmap

### Текущая (как есть)
```
root (Atlas)
├── basics              ← основы Claude
├── platform            ← платформа Claude
├── capabilities        ← возможности Claude
├── prompting
├── instructions
├── projects
├── artifacts
├── skills
├── scenarios
├── claude-code
├── mcp
└── agents
```

12 разделов на одном уровне, без визуальной иерархии уровней абстракции.

### Целевая (после миграции)
```
root (Atlas)
├── foundation          ← НОВЫЙ контейнер для существующих узлов
│   ├── ai-fundamentals    ← НОВЫЙ (LLM, RAG, Embeddings, Vector DB...)
│   ├── claude-core        ← объединение basics + platform + capabilities
│   ├── prompting          ← существующий
│   ├── configuration      ← объединение instructions + projects + artifacts
│   ├── automation         ← объединение skills + claude-code + mcp
│   └── agents-foundation  ← существующий agents (переименовать)
│
├── systems             ← НОВЫЙ root-уровень
│   ├── ai-workflows
│   ├── ai-orchestration
│   ├── ai-data-systems
│   ├── ai-integration-systems
│   ├── ai-human-collaboration
│   └── ai-operations
│
└── transformation      ← НОВЫЙ root-уровень
    ├── ai-native-ecommerce      ← стратегический флагман
    ├── ai-native-marketing
    ├── ai-native-product
    ├── ai-native-customer-support
    ├── ai-native-operations
    ├── ai-native-design
    └── ai-native-enterprise
```

3 root-уровня, каждый — мета-контейнер для подразделов.

---

## 4. Категории и цвета

### Текущая палитра (5)
```
основы          — #2563eb (синий)
настройка       — #0891b2 (циан)
автоматизация   — #7c3aed (фиолетовый)
промпты         — #d97706 (янтарь)
агенты          — #dc2626 (красный)
```

### Целевая палитра (7)
```
foundation      — #2563eb (синий)     ← объединение «основы» + «настройка»
prompts         — #d97706 (янтарь)    ← переименование «промпты»
automation      — #7c3aed (фиолетовый) ← переименование «автоматизация»
agents          — #dc2626 (красный)   ← переименование «агенты»
systems         — #0891b2 (циан)      ← НОВАЯ (взамен освободившейся)
transformation  — #059669 (зелёный)   ← НОВАЯ
use-cases       — #f59e0b (оранжевый) ← НОВАЯ (см. документ 07)
```

**Принцип цвета:** уровень абстракции = насыщенность цвета.
- Foundation — холодные сине-синие тона
- Systems — переходные (циан, фиолет)
- Transformation — тёплые (зелёный, оранжевый)

---

## 5. Глубина и breadth

### Правило глубины (depth)

| Уровень | Max depth | Объяснение |
|---------|-----------|------------|
| Foundation | 4 | Atlas → Foundation → Section → Concept → Sub-concept |
| Systems | 3 | Atlas → Systems → Pattern → Sub-pattern |
| Transformation | 5 | Atlas → Transformation → Vertical → Workflow → Step → Sub-step |

**Почему Transformation глубже:** там самая ценная конкретика (например, «AI PDP generation → Step 3: SEO meta optimization → Sub-step: long-tail keyword research»).

### Правило breadth (ширины)

- Foundation: max 12 разделов
- Systems: max 8 разделов
- Transformation: max 10 разделов
- Sub-разделы: max 12 детей на уровень

При превышении — реструктурировать или разбить.

---

## 6. Антипаттерны архитектуры

| ❌ Антипаттерн | Почему плохо |
|---------------|-------------|
| Создавать L3-узел без связи с L1/L2 | Transformation теряет основу — становится «маркетинговым текстом» |
| Дублировать концепт на разных уровнях | Vector DB на L1 и снова Vector DB на L2 — это шум, не структура |
| Смешивать уровни в одной ветке | Под `ai-native-ecommerce` нельзя класть `embeddings` — это разный уровень |
| Создавать «mega-узлы» с 20+ детьми | Нечитаемо. Делим на подразделы. |
| Использовать общие категории для Transformation | Каждое направление — своя категория или цвет |
| Делать L3 без явного use case | Transformation без use case = абстрактные слова |

---

## 7. Архитектурные инварианты

Правила, которые НЕ нарушаются никогда:

1. **Каждый узел знает свой уровень** (поле `level: 'foundation' | 'systems' | 'transformation'`).
2. **L3 → L2 → L1**: каждый L3-узел имеет ≥2 `relatedIds` на L2 или L1.
3. **L2 → L1**: каждый L2-узел имеет ≥1 `relatedIds` на L1.
4. **Никакого backlinks UI без архитектурной семантики**: связь = «использует», «расширяет», «применяет».
5. **Локализация всегда обязательна**: новый узел = одновременная запись в ru/en/fi.
6. **Use Cases — отдельный конструкт**, не подмножество Transformation (см. документ 07).

---

## 8. Архитектурные следствия для UI

| Сейчас | После миграции |
|--------|----------------|
| 12 веток на одном кольце | 3 кольца (foundation/systems/transformation) с разной радиальной зоной |
| Категории как фильтр (5 цветов) | Уровни как фильтр (3 super-категории) + категории внутри |
| Tutorial = «курс по узлу» | Workflow = «путь через узлы» (cross-level) |
| `CoursesModal` показывает «курсы» | `WorkflowsModal` показывает Use Case paths |
| `relatedIds` — opaque links | Visual semantic: «using», «extends», «applies» |
| Search возвращает узлы | Search возвращает узлы + workflows + use cases |

Реализация этих UI-изменений — отдельный документ (см. 08 — Migration Plan).

---

## 9. Что architecture FORBIDS

- ❌ Узел Transformation без Use Case binding.
- ❌ Systems-узел, повторяющий Foundation-описание.
- ❌ Foundation-узел, говорящий «бизнес-языком».
- ❌ Cross-level дочерние связи (Foundation-узел не может быть child Transformation-узла).
- ❌ Категория «misc» / «other» / «прочее».

---

## 10. Mental shift для контент-авторов

| Раньше думали | Теперь думаем |
|---------------|---------------|
| «Какой узел добавить?» | «На каком уровне абстракции этот узел?» |
| «Что описать?» | «Что user поймёт, и куда пойдёт дальше?» |
| «Глубина = качество» | «Качество = правильный уровень + ясные связи» |
| «Туториал по узлу» | «Workflow через узлы разных уровней» |
| «Курс» | «Use case path» |

---

## Решения, требующие approval

> **Q1**: Согласны на 3 root-уровня (foundation/systems/transformation) или предпочитаете 4 (добавить use-cases)?
> **Q2**: Меняем категории `основы`→`foundation` сразу или после Phase 1?
> **Q3**: Какой первый Transformation-флагман: eCommerce (как предложено) или другая вертикаль?

---

_Status: DRAFT | Prev: [01 — Positioning](./01-positioning.md) | Next: [03 — Node Classification](./03-node-classification.md)_

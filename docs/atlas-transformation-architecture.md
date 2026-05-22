# 105 Atlas — AI-Native Transformation Architecture
> Стратегический документ: от Claude-документации к AI Transformation OS
> Дата: 2026-05-22 | Статус: DRAFT — требует подтверждения перед имплементацией

---

## ЧАСТЬ 1 — АУДИТ ТЕКУЩЕЙ АРХИТЕКТУРЫ

### 1.1 Snapshot: что есть сейчас

| Метрика | Значение |
|---------|---------|
| Всего узлов | 133 |
| Разделов верхнего уровня | 12 |
| Категорий | 5 (основы, автоматизация, промпты, настройка, агенты) |
| Туториалов | 32 |
| Курсов в CoursesModal | 32 |
| Языков | RU / EN / FI |

### 1.2 Текущие 12 разделов верхнего уровня

| Раздел | Узлов | Категория | Уровень абстракции |
|--------|-------|-----------|-------------------|
| basics | 16 | основы | L1 Foundation — концепты Claude |
| platform | 13 | основы | L1 Foundation — инструменты доступа |
| capabilities | 12 | основы | L1 Foundation — возможности Claude |
| prompting | 15 | промпты | L1 Foundation — методы |
| instructions | 6 | настройка | L1 Foundation — конфигурация |
| projects | 5 | настройка | L1 Foundation — рабочие пространства |
| artifacts | 5 | основы | L1 Foundation — output-объекты |
| skills | 7 | автоматизация | L1/L2 — начало Systems |
| scenarios | 7 | основы | L1 Foundation — use cases (shallow) |
| claude-code | 28 | автоматизация | L1 Foundation — developer tool |
| mcp | 7 | автоматизация | L1/L2 — интеграции и протоколы |
| agents | 8 | агенты | L2 Systems — начало orchestration |

### 1.3 Диагноз текущей архитектуры

**Что работает хорошо:**
- Атомарные узлы с чёткой схемой what/why/when/impact/example/mistakes
- Глубокое покрытие Claude-специфичных инструментов
- Чистая кодовая база — готова к расширению без переписывания
- Skills/MCP/Agents — уже Seeds для Systems-слоя

**Критические пробелы:**
- ❌ Нет L2 Systems — нет концептов LLM, RAG, Vector DB, Embeddings как универсальных систем
- ❌ Нет L3 Transformation — нет ни одного бизнес-направления (eCommerce, Marketing, HR, Product...)
- ❌ Нет Workflow patterns — как СОЕДИНЯТЬ компоненты в рабочий процесс
- ❌ Нет Orchestration layer — как управлять людьми, агентами, процессами вместе
- ❌ Scenarios (7 узлов) — слишком shallow, не раскрывают реальных workflows
- ❌ Позиционирование — "Claude docs" вместо "AI Transformation OS"

---

## ЧАСТЬ 2 — НОВАЯ ТРЁХУРОВНЕВАЯ АРХИТЕКТУРА

### Принцип

```
TRANSFORMATION
      ↑ применяет
   SYSTEMS
      ↑ строится из
  FOUNDATION
```

Каждый уровень зависит от нижнего, но не обязывает его знать детали.
Пользователь может войти с любого уровня.

---

### LEVEL 1 — FOUNDATION
> "Как работают компоненты AI"

Задача: объяснить строительные блоки. Существующие 133 узла почти полностью
принадлежат сюда. Они НЕ удаляются — они РЕОРГАНИЗУЮТСЯ.

**Существующее (сохранить, реорганизовать):**
```
foundation/
├── claude-core/         ← basics + platform + capabilities
│   ├── what-is-claude
│   ├── models
│   ├── context-window
│   ├── capabilities (vision, files, search, memory, tools...)
│   └── platform (plans, API, Desktop, Cowork...)
├── prompting/           ← prompting (все 15 узлов)
│   ├── 4D Framework
│   ├── principles
│   ├── XML tags, few-shot, CoT, prefill...
│   └── ready-prompts
├── configuration/       ← instructions + projects + artifacts
│   ├── custom-instructions
│   ├── projects
│   └── artifacts
├── automation/          ← skills + claude-code + mcp
│   ├── skills
│   ├── claude-code (+ все подузлы)
│   └── mcp
└── agents-foundation/   ← agents (переименовать из "Идеи агентов")
    ├── agent-design-principles
    ├── code-reviewer, ux-auditor, researcher...
    └── managed-agents
```

**Новые узлы для Foundation (отсутствуют):**
```
foundation/ai-fundamentals/ (НОВЫЙ раздел)
├── llm-basics           — что такое LLM, как работает
├── tokens-context       — токены, контекстное окно (глубже)
├── embeddings           — векторные представления
├── rag                  — Retrieval Augmented Generation
├── vector-databases     — Pinecone, Weaviate, pgvector
├── fine-tuning          — когда нужно, когда нет
├── ai-memory-systems    — типы памяти (in-context, external, semantic)
├── ai-inference         — latency, cost, batch
└── multimodal           — text + vision + voice + code
```

---

### LEVEL 2 — SYSTEMS
> "Как AI-компоненты работают вместе"

Задача: показать КАК соединять Foundation-блоки в работающие системы.
Это почти полностью НОВЫЙ контент.

```
systems/
├── ai-workflows/
│   ├── what-is-ai-workflow
│   ├── input-process-output
│   ├── async-vs-sync
│   ├── human-in-the-loop
│   ├── workflow-patterns (fan-out, chain, parallel, conditional)
│   └── workflow-quality-gates
│
├── ai-orchestration/
│   ├── orchestration-vs-automation
│   ├── agent-coordinator-patterns
│   ├── multi-agent-systems
│   ├── task-decomposition
│   ├── context-passing
│   └── error-recovery
│
├── ai-data-systems/
│   ├── knowledge-bases
│   ├── rag-architecture
│   ├── vector-search-pipeline
│   ├── data-ingestion-patterns
│   └── structured-vs-unstructured
│
├── ai-integration-systems/
│   ├── api-integration-patterns
│   ├── mcp-ecosystem             ← расширение существующего mcp
│   ├── webhook-triggers
│   ├── event-driven-ai
│   └── no-code-ai-integrations
│
├── ai-human-collaboration/
│   ├── human-ai-handoff
│   ├── review-approval-workflows
│   ├── ai-as-copilot-vs-autopilot
│   ├── trust-calibration
│   └── escalation-patterns
│
└── ai-operations/
    ├── ai-observability
    ├── prompt-versioning
    ├── evals-and-testing
    ├── cost-management
    └── ai-security-ops
```

---

### LEVEL 3 — TRANSFORMATION
> "Как AI меняет бизнес, команды, индустрии"

Задача: показать реальные transformation-пути для конкретных контекстов.
Полностью НОВЫЙ слой.

```
transformation/
├── ai-native-ecommerce/    ← СТРАТЕГИЧЕСКИЙ ПРИОРИТЕТ
│   ├── ai-pdp-generation
│   ├── ai-search-optimization
│   ├── ai-personalization
│   ├── ai-merchandising
│   ├── ai-cro
│   ├── ai-checkout
│   ├── ai-recommendations
│   ├── ai-commerce-support
│   ├── ai-loyalty-systems
│   ├── ai-commerce-analytics
│   └── ai-commerce-workflow
│
├── ai-native-marketing/
│   ├── ai-content-operations
│   ├── ai-campaign-intelligence
│   ├── ai-seo-optimization
│   ├── ai-brand-voice
│   └── ai-performance-analytics
│
├── ai-native-product/
│   ├── ai-discovery-research
│   ├── ai-spec-generation
│   ├── ai-roadmap-intelligence
│   ├── ai-experimentation
│   └── ai-user-feedback-synthesis
│
├── ai-native-customer-support/
│   ├── ai-tier1-automation
│   ├── ai-escalation-intelligence
│   ├── ai-knowledge-base
│   ├── ai-agent-assist
│   └── ai-support-analytics
│
├── ai-native-operations/
│   ├── ai-process-automation
│   ├── ai-decision-intelligence
│   ├── ai-reporting-automation
│   └── ai-resource-optimization
│
├── ai-native-design/
│   ├── ai-design-research
│   ├── ai-prototype-generation
│   ├── ai-design-ops
│   └── ai-accessibility-automation
│
└── ai-native-enterprise/
    ├── ai-transformation-strategy
    ├── ai-change-management
    ├── ai-governance
    ├── ai-center-of-excellence
    └── ai-roi-measurement
```

---

## ЧАСТЬ 3 — МИГРАЦИОННАЯ СТРАТЕГИЯ

### Принцип: EXPAND, не REBUILD

```
Фаза 0 (сейчас):     root → 12 разделов Claude-docs
Фаза 1 (неделя 1):   root → foundation + [systems-seed] + [transformation-seed]
Фаза 2 (месяц 1):    foundation → полная + systems → базовый
Фаза 3 (месяц 2-3):  transformation → eCommerce + 2-3 направления
```

**Фаза 1 — минимальный структурный сдвиг (без удалений):**
- Добавить 2 новых root-уровня: `systems` и `transformation`
- В `systems` — 3-4 якорных узла (что-такое-AI-workflow, orchestration-intro)
- В `transformation` — 2-3 якорных узла (ai-native-ecommerce, ai-native-marketing)
- Существующие 12 разделов остаются как есть — они становятся частью Foundation

**Фаза 2 — наполнение Foundation:**
- Добавить `ai-fundamentals` раздел под Foundation (LLM, RAG, Embeddings...)
- Реорганизовать `scenarios` → расширить до реальных workflow-паттернов
- Обновить категории: `основы → foundation`, `агенты → systems`, новые transformation-цвета

**Фаза 3 — eCommerce Transformation (стратегический приоритет):**
- Создать полный `ai-native-ecommerce` sub-tree (~12 узлов)
- Связать с Foundation: каждый eCommerce-узел ссылается на нужные Foundation-компоненты
- Создать workflows для commerce teams

---

## ЧАСТЬ 4 — NODE RELATIONSHIP STRATEGY

### Тип связей

```
ВЕРТИКАЛЬНЫЕ (уровни):
Foundation node → Systems node → Transformation node
"embeddings" → "rag-architecture" → "ai-product-discovery"

ГОРИЗОНТАЛЬНЫЕ (внутри уровня):
"ai-workflows" ↔ "ai-orchestration" ↔ "ai-human-collaboration"

CROSS-LINKS (существующий механизм relatedIds):
"ai-pdp-generation" → relatedIds: ["capabilities", "prompting", "rag-architecture"]
```

### Навигационные паттерны

1. **Top-down**: вошёл как бизнес → Transformation → нужный контекст → спускаешься в Systems → Foundation
2. **Bottom-up**: вошёл как разработчик → Foundation → понял компоненты → поднимаешься в Systems
3. **Lateral**: вошёл через Use Case → видишь связанные узлы всех уровней

---

## ЧАСТЬ 5 — КАТЕГОРИИ (NEW COLOR SYSTEM)

Текущие 5 категорий нужно расширить:

| Новая категория | Цвет | Что включает |
|----------------|------|-------------|
| `foundation` | #2563eb (синий) | все текущие "основы" + "настройка" |
| `automation` | #7c3aed (фиолетовый) | текущая "автоматизация" |
| `prompts` | #d97706 (янтарь) | текущие "промпты" |
| `systems` | #0891b2 (циан) | НОВЫЙ — AI systems layer |
| `agents` | #dc2626 (красный) | текущие "агенты" |
| `transformation` | #059669 (зелёный) | НОВЫЙ — business transformation |

---

## ЧАСТЬ 6 — SCALING STRATEGY

### Принципы роста

1. **Use-case first**: новые узлы появляются от реального сценария, а не от желания «добавить тему»
2. **Vertical depth over horizontal breadth**: лучше 1 полностью проработанный eCommerce-workflow чем 10 shallow transformation-направлений
3. **Connection density**: каждый новый узел должен иметь ≥2 relatedIds к существующим
4. **Progressive disclosure**: Foundation всегда видима, Systems/Transformation раскрываются по необходимости

### Приоритет новых узлов

**Немедленно (высокая ценность / низкий риск):**
- `ai-fundamentals` (LLM, RAG, Embeddings) — Foundation пополнение
- `ai-workflows` section — Systems seeds
- `ai-native-ecommerce` section — Transformation flagship

**Следующий квартал:**
- `ai-orchestration` + `ai-human-collaboration` — Systems core
- `ai-native-marketing` + `ai-native-product` — Transformation expansion

**Долгосрочно:**
- Enterprise transformation layers
- Industry-specific verticals (fintech, healthcare, logistics)
- Community-contributed use cases

---

## ЧАСТЬ 7 — POSITIONING SHIFT

### Переосмысление каждого элемента

| Элемент | Сейчас | Должно быть |
|---------|--------|------------|
| Root title | "Atlas" | "105 Atlas" |
| Tagline | Claude knowledge map | AI-Native Transformation OS |
| CoursesModal | "Обучение по Claude" | "AI Transformation Paths" |
| Tutorial titles | "Создать первый Skill" | → перефразировать в workflow-oriented |
| Scenarios section | 7 use-cases (shallow) | 20+ deep workflow maps |
| Agents section | "Идеи агентов" | "AI Agent Ecosystems" |

---

## ЧАСТЬ 8 — IMMEDIATE ACTION PLAN

### Что можно сделать СЕЙЧАС без риска

**Шаг 1 (30 мин) — Structural seeds:**
Добавить 2 новых root-level секции `systems` и `transformation` с 2-3 anchor-узлами
каждая. Это не ломает ничего — просто расширяет дерево.

**Шаг 2 (2 часа) — ai-fundamentals:**
Добавить новый раздел под Foundation: LLM, RAG, Embeddings, Vector DB, AI Memory.
Это самый запрашиваемый missing content.

**Шаг 3 (4 часа) — ai-native-ecommerce:**
Создать flagship Transformation section с ~12 узлами для eCommerce.
Это стратегический приоритет и сразу поднимает value proposition.

**Шаг 4 (итерационно) — Workflow systems:**
Добавлять Systems-узлы по мере появления eCommerce и других Transformation use cases.

### Что НЕ трогать сейчас

- ❌ Не переименовывать существующие категории (сломает фильтры без рефакторинга)
- ❌ Не удалять существующие 133 узла
- ❌ Не менять структуру mindmapData.js root (пока)
- ❌ Не менять тексты существующих tutorials

---

## ИТОГ

**105 Atlas сейчас:** Глубокая Claude-энциклопедия (L1 Foundation) без Systems и Transformation слоёв.

**105 Atlas через 3 месяца:** AI-Native Transformation OS с Foundation (существующее + AI fundamentals) + Systems (workflow/orchestration patterns) + Transformation (eCommerce, Marketing, Product, Operations).

**Ключевое ограничение:** Объём нового контента огромен.
eCommerce Transformation один — это ~80-100 новых узлов с полным what/why/when/impact/example/mistakes.
Стратегия — итерационное добавление, вертикальная глубина важнее горизонтального охвата.

---

_Документ создан: 2026-05-22_
_Статус: DRAFT — требует review и приоритизации перед имплементацией_
_Следующий шаг: подтвердить Фазу 1 и начать с Шага 1_

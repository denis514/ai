# 05 — Systems Layer

> **TL;DR**: Systems — мост между Foundation (компоненты) и Transformation (бизнес). Описывает **паттерны соединения** AI-компонентов в работающие системы: workflows, orchestration, data systems, human-AI collaboration, AI operations. Шесть основных групп. ~35 новых узлов. Не описывает технологии — описывает «как соединять».

---

## 1. Что Systems layer ОТВЕЧАЕТ

Systems существует, чтобы пользователь мог ответить на вопросы:

| Вопрос пользователя | Раздел Systems |
|---------------------|----------------|
| «Как соединить несколько AI-шагов в один процесс?» | ai-workflows |
| «Как несколько агентов координируются?» | ai-orchestration |
| «Как искать в большом объёме знаний?» | ai-data-systems |
| «Как интегрировать AI с моими существующими инструментами?» | ai-integration-systems |
| «Как люди и AI работают вместе?» | ai-human-collaboration |
| «Как контролировать качество AI на проде?» | ai-operations |

Каждый ответ — это **паттерн**, не **инструмент**. Инструменты — в Foundation.

---

## 2. Целевая структура Systems

```
systems/
├── ai-workflows/
│   ├── what-is-ai-workflow
│   ├── input-process-output
│   ├── workflow-patterns
│   │   ├── linear-chain
│   │   ├── fan-out-fan-in
│   │   ├── conditional-routing
│   │   └── feedback-loops
│   ├── sync-vs-async
│   ├── workflow-quality-gates
│   └── workflow-failure-modes
│
├── ai-orchestration/
│   ├── orchestration-fundamentals
│   ├── coordinator-vs-peer
│   ├── multi-agent-patterns
│   │   ├── manager-worker
│   │   ├── debate-pattern
│   │   ├── reflection-pattern
│   │   └── tool-using-agent
│   ├── context-passing
│   ├── task-decomposition
│   └── orchestration-failure-recovery
│
├── ai-data-systems/
│   ├── knowledge-bases-strategy
│   ├── rag-architecture-patterns
│   ├── vector-search-pipelines
│   ├── hybrid-search
│   ├── chunking-strategies
│   ├── data-ingestion-patterns
│   └── structured-vs-unstructured-data
│
├── ai-integration-systems/
│   ├── api-integration-patterns
│   ├── mcp-ecosystem
│   ├── webhook-and-events
│   ├── event-driven-ai
│   ├── no-code-ai-integration
│   └── integration-security-patterns
│
├── ai-human-collaboration/
│   ├── handoff-patterns
│   ├── review-approval-workflows
│   ├── copilot-vs-autopilot
│   ├── trust-calibration
│   ├── escalation-paths
│   └── teaching-the-model
│
└── ai-operations/
    ├── ai-observability
    ├── prompt-versioning
    ├── evals-and-benchmarks
    ├── cost-management
    ├── prompt-engineering-ops
    └── ai-security-operations
```

**Итого:** ~38 узлов в Systems layer.

---

## 3. Каждой группе — глубокое описание

### 3.1 `ai-workflows` (7 узлов)

**Что это:** базовый строительный блок Systems. Все остальные Systems группы предполагают понимание workflow.

**Ключевая мысль:** AI-workflow = граф шагов, где каждый шаг — это вход, AI-обработка, выход. Workflow не = «промпт». Workflow ≠ автоматизация. Workflow = ориентированный граф с явными контролями качества.

**Связь с Foundation:**
- Использует: `prompting/*` (для шагов), `cap-tools` (для interaction), `i-templates` (для повторяемости)
- Cross-link: `skills` (как «модули workflow»), `agents` (как «исполнители workflow»)

**Связь с Transformation:**
- Любой L3-узел `ai-native-*` содержит workflow → ссылается на `ai-workflows/workflow-patterns`

---

### 3.2 `ai-orchestration` (8 узлов)

**Что это:** уровень над workflows. Когда нужно координировать **несколько** workflow или **несколько** агентов.

**Ключевая мысль:** Orchestration ≠ автоматизация. Это явная **архитектурная** дисциплина: coordinator/peer, manager-worker, debate, reflection.

**Связь с Foundation:**
- Promotes: `agents`, `s-vs-subagents`, `cc-subagents`
- Использует: `mcp` (как канал интеграции между агентами)

**Связь с Transformation:**
- AI customer-support escalation → `ai-orchestration/escalation-paths`
- AI product discovery → `ai-orchestration/multi-agent-patterns/debate-pattern`

---

### 3.3 `ai-data-systems` (7 узлов)

**Что это:** как AI получает доступ к большим объёмам данных. RAG, vector search, hybrid search.

**Ключевая мысль:** Без data systems AI = stateless. С data systems AI становится «памятью компании».

**Связь с Foundation:**
- Promotes: новый `af-rag-basics`, `af-vector-db`, `af-embeddings`
- Cross-link: `cap-citations` (как RAG output), `cap-files` (как ingestion source)

**Связь с Transformation:**
- AI product search → `ai-data-systems/hybrid-search`
- AI customer support knowledge → `ai-data-systems/knowledge-bases-strategy`

---

### 3.4 `ai-integration-systems` (6 узлов)

**Что это:** как AI соединяется с реальными бизнес-инструментами. APIs, webhooks, MCP, no-code.

**Ключевая мысль:** AI без integration = демо. AI с integration = production system.

**Связь с Foundation:**
- Promotes: `mcp`, `m-patterns`
- Cross-link: `pl-api`, `pl-integrations`

**Связь с Transformation:**
- AI eCommerce checkout → `ai-integration-systems/api-integration-patterns`
- AI marketing automation → `ai-integration-systems/event-driven-ai`

---

### 3.5 `ai-human-collaboration` (6 узлов)

**Что это:** про границу AI и человека. Когда AI решает, когда передаёт. Trust calibration.

**Ключевая мысль:** Это не «UI/UX», это **архитектурный** уровень. Where AI stops and human starts — стратегическое решение.

**Связь с Foundation:**
- Cross-link: `p-team` (командная работа в Projects)
- Cross-link: `b-safety` (безопасность boundary)

**Связь с Transformation:**
- AI support tier-1 → `ai-human-collaboration/escalation-paths`
- AI design review → `ai-human-collaboration/review-approval-workflows`

---

### 3.6 `ai-operations` (6 узлов)

**Что это:** AI в production. Evals, observability, cost, security, ops.

**Ключевая мысль:** Без AI Ops любой AI-проект остаётся PoC. AI Ops = переход от «попробовали» к «работает в продакшене».

**Связь с Foundation:**
- Cross-link: `cap-caching` (cost optimization)
- Cross-link: `cc-hooks` (как ops pattern)

**Связь с Transformation:**
- AI ROI measurement → `ai-operations/cost-management`
- AI governance → `ai-operations/ai-security-operations`

---

## 4. Принципы написания Systems-узлов

### 4.1 Pattern, not Tool
❌ «Pinecone setup guide»
✅ «Hybrid search architecture (where Pinecone fits)»

### 4.2 Diagram-first
Каждый Systems-узел в идеале имеет ASCII или Mermaid-диаграмму в `details.example`. Systems thinking без диаграмм — труднее.

### 4.3 Always show trade-offs
Systems-узел обязан содержать `details.mistakes` с **архитектурным** trade-off, а не «ошибка пользователя».

Пример:
> mistakes: «Использовать fan-out паттерн без явного aggregator — приведёт к разрозненным результатам и невозможности корреляции»

### 4.4 Reference, don't reimplement
Если паттерн уже описан в Foundation (например, `cc-subagents`) — ссылаемся через `relatedIds`, не дублируем.

### 4.5 Real-world anchor
Каждый Systems-узел имеет ≥1 anchor в Transformation: «применяется в [transformation/ai-native-X]».

---

## 5. Антипаттерны Systems-узлов

| ❌ Антипаттерн | Пример | Почему плохо |
|---------------|--------|-------------|
| «Tutorial-style» в Systems | «Шаг 1: установите LangChain» | Это Foundation/tooling, не Systems |
| Vendor lock | «Pinecone vs Weaviate» как L2-узел | L2 описывает паттерн, не сравнение продуктов |
| Без diagram | Чистый текст без структуры | Systems thinking теряется |
| Без связи с Transformation | Pattern «in vacuum» | L2 существует только для применения в L3 |
| Дубликат L1 | «Что такое embeddings» в L2 | Embeddings = Foundation. В L2 — *как использовать* embeddings |

---

## 6. Приоритет Systems-узлов

Не пишем все 38 узлов сразу. Приоритет по value:

### Tier 1 (немедленно нужны для eCommerce flagship)
- `ai-workflows/what-is-ai-workflow`
- `ai-workflows/workflow-patterns/linear-chain`
- `ai-data-systems/rag-architecture-patterns`
- `ai-data-systems/hybrid-search`
- `ai-integration-systems/api-integration-patterns`

### Tier 2 (нужны для второй Transformation волны)
- `ai-orchestration/multi-agent-patterns/manager-worker`
- `ai-human-collaboration/escalation-paths`
- `ai-operations/evals-and-benchmarks`
- `ai-operations/cost-management`

### Tier 3 (по запросу)
- Остальные ~28 узлов

---

## 7. Visual representation в UI

В radial mindmap Systems-узлы:
- Цвет: `#0891b2` (циан) — отличается от Foundation (синий) и Transformation (зелёный)
- Иконка: техническая (workflow, connection, network)
- Hover: показывает связи с Foundation (вниз) и Transformation (вверх)

В CoursesModal (или будущем WorkflowsModal):
- Systems-узлы могут быть отдельной вкладкой «System Patterns»
- Search ранжирует Systems-узлы выше при architectural queries («pattern», «how to connect», «orchestrate»)

---

## 8. Метрики качества Systems-узла

Каждый Systems-узел оценивается по:

1. **Reusability**: используется ли в ≥2 Transformation use cases?
2. **Foundation density**: имеет ≥3 `relatedIds` к L1 узлам
3. **Diagram presence**: есть ли структурное представление
4. **Trade-off explicit**: указан архитектурный trade-off
5. **Transformation anchor**: явная ссылка на ≥1 L3 use case

Если узел не проходит ≥3 из 5 — он либо слишком абстрактен, либо это L1 в маске L2.

---

## 9. Скетч 3 ключевых Systems-узлов

### 9.1 `ai-workflows/what-is-ai-workflow`

```
title: AI Workflow — определение и анатомия
details:
  what: Workflow — ориентированный граф шагов, где каждый шаг получает вход,
        передаёт его AI-компоненту, проверяет выход, передаёт дальше.
  why: Без workflow AI = разовые промпты. С workflow = воспроизводимый процесс.
  when: Когда задача требует ≥2 AI-шагов с условиями или quality-gates.
  impact: Workflow-thinking — основа AI-native operations.
  example: [diagram: Input → AI Step 1 → Validate → AI Step 2 → Output]
  mistakes: Делать workflow без quality-gates — мусор накапливается между шагами.
relatedIds: [prompting, skills, agents, ai-orchestration]
```

### 9.2 `ai-data-systems/rag-architecture-patterns`

```
title: RAG: архитектурные паттерны
details:
  what: 4 паттерна RAG — naive, advanced (re-ranking), modular (multi-step retrieval),
        agentic (RAG как часть agent loop).
  why: «RAG» как термин слишком широк. Нужно знать конкретный паттерн.
  when: Зависит от latency/cost/quality бюджета.
  impact: Правильный RAG-паттерн = 10x cost reduction или 2x quality.
  example: [diagram: 4 patterns side-by-side]
  mistakes: Использовать naive RAG для production — низкое качество. Сразу нужен re-ranking.
relatedIds: [af-rag-basics, af-vector-db, af-embeddings, cap-citations]
```

### 9.3 `ai-human-collaboration/escalation-paths`

```
title: Escalation paths — когда AI передаёт человеку
details:
  what: Архитектурная схема, где AI принимает решение само,
        где требует одобрения, где сразу зовёт человека.
  why: Без явных escalation paths AI либо избыточно осторожен, либо ошибается.
  when: Любая AI-система с реальными последствиями (деньги, репутация, юр).
  impact: Trust calibration: 10-20% задач — AI sole, 60-70% — AI+human review, 10% — human-first.
  example: [diagram: confidence × consequence matrix]
  mistakes: Не определить escalation matrix до запуска = боль постфактум.
relatedIds: [agents, p-team, ai-operations, ai-native-customer-support]
```

---

## Решения, требующие approval

> **Q1**: Принимаем 6 sub-разделов или сокращаем до 4 (workflows, orchestration, data, ops)?
> **Q2**: Создаём Tier 1 (5 узлов) одновременно с eCommerce flagship или раньше?
> **Q3**: Добавляем Mermaid-диаграммы в `details.example` или хватает ASCII?

---

_Status: DRAFT | Prev: [04 — Foundation Mapping](./04-foundation-mapping.md) | Next: [06 — Transformation Layer](./06-transformation-layer.md)_

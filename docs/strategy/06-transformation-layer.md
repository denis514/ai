# 06 — Transformation Layer

> **TL;DR**: Transformation — главный value layer Atlas. Описывает, как AI меняет конкретные бизнес-домены, департаменты и роли. Семь основных направлений; флагман — **AI-Native eCommerce** (15 узлов, самый глубокий из всех). Каждый Transformation-узел — это use case с явными связями к Systems и Foundation. Без Transformation Atlas остаётся «энциклопедией tools».

---

## 1. Что Transformation делает уникальным

Transformation — единственный слой, который отвечает на вопрос **бизнеса**:

> «У меня eCommerce-компания. С чего начать AI-трансформацию, какие workflows менять, какие KPI измерять?»

Никакой другой knowledge product этот вопрос системно не отвечает. Это **стратегическая дифференциация** Atlas.

---

## 2. Целевая структура Transformation

```
transformation/
├── ai-native-ecommerce/        ← ФЛАГМАН (15 узлов)
│   ├── ai-pdp-generation
│   ├── ai-search-optimization
│   ├── ai-personalization
│   ├── ai-merchandising
│   ├── ai-cro
│   ├── ai-experimentation
│   ├── ai-checkout-optimization
│   ├── ai-recommendation-systems
│   ├── ai-commerce-support
│   ├── ai-loyalty-systems
│   ├── ai-commerce-analytics
│   ├── ai-pricing-optimization
│   ├── ai-inventory-intelligence
│   ├── ai-customer-segmentation
│   └── commerce-team-workflow
│
├── ai-native-marketing/
│   ├── ai-content-operations
│   ├── ai-campaign-intelligence
│   ├── ai-seo-optimization
│   ├── ai-brand-voice
│   ├── ai-email-marketing
│   ├── ai-social-content
│   └── ai-performance-analytics
│
├── ai-native-product/
│   ├── ai-discovery-research
│   ├── ai-spec-generation
│   ├── ai-roadmap-intelligence
│   ├── ai-feature-experimentation
│   ├── ai-user-feedback-synthesis
│   └── ai-product-analytics
│
├── ai-native-customer-support/
│   ├── ai-tier1-automation
│   ├── ai-agent-assist
│   ├── ai-knowledge-base-ops
│   ├── ai-escalation-intelligence
│   ├── ai-quality-monitoring
│   └── ai-support-analytics
│
├── ai-native-operations/
│   ├── ai-process-automation
│   ├── ai-decision-intelligence
│   ├── ai-reporting-automation
│   ├── ai-resource-optimization
│   └── ai-internal-knowledge-ops
│
├── ai-native-design/
│   ├── ai-design-research
│   ├── ai-prototype-generation
│   ├── ai-design-ops
│   ├── ai-accessibility-automation
│   └── ai-design-system-evolution
│
└── ai-native-enterprise/
    ├── ai-transformation-strategy
    ├── ai-change-management
    ├── ai-governance
    ├── ai-center-of-excellence
    ├── ai-roi-measurement
    └── ai-risk-management
```

**Итого:** 7 направлений, ~55 узлов.

---

## 3. Принципы Transformation-узла

### 3.1 Use Case driven
Каждый узел = конкретный сценарий бизнеса, не маркетинговый текст.

❌ «AI для маркетинга — это будущее»
✅ «AI-генерация PDP: input → product attributes, output → SEO-optimized title + meta + body»

### 3.2 Workflow-centric
Узел показывает workflow: входы → шаги → выходы → метрики.

### 3.3 Foundation + Systems anchoring
Каждый Transformation-узел имеет:
- ≥3 `relatedIds` к Foundation (какие компоненты используются)
- ≥1 `relatedIds` к Systems (какие паттерны применяются)

### 3.4 Business metrics
Узел указывает, какие KPI улучшаются:
- Conversion rate
- Time-to-publish
- Cost per query
- Customer satisfaction
- Etc.

### 3.5 Maturity stages
Опционально: узел может указать stages трансформации (basic / intermediate / advanced).

---

## 4. ФЛАГМАН: AI-Native eCommerce (deep dive)

Это самое стратегически важное направление. Описываем подробно.

### 4.1 Почему eCommerce — флагман

1. **Огромный рынок**: $5T+ глобальный eCommerce
2. **AI value очевиден**: PDP, search, personalization — все приносят measurable ROI
3. **Множество ролей**: merchandiser, CRO specialist, support agent, analyst — все benefit от AI
4. **Workflows ясны**: eCommerce-процессы хорошо документированы
5. **Конкурентов в Atlas-space нет**: нет visual systems-thinking карты AI для eCommerce

### 4.2 Структура AI-Native eCommerce (15 узлов)

| # | Node ID | Title | Workflow | Foundation deps | Systems deps |
|---|--------|------|----------|-----------------|--------------|
| 1 | `ec-pdp-gen` | AI PDP Generation | Product data → AI-generated title/meta/body | prompting, b-system, cap-files | ai-workflows/linear-chain |
| 2 | `ec-search-opt` | AI Search Optimization | Query → embeddings → hybrid retrieve → rerank | af-embeddings, af-vector-db | ai-data-systems/hybrid-search |
| 3 | `ec-personalization` | AI Personalization | User history → context → AI-tailored UX | af-memory-systems, cap-memory | ai-data-systems/knowledge-bases-strategy |
| 4 | `ec-merchandising` | AI Merchandising | Catalog + signals → AI-curated collections | sc-data, cap-files | ai-workflows/conditional-routing |
| 5 | `ec-cro` | AI CRO | A/B copy variants → AI test → winner | prompting, pr-iterate | ai-operations/evals-and-benchmarks |
| 6 | `ec-experimentation` | AI Experimentation | Hypothesis → AI-generated variants → measure | sc-analysis | ai-workflows/feedback-loops |
| 7 | `ec-checkout-opt` | AI Checkout Optimization | Funnel data → AI-detected friction → fix | sc-data, cap-tools | ai-operations/ai-observability |
| 8 | `ec-recommendations` | AI Recommendation Systems | History + catalog → personalized recs | af-embeddings, af-vector-db | ai-data-systems/hybrid-search |
| 9 | `ec-support` | AI Commerce Support | Customer query → AI response → escalation | agents, sc-content | ai-orchestration, ai-human-collaboration |
| 10 | `ec-loyalty` | AI Loyalty Systems | Behavior → AI segments → personalized loyalty | af-memory-systems | ai-data-systems |
| 11 | `ec-analytics` | AI Commerce Analytics | Data → AI-generated insights | sc-data, sc-analysis | ai-operations/ai-observability |
| 12 | `ec-pricing` | AI Pricing Optimization | Demand + competitor + cost → optimal price | sc-data | ai-workflows |
| 13 | `ec-inventory` | AI Inventory Intelligence | Demand forecast + AI signals | sc-data | ai-operations |
| 14 | `ec-segmentation` | AI Customer Segmentation | Behavior → AI-detected segments | af-embeddings | ai-data-systems |
| 15 | `ec-team-workflow` | Commerce Team AI Workflow | How merchandiser/CRO/analyst orchestrate AI | projects, instructions | ai-human-collaboration, ai-orchestration |

### 4.3 Anatomy одного узла (на примере `ec-pdp-gen`)

```js
{
  id: 'ec-pdp-gen',
  title: 'AI PDP Generation',
  category: 'transformation',
  subcategory: 'ai-native-ecommerce',
  level: 'L3',
  icon: 'tag',
  details: {
    what: `Автоматическая генерация Product Detail Pages из product data:
            AI создаёт SEO-optimized title, meta description, marketing body,
            attribute tables — из raw input (product specs, images, brand voice).`,
    why: `Команды контента не успевают за каталогом: 10k SKU = 10k часов на ручной copy.
          AI-PDP сокращает до 2-3 минут на SKU при сравнимом качестве.`,
    when: `Когда каталог > 500 SKU и contentmакеров ≤ 5.
           Когда нужна локализация на 3+ языка.
           Когда SEO-метрики хуже конкурентов.`,
    impact: `Time-to-publish: 4 часа → 5 минут.
             Coverage: 30% → 100%.
             SEO traffic: +25-40% за 3 месяца.`,
    example: `Workflow:
              [Product CSV: name, attributes, images]
                ↓
              [AI Step 1: extract product type + key attributes]
                ↓
              [AI Step 2: generate SEO title (60 chars) + meta (160 chars)]
                ↓
              [AI Step 3: generate marketing body (300-500 words) in brand voice]
                ↓
              [AI Step 4: generate attribute table HTML]
                ↓
              [Quality gate: human review or auto-publish if score > 0.85]
                ↓
              [Output: CMS-ready PDP draft]`,
    mistakes: `1. Запускать на всём каталоге сразу — качество будет деградировать.
                Начинать с 50-100 SKU + brand voice tuning.
                2. Не делать quality gate — спам в каталог.
                3. Не локализовать brand voice — generic UK English на финском рынке.`
  },
  relatedIds: [
    'prompting',           // Foundation — как промптить
    'b-system',            // Foundation — system prompt
    'cap-files',           // Foundation — work with product files
    'ai-workflows',        // Systems — workflow pattern
    'ai-operations',       // Systems — evals
    'ec-search-opt',       // L3 cross-link
    'ec-merchandising'     // L3 cross-link
  ]
}
```

Это **минимальный bar** для Transformation-узла: явный workflow, конкретные метрики, anchor в Foundation и Systems.

### 4.4 eCommerce Use Cases — рекомендуемые пути

Use cases — это **пути через узлы**. Для eCommerce:

| Use case | Путь |
|----------|------|
| «Запускаем AI в каталоге» | ec-pdp-gen → ec-merchandising → ec-search-opt |
| «AI для CRO» | ec-cro → ec-experimentation → ec-personalization |
| «AI для поддержки» | ec-support → ai-orchestration → ai-human-collaboration |
| «AI ROI estimation» | ec-analytics → ec-team-workflow → ai-operations/cost-management |

---

## 5. Остальные direction (краткие blueprint'ы)

### 5.1 AI-Native Marketing (7 узлов)

**Фокус:** контент-операции, кампании, бренд.

**Топ-3 узла по value:**
- `mk-content-ops` — AI Content Operations
- `mk-campaign-intel` — AI Campaign Intelligence  
- `mk-brand-voice` — AI Brand Voice

### 5.2 AI-Native Product (6 узлов)

**Фокус:** product discovery, spec generation, experimentation.

**Топ-3 узла:**
- `pr-discovery` — AI Discovery Research
- `pr-spec-gen` — AI Spec Generation
- `pr-feedback-synth` — User Feedback Synthesis

### 5.3 AI-Native Customer Support (6 узлов)

**Фокус:** tier-1 автоматизация, agent assist, escalation.

**Топ-3 узла:**
- `cs-tier1` — AI Tier-1 Automation
- `cs-agent-assist` — AI Agent Assist
- `cs-escalation` — Escalation Intelligence

### 5.4 AI-Native Operations (5 узлов)

**Фокус:** internal process automation, reporting, decision support.

### 5.5 AI-Native Design (5 узлов)

**Фокус:** research, prototypes, design ops, accessibility.

### 5.6 AI-Native Enterprise (6 узлов)

**Фокус:** transformation strategy, governance, ROI, CoE.

---

## 6. Anti-patterns Transformation-узлов

| ❌ Антипаттерн | Почему плохо |
|---------------|-------------|
| «AI changes marketing» (generic) | Без use case = маркетинговый текст |
| Дубликат с Systems | Если узел описывает паттерн — это L2, а не L3 |
| Без metrics | Transformation без измеряемого impact = не Transformation |
| Vendor-specific | «Salesforce AI для marketing» = частный случай, не L3 |
| Без team workflow | Transformation = команда, а не одинокий AI |
| Без maturity guidance | Не указано, где компания должна быть, чтобы внедрить |

---

## 7. Maturity model для Transformation

Каждое направление имеет 4 стадии (опционально в `details`):

```
Stage 0 — Pre-AI
  Команда работает без AI. Atlas помогает понять value.

Stage 1 — AI Experiments
  1-2 AI-инструмента, ad-hoc. Нет workflow integration.

Stage 2 — AI Workflows
  AI встроен в 3-5 ключевых workflow. Есть quality gates.

Stage 3 — AI-Native Operations
  AI = первый класс citizen в processes. Метрики измеряются. Team trained.

Stage 4 — AI-First Strategy
  Компания строит новые бизнес-модели вокруг AI capabilities.
```

Atlas Transformation layer показывает **как пройти Stage 1 → Stage 3**.

---

## 8. Tutorial / Workflow connection

Каждое Transformation-направление обзаводится:
- 1 «Quick-start workflow» (3-4 шага через ключевые узлы)
- 1 «Deep transformation playbook» (10+ шагов с Foundation/Systems references)

Это заменяет «курсы» в новой парадигме.

Существующий `claude-for-business` курс становится anchor для `ai-native-enterprise/ai-transformation-strategy`. Существующий `claude-for-educators` — anchor для нового `ai-native-education` (вне списка 7, кандидат на расширение).

---

## 9. Visual representation

В radial mindmap:
- Transformation узлы = **внешнее кольцо**
- Цвет = #059669 (зелёный)
- Иконки = role/department-oriented (cart, megaphone, headset, gear, palette, building)

В UI:
- Главный entry point для бизнес-аудитории — «Start with your role»
- Каждый Transformation-direction имеет свой landing-узел с overview
- Cross-links к Systems и Foundation подсвечиваются особым цветом

---

## 10. Метрики качества Transformation-направления

Направление считается «готовым», если:

1. ✅ ≥5 узлов в группе
2. ✅ ≥1 «quick-start workflow»
3. ✅ ≥1 «deep transformation playbook»
4. ✅ Каждый узел имеет ≥3 Foundation refs + ≥1 Systems ref
5. ✅ Каждый узел имеет measurable metrics
6. ✅ Локализация на ru/en/fi
7. ✅ Maturity stages указаны (опционально, рекомендуется)
8. ✅ ≥1 узел про team workflow / role orchestration

---

## 11. Roadmap Transformation

### Q1 (немедленно)
- ✅ Flagship `ai-native-ecommerce` — 15 узлов
- ✅ `ai-native-enterprise/ai-transformation-strategy` (anchor от claude-for-business)

### Q2
- `ai-native-marketing` — 7 узлов
- `ai-native-customer-support` — 6 узлов

### Q3
- `ai-native-product` — 6 узлов
- `ai-native-design` — 5 узлов

### Q4
- `ai-native-operations` — 5 узлов
- Полный `ai-native-enterprise` — 6 узлов

**Total год**: ~55 Transformation-узлов.

---

## Решения, требующие approval

> **Q1**: Подтверждаем eCommerce как флагман (vs Marketing или Product)?
> **Q2**: 15 узлов eCommerce — реалистично? Возможно начать с 8-10 ключевых?
> **Q3**: Делаем `ai-native-education` как 8-е направление (учитывая `claude-for-educators` уже есть)?
> **Q4**: Maturity stages — обязательны в каждом узле или опциональны?

---

_Status: DRAFT | Prev: [05 — Systems Layer](./05-systems-layer.md) | Next: [07 — Use Cases](./07-use-cases.md)_

# 07 — Use Cases (связующий элемент)

> **TL;DR**: Use Case — отдельный конструкт, не подмножество Transformation. Это **именованный путь через узлы** разных уровней, который ведёт пользователя от вопроса к решению. Use Cases — главная навигационная единица для бизнес-аудитории. Они заменяют «курсы» в новой архитектуре.

---

## 1. Что такое Use Case

Use Case ≠ Transformation узел.
Use Case ≠ Tutorial.
Use Case ≠ Learning path.

**Use Case = named cross-layer path**, который связывает:
- Конкретный бизнес-вопрос (entry)
- Foundation-узлы (что использовать)
- Systems-узлы (как соединить)
- Transformation-узлы (как применить)
- Результат (что получит пользователь)

### Пример Use Case

**Name:** «Запускаем AI в каталоге eCommerce»

**Entry question:** «У нас 5000 SKU без хорошего описания. Что делать?»

**Path:**
```
Step 1 (Transformation):  ec-pdp-gen          — что такое AI PDP generation
Step 2 (Foundation):       prompting, b-system — как написать system prompt
Step 3 (Foundation):       i-templates         — собрать template
Step 4 (Systems):          ai-workflows/linear-chain — оформить workflow
Step 5 (Systems):          ai-operations/evals  — добавить quality gate
Step 6 (Transformation):  ec-merchandising     — расширить на коллекции
```

**Outcome:** пользователь имеет работающий PDP-workflow для своей команды.

---

## 2. Use Case vs Learning Path vs Tutorial

| Конструкт | Что описывает | Linear? | Cross-layer? | Audience |
|-----------|---------------|---------|--------------|----------|
| Tutorial | Один узел/тема, 6 шагов | Linear | No | Single role |
| Learning Path | Маршрут из узлов/туториалов | Linear | Partial | Single role |
| **Use Case** | Бизнес-сценарий | **Non-linear** | **Yes (L1+L2+L3)** | **Cross-role** |

Use Case — НОВЫЙ конструкт, дополняет существующие, не заменяет.

---

## 3. Зачем Use Cases нужны

### 3.1 Решает проблему «откуда начать»

Сегодня пользователь видит 12 разделов и не знает, с чего начать. Use Cases дают **точки входа по бизнес-вопросу**.

### 3.2 Связывает 3 уровня в единую историю

Transformation узлы без связей с Foundation/Systems — абстракции. Foundation узлы без Transformation — техника без цели. Use Case — клей.

### 3.3 Позволяет «non-linear» навигацию

Tutorial — linear. Path — linear. Use Case — это **граф с явной точкой входа и измеримым результатом**.

### 3.4 Заменяет «курсы» как продаваемую сущность

Atlas теперь продаёт **Use Cases**, не курсы. «Stripe + Atlas: Launch AI Catalog» — это Use Case, не курс.

---

## 4. Схема Use Case (data structure)

```js
{
  id: 'uc-ai-catalog-launch',
  title: 'Запускаем AI в eCommerce-каталоге',
  category: 'use-case',
  audience: 'eCommerce / Merchandiser',
  level: 'intermediate',
  outcome: 'Работающий PDP workflow для 500+ SKU за 2 недели',
  metrics: ['time-to-publish ↓ 95%', 'SEO coverage ↑ 100%'],
  steps: [
    {
      type: 'transformation',
      id: 'ec-pdp-gen',
      why: 'Понять value и workflow'
    },
    {
      type: 'foundation',
      id: 'prompting',
      why: 'Освоить system prompts для бренда'
    },
    {
      type: 'systems',
      id: 'ai-workflows-linear-chain',
      why: 'Оформить процесс как workflow'
    },
    {
      type: 'systems',
      id: 'ai-operations-evals',
      why: 'Добавить quality gate'
    },
    {
      type: 'transformation',
      id: 'ec-merchandising',
      why: 'Расширить на коллекции'
    }
  ],
  prerequisites: ['ai-fluency'],   // optional tutorials
  estimatedTime: '4 hours read + 2 weeks implementation',
  relatedUseCases: ['uc-ai-search-launch', 'uc-ai-personalization-pilot']
}
```

---

## 5. Каталог стартовых Use Cases (приоритет Q1-Q2)

### eCommerce Use Cases (8)
1. `uc-ai-catalog-launch` — Запускаем AI в каталоге
2. `uc-ai-search-launch` — AI Search для catalog
3. `uc-ai-personalization-pilot` — Personalization MVP
4. `uc-ai-checkout-friction` — Уменьшаем friction в чекауте
5. `uc-ai-cro-experiment` — AI-CRO эксперимент
6. `uc-ai-support-tier1` — AI-поддержка tier 1
7. `uc-ai-loyalty-segments` — Segmented loyalty с AI
8. `uc-ai-team-orchestration-commerce` — AI workflow для commerce team

### Marketing Use Cases (4)
9. `uc-ai-content-ops-launch` — Content operations с AI
10. `uc-ai-brand-voice-tuning` — Tuning brand voice
11. `uc-ai-campaign-launch` — AI campaign pipeline
12. `uc-ai-seo-optimization` — AI SEO at scale

### Product Use Cases (3)
13. `uc-ai-user-research-synthesis` — Research synthesis
14. `uc-ai-spec-generation` — AI specs из user feedback
15. `uc-ai-experiment-design` — A/B variant generation

### Customer Support Use Cases (3)
16. `uc-ai-support-launch` — Запуск AI-tier1
17. `uc-ai-agent-assist` — Agent assist deployment
18. `uc-ai-knowledge-base-ai` — AI KB ops

### Generic / Cross-vertical (4)
19. `uc-claude-project-foundation` — Claude Project как базовый workflow
20. `uc-mcp-integration` — Подключаем external tool через MCP
21. `uc-multi-agent-system` — Multi-agent системы
22. `uc-ai-roi-estimation` — Как оценить ROI AI-проекта

**Итого Q1-Q2:** 22 Use Cases.

---

## 6. Use Case как UI-конструкт

### 6.1 В CoursesModal → переименование

```
Сейчас:
  CoursesModal с табами «Маршруты» / «Курсы»

После:
  WorkflowsModal с табами:
  ├── Use Cases       (22 use cases)
  ├── Workflows       (короткие workflow-туториалы)
  └── Pathways        (existing learning paths)
```

### 6.2 Use Case Detail page

Открывается клик на Use Case в WorkflowsModal:

```
┌──────────────────────────────────────────┐
│ uc-ai-catalog-launch                     │
│ Запускаем AI в eCommerce-каталоге         │
│ ──────────────────────────────────────── │
│ Outcome: Working PDP workflow / 2 weeks  │
│ Metrics: TtP ↓95%, SEO ↑100%             │
│                                          │
│ Step 1: ec-pdp-gen (Transformation)      │
│   → why: understand value                │
│   → estimated: 15 min                    │
│                                          │
│ Step 2: prompting (Foundation)           │
│   → why: system prompts                  │
│   → estimated: 25 min                    │
│ ...                                      │
│                                          │
│ Related Use Cases:                       │
│ ├── uc-ai-search-launch                  │
│ └── uc-ai-personalization-pilot          │
└──────────────────────────────────────────┘
```

### 6.3 Use Case Entry point на главной

Главная страница (mindmap canvas) получает доп. CTA:

```
«Не знаете, с чего начать?»
[Выбрать по роли ▾]   [Выбрать по проблеме ▾]
```

При выборе → список релевантных Use Cases.

---

## 7. Принципы создания Use Case

### 7.1 Минимум 3 уровня в path
Use Case без Foundation, Systems и Transformation = это просто learning path. Use Case обязан cross-layer.

### 7.2 Measurable outcome
Outcome должен быть измеримым и временно-ограниченным. Не «понимание AI», а «working workflow for 500 SKUs in 2 weeks».

### 7.3 Single audience
Один Use Case = одна role audience. Не «для marketing AND product». Если оба — это два разных Use Case.

### 7.4 Real metrics
В `metrics` указываются конкретные числа из реальных применений. Не «improves quality», а «time-to-publish ↓ 95%».

### 7.5 Real prerequisites
В `prerequisites` указываются обязательные знания/туториалы. Если AI-Fluency обязателен — указать.

### 7.6 Cross-link с другими Use Cases
`relatedUseCases` — обязательное поле. ≥2 связи.

---

## 8. Где хранить Use Cases

### 8.1 Файл

Новый: `src/data/useCases.js`

```js
// Структура: { id: { title, audience, level, outcome, metrics[], steps[], prerequisites[], estimatedTime, relatedUseCases[] } }

export const useCases = {
  'uc-ai-catalog-launch': {
    nodeId: 'ec-pdp-gen',   // anchor node для DetailPanel binding
    audience: 'business',
    level: 'intermediate',
    steps: [...],
    relatedUseCases: ['uc-ai-search-launch']
  },
  ...
};
```

### 8.2 Локализация

`src/locales/<lang>/useCases.json`:
```json
{
  "uc-ai-catalog-launch": {
    "title": "Запускаем AI в eCommerce-каталоге",
    "outcome": "...",
    "steps": {
      "step-1": { "why": "..." }
    }
  }
}
```

### 8.3 Code splitting

Use Cases — отдельный chunk, lazy-loaded (как nodes/tutorials).

---

## 9. Use Case vs Tutorial — разделение труда

### Tutorial

Описывает **один узел/тему** в 4-6 шагах. Каждый шаг — концепт.

Пример: `ai-fluency` (6 шагов про AI Fluency framework).

### Use Case

Описывает **бизнес-цель** через 4-8 шагов. Каждый шаг — узел Foundation/Systems/Transformation.

Пример: `uc-ai-catalog-launch` (6 шагов через 3 уровня).

### Когда что использовать

- Учим **концепт** → Tutorial
- Решаем **бизнес-задачу** → Use Case
- Документируем **технологию** → Foundation node
- Описываем **паттерн** → Systems node
- Показываем **трансформацию** → Transformation node

---

## 10. Use Cases — основной marketing-asset

В позиционировании Atlas:

> «105 Atlas — это библиотека из 50+ AI Use Cases для команд, которые становятся AI-native»

Use Cases — это:
- Контент, который реально полезен бизнесу
- SEO-богатый (каждый Use Case = landing page potential)
- Шеринг-готовый («Покажу этот Use Case коллеге»)
- Premium-кандидат (можно делать premium Use Cases)

---

## 11. Метрики качества Use Case

Use Case готов к публикации, если:

1. ✅ Cross-layer (≥1 L1, ≥1 L2, ≥1 L3 в steps)
2. ✅ Outcome измерим (числа + срок)
3. ✅ Metrics конкретные (≥2 KPI)
4. ✅ Steps reasoned (`why` для каждого)
5. ✅ ≥2 `relatedUseCases`
6. ✅ Audience указан явно
7. ✅ Level указан явно
8. ✅ Локализация ru/en/fi
9. ✅ Prerequisites указаны
10. ✅ Estimated time реалистична

---

## 12. Pipeline создания Use Case

```
1. Определить audience + бизнес-вопрос
2. Выбрать 3-5 anchor узлов (L1 + L2 + L3)
3. Сформулировать outcome + metrics
4. Прописать steps с why
5. Найти ≥2 related Use Cases
6. Локализовать ru/en/fi
7. Добавить в useCases.js + locales
8. Связать с relevant nodes через relatedIds
9. Опубликовать в WorkflowsModal
```

---

## Решения, требующие approval

> **Q1**: Введём Use Case как 4-й layer (отдельная категория) или подмножество Transformation?
> **Q2**: 22 Use Cases для Q1-Q2 — приоритизируем как? Начинаем с eCommerce 8?
> **Q3**: Переименовываем CoursesModal → WorkflowsModal сразу или после migration?
> **Q4**: Делаем Use Case premium-feature кандидатом (некоторые UC платные)?

---

_Status: DRAFT | Prev: [06 — Transformation Layer](./06-transformation-layer.md) | Next: [08 — Migration Plan](./08-migration-plan.md)_

# 08 — Migration Plan

> **TL;DR**: Миграция в 5 фаз, ~3 месяца. Принцип: **expand, not rebuild**. Существующая структура остаётся работать на каждом шаге. Phase 1 — structural seeds (30 минут). Phase 5 — full repositioning. Каждая Phase имеет explicit acceptance criteria.

---

## 1. Принципы миграции

### 1.1 Zero-downtime для пользователей
На каждой фазе приложение работает. Никаких «недоступных версий».

### 1.2 Zero data loss
User progress (Supabase + localStorage) переживает миграцию без потерь.

### 1.3 Incremental risk
Каждая фаза изолирована. Если Phase 3 идёт плохо — не блокирует Phase 2 работающую.

### 1.4 ID immutability
Никакой существующий ID узла, туториала, пути не меняется. Это критично для:
- Hash routes (`#/ru/node/<id>`)
- Supabase user data
- External backlinks (если есть)
- `whatsNew.js` markers

### 1.5 Backward compatibility
Все 5 текущих категорий продолжают работать как фильтр. Новые добавляются параллельно.

---

## 2. Roadmap фаз

```
Phase 1: Structural Seeds        [30 минут]    Week 1
Phase 2: AI Fundamentals          [3-5 дней]   Week 2-3
Phase 3: eCommerce Flagship       [2-3 недели] Week 4-6
Phase 4: Systems Layer (Tier 1)   [2 недели]   Week 7-8
Phase 5: Repositioning + UI       [2 недели]   Week 9-10
```

---

## 3. Phase 1 — Structural Seeds (30 минут)

### Цель
Добавить новые root-узлы `systems` и `transformation` без нарушения существующего.

### Изменения

**`src/data/mindmapData.js`** — добавить в конец `root.children`:

```js
{
  id: 'systems',
  category: 'systems',          // НОВАЯ категория
  level: 'L2',
  icon: 'network',
  children: [
    {
      id: 'sys-overview',
      category: 'systems',
      level: 'L2',
      icon: 'sparkles'
    }
  ]
},
{
  id: 'transformation',
  category: 'transformation',   // НОВАЯ категория
  level: 'L3',
  icon: 'rocket',
  children: [
    {
      id: 'tf-overview',
      category: 'transformation',
      level: 'L3',
      icon: 'sparkles'
    }
  ]
}
```

**Категории — добавить в `CATEGORIES`:**

```js
'systems': {
  label: 'Системы',
  color: '#0891b2'
},
'transformation': {
  label: 'Трансформация',
  color: '#059669'
}
```

**Локализация:** 4 узла (2 anchor + 2 overview) на ru/en/fi.

### Acceptance criteria

- ✅ Build passes
- ✅ Mindmap отображает 2 новые ветки без сбоев
- ✅ Фильтр категорий показывает 7 опций (было 5)
- ✅ Старые 12 разделов работают как раньше
- ✅ Hash routes работают
- ✅ `sync-whats-new.mjs` отрабатывает корректно

### Риск: 🟢 Минимальный

---

## 4. Phase 2 — AI Fundamentals (3-5 дней)

### Цель
Добавить 10 новых узлов `ai-fundamentals` под Foundation. Закрыть пробел universal AI knowledge.

### Изменения

**Новая ветка в `mindmapData.js`** под root (рядом с basics):

```js
{
  id: 'ai-fundamentals',
  category: 'foundation',
  level: 'L1',
  icon: 'brain',
  children: [
    { id: 'af-llm-basics', category: 'foundation', level: 'L1' },
    { id: 'af-tokens-context', ... },
    { id: 'af-embeddings', ... },
    { id: 'af-vector-db', ... },
    { id: 'af-rag-basics', ... },
    { id: 'af-fine-tuning', ... },
    { id: 'af-memory-systems', ... },
    { id: 'af-multimodal', ... },
    { id: 'af-inference', ... },
    { id: 'af-safety-fund', ... }
  ]
}
```

**Контент:** 10 узлов × 6 полей (what/why/when/impact/example/mistakes) × 3 локали = 180 текстовых блоков.

**Cross-links:**
- `af-embeddings` ↔ `cap-search`
- `af-memory-systems` ↔ `cap-memory`
- `af-multimodal` ↔ `cap-vision`, `cap-files`
- (см. документ 04)

### Acceptance criteria

- ✅ 10 узлов с полным контентом ru/en/fi
- ✅ `sync-whats-new.mjs` пометил их как `new`
- ✅ ≥2 `relatedIds` от каждого нового узла к существующим
- ✅ Build passes, bundle <2% увеличение
- ✅ Search находит новые узлы
- ✅ Учтены в lazy chunks

### Риск: 🟢 Низкий
Только контент-добавление, никаких структурных изменений ломающих UX.

---

## 5. Phase 3 — eCommerce Flagship (2-3 недели)

### Цель
Создать первый Transformation-direction `ai-native-ecommerce`. 15 узлов, флагман.

### Изменения

**Структура в `mindmapData.js`** под `transformation`:

```js
{
  id: 'transformation',
  children: [
    {
      id: 'ai-native-ecommerce',
      category: 'transformation',
      level: 'L3',
      icon: 'tag',
      children: [
        { id: 'ec-pdp-gen', ... },
        { id: 'ec-search-opt', ... },
        // ... 13 more
      ]
    }
  ]
}
```

**Контент:** 15 узлов × 6 полей × 3 локали = 270 текстовых блоков + workflow diagrams.

**Use Cases:** одновременно создать 4-6 eCommerce Use Cases:
- `uc-ai-catalog-launch`
- `uc-ai-search-launch`
- `uc-ai-personalization-pilot`
- `uc-ai-checkout-friction`

**Новый файл:** `src/data/useCases.js` + локализации.

**Связи:**
- Каждый ec-* узел → ≥3 Foundation `relatedIds`
- Каждый ec-* узел → ≥1 Systems `relatedIds`

### Acceptance criteria

- ✅ 15 узлов eCommerce
- ✅ 4-6 Use Cases в useCases.js
- ✅ Полный набор cross-links
- ✅ Workflow diagrams в `details.example`
- ✅ Metrics указаны в каждом узле
- ✅ Локализация ru/en/fi
- ✅ Build passes, bundle <5% увеличение
- ✅ Lazy load работает для нового chunk
- ✅ Acceptance test: пользователь может найти eCommerce content через все пути (search, filter, mindmap)

### Риск: 🟡 Средний
Большой объём контента. Риск: качество vs скорость. Mitigation: agent-driven content generation + ручной review.

### Подзадачи

1. Создать схему `useCases.js`
2. Написать 15 узлов eCommerce (можно делегировать agent'у)
3. Написать 4-6 Use Cases (manual для качества)
4. Локализовать ru/en/fi
5. Добавить workflow diagrams
6. Cross-link с Foundation
7. UI: добавить кнопку «AI eCommerce» в навигации (опционально)

---

## 6. Phase 4 — Systems Layer Tier 1 (2 недели)

### Цель
Добавить 5 Tier 1 Systems-узлов: те, которые нужны для eCommerce flagship.

### Tier 1 узлы

1. `ai-workflows/what-is-ai-workflow`
2. `ai-workflows/workflow-patterns/linear-chain`
3. `ai-data-systems/rag-architecture-patterns`
4. `ai-data-systems/hybrid-search`
5. `ai-integration-systems/api-integration-patterns`

### Изменения

**Структура под `systems`:**

```js
{
  id: 'systems',
  children: [
    {
      id: 'ai-workflows',
      category: 'systems',
      level: 'L2',
      children: [
        { id: 'sys-wf-overview', ... },
        { id: 'sys-wf-linear-chain', ... }
      ]
    },
    {
      id: 'ai-data-systems',
      category: 'systems',
      children: [
        { id: 'sys-ds-rag-patterns', ... },
        { id: 'sys-ds-hybrid-search', ... }
      ]
    },
    {
      id: 'ai-integration-systems',
      category: 'systems',
      children: [
        { id: 'sys-is-api-patterns', ... }
      ]
    }
  ]
}
```

**Контент:** 5 узлов × 6 полей × 3 локали = 90 текстовых блоков + diagrams.

**Связи:**
- Все Foundation/Systems узлы → Tier 1 Systems
- Tier 1 Systems → eCommerce узлы (`ec-pdp-gen` использует `sys-wf-linear-chain`)

### Acceptance criteria

- ✅ 5 Tier 1 узлов с diagrams
- ✅ Cross-links двусторонние с Foundation и eCommerce
- ✅ Build passes
- ✅ Acceptance test: пользователь может пройти Use Case полностью

### Риск: 🟢 Низкий
Меньше контента чем Phase 3, но требует точности (architectural language).

---

## 7. Phase 5 — Repositioning + UI (2 недели)

### Цель
Финальный шаг — UI / brand / messaging shift на «AI Transformation OS».

### Изменения UI

#### 7.1 Rename CoursesModal → WorkflowsModal

```diff
- CoursesModal.jsx       → WorkflowsModal.jsx
- src/data/tutorials.js  → остаётся как есть (туториалы — отдельная сущность)
+ Новая вкладка «Use Cases» в WorkflowsModal
```

#### 7.2 Update copy

| Где | Сейчас | Замена |
|-----|--------|--------|
| `header.learning` | «Обучение» | «Workflows» |
| `courses.title` | «Обучение по Claude» | «AI Transformation Paths» |
| `courses.courses` | «Курсы» | «Workflows» |
| `mobile.menuTitle` | «Меню» | без изменений |
| `header.menu.title` | «Меню» | без изменений |

#### 7.3 Главный tagline и meta

`index.html`:
```html
<title>105 Atlas — AI Transformation OS</title>
<meta name="description" content="...">
```

#### 7.4 IntroModal update

Сейчас 2 слайда: «что это + ваша роль». После:
- Слайд 1: AI Transformation OS positioning
- Слайд 2: Foundation / Systems / Transformation as 3 layers
- Слайд 3: Choose your starting path (по роли)

#### 7.5 WelcomeCard / Onboarding

Меняется first-touch experience: вместо «вводный урок» → «выбери use case по роли».

#### 7.6 Categories UI

Show 3 super-categories tabs (Foundation / Systems / Transformation) поверх existing 5+2 category filter.

### Acceptance criteria

- ✅ Все user-facing тексты обновлены
- ✅ i18n ru/en/fi consistency
- ✅ Brand/positioning переходит на «AI Transformation OS»
- ✅ Старые data (tutorials, learning paths) работают как раньше
- ✅ A/B test: измерить engagement до/после rebrand (опционально)

### Риск: 🟡 Средний
Меняется brand-восприятие. Может потребоваться communication для existing users.

---

## 8. Параллельные tracks

Phases 2-5 могут идти параллельно с другими задачами:

### Track A: Architecture migration
Phase 1 → 2 → 3 → 4 → 5

### Track B: Content batches
- Tutorials Batch 3 (mcp-advanced, building-evaluations) — можно делать параллельно с Phase 2
- Learning Paths For Business + For Educators — параллельно с Phase 3

### Track C: Tech debt
- Supabase session timebox
- Outdated nodes audit (`cap-computer`, `b-knowledge`, `pl-platforms`)

---

## 9. Risk register

| Риск | Вероятность | Impact | Mitigation |
|------|-------------|--------|------------|
| Bundle size > 30% увеличение | Medium | High | Lazy load + chunk splitting per layer |
| Контент-генерация качество (Transformation) | High | High | Manual review + agent-assisted, итерационно |
| User confusion после repositioning | Medium | Medium | Smooth onboarding update + communication |
| Mindmap layout с 3 root-уровнями | Medium | Medium | Iterate layout algorithm, тестировать на 200+ nodes |
| Существующие deep links сломаются | Low | High | ID immutability rule, regression tests |
| Search ranking деградирует | Low | Medium | Re-index after each phase |

---

## 10. Definition of Done — финальная миграция

Полная миграция считается завершённой, когда:

1. ✅ 3-layer architecture видна в mindmap UI
2. ✅ `ai-fundamentals` раздел работает (10 узлов)
3. ✅ `ai-native-ecommerce` полный (15 узлов)
4. ✅ Tier 1 Systems узлы (5) работают
5. ✅ ≥4 Use Cases в useCases.js
6. ✅ Repositioning copy завершён
7. ✅ Bundle size <115% от baseline
8. ✅ Lighthouse score не упал (>90)
9. ✅ User progress preserved через миграцию
10. ✅ Build / lint / smoke tests passes
11. ✅ Документация в `docs/strategy/` обновлена статусом `IMPLEMENTED`

---

## 11. Расписание (rough)

```
Week 1:    Phase 1 — Structural Seeds ✓
Week 2-3:  Phase 2 — AI Fundamentals ✓
Week 4-6:  Phase 3 — eCommerce Flagship ✓
Week 7-8:  Phase 4 — Systems Tier 1 ✓
Week 9-10: Phase 5 — Repositioning ✓
            ─────────────────────────
Total:     ~10 недель / 2.5 месяца
```

При параллельной работе с другими треками — может растянуться на 3 месяца.

---

## 12. После миграции

Atlas после Phase 5:

- 133 + ~50 = **~183 узла**
- 3 root-уровня (Foundation / Systems / Transformation)
- 1 flagship Transformation (eCommerce)
- ≥4 Use Cases как новый primary user journey
- Bundle ~95 KB initial gzip (с lazy для new chunks)
- Pozitioning: «AI-Native Transformation OS»

Это **MVP новой архитектуры**. Дальнейшие directions (Marketing, Product, Support) — после.

---

## Решения, требующие approval

> **Q1**: Принимаем roadmap (Phase 1-5, ~10 недель)?
> **Q2**: Начинаем с Phase 1 (минимальный риск) или сразу с Phase 2 (AI Fundamentals — content value)?
> **Q3**: Repositioning (Phase 5) делаем после Phase 4 или раньше (например, между Phase 2 и 3)?
> **Q4**: Парралельно с миграцией продолжаем туториалы Batch 3 или замораживаем contentmaking до Phase 5?

---

_Status: IMPLEMENTED (2026-05-22) | Prev: [07 — Use Cases](./07-use-cases.md) | Next: [09 — Relationships & Scaling](./09-relationships-scaling.md)_

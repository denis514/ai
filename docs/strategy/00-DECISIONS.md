# 00 — Architecture Decisions (APPROVED)

> **Status: APPROVED — 2026-05-22**
> Все ключевые архитектурные решения, на основе которых начинается Phase 1.
> Этот документ — единственный источник правды для реализации.

---

## 1. Архитектура — 4 уровня

```
LEVEL 4 — USE CASES
  «Что я хочу решить как бизнес/специалист»
  Узлы в mindmap с особым цветом/иконкой,
  cross-layer paths через L1+L2+L3
                ↑
LEVEL 3 — TRANSFORMATION
  «Как AI меняет бизнес»
  Operations (flagship), Marketing, Product, Support, ...
                ↑
LEVEL 2 — SYSTEMS (6 sub-разделов)
  «Как AI работает как система»
  workflows / orchestration / data / integration / human-AI / ops
                ↑
LEVEL 1 — FOUNDATION
  «Как работают AI-компоненты»
  Существующие 133 узла + новые ai-fundamentals
```

**Решение:** Use Cases = **4-й равноправный уровень**, не подмножество Transformation.
**Решение:** Use Cases **живут в mindmap** на карте (особый цвет/иконка), не в отдельной модалке.

---

## 2. Foundation — реальный узел

`root.foundation` — реальный node в mindmap, не виртуальный layer.
Все 12 существующих разделов становятся его детьми.

---

## 3. Brand & Naming

| Элемент | Решение |
|---------|---------|
| Название | **«105 Atlas»** (без OS-суффикса) |
| Tagline | TBD (не «AI-Native Transformation OS») |
| Tutorial → | **Workflow** (полная замена в коде и UI) |
| CoursesModal → | **WorkflowsModal** (в Phase 1) |
| Категории | **Migrate сразу** к новой схеме (не legacy compatible) |

---

## 4. Контент-стратегия

### Transformation flagship
**Operations (5 узлов)** — самое маленькое направление, быстрый старт.
Не eCommerce (отложен на следующую итерацию).

### AI fundamentals
**Итерационно по 3-4 узла в релиз**. 3 релиза × 3-4 узла = 10 за месяц.

### Systems
**6 sub-разделов** (полная схема стратегии): workflows, orchestration, data, integration, human-AI, ops.

### Maturity stages
**Обязательны** в каждом Transformation-узле (Stage 0-4).

### Туториалы Batch 3
**Приостановлены** до завершения Phase 3.

---

## 5. Tech решения

| Решение | Status |
|---------|--------|
| Поле `level` в схеме узла | **Позже** (не в Phase 1) — выводим из родителя |
| Premium Use Cases | **Решим позже** — сейчас всё free |

---

## 6. Phase 1 — что делаем (30 минут)

### 6.1 mindmapData.js — изменения

**Добавить 4 новых root-узла:**

```js
{
  id: 'foundation',
  category: 'foundation',
  icon: 'brain',
  children: [
    // существующие 12 разделов переезжают сюда
    { id: 'basics', ... },
    { id: 'platform', ... },
    // ... 10 more
  ]
},
{
  id: 'systems',
  category: 'systems',
  icon: 'network',
  children: [
    { id: 'sys-overview', icon: 'sparkles' }
  ]
},
{
  id: 'transformation',
  category: 'transformation',
  icon: 'rocket',
  children: [
    { id: 'tf-overview', icon: 'sparkles' }
  ]
},
{
  id: 'use-cases',
  category: 'use-cases',
  icon: 'target',
  children: [
    { id: 'uc-overview', icon: 'sparkles' }
  ]
}
```

### 6.2 Категории — миграция

**Замена 5 → 8 категорий:**

```js
export const CATEGORIES = {
  'foundation':     { label: 'Foundation',     color: '#2563eb' },
  'prompts':        { label: 'Prompts',        color: '#d97706' },
  'configuration':  { label: 'Configuration',  color: '#0e7490' },
  'automation':     { label: 'Automation',     color: '#7c3aed' },
  'agents':         { label: 'Agents',         color: '#dc2626' },
  'systems':        { label: 'Systems',        color: '#0891b2' },
  'transformation': { label: 'Transformation', color: '#059669' },
  'use-cases':      { label: 'Use Cases',      color: '#f59e0b' }
};
```

**Перенос узлов:** все узлы с `category: 'основы'` → `foundation`, `настройка` → `configuration`, etc.

### 6.3 UI — изменения

| Файл | Изменение |
|------|-----------|
| `CoursesModal.jsx` → `WorkflowsModal.jsx` | Полный rename файла и компонента |
| Все `t('courses.*')` | → `t('workflows.*')` |
| Локализация ru/en/fi | Курсы/Tutorial → Workflow в UI-тексте |
| `CanvasFilters.jsx` | Поддержка 8 категорий вместо 5 |

### 6.4 Acceptance criteria Phase 1

- ✅ 4 новых root-узла видны в mindmap
- ✅ 12 старых разделов работают как дети foundation
- ✅ 8 категорий работают в фильтре
- ✅ WorkflowsModal открывается (была CoursesModal)
- ✅ UI говорит «Workflow» вместо «Tutorial» / «Курс»
- ✅ Build passes без ошибок
- ✅ Все hash routes работают (ID не меняли)
- ✅ User progress сохранён (Supabase + localStorage)
- ✅ Все 32 туториала открываются (внутреннее ID не изменено)

---

## 7. Phase 2-4 — что дальше

| Phase | Что | Когда |
|-------|-----|-------|
| 2 | AI Fundamentals batch 1 (3-4 узла: LLM, RAG, Embeddings) | Week 2-3 |
| 2.5 | AI Fundamentals batch 2 (3-4 узла: Vector DB, Memory, Multimodal) | Week 4 |
| 3 | Operations flagship (5 узлов) + 2-3 Use Cases | Week 5-6 |
| 4 | Systems Tier 1 (3-5 узлов, для Operations support) | Week 7 |
| 5 | AI Fundamentals batch 3 (остальные) + UI polish | Week 8 |

---

## 8. Что НЕ делаем сейчас

- ❌ eCommerce flagship (отложен после Operations success)
- ❌ Поле `level` в каждом узле (выводим из родителя)
- ❌ Premium Use Cases (всё free пока)
- ❌ Туториалы Batch 3 (mcp-advanced, building-evaluations)
- ❌ Mermaid диаграммы (ASCII достаточно)
- ❌ OS-суффикс к названию

---

## 9. Открытые вопросы (не блокирующие)

| Q | Описание | Когда решить |
|---|----------|--------------|
| Tagline | Какой tagline под «105 Atlas» (без OS)? | Перед Phase 5 |
| Premium model | Платные Use Cases или нет? | После 30+ Use Cases |
| Following flagship | eCommerce / Marketing / Product — что после Operations? | После Phase 3 |
| ai-native-education | Делаем 8-е направление? | После Phase 3 |

---

## 10. Дата старта

Phase 1 готов к старту **сразу после approval этого документа** (≈30 минут работы).

---

_Status: APPROVED 2026-05-22_
_Owner: architecture team_
_Next: Phase 1 implementation_

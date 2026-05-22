# 04 — Foundation Mapping

> **TL;DR**: Foundation = инфраструктура понимания AI. Существующие 128 узлов реструктурируются в 6 sub-разделов под единым root-узлом `foundation`. Добавляется новый sub-раздел `ai-fundamentals` (LLM, RAG, Embeddings, Vector DB, AI Memory) — закрывает критический пробел. Принцип: ничего не удаляем, только перегруппировываем.

---

## 1. Целевая структура Foundation

```
foundation/
├── ai-fundamentals/          ← НОВЫЙ (универсальные AI-концепты)
│   ├── llm-basics
│   ├── tokens-context-deeper
│   ├── embeddings
│   ├── vector-databases
│   ├── rag-basics
│   ├── fine-tuning-vs-prompting
│   ├── ai-memory-systems
│   ├── multimodal-ai
│   ├── ai-inference-economics
│   └── ai-safety-fundamentals
│
├── claude-core/              ← MIGRATION: basics + platform + capabilities
│   ├── what-is-claude        (← b-claude)
│   ├── anthropic             (← b-anthropic)
│   ├── models-and-plans      (← b-models + pl-models + pl-plans)
│   ├── capabilities          (← capabilities + all cap-*)
│   ├── platform-access       (← все pl-*)
│   ├── privacy-and-safety    (← b-safety + b-prompt-injection + pl-privacy)
│   └── onboarding            (← b-first-steps + все fs-*)
│
├── prompting/                ← KEEP as-is
│   └── (15 узлов prompting + ready-prompts)
│
├── configuration/            ← MIGRATION: instructions + projects + artifacts
│   ├── custom-instructions   (← instructions + i-*)
│   ├── projects-workspace    (← projects + p-*)
│   └── artifacts             (← artifacts + a-*)
│
├── automation/               ← KEEP + ENRICH: skills + claude-code + mcp
│   ├── skills
│   ├── claude-code           (полное дерево cc-*)
│   └── mcp
│
└── agents-foundation/        ← KEEP: agents (rename)
    └── (8 узлов agents)
```

---

## 2. Mapping table — куда переезжает каждый раздел

| Существующий раздел | Узлов | Новый путь | Изменения |
|---------------------|-------|-----------|-----------|
| `basics` | 16 | `foundation/claude-core/` + `foundation/onboarding/` | Разделить: концепты vs onboarding |
| `platform` | 13 | `foundation/claude-core/platform-access/` | Без изменений |
| `capabilities` | 12 | `foundation/claude-core/capabilities/` | Cross-link к `ai-fundamentals/multimodal` |
| `prompting` | 15 | `foundation/prompting/` | Без изменений |
| `instructions` | 6 | `foundation/configuration/custom-instructions/` | Без изменений |
| `projects` | 5 | `foundation/configuration/projects-workspace/` | Без изменений |
| `artifacts` | 5 | `foundation/configuration/artifacts/` | Без изменений |
| `skills` | 7 | `foundation/automation/skills/` | Boundary: cross-link к `systems/orchestration` |
| `claude-code` | 28 | `foundation/automation/claude-code/` | Без изменений |
| `mcp` | 7 | `foundation/automation/mcp/` | Boundary: cross-link к `systems/integration` |
| `agents` | 8 | `foundation/agents-foundation/` | Boundary: cross-link к `systems/orchestration` |
| `scenarios` | 7 | См. документ 07 (Use Cases) | Migrate в use-cases-layer |

---

## 3. Новый sub-раздел: `ai-fundamentals`

Это самый важный contribution Foundation-расширения. Закрывает пробел: «Atlas описывает Claude, но не AI вообще».

### Список новых узлов (10)

| id | title | what (1 line) |
|---|---|---|
| `af-llm-basics` | LLM: как работает | Architecture transformer, tokens, predict-next-token |
| `af-tokens-context` | Tokens и контекст (глубже) | Tokenization, context window economics, attention |
| `af-embeddings` | Embeddings | Векторные представления, similarity, dimensions |
| `af-vector-db` | Vector Databases | Pinecone, Weaviate, pgvector — когда и зачем |
| `af-rag-basics` | RAG: что это | Retrieval Augmented Generation — основной паттерн |
| `af-fine-tuning` | Fine-tuning vs Prompting | Когда нужен fine-tuning, когда нет |
| `af-memory-systems` | AI Memory: типы | In-context, external, semantic, episodic |
| `af-multimodal` | Multimodal AI | Text + vision + voice + code — как соединяется |
| `af-inference` | AI Inference: latency и cost | Tokens/sec, batch processing, streaming |
| `af-safety-fund` | AI Safety: фундамент | Hallucinations, alignment, evals — общая картина |

### Связи с существующими узлами

```
af-tokens-context     ↔  b-context (Claude-specific)
af-embeddings         ↔  cap-search (использует embeddings)
af-vector-db          →  rag-basics (использует Vector DB)
af-memory-systems     ↔  cap-memory (Claude Memory implementation)
af-multimodal         ↔  cap-vision, cap-files (multimodal в Claude)
af-rag-basics         ↔  cap-citations (RAG output pattern)
af-inference          ↔  cap-caching, pl-rate (Claude inference)
af-safety-fund        ↔  b-safety, b-prompt-injection (Claude safety)
```

**Каждый новый ai-fundamentals узел** должен иметь ≥2 `relatedIds` к существующим узлам.

---

## 4. Принципы реструктуризации

### 4.1 Никаких удалений
133 существующих узла → 133 узла в новой структуре. Только новые добавляются.

### 4.2 Сохраняем ID
ID узлов (`b-claude`, `pl-plans`, `cap-vision` ...) — НЕ меняем. Меняем только parent в дереве.

Это критично: ID используются в:
- `tutorialByNodeId` (tutorials.js)
- `learningPaths.js` (steps)
- `relatedIds` (cross-links)
- `whatsNew.js` (markers)
- Hash routes (`/ru/node/b-claude`)
- Supabase `node_progress.node_id`

Изменение ID = массовая миграция данных пользователей.

### 4.3 Меняем только parent
Реструктуризация = изменение `children` arrays в `mindmapData.js`. Контент в `nodes.json` остаётся.

### 4.4 Cross-links вместо дубликатов
Если существующий узел нужно «упомянуть» в другом разделе — используем `relatedIds`, не копируем.

---

## 5. Конкретный пример миграции

### До (текущая структура)

```js
{
  id: 'root',
  children: [
    {
      id: 'basics',
      category: 'основы',
      children: [
        { id: 'b-claude', ... },
        { id: 'b-context', ... },
        { id: 'b-first-steps', children: [
          { id: 'fs-terminal', ... },
          ...
        ]}
      ]
    },
    { id: 'platform', ... },
    { id: 'capabilities', ... },
    ...
  ]
}
```

### После (Foundation root)

```js
{
  id: 'root',
  children: [
    {
      id: 'foundation',
      category: 'foundation',
      level: 'L1',
      children: [
        {
          id: 'ai-fundamentals',     // НОВЫЙ
          category: 'foundation',
          children: [
            { id: 'af-llm-basics', ... },
            { id: 'af-rag-basics', ... },
            ...
          ]
        },
        {
          id: 'claude-core',          // НОВЫЙ контейнер
          category: 'foundation',
          children: [
            { id: 'basics', ... },     // OLD как sub-секция
            { id: 'platform', ... },
            { id: 'capabilities', ... }
          ]
        },
        // ... остальные
      ]
    },
    { id: 'systems', ... },           // НОВЫЙ root
    { id: 'transformation', ... }     // НОВЫЙ root
  ]
}
```

---

## 6. Категории foundation после миграции

Sub-разделы Foundation получают свои подкатегории (для фильтра в UI):

| Sub-section | Category | Color |
|------------|----------|-------|
| ai-fundamentals | `foundation/ai-core` | #1d4ed8 (тёмно-синий) |
| claude-core | `foundation/claude` | #2563eb (синий) |
| prompting | `foundation/prompting` | #d97706 (янтарь) |
| configuration | `foundation/config` | #0e7490 (тёмно-циан) |
| automation | `foundation/automation` | #7c3aed (фиолетовый) |
| agents-foundation | `foundation/agents` | #dc2626 (красный) |

Главная категория для всех — `foundation`. Sub-category — для дополнительного фильтра.

---

## 7. Что НЕ меняется в Foundation

- ✅ Контент узлов (`title`, `details.what/why/when/impact/example/mistakes`)
- ✅ Локализация (ru/en/fi)
- ✅ Туториалы (32 курса остаются как есть)
- ✅ Learning paths (6 paths)
- ✅ Search index
- ✅ User progress data

---

## 8. Что меняется

- ⚙️ Tree structure в `mindmapData.js`
- ⚙️ Category на ряде узлов (для подкатегорий)
- ⚙️ Возможно — `level` field в схеме
- ⚙️ Возможно — `subcategory` field
- ⚙️ Layout (radial mindmap нужно адаптировать к 3-уровневому root'у)

---

## 9. Риски миграции Foundation

| Риск | Mitigation |
|------|-----------|
| Layout сломается при изменении root.children | Тестировать на dev branch, итерационно |
| Hash routes (#/ru/node/b-claude) перестанут работать | НЕ менять ID — только parent |
| Туториалы потеряют nodeId binding | НЕ менять ID — `tutorialByNodeId` останется работать |
| WhatsNew пометит все узлы как «обновлённые» | Игнорить — `sync-whats-new` хеширует контент, не структуру |
| Пользователи запутаются в новой структуре | Onboarding update + сохранение старых направлений как редирект-точек |

---

## 10. Acceptance criteria для Foundation миграции

Миграция считается успешной, если:

1. ✅ Все 133 узла доступны через UI (search + navigation)
2. ✅ Все hash routes работают (`#/ru/node/<id>`)
3. ✅ Все 32 туториала открываются
4. ✅ Все 6 learning paths валидны
5. ✅ Пользовательский progress сохранён
6. ✅ `sync-whats-new.mjs` не пометил массово все узлы как «new»
7. ✅ Build passes без warnings
8. ✅ Bundle size не вырос >5%
9. ✅ Search index покрывает старые + новые узлы
10. ✅ Существующие 5 категорий остаются работать (legacy filter compatibility)

---

## Решения, требующие approval

> **Q1**: Создаём `foundation` как новый root-узел или делаем виртуальный (UI-only) layer?
> **Q2**: Добавляем 10 узлов `ai-fundamentals` сразу или итерационно (по 2-3 за релиз)?
> **Q3**: Меняем категории сразу или сохраняем legacy 5 категорий до полной миграции?
> **Q4**: Сохраняем 12 существующих root-разделов как «direct links» или прячем под `foundation`?

---

_Status: IMPLEMENTED (2026-05-22) | Prev: [03 — Node Classification](./03-node-classification.md) | Next: [05 — Systems Layer](./05-systems-layer.md)_

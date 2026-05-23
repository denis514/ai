# Audit: Стратегия ↔ Реальность (2026-05-23)

> Сверка декларации в `docs/strategy/` (статус IMPLEMENTED, 2026-05-22)
> с фактическим состоянием кода и контента.
> Используется как источник для перезаписи `backlog.md`, `ideas.md`, `roadmap.md`.

---

## A. Архитектура контента

### Root mindmap (`src/data/mindmapData.js`)
- `foundation` (13 детей) ✅
- `systems` (6 детей) ✅
- `transformation` (6 детей) ✅
- `use-cases` (13 use cases) ✅

3-уровневая модель Foundation → Systems → Transformation реализована полностью.
Старых корневых веток нет.

### Foundation layer
- `ai-fundamentals` — 7 узлов ✅ (LLM basics, Embeddings, Vector DB, RAG, Memory systems, Multimodal, Fine-tuning)
- Старые разделы (`basics`, `platform`, `capabilities`, `prompting`, `skills`, `mcp`, `claude-code`, `agents`, etc) сохранены как Foundation — это нормально по стратегии
- Узлы из `ideas.md` про capabilities: `cap-tools`, `cap-vision`, `cap-caching`, `cap-citations`, `cap-computer` — **все 5 ✅ есть**
- ⚠️ Дублирование/смешение: они живут в `foundation/capabilities`, а не в `ai-fundamentals` — частичное противоречие 3-уровневой модели

### Systems layer — все 6 направлений ✅, но глубина минимальна
| Направление | Листьев |
|-------------|---------|
| ai-workflows | 3 |
| ai-data-systems | 2 |
| ai-orchestration | **1** |
| ai-human-collaboration | **1** |
| ai-operations | 2 |
| ai-integration-systems | **1** |
| **Итого** | **10** |

Для «operating system» уровня этого мало.

### Transformation layer — 6/7 directions
- `ai-native-operations` ✅ (5)
- `ai-native-marketing` ✅ (6)
- `ai-native-customer-support` ✅ (7)
- `ai-native-product` ✅ (7)
- `ai-native-enterprise` ✅ (7)
- `ai-native-design` ✅ (7)
- **`ai-native-ecommerce` — ❌ НЕТ** (стратегия объявляет его флагманом!)

### Use Cases
- 13 узлов на верхнем уровне с префиксом `uc-ai-*` ✅
- Cross-link density:
  - Use Cases: 5–10 relatedIds (среднее ~7) ✅
  - Foundation: 0–6 (среднее ~2.5) — низко
  - Systems: 4–7 — хорошо
  - Transformation: 3–7 — хорошо

---

## B. UI vs новое позиционирование

Стратегия (`docs/strategy/01-positioning.md` § 5) требует словарь:
- «Курсы» → «Workflows» / «Pathways»
- «Tutorial» → «Workflow» / «Playbook»
- «Знакомство с Claude» → «AI Foundation: Start Here»
- «Сценарии использования» → «AI-Native Use Cases»

### Статус локалей
- **RU** — ~30 ключей с «курс/обучение/tutorial/знакомство» **не мигрированы**
- **EN** — мигрирован частично (`learning: "Workflows"`, `expandWorkflows` есть, остальное tutorial/courses)
- **FI** — **не тронут**, везде `oppitunti` / `kurssi`

### Конкретные ключи под переименование (RU)
```
ui.json:
  tutorialDone, tutorialStarted, tutorialAvailable, tutorialPass,
  tutorialContinue, tutorialRetake, expandTutorial
  tutorial.closeAria, tutorial.stepsAria, tutorial.finished,
  tutorial.kicker = "Обучение"
  tutorial.finishCourse = "Завершить курс"
  tutorialDetail.plan, tutorialDetail.start = "Начать обучение"
  courses.status.all = "Все курсы", courses.empty.*, courses.kind.tutorial
  profile.tutorials = "Обучения"
  profile.completed.open = "Открыть курс"
  achievements.firstTutorial | fiveTutorials | tenTutorials
  welcome.subtitle = "Короткое знакомство с Claude за 10 минут"
  backToListShortcut
```

### Компоненты
- ✅ `WorkflowsModal.jsx` (бывший CoursesModal)
- ⚠️ `TutorialModal.jsx`, `TutorialDetail.jsx` — старые имена сохранены

---

## C. Tutorials состояние

**Всего 32 tutorials.**

### Из backlog Батч 1 — все ✅
- `ai-fluency`, `claude-for-business`, `claude-for-educators`

### Из backlog Батч 2 — все ❌ отсутствуют
- `mcp-advanced`
- `claude-code-project`
- `building-evaluations`

### Формат
Структура осталась педагогическая (`steps[].id`, `level`, `prerequisites`, `next`,
`whatItIs/approach/outcomes/applyIn/pitfalls/exercises`).
Поля под workflow/playbook (`whenToApply`, `ROI`, `KPI`, `artefacts`) — отсутствуют.

---

## D. Скиллы и автоматизация

### `skills/` — 20 скиллов реализовано
accessibility-review, ai-pedagogy-architect, ai-system-designer, ai-workflow-builder,
automation-architect, claude-expert, content-gap-auditor, content-structurer,
english/finnish/russian-language-pedagogue, knowledge-architect, learning-content-auditor,
mcp-specialist, mindmap-expander, **news-watcher** ✅, prompt-engineer,
react-knowledge-ui, translate-to-finnish, ux-interaction-tester

### Не реализовано
- `verify-mindmap-integrity` ❌
- `lesson-publisher` ❌
- `content-scout` ❌

### `scripts/` — 15 файлов, всё ключевое есть
- `sync-whats-new.mjs` ✅
- `audit-cross-links.mjs` ✅
- lint-data, add-missing-related, sync-related-from-links, apply-concept-links*,
  extract/strip-*-content, notify-telegram, strip-stage-markers

### `content/content-queue.json` — ❌ не существует (директория `content/` отсутствует)

---

## E. Deprecate-watch hot list

Из 10 узлов из старой таблицы:
| Узел | Последняя ревизия |
|------|-------------------|
| b-models | 2026-05-14 (9 дней назад) ⚠️ |
| pl-models | 2026-05-22 ✅ |
| cap-search | 2026-05-22 ✅ |
| **pl-plans, pl-limits, pl-rate, cap-memory, cap-computer, m-ready, b-knowledge** | **отсутствуют в whatsNew.js — не правились с миграции стратегии** |

**7 узлов требуют ревизии**, стратегически чувствительных (планы, лимиты, computer-use).

---

## F. Ключевые разрывы (приоритизированный список)

| # | Разрыв | Тип | Приоритет |
|---|--------|-----|-----------|
| 1 | UI/i18n не мигрирован под новый словарь (30+ ключей RU + почти весь FI; EN частично; `TutorialModal`/`TutorialDetail` старые имена) | UI | **P0** |
| 2 | eCommerce flagship Transformation direction отсутствует (заявлен в стратегии флагманом) | Контент | **P0** |
| 3 | Tutorials не превращены в workflows/playbooks (нет полей whenToApply/ROI/KPI/artefacts) | Контент + UI | P1 |
| 4 | Systems layer тонкий (10 листьев на 6 направлений; orchestration/integration/human-collab по 1) | Контент | P1 |
| 5 | 7 узлов Foundation давно не ревизовались (pl-plans, pl-limits, pl-rate, cap-memory, cap-computer, m-ready, b-knowledge) | Контент | P1 |
| 6 | Батч 2 tutorials не реализован (`mcp-advanced`, `claude-code-project`, `building-evaluations`) | Контент | P2 |
| 7 | Инфра-скиллы из backlog не созданы (`verify-mindmap-integrity`, `lesson-publisher`, `content-scout`) | Инфра | P2 |
| 8 | Дублирование слоёв Foundation (cap-* живут в `foundation/capabilities`, а не в `ai-fundamentals`) | Контент | P2 |

---

_Audit executed by: general-purpose research agent (Claude Opus 4.7)_
_Date: 2026-05-23_
_Used to rewrite: `tasks/backlog.md`, `tasks/ideas.md`, `tasks/roadmap.md`_

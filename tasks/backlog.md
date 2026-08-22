# Backlog

Задачи, готовые к работе, не активные сейчас.
Структура: **P0 → P1 → P2 → P3** по приоритету. Внутри каждого — порядок исполнения.

**Источник:** `tasks/audit-strategy-vs-reality-2026-05-23.md` (8 разрывов между
стратегией IMPLEMENTED 2026-05-22 и реальным состоянием кода/контента).

---

## P0 — Закрыть разрывы с позиционированием (блокирующие)

Стратегия в `docs/strategy/01-positioning.md` имеет статус `IMPLEMENTED`, но
два разрыва прямо противоречат заявленному позиционированию каждый раз, когда
пользователь открывает продукт.

### №1 — UI/i18n миграция под новый словарь — ✅ ЗАКРЫТО 2026-08-22 (в обратную сторону)

**Закрыто решением владельца 2026-08-22 (07-decisions.md):** вместо
workflow-словаря — простой язык. «Workflow» убран из интерфейса: разборы
Atlas = «разбор/guide/opas», схемы Builder = «схема/automation/automaatio»,
«курс» тоже заменён на «разбор» для единообразия. Контентная волна (тексты
разборов и узлов) — отдельно.


**Проблема.** Стратегия требует словарь «Workflows / Playbooks / Pathways /
AI-Native Use Cases». В коде остались ~30 ключей с «курс/обучение/tutorial/
знакомство» (RU), почти весь FI с `oppitunti/kurssi`, EN мигрирован частично.
Имена компонентов `TutorialModal`/`TutorialDetail` сохранены.

**Что менять:**

1. **i18n keys в `src/locales/{ru,en,fi}/ui.json`:**
   ```
   tutorial.kicker, tutorial.finishCourse, tutorialDone, tutorialStarted,
   tutorialAvailable, tutorialPass, tutorialContinue, tutorialRetake,
   expandTutorial, tutorialDetail.plan, tutorialDetail.start,
   courses.status.*, courses.empty.*, courses.kind.tutorial,
   profile.tutorials, profile.completed.open,
   achievements.firstTutorial|fiveTutorials|tenTutorials,
   welcome.subtitle ("знакомство" → "AI Foundation"),
   backToListShortcut
   ```
2. **Названия компонентов:** оценить переименование `TutorialModal` →
   `WorkflowModal`, `TutorialDetail` → `WorkflowDetail`. Не блокирующее
   (внутреннее имя), но снижает когнитивный диссонанс при правках.
3. **Тон копи:** «Начать обучение» → «Открыть workflow» / «Запустить playbook».

**Скоуп:** только UI-копи и имена. Контент tutorials (`tutorials.json`) трогаем
в отдельной задаче (P1 №3).

**Аудитория проверки:** запустить `russian-language-pedagogue`, `english-language-pedagogue`,
`finnish-language-pedagogue` после миграции.

**Эффорт:** 2-3 дня.

---

### №2 — eCommerce flagship Transformation direction

**Проблема.** Стратегия (`docs/strategy/01-positioning.md` § 3.3 + § 6.4)
объявляет eCommerce **стратегическим фокусом** и **флагманом transformation-
направлений**. Сейчас реализованы 6 directions, но `ai-native-ecommerce`
**отсутствует**.

**Что нужно создать:**

```
transformation/ai-native-ecommerce
├── ec-personalization      (Embeddings → product recs)
├── ec-search               (RAG → semantic search)
├── ec-cro                  (Claude as conversion analyst)
├── ec-merchandising        (smart catalogs)
├── ec-pricing              (dynamic pricing с AI-сигналами)
├── ec-support              (отдельный support direction уже есть, cross-link)
├── ec-content              (product descriptions, brand voice)
├── ec-analytics            (Claude как BI-аналитик)
├── ec-fraud                (anomaly detection)
└── ec-checkout             (intent prediction)
```

Минимум 10 узлов, как у других directions. Полный план в
`docs/strategy/06-transformation-layer.md`.

**Use Cases** добавить:
- `uc-ai-personalization`, `uc-ai-product-search`, `uc-ai-cro` —
  cross-links вниз к Foundation (Embeddings, RAG) и Systems (data, orchestration).

**Эффорт:** 2 недели (контент + локализация ru/en/fi).

---

## P1 — Углубление под позиционирование

### №3 — Tutorials → Workflows reformat

**Проблема.** Формат tutorials остался педагогическим (`whatItIs/approach/
outcomes/applyIn/pitfalls/exercises`). Под новое позиционирование нужны поля
workflow/playbook:
- `whenToApply` — триггер запуска (а не «уровень beginner/intermediate»)
- `KPI` — что измеряем результатом
- `artefacts` — что остаётся после прохода (документ, CLAUDE.md, шаблон)
- `roleStakeholders` — кто в команде участвует

**Подход:** расширить схему `tutorials.js`, оставить обратную совместимость со
старыми полями. Сначала на 3-5 пилотных workflow (например, `ai-fluency`,
`claude-for-business`), потом раскат.

**Эффорт:** схема + миграция — 3-4 дня; полный раскат на 32 tutorials — 1-2 недели.

---

### №4 — Systems layer expansion

**Проблема.** 6 направлений × ~1.6 листа = всего 10 узлов. Для «operating system»
плотность недостаточна. Особенно тонкие:
- `ai-orchestration` (1 лист: multi-agent-patterns)
- `ai-human-collaboration` (1: escalation-paths)
- `ai-integration-systems` (1: api-patterns)

**Что добавить (минимум):**

| Направление | Новые узлы |
|-------------|------------|
| ai-orchestration | sequencing, branching, parallel agents, agent-to-agent comms |
| ai-human-collaboration | review gates, approval flows, hybrid loops, escalation triggers |
| ai-integration-systems | webhook patterns, queue-based, event-driven, REST vs MCP, auth strategies |
| ai-data-systems | + chunking, + vectorisation pipelines, + freshness strategies |
| ai-workflows | + error recovery, + retry strategies |
| ai-operations | + observability, + alerting, + drift detection |

Итого: 25-30 новых Systems-узлов.

**Эффорт:** 2-3 недели (контент-тяжёлая задача, делать партиями по направлениям).

---

### №5 — Deprecate-watch sweep (7 узлов) — ✅ ЗАКРЫТО 2026-08-22

**Проблема.** Узлы Foundation, стратегически чувствительные к фактам Anthropic,
не ревизовались с миграции стратегии:

```
pl-plans, pl-limits, pl-rate
cap-memory, cap-computer
m-ready
b-knowledge
```

**Закрыто 2026-08-22:** news-watcher прогнан (3 исследователя по официальным
источникам), все 7 узлов актуализированы в трёх локалях: домены → claude.com /
platform.claude.com, планы Max 5x/20x + usage credits, именованные API-tier-ы
(Evaluation→Custom) + spend limits, память на Free и по-проектная, computer use
GA (`computer_toolset_20260801`) + Claude in Chrome, MCP Registry + каталог
коннекторов + Agentic AI Foundation, cutoff-ы семейства Claude 5.

---

### №5a — Умный поиск «обычными словами» (стратегическая, 2026-08-22)

**Решение владельца:** усилить поиск, чтобы темы находились обычными словами
(опечатки, падежи, синонимы, «опиши что хочешь»). Исследование проведено,
план утверждён: `docs/smart-search-plan.md`.

Этапы: (1) клиентский MiniSearch + Snowball ru/fi + синонимы — заменяет фильтр
карты и палитру, 0 ₽; (2) семантика: pgvector + гибрид RRF в Supabase,
мультиязычные эмбеддинги (НЕ gte-small — English-only); (3) «Спросить AI» —
отдельное решение. Метрика: золотой набор 40-60 запросов, релевантный в топ-3.
Отвергнуто: Elastic/OpenSearch (≥$95/мес — overkill), Typesense Cloud,
Meilisearch (нет ru-стемминга). Эффорт: этап 1 — 2-4 дня, этап 2 — 2-3 дня.

---

## P2 — Развитие на масштабе

### №6 — Foundation cleanup: `cap-*` под `ai-fundamentals`

**Проблема.** `cap-tools`, `cap-vision`, `cap-caching`, `cap-citations`,
`cap-computer` живут в `foundation/capabilities`, а не в `ai-fundamentals`.
Это размывает 3-уровневую модель: capabilities — это **Claude-specific фичи**,
fundamentals — **AI-механизмы** (как работает LLM, Embeddings и т.д.).

**Подход (не срочно, не ломая ссылки):**
- Вариант A: переместить `cap-tools` (Tool use) и `cap-vision` (multimodal) под
  `ai-fundamentals` как `af-tool-use` и `af-vision`, потому что это **общие
  AI-концепции**, не Claude-specific. Оставить `cap-caching`, `cap-citations`,
  `cap-computer` в capabilities.
- Вариант B: ничего не трогать, документировать решение «capabilities ≠ fundamentals
  по дизайну».

Решить совместно перед началом.

**Эффорт:** 0.5 дня (если Вариант A: переименование + cross-link migration).

---

### №7 — Батч 2 workflows: технические

| Workflow | Аудитория | Уровень | nodeId |
|----------|-----------|---------|--------|
| `mcp-advanced` — MCP: Advanced Topics | developers | advanced | mcp |
| `claude-code-project` — Claude Code in Action | developers | intermediate | claude-code |
| `building-evaluations` — как оценивать ответы Claude | developers | intermediate | новый `af-evals` |

**Важно:** делать в новом workflow-формате (см. №3), не как tutorials.

**Эффорт:** 1 неделя.

---

### №8 — Инфраструктурные скиллы

| Skill | Цель |
|-------|------|
| `verify-mindmap-integrity` | Линт по 6-вопросной схеме, dangling relatedIds, schema-валидация. Прогон pre-commit |
| `content-scout` | Еженедельный поиск пробелов под новое позиционирование (Anthropic releases + transformation-сигналы) |
| `workflow-publisher` | Генерация workflow-черновика из узла (бывший lesson-publisher, переименован под новый словарь) |

**Эффорт:** 1-2 дня на skill (SKILL.md + ресурсы).

---

## P3 — Большие ставки (после P0-P2)

| # | Задача | Эффорт | Риск |
|---|--------|--------|------|
| 9 | **MCP server для mindmap** — выставить Atlas как MCP-ресурс для Claude Code | 5-7 дн. | высокий |
| 10 | **AI Companion mode** — кнопка «спросить Claude об этом узле» с контекстом | 3-5 дн. | средний |
| 11 | **Self-updating mindmap** — `scripts/ai-add-node.js` + scheduled review | 3-5 дн. | высокий |
| 12 | **Content-автопубликация** (`content/content-queue.json` + GH Actions cron) | 1 нед. | средний |

---

## ⚙️ Tech debt и ручные операции

| Status | Task | Примечание |
|--------|------|-----------|
| ⚙️ manual | Supabase session timebox | Dashboard → Auth → Sessions → 30 дней |
| 📐 архитектура | Решить про `cap-*` vs `ai-fundamentals` (см. №6) | До начала работ по №7 |

---

## 🚫 Что НЕ берём (off-strategy)

Из старого backlog **отброшено** как противоречащее новому позиционированию:

- ❌ Anthropic Academy course matrix («everyone/dev/business/educators»)
- ❌ Cloud-интеграции `bedrock` / `vertex-ai` как отдельные курсы
- ❌ Батч 4 «AI Fluency расширение» (nonprofit, students, teaching) — LMS-логика
- ❌ Stripe / monetization до закрытия P0-P1

Если эти темы и нужны — переосмыслить как Foundation-узлы или Transformation
use cases, не как «курсы».

---

## Supabase — Backend & Auth (2026-05-17)

Phase 1-3 ✅ выполнены (Auth, Profile, Progress).

| Phase | Задача | Статус |
|-------|--------|--------|
| 4 | Scenarios & Comments — `personal_scenarios`, `comments` | open |
| 5 | Monetization — Stripe + `subscriptions` + `ai_usage` limits | open |

GDPR / Финляндия: privacy by design, data minimisation, RLS, consent timestamps,
delete + export.

---

## Заметки

- Один пункт = один skill / prompt / workflow / контент-партия.
- Перед взятием в работу — переноси в `current.md`.
- Раз в месяц — grooming: убирать неактуальное.
- Любая новая идея проходит через `knowledge-architect` или `ai-system-designer`
  и приходит сюда из `ideas.md`.

---

## 📄 Авто-сигналы сторожей — в отдельном файле

Диффы официальной документации Anthropic (`docs-watcher`) и напоминания сверить
вкладку «Помощь» (`help-watch`) пишутся в `tasks/docs-watch-archive.md`, чтобы не
засорять бэклог. Живая задача попадает сюда только после разбора сигнала человеком.

**Закрыто 2026-08-18:** вкладка «Помощь» сверена с билдером (расписание как правая
панель, «Однократно»/«Многократно», история прогонов, вебхук, токены вместо цены,
рабочие инструменты). База сверки принята — `npm run help:watch -- --accept`.

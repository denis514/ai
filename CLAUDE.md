# CLAUDE.md — AI System File

> Главный файл AI-инфраструктуры проекта **105 Atlas**.
> Читается Claude Code автоматически при любой работе в этой папке.
> Любой агент / skill / workflow обязан учитывать правила ниже.

---

## 1. Цель проекта

**105 Atlas** — это интерактивная **AI-native knowledge system** о Claude:
не просто визуализация, а **живая база знаний**, которая описывает экосистему Claude
(Skills, MCP, Agents, Projects, Claude Code, Prompts, Automation, AI workflows)
и развивается вместе с самой экосистемой.

Проект одновременно:
- **AI handbook** — справочник по Claude и сопутствующим инструментам
- **interactive mindmap** — визуальная карта концепций и связей
- **knowledge base / AI wiki** — атомарные узлы знаний с единой схемой
- **learning platform** — каждый узел = микро-урок (что/зачем/когда/как/пример/ошибки)
- **AI workflows lab** — площадка, где формулируются и оттачиваются практики работы с AI

UI вторичен. Главное — **архитектура знаний** и **AI infrastructure**.

---

## 2. AI Philosophy

1. **AI-first, не AI-bolt-on.** Структура папок, контента и кода спроектирована так,
   чтобы Claude мог работать здесь автономно: понимать намерение, расширять mindmap,
   создавать узлы, не ломая систему.
2. **Knowledge is atomic.** Каждый узел mindmap — самодостаточная единица:
   `what / why / when / impact / example / mistakes`. Нет «обзорных» узлов без структуры.
3. **Skills > ad-hoc prompts.** Любая повторяющаяся задача оформляется как skill
   в `skills/`. Разовые операции — как prompt в `prompts/`.
4. **Документация — это код.** `docs/` — источник правды для Claude, а не для людей.
   Если Claude должен учесть правило — оно обязано быть в `docs/` или этом файле.
5. **Не ломай — расширяй.** Любое изменение в `src/data/mindmapData.js`, `prompts.js`
   и `tutorials.js` идёт через skill `mindmap-expander` или `content-structurer`.
6. **Модульность и реюз.** Дублирование узлов / промптов / правил запрещено —
   вместо копии создаём ссылку или общий компонент.

---

## 3. Architecture Rules

```
105 Atlas/
├── CLAUDE.md                ← ты здесь: главный AI system file
├── .claude/                 ← локальные настройки Claude Code (settings, hooks)
├── skills/                  ← переиспользуемые AI-навыки (SKILL.md в каждой)
├── prompts/                 ← одноразовые промпт-шаблоны для частых операций
├── docs/                    ← правила, архитектура, AI workflow guides
├── tasks/                   ← current / backlog / roadmap / ideas
├── src/                     ← React/Vite приложение (НЕ трогать без причины)
│   ├── App.jsx              ← корневой компонент
│   ├── components/          ← UI: Mindmap, MindmapNode, DetailPanel, ...
│   ├── hooks/               ← usePanZoom, useMindmapLayout, useTutorialProgress
│   └── data/                ← mindmapData.js, prompts.js, tutorials.js
└── README.md                ← человеческое описание (вторично)
```

**Правила архитектуры:**

- AI-инфраструктура (`skills/`, `prompts/`, `docs/`, `tasks/`, `CLAUDE.md`)
  и приложение (`src/`) — **два независимых слоя**.
- Никогда не размещай контент знаний (узлы, туториалы) в `docs/` —
  это место для **правил для Claude**, а не для пользовательского контента.
- Никогда не размещай правила для Claude в `src/data/` —
  это место для **контента mindmap**.
- Папки фиксированы. Новые папки верхнего уровня создаются только после
  обновления этого файла.

---

## 4. Content Rules (mindmap data)

Источник правды: `src/data/mindmapData.js`, `src/data/prompts.js`, `src/data/tutorials.js`.

**Схема узла (обязательная):**
```js
{
  id: 'kebab-case-unique-id',
  title: 'Короткий заголовок',
  icon: 'brain',                 // семантическое имя из Icon-реестра (Hugeicons)
  category: 'основы' | 'настройка' | 'автоматизация' | 'промпты' | 'агенты',
  details: {
    what: '...',      // 1-2 предложения, что это
    why: '...',       // зачем существует
    when: '...',      // когда применять
    impact: '...',    // эффект от правильного применения
    example: '...',   // конкретный пример использования
    mistakes: '...'   // типичная ошибка / антипаттерн
  },
  children: []        // дочерние узлы той же схемы
}
```

**Иконки**: только семантические имена из реестра `src/components/Icon.jsx`
(brain, search, folder, tools, robot, ...). Эмодзи **запрещены** в `icon`.
Если нужной иконки нет в реестре — добавить её в `Icon.jsx` (импорт + запись в `REGISTRY`),
выбрать тип-совпадение в `@hugeicons/core-free-icons`. Список доступных имён см.
в `ICON_NAMES` экспорте Icon-компонента.

**Запрещено:**
- добавлять узлы без полного `details`
- использовать `id` повторно
- смешивать языки в одном поле (контент **на русском**, идентификаторы — латиница)
- использовать эмодзи в `icon` (только семантические имена из Icon-реестра)
- создавать ветку глубже **4 уровней** (root → раздел → подраздел → лист) без обоснования

**Категории:** только 5, перечислены выше. Новая категория → правка в `CATEGORIES`
в начале `mindmapData.js` **и** в этом файле.

---

## 5. React Rules

- Стек зафиксирован: **React 18 + Vite + чистый CSS + Hugeicons (free)**.
  Никакого TypeScript, CSS-in-JS, UI-китов, state-менеджеров — без явного обоснования
  и записи в `docs/architecture.md`.
- Компоненты — **функциональные**, hooks-first. Никаких классов.
- Состояние локально, либо через существующие hooks (`usePanZoom`, `useMindmapLayout`,
  `useTutorialProgress`). Глобальный стор не добавляем.
- Стили — в `App.css` / `index.css`. Не вводить styled-components / Tailwind без апдейта
  архитектурных доков.
- Один компонент = один файл. Имя файла = имя экспорта.
- **Иконки** — только через `<Icon name="..." />` из `src/components/Icon.jsx`.
  Никаких эмодзи в JSX и никаких прямых импортов из `@hugeicons/*` за пределами `Icon.jsx`.
- Не править `src/components/` и `src/hooks/`, если задача про контент:
  изменения должны идти в `src/data/`.

---

## 6. Scalability Rules

- Mindmap должен оставаться читаемым при **200+ узлах**. Перед добавлением
  ветки шире 12 детей — разбить на подразделы.
- Поиск и фильтры — встроенные. Любой новый узел обязан быть findable через `title`
  или поля `details`.
- Layout рассчитывается автоматически. Не хардкодить координаты.
- Контентные файлы (`mindmapData.js`, `tutorials.js`) могут расти. Если файл
  превышает ~150 KB — разнести по тематическим модулям (`data/sections/*.js`)
  и реэкспортировать.

---

## 7. Modularity Rules

- Skills — независимы. Один skill не вызывает другой напрямую, только через
  явную композицию в prompt или workflow.
- Prompts — параметризованы плейсхолдерами `{{like_this}}`. Любой prompt можно
  применить без правки исходника.
- Docs — атомарны: один файл = одна тема. Кросс-ссылки относительные.
- Контент mindmap — атомарен на уровне узла: узел не должен подразумевать
  обязательное прочтение соседа.

---

## 8. Knowledge System Rules

- Каждый новый узел проходит «6-вопросный фильтр» (what/why/when/impact/example/mistakes).
  Если ответа на любой вопрос нет — узел **не готов**, идёт в `tasks/ideas.md`.
- Дубли запрещены. Перед созданием узла — поиск по `title` и `id` в `mindmapData.js`.
- Связанные понятия группируются под одним родителем, а не разбрасываются по корню.
- Если узел теряет актуальность (устаревшая фича Claude) — он не удаляется молча,
  а помечается в `tasks/backlog.md` со статусом `deprecate`.

---

## 9. Navigation Rules

- Root всегда виден. Глубокие узлы доступны через expand или поиск.
- Любой узел должен быть достижим за **≤ 3 клика** от root.
- Категория узла = цвет (см. `CATEGORIES`). Не смешивать категории внутри одной ветки
  без явной причины.

---

## 10. AI Workflow Rules

Когда пользователь просит «добавить тему / расширить раздел / обновить mindmap»:

1. **Понять намерение** → определить раздел и категорию.
2. **Проверить дубли** → grep по `mindmapData.js`.
3. **Сформулировать узел по 6-вопросной схеме**.
4. **Выбрать родителя** → не плодить корневые ветки.
5. **Внести правку через skill `mindmap-expander`** (если skill активен) или
   следуя его SKILL.md как чек-листу.
6. **Проверить** что layout не сломан (нет дублей `id`, валидный JS).
7. **Запустить `node scripts/sync-whats-new.mjs`** — лейблы обновятся автоматически.
8. **Записать в `tasks/current.md`** или закрыть тикет.

Подробнее — в `docs/ai-workflows.md`.

---

## 10a. Правило автоматических лейблов «новое» / «обновлено» (ОБЯЗАТЕЛЬНО)

**После любой правки контента** (`src/locales/*/nodes.json`, `src/data/tutorials.js`,
`src/locales/*/tutorials.json`) — **обязательно запустить скрипт:**

```bash
node scripts/sync-whats-new.mjs
```

Что делает скрипт:
- Вычисляет sha1-хеши каждого узла и туториала
- Сравнивает с `src/data/nodeHashes.json` (источник правды)
- Новые ID → `type: 'new'` + сегодняшняя дата в `whatsNew.js`
- Изменённые ID → `type: 'updated'` + сегодняшняя дата в `whatsNew.js`
- Обновляет `nodeHashes.json`

**Оба файла коммитить вместе с контентом:**
```
git add src/locales/ src/data/tutorials.js src/data/whatsNew.js src/data/nodeHashes.json
```

**Нельзя:**
- Коммитить контент без запуска скрипта
- Редактировать `whatsNew.js` вручную (файл авто-генерируется)
- Редактировать `nodeHashes.json` вручную

**Дополнительные команды:**
```bash
npm run sync               # то же что node scripts/sync-whats-new.mjs
node scripts/sync-whats-new.mjs --regen  # пересобрать whatsNew.js без изменения дат
```

---

## 11. Prompt Engineering Rules

- Промпты в `prompts/` пишутся в формате: цель → контекст → инструкция → формат вывода.
- Каждый prompt декларирует **inputs** (что должен дать пользователь) и
  **outputs** (что вернёт Claude).
- Плейсхолдеры — двойные фигурные скобки: `{{topic}}`, `{{section_id}}`.
- Длинные промпты разбиваются на блоки markdown-заголовками. Без «стены текста».
- Подробнее — `docs/prompt-guidelines.md`.

---

## 12. File Organization Rules

- `skills/<name>/SKILL.md` — обязательный файл. Опциональные ресурсы (примеры,
  шаблоны) — в той же папке.
- `prompts/` — плоско, без подпапок. Имя = действие в kebab-case (`add-new-topic.md`).
- `docs/` — плоско, без подпапок. Имя = тема (`architecture.md`).
- `tasks/` — фиксированный набор файлов: `current.md`, `backlog.md`, `roadmap.md`,
  `ideas.md`. Не плодим новые.

---

## 13. Code Safety Rules

- **Никогда** не запускать деструктивные команды (`rm -rf`, `git reset --hard`,
  массовые удаления) без явного согласия пользователя.
- **Никогда** не редактировать `package.json` / `vite.config.js` / `index.html`
  без обоснования. Это базис, который ломает запуск.
- Изменения в `src/` сопровождаются мини-проверкой: `npm run build` после правки
  (или хотя бы синтаксический парсинг в голове).
- При работе с `mindmapData.js`: после правки прогнать `node -e "import('./src/data/mindmapData.js')"`
  или эквивалент, если есть сомнения в синтаксисе.
- Не вводить новых runtime-зависимостей без обновления `docs/architecture.md`.

---

## 14. Documentation Rules

- `docs/` — для Claude, не для людей. Пишем сухо, как regulations, не как туториал.
- README.md остаётся человеческим (как сейчас) — туда не пишем AI-правила.
- Любое новое архитектурное решение → запись в `docs/architecture.md` с датой.

## 14b. Post-action summary (ОБЯЗАТЕЛЬНО)

**После каждого значимого действия** (коммит, новый файл, изменение архитектуры,
настройка системы, завершение этапа, обновление контента, изменение зависимостей)
Claude **обязан** написать короткий итог.

**Два слоя — не смешивать:**

1. **Итог для человека (в чат)** — простыми словами, **без единого термина
   разработчика**. Как объясняешь не-программисту. Несколько коротких предложений.
2. **Технические детали** — имена файлов, функции, хеши, термины — уходят в
   **текст git-коммита**, НЕ в чат.

**Формат итога для человека (в чат):**

```
✅ Что изменилось:
[1-3 предложения. Что теперь по-другому — словами, понятными любому.]

💡 Почему так лучше / зачем:
[1-2 предложения. Какую реальную проблему это решает.]

➡️ Что дальше:
[Понятное логичное продолжение.]
```

Если есть риск — добавить `⚠️ Важно знать:` простыми словами.

**Правила:**

- Русский язык (см. § 14a)
- **НОЛЬ терминов разработчика в чате** — никаких RLS, bundle, edge function,
  localStorage, props, endpoint, commit. Заменять по словарю в SKILL.md
  (например: RLS → «каждый видит только свои данные»; bundle → «вес страницы»).
- Затронуты **деньги / безопасность / приватность** — обязательно сказать
  простыми словами («данные теперь в облаке, доступ только у владельца»).
- Технические термины разрешены **только** если пользователь явно просит
  («покажи технически») — тогда отдельным блоком `🔧 Технические детали:`.
- Проверка перед отправкой: «поймёт ли мама?» Если в тексте слово, которое
  непрограммист погуглит — заменить.

**Когда НЕ применять:**

- Чисто research-запросы (просто читал файлы)
- Уточнения через AskUserQuestion
- Один trivial edit где summary длиннее самого изменения

**Подробная спецификация (словарь перевода + примеры):**
`skills/post-action-summary/SKILL.md`

---

## 14a. Язык общения и документации (ОБЯЗАТЕЛЬНО)

**Все ответы пользователю — только на русском языке.** Без исключений, даже если
вопрос задан на английском или финском.

**Вся документация (`docs/`, `tasks/`, `CLAUDE.md`, комментарии в коде) — на русском.**
Исключения — только термины, которые хуже становятся при переводе:
`nodeId`, `tutorialByNodeId`, `localStorage`, `git push`, названия файлов, id узлов,
технические команды (`npm run build`, `git commit`).

**Контент mindmap** (`src/locales/ru/`) — на русском. EN и FI локали — на соответствующих языках.

**Нельзя:**
- Отвечать по-английски даже частично (исключение: цитаты кода)
- Писать документацию на английском
- Смешивать языки в одном абзаце объяснения

---

## 15. Как Claude должен развивать проект

**При новой задаче «добавь / расширь / улучши»:**

1. Прочитай `CLAUDE.md` (этот файл).
2. Загляни в `tasks/current.md` — нет ли уже активной работы по теме.
3. Найди подходящий skill в `skills/`. Если skill есть — следуй его SKILL.md.
4. Если skill-а нет, а задача повторяющаяся — предложи создать новый skill.
5. Контент → в `src/data/`. Правила → в `docs/`. Инструкции для повторного
   использования → в `skills/` или `prompts/`.
6. После работы — обнови `tasks/current.md` / `tasks/backlog.md`.

**Обязательное правило ведения задач (TASK TRACKING):**

После **каждого** `git push` — немедленно обновить `tasks/current.md`:
- Закрытую задачу удалить из таблицы (история остаётся в git).
- Новую задачу добавить со статусом `open` и датой.
- Если задача появилась в ходе работы (найден баг, возник подзадача) — тоже записать.

Это правило **не опционально**. Нарушение приводит к тому, что задачи теряются
при компрессии контекста и следующая сессия начинается вслепую.

Порядок внутри сессии:
```
выполнил задачу → git push → обновил tasks/current.md → git push tasks
```

**Никогда не:**
- создавать новый React-проект поверх существующего
- переписывать `src/` целиком
- делать массовые рефакторинги без отдельной задачи в `tasks/`
- молча менять схему узла или категории

---

## 15a. Business-операционный слой (ОБЯЗАТЕЛЬНО для стратегических задач)

У проекта есть отдельный **business-операционный слой**: 7 strategy-документов +
6 skill-агентов + еженедельная автоматизация. Цель — развитие и монетизация
105 Atlas как SaaS-продукта, не только как knowledge base.

**Когда пользователь спрашивает «как развивать», «как монетизировать»,
«что делать дальше», «что говорят конкуренты»:**

1. Прочесть `docs/business-strategy/README.md`.
2. Вызвать `skills/business-strategist/` (orchestrator) — он dispatches специалистов:
   - `growth-strategist` — каналы, outreach, SEO
   - `monetization-architect` — pricing, paywall, tiers
   - `product-strategist` — feature priorities для revenue
   - `competitive-intelligence` — market awareness
   - `proposal-generator` — формирует decision-ready docs
3. Все стратегические решения логируются в `docs/business-strategy/07-decisions.md`.
4. Еженедельный review запускается через `node scripts/weekly-strategy-review.mjs`
   (или GitHub Action `weekly-strategy-review.yml` по понедельникам).

**Никогда:**
- Не предлагать «делать курсы» / «академию» — нарушает `docs/strategy/01-positioning.md`.
- Не менять pricing без validation Phase 0 (см. `04-monetization-roadmap.md`).
- Не реагировать на конкурентов из соцсетей — только через `competitive-intelligence` skill.
- Не игнорировать `07-decisions.md` — он source of truth для business-решений.

---

## 16. Точки входа для AI

| Ситуация                               | Куда смотреть              |
|----------------------------------------|----------------------------|
| Понять цель и правила                  | `CLAUDE.md` (этот файл)    |
| Узнать архитектуру / стек              | `docs/architecture.md`     |
| Расширить mindmap новым узлом          | `skills/mindmap-expander/` |
| Создать AI workflow / scenario         | `skills/ai-workflow-builder/` |
| Описать концепт MCP                    | `skills/mcp-specialist/`   |
| Спроектировать tutorial / новое обучение | `skills/ai-pedagogy-architect/` |
| Найти пробелы в контенте Atlas         | `skills/content-gap-auditor/` |
| Аудит «понятности» обучающего материала | `skills/learning-content-auditor/` (on-demand) |
| Аудит правильности финского языка      | `skills/finnish-language-pedagogue/` (on-demand) |
| Аудит правильности русского языка      | `skills/russian-language-pedagogue/` (on-demand) |
| Аудит правильности английского языка   | `skills/english-language-pedagogue/` (on-demand) |
| Общие принципы языковой педагогики     | `docs/language-pedagogy-shared.md` |
| UX-аудит взаимодействия и навигации    | `skills/ux-interaction-tester/` (on-demand) |
| Проверить релизы Anthropic еженедельно | `skills/news-watcher/`     |
| Правила AI-обучения                    | `docs/learning-design-rules.md` |
| Maintenance / deprecate-watch          | `docs/maintenance.md`      |
| **Бизнес-стратегия проекта**           | `docs/business-strategy/`  |
| Стратегические решения (orchestrator)  | `skills/business-strategist/` |
| Acquisition / каналы / outreach        | `skills/growth-strategist/` |
| Pricing / paywall / tier-структура     | `skills/monetization-architect/` |
| Roadmap / feature prioritization       | `skills/product-strategist/` |
| Мониторинг конкурентов и рынка         | `skills/competitive-intelligence/` |
| Decision-ready proposal docs           | `skills/proposal-generator/` |
| Еженедельный strategic review          | `node scripts/weekly-strategy-review.mjs` |
| **Agent Builder — стратегия + планы**  | `docs/agent-builder/`      |
| Проектирование agents и workflow       | `skills/agent-architecture/` |
| Visual builder UX (canvas, onboarding) | `skills/ux-flow-designer/` |
| AI education snippets (tooltips, deep-links) | `skills/ai-education-designer/` |
| Risk audit перед изменениями кода      | `skills/technical-risk-auditor/` |
| MVP / Beta / Future scoping            | `skills/mvp-planner/` |
| **Формат summary после каждого действия** | `skills/post-action-summary/` + § 14b |
| Что сейчас в работе                    | `tasks/current.md`         |
| Что в плане                            | `tasks/roadmap.md`         |
| Сырые идеи                             | `tasks/ideas.md`           |
| Архив business-решений                 | `docs/business-strategy/07-decisions.md` |

---

_Последнее обновление: при инициализации AI-инфраструктуры._

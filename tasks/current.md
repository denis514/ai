# Current Tasks

Активная работа. До 5 задач одновременно.
**Правило:** каждая задача завершается только после build ✅ + визуальной проверки ✅.

---

## 🔧 Технический аудит (2026-05-20)

### Build
| Метрика | Значение | Статус |
|---------|----------|--------|
| Build time | ~1.17s | ✅ |
| JS initial bundle (gzip) | 85 KB | ✅ |
| JS initial bundle (raw) | 282 KB | ✅ |
| Lazy chunks (nodes per locale) | ~37–47 KB gzip | ✅ |
| Lazy chunks (tutorials per locale) | ~77–96 KB gzip | ✅ |
| Vendor chunks (cached) | react 45KB + supabase 53KB + icons 19KB | ✅ |
| CSS bundle (gzip) | 21 KB | ✅ |
| Modules | ~164 | ✅ |
| Ошибки сборки | 0 | ✅ |
| Туториалов | 29 | ✅ |
| Узлов на карте | ~141 | ✅ |

### Инфраструктура
| Компонент | Статус | Примечание |
|-----------|--------|------------|
| Supabase Auth | ✅ | Magic Link + Google OAuth |
| Supabase DB | ✅ | EU Frankfurt, RLS на всех таблицах |
| Vercel deploy | ✅ | Auto-deploy из GitHub |
| i18n EN/RU/FI | ✅ | Все ключи синхронизированы |
| GDPR | ✅ | Consent Mode v2, ToS, Privacy Policy |
| IP-локализация | ✅ | TTL 7 дней, кеш v2 |
| sync-whats-new | ✅ | Авто-детект изменений контента (nodeHashes.json) |

### Известные технические долги
- ⚠️ Supabase session timebox не настроен вручную (работает дефолт 1 час)

---

## ✅ Завершено — Сессия 2026-05-20

### UX и навигация
- ✅ **Плавная навигация к связанному узлу** — клик на связанный узел в боковой панели плавно анимирует карту к целевому узлу (CSS transition + flushSync + retry до 8×60мс; xOffset: -230px компенсирует боковую панель)
- ✅ **Восстановление маршрута после OAuth** — sessionStorage сохраняет `#/ru/node/id` перед Google/Magic Link редиректом, восстанавливает после входа
- ✅ **ProfilePanel редизайн** — убрана «Активность» (streak/days), добавлена секция «В процессе» (все активные курсы с % и прогресс-баром, sort по дате начала desc, клик открывает курс)
- ✅ **AccountPage: Activity** — streak и totalDays перенесены в AccountPage (Supabase данные)
- ✅ **useTutorialProgress: startedAt** — timestamp при первом касании туториала для сортировки

### Лейблы «новое» / «обновлено»
- ✅ **sync-whats-new.mjs** — скрипт автодетекта изменений контента: sha1 хеши узлов (ru/nodes.json) и туториалов (tutorials.js + ru/tutorials.json); обновляет whatsNew.js автоматически. Флаг `--regen`. Команда `npm run sync`
- ✅ **nodeHashes.json** — snapshot 141 узла + 29 туториалов; коммитится в git
- ✅ **CLAUDE.md правило 10a** — после правки контента обязательно `node scripts/sync-whats-new.mjs`
- ✅ **Родительские лейблы** — тип 'new'/'updated' определяется по потомкам (new > updated); `newAncestorIds`: Set→Map; `hasNewInside`: boolean→string type
- ✅ **Dismiss на ветках** — `onToggle` вызывает `markSeen(id)` для branch-узлов из WHATS_NEW
- ✅ **Фикс краша MindmapNode** — `hasNewInside` приходит как значение (не функция); `hasNewInside?.(node.id)` → использовать напрямую

### Контент
- ✅ **Skills аудит** — все 7 узлов раздела переписаны: конкретный механизм двух платформ (claude.ai vs Claude Code), реальные примеры SKILL.md, путь Project Settings→Skills→Browse, /skill-creator, --regen; ru/en/fi
- ✅ **Skills лейбл** — `skills` помечен как 'updated' в whatsNew.js (2026-05-20)

### Курсы (завершены ранее, 2026-05-19)
- ✅ **`ai-fluency`** — AI Fluency: основы и фреймворк (everyone, beginner, 6 шагов, EN/RU/FI)
- ✅ **`claude-for-business`** — Claude для бизнеса (business, beginner, 6 шагов, EN/RU/FI)
- ✅ **`claude-project-architecture`** — Архитектура Claude-проекта (everyone, beginner, 6 шагов, EN/RU/FI)
- ✅ **WhatsNew туториалы** — `kind: 'tutorial'` в WHATS_NEW, WhatsNewPanel поддерживает туториалы

---

## ✅ Завершено — Сессия 2026-05-17–19

### Auth & Access
- ✅ Google OAuth, Magic Link, AuthModal GDPR
- ✅ Tutorial gate, Guest lock, Prompt Library gate
- ✅ AccountPage полная (GDPR, export, delete, cookie)
- ✅ Audience tracks в CoursesModal (pills EN/RU/FI)

### Profile
- ✅ useSupabaseStats: viewedIds, reviewIds, bookmarkNodeIds
- ✅ Bookmark navigation fix (Supabase IDs приоритетны)
- ✅ AuthContext race condition fix (Supabase v2, только onAuthStateChange)

### Code splitting
- ✅ Lazy locale content (nodes/tutorials/prompts per locale)
- ✅ manualChunks: react, supabase, icons

---

## ✅ Завершено — Сессия 2026-05-22

### QA Pipeline
- ✅ **GitHub Actions QA** — build + lint + Playwright smoke-тесты после каждого push
- ✅ **Telegram-уведомления** — бот @My_Ai_AtlasBot, TELEGRAM_TOKEN + TELEGRAM_CHAT_ID в GitHub Secrets
- ✅ **5 smoke-тестов** — app loads, mindmap renders, no blank screen, courses modal, detail panel
- ✅ **Lint fixes** — 7 ошибок: titles для b-models/cap-computer/cap-thinking, icon code→terminal (pl-api + api-basics), dangling relatedIds в b-context

### Навигация и взаимодействие
- ✅ **navigateToNode хелпер** — единая функция: setRoute + panToNode с retry; используется везде
- ✅ **DetailNavFooter** — кнопки «← Назад» / «Далее →» теперь плавно двигают карту
- ✅ **Клавиши ← →** — навигация по узлам с клавиатуры тоже движет карту
- ✅ **Кнопки профиля** — «Закладки», «Прочитано», «Вернуться» двигают карту к первому узлу списка

### UX-аудит — исправлено
- ✅ **ОБНОВЛЕНО на всех узлах** — initFirstVisit() засевает все записи как seen при первом визите; новый пользователь видит чистую карту
- ✅ **markSeen при старте туториала** — onStartTutorial вызывает markSeen(key)
- ✅ **WelcomeCard dismiss** — добавлена кнопка × на newcomer-варианте; «Начать» закрывает карточку; TTL: 90 дней для newcomer, 14 дней для continue
- ✅ **Мобиль fitToScreen** — useIsMobile + hasAutoFitted ref; fitToScreen(padding=20) при первой загрузке; onFit на мобиле тоже padding=20
- ✅ **Mindmap.jsx** — fitToScreen принимает опциональный padding
- ✅ **Закрывать дропдауны при смене route** — CanvasHeader (Atlas-меню) и CanvasFilters (обновления + категория) закрываются при любом изменении route

### Автоматизация контента (план)
- ✅ **Стратегия автопубликации** — план 3 фаз: content-queue.json → lesson-publisher skill → content-scout skill → GitHub Actions cron + Claude API

### Mobile FAB (завершено 2026-05-22)
- ✅ **TR FAB: Поиск** — открывает bottom sheet + автофокус через 350мс; иконка становится оранжевой при активном запросе + dot-индикатор
- ✅ **BR FAB: Курсы** — прямой вызов CoursesModal (было Library); Library переехала в секцию «Контент» меню

### Поиск (завершено 2026-05-22)
- ✅ **Pan к matched-узлу при поиске** — debounce 350мс + panToNode к первому результату с retry 8×60мс; раньше matched-классы применялись, но камера не двигалась

### Курсы (завершено 2026-05-22)
- ✅ **Статус-фильтр** — «Все курсы | В процессе | Завершены» с бейджами-счётчиками
- ✅ **Группировка по уровню** — Новичок → Продвинутый → Эксперт (цветные заголовки с dot)
- ✅ **Бейдж ✓ поверх иконки** завершённых курсов
- ✅ **Пустое состояние** при отсутствии курсов в выбранном фильтре
- ✅ **Фикс summary** — `byAudience.length` вместо `items.length`
- ✅ **i18n** — `courses.status.*`, `courses.empty.*` добавлены в ru/en/fi

### Модалки
- ✅ **IntroModal** — первое знакомство для новых посетителей (2 слайда: что это + ваша роль); после — открывается ai-fluency
- ✅ **IntroModal: auth кнопка** — «Войти или создать аккаунт» на слайде 2
- ✅ **Удалён переключатель Quick/Standard/Deep** — всегда показывается максимальный контент
- ✅ **Удалён выбор уровня из ProfilePanel** — уровень остался для сортировки курсов, но убран из UI профиля
- ✅ **Брендинг** — «Claude Atlas» → «105 Atlas» во всех пользовательских текстах

---

## ✅ Завершено — Сессия 2026-05-22 (AI-Native Customer Support)

### Третье Transformation-направление (7 узлов + контейнер + UC)
- ✅ **ai-native-customer-support** — контейнер с maturity stages (inbox)
- ✅ **cs-tier1** — Tier-1 Automation (robot)
- ✅ **cs-agent-assist** — Agent Assist tier-2 (keyboard)
- ✅ **cs-knowledge-base** — KB Ops с auto-updates (books)
- ✅ **cs-escalation** — Smart Escalation (send)
- ✅ **cs-quality-monitoring** — Continuous Quality Review (check-circle)
- ✅ **cs-support-analytics** — Voice of Customer Analytics (chart)
- ✅ **cs-team-workflow** — CS Team Operating Model (users)
- ✅ **uc-ai-support-tier1** — Use Case: запуск AI Tier-1 за 3-4 недели (command)

27 cross-links. Bundle: 91.18 KB gzip.
Transformation покрывает 3 audience: Operations + Marketing + Customer Support.

## ✅ Завершено — Сессия 2026-05-22 (AI-Native Marketing)

### Второе Transformation-направление (6 узлов + контейнер + UC)
- ✅ **ai-native-marketing** — контейнер с maturity stages
- ✅ **mk-content-ops** — Content Operations pipeline (pencil)
- ✅ **mk-campaign-intel** — Campaign Intelligence (globe)
- ✅ **mk-brand-voice** — Brand Voice tuning (quote)
- ✅ **mk-seo-optimization** — SEO at Scale (search)
- ✅ **mk-performance-analytics** — Performance Analytics (eye)
- ✅ **mk-team-workflow** — Marketing Team AI Workflow (users)
- ✅ **uc-ai-content-ops-launch** — Use Case: запуск контент-операций за 2 недели

26 cross-links к Foundation + Systems + Operations. Bundle: 90.94 KB gzip.
Transformation теперь покрывает 2 аудитории: Operations (internal) + Marketing (creative).

## ✅ Завершено — Сессия 2026-05-22 (Phase 4 — Systems Tier 1)

### AI Workflows раздел (3 узла + контейнер)
- ✅ **ai-workflows** — контейнер
- ✅ **sys-workflows-basics** — анатомия AI workflow (flash)
- ✅ **sys-linear-chain** — простейший production-паттерн (arrow-right)
- ✅ **sys-quality-gates** — human-in-the-loop pattern (shield)

### AI Data Systems раздел (2 узла + контейнер)
- ✅ **ai-data-systems** — контейнер
- ✅ **sys-rag-architecture** — 4 RAG-паттерна (testtube)
- ✅ **sys-context-passing** — стратегии передачи контекста (hook)

Особенности: ASCII workflow-диаграммы, architectural trade-offs, 16 cross-links к L1+L3.
Bundle: 90.71 KB gzip (+0.26 KB).

**MVP архитектуры замкнут:** все 4 уровня содержат реальный контент.
Operations→Systems→Foundation теперь связаны через явные паттерны.

## ✅ Завершено — Сессия 2026-05-22 (Phase 3 — Operations flagship)

### AI-Native Operations (5 узлов + контейнер)
- ✅ **ai-native-operations** — контейнер с maturity stages 0-4
- ✅ **ops-process-automation** — повторяющиеся процессы (repeat)
- ✅ **ops-decision-intelligence** — AI-поддержка решений (idea)
- ✅ **ops-reporting-automation** — автогенерация отчётов (chart)
- ✅ **ops-resource-optimization** — оптимизация ресурсов (sliders)
- ✅ **ops-team-workflow** — командный workflow (users)

### Use Cases (3 cross-layer paths)
- ✅ **uc-ai-reporting-launch** — Запуск AI-репортинга за 2 недели (clipboard)
- ✅ **uc-ai-process-automation** — Автоматизация процесса (puzzle)
- ✅ **uc-ai-decision-support** — AI-поддержка решений (compass)

Каждый UC = явный 6-step path через узлы Foundation + AI Fundamentals + Transformation.
24 cross-links к существующим узлам. Workflow diagrams в example, maturity stages в каждом ops-узле.
Bundle: 90.45 KB gzip (+0.27 KB).

**Что дальше:** Phase 4 — Systems Tier 1 (3-5 узлов для поддержки Operations workflows) ИЛИ
второе Transformation-направление (Marketing/Support/Product).

## ✅ Завершено — Сессия 2026-05-22 (Phase 2 batch 2.5)

### AI Fundamentals — расширение (+3 узла, теперь 7 всего)
- ✅ **af-memory-systems** — AI Memory: 4 типа (book)
- ✅ **af-multimodal** — Multimodal AI (paint)
- ✅ **af-fine-tuning** — Fine-tuning vs Prompting (mixer)
- Cross-links: 9 связей с существующими узлами
- ai-fundamentals полный (7 узлов): LLM → Embeddings → Vector DB → RAG → Memory → Multimodal → Fine-tuning

**Следующий шаг:** Phase 3 — Operations flagship (5 узлов AI-Native Operations + 2-3 Use Cases)

## ✅ Завершено — Сессия 2026-05-22 (Phase 2 batch 1)

### AI Fundamentals — первый батч (4 узла + контейнер)
- ✅ **ai-fundamentals** контейнер под foundation
- ✅ **af-llm-basics** — LLM: как работает (cube, cross-link: b-claude/b-models/b-context)
- ✅ **af-embeddings** — Embeddings: векторные представления (compass)
- ✅ **af-vector-db** — Vector Databases (bricks)
- ✅ **af-rag-basics** — RAG: Retrieval Augmented Generation (archive)
- Контент: 5 узлов × 6 полей × 3 локали (ru/en/fi)
- Cross-links: 9 связей с существующими узлами

**Следующий батч 2.5:** af-memory-systems, af-multimodal, af-fine-tuning
**После batch 2.5:** Phase 3 — Operations flagship (5 узлов + 2-3 Use Cases)

## ✅ Завершено — Сессия 2026-05-22 (Phase 1)

### Архитектурная миграция Phase 1 — AI-Native Transformation OS
- ✅ **Strategy pack** — 10 документов в `docs/strategy/` (~2900 строк)
- ✅ **00-DECISIONS.md** — 16 архитектурных решений утверждены
- ✅ **Categories migration** — 5 старых → 8 новых (foundation/configuration/prompts/automation/agents/systems/transformation/use-cases)
- ✅ **Root structure** — 4 новых root-узла (foundation/systems/transformation/use-cases), 12 разделов теперь дети foundation
- ✅ **7 новых узлов** — foundation, systems, transformation, use-cases + 3 anchor (sys-overview, tf-overview, uc-overview) на ru/en/fi
- ✅ **CoursesModal → WorkflowsModal** — rename файла, компонента, всех ссылок (App.jsx, MobileFab, hooks, App.css)
- ✅ **i18n обновлены** — Tutorial/Курсы → Workflow во всех UI-текстах
- ✅ **133 узла** — category переведены на новые имена через Python script (атомарно)
- ✅ **Build passes** — 89.93 KB gzip (+0.4 KB)
- ✅ **User progress сохранён** — ID узлов не меняли

## ✅ Завершено — Сессия 2026-05-22 (продолжение)

### CoursesModal — UX-доработки
- ✅ **Фильтры → дропдауны** — две строки pills заменены на два компактных дропдауна в одной строке: «Для кого» (слева) + «Статус» (справа, только на вкладке Курсы)
- ✅ **Карточки на всю ширину** — `width: 100%` на `.course`, flex column вместо grid, gap/отступы как в маршрутах, белый фон + цветная border-left
- ✅ **Модалка прикреплена к верху** — `align-items: flex-start` + `padding-top: 60px`; нет прыжка при переключении табов

### Профиль
- ✅ **Выпадашка «Пройдено»** — сворачиваемая секция в ProfilePanel; список завершённых курсов с ✓; клик → открывает курс
- ✅ **Синхронизация с Supabase** — `completedCourses` берёт ID из `supaStats.completedTutorialIds` когда залогинен (localStorage больше не единственный источник)
- ✅ **`tutorial_id` добавлен в Supabase-запрос** — `useSupabaseStats` теперь возвращает `completedTutorialIds: string[]`

### Контент-фиксы
- ✅ **`intro` переименован** — «Знакомство с Claude» → «Первый запуск Claude» (EN: Your first Claude session / FI: Ensimmäinen Claude-sessio); устранена путаница с дублирующим `welcome`

---

## 🔴 Открытые задачи (приоритет)

### Курсы — Батч 2 (завершено 2026-05-22)

| # | id | Название | Аудитория | Уровень | Статус |
|---|----|---------|-----------|---------|----|
| 1 | `claude-for-educators` | Claude для педагогов | business | beginner | ✅ (готов ранее) |
| 2 | `workflow-automation` | Строим AI-рабочий процесс | everyone | intermediate | ✅ |
| 3 | `role-use-cases` | Claude по профессиям | business | intermediate | ✅ |

**Процесс создания курса (задокументирован):**
1. **Выбрать nodeId** — свободный узел mindmap (не занятый другим туториалом). Список занятых: `tutorialByNodeId` в tutorials.js
2. **Добавить запись в tutorials.js** — nodeId, icon (из REGISTRY в Icon.jsx!), level, audience, prerequisites, relatedPrompts, next, steps с ID
3. **Написать контент в 3 локали** — `ru/tutorials.json`, `en/tutorials.json`, `fi/tutorials.json`; схема: title, subtitle, totalTime, whatItIs, approach, outcomes[], applyIn[], pitfalls[], exercises[], steps{id: {title, time, why, instructions[], tip, validate}}
4. **Проверить JSON** — `node -e "JSON.parse(require('fs').readFileSync('...'))"` на каждый файл
5. **Запустить sync** — `node scripts/sync-whats-new.mjs` → обновит whatsNew.js и nodeHashes.json
6. **Build + commit** — git add все 5 файлов (tutorials.js + 3 локали + whatsNew.js + nodeHashes.json)

### Курсы — Батч 3 (после батч 2)

| # | id | Название | Аудитория | Уровень | Обоснование |
|---|----|---------|-----------|---------|----|
| 4 | `mcp-advanced` | MCP: продвинутые сценарии | developers | advanced | Anthropic: «MCP Advanced Topics». У нас только базовый MCP |
| 5 | `building-evaluations` | Как оценивать ответы Claude | developers | intermediate | Anthropic GitHub-курс по evals. Критично для тех кто строит на Claude |

### UX-аудит — остаток (продолжить следующей сессии)

Аудит проведён с помощью Claude Preview (localhost:5173). Найдено 8 проблем, закрыто 4.

| # | Задача | Приоритет | Статус |
|---|--------|-----------|--------|
| 1 | ОБНОВЛЕНО на всех узлах при первом визите | 🔴 | ✅ |
| 2 | WelcomeCard — dismiss + кнопка × | 🔴 | ✅ |
| 3 | Мобиль — fitToScreen при загрузке | 🔴 | ✅ |
| 4 | Закрывать дропдауны при смене route | 🟡 | ✅ |
| 5 | Курсы — группировка по уровню + фильтр статуса | 🟡 | ✅ |
| 6 | Поиск — inline-строка должна фильтровать карту | 🟡 | ✅ |
| 7 | Мобиль — FAB-кнопки для Курсов и Поиска | 🟡 | ✅ |
| **8** | **Тёмная тема** | 🔵 | open |

**Детали пункта 5 (Курсы):**
Реализация была в коммите `7e9f612` но откатана. Нужно повторить:
- Статус-фильтр: «Все курсы | В процессе | Завершены» (с счётчиком-бейджем)
- Группировка по уровню: Новичок → Продвинутый → Эксперт (с цветными заголовками)
- Бейдж ✓ поверх иконки завершённых курсов
- Пустое состояние при отсутствии курсов
- Исправить: `items.length` → `byAudience.length` в строке summary
- i18n: `courses.status.*`, `courses.empty.*` (добавить в ru/en/fi)

**Детали пункта 6 (Поиск):**
Inline-строка в CanvasHeader открывается, но ввод текста не фильтрует карту.
Нужно проверить: `onQuery` → `setQuery` → `searchTree` → узлы подсвечиваются.
Возможно React event propagation issue в input внутри CanvasHeader.

**Детали пункта 7 (Мобиль FAB):**
На мобиле нет прямых кнопок для Библиотеки, Курсов, Поиска в шапке.
В MobileFab.jsx добавить: кнопку «Обучение» (открывает CoursesModal) и «Поиск».

### Контент — автопубликация (следующий шаг)
| # | Задача | Статус |
|---|--------|--------|
| 1 | **`content/content-queue.json`** — перенести бэклог уроков в машиночитаемый формат | open |
| 2 | **`skills/lesson-publisher/SKILL.md`** — оркестратор публикации одного урока | open |
| 3 | **`skills/content-scout/SKILL.md`** — еженедельный поиск новых уроков в Anthropic Academy | open |
| 4 | **`scripts/publish-lessons.mjs`** — Node.js скрипт вызова Claude API для генерации | open |
| 5 | **`.github/workflows/publish-lessons.yml`** — cron-расписание публикации (понедельник 08:00) | open |

### Техника
| status | task | примечание | дата |
|--------|------|-----------|------|
| open | **Supabase session timebox** — выставить 30 дней в Dashboard | Authentication → Sessions | — |
| open | **Learning Paths: For Business + For Educators** | Собрать батч 2 курсы в маршруты после реализации | — |
| open | **Аудит устаревших узлов** — `cap-computer`, `b-knowledge`, `pl-platforms` | skill: content-gap-auditor | — |

### P3 — Premium (будущее)
| status | task |
|--------|------|
| open | Pricing page / premium CTA |
| open | Stripe / Lemon Squeezy интеграция |

---

## Правила работы
- Каждая задача: build ✅ → preview/test ✅ → commit → push → обновить этот файл
- После правки контента — `node scripts/sync-whats-new.mjs` (правило 10a CLAUDE.md)
- Не начинать следующую задачу без теста предыдущей
- После каждого git push — обновить этот файл

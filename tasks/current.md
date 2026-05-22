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

## 🔴 Открытые задачи (приоритет)

### Курсы — Батч 2 (следующий)

Анализ Anthropic Academy (anthropic.com/learn + skilljar) выявил следующие пробелы.
Приоритизировано по пользе для аудитории Atlas (не только разработчики):

| # | id | Название | Аудитория | Уровень | Обоснование |
|---|----|---------|-----------|---------|----|
| 1 | `claude-for-educators` | Claude для педагогов | business | beginner | Anthropic имеет «AI Fluency for Educators». Уже запланировано, нужен узел `b-educators` |
| 2 | `workflow-automation` | Строим AI-рабочий процесс | everyone | intermediate | Пробел: нет курса про сборку реального workflow (Projects + Skills + Scenarios вместе) |
| 3 | `role-use-cases` | Claude по профессиям | business | intermediate | Anthropic: Marketing/Sales/HR/Product use cases. Наш `scenarios` — общий, нет role-specific |

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
| **7** | **Мобиль — FAB-кнопки для Курсов и Поиска** | 🟡 | open |
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

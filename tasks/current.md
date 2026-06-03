# Current Tasks

Активная работа. До 5 задач одновременно.
**Правило:** каждая задача завершается только после build ✅ + визуальной проверки ✅.

---

## 🎯 Текущий фокус (2026-05-27): Product-first

**Все distribution-процессы заморожены** — см. `docs/business-strategy/PIVOT-PRODUCT-FIRST.md`.

Не запускаются:
- ❌ Interview validation (была Track A)
- ❌ LinkedIn outreach (был Nordic playbook)
- ❌ Email cold-acquisition
- ❌ Content marketing посты
- ❌ Growth/sales/competitive skill-агенты (dormant)

Фокус 100%:
- ✅ Atlas — content depth + UX polish
- ✅ Builder — продвижение от MVP к Beta (auth, persistence, real APIs)
- ✅ Технический долг — performance, security, infra

Возобновление distribution — только при выполнении одного из условий в PIVOT-PRODUCT-FIRST.md.

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

## 🧭 Где мы сейчас (2026-06-01): production + автоматизация + SEO

Отгружено за последние сессии (всё в проде):
- ✅ **Production-only**: демо-режим удалён, запуск всегда реальный.
- ✅ **Серверный планировщик**: автозапуск по расписанию (время + «каждые N минут»)
  через pg_cron → builder-scheduler → builder-execute (сервисный режим, без JWT).
  Работает без браузера. Telegram-доставка проверена.
- ✅ **Path-routing** (ADR-0008): реальные URL `/ru/node/...` вместо `#/...`,
  обратная совместимость старых ссылок, OAuth переведён на pathname.
- ✅ **SEO-пакет**: robots.txt, sitemap.xml, динамические `<title>`/description,
  hreflang, og-image — всё на `window.location.origin` (автодомен). Чек-лист
  переезда: `docs/domain-switch-checklist.md`.
- ✅ **Узлы логики**: Условие, Условие-агент, Цикл. **Фаза 4**: Web/Память/Файлы/Vision
  реальны. **Вкладка «Помощь»** (энциклопедия). Тосты + скелетоны.
- ✅ Локализация холста (Да/Нет на линиях), фиксы утечки Realtime.

### 📋 Что дальше (приоритеты)
- [x] **Защита кошелька** ✅ (2026-06-03): анти-наложение прогонов (409 already_running),
  суточные лимиты на пользователя (`BUILDER_DAILY_RUN_CAP`/`TOKEN_CAP`) + авто-пауза
  всех расписаний при превышении, счётчик «сегодня» в «Все автозапуски».
  Док: `docs/agent-builder/15-server-execution-and-autorun.md`.
- [x] **Коннекторы** ✅: email-выход (Resend BYOK), Google Calendar (OAuth). MCP-серверы
  (директория + per-node выбор, этап 2).
- [x] **Журнал автозапусков в UI** ✅ (2026-06-03): история прогонов в окне «Все
  автозапуски» (время, схема, статус, токены) — commit `aeeeead`.
- [x] **Триггер «вебхук»** ✅ (2026-06-03): публичная функция `builder-webhook` +
  таблица `builder_webhooks` (миграция 007) + блок «Вебхук» в окне расписаний
  (ссылка/копировать/вкл-выкл/новая ссылка). Тело запроса → задача, иначе «Старт».
  ⚠️ Запустить миграцию 007 + `supabase functions deploy builder-webhook --no-verify-jwt`.
- [ ] Code-exec — реальное исполнение (остаток Фазы 4).
- [ ] Per-page превью в соцсетях (SSR/prerender) — крупная отдельная задача.
- [ ] Рубрика «Помощь» — обновить под актуальный поток (там ещё старые формулировки).

### 🧭 Сессия 2026-06-03 — Builder UX + инцидент с автозапуском (всё в проде)
- ✅ **Узлы — гайд «Как использовать»**: на hover в палитре + в деталях две кнопки
  (гайд + «Узнать больше в Atlas»); контент по 24 узлам ru/en/fi (`nodeGuides.js`).
- ✅ **Стандарт вторичных кнопок** (нейтральный цвет + единый hover, светлая/тёмная):
  `docs/agent-builder/ui-button-standard.md`.
- ✅ **Шапка/сохранение**: переключатель workflow в центре, кнопка «Сохранить» убрана
  (автосохранение + авто-имя новых схем), бейдж «Сохранено».
- ✅ **Старт-узел**: singleton (один на схему), CTA во всю ширину палитры, исчезает с
  холста; авто-открытие окна настройки при дропе узлов с данными.
- ✅ **MCP этап 2**: per-node выбор серверов.
- ✅ **Веб — search-only**: родные web-инструменты Claude, открытие страниц (web_fetch)
  отключено ради лимита 30k токенов/мин; правило «читать, не вспоминать» + текущая дата.
- ✅ **Инцидент**: «каждые 2 мин» расписание архивной схемы жгло токены. Починено:
  удаление схемы чистит её расписания + планировщик гасит расписания архивных схем.

### 🧭 Сессия 2026-06-03 (продолжение) — автозапуск «как на холсте», веб, доставка, тур
- ✅ **Автозапуск строго «как на холсте»**: расписание НЕ хранит копию задачи —
  движок берёт её из узла «Старт» при каждом запуске; правки схемы (после сохранения)
  сразу влияют на автозапуск (commit `7ff660e`).
- ✅ **Задача «Старта» сохраняется в узел** (`data.task`) и восстанавливается при
  загрузке — раньше терялась после перезахода.
- ✅ **Веб = родные инструменты Claude**: `web_search` (открытие страниц `web_fetch`
  отключено ради лимита 30k токенов/мин); grounding «читать, не вспоминать» + текущая
  дата; устойчивость к 429 (ждать-и-повторить) + обрезка входа (commits `418ec8c`,
  `bd090c3`, `7283c79`, `7e2713c`, `bd4fff3`).
- ✅ **Журнал автозапусков** в окне «Все автозапуски» (commit `aeeeead`).
- ✅ **Красивая доставка в Telegram**: Markdown → Telegram HTML (заголовки/списки/
  ссылки), текстовый фолбэк (commit `5a3cabc`).
- ✅ **Вебхук-триггер** (commit `82debcb`, миграция 007 + `builder-webhook`).
- ✅ **Тур переписан** под актуальный поток (Старт→ключи→запуск→автозапуск/вебхук),
  ключ версии v1→v2 (commit `916bd4e`).
- 📌 **Деплой-долг пользователя**: миграция 007; `supabase functions deploy
  builder-webhook --no-verify-jwt`; редеплой `builder-execute` (веб/доставка/«как
  на холсте»); `builder-scheduler --no-verify-jwt` (предохранитель архивных схем).

### 🧭 Сессия 2026-06-03 (барьер качества + фиксы)
- ✅ **Баг `started_at`**: запросы к `builder_executions` шли по несуществующей
  `created_at` → молча падали, из-за чего **защита кошелька (суточный лимит +
  анти-наложение) фактически не считалась**, а счётчик/история были пусты.
  Исправлено во фронте и движке (commit `199823d`).
- ✅ **Барьер качества (команда ревью → адвокат дьявола → судья)**: новые скиллы
  `quality-gate` (оркестратор, BLOCK только на высоком риске, маршрутизация по diff),
  `engine-reviewer`, `security-reviewer`, `code-judge`; правило в CLAUDE.md «перед
  push кода — quality-gate» (commit `9d1671c`).
- ✅ **Барьер на первом прогоне поймал реальную дыру**: вебхук брал время анти-флуда
  из URL-параметра `_now` → обход лимита частоты. Починено (только серверное время,
  commit `7f25184`).
- ✅ **Причина ошибки в журнале**: `executions.error_message` теперь заполняется при
  сбое (логгер запоминает последнюю ошибку) → в «Все автозапуски» видно, почему упало
  (commit `aa80ab6`).
- 📌 **Деплой-долг**: `supabase functions deploy builder-execute` и
  `builder-webhook --no-verify-jwt`.

### 💡 Идеи на потом (в `tasks/ideas.md`)
- Жёсткий barrier прода: pre-push hook или GitHub Actions на PR (сейчас quality-gate
  работает в on-demand режиме — мягкий).
- Code-exec — реальное исполнение узла (остаток Фазы 4).
- Локальные модели (Ollama) как «Local/Privacy mode (beta)» + абстракция «провайдер модели».
  Сервер не видит localhost → только браузерный тест-режим. Обсуждено, не делаем сейчас.
- Поднятие tier Anthropic (Add funds) — снимает потолок 30k токенов/мин для тяжёлого веба.

---

## 🧭 (архив) 2026-05-28: Builder — edge/connection итерация

Завершён большой цикл UX-работы по соединению узлов (всё закоммичено + задеплоено):
- ✅ Кастомная связь: без стрелки, градиент родитель→ребёнок, бегущий пунктир от родителя.
- ✅ Разъединение по hover (красный кружок, иконка цепь→разорванная цепь).
- ✅ Соединять можно с любым узлом, с любой стороны (`connectionMode="loose"`).
- ✅ Родитель = узел, ОТ которого потянули линию (фикс через onConnectStart/swap).
- ✅ Хэндлы скрыты, появляются на hover, пульсация у несоединённых; undo/redo; подтверждение очистки; панель действий узла.

Прогнаны агенты: `ux-interaction-tester`, `technical-risk-auditor`, `ux-flow-designer`.
Полные находки → `tasks/builder-ux-audit-2026-05-28.md`.

### 📋 План следующих шагов (приоритизировано)

**Группа A — тех-долг — ✅ ЗАВЕРШЕНА (2026-05-28, commit f5249a5):**
- [x] A1. `historyBridge.push` → `useEffect` + cleanup (убрана мутация синглтона на каждом рендере).
- [x] A2. `sourceHandle`/`targetHandle` рёбер сохраняются в `config` jsonb (без миграции БД); round-trip проверен (PASS).
- [x] A3. `isValidConnection` нормализует направление по `connectOriginRef` — цикл/дубль проверяются в реальном направлении.

**Группа B — полировка соединений — ✅ ЗАВЕРШЕНА (2026-05-28):**
- [x] B1. Отступы панелей узла увеличены (Top/Right offset → 28), чтобы не перекрывать верхний/правый хэндлы выбранного узла.
- [x] B2. Пульсируют только канонические порты: верх (вход) и низ (выход); левый/правый — без пульсации.
- [x] B3. Клик по связи выделяет её (подсветка + свечение), Delete/Backspace удаляет; grace-таймаут 160мс на кнопке «разъединить».
- [x] B4. Русские fallback-подсказки хэндлов + aria-label на кнопке разъединения (ключи локалей уже были).

**Группа C — ценность для Beta (flow-агент):**
- [x] C1. **H4 pre-run валидация** — ✅ модалка перед реальным запуском: ошибка «нет агентов» блокирует, предупреждение «есть несоединённые узлы» даёт «Запустить всё равно». Чисто → запуск сразу. i18n ru/en/fi.
- [x] C2. **Markdown-рендер результата** — ✅ свой безопасный рендерер `Markdown.jsx` (без новых зависимостей, без dangerouslySetInnerHTML): заголовки/списки/жирный/код/цитаты/ссылки. Стили `.md-*`.
- [ ] C3. Сократить путь к первому реальному запуску (5+ шагов, 3 модалки). [M]
- [ ] C4. Guided-настройка инструкций узлов + значок «настроен». [M]
- [ ] C5. Переменные на триггере (`{{бренд}}`) — переиспользуемый workflow. [L]

### 🧠 Инициатива: модель способностей узлов + умная палитра (2026-05-28)

Цель: система ПОНИМАЕТ, какие узлы существуют, что умеют и какие связи допустимы
(семантические правила, не только структурные). Подробно — `docs/agent-builder/10-node-capability-model.md`.
Решения: 2 типа связей (DATA + ATTACH); инструмент = способность агента.

- [x] **Фаза 1 — «мозги»** (commit ниже): `nodeCapabilities.js` (порты/типы связей),
  `connectionRules.js` (`evaluateConnection`/`validateGraph`/`validTargetKinds`, 11/11 тестов),
  подключено в `isValidConnection` + pre-run валидацию. Новые предупреждения: multi-trigger,
  output-empty, tool-unattached (i18n ru/en/fi). Doc `10-node-capability-model.md`.
- [x] **Фаза 2 — палитра** (commit ниже): `NodePalette.jsx` — сетка квадратных плиток + поиск
  (по названию/описанию/роли/id в локали) + клик = добавить узел в центр (M4). Подсветка при
  перетягивании: показываем все хэндлы (`.is-connecting`), валидная цель — зелёный ореол
  (класс `.valid` от React Flow). i18n палитры ru/en/fi.
- [x] **Фаза 3 — governance** (commit ниже): `scripts/lint-builder-graph.mjs` (npm `lint:builder`,
  встроен в pre-commit при изменении builder-данных) — проверяет поля def, i18n во всех локалях,
  группы палитры, валидность связей в шаблонах. **Поймал 7 нарушений** в шаблонах (`agent→tool`
  вместо `tool→agent` + `tool→output`) — все 4 шаблона приведены к ATTACH-модели. Скилл
  `skills/builder-node-architect/`. ADR-0007 + INDEX.
- [ ] **Фаза 4 — B-3**: edge-функция трактует ATTACH как способности агента + реальные интеграции инструментов.

### 📦 Расширение каталога узлов (2026-05-28)

План + фазировка → `docs/agent-builder/11-node-catalog-roadmap.md`.

- [x] **Batch A** (commit ниже): +4 агента (`agent-code`/`designer`/`pm`/`content`),
  +4 инструмента (`tool-code-exec`/`computer`/`citations`/`mcp`), +`output-telegram`.
  Заземлены на Atlas (atlasAnchor), i18n ru/en/fi, в палитре, lint:builder passed (19 узлов).
- [x] **Telegram функционально** (commit ниже): секция Telegram в `ApiKeysModal` (подключение/отключение
  токена бота, provider 'telegram', валидация через getMe на сервере) + попап `TelegramConfigPopover`
  с полем chatId на узле `output-telegram` (сохраняется в config → бэкенд шлёт `sendMessage`). i18n ru/en/fi.
- [ ] **Batch B (Фаза 4)**: триггеры (webhook/schedule), выходы email/webhook, категория `logic`.
- [~] **Фаза 4 — исполнение (web готово)**: `builder-execute` трактует ATTACH как способности
  агента. **Web Search оживлён**: при `tool-search`(web_search), прикреплённом к агенту,
  сервер извлекает URL из задачи/контекста, реально загружает страницы (HTML→текст, лимит 6000,
  таймаут 12с, SSRF-защита: блок localhost/private/metadata) и добавляет в контекст агента.
  Лог «Opening …/Fetched …». ⚠️ Требуется `supabase functions deploy builder-execute`.
  Осталось реальным сделать: Files (нужен upload-канал), Vision (image input), Code-exec, MCP.

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
- ✅ **Брендинг** — «105 Atlas» → «105 Atlas» во всех пользовательских текстах

---

## ✅ Завершено — Сессия 2026-05-22 (Тёмная тема)

### Dark theme — finalized
- ✅ **CSS variables** — `:root[data-theme="dark"]` переопределяет всю палитру
- ✅ **useTheme hook** — localStorage + prefers-color-scheme detection + listener
- ✅ **ProfilePanel** — sun/moon toggle рядом с language switcher
- ✅ **meta[theme-color]** обновляется для мобильных
- ✅ **No flash** — applyTheme() synchronous before React render
- ✅ Smooth .2s transition на body/modals/nodes
- ✅ i18n: profile.theme.toLight/toDark (ru/en/fi)
- ✅ Icon REGISTRY: +sun, +moon

Закрывает последний пункт UX-аудита #8 (Тёмная тема).
Bundle: 96.18 → 96.63 KB gzip (+0.45 KB).

## ✅ Завершено — Сессия 2026-05-22 (Learning Paths)

### +6 audience-specific Learning Paths (6→12)
- ✅ **ops-team** (business/intermediate, 8 steps) — settings
- ✅ **marketing-team** (business/intermediate, 8 steps) — mask
- ✅ **support-team** (business/intermediate, 9 steps) — inbox
- ✅ **product-team** (business/intermediate, 8 steps) — construction
- ✅ **enterprise-transformation** (business/advanced, 8 steps) — building
- ✅ **design-team** (everyone/intermediate, 8 steps) — paint

Каждый path: tutorial → Foundation → Systems → Transformation → UC.
Локализованы в ru/en/fi (144 текстовых блока).
Существующие 6 paths сохранены как generic skill-based paths.
Bundle: 96.18 KB gzip.

## ✅ Завершено — Сессия 2026-05-22 (Tutorials migration)

### 32 туториала relinked к Use Cases
- ✅ Аудит: все 32 nodeId валидны, все existing `next` ссылки рабочие
- ✅ +40 UC-ссылок в `next` arrays для 28/32 туториалов
- ✅ TutorialModal автоматически рендерит UC-узлы (findNodeById) — UI без изменений

После завершения tutorial пользователь видит **«применить знание в практике»** через релевантные Use Cases. Цепочка: Tutorial → UC → Foundation/Systems/Transformation nodes.

Маппинг (примеры):
- ai-fluency → uc-ai-rag-launch
- claude-for-business → uc-ai-reporting-launch + uc-ai-decision-support + uc-ai-roi-estimation
- workflow-automation → uc-ai-process-automation
- mcp → uc-ai-multi-agent-system + uc-ai-vendor-selection
- api-basics → uc-ai-vendor-selection

4 туториала намеренно без UC: welcome/intro/terminal-tour/folders-workshop (onboarding).

Bundle: 92.93 KB gzip.

## ✅ Завершено — Сессия 2026-05-22 (AI-Native Design)

### Шестое Transformation-направление (7 узлов + контейнер + UC)
- ✅ **ai-native-design** — контейнер (paint)
- ✅ **ds-design-research** — Usability synthesis (microscope)
- ✅ **ds-prototype-generation** — Mockup → code (bricks)
- ✅ **ds-design-ops** — Component docs, asset audit (tools)
- ✅ **ds-accessibility** — A11y checks, WCAG (shield)
- ✅ **ds-design-system** — Token gen, variants, migration (puzzle)
- ✅ **ds-content-design** — UX writing, microcopy, i18n (quote)
- ✅ **ds-team-workflow** — Design Team Operating Model (users)
- ✅ **uc-ai-design-research-launch** — UC: AI Design Research за 2 недели (eye)

29 cross-links. Bundle: 92.76 KB gzip.

**Transformation полный (6 directions):**
- 5 tactical: Operations / Marketing / Customer Support / Product / Design
- 1 strategic: Enterprise

## ✅ Завершено — Сессия 2026-05-22 (Phase 5 UI polish)

### Visual layer indicators
- ✅ **MindmapNode** — класс `mm-node--layer` для 4 root-layer узлов (depth=1)
- ✅ **CSS** — layer-узлы получили цветную полоску внизу, градиентный фон, толще border
- ✅ **Hover/Selected states** — layer-цветной glow и поднятие

### IntroModal — новое позиционирование
- ✅ **slide1**: «Карта AI-трансформации» вместо «карта экосистемы Claude»
- ✅ **Features**: Foundation → Systems → Transformation → Use Cases
- ✅ **Roles**: переориентированы на новую аудиторию (Operations/Marketing/Support, Product/Design, Tech lead/Enterprise)
- ✅ ru/en/fi полностью переписаны

### Brand & SEO
- ✅ **Page title**: «105 Atlas — AI Transformation Map»
- ✅ **Meta description**: про AI transformation + 5 directions
- ✅ **OG/Twitter Cards** обновлены

Bundle: 92.23 KB gzip.

## ✅ Завершено — Сессия 2026-05-22 (Systems Tier 2)

### Полная структура Systems-слоя (6 sub-разделов)
- ✅ **ai-orchestration** (command) + **sys-multi-agent-patterns** (puzzle, 4 архитектурных паттерна)
- ✅ **ai-human-collaboration** (users) + **sys-escalation-paths** (send, AI→human handoff)
- ✅ **ai-operations** (eye) + **sys-evals-benchmarks** (check-circle) + **sys-cost-management** (tag)
- ✅ **ai-integration-systems** (plug) + **sys-api-patterns** (globe, sync/async/webhook/streaming)

ASCII diagrams во всех patterns. Bidirectional cross-links с Tier 1, UCs, Transformation.
Bundle: 92.21 KB gzip.

**Systems-слой полный** — все 6 sub-разделов из стратегии есть с реальным контентом.

## ✅ Завершено — Сессия 2026-05-22 (Use Cases расширение)

### +5 cross-direction Use Cases
- ✅ **uc-ai-rag-launch** — RAG за 2-3 недели (attachment)
- ✅ **uc-ai-pilot-to-production** — pilot→prod transition (download)
- ✅ **uc-ai-roi-estimation** — Estimating AI ROI (tag)
- ✅ **uc-ai-vendor-selection** — AI Vendor + Stack (store)
- ✅ **uc-ai-multi-agent-system** — Multi-agent Orchestration (plug)

Use Cases теперь 13: 8 direction-specific + 5 cross-direction.
Bundle: 91.96 KB gzip.

## ✅ Завершено — Сессия 2026-05-22 (AI-Native Enterprise)

### Пятое Transformation-направление — стратегический пласт
- ✅ **ai-native-enterprise** — контейнер для CIO/CTO/Head of AI (building)
- ✅ **en-transformation-strategy** — Strategy doc (expand)
- ✅ **en-change-management** — Behavioral shift framework (tools)
- ✅ **en-governance** — Rules + processes (lock)
- ✅ **en-coe** — AI Center of Excellence (star)
- ✅ **en-roi-measurement** — ROI framework (trophy)
- ✅ **en-risk-management** — Risk categories + mitigations (warning)
- ✅ **en-talent-strategy** — Hiring + upskilling (developer)
- ✅ **uc-ai-transformation-roadmap** — 12-месячный enterprise roadmap (folder-plus)

28 cross-links связывают все 4 tactical directions. Bundle: 91.76 KB gzip.

**Transformation полный (5 directions):**
- 4 tactical: Operations / Marketing / Customer Support / Product
- 1 strategic: Enterprise

## ✅ Завершено — Сессия 2026-05-22 (AI-Native Product)

### Четвёртое Transformation-направление (7 узлов + контейнер + UC)
- ✅ **ai-native-product** — контейнер (construction)
- ✅ **pd-discovery-research** — Interview synthesis (microscope)
- ✅ **pd-spec-generation** — PRD writing acceleration (file)
- ✅ **pd-roadmap-intelligence** — Prioritization framework (calendar)
- ✅ **pd-experimentation** — A/B hypothesis + analysis (testtube)
- ✅ **pd-feedback-synthesis** — Multi-source aggregation (quote)
- ✅ **pd-product-analytics** — Usage data → hypotheses (chart)
- ✅ **pd-team-workflow** — Product Team Operating Model (users)
- ✅ **uc-ai-discovery-launch** — Use Case: AI-Discovery pipeline за 2 недели (search)

Префикс `pd-` чтобы не конфликтовать с `pr-*` (prompting).
26 cross-links к Foundation/Systems/Operations/Marketing/Support.
Bundle: 91.45 KB gzip.

Transformation покрывает **4 audience**: Operations + Marketing + Customer Support + Product.

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

## 🔴 Открытые задачи (актуальные)

> Большая часть старых задач закрыта в архитектурной миграции 2026-05-22.
> Подробный лог фаз — в секции ✅ Завершено выше.

### Контент

| # | Задача | Audience | Уровень | Приоритет |
|---|--------|----------|---------|-----------|
| 1 | **Туториал `mcp-advanced`** — MCP advanced topics | developers | advanced | 🟡 |
| 2 | **Туториал `building-evaluations`** — как оценивать ответы Claude | developers | intermediate | 🟡 |

(Anthropic Academy указывает эти темы как пробелы. Низкий приоритет — developers уже хорошо покрыты.)

### Контент-автопубликация (заморожена до запроса)

| # | Файл | Что | Приоритет |
|---|------|-----|-----------|
| 1 | `content/content-queue.json` | Бэклог уроков в машиночитаемом формате | 🔵 |
| 2 | `skills/lesson-publisher/SKILL.md` | Оркестратор публикации одного урока | 🔵 |
| 3 | `skills/content-scout/SKILL.md` | Еженедельный поиск Anthropic Academy | 🔵 |
| 4 | `scripts/publish-lessons.mjs` | Claude API вызов для генерации | 🔵 |
| 5 | `.github/workflows/publish-lessons.yml` | Cron publish (пн 08:00) | 🔵 |

### Tech debt (manual)

| status | task | примечание |
|--------|------|-----------|
| ⚙️ manual | **Supabase session timebox** | Dashboard → Auth → Sessions → 30 дней |

### P3 — Premium (будущее)

| status | task |
|--------|------|
| open | Pricing page / premium CTA |
| open | Stripe / Lemon Squeezy интеграция |

---

## 📦 Архитектурная миграция 2026-05-22 — ИТОГ

✅ **Все 5 фаз стратегии выполнены за одну сессию:**

- Phase 1 — Structural seeds (4 root-узла)
- Phase 2 — AI Fundamentals (8 узлов)
- Phase 3 — Operations flagship + 3 UC
- Phase 4 — Systems Tier 1 + Tier 2 (17 узлов в 6 sub-разделах)
- Phase 5 — UI polish + repositioning

✅ **6 Transformation directions:**
Operations, Marketing, Customer Support, Product, Enterprise, Design (46 узлов)

✅ **14 Use Cases** (8 direction-specific + 5 cross-direction)

✅ **+6 audience-specific Learning Paths** (всего 12)

✅ **32 туториала relinked к UCs** (40 cross-refs)

✅ **Orphan audit** — 55→18, +104 cross-links
- `cap-computer`, `b-knowledge`, `pl-platforms` получили связи к актуальным альтернативам

✅ **Dark theme** + UI polish (layer indicators, position fixes, edge alignment)

✅ **Documentation** — 10 strategy docs в `docs/strategy/`, всё IMPLEMENTED

**Финальные метрики:** 213+ узлов (+60% к 133), bundle 89.93 → 96.63 KB gzip.

---

## Правила работы
- Каждая задача: build ✅ → preview/test ✅ → commit → push → обновить этот файл
- После правки контента — `node scripts/sync-whats-new.mjs` (правило 10a CLAUDE.md)
- Не начинать следующую задачу без теста предыдущей
- После каждого git push — обновить этот файл

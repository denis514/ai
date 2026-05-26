# Product Audit — 105 Atlas (2026-05-24)

> Цель: увидеть реальный продукт, а не намерения. Найти где УЖЕ ЕСТЬ ценность, за которую можно платить сегодня, и где разрывы с monetization-планами.

## Содержание

| # | Секция | Статус |
|---|--------|--------|
| 1 | Архитектура и стек | [готово] |
| 2 | Inventory компонентов | [готово] |
| 3 | Контентный inventory | [готово] |
| 4 | Функции которые работают | [готово] |
| 5 | Что НЕ работает / отсутствует | [готово] |
| 6 | Качество контента (sample) | [готово] |
| 7 | User journey (4 персоны) | [готово] |
| 8 | Value pockets | [готово] |
| 9 | Critical gaps для monetization | [готово] |
| 10 | Honest verdict | [готово] |

---

## Секция 1 — Архитектура и стек

**Стек (зафиксирован, минималистичный):**
- React 18.3.1 + Vite 5.4 (`package.json:18-26`)
- Supabase JS 2.105 для auth + sync
- Hugeicons (free) для иконок
- Чистый CSS (`App.css` ~158 KB после билда — это **много**)
- Playwright для smoke-тестов
- **Никаких** TypeScript / Tailwind / state-менеджеров / UI-китов. Жёстко придерживается guideline из `CLAUDE.md` §5.

**Routing:** hash-based, единый источник истины — `useHashRoute` (`src/hooks/useHashRoute.js`). Локаль в URL. Типы маршрутов: `node` / `tutorial` / `courses` / `library` / `prompt` / `help` / `account`.

**Auth:** Supabase — Magic Link + Google OAuth. После OAuth-редиректа маршрут восстанавливается через `sessionStorage` (`App.jsx:382-396`). Логика устойчива к chunk-load errors (`App.jsx:186-208`).

**State management:** локально, через hooks. Глобальный `AuthContext` + `LocaleContext`. Никакого Redux/Zustand. localStorage-first, синхронизация в Supabase debounce 300мс (`App.jsx:405-424`).

**Bundle size (production build, gzip):**

| Chunk | Raw | Gzip |
|-------|-----|------|
| `index.js` (app code) | 364 KB | **104 KB** |
| `vendor-react` | 142 KB | 45 KB |
| `vendor-supabase` | 207 KB | **53 KB** |
| `vendor-icons` | 68 KB | 19 KB |
| `index.css` | 158 KB | **25 KB** |
| `content-ru/en/fi` (per-locale shell) | ~21 KB | ~9 KB |
| `nodes-*` (3 локали, lazy) | 295-304 KB | 108-136 KB |
| `tutorials-*` (3 локали, lazy) | 254-264 KB | 90-113 KB |

**Initial load** (ru): `index.css` + `index.js` + `vendor-react` + `vendor-supabase` + `vendor-icons` + `content-ru` + `nodes-ru` + `tutorials-ru` ≈ **520 KB gzip** на первый paint с контентом. На 4G ≈ 2.5-3 сек до интерактивности. ⚠️ **vendor-supabase 53 KB только ради auth** — оверкилл, если paywall ещё не построен.

✅ Sane архитектура — lazy-split по локалям работает.
⚠️ CSS 158 KB raw — единый файл, не code-split. При росте контента станет проблемой.
✅ ChunkLoadError handler есть — production-ready.

---

## Секция 2 — Inventory компонентов

**37 файлов в `src/components/`.** Это много для personal project, но архитектурно оправдано — каждый ≈ один UI-паттерн.

| Группа | Компонент | Назначение |
|--------|-----------|------------|
| **Mindmap core** | `Mindmap.jsx` | SVG-canvas с pan/zoom |
| | `MindmapNode.jsx` | Узел: title, иконка, badges (new/updated/bookmark/progress) |
| | `CanvasHeader.jsx` | Top bar: search, открыть Workflows/Library/Help |
| | `CanvasFilters.jsx` | Категории + What's new dropdown |
| | `CanvasZoom.jsx` | Zoom controls + expand/collapse all |
| **Detail / содержимое** | `DetailPanel.jsx` | Боковая панель узла (what/why/when/impact/example/mistakes) |
| | `DetailNavFooter.jsx` | Prev/Next между видимыми узлами (DFS) |
| | `InlineText.jsx` | Парсит `[[node:X]]` / `[[tutorial:X]]` / `[[prompt:X]]` cross-links |
| **Modals** | `TutorialModal.jsx` | Прохождение туториала с шагами/exercises/auth-gate |
| | `WorkflowsModal.jsx` | Browse 32 tutorials с фильтрами и categories |
| | `PromptLibraryModal.jsx` | Browse 42 prompt-шаблона |
| | `PromptModal.jsx` | Single prompt + копирование |
| | `HelpModal.jsx` | FAQ/help контент |
| | `CommandPalette.jsx` | Cmd+K поиск по узлам/tutorials/prompts/bookmarks |
| | `IntroModal.jsx` | Первый визит — короткий onboarding flow |
| | `WelcomeOnboarding.jsx` | После первого логина — выбор уровня |
| | `AuthModal.jsx` | Magic Link + Google OAuth UI |
| | `AccountPage.jsx` | GDPR (export, delete account) |
| | `UpdatesArchiveModal.jsx` | История что нового/обновлено |
| **Profile / нав** | `ProfileFab.jsx` | Floating button bottom-right: progress, bookmarks, activity log |
| | `ProfilePanel.jsx` | Развёрнутый профиль |
| | `MobileFab.jsx` | Мобильный bottom-sheet с поиском/категориями |
| | `BottomSheet.jsx` | Reusable bottom sheet |
| | `MinimizedPill.jsx` | Свёрнутый workflow/tutorial пилюля рядом с DetailPanel |
| **Системные** | `Icon.jsx` | Реестр иконок (Hugeicons) — единственный entry-point |
| | `ToastContainer.jsx` | Toasts |
| | `ConfirmDialogContainer.jsx` | Confirm dialogs |
| | `LoadingScreen.jsx` | Skeleton при инициальной загрузке |
| | `Skeleton.jsx` | Reusable skeleton |
| | `Tooltip.jsx` | Tooltips |
| | `ErrorBoundary.jsx` | React error boundary |
| | `UpdateBanner.jsx` | Баннер «новая версия» через useVersionCheck |
| | `CookieBanner.jsx` | GDPR consent banner (GA4 Consent Mode v2) |
| | `PasswordGate.jsx` | Password gate (опциональный для прод?) |
| **Onboarding/marketing** | `WelcomeCard.jsx` | Карточка-приглашение начать первый туториал |
| | `WhatsNewPanel.jsx` | Что нового panel |

**Hooks (18 штук)** — отдельно: `usePanZoom`, `useMindmapLayout`, `useTutorialProgress`, `useNodeProgress`, `useBookmarks`, `useActivityLog`, `useHashRoute`, `useTheme`, `useWhatsNew`, `useUserIdentity`, `useSupabaseStats`, `useVersionCheck`, `useLevelFilter`, `useIsMobile`, `useMediaQuery`, `useBodyScrollLock`, `useFocusReturn`, `useConfirm`, `useToast`. ✅ Зрело, без дублирования.

**Services:** `authService.js`, `profileService.js`, `syncService.js`. Чистое разделение.

💎 **Неожиданное**: каждая ветка функциональности (bookmarks, progress, activity, what's new) — это пара hook + UI surface + sync. Архитектура **готова к multi-device sync, для платного tier это уже стоит денег**.

---

## Секция 3 — Контентный inventory

| Артефакт | Кол-во | Размер (ru) | Заметка |
|----------|--------|-------------|---------|
| **Узлы mindmap** | **247** (locale-keyed), 238 в дереве `mindmapData.js` | 475 KB JSON | Расхождение 9 = ID есть в локали, но нет в дереве (deprecated/orphan) |
| **Tutorials** | **32** | 454 KB JSON | ru длиннее en/fi в 1.5x — русский базовый |
| **Featured prompts** | **10** | 13 KB | В `src/locales/*/prompts.json` |
| **Prompt Library** | **42** | 36 KB | В `promptLibrary.js` + `prompt-library.json` |
| **Learning paths** | **12** | 12 KB | newcomer / engineer / researcher / automation / prompting / zero-to-running / ops-team / marketing-team / support-team / product-team / **enterprise-transformation** / design-team |
| **Use Cases (uc-*)** | 16 узлов | — | Категория `use-cases` имеет 17 узлов |
| **Transformation узлы** | 62 узла категории `transformation` | — | Это самая крупная ветка после foundation (65) |

**Распределение по категориям (238 узлов в дереве):**

```
foundation:      65  (27%)  ← база/основы
transformation:  62  (26%)  ← главный value pocket
automation:      42  (18%)
systems:         17
use-cases:       17
prompts:         16
configuration:   11
agents:           8
```

⚠️ **Только 8 узлов про agents** — disconnect от «AI-Native Transformation OS» позиционирования. Агенты — это горячая тема Anthropic 2026, у нас слабая.

**Локализация:**

| Файл | ru bytes | en bytes | fi bytes | Equal keys? |
|------|----------|----------|----------|-------------|
| nodes.json | 474 826 | 325 610 | 325 442 | ✅ 247 у всех |
| tutorials.json | 453 975 | 305 298 | 321 369 | ✅ 32 у всех |
| prompts.json | 13 091 | 8 025 | 8 655 | ✅ 10 |
| prompt-library | 36 141 | 23 364 | 24 794 | ✅ 3 группы |
| ui.json | 24 486 | 17 754 | 19 013 | ✅ 27 |
| paths.json | 12 582 | 10 692 | 10 942 | ✅ 12 |

✅ **3 локали полные.** Структурных пробелов нет. RU длиннее на ~40% (естественно для русского). FI чуть длиннее EN — финский морфологически плотный.

💎 **Полный финский — реально редкое явление.** Большинство AI-продуктов даже немецкого/испанского не имеют. Это actual moat для скандинавского рынка.

---

## Секция 4 — Функции которые работают

| Фича | Качество | Заметка |
|------|----------|---------|
| Mindmap pan/zoom | ✅ production | `usePanZoom` + auto-fit на mobile |
| Expand/collapse | ✅ production | По уровню пользователя (beginner/intermediate/expert) |
| Hash-routing | ✅ production | Survives OAuth-редирект через sessionStorage |
| Локаль в URL + 3 локали | ✅ production | Контент полный во всех 3 |
| Theme dark/light | ✅ production | `useTheme` hook |
| Search (substring across all node fields) | ✅ production | Pre-built index, локаль-aware |
| Command palette (Cmd+K) | ✅ production | Узлы / tutorials / prompts / bookmarks |
| Bookmarks | ✅ production | По типу (`node` / `tutorial` / `prompt`), sync to Supabase |
| Node progress tracking | ✅ production | viewed / in-progress / done — badges на карте |
| Tutorial progress | ✅ production | 32 туториала, шаги, completedAt, resume |
| Activity log | ✅ production | Через `useActivityLog`, видно в ProfileFab |
| What's new panel | ✅ production | Hash-based diff через `sync-whats-new.mjs` |
| 3 locale switcher | ✅ production | Lazy-loaded chunks |
| Intro flow | ✅ production | IntroModal → tutorial `ai-fluency` |
| Welcome onboarding | ✅ production | После первого логина — выбор уровня |
| Auth — Magic Link + Google | ✅ production | Supabase, GDPR-консент |
| Account page | ✅ production | **Полный GDPR**: export JSON, delete account |
| Cross-links `[[node:X]]` inline | ✅ production | **175** в ru/nodes.json, **65** в ru/tutorials.json — это уже density |
| Mobile FAB | ✅ production | Bottom sheet с фильтрами/поиском |
| Cookie banner + GA4 Consent Mode v2 | ✅ production | Privacy-by-design |
| Workflows modal (32 tutorials с фильтрами) | ✅ production | Категории, прогресс |
| Prompt Library (42 шаблона) | ✅ production | Категории, levels, копирование |
| Help modal | ✅ production | Структурированный FAQ |
| Prev/Next между узлами (←/→) | ✅ production | По DFS-видимым узлам |
| Auto-update banner (новая версия) | ✅ production | `useVersionCheck` |
| ChunkLoadError auto-reload | ✅ production | Graceful после deploy |
| ToS / Privacy архитектура | ✅ production | Consent versioning в profile |
| Open prompt in claude.ai (prefilled) | ✅ production | Видел в ui.json `openInClaude` |
| Smoke-tests Playwright | ✅ инфра есть | `tests/smoke.spec.js` |
| Pinned nodes ("показать на карте") | ✅ production | Из ProfilePanel при клике на counters |
| Suspense при auth-gate tutorial | ✅ production | TutorialModal сохраняет state, AuthModal сверху |
| Minimized workflow pill | ✅ production | Свёрнутый workflow при cross-link в карту |

🚨 **Замечание**: продукт **очень богат фичами**. Это не MVP, это уже зрелое приложение в одном лице.

---

## Секция 5 — Что НЕ работает / отсутствует

| Фича | Статус | Effort до прод-готовности |
|------|--------|---------------------------|
| **AI Companion** («Спроси Claude об этом узле») | ❌ полностью нет | Нет вызовов anthropic API, нет chat-компонента. Только ссылка `openInClaude` чтобы открыть **внешний** claude.ai с prefilled промптом | 2-3 недели для embedded chat + backend proxy + rate limits |
| **Team workspace** | ❌ нет | grep — нет invite, share, team, workspace в коде. profile per single user только | 1-2 месяца (RLS multi-tenant, invites, billing seats) |
| **Stripe / paywall** | ❌ нет | grep — упоминания только в `docs/business-strategy/`, кода 0 | 1-2 недели (Stripe Checkout + webhook → Supabase `subscription` table) |
| **Premium-only контент** | ❌ нет | Нет поля `tier` / `paywalled` в узлах. Весь контент открыт | 2-3 дня на структуру, недели на gated UI + content cut |
| **PDF / Markdown export workflow** | ❌ нет | Есть только JSON export личного прогресса (GDPR). Контент не экспортируется. | 1 неделя (markdown сериализация по дереву + html→pdf) |
| **Skill-builder / CLAUDE.md generator** | ❌ нет | Никаких генераторов — это контент-узлы, не tool | 2-3 недели для интерактивного wizard |
| **Comments / community / discuss** | ❌ нет | Нет дискуссионных компонентов | 3-4 недели |
| **Аналитика для пользователя** | ⚠️ частично | Activity log есть, но это локальная история, не «what's most popular» | — |
| **Аналитика для админа** | ✅ GA4 + `useSupabaseStats` | Server-side counters работают |
| **Mobile native app** | ❌ нет | Только responsive web | — |
| **Offline mode / PWA** | ❌ нет | Нет service-worker / manifest | 1 неделя для PWA wrapper |
| **Email notifications** | ❌ нет | Magic Link через Supabase — единственные emails | — |
| **Социальный share узла** | ⚠️ ссылки есть (hash) | URL копируется, но open-graph для preview? Не нашёл | 1 день на og-tags |
| **Сохранение собственных заметок** | ❌ нет | Только bookmarks (без заметок) | 3-5 дней |
| **Поиск с фасетами / advanced filters** | ⚠️ только substring + 1 категория | Нет «уровень + категория + тег» | 3-5 дней |
| **Видео-контент / embedded media** | ❌ нет | Только текст | — |
| **Кастомизация CLAUDE.md для команды** | ❌ нет | Концепции в узлах есть, генератор отсутствует | 2-3 недели |
| **AI-driven персонализация tutorials** | ❌ нет | Все видят одно и то же | — |
| **Тестирование знаний (quiz)** | ❌ нет | Exercises в tutorials есть, но self-graded | 2 недели |
| **Сертификаты прохождения** | ❌ нет | — | 1 неделя |

🚨 **Главный gap**: продукт говорит "AI-Native Transformation OS", но **нет ни одного места, где бы LLM реально вызывался внутри Atlas**. Весь AI — это контент **о AI**, а не AI **в продукте**.

---

## Секция 6 — Качество контента (sample)

Прогнал 7 случайных узлов в `src/locales/ru/nodes.json`. **Результат — неровный**:

| ID | Title | Качество | Размер (what/why/example) |
|----|-------|----------|---------------------------|
| `cap-vision` | Vision (изображения) | ⚠️ Generic. Просто «Claude видит картинки» + банальный пример | 161/98/63 |
| `cc-tty-modes` | Режимы работы | ✅ Конкретно (Plan/Fast/Opus), хорошие cross-links | 116/85/84 |
| `i-global` | Глобальные инструкции | ✅ Pointed антипаттерн (конфликт с Project) | 110/76/67 |
| `ag-ux` | Audit Agent | ⚠️ Сухо, без operating-context | 71/72/84 |
| `ai-native-operations` | AI для операционных команд | ✅✅ **Expert-level**, 5 cross-links на ops под-направления | 348/273/398 |
| `cs-team-workflow` | AI Customer Support Team Workflow | ✅✅ **Это уже консалтинговая мысль** — 7 шагов настройки CS-команды с AI | 254/175/577 |
| `sys-evals-benchmarks` | Как проверить что AI работает | ✅✅ Конкретный workflow с числами (50-200 примеров, 100 кейсов B2B-писем) | 267/251/587 |

**Выводы:**

✅ **Транформационные узлы (transformation/systems)** — это **флагман контента**. Они уже сейчас уровня платного консалтинг-материала. Density 500-1500 символов, конкретные числа, anti-patterns.

⚠️ **Foundation узлы (cap-*, i-*, ag-*)** — слабее. 70-200 символов, generic. Это нормально для "введения", но не за это люди платят.

✅ **Cross-link density: 175** `[[node:X]]` ссылок в одном nodes.json (ru) и 65 в tutorials.json — это уже **сеть знаний**, а не плоский список. Это ценность.

✅ **Mistakes / anti-patterns на месте** — почти каждый узел имеет осмысленное `mistakes` поле. Это редкость в knowledge-продуктах.

✅ **Voice-guide соблюдается** — конкретно, без AI-fluff, без emojis в контенте, разговорный язык на ты.

**Выборочно tutorials (ru):**
- 32 туториала, размер 454 KB → среднее 14 KB / туториал → это **существенная** статья с шагами/упражнениями/выводами. Не «3 буллита».
- Из smoke-проверки структуры `tutorialIds.length === 32`, ID присутствуют в localeFiles. ✅

💎 **Funny truth**: 16 узлов категории `agents` против 62 `transformation` и 65 `foundation` — продукт **прошёл мимо** хайпа на agents в пользу real workflows. Это правильно для дифференциации.

---

## Секция 7 — User journey walkthrough

### A. «Любопытный практик» — Google → «AI for ecommerce»

**Что увидит:**
1. На landing → `IntroModal` (2 слайда): «Что такое Atlas» + выбор роли (everyone / business / educators / developers).
2. После закрытия → автоматически открывается `tutorial: ai-fluency` (`App.jsx:248`).
3. Если закроет туториал — увидит mindmap с раскрытым root + ветками beginner-уровня.

**За 60 секунд value:**
- ⚠️ Mindmap визуально красив, но **не очевидно** что внутри — нужно кликать чтобы увидеть глубину.
- ⚠️ Слово «eCommerce» — нужно искать через Cmd+K (которое не подсказывается на первом экране).
- ✅ Если он нажмёт search «ecommerce» — найдёт 19-узловой direction, увидит конкретные workflow.

**Первая точка фрустрации:**
- 🚨 IntroModal **сразу пушит в туториал** — навязчиво. Человек пришёл «посмотреть», а получил курс на 30 минут.
- 🚨 Hash-route обновляется при каждом клике — URL становится `#tutorial=ai-fluency` сразу, можно случайно расшарить «не ту» ссылку.

**Регистрация:**
- ❌ Регистрации не нужно для просмотра. Auth-gate появляется только при попытке открыть некоторые tutorials (`handleTutorialRequestAuth`). Это **soft funnel**.
- Без четкого momenta «теперь login для X» — может уйти не зарегистрировавшись.

### B. «Head of Product» — наш ICP

**Понимание для него:**
- ✅ IntroModal предлагает роль `business: "I lead a team..."`. Хорошо.
- ✅ Учит увидит ветку `transformation` (62 узла) с поддиректориями: eCommerce, ops, marketing, support, product, design, enterprise-transformation.
- ✅ Прокликает eCommerce direction → 19 узлов с конкретными workflow для команды.

**Понимание как применить:**
- ✅ Узлы уровня `cs-team-workflow` / `ai-native-operations` дают **operating model**, не «AI tools list».
- ✅ Cross-links между узлами → видна сеть, не плоский список.
- ⚠️ Но **нет CTA «применить с командой»** — нет share-в-Slack, нет «invite team», нет «download as playbook PDF». Идея остаётся в его голове, не в инструменте.

**Желание подписать команду:**
- 🚨 **Нет triggera**. Нет UX-момента где видно «это для команды». Все personal-progress, personal-bookmarks. Если он попробует пригласить коллегу — он отправит URL, и коллега начнёт с нуля. Это упущенная monetization-opportunity.

### C. Студент / новичок

**Foundation узлы:**
- ✅ Есть 65 foundation-узлов с уровнями beginner / intermediate.
- ✅ Tutorial `basics` + welcome onboarding с выбором уровня.
- ⚠️ Качество foundation **слабее** transformation. См. секцию 6 (cap-vision, ag-ux). Generic.

**Может ли пройти tutorial без знаний:**
- ✅ Структура tutorials с шагами/exercises есть.
- ⚠️ Exercises — self-graded, без feedback. Студент не узнает «правильно ли он понял».

**Over-deliver для free:**
- 🚨 **Да, серьёзно.** Сейчас открыто всё. Студент получает **бесплатно** контент уровня платного курса. Когда он окончит — у него нет причины платить (всё уже изучено).

### D. Developer ищущий API docs

**Поймёт ли что не для него:**
- ✅ IntroModal: роль `developers: "I want hands-on examples..."`. Честно.
- ⚠️ Но категория `agents` (8 узлов) и `prompts` (16) выглядит «может тут есть API». Прокликает — увидит концептуальный контент, не reference.
- ✅ Хороший signal: `prompt-library.json` — это шаблоны, не API. Понятно сразу.

**Уйдёт разочарованным?**
- Возможно. Но это не наш ICP, поэтому это **OK** — лучше быстро отфильтровать.

---

## Секция 8 — Value pockets

Топ-5 candidates за которые человек **МОЖЕТ** заплатить:

### 💎 1. Transformation directions (62 узла + 17 use-cases)
**Это флагман.** eCommerce (19), ops (5+), marketing-team, support-team, product-team, design-team, enterprise-transformation. Уровень — **консалтинговый**. `cs-team-workflow` / `ai-native-operations` / `sys-evals-benchmarks` уже сейчас стоят денег.

**Honest assessment:** Это **главный** value pocket. Head of Product / Head of Ops заплатит $19-49/мес за полный доступ при условии:
- Есть «премиум» сигнал (часть закрыта пока не платишь)
- Есть team-share механика

**Достаточно ли СЕЙЧАС?** ⚠️ Нет — потому что **всё открыто** и нет paywall.

### 💎 2. Cross-link knowledge network
175 `[[node:X]]` ссылок + 65 в tutorials = **не плоский список, а граф**. Это **редкое** свойство knowledge-продуктов. Большинство — markdown-помойка.

**Honest assessment:** Сама по себе ценность сложно монетизируется (нельзя продать «у меня хорошие ссылки»). Но это **moat** — конкурент не построит за месяц.

### 💎 3. 3 локали с полным финским
Аномалия рынка. Финский AI-контент **не существует** в commercial виде. Скандинавия — рынок с deep pockets и слабой англоязычной адаптацией в среднем менеджменте.

**Honest assessment:** Может быть **GTM-вектор**: «Atlas — единственный AI-handbook на финском для команд». $99/мес для маленькой финской компании = ничто.

### 💎 4. 32 tutorials с progress + Activity log + Resume
Инфраструктура **уже сейчас** уровня coursera-lite. Resume, completed-steps, badges на карте, sync через Supabase.

**Honest assessment:** Сам по себе progress-tracking не стоит $19/мес (Anki бесплатный). Но в комбинации с премиум-контентом — да.

### 💎 5. 42 prompt-templates с категориями + «Open in claude.ai»
Готовые промпты, prefilled в claude.ai одним кликом. Это **utility**, которая решает реальную боль («у меня нет нормального промпта для X»).

**Honest assessment:** За **prompt library** одиночные пользователи платят $9-19/мес (PromptBase, FlowGPT). Это самостоятельный value pocket. Можно расширить и **gated tier** запустить даже без AI Companion.

### Что НЕ value pocket (но кажется):
- 🚨 247 узлов «контента про AI» — generic foundation-узлы уровень cap-vision не стоят денег. Notion-curators и YouTube покрывают это бесплатно.
- 🚨 Visual mindmap UX — приятно, но **не дифференциатор**. Konekt, Obsidian Canvas, theBrain делают это годами.
- 🚨 Bookmarks — бесплатная фича везде.

---

## Секция 9 — Critical gaps для monetization

| Gap | Зачем | Effort |
|-----|-------|--------|
| **Paywall infrastructure (Stripe + Supabase subscription table + RLS gates)** | Без него платить некуда | 1-2 недели |
| **Тегирование контента `tier: free / pro / team`** | Чтобы было что закрывать | 2-3 дня структура + ~1 неделя на content decision-making (что free, что pro) |
| **Pro-only UI gates** (blur + CTA на закрытых узлах) | Visual triggers | 3-5 дней |
| **Team workspace** (multi-user, invites, shared bookmarks, team progress) | Без него нет $99/мес tier | **1-2 месяца** (RLS, invite emails, billing seats, team-admin) |
| **AI Companion** («Спроси Claude про этот узел» — embed chat с контекстом узла) | Главный wow-trigger для retention | 2-3 недели (Anthropic API + edge function + rate-limits + контекстная injection) |
| **PDF / Markdown export workflows** | «Pro tier: download direction as 30-page PDF playbook» | 1 неделя |
| **Premium-only content** — нужно решить: какие 30% контента закрыты | Стратегическое решение | — |
| **Analytics для пользователя** (sessions, time spent, learning velocity) | Engagement-метрика для удержания | 1 неделя |
| **Social proof / use cases на лендинге** | Trust-trigger перед оплатой | 3-5 дней |
| **Cancellation + downgrade flows** | Compliance + churn-management | 3-5 дней |

**Минимальный путь к первому $1:** Stripe + tier-теги + 5-10 premium-узлов + paywall UI = **~3 недели**. Не нужны team-workspace и AI Companion для первого платящего юзера.

---

## Секция 10 — Honest verdict

### Готов ли продукт к paid tier СЕГОДНЯ?

🚨 **Нет.** Не потому что не хватает контента — а потому что **нечего покупать**. Всё открыто. Нет paywall. Нет ощутимой разницы «free vs pro».

**Минимальный fix чтобы стал готов:**
1. Тегировать ~20% transformation-узлов как `tier: pro` (eCommerce direction целиком + enterprise-transformation + topical deep-dives).
2. Включить Stripe Checkout (1 tier — $19/мес personal, $99/мес team).
3. Добавить blur+CTA на закрытых узлах.
4. **Никакой AI Companion / team workspace на старте.** Просто: «дешевый платный handbook с лучшим контентом по AI-трансформации».

### Funny truth (что user не видит, но видно со стороны)

😄 **Atlas — это не «mindmap про Claude». Это замаскированный AI-handbook для product/ops-менеджеров.** 62 transformation-узла + 17 use-cases + 12 learning paths (включая ops-team, marketing-team, support-team, product-team, design-team, **enterprise-transformation**) — это **скрытый MBA-курс по AI-операционке**, обёрнутый в красивый mindmap чтобы не выглядеть как ещё один курс.

Никто из конкурентов так не делает. Все либо:
- (a) делают tools/skills directory (skillsetorg, anthropic skills) — directory, без operating models;
- (b) пишут blog posts (Sequoia, a16z) — без структуры, без progress, без cross-links;
- (c) запускают курсы (Maven, Reforge) — дорого, временно, без поиска.

Atlas — **searchable, atomic, cross-linked operating-knowledge база**. Это **категория ‑1** (не существует у конкурентов).

Но **product positioning об этом молчит**. Лендинг и IntroModal говорят «AI Atlas», а надо «AI Transformation Playbook for Product Teams».

### Если бы был 1 месяц на первый $1

**Неделя 1:** Repositioning. Лендинг переписать вокруг «AI Transformation Playbook for Product/Ops teams». IntroModal — убрать automatic-tutorial push, добавить «Browse for free / Get full access».

**Неделя 2:** Тегирование контента — все 17 use-cases + 30 transformation-узлов с pro-теги. Все foundation/automation — free.

**Неделя 3:** Stripe Checkout, Supabase subscription table, paywall UI (blur + «Get Pro $19/mo»).

**Неделя 4:** Outreach. Скандинавский LinkedIn (Head of Ops / Product), таргет «company size 50-500», финский tier-card («Suomenkielinen AI-käsikirja tiimillesi» — единственный в мире).

Результат через месяц: realistic — **5-15 paid users**. Это $95-285 MRR. Маленькие деньги, но это валидация что есть **willing to pay**.

### Самый сильный момент

✅ **Открытие eCommerce direction (19 узлов) или Customer Support team workflow.** Когда Head of Product кликает первый transformation-узел и видит конкретный operating model с цифрами, anti-patterns, cross-links на 4-5 связанных тем — он понимает что это **не AI-fluff**. Это momentum «here's something actually useful».

### Самый слабый момент

🚨 **Первый клик после IntroModal — автоматический запуск tutorial `ai-fluency`.** Это **навязчиво**. Человек пришёл «посмотреть карту», а получил длинный курс. По логике (`App.jsx:248`) это hardcoded — нет «skip и просто покажи карту». **Один лучший fix UX**: убрать auto-push в курс, добавить мягкий CTA «Want a guided tour? Take AI Fluency tutorial» в углу.

🚨 **Второй слабый момент**: foundation-узлы (cap-vision, ag-ux и т.п.) — generic, на уровне любого AI-блога. **Они снижают воспринимаемое качество.** Над ними нужно либо подтянуть voice, либо консолидировать (8 cap-* в один comprehensive node), либо пометить как «quick reference», чтобы не сравнивались с transformation-узлами.

---

_Audit complete: 2026-05-24._



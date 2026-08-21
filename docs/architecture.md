# Architecture

## Глобальная картина
```
┌──────────────────────────────────────────────────────────┐
│  AI Infrastructure Layer                                  │
│  ─────────────────────────                                │
│  CLAUDE.md  →  главный системный файл                     │
│  skills/    →  переиспользуемые AI-навыки (SKILL.md)      │
│  prompts/   →  шаблоны разовых операций                   │
│  docs/      →  правила и архитектурные нормы              │
│  tasks/     →  current / backlog / roadmap / ideas        │
└─────────────────────────┬────────────────────────────────┘
                          │ управляет через skills
                          ▼
┌──────────────────────────────────────────────────────────┐
│  Application Layer (React/Vite)                           │
│  ──────────────────────────────                           │
│  src/main.jsx, src/App.jsx                                │
│  src/components/  (Mindmap, MindmapNode, Toolbar, ...)    │
│  src/hooks/       (usePanZoom, useMindmapLayout, ...)     │
│  src/data/        (mindmapData.js, prompts.js, tutorials) │
│  src/App.css                                              │
└──────────────────────────────────────────────────────────┘
```

## Технический стек (фиксирован)
- **React 18** — функциональные компоненты, hooks-first
- **Vite 5** — dev / build / preview
- **Plain CSS** — `App.css`, `index.css`
- **Hugeicons (free)** — `@hugeicons/react` + `@hugeicons/core-free-icons`,
  обёрнуты в локальный компонент `src/components/Icon.jsx`
- **No** TypeScript, Tailwind, CSS-in-JS, state managers, UI kits

Любое отклонение от стека требует обновления этого файла с датой и обоснованием.

## Icon system
- Единая точка маппинга: `src/components/Icon.jsx` (REGISTRY).
- Использование: `<Icon name="brain" size={20} strokeWidth={1.5} />`.
- Имена в `REGISTRY` — kebab-case. Никаких эмодзи в JSX или в `src/data/*`.
- Чтобы добавить новую иконку: импортировать из `@hugeicons/core-free-icons`,
  дописать строку в `REGISTRY` с осмысленным kebab-case именем.
- Свойство `color: currentColor` означает: иконка наследует цвет родительского
  элемента (через `color:` или CSS-переменные типа `--cat-color`).

## Компонентная схема
- `App.jsx` — корень, держит `selectedNode`, открытие модалок.
- `Mindmap.jsx` — корневой рендер mindmap (svg + html).
- `MindmapNode.jsx` — один узел, expand/collapse, click.
- `Toolbar.jsx` — поиск, фильтр категорий, zoom-controls.
- `DetailPanel.jsx` — выезжающая панель с `details`.
- `PromptsSection.jsx` — нижняя панель с готовыми промптами.
- `CoursesModal.jsx`, `TutorialModal.jsx` — обучающие модалки.
- `Tooltip.jsx` — наводки.

## Hooks
- `useMindmapLayout` — позиции узлов и линий (radial layout).
- `usePanZoom` — drag, wheel, pinch.
- `useTutorialProgress` — прогресс прохождения tutorials, localStorage.

## Data flow
```
mindmapData.js
    │
    ▼ (через App.jsx)
useMindmapLayout → positions, lines
    │
    ▼
Mindmap (svg lines + html nodes)
    │
    ▼ (onClick)
DetailPanel ← selectedNode
```

## AI Infrastructure → Application
- Skills работают с `src/data/` через файловые правки (Edit/Write).
- Skills **никогда** не правят `components/` без явной UI-задачи.
- Изменения схемы данных требуют обновления `CLAUDE.md` и `content-rules.md`.

## Зависимости
Минимально возможные:
- runtime: `react`, `react-dom`, `@hugeicons/react`, `@hugeicons/core-free-icons`
- dev: `vite`, `@vitejs/plugin-react`

Добавление любой новой зависимости — отдельное решение, фиксируется здесь
с датой и причиной.

## Решения и их даты
- **init AI infrastructure** — добавлены `CLAUDE.md`, `skills/`, `prompts/`,
  `docs/`, `tasks/` как отдельный слой над `src/`. Слои не смешиваются.
- **2026-05-11 — иконочная система Hugeicons (free).** Заменены все эмодзи в UI
  и в `src/data/*` на семантические имена через `src/components/Icon.jsx`.
  Причина: визуальная консистентность, чёткий stroke, кросс-платформенность
  (эмодзи рендерятся по-разному на разных OS).
  Стоимость: +54 KB JS bundle (uncompressed), +17 KB gzip — tree-shaken.
- **2026-05-11 — библиотека промпт-шаблонов.** Добавлен отдельный датасет
  `src/data/promptLibrary.js`: 9 категорий (`PROMPT_CATEGORIES`), 3 уровня
  (`PROMPT_LEVELS`), 42 шаблона. UI: `PromptLibraryModal.jsx` (sidebar категорий
  + поиск + фильтр по уровню + grid карточек). Открывается из тулбара
  кнопкой «Библиотека». Карточка шаблона переиспользует существующий
  `PromptModal` для fullscreen-чтения. Разделение с существующим
  `prompts.js` (10 «featured» внизу): featured — quick copy, library —
  обучающие формы мышления. Стоимость: +30 KB JS, +9 KB CSS.
- **2026-05-11 — Учебная система v2.** Расширена схема туториала:
  `level / whatItIs / prerequisites / outcomes / approach / applyIn /
  relatedPrompts / pitfalls / exercises` — все поля опциональные для обратной
  совместимости. Контент заполнен для всех 11 туториалов.

  UI: `TutorialDetail.jsx` — preview-карточка обучения (что это / что
  получишь / как погрузиться / план / как применить / шаблоны / подводные
  камни / упражнения). В `CoursesModal` split-view (desktop: список 320px +
  детали; mobile: detail замещает список с кнопкой «Назад»).

  В `TutorialModal` добавлен сегментированный переключатель Quick / Standard
  / Deep (сохраняется в localStorage). Quick прячет why / tip / troubleshoot /
  example для скорости. Deep раскрывает дополнительные примеры. Standard —
  поведение как было.

  Упражнения (`exercises[]`) рендерятся на последнем шаге с подсветкой и
  иконкой «target». В Quick подсказки скрыты, в Standard/Deep — раскрыты.

  Lint:data расширен 5 новыми проверками: level enum, prerequisites references,
  relatedPrompts (либо в featured prompts.js, либо в promptLibrary.js),
  outcomes/pitfalls/exercises структуры.

- **2026-05-11 — UX-перетряс: floating overlays + mobile FAB + bottom sheet.**
  1. Desktop: `CanvasZoom` (низ-право) + `CanvasFilters` (верх-лево) — плавают
     поверх canvas, не масштабируются с zoom. Toolbar схлопнут: убраны чипсы
     и zoom-кнопки.
  2. Mobile (`@media max-width: 720px`): Toolbar полностью скрыт + PromptsSection
     скрыт. Новый `MobileFab.jsx` — 4 FAB в углах: TL=меню (поиск/фильтр/canvas-actions),
     TR=Обучение, BL=10 готовых промптов, BR=Библиотека.
  3. `BottomSheet.jsx` — переиспользуемый слайд-ап оверлей (Esc, click-outside,
     swipe-down dismiss, body scroll lock).
  4. `useIsMobile` хук — DetailPanel на mobile рендерится через BottomSheet;
     на desktop — обычный slide-in aside.
  5. Prev/Next навигация: компонент `DetailNavFooter` с двумя кнопками.
     Источник — flat DFS-обход видимых узлов с учётом category-фильтра.
     Хоткеи ←/→ когда DetailPanel открыт.
  Стоимость: +5 компонентов, +1 hook, +10 KB JS, +6 KB CSS.

- **2026-05-11 — P2 структурные ходы (3 из 5).** Добавлено:
  1. `src/hooks/useNodeProgress.js` + кнопки в DetailPanel (просмотрено / вернуться)
     + цветной маркер на узле mindmap (зелёный / янтарный). localStorage.
  2. Поле `relatedIds` в схеме узла (опционально). В `mindmapData.js`
     прописаны связи на 7 узлах. Утилита `getRelatedNodes(id)` строит
     **двусторонний** индекс автоматически — связь объявляется один раз.
     Lint проверяет, что ссылки не висят. UI: блок «Связано» в DetailPanel.
  3. `src/data/learningPaths.js` — 5 кураторских маршрутов:
     newcomer / engineer / researcher / automation / prompting.
     Каждый шаг ссылается на node / tutorial / prompt. Lint валидирует.
     UI: вкладка «Маршруты» в `CoursesModal` (по умолчанию), вкладка «Курсы».
     Прогресс выводится из существующих источников (useNodeProgress,
     tutorialProgress) — без дополнительного хранения.

  Стоимость: +9 KB JS, +5 KB CSS, +2 hooks, +1 датасет, +1 рендер-секция.
  П10 (CI) и П11 (AI Companion) отложены по решению пользователя.

- **2026-05-11 — P1 фундамент (по итогам аудита).** Добавлены 6 примитивов:
  1. `scripts/lint-data.mjs` + `npm run lint:data` — исполняемая проверка схемы
     mindmap, prompts.js, promptLibrary.js, tutorials.js. Превращает правила
     из `docs/content-rules.md` в код. Exit 1 при ошибках.
  2. `src/hooks/useHashRoute.js` — hash-based роутинг (`#node/<id>`,
     `#tutorial/<id>`, `#courses`, `#library`, `#prompt/<id>`). Source of truth
     для открытых модалок — derived state из URL.
  3. `src/components/CommandPalette.jsx` — Cmd+K / Ctrl+K глобальный поиск
     по mindmap + library + tutorials. ↑↓ навигация, Enter — открыть.
  4. `src/hooks/useBookmarks.js` + кнопки в DetailPanel и library cards.
     Закладки в localStorage, секция «Избранное» в Cmd+K.
  5. «Открыть в Claude» в `PromptModal` — deep-link `claude.ai/new?q=...`.
  6. «Что дальше» в финале tutorial: расширено на «Применить знание» —
     ссылки в library и обратно к узлу mindmap.

  Стоимость: +12 KB JS, +4 KB CSS, +2 hooks, +1 script, +1 компонент.

- **2026-06-04 — Стандарт expand/shrink и запрет «развернуть» на телефонах.**
  Правило вёрстки для всех модальных окон:
  1. **Иконки-стандарт для действия «развернуть/свернуть»**: только
     `square-arrow-expand-01` (раскрыть) и `square-arrow-shrink-02` (свернуть)
     из Hugeicons stroke-rounded. В реестре `src/components/Icon.jsx` это
     семантические имена `fullscreen` → `SquareArrowExpand01Icon` и
     `restore` → `SquareArrowShrink02Icon`. Кнопка-тогл всегда переключает
     иконку по состоянию: `name={isFullscreen ? 'restore' : 'fullscreen'}`.
     Использовать любые другие «expand»-глифы (диагональные стрелки,
     Maximize и т.п.) для этого действия — запрещено.
  2. **Функции «развернуть на весь экран» НЕТ на телефонах.** Граница —
     `useIsMobile` (≤ 720px): на телефонах окна рендерятся как `BottomSheet`,
     и в его шапке только крестик закрытия, без кнопки развернуть. На
     **планшетах и десктопе** (> 720px) окна рендерятся как обычные модалки
     (`.tut-modal` / `.courses-modal` / `.lib-modal`), и там тогл
     expand/shrink присутствует. Не добавлять expand в `BottomSheet`.

## 2026-08-19 — Тексты туториалов грузятся по требованию

**Решение.** `src/locales/<loc>/tutorials/{everyone,developers,business}.json`
(~4 MB на язык, ~780 KB gzip) больше НЕ грузятся при входе. Вместо них при
старте едет `tutorials/titles.json` — сгенерированный индекс из `title`,
`subtitle`, `totalTime` (~50-70 KB raw на язык). Тело туториала подтягивается
в момент показа: `ensureTutorialBody(id, locale)` из `src/i18n/useTutorial.js`
берёт `audience` из `src/data/tutorials.js` и грузит соответствующий чанк.

**Почему.** Списку курсов, поиску (Cmd+K), аккаунту и карточкам нужны только
заголовки. Полный текст нужен ровно одному экрану — открытому курсу.

**Правила.**
- Индекс НЕ редактируется руками. Генератор: `scripts/build-tutorial-index.mjs`.
  Он привязан к `npm prebuild` (то есть к любой сборке) и к `npm run sync`;
  `npm run lint:tutindex` падает, если индекс разошёлся с текстами.
- `ensureTutorialBody` вызывать только там, где текст реально показывается
  (модалка курса, предпросмотр). В списках — нельзя: там он утянет все чанки.
- Пока тело едет, `tut.bodyReady === false` — показывать скелетон, а не пустые
  секции.

**Связанное.** В ту же сессию убран eager-догруз запасной локали и ожидание
определения языка перед загрузкой контента (см. `tasks/current.md`, 2026-08-18).

## 2026-08-21 — Жизненный цикл личных данных: браузер ↔ облако

**Модель.** Браузер — источник правды для прогресса (курсы, темы, закладки,
дни активности), облако — зеркало. Хуки читают только `localStorage`;
`syncService.js` при входе сливает облако в браузер (`pullRemoteToLocal`,
объединение, ничего не удаляет), затем пишет обратно; дальше точечные записи.

**Владелец локальных данных** — `services/localData.js`, ключ
`atlas:local-owner:v1` = `guest` | `<userId>`. Правила (в `AuthContext`):

| Событие | Что происходит |
|---|---|
| Вход, владелец `guest` или тот же пользователь | слить с облаком → записать → переезд схем конструктора (`migrateLocalToCloud`) |
| Вход, владелец **другой** пользователь | очистить прогресс (черновик конструктора сохраняется) → подтянуть облако, без записи |
| Выход по кнопке | досохранить (хуки `registerBeforeSignOut` + полный push) → разорвать сессию → очистить прогресс, владелец `guest` |
| Сессия оборвалась сама (истекла, выход из другой вкладки) | **не** чистить: в браузере могут быть правки, не дошедшие до облака |
| Удаление аккаунта | edge-функция `account-delete` (`auth.admin.deleteUser`, каскад) → выход `scope: 'local'` |

Владелец ставится только после успешного pull. Право писать в облако
(`hydrated`) выдаётся **по каждой таблице отдельно** — таблица, которую не
удалось прочитать, не перезаписывается.

**Осознанный компромисс.** Невольный разрыв сессии + вход другого человека на
том же компьютере → его вход очистит неотправленные правки предыдущего
(приватность важнее сохранности на чужой машине). На общем компьютере
выходить кнопкой.

**Схемы конструктора гостя** (`atlas:builder:workflows:v1`) при выходе не
чистятся: в облако их пишет только переезд при входе, до этого они —
единственная копия. После переезда локальный список пустеет.

**Выгрузка/импорт/сброс** — один модуль `services/dataExport.js`, формат
`105-atlas/v2`; им пользуются профиль и кабинет.

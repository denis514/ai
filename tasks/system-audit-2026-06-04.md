# System Audit — 2026-06-04 (полный прогон всех агентов-аудиторов)

Прогон по всем категориям проверок. Детерминированный слой (build/lint:data/links/builder/css/perf) — зелёный.
Ниже — находки 11 агентов по severity. **Уже исправлено в этом прогоне:** стейл нарезанных
чанков курсов (см. ниже CRIT-1).

## ✅ Исправлено сразу
- **CRIT-1 (data integrity): стейл split-чанков.** Приложение грузит `locales/*/tutorials/{everyone,
  developers,business}.json`; они отставали от монолита после totalTime/FI-правок (сплиттер в
  sync не догнал). Пересобрано, 9 файлов обновлены, выгружено (commit `6a7a172`).

## 🔴 Critical / High — требует решения
- **SEC-1 (critical): слабый вывод ключа шифрования.** `supabase/functions/_shared/crypto.ts` —
  `SECRET.slice(0,32).padEnd(32,'0')` как сырой AES-256 ключ, без KDF. Фикс: SHA-256/HKDF от секрета,
  убрать padEnd. ⚠️ Смена схемы потребует ре-шифрования существующих ключей (миграция). Дерефилось бы
  до push, но функции и так не задеплоены — учесть при следующем деплое.
- **A11Y-1 (critical): узлы карты не активируются с клавиатуры.** `MindmapNode.jsx` — `role=button`+
  `tabIndex` есть, но нет `onKeyDown` (Enter/Space). + нет `:focus-visible` у `.mm-node`. WCAG 2.1.1/2.4.7.
- **ENG-1 (major): неатомарная защита кошелька.** `builder-execute` — проверка анти-наложения и
  суточного лимита через SELECT-then-INSERT, окно гонки при строго одновременном старте (двойной
  клик / вебхук+cron). Фикс: уникальный частичный индекс `(workflow_id) WHERE status='running'` +
  ON CONFLICT, либо advisory-lock/RPC. (Миграция.)
- **UX-1 (severity 4): терминологический раскол.** Одна сущность: «Узнать больше» (кнопка) /
  «Доступен workflow» (бейдж) / «Workflows» (модалка) / «курсы» (данные). Англицизм «workflow» в UI
  для не-разработчика. Выбрать один термин (напр. «мини-курс»/«урок») сквозно. i18n-правка.
- **PX-1 (high): выбор роли в онбординге игнорируется.** `IntroModal` сохраняет роль в localStorage,
  но `App.jsx` её не читает; есть `learningPaths` с `audience` под эти роли. Связать.
- **PX-2 (high): «213 курсов, с чего начать» — паралич.** Вкладка «Курсы» без фильтра уровня и блока
  «рекомендуем начать» (фильтр уровня только у «Маршрутов»). Добавить.

## 🟡 Medium — улучшения
- **LEARN-1: технические курсы (`en-governance`, `sys-error-handling`, RAG-ветка) — жаргон для
  инженеров**, выпадают из обещания «понятно не-инженеру». Расшифровывать англицизм при первом
  упоминании. (en-governance — худший.)
- **RU-1: разнобой «ты»/«вы»** между курсами (cc-install, m-what, uc-ai-rag-launch, ops-process-
  automation, en-governance, ec-personalization, ds-accessibility — на «вы»; остальные на «ты»).
  Привести к «ты» (Atlas-стандарт) ИЛИ задокументировать исключение.
- **RU-2: вероятная опечатка** `en-governance` pitfalls — «compliance-**аукции**» (скорее «долги»/
  «нарушения»). Проверить.
- **DATA-1: `level: undefined`** у новых курсов в `tutorials.js` (поле уровня не заполнено; обязательно
  по learning-design-rules). Проставить beginner/intermediate/advanced.
- **PERF-1 (high по technical-risk): вес ленивых чанков туториалов** ~600–700 КБ gzip за заход (eager
  тройка everyone/developers/business). Перейти на on-demand по audience. + дубль контента в репо
  (монолит + split, ~20 МБ).
- **BUILDER-1: rolePrompts только для 4 ролей** из 8 — `code/designer/pm/content` получают общий
  промпт координатора при «Use template». Дописать ru/en/fi.
- **SEC-2/3: AAD в AES-GCM** (привязка ciphertext к user_id), **константное сравнение секретов**,
  CORS `*`. Defence-in-depth.
- **A11Y-3/4/5: контраст** — `--accent` белый-на-акценте 3.12:1 (светлая тема, <4.5), `--text-dim`
  2.6–2.8:1. Затемнить токены.
- **HEUR/MOBILE: эмодзи `⚠️` в TutorialModal** (вместо `<Icon>`); **тач-цели футера курса и крестика
  туториала <40px** (добавить в мобильный пол); guest-gate бьёт после шага 1 без предупреждения.

## 🟢 Content gaps (на будущее)
Agent SDK / headless Claude Code; MCP-примитивы (prompts/roots) и транспорты (stdio/SSE/HTTP);
data retention / ZDR / обучение на чатах; Plugins/Marketplace как тема; Claude Code в CI/CD;
structured output по JSON-схеме / tool_choice; Admin/Usage/Cost API.

## Что зелёное (без замечаний)
build, lint:data (44 warning — легаси, не блок), lint:links (282 узла/213 курсов), lint:builder
(1 warning — намеренный singleton Старт), lint:css; engine — блокеров нет, защита кошелька и «как на
холсте» корректны; builder-health — целостность узлов/шаблонов/i18n/atlasAnchor в порядке; перф —
0 critical, 1 warning (чанки курсов).

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

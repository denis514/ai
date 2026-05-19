# Current Tasks

Активная работа. До 5 задач одновременно.
**Правило:** каждая задача завершается только после build ✅ + визуальной проверки ✅.

---

## 🔧 Технический аудит (2026-05-19)

### Build
| Метрика | Значение | Статус |
|---------|----------|--------|
| Build time | 1.21s | ✅ |
| JS initial bundle (gzip) | 85 KB | ✅ (было 558 KB) |
| JS initial bundle (raw) | 278 KB | ✅ (было 1601 KB) |
| Lazy chunks (content per locale) | ~75–88 KB gzip | ✅ |
| Vendor chunks (cached) | react 45KB + supabase 53KB + icons 19KB | ✅ |
| CSS bundle (gzip) | 21 KB | ✅ |
| Modules | ~164 | ✅ |
| Ошибки сборки | 0 | ✅ |

### Инфраструктура
| Компонент | Статус | Примечание |
|-----------|--------|------------|
| Supabase Auth | ✅ | Magic Link + Google OAuth |
| Supabase DB | ✅ | EU Frankfurt, RLS на всех таблицах |
| Vercel deploy | ✅ | Auto-deploy из GitHub |
| i18n EN/RU/FI | ✅ | Все ключи синхронизированы |
| GDPR | ✅ | Consent Mode v2, ToS, Privacy Policy |
| IP-локализация | ✅ | TTL 7 дней, кеш v2 |
| Сессия | ✅ | autoRefreshToken, рекомендуется 30д timebox в Supabase |

### Известные технические долги
- ⚠️ Bundle 1.77 MB raw — нет code splitting (Vite manualChunks не настроен)
- ⚠️ Supabase session timebox не настроен вручную (работает дефолт)

---

## ✅ Завершено (2026-05-17 → 2026-05-19)

### Auth & Access
- ✅ Password gate убран — карта открыта для всех
- ✅ Magic Link авторизация + GDPR consent
- ✅ Google OAuth (кнопка в AuthModal, Consent Mode v2)
- ✅ Tutorial gate: шаги 2+ — безопасный overlay, контент не рендерится, прогресс не пишется гостям
- ✅ Guest lock: пример в DetailPanel — blur + CTA
- ✅ Prompt Library gate: лимит 15 промптов для гостей
- ✅ AuthModal — единое GDPR-согласие для обоих методов входа
- ✅ Возраст 16+ чекбокс в AuthModal (GDPR Art. 8)
- ✅ AccountPage: кнопка «Войти» работает (z-index fix)
- ✅ Tutorial→Auth swap: туториал скрывается, AuthModal открывается поверх

### Supabase Sync
- ✅ syncService: localStorage → Supabase при каждом входе (idempotent upsert)
- ✅ Реал-тайм синк: tutorials, bookmarks, nodeProgress (debounce 300ms)
- ✅ Supabase = source of truth для залогиненных (убраны Math.max хаки)
- ✅ ProfilePanel: Math.max убран, Supabase данные приоритетны

### Profile & UX
- ✅ Единое редактирование имени в ProfilePanel (Supabase/localStorage)
- ✅ useSupabaseStats: streak, достижения (9 штук), прогресс
- ✅ Статус-бейджи на узлах карты: viewed ✓ / review ↺ / bookmark — цвет категории
- ✅ Update Banner: определение нового деплоя, ChunkLoadError auto-reload
- ✅ Welcome онбординг после первого логина

### i18n & Локализация
- ✅ FALLBACK_LOCALE: ru → en (финская локаль не показывает русский)
- ✅ CookieBanner локализован EN/RU/FI
- ✅ IP-кеш: TTL 7 дней, ключ v2 (старый вечный кеш очищен)
- ✅ Переименование Claude Atlas → 105 Atlas (все user-facing файлы)

### GDPR & Юридика
- ✅ Privacy Policy EN/RU/FI (новый дизайн в стиле Atlas)
- ✅ Terms of Service EN/RU/FI (новый дизайн)
- ✅ GA4 Consent Mode v2 (analytics_storage: denied по умолчанию)
- ✅ Cookie preferences в AccountPage (сброс + перезагрузка)
- ✅ GDPR contact в AccountPage

---

## 🔴 Открытые задачи (приоритет)

### P1 — Контент и функционал
| status | task | примечание | дата |
|--------|------|-----------|------|
| ✅ | **Audience tracks в CoursesModal** — фильтр «Все / Для всех / Бизнес / Разработчикам» | pills в обоих табах, audience в 26 tutorials + 6 paths | 2026-05-19 |
| open | **Learning Paths: For Business + For Educators** | skill: `ai-pedagogy-architect` | — |
| open | **Аудит устаревших узлов** — `cap-computer`, `b-knowledge`, `pl-platforms` | skill: `content-gap-auditor` | — |

### P2 — Техника
| status | task | примечание | дата |
|--------|------|-----------|------|
| ✅ | **Code splitting** — initial bundle 1601KB → 278KB (-83%), gzip 559→85KB | manualChunks vendors + lazy locale content chunks | 2026-05-19 |
| open | **Supabase session timebox** — выставить 30 дней в Dashboard (Authentication → Sessions) | Dashboard config | — |

### P3 — Premium (будущее)
| status | task | дата |
|--------|------|------|
| open | Pricing page / premium CTA | — |
| open | Stripe / Lemon Squeezy интеграция | — |
| open | Personal Scenarios для premium | — |

---

## Правила работы
- Каждая задача: build ✅ → preview/test ✅ → commit → push → обновить этот файл
- Не начинать следующую задачу без теста предыдущей
- После каждого git push — обновить этот файл

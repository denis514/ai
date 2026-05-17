# Supabase Auth Audit — Claude Atlas

## Цель
Провести мини-аудит проекта Claude Atlas и предложить конкретный план внедрения Supabase Auth с учётом GDPR и законодательства Финляндии.

## Контекст проекта

Ты работаешь внутри проекта **Claude Atlas** — интерактивной AI-knowledge platform о Claude.

Текущее состояние:
- Frontend-only React 18 + Vite проект, без backend и без базы данных
- Деплой: GitHub → Vercel
- Весь контент хранится в `src/data/` (mindmapData.js, tutorials.js, promptLibrary.js и др.)
- Прогресс, закладки, настройки — только в localStorage
- Нет регистрации, нет авторизации, нет пользовательского профиля в облаке

Я выбрал **Supabase** как backend platform для:
- регистрации и авторизации пользователей
- личного кабинета
- сохранения прогресса обучения (tutorials, node progress)
- избранного (bookmarks)
- персональных сценариев
- комментариев
- подписки / оплаты — в будущем
- ограничения AI-запросов — в будущем

## Юридический контекст

- **GDPR** (EU 2016/679) — privacy by design, data minimisation, право на удаление и экспорт данных.
- **Финляндия**: рекомендации tietosuoja.fi (Data Protection Ombudsman). Нельзя собирать данные «на всякий случай».
- **Supabase Auth + Row Level Security** — базовая модель защиты пользовательских данных.
- Минимизация: хранить только то, что нужно для работы функций. Не хранить: phone, address, дата рождения, henkilötunnus, паспортные данные, платёжные данные напрямую.

---

## Твоя задача

Перед тем как писать код — **ничего не меняй**. Сначала создай отчёт.

### Шаг 1. Прочитай и изучи проект
1. Прочитай `CLAUDE.md` — правила проекта.
2. Изучи структуру папок и файлов.
3. Найди:
   - где находится routing / navigation (`useHashRoute`, `App.jsx`)
   - где находится главный `App.jsx`
   - где хранятся данные (`src/data/`)
   - есть ли уже account/auth UI (`ProfilePanel.jsx`, `ProfileFab.jsx`)
   - есть ли `.env` файлы и переменные окружения
   - используется ли React Router или кастомный routing
   - как localStorage используется сейчас (ключи, структура)
   - как встроить login/account flow без разрушения текущей архитектуры

### Шаг 2. Напиши отчёт по структуре ниже

---

# Supabase Auth Mini Audit

## 1. Current Project Structure
Кратко опиши текущую архитектуру: routing, компоненты, data-слой, hooks, i18n, localStorage.

## 2. What Should Be Added
Какие новые файлы / папки / сервисы нужно добавить — и что трогать нельзя.

## 3. Recommended Auth Architecture
Предложи архитектуру:
- `src/lib/supabaseClient.js`
- `src/services/authService.js`
- `src/services/profileService.js`
- `src/context/AuthContext.jsx`
- protected routes (как реализовать без React Router)
- account page
- login/register UI (модалка или отдельный маршрут)

## 4. GDPR / Finland Compliance Considerations

**Можно хранить на первом этапе:**
- user_id (UUID, Supabase auto)
- email
- display_name (опционально, пользователь сам вводит)
- created_at
- updated_at
- consent_at (дата принятия условий)

**Не собирать:**
- phone, address, date of birth, henkilötunnus
- паспортные / ID данные
- платёжные данные напрямую (только через Stripe в будущем)
- поведенческая аналитика без явного согласия

**Обязательно:**
- механизм удаления аккаунта (right to be forgotten)
- механизм экспорта данных пользователя (data portability)
- хранить consent timestamps
- Cookie policy должна покрывать Supabase cookies

## 5. Database Tables Proposal

Для каждой таблицы укажи: назначение, поля, privacy risk, идея RLS policy.

Минимальный набор таблиц:
- `profiles` — публичные данные пользователя
- `learning_progress` — прогресс туториалов и узлов
- `favorites` — закладки
- `personal_scenarios` — персональные AI-сценарии
- `comments` — комментарии к узлам/туториалам
- `subscriptions` / `billing_status` — позже
- `ai_usage` — лимиты AI-запросов — позже

## 6. Row Level Security Plan

Предложи RLS policies для каждой таблицы:
- user can read/update own profile only
- user can read/write own learning_progress
- user can read/write own favorites
- user can read/write own scenarios
- comments: публичная read / private write (только своё)
- никакой service role key на клиенте

## 7. Implementation Order

**Phase 1 — Auth Foundation**
- создать Supabase проект
- добавить env variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- `src/lib/supabaseClient.js`
- `src/context/AuthContext.jsx`
- таблица `profiles` + RLS
- login/register UI (вписать в существующий ProfilePanel или отдельная модалка)

**Phase 2 — Profile & Account**
- account page / account section
- display_name, email change
- delete account (GDPR right to erasure)
- export data (GDPR data portability)

**Phase 3 — Learning Progress**
- перенести localStorage progress → Supabase `learning_progress`
- таблица `favorites`
- sync при входе

**Phase 4 — Scenarios & Comments**
- `personal_scenarios`
- `comments`

**Phase 5 — Monetization (позже)**
- Stripe + `subscriptions`
- `ai_usage` limits

## 8. Risk List

- Leaking Supabase service role key на клиент (никогда не делать)
- Слабые RLS policies — пользователи видят чужие данные
- Сбор лишних персональных данных без правового основания
- Смешивание публичного контента и приватных данных в одной таблице
- Отсутствие механизма удаления/экспорта данных → нарушение GDPR
- Cookie consent не покрывает Supabase session cookies
- Нет process для ответа на GDPR-запросы пользователей (в Финляндии — 30 дней)

## 9. Files to Change or Create

Список файлов проекта, которые нужно создать или изменить. Отдельно отметь:
- новые файлы
- файлы, которые нужно изменить минимально
- файлы, которые трогать не нужно

## 10. Critical Questions Before Implementation

Задай только те вопросы, без ответа на которые нельзя начать Phase 1.

---

## Ограничения (не нарушать)

- Не добавлять backend ради backend
- Не добавлять CMS
- Не переписывать весь проект
- Не менять архитектуру mindmap и data-файлы
- Не добавлять Stripe на первом шаге
- Не добавлять AI API на первом шаге
- Стек зафиксирован: React 18 + Vite + чистый CSS (без TypeScript, без UI-китов)
- Все изменения должны соответствовать правилам из `CLAUDE.md`
- Не создавать новые React-проекты поверх существующего

После отчёта — предложи безопасный MVP-план для Phase 1.

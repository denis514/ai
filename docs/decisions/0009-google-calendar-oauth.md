# ADR-0009 — Google Calendar connector (OAuth 2.0)

Дата: 2026-06-01. Статус: принято, поэтапная реализация.

## Контекст
Нужен узел-выход «Календарь», который **сам создаёт событие** в Google-календаре
пользователя. В отличие от Telegram/Resend (BYOK — один ключ), Google Calendar
требует **OAuth 2.0**: согласие пользователя, refresh-токен, обновление
access-токена, вызов Calendar API. Это отдельный auth-поток.

## Решение
Серверный OAuth-флоу (offline access), refresh-токен шифруется и хранится в
`builder_api_connections` (provider `gcal`). При запуске схемы edge-функция
обновляет access-токен и вставляет событие через Calendar API.

## Архитектура (этапы)
**Этап 1 — подключение (OAuth connect):**
- Frontend: кнопка «Подключить Google Calendar» → редирект на Google consent
  (scope `https://www.googleapis.com/auth/calendar.events`, `access_type=offline`,
  `prompt=consent`), `state` = подписанный userId, `redirect_uri` = edge-функция.
- Edge `builder-gcal-callback`: принимает `code` → меняет на refresh+access токены
  → шифрует refresh_token → upsert в `builder_api_connections` (provider `gcal`)
  → редирект обратно в приложение.
- Статус подключения показываем в «Мои ключи» (как Telegram/Resend).

**Этап 2 — создание события при запуске:**
- Узел `output-calendar` (config: calendarId='primary', длительность, таймзона).
- Агент перед узлом должен вернуть событие. Чтобы не парсить вольный текст —
  узел даёт агенту инструкцию вернуть строгий JSON `{title,start,end,description}`.
  Edge парсит JSON; если не вышло — fallback (title = первая строка, start = now+1ч).
- Edge: refresh access-token → `POST calendar/v3/calendars/{id}/events`.

## Что настраивает пользователь в Google Cloud (разово)
1. Google Cloud Console → новый проект.
2. **Enable API**: Google Calendar API.
3. **OAuth consent screen**: External, добавить себя в Test users (до верификации
   приложение работает только для тест-пользователей — до 100).
4. **Credentials → OAuth client ID → Web application**:
   - Authorized redirect URI:
     `https://<project-ref>.supabase.co/functions/v1/builder-gcal-callback`
5. Полученные **Client ID + Client secret** → в Supabase secrets:
   `supabase secrets set GOOGLE_CLIENT_ID=… GOOGLE_CLIENT_SECRET=…`

⚠️ Для публичного использования (любой пользователь) Google требует **верификацию
приложения** (review, может занять недели). До этого — только тест-пользователи.

## Безопасность
- Хранится только refresh_token (зашифрован). Access-токен — короткоживущий, в БД
  не пишем, получаем на каждый запуск.
- `state` подписываем секретом, проверяем в callback (защита от CSRF).
- Scope минимальный: только `calendar.events`.

## Риски
- Google verification — внешняя зависимость, долгая. Митигейшн: тест-юзеры на старте.
- Парсинг события из ответа агента — даём строгий JSON-контракт + fallback.
- Откат: убрать узел + provider, токены отозвать.

# Настройка Google Calendar (разово)

Чтобы узел «Календарь» создавал события, нужно один раз настроить OAuth-приложение
в Google Cloud и задать секреты в Supabase. См. ADR-0009.

## 1. Google Cloud Console
1. https://console.cloud.google.com → создать проект (или выбрать существующий).
2. **APIs & Services → Library** → найти **Google Calendar API** → **Enable**.
3. **APIs & Services → OAuth consent screen**:
   - User type: **External** → Create.
   - Заполнить название/почту.
   - **Test users** → добавить свою почту (до верификации приложение работает
     только для тест-пользователей, максимум 100).
4. **APIs & Services → Credentials → Create credentials → OAuth client ID**:
   - Application type: **Web application**.
   - **Authorized redirect URIs** → добавить:
     `https://uzqrwlpijnmxjzyrxkur.supabase.co/functions/v1/builder-gcal-callback`
   - Создать → скопировать **Client ID** и **Client secret**.

## 2. Секреты в Supabase (терминал)
```bash
supabase secrets set GOOGLE_CLIENT_ID=ВАШ_CLIENT_ID
supabase secrets set GOOGLE_CLIENT_SECRET=ВАШ_CLIENT_SECRET
# (BUILDER_SERVICE_SECRET и BUILDER_KEY_ENCRYPTION_SECRET уже заданы ранее)
```

## 3. Развернуть функции
```bash
supabase functions deploy builder-gcal-connect
supabase functions deploy builder-gcal-callback --no-verify-jwt   # ВАЖНО: с флагом
supabase functions deploy builder-execute
```
> `builder-gcal-callback` деплоить **с `--no-verify-jwt`** — Google зовёт его без
> JWT, защита через подписанный `state`.

## 4. Подключить в приложении
Builder → «Мои ключи» → **Подключить Google Calendar** → согласие Google →
вернётесь с «Google Calendar подключён ✓».

## Как агент задаёт дату события
Узел «Календарь» берёт результат предыдущего агента. Чтобы событие было точным,
попросите агента вернуть строгий JSON, например в инструкции агента:
```
Верни ТОЛЬКО JSON: {"title":"...","start":"2026-06-05T15:00:00","end":"2026-06-05T16:00:00","description":"..."}
```
Если JSON не пришёл — узел создаст событие на «через час» с заголовком из первой
строки результата.

## ⚠️ Ограничение
До прохождения **Google verification** приложение доступно только тест-юзерам
(те, кого добавили в OAuth consent screen). Для публичного доступа — пройти
проверку Google (может занять недели).

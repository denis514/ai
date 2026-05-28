# Builder Edge Functions — деплой

Серверные функции для Builder Phase B-2.2. Хранят/проверяют API-ключи и
(позже) выполняют workflow с реальными вызовами Claude.

## Предварительно

1. Установить Supabase CLI: `npm i -g supabase` (или `brew install supabase/tap/supabase`).
2. Залогиниться: `supabase login`.
3. Связать проект: `supabase link --project-ref <PROJECT_REF>`
   (PROJECT_REF — из URL Supabase dashboard / settings).

## Секреты (обязательно перед первым деплоем)

Функции используют симметричный секрет для шифрования API-ключей.
Сгенерировать случайные 32+ символа и задать:

```bash
# сгенерировать секрет (пример)
openssl rand -base64 48

supabase secrets set BUILDER_KEY_ENCRYPTION_SECRET="<вставить_сгенерированное>"
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` —
проставляются Supabase автоматически в окружении функций, отдельно задавать
не нужно.

## Деплой

```bash
supabase functions deploy builder-connect-key
supabase functions deploy builder-disconnect-key
```

## Перед этим — миграции

В Supabase Dashboard → SQL Editor выполнить (по порядку):
1. `docs/agent-builder/migrations/001_builder_core.sql` (если ещё не делал)
2. `docs/agent-builder/migrations/002_builder_api_keys.sql`

## Проверка

После деплоя в приложении: Builder → «Мои ключи» → подключить ключ Claude.
Если ключ валиден — увидишь «Подключён ••••XXXX». Если нет — понятную ошибку.

## Безопасность

- Ключ шифруется (AES-GCM) ДО записи в базу. В базе только ciphertext.
- Секрет дешифровки (`BUILDER_KEY_ENCRYPTION_SECRET`) живёт только в окружении
  функций, никогда не попадает в браузер.
- RLS на `builder_api_connections` — пользователь видит только свои строки.
- Полный security-аудит запланирован перед публичным запуском (Beta day 88-89).

# Deploy runbook — 2026-06-04

Выполняется ПОД аккаунтом владельца (Supabase CLI должен быть залогинен и
проект слинкован: `supabase link --project-ref uzqrwlpijnmxjzyrxkur`).
Frontend (Vercel) деплоится автоматически из GitHub — отдельных действий не нужно.

## 1. Миграции (Supabase → SQL Editor) — если ещё не применены
Прогнать по очереди содержимое:
- `docs/agent-builder/migrations/006_builder_mcp_servers.sql`
- `docs/agent-builder/migrations/007_builder_webhooks.sql`
(001–005 применены ранее. Если 006/007 уже прогоняли — пропустить.)

## 2. Edge-функции (Supabase CLI)
В этой сессии изменены ОБЩИЕ `_shared/crypto.ts` (KDF) и `_shared/auth.ts`
(safeEqual) — их бандлят все функции, поэтому деплоим все 8:

```bash
supabase functions deploy builder-execute      --no-verify-jwt
supabase functions deploy builder-scheduler     --no-verify-jwt
supabase functions deploy builder-webhook        --no-verify-jwt
supabase functions deploy builder-connect-key
supabase functions deploy builder-disconnect-key
supabase functions deploy builder-mcp-manage
supabase functions deploy builder-gcal-connect
supabase functions deploy builder-gcal-callback
```
(`--no-verify-jwt` — только для трёх серверных/публичных: execute идёт из
scheduler/webhook без пользовательского JWT; scheduler дёргает cron; webhook
публичный. Остальные — обычные, с JWT.)

## 3. Секреты (если ещё не заданы)
```bash
supabase secrets set BUILDER_KEY_ENCRYPTION_SECRET=<32+ случайных символов>
supabase secrets set BUILDER_SERVICE_SECRET=<32+ случайных символов>
# (опц.) BUILDER_DAILY_RUN_CAP / BUILDER_DAILY_TOKEN_CAP
```

## ⚠️ Разовое последствие усиления шифрования (выбран «простой сброс»)
После деплоя `builder-execute` (новый KDF) СТАРЫЕ сохранённые ключи перестанут
читаться. Поведение приложения корректное: при запуске вернётся понятная ошибка
`key_decrypt_failed`, пользователь заходит в «Мои ключи» и вводит API-ключ заново
(Anthropic, и при наличии — Telegram/Resend/Google). Краша нет.

## Проверка после деплоя
1. Войти → «Мои ключи» → ввести Anthropic-ключ заново.
2. Запустить простую схему на холсте — убедиться, что приходит результат.
3. Проверить расписание/вебхук (если используются).

# 15. Серверное исполнение и автозапуск (Agent Builder)

> Источник правды по тому, КАК схемы выполняются на сервере и по расписанию,
> какие лимиты действуют и где «защита кошелька». Регламент для Claude.
> Последнее обновление: после внедрения wallet-protection + web search-only.

---

## 1. Компоненты

| Что | Где | Роль |
|---|---|---|
| `builder-execute` | `supabase/functions/builder-execute/` | Единая точка исполнения схемы (ручной запуск И автозапуск). Вызывает Anthropic Messages API, доставляет в Telegram/Email/Calendar. |
| `builder-scheduler` | `supabase/functions/builder-scheduler/` | Серверный планировщик. Вызывается по cron (pg_cron) раз в минуту, находит «созревшие» расписания и дёргает `builder-execute` в сервисном режиме. |
| `builder-mcp-manage` | `supabase/functions/builder-mcp-manage/` | Добавление/удаление MCP-серверов пользователя. |
| `realExecutor.js` | `src/builder/services/` | Клиент: ручной запуск из браузера + Realtime-подписка на логи. |
| `scheduleService.js` | `src/builder/services/` | CRUD расписаний, `getTodayUsage()`, `disableAllSchedules()`. |

**Таблицы БД:** `builder_workflows`, `builder_workflow_nodes`, `builder_workflow_edges`,
`builder_schedules`, `builder_executions`, `builder_execution_logs`,
`builder_api_connections`, `builder_mcp_servers`. Все — RLS owner-only.

---

## 2. Поток одного запуска (`builder-execute`)

1. Аутентификация: либо **JWT пользователя** (ручной запуск из браузера), либо
   **сервисный режим** — заголовок `x-builder-service: <BUILDER_SERVICE_SECRET>` +
   `body.userId` (так запускает планировщик, без браузера).
2. Проверка владения схемой (`builder_workflows.user_id === userId`).
3. **Защита кошелька** (см. §5) — до любых трат.
4. Загрузка узлов/связей из БД (НЕ из браузера) → топологический порядок.
5. Подстановка задачи: `body.input` или, если пусто (автозапуск), — из узла
   «Старт» (`config.task`). См. §4 «строго как на холсте».
6. Пошаговое исполнение: агенты → Claude; логика (Условие/Цикл); выходы
   (Markdown/Telegram/Email/Calendar). Прогресс пишется в `builder_execution_logs`
   (Realtime → браузер).
7. Финал: `builder_executions.status = completed|failed`, `tokens_used`,
   `output_data`, `completed_at`.

---

## 3. Автозапуск (планировщик)

- **Расписание** хранится в `builder_schedules` (frequency, hour, minute, weekday,
  enabled, next_run_at, last_run_at). Частоты: `minutes` (интервал N в поле
  `minute`), `hourly`, `daily`, `weekly`. Всё во **времени UTC**.
- **Cron**: pg_cron раз в минуту дёргает `builder-scheduler` (через pg_net,
  заголовок `x-builder-cron: <BUILDER_SERVICE_SECRET>`).
- Планировщик берёт `enabled = true AND next_run_at <= now` (батч 20), СРАЗУ
  сдвигает `next_run_at` (анти-дубль), затем вызывает `builder-execute`.
- **Предохранитель**: если схема удалена/в архиве (`is_archived`) — расписание
  не запускается и **выключается** (`enabled=false`).
- Задачу планировщик **НЕ передаёт** (`input:''`) — движок берёт её из «Старта».

---

## 4. «Строго как на холсте» (единый источник правды)

- Автозапуск **не хранит свою копию** задачи. Задача = текст узла «Старт»
  (`config.task`) текущей **сохранённой** схемы; промпты агентов — из текущих узлов.
- Поправил схему и **сохранил** → меняется и автозапуск. Несохранённые правки
  движок не видит (читает из БД).
- Имя автоматизации = имя схемы (живое, не копия).
- ⚠️ Удаление схемы — «мягкое» (`is_archived=true`). Поэтому:
  - `deleteWorkflow()` дополнительно **удаляет расписания** этой схемы;
  - планировщик гасит расписания архивных схем (предохранитель выше).
  - FK `ON DELETE CASCADE` здесь не применим (строка не удаляется физически).

---

## 5. Защита кошелька (wallet protection)

В `builder-execute` ДО создания прогона и любых трат:

1. **Анти-наложение.** Если по этой же схеме есть `status='running'`, созданный
   за последние 10 минут → отказ `409 already_running`. Останавливает наложение
   расписаний и повторных кликов (главная причина упора в rate-limit).
2. **Суточный лимит на пользователя** (UTC-сутки), по `builder_executions`:
   - запусков: `BUILDER_DAILY_RUN_CAP` (по умолчанию **50**);
   - токенов: `BUILDER_DAILY_TOKEN_CAP` (по умолчанию **500000**).
   - При превышении → `429 daily_limit` И **авто-пауза всех расписаний**
     пользователя (`enabled=false`), чтобы фон не жёг бюджет до завтра.
3. **Счётчик** «Сегодня: N запусков · ~M токенов» — `getTodayUsage()`, показан в
   окне «Все автозапуски» (`AllSchedulesModal`).

`realExecutor.js` переводит коды (`already_running`, `daily_limit`, `no_api_key`,
`empty_workflow`) в понятные русские сообщения.

Менять лимиты без правки кода:
```
supabase secrets set BUILDER_DAILY_RUN_CAP=50 BUILDER_DAILY_TOKEN_CAP=500000
```

---

## 6. Веб-доступ (узел «Веб-поиск»)

- Используются **родные веб-инструменты Claude**, НЕ наивное скачивание HTML.
- Включён **только `web_search`** (`web_search_20250305`, `max_uses: 3`).
  `web_fetch` (открытие целых страниц) **отключён** — он потребляет слишком много
  входных токенов и пробивает лимит 30k/мин на стартовом tier.
- Когда веб подключён, движок добавляет невидимое правило: модель ОБЯЗАНА реально
  искать в вебе и отвечать ТОЛЬКО по найденному (не из памяти), плюс получает
  **текущую дату** (иначе считает «свежим» данные из обучения — отсюда были
  «новости 2017 года»).
- Грубое чтение страниц/SSRF-функции (`fetchPageText`, `extractUrls`) остались в
  коде, но не используются в основном пути.

---

## 7. Устойчивость к лимитам Anthropic

- **429 (rate limit):** `callClaude` не падает — ждёт (по заголовку `retry-after`,
  максимум 60с) и повторяет один раз. В лог пишется «Лимит запросов Anthropic —
  ждём Nс…».
- **Обрезка входа:** контекст шага ограничен **16000 символов** — защита от
  раздувания входных токенов большими веб/файловыми данными.
- Модель: `claude-sonnet-4-5`. Тариф вывода — поле `tier` (S/M/L → max_tokens).

---

## 8. Ограничения (помнить!)

- **Rate-limit tier — главный потолок.** Стартовый аккаунт Anthropic = 30 000
  входных токенов/мин. Тяжёлый веб (открытие страниц) в него не влезает — поэтому
  search-only. Для тяжёлых сценариев — поднять tier (Add funds в Anthropic console).
- **Подписка Claude Pro/Max ≠ API.** Подписку нельзя использовать для оплаты
  API-вызовов сервиса. Atlas работает только через API (оплата за токены) или BYOK.
- **Локальные модели (Ollama)** недоступны серверу: облако не видит `localhost`
  пользователя. Возможно лишь как браузерный тест-режим (не реализовано). См.
  `tasks/ideas.md`.
- **Таймаут Edge Function.** Очень долгие прогоны (большой tier + много шагов +
  ожидание 429) могут упереться в лимит времени функции. Держать схемы умеренными.
- **JS-сайты** напрямую не читаются «сырым» скачиванием — для веба полагаемся на
  `web_search`.
- **Доставка/расписание — только сервер.** Telegram/Email/Calendar и автозапуск
  требуют облака; чисто локальный (браузерный) прогон их не выполнит.
- **Время — UTC** во всех расписаниях.

---

## 9. Деплой и секреты

Деплой функций:
```
supabase functions deploy builder-execute                      # JWT-проверка ВКЛ
supabase functions deploy builder-scheduler --no-verify-jwt    # дёргает cron без JWT
supabase functions deploy builder-mcp-manage                   # JWT-проверка ВКЛ
supabase functions deploy builder-gcal-callback --no-verify-jwt
```
> Любая правка `builder-execute` (движок, веб, лимиты, кошелёк) → **обязательный
> редеплой `builder-execute`**. Правка планировщика → редеплой `builder-scheduler
> --no-verify-jwt` (без флага cron сломается на JWT).

Секреты (`supabase secrets set ...`):
- `BUILDER_SERVICE_SECRET` — сервисный режим + защита cron.
- `BUILDER_KEY_ENCRYPTION_SECRET` — шифрование ключей/токенов (AES-GCM).
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — Google Calendar OAuth.
- `BUILDER_DAILY_RUN_CAP`, `BUILDER_DAILY_TOKEN_CAP` — лимиты (опционально).

Project ref: `uzqrwlpijnmxjzyrxkur`.

---

## 10. Аварийная остановка (runbook)

1. **Мгновенно прекратить траты:** отключить ключ Anthropic в Builder → «Ключи»
   (любой запуск сразу падает без расхода).
2. **Выключить все расписания:** Builder → часы «Все автозапуски» → «Остановить
   все»; либо SQL: `update builder_schedules set enabled=false;`
3. **Найти активные:** `select id, frequency, minute, enabled, last_run_at from
   builder_schedules where enabled=true;`
4. **Лог последнего прогона:** `select created_at, level, message from
   builder_execution_logs order by created_at desc limit 25;`
5. Полностью выключить cron: `select cron.unschedule('builder-tick');`

# docs-watch — сторож официальной документации Claude

Файл для Claude (regulations), не для людей.

## Назначение

Anthropic меняет приложения (Desktop/web/Cowork/Code) быстрее, чем человек
успевает отслеживать. `scripts/docs-watcher.mjs` раз в неделю скачивает
ключевые страницы официальной документации, сравнивает с сохранённым слепком
и при изменении сигналит в Telegram + пишет дифф и черновик правок в
`tasks/backlog.md`.

Реакция выбрана пользователем: **«сигнал + черновик правок»** (не авто-правка).
Сторож только обнаруживает и предлагает — узлы Atlas правит Claude после
подтверждения.

## Что отслеживается

Список страниц — в `WATCH` внутри `scripts/docs-watcher.mjs`:
- `en/desktop.md` — референс вкладки Code в Desktop
- `en/desktop-quickstart.md` — первый запуск
- `en/desktop-scheduled-tasks.md` — расписания
- `en/platforms.md` — платформы и интеграции
- `llms.txt` — индекс ВСЕХ страниц (ловит новые/удалённые темы)

Добавить страницу = дописать запись в `WATCH` (slug, url на `.md`, label,
atlasHint — какие узлы трогать).

## Файлы

- `state.json` — sha256 каждой страницы + даты. **Не править руками.**
- `snapshots/<slug>.md` — последний скачанный текст (для диффа). Авто-генерится.

## Команды

```bash
node scripts/docs-watcher.mjs            # проверка (как в CI)
node scripts/docs-watcher.mjs --baseline # пересоздать базу без уведомлений
```

`npm run docs:watch` — то же, что первая команда.

## Как реагировать на сигнал

Когда пришёл сигнал «документация изменилась»:
1. Открыть `tasks/backlog.md` — там дифф и черновик (какие узлы затронуты).
2. Прогнать скилл `skills/docs-watcher/` — он разносит изменения по узлам Atlas
   по 6-вопросной схеме (дубли, родитель, категория).
3. Внести правки в `src/locales/*/nodes.json` / `tutorials.json`.
4. `node scripts/sync-whats-new.mjs` — лейблы «новое/обновлено».
5. Убрать обработанную секцию из `tasks/backlog.md`.

## Расписание

GitHub Action `.github/workflows/docs-watch.yml` — понедельник 08:00 UTC.
Секреты: `TELEGRAM_TOKEN`, `TELEGRAM_CHAT_ID` (те же, что у QA-бота).
Если секреты не заданы — Telegram-шаг тихо пропускается, дифф всё равно
попадает в `tasks/backlog.md` и коммитится.

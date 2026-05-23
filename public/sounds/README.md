# public/sounds/

Короткие sci-fi SFX для UI. Источник — [mixkit.co/free-sound-effects/sci-fi](https://mixkit.co/free-sound-effects/sci-fi/).
Лицензия: [Mixkit Free SFX License](https://mixkit.co/license/#sfxFree) — бесплатно
для коммерческого использования, атрибуция не требуется.

## Файлы, которые нужно скачать

| Файл                       | Где играет                      | Рекомендуемый звук с mixkit (категория)                  |
|----------------------------|---------------------------------|----------------------------------------------------------|
| `node-expand.mp3`          | Раскрытие узла mindmap          | Sci-fi → короткий blip / interface beep, ≤ 200 мс        |
| `node-collapse.mp3`        | Сворачивание узла               | Sci-fi → reverse-blip / soft tick, ≤ 150 мс              |
| `modal-open.mp3`           | Открытие модального окна        | Sci-fi → soft whoosh / panel open, ~250 мс               |
| `modal-close.mp3`          | Закрытие модального окна        | Sci-fi → reverse whoosh / panel close, ~180 мс           |
| `ui-hover.mp3`             | Hover на primary CTA            | UI → micro-tick / sub-blip, ~80 мс                       |
| `ui-click.mp3`             | Клик по primary CTA             | UI → confirm-blip, ~120 мс                               |
| `progress-step.mp3`        | Шаг туториала завершён          | Sci-fi → chime / positive blip, ~250 мс                  |
| `progress-complete.mp3`    | Туториал завершён               | Sci-fi → success-arpeggio (восх. трезвучие), ~600 мс     |
| `toast.show.mp3`           | Появление toast (опционально)   | UI → soft pop, ~150 мс                                   |

## Требования к файлам

- Формат: **MP3**, mono, 44.1 kHz, 64–96 kbps.
- Размер: **≤ 30 KB на файл**, суммарно ≤ 300 KB.
- Длительность: **≤ 400 мс** (кроме `progress-complete.mp3` — до 700 мс).
- Без тишины в начале (обрезать в Audacity / любом редакторе).
- Без жёсткого clipping; normalize до −3 dB peak.

## Как добавить новый звук

1. Скачать MP3 с mixkit (или другого free-source).
2. Обрезать/нормализовать.
3. Положить в эту папку с именем в `kebab-case.mp3`.
4. Зарегистрировать ключ в `src/sound/soundRegistry.js`.
5. Обновить таблицу выше и в `docs/sound-design.md` § 2.

## Текущий статус

Файлы пока не закоммичены — реестр готов, но `Audio` будет молча падать на
`NotFoundError` и игнорироваться `playSound()`. Это не ломает приложение —
звук просто отсутствует, пока ассеты не положат в эту папку.

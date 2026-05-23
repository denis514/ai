# public/sounds/

Короткие sci-fi SFX для UI. Источник — [mixkit.co/free-sound-effects/sci-fi](https://mixkit.co/free-sound-effects/sci-fi/).
Лицензия: [Mixkit Free SFX License](https://mixkit.co/license/#sfxFree) — бесплатно
для коммерческого использования, атрибуция не требуется.

## Файлы

Формат: **MP3 или WAV** (HTMLAudio поддерживает оба). WAV проще найти на mixkit,
но тяжелее по весу (~100 KB вместо ~20 KB). При наличии — предпочтительнее MP3.

| Файл                              | Где играет                      | Статус         | Рекомендация (mixkit)                          |
|-----------------------------------|---------------------------------|----------------|------------------------------------------------|
| `node-expand.wav`                 | Раскрытие узла mindmap          | ✅ есть        | Sci-fi → короткий blip / interface beep        |
| `node-collapse.{wav,mp3}`         | Сворачивание узла               | 🕒 fallback    | Сейчас играет `node-expand.wav` с gain 0.6     |
| `modal-open.{wav,mp3}`            | Открытие модального окна        | 🕒 нет         | Sci-fi → soft whoosh / panel open, ~250 мс     |
| `modal-close.{wav,mp3}`           | Закрытие модального окна        | 🕒 нет         | Sci-fi → reverse whoosh / panel close, ~180 мс |
| `ui-hover.wav`                    | Hover на primary CTA            | ✅ есть        | UI → micro-tick / sub-blip, ~80 мс             |
| `ui-click.wav`                    | Клик по primary CTA             | ✅ есть        | UI → confirm-blip, ~120 мс                     |
| `progress-step.{wav,mp3}`         | Шаг туториала завершён          | 🕒 нет         | Sci-fi → chime / positive blip, ~250 мс        |
| `progress-complete.{wav,mp3}`     | Туториал завершён               | 🕒 нет         | Sci-fi → success-arpeggio, ~600 мс             |
| `toast-show.{wav,mp3}`            | Появление toast                 | 🕒 нет         | UI → soft pop, ~150 мс                         |

## Требования к файлам

- Формат: **MP3** (предпочтительно) или **WAV**.
- MP3: mono, 44.1 kHz, 64–96 kbps. WAV: mono, 16-bit, 44.1 kHz.
- Размер: ≤ 30 KB для MP3, ≤ 200 KB для WAV. Суммарно ≤ 1 MB.
- Длительность: ≤ 400 мс (кроме `progress-complete` — до 700 мс).
- Без тишины в начале (обрезать в Audacity / любом редакторе).
- Без жёсткого clipping; normalize до −3 dB peak.
- Если есть WAV → можно сконвертировать в MP3 для меньшего веса:
  `ffmpeg -i input.wav -b:a 96k -ac 1 output.mp3`

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

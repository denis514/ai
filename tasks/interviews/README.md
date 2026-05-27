# Interviews — Atlas Pro Phase 1 Validation

> **Где:** `tasks/interviews/` в корне проекта
> **Цель:** 10 интервью с potential paying customers за 14 дней
> **Owner:** founder
> **Started:** 2026-05-24

---

## Структура папки

```
tasks/interviews/
├── README.md                        # этот файл — навигация + workflow
├── 01-target-list.md                # таблица для записи найденных кандидатов
├── 02-search-urls.md                # готовые LinkedIn URLs для поиска (1 клик)
├── 03-public-thought-leaders.md     # публичные AI/Product лидеры в Nordic (примеры ICP)
├── 04-interview-questions.md        # финальный script для 45-мин интервью
├── 05-message-templates.md          # outreach copy готовый к copy-paste
└── 06-recordings/                   # папка для notes per interview
    └── (interview-{date}-{name}.md создаются по мере проведения)
```

---

## Workflow (как использовать эту папку)

### Шаг 1 — Найти 30-50 кандидатов (Day 1-3)

1. Открыть **`02-search-urls.md`** → кликнуть на URLs (они откроют LinkedIn с pre-filled filters)
2. Открыть **`03-public-thought-leaders.md`** — публичные люди как примеры ICP
3. Записать **каждого подходящего** в **`01-target-list.md`** (таблица с колонками)

**Целевой результат:** 30-50 потенциальных контактов в target list.

### Шаг 2 — Outreach (Day 1-14, параллельно с шагом 3)

1. Открыть **`05-message-templates.md`** — готовые 4-touch sequences
2. Send Touch 1 (connection requests) — 20-30/день
3. Update target list status после каждой touch

### Шаг 3 — Conduct interviews (Day 5-14)

1. Когда кандидат accepts demo → book through Calendly
2. Перед интервью — открыть **`04-interview-questions.md`** + создать новый файл в **`06-recordings/`**
3. Во время интервью — записывать в новый файл (например `06-recordings/interview-2026-05-28-jane-doe.md`)
4. После интервью — update target list + add quote candidates

### Шаг 4 — Analyze (Day 14)

1. Прочитать все файлы в `06-recordings/`
2. Update `tasks/pricing-validation.md` (в parent папке) с patterns + decision
3. Решить: Phase 2 GO / pivot / continue interviews

---

## Связь с другими docs

- **`tasks/pricing-validation.md`** — main tracking (decision criteria + progress)
- **`tasks/linkedin-outreach-nordic.md`** — outreach playbook + cadence
- **`docs/business-strategy/02-target-customer.md`** — ICP spec + interview script source
- **`docs/business-strategy/04-monetization-roadmap.md`** — Phase 1 в контексте

---

## Метрики после interviews

После каждого интервью — обновить:

| File | Что обновить |
|------|--------------|
| `01-target-list.md` | Status в строке кандидата (held / no-show / etc) |
| `06-recordings/interview-X.md` | Full notes |
| `tasks/pricing-validation.md` | Score 1-5 + quote |

---

## Что НЕ хранить в этой папке

- ❌ Personal data людей которые НЕ дали consent на storage (GDPR concern)
- ❌ Recordings audio/video (хранить через external service like Zoom Cloud)
- ❌ Email addresses без opt-in (LinkedIn DM-only до consent)
- ❌ Photos из LinkedIn profiles

**Правило:** target-list содержит **publicly available** info (имя, должность, компания, LinkedIn URL). Если кандидат explicitly opt-in для long-term tracking — тогда можно расширить.

---

## Готов начать?

1. Прочитай `02-search-urls.md` — pre-filled LinkedIn searches
2. Открой 2-3 URL → собери первые 10 кандидатов в `01-target-list.md`
3. Открой `05-message-templates.md` → send 5 connection requests
4. Это займёт ~30-45 минут

Через 14 дней — здесь будет 10+ recorded interviews и **decision на Phase 2**.

---

_Папка инициирована: 2026-05-24._

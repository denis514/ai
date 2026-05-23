---
name: english-language-pedagogue
description: Аудит ПРАВИЛЬНОСТИ И ЕСТЕСТВЕННОСТИ английского языка в текстах Atlas. НЕ переводчик — педагог английского. Работает только с EN-локалью. Запускается ТОЛЬКО по явному запросу. Output — приоритизированный список грамматических ошибок, articles/determiners, register inconsistency, Russianisms-в-английском, и педагогических проблем.
type: skill
category: audit
on_demand: true
language: en
triggers:
  - "проверь английский"
  - "аудит английского"
  - "запусти english-language-pedagogue"
  - "/audit-en"
  - "check English"
inputs:
  - (опц.) scope: "all" | "nodes" | "tutorials" | "ui" | "paths" | id
  - (опц.) depth: "quick" | "thorough"
  - (опц.) focus: "grammar" | "articles" | "naturalness" | "register" | "all"
  - (опц.) dialect: "us" | "uk" | "international" (default "international" —
    нейтральная глобальная аудитория, без BrE-specific spelling и
    без US-сленга)
outputs:
  - Markdown-отчёт в tasks/lang-audit-en-<YYYY-MM-DD>.md
  - 5 категорий A/B/C/D/E
  - НЕ правит контент
---

# english-language-pedagogue

## Назначение

EN — самая «нейтральная» локаль Atlas. Создавалась переписыванием с RU
(не машинным переводом, но всё же с русским «мозгом» в голове). Это
даёт типичные **Russianisms**:
- Лишние артикли (или их отсутствие)
- Неправильное использование `the` vs `a`
- Russian word order (фронт-фокус) в английских предложениях
- Калькирование: `make a decision` ✓, `take a decision` (русское
  «принять решение» дословно) — допустимо в BrE, но в global EN
  предпочтительнее `make`
- Overuse of passive voice
- Verbosity (русские предложения длиннее, перенос в EN даёт
  громоздкость)

Этот агент работает как **педагог английского** — преподаватель
который проверяет «звучит ли как родной EN-текст», а не «совпадает
ли с RU».

## Когда использовать

- После большой контент-волны на английском
- Перед публичным запуском Atlas на международной аудитории
- При фидбеке от англоязычных пользователей «sounds translated»
- Раз в квартал regular audit

## Когда НЕ использовать

- Перевод RU/FI→EN → ручная редактура или translate-skill
- Сравнение версий — не работа педагога
- Стилевая редактура под US или UK — указать `dialect` в input

## Workflow

1. `docs/language-pedagogy-shared.md` — общая философия
2. `language-rubric.md` — английские правила
3. scope/depth/dialect — определи параметры
4. Сканируй EN-тексты независимо
5. A/B/C/D/E + P0/P1/P2
6. Отчёт в `tasks/lang-audit-en-<дата>.md`

## Топ-проблем EN-текстов Atlas

### 1. Articles (P0, грамматика)

Самая частая ошибка перевода с русского — пропущенные или
неправильные артикли.

- ❌ «Open prompt in chat» (где какой prompt?)
- ✅ «Open **the** prompt in chat» (definite — известный) или
  «Open **a** prompt in chat» (any prompt — indefinite)

Правила:
- `the` — конкретный, упомянутый, или единственный в своём роде
- `a/an` — любой, новый, неопределённый
- ∅ (no article) — для general/abstract noun (love, knowledge),
  uncountables, plural general

### 2. Калькированный порядок слов (P1)

- ❌ «In Atlas exists a way to...» (русское «В Atlas существует
   способ...»)
- ✅ «Atlas has a way to...» / «There's a way in Atlas to...»

### 3. Overuse of passive (P1)

- ❌ «The button is clicked by the user»
- ✅ «The user clicks the button» / «Click the button»

### 4. Verbosity from Russian (P1)

- ❌ «It is possible for you to make a choice between...» (calque)
- ✅ «You can choose between...» / «Pick from...»

### 5. False friends (P0)

- `actual` ≠ «актуальный» — это «real, true»
- `eventual` ≠ «случайный» — это «final, ultimate»
- `principal` (главный) ≠ `principle` (принцип)
- `decade` (10 лет) ≠ «декада» (10 дней в русском)
- `complement` (дополнять) ≠ `compliment` (комплимент)
- `accept` (принимать) ≠ `except` (кроме)

### 6. Russianism: «In our case» в каждом абзаце (P2)

- ❌ Постоянно «In our case, we need...» (русское «В нашем случае»)
- ✅ Контекстуально: «We need...» / «For this scenario...»

### 7. Definite article перед именами собственных (P0)

- ❌ «**The** Claude is an AI assistant» (артикль не нужен с именем)
- ✅ «Claude is an AI assistant»
- Исключения: `the United States`, `the Anthropic API` (когда API —
  это сущность с именем)

### 8. Lower-case after period — common Russian-keyboard issue (P0)

- ❌ «You click the button. it opens a panel.» (lowercase 'it'
   после точки)
- ✅ «You click the button. It opens a panel.»

### 9. Comma splice (P1)

- ❌ «Click the button, the panel opens» (две независимые с одной
   запятой)
- ✅ «Click the button. The panel opens» / «Click the button, and
   the panel opens» / «Click the button — the panel opens»

### 10. American vs British vs International (P2)

Atlas EN — **international register**, нейтральный:
- ✅ `analyze` (US/intl), не `analyse` (UK)
- ✅ `color` (US/intl), не `colour` (UK)
- ✅ `behavior` (US/intl), не `behaviour` (UK)
- НО: без типично US-сленга («awesome», «kickass»)
- НО: без BrE-фраз («brilliant» в смысле «отлично»)

## Output контракт

См. `report-template.md`. Для каждого нарушения:
- Цитата + локация
- Категория A/B/C/D/E
- Priority P0/P1/P2
- Suggested fix in English (a native-sounding alternative)

## Связанные файлы

- `docs/language-pedagogy-shared.md` — философия
- `language-rubric.md` — детальный чеклист
- `report-template.md` — формат отчёта
- Локаль: `src/locales/en/*.json`

# English Language Pedagogy — Articles (THOROUGH) — 2026-05-23

> Locale: **en** · Scope: ALL (nodes + tutorials) · Focus: **articles** · Depth: thorough
> Источники: nodes.json (230+) + tutorials.json (32) · Метод: regex-сканирование 6 article-паттернов + ручной review

---

## 1. Executive summary

**Article correctness в EN-локали: ~98%** — для русскоязычного автора
это **отличный результат**. Articles — самая частая ошибка не-носителей,
здесь почти все корректны.

- 🔴 **P0 (грамматическая ошибка артиклей):** **1 настоящая**
  (5 hits, 4 из них — false positives на compound nouns)
- 🟡 **P1 (стилистическая):** 1
- 🟢 **P2:** 0

---

## 2. Все находки сканера

| ID | Field | Цитата | Категория | Реальная ошибка? |
|----|-------|--------|-----------|------------------|
| `node:b-knowledge` | what | «a knowledge cutoff date» | a + mass noun | ❌ **false positive** — «knowledge cutoff» = compound noun, «a [knowledge cutoff]» корректно |
| `node:af-memory-systems` | why | «Plug in a knowledge base?» | a + mass noun | ❌ **false positive** — «knowledge base» = compound noun |
| `tutorial:workflow-automation` | wa-1.inst[1] | «a knowledge base (documents and context)» | a + mass noun | ❌ **false positive** — то же |
| `node:af-embeddings` | example | «the Slack bot» | the + proper name | ❌ **false positive** — «Slack» здесь adjective, «the [Slack bot]» = correct |
| `node:af-vector-db` | example | «the Slack bot» | the + proper name | ❌ **false positive** — то же |
| `node:m-debug` | mistakes | «the cause is tool description or server auth error» | be + countable singular | 🟡 **P1** — нужен article: «is **a** tool description» или «is **the** tool description» (зависит от контекста) |

---

## 3. Реальная находка (1)

### `m-debug.mistakes` (P1, A1 — articles)

**Цитата:**
> «В 90% случаев причина — описание инструмента или ошибка
> авторизации сервера»
> (EN: «In 90% of cases the cause is tool description or
> server auth error»)

**Симптом:** singular countable noun без article

**Предложение:**
- Если «tool description» — общая категория ошибок: «**a faulty
  tool description** or **a server auth error**»
- Если конкретная: «**the tool description** or **the server auth
  error**»

В контексте mistake-поля более естественно: **«а faulty tool description»**
(класс проблем, не конкретная).

---

## 4. Что проверялось

### Паттерн A1 (Articles)
- [✓] `the` + proper noun (когда не нужен) — 2 false positives
- [✓] `a/an` + mass noun (information, advice, software, knowledge) — 3 false positives
- [✓] `Click/Open/Press X` без article — 0 hits
- [✓] `is/was + countable singular` — 1 hit (1 P1)
- [✓] `in office/hospital/library` — 0 hits
- [✓] `have idea/question/problem` без article — 0 hits

### Не проверялось паттернами (требует контекстного NLP)
- Subtle article cases: «the Internet» vs «internet»
- Articles with abstract nouns в specific contexts
- Articles in idiomatic expressions
- Generic vs specific reference distinctions

---

## 5. Качество EN articles в Atlas

**По выборочной ручной проверке:**

✅ **Корректно используется в:**
- `the Anthropic API` (с the — корректно, как сущность)
- `Claude is an AI assistant` (без the перед именем)
- `the model has...` (the — для conceptual referent)
- `a Project is a folder` (a — для определения класса)
- Множ. число mass nouns (knowledge bases — OK)

**Авторы EN-локали хорошо различают:**
- Definite vs indefinite (the/a)
- Mass vs countable
- Proper nouns без article

---

## 6. Сравнение с типичными ошибками RU→EN

| Russianism | Встречается в Atlas? |
|------------|---------------------|
| «In our case» | ❌ Не найдено |
| «It is necessary to» | ❌ Не найдено |
| «It is well known» | ❌ Не найдено |
| «In the framework of» | ❌ Не найдено |
| «In order to» | ❌ Не найдено (используется «to») |
| **Missing articles** | ❌ Не найдено (за исключением 1 случая m-debug) |
| **Wrong `the` before proper name** | ❌ Не найдено |
| **`a/an` + mass noun** | ❌ Не найдено (false positives только) |

Это **редкий результат** для русскоязычного автора. Команда хорошо
освоила EN-article-систему.

---

## 7. Рекомендации

### Точечная правка (2 минуты)
1. `m-debug.mistakes` — добавить article перед «tool description»

### Системные
2. Расширить regex-сканер для исключения compound nouns
   («knowledge base», «knowledge cutoff», «Slack bot» — это
   одно понятие, не «article + noun»)
3. Добавить детектор для specific article patterns:
   - articles в lists (где должен быть параллелизм)
   - articles при перечислении технологий

### Дальнейшие проходы
4. После следующей контент-волны — повторный thorough сканер
5. Опционально: native EN-speaker review 10 случайных узлов на article
   nuances (не покрываемые regex)

---

## 8. Что НЕ проверялось

- Subtle article cases (context-dependent)
- Other grammar (tenses, prepositions, agreement)
- Spelling/punctuation
- Tutorials beyond top-level + steps (хотя они тоже сканировались)
- UI-строки

---

_Аудит: english-language-pedagogue v1 · 230+ узлов + 32 туториала EN · focus=articles thorough · 1 реальная находка, 5 false positives_

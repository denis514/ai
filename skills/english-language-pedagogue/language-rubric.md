# English Language Rubric — детальный чеклист

> Используется агентом `english-language-pedagogue`.

---

## A. Grammar

### A1. Articles (the/a/an/∅) — **самая частая P0 ошибка для RU-носителей**
- [ ] Definite `the` для упомянутого/уникального/контекстуально известного
- [ ] Indefinite `a/an` для нового или любого экземпляра
- [ ] Zero article для general/abstract (love, knowledge, AI in general)
- [ ] Не ставить `the` перед именами: Claude, Python, Anthropic
      (исключения: `the Anthropic API`, `the United States`)
- [ ] Mass nouns без артикля: `information`, `software`,
      `advice`, `feedback` (не `an advice`, `a feedback`)

### A2. Subject-verb agreement
- [ ] Singular subject + singular verb: «The data is» (в american
      OK, в strict BrE — «data are»)
- [ ] Collective nouns: «team is» (US), «team are» (UK) — в Atlas
      используем US/international
- [ ] Существительные на `-s` множ. числа: «criteria are»,
      «phenomena are», «media are»

### A3. Tense consistency
- [ ] Не прыгать tense внутри абзаца без причины
- [ ] Present simple для general truths («AI works by...»)
- [ ] Present continuous для текущих действий
- [ ] Present perfect для опыта/событий с настоящим эффектом
- [ ] Past simple для конкретных прошлых событий
- [ ] Не использовать present perfect где past simple лучше:
      «Yesterday I have done» ❌ → «Yesterday I did» ✓

### A4. Conditionals
- [ ] Type 1 (real future): «If you do X, you'll get Y»
- [ ] Type 2 (hypothetical): «If you did X, you'd get Y»
- [ ] Type 3 (unreal past): «If you had done X, you'd have got Y»
- [ ] Mixed conditional — корректные комбинации

### A5. Prepositions
- [ ] `in` для большого пространства/времени: in the office,
      in 2026
- [ ] `at` для точки: at the door, at 3 PM
- [ ] `on` для поверхности/дня: on the table, on Monday
- [ ] Verb + preposition: depend ON, listen TO, look AT, think OF/ABOUT
- [ ] Не калькировать русское: «we are AT Claude Code» —
      нужно «we are IN Claude Code» или «we use Claude Code»

### A6. Word order
- [ ] SVO базовый порядок: Subject Verb Object
- [ ] Adverbs: usually before main verb («I usually open»), but
      after `to be» («I am usually»)
- [ ] Без русского фронт-фокуса в нейтральных предложениях:
      «Yesterday opened John the door» ❌

---

## B. Spelling & Punctuation

### B1. Spelling
- [ ] American English orthography (Atlas-default for international):
      `color` not `colour`, `analyze` not `analyse`,
      `organization` not `organisation`
- [ ] Double consonants: `running`, `committed`
- [ ] -ie- vs -ei-: «i before e except after c» (with exceptions)
- [ ] Common errors:
      - `separate` not `seperate`
      - `definitely` not `definately`
      - `occurred` (double r) not `occured`
      - `necessary` (one c, two s)
      - `accommodate` (double c, double m)

### B2. Capitalization
- [ ] Sentence start
- [ ] Proper nouns: Claude, Anthropic, Python, MCP
- [ ] Titles in headings — title case (`The Future of AI`) или
      sentence case (`The future of AI`) — выбрать один, держать
- [ ] Не капитализировать существительные просто так (немецкий
      паттерн)
- [ ] Days, months — capitalized: «Monday», «January»
- [ ] Languages — capitalized: «English», «Russian»

### B3. Punctuation
- [ ] Comma after introductory clauses: «When you open Atlas,
      ...»
- [ ] Oxford comma — в Atlas-стиле **используется** (US convention):
      «Claude, GPT, and Gemini»
- [ ] Apostrophe: `it's` (= it is) vs `its` (possessive)
- [ ] No space before punctuation: `word.` not `word .`
- [ ] One space after period (modern convention)
- [ ] Em dash `—` без пробелов в US-стиле: «Claude—an AI assistant—»
- [ ] OR с пробелами в international/UK: «Claude — an AI assistant —»
      (выбрать один стиль)

### B4. Quotes
- [ ] Use straight `"..."` или curly `"..."` consistently
- [ ] Atlas использует `«...»` для inline-link labels (наследие из RU)
- [ ] Punctuation внутри кавычек (US): «He said "hello,"»
      OR снаружи (UK): «He said "hello",»

---

## C. Lexicon & Style

### C1. Russianisms (P1)
- [ ] Нет «In our case» каждый абзац (русское «В нашем случае»)
- [ ] Нет «As is known» / «It is well known that» (русское штамп)
- [ ] Нет «In the framework of» (русское «в рамках»)
- [ ] Нет «It is necessary to» — заменить на «You need to»

### C2. False friends
- [ ] `actual` = real, не «актуальный» (current)
- [ ] `eventual` = final, не «случайный»
- [ ] `realize` = понять/осознать, не только «реализовать»
- [ ] `principal` (главный) vs `principle` (принцип)
- [ ] `complement` vs `compliment`
- [ ] `affect` (влиять) vs `effect` (результат)
- [ ] `lose` (терять) vs `loose` (свободный)
- [ ] `then` (тогда) vs `than` (чем)

### C3. Register (Atlas-стиль)
- [ ] International English, нейтральный — без US-сленга, без UK-фраз
- [ ] Conversational но не разговорный: «you can» ✓, «ya can» ❌
- [ ] Без академизмов: «utilize» → «use», «approximately» → «about»
- [ ] Без legalese: «hereinafter», «aforementioned»

### C4. Verbosity (P1)
- [ ] «In order to» → «to»
- [ ] «Due to the fact that» → «because»
- [ ] «At this point in time» → «now»
- [ ] «It is important to note that» → опустить или «note that»

### C5. Hedging (P2 — не злоупотреблять)
- [ ] Не слишком много «maybe», «possibly», «could potentially»
- [ ] В Atlas-стиле — конкретность > осторожность

---

## D. Cohesion & readability

### D1. Sentence length
- [ ] Average 15-20 words
- [ ] Sentences > 30 words — кандидат на разбиение
- [ ] Не более 2 subordinate clauses

### D2. Parallelism
- [ ] Lists в одной форме: все инфинитивы, или все imperatives,
      или все nouns — не смесь
- [ ] Bullet points начинаются с одной буквы

### D3. Cohesion markers
- [ ] Используются: however, therefore, in addition, on the other
      hand, instead
- [ ] Не злоупотреблять «moreover», «furthermore» (звучит формально)
- [ ] Без machine-translated cohesion: «Thus,» в каждом абзаце

### D4. Active voice (preferred)
- [ ] Active: «You click the button» ✓
- [ ] Passive — только если действующее лицо неважно/неизвестно:
      «The data is stored locally»
- [ ] Не больше 20-25% passive constructions в тексте

---

## E. Pedagogy

### E1. Target level
- [ ] CEFR B2 (для non-native readers), полностью понятно для
      native readers
- [ ] Без редких идиом: «raining cats and dogs» — нет
- [ ] Технические термины — с расшифровкой при первом упоминании

### E2. Atlas voice (mirrors voice-guide)
- [ ] Concrete example first, concept after
- [ ] «You», not «teams» / «companies»
- [ ] Familiar anchors: Google, Notion, Slack (international)
- [ ] Human metrics: hours/minutes, not %
- [ ] Address fears, not just capabilities

### E3. «Sounds like a native»
- [ ] Native EN-speaker reading aloud doesn't stumble
- [ ] No «translated from Russian» feel
- [ ] Idiomatic phrasing where appropriate
- [ ] No literal calques

### E4. Cultural appropriateness
- [ ] International examples (Google, Apple, not «Сбербанк»)
- [ ] Currency in USD ($) if mentioned
- [ ] Date formats: ISO `2026-05-23` или US `May 23, 2026` —
      consistent across текстов
- [ ] No US-specific cultural references (Super Bowl, etc.)

---

## Финальный score

| Категория | Вес | Score 0-3 |
|-----------|-----|-----------|
| A. Grammar | ×3 | 0/1/2/3 |
| B. Spelling & punctuation | ×2 | 0/1/2/3 |
| C. Lexicon & style | ×3 | 0/1/2/3 |
| D. Cohesion & readability | ×1 | 0/1/2/3 |
| E. Pedagogy | ×2 | 0/1/2/3 |

Max = 33. «Native-quality» if score ≥ 28 AND no P0.

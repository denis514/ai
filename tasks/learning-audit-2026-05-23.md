# Learning Content Audit — 2026-05-23

> **Скоп:** all (узлы RU) · **Персона:** ordinary-human · **Глубина:** quick · **Горизонт:** both
> **Узлов проверено:** 228 (RU locale) · **Метод:** автоэвристики + ручной spot-check ~30 узлов

---

## 1. Executive summary

**Общая готовность к «обычному человеку»: ≈ 78%.** Большая часть узлов соответствует
voice-guide (после волны переписок), но обнаружены **2 системных паттерна-анти-паттерна**
которые тянут оценку вниз и повторяются по ~30+ узлам.

- 🔴 **P0 (critical):** 2 системных паттерна (затрагивают 34 + 33 узла) — нужна
  массовая переписка через скрипт + ручная правка
- 🟡 **P1 (important):** 8 точечных узлов с длинными «стенами текста» или жаргоном
  без якоря
- 🟢 **P2 (nice-to-have):** ~15 шлифовочных правок (англицизмы, метрики в %)

**Самый частый системный паттерн:** «Stage 1→2 transition» в `impact`-поле узлов
operations/marketing/customer-support/product/design — voice-guide §6 прямо
квалифицирует это как **corporate slide вместо личного пути**. Стало эпидемией.

**Второй паттерн:** AI Fundamentals (`af-*`) — переписан в технико-академическом
тоне («LLM = нейросеть-трансформер, обученная предсказывать токен»), хотя соседний
`sys-rag-architecture` уже эталонный («Знаешь как Google ищет по сайтам?»).
Внутренний рассинхрон тона.

---

## 2. Топ-5 системных проблем

### Проблема 1: «Stage X→Y» в impact-полях — voice-guide антипаттерн (P0)
- **Где:** 34 узла, преимущественно `ops-*`, `mk-*`, `cs-*`, `pd-*`, `ds-*`, `en-*`,
  `sys-*` (всё что было сгенерировано как Tier 2 Transformation/Systems)
- **Симптом:** в конце поля `impact` повторяется штамп типа «Stage 1→2.» / «Stage 2→3.»
- **Цитата:**
  > «Time savings: 70-90% на конкретной задаче. Consistency: единый качественный
  > результат вместо вариативности «зависит кто делал». **Stage 1→2.**»
  > — `ops-process-automation.impact`
- **Почему важно:** voice-guide §6 говорит дословно: «Stage 1→2 transition» — никто
  не знает что это». Это **corporate slide-язык**, который выкидывает обычного
  читателя. Дизайнер/маркетолог не знает что такое «Stage 1» и где он сам.
- **Системное решение:**
  - Скриптом удалить все «Stage X→Y.» шаблоны из конца `impact` полей
  - Заменить штамп на человеческое «через 3-6 месяцев это станет привычкой» где
    уместно (или просто убрать)
  - Добавить в voice-guide explicit запрет на употребление «Stage» в `impact`

### Проблема 2: Рассинхрон тона в AI Fundamentals (P0)
- **Где:** `af-llm-basics`, `af-embeddings`, `af-rag-basics`, `af-fine-tuning`,
  `af-vector-db`, `af-multimodal`, `af-memory-systems`
- **Симптом:** жаргон стопкой с первого предложения, без якоря из жизни
- **Цитата:**
  > «**Large Language Model** — нейросеть-трансформер, обученная предсказывать
  > следующий токен в тексте. Claude, GPT, Gemini, Llama — все это LLM.
  > Различаются размером (миллиарды параметров), архитектурой (decoder-only,
  > mixture-of-experts) и тренировочными данными.»
  > — `af-llm-basics.what`
- **Почему важно:** AI Fundamentals задумывался как **входная точка для обычных
  людей**, но фактически написан как глава из учебника по NLP. Marketer/PM/designer
  отказывается читать в первой же фразе. **Внутренний рассинхрон:**
  соседний `sys-rag-architecture.what` начинает с «Знаешь как Google ищет по
  сайтам?» — эталон. Один раздел, два совершенно разных тона.
- **Системное решение:**
  - Переписать `af-*` через `ai-pedagogy-architect` с обязательным якорем в первой
    фразе. Эталон — `sys-rag-architecture` и `sys-multi-agent-patterns`.
  - Воспроизвести 6 принципов voice-guide для каждого узла.

### Проблема 3: Метрики в процентах вместо часов (P1)
- **Где:** ~10 узлов в impact-полях
- **Симптом:** «Time savings: 70-90%», «Content output: +200-300%» — voice-guide §4
  явно требует human terms (часы→минуты), не проценты.
- **Цитата:**
  > «Content output: **+200-300%** при том же составе команды.»
  > — `mk-content-ops.impact`
- **Почему важно:** «+200%» — это абстракция. Маркетолог не понимает «было сколько,
  стало сколько». Voice-guide требует: «Раньше писал отчёт 4 часа — теперь 30 минут
  на проверку».
- **Решение:** конвертировать в формат «было X часов → стало Y». Скриптом найти все
  паттерны `[+-]?\d+%` в `impact` → пометить → перевести вручную.

### Проблема 4: Длинные «стены текста» в `what` (P1)
- **Где:** `cc-grp-session.what` (620 символов / 15 предложений),
  `cap-limitations.what` (603 / 7), `pd-feedback-synthesis.example` (626 / 6)
- **Симптом:** монолитный текст без абзацев, не сканируется
- **Почему важно:** trends-2026-2030 §6 (snackable knowledge): первые 2 строки решают.
  Если узел = стена, читатель закрывает.
- **Решение:** каждый разбить на 2-3 абзаца. Bold-выделить ключевые слова. Перевод
  длинных перечислений в bullet-listы.

### Проблема 5: Англицизмы без перевода (P2)
- **Где:** ~20 узлов в Tier 2 (особенно `mk-*`, `cs-*`, `ds-*`)
- **Симптом:** «CSAT», «tier-1», «handoff», «across все каналы», «structured themes»,
  «designer's gut feel» — английские термины русскими буквами без объяснения.
- **Цитата:**
  > «Tier-2 нагрузка снижается на 30-40%. CSAT для AI-tickets: 4.2/5...»
  > — `cs-tier1.impact`
- **Почему важно:** voice-guide §3 — знакомые якоря, не жаргон. «CSAT» для маркетолога
  — пустой звук.
- **Решение:** при первом упоминании переводить или объяснять. «CSAT (оценка
  довольства клиента) — 4.2/5».

---

## 3. Полная таблица проблем (топ-25)

| Node ID | Field | Цитата | Ось | P | Предложение |
|---------|-------|--------|-----|---|-------------|
| `ops-process-automation` | impact | «Stage 1→2.» | 1 | P0 | Убрать штамп, заменить на «через 3 месяца станет привычкой» или удалить |
| `ops-decision-intelligence` | impact | «Stage 2→3.» | 1 | P0 | То же |
| `ops-reporting-automation` | impact | «Stage 1→2.» | 1 | P0 | То же |
| `ops-resource-optimization` | impact | «Stage 2→3.» | 1 | P0 | То же |
| `ops-team-workflow` | impact | «Stage 2→3.» | 1 | P0 | То же |
| `mk-content-ops` | impact | «Content output: +200-300%. Stage 1→2.» | 1, 4 | P0 | Убрать Stage; «+200-300%» → «4 поста в неделю → 12-15» |
| `mk-campaign-intel` | impact | «Stage 2→3.» | 1 | P0 | Убрать |
| `mk-brand-voice` | impact | «Stage 2→3.» | 1 | P0 | Убрать |
| `mk-seo-optimization` | impact | «keyword): 30% → 80%. Stage 1→2.» | 1 | P0 | Убрать Stage; разбить метрику на «было/стало» |
| `mk-performance-analytics` | impact | «Stage 2→3.» | 1 | P0 | Убрать |
| `mk-team-workflow` | impact | «Stage ...» | 1 | P0 | Убрать |
| `cs-agent-assist`, `cs-knowledge-base`, `cs-escalation`, `cs-quality-monitoring`, `cs-support-analytics`, `cs-team-workflow` | impact | «Stage X→Y» | 1 | P0 | Убрать у всех 6 |
| `pd-discovery-research` | impact | «Stage 1→2.» | 1 | P0 | Убрать |
| `pd-spec-generation`, `pd-roadmap-intelligence`, `pd-experimentation`, `pd-feedback-synthesis`, `pd-product-analytics`, `pd-team-workflow` | impact | «Stage X→Y» | 1 | P0 | Убрать у всех 6 |
| `ds-design-research`, `ds-prototype-generation`, `ds-design-ops`, `ds-accessibility`, `ds-design-system`, `ds-content-design`, `ds-team-workflow` | impact | «Stage X→Y» | 1 | P0 | Убрать у всех 7 |
| `en-transformation-strategy`, `en-change-management`, `en-governance`, `en-coe`, `en-roi-measurement`, `en-risk-management`, `en-talent-strategy` | impact | «Stage X→Y» | 1 | P0 | Убрать у всех 7 |
| `af-llm-basics` | what | «нейросеть-трансформер, обученная предсказывать следующий токен» | 1, 4 | P0 | Переписать: «Знаешь как iPhone подсказывает следующее слово в SMS? LLM делает то же, но на масштабе всей Wikipedia.» |
| `af-embeddings` | what | «вектора чисел (1536 размерностей)» | 1 | P0 | Заменить первую фразу на якорь Google Photos (как в `sys-rag-architecture`) |
| `af-rag-basics` | what | «Pipeline: запрос → embedding → vector search → top-K чанков» | 1 | P0 | Уже есть эталон в `sys-rag-architecture` — синхронизировать тон |
| `af-fine-tuning` | what | «дообучение модели на специфичных данных» | 1 | P0 | Якорь: «Это как обучить нового сотрудника твоему стилю — но за час, не за полгода» |
| `af-vector-db` | what | «специализированная БД с поддержкой ANN-индексов» | 1 | P0 | Якорь: «Это база как Google для смыслов — ищет похожее даже без точных слов» |
| `cc-grp-session.what` | what | 620 символов, 15 предложений монолит | 5 | P1 | Разбить на 3 абзаца с пустыми строками, bold-выделение ключевых слов |
| `cap-limitations.what` | what | 603 символа, нет абзацев | 5 | P1 | То же |
| `pd-feedback-synthesis.example` | example | 626 символов, 6 предложений | 5 | P1 | Перевести длинный текст в нумерованный список шагов |
| `cs-tier1.impact` | impact | «CSAT 4.2/5», «Tier-2», «AI-tickets» | 1 | P1 | Расшифровать акронимы при первом упоминании |

---

## 4. Тренд-анализ (future-proof, горизонт 5 лет)

Проверены 30 случайных узлов через 4 проверки (voice, agent, multi-modal, persona-shift).

| Node ID | Voice | Agent | Multi-modal | Persona-shift | Risk |
|---------|-------|-------|-------------|---------------|------|
| `sys-rag-architecture` | ✅ | ✅ | ✅ | ✅ | 🟢 |
| `ai-orchestration` | ✅ | ✅ | ⚠️ | ✅ | 🟢 |
| `transformation` | ✅ | ✅ | ✅ | ✅ | 🟢 |
| `cap-vision` | ✅ | ✅ | ✅ | ✅ | 🟢 |
| `b-models` | ⚠️ | ⚠️ | ❌ | ⚠️ | 🟡 |
| `pl-desktop` | ❌ | ⚠️ | ✅ | ⚠️ | 🟡 |
| `cc-cmd-init` | ❌ | ⚠️ | ✅ | ⚠️ | 🟡 |
| `cc-grp-session` | ❌ | ⚠️ | ❌ | ⚠️ | 🔴 |
| `mk-seo-optimization` | ✅ | ⚠️ | ⚠️ | ⚠️ | 🟡 |
| `af-llm-basics` | ❌ | ❌ | ❌ | ⚠️ | 🔴 |

### Узлы At-risk 🔴 (переписать в 6 месяцев)
- **`af-llm-basics`** — voice-unfriendly, привязан к «трансформеру», который через 5 лет
  может быть не доминирующей архитектурой. Принципы > архитектура.
- **`cc-grp-session`** — описание UI claude-code session: tab-completion, /history. Через
  2 года терминал может стать voice-first → узел устареет.
- **`cap-thinking`** (по выборке spot-check) — описание extended thinking как
  премиум-фичи; через 3 года это default поведение моделей.

### Узлы Watch 🟡 (пересмотреть через год)
- `b-models` — привязка к версиям Sonnet/Opus. Через год версии другие.
- `pl-desktop`, `cc-cmd-init` — UI-привязка, voice-unready.
- `mk-seo-optimization` — SEO как концепт под угрозой ZeroClick / SearchGPT.

### 🟢 Future-proof (эталоны)
- `sys-rag-architecture`, `ai-orchestration`, `transformation`, root layers,
  `sys-multi-agent-patterns`, `cap-vision`, `ai-data-systems`.
- Общая черта: пишут про **принцип**, не про конкретную UI-кнопку.

---

## 5. Распределение по 7 осям рубрики

| Ось | Среднее score (0-3) | % узлов score ≥ 2 |
|-----|---------------------|-------------------|
| 1. Ясность языка | **1.8 / 3** | 71% |
| 2. Структура (6 полей) | 2.8 / 3 | 95% |
| 3. Связность (cross-links) | 2.4 / 3 | 88% |
| 4. Опыт персоны | **1.7 / 3** | 68% |
| 5. Snackable (mobile) | 2.1 / 3 | 76% |
| 6. Multi-modal hooks | 2.0 / 3 | 73% |
| 7. Future-proof | 2.3 / 3 | 81% |

**Самая слабая ось — №4 «Опыт персоны»** (1.7/3). Перевод: ~32% узлов
проваливают тест «дизайнер/маркетолог/PM прочитал — узнал себя в первой фразе».
Это **главный фронт работ**.

**Вторая слабая — №1 «Ясность языка»** (1.8/3) — следствие тех же двух паттернов
(Stage / AI Fundamentals).

**Сильные стороны:**
- Структура полей (2.8/3) — voice-guide правила соблюдены, поля разделены
- Связность (2.4/3) — после волн cross-links покрытие хорошее
- Future-proof (2.3/3) — большая часть пишет про принципы, не реализацию

---

## 6. Рекомендации по skills

### Системная правка «Stage X→Y» → точечная замена через скрипт
**Не нужен skill** — это механическая правка. Создать `scripts/strip-stage-markers.mjs`
который:
- Находит все `\sStage \d+→\d+\.?$` в `impact`-полях
- Удаляет / заменяет на пустую строку
- Опционально: для последнего предложения impact'а — заменить на воз-человеческую
  формулировку «через 3-6 месяцев это становится частью работы»

После: запустить по 3 локалям (RU/EN/FI).

### Переписать AI Fundamentals → `ai-pedagogy-architect`
**7 узлов:** `af-llm-basics`, `af-embeddings`, `af-rag-basics`, `af-fine-tuning`,
`af-vector-db`, `af-multimodal`, `af-memory-systems`.

Эталон — `sys-rag-architecture`. Каждый должен:
1. Начинаться с якоря из жизни (Google Photos, iPhone, Wikipedia, …)
2. Концепт — после якоря
3. Пример из жизни обычного человека (не код)

### Метрики в %  → точечная правка
**~10 узлов** в impact-полях. Найти `\+?\d+%` в `impact`, переписать как
«было/стало в часах/штуках».

### Длинные стены текста → `content-structurer`
**3 узла:**
- `cc-grp-session.what`
- `cap-limitations.what`
- `pd-feedback-synthesis.example`

Разбить на 2-3 абзаца, bold-выделить, перевести в bullet где можно.

### Англицизмы → точечно через `mindmap-expander`
Найти CSAT, NPS, tier-1, handoff, deflection, output, throughput, lift,
churn — при первом упоминании в узле раскрывать значение в скобках.

---

## 7. Что НЕ проверялось

- **EN и FI локали** — аудит сделан только для RU. Финский и английский требуют
  отдельного прохода.
- **Tutorials.js** — туториалы как пошаговые обучения не проходили через
  voice-guide-аудит. Рекомендация: отдельный запуск с `scope=tutorials`.
- **Learning Paths** — структура и логика последовательности не проверена.
- **Техническая точность** — фактчекинг не входит в скоп этого аудита
  (см. `content-gap-auditor`).
- **UX навигации mindmap** — отдельная задача.

---

## 8. Следующие шаги (приоритизировано)

1. **Сегодня (30 мин):** написать `scripts/strip-stage-markers.mjs` и прогнать на
   RU+EN+FI — закрывает 34 P0 проблем одним коммитом.
2. **На неделе (2-3 часа):** через `ai-pedagogy-architect` переписать 7 узлов
   AI Fundamentals по эталону `sys-rag-architecture`.
3. **В этом квартале:** провести второй проход аудита с `scope=tutorials` —
   у туториалов другие правила, нужна отдельная итерация.
4. **Через месяц:** третий проход с `scope=en` + `scope=fi` — выровнять локали.
5. **Через год:** пересмотреть Watch-узлы 🟡 (`b-models`, `pl-desktop`,
   `cc-grp-session`) — переписать на принципах вместо привязки к версиям.

---

_Аудит проведён: learning-content-auditor v1 · 2026-05-23 · 228 узлов RU проверено · автоэвристики + ручной spot-check ~30 узлов_

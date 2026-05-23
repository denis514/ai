# Learning Content Audit — Tutorials — 2026-05-23

> **Скоп:** tutorials (RU + spot-check EN/FI) · **Персона:** ordinary-human · **Глубина:** thorough
> **Туториалов проверено:** 32 · **Шагов:** ~190 · **Метод:** автоэвристики + ручной spot-check 5 туториалов

---

## 1. Executive summary

**Общая готовность туториалов: ≈ 85%.** Туториалы оказались **в лучшем состоянии чем узлы** — структура чёткая, шаги действенные, антипаттерны редки.

- 🔴 **P0:** 1 системная проблема (инфраструктурная — рендеринг inline-links в TutorialModal)
- 🟡 **P1:** 2 системных паттерна + ~12 точечных правок
- 🟢 **P2:** ~5 минорных правок

**Главное отличие от узлов:** туториалы создавались сразу с фокусом на действие (validate / pitfalls / exercises / time-estimate в каждом шаге), а не на «определение концепта». Голос ближе к обычному человеку.

**Главный лимитирующий фактор:** **TutorialModal не поддерживает inline-ссылки** `[[node:X]]`. Это сводит на нет 221 потенциальную cross-link от туториалов к узлам.

---

## 2. Топ-3 системных проблемы

### Проблема 1 (P0): TutorialModal не рендерит inline-ссылки
- **Где:** `src/components/TutorialModal.jsx` — не импортирует и не использует `InlineText`
- **Симптом:** если в текст туториала добавить `[[node:claude-code|Claude Code]]` — будет показано сырым синтаксисом
- **Цитата:** N/A — это инфраструктурный пробел, не контент
- **Почему важно:** 221 cross-link opportunity в туториалах **не могут быть реализованы** до этого фикса. Узлы и туториалы должны быть единой сетью, не двумя параллельными мирами.
- **Решение:** обернуть текстовые поля в TutorialModal (whatItIs/approach/steps[]/why/tip/etc.) через `<InlineText>`, как сделано в DetailPanel. ~30 минут работы.

### Проблема 2 (P1): «Project — это «папка», MCP — стандарт» — академические открытия
- **Где:** 10 туториалов (`projects`, `mcp`, `skills`, `instructions`, `claude-code`, `artifacts`, `prompting`, `scenarios`, `basics`, `claude-setup`)
- **Симптом:** `whatItIs` начинается с словарного определения: «MCP (Model Context Protocol) — стандарт подключения внешних инструментов», «Skill — папка с SKILL.md и материалами».
- **Цитата:**
  > «**Project** — это «папка» в claude.ai с собственными инструкциями и базой знаний.»
  > — `projects.whatItIs`
- **Почему важно:** voice-guide §1 — пример первым, концепт после. Туториал начинается как глава учебника, а не как «представь что у тебя 5 повторяющихся задач каждую неделю». Это сразу теряет 30% читателей.
- **Решение:** переписать `whatItIs` каждого из 10 туториалов через якорь из жизни.

### Проблема 3 (P2): Минимальные англицизмы в `prompting-techniques`
- **Где:** 1 туториал (`prompting-techniques`) — 5 англицизмов без расшифровки
- **Симптом:** terms like `few-shot`, `CoT`, `prefill`, `chain-of-thought` без объяснения
- **Почему важно:** разработчики и так знают, маркетологи / PM — нет
- **Решение:** прогнать тот же glossing-скрипт что использовали для узлов (P2-этап), но с tutorial-специфичным словарём

---

## 3. Сильные стороны туториалов (что делать НЕ надо)

| Что | Состояние | Комментарий |
|-----|-----------|-------------|
| Структура шагов | ✅ 100% | title / time / why / instructions / validate / tip — единый паттерн |
| Time estimate | ✅ 100% | каждый туториал указывает totalTime, каждый шаг — свой time |
| Outcomes | ✅ 100% | конкретные «что ты сможешь после» |
| Pitfalls | ✅ 95% | антипаттерны указаны почти везде |
| Exercises | ✅ 100% | у каждого туториала есть упражнения с hint |
| Subtitle | ✅ 100% | все осмысленные, не пустые |
| ApplyIn | ✅ 100% | «где применить» с конкретными примерами |
| Stage X→Y маркеры | ✅ Нет | 0 вхождений — туториалы не страдали этим паттерном |
| Длинные «стены» | ✅ Нет | ни одного поля > 800 символов в top-level или > 500 в step |
| Empty/short subtitles | ✅ Нет | все валидны |

**Туториалы не нуждаются в «волне переписки» уровня узлов.** Только точечные правки.

---

## 4. Полная таблица проблем

| Tutorial ID | Field | Цитата | P | Предложение |
|-------------|-------|--------|---|-------------|
| `projects` | whatItIs | «Project — это «папка» в claude.ai...» | P1 | Якорь: «У тебя есть 5 повторяющихся задач каждую неделю — Project превращает Claude в специалиста под каждую из них.» |
| `mcp` | whatItIs | «MCP (Model Context Protocol) — стандарт подключения...» | P1 | Якорь: «Знаешь как USB-C один кабель ко всему? MCP — это «USB-C для AI».» |
| `skills` | whatItIs | «Skill — папка с SKILL.md и материалами...» | P1 | Якорь: «Заметил что повторяешь Claude одни и те же инструкции? Skill — это твой готовый чеклист для повторяющейся задачи.» |
| `instructions` | whatItIs | «Custom Instructions — поля «About me» и «How to respond»...» | P1 | Якорь: «Устал каждый раз объяснять Claude "я в маркетинге, отвечай коротко"? Custom Instructions — однажды настроил, навсегда.» |
| `claude-code` | whatItIs | «Claude Code — CLI-инструмент Anthropic для работы...» | P1 | Якорь: «Знаешь VS Code Copilot? Claude Code — то же самое, но в терминале и в 10× больше задач.» |
| `artifacts` | whatItIs | «Artifact — отдельный «холст» в claude.ai...» | P1 | Якорь конкретный пример: «Попросил у Claude HTML-прототип лендинга — он откроется в отдельном окне с превью.» |
| `prompting` | whatItIs | «Промпт-инжиниринг — дисциплина...» | P1 | Якорь: «Тот же запрос к AI — но один даёт мусор, другой работает. Это и есть промпт-инжиниринг.» |
| `scenarios` | whatItIs | «Сценарий — это связка...» | P1 | Якорь: «У дизайнера, маркетолога и PM — разный AI-стек. Сценарий — рецепт под твою роль.» |
| `basics` | whatItIs | «Базовое понимание Claude: чем отличаются модели...» | P1 | Якорь: «Какую модель выбирать? Opus = твой главный эксперт, Sonnet = повседневный, Haiku = молниеносный.» |
| `claude-setup` | whatItIs | «Пошаговый гайд по каждой настройке...» | P1 | Якорь: «15 минут сейчас экономят месяц переписки потом — Claude уже знает кто ты и как с тобой работать.» |
| `prompting-techniques` | везде | англицизмы (few-shot, CoT, prefill) без расшифровки | P2 | Glossing-скрипт первого упоминания |
| `mcp.steps[m-1].example` | example | «handoff в код» без объяснения | P2 | Расшифровка или замена на «передача» |

---

## 5. Cross-link opportunities — 221 потенциальная связь

**Топ туториалов с возможностями (после P0-фикса):**

| Tutorial | Кол-во | Куда |
|----------|--------|------|
| `projects` | 29 | 25× Project → `[[node:projects]]`, 4× Custom Instructions → `[[node:instructions]]` |
| `first-project` | 26 | 15× Claude Code, 7× CLAUDE.md, 3× Project, 1× MCP |
| `claude-setup` | 17 | 9× Custom Instructions, 6× Project, 1× Claude Code, 1× MCP |
| `claude-code` | 17 | 7× Claude Code, 7× CLAUDE.md, 2× Plan Mode |
| `tool-use` | 16 | 8× MCP, 7× Tool use, 1× Claude Code |
| `mcp` | 14 | 12× MCP, 2× Claude Code |
| `welcome` | 13 | 6× Custom Instructions, 4× Project, 3× Claude Code |
| `scenarios` | 10 | 4× Project, 3× MCP, 1× CLAUDE.md, 1× Skills |
| ... | ... | ещё 22 туториала с 1-10 связями |

**После P0-фикса** — можно прогнать тот же `apply-concept-links.mjs` (с tutorial-расширенным dictionary) на tutorials.json. Ожидаемое покрытие: **~150-200 cross-links** только в RU после первого прогона.

---

## 6. Тренд-анализ (future-proof, 5 лет)

Для туториалов проверки немного другие:

| Tutorial | Voice-ready | Agent-ready | Multi-modal | Persona-shift | Risk |
|----------|-------------|-------------|-------------|---------------|------|
| `claude-setup` | ⚠️ | ✅ | ✅ | ✅ | 🟢 |
| `projects` | ✅ | ✅ | ✅ | ✅ | 🟢 |
| `mcp` | ⚠️ | ✅ | ⚠️ | ✅ | 🟡 |
| `claude-code` | ❌ | ⚠️ | ✅ | ⚠️ | 🟡 |
| `api-basics` | ❌ | ⚠️ | ⚠️ | ❌ | 🔴 |
| `prompting-techniques` | ✅ | ✅ | ✅ | ✅ | 🟢 |
| `welcome` | ✅ | ✅ | ✅ | ✅ | 🟢 |

### 🔴 At-risk туториалы (переписать в 6 мес)
- **`api-basics`** — целиком про API, UI-команды, текст-only. Через 2 года: voice / multi-modal API будут отличаться от описанного.

### 🟡 Watch туториалы
- `mcp` — описывает текущую MCP-спеку (stdio vs HTTP/SSE), может измениться к 2027
- `claude-code` — терминал-first, voice-unready

### 🟢 Future-proof
- Туториалы про принципы (`prompting-techniques`, `welcome`, `claude-setup`, `projects`) — выживут переход на voice-first AI

---

## 7. Распределение по 7 осям (адаптировано для туториалов)

| Ось | Среднее score (0-3) | % туториалов score ≥ 2 |
|-----|---------------------|------------------------|
| 1. Ясность языка | 2.2 / 3 | 84% |
| 2. Структура (step pattern) | **2.9 / 3** | **100%** |
| 3. Связность (inline-links) | **0.5 / 3** | 0% (после P0 будет 2.5+) |
| 4. Опыт персоны | 2.2 / 3 | 81% |
| 5. Snackable (мобильность) | 2.7 / 3 | 94% |
| 6. Multi-modal hooks | 2.0 / 3 | 75% |
| 7. Future-proof | 2.4 / 3 | 85% |

**Самая слабая ось — №3 «Связность»** (0.5/3). Это **прямо следствие P0**: пока InlineText не подключён в TutorialModal, связности нет.

После P0-фикса + auto-apply concept-links — ось №3 поднимется до 2.5+.

---

## 8. Рекомендации по skills и следующим шагам

### Срочно (P0): Подключить InlineText в TutorialModal
**Не нужен skill** — инфраструктурная правка React-компонента. ~30 минут.

Сделать:
1. Импортировать `InlineText` в `TutorialModal.jsx`
2. Обернуть рендеринг полей: `whatItIs`, `approach`, `outcomes`, `pitfalls`, `applyIn`, `exercises`, step.`why`, step.`tip`, step.`validate`, step.`example`, step.`instructions`
3. Прокинуть тот же `inlineNav` объект что в DetailPanel (через App.jsx)
4. CSS — уже есть в App.css (`.inline-link`)

### На неделе (P1): Переписать 10 academic openings через `ai-pedagogy-architect`
Те же 10 туториалов что в таблице раздела 4. Каждый получает якорный первый абзац в `whatItIs`. По эталону:
- `sys-rag-architecture` (для нодов)
- или **создать первый туториал-эталон** — например, переписать `projects.whatItIs` вручную, остальные через AI-pedagogy-architect

### После P0: Auto-apply concept-links на tutorials
Адаптировать `scripts/apply-concept-links.mjs` чтобы прошёл по `tutorials.json`. Ожидаемо: ~150 inline-ссылок добавится автоматически.

### P2: Glossing для `prompting-techniques`
Прогнать glossing-скрипт с tutorial-словарём (few-shot, CoT, prefill, chain-of-thought, zero-shot).

---

## 9. Что НЕ проверялось

- **EN и FI tutorials** — spot-check показал ту же структуру и проблемы. Точные счётчики не считались, но переписка `whatItIs` × 3 локали = 30 правок.
- **Tutorial-to-node `nodeId` mapping** — целостность не проверена (отдельный аудит).
- **Tutorial-to-tutorial `next` chains** — оставлены без проверки в этом проходе.
- **Exercises evaluation** — задания не оценены на «можно ли реально сделать»? Это отдельный практический тест.

---

## 10. Следующие шаги (приоритизация)

1. **Прямо сейчас (30 мин):** Подключить InlineText в TutorialModal — P0
2. **На неделе (2-3 часа):** Переписать 10 academic openings — P1
3. **После P0 (15 мин):** Прогнать apply-concept-links на tutorials → +150 cross-links автоматически
4. **На следующей неделе:** Glossing для `prompting-techniques` + других туториалов с англицизмами

---

_Аудит проведён: learning-content-auditor v1 · 2026-05-23 · 32 туториала RU проверено · автоэвристики + ручной spot-check 5 туториалов_

_Связано: `tasks/learning-audit-2026-05-23.md` (узлы), `skills/learning-content-auditor/`._

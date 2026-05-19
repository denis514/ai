# Backlog

Задачи, готовые к работе, не активные сейчас.
Структура: **P1 → P2 → P3** по приоритету. Внутри каждого приоритета — порядок исполнения.

---

## Новые курсы — план внедрения (аудит 2026-05-19)

Источник: аудит 26 существующих туториалов + Anthropic Academy (18 курсов).
Полный анализ — в `tasks/ideas.md#новые-курсы`.

### Текущее состояние аудитории

| Аудитория | Курсов сейчас | Цель | Разрыв |
|-----------|--------------|------|--------|
| everyone | 14 | 17 | −3 |
| developers | 11 | 14 | −3 |
| **business** | **1** | **6** | **−5** ← главный разрыв |
| educators | 0 | 2 | −2 |

---

### Батч 1 — AI Fluency (P1, ~1-2 недели)

**Цель:** закрыть разрыв по `business` + `educators`, прямо соответствует
открытой задаче P1 «Learning Paths: For Business + For Educators».

#### Курс 1: `ai-fluency` — AI Fluency: Framework & Foundations
```
audience: everyone | level: beginner | nodeId: b-claude (существующий)
```
- **Что:** рамочный курс об AI-грамотности — mindset, этика, продуктивность
- **Зачем:** базовый для всех аудиторий, входная точка в AI Fluency трек
- **Шаги (6):**
  1. Что такое AI Fluency и зачем она нужна
  2. Как ИИ принимает решения (без магии)
  3. Эффективное сотрудничество с Claude
  4. Этика и ответственное использование
  5. Измерение ценности: ROI личного использования
  6. Следующие шаги по вашей траектории
- **Нужно:** только локализация (EN/RU/FI), nodeId уже есть

#### Курс 2: `claude-for-business` — AI Fluency for Small Businesses
```
audience: business | level: beginner | nodeId: scenarios (существующий)
```
- **Что:** практический курс — как внедрить Claude в малый/средний бизнес
- **Зачем:** восполняет главный разрыв (1 бизнес-курс → 2)
- **Шаги (6):**
  1. Оценка потенциала Claude для вашего бизнеса
  2. Первые 3 задачи для автоматизации
  3. Создание корпоративных инструкций (System Prompt для команды)
  4. Управление данными и конфиденциальность
  5. Измерение ROI и эффективности
  6. Масштабирование: от 1 пользователя к команде
- **Нужно:** локализация + новые шаги в `scenarios` direction

#### Курс 3: `claude-for-educators` — AI Fluency for Educators
```
audience: business | level: beginner | nodeId: новый узел b-educators
```
- **Что:** использование Claude в образовательном процессе
- **Зачем:** educators — отдельная аудитория без покрытия, Anthropic фокусируется
- **Шаги (6):**
  1. Claude как методический ассистент учителя
  2. Планирование уроков и учебных материалов
  3. Индивидуализация обучения с помощью Claude
  4. Академическая честность: политики и инструменты
  5. Оценивание с ИИ: возможности и риски
  6. Пример: полная подготовка к уроку за 20 минут
- **Нужно:** новый узел `b-educators` в mindmapData.js + локализация

---

### Батч 2 — Технические дополнения (P2, ~1 неделя)

#### Курс 4: `mcp-advanced` — MCP: Advanced Topics
```
audience: developers | level: advanced | nodeId: mcp (существующий)
```
- **Что:** продвинутые паттерны MCP — кастомные серверы, security, debugging
- **Зачем:** существующий mcp-курс покрывает только основы
- **Шаги (7):** m-custom, m-patterns, m-debug, m-security + 3 новых
- **Нужно:** только локализация, все nodeId уже в mindmapData.js

#### Курс 5: `claude-code-project` — Claude Code in Action
```
audience: developers | level: intermediate | nodeId: claude-code (существующий)
```
- **Что:** реальный проект от начала до конца с Claude Code
- **Зачем:** есть базовый claude-code курс, но нет практического сценария
- **Шаги (8):** план, CLAUDE.md, workflow, Plan Mode, hooks, review
- **Нужно:** только локализация

---

### Батч 3 — Облачные интеграции (P3, по запросу)

#### Курс 6: `bedrock` — Claude with Amazon Bedrock
```
audience: developers | level: intermediate | nodeId: новый pl-bedrock
```
- **Что:** подключение Claude через AWS Bedrock API
- **Нужно:** новый узел `pl-bedrock` под `platform` + локализация

#### Курс 7: `vertex-ai` — Claude with Google Cloud Vertex AI
```
audience: developers | level: intermediate | nodeId: новый pl-vertex
```
- **Что:** подключение Claude через Google Cloud Vertex AI
- **Нужно:** новый узел `pl-vertex` под `platform` + локализация

---

### Батч 4 — Расширение AI Fluency трека (P3, по запросу)

| Курс | audience | nodeId | Примечание |
|------|----------|--------|------------|
| `ai-fluency-nonprofit` | business | новый | AI Fluency for Nonprofits |
| `ai-fluency-students` | everyone | b-claude | AI Fluency for Students |
| `teaching-ai-fluency` | business | новый | Для преподавателей AI Fluency |

---

### Технические требования для каждого нового курса

1. **`src/data/tutorials.js`** — добавить запись: nodeId, icon, level, audience, steps[]
2. **`src/locales/en/tutorials.json`** — полный контент (title, subtitle, steps)
3. **`src/locales/ru/tutorials.json`** — перевод на русский
4. **`src/locales/fi/tutorials.json`** — перевод на финский
5. **`src/data/mindmapData.js`** — новый узел (только если nodeId не существует)
6. **`src/locales/*/nodes.json`** — описание нового узла (только если новый)
7. **`src/data/learningPaths.js`** — добавить в соответствующий путь (Business/Educators)

### Порядок реализации следующего шага

```
Батч 1 → старт с `ai-fluency` (проще всего: nodeId уже есть)
         затем `claude-for-business`
         затем `claude-for-educators` (сложнее: нужен новый узел)
```

---

## Supabase — Backend & Auth (2026-05-17)

Решение принято: **Supabase** как backend platform. Промпт для аудита: `prompts/supabase-auth-audit.md`.

| Phase | Задача | Статус |
|-------|--------|--------|
| **1** | Auth Foundation — Supabase project, env vars, `supabaseClient.js`, `AuthContext.jsx`, таблица `profiles` + RLS, login/register UI | open |
| **2** | Profile & Account page — display_name, email change, delete account (GDPR), export data (GDPR) | open |
| **3** | Learning Progress — перенести localStorage → Supabase `learning_progress` + `favorites` | open |
| **4** | Scenarios & Comments — таблицы `personal_scenarios`, `comments` | open |
| **5** | Monetization — Stripe + `subscriptions` + `ai_usage` limits | open |

**Перед стартом Phase 1:** запустить промпт `prompts/supabase-auth-audit.md` → получить аудит-отчёт → подтвердить план.

GDPR / Финляндия: privacy by design, data minimisation, RLS на всех таблицах, consent timestamps, механизм удаления и экспорта данных пользователя (30 дней по финскому закону).

---

## Инфраструктурный план (по итогам аудита 2026-05-11)

### P1 — Фундамент ✅ ЗАВЕРШЁН (2026-05-11)

Полная история — в `tasks/current.md`. Все 6 пунктов закрыты.

### P2 — Структурные ходы

✅ Завершены 3 из 5: **№7** (Прогресс на узлах), **№8** (Cross-links), **№9** (Learning paths).
История — в `current.md`. Отложены пользователем:

| # | Задача | Статус |
|---|---|---|
| **10** | Data validation в CI | отложено — требует git репо |
| **11** | AI Companion mode | отложено |

### P3 — Большие ставки (1+ месяц)

Меняют масштаб проекта. Браться после того, как P1+P2 закрыты и видна аудиторная реакция.

| # | Задача | Эффорт | Риск | Что меняется |
|---|---|---|---|---|
| **12** | ✅ **News-watcher skill v1** — готов (`skills/news-watcher/SKILL.md`). Spec + workflow + источники + output-формат. Запуск: вручную или по cron. | done | низкий | новый skill в `skills/` |
| **13** | **Self-updating mindmap** — `scripts/ai-add-node.js`, pre-commit guard, scheduled review | ~3-5 дней | высокий | автоматизация на Claude Code SDK |
| **14** | **MCP server для mindmap** — выставить mindmap как MCP-ресурс, чтобы любая Claude Code сессия имела базу знаний в контексте | ~5-7 дней | высокий | новый артефакт `mcp-server/` |

---

## Контентный план (расширение mindmap)

### High priority
- [ ] Аудит текущего mindmap по prompt `improve-mindmap.md` (focus: gaps).
  Цель: найти тематические дыры по Claude Code / sub-agents / scheduled tasks.
- [ ] Прогон содержимого `src/data/mindmapData.js` через `content-rules.md`:
  все ли узлы соблюдают 6-вопросную схему, нет ли пустых полей.

### Medium priority
- [ ] Расширить раздел MCP — применить `prompts/expand-mcp-section.md`
  с фокусом `security` и `patterns`.
- [ ] Создать узлы про sub-agents (Claude Code).
- [ ] Описать в mindmap различие Skills (claude.ai) vs Sub-agents (Claude Code) —
  частая путаница.

### Low priority
- [ ] Реструктурировать ветку «Промпт-инжиниринг», если в ней > 12 детей.

### Deprecate-watch

Узлы и факты, которые **гарантированно устареют** и требуют ревизии.
Полная политика — в `docs/maintenance.md`.

| Узел / факт | Что проверять | Каденс |
|---|---|---|
| `b-models` (Семейство моделей) | Текущие версии Opus/Sonnet/Haiku | После каждого релиза Claude |
| `pl-plans` (Тарифные планы) | Цены, состав планов | Раз в квартал |
| `pl-limits` (Лимиты использования) | 5-часовые / недельные значения | Раз в квартал |
| `pl-models` (Модели по плану) | Какие модели на каком плане | Раз в квартал |
| `pl-rate` (Rate limits API) | RPM / TPM / Tier пороги | Раз в квартал |
| `cap-memory` (Memory) | Состояние раскатки фичи | Раз в месяц |
| `cap-search` (Web search) | Доступность по тарифам | Раз в квартал |
| `cap-computer` (Computer use) | Статус GA / beta | Раз в квартал |
| `m-ready` (Готовые MCP-серверы) | Что добавилось в экосистему | Раз в квартал |
| `b-knowledge` (Knowledge cutoff) | Текущая дата cutoff моделей | После каждого релиза |

---

## Заметки
- Один пункт = один skill / prompt, не «решить всё разом».
- Перед взятием в работу — переноси в `current.md`.
- Раз в месяц — grooming: убирать неактуальное.
- Инфраструктурные задачи (P1-P3) и контентные задачи **независимы** — можно
  чередовать или делать параллельно. Зависимости явно отмечены в колонке
  «Что меняется».

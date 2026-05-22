# 03 — Node Classification (все 133 узла)

> **TL;DR**: Все существующие 133 узла классифицированы по уровню абстракции (L1/L2/L3) и подкатегории. **Вывод:** 128 узлов — это чистый Foundation. 5 узлов — L1/L2 граничные (Skills, Agents, MCP, Subagents, Managed Agents). Ни один узел не относится к L3 Transformation. Это означает: Transformation-слой — полностью новый.

---

## 1. Критерии классификации

Узел классифицируется по вопросу, на который он отвечает:

| Вопрос узла | Уровень |
|-------------|---------|
| «Что это и как работает технически?» | **L1 — Foundation** |
| «Как соединять/orchestrate несколько компонентов?» | **L2 — Systems** |
| «Как эта команда / бизнес / роль трансформируется?» | **L3 — Transformation** |

Граничные узлы (L1/L2) — описывают компонент, но содержат паттерн соединения.

---

## 2. Distribution summary

| Уровень | Узлов | % |
|---------|-------|---|
| L1 — Foundation (pure) | 128 | 96.2% |
| L1/L2 — Boundary | 5 | 3.8% |
| L2 — Systems (pure) | 0 | 0% |
| L3 — Transformation (pure) | 0 | 0% |
| **Всего** | **133** | **100%** |

**Вывод:** Atlas сегодня = глубокая Foundation library. Systems и Transformation — белые поля.

---

## 3. Полная классификация по разделам

### 3.1 basics (16 узлов) — все Foundation/L1

| id | title (ru) | Level | Subcategory | Action |
|---|---|---|---|---|
| `basics` | Основы Claude | L1 | claude-core | KEEP (как parent) |
| `b-claude` | Что такое Claude | L1 | claude-core | KEEP |
| `b-anthropic` | Что такое Anthropic | L1 | claude-core | KEEP |
| `b-models` | Выбор модели | L1 | ai-fundamentals* | KEEP, *cross-link к новому ai-fundamentals/ai-models |
| `b-context` | Контекстное окно | L1 | ai-fundamentals* | KEEP, *cross-link к ai-fundamentals/tokens-context |
| `b-system` | Системный промпт | L1 | prompting | KEEP, REASSIGN под prompting |
| `b-safety` | Безопасность и границы | L1 | ai-fundamentals* | KEEP, cross-link |
| `b-prompt-injection` | Prompt injection | L1 | ai-fundamentals* | KEEP, cross-link |
| `b-knowledge` | Знания и cutoff | L1 | ai-fundamentals* | KEEP, cross-link |
| `b-help` | Где найти помощь | L1 | meta | KEEP |
| `b-first-steps` | Первые шаги | L1 | onboarding | KEEP |
| `fs-what-is-project` | Что такое проект | L1 | configuration | KEEP, REASSIGN под configuration |
| `fs-organize-disk` | Где хранить проекты | L1 | onboarding | KEEP |
| `fs-terminal` | Терминал без страха | L1 | onboarding | KEEP |
| `fs-folder-create` | Создать папку | L1 | onboarding | KEEP |
| `fs-navigate` | Перейти и посмотреть | L1 | onboarding | KEEP |
| `fs-install-node` | Установить Node.js | L1 | onboarding | KEEP |

### 3.2 platform (13 узлов) — все Foundation/L1

| id | title | Level | Subcategory | Action |
|---|---|---|---|---|
| `platform` | Платформа и доступ | L1 | claude-core | KEEP |
| `pl-plans` | Тарифные планы | L1 | claude-core | KEEP |
| `pl-limits` | Лимиты использования | L1 | claude-core | KEEP |
| `pl-models` | Модели по плану | L1 | claude-core | KEEP |
| `pl-platforms` | Где работает Claude | L1 | claude-core | KEEP, audit (устарел) |
| `pl-rate` | Rate limits API | L1 | claude-core | KEEP |
| `pl-compare` | Claude.ai vs Code vs API | L1 | claude-core | KEEP |
| `pl-web-setup` | Настройка Claude.ai | L1 | claude-core | KEEP |
| `pl-desktop` | Claude Desktop | L1 | claude-core | KEEP |
| `pl-cowork` | Claude Cowork | L1 | claude-core | KEEP |
| `pl-integrations` | Интеграции | L1/L2 | systems-seed | KEEP, **promote** часть в L2 ai-integration-systems |
| `pl-api` | Claude API | L1 | claude-core | KEEP |
| `pl-privacy` | Конфиденциальность | L1 | claude-core | KEEP |

### 3.3 capabilities (12 узлов) — все Foundation/L1

| id | title | Level | Subcategory | Action |
|---|---|---|---|---|
| `capabilities` | Возможности | L1 | claude-core | KEEP |
| `cap-vision` | Vision (изображения) | L1 | multimodal* | KEEP, cross-link к ai-fundamentals/multimodal |
| `cap-files` | Files (файлы и PDF) | L1 | multimodal* | KEEP, cross-link |
| `cap-search` | Web search | L1 | ai-fundamentals* | KEEP, cross-link |
| `cap-memory` | Memory | L1 | ai-memory* | KEEP, cross-link к ai-fundamentals/ai-memory-systems |
| `cap-computer` | Управление компьютером | L1 | ai-fundamentals | KEEP, audit (устарел) |
| `cap-tools` | Tool use | L1/L2 | systems-seed | KEEP, **promote** концепт в L2 |
| `cap-caching` | Prompt caching | L1 | ai-inference* | KEEP, cross-link |
| `cap-citations` | Citations | L1 | rag-related* | KEEP, cross-link к L2 ai-data-systems/rag |
| `cap-code-exec` | Code execution | L1 | ai-fundamentals | KEEP |
| `cap-thinking` | Расширенное мышление | L1 | ai-fundamentals | KEEP |
| `cap-limitations` | Возможности и ограничения | L1 | ai-fundamentals | KEEP |

### 3.4 prompting (15 узлов) — все Foundation/L1

| id | title | Level | Subcategory | Action |
|---|---|---|---|---|
| `prompting` | Промпт-инжиниринг | L1 | prompting | KEEP |
| `pr-4d` | 4D Framework | L1 | prompting | KEEP |
| `pr-principles` | Принципы | L1 | prompting | KEEP |
| `pr-xml` | XML-теги | L1 | prompting | KEEP |
| `pr-fewshot` | Few-shot examples | L1 | prompting | KEEP |
| `pr-cot` | Chain of thought | L1 | prompting | KEEP |
| `pr-role` | Роль и контекст | L1 | prompting | KEEP |
| `pr-prefill` | Prefill | L1 | prompting | KEEP |
| `pr-structured` | Структурированный вывод | L1 | prompting | KEEP |
| `pr-iterate` | Итерация промпта | L1 | prompting | KEEP |
| `ready-prompts` | Готовые промпты | L1 | prompting | KEEP |
| `rp-project` | Создать Project | L1 | prompting | KEEP |
| `rp-artifact` | Создать Artifact | L1 | prompting | KEEP |
| `rp-skill` | Создать Skill | L1 | prompting | KEEP |
| `rp-claudemd` | Создать CLAUDE.md | L1 | prompting | KEEP |
| `rp-audit` | Экспертный аудит | L1/L2 | systems-seed | KEEP, **promote** концепт workflow в L2 |

### 3.5 instructions, projects, artifacts (15 узлов) — все Foundation/L1

| id | title | Level | Subcategory | Action |
|---|---|---|---|---|
| `instructions` | Custom Instructions | L1 | configuration | KEEP |
| `i-global` | Глобальные | L1 | configuration | KEEP |
| `i-project` | Project-уровень | L1 | configuration | KEEP |
| `i-claudemd` | CLAUDE.md (как файл) | L1 | configuration | KEEP |
| `i-style` | Стиль ответа | L1 | configuration | KEEP |
| `i-templates` | Шаблоны | L1 | configuration | KEEP |
| `projects` | Projects | L1 | configuration | KEEP |
| `p-files` | Загрузка файлов | L1 | configuration | KEEP |
| `p-instructions` | Project Instructions | L1 | configuration | KEEP |
| `p-team` | Командная работа | L1/L2 | systems-seed | KEEP, **promote** концепт в L2 human-collaboration |
| `p-when` | Когда создавать | L1 | configuration | KEEP |
| `artifacts` | Artifacts | L1 | configuration | KEEP |
| `a-types` | Типы артефактов | L1 | configuration | KEEP |
| `a-trigger` | Когда триггерится | L1 | configuration | KEEP |
| `a-iterate` | Итерации и версии | L1 | configuration | KEEP |
| `a-edit` | Точечные правки | L1 | configuration | KEEP |

### 3.6 skills (7 узлов) — Foundation/L1 + L2 boundary

| id | title | Level | Subcategory | Action |
|---|---|---|---|---|
| `skills` | Skills | **L1/L2** | automation | KEEP, **promote** к L2 как orchestration pattern |
| `s-md` | SKILL.md | L1 | automation | KEEP |
| `s-trigger` | Триггеры | L1 | automation | KEEP |
| `s-files` | Вспомогательные файлы | L1 | automation | KEEP |
| `s-ready` | Готовые Skills | L1 | automation | KEEP |
| `s-create` | Свой Skill | L1 | automation | KEEP |
| `s-vs-subagents` | Skill ≠ Sub-agent | L1/L2 | systems-seed | KEEP, **promote** к L2 |

### 3.7 claude-code (28 узлов) — все Foundation/L1

Большой раздел (claude-code + cc-* + cc-grp-*). Все 28 узлов = L1 Foundation/automation.
Не дублирую таблицу — все имеют `Subcategory: automation/claude-code`, `Action: KEEP`.

### 3.8 mcp (7 узлов) — Foundation/L1 + L2 boundary

| id | title | Level | Subcategory | Action |
|---|---|---|---|---|
| `mcp` | MCP | **L1/L2** | automation | KEEP, **promote** к L2 ai-integration-systems |
| `m-what` | Что такое MCP | L1 | automation | KEEP |
| `m-ready` | Готовые серверы | L1 | automation | KEEP |
| `m-custom` | Свой MCP-сервер | L1 | automation | KEEP |
| `m-security` | Безопасность | L1 | automation | KEEP |
| `m-patterns` | Паттерны проектирования | L1/L2 | systems-seed | KEEP, **promote** к L2 |
| `m-debug` | Отладка MCP | L1 | automation | KEEP |

### 3.9 scenarios (7 узлов) — все L1, но устарели

Текущие scenarios — слишком shallow. После миграции часть переедет в L3 Use Cases.

| id | title | Level | Subcategory | Action |
|---|---|---|---|---|
| `scenarios` | Сценарии использования | L1 | use-cases-seed | KEEP, **rebuild** как индекс Use Cases |
| `sc-analysis` | Анализ и аудит | L1 | use-case | KEEP, **enrich** до полного use case |
| `sc-coding` | Программирование | L1 | use-case | KEEP, **enrich** |
| `sc-design` | Дизайн и UX | L1 | use-case | KEEP, **enrich** |
| `sc-content` | Контент | L1 | use-case | KEEP, **enrich** |
| `sc-research` | Исследование | L1 | use-case | KEEP, **enrich** |
| `sc-data` | Анализ данных | L1 | use-case | KEEP, **enrich** |
| `b-educators` | Claude для педагогов | L1 | use-case (vertical) | KEEP, **migrate** в L3 transformation |

### 3.10 agents (8 узлов) — Foundation/L1 + L2 boundary

| id | title | Level | Subcategory | Action |
|---|---|---|---|---|
| `agents` | Идеи агентов | **L1/L2** | agents | KEEP, **promote** к L2 ai-orchestration |
| `ag-principles` | Принципы дизайна агента | L1/L2 | systems-seed | KEEP, **promote** к L2 |
| `ag-code` | Code Reviewer | L1 | agents | KEEP, audit (агент = use case L3) |
| `ag-ux` | Audit Agent | L1 | agents | KEEP, audit |
| `ag-research` | Researcher | L1 | agents | KEEP, audit |
| `ag-designer` | Designer Assistant | L1 | agents | KEEP, audit |
| `ag-pm` | PM Assistant | L1 | agents | KEEP, audit |
| `ag-managed` | Claude Managed Agents | L1/L2 | agents | KEEP, **promote** концепт в L2 |

---

## 4. Boundary nodes — что значит «promote к L2»

5 узлов помечены как L1/L2 boundary. Это значит:
- **Оставить L1-описание** (что это, как работает технически)
- **Дополнительно создать L2-узел** в Systems-слое, который ссылается через `relatedIds`
- **Не дублировать контент**: L2-узел описывает *паттерн*, не *инструмент*

### Пример

L1: `skills` (Foundation/automation) — «что такое Skills, как их создавать»
L2: `ai-orchestration/reusable-modules` (Systems) — «как Skills используются как модули в multi-step workflow»

Эти два узла связаны через `relatedIds`, но описывают разное.

---

## 5. Узлы для audit (устарели или требуют пересмотра)

Из аудита текущих задач:

- `cap-computer` — устарел (Computer Use в неопределённом статусе)
- `b-knowledge` — устарел (cutoff даты устарели)
- `pl-platforms` — устарел (платформы постоянно меняются)

Эти узлы помечены в `tasks/current.md` для аудита через `content-gap-auditor`.

---

## 6. Mapping summary table

```
EXISTING 133 NODES:
├── Foundation (pure L1):                   128 (96.2%)
│   ├── claude-core (basics+platform+caps):  41
│   ├── prompting:                            16
│   ├── configuration (instr+proj+art):       16
│   ├── automation (claude-code+mcp+skills):  42
│   ├── agents:                                8
│   └── use-cases-seeds (scenarios):           8 (миграция в L3)
│
├── L1/L2 boundary (promote candidates):     5 (3.8%)
│   ├── skills (как orchestration concept)
│   ├── agents (как coordination concept)
│   ├── mcp (как integration system)
│   ├── cap-tools (как tool-use pattern)
│   └── ag-managed (как managed agents pattern)
│
├── L2 Systems (pure):                       0
└── L3 Transformation (pure):                0
```

**Action items:**
1. 128 узлов → миграция в `foundation/` без изменений
2. 5 boundary узлов → cross-link к новым Systems-узлам
3. 0 Systems → создать 30-40 новых
4. 0 Transformation → создать 80-150 новых (флагман eCommerce)

---

## 7. Tooling — как поддерживать классификацию

Предложение: добавить поле `level` в схему узла `mindmapData.js`:

```js
{
  id: 'b-context',
  title: '...',
  icon: 'brain',
  category: 'foundation',
  level: 'foundation',   // ← НОВОЕ поле
  layer: 'L1',           // ← опционально, для tooling
  subcategory: 'ai-fundamentals',  // ← опционально
  details: { ... },
  children: [...]
}
```

Тогда:
- UI может фильтровать по уровню
- Lint может проверять `relatedIds` semantic (L3→L1 OK, L1→L3 RED FLAG)
- Search может ранжировать по уровню

---

## Решения, требующие approval

> **Q1**: Принимаем ли классификацию? (5 boundary узлов под вопросом)
> **Q2**: Добавляем поле `level` в схему узла сейчас или после миграции?
> **Q3**: Куда идёт `b-educators` — остаётся в `scenarios` или переезжает в L3 `transformation/ai-native-education`?

---

_Status: IMPLEMENTED (2026-05-22) | Prev: [02 — Architecture](./02-architecture.md) | Next: [04 — Foundation Mapping](./04-foundation-mapping.md)_

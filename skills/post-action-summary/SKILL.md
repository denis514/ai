# post-action-summary

> **Постоянное правило поведения.** Применяется автоматически после каждого
> значимого действия в проекте. Не опционально.

---

## Когда применять

После **каждого** из этих типов действий:

- ✅ Закоммиченное изменение в код
- ✅ Создание/удаление/перемещение файла
- ✅ Изменение архитектуры (новые routes, components, services, tables)
- ✅ Настройка системы (CI/CD, hooks, env vars, deploy)
- ✅ Завершение этапа MVP/Beta/Phase
- ✅ Обновление контента (узлы, tutorials, prompts)
- ✅ Изменение зависимостей (npm install/remove)
- ✅ Запуск/изменение skill-агентов
- ✅ Создание стратегического документа
- ✅ Любое действие которое меняет состояние проекта

**Когда НЕ применять:**
- ❌ Чисто research-запросы (просто читал файлы, ничего не менял)
- ❌ Уточнения от пользователя (AskUserQuestion)
- ❌ Один тривиальный edit где summary длиннее самого изменения

---

## Формат (6 секций обязательно)

```
✅ Что сделано:
[1-3 предложения. Что физически произошло.]

💡 Почему:
[1-2 предложения. Зачем это нужно. Не «потому что user попросил», а что эта правка решает.]

⚙️ Как это теперь работает:
[2-4 предложения. Новая логика / поведение системы.]

🔒 На что это влияет:
[Перечисли затронутые слои: security / архитектура / UX / производительность / API / backend / frontend / scalability / SEO / accessibility / стоимость. Каждый — отдельная строка bullets если несколько.]

⚠️ Важные замечания или риски:
[Если есть — конкретно. Если нет — «нет известных рисков».]

➡️ Следующий шаг:
[Логичное продолжение работы. Конкретный actionable item.]
```

---

## Тон и стиль

- **Русский язык** (правило CLAUDE.md § 14a)
- **Plain language** — как Product Owner / UX Designer объясняет founder'у
- **Не overly technical** — но и не упрощённо до банальности
- **Короткие предложения** — лучше 3 коротких чем 1 длинное
- **Конкретика > абстракции** — «коммит abc123 добавил 4 файла» > «улучшено качество»

---

## Что обязательно подсвечивать отдельно

Когда меняются эти слои — **выделяй их особо** в секции 🔒:

| Слой | Trigger | Что писать |
|------|---------|-----------|
| **Структура проекта** | новые папки, перемещения, удаления | «Структура проекта: добавлена/удалена папка X» |
| **API surface** | новые/изменённые endpoints, props, exports | «API: новый prop `xxx` в компоненте Y» |
| **GitHub / git** | force-push, history rewrite, branch changes | «Git: rewrite history в branch X» |
| **Vercel / Deploy** | env vars, build config, deploy hooks | «Deploy: новая env var `XXX` в Vercel» |
| **Security** | auth flows, encryption, RLS, secret handling | «Security: изменён RLS policy на таблице X» |
| **AI architecture** | новые agents, skills, prompt patterns | «AI: новый skill X в skills/, активируется через...» |
| **Cost** | новые API calls, tokens, paid services | «Стоимость: ожидаемый прирост $X/мес из-за...» |
| **Breaking changes** | что-либо что ломает существующий код | **🚨 BREAKING:** [подробно] |

---

## Примеры применения

### Пример 1 — Code commit

```
✅ Что сделано:
Закоммитил `cap-tools` upgrade — узел Atlas получил rich content (~1900 chars)
вместо stub'а (130 chars). Коммит `18ee28b`.

💡 Почему:
cap-tools — фундамент MCP/agents/skills/sub-agents. Был тонким — не давал
полного понимания для product/ops audience.

⚙️ Как это теперь работает:
Узел показывает JSON schema example, 5-step workflow, 5 анти-паттернов,
cross-links к 4 связанным узлам. sync-whats-new помечает узел как 'updated'
в whatsNew.js.

🔒 На что это влияет:
- Контент: +0.1% к Atlas content quality (один из 247 узлов)
- UX: ICP теперь видит depth Atlas при demo, не «список AI tools»
- Bundle: nodes-chunk 304 → 306 KB (+2 KB)

⚠️ Важные замечания или риски:
Нет известных рисков. Изменение только в JSON-контенте, не в коде.

➡️ Следующий шаг:
#35 — upgrade cap-thinking + cap-memory одним проходом (~8-10 часов).
```

### Пример 2 — Архитектурное изменение

```
✅ Что сделано:
Добавил Supabase Edge Function `builder-execute-workflow` + новые таблицы
`builder_executions` и `builder_execution_logs`.

💡 Почему:
Beta Phase B-2.2 — real Claude API execution через backend proxy. Без
этой инфраструктуры Builder остаётся mock-only.

⚙️ Как это теперь работает:
Frontend вызывает edge function с workflow_id. Function загружает workflow
из Supabase, decrypt API ключи user'а из Vault, выполняет topological order
с real Claude API calls. Логи стримятся через Supabase Realtime subscription.

🔒 На что это влияет:
- Security: новый encrypted storage для API keys через pgsodium
- Cost: первые real API calls — founder spending для testing ~$20-50
- Backend: 2 новых таблицы + 1 edge function
- Database: миграция требует супер-юзер access
- Compliance: GDPR — execution logs хранят prompts/outputs 90 дней

⚠️ Важные замечания или риски:
🚨 BREAKING для существующих anonymous users — workflows из localStorage
больше не запускаются с reach API (offer migration tool).
Risk: если edge function падает — UI должен fallback к mock executor.

➡️ Следующий шаг:
Frontend integration — `useExecution(executionId)` hook + UI toggle
«Real mode / Mock mode».
```

---

## Где это правило живёт

- **`CLAUDE.md` § 14b** — automatic load в каждой Claude-сессии в проекте
- **`skills/post-action-summary/SKILL.md`** — детальная спека (этот файл)
- **AGENTS.md** (если будет создан) — для дублирования в OpenAI Codex

---

## Контроль качества

Если после действия я **забыл** написать summary в этом формате — это **bug в моём поведении**. Пользователь может напомнить указанием «format» или «summary please» — я должен ответить retro-fitted summary прошлого действия.

---

_Skill created: 2026-05-24. Применяется автоматически с этой даты._

# Backlog

Задачи, готовые к работе, не активные сейчас.
Структура: **P0 → P1 → P2 → P3** по приоритету. Внутри каждого — порядок исполнения.

**Источник:** `tasks/audit-strategy-vs-reality-2026-05-23.md` (8 разрывов между
стратегией IMPLEMENTED 2026-05-22 и реальным состоянием кода/контента).

---

## P0 — Закрыть разрывы с позиционированием (блокирующие)

Стратегия в `docs/strategy/01-positioning.md` имеет статус `IMPLEMENTED`, но
два разрыва прямо противоречат заявленному позиционированию каждый раз, когда
пользователь открывает продукт.

### №1 — UI/i18n миграция под новый словарь

**Проблема.** Стратегия требует словарь «Workflows / Playbooks / Pathways /
AI-Native Use Cases». В коде остались ~30 ключей с «курс/обучение/tutorial/
знакомство» (RU), почти весь FI с `oppitunti/kurssi`, EN мигрирован частично.
Имена компонентов `TutorialModal`/`TutorialDetail` сохранены.

**Что менять:**

1. **i18n keys в `src/locales/{ru,en,fi}/ui.json`:**
   ```
   tutorial.kicker, tutorial.finishCourse, tutorialDone, tutorialStarted,
   tutorialAvailable, tutorialPass, tutorialContinue, tutorialRetake,
   expandTutorial, tutorialDetail.plan, tutorialDetail.start,
   courses.status.*, courses.empty.*, courses.kind.tutorial,
   profile.tutorials, profile.completed.open,
   achievements.firstTutorial|fiveTutorials|tenTutorials,
   welcome.subtitle ("знакомство" → "AI Foundation"),
   backToListShortcut
   ```
2. **Названия компонентов:** оценить переименование `TutorialModal` →
   `WorkflowModal`, `TutorialDetail` → `WorkflowDetail`. Не блокирующее
   (внутреннее имя), но снижает когнитивный диссонанс при правках.
3. **Тон копи:** «Начать обучение» → «Открыть workflow» / «Запустить playbook».

**Скоуп:** только UI-копи и имена. Контент tutorials (`tutorials.json`) трогаем
в отдельной задаче (P1 №3).

**Аудитория проверки:** запустить `russian-language-pedagogue`, `english-language-pedagogue`,
`finnish-language-pedagogue` после миграции.

**Эффорт:** 2-3 дня.

---

### №2 — eCommerce flagship Transformation direction

**Проблема.** Стратегия (`docs/strategy/01-positioning.md` § 3.3 + § 6.4)
объявляет eCommerce **стратегическим фокусом** и **флагманом transformation-
направлений**. Сейчас реализованы 6 directions, но `ai-native-ecommerce`
**отсутствует**.

**Что нужно создать:**

```
transformation/ai-native-ecommerce
├── ec-personalization      (Embeddings → product recs)
├── ec-search               (RAG → semantic search)
├── ec-cro                  (Claude as conversion analyst)
├── ec-merchandising        (smart catalogs)
├── ec-pricing              (dynamic pricing с AI-сигналами)
├── ec-support              (отдельный support direction уже есть, cross-link)
├── ec-content              (product descriptions, brand voice)
├── ec-analytics            (Claude как BI-аналитик)
├── ec-fraud                (anomaly detection)
└── ec-checkout             (intent prediction)
```

Минимум 10 узлов, как у других directions. Полный план в
`docs/strategy/06-transformation-layer.md`.

**Use Cases** добавить:
- `uc-ai-personalization`, `uc-ai-product-search`, `uc-ai-cro` —
  cross-links вниз к Foundation (Embeddings, RAG) и Systems (data, orchestration).

**Эффорт:** 2 недели (контент + локализация ru/en/fi).

---

## P1 — Углубление под позиционирование

### №3 — Tutorials → Workflows reformat

**Проблема.** Формат tutorials остался педагогическим (`whatItIs/approach/
outcomes/applyIn/pitfalls/exercises`). Под новое позиционирование нужны поля
workflow/playbook:
- `whenToApply` — триггер запуска (а не «уровень beginner/intermediate»)
- `KPI` — что измеряем результатом
- `artefacts` — что остаётся после прохода (документ, CLAUDE.md, шаблон)
- `roleStakeholders` — кто в команде участвует

**Подход:** расширить схему `tutorials.js`, оставить обратную совместимость со
старыми полями. Сначала на 3-5 пилотных workflow (например, `ai-fluency`,
`claude-for-business`), потом раскат.

**Эффорт:** схема + миграция — 3-4 дня; полный раскат на 32 tutorials — 1-2 недели.

---

### №4 — Systems layer expansion

**Проблема.** 6 направлений × ~1.6 листа = всего 10 узлов. Для «operating system»
плотность недостаточна. Особенно тонкие:
- `ai-orchestration` (1 лист: multi-agent-patterns)
- `ai-human-collaboration` (1: escalation-paths)
- `ai-integration-systems` (1: api-patterns)

**Что добавить (минимум):**

| Направление | Новые узлы |
|-------------|------------|
| ai-orchestration | sequencing, branching, parallel agents, agent-to-agent comms |
| ai-human-collaboration | review gates, approval flows, hybrid loops, escalation triggers |
| ai-integration-systems | webhook patterns, queue-based, event-driven, REST vs MCP, auth strategies |
| ai-data-systems | + chunking, + vectorisation pipelines, + freshness strategies |
| ai-workflows | + error recovery, + retry strategies |
| ai-operations | + observability, + alerting, + drift detection |

Итого: 25-30 новых Systems-узлов.

**Эффорт:** 2-3 недели (контент-тяжёлая задача, делать партиями по направлениям).

---

### №5 — Deprecate-watch sweep (7 узлов)

**Проблема.** Узлы Foundation, стратегически чувствительные к фактам Anthropic,
не ревизовались с миграции стратегии:

```
pl-plans, pl-limits, pl-rate
cap-memory, cap-computer
m-ready
b-knowledge
```

**Подход:** запустить `news-watcher` (skill готов, не использовался) →
получить дельты Anthropic → пройтись по 7 узлам → актуализировать.

**Эффорт:** 1 день на all 7, при условии что news-watcher даст хороший дайджест.

---

## P2 — Развитие на масштабе

### №6 — Foundation cleanup: `cap-*` под `ai-fundamentals`

**Проблема.** `cap-tools`, `cap-vision`, `cap-caching`, `cap-citations`,
`cap-computer` живут в `foundation/capabilities`, а не в `ai-fundamentals`.
Это размывает 3-уровневую модель: capabilities — это **Claude-specific фичи**,
fundamentals — **AI-механизмы** (как работает LLM, Embeddings и т.д.).

**Подход (не срочно, не ломая ссылки):**
- Вариант A: переместить `cap-tools` (Tool use) и `cap-vision` (multimodal) под
  `ai-fundamentals` как `af-tool-use` и `af-vision`, потому что это **общие
  AI-концепции**, не Claude-specific. Оставить `cap-caching`, `cap-citations`,
  `cap-computer` в capabilities.
- Вариант B: ничего не трогать, документировать решение «capabilities ≠ fundamentals
  по дизайну».

Решить совместно перед началом.

**Эффорт:** 0.5 дня (если Вариант A: переименование + cross-link migration).

---

### №7 — Батч 2 workflows: технические

| Workflow | Аудитория | Уровень | nodeId |
|----------|-----------|---------|--------|
| `mcp-advanced` — MCP: Advanced Topics | developers | advanced | mcp |
| `claude-code-project` — Claude Code in Action | developers | intermediate | claude-code |
| `building-evaluations` — как оценивать ответы Claude | developers | intermediate | новый `af-evals` |

**Важно:** делать в новом workflow-формате (см. №3), не как tutorials.

**Эффорт:** 1 неделя.

---

### №8 — Инфраструктурные скиллы

| Skill | Цель |
|-------|------|
| `verify-mindmap-integrity` | Линт по 6-вопросной схеме, dangling relatedIds, schema-валидация. Прогон pre-commit |
| `content-scout` | Еженедельный поиск пробелов под новое позиционирование (Anthropic releases + transformation-сигналы) |
| `workflow-publisher` | Генерация workflow-черновика из узла (бывший lesson-publisher, переименован под новый словарь) |

**Эффорт:** 1-2 дня на skill (SKILL.md + ресурсы).

---

## P3 — Большие ставки (после P0-P2)

| # | Задача | Эффорт | Риск |
|---|--------|--------|------|
| 9 | **MCP server для mindmap** — выставить Atlas как MCP-ресурс для Claude Code | 5-7 дн. | высокий |
| 10 | **AI Companion mode** — кнопка «спросить Claude об этом узле» с контекстом | 3-5 дн. | средний |
| 11 | **Self-updating mindmap** — `scripts/ai-add-node.js` + scheduled review | 3-5 дн. | высокий |
| 12 | **Content-автопубликация** (`content/content-queue.json` + GH Actions cron) | 1 нед. | средний |

---

## ⚙️ Tech debt и ручные операции

| Status | Task | Примечание |
|--------|------|-----------|
| ⚙️ manual | Supabase session timebox | Dashboard → Auth → Sessions → 30 дней |
| 📐 архитектура | Решить про `cap-*` vs `ai-fundamentals` (см. №6) | До начала работ по №7 |

---

## 🚫 Что НЕ берём (off-strategy)

Из старого backlog **отброшено** как противоречащее новому позиционированию:

- ❌ Anthropic Academy course matrix («everyone/dev/business/educators»)
- ❌ Cloud-интеграции `bedrock` / `vertex-ai` как отдельные курсы
- ❌ Батч 4 «AI Fluency расширение» (nonprofit, students, teaching) — LMS-логика
- ❌ Stripe / monetization до закрытия P0-P1

Если эти темы и нужны — переосмыслить как Foundation-узлы или Transformation
use cases, не как «курсы».

---

## Supabase — Backend & Auth (2026-05-17)

Phase 1-3 ✅ выполнены (Auth, Profile, Progress).

| Phase | Задача | Статус |
|-------|--------|--------|
| 4 | Scenarios & Comments — `personal_scenarios`, `comments` | open |
| 5 | Monetization — Stripe + `subscriptions` + `ai_usage` limits | open |

GDPR / Финляндия: privacy by design, data minimisation, RLS, consent timestamps,
delete + export.

---

## Заметки

- Один пункт = один skill / prompt / workflow / контент-партия.
- Перед взятием в работу — переноси в `current.md`.
- Раз в месяц — grooming: убирать неактуальное.
- Любая новая идея проходит через `knowledge-architect` или `ai-system-designer`
  и приходит сюда из `ideas.md`.

## 📄 docs-watch: обработано — 2026-06-08

> Прогон docs-watcher 2026-06-08. Единственное изменение в индексе llms.txt —
> косметика: ссылка «Changelog» → «Claude Code changelog» (переформулировка без
> сути, класс `cosmetic`). В узлы Atlas разносить нечего. Секция закрыта.

## 📄 docs-watch: документация изменилась — 2026-06-15

> Авто-сигнал от `scripts/docs-watcher.mjs`. Реакция: «сигнал + черновик правок».
> Прогон: прочитать дифф ниже → разнести по узлам Atlas → `node scripts/sync-whats-new.mjs`.

### Desktop app (вкладка Code)
- Источник: https://code.claude.com/docs/en/desktop.md
- Изменения: **45** добавлено, **43** удалено
- Затронутые узлы Atlas (черновик): `pl-desktop, pl-code-mode, apps-setup`

```diff
- * **Project folder**: select the folder or repository Claude works in. For remote sessions, you can add [multiple repositories](#run-long-running-tasks-remotely).
+ * **Project folder**: select the folder or repository Claude works in. For cloud sessions, you can add [multiple repositories](#run-long-running-tasks-remotely).
- * **@mention files**: type `@` followed by a filename to add a file to the conversation context. Claude can then read and reference that file. @mention is not available in remote sessions.
+ * **@mention files**: type `@` followed by a filename to add a file to the conversation context. Claude can then read and reference that file. @mention is not available in cloud sessions.
- | Mode                   | Settings key        | Behavior                                                                                                                                                                                                                                                                     |
- | ---------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
- | **Ask permissions**    | `default`           | Claude asks before editing files or running commands. You see a diff and can accept or reject each change. Recommended for new users.                                                                                                                                        |
- | **Auto accept edits**  | `acceptEdits`       | Claude auto-accepts file edits and common filesystem commands like `mkdir`, `touch`, and `mv`, but still asks before running other terminal commands. Use this when you trust file changes and want faster iteration.                                                        |
- | **Plan mode**          | `plan`              | Claude reads files and runs commands to explore, then proposes a plan without editing your source code. Good for complex tasks where you want to review the approach first.                                                                                                  |
- | **Auto**               | `auto`              | Claude executes all actions with background safety checks that verify alignment with your request. Reduces permission prompts while maintaining oversight. Enable in your Settings → Claude Code. See [availability requirements](#auto-mode-availability) below.            |
- | **Bypass permissions** | `bypassPermissions` | Claude runs without any permission prompts, equivalent to `--dangerously-skip-permissions` in the CLI. Enable in your Settings → Claude Code under "Allow bypass permissions mode". Only use this in sandboxed containers or VMs. Enterprise admins can disable this option. |
+ | Mode                   | Settings key        | Behavior                                                                                                                                                                                                                                                                                                                                                  |
+ | ---------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
+ | **Ask permissions**    | `default`           | Claude asks before editing files or running commands. You see a diff and can accept or reject each change. Recommended for new users.                                                                                                                                                                                                                     |
+ | **Auto accept edits**  | `acceptEdits`       | Claude auto-accepts file edits and common filesystem commands like `mkdir`, `touch`, and `mv`, but still asks before running other terminal commands. Use this when you trust file changes and want faster iteration.                                                                                                                                     |
+ | **Plan mode**          | `plan`              | Claude reads files and runs commands to explore, then proposes a plan without editing your source code. Good for complex tasks where you want to review the approach first.                                                                                                                                                                               |
+ | **Auto**               | `auto`              | Claude executes all actions with background safety checks that verify alignment with your request. Reduces permission prompts while maintaining oversight. Enable in your Settings → Claude Code. See [availability requirements](#auto-mode-availability) below.                                                                                         |
+ | **Bypass permissions** | `bypassPermissions` | Claude runs without permission prompts, except those forced by explicit [ask rules](/en/permissions#manage-permissions); equivalent to `--dangerously-skip-permissions` in the CLI. Enable in your Settings → Claude Code under "Allow bypass permissions mode". Only use this in sandboxed containers or VMs. Enterprise admins can disable this option. |
- Remote sessions support Auto accept edits and Plan mode. Ask permissions is not available because remote sessions auto-accept file edits by default, and Bypass permissions is not available because the remote environment is already sandboxed.
+ Cloud sessions support Accept edits, Plan mode, and Auto mode. Accept edits corresponds to `default` mode: cloud sessions pre-approve file edits, so the selector shows Accept edits instead of Ask permissions. Bypass permissions is not available because the cloud environment is already sandboxed.
- The file pane is available in local and SSH sessions. For remote sessions, ask Claude to make the change.
+ The file pane is available in local and SSH sessions. For cloud sessions, ask Claude to make the change.
- For large refactors, test suites, migrations, or other long-running tasks, select **Remote** instead of **Local** when starting a session. Remote sessions run on Anthropic's cloud infrastructure and continue even if you close the app or shut down your computer. Check back anytime to see progress or steer Claude in a different direction. You can also monitor remote sessions from [claude.ai/code](https://claude.ai/code) or the Claude iOS app.
+ For large refactors, test suites, migrations, or other long-running tasks, select **Remote** instead of **Local** when starting a session. Cloud sessions run on Anthropic's cloud infrastructure and continue even if you close the app or shut down your computer. Check back anytime to see progress or steer Claude in a different direction. You can also monitor cloud sessions from [claude.ai/code](https://claude.ai/code) or the Claude iOS app.
- Remote sessions also support multiple repositories. After selecting a cloud environment, click the **+** button next to the repo pill to add additional repositories to the session. Each repo gets its own branch selector. This is useful for tasks that span multiple codebases, such as updating a shared library and its consumers.
+ Cloud sessions also support multiple repositories. After selecting a cloud environment, click the **+** button next to the repo pill to add additional repositories to the session. Each repo gets its own branch selector. This is useful for tasks that span multiple codebases, such as updating a shared library and its consumers.
- See [Claude Code on the web](/en/claude-code-on-the-web) for more on how remote sessions work.
+ See [Claude Code on the web](/en/claude-code-on-the-web) for more on how cloud sessions work.
- * **Claude Code on the Web**: sends your local session to continue running remotely. Desktop pushes your branch, generates a summary of the conversation, and creates a new remote session with the full context. You can then choose to archive the local session or keep it. This requires a clean working tree, and is not available for SSH sessions.
+ * **Claude Code on the Web**: sends your local session to continue running remotely. Desktop pushes your branch, generates a summary of the conversation, and creates a new cloud session with the full context. You can then choose to archive the local session or keep it. This requires a clean working tree, and is not available for SSH sessions.
- For local and [SSH](#ssh-sessions) sessions, click the **+** button next to the prompt box and select **Connectors** to add integrations like Google Calendar, Slack, GitHub, Linear, Notion, and more. You can add connectors before or during a session. The **+** button is not available in remote sessions, but [routines](/en/routines) configure connectors at routine creation time.
+ For local and [SSH](#ssh-sessions) sessions, click the **+** button next to the prompt box and select **Connectors** to add integrations like Google Calendar, Slack, GitHub, Linear, Notion, and more. You can add connectors before or during a session. The **+** button is not available in cloud sessions, but [routines](/en/routines) configure connectors at routine creation time.
- Plugins can be scoped to your user account, a specific project, or local-only. If your organization manages plugins centrally, those plugins are available in desktop sessions the same way they are in the CLI. Plugins are not available for remote sessions. For the full plugin reference including creating your own plugins, see [plugins](/en/plugins).
+ Plugins can be scoped to your user account, a specific project, or local-only. If your organization manages plugins centrally, those plugins are available in desktop sessions the same way they are in the CLI. Plugins are not available for cloud sessions. For the full plugin reference including creating your own plugins, see [plugins](/en/plugins).
+ <a id="when-to-use-program-vs-runtimeexecutable" />
+ 
- [Extended thinking](/en/model-config#extended-thinking) is enabled by default, which improves performance on complex reasoning tasks but uses additional tokens. To disable thinking entirely, set `MAX_THINKING_TOKENS` to `0` in the local environment editor. On models with [adaptive reasoning](/en/model-config#adjust-effort-level), any other `MAX_THINKING_TOKENS` value is ignored because adaptive reasoning controls thinking depth instead. On Opus 4.6 and Sonnet 4.6, set `CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING` to `1` to use a fixed thinking budget; Opus 4.7 and later always use adaptive reasoning and have no fixed-budget mode.
+ [Extended thinking](/en/model-config#extended-thinking) is enabled by default, which improves performance on complex reasoning tasks but uses additional tokens. To disable thinking, set `MAX_THINKING_TOKENS` to `0` in the local environment editor; this has no effect on Fable 5, which always uses extended thinking. On [third-party providers](/en/third-party-integrations), `0` omits the `thinking` parameter instead, and adaptive-reasoning models may still think. On models with [adaptive reasoning](/en/model-config#adjust-effort-level), any other `MAX_THINKING_TOKENS` value is ignored because adaptive reasoning controls thinking depth instead. On Opus 4.6 and Sonnet 4.6, set `CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING` to `1` to use a fixed thinking budget; Opus 4.7 and later always use adaptive reasoning and have no fixed-budget mode.
- ### Remote sessions
+ ### Cloud sessions
- Remote sessions continue in the background even if you close the app. Usage counts toward your [subscription plan limits](/en/costs) with no separate compute charges.
+ Cloud sessions continue in the background even if you close the app. Usage counts toward your [subscription plan limits](/en/costs) with no separate compute charges.
- You can create custom cloud environments with different network access levels and environment variables. Select the environment dropdown when starting a remote session and choose **Add environment**. See [the cloud environment](/en/claude-code-on-the-web#the-cloud-environment) for details on configuring network access and environment variables.
+ You can create custom cloud environments with different network access levels and environment variables. Select the environment dropdown when starting a cloud session and choose **Add environment**. See [the cloud environment](/en/claude-code-on-the-web#the-cloud-environment) for details on configuring network access and environment variables.
- * **macOS**: configure via `com.anthropic.Claude` preference domain using tools like Jamf or Kandji
+ * **macOS**: configure via `com.anthropic.claudefordesktop` preference domain using tools like Jamf or Kandji
- Claude Code processes your code locally in local sessions or on Anthropic's cloud infrastructure in remote sessions. Conversations and code context are sent to Anthropic's API for processing. See [data handling](/en/data-usage) for details on data retention, privacy, and compliance.
+ Claude Code processes your code locally in local sessions or on Anthropic's cloud infrastructure in cloud sessions. Conversations and code context are sent to Anthropic's API for processing. See [data handling](/en/data-usage) for details on data retention, privacy, and compliance.
- | `--add-dir`                           | Add multiple repos with the **+** button in remote sessions                                                                              |
+ | `--add-dir`                           | Add multiple repos with the **+** button in cloud sessions                                                                               |
- * **Models**: Sonnet, Opus, and Haiku are available in both. In Desktop, select the model from the dropdown next to the send button. You can change the model mid-session from the same dropdown.
+ * **Models**: the same [models](/en/model-config#available-models) are available in both. In Desktop, select the model from the dropdown next to the send button. You can change the model mid-session from the same dropdown.
- | Feature                                               | CLI                                                       | Desktop                                                                                                                                                                                                               |
- | ----------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
- | Permission modes                                      | All modes including `dontAsk`                             | Ask permissions, Auto accept edits, Plan mode, Auto, and Bypass permissions via Settings                                                                                                                              |
- | `--dangerously-skip-permissions`                      | CLI flag                                                  | Bypass permissions mode. Enable in Settings → Claude Code → "Allow bypass permissions mode"                                                                                                                           |
- | [Third-party providers](/en/third-party-integrations) | Bedrock, Vertex, Foundry                                  | Anthropic's API by default. Enterprise deployments can configure Vertex AI and gateway providers. See the [enterprise configuration guide](https://support.claude.com/en/articles/12622667-enterprise-configuration). |
- | [MCP servers](/en/mcp)                                | Configure in settings files                               | Connectors UI for local and SSH sessions, or settings files                                                                                                                                                           |
- | [Plugins](/en/plugins)                                | `/plugin` command                                         | Plugin manager UI                                                                                                                                                                                                     |
- | @mention files                                        | Text-based                                                | With autocomplete; local and SSH sessions only                                                                                                                                                                        |
- | File attachments                                      | Not available                                             | Images, PDFs                                                                                                                                                                                                          |
- | Session isolation                                     | [`--worktree`](/en/cli-reference) flag                    | Automatic worktrees                                                                                                                                                                                                   |
- | Multiple sessions                                     | Separate terminals                                        | Sidebar tabs                                                                                                                                                                                                          |
- | Recurring tasks                                       | Cron jobs, CI pipelines                                   | [Scheduled tasks](/en/desktop-scheduled-tasks)                                                                                                                                                                        |
- | Computer use                                          | [Enable via `/mcp`](/en/computer-use) on macOS            | [App and screen control](#let-claude-use-your-computer) on macOS and Windows                                                                                                                                          |
- | Dispatch integration                                  | Not available                                             | [Dispatch sessions](#sessions-from-dispatch) in the sidebar                                                                                                                                                           |
- | Scripting and automation                              | [`--print`](/en/cli-reference), [Agent SDK](/en/headless) | Not available                                                                                                                                                                                                         |
+ | Feature                                               | CLI                                                       | Desktop                                                                                                                                                                                                                                                                                                                                                                                      |
+ | ----------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
+ | Permission modes                                      | All modes including `dontAsk`                             | Ask permissions, Auto accept edits, Plan mode, Auto, and Bypass permissions via Settings                                                                                                                                                                                                                                                                                                     |
+ | `--dangerously-skip-permissions`                      | CLI flag                                                  | Bypass permissions mode. Enable in Settings → Claude Code → "Allow bypass permissions mode"                                                                                                                                                                                                                                                                                                  |
+ | [Third-party providers](/en/third-party-integrations) | Bedrock, Vertex AI, Foundry                               | Anthropic's API by default. Enterprise deployments can configure Vertex AI and gateway providers. See the [enterprise configuration guide](https://support.claude.com/en/articles/12622667-enterprise-configuration). To run the Code tab on Bedrock, Vertex AI, Foundry, or a self-hosted LLM gateway, see the [Cowork on 3P research preview](https://claude.com/docs/cowork/3p/overview). |
+ | [MCP servers](/en/mcp)                                | Configure in settings files                               | Connectors UI for local and SSH sessions, or settings files                                                                                                                                                                                                                                                                                                                                  |
+ | [Plugins](/en/plugins)                                | `/plugin` command                                         | Plugin manager UI                                                                                                                                                                                                                                                                                                                                                                            |
+ | @mention files                                        | Text-based                                                | With autocomplete; local and SSH sessions only                                                                                                                                                                                                                                                                                                                                               |
+ | File attachments                                      | Not available                                             | Images, PDFs                                                                                                                                                                                                                                                                                                                                                                                 |
+ | Session isolation                                     | [`--worktree`](/en/cli-reference) flag                    | Automatic worktrees                                                                                                                                                                                                                                                                                                                                                                          |
+ | Multiple sessions                                     | Separate terminals                                        | Sidebar tabs                                                                                                                                                                                                                                                                                                                                                                                 |
+ | Recurring tasks                                       | Cron jobs, CI pipelines                                   | [Scheduled tasks](/en/desktop-scheduled-tasks)                                                                                                                                                                                                                                                                                                                                               |
+ | Computer use                                          | [Enable via `/mcp`](/en/computer-use) on macOS            | [App and screen control](#let-claude-use-your-computer) on macOS and Windows                                                                                                                                                                                                                                                                                                                 |
+ | Dispatch integration                                  | Not available                                             | [Dispatch sessions](#sessions-from-dispatch) in the sidebar                                                                                                                                                                                                                                                                                                                                  |
+ | Scripting and automation                              | [`--print`](/en/cli-reference), [Agent SDK](/en/headless) | Not available                                                                                                                                                                                                                                                                                                                                                                                |
- The following features are only available in the CLI or VS Code extension:
+ The following features are only available in the CLI or VS Code extension, except where noted:
- * **Third-party providers**: Desktop connects to Anthropic's API by default. Enterprise deployments can configure Vertex AI and gateway providers via [managed settings](https://support.claude.com/en/articles/12622667-enterprise-configuration). For Bedrock or Foundry, use the [CLI](/en/quickstart).
+ * **Third-party providers**: Desktop connects to Anthropic's API by default. Enterprise deployments can configure Vertex AI and gateway providers via [managed settings](https://support.claude.com/en/articles/12622667-enterprise-configuration). For Bedrock or Foundry in the CLI, see the [quickstart](/en/quickstart). As an exception to the section above, the [Cowork on 3P research preview](https://claude.com/docs/cowork/3p/overview) runs the Code tab on Bedrock, Vertex AI, Foundry, or a self-hosted LLM gateway.
- Remote sessions can create branches that don't exist on your local machine. Click the branch name in the session toolbar to copy it, then fetch it locally:
+ Cloud sessions can create branches that don't exist on your local machine. Click the branch name in the session toolbar to copy it, then fetch it locally:
```

### Desktop quickstart
- Источник: https://code.claude.com/docs/en/desktop-quickstart.md
- Изменения: **2** добавлено, **2** удалено
- Затронутые узлы Atlas (черновик): `apps-setup, pl-app-modes`

```diff
-     * **Remote**: Run sessions on Anthropic's cloud infrastructure that continue even if you close the app. Remote sessions use the same infrastructure as [Claude Code on the web](/en/claude-code-on-the-web).
+     * **Remote**: Run sessions on Anthropic's cloud infrastructure that continue even if you close the app. Cloud sessions use the same infrastructure as [Claude Code on the web](/en/claude-code-on-the-web).
-     Select a model from the dropdown next to the send button. See [models](/en/model-config#available-models) for a comparison of Opus, Sonnet, and Haiku. You can change the model later from the same dropdown.
+     Select a model from the dropdown next to the send button. See [models](/en/model-config#available-models) for a comparison of the available models. You can change the model later from the same dropdown.
```

### Platforms and integrations
- Источник: https://code.claude.com/docs/en/platforms.md
- Изменения: **1** добавлено, **1** удалено
- Затронутые узлы Atlas (черновик): `pl-platforms, pl-compare`

```diff
- The CLI is the most complete surface for terminal-native work: scripting and the Agent SDK are CLI-only. Third-party providers also work in [VS Code](/en/vs-code#use-third-party-providers). Enterprise [Desktop](/en/desktop) deployments support Vertex AI and gateway providers; for Bedrock or Foundry, use the CLI or VS Code instead of Desktop. Desktop and the IDE extensions trade some CLI-only features for visual review and tighter editor integration. The web runs in Anthropic's cloud, so tasks keep going after you disconnect. Mobile is a thin client into those same cloud sessions or into a local session via Remote Control, and can send tasks to Desktop with Dispatch.
+ The CLI is the most complete surface for terminal-native work: scripting and the Agent SDK are CLI-only. Third-party providers also work in [VS Code](/en/vs-code#use-third-party-providers). Enterprise [Desktop](/en/desktop) deployments support Vertex AI and gateway providers; for Bedrock or Foundry, use the CLI or VS Code, or the [Cowork on 3P research preview](https://claude.com/docs/cowork/3p/overview), which runs the Code tab on those providers. Desktop and the IDE extensions trade some CLI-only features for visual review and tighter editor integration. The web runs in Anthropic's cloud, so tasks keep going after you disconnect. Mobile is a thin client into those same cloud sessions or into a local session via Remote Control, and can send tasks to Desktop with Dispatch.
```

### Индекс всех страниц документации (llms.txt)
- Источник: https://code.claude.com/docs/llms.txt
- Изменения: **2** добавлено, **1** удалено
- Затронутые узлы Atlas (черновик): `новые/удалённые темы в экосистеме`

```diff
+ - [Escalate hard decisions with the advisor tool](https://code.claude.com/docs/en/advisor.md): Pair your main model with a stronger advisor model that Claude consults at key moments during a task.
- - [Zero data retention](https://code.claude.com/docs/en/zero-data-retention.md): Learn about Zero Data Retention (ZDR) for Claude Code on Claude for Enterprise, including scope, disabled features, and how to request enablement.
+ - [Zero data retention](https://code.claude.com/docs/en/zero-data-retention.md): Learn about Zero Data Retention (ZDR) for Claude Code, available to qualified accounts on Claude for Enterprise, including scope, disabled features, and how to request enablement.
```

### [help-watch 2026-06-15] Проверить вкладку «Помощь» (Agent Builder)
Изменились функциональные файлы билдера — справка могла устареть:
- `src/builder/data/templates.js`
- `src/builder/services/connectionRules.js`
- `src/builder/components/panels/ScheduleModal.jsx`
- `src/builder/components/panels/ApiKeysModal.jsx`
- `src/builder/components/panels/AllSchedulesModal.jsx`
- `src/builder/components/panels/ExecutionPanel.jsx`
После сверки: `npm run help:watch -- --accept`.

## 📄 docs-watch: документация изменилась — 2026-06-22

> Авто-сигнал от `scripts/docs-watcher.mjs`. Реакция: «сигнал + черновик правок».
> Прогон: прочитать дифф ниже → разнести по узлам Atlas → `node scripts/sync-whats-new.mjs`.

### Desktop app (вкладка Code)
- Источник: https://code.claude.com/docs/en/desktop.md
- Изменения: **3** добавлено, **3** удалено
- Затронутые узлы Atlas (черновик): `pl-desktop, pl-code-mode, apps-setup`

```diff
- * Search or file a bug on [GitHub Issues](https://github.com/anthropics/claude-code/issues)
- * Visit the [Claude support center](https://support.claude.com/)
+ * Open Help → Get Support in the desktop app, or visit the [Claude support center](https://support.claude.com/) directly
+ * For problems that also reproduce in the standalone `claude` CLI, search or file a bug on [GitHub Issues](https://github.com/anthropics/claude-code/issues)
- When filing a bug, include your desktop app version, your operating system, the exact error message, and relevant logs. On macOS, check Console.app. On Windows, check Event Viewer → Windows Logs → Application.
+ When reporting a problem, include your desktop app version, your operating system, the exact error message, and relevant logs. On macOS, check Console.app. On Windows, check Event Viewer → Windows Logs → Application.
```

### Индекс всех страниц документации (llms.txt)
- Источник: https://code.claude.com/docs/llms.txt
- Изменения: **3** добавлено, **0** удалено
- Затронутые узлы Atlas (черновик): `новые/удалённые темы в экосистеме`

```diff
+ - [Share session output as artifacts](https://code.claude.com/docs/en/artifacts.md): Artifacts turn Claude Code's work into live, interactive pages at a private URL you can share inside your organization.
+ - [Week 23 · June 1–5, 2026](https://code.claude.com/docs/en/whats-new/2026-w23.md): Run auto mode on Bedrock, Vertex, and Foundry, prompt before writing files that can run code in acceptEdits mode, list installed plugins with /plugin list, and require an approved version range for managed deployments.
+ - [Week 24 · June 8–12, 2026](https://code.claude.com/docs/en/whats-new/2026-w24.md): Move a session to a new directory with /cd, let subagents spawn their own subagents, and troubleshoot a broken configuration with safe mode.
```

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

### [help-watch 2026-06-22] Проверить вкладку «Помощь» (Agent Builder)
Изменились функциональные файлы билдера — справка могла устареть:
- `src/builder/data/templates.js`
- `src/builder/services/connectionRules.js`
- `src/builder/components/panels/ScheduleModal.jsx`
- `src/builder/components/panels/ApiKeysModal.jsx`
- `src/builder/components/panels/AllSchedulesModal.jsx`
- `src/builder/components/panels/ExecutionPanel.jsx`
После сверки: `npm run help:watch -- --accept`.

## 📄 docs-watch: документация изменилась — 2026-06-29

> Авто-сигнал от `scripts/docs-watcher.mjs`. Реакция: «сигнал + черновик правок».
> Прогон: прочитать дифф ниже → разнести по узлам Atlas → `node scripts/sync-whats-new.mjs`.

### Desktop app (вкладка Code)
- Источник: https://code.claude.com/docs/en/desktop.md
- Изменения: **14** добавлено, **10** удалено
- Затронутые узлы Atlas (черновик): `pl-desktop, pl-code-mode, apps-setup`

```diff
- Managed settings override project and user settings and apply when Desktop spawns CLI sessions. You can set these keys in your organization's [managed settings](/en/settings#settings-precedence) file or push them remotely through the admin console.
+ Managed settings override project and user settings and apply to Claude Code sessions in Desktop. You can set these keys in your organization's [managed settings](/en/settings#settings-precedence) file or push them remotely through the admin console.
- | Key                                        | Description                                                                                                                                                                                                                                                                                                             |
- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
- | `permissions.disableBypassPermissionsMode` | set to `"disable"` to prevent users from enabling Bypass permissions mode.                                                                                                                                                                                                                                              |
- | `disableAutoMode`                          | set to `"disable"` to prevent users from enabling [Auto](/en/permission-modes#eliminate-prompts-with-auto-mode) mode. Removes Auto from the mode selector. Also accepted under `permissions`.                                                                                                                           |
- | `autoMode`                                 | customize what the auto mode classifier trusts and blocks across your organization. See [Configure auto mode](/en/auto-mode-config).                                                                                                                                                                                    |
- | `sshConfigs`                               | pre-configure [SSH connections](#pre-configure-ssh-connections-for-your-team) that appear in the environment dropdown. Users cannot edit or delete managed connections.                                                                                                                                                 |
- | `sshHostAllowlist`                         | restrict [SSH sessions](#restrict-which-ssh-hosts-users-can-connect-to) to hosts whose resolved hostname matches one of these patterns. An empty array disables SSH sessions. Read from managed settings only.                                                                                                          |
- | `managedMcpServers`                        | push MCP server configurations to all users in a third-party deployment. Each entry specifies a transport of `"http"`, `"sse"`, or `"stdio"`, connection details, and optionally a `toolPolicy` map that restricts which tools in that server users can invoke. Available in third-party (3P) Desktop deployments only. |
+ | Key                                        | Description                                                                                                                                                                                                                                                                                                                                                                                                                                             |
+ | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
+ | `permissions.disableBypassPermissionsMode` | set to `"disable"` to prevent users from enabling Bypass permissions mode.                                                                                                                                                                                                                                                                                                                                                                              |
+ | `disableAutoMode`                          | set to `"disable"` to prevent users from enabling [Auto](/en/permission-modes#eliminate-prompts-with-auto-mode) mode. Removes Auto from the mode selector. Also accepted under `permissions`.                                                                                                                                                                                                                                                           |
+ | `autoMode`                                 | customize what the auto mode classifier trusts and blocks across your organization. See [Configure auto mode](/en/auto-mode-config).                                                                                                                                                                                                                                                                                                                    |
+ | `sshConfigs`                               | pre-configure [SSH connections](#pre-configure-ssh-connections-for-your-team) that appear in the environment dropdown. Users cannot edit or delete managed connections.                                                                                                                                                                                                                                                                                 |
+ | `sshHostAllowlist`                         | restrict [SSH sessions](#restrict-which-ssh-hosts-users-can-connect-to) to hosts whose resolved hostname matches one of these patterns. An empty array disables SSH sessions. Read from managed settings only.                                                                                                                                                                                                                                          |
+ | `managedMcpServers`                        | push MCP server configurations to all users in a third-party deployment. Each entry specifies a transport of `"http"`, `"sse"`, or `"stdio"`, connection details, and optionally a `toolPolicy` map that restricts which tools in that server users can invoke. Available in third-party (3P) Desktop deployments only. Deliver this key through the managed settings file or MDM, since third-party deployments do not receive admin-console settings. |
- A managed settings file deployed to disk on each machine applies to Desktop sessions. Managed settings pushed remotely through the admin console currently reach CLI and IDE sessions only, so for Desktop deployments either distribute the file via MDM or use the [admin console controls](#admin-console-controls) above.
+ Which managed settings reach a Desktop session depends on where that session runs. Model restrictions such as [`availableModels`](/en/model-config#restrict-model-selection) are enforced in Desktop's Claude Code sessions the same way as in the terminal CLI; see [surface coverage](/en/model-config#surface-coverage).
+ * **Local sessions on this machine**: a managed settings file deployed to disk applies. Managed settings pushed remotely through the admin console also reach these sessions on Anthropic's API when the session authenticates with an organization login or a directly configured API key, following the same [settings precedence](/en/settings#settings-precedence) as the terminal CLI.
+ * **[Cloud sessions](#cloud-sessions)**: run on Anthropic-managed VMs and receive [server-managed settings](/en/server-managed-settings) only.
+ * **[SSH sessions](#ssh-sessions)**: the session reads the managed settings file from the remote host. Desktop itself reads `sshConfigs` and `sshHostAllowlist` from the local machine's managed settings when creating the connection.
+ 
```

### Индекс всех страниц документации (llms.txt)
- Источник: https://code.claude.com/docs/llms.txt
- Изменения: **9** добавлено, **2** удалено
- Затронутые узлы Atlas (черновик): `новые/удалённые темы в экосистеме`

```diff
+ - [Feature availability](https://code.claude.com/docs/en/feature-availability.md): Compare which Claude Code features are available across Anthropic subscription plans, the Anthropic Console, Amazon Bedrock, Claude Platform on AWS, Google Vertex AI, and Microsoft Foundry.
- - [LLM gateway configuration](https://code.claude.com/docs/en/llm-gateway.md): Learn how to configure Claude Code to work with LLM gateway solutions. Covers gateway requirements, authentication configuration, model selection, and provider-specific endpoint setup.
+ - [LLM gateways](https://code.claude.com/docs/en/llm-gateway.md): Route Claude Code through an LLM gateway for centralized authentication, usage tracking, and cost controls. Covers connecting Claude Code to a gateway, rolling one out for your organization, what Claude Code sends to a gateway, and how gateways interact with claude.ai subscriptions.
+ - [Connect Claude Code to an LLM gateway](https://code.claude.com/docs/en/llm-gateway-connect.md): Point Claude Code at your organization's LLM gateway. Check whether your admin already configured it, or set the base URL and credential yourself for the CLI, VS Code, GitHub Actions, and the Agent SDK, then verify the connection and fix gateway errors.
+ - [Gateway protocol reference](https://code.claude.com/docs/en/llm-gateway-protocol.md): The API contract between Claude Code and an LLM gateway: endpoints, headers and body fields to forward, feature degradation when fields are stripped, attribution headers for cost tracking, and model discovery.
+ - [Roll out an LLM gateway for your organization](https://code.claude.com/docs/en/llm-gateway-rollout.md): Deploy a gateway product for Claude Code: configure it to forward what Claude Code sends, issue developer credentials, distribute the configuration through managed settings, and verify the rollout.
+ - [Recommend plugins for your org](https://code.claude.com/docs/en/plugin-relevance.md): Add a relevance block to marketplace plugin entries so Claude Code suggests them when a user's work matches.
- - [Manage sessions](https://code.claude.com/docs/en/sessions.md): Name, resume, branch, and switch between Claude Code conversations. Covers `--continue`, `--resume`, `--from-pr`, the `/resume` picker, session naming, and where transcripts are stored.
+ - [Manage sessions](https://code.claude.com/docs/en/sessions.md): Name, resume, branch, and switch between Claude Code conversations. Covers `--continue`, `--resume`, `--from-pr`, the `/resume` picker, session naming, exporting transcripts, and where transcripts are stored.
+ - [Week 25 · June 15–19, 2026](https://code.claude.com/docs/en/whats-new/2026-w25.md): Publish a live, shareable page from your session with Artifacts, match tool parameters in deny and ask rules, and set any setting from the prompt with /config.
+ - [Week 26 · June 22–26, 2026](https://code.claude.com/docs/en/whats-new/2026-w26.md): Authenticate MCP servers from your shell with claude mcp login, get a response to shell mode command output with the ! prefix, and resume a conversation from before /clear with /rewind.
```

### [help-watch 2026-06-29] Проверить вкладку «Помощь» (Agent Builder)
Изменились функциональные файлы билдера — справка могла устареть:
- `src/builder/data/templates.js`
- `src/builder/services/connectionRules.js`
- `src/builder/components/panels/ScheduleModal.jsx`
- `src/builder/components/panels/ApiKeysModal.jsx`
- `src/builder/components/panels/AllSchedulesModal.jsx`
- `src/builder/components/panels/ExecutionPanel.jsx`
После сверки: `npm run help:watch -- --accept`.

## 📄 docs-watch: документация изменилась — 2026-07-06

> Авто-сигнал от `scripts/docs-watcher.mjs`. Реакция: «сигнал + черновик правок».
> Прогон: прочитать дифф ниже → разнести по узлам Atlas → `node scripts/sync-whats-new.mjs`.

### Desktop app (вкладка Code)
- Источник: https://code.claude.com/docs/en/desktop.md
- Изменения: **28** добавлено, **24** удалено
- Затронутые узлы Atlas (черновик): `pl-desktop, pl-code-mode, apps-setup`

```diff
- <CardGroup cols={2}>
+ <CardGroup cols={3}>
+ 
+   <Card title="Get Claude for Linux (beta)" icon="linux" href="/en/desktop-linux">
+     apt or .deb for Ubuntu and Debian
+   </Card>
- For Windows ARM64, download the [ARM64 installer](https://claude.ai/api/desktop/win32/arm64/setup/latest/redirect?utm_source=claude_code\&utm_medium=docs). The desktop app is not available on Linux; use the [CLI](/en/quickstart) instead.
+ For Windows ARM64, download the [ARM64 installer](https://claude.ai/api/desktop/win32/arm64/setup/latest/redirect?utm_source=claude_code\&utm_medium=docs). On Linux, install with apt; see [Claude Desktop on Linux](/en/desktop-linux).
- Auto mode is a research preview available to all users on the Anthropic API and requires Claude Opus 4.6 or later, or Sonnet 4.6. In Enterprise deployments that route Desktop to Google Cloud Vertex AI, auto mode is off until you [set `CLAUDE_CODE_ENABLE_AUTO_MODE`](/en/permission-modes#enable-auto-mode-on-bedrock-vertex-ai-or-foundry), and only Claude Opus 4.7 and Opus 4.8 are supported there.
+ Auto mode is a research preview available to all users on the Anthropic API and requires Claude Opus 4.6 or later, or Sonnet 4.6 or later. In Enterprise deployments that route Desktop to Google Cloud's Agent Platform, auto mode is off until you [set `CLAUDE_CODE_ENABLE_AUTO_MODE`](/en/permission-modes#enable-auto-mode-on-bedrock-agent-platform-or-foundry), and only Claude Sonnet 5, Opus 4.7, and Opus 4.8 are supported there.
- [Extended thinking](/en/model-config#extended-thinking) is enabled by default, which improves performance on complex reasoning tasks but uses additional tokens. To disable thinking, set `MAX_THINKING_TOKENS` to `0` in the local environment editor; this has no effect on Fable 5, which always uses extended thinking. On [third-party providers](/en/third-party-integrations), `0` omits the `thinking` parameter instead, and adaptive-reasoning models may still think. On models with [adaptive reasoning](/en/model-config#adjust-effort-level), any other `MAX_THINKING_TOKENS` value is ignored because adaptive reasoning controls thinking depth instead. On Opus 4.6 and Sonnet 4.6, set `CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING` to `1` to use a fixed thinking budget; Opus 4.7 and later always use adaptive reasoning and have no fixed-budget mode.
+ [Extended thinking](/en/model-config#extended-thinking) is enabled by default, which improves performance on complex reasoning tasks but uses additional tokens. To disable thinking, set `MAX_THINKING_TOKENS` to `0` in the local environment editor; this has no effect on Fable 5, which always uses extended thinking. On [third-party providers](/en/third-party-integrations), `0` omits the `thinking` parameter instead, and adaptive-reasoning models may still think. On models with [adaptive reasoning](/en/model-config#adjust-effort-level), any other `MAX_THINKING_TOKENS` value is ignored because adaptive reasoning controls thinking depth instead. On Opus 4.6 and Sonnet 4.6, set `CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING` to `1` to use a fixed thinking budget; Fable 5, Sonnet 5, and Opus 4.7 and later always use adaptive reasoning and have no fixed-budget mode.
- To move a CLI session into Desktop, run `/desktop` in the terminal. Claude saves your session and opens it in the desktop app, then exits the CLI. This command is available on macOS and Windows when you are signed in with a Claude subscription. It is not available with API key authentication or on Bedrock, Vertex, or Foundry.
+ To move a CLI session into Desktop, run `/desktop` in the terminal. Claude saves your session and opens it in the desktop app, then exits the CLI. This command is available on macOS and Windows when you are signed in with a Claude subscription. It is not available with API key authentication or on Amazon Bedrock, Google Cloud's Agent Platform, or Microsoft Foundry.
- | Feature                                               | CLI                                                       | Desktop                                                                                                                                                                                                                                                                                                                                                                                      |
- | ----------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
- | Permission modes                                      | All modes including `dontAsk`                             | Ask permissions, Auto accept edits, Plan mode, Auto, and Bypass permissions via Settings                                                                                                                                                                                                                                                                                                     |
- | `--dangerously-skip-permissions`                      | CLI flag                                                  | Bypass permissions mode. Enable in Settings → Claude Code → "Allow bypass permissions mode"                                                                                                                                                                                                                                                                                                  |
- | [Third-party providers](/en/third-party-integrations) | Bedrock, Vertex AI, Foundry                               | Anthropic's API by default. Enterprise deployments can configure Vertex AI and gateway providers. See the [enterprise configuration guide](https://support.claude.com/en/articles/12622667-enterprise-configuration). To run the Code tab on Bedrock, Vertex AI, Foundry, or a self-hosted LLM gateway, see the [Cowork on 3P research preview](https://claude.com/docs/cowork/3p/overview). |
- | [MCP servers](/en/mcp)                                | Configure in settings files                               | Connectors UI for local and SSH sessions, or settings files                                                                                                                                                                                                                                                                                                                                  |
- | [Plugins](/en/plugins)                                | `/plugin` command                                         | Plugin manager UI                                                                                                                                                                                                                                                                                                                                                                            |
- | @mention files                                        | Text-based                                                | With autocomplete; local and SSH sessions only                                                                                                                                                                                                                                                                                                                                               |
- | File attachments                                      | Not available                                             | Images, PDFs                                                                                                                                                                                                                                                                                                                                                                                 |
- | Session isolation                                     | [`--worktree`](/en/cli-reference) flag                    | Automatic worktrees                                                                                                                                                                                                                                                                                                                                                                          |
- | Multiple sessions                                     | Separate terminals                                        | Sidebar tabs                                                                                                                                                                                                                                                                                                                                                                                 |
- | Recurring tasks                                       | Cron jobs, CI pipelines                                   | [Scheduled tasks](/en/desktop-scheduled-tasks)                                                                                                                                                                                                                                                                                                                                               |
- | Computer use                                          | [Enable via `/mcp`](/en/computer-use) on macOS            | [App and screen control](#let-claude-use-your-computer) on macOS and Windows                                                                                                                                                                                                                                                                                                                 |
- | Dispatch integration                                  | Not available                                             | [Dispatch sessions](#sessions-from-dispatch) in the sidebar                                                                                                                                                                                                                                                                                                                                  |
- | Scripting and automation                              | [`--print`](/en/cli-reference), [Agent SDK](/en/headless) | Not available                                                                                                                                                                                                                                                                                                                                                                                |
+ | Feature                                               | CLI                                                              | Desktop                                                                                                                                                                                                                                                                                                                                                                                                                                               |
+ | ----------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
+ | Permission modes                                      | All modes including `dontAsk`                                    | Ask permissions, Auto accept edits, Plan mode, Auto, and Bypass permissions via Settings                                                                                                                                                                                                                                                                                                                                                              |
+ | `--dangerously-skip-permissions`                      | CLI flag                                                         | Bypass permissions mode. Enable in Settings → Claude Code → "Allow bypass permissions mode"                                                                                                                                                                                                                                                                                                                                                           |
+ | [Third-party providers](/en/third-party-integrations) | Amazon Bedrock, Google Cloud's Agent Platform, Microsoft Foundry | Anthropic's API by default. Enterprise deployments can configure Google Cloud's Agent Platform and gateway providers. See the [enterprise configuration guide](https://support.claude.com/en/articles/12622667-enterprise-configuration). To run the Code tab on Amazon Bedrock, Google Cloud's Agent Platform, Microsoft Foundry, or a self-hosted LLM gateway, see the [Cowork on 3P research preview](https://claude.com/docs/cowork/3p/overview). |
+ | [MCP servers](/en/mcp)                                | Configure in settings files                                      | Connectors UI for local and SSH sessions, or settings files                                                                                                                                                                                                                                                                                                                                                                                           |
+ | [Plugins](/en/plugins)                                | `/plugin` command                                                | Plugin manager UI                                                                                                                                                                                                                                                                                                                                                                                                                                     |
+ | @mention files                                        | Text-based                                                       | With autocomplete; local and SSH sessions only                                                                                                                                                                                                                                                                                                                                                                                                        |
+ | File attachments                                      | Not available                                                    | Images, PDFs                                                                                                                                                                                                                                                                                                                                                                                                                                          |
+ | Session isolation                                     | [`--worktree`](/en/cli-reference) flag                           | Automatic worktrees                                                                                                                                                                                                                                                                                                                                                                                                                                   |
+ | Multiple sessions                                     | Separate terminals                                               | Sidebar tabs                                                                                                                                                                                                                                                                                                                                                                                                                                          |
+ | Recurring tasks                                       | Cron jobs, CI pipelines                                          | [Scheduled tasks](/en/desktop-scheduled-tasks)                                                                                                                                                                                                                                                                                                                                                                                                        |
+ | Computer use                                          | [Enable via `/mcp`](/en/computer-use) on macOS                   | [App and screen control](#let-claude-use-your-computer) on macOS and Windows                                                                                                                                                                                                                                                                                                                                                                          |
+ | Dispatch integration                                  | Not available                                                    | [Dispatch sessions](#sessions-from-dispatch) in the sidebar                                                                                                                                                                                                                                                                                                                                                                                           |
+ | Scripting and automation                              | [`--print`](/en/cli-reference), [Agent SDK](/en/headless)        | Not available                                                                                                                                                                                                                                                                                                                                                                                                                                         |
- * **Third-party providers**: Desktop connects to Anthropic's API by default. Enterprise deployments can configure Vertex AI and gateway providers via [managed settings](https://support.claude.com/en/articles/12622667-enterprise-configuration). For Bedrock or Foundry in the CLI, see the [quickstart](/en/quickstart). As an exception to the section above, the [Cowork on 3P research preview](https://claude.com/docs/cowork/3p/overview) runs the Code tab on Bedrock, Vertex AI, Foundry, or a self-hosted LLM gateway.
- * **Linux**: the desktop app is available on macOS and Windows only. On Linux, use the [CLI](/en/quickstart).
+ * **Third-party providers**: Desktop connects to Anthropic's API by default. Enterprise deployments can configure Google Cloud's Agent Platform and gateway providers via [managed settings](https://support.claude.com/en/articles/12622667-enterprise-configuration). For Amazon Bedrock or Microsoft Foundry in the CLI, see the [quickstart](/en/quickstart). As an exception to the section above, the [Cowork on 3P research preview](https://claude.com/docs/cowork/3p/overview) runs the Code tab on Amazon Bedrock, Google Cloud's Agent Platform, Microsoft Foundry, or a self-hosted LLM gateway.
+ * **Linux (beta)**: Computer Use isn't yet available in the Linux desktop app. See [Claude Desktop on Linux](/en/desktop-linux).
- * **Terminal-dialog commands**: built-in commands that open an interactive panel in the terminal, such as `/permissions`, `/config`, `/agents`, and `/doctor`, are not available in the Code tab and reply with `isn't available in this environment`. Edit [settings files](/en/settings) directly to manage permission rules and configuration, or run the command from the standalone CLI.
+ * **Terminal-dialog commands**: built-in commands that open an interactive panel in the terminal, such as `/permissions`, `/config`, and `/doctor`, are not available in the Code tab and reply with `isn't available in this environment`. Edit [settings files](/en/settings) directly to manage permission rules and configuration, or run the command from the standalone CLI.
- 2. Check for pending updates. The app auto-updates on launch.
+ 2. Check for pending updates. On macOS and Windows the app auto-updates on launch; on Linux, update through apt as described in [Claude Desktop on Linux](/en/desktop-linux).
```

### Desktop quickstart
- Источник: https://code.claude.com/docs/en/desktop-quickstart.md
- Изменения: **7** добавлено, **3** удалено
- Затронутые узлы Atlas (черновик): `apps-setup, pl-app-modes`

```diff
- <CardGroup cols={2}>
+ <CardGroup cols={3}>
+ 
+   <Card title="Get Claude for Linux (beta)" icon="linux" href="/en/desktop-linux">
+     apt or .deb for Ubuntu and Debian
+   </Card>
- For Windows ARM64, download the [ARM64 installer](https://claude.ai/api/desktop/win32/arm64/setup/latest/redirect?utm_source=claude_code\&utm_medium=docs). The desktop app is not available on Linux; use the [CLI](/en/quickstart) instead.
+ For Windows ARM64, download the [ARM64 installer](https://claude.ai/api/desktop/win32/arm64/setup/latest/redirect?utm_source=claude_code\&utm_medium=docs). On Linux, install with apt; see [Claude Desktop on Linux](/en/desktop-linux).
-     Download the installer for your platform from the links above and run it. Launch Claude from your Applications folder on macOS or the Start menu on Windows, then sign in with your Anthropic account.
+     On macOS and Windows, download the installer from the links above and run it. On Linux, follow the install steps in [Claude Desktop on Linux](/en/desktop-linux). Launch Claude from your Applications folder on macOS, the Start menu on Windows, or your application launcher on Linux, then sign in with your Anthropic account.
```

### Platforms and integrations
- Источник: https://code.claude.com/docs/en/platforms.md
- Изменения: **1** добавлено, **1** удалено
- Затронутые узлы Atlas (черновик): `pl-platforms, pl-compare`

```diff
- The CLI is the most complete surface for terminal-native work: scripting and the Agent SDK are CLI-only. Third-party providers also work in [VS Code](/en/vs-code#use-third-party-providers). Enterprise [Desktop](/en/desktop) deployments support Vertex AI and gateway providers; for Bedrock or Foundry, use the CLI or VS Code, or the [Cowork on 3P research preview](https://claude.com/docs/cowork/3p/overview), which runs the Code tab on those providers. Desktop and the IDE extensions trade some CLI-only features for visual review and tighter editor integration. The web runs in Anthropic's cloud, so tasks keep going after you disconnect. Mobile is a thin client into those same cloud sessions or into a local session via Remote Control, and can send tasks to Desktop with Dispatch.
+ The CLI is the most complete surface for terminal-native work: scripting and the Agent SDK are CLI-only. Third-party providers also work in [VS Code](/en/vs-code#use-third-party-providers). Enterprise [Desktop](/en/desktop) deployments support Google Cloud's Agent Platform and gateway providers; for Amazon Bedrock or Microsoft Foundry, use the CLI or VS Code, or the [Cowork on 3P research preview](https://claude.com/docs/cowork/3p/overview), which runs the Code tab on those providers. Desktop and the IDE extensions trade some CLI-only features for visual review and tighter editor integration. The web runs in Anthropic's cloud, so tasks keep going after you disconnect. Mobile is a thin client into those same cloud sessions or into a local session via Remote Control, and can send tasks to Desktop with Dispatch.
```

### Индекс всех страниц документации (llms.txt)
- Источник: https://code.claude.com/docs/llms.txt
- Изменения: **14** добавлено, **7** удалено
- Затронутые узлы Atlas (черновик): `новые/удалённые темы в экосистеме`

```diff
- - [Share session output as artifacts](https://code.claude.com/docs/en/artifacts.md): Artifacts turn Claude Code's work into live, interactive pages at a private URL you can share inside your organization.
+ - [Share session output as artifacts](https://code.claude.com/docs/en/artifacts.md): Artifacts turn Claude Code's work into live, interactive pages at a private URL on claude.ai.
- - [Use Claude Code with Chrome (beta)](https://code.claude.com/docs/en/chrome.md): Connect Claude Code to your Chrome browser to test web apps, debug with console logs, automate form filling, and extract data from web pages.
- - [Use Claude Code on the web](https://code.claude.com/docs/en/claude-code-on-the-web.md): Configure cloud environments, setup scripts, network access, and Docker in Anthropic's sandbox. Move sessions between web and terminal with `--remote` and `--teleport`.
+ - [Use Claude Code with Chrome](https://code.claude.com/docs/en/chrome.md): Connect Claude Code to your Chrome browser to test web apps, debug with console logs, automate form filling, and extract data from web pages.
+ - [Claude apps gateway for Amazon Bedrock, Claude Platform on AWS, Google Cloud, and Microsoft Foundry](https://code.claude.com/docs/en/claude-apps-gateway.md): Run Claude Code through Amazon Bedrock, Claude Platform on AWS, Google Cloud, or Microsoft Foundry behind a self-hosted gateway with SSO sign-in, per-group model access, and OTLP telemetry.
+ - [Claude apps gateway configuration](https://code.claude.com/docs/en/claude-apps-gateway-config.md): Reference for every gateway.yaml option: listener and TLS, OIDC, session, Postgres store, Amazon Bedrock, Claude Platform on AWS, Google Cloud's Agent Platform, and Microsoft Foundry upstreams, model routing, managed policies, and telemetry.
+ - [Claude apps gateway deployment and operations](https://code.claude.com/docs/en/claude-apps-gateway-deploy.md): Register the gateway with your IdP, build the container, deploy on Kubernetes or Cloud Run, and operate it: health checks, secret rotation, upgrades, and security.
+ - [Deploy Claude apps gateway on Google Cloud](https://code.claude.com/docs/en/claude-apps-gateway-on-gcp.md): A worked example of running Claude apps gateway on Google Cloud: Cloud Run or GKE, Cloud SQL for PostgreSQL, Secret Manager, and service-account auth to Google Cloud's Agent Platform.
+ - [Claude apps gateway spend limits](https://code.claude.com/docs/en/claude-apps-gateway-spend-limits.md): Cap each developer's spend through the Claude apps gateway by day, week, or month. Set limits with an Admin API and the gateway enforces them live on every request.
+ - [Use Claude Code on the web](https://code.claude.com/docs/en/claude-code-on-the-web.md): Configure cloud environments, setup scripts, network access, and Docker in Anthropic's sandbox. Move sessions between web and terminal with `--cloud` and `--teleport`.
+ - [Claude Desktop on Linux (beta)](https://code.claude.com/docs/en/desktop-linux.md): Install and update the Claude desktop app on Ubuntu and Debian
- - [Feature availability](https://code.claude.com/docs/en/feature-availability.md): Compare which Claude Code features are available across Anthropic subscription plans, the Anthropic Console, Amazon Bedrock, Claude Platform on AWS, Google Vertex AI, and Microsoft Foundry.
+ - [Feature availability](https://code.claude.com/docs/en/feature-availability.md): Compare which Claude Code features are available across Anthropic subscription plans, the Anthropic Console, Amazon Bedrock, Claude Platform on AWS, Google Cloud's Agent Platform, and Microsoft Foundry.
+ - [Run Claude Code through a gateway](https://code.claude.com/docs/en/gateways.md): Route Claude Code through a self-hosted gateway for centralized credentials, usage tracking, and cost controls. Covers the architecture, Anthropic's Claude apps gateway, and using other gateway products.
- - [Claude Code on Google Vertex AI](https://code.claude.com/docs/en/google-vertex-ai.md): Learn about configuring Claude Code through Google Vertex AI, including setup, IAM configuration, and troubleshooting.
+ - [Claude Code on Google Cloud's Agent Platform](https://code.claude.com/docs/en/google-vertex-ai.md): Learn about configuring Claude Code through Google Cloud's Agent Platform, formerly Vertex AI, including setup, IAM configuration, and troubleshooting.
- - [LLM gateways](https://code.claude.com/docs/en/llm-gateway.md): Route Claude Code through an LLM gateway for centralized authentication, usage tracking, and cost controls. Covers connecting Claude Code to a gateway, rolling one out for your organization, what Claude Code sends to a gateway, and how gateways interact with claude.ai subscriptions.
+ - [Other LLM gateways](https://code.claude.com/docs/en/llm-gateway.md): Route Claude Code through an LLM gateway your organization already runs. Covers connecting Claude Code to a gateway, rolling one out for your organization, and what Claude Code sends to a gateway.
- - [Week 23 · June 1–5, 2026](https://code.claude.com/docs/en/whats-new/2026-w23.md): Run auto mode on Bedrock, Vertex, and Foundry, prompt before writing files that can run code in acceptEdits mode, list installed plugins with /plugin list, and require an approved version range for managed deployments.
+ - [Week 23 · June 1–5, 2026](https://code.claude.com/docs/en/whats-new/2026-w23.md): Run auto mode on Amazon Bedrock, Google Cloud's Agent Platform, and Microsoft Foundry, prompt before writing files that can run code in acceptEdits mode, list installed plugins with /plugin list, and require an approved version range for managed deployments.
```

### [help-watch 2026-07-06] Проверить вкладку «Помощь» (Agent Builder)
Изменились функциональные файлы билдера — справка могла устареть:
- `src/builder/data/templates.js`
- `src/builder/services/connectionRules.js`
- `src/builder/components/panels/ScheduleModal.jsx`
- `src/builder/components/panels/ApiKeysModal.jsx`
- `src/builder/components/panels/AllSchedulesModal.jsx`
- `src/builder/components/panels/ExecutionPanel.jsx`
После сверки: `npm run help:watch -- --accept`.

## 📄 docs-watch: документация изменилась — 2026-07-13

> Авто-сигнал от `scripts/docs-watcher.mjs`. Реакция: «сигнал + черновик правок».
> Прогон: прочитать дифф ниже → разнести по узлам Atlas → `node scripts/sync-whats-new.mjs`.

### Desktop app (вкладка Code)
- Источник: https://code.claude.com/docs/en/desktop.md
- Изменения: **85** добавлено, **59** удалено
- Затронутые узлы Atlas (черновик): `pl-desktop, pl-code-mode, apps-setup`

```diff
- * [Preview your running app](#preview-your-app) in an embedded browser while Claude verifies its own changes
- * [Arrange panes](#arrange-your-workspace) for the chat, diff, preview, terminal, and file editor side by side
+ * [Preview your running app](#preview-your-app) in the Browser pane while Claude verifies its own changes, and [open external sites](#browse-external-sites) alongside it
+ * [Arrange panes](#arrange-your-workspace) for the chat, diff, browser, terminal, and file editor side by side
- Permission modes control how much autonomy Claude has during a session: whether it asks before editing files, running commands, or both. You can switch modes at any time using the mode selector next to the send button. Start with Ask permissions to see exactly what Claude does, then move to Auto accept edits or Plan mode as you get comfortable.
+ Permission modes control how much autonomy Claude has during a session: whether it asks before editing files, running commands, or both. You can switch modes at any time using the mode selector next to the send button. Start with Manual to see exactly what Claude does, then move to Accept edits or Plan as you get comfortable.
- | Mode                   | Settings key        | Behavior                                                                                                                                                                                                                                                                                                                                                  |
- | ---------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
- | **Ask permissions**    | `default`           | Claude asks before editing files or running commands. You see a diff and can accept or reject each change. Recommended for new users.                                                                                                                                                                                                                     |
- | **Auto accept edits**  | `acceptEdits`       | Claude auto-accepts file edits and common filesystem commands like `mkdir`, `touch`, and `mv`, but still asks before running other terminal commands. Use this when you trust file changes and want faster iteration.                                                                                                                                     |
- | **Plan mode**          | `plan`              | Claude reads files and runs commands to explore, then proposes a plan without editing your source code. Good for complex tasks where you want to review the approach first.                                                                                                                                                                               |
- | **Auto**               | `auto`              | Claude executes all actions with background safety checks that verify alignment with your request. Reduces permission prompts while maintaining oversight. Enable in your Settings → Claude Code. See [availability requirements](#auto-mode-availability) below.                                                                                         |
- | **Bypass permissions** | `bypassPermissions` | Claude runs without permission prompts, except those forced by explicit [ask rules](/en/permissions#manage-permissions); equivalent to `--dangerously-skip-permissions` in the CLI. Enable in your Settings → Claude Code under "Allow bypass permissions mode". Only use this in sandboxed containers or VMs. Enterprise admins can disable this option. |
+ | Mode                   | Settings key        | Behavior                                                                                                                                                                                                                                                                                                                                                                                                                                        |
+ | ---------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
+ | **Manual**             | `default`           | Claude asks before editing files or running commands. You see a diff and can accept or reject each change. Recommended for new users.                                                                                                                                                                                                                                                                                                           |
+ | **Accept edits**       | `acceptEdits`       | Claude auto-accepts file edits and common filesystem commands like `mkdir`, `touch`, and `mv`, but still asks before running other terminal commands. Use this when you trust file changes and want faster iteration.                                                                                                                                                                                                                           |
+ | **Plan**               | `plan`              | Claude reads files and runs commands to explore, then proposes a plan without editing your source code. Good for complex tasks where you want to review the approach first.                                                                                                                                                                                                                                                                     |
+ | **Auto**               | `auto`              | Claude executes all actions with background safety checks that verify alignment with your request. Reduces permission prompts while maintaining oversight. Enable in your Settings → Claude Code. See [availability requirements](#auto-mode-availability) below.                                                                                                                                                                               |
+ | **Bypass permissions** | `bypassPermissions` | Claude runs without permission prompts, except those forced by explicit [ask rules](/en/permissions#manage-permissions) or by safety classifiers when Claude [acts on external sites](#browse-external-sites); equivalent to `--dangerously-skip-permissions` in the CLI. Enable in your Settings → Claude Code under "Allow bypass permissions mode". Only use this in sandboxed containers or VMs. Enterprise admins can disable this option. |
+ Earlier versions of the Code tab labeled these modes Ask permissions, Auto accept edits, and Plan mode.
+ 
- Auto mode is a research preview available to all users on the Anthropic API and requires Claude Opus 4.6 or later, or Sonnet 4.6 or later. In Enterprise deployments that route Desktop to Google Cloud's Agent Platform, auto mode is off until you [set `CLAUDE_CODE_ENABLE_AUTO_MODE`](/en/permission-modes#enable-auto-mode-on-bedrock-agent-platform-or-foundry), and only Claude Sonnet 5, Opus 4.7, and Opus 4.8 are supported there.
+ Auto mode is available to all users on the Anthropic API and requires Claude Opus 4.6 or later, or Sonnet 4.6 or later. In Enterprise deployments that route Desktop to Google Cloud's Agent Platform, auto mode is off until you [set `CLAUDE_CODE_ENABLE_AUTO_MODE`](/en/permission-modes#enable-auto-mode-on-bedrock-agent-platform-or-foundry), and only Claude Sonnet 5, Opus 4.7, and Opus 4.8 are supported there.
-   Start complex tasks in Plan mode so Claude maps out an approach before making changes. Once you approve the plan, switch to Auto accept edits or Ask permissions to execute it. See [explore first, then plan, then code](/en/best-practices#explore-first-then-plan-then-code) for more on this workflow.
+   Start complex tasks in Plan so Claude maps out an approach before making changes. Once you approve the plan, switch to Accept edits or Manual to execute it. See [explore first, then plan, then code](/en/best-practices#explore-first-then-plan-then-code) for more on this workflow.
- Cloud sessions support Accept edits, Plan mode, and Auto mode. Accept edits corresponds to `default` mode: cloud sessions pre-approve file edits, so the selector shows Accept edits instead of Ask permissions. Bypass permissions is not available because the cloud environment is already sandboxed.
+ Cloud sessions support Accept edits, Plan, and Auto. Accept edits corresponds to `default` mode: cloud sessions pre-approve file edits, so the selector shows Accept edits instead of Manual. Bypass permissions is not available because the cloud environment is already sandboxed.
- Claude can start a dev server and open an embedded browser to verify its changes. This works for frontend web apps as well as backend servers: Claude can test API endpoints, view server logs, and iterate on issues it finds. In most cases, Claude starts the server automatically after editing project files. You can also ask Claude to preview at any time. By default, Claude [auto-verifies](#auto-verify-changes) changes after every edit.
+ Claude can start a dev server and open it in the Browser pane to verify its changes. This works for frontend web apps as well as backend servers: Claude can test API endpoints, view server logs, and iterate on issues it finds. In most cases, Claude starts the server automatically after editing project files. You can also ask Claude to preview at any time. By default, Claude [auto-verifies](#auto-verify-changes) changes after every edit.
- The preview pane can also open static HTML files, PDFs, images, and videos from your project. Click an HTML, PDF, image, or video path in the chat to open it in preview.
+ The Browser pane can also open static HTML files, PDFs, images, and videos from your project. Click an HTML, PDF, image, or video path in the chat to open it there.
- From the preview pane, you can:
+ From the Browser pane, you can:
- * Interact with your running app directly in the embedded browser
+ * Interact with your running app directly in the Browser pane
- * Start or stop servers from the **Preview** dropdown in the session toolbar
+ * Start or stop servers from the server dropdown in the session toolbar
- To clear saved session data, toggle **Persist preview sessions** off in Settings → Claude Code. To disable preview entirely, toggle off **Preview** in Settings → Claude Code.
+ To clear saved session data, or to turn the Browser off entirely, use the toggles in Settings → Claude Code.
+ ### Browse external sites
+ 
+ The Browser pane is a tabbed browser, so you can open documentation, issue trackers, or any other site next to your running app. To open the Browser, press **Cmd+Shift+B** on macOS or **Ctrl+Shift+B** on Windows, or select it from the **Views** menu. When you click an external link in the chat, a chooser offers **Open in app** to use the Browser pane or **Default browser** to use your own; **Cmd**-click on macOS or **Ctrl**-click on Windows opens a link in your system browser directly. You can sign in to sites in the pane, including popup sign-in flows such as Google OAuth.
+ 
+ Claude can read and interact with external pages using the same tools it uses to [verify your app](#preview-your-app), with two additional safety checks:
+ 
+ * Safety classifiers review Claude's write actions on external pages, such as clicking and typing, in every permission mode. These are the same classifiers [auto mode](#choose-a-permission-mode) uses, and when they flag an action, you get a permission prompt regardless of mode.
+ * In permission modes other than Auto and Bypass permissions, a domain allowlist check also applies before Claude navigates to a new site.
+ 
+ #### Approve Claude's actions on a site
+ 
+ The first time Claude acts on an external site, a permission card appears and Claude waits for your choice: **Allow once**, **Always allow**, or **Deny**. **Allow once** approves the action without saving anything. **Always allow** saves the approval for that site on your device, and you can revoke it in Settings. Each site needs its own approval, including subdomains. Your local dev servers and project files don't need approval, so [auto-verify](#auto-verify-changes) keeps working without prompts.
+ 
+ Even on an approved site, Claude won't purchase items, create accounts, or bypass CAPTCHAs without your input. Browsing in the Browser pane uses the same safety model as the [Claude in Chrome extension](/en/chrome). See [Using Claude in Chrome safely](https://support.claude.com/en/articles/12902428-using-claude-in-chrome-safely) for how Claude handles sensitive sites and risky actions.
+ 
+ #### Choose between the Browser and the Chrome extension
+ 
+ The Browser pane uses a clean browser profile, separate from your personal browser, with none of your saved logins or history. Use it for building and testing your app and for sites that don't need your identity. When you want Claude to act as you in your logged-in sessions, use the [Claude in Chrome extension](/en/chrome) instead, which shares your browser's login state.
+ 
+ #### Restrict external browsing for your organization
+ 
+ The Browser follows the same [site allowlist and blocklist controls](https://support.claude.com/en/articles/13065128-claude-in-chrome-admin-controls) as the Claude in Chrome extension. If your organization already configured those lists for the extension, the Browser respects them automatically. Administrators can also turn off Claude's tools on external pages with the [`browserExternalPageTools` managed setting](#managed-settings). With tools disabled, users can still navigate to external sites; Claude's tools can't read or act on them.
+ 
- The Code tab is built around panes you can arrange in any layout: chat, diff, preview, terminal, file, plan, tasks, and subagent. Drag a pane by its header to reposition it, or drag a pane edge to resize it. Press **Cmd+\\** on macOS or **Ctrl+\\** on Windows to close the focused pane. Open additional panes from the **Views** menu in the session toolbar.
+ The Code tab is built around panes you can arrange in any layout: chat, diff, browser, terminal, file, plan, tasks, and subagent. Drag a pane by its header to reposition it, or drag a pane edge to resize it. Press **Cmd+\\** on macOS or **Ctrl+\\** on Windows to close the focused pane. Open additional panes from the **Views** menu in the session toolbar.
- Click a file path in the chat or diff viewer to open it in the file pane. HTML, PDF, image, and video paths open in the [preview pane](#preview-your-app) instead. Make spot edits and click **Save** to write them back. If the file changed on disk since you opened it, the pane warns you and lets you override or discard. Click **Discard** to revert your edits, or click the path in the pane header to copy the absolute path.
+ Click a file path in the chat or diff viewer to open it in the file pane. HTML, PDF, image, and video paths open in the [Browser pane](#preview-your-app) instead. Make spot edits and click **Save** to write them back. If the file changed on disk since you opened it, the pane warns you and lets you override or discard. Click **Discard** to revert your edits, or click the path in the pane header to copy the absolute path.
- | Shortcut                              | Action                       |
- | ------------------------------------- | ---------------------------- |
- | `Cmd` `/`                             | Show keyboard shortcuts      |
- | `Cmd` `N`                             | New session                  |
- | `Cmd` `W`                             | Close session                |
- | `Ctrl` `Tab` / `Ctrl` `Shift` `Tab`   | Next or previous session     |
- | `Cmd` `Shift` `]` / `Cmd` `Shift` `[` | Next or previous session     |
- | `Esc`                                 | Stop Claude's response       |
- | `Cmd` `Shift` `D`                     | Toggle diff pane             |
- | `Cmd` `Shift` `P`                     | Toggle preview pane          |
- | `Cmd` `Shift` `S`                     | Select an element in preview |
- | `Ctrl` `` ` ``                        | Toggle terminal pane         |
- | `Cmd` `\`                             | Close focused pane           |
- | `Cmd` `;`                             | Open side chat               |
- | `Ctrl` `O`                            | Cycle view modes             |
- | `Cmd` `Shift` `M`                     | Open permission mode menu    |
- | `Cmd` `Shift` `I`                     | Open model menu              |
- | `Cmd` `Shift` `E`                     | Open effort menu             |
- | `1`–`9`                               | Select item in an open menu  |
+ | Shortcut                              | Action                           |
+ | ------------------------------------- | -------------------------------- |
+ | `Cmd` `/`                             | Show keyboard shortcuts          |
+ | `Cmd` `N`                             | New session                      |
+ | `Cmd` `W`                             | Close session                    |
+ | `Ctrl` `Tab` / `Ctrl` `Shift` `Tab`   | Next or previous session         |
+ | `Cmd` `Shift` `]` / `Cmd` `Shift` `[` | Next or previous session         |
+ | `Esc`                                 | Stop Claude's response           |
+ | `Cmd` `Shift` `D`                     | Toggle diff pane                 |
+ | `Cmd` `Shift` `B`                     | Toggle Browser pane              |
+ | `Cmd` `Shift` `S`                     | Select an element in the Browser |
+ | `Ctrl` `` ` ``                        | Toggle terminal pane             |
+ | `Cmd` `\`                             | Close focused pane               |
+ | `Cmd` `;`                             | Open side chat                   |
+ | `Ctrl` `O`                            | Cycle view modes                 |
+ | `Cmd` `Shift` `M`                     | Open permission mode menu        |
+ | `Cmd` `Shift` `I`                     | Open model menu                  |
+ | `Cmd` `Shift` `E`                     | Open effort menu                 |
+ | `1`–`9`                               | Select item in an open menu      |
- To customize how your server starts, for example to use `yarn dev` instead of `npm run dev` or to change the port, edit the file manually or click **Edit configuration** in the Preview dropdown to open it in your code editor. The file supports JSON with comments.
+ To customize how your server starts, for example to use `yarn dev` instead of `npm run dev` or to change the port, edit the file manually or click **Edit configuration** in the server dropdown to open it in your code editor. The file supports JSON with comments.
- Auto-verify is on by default. Disable it per-project by adding `"autoVerify": false` to `.claude/launch.json`, or toggle it from the **Preview** dropdown menu.
+ Auto-verify is on by default. Disable it per-project by adding `"autoVerify": false` to `.claude/launch.json`, or toggle it from the server dropdown menu.
+ | `browserExternalPageTools`                 | set to `"disabled"` to prevent Claude from using tools to read or act on external pages in the [Browser pane](#browse-external-sites). Users can still navigate to external sites themselves, and local dev server previews are unaffected.                                                                                                                                                                                                             |
- | Feature                                               | CLI                                                              | Desktop                                                                                                                                                                                                                                                                                                                                                                                                                                               |
- | ----------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
- | Permission modes                                      | All modes including `dontAsk`                                    | Ask permissions, Auto accept edits, Plan mode, Auto, and Bypass permissions via Settings                                                                                                                                                                                                                                                                                                                                                              |
- | `--dangerously-skip-permissions`                      | CLI flag                                                         | Bypass permissions mode. Enable in Settings → Claude Code → "Allow bypass permissions mode"                                                                                                                                                                                                                                                                                                                                                           |
- | [Third-party providers](/en/third-party-integrations) | Amazon Bedrock, Google Cloud's Agent Platform, Microsoft Foundry | Anthropic's API by default. Enterprise deployments can configure Google Cloud's Agent Platform and gateway providers. See the [enterprise configuration guide](https://support.claude.com/en/articles/12622667-enterprise-configuration). To run the Code tab on Amazon Bedrock, Google Cloud's Agent Platform, Microsoft Foundry, or a self-hosted LLM gateway, see the [Cowork on 3P research preview](https://claude.com/docs/cowork/3p/overview). |
- | [MCP servers](/en/mcp)                                | Configure in settings files                                      | Connectors UI for local and SSH sessions, or settings files                                                                                                                                                                                                                                                                                                                                                                                           |
- | [Plugins](/en/plugins)                                | `/plugin` command                                                | Plugin manager UI                                                                                                                                                                                                                                                                                                                                                                                                                                     |
- | @mention files                                        | Text-based                                                       | With autocomplete; local and SSH sessions only                                                                                                                                                                                                                                                                                                                                                                                                        |
- | File attachments                                      | Not available                                                    | Images, PDFs                                                                                                                                                                                                                                                                                                                                                                                                                                          |
- | Session isolation                                     | [`--worktree`](/en/cli-reference) flag                           | Automatic worktrees                                                                                                                                                                                                                                                                                                                                                                                                                                   |
- | Multiple sessions                                     | Separate terminals                                               | Sidebar tabs                                                                                                                                                                                                                                                                                                                                                                                                                                          |
- | Recurring tasks                                       | Cron jobs, CI pipelines                                          | [Scheduled tasks](/en/desktop-scheduled-tasks)                                                                                                                                                                                                                                                                                                                                                                                                        |
- | Computer use                                          | [Enable via `/mcp`](/en/computer-use) on macOS                   | [App and screen control](#let-claude-use-your-computer) on macOS and Windows                                                                                                                                                                                                                                                                                                                                                                          |
- | Dispatch integration                                  | Not available                                                    | [Dispatch sessions](#sessions-from-dispatch) in the sidebar                                                                                                                                                                                                                                                                                                                                                                                           |
- | Scripting and automation                              | [`--print`](/en/cli-reference), [Agent SDK](/en/headless)        | Not available                                                                                                                                                                                                                                                                                                                                                                                                                                         |
+ | Feature                                               | CLI                                                              | Desktop                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
+ | ----------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
+ | Permission modes                                      | All modes including `dontAsk`                                    | Manual, Accept edits, and Plan. Auto and Bypass permissions appear in the mode selector after you enable them in Settings                                                                                                                                                                                                                                                                                                                                 |
+ | `--dangerously-skip-permissions`                      | CLI flag                                                         | Bypass permissions mode. Enable in Settings → Claude Code → "Allow bypass permissions mode"                                                                                                                                                                                                                                                                                                                                                               |
+ | [Third-party providers](/en/third-party-integrations) | Amazon Bedrock, Google Cloud's Agent Platform, Microsoft Foundry | Anthropic's API by default. Enterprise deployments can configure Google Cloud's Agent Platform and gateway providers. See the [enterprise configuration guide](https://support.claude.com/en/articles/12622667-enterprise-configuration). To run the Code tab on Amazon Bedrock, Google Cloud's Agent Platform, Microsoft Foundry, or a self-hosted LLM gateway, see [Claude Desktop on 3P](https://claude.com/docs/third-party/claude-desktop/overview). |
+ | [MCP servers](/en/mcp)                                | Configure in settings files                                      | Connectors UI for local and SSH sessions, or settings files                                                                                                                                                                                                                                                                                                                                                                                               |
+ | [Plugins](/en/plugins)                                | `/plugin` command                                                | Plugin manager UI                                                                                                                                                                                                                                                                                                                                                                                                                                         |
+ | @mention files                                        | Text-based                                                       | With autocomplete; local and SSH sessions only                                                                                                                                                                                                                                                                                                                                                                                                            |
+ | File attachments                                      | Not available                                                    | Images, PDFs                                                                                                                                                                                                                                                                                                                                                                                                                                              |
+ | Session isolation                                     | [`--worktree`](/en/cli-reference) flag                           | Automatic worktrees                                                                                                                                                                                                                                                                                                                                                                                                                                       |
+ | Multiple sessions                                     | Separate terminals                                               | Sidebar tabs                                                                                                                                                                                                                                                                                                                                                                                                                                              |
+ | Recurring tasks                                       | Cron jobs, CI pipelines                                          | [Scheduled tasks](/en/desktop-scheduled-tasks)                                                                                                                                                                                                                                                                                                                                                                                                            |
+ | Computer use                                          | [Enable via `/mcp`](/en/computer-use) on macOS                   | [App and screen control](#let-claude-use-your-computer) on macOS and Windows                                                                                                                                                                                                                                                                                                                                                                              |
+ | Dispatch integration                                  | Not available                                                    | [Dispatch sessions](#sessions-from-dispatch) in the sidebar                                                                                                                                                                                                                                                                                                                                                                                               |
+ | Scripting and automation                              | [`--print`](/en/cli-reference), [Agent SDK](/en/headless)        | Not available                                                                                                                                                                                                                                                                                                                                                                                                                                             |
- * **Third-party providers**: Desktop connects to Anthropic's API by default. Enterprise deployments can configure Google Cloud's Agent Platform and gateway providers via [managed settings](https://support.claude.com/en/articles/12622667-enterprise-configuration). For Amazon Bedrock or Microsoft Foundry in the CLI, see the [quickstart](/en/quickstart). As an exception to the section above, the [Cowork on 3P research preview](https://claude.com/docs/cowork/3p/overview) runs the Code tab on Amazon Bedrock, Google Cloud's Agent Platform, Microsoft Foundry, or a self-hosted LLM gateway.
+ * **Third-party providers**: Desktop connects to Anthropic's API by default. Enterprise deployments can configure Google Cloud's Agent Platform and gateway providers via [managed settings](https://support.claude.com/en/articles/12622667-enterprise-configuration). For Amazon Bedrock or Microsoft Foundry in the CLI, see the [quickstart](/en/quickstart). As an exception to the section above, [Claude Desktop on 3P](https://claude.com/docs/third-party/claude-desktop/overview) runs the Code tab on Amazon Bedrock, Google Cloud's Agent Platform, Microsoft Foundry, or a self-hosted LLM gateway.
- * **Terminal-dialog commands**: built-in commands that open an interactive panel in the terminal, such as `/permissions`, `/config`, and `/doctor`, are not available in the Code tab and reply with `isn't available in this environment`. Edit [settings files](/en/settings) directly to manage permission rules and configuration, or run the command from the standalone CLI.
+ * **Terminal-dialog commands**: built-in commands that open an interactive panel in the terminal, such as `/permissions` and `/config`, are not available in the Code tab and reply with `isn't available in this environment`. `/config` sets a setting when you pass `key=value`, for example `/config theme=dark`; only its picker form is unavailable. Edit [settings files](/en/settings) directly to manage permission rules and configuration, or run the command from the standalone CLI.
```

### Desktop quickstart
- Источник: https://code.claude.com/docs/en/desktop-quickstart.md
- Изменения: **8** добавлено, **4** удалено
- Затронутые узлы Atlas (черновик): `apps-setup, pl-app-modes`

```diff
-     By default, the Code tab starts in [Ask permissions mode](/en/desktop#choose-a-permission-mode), where Claude proposes changes and waits for your approval before applying them. You'll see:
+     By default, the Code tab starts in [Manual mode](/en/desktop#choose-a-permission-mode), where Claude proposes changes and waits for your approval before applying them. You'll see:
- **Adjust how much control you have.** Your [permission mode](/en/desktop#choose-a-permission-mode) controls the balance. Ask permissions (default) requires approval before every edit. Auto accept edits auto-accepts file edits for faster iteration. Plan mode lets Claude map out an approach without touching any files, which is useful before a large refactor.
+ **Adjust how much control you have.** Your [permission mode](/en/desktop#choose-a-permission-mode) sets how much Claude can do without asking for approval:
+ * **Manual**: the default. Claude asks before editing files or running commands.
+ * **Accept edits**: Claude auto-accepts file edits for faster iteration.
+ * **Plan**: Claude proposes an approach without editing any files, which is useful before a large refactor.
+ 
- **Arrange your workspace.** Drag the chat, diff, terminal, file, and preview panes into whatever layout you want. Open the terminal with **Ctrl+\`** to run commands alongside your session, or click a file path to open it in the file pane. See [Arrange your workspace](/en/desktop#arrange-your-workspace).
+ **Arrange your workspace.** Drag the chat, diff, terminal, file, and browser panes into whatever layout you want. Open the terminal with **Ctrl+\`** to run commands alongside your session, or click a file path to open it in the file pane. See [Arrange your workspace](/en/desktop#arrange-your-workspace).
- **Preview your app.** Click the **Preview** dropdown to run your dev server directly in the desktop. Claude can view the running app, test endpoints, inspect logs, and iterate on what it sees. See [Preview your app](/en/desktop#preview-your-app).
+ **Preview your app.** When you run your dev server in the desktop, your app opens in the Browser pane, which can also [open external sites](/en/desktop#browse-external-sites). Claude can view the running app, test endpoints, inspect logs, and iterate on what it sees. See [Preview your app](/en/desktop#preview-your-app).
```

### Platforms and integrations
- Источник: https://code.claude.com/docs/en/platforms.md
- Изменения: **1** добавлено, **1** удалено
- Затронутые узлы Atlas (черновик): `pl-platforms, pl-compare`

```diff
- The CLI is the most complete surface for terminal-native work: scripting and the Agent SDK are CLI-only. Third-party providers also work in [VS Code](/en/vs-code#use-third-party-providers). Enterprise [Desktop](/en/desktop) deployments support Google Cloud's Agent Platform and gateway providers; for Amazon Bedrock or Microsoft Foundry, use the CLI or VS Code, or the [Cowork on 3P research preview](https://claude.com/docs/cowork/3p/overview), which runs the Code tab on those providers. Desktop and the IDE extensions trade some CLI-only features for visual review and tighter editor integration. The web runs in Anthropic's cloud, so tasks keep going after you disconnect. Mobile is a thin client into those same cloud sessions or into a local session via Remote Control, and can send tasks to Desktop with Dispatch.
+ The CLI is the most complete surface for terminal-native work: scripting and the Agent SDK are CLI-only. Third-party providers also work in [VS Code](/en/vs-code#use-third-party-providers). Enterprise [Desktop](/en/desktop) deployments support Google Cloud's Agent Platform and gateway providers; for Amazon Bedrock or Microsoft Foundry, use the CLI or VS Code, or [Claude Desktop on 3P](https://claude.com/docs/third-party/claude-desktop/overview), which runs the Code tab on those providers. Desktop and the IDE extensions trade some CLI-only features for visual review and tighter editor integration. The web runs in Anthropic's cloud, so tasks keep going after you disconnect. Mobile is a thin client into those same cloud sessions or into a local session via Remote Control, and can send tasks to Desktop with Dispatch.
```

### Индекс всех страниц документации (llms.txt)
- Источник: https://code.claude.com/docs/llms.txt
- Изменения: **2** добавлено, **0** удалено
- Затронутые узлы Atlas (черновик): `новые/удалённые темы в экосистеме`

```diff
+ - [Week 27 · June 29 – July 3, 2026](https://code.claude.com/docs/en/whats-new/2026-w27.md): Claude Sonnet 5 becomes the default model, Claude in Chrome reaches general availability, subagents run in the background by default, Claude Desktop arrives on Linux in beta, and /radio tunes into Claude FM.
+ - [Week 28 · July 6–10, 2026](https://code.claude.com/docs/en/whats-new/2026-w28.md): Browse external sites from the Desktop app's built-in browser, run a full setup checkup with /doctor, and pick up auto mode transcript protections and agent view upgrades.
```

### [help-watch 2026-07-13] Проверить вкладку «Помощь» (Agent Builder)
Изменились функциональные файлы билдера — справка могла устареть:
- `src/builder/data/templates.js`
- `src/builder/services/connectionRules.js`
- `src/builder/components/panels/ScheduleModal.jsx`
- `src/builder/components/panels/ApiKeysModal.jsx`
- `src/builder/components/panels/AllSchedulesModal.jsx`
- `src/builder/components/panels/ExecutionPanel.jsx`
После сверки: `npm run help:watch -- --accept`.

## 📄 docs-watch: документация изменилась — 2026-07-20

> Авто-сигнал от `scripts/docs-watcher.mjs`. Реакция: «сигнал + черновик правок».
> Прогон: прочитать дифф ниже → разнести по узлам Atlas → `node scripts/sync-whats-new.mjs`.

### Desktop app (вкладка Code)
- Источник: https://code.claude.com/docs/en/desktop.md
- Изменения: **114** добавлено, **52** удалено
- Затронутые узлы Atlas (черновик): `pl-desktop, pl-code-mode, apps-setup`

```diff
- * **Environment**: choose where Claude runs. Select **Local** for your machine, **Remote** for Anthropic-hosted cloud sessions, or an [**SSH connection**](#ssh-sessions) for a remote machine you manage. See [environment configuration](#environment-configuration).
+ * **Environment**: choose where Claude runs. Select **Local** for your machine, **Remote** for Anthropic-hosted cloud sessions, an [**SSH connection**](#ssh-sessions) for a remote machine you manage, or on Windows a [**WSL distribution**](/en/desktop-wsl). See [environment configuration](#environment-configuration).
- * **@mention files**: type `@` followed by a filename to add a file to the conversation context. Claude can then read and reference that file. @mention is not available in cloud sessions.
+ * **@mention files**: type `@` followed by a filename to add a file to the conversation context. Claude can then read and reference that file. @mention is not available in cloud or WSL sessions.
- | Mode                   | Settings key        | Behavior                                                                                                                                                                                                                                                                                                                                                                                                                                        |
- | ---------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
- | **Manual**             | `default`           | Claude asks before editing files or running commands. You see a diff and can accept or reject each change. Recommended for new users.                                                                                                                                                                                                                                                                                                           |
- | **Accept edits**       | `acceptEdits`       | Claude auto-accepts file edits and common filesystem commands like `mkdir`, `touch`, and `mv`, but still asks before running other terminal commands. Use this when you trust file changes and want faster iteration.                                                                                                                                                                                                                           |
- | **Plan**               | `plan`              | Claude reads files and runs commands to explore, then proposes a plan without editing your source code. Good for complex tasks where you want to review the approach first.                                                                                                                                                                                                                                                                     |
- | **Auto**               | `auto`              | Claude executes all actions with background safety checks that verify alignment with your request. Reduces permission prompts while maintaining oversight. Enable in your Settings → Claude Code. See [availability requirements](#auto-mode-availability) below.                                                                                                                                                                               |
- | **Bypass permissions** | `bypassPermissions` | Claude runs without permission prompts, except those forced by explicit [ask rules](/en/permissions#manage-permissions) or by safety classifiers when Claude [acts on external sites](#browse-external-sites); equivalent to `--dangerously-skip-permissions` in the CLI. Enable in your Settings → Claude Code under "Allow bypass permissions mode". Only use this in sandboxed containers or VMs. Enterprise admins can disable this option. |
+ To set a default mode for new local sessions, add `permissions.defaultMode` to your [settings file](/en/settings#settings-files). The desktop app reads the same settings files as the CLI. A mode you pick in the selector is remembered per folder and takes precedence over `defaultMode` for that folder, except Plan, which applies to the current session only.
+ | Mode                   | Settings key        | Behavior                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
+ | ---------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
+ | **Manual**             | `default`           | Claude asks before editing files or running commands. You see a diff and can accept or reject each change. Recommended for new users.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
+ | **Accept edits**       | `acceptEdits`       | Claude auto-accepts file edits and common filesystem commands like `mkdir`, `touch`, and `mv`, but still asks before running other terminal commands. Use this when you trust file changes and want faster iteration.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
+ | **Plan**               | `plan`              | Claude reads files and runs commands to explore, then proposes a plan without editing your source code. Good for complex tasks where you want to review the approach first.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
+ | **Auto**               | `auto`              | Claude executes all actions with background safety checks that verify alignment with your request. Reduces permission prompts while maintaining oversight. Appears when your account meets the [availability requirements](#auto-mode-availability) below; there is no separate Settings toggle for it.                                                                                                                                                                                                                                                                                                                                                                                                                            |
+ | **Bypass permissions** | `bypassPermissions` | Claude runs without permission prompts, except those forced by explicit [ask rules](/en/permissions#manage-permissions), connector tools [your organization set to `ask`](/en/mcp#organization-controls-on-connector-tools), MCP tools marked [`requiresUserInteraction`](/en/mcp#require-approval-for-a-specific-tool), or safety classifiers when Claude [acts on external sites](#browse-external-sites); equivalent to `--dangerously-skip-permissions` in the CLI. On Pro and Max plans, enable it in your Settings → Claude Code under "Allow bypass permissions mode"; on Team and Enterprise plans there is no Settings toggle, and organization policy controls it instead. Only use this in sandboxed containers or VMs. |
+ 
- Auto mode is available to all users on the Anthropic API and requires Claude Opus 4.6 or later, or Sonnet 4.6 or later. In Enterprise deployments that route Desktop to Google Cloud's Agent Platform, auto mode is off until you [set `CLAUDE_CODE_ENABLE_AUTO_MODE`](/en/permission-modes#enable-auto-mode-on-bedrock-agent-platform-or-foundry), and only Claude Sonnet 5, Opus 4.7, and Opus 4.8 are supported there.
+ Auto mode is available to all users on the Anthropic API and requires Claude Opus 4.6 or later, Sonnet 4.6 or later, or Fable 5. Organization administrators can turn auto mode off with the `disableAutoMode` key in [managed settings](#managed-settings).
+ In Enterprise deployments that route Desktop to Google Cloud's Agent Platform, auto mode is [available by default](/en/permission-modes#enable-auto-mode-on-bedrock-agent-platform-or-foundry), and only Claude Sonnet 5, Opus 4.7, Opus 4.8, and Fable 5 are supported there. {/* min-version: 2.1.207 */}Before Claude Code v2.1.207, Enterprise deployments on Google Cloud's Agent Platform had to set `CLAUDE_CODE_ENABLE_AUTO_MODE` to enable auto mode.
+ 
+ To turn off external browsing entirely, set the [`disableBrowserExternalNavigation` managed setting](#managed-settings) to `true`. This blocks all external navigation in the Browser, including sites on your organization's allowlist; localhost dev servers and file previews keep working. Use `browserExternalPageTools` to let users keep browsing external sites without Claude's tools, and `disableBrowserExternalNavigation` to block external sites for both users and Claude.
+ 
-     Make sure you have the latest version of Claude Desktop. Download or update at [claude.com/download](https://claude.com/download), then restart the app.
+     Make sure you have the latest version of Claude Desktop. On macOS and Windows, download or update at [claude.com/download](https://claude.com/download); on Linux, update through your package manager ([instructions](/en/desktop-linux)). Then restart the app.
- Press **Cmd+;** on macOS or **Ctrl+;** on Windows to open a side chat, or type `/btw` in the prompt box. The side chat can read everything in the main thread up to that point. When you're done, close the side chat and continue the main session where you left off. Side chats are available in local and SSH sessions.
+ Press **Cmd+;** on macOS or **Ctrl+;** on Windows to open a side chat, or type `/btw` in the prompt box. The side chat can read everything in the main thread up to that point. When you're done, close the side chat and continue the main session where you left off. Side chats are available in local, SSH, and WSL sessions.
- For large refactors, test suites, migrations, or other long-running tasks, select **Remote** instead of **Local** when starting a session. Cloud sessions run on Anthropic's cloud infrastructure and continue even if you close the app or shut down your computer. Check back anytime to see progress or steer Claude in a different direction. You can also monitor cloud sessions from [claude.ai/code](https://claude.ai/code) or the Claude iOS app.
+ For large refactors, test suites, migrations, or other long-running tasks, select **Remote** instead of **Local** when starting a session. Cloud sessions run on Anthropic's cloud infrastructure and continue even if you close the app or shut down your computer. Check back anytime to see progress or steer Claude in a different direction. You can also monitor cloud sessions from [claude.ai/code](https://claude.ai/code) or the [Claude mobile app](/en/mobile).
- [Dispatch](https://support.claude.com/en/articles/13947068) is a persistent conversation with Claude that lives in the [Cowork](https://claude.com/product/cowork#dispatch-and-computer-use) tab. You message Dispatch a task, and it decides how to handle it.
+ [Dispatch](https://support.claude.com/en/articles/13947068) is a persistent conversation with Claude that lives in the [Cowork](https://claude.com/product/cowork) tab. You message Dispatch a task, and it decides how to handle it.
- Connect external services, add reusable workflows, customize Claude's behavior, and configure preview servers. To manage connectors, skills, and plugins in one place, click **Customize** in the sidebar.
+ Connect external services, add reusable workflows, customize Claude's behavior, and configure preview servers. To manage connectors, skills, and plugins in one place, click **Customize** in the sidebar. The [Cowork](https://claude.com/product/cowork) tab in the Desktop app sources its skills, plugins, and connectors from this Customize configuration, which syncs through your claude.ai account, not from the CLI's `~/.claude` directory.
- For local and [SSH](#ssh-sessions) sessions, click the **+** button next to the prompt box and select **Connectors** to add integrations like Google Calendar, Slack, GitHub, Linear, Notion, and more. You can add connectors before or during a session. The **+** button is not available in cloud sessions, but [routines](/en/routines) configure connectors at routine creation time.
+ For local and [SSH](#ssh-sessions) sessions, click the **+** button next to the prompt box and select **Connectors** to add integrations like Google Calendar, Slack, GitHub, Linear, Notion, and more. You can add connectors before or during a session. The **+** button is not available in cloud or WSL sessions, but [routines](/en/routines) configure connectors at routine creation time.
+ You can send a command while Claude is working, the same as any other message, and the session returns to idle once the turn finishes. Before v2.1.206, a command sent mid-turn could leave the session showing as running and messages you sent afterward weren't delivered.
+ 
+ Personal skills in `~/.claude/skills/` apply to local sessions; an [SSH](#ssh-sessions) session reads `~/.claude/skills/` from the remote host's home directory, not from your machine. Cloud sessions load the skills enabled for your claude.ai account instead. See [Skills in Cowork and cloud sessions](/en/skills#skills-in-cowork-and-cloud-sessions).
+ 
- Plugins can be scoped to your user account, a specific project, or local-only. If your organization manages plugins centrally, those plugins are available in desktop sessions the same way they are in the CLI. Plugins are not available for cloud sessions. For the full plugin reference including creating your own plugins, see [plugins](/en/plugins).
+ Plugins can be scoped to your user account, a specific project, or local-only. If your organization manages plugins centrally, those plugins are available in desktop sessions the same way they are in the CLI. The plugin browser is not available in cloud sessions, and plugins you install from the desktop app aren't available for cloud sessions; to use a plugin in a cloud session, declare it in the repository's `.claude/settings.json` under [`enabledPlugins`](/en/settings#enabledplugins) so it [installs at session start](/en/claude-code-on-the-web#what’s-available-in-cloud-sessions). Plugins aren't available in WSL sessions. For the full plugin reference including creating your own plugins, see [plugins](/en/plugins).
+ * **WSL** (Windows): runs inside a [WSL 2 distribution](/en/desktop-wsl) on your machine, using its Linux toolchain and native paths
+ | `disableBrowserExternalNavigation`         | set to `true` to turn off external browsing in the [Browser pane](#browse-external-sites) entirely. Neither users nor Claude can navigate to external sites, and localhost dev server previews are unaffected. The value must be the JSON boolean `true`; the string `"true"` is ignored.                                                                                                                                                               |
- `permissions.disableBypassPermissionsMode` and `disableAutoMode` also work in user and project settings, but placing them in managed settings prevents users from overriding them. `autoMode` is read from user settings, `.claude/settings.local.json`, and managed settings, but not from the checked-in `.claude/settings.json`: a cloned repo cannot inject its own classifier rules. For the complete list of managed-only settings including `allowManagedPermissionRulesOnly` and `allowManagedHooksOnly`, see [managed-only settings](/en/permissions#managed-only-settings).
+ `permissions.disableBypassPermissionsMode` and `disableAutoMode` also work in user and project settings, but placing them in managed settings prevents users from overriding them.
+ {/* min-version: 2.1.207 */}Claude Code reads `autoMode` from user settings, the `--settings` flag, and managed settings, but not from `.claude/settings.json` or `.claude/settings.local.json`: both files live in the repo directory, so a cloned repo or build step can't inject its own classifier rules. Before v2.1.207, Claude Code also read `.claude/settings.local.json`.
+ 
+ For the complete list of managed-only settings including `allowManagedPermissionRulesOnly` and `allowManagedHooksOnly`, see [managed-only settings](/en/permissions#managed-only-settings).
+ 
+ ### Network access requirements
+ 
+ Desktop loads its application code and user content from Anthropic CDN hosts.
+ 
+ ```text theme={null}
+ anthropic.com
+ *.anthropic.com
+ claude.ai
+ *.claude.ai
+ claude.com
+ *.claude.com
+ claude.app
+ *.claude.app
+ *.claudeusercontent.com
+ *.claudemcpcontent.com
+ ```
+ 
+ Traffic is HTTPS on port 443 unless you configure a custom port for [OTLP](/en/monitoring-usage), an LLM gateway, or an MCP server.
+ 
+ For proxy servers, custom certificate authorities, mTLS, and the domains the standalone CLI needs, see [network configuration](/en/network-config).
+ 
+ To reduce the number of firewall wildcards, allow these Anthropic hosts instead. Certain subdomains are dynamically generated and must remain wildcards.
+ 
+ ```text theme={null}
+ anthropic.com
+ api.anthropic.com
+ a-api.anthropic.com
+ a-cdn.anthropic.com
+ s-cdn.anthropic.com
+ assets-proxy.anthropic.com
+ claude.ai
+ a.claude.ai
+ a-cdn.claude.ai
+ assets.claude.ai
+ downloads.claude.ai
+ *.livepreview.claude.ai
+ claude.com
+ platform.claude.com
+ *.livepreview.claude.app
+ *.claudeusercontent.com
+ *.claudemcpcontent.com
+ ```
+ 
- Enterprise organizations can require SSO for all users. See [authentication](/en/authentication) for plan-level details and [Setting up SSO](https://support.claude.com/en/articles/13132885-setting-up-single-sign-on-sso) for SAML and OIDC configuration.
+ Enterprise organizations can require SSO for all users. See [authentication](/en/authentication) for plan-level details and [Setting up SSO](https://support.claude.com/en/articles/13132885-setting-up-single-sign-on-sso) for SAML configuration; OIDC setup is covered in the [Claude Enterprise Administrator Guide](https://claude.com/resources/tutorials/claude-enterprise-administrator-guide).
- * **Windows**: deploy via MSIX package or `.exe` installer. See [Deploy Claude Desktop for Windows](https://support.claude.com/en/articles/12622703-deploy-claude-desktop-for-windows) for enterprise deployment options including silent installation
+ * **Windows**: deploy via the MSIX package. See [Deploy Claude Desktop for Windows](https://support.claude.com/en/articles/12622703-deploy-claude-desktop-for-windows) for enterprise deployment options including silent installation
- For network configuration such as proxy settings, firewall allowlisting, and LLM gateways, see [network configuration](/en/network-config).
+ For the domains to allowlist in your firewall, see [network access requirements](#network-access-requirements) above. For proxy settings, custom certificate authorities, and LLM gateways, see [network configuration](/en/network-config).
- | CLI                                   | Desktop equivalent                                                                                                                       |
- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
- | `--model sonnet`                      | Model dropdown next to the send button                                                                                                   |
- | `--resume`, `--continue`              | Click a session in the sidebar                                                                                                           |
- | `--permission-mode`                   | Mode selector next to the send button                                                                                                    |
- | `--dangerously-skip-permissions`      | Bypass permissions mode. Enable in Settings → Claude Code → "Allow bypass permissions mode". Enterprise admins can disable this setting. |
- | `--add-dir`                           | Add multiple repos with the **+** button in cloud sessions                                                                               |
- | `--allowedTools`, `--disallowedTools` | No per-session equivalent. Permission rules in [settings files](/en/settings) still apply.                                               |
- | `--verbose`                           | [Verbose view mode](#switch-view-modes) in the Transcript view dropdown                                                                  |
- | `--print`, `--output-format`          | Not available. Desktop is interactive only.                                                                                              |
- | `ANTHROPIC_MODEL` env var             | Model dropdown next to the send button                                                                                                   |
- | `MAX_THINKING_TOKENS` env var         | Set in the local environment editor. See [environment configuration](#environment-configuration).                                        |
+ | CLI                                   | Desktop equivalent                                                                                                                                                                  |
+ | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
+ | `--model sonnet`                      | Model dropdown next to the send button                                                                                                                                              |
+ | `--resume`, `--continue`              | Click a session in the sidebar                                                                                                                                                      |
+ | `--permission-mode`                   | Mode selector next to the send button                                                                                                                                               |
+ | `--dangerously-skip-permissions`      | Bypass permissions mode. On Pro and Max plans, enable it in Settings → Claude Code → "Allow bypass permissions mode"; on Team and Enterprise plans, organization policy controls it |
+ | `--add-dir`                           | Add multiple repos with the **+** button in cloud sessions                                                                                                                          |
+ | `--allowedTools`, `--disallowedTools` | No per-session equivalent. Permission rules in [settings files](/en/settings) still apply.                                                                                          |
+ | `--verbose`                           | [Verbose view mode](#switch-view-modes) in the Transcript view dropdown                                                                                                             |
+ | `--print`, `--output-format`          | Not available. Desktop is interactive only.                                                                                                                                         |
+ | `ANTHROPIC_MODEL` env var             | Model dropdown next to the send button                                                                                                                                              |
+ | `MAX_THINKING_TOKENS` env var         | Set in the local environment editor. See [environment configuration](#environment-configuration).                                                                                   |
- | Feature                                               | CLI                                                              | Desktop                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
- | ----------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
- | Permission modes                                      | All modes including `dontAsk`                                    | Manual, Accept edits, and Plan. Auto and Bypass permissions appear in the mode selector after you enable them in Settings                                                                                                                                                                                                                                                                                                                                 |
- | `--dangerously-skip-permissions`                      | CLI flag                                                         | Bypass permissions mode. Enable in Settings → Claude Code → "Allow bypass permissions mode"                                                                                                                                                                                                                                                                                                                                                               |
- | [Third-party providers](/en/third-party-integrations) | Amazon Bedrock, Google Cloud's Agent Platform, Microsoft Foundry | Anthropic's API by default. Enterprise deployments can configure Google Cloud's Agent Platform and gateway providers. See the [enterprise configuration guide](https://support.claude.com/en/articles/12622667-enterprise-configuration). To run the Code tab on Amazon Bedrock, Google Cloud's Agent Platform, Microsoft Foundry, or a self-hosted LLM gateway, see [Claude Desktop on 3P](https://claude.com/docs/third-party/claude-desktop/overview). |
- | [MCP servers](/en/mcp)                                | Configure in settings files                                      | Connectors UI for local and SSH sessions, or settings files                                                                                                                                                                                                                                                                                                                                                                                               |
- | [Plugins](/en/plugins)                                | `/plugin` command                                                | Plugin manager UI                                                                                                                                                                                                                                                                                                                                                                                                                                         |
- | @mention files                                        | Text-based                                                       | With autocomplete; local and SSH sessions only                                                                                                                                                                                                                                                                                                                                                                                                            |
- | File attachments                                      | Not available                                                    | Images, PDFs                                                                                                                                                                                                                                                                                                                                                                                                                                              |
- | Session isolation                                     | [`--worktree`](/en/cli-reference) flag                           | Automatic worktrees                                                                                                                                                                                                                                                                                                                                                                                                                                       |
- | Multiple sessions                                     | Separate terminals                                               | Sidebar tabs                                                                                                                                                                                                                                                                                                                                                                                                                                              |
- | Recurring tasks                                       | Cron jobs, CI pipelines                                          | [Scheduled tasks](/en/desktop-scheduled-tasks)                                                                                                                                                                                                                                                                                                                                                                                                            |
- | Computer use                                          | [Enable via `/mcp`](/en/computer-use) on macOS                   | [App and screen control](#let-claude-use-your-computer) on macOS and Windows                                                                                                                                                                                                                                                                                                                                                                              |
- | Dispatch integration                                  | Not available                                                    | [Dispatch sessions](#sessions-from-dispatch) in the sidebar                                                                                                                                                                                                                                                                                                                                                                                               |
- | Scripting and automation                              | [`--print`](/en/cli-reference), [Agent SDK](/en/headless)        | Not available                                                                                                                                                                                                                                                                                                                                                                                                                                             |
+ | Feature                                               | CLI                                                              | Desktop                                                                                                                                                                                                                                                                                                                                           |
+ | ----------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
+ | Permission modes                                      | All modes including `dontAsk`                                    | Manual, Accept edits, Plan, and Auto. Bypass permissions appears in the mode selector once enabled: through the Settings toggle on Pro and Max plans, or through organization policy on Team and Enterprise plans                                                                                                                                 |
+ | `--dangerously-skip-permissions`                      | CLI flag                                                         | Bypass permissions mode. On Pro and Max plans, enable it in Settings → Claude Code → "Allow bypass permissions mode"; on Team and Enterprise plans, organization policy controls it                                                                                                                                                               |
+ | [Third-party providers](/en/third-party-integrations) | Amazon Bedrock, Google Cloud's Agent Platform, Microsoft Foundry | Anthropic's API by default. For gateway routing, see [connect the desktop app to a gateway](/en/llm-gateway-connect#desktop-app). To run the Code tab on Amazon Bedrock, Google Cloud's Agent Platform, Microsoft Foundry, or a self-hosted LLM gateway, see [Claude Desktop on 3P](https://claude.com/docs/third-party/claude-desktop/overview). |
+ | [MCP servers](/en/mcp)                                | Configure in settings files                                      | Connectors UI for local and SSH sessions, or settings files                                                                                                                                                                                                                                                                                       |
+ | [Plugins](/en/plugins)                                | `/plugin` command                                                | Plugin manager UI                                                                                                                                                                                                                                                                                                                                 |
+ | @mention files                                        | Text-based                                                       | With autocomplete; local and SSH sessions only                                                                                                                                                                                                                                                                                                    |
+ | File attachments                                      | Not available                                                    | Images, PDFs                                                                                                                                                                                                                                                                                                                                      |
+ | Session isolation                                     | [`--worktree`](/en/cli-reference) flag                           | Automatic worktrees                                                                                                                                                                                                                                                                                                                               |
+ | Multiple sessions                                     | Separate terminals                                               | Sidebar tabs                                                                                                                                                                                                                                                                                                                                      |
+ | Recurring tasks                                       | Cron jobs, CI pipelines                                          | [Scheduled tasks](/en/desktop-scheduled-tasks)                                                                                                                                                                                                                                                                                                    |
+ | Computer use                                          | [Enable via `/mcp`](/en/computer-use) on macOS                   | [App and screen control](#let-claude-use-your-computer) on macOS and Windows                                                                                                                                                                                                                                                                      |
+ | Dispatch integration                                  | Not available                                                    | [Dispatch sessions](#sessions-from-dispatch) in the sidebar                                                                                                                                                                                                                                                                                       |
+ | Scripting and automation                              | [`--print`](/en/cli-reference), [Agent SDK](/en/headless)        | Not available                                                                                                                                                                                                                                                                                                                                     |
- * **Third-party providers**: Desktop connects to Anthropic's API by default. Enterprise deployments can configure Google Cloud's Agent Platform and gateway providers via [managed settings](https://support.claude.com/en/articles/12622667-enterprise-configuration). For Amazon Bedrock or Microsoft Foundry in the CLI, see the [quickstart](/en/quickstart). As an exception to the section above, [Claude Desktop on 3P](https://claude.com/docs/third-party/claude-desktop/overview) runs the Code tab on Amazon Bedrock, Google Cloud's Agent Platform, Microsoft Foundry, or a self-hosted LLM gateway.
+ * **Third-party providers**: Desktop connects to Anthropic's API by default. To route Desktop through a gateway, see [connect the desktop app to a gateway](/en/llm-gateway-connect#desktop-app). Enterprise deployments can configure Google Cloud's Agent Platform and gateway providers via [managed settings](https://claude.com/docs/third-party/claude-desktop/configuration). For Amazon Bedrock or Microsoft Foundry in the CLI, see the [quickstart](/en/quickstart). As an exception to the section above, [Claude Desktop on 3P](https://claude.com/docs/third-party/claude-desktop/overview) runs the Code tab on Amazon Bedrock, Google Cloud's Agent Platform, Microsoft Foundry, or a self-hosted LLM gateway.
- * **Terminal-dialog commands**: built-in commands that open an interactive panel in the terminal, such as `/permissions` and `/config`, are not available in the Code tab and reply with `isn't available in this environment`. `/config` sets a setting when you pass `key=value`, for example `/config theme=dark`; only its picker form is unavailable. Edit [settings files](/en/settings) directly to manage permission rules and configuration, or run the command from the standalone CLI.
+ * **Terminal-dialog commands**: built-in commands that open an interactive panel in the terminal behave differently in the Code tab. Edit [settings files](/en/settings) directly to manage permission rules and configuration, or run the commands from the standalone CLI.
+   * Commands with no argument form, such as `/permissions`, reply with `isn't available in this environment`.
+   * `/config` opens Settings → Claude Code. Text after the command is ignored, so `/config theme=dark` doesn't set the theme.
- 3. On Windows, check Event Viewer for crash logs under **Windows Logs → Application**.
+ 3. On a managed network, confirm your firewall allows the CDN hosts in [network access requirements](#network-access-requirements).
+ 4. On Windows, check Event Viewer for crash logs under **Windows Logs → Application**.
- When reporting a problem, include your desktop app version, your operating system, the exact error message, and relevant logs. On macOS, check Console.app. On Windows, check Event Viewer → Windows Logs → Application.
+ When reporting a problem, include your desktop app version, your operating system, the exact error message, and relevant logs. On macOS, check Console.app. On Windows, check Event Viewer → Windows Logs → Application. Review log excerpts before posting them to a public issue; they can include file paths and other details from your environment.
```

### Desktop quickstart
- Источник: https://code.claude.com/docs/en/desktop-quickstart.md
- Изменения: **3** добавлено, **2** удалено
- Затронутые узлы Atlas (черновик): `apps-setup, pl-app-modes`

```diff
- * **Cowork**: An autonomous background agent that works on tasks in a cloud VM with its own environment. It can run independently while you do other work.
+ * **Cowork**: An autonomous background agent that works on tasks in a sandboxed virtual machine with its own environment, running independently while you do other work. On-device Cowork sessions run the VM on your computer; remote Cowork sessions run on an Anthropic-managed VM instead.
- Chat and Cowork are covered in the [Claude Desktop support articles](https://support.claude.com/en/collections/16163169-claude-desktop). This page focuses on the **Code** tab.
+ Chat and Cowork are covered in the [Claude Help Center](https://support.claude.com/); installing and deploying the desktop app is covered in the [Claude Desktop support articles](https://support.claude.com/en/collections/16163169-claude-desktop). This page focuses on the **Code** tab.
+     * **WSL** (Windows): Run the session inside a [WSL 2 distribution](/en/desktop-wsl); Claude Code, tools, and git execute on the Linux side with native paths.
```

### Desktop scheduled tasks
- Источник: https://code.claude.com/docs/en/desktop-scheduled-tasks.md
- Изменения: **2** добавлено, **0** удалено
- Затронутые узлы Atlas (черновик): `pl-cowork, автоматизация`

```diff
+ Connector tools [your organization set to `ask`](/en/mcp#organization-controls-on-connector-tools) and MCP tools marked [`requiresUserInteraction`](/en/mcp#require-approval-for-a-specific-tool) prompt on every call and don't offer an always-allow option. Runs that call these tools stall each time.
+ 
```

### Platforms and integrations
- Источник: https://code.claude.com/docs/en/platforms.md
- Изменения: **3** добавлено, **3** удалено
- Затронутые узлы Atlas (черновик): `pl-platforms, pl-compare`

```diff
- | Mobile                            | Starting and monitoring tasks while away from your computer                                        | Cloud sessions from the Claude app for iOS and Android, [Remote Control](/en/remote-control) for local sessions, [Dispatch](/en/desktop#sessions-from-dispatch) to Desktop on Pro and Max |
+ | [Mobile](/en/mobile)              | Starting and monitoring tasks while away from your computer                                        | Cloud sessions from the Claude app for iOS and Android, [Remote Control](/en/remote-control) for local sessions, [Dispatch](/en/desktop#sessions-from-dispatch) to Desktop on Pro and Max |
- The CLI is the most complete surface for terminal-native work: scripting and the Agent SDK are CLI-only. Third-party providers also work in [VS Code](/en/vs-code#use-third-party-providers). Enterprise [Desktop](/en/desktop) deployments support Google Cloud's Agent Platform and gateway providers; for Amazon Bedrock or Microsoft Foundry, use the CLI or VS Code, or [Claude Desktop on 3P](https://claude.com/docs/third-party/claude-desktop/overview), which runs the Code tab on those providers. Desktop and the IDE extensions trade some CLI-only features for visual review and tighter editor integration. The web runs in Anthropic's cloud, so tasks keep going after you disconnect. Mobile is a thin client into those same cloud sessions or into a local session via Remote Control, and can send tasks to Desktop with Dispatch.
+ The CLI is the most complete surface for terminal-native work: scripting and the Agent SDK are CLI-only. Third-party providers also work in [VS Code](/en/vs-code#use-third-party-providers). Enterprise [Desktop](/en/desktop) deployments support Google Cloud's Agent Platform, and Desktop supports [gateway providers](/en/llm-gateway-connect#desktop-app); for Amazon Bedrock or Microsoft Foundry, use the CLI or VS Code, or [Claude Desktop on 3P](https://claude.com/docs/third-party/claude-desktop/overview), which runs the Code tab on those providers. Desktop and the IDE extensions trade some CLI-only features for visual review and tighter editor integration. The web runs in Anthropic's cloud, so tasks keep going after you disconnect. Mobile is a thin client into those same cloud sessions or into a local session via Remote Control, and can send tasks to Desktop with Dispatch.
- * Mobile: the Claude app for [iOS](https://apps.apple.com/us/app/claude-by-anthropic/id6473753684) and [Android](https://play.google.com/store/apps/details?id=com.anthropic.claude) for starting and monitoring tasks while away from your computer
+ * [Mobile](/en/mobile): the Claude app for [iOS](https://apps.apple.com/us/app/claude-by-anthropic/id6473753684) and [Android](https://play.google.com/store/apps/details?id=com.anthropic.claude) for starting and monitoring tasks while away from your computer
```

### Индекс всех страниц документации (llms.txt)
- Источник: https://code.claude.com/docs/llms.txt
- Изменения: **8** добавлено, **3** удалено
- Затронутые узлы Atlas (черновик): `новые/удалённые темы в экосистеме`

```diff
+ - [Use Claude Code with a screen reader](https://code.claude.com/docs/en/accessibility.md): Set up Claude Code for screen readers such as VoiceOver and NVDA, plus settings for screen magnifiers, reduced motion, and colorblind-friendly themes.
- - [Share session output as artifacts](https://code.claude.com/docs/en/artifacts.md): Artifacts turn Claude Code's work into live, interactive pages at a private URL on claude.ai.
+ - [Share session output as artifacts](https://code.claude.com/docs/en/artifacts.md): Artifacts turn Claude Code's work into live, interactive pages on claude.ai that you can keep private, share with your organization, or publish to a public link.
+ - [Run Claude Code behind a corporate launcher](https://code.claude.com/docs/en/corporate-launcher.md): Route the processes Claude Code starts from its own binary, including the background service and every agent view session, through a required launcher with CLAUDE_CODE_PROCESS_WRAPPER or the processWrapper setting.
+ - [Claude Code Desktop in WSL](https://code.claude.com/docs/en/desktop-wsl.md): Run Code sessions inside a WSL 2 distribution on Windows
- - [Connect Claude Code to an LLM gateway](https://code.claude.com/docs/en/llm-gateway-connect.md): Point Claude Code at your organization's LLM gateway. Check whether your admin already configured it, or set the base URL and credential yourself for the CLI, VS Code, GitHub Actions, and the Agent SDK, then verify the connection and fix gateway errors.
+ - [Connect Claude Code to an LLM gateway](https://code.claude.com/docs/en/llm-gateway-connect.md): Point Claude Code at your organization's LLM gateway. Check whether your admin already configured it, or set the base URL and credential yourself, then verify the connection and fix gateway errors.
+ - [Claude Code on mobile](https://code.claude.com/docs/en/mobile.md): Start, monitor, and steer Claude Code tasks from your phone with the Claude app for iOS and Android.
- - [Constrain plugin dependency versions](https://code.claude.com/docs/en/plugin-dependencies.md): Declare version constraints on plugin dependencies so your plugin keeps working when an upstream plugin ships a breaking change.
+ - [Constrain plugin dependency versions](https://code.claude.com/docs/en/plugin-dependencies.md): Declare version constraints on plugin dependencies, and bundle a curated plugin set behind one install.
+ - [Week 29 · July 13–17, 2026](https://code.claude.com/docs/en/whats-new/2026-w29.md): Pull live data into published artifacts through MCP connectors, and use Claude Code with a screen reader in the new screen reader mode.
```

# ai-education-designer

> Skill для превращения сложных AI концепций в понятные обучающие блоки.

---

## Назначение

Specialized в condensing AI/agent concepts до tooltip-sized snippets для inline education
в Builder UI. Также designs Atlas → Builder deep-links и onboarding learn-flow.

**Когда вызывать:**
- «Объясни tool calling за 2 предложения»
- «Empty state copy: что показать новому юзеру?»
- «Tooltip для AgentNode: что значит «role»?»
- «Onboarding tour script для Builder»
- При создании education snippets в `educationContent.js`

---

## Context

1. **`docs/learning-design-rules.md`** — 10 правил AI-обучения (read first)
2. **`docs/voice-guide.md`** — tone of voice
3. **Atlas educational content:**
   - 247 узлов с 6-вопросной схемой (what/why/when/impact/example/mistakes)
   - 32 tutorials со steps/exercises/applyIn
   - Особенно: `agents/*`, `mcp/*`, `cap-tools`, `cap-memory`, `skills/*`
4. **`docs/agent-builder/06-skills.md`** — orchestration

---

## Принципы (production от learning-design-rules)

### 1. Concrete → abstract

❌ «Tool calling is a mechanism allowing LLMs to invoke external functions»
✅ «Tools let agents *do* things: search the web, fetch data, calculate»

### 2. Show what it's NOT

❌ «An agent is an AI system that...»
✅ «An agent isn't just chat — it can use tools and make multi-step decisions»

### 3. Probabilistic mindset

❌ «Claude will perform X»
✅ «Claude tries X — verify the output»

### 4. Action-oriented

Each snippet implies a next step user can take:
- «Click an agent to see its tools»
- «Connect this to see how data flows»
- «Run mock execution to watch it work»

### 5. Anchor в Atlas

Каждый Builder concept → есть соответствующий Atlas узел:
- AgentNode hover → linked to `agents` Atlas узел
- ToolNode hover → linked to `cap-tools`
- MemoryNode hover → linked to `cap-memory`

«Learn more» в tooltip → opens Atlas узел.

---

## Format constraints

### Tooltip (≤ 140 characters)

«AgentNode»:
> «An agent is an AI that uses tools to complete tasks — не просто chat»

«ToolNode»:
> «Tools let agents do actions: search, fetch, calculate. Pick from the toolbox.»

«TriggerNode»:
> «Triggers start the workflow: user input, schedule, webhook. Every workflow needs one.»

«OutputNode»:
> «Where final result goes: markdown report, JSON, or webhook out.»

### Empty state copy (≤ 280 characters)

«Empty canvas»:
> «Build your first agent — see AI work together visually. Start with a template, learn agents first, or build from scratch.»

«No execution yet»:
> «Press Run to watch agents execute step-by-step. This is demo mode — no real APIs called yet.»

### Atlas link copy (≤ 60 characters)

«Learn more about agents →» (links to `#/agents`)

«How does memory work? →» (links to `#/cap-memory`)

«MCP explained →» (links to `#/mcp`)

### Onboarding step (≤ 200 characters per step)

Step 1:
> «This is the canvas. Drag agents from the left panel to start building.»

Step 4:
> «Press Run to see it work. Don't worry — this is demo mode, no real API calls.»

---

## Process для new education snippet

### Step 1 — Identify concept

Что user должен понять? Example: «role» в AgentNode.

### Step 2 — Find anchor в Atlas

Существует узел про роли? Yes — `ag-principles`. Use as «Learn more» link.

### Step 3 — Write tooltip (≤140 chars)

Apply principles:
- Concrete не abstract
- Imply action user can take
- Не jargon

Result:
> «Role tells the agent its job: e.g., 'researcher' vs 'writer'. Different roles use different tools.»

### Step 4 — Validate

Read aloud. Make sense to non-AI person? Если не — refactor.

### Step 5 — Localize

Translate to RU и FI (если этот snippet висит в UI, не deep content).

EN: «Role tells the agent its job»
RU: «Роль определяет задачу агента: исследователь vs писатель. Разные роли — разные инструменты.»
FI: «Rooli kertoo agentin tehtävän: tutkija vs kirjoittaja. Eri rooleilla on eri työkalut.»

### Step 6 — Output JSON

```json
{
  "key": "builder.tooltip.agent_role",
  "anchor_node": "ag-principles",
  "translations": {
    "ru": "Роль определяет задачу агента: исследователь vs писатель. Разные роли — разные инструменты.",
    "en": "Role tells the agent its job: e.g., 'researcher' vs 'writer'. Different roles use different tools.",
    "fi": "Rooli kertoo agentin tehtävän: tutkija vs kirjoittaja. Eri rooleilla on eri työkalut."
  },
  "metadata": {
    "max_chars": 140,
    "actual_chars": { "ru": 121, "en": 109, "fi": 96 },
    "action_implied": true,
    "concrete": true
  }
}
```

Add к `src/builder/data/educationContent.js`.

---

## MVP education map (Builder ↔ Atlas)

### Tooltips (4 node types)

| Builder concept | Atlas anchor | Tooltip key |
|-----------------|--------------|-------------|
| AgentNode | `agents` | `builder.tooltip.agent` |
| Agent.role | `ag-principles` | `builder.tooltip.agent_role` |
| ToolNode | `cap-tools` | `builder.tooltip.tool` |
| TriggerNode | (no anchor) | `builder.tooltip.trigger` |
| OutputNode | (no anchor) | `builder.tooltip.output` |
| Edge connection | `sys-workflows-basics` | `builder.tooltip.edge` |
| Status: running | (no anchor) | `builder.tooltip.status_running` |
| Status: failed | (no anchor) | `builder.tooltip.status_failed` |

### Inline learn-more links

При selecting node в sidebar — section «Related Atlas content» с 1-2 deep-links:

| Selected | Show links to |
|----------|---------------|
| AgentNode | `agents`, `ag-{role}` |
| ToolNode | `cap-tools`, `mcp` |
| TriggerNode | `sys-workflows-basics` |
| OutputNode | `mk-content-ops` (если text output) |
| EdgeNode | `sys-context-passing` |

### Empty states (4 шт)

1. «Empty canvas» (new user) — 3 buttons + Atlas link
2. «No workflows saved» (returning, not signed in) — sign in CTA
3. «No execution yet» (built but never ran) — explanation + Run prompt
4. «Templates loading» (network slow) — skeleton

### Onboarding tour (5-7 steps)

Total time ≤ 2 min. Skippable. See `skills/ux-flow-designer/SKILL.md` § Onboarding.

---

## Что НЕ делаем в этом skill

- ❌ Не design agent topology — это `agent-architecture`
- ❌ Не build UI components — это `ux-flow-designer`
- ❌ Не write Atlas узлы — это `mindmap-expander` / `content-structurer`
- ❌ Не write tutorials — это `ai-pedagogy-architect`

**Focus: education snippets ≤140 chars, anchors к Atlas, learn-as-you-build flow.**

---

## Validation checklist

Перед finalizing snippet:

- [ ] ≤ char limit (140 для tooltip, 280 для empty state)
- [ ] Concrete не abstract (см. § Principles)
- [ ] Implies action user can take
- [ ] No jargon без context (если используем — explain в 1 phrase)
- [ ] Anchored в Atlas узле (если exists)
- [ ] Localized ru/en/fi
- [ ] Voice-guide compliant
- [ ] Tested на non-AI person

---

_Skill created: 2026-05-24._

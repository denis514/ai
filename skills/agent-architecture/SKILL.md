# agent-architecture

> Skill для проектирования AI-agents, sub-agents, workflows и связей между ними.

---

## Назначение

Domain expert по multi-agent system design. Принимает задачу пользователя
и проектирует agent topology: roles, tools, edges, anti-patterns.

**Когда вызывать:**
- «Помоги спроектировать workflow для X задачи»
- «Какая структура agents для UX audit?»
- «Should this be one agent or multi-agent?»
- «Sub-agent orchestration patterns?»
- При создании Builder templates

---

## Context (что читать перед работой)

1. **`docs/agent-builder/02-architecture.md`** — DB schema + node types
2. **`docs/agent-builder/06-skills.md`** — orchestration pattern
3. **Atlas узлы про agents:**
   - `agents/*` — `ag-principles`, `ag-code`, `ag-ux`, `ag-research`, `ag-designer`, `ag-pm`, `ag-managed`
   - `cc-subagents` (Claude Code sub-agents)
   - `mcp/*` — Model Context Protocol
   - `sys-multi-agent-patterns` — Systems layer
4. **Anthropic docs:** [tool use](https://docs.anthropic.com/en/docs/build-with-claude/tool-use),
   [memory](https://docs.anthropic.com/en/docs/build-with-claude/memory-tool)

---

## Process (пошаговый)

### Step 1 — Decompose task

User говорит: «Build agent for UX audit».

Question:
- Что одна агент **точно НЕ может** сделать? (тогда нужен sub-agent)
- Какие capabilities нужны? (vision, web search, code exec, file read)
- Какой output формат?

**Rule of thumb:** если задача требует > 1 distinct skill area → multi-agent.

### Step 2 — Map to roles

Identify which roles нужны. Examples:

| Task | Roles |
|------|-------|
| UX audit | Heuristic + Accessibility + Visual |
| Content writing | Research + Draft + SEO |
| Analytics report | Trend + Anomaly + Summarize |
| Research | Search + Synthesis + Critic |

**Each role:**
- Single responsibility
- Clear input format
- Clear output format
- Specific tool set

### Step 3 — Design edges

Connect roles в логическую последовательность:

- **Linear chain:** A → B → C (Research → Draft → SEO)
- **Parallel fan-out:** A → [B, C, D] in parallel (Main → 3 sub-agents)
- **Fan-in:** [B, C, D] → A (3 specialists report back to Lead)
- **Critic loop:** A → B → Critic → if rejected → A (Anti-pattern если бесконечный)

**Rule:** every workflow has clear start (Trigger) и clear end (Output).

### Step 4 — Choose tools per agent

For each agent, list tools:

| Agent | Tools |
|-------|-------|
| Research Agent | web_search, fetch_url |
| UX Auditor | vision (read screenshot), code_exec (run accessibility checks) |
| Content Writer | knowledge_base_read, web_search |
| Analytics | code_exec (Python for data) |

**Rule:** меньше tools на agent = более reliable. > 5 tools per agent → split.

### Step 5 — Spot anti-patterns

Common mistakes (raise red flag):

❌ **«Just one mega-agent с 20 tools»** — слишком сложно, model confuses
❌ **«Agent for every step»** — over-engineered, latency stacks
❌ **«Sub-agent calls main agent»** — cyclic dependency, runtime issues
❌ **«No quality gate»** — wrong outputs reach production
❌ **«All parallel, no synthesis»** — outputs не consolidate
❌ **«Vague roles» («Helper agent», «Assistant»)** — model доesn't know что делать

**Good patterns:**

✅ **Single responsibility per agent**
✅ **Topological order (no cycles)**
✅ **Output validation gate перед next step**
✅ **Clear input/output schemas**
✅ **Mock-able execution (test без real API)**

### Step 6 — Output

Return structured design:

```yaml
workflow:
  name: "UX Audit Agent"
  trigger:
    type: user_input
    inputs: [url_or_screenshot, brand_guidelines]
  agents:
    - id: ux_auditor_lead
      role: orchestrator
      tools: []
      next: [heuristic, accessibility, visual]

    - id: heuristic
      role: usability_evaluator
      tools: [vision, knowledge_base_read]
      input_from: ux_auditor_lead

    - id: accessibility
      role: wcag_checker
      tools: [code_exec]
      input_from: ux_auditor_lead

    - id: visual
      role: design_critic
      tools: [vision]
      input_from: ux_auditor_lead

    - id: synthesizer
      role: report_writer
      tools: []
      input_from: [heuristic, accessibility, visual]
      output: markdown_report

  output:
    format: markdown
    sections: [summary, critical_issues, recommendations]
```

---

## Output formats supported

1. **YAML/JSON template** (для прямого импорта в Builder)
2. **Text-based architecture diagram** (для docs)
3. **Markdown narrative** (для обучающих materials)
4. **Rationale memo** («почему такая структура»)

---

## Anti-pattern detection checklist

Перед finalizing design, проверь:

- [ ] Каждый agent имеет single, clearly-named role
- [ ] Нет циклических зависимостей
- [ ] Каждый agent has ≤ 5 tools
- [ ] Output of each agent → input of next (no orphan outputs)
- [ ] Есть quality gate перед output
- [ ] Workflow runs to completion в mock mode
- [ ] Latency considered (parallel где возможно)
- [ ] Failure modes designed: что if Tool fails?

---

## Examples (готовые templates)

### Template: UX Audit Agent

См. `docs/agent-builder/03-mvp-30day.md` § Templates.

### Template: Analytics Agent

(Аналогично)

### Template: Content Agent

(Аналогично)

### Template: Research Agent

(Аналогично)

---

## Что НЕ делаем в этом skill

- ❌ Не decide pricing — это `monetization-architect`
- ❌ Не design UI — это `ux-flow-designer`
- ❌ Не write education tooltips — это `ai-education-designer`
- ❌ Не decide if feature is MVP — это `mvp-planner`
- ❌ Не validate technical risks — это `technical-risk-auditor`

**Focus: agent topology + workflow design.**

---

_Skill created: 2026-05-24._

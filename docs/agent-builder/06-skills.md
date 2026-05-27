# 06 — Skills для Agent Builder

> Спецификация 5 новых skill-агентов + alias-ы на 2 existing skills.

---

## Summary

| Skill | Type | Status |
|-------|------|--------|
| `product-strategy` | Alias на existing `product-strategist` | ✅ Existing |
| `monetization-strategy` | Alias на existing `monetization-architect` | ✅ Existing |
| `agent-architecture` | NEW | 🆕 Created |
| `ux-flow-designer` | NEW | 🆕 Created |
| `ai-education-designer` | NEW | 🆕 Created |
| `technical-risk-auditor` | NEW | 🆕 Created |
| `mvp-planner` | NEW | 🆕 Created |

---

## product-strategy (alias)

**Existing skill:** `skills/product-strategist/`

**Trigger:** «Проверь что это соответствует стратегии 105 Atlas» / «Это in scope?»

**Когда вызывать:**
- Перед началом MVP feature implementation — проверка alignment
- При предложении изменения positioning или scope
- При рассмотрении новой direction (vs current Atlas + Builder)

**Скилл уже существует — переиспользуем без модификации.**

---

## monetization-strategy (alias)

**Existing skill:** `skills/monetization-architect/`

**Trigger:** «Сколько брать за это?» / «Как монетизировать Builder?»

**Когда вызывать:**
- При планировании Pro/Team tier для Builder
- При обсуждении pricing experimentation
- При decisions о free tier limits

**Скилл уже существует — переиспользуем без модификации.**

---

## agent-architecture (NEW)

**Назначение:** Проектирует agents, sub-agents, workflow связи. Domain expert
по multi-agent system design.

**Когда вызывать:**
- «Помоги спроектировать workflow для X задачи»
- «Какая структура agents для UX audit?»
- «Should this be one agent or multi-agent?»
- «Sub-agent orchestration patterns?»
- При создании Builder templates (4 шт в MVP)

**Что знает:**
- 7 узлов `agents/*` в Atlas (`ag-principles`, `ag-code`, `ag-ux`, etc.)
- Узлы про subagents (`cc-subagents`), MCP (`mcp/*`)
- Sys узлы (`sys-multi-agent-patterns`, `sys-workflows-basics`)
- Anthropic best practices для tool use, memory, parallel execution

**Что делает:**
- Декомпозирует задачу на agents с ролями
- Определяет границы каждого agent (single responsibility)
- Designs edges (which agent calls which)
- Spots anti-patterns (too many agents, vague roles, cyclic dependencies)
- Validates workflow против established patterns

**Output formats:**
- Architecture diagrams (text-based)
- JSON template (для прямого импорта в Builder)
- Rationale: «Why this agent here?»

**SKILL.md создан:** `skills/agent-architecture/SKILL.md`

---

## ux-flow-designer (NEW)

**Назначение:** Visual builder UX. Canvas interactions, onboarding, empty states,
drag-and-drop, keyboard shortcuts.

**Когда вызывать:**
- «Как организовать toolbox panel?»
- «Что показать в empty state?»
- «Onboarding flow для нового пользователя Builder»
- «Keyboard shortcuts для canvas»
- При UI/UX decisions в Builder

**Что знает:**
- Industry standards: Figma, Whimsical, Linear, n8n, Make
- React Flow capabilities + limitations
- Atlas existing UX patterns (mindmap navigation, modals)
- Accessibility (WCAG 2.1 AA — referenced в design rules)

**Что делает:**
- Маппит user goals в UI flows
- Designs empty/loading/error states
- Validates что disclosure не overwhelming
- Predicts confusion points (first-time user, returning user)
- Spots accessibility issues

**Output formats:**
- User flow diagrams (text-based)
- Component breakdown (header / canvas / sidebar / panel)
- Interaction specifications (click → result)
- Accessibility annotations

**SKILL.md создан:** `skills/ux-flow-designer/SKILL.md`

---

## ai-education-designer (NEW)

**Назначение:** Превращает сложные AI концепции в понятные обучающие блоки.
Особенно для inline education в Builder.

**Когда вызывать:**
- «Объясни tool calling за 2 предложения»
- «Empty state copy: что показать новому юзеру?»
- «Tooltip для AgentNode: что значит «role»?»
- «Onboarding tour script для Builder»
- При создании education snippets в `educationContent.js`

**Что знает:**
- `docs/learning-design-rules.md` — 10 правил AI-обучения
- `docs/voice-guide.md` — voice consistency
- Atlas existing education content (247 nodes + 32 tutorials)
- Pedagogical patterns: progressive disclosure, scaffolding, anchoring

**Что делает:**
- Compresses сложные концепты до tooltip-sized blurbs (≤140 chars)
- Maps Builder UI elements к Atlas educational nodes
- Validates что explanations follow «concrete → abstract» rule
- Spots jargon and replaces with plain language
- Designs «learn-as-you-build» moments

**Output formats:**
- Education snippets (JSON для educationContent.js)
- Tour scripts (step-by-step + screenshot annotations)
- Glossary entries
- Linking strategy (which UI → which Atlas node)

**SKILL.md создан:** `skills/ai-education-designer/SKILL.md`

---

## technical-risk-auditor (NEW)

**Назначение:** Проверяет что новая интеграция не ломает текущий проект.
Specialized в Atlas codebase awareness.

**Когда вызывать:**
- Перед merging новой feature
- При предложении изменения shared infrastructure
- «Ломает ли это existing Atlas users?»
- «Что нужно протестировать?»
- При planning архитектурных decisions

**Что знает:**
- Atlas codebase structure (37 components, 18 hooks)
- `docs/agent-builder/05-risks.md` — do-not-touch list
- `docs/architecture.md` — architectural decisions
- Bundle size constraints
- Existing test coverage (если есть)

**Что делает:**
- Audit proposed code change против do-not-touch list
- Identifies regression risks (что может сломаться)
- Suggests test cases для validation
- Reviews dependency additions (bundle size, security)
- Spots breaking changes в shared interfaces

**Output formats:**
- Risk assessment matrix
- Test plan
- Rollback strategy (если что-то сломается)
- Pre-merge checklist

**SKILL.md создан:** `skills/technical-risk-auditor/SKILL.md`

---

## mvp-planner (NEW)

**Назначение:** Делит большие идеи на MVP / Beta / Future. Scope discipline.

**Когда вызывать:**
- «Это в MVP или Beta?»
- «Сколько займёт эта feature?»
- «Что МОЖНО отложить?»
- «Не растёт ли scope?»
- При quarterly planning

**Что знает:**
- `docs/agent-builder/03-mvp-30day.md` — MVP plan
- `docs/agent-builder/04-beta-90day.md` — Beta plan
- Atlas business strategy V2
- Industry MVP patterns

**Что делает:**
- Maps feature requests к phases (MVP / Beta / Future)
- Identifies critical-path vs nice-to-have
- Estimates effort (hours/days/weeks)
- Spots scope creep
- Suggests cutting strategies («что мы могли бы убрать?»)

**Output formats:**
- Feature → phase mapping
- Effort estimates (hours range)
- «Cut list» (what to defer)
- Critical path diagram

**SKILL.md создан:** `skills/mvp-planner/SKILL.md`

---

## Orchestration pattern

**Главный agent: `product-strategist`** (existing) или **`agent-architecture`** (new)

**Pattern:**

```
User request
    ↓
business-strategist (orchestrator)
    ↓ delegates to specialist
    ├── product-strategy (existing): «is this in scope?»
    ├── agent-architecture (new): «design the agents»
    ├── ux-flow-designer (new): «design the UI»
    ├── ai-education-designer (new): «education layer»
    ├── technical-risk-auditor (new): «what's at risk?»
    ├── mvp-planner (new): «what's in MVP?»
    └── monetization-strategy (existing): «how to charge?»
    ↓
Synthesizes decisions
    ↓
User
```

**Каждый specialist:**
- Самодостаточен (читает context из docs/)
- Не вызывает другого specialist напрямую (только через orchestrator)
- Outputs structured (Markdown / JSON)

**Lock-in:** при создании новой feature всегда сначала `product-strategist` →
`mvp-planner` → специалисты под domain. Это процесс, не decision tree.

---

## Update CLAUDE.md § 16 entry points

Добавить в таблицу:

```
| Agent Builder strategy            | docs/agent-builder/ |
| Designing agents/workflow         | skills/agent-architecture/ |
| Visual builder UX                 | skills/ux-flow-designer/ |
| AI education snippets            | skills/ai-education-designer/ |
| Risk audit перед изменениями    | skills/technical-risk-auditor/ |
| MVP/Beta/Future scoping          | skills/mvp-planner/ |
```

---

_Спецификация создана 2026-05-24. SKILL.md файлы созданы в этом же коммите._

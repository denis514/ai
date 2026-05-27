# ux-flow-designer

> Skill для visual builder UX: canvas interactions, onboarding, empty states.

---

## Назначение

Designs user-facing interactions в Builder canvas. Specialized в node-based
visual editors и educational UX.

**Когда вызывать:**
- «Как организовать toolbox panel?»
- «Что показать в empty state?»
- «Onboarding flow для нового пользователя Builder»
- «Keyboard shortcuts для canvas»
- При UI/UX decisions в Builder

---

## Context

1. **`docs/agent-builder/02-architecture.md`** — frontend folder structure
2. **`docs/agent-builder/03-mvp-30day.md`** — MVP UX scope
3. **Atlas existing UX patterns:**
   - Mindmap navigation (pan/zoom, expand/collapse)
   - Modal patterns (TutorialModal, WorkflowsModal)
   - Onboarding (IntroModal, WelcomeOnboarding)
   - Cmd+K Command Palette
4. **Industry references:**
   - n8n.io (node-based workflows)
   - Figma (canvas + sidebar)
   - Whimsical (visual editing)
   - Linear (commands + keyboard-first)
5. **Accessibility:** WCAG 2.1 AA

---

## Principles

### 1. Canvas-first, sidebars secondary

Main attention — canvas. Sidebars collapsible. Mobile? Canvas-only с touch-friendly toolbar.

### 2. Discoverable but not overwhelming

New user видит ≤ 3 primary actions:
- «Start from template»
- «Learn agents first»
- «Build from scratch»

Advanced UI (toolbox + 4 panels + execution logs + version history) — progressive disclosure.

### 3. Direct manipulation

Drag nodes, drag connections, double-click to edit. Не form-based.

### 4. Immediate feedback

Status changes visible immediately. Hover states. Loading skeletons. Toast for async actions.

### 5. Keyboard shortcuts для power users

- `Cmd+S` — Save (or auto-save)
- `Cmd+Z` / `Cmd+Shift+Z` — Undo/Redo
- `Cmd+D` — Duplicate node
- `Delete` — Remove selected
- `R` — Run workflow
- `?` — Show shortcuts

### 6. Education in flow, not separate

Tooltip on hover (≤2 секунды disclosure). «Learn more» link → Atlas узел.
Не модальные «here's tutorial».

---

## Process (для каждой UI decision)

### Step 1 — Identify user goal

- New user: «понять что это»
- Returning user: «продолжить работу»
- Power user: «быстро accomplish task»

### Step 2 — Identify states

- Empty (нет нод)
- Building (mid-construction)
- Ready to run
- Running (live status updates)
- Completed (success)
- Failed (error states)

### Step 3 — Design для каждого state

Empty state не «here's a blank canvas» а **3 explicit options** (см. § Principles).

Building state не «just drag nodes» а с **toolbox always visible** + suggestion chips («Add tool node?»).

Ready to run state не «click Run» а **«Validate?»** check + green run button.

Running state shows **progress per node** (idle/running/complete) с animation.

### Step 4 — Spot accessibility gaps

- All interactions keyboard-accessible
- Focus indicators visible
- ARIA labels на kanvases nodes
- Color не sole indicator (icons + text + color)
- Text contrast ≥ 4.5:1

### Step 5 — Validate against existing Atlas UX

Не reinventать паттерны:
- Modal close behavior — match TutorialModal
- Toast positioning — match Atlas Toast
- Confirm dialogs — use useConfirm
- Loading skeletons — Skeleton component

### Step 6 — Output

Component specification:

```
ToolboxPanel
├── Position: left, collapsible
├── Width: 240px default, 60px collapsed
├── Sections (top → bottom):
│   1. Agents (4 default agent types)
│   2. Tools (8 tool categories)
│   3. Triggers (2 types: User Input, Webhook)
│   4. Outputs (3 types: Markdown, JSON, Webhook out)
├── Each item:
│   - Drag handle
│   - Icon (consistent с Atlas Icon registry)
│   - Name
│   - Tooltip on hover (1 line description)
├── Interactions:
│   - Drag onto canvas → adds node at cursor
│   - Click → opens learn-more in sidebar
│   - Hover 500ms → shows tooltip
├── Keyboard: Tab through items, Enter to add at center
└── States:
    - Empty (collapsed): icon-only view
    - Expanded: full names
    - Disabled (when running): grayed out
```

---

## Empty states catalogue

### Empty canvas (new user)

```
┌────────────────────────────────────────┐
│                                        │
│         [Atlas logo / sparkle]         │
│                                        │
│      Build your first agent            │
│   See AI agents work together visually │
│                                        │
│   [Start from template →]              │
│   [Learn agents first →]               │
│   [Build from scratch]                 │
│                                        │
│   ────────                              │
│                                        │
│   Or open last workflow:                │
│   • [Workflow name] (yesterday)        │
│                                        │
└────────────────────────────────────────┘
```

### Empty execution panel (never run)

```
[Play icon]
Press Run to see your agents in action
This is a demo mode — no real APIs called yet
```

### No saved workflows (returning user, first save)

```
[Folder icon]
You haven't saved any workflows yet
[Sign in to save your work]  ← gate triggers AuthModal
```

---

## Onboarding tour script

**First-time Builder visitor:**

1. **Welcome modal** — «Atlas Builder lets you design AI agents visually. Want a 2-min tour?»
   - Buttons: [Yes, show me] / [Skip, I'll explore]

2. **If Yes — Step 1:** «This is the canvas. Drag agents from the left panel.»
   - Highlight: toolbox left
   - Action: «Drag the Main Agent node onto the canvas»
   - Validation: when dropped → next step

3. **Step 2:** «Now add a tool. Tools let agents do actions.»
   - Highlight: tool section в toolbox
   - Action: «Drag a tool onto the canvas»

4. **Step 3:** «Connect them. Click the bottom dot of one node, drag to the other.»
   - Highlight: edge connection points
   - Action: connect them

5. **Step 4:** «Press Run to see it work (demo mode).»
   - Highlight: Run button в header
   - Result: shows mock execution

6. **Step 5:** «Look at the execution panel. Real workflows show logs in real-time.»
   - Highlight: execution panel bottom

7. **Done:** «That's it! Explore templates for advanced examples.»
   - Button: [Show me templates]

**Total time:** 2 min. **Skippable** anytime.

---

## Keyboard shortcuts (canvas-focused)

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + N` | New workflow |
| `Cmd/Ctrl + S` | Save (or auto-save indicator) |
| `Cmd/Ctrl + Z` / `Cmd/Ctrl + Shift + Z` | Undo / Redo |
| `Cmd/Ctrl + D` | Duplicate selected |
| `Delete` / `Backspace` | Delete selected |
| `R` | Run workflow |
| `Esc` | Deselect / Close panels |
| `Cmd/Ctrl + K` | Open command palette (reuse Atlas) |
| `?` | Show shortcuts cheat sheet |
| `1 / 2 / 3 / 4` | Add node by type (Agent / Tool / Trigger / Output) |
| `F` | Fit canvas to nodes |
| `Cmd/Ctrl + [` | Toggle toolbox |
| `Cmd/Ctrl + ]` | Toggle sidebar |
| `Cmd/Ctrl + J` | Toggle execution panel |

---

## Что НЕ делаем в этом skill

- ❌ Не design agent topology — это `agent-architecture`
- ❌ Не write education content — это `ai-education-designer`
- ❌ Не decide pricing UI — это `monetization-architect`
- ❌ Не validate technical feasibility — это `technical-risk-auditor`

**Focus: visual interactions, layout, states, onboarding flow.**

---

_Skill created: 2026-05-24._

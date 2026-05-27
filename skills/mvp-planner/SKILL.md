# mvp-planner

> Skill для делит большие идеи на MVP / Beta / Future. Scope discipline.

---

## Назначение

Помогает решить «что in scope сейчас, что defer». Препятствует scope creep.
Estimates effort. Maps features к phases.

**Когда вызывать:**
- «Это в MVP или Beta?»
- «Сколько займёт эта feature?»
- «Что МОЖНО отложить?»
- «Не растёт ли scope?»
- При quarterly planning

---

## Context

1. **`docs/agent-builder/03-mvp-30day.md`** — Builder MVP plan
2. **`docs/agent-builder/04-beta-90day.md`** — Builder Beta plan
3. **`docs/business-strategy/04-monetization-roadmap.md`** — Atlas Pro phases
4. **`tasks/current.md`, `tasks/backlog.md`, `tasks/roadmap.md`** — current work
5. Industry MVP patterns (e.g., Lean Startup, Marty Cagan)

---

## Principles

### 1. MVP = Minimum **Viable** Product

Не «least possible», а «just enough to test the hypothesis».

For Builder MVP — hypothesis: «people want visual agent building».
**Viable test:** demo where they build → run → see logs → understand value.

### 2. Beta = First **Real** Product

«Сэкономили costs, теперь monetize». Real APIs + auth + billing.

For Builder Beta — first paying user. Limited but functional.

### 3. Future = Not now

Без cut list нет MVP. Things deferred:
- Phase 4: team workspace, MCP
- Phase 5: marketplace, plugins
- Maybe-never: mobile native, AR/VR

### 4. Cut to time, не features

Если 30 days истекли — launch с тем что есть. Не extend.

### 5. One direction at a time

Не пытаемся MVP Builder AND Beta Atlas одновременно. Sequence.

---

## Process для решения «MVP or later?»

### Step 1 — Define the hypothesis

What are we trying to learn? Examples:
- Builder MVP: «Do people want visual agent building?»
- Atlas Pro: «Do people pay $29 for AI handbook?»
- Team tier: «Do teams want shared workspace?»

### Step 2 — Identify minimum proof

What's the **smallest** thing that proves the hypothesis?

For Builder MVP:
- Minimum: visual demo with mock execution = enough to test «do people get it»
- Not minimum: real Claude API integration = тестирует другую hypothesis

For Atlas Pro:
- Minimum: Stripe + paywall on existing content = тестирует WTP
- Not minimum: AI Companion + team workspace = тестирует другую hypothesis

### Step 3 — Apply «cut tests»

For each proposed feature:

**Test A:** «If we cut this, would we still test the hypothesis?»
- Yes → CUT
- No → keep

**Test B:** «How long to build?»
- < 1 week → consider keeping
- 1-2 weeks → carefully evaluate
- > 2 weeks → strong cut bias

**Test C:** «Does this depend on backend?»
- MVP excludes backend → CUT
- Beta includes backend → consider

**Test D:** «What's the next experiment after this?»
- Если этот feature unlocks 5 future things → keep
- Если это dead-end → cut

### Step 4 — Estimate effort

Rules of thumb:

| Type | Effort range |
|------|--------------|
| New React component (simple) | 4-8 hours |
| New React component (complex) | 1-2 days |
| New page / route | 1-3 days |
| New Supabase table + RLS | 4-6 hours |
| New Edge Function | 1-2 days |
| Integration с external API | 2-5 days |
| Auth flow change | 2-3 days |
| New animation / interaction | 4-8 hours |
| Localization (3 locales × N strings) | 30 min / 10 strings |
| Theming pass | 4-8 hours |

**Always add buffer:** estimate × 1.5 для unknowns. Senior estimate × 2 if junior.

### Step 5 — Map к phases

```
NOW (MVP, days 1-30):
  └─ [feature 1]
  └─ [feature 2]

NEXT (Beta, days 30-90):
  └─ [feature 3]
  └─ [feature 4]

LATER (Phase 3+, days 90-180):
  └─ [feature 5]

MAYBE-NEVER:
  └─ [feature 6 — unclear value]
```

### Step 6 — Spot scope creep

Red flags:
- «While we're at it…» — что-то добавляется без plan
- «It would be nice to also…» — wish list bleeding into MVP
- «Just one more thing…» — death by 1000 cuts
- «Future-proof» — premature optimization

If detected → push back, defer.

### Step 7 — Output

```
## Decision: [feature/scope question]

### Phase recommendation:
🟢 MVP (now) / 🟡 Beta / 🔴 Future / ⚫ Maybe-never

### Effort:
N hours (range), assuming X assumptions

### Reasoning:
[1-2 sentences]

### Trade-offs:
- If included: [benefit] but [cost]
- If excluded: [user impact] but [enables faster X]

### Dependencies:
- Requires: [list]
- Blocks: [list]

### Validation criteria:
If we include this in MVP, success looks like: [criteria]
```

---

## Examples

### Example 1: «Should Builder MVP have save workflow?»

**Hypothesis MVP testing:** «Do people understand visual agent building?»

**Test A:** If cut → still test hypothesis? **YES.** Mock workflows + immediate run = sufficient.

**Test B:** Effort? Save requires Supabase + Auth integration = 3-5 days.

**Test C:** Depends on backend? **YES.** MVP excludes backend.

**Test D:** Unlocks? Save enables sharing, version history, collaboration — Beta features.

**Decision:** 🟡 BETA. Cut from MVP.

### Example 2: «Should Builder MVP have keyboard shortcuts?»

**Hypothesis MVP testing:** «Do people understand visual agent building?»

**Test A:** If cut → still test? Mostly yes. Hardcore users might miss but не block hypothesis.

**Test B:** Effort? 4-8 hours для basic set (R, Delete, Cmd+S preview).

**Test C:** Backend dependency? **NO.**

**Test D:** Unlocks? Yes, power user retention.

**Decision:** 🟢 MVP (basic set only). Defer advanced shortcuts to Beta.

### Example 3: «Should Atlas have AI Companion in Phase 2?»

**Hypothesis Phase 2 testing:** «Do people pay $29/mo for Atlas Pro?»

**Test A:** If cut → still test WTP? **YES.** Content alone proves WTP if priced right.

**Test B:** Effort? Anthropic API integration + context injection + UI = 2-3 weeks.

**Test C:** Backend? **YES (heavy).**

**Test D:** Unlocks? Power user retention long-term.

**Decision:** 🔴 PHASE 4 (defer). MVP/Phase 1-3 не need AI Companion.

---

## Cut-list discipline

### Mantras

**1. «What's the smallest test of the hypothesis?»**
**2. «What happens if we don't build it now?»**
**3. «What would we cut if we had half the time?»**

If можешь не строить — не строй.

### Common cuts для MVP

- ✂️ Persistence (use localStorage / mocks)
- ✂️ Auth (open access)
- ✂️ Mobile (desktop-first)
- ✂️ Animations (transitions сначала)
- ✂️ Edge cases (happy path first)
- ✂️ Configurability (hardcode then parameterize)
- ✂️ Multi-language deep content (UI only)
- ✂️ Accessibility WCAG AAA (target AA)

### Cuts NOT acceptable

- ❌ Cut routing infra (breaks Atlas)
- ❌ Cut auth когда есть user-data
- ❌ Cut security (API keys never on frontend)
- ❌ Cut error handling (production won't survive)
- ❌ Cut user feedback (toasts/loading states)

---

## Что НЕ делаем в этом skill

- ❌ Не design features — это `product-strategist` / `agent-architecture`
- ❌ Не estimate technical risk — это `technical-risk-auditor`
- ❌ Не price tiers — это `monetization-architect`

**Focus: что in / out of scope, effort, sequence.**

---

## Pre-launch checklist для MVP

Перед заявлением «MVP done»:

- [ ] Hypothesis test plan written
- [ ] Success criteria defined (metrics)
- [ ] All MVP scope features built (no cuts mid-flight)
- [ ] No Beta features sneaked in
- [ ] Effort actual vs estimated logged
- [ ] Learnings документированы для next phase
- [ ] Decision log updated

---

_Skill created: 2026-05-24._

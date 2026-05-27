# 04 — Beta Plan: 90 days (days 30-120)

> Цель: первый функциональный продукт. Auth + real workflows + real AI APIs.
> User saves workflow, runs против Claude API, sees real output, has token budget.

---

## Definition of Done — Beta

После 90 days execution (через 120 days total):

- ✅ Users регистрируются в Builder (использует existing Atlas Auth)
- ✅ Workflows сохраняются в Supabase, не localStorage
- ✅ User может connect API ключ Claude → execute workflow за реальные deньги
- ✅ Token budget per tier (Free: 10k/mo, Pro: 100k/mo, Team: 500k/mo)
- ✅ Audit logs всех executions (для debugging + compliance)
- ✅ Stripe billing для Pro tier
- ✅ Tool library расширена: Claude, OpenAI, Google Analytics, Notion read
- ✅ Version history workflows (last 10 versions)
- ✅ Export/import workflow JSON
- ✅ Security audit пройден (нет plaintext keys, RLS valid)
- ✅ Mobile UI workable (read + minor edits, not full builder)
- ✅ Не ломает Atlas или Builder MVP

**Не required в Beta:**
- ❌ MCP integrations (Phase B-3)
- ❌ Multi-user collaboration на одном workflow
- ❌ Marketplace
- ❌ Plugin system
- ❌ Webhooks как triggers
- ❌ Scheduled executions
- ❌ Advanced billing (usage-based per token)

---

## Phase breakdown (Days 30-120)

### Phase B-2.1: Auth + Storage (Days 30-45)

#### Goals
Builder workflows persist в Supabase. Authenticated users have private workspaces.

#### Tasks

**Day 30-32 — Supabase schema deployment**
- [ ] Create migrations для `builder_*` tables (см. `02-architecture.md` § 3)
- [ ] Enable RLS на всех таблицах
- [ ] Seed `builder_tools` table с MVP tools list (mock + future Claude/OpenAI)
- [ ] Test queries через Supabase dashboard

**Day 33-37 — Frontend integration**
- [ ] Update `src/builder/services/workflowStorage.js`:
  - If `user.id` present → Supabase
  - If anonymous → localStorage (preserve MVP behaviour for non-auth users)
- [ ] Add «Save» button в `BuilderHeader`
- [ ] Auto-save every 30s if changes detected
- [ ] Migration: existing localStorage workflows → offer «Import to my account» при first signup

**Day 38-40 — User workspace UI**
- [ ] `BuilderHome.jsx` обновить: show user's saved workflows если auth
- [ ] Workflow cards: name, last edited, status (draft/published), actions
- [ ] Search + filter (recent/oldest/by-template)
- [ ] Archive workflow (soft delete)

**Day 41-45 — Auth gating**
- [ ] Builder MVP остаётся доступен без auth (preserve open access)
- [ ] Auth gate только на «Save» action: «Sign in to save»
- [ ] AuthModal reuse существующий из Atlas
- [ ] Post-signin: redirect back to Builder с saved state

**Outcome:** users persist workflows. Anonymous пользователи всё ещё могут experiment в MVP-mode.

---

### Phase B-2.2: Real API execution (Days 45-65)

#### Goals
Workflow execution через real Claude API. Backend proxy, encrypted keys, audit logs.

#### Tasks

**Day 45-48 — Edge function: API key management**
- [ ] Supabase Vault setup для encrypted storage
- [ ] Edge function `builder-validate-api-key`:
  - Input: tool_id + api_key
  - Process: test API request к provider
  - Store: encrypted в `builder_api_connections`
- [ ] UI в `BuilderHeader > Account > API Keys`:
  - Connect Claude / OpenAI keys
  - Visual indicator активных connections
  - Disconnect / rotate keys

**Day 49-55 — Edge function: workflow execution**
- [ ] Function `builder-execute-workflow`:
  - Input: workflow_id + input_data
  - Load workflow + nodes + edges from Supabase
  - Decrypt API keys для tools used
  - Topological order execution (dependency resolution)
  - Per-node: build prompt + call API + parse response
  - Log everything в `builder_executions` + `builder_execution_logs`
  - Return execution_id immediately, status polling

**Day 56-60 — Real-time status streaming**
- [ ] Supabase Realtime subscription на `builder_executions` table
- [ ] Frontend `useExecution(executionId)` hook
- [ ] Update Canvas nodes по execution status changes
- [ ] ExecutionPanel показывает real logs + tokens used

**Day 61-65 — Replace mock executor**
- [ ] Toggle в settings: «Use real execution» vs «Mock mode»
- [ ] Mock mode остаётся available для testing без spend
- [ ] Real mode только если API keys connected
- [ ] Clear UI signals: «Running on real Claude API → tokens will be deducted»

**Outcome:** workflow реально вызывает Claude API через backend proxy. Audit logs существуют.

---

### Phase B-2.3: Token limits + billing (Days 65-80)

#### Goals
Free vs Pro tier разделение. Stripe billing. Token allowance enforcement.

#### Tasks

**Day 65-68 — Token tracking**
- [ ] Update `builder-execute-workflow`:
  - Pre-check: user's remaining monthly tokens
  - Block if exhausted
  - Decrement on each AI call
- [ ] `builder_user_usage` table:
  ```sql
  user_id, month_year (YYYY-MM), tokens_used, executions_count
  ```
- [ ] Monthly reset via cron job или auto-detect month change

**Day 69-73 — Tier system**
- [ ] Extend Atlas `subscriptions` table или create `builder_subscriptions`:
  - Free: 10k tokens/mo, 1 saved workflow
  - Pro: 100k tokens/mo, 5 saved workflows, $49/mo
  - Team: 500k tokens/mo, unlimited workflows, $249/mo (Beta defer team)
- [ ] Enforce limits в frontend (UI) + backend (Edge functions)

**Day 74-78 — Stripe integration**
- [ ] Если уже подключен для Atlas (Phase 2 monetization) — reuse
- [ ] Если нет — Stripe Checkout setup
- [ ] Builder upgrade page: «Connect API costs eating your free tier? Upgrade Pro»
- [ ] Webhook handler обновляет `builder_subscriptions`

**Day 79-80 — Billing UI**
- [ ] Account → Subscription tab показывает current tier + usage
- [ ] Token usage graph (this month vs last month)
- [ ] Estimated cost («Your last run used ~$0.04 of your $49/mo allowance»)

**Outcome:** Builder монетизирован. Free users see paywall on limits. Pro users have budget.

---

### Phase B-2.4: Polish + security audit (Days 80-90)

#### Goals
Production-ready. Security validated. Mobile workable. Public launch.

#### Tasks

**Day 80-83 — Version history**
- [ ] `builder_workflow_versions` table (snapshot on each save)
- [ ] UI: «Version history» dropdown — restore previous version
- [ ] Limit: keep last 10 versions per workflow

**Day 84-86 — Export / import**
- [ ] Export workflow → JSON file
- [ ] Import JSON → validate schema → load to canvas
- [ ] Use case: sharing workflows вне Builder, backup

**Day 87 — Mobile UI**
- [ ] Mobile-friendly: read workflows, view executions, не build
- [ ] Builder canvas на mobile показывает overview + advise «Use desktop to edit»
- [ ] Account settings + billing работают на mobile

**Day 88-89 — Security audit**
- [ ] Manual review всех Edge functions: input sanitization, API key handling
- [ ] RLS policies test: try to access другого user's data — должно failed
- [ ] CSP заголовки validate
- [ ] Rate limiting test: spam requests → throttled
- [ ] Penetration testing рекомендуется через third-party (или сильный side check)

**Day 90 — Beta launch**
- [ ] Remove «Beta» badge из обозначений (или keep если still rough)
- [ ] Update Atlas IntroModal: add «Build agents in Builder» feature mention
- [ ] Outreach + announcement:
  - Existing Atlas Pro users (если есть)
  - LinkedIn Nordic + US/UK
  - Twitter thread с demo
  - Product Hunt launch?
- [ ] Monitor for issues 24-48h post-launch

**Outcome:** functional product. Real users можут execute workflows за real money.

---

## Cumulative effort estimate

| Phase | Days | Estimated hours |
|-------|------|-----------------|
| B-2.1 Auth + Storage | 30-45 | 60-80h |
| B-2.2 Real API execution | 45-65 | 80-100h |
| B-2.3 Token limits + billing | 65-80 | 50-70h |
| B-2.4 Polish + security | 80-90 | 40-60h |
| **Total Beta** | **60 days** | **230-310 hours** |

**Equivalent:** ~6-8 weeks full-time, ~3 months part-time.

---

## Dependencies / costs

### Tooling
- Supabase: free tier OK для Beta (upgrade $25/mo если выход за лимиты)
- Stripe: 2.9% + $0.30 per transaction (no monthly)
- Vercel: free tier OK
- Email service (Resend): free 3000/mo

### AI provider costs
- Claude API: pay per token. Beta-time founder может выделить ~$50-100 для тестирования
- Mock executor никаких costs

### Infrastructure
- React Flow: free (paid version $599/year не нужна для Beta)
- Sentry для error tracking: free tier OK

**Total Beta cost:** ~$50-100 founder spending для testing AI calls. Остальное free tier.

---

## Что НЕ делаем в Beta

- ❌ MCP server integration (defer to B-3)
- ❌ Marketplace third-party templates
- ❌ Real-time collaboration (multiple users в одном workflow)
- ❌ Webhooks как triggers
- ❌ Scheduled executions (cron в workflows)
- ❌ Workflow chaining (one workflow triggers another)
- ❌ Custom node creation by users
- ❌ Public profile / share workflows publicly
- ❌ Native mobile app
- ❌ White-label для resellers

---

## Beta success metrics (через 60 days после launch = day 150 total)

| Metric | Target |
|--------|--------|
| Builder users (free + paid) | 200-500 |
| Paid Builder users (Pro) | 10-30 |
| Builder Pro MRR | $490-1470 |
| Workflows saved | 500+ |
| Real API executions / mo | 1000-3000 |
| Average tokens per execution | 5k-10k |
| Failed execution rate | <10% |
| Mobile usage | 20-30% (read-only) |
| Atlas → Builder conversion | 5-10% (existing Atlas users) |
| Builder → Atlas Pro conversion | 15-25% (Builder users tend to buy Atlas) |

---

## Post-Beta (Phase B-3, days 90+)

### Что планируется

- **MCP integration** — connect any MCP server в Builder
- **Tool marketplace** — third-party integrations (Notion, Figma, Linear)
- **Collaboration** — real-time editing similar Figma
- **Custom node SDK** — devs builders own nodes
- **Webhooks + scheduled** — automation triggers
- **Enterprise tier** — SSO, dedicated infrastructure, custom MCP

### Когда стартуем Phase B-3

- ≥30 paid Builder Pro users
- Net positive feedback (NPS > 30)
- Clear demand signals from interviews
- 30%+ of Builder users реально run workflows (not just play with UI)

---

## Risk register (Beta)

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| API costs blow up при abuse | High | Token limits + alerts + rate limiting |
| Security incident (key leaked) | Medium | Encryption + audit + insurance review |
| Backend Edge function reliability | Medium | Monitor uptime, fallback to mock |
| User churn если billing confusing | High | Clear pricing + invoices + email reminders |
| Atlas Pro cannibalization (people pay only Builder) | Medium | Bundle pricing in Phase 4 |
| Free tier abuse (multiple emails) | Low | Email verification + IP rate limit |
| MCP complexity defers Phase B-3 | Medium | Defer, scope MCP very carefully |

---

## Critical milestones

**Day 45:** Workflow save/load работает с Supabase
**Day 60:** First real Claude API execution
**Day 80:** First paid Builder Pro signup (founder testing OK)
**Day 90:** Beta launch
**Day 120:** 50 paid users или iterate

---

_План создан 2026-05-24. Execution starts after MVP success (day 30 milestone)._

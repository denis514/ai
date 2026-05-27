# 04 — Monetization Roadmap

> Phase 0 → 4. Версия 2 (post-audit).
>
> **Главный сдвиг от V1:** Phase 0 не только interviews — а ещё repositioning
> (DONE). Phase 1 валидация и Stripe build идут **параллельно**, не
> последовательно. Первый $1 — через 3-4 недели, не 90 дней.

---

## Обзор фаз

```
Phase 0  | Week 0       | Repositioning + UX wins (DONE 2026-05-24)
Phase 1  | Week 1-2     | Validation interviews × 10 + Stripe scaffolding параллельно
Phase 2  | Week 2-4     | Content tagging + paywall UI + Stripe Checkout
Phase 3  | Week 4-5     | Launch + outreach + first paying users
Phase 4  | Month 2-6    | Team tier + optimization (after ≥10 paid + signal)
Phase 5  | Month 6-12   | Scaling + diversification + paid acquisition
```

Первый $1 через 3-5 недель. Первые $1000 MRR через 90-120 дней.

---

## Phase 0 — Repositioning (Week 0, DONE 2026-05-24)

### Что сделано

1. ✅ **Удалить auto-tutorial-push** (`App.jsx:248`) — `507bd27`
2. ✅ **Переписать IntroModal copy** — позиционирование «AI Transformation Playbook» — `51c9267`
3. ✅ **Audit 11 cap-* foundation узлов** — 6 скрыто (minLevel: expert), 4 в P1 upgrade, 1 reframe — `ff10208`
4. ✅ **Пересобрать business-strategy docs** на post-audit реальность — текущий коммит

### Что отложено в P1 (не блокирует Phase 1)

- Полный upgrade 4 cap-* узлов (tools, thinking, memory) — Backlog #34-#35
- Создание cap-input-modalities consolidation — Backlog #36
- Reframe cap-caching — Backlog #37

**Decision:** Phase 1 не ждёт P1 контентных задач. Перевод визитёра в paying user блокирован не качеством cap-* узлов, а **отсутствием paywall**.

---

## Phase 1 — Validation + Stripe scaffolding (Week 1-2)

### Track A: Customer interviews (founder time)

**Цель:** 10 интервью за 14 дней. Каждое 30-45 мин.

**Source:** LinkedIn outreach (см. `03-channels.md`).

**Scripts:** см. `02-target-customer.md` § 6 — interview script.

**Output:** `tasks/pricing-validation.md` — append per interview.

**Decision after 10:**
- 5+ «I'd pay $29/mo» → Phase 2 GO
- 3-4 «возможно» → +5 interviews, refine demo/pricing
- 0-2 «да» → STOP, переcмотр ICP/positioning

### Track B: Stripe scaffolding (parallel, technical)

**Цель:** при «GO» от Track A — Stripe готов к Phase 2 launch.

**Tasks:**
1. **Supabase subscription table** + RLS rules (3 дня)
   ```sql
   subscriptions (user_id, status, tier, current_period_end, stripe_customer_id, ...)
   RLS: только owner может read свои row
   ```

2. **Stripe account setup** (1 день)
   - Test mode + Live mode keys
   - 2 products: Atlas Pro Monthly ($29), Atlas Pro Annual ($290)
   - Webhook endpoint: `subscription.created`, `subscription.updated`, `subscription.deleted`

3. **Stripe Checkout integration** (3 дня)
   - `/api/checkout-session` edge function (Supabase function)
   - Redirect flow: app → Stripe Checkout → webhook → DB update → return to app
   - Test card: 4242 4242 4242 4242

4. **Subscription status в Auth Context** (1 день)
   - useAuth() returns `{ user, subscription: { tier: 'free' | 'pro', validUntil } }`
   - Refresh on app load + on webhook trigger

**Effort:** ~8 рабочих дней или ~1.5 недели.

### Output Phase 1
- ✅ 10 customer interviews completed + decision
- ✅ Stripe scaffolding в test mode ready
- ✅ Subscription state read everywhere in app
- ❌ Paywall UI ещё не виден пользователю (за feature flag)

---

## Phase 2 — Content tagging + Paywall UI (Week 2-4)

### Content tagging (strategic, content-decision-heavy)

**Цель:** атрибут `tier: 'free' | 'pro'` на каждом из 247 узлов.

**Decision matrix** (см. `01-revenue-model.md` § 3):

**Default free:**
- 65 Foundation
- 10+ Systems
- 10 basics tutorials
- 5-7 teaser transformation-узлов на ветку (~35-45 узлов)
- 2 «getting started» learning paths
- 42 prompt templates (read-only)

**Default pro:**
- 22 advanced transformation-узлы (после teasers)
- 17 use cases
- 12 learning paths (after teasers)
- 22 advanced tutorials
- Markdown export

**Tactical execution:**
1. **Decision sheet** (4-6h, founder time) — tagging решение на каждый из 247 узлов в spreadsheet
2. **Apply tags в mindmapData.js** — add `tier: 'free' | 'pro'` field per node (1-2h script)
3. **sync-whats-new + commit** (15 min)

**Effort:** 1-2 рабочих дня.

### Paywall UI (technical)

**Цель:** Pro узел для free user — visual gate.

**Compoments:**

1. **Lock detection в DetailPanel.jsx** (1 день)
   - Если `node.tier === 'pro'` И `subscription.tier === 'free'` → render lock screen

2. **PaywallScreen компонент** (2 дня)
   - Blur top 30% контента (`what` start visible, `why+when+impact+example+mistakes` blurred)
   - CTA: «Unlock with Atlas Pro — $29/mo or $290/year» + Stripe Checkout button
   - 3 social proofs (placeholder until real testimonials)
   - "What you get" bullets (1 link to feature comparison)

3. **Free-tier bookmark на pro-узле** (1 день)
   - Если free user bookmarks pro node → save bookmark, но UI показывает «🔒 Bookmark saved (Pro required to view)»

4. **Mindmap visual indicator** (1 день)
   - Pro-узел на карте — маленькая иконка lock в углу node
   - Hover preview работает (тизер), но клик ведёт к paywall

5. **Account → Subscription tab** (2 дня)
   - View current plan, billing date, change plan, cancel
   - Stripe Customer Portal embedded

**Effort:** ~7 рабочих дней или 1.5 недели.

### Output Phase 2
- ✅ 247 узлов tagged free/pro
- ✅ Paywall UI live (за feature flag — пока никто не видит)
- ✅ Stripe billing flow end-to-end working
- ✅ Account subscription management

---

## Phase 3 — Launch + outreach (Week 4-5)

### Soft launch

**Day 1 (Monday):**
- Feature flag → ON. Paywall активна для всех free users.
- Smoke test on prod: founder creates test paid subscription, verifies access flow.
- Lending strapline updated (если есть public landing): "Operating playbook for AI transformation. $29/mo."

**Day 1-7 (outbound focus):**
- 50 LinkedIn touches Nordic (3-4 hours/day founder time)
- Direct demos с 5-7 ICP leads из Phase 1 interviews (которые показывали интерес)
- Notion document «Atlas Pro launch» — для referrals + social proof

**Day 7-14:**
- 50 LinkedIn touches US/UK (parallel)
- First batch demo calls — 10-15 prospects through Calendly
- Conversion target: 5-15 paid users by Week 5

### Metrics Phase 3

| Metric | Target by Week 5 |
|--------|-----------------|
| Free users | +100 sign-ups |
| Free → Pro conversion | 5-15 paid |
| MRR | $145-435 |
| Demo calls held | 15-25 |
| Demo → paid rate | 25-40% |
| Avg deal size | $29 (only Pro tier, no Team yet) |

### Что НЕ делаем в Phase 3

- ❌ Team tier (defer to Phase 4)
- ❌ Annual discount push (focus on monthly = lower commit)
- ❌ Twitter content push (defer to Phase 4)
- ❌ Paid ads
- ❌ Press / launch announcement (HN/PH/etc.)

**Focus:** только LinkedIn outbound + demo calls.

---

## Phase 4 — Team tier + optimization (Month 2-6)

### Условие старта Phase 4

- ≥10 paid Pro users active
- ≥3 явных запросов «can we get this for the team?»
- Churn rate < 15%/mo (signal продукт-market fit)

### Team tier build

**Team workspace requirements:**
1. **Multi-user workspace** в Supabase
   - `workspaces` table, `workspace_members` table, RLS
   - Admin role + member role
   - 5-seat limit by default, upgradable

2. **Workspace UI**
   - "Workspaces" tab в Account
   - Invite via email (Resend / SendGrid)
   - Shared bookmarks (workspace-level)
   - Team progress dashboard (см. who's done what)

3. **Stripe billing — per-seat subscription**
   - $149/mo for first 5 seats
   - $30/seat for 6+ seats
   - Billing tied to workspace, not user

**Effort:** ~6 рабочих недель.

### Marketing motion Phase 4

- **Outreach shift:** теперь pitching "Atlas for your whole team" not "for you"
- **Demo content updated:** включить team-workflow scenario
- **Testimonials gathered:** first 5-10 paid users → ask for testimonials → use in marketing
- **Twitter content launch** (founder voice, см. `03-channels.md` § Channel #4)
- **SEO push** — static rendering, OG images, sitemap

### Metrics Phase 4

| Metric | Target by Month 6 |
|--------|-------------------|
| Free users | 1000+ cumulative |
| Paid Pro users | 100-200 |
| Paid Team workspaces | 5-10 |
| MRR | $3650-7300 |
| Churn rate (monthly) | <10% |
| NPS | 30+ |

---

## Phase 5 — Scaling + diversification (Month 6-12)

### Когда стартуем

- ≥$5k MRR consistently
- Team tier validated (≥5 workspaces)
- Channel saturation на LinkedIn (response rates dropping)

### Что строим

1. **Paid acquisition test** — LinkedIn Ads + Google Ads
2. **Partner program launch** — 25% recurring affiliate
3. **Content marketing push** — founder Twitter @ 5k followers, SEO traffic 1k/mo
4. **Enterprise tier** — custom contracts $500-2000/mo, SSO, on-prem
5. **One-time products** — Transformation playbook bundles ($199), founder consultations ($499)

### Metrics Phase 5

| Metric | Target by Month 12 |
|--------|--------------------|
| Free users | 5000+ |
| Paid Pro users | 300-500 |
| Paid Team workspaces | 15-25 |
| MRR | $11k-18k |
| LTV:CAC | 3:1+ |
| Churn rate | <5%/mo |

---

## What НЕ делаем (anti-roadmap)

- ❌ **Build AI Companion в Phase 1-3** — defer to Phase 5 если будет signal
- ❌ **Build team tier до Phase 4** — нет signal, premature optimization
- ❌ **Premium playbook PDFs до Phase 3** — formatting work, не value
- ❌ **Mobile native app** — defer indefinitely (PWA enough)
- ❌ **Custom CLAUDE.md generator** — fascinating but не сейчас
- ❌ **Localize в другие языки кроме ru/en/fi** — после Phase 5
- ❌ **Pivot если первые 5 paid users — slow** — give it 90 days minimum

---

## Risk register

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Phase 1 валидация показывает 0-2 «yes» | Medium | Pivot ICP / positioning, не paywall infra |
| Stripe technical issue blocks launch | Low | Test mode early in Phase 1 |
| Free users churn пред-paywall | Medium | Communicate paywall как «coming soon» via email |
| Конкурент (Anthropic Academy) копирует positioning | Low | Финский moat не воспроизводим за 6 мес |
| Founder bandwidth runs out (interview + build + outreach parallel) | High | Hire 1 contractor для Stripe build в Phase 1 если capacity issue |
| AI capabilities change (Claude deprecation) | Medium | Deprecate-watch на cap-* узлах |

---

## Decision triggers

**После Phase 1:** Go/No-Go на Phase 2 (см. § Phase 1 decision after 10)

**После Phase 3 (Week 5):**
- ≥10 paid Pro users → Phase 4 build начинается
- 5-9 paid → continue Phase 3 outreach 4 more weeks
- 0-4 paid → revisit ICP, demo, pricing

**После Phase 4 (Month 6):**
- ≥$5k MRR + signal → Phase 5
- $3-5k MRR → continue Phase 4 optimization
- <$3k MRR → product-market fit issue, deep retrospective

---

_Версия 2.0 — 2026-05-24 (post product audit)._

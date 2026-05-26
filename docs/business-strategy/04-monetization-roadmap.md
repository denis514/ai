# 04 — Monetization Roadmap (90 дней)

> **TL;DR**: Day 0–14: ICP validation. Day 14–35: Stripe + paywall infra. Day 35–60: soft launch Pro. Day 60–90: Team tier + outbound. Target: $5K MRR за 6 месяцев, $500 MRR за 90 дней.

---

## Phase 0 — Validation (Day 0-14)

**Goal:** Не строить paywall до доказательства, что есть willingness to pay.

### Tasks

- [ ] **10 ICP interviews** (Primary segment — eCommerce leads).
  - Schedule через LinkedIn Sales Navigator outreach
  - Скрипт интервью — см. `docs/business-strategy/02-target-customer.md` § 5
  - Owner: human (founder) с помощью `skills/user-research-synthesizer`
  
- [ ] **Pricing reaction test:** в каждом интервью прямо: «Team subscription $99/мес
  за 5 seats — что думаешь?»
  - Need: 5+ «I would pay» reactions
  - Documenting: цитаты + sentiment в `tasks/pricing-validation.md`

- [ ] **Top Pro-only feature identification.**
  - Слушать boли: что бы они «купили» как Pro feature
  - Top candidates: AI Companion mode, Workflow library full access, downloadable playbooks
  - Decision: 1 «must have» feature для Pro launch

### Exit criteria

- ✅ 5+ positive pricing signals
- ✅ 1 clear Pro-only feature decided
- ✅ 3+ referrals to other potential customers

**Если не достигли — НЕ ИДЁМ в Phase 1.** Возвращаемся к ICP validation.

---

## Phase 1 — Paywall Infrastructure (Day 14-35)

**Goal:** Технический фундамент монетизации без user-facing changes пока.

### Tasks

- [ ] **Stripe integration** (test mode first)
  - Stripe account + Tax/VAT setup для Финляндии
  - Webhook handler в Supabase Edge Functions
  - Customer Portal для self-serve billing
  
- [ ] **Tier system в Supabase**
  - Таблица `subscriptions` (user_id, tier, status, current_period_end)
  - RLS: feature gates через JWT claim
  - Hook в auth flow — обновлять JWT при tier change
  
- [ ] **Pricing page** (`/pricing` route)
  - 3 tiers: Free / Pro / Team
  - Annual toggle (−17% discount)
  - FAQ inline
  - 3 locales (RU/EN/FI)
  
- [ ] **Upgrade flow UX**
  - "Upgrade to Pro" CTA в местах где user hits Pro-only feature
  - Stripe Checkout integration
  - Success/cancel callbacks
  
- [ ] **Feature gates** в UI
  - Bookmark limit (5 для Free, unlimited для Pro)
  - Pro-only feature: gated с upgrade modal
  - Soft paywall: показать что есть, но locked

- [ ] **Receipts + GDPR**
  - Stripe automated receipts
  - VAT invoice для EU customers (Stripe handles)
  - Privacy Policy update (subscription data section)

### Exit criteria

- ✅ Можно купить Pro в test mode end-to-end
- ✅ Tier reflected в UI и API access
- ✅ Cancel flow работает (downgrade to Free)
- ✅ GDPR-compliant (data export включает subscription history)

---

## Phase 2 — Pro Soft Launch (Day 35-60)

**Goal:** First $500 MRR от Pro tier.

### Tasks

- [ ] **Switch Stripe to live mode**
  - Activated account verification
  - Real charges enabled
  
- [ ] **Email outreach к early users** (50-100 emails)
  - Tone: «You've been using Atlas; we're launching Pro»
  - Founder-personal не corporate
  - Early bird discount: 50% off first 3 months
  - Owner: founder

- [ ] **Pro launch announcement**
  - LinkedIn post (personal account)
  - Twitter/X post
  - Update website hero — Pro tier visible
  
- [ ] **First 10 customers feedback loop**
  - Personal email после signup: «What made you pay?»
  - Track: какие features они используют
  - Iterate: убрать unused, усилить used
  
- [ ] **Refund policy decision**
  - Standard: 14-day money-back guarantee
  - Reduces friction for first-time buyers

### Targets

- $500 MRR (~25 Pro subscriptions at $19)
- <10% trial→paid (acceptable for cold launch)
- 0 refunds requested (signal pricing/value match)

### Exit criteria

- ✅ Stripe live processing real charges
- ✅ $500+ MRR
- ✅ <10% monthly churn signal

**Если 0 paid в 25 дней:** stop, return to Phase 0. Pricing или ICP неправильный.

---

## Phase 3 — Team Tier + Outbound (Day 60-90)

**Goal:** Scale to $2K MRR через B2B channel.

### Tasks

- [ ] **Team tier launch**
  - Pricing page обновить (Team tier visible)
  - Team workspace UI (admin panel, invite flow, seat management)
  - Team billing (annual default, monthly available)
  - Shared bookmarks/workspace state

- [ ] **LinkedIn outbound к 100 ICP**
  - 50 connect/week × 2 недели
  - Sequence per `03-channels.md` § 3
  - Owner: founder с помощью `skills/growth-strategist`

- [ ] **First 3 Team customers**
  - Concierge onboarding: zoom call setup, team workspace pre-configured
  - White-glove first month: weekly check-in
  - Goal: turn them into case studies

- [ ] **Case study #1**
  - Document outcome от первой Team customer
  - Quote + ROI numbers + photo (with permission)
  - Use в marketing для следующих deals

### Targets

- 3 Team subscriptions (~$300 MRR)
- 25+ Pro subscriptions (~$475 MRR)
- Total: $775+ MRR
- LinkedIn → 25 conversations → 3 demos → 1+ Team subscription

### Exit criteria

- ✅ $750+ MRR
- ✅ At least 1 case study published
- ✅ Repeatable acquisition motion documented

---

## Phase 4 — Scale (Day 90-180)

**Goal:** $5K MRR + product-market fit signals.

### Strategy

- **SEO traction:** 10+ keywords ranking на page 1-2
- **Partner channel active:** 1 Tier 1 partnership generating leads
- **Content cadence:** 2 articles/month + Atlas updates
- **Outbound rhythm:** 50 LinkedIn/week sustained
- **Iteration:** monthly customer interviews, quarterly pricing review

### Targets

- $5,000 MRR
- 60% Pro / 40% Team revenue split (signals B2B traction)
- <5% monthly churn
- 30% revenue from partner channels

### Decision point at $5K MRR

- ✅ Hit it: Series of investments (paid acquisition test, additional locale)
- ⚠️ Missed: re-evaluate ICP/product/pricing — не масштабируем broken motion

---

## Critical risks

| Risk | Probability | Mitigation |
|------|-------------|-----------|
| 0 paying customers в 60 дней | Medium | Phase 0 validation — не строим paywall без signal |
| High churn (>10% monthly) | Medium | Concierge first 10 customers, weekly feedback |
| Stripe compliance issues для Финляндии | Low | Stripe Tax handles VAT; Stripe Atlas если нужна US entity |
| LinkedIn account restricted | Low | Manual outreach, не automation; Sales Navigator legit |
| Anthropic запускает competing product | Medium | Differentiated positioning (we're not vendor-tied) + cooperation as partner |
| AI fatigue в market | Low (still growing) | Focus на Transformation OS positioning, не AI-курсы |

---

## What to NOT do during 90 days

- ❌ Add new product features unrelated to monetization
- ❌ Pursue Enterprise deals (slow sales cycle distracts)
- ❌ Spend on paid acquisition
- ❌ Build mobile app (Web-first до 1K paid users)
- ❌ Hire (founder + Claude должно хватать)
- ❌ Take investor meetings (без leverage до $5K MRR)

---

## Weekly cadence во время roadmap

| День | Activity |
|------|----------|
| Понедельник | Strategy review (см. weekly-strategy-review automation) |
| Вторник-четверг | Execution (build, write, outreach) |
| Пятница | Customer conversations (3 calls minimum) |
| Воскресенье | Weekly metrics review + Monday plan |

---

_Status: PLAN — Phase 0 ещё не стартовала_
_Created: 2026-05-24 | Owner: business-strategist agent_
_Next review: после Phase 0 completion (or at Day 14, whichever first)_

# 05 — Business Metrics

> **TL;DR**: 3 уровня метрик — North Star (MRR), Health (churn, NPS), Growth (signups, conversion). Не отвлекаемся на vanity (impressions, followers).

---

## 1. North Star Metric

### **MRR (Monthly Recurring Revenue)**

Единственная метрика, по которой судим бизнес. Включает Pro + Team + Enterprise.

**Цели:**
- Day 90: $750 MRR
- Day 180: $5,000 MRR
- Day 365: $25,000 MRR (требует team scaling)

**Почему MRR, не GMV/total revenue:**
- Recurring → predictable runway
- One-time playbook sales не считаются (Phase 3+)
- Включает все paid tiers

---

## 2. Health Metrics (мониторим еженедельно)

### Churn rate

**Definition:** % paying customers, который отменил subscription в данном месяце.

**Targets:**
- Pro: <5%/мес (B2C SaaS standard)
- Team: <3%/мес (B2B SaaS standard)
- Trigger alert: >7% любой tier 2 месяца подряд

**Действия при high churn:**
1. 3 интервью с churned customers (что не сработало?)
2. Audit Pro-only features (kто чем пользуется?)
3. Возможно сменить positioning

### Net Promoter Score (NPS)

**Definition:** % promoters minus % detractors на «would you recommend Atlas to a colleague?»

**Targets:**
- >30 = good
- >50 = excellent (часто переходит в organic referrals)

**Cadence:** quarterly survey to all paying customers (NPS tooling: Delighted или simple Stripe form).

### Customer Acquisition Cost (CAC)

**Definition:** Total marketing/sales spend ÷ new paying customers.

**Targets:**
- Pro: <$30 (1 month payback)
- Team: <$300 (3 month payback)

**Calculation (Phase 1-3):**
- Phase 1-2: только Founder time (валидация channel). CAC = 0 financial, high time cost.
- Phase 3+: добавляем sales nav $99/мес, любой sponsorship spend.

### LTV (Lifetime Value)

**Definition:** ARPU × (1 / churn rate).

**Targets:**
- Pro: $228 (12 month retention × $19)
- Team: $3,300+ (24 month × $99 + expansion)

**LTV / CAC ratio target: >3x.** Меньше — unit economics не работают.

---

## 3. Growth Metrics (мониторим неделю-к-неделе)

### Top of funnel

| Метрика | Targets Day 90 | Targets Day 180 |
|---------|----------------|-----------------|
| Free signups / неделя | 50 | 200 |
| SEO impressions / неделя | 5,000 | 50,000 |
| LinkedIn connects / неделя | 50 | 50 (sustained) |
| Partner-referred visits / неделя | 0 | 100+ |

### Mid funnel

| Метрика | Target |
|---------|--------|
| Free → Trial conversion | 20% |
| Trial → Paid conversion | 25% |
| Demo → Subscription (Team) | 30% |

### Bottom funnel

| Метрика | Target |
|---------|--------|
| New Pro / неделя | 5 (Day 60-90) → 15 (Day 180) |
| New Team / неделя | 0.3 (Day 60-90) → 2 (Day 180) |
| Activation rate (used 5+ times in week 1) | >60% |

---

## 4. Product engagement metrics

### Activation
**Definition:** User completed «aha moment» — opened 3+ nodes + bookmarked 1.

**Why:** Strong leading indicator of paid conversion.

**Target:** >50% of signups activate within 24h.

### Retention cohorts

| Cohort | Target Week 1 | Week 4 | Week 12 |
|--------|---------------|--------|---------|
| Free signups | 40% | 20% | 10% |
| Pro subscribers | 90% | 80% | 70% |
| Team subscribers | 95% | 90% | 85% |

### Feature usage (на Pro-only feature)

Tracking чтобы понять что валуется:
- AI Companion mode opens / week
- Workflow library full reads / week
- Playbook downloads / week

**Если Pro-only feature имеет <30% usage среди Pro users — feature не валуется. Либо
рефакторим, либо убираем.**

---

## 5. Channel-specific metrics

См. `03-channels.md` § 7 для detailed channel KPIs.

Summary:
- **SEO:** organic monthly visits (target 1,000 Day 180)
- **LinkedIn:** demo bookings от outbound (target 5/week)
- **Partners:** referred customers (target 30% всех paid)

---

## 6. Vanity metrics — DO NOT TRACK

Эти метрики красивые, но ничего не говорят про бизнес:

- ❌ Twitter/X followers
- ❌ LinkedIn page followers
- ❌ Total user count (если они не activate)
- ❌ Total tutorial completions
- ❌ "Time on site" в среднем
- ❌ Star count на GitHub (если будет open source)

**Правило:** если метрика не предсказывает MRR — не считаем её.

---

## 7. Reporting cadence

### Weekly (понедельник)
- MRR delta WoW
- New paid signups (Pro/Team breakdown)
- Churn events
- Top 3 SEO keyword movements
- LinkedIn outbound stats

**Format:** 1 markdown file `tasks/weekly-strategy-{YYYY-MM-DD}.md`.
**Generator:** `scripts/weekly-strategy-review.mjs` (см. business-strategist skill).

### Monthly
- Cohort retention update
- CAC by channel
- LTV/CAC ratio
- NPS если quarterly month

### Quarterly
- ICP review (still right segment?)
- Pricing review (raise? lower? new tier?)
- Roadmap update (next 90 days)

---

## 8. Decision triggers

Метрики триггерят конкретные действия:

| Trigger | Action |
|---------|--------|
| Churn > 7% × 2 месяца | 3 interviews → decide retention plan |
| Free→Paid conversion < 1% × 60 дней | Re-validate Pro feature gate |
| MRR growth < 10% MoM at Day 120+ | Re-strategize channels или ICP |
| LTV/CAC < 2× | Halt paid acquisition, fix unit economics |
| NPS < 20 | Customer interview round + product audit |
| 0 referrals на 100 paid customers | Add referral incentive |

---

## 9. Что НЕ оптимизируем рано

### NOT before $5K MRR
- ❌ A/B testing pricing
- ❌ Funnel optimization (CRO внутри Atlas)
- ❌ Sophisticated attribution
- ❌ Cohort analysis tooling (Excel + Stripe экспорт хватает до $5K MRR)

### Why
До $5K MRR оптимизация преждевременна — недостаточно volume чтобы statistical significance.
Лучше фокус на acquisition + qualitative customer development.

---

## 10. Tooling

| Цель | Tool | Cost |
|------|------|------|
| Subscriptions | Stripe | 2.9% + $0.30 per charge |
| User analytics | Mixpanel (free до 100K events) или Plausible | $0-19/мес |
| Cohort retention | Stripe dashboard + manual export | $0 |
| NPS surveys | Delighted (free до 50 surveys) или Tally | $0-50/мес |
| Customer outreach | Personal Gmail / LinkedIn (no CRM до $5K MRR) | $0 |
| Sales Navigator | LinkedIn | $99/мес |

**Total tooling cost: <$150/мес** до $5K MRR. После — добавим CRM (Attio или Pipedrive).

---

_Status: PLAN — нет live tracking yet_
_Created: 2026-05-24 | Owner: business-strategist agent_

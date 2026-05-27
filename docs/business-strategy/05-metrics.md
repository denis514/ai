# 05 — Business Metrics

> Что измеряем, что игнорируем. Версия 2 (post-audit).
>
> **Главный сдвиг от V1:** target MRR более скромный и realistic ($1100 vs $5000
> через 90 дней), но дополнительно: **Phase 1 metrics** — валидация перед launch.

---

## Иерархия метрик

```
NORTH STAR
  └─ MRR (Monthly Recurring Revenue)

HEALTH METRICS (sustainability)
  ├─ Monthly churn rate
  ├─ NPS (Net Promoter Score)
  └─ Activation rate (free → first meaningful action)

GROWTH METRICS (acquisition)
  ├─ Free signups / week
  ├─ Free → Paid conversion rate
  ├─ Demo call → Paid rate
  └─ Channel attribution (LinkedIn / SEO / Twitter)

PHASE 1 SPECIFIC (validation)
  ├─ # of customer interviews completed
  ├─ # of "yes I'd pay $29" signals
  ├─ Pricing tolerance score (1-5 from interviews)
  └─ ICP confirmation rate
```

---

## North Star — MRR

**Monthly Recurring Revenue** — единственная метрика которую founder смотрит каждый день.

### Targets

| Период | Pro users | Team workspaces | MRR Pro | MRR Team | Total MRR |
|--------|-----------|-----------------|---------|----------|-----------|
| Day 30 (Phase 3 end) | 5-15 | 0 | $145-435 | $0 | **$145-435** |
| Day 60 | 15-30 | 0-1 | $435-870 | $0-149 | $435-1019 |
| Day 90 | 30-50 | 1-2 | $870-1450 | $149-298 | **$1019-1748** |
| Month 6 | 100-200 | 5-10 | $2900-5800 | $745-1490 | **$3645-7290** |
| Month 12 | 300-500 | 15-25 | $8700-14500 | $2235-3725 | **$10935-18225** |

### Sub-metrics MRR

- **New MRR** — добавлено в этот месяц
- **Expansion MRR** — upgrades (Pro → Team)
- **Churn MRR** — потеряно через cancellations
- **Net New MRR** = New + Expansion − Churn

**Цель: positive Net New каждый месяц с Day 60.**

---

## Health metrics

### Monthly churn rate

**Define:** % of paid users who cancel in given month.

**Targets:**
- Month 1-3: <20% (early product, expected)
- Month 4-6: <15%
- Month 7-12: <10%
- Month 12+: <5% (SaaS standard for healthy product)

**Red flag:** churn >25% sustained 2 months → fundamental issue.

### NPS (Net Promoter Score)

**Survey trigger:** 14 days after sign-up + 60 days after subscription start.

**Question:** "How likely are you to recommend Atlas to a colleague?" (0-10)

**Targets:**
- Month 3: NPS 20+ (good для early product)
- Month 6: NPS 30+ (good для SaaS)
- Month 12: NPS 50+ (great)

**Red flag:** NPS <0 means actively damaging brand. Pause growth, fix.

### Activation rate

**Define:** % of new free users who do «meaningful action» в первые 7 дней.

**Meaningful action** = ≥1 of:
- Открыл 3+ transformation nodes
- Прошёл 1+ tutorial step
- Bookmark hit ≥1 node
- Cmd+K search ≥1 раз

**Targets:**
- Month 1: 40%+ activation
- Month 3: 55%+ activation
- Month 6: 65%+ activation

**Red flag:** <30% activation → onboarding/IntroModal problem.

---

## Growth metrics

### Free signups / week

**Source:** Supabase `auth.users` table.

**Targets:**
- Phase 3 (Week 4-5): 10-20 new signups/week
- Phase 4 (Month 2-6): 30-100 new signups/week
- Phase 5 (Month 6-12): 100-500 new signups/week

### Free → Paid conversion rate

**Define:** Of users who signed up free, what % converts to Pro within 30 days.

**Targets:**
- Phase 3: 5-10% (high, because Phase 3 traffic = warm leads from interviews)
- Phase 4: 2-4% (broader audience)
- Phase 5: 2-5% (with optimization)

**Industry benchmark for B2B SaaS:** 2-5% free → paid conversion.

### Demo call → Paid rate

**Define:** Of demo calls held, what % converts to paid.

**Targets:**
- Phase 3: 30-40% (highest — warm from interviews)
- Phase 4-5: 20-30% (general demo flow)

### Channel attribution

UTM-tracking + Supabase signup metadata.

**Track:**
- LinkedIn (organic via cold outreach)
- SEO (organic via google)
- Twitter (organic via twitter)
- Direct (типаted URL or word-of-mouth)
- Partner (affiliate code)

**Target distribution Phase 4-5:**
- LinkedIn: 40-50%
- SEO: 20-30%
- Twitter: 10-20%
- Direct: 10-15%
- Partner: 5-10%

**Concentration risk:** если один канал >70% — fragile.

---

## Phase 1 specific metrics (validation)

### Interview completion

| Метрика | Target |
|---------|--------|
| Interviews completed | 10 за 14 дней |
| ICP show-up rate | >50% (booked vs held) |
| Interview length | 30-45 min average |
| Recordings + notes | 100% (с разрешения) |

### Validation signals

**Strong WTP signal** (count of):
- "Yes, I'd pay $29/mo" — direct quote
- "We need this for our team" — team interest
- "Can I share this with [colleague]?" — referral signal

**Threshold for GO Phase 2:**
- 5+ из 10 interviews → at least 1 strong WTP signal

**Threshold for STOP / pivot:**
- 0-2 strong signals из 10 → ICP wrong OR positioning wrong

### Pricing tolerance score

Scale 1-5 from interview answer to "would $29/mo make sense?":
- 5 — "yes immediately"
- 4 — "yes for team budget"
- 3 — "maybe, depends"
- 2 — "too expensive but I'd consider $15"
- 1 — "no"

**Target average:** 3.5+ from 10 interviews → pricing OK.
**Below 3:** consider $19 Pro tier OR repositioning.

---

## Vanity metrics — НЕ отслеживаем

❌ **Page views / impressions** — нет relation к revenue, distracting
❌ **Twitter followers** — irrelevant до Phase 4, even then secondary
❌ **LinkedIn connections count** — only quality matters
❌ **GitHub stars** — мы не OSS proj
❌ **Reddit upvotes** — лотерея
❌ **Press mentions** — feel-good, не revenue
❌ **Total mindmap nodes count** (247) — это product metric, не business
❌ **Tutorials completed (total)** — engagement proxy, не revenue

**Правило:** если метрика не корреллирует с MRR в 30-90 дней — игнорируем.

---

## Dashboard structure

### Daily check (5 min, founder)
- New signups today
- New paid users today
- Cancellations today
- MRR delta vs yesterday

### Weekly review (Monday, 30 min)
- New MRR vs target
- Churn rate (rolling 30d)
- Channel breakdown
- Demo calls held last week + result
- Top 3 issues / friction points

### Monthly retrospective (1st Monday, 60 min)
- All North Star + Health + Growth metrics
- Decision log update
- Adjustments to roadmap

---

## Tooling

**Now (Phase 0-1):** Markdown файлы + manual Supabase queries.
- `tasks/weekly-strategy-{date}.md` — auto-generated по понедельникам через GitHub Actions
- `tasks/pricing-validation.md` — interviews log

**Phase 2-3:** + Stripe Dashboard для billing metrics.

**Phase 4+:** Consider:
- ChartMogul ($100/mo) — SaaS revenue analytics
- Plausible / Posthog (privacy-first) — product analytics
- PostHog — feature usage tracking

**До Phase 4 нет budget для аналитики tooling.** Manual review достаточен для <100 paid users.

---

## Decision support через metrics

### Когда что menyaem

| Metric | Threshold | Decision |
|--------|-----------|----------|
| Phase 1 validation signals | 5+ из 10 yes | Phase 2 GO |
| Phase 1 validation signals | 0-2 из 10 yes | Pivot ICP / positioning |
| Conversion rate (Phase 3) | >5% | Healthy, scale outbound |
| Conversion rate | <2% | Demo / pricing issue |
| Churn rate | >25% | Product issue, pause growth |
| NPS | <0 | Critical, stop sales until fixed |
| Demo show-up rate | <30% | Booking flow broken |
| Activation rate | <30% | Onboarding broken |
| Channel concentration | >70% in one | Diversification needed |

---

## Что измеряем для weekly strategy review

`scripts/weekly-strategy-review.mjs` (auto-generated по понедельникам) собирает:

1. **Code activity:** commits last week, файлов изменено
2. **Content state:** total nodes, tutorials, локали status
3. **Task state:** open tasks, completed last week
4. **Subscription metrics** (Phase 3+): MRR, new paid, churn, free signups
5. **Channel metrics** (Phase 3+): signups by source
6. **Open questions:** автоматически вытаскиваются из decisions.md «status: hypothesis»

Эти данные становятся weekly markdown файлом для review founder-ом.

---

_Версия 2.0 — 2026-05-24 (post product audit)._

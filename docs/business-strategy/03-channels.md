# 03 — Distribution Channels

> Где находим клиентов. Версия 2 (post-audit).
>
> **Главный сдвиг от V1:** не «SEO + LinkedIn + Partners» в равной доле.
> Канал #1 — **Nordic LinkedIn + финский moat**. Остальное — после валидации.

---

## Иерархия каналов (V2)

```
PHASE 1 (валидация):
  └─ #1 Nordic LinkedIn — 80% усилий, финский tier-card как hook

PHASE 2 (масштабирование):
  └─ #1 Nordic LinkedIn (продолжение)
  └─ #2 US/UK LinkedIn — после Nordic валидации

PHASE 3 (диверсификация):
  └─ #3 SEO long-tail content (eCommerce / Ops / etc)
  └─ #4 Twitter/X presence (Product Twitter)
  └─ #5 Partner referrals (Phase 4)

PHASE 4 (post-product-market-fit):
  └─ #6 Paid acquisition (Google Ads / LinkedIn Ads)
  └─ #7 Sponsorships (Lenny, Marketingexamined)
  └─ #8 Conferences (SaaStr, Web Summit)
```

**Правило:** не запускаем канал N+1 до validated unit economics канала N.

---

## Канал #1 — Nordic LinkedIn outbound

### Почему первым

1. **Финский moat работает только здесь** — main differentiator
2. **Low competition** — нет других нордических AI-products
3. **Network density** — финский B2B-community компактный
4. **LinkedIn density** — Finland 30% population on LinkedIn
5. **Pricing tolerance** — $29 для финской компании = ничего
6. **Geo proximity** — для founder (если в EU) — same timezone, культурно ближе

### Tactic

**Tool stack:**
- LinkedIn Sales Navigator ($99/mo) — необязательно сразу, но облегчает через 2-3 недели
- Hunter.io ($49/mo) — найти email для cold-email backup canal
- Calendly ($10/mo) — для booking demo calls
- Notion / Markdown файл для tracking

**Targeting:**
- Country: Finland (start) + Estonia + Sweden + Norway + Denmark
- Job titles: Head of Product, Head of Operations, Head of Strategy, VP Product, CPO, COO
- Company size: 50-500 employees
- Industry: NOT crypto, NOT Big4 consulting, NOT government

**Volume:** 30-50 LinkedIn connections per week, 10-15 conversations per week.

### Message sequence (4-touch)

**Touch 1 — Connect request (no pitch):**
> "Hi [Name], saw your work at [Company] on [specific observation from their profile]. I'm building an AI Transformation Playbook for Product/Ops teams — would love to be connected."

**Touch 2 (2 days after acceptance) — Value send:**
> "Hi [Name], thanks for connecting. Quick context — I noticed [observation about their team/post]. I made a free AI map for Product/Ops teams: [link to Atlas]. The eCommerce or Operations direction might resonate with what you're working on."

**Touch 3 (5 days after Touch 2) — Question (only if engaged):**
> "Hi [Name], curious — how is your team approaching AI strategy right now? Most heads-of-product I talk to either roll their own framework or hire consulting. I'm trying to learn what's actually working."

**Touch 4 (7 days after Touch 3, only if responded) — Demo invite:**
> "Would you be open to a 30-min call? I'd love to show you how [specific direction] is structured and learn about your team's process."

**Critical rule:** только 1 ask на touch. Sequence — value-first. If response cold, drop after touch 3.

### Финский angle (специально для Finland targets)

Use Finnish language opportunistically:
- LinkedIn About может быть на финском: "Rakennan AI-käsikirjaa Product- ja Ops-tiimeille"
- Touch 2 если профиль на финском: "Hei [Name], huomasin että työskentelet [companyssa]. Tein ilmaisen AI-kartan Product- ja Ops-tiimeille — finskinkielinen on saatavilla yksinään tällä alalla."

Не натянуто — естественно. Финский ICP воспринимает это как сильный сигнал.

### Метрики канала

- Connection accept rate: target 30-50% (B2B norm)
- Connection → conversation rate: target 10-15%
- Conversation → demo: target 30-40%
- Demo → paid: target 20-30%

**Funnel example:** 100 connections/mo → 40 accepts → 5 conversations → 2 demos → 1 paid

**ROI calc:** ~$29 MRR per 100 connections + 4-5 founder-hours/week. Time, not money.

---

## Канал #2 — US/UK LinkedIn outbound

### Когда запускаем

После Nordic канала #1 validated: ≥3 paid users from ≤100 connections sent.

### Чем отличается от Nordic

- Volume в 5-10× больше (US ICP ≈ 50k LinkedIn-доступных)
- Conversion в 2-3× ниже (competition higher, attention scarcer)
- Финский angle не работает — нужен другой hook

### Новые hooks для US/UK

1. **"AI for [their specific function]"** — eCommerce, Ops, Marketing direction-specific entry point
2. **"AI Transformation Playbook"** — общий positioning
3. **Anti-consulting angle** — "$200k consulting → $29/mo handbook"

### Тactic

Same 4-touch sequence, no Finnish step.

**Targeting tweaks:**
- US/UK companies с recent funding (Series A-C) — they have AI initiatives, fresh budget
- Companies that posted "Hiring: Head of AI" в последние 6 месяцев — they care
- Companies with active product blog — proxy for sophisticated leadership

---

## Канал #3 — SEO long-tail content

### Когда запускаем

Phase 3+ (после Stripe launch). До этого SEO — distraction.

### Strategy

**Не блог.** Atlas content **сам** является SEO-asset. 247 узлов с unique URL = 247 indexable pages в 3 локалях = 741 indexable pages.

**Optimization needed:**
1. Static rendering для узлов (сейчас SPA — Google indexes частично)
2. Meta tags per node (title + description from `what`)
3. OG images per node (auto-generated)
4. Sitemap.xml с приоритетами
5. Internal linking optimization (cross-links уже работают на UI level)

### Target search queries

**Long-tail keywords:**
- "AI workflow for content operations"
- "AI use cases in eCommerce"
- "AI transformation playbook"
- "Claude prompt for [task]"
- "how to use AI in customer support team"

**Volume:** 100-1000 searches/month each. Combined: 30k-100k monthly searches addressable.

**Conversion expectation:** SEO traffic → free signup → free user → eventually paid: 0.5-2% conversion. Long tail.

---

## Канал #4 — Twitter/X presence (Product Twitter)

### Когда запускаем

Phase 3+ параллельно SEO.

### Strategy

**Founder's account** становится Atlas voice. Twitter ICP = Product/Marketing/Ops on Twitter = 100% overlap с our ICP.

**Content cadence:**
- 1-2 tweets/day (не больше — отвлекает)
- Mix:
  - 50% direct insights from Atlas content ("Today's transformation node: ec-pdp-gen. Catalog teams use AI to scale PDP creation. Here's why...")
  - 30% commentary on AI news ("Anthropic released X — here's how it shifts the operating model for [function]")
  - 20% engagement (replies, build relationships with practitioners)

**Format:**
- Threads of 5-10 tweets explaining one operating model
- Screenshots of Atlas (visual proof)
- Always link back: "Full graph here: [Atlas URL]"

### Метрики канала

- Followers growth: 50-100/mo organic (slow)
- Atlas referral traffic from Twitter: 100-500 visits/mo
- Conversion: low (2-5% sign up, 1-2% paid)

**Real value:** не traffic, а **authority building**. Через 6-12 месяцев Atlas + founder = recognized voice в AI transformation space. Это GTM-моat сам по себе.

---

## Канал #5 — Partner referrals (Phase 4+)

### Стратегия

**Кто партнёры:**
1. **AI consultants** (independent / small firms) — recommend Atlas как companion tool их клиентам
2. **Newsletter operators** (Lenny, Marketing Examined, etc) — sponsorships или referrals
3. **Product communities** (Reforge alumni, Maven instructors) — community recommendations

### Affiliate program

20-30% recurring commission на referred paid users. Standard для SaaS.

**Tracking:** Stripe → unique referral codes. ~10% of MRR в Phase 4-5 может идти через partner channel.

### Не запускаем до Phase 4

Premature partners = низкое качество leads + admin overhead. Сначала build proven funnel.

---

## Канал #6 — Paid acquisition

### Когда запускаем

Phase 5+ (через 9-12 месяцев). После validated unit economics (LTV:CAC ratio ≥3).

### Какие платформы

- **LinkedIn Ads** — best B2B targeting, expensive ($30-60 CPC)
- **Google Ads** — branded + long-tail (cheaper but lower intent)
- **Reddit Ads** — niche communities (eCommerce, ops, productivity)

### Не делаем до signal

Paid acquisition сжигает money если нет product-market fit. Сначала organic + outbound.

---

## Канал #7 — Conferences и speaking

### Selective approach

Founder speaks/presents на 2-3 events per year. NOT generic AI conferences (saturated, low signal).

**Target events:**
- SaaStr Annual — Product/Ops focus
- Web Summit (Lisbon) — broad business audience
- B2B Marketing Exchange — overlap с ICP
- Smaller domain conferences (eCommerce Berlin, Ops Summit)

**ROI:** не lead-gen напрямую. Authority building + 5-10 paid users per event через follow-up.

### Cost vs benefit

Conferences: $5-15k cost + 1 week founder time. Только если есть spare cycles. До Phase 3 — нет cycles.

---

## Channel mix evolution

| Phase | Месяц | Primary | Secondary | Notes |
|-------|-------|---------|-----------|-------|
| Phase 1 | 1-2 | Nordic LinkedIn | — | Validation |
| Phase 2 | 2-4 | Nordic LinkedIn | US/UK LinkedIn | Scale outbound |
| Phase 3 | 3-6 | LinkedIn (combined) | SEO + Twitter | Diversify |
| Phase 4 | 6-9 | LinkedIn + SEO | Twitter + Partners | Multi-channel |
| Phase 5 | 9-12 | Mix | + Paid + Conferences | Mature |

---

## Что НЕ делаем (anti-patterns)

- ❌ **Cold email** в EU без GDPR-compliance (10k+ EUR fines)
- ❌ **Generic newsletter sponsorships** до validated funnel
- ❌ **Influencer marketing** для B2B (низкий ROI)
- ❌ **AI tools directories** (G2, Capterra) — низкое качество traffic
- ❌ **Hacker News launches** до Phase 4 (one-shot, не sustainable)
- ❌ **Product Hunt** в первые 3 месяца — нет infrastructure для accommodation traffic spike
- ❌ **Founders Network / IndieHackers** posts «what should I build» — позиционирует как hobby

---

## Tracking каналов

### Attribution UTM-параметры

Все outbound links должны быть с UTM:
- `utm_source=linkedin` / `seo` / `twitter` / `partner-{name}`
- `utm_medium=outbound` / `organic` / `paid`
- `utm_campaign=nordic-2026q2` / `us-uk-launch` / etc

Stripe Checkout → Supabase: записываем UTM source в signup metadata.

### Weekly review

Ежепонедельный strategic review (`scripts/weekly-strategy-review.mjs`) включает breakdown по каналам: signups, conversions, MRR contribution per channel.

---

_Версия 2.0 — 2026-05-24 (post product audit)._

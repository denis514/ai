# 03 — Distribution Channels

> **TL;DR**: 3 канала параллельно — content-led SEO (long-term compounding), LinkedIn outbound (short-term signal), partner referrals (multiplier). Никакой paid acquisition до validated unit economics.

---

## 1. Channel scoring framework

Каждый канал оцениваем по 5 критериям (1-5):

| Критерий | Что значит |
|----------|-----------|
| **Reach** | Сколько ICP можно coverить |
| **Targeting** | Насколько точно попадаем в ICP |
| **Cost** | $/lead |
| **Time-to-signal** | Когда увидим первые результаты |
| **Compounding** | Растёт ли сам со временем |

---

## 2. Канал 1: Content-led SEO (PRIMARY)

| Критерий | Оценка | Комментарий |
|----------|--------|-------------|
| Reach | 5/5 | Глобально |
| Targeting | 4/5 | Long-tail = высокое intent |
| Cost | 5/5 | Только время на контент |
| Time-to-signal | 1/5 | 6-12 месяцев на traction |
| Compounding | 5/5 | Старые статьи приносят leads годами |

### Стратегия

**Не блог.** Atlas — это interactive knowledge graph; контент должен жить на mindmap-страницах,
индексироваться Google как deep pages.

**Целевые keyword кластеры:**

1. **«AI for [business function]»** (high volume, broad intent)
   - "AI for eCommerce", "AI for marketing teams", "AI for customer support"
   - Target: каждый Transformation direction → landing page оптимизированный под этот keyword

2. **«[Workflow] with AI»** (medium volume, high intent)
   - "AI product description generation", "AI search relevance optimization",
     "AI customer segmentation"
   - Target: каждый ec-* / cs-* / mk-* node → SEO-optimized title + meta

3. **«[Tool] vs [Tool]» / «How to [task] with Claude»** (long-tail, highest intent)
   - "Claude vs ChatGPT for eCommerce", "How to build product recommendations with Claude"
   - Target: blog-format articles cross-linking deep into Atlas

### Implementation milestones

- **+2 недели:** SEO audit (`scripts/seo-audit.mjs` — TODO) — какие узлы уже ранжируются
- **+4 недели:** Sitemap + structured data на каждом узле
- **+8 недель:** 5 «AI for X» landing pages с обновлёнными meta
- **+12 недель:** 10 long-tail articles published
- **+26 недель:** 20+ ranking keywords on page 1-2

### Success metric
- 1,000 organic monthly visits за 6 месяцев = traction signal

---

## 3. Канал 2: LinkedIn Outbound (SECONDARY)

| Критерий | Оценка | Комментарий |
|----------|--------|-------------|
| Reach | 3/5 | Ограничено connection limits |
| Targeting | 5/5 | Job title + company size filters |
| Cost | 4/5 | Sales Navigator $99/mo |
| Time-to-signal | 5/5 | Reply в течение дней |
| Compounding | 2/5 | Личное усилие каждую неделю |

### Стратегия

**Не cold pitching.** Outbound = «полезный контент → дискуссия → demo».

**Sequence (4 touches за 14 дней):**

1. **Day 1:** Connect request с personalized note про их компанию (specific AI initiative)
2. **Day 3 (если accept):** Поделиться 1 link на Atlas узел, релевантный их инициативе.
   Без pitch.
3. **Day 7:** Вопрос-ответ — спросить про их experience с тем что я отправил.
4. **Day 14:** Если есть диалог — invite на 20-минутный demo Atlas.

### Targeting filters (Sales Navigator)

- Title: "Head of Growth" OR "Head of Product" OR "VP eCommerce" OR "Director of CRO"
- Company size: 11-200 employees
- Industry: Internet, Consumer Goods, Retail
- Geography: US, UK, Nordics, DACH (high purchasing power)
- Posted recently: AI/automation keywords

### Cadence

- 50 connect requests/week
- 50% accept rate → 25 conversations
- 10% reply → 2.5 active dialogues
- 30% book demo → ~1 demo/week
- 30% demo→subscription → 1 subscription за 3 недели

**Conservative:** 4 subscriptions за квартал from LinkedIn alone.

### What NOT to do

- ❌ Spray-and-pray connection requests без context
- ❌ Pitch в первом сообщении
- ❌ Multi-channel automation (LinkedIn → Email → SMS) — kills authenticity
- ❌ Использовать LinkedIn для Free tier acquisition — это marketing на paid users

### Success metric
- 5 Team subscriptions from LinkedIn в Q1 = channel validated

---

## 4. Канал 3: Partner Referrals (MULTIPLIER)

| Критерий | Оценка | Комментарий |
|----------|--------|-------------|
| Reach | 4/5 | Зависит от партнёра |
| Targeting | 5/5 | Партнёр уже доверяет своей audience |
| Cost | 3/5 | Revenue share или free seats |
| Time-to-signal | 3/5 | 2-3 месяца на establish |
| Compounding | 5/5 | Каждый партнёр = leverage |

### Target partners (ранжированы по fit)

#### Tier 1: AI Infrastructure
- **Anthropic** — Atlas covers Claude ecosystem; logical referral для educational/Academy alumni.
  *Ask:* listing в "Learn more" section + co-marketing.
- **LangChain** — complementary (они tooling, мы knowledge). Cross-promote.
- **Vercel** — Atlas hosted on Vercel; их community значительно overlaps с ICP.
  *Ask:* showcase в Templates / Community spotlight.

#### Tier 2: Consultancy networks
- **Toptal AI experts** — mutual referral: они посылают clients в Atlas для self-serve, мы
  recommend их для deeper engagements.
- **Anthropic Builder community** — direct contact, low formal barrier.

#### Tier 3: Media / Educational
- **Lenny's Newsletter** — sponsorship $5-10K, ICP-perfect overlap
- **Reforge** — partnership на mutual content
- **eCommerce-specific newsletters** (ProductLed, Demand Curve, GrowthHackers)

### Implementation milestones

- **+4 недели:** Outreach к 5 Tier 1 partners with positioning deck
- **+8 недель:** 1 Tier 1 partner active (likely Vercel showcase)
- **+12 недель:** 2 Tier 2 partnerships
- **+20 недель:** Lenny's sponsorship (если ROI оправдан)

### Success metric
- 30% всех paid signups через partner referrals к Q2

---

## 5. Каналы, которые мы НЕ делаем сейчас

### ❌ Google Ads / Facebook Ads
**Почему:** не валидирован unit economics, не знаем CAC ceiling. Деньги пропадают.
**Когда вернёмся:** после $5K MRR + clear LTV signal.

### ❌ Influencer marketing
**Почему:** AI/tech influencers overpriced, audience не наш ICP (mostly devs/hobbyists).
**Когда вернёмся:** не вернёмся в этом виде. Только expert testimonials.

### ❌ Conference speaking
**Почему:** time-intensive, leads несвоевременны (3-6 месяцев sales cycle).
**Когда вернёмся:** после product-market fit, как brand-building activity.

### ❌ Cold email blasts
**Почему:** spam regulations EU (GDPR), low conversion, бренд-разрушительно.

### ❌ Reddit / HackerNews
**Почему:** anti-promotional culture, легко получить ban. Только organic shares.

---

## 6. Channel mix (target)

| Канал | % новых customers | Тратим времени | Доход после ramp-up |
|-------|-------------------|----------------|---------------------|
| SEO | 50% | 30% (writing/optimization) | Compounds |
| LinkedIn | 30% | 50% (active prospecting) | Linear w/ effort |
| Partners | 20% | 20% (relationship building) | Compounds w/ momentum |

После 6 месяцев цель: SEO 60% / LinkedIn 20% / Partners 20% (active prospecting фейдит, SEO компаундится).

---

## 7. Что измеряем по каждому каналу

| Канал | Top-of-funnel | Mid-funnel | Bottom-funnel |
|-------|---------------|------------|---------------|
| SEO | Impressions, position avg | Site visits, time on page | Free signups, trial starts |
| LinkedIn | Connects sent | Replies received | Demos booked → subscriptions |
| Partners | Conversations initiated | Active deals | Referred customers |

Все эти метрики живут в `docs/business-strategy/05-metrics.md`.

---

_Status: PLAN — нет live execution yet. Phase 0 (ICP validation) — приоритет._
_Created: 2026-05-24 | Owner: growth-strategist agent_

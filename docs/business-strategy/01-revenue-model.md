# 01 — Revenue Model

> **TL;DR**: Free → Pro ($19/мес) → Team ($99/мес за 5 seats) → Enterprise (custom).
> Запуск Pro tier — Q1. Цель — $5K MRR за 6 месяцев на 250 платных юзеров.

---

## 1. Текущее состояние (2026-05-24)

- **Выручки нет.** Продукт бесплатен, монетизации не подключено.
- **Активной базы нет** — ноль publicly tracked DAU/MAU метрик.
- **Auth есть** (Supabase, Magic Link + Google OAuth) — фундамент для tier-системы готов.
- **GDPR-совместим** (cookie consent, ToS, Privacy Policy) — Финляндия + EU clean.

**Это значит:** мы стартуем с нуля. Никакой migration story нет — есть только runway
строить продукт и базу одновременно.

---

## 2. Гипотезы монетизации (ранжированы по уверенности)

### H1 (high confidence): B2B Team subscription
Команды из 4-20 человек платят за **shared workspace** с общим Project setup,
brand voice, custom CLAUDE.md, командные skills, аналитику использования.

- **Цена:** $99/мес за 5 seats, +$15/seat сверх
- **Доказательство:** Notion ($10/seat), Linear ($8/seat), Loom Teams — все
  продают «команде, не индивиду». eCommerce-команды (наш фокус) знакомы с этой моделью.

### H2 (medium): Pro individual tier
Индивидуальные practitioners (consultants, freelancers, indie developers)
платят за **unlimited bookmarks + AI Companion mode + Transformation playbook
downloads + early access** к новым узлам.

- **Цена:** $19/мес или $190/год
- **Риск:** B2C SaaS conversion rate низкий (1-3%) для freemium. Без сильного
  Pro-only feature это не взлетит.

### H3 (medium-low): Transformation Playbook packs
One-time покупка глубоких guidelines (PDF + interactive paths) для конкретной
вертикали — eCommerce, Enterprise, Marketing.

- **Цена:** $199-499 per pack
- **Преимущество:** не требует ongoing engagement, проще продать на cold outreach
- **Недостаток:** не recurring revenue, нужны новые packs регулярно

### H4 (low confidence): Enterprise license
SSO, on-prem option, custom Transformation paths, dedicated success manager.

- **Цена:** $5K-50K/год
- **Реалистично только** после 6-12 месяцев SaaS-traction и 2-3 case studies

### H5 (speculative): Marketplace для Transformation experts
Платформа, где консультанты по AI-трансформации находят клиентов через Atlas-карту
их специализации. Atlas берёт 10-20% transaction fee.

- **Когда:** Q4 или позже, если будет 1K+ MAU

---

## 3. Tier-структура (предлагаемая)

| Tier | Цена | Что входит | ICP |
|------|------|------------|-----|
| **Free** | $0 | Mindmap browse, 5 bookmarks, basic tutorials, EN locale | Curiosity, learning |
| **Pro** | $19/мес или $190/год | Unlimited bookmarks, full Workflow library, AI Companion mode, all locales, no ads (если будут) | Individual practitioner |
| **Team** | $99/мес (5 seats) | Pro для всех + shared Project, team analytics, custom CLAUDE.md, brand voice config, Slack integration | Команда продукт/маркетинг 4-20 человек |
| **Enterprise** | от $5K/год | Team + SSO, audit log, custom Transformation paths, on-prem option, SLA, dedicated CSM | 100+ employee orgs |

**Принципы:**
- **Free генерирует demand**, не conversion. Free user — это marketing, не клиент.
- **Pro — это вход**, не основной доход. Доход — в Team и Enterprise.
- **Не делаем Pro слишком функциональным** — иначе никто не уйдёт в Team.

---

## 4. Path to first revenue (90 дней)

### Phase 0 — preconditions (сейчас → +2 недели)
- [ ] ICP validated через 10 user interviews (`skills/user-research-synthesizer`)
- [ ] Pricing willingness-to-pay validated (5+ "I would pay $X" responses)
- [ ] Top 3 Pro-only features identified

### Phase 1 — paywall infrastructure (+2 → +5 недель)
- [ ] Stripe integration (test mode)
- [ ] Tier check в Supabase RLS
- [ ] Pricing page (RU/EN/FI)
- [ ] Upgrade flow UX
- [ ] Receipts + invoicing (Stripe handles)

### Phase 2 — soft launch Pro (+5 → +8 недель)
- [ ] Email 50-100 early users — "Pro now available"
- [ ] First 10 paying customers ($190 ARR = $1900)
- [ ] Iterate based on first feedback

### Phase 3 — Team tier + outbound (+8 → +13 недель)
- [ ] Team tier launch
- [ ] LinkedIn outbound к 100 Head of AI/Transformation
- [ ] First 3 Team subscriptions ($99 × 3 = $297 MRR)
- [ ] Total ARR target: $5K

### Phase 4 — channel scaling (+13 → +26 недель)
- [ ] Content-led SEO traction (10 ranking keywords)
- [ ] 1 partner channel active (Vercel community, Anthropic referrals)
- [ ] $5K MRR achieved

---

## 5. Unit Economics (target)

### Pro
- **ARPU:** $19/mo
- **Gross margin:** ~95% (Stripe 2.9% + minimal infra cost)
- **Churn target:** <5% monthly (B2C SaaS benchmark)
- **CAC target:** <$30 (one month payback)
- **LTV target:** $228 (12-month retention)

### Team
- **ARPU:** $99/mo base + expansion
- **Gross margin:** ~93%
- **Churn target:** <3% monthly (B2B benchmark)
- **CAC target:** <$300
- **LTV target:** $3,300+ (24-month retention с expansion)

### Если эти числа не сходятся за 90 дней — pricing неправильный, не продукт.

---

## 6. Принципы pricing

1. **Anchor high.** Если первая реакция «дёшево», цена низкая. Лучше потом снизить чем поднять.
2. **Annual >> monthly discount.** Annual prepay = -17% (-2 месяца). Снижает churn механически.
3. **Free trial 14 дней с credit card.** Снижает trial abuse, повышает trial→paid conversion.
4. **Team tier дёшево на старте** ($99 vs Notion $10/seat × 5 = $50) — но входит в shared infrastructure стоимость. Поднимаем когда есть proof.
5. **Enterprise — никаких list prices.** Custom quote после discovery call.

---

## 7. Что мы НЕ продаём

- ❌ Курсы (см. `docs/strategy/01-positioning.md` § 1)
- ❌ Сертификаты (LMS-логика)
- ❌ AI consulting (мы продукт, не услуга)
- ❌ Data/API access (это уже data company, не product)
- ❌ White-label дешевле $5K/год (девальвирует бренд)

---

## 8. Что-если (плохие сценарии)

### Сценарий A: 0 платных за 90 дней
**Диагноз:** либо pricing не валидирован (вернуться к Phase 0), либо ICP не подходит,
либо value proposition не считывается. Не строить больше features — провести
10 conversations и переписать landing.

### Сценарий B: trial users есть, но не конвертят
**Диагноз:** Pro tier недостаточно ценен. Усилить 1-2 «must have» Pro-only feature.
Не размывать всеми «nice to have».

### Сценарий C: Team subscriptions есть, но Pro нет
**Диагноз:** хорошо. Pro — это marketing channel для Team. Возможно убрать Pro или
оставить как «individual seat» в Team-системе.

### Сценарий D: Все хотят Free, никто не платит
**Диагноз:** либо мы не product, а content site (как Medium-альтернатива). Тогда
монетизация — это sponsorships / partnerships, а не subscriptions.

---

_Status: HYPOTHESIS — требует валидации Phase 0 перед инвестицией в Phase 1+_
_Created: 2026-05-24 | Owner: business-strategist agent_

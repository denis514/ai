# 01 — Revenue Model

> Что мы продаём, за сколько, что за что платят. Версия 2 (post-audit).
>
> **Главный сдвиг от V1:** мы не строим новые features. Контент уровня
> консалтинга **уже существует** (247 узлов, 62 transformation, 17 use cases).
> Задача — поставить tier-gate на уже готовом.

---

## 1. Tier structure

| Tier | Цена | Содержание | Когда launch |
|------|------|-----------|--------------|
| **Free** | $0 | Foundation (65 узлов) + 10 basics tutorials + 5-7 teaser transformation-узлов на каждое из 7 направлений + search + bookmarks | Уже live |
| **Pro** | **$29/mo** или **$290/year** (2 мес бесплатно) | Полный доступ ко всем 62 transformation-узлам + 17 use cases + 12 learning paths + 32 tutorials + 42 prompt-templates + Markdown export | Phase 3 (~3-4 недели) |
| **Team** | **$149/mo** (5 seats) | Pro × 5 + shared bookmarks + team progress dashboard + admin panel | Phase 4 (после ≥10 paid users + явный сигнал) |
| **Enterprise** | Custom | Team + SSO + custom transformation paths + dedicated success | По запросу, не маркетируем |

**Ключевое отличие от V1 pricing:**
- V1: $19/$99 — anchored под Lenny's Newsletter
- V2: $29/$149 — anchored под **консалтинговую ценность**. Один час работы с
  transformation-узлами уровня `cs-team-workflow` или `ai-native-operations`
  заменяет $300-500 консультанта. $29/мес — это <10% такого консультантского часа.

---

## 2. Что **уже сейчас** в продукте является ценностью за деньги

Из product-audit-2026-05-24 § 8 (value pockets):

### 💎 Главный value pocket — Transformation directions (62 узла + 17 use cases)

**Не есть ни у кого:**
- eCommerce direction (19 узлов): PDP gen, search, personalization, CRO, etc.
- Operations (5 узлов): process automation, decision intelligence
- Marketing (6 узлов): content ops, brand voice, campaign intel
- Customer Support (7 узлов): tier-1 automation, agent assist
- Product (7 узлов): discovery, spec gen, experimentation
- Design (5 узлов): prototype gen, accessibility automation
- Enterprise (6 узлов): transformation strategy, change management, governance

**Уровень контента:** консалтинговый. `cs-team-workflow` или `ai-native-operations`
содержат конкретные operating models с метриками, anti-patterns, cross-links.
Это **уже сейчас** стоит денег.

**Pro lock unlock — главный покупательский момент.**

### 💎 Cross-link knowledge graph (175 inline-ссылок в узлах + 65 в tutorials)

**Moat.** Не markdown-помойка, не плоский список. Связи Foundation → Systems → Transformation видны кликом. Конкуренту не построить за месяц.

Сама по себе ценность сложно монетизируется (нельзя продать «у меня хорошие ссылки»), но это **обоснование Pro tier** — «вы платите за навигацию, не за тексты».

### 💎 Полная финская локаль

**Аномалия рынка.** Финского commercial AI-handbook не существует. Скандинавия — deep pockets + слабая англоязычная адаптация в среднем менеджменте. Финский tier-card на лендинге = main hook для Nordic GTM.

«Suomenkielinen AI-käsikirja tiimillesi — ainoa maailmassa.»

### 💎 32 tutorials с progress + activity log + resume

Уровня coursera-lite уже сейчас. Resume, completed steps, badges на карте, sync через Supabase. Сам по себе progress не стоит $29 (Anki бесплатный), но **в комбинации** с премиум-контентом — да.

### 💎 42 prompt-templates с категориями + «Open in claude.ai»

Готовые промпты, prefilled в claude.ai одним кликом. Это **utility** —
PromptBase и FlowGPT берут $9-19/мес именно за это.

---

## 3. Free vs Pro — content decision matrix

**Free задача:** показать достаточно ценности чтобы человек **вернулся**,
но не настолько чтобы он **остался без причины платить**.

| Layer | Free | Pro |
|-------|------|-----|
| **Foundation** (65 узлов) | 🟢 100% | 100% (одно и то же) |
| **Systems** (10+ узлов) | 🟢 100% | 100% (одно и то же) |
| **Transformation** (62 узла) | 🔒 5-7 teaser узлов на каждое из 7 направлений (~35-45 узлов) | 🟢 100% (62 узла) |
| **Use Cases** (17 узлов) | 🔒 3 teaser UC | 🟢 100% (17 узлов) |
| **Learning Paths** (12 paths) | 🔒 2 «getting started» paths | 🟢 100% |
| **Tutorials** (32 шт) | 🟢 ~10 basics + intro tutorials | 🟢 100% (включая advanced) |
| **Prompt Library** (42 шт) | 🟢 Read + copy | 🟢 + Markdown export + collections |
| **Mindmap navigation** | 🟢 Полная | Та же |
| **Bookmarks / Progress** | 🟢 Локально | 🟢 + Supabase sync (уже работает) |
| **Activity log** | 🟢 | 🟢 |

**Гипотеза free-to-pro conversion trigger:** Head of Product зашёл на eCommerce direction,
прокликал 3 teaser-узла, на 4-м увидел blur + CTA «Get Pro $29/mo to unlock all
19 eCommerce workflows». Это конкретный, желаемый, измеримый момент.

---

## 4. Revenue model механика

### Subscription (основной)
Stripe Checkout → monthly recurring → автоматическое продление → cancel anytime.

**Месячный / годовой:**
- Monthly: $29/mo, churn higher, но low commitment
- Annual: $290/year ($24/mo effective), pre-paid, lower churn

Стандарт: ставим оба варианта в Stripe, default — monthly. Annual продаём как «save $58».

### One-time (опционально, Phase 4+)
- **Transformation playbook bundles** ($199 each) — скачивание одного direction как Markdown/PDF (20-30 страниц). Для людей которые «не хотят подписку».
- **Onboarding consultation** ($499) — 60-минутный разговор с founder для крупных команд. Высокая маржа, sales tool.

### Что НЕ делаем
- ❌ Freemium с time-limit (14-day trial) — слишком B2B-y, отталкивает
- ❌ Pay-per-node — фрагментирует value, низкий ASP
- ❌ Ad-supported free tier — портит UX
- ❌ Affiliate / referral в первые 3 месяца — premature

---

## 5. Pricing rationale

### Почему $29, не $19

- V1 anchored to «AI newsletters» ($19 Lenny / $19 Substack) — wrong reference frame
- V2 anchored to **«AI consulting per hour»** ($300-500) — Pro/mo = <10% такого часа
- Content уровня которое есть **стоит дороже** $19. Underpricing = sigaling «hobby project»
- $29 — пересечение psychological ($30 round) и rational ($300/year ≈ 1 час консультанта)
- Если плох — adjust up к $39 после первых 50 paid users (тест на churn)

### Почему $149/team (5 seats), не $99

- V1 $99/team = $20/seat × 5 — этих денег нет в B2B SaaS на уровне team
- V2 $149/team = $30/seat × 5 — стандартная индустрия
- Notion/Linear/Figma всех держат $15-30/seat в team tier
- Запас на тестирование вверх до $199/team если будет signal

### Почему НЕ enterprise pricing на сайте

- Enterprise → custom → call → discovery → quote
- Public list price = ceiling, теряем negotiation leverage
- Discovery call сам по себе value (выявляем потребности → строим custom path)

---

## 6. Realistic revenue projections

**30 дней после Phase 3 launch:**
- 5-15 paid users × $29 = $145-435 MRR
- **Это валидация WTP, не business.** Не успех, не провал — это сигнал что путь правильный.

**90 дней:**
- 30-50 paid users × $29 = $870-1450 MRR
- + Возможно 1-2 team-плана если signal сильный = +$298
- Total: $1100-1750 MRR

**6 месяцев:**
- 100-200 paid users × $29 = $2900-5800 MRR
- + 5-10 team-плана = $745-1490
- Total: $3650-7300 MRR
- **Это уже значимый сигнал для построения team tier инфраструктуры**

**12 месяцев (целевая «начало зарабатывать»):**
- 300-500 paid users → $8700-14500 MRR
- + 15-25 team plans → $2235-3725
- Total: $11000-18225 MRR

**Comparison с альтернативами:**
- 12 месяцев на consulting (1 founder, $200/час, 80% utilization) = $260k/year = $21.6k MRR
- 12 месяцев на product = $13-18k MRR + продукт + asset

**Status:** Это projections, не plan. Plan — Phase 0 валидация (см. roadmap).

---

_Версия 2.0 — 2026-05-24 (post product audit)._

# Business Strategy — 105 Atlas

> Бизнес-операционный слой проекта. Не контент-стратегия, не product-стратегия —
> а **как Atlas зарабатывает деньги и растёт**.

## Зачем эти документы

Стратегия контента (`docs/strategy/`) и правила обучения (`docs/learning-design-rules.md`)
отвечают на «что и как создаём». Эти документы отвечают на:

- **Кто платит** — и за что именно
- **Как они находят Atlas** — каналы дистрибуции
- **Как растёт выручка** — модель монетизации
- **Что измерять** — бизнес-метрики (не vanity)
- **С кем конкурируем** — и как отличаемся

Без этих ответов «AI-Native Transformation OS» остаётся технологической мечтой,
а не бизнесом.

---

## Порядок чтения

| # | Документ | О чём | Время |
|---|----------|-------|-------|
| 01 | [Revenue Model](./01-revenue-model.md) | Гипотезы монетизации + path to revenue | 10 мин |
| 02 | [Target Customer (ICP)](./02-target-customer.md) | Кто платит, почему, сколько | 10 мин |
| 03 | [Channels](./03-channels.md) | Где найти клиента — distribution playbook | 15 мин |
| 04 | [Monetization Roadmap](./04-monetization-roadmap.md) | 90-дневный план до первой выручки | 15 мин |
| 05 | [Metrics](./05-metrics.md) | KPI бизнеса, не контента | 8 мин |
| 06 | [Competitive Landscape](./06-competitive-landscape.md) | Alternatives + differentiation | 10 мин |
| 07 | [Decision Log](./07-decisions.md) | Архитектурные бизнес-решения с датами | живой |

**Total: ~70 минут на полное прочтение.**

---

## Краткая суть в 5 предложений

1. **Atlas — не курсы, не academy.** Это knowledge graph + workflows для AI-трансформации команд (см. `docs/strategy/01-positioning.md`).
2. **Платит — команда, не индивид.** ICP: продакт/маркетинг/eCommerce-команды из 4-20 человек, которым нужна общая карта AI-возможностей.
3. **Модель — SaaS tier'ы + Enterprise.** Free → Pro ($19/мес) → Team ($99/мес × 5 seats) → Enterprise (custom). Запуск Pro = Q1.
4. **Канал — content-led + community.** SEO на «AI for X», LinkedIn outreach к Head of AI/Transformation, partner-каналы (Vercel, Anthropic Academy referrals).
5. **Цель — $5K MRR за 6 месяцев**, чтобы доказать unit economics до масштабирования.

---

## Анти-цели бизнеса

- ❌ Превратиться в Coursera/Udemy. Курсы — мёртвый формат.
- ❌ Зависеть от единственного канала (одной соцсети, одного партнёра).
- ❌ Лезть в B2C массмаркет без validated ICP.
- ❌ Делать pricing «как у всех» — мы продаём систему, не курс.
- ❌ Брать инвестиции до product-market fit.

---

## Связь с другими стратегиями

| Слой | Документ | Что отвечает |
|------|----------|--------------|
| Content | `docs/strategy/` | Какие узлы создаём |
| Pedagogy | `docs/learning-design-rules.md` | Как обучаем |
| Voice | `docs/voice-guide.md` | Каким тоном пишем |
| Architecture | `docs/architecture.md` | Технические решения |
| **Business** | `docs/business-strategy/` | **Как зарабатываем** |

Эти слои **независимы, но согласованы**. Бизнес-решение не может противоречить
позиционированию (никаких курсов в Pro tier — это нарушение § 1 positioning).

---

_Создано: 2026-05-24 | Status: **HYPOTHESIS — требует grounding в product audit**_

---

## ⚠️ ВАЖНО: статус документов

Первая версия этих 7 документов была написана **до полного product audit**.
Pricing ($19/$99), ICP (eCommerce-команды), Pro-only features (AI Companion mode) —
**гипотезы**, не валидированные ни продуктом, ни клиентами.

**Следующий шаг:** product audit → пересборка стратегии на основе реальности.
См. `tasks/product-audit-2026-05-24.md` (создаётся).

После audit'а каждый документ получает retrospective:
- Что подтвердилось реальностью продукта
- Что нужно переписать
- Что нужно построить чтобы стратегия работала

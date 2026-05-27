# Business Strategy — 105 Atlas

> Стратегия монетизации. **Версия 2** — переписана после product audit (`tasks/product-audit-2026-05-24.md`).
>
> Версия 1 была написана **до** аудита продукта — pricing, ICP и Pro-features
> оказались гипотезами без grounding. Версия 2 опирается на реальный продукт.

_Создано: 2026-05-24 | Обновлено: 2026-05-24 (post-audit) | Status: **GROUNDED**_

---

## Что изменилось vs Версия 1

| Аспект | V1 (HYPOTHESIS) | V2 (GROUNDED) |
|--------|-----------------|---------------|
| Позиционирование | «AI Mindmap про Claude» | **«AI Transformation Playbook for Product/Ops teams»** |
| ICP | «eCommerce-команды» | **Product/Ops/Strategy leads в компаниях 50-500 человек** |
| Pricing | $19 personal / $99 team | **$29 personal / $149 team** (контент уровня консалтинга) |
| Что нужно построить | AI Companion + team workspace + premium playbooks | **Stripe + tier-tagging + paywall UI** (всё остальное уже есть) |
| Timeline до первого $1 | 90 дней | **3 недели** |
| Target MRR через 30 дней | $750-1500 | **$145-435** (валидация, не business) |
| Главный GTM-канал | LinkedIn (generic) | **Nordic LinkedIn + финский moat** |
| Pro-only features | AI Companion + team space | **45 transformation-узлов + 17 use cases + 12 paths** (уже существуют) |
| Phase 0 | Customer interviews | **Repositioning (DONE 2026-05-24) + customer interviews параллельно с Stripe** |

**Главный сдвиг мышления:** проблема не в продукте, проблема в commerce-слое.

---

## Структура документов

| # | Документ | Что внутри |
|---|----------|------------|
| 00 | [README.md](./README.md) | Этот файл — обзор |
| 01 | [revenue-model.md](./01-revenue-model.md) | Tier structure, pricing, что за что платят |
| 02 | [target-customer.md](./02-target-customer.md) | ICP — кто покупает, почему, как ищет |
| 03 | [channels.md](./03-channels.md) | Где находим клиентов: Nordic LinkedIn → US/UK |
| 04 | [monetization-roadmap.md](./04-monetization-roadmap.md) | Phase 0-4: путь к первому $1 за 3-4 недели |
| 05 | [metrics.md](./05-metrics.md) | KPI: MRR, churn, NPS, conversion |
| 06 | [competitive-landscape.md](./06-competitive-landscape.md) | Anthropic Academy / Maven / status quo |
| 07 | [decisions.md](./07-decisions.md) | Append-only log решений |

---

## Принципы стратегии (V2)

1. **Распакован реальный продукт, не план.** Pricing и feature-set основаны на
   фактическом content audit (247 узлов, 32 workflow, 12 paths, full Finnish).

2. **Сначала валидируем WTP, потом строим.** В Phase 0 (validation interviews)
   ICP **сам говорит** «я бы платил X за Y». Без этого сигнала не запускаем
   paywall.

3. **Нет новых features до first paying user.** Phase 1-3 — только commerce
   infrastructure (Stripe, tier-tagging, paywall UI). AI Companion и team
   workspace — Phase 4, после ≥10 paid users.

4. **Финский moat — основной differentiator.** Nordic-first GTM использует
   единственный в мире полностью локализованный AI-handbook на финском.

5. **Стратегия append-only.** Decisions фиксируются с датой и обоснованием.
   Меняем стратегию — пишем новое решение с reference на старое.

---

## Связь с другими доками

- **`docs/strategy/`** — 9 архитектурных документов про продуктовую структуру
  (Foundation/Systems/Transformation). Это «что строим». Прочесть до business-strategy.
- **`docs/voice-guide.md`** — тон и язык продукта. Применяется к marketing-копи тоже.
- **`tasks/product-audit-2026-05-24.md`** — продуктовый аудит, основа V2 стратегии.

---

## Skill-агенты для исполнения

В `skills/`:
- `business-strategist` — orchestrator, диспатчит к специалистам
- `growth-strategist` — каналы, outreach, distribution
- `monetization-architect` — pricing, paywall, tier design
- `product-strategist` — feature prioritization для revenue (важно: **после** аудита)
- `competitive-intelligence` — мониторинг конкурентов
- `proposal-generator` — оформляет идеи в decision-ready docs

Pattern: всегда вызывать `business-strategist` сначала, он сам выберет специалиста.

---

_Версия 2.0 — 2026-05-24 (post product audit)._

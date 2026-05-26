# 07 — Decision Log

> Архитектурные бизнес-решения с датой и обоснованием. Append-only.
> Когда меняем стратегию — добавляем новую запись, не редактируем старые.

---

## 2026-05-24 — Initial business strategy creation

**Решение:** Создан полный business-strategy pack (7 документов) +
6 skill-агентов для стратегического мышления.

**Контекст:**
Атлас существует как технический продукт без монетизации. User запросил
infrastructure для «развития проекта и зарабатывания в скором времени».

**Обоснование:**
- Контент-стратегия (`docs/strategy/`) отвечает «что делаем»
- Business-стратегия отвечает «зачем и для кого платно»
- Без второго первое — hobby project

**Альтернативы рассмотрены:**
- ✗ Один монолитный business plan doc — слишком rigid, не поддерживается
- ✗ Только skills без docs — agents без shared context
- ✓ 7 docs + 6 skills — modular, updatable

**Что это означает дальше:**
- Phase 0 (ICP validation, 14 дней) — следующий приоритет
- Pro/Team tier launch Phase 1-3 в течение 90 дней
- Target: $5K MRR за 6 месяцев

**Owner:** founder + agent ensemble

---

## 2026-05-24 — Pricing structure: Free / Pro $19 / Team $99 / Enterprise custom

**Решение:** Tier structure объявлена в `01-revenue-model.md` § 3.

**Обоснование:**
- Pro $19 — anchored below Lenny's Newsletter ($20), above Substack indies
- Team $99 (5 seats) — anchored below Notion equivalent (5×$10=$50 но без extras),
  выше indie tier
- Enterprise — explicitly «contact us», no list price (negotiation leverage)

**Альтернативы:**
- ✗ Single $29/мес flat — недокусирует на team (где основной revenue)
- ✗ Pro $9 — слишком близко к null, выглядит как hobby
- ✗ Team $199 — premature, нет proof yet

**Statu:s** HYPOTHESIS — pending Phase 0 validation (5+ «I'd pay $99/мес» signals)

---

## 2026-05-24 — Primary ICP: eCommerce Transformation Lead

**Решение:** Focus segmentation на eCommerce-команды (Head of Growth/Product/CRO в
mid-market $5M-50M ARR), не на developers или enterprises.

**Обоснование:**
- eCommerce flagship Transformation direction (P0.2) — самый глубокий контент
- Mid-market имеет budget + decision speed (vs enterprises) + tech literacy
- LinkedIn targeting clear (job titles + company size)

**Альтернативы:**
- ✗ Developers — anti-ICP (не платят за carts)
- ✗ Enterprises — slow sales cycle, требует 6-12 месяцев runway
- ✗ Solopreneurs — low willingness to pay

**Status:** HYPOTHESIS — pending 10 ICP interviews

---

## 2026-05-24 — Channel mix: SEO 50% + LinkedIn 30% + Partners 20%

**Решение:** Three-channel strategy в `03-channels.md`.

**Обоснование:**
- SEO compounds long-term, low cost, high reach
- LinkedIn — only channel с precise ICP targeting at low cost
- Partners — high leverage если можно establish

**Альтернативы отвергнуты:**
- ✗ Google/Facebook ads — нет validated unit economics
- ✗ Influencer marketing — ROI неоправдан в B2B
- ✗ Conference speaking — slow, expensive в trafficc terms
- ✗ Cold email — GDPR-проблемы в EU

**Status:** PLAN — execution Phase 1+

---

## Template для будущих записей

```
## YYYY-MM-DD — [Краткое название решения]

**Решение:** [одно предложение]

**Контекст:** [что вызвало решение]

**Обоснование:** [почему именно так, не иначе]

**Альтернативы:**
- ✗ [option A] — [почему отвергнута]
- ✗ [option B] — [почему отвергнута]
- ✓ [chosen] — [почему выбрана]

**Что это означает дальше:** [конкретные actions]

**Owner:** [кто отвечает]

**Status:** PLAN / EXECUTING / VALIDATED / REVERTED
```

---

_Append-only log. Не редактируем прошлые записи; новые решения отменяющие старые
добавляем новой записью с reference на предыдущую._

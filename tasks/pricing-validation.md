# Pricing Validation — Atlas Pro Phase 1

> **Цель:** 10 interviews за 14 дней. Decision: GO/NO-GO на Phase 2 (Stripe build).
>
> **Start date:** 2026-05-24
> **Target end:** 2026-06-07
> **Owner:** founder

---

## Decision criteria

После 10 интервью:

| Signal | Действие |
|--------|----------|
| 5+ из 10 «I'd pay $29/mo» | ✅ Phase 2 GO — build Stripe + paywall |
| 3-4 «возможно» | ⚠️ +5 interviews, refine demo/pricing |
| 0-2 «да» | 🚨 STOP — пересмотр ICP / positioning |

---

## Progress tracker

| # | Date | Name | Company | Role | LinkedIn | Status | WTP signal | Score 1-5 | Notes |
|---|------|------|---------|------|----------|--------|-----------|-----------|-------|
| 1 |  |  |  |  |  | scheduled / held / no-show | yes/maybe/no |  |  |
| 2 |  |  |  |  |  |  |  |  |  |
| 3 |  |  |  |  |  |  |  |  |  |
| 4 |  |  |  |  |  |  |  |  |  |
| 5 |  |  |  |  |  |  |  |  |  |
| 6 |  |  |  |  |  |  |  |  |  |
| 7 |  |  |  |  |  |  |  |  |  |
| 8 |  |  |  |  |  |  |  |  |  |
| 9 |  |  |  |  |  |  |  |  |  |
| 10 |  |  |  |  |  |  |  |  |  |

**Score 1-5 = pricing tolerance** (1 = «no», 5 = «yes immediately»). Target average ≥ 3.5.

---

## Funnel metrics

```
Outreach sent:         0 / target 200-300
Connections accepted:  0 / target 30%+
Conversations started: 0 / target 10-15
Demos booked:          0 / target 15-20
Demos held:            0 / target 10-12
Strong WTP signals:    0 / target 5+
```

---

## Interview script (45 min total)

### Часть 1 — Контекст (10 min)

**Цель:** понять кто перед тобой, дать ему рассказать.

Вопросы:
1. «Расскажи про свою роль и как проходит твой обычный день»
2. «Каков сейчас отношение твоей команды к AI?»
3. «Кто ещё в компании думает про AI стратегию?»

**Что записываем:**
- Должность точно (для LinkedIn statistics)
- Размер команды + размер компании
- Текущий AI-зрелость (Stage 0-4 by Atlas Maturity Model)

### Часть 2 — Боль (15 min)

**Цель:** понять что не работает в текущем подходе.

Вопросы:
1. «Когда тебе нужна была AI roadmap для команды, куда ты смотрел?»
2. «Что было upset/missing в том что ты попробовал?»
3. «Расскажи последний раз когда ты принимал AI-связанное решение для команды»
4. «Что блокирует тебя сейчас от bigger AI adoption?»

**Что записываем дословно:**
- Цитаты про frustrations
- Конкретные источники которые они пытались (Anthropic Academy / blogs / consulting)
- Decision criteria для AI-tools

### Часть 3 — Демо (10 min)

**Цель:** показать продукт + наблюдать реакцию.

Делать:
1. Открой Atlas, спроси «что увидишь?» — слушай 30 секунд
2. Открой eCommerce direction (если их вертикаль) ИЛИ Operations
3. Прокликай 2-3 узла — `ec-pdp-gen`, `cs-team-workflow`, `ai-native-operations`
4. Спроси: «Полезно? Что было бы missing?»
5. Покажи cross-link — клик на `[[node:af-embeddings]]` в тексте

**Что записываем:**
- Где задерживается (interest signal)
- Где морщится (confusion signal)
- Что говорит дословно про value
- Просит ли ссылку (strong intent signal)

### Часть 4 — Pricing (10 min)

**Цель:** прямой вопрос про WTP.

Скрипт:
1. «Если бы это был tool для твоей команды, какой бюджет уместен?»
   (Open-ended — слушаем до того как они предложат число)
2. «Pro tier $29/mo per person — что думаешь?»
   (Записать reaction. Score 1-5.)
3. «Team tier $149/mo за 5 seats — это для тебя или для personal use?»
4. «Что бы заставило тебя реально pay vs использовать free?»

**Что записываем дословно:**
- Их initial budget estimate
- Reaction на $29 (face, words)
- Decision criteria (что нужно чтобы pay)
- Кто approves payment в их компании

### Часть 5 — Follow-up (5 min)

Завершение:
1. «Когда продукт launch как paid — могу тебя info notify?» (если да → email сохраняем)
2. «Знаешь кого-то ещё кого было бы полезно опросить?» (referrals)
3. «Хочешь продолжать тестировать когда у нас будет beta?» (early access list)

---

## Записать после каждого interview

В таблицу выше + здесь — detailed notes:

### Interview #X — Date — Name (Company)

**Role:**
**Company size:**
**Current AI maturity:**

**Pain points (дословно):**
- «...»
- «...»

**Reaction на demo:**
- Most interested in: ...
- Confused by: ...
- Asked about: ...

**Pricing reaction:**
- Initial budget estimate: $...
- Reaction на $29 Pro: ...
- Reaction на $149 Team: ...
- Score 1-5: ...

**WTP signal:** YES / MAYBE / NO

**Quote of the day** (для marketing copy потом):
> «...»

**Follow-up:**
- Notify on launch: yes/no
- Email: ...
- Referrals: ...

---

## Common patterns to watch for

После 3-5 interviews начни замечать:

**ICP confirmation patterns:**
- Все ICP жалуются на одно и то же → strong signal
- Все ICP используют похожие workarounds → opportunity
- Все упоминают одну и ту же alternative → competitor to watch

**ICP rejection patterns:**
- Они не понимают для чего им это → positioning issue
- Они хотят что-то совершенно другое → ICP wrong
- Они говорят «уже есть internal solution» → small TAM

**Pricing patterns:**
- Все говорят «too cheap» → can raise
- Все говорят «too expensive» → adjust or repositioning
- Все говорят «depends» → trial offer / use case demo

---

## Outreach + booking tools

**LinkedIn Sales Navigator** ($99/mo)
- Recommended но не критично для первых 100 outreach
- Free LinkedIn search достаточен на старте

**Calendly** ($10/mo)
- Booking link: `calendly.com/[username]/atlas-feedback`
- Slots: 45-min длиной, 8am-7pm в твоём timezone
- Buffer: 15-min между slots
- Settings: requires manual confirmation первые 20 sessions

**Loom / Zoom**
- Loom для async demo recording (если нужно)
- Zoom для interviews (с записью с consent)

**Email tool** (если хочешь backup channel)
- Hunter.io ($49/mo) — find email
- Не использовать для cold outreach в EU без opt-in (GDPR)

---

## Если signals слабые после 5 interviews

**Симптомы:**
- Все говорят «interesting but not for us»
- Все score ≤ 3
- Никто не просит follow-up

**Что делать:**
1. Stop more interviews. Не убивай оставшиеся 5.
2. Review demo flow — где confusion?
3. Review pricing pitch — что не работает?
4. Возможно ICP wrong → review `02-target-customer.md`

**Decision possible после 5:**
- Pivot ICP
- Pivot positioning
- Pivot pricing
- Pivot product (что показываем)

---

## Если signals сильные после 5 interviews

**Симптомы:**
- 3-4 strong WTP signals
- Score average ≥ 4
- Несколько referrals offered

**Что делать:**
1. Continue остальные 5 interviews — confirm pattern
2. **Start Phase 2 (Stripe scaffolding) параллельно** — не wait до day 14
3. Begin writing landing page copy используя quotes

---

_Created: 2026-05-24. Update after every interview._

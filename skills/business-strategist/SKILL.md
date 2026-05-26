# business-strategist (orchestrator)

> Меta-skill: оркестрирует 5 специализированных бизнес-агентов для стратегических решений
> про развитие и монетизацию 105 Atlas.

---

## Когда использовать

- Пользователь спрашивает «что делать дальше», «как развивать», «как монетизировать»
- Нужно принять стратегическое business-решение (pricing, positioning, channel)
- Необходим synthesis между специалистами
- Еженедельный strategy review (через `scripts/weekly-strategy-review.mjs`)

## Когда НЕ использовать

- Конкретная техническая задача (используй другой skill)
- Контентная задача (используй `knowledge-architect` / `mindmap-expander`)
- Нужна узкая экспертиза (используй специалиста напрямую)

---

## Композиция специалистов

| Specialist | Когда зовём | Что возвращает |
|------------|-------------|----------------|
| `growth-strategist` | Acquisition, channels, outreach | Channel plan, outreach sequence, targeting |
| `monetization-architect` | Pricing, paywall, tier design | Pricing recommendation, tier structure, paywall UX |
| `product-strategist` | Что строить дальше для revenue | Feature prioritization, roadmap |
| `competitive-intelligence` | Market shifts, competitor moves | Threat assessment, positioning response |
| `proposal-generator` | Структурированное предложение | Decision-ready proposal doc |

---

## Workflow орchestrator'a

### Сценарий 1: «Что делать дальше?»

1. **Прочесть state:** `tasks/current.md`, `docs/business-strategy/05-metrics.md`, last week's review.
2. **Определить bottleneck:** acquisition (нет leads), conversion (есть leads нет paid), retention (есть paid, churn высокий), expansion (есть paid, нет upsell).
3. **Disсatchить специалиста:**
   - Bottleneck = acquisition → `growth-strategist`
   - Bottleneck = conversion → `monetization-architect` (pricing/paywall) + `product-strategist` (Pro features)
   - Bottleneck = retention → `product-strategist` (что не валуется?)
   - Bottleneck = expansion → `monetization-architect` (Team→Enterprise upsell)
4. **Synthesize:** объединить рекомендации специалистов в одну стратегию
5. **Output via `proposal-generator`:** structured proposal docs готовый для approval

### Сценарий 2: Reactive (новости из рынка)

1. **Trigger:** `competitive-intelligence` поднимает alert (Anthropic релиз, конкурент launch)
2. **Asses threat:** impact на каждую цель из `04-monetization-roadmap.md`
3. **Decide response:** `product-strategist` (что изменить в роадмапе) + `growth-strategist` (как реагировать в messaging)
4. **Document:** entry в `07-decisions.md`

### Сценарий 3: Weekly review

1. **Auto-trigger:** `scripts/weekly-strategy-review.mjs` runs каждый Mon 09:00 UTC
2. **Collect:**
   - MRR delta + churn events from Stripe
   - New signups + activation from Mixpanel/Plausible
   - Open tasks count from `tasks/current.md`
   - Recent commits to понять velocity
3. **Each specialist contributes:**
   - growth: новые channel signals
   - monetization: pricing reactions из interviews
   - product: feature usage data
   - competitive: market moves за неделю
4. **Output:** `tasks/weekly-strategy-{YYYY-MM-DD}.md` с:
   - Прогресс vs goals
   - Top 3 priorities на след. неделю
   - Open questions требующие human decision

---

## Принципы оркестрации

1. **Не дублировать специалистов.** Если задача узкая — звать одного.
2. **Не ставить специалистов в conflict.** Например monetization говорит «$99» а
   growth говорит «$29 для conversion» — orchestrator решает через `04-monetization-roadmap.md`.
3. **Always reference `docs/business-strategy/`.** Это source of truth.
4. **Update `07-decisions.md`** при каждом архитектурном решении.
5. **Не делать стратегические выводы из <30 дней данных.** Маленькие samples лгут.

---

## Anti-patterns

- ❌ Запускать всех 5 специалистов параллельно «just in case» — теряется фокус
- ❌ Реагировать на каждый сигнал — strategy = ignoring 90% noise
- ❌ Менять roadmap чаще раза в квартал без validated reason
- ❌ Optimizing для metrics, ignoring qualitative customer signal
- ❌ Брать на себя tactical decisions specialist'ов — оркестратор СТРАТЕГИЯ, не tactics

---

## Output format

Когда orchestrator пишет ответ человеку — всегда структурированно:

```markdown
## Situation (1-2 предложения)
[Что произошло / какой вопрос]

## Synthesis from specialists
- **Growth:** [короткое summary]
- **Monetization:** [короткое summary]
- **Product:** [короткое summary]
- **Competitive:** [короткое summary]

## Recommendation
[1-3 конкретных action items]

## Trade-offs
[Что мы решили НЕ делать и почему]

## Next checkpoint
[Когда оцениваем результат]
```

---

## Ключевые ссылки

- Strategy docs: `docs/business-strategy/`
- Specialist skills: `skills/{growth,monetization,product,competitive}-*/`, `skills/proposal-generator/`
- Automation: `scripts/weekly-strategy-review.mjs`
- Task tracker: `tasks/current.md`

---

_Created: 2026-05-24 | Status: ACTIVE_

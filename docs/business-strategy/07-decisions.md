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

## 2026-05-24 — Product audit + V2 strategy regrounding

**Решение:** Проведён full product audit (`tasks/product-audit-2026-05-24.md`).
Все 6 strategy docs переписаны в V2 на основе **реального продукта**, не гипотез.

**Контекст:**
V1 strategy (созданная сегодня же ранее) была написана **до** product audit —
pricing, ICP, Pro-features оказались untested гипотезами. User поднял это:
"стратег должен сначала понять продукт, потом монетизацию".

**Обоснование:**
- Невозможно продавать продукт, который не видел
- Audit показал реальную ценность (62 transformation узла, full FI, cross-link граф)
- И реальные пробелы (нет Stripe, нет paywall — но контент уже на месте)

**Что это означает дальше:**
- Phase 0 расширен: repositioning ВПЕРЕДИ interviews
- Pricing pivot $19/$99 → $29/$149 (контент консалтинг-уровня)
- Defer AI Companion + team workspace в Phase 4
- Финский moat становится главным GTM-вектором

**Owner:** founder

**Status:** EXECUTED — все 6 docs обновлены, Phase 0 в работе.

---

## 2026-05-24 — Repositioning: «AI Mindmap» → «AI Transformation Playbook»

**Решение:** Atlas позиционируется как «Operating playbook for AI transformation»
для Product/Ops teams, не как «AI mindmap про Claude».

**Контекст:**
Product audit § funny truth выявил: Atlas — замаскированный AI-handbook для
product/ops-менеджеров. 62 transformation узла + 17 use cases + 5 team-paths =
hidden MBA-курс по AI-операционке. Positioning об этом молчал.

**Обоснование:**
- Соответствует **реальному** контенту в продукте
- ICP (product/ops leads) сразу понимает «это для них»
- Дифференциирует от AI courses (Anthropic Academy) и dev docs (LangChain)

**Альтернативы:**
- ✗ «AI Atlas про Claude» — generic, не отражает strength
- ✗ «AI Operating System» — слишком абстрактно для buyer
- ✗ «AI Encyclopedia» — позиционирует как пассивный reference
- ✓ «AI Transformation Playbook» — actionable, role-specific, value-clear

**Что это означает дальше:**
- IntroModal copy переписан (`51c9267`)
- Lending copy в Phase 3 переписан под этот positioning
- Outreach messages используют этот язык
- SEO/Twitter/Marketing — все consistent

**Owner:** founder

**Status:** EXECUTED — IntroModal обновлён 2026-05-24.

---

## 2026-05-24 — Phase 0 UX wins: auto-tutorial-push removal

**Решение:** Убран `setTimeout(() => setRoute({type:'tutorial',id:'ai-fluency'}), 150)`
из `handleIntroDone` в `App.jsx`. Заменён на soft toast CTA.

**Контекст:**
Product audit § «самый слабый момент» — IntroModal сразу пушит в туториал.
Head of Product закрывает вкладку. Самая дорогая строка в проекте.

**Обоснование:**
- Пользователь приходит «посмотреть карту», не «начать 30-минутный курс»
- Soft CTA через toast 8 сек — он сам решает
- Изменение one-line, эффект — на **каждый** будущий пользователь

**Альтернативы:**
- ✗ Просто удалить — toast даёт «soft offering», не теряет conversion на tutorial
- ✗ Persistent CTA на главной — отвлекает от карты
- ✓ Toast 8sec с action button — non-intrusive, dismissible

**Owner:** founder + Claude

**Status:** EXECUTED — `507bd27`.

---

## 2026-05-24 — Phase 0 UX wins: cap-* foundation hide

**Решение:** 6 weak foundation узлов (`cap-vision`, `cap-files`, `cap-search`,
`cap-citations`, `cap-code-exec`, `cap-computer`) скрыты через `minLevel: 'expert'`.

**Контекст:**
Product audit § «второй слабый момент» — 10 из 11 cap-* узлов — stub'ы 130-200 chars,
generic-level. В 3-5 раз тоньше соседних transformation-узлов. Тащат вниз
perceived quality продукта.

**Обоснование:**
- Полный upgrade — P1 контентный проект на ~20 часов (см. `tasks/cap-audit-2026-05-24.md`)
- Минимум action — скрыть из default view, оставить доступ через search
- 0 риск: контент не удалён, cross-links сохранены, expert users видят

**Альтернативы:**
- ✗ Delete — потеря cross-links и referenced content
- ✗ Leave as-is — продолжает damage perceived quality
- ✗ Upgrade all immediately — 20+ часов content work блокирует Phase 1
- ✓ Hide via minLevel + schedule upgrade в backlog (#34-#37)

**Owner:** founder

**Status:** EXECUTED — `ff10208`. Полный upgrade — P1 backlog.

---

## 2026-05-24 — Pricing pivot: $19 → $29, $99 → $149

**Решение:** Pro tier $29/mo (V2), не $19 (V1). Team tier $149/mo (V2), не $99.

**Контекст:**
V1 pricing был anchored к AI newsletters ($19 Lenny). Product audit показал что
контент уровня **консалтинговый** ($300-500/час), не newsletter-уровня.

**Обоснование:**
- $29/mo = <10% часа AI consultant. Underpricing = sigaling «hobby».
- $149/team = $30/seat × 5 — стандарт B2B SaaS (Notion/Linear/Figma в этом range)
- Содержание уже на этом уровне; не imposters syndrome — facts

**Альтернативы:**
- ✗ $19/$99 — undervalues product, attracts wrong-fit customers
- ✗ $49/$249 — too aggressive для Phase 1 валидации
- ✓ $29/$149 — psychological sweet spot, anchored к consulting

**Status:** HYPOTHESIS — pending Phase 1 валидация (10 interview pricing score >= 3.5/5).

**Reverts:** 2026-05-24 «Pricing structure: Free / Pro $19 / Team $99 / Enterprise custom»
запись выше (V1 hypothesis).

---

## 2026-05-24 — Primary ICP: Product/Ops/Strategy lead (not eCommerce-specific)

**Решение:** Primary ICP — Product / Ops / Strategy lead в компании 50-500 человек,
ведущий AI инициативу. eCommerce — **одна из 7** transformation-веток, не вся ICP.

**Контекст:**
V1 ICP был «eCommerce-команды». Product audit показал что eCommerce — это 19 узлов
из 62 transformation. Остальные 43 узла обслуживают Ops/Marketing/Support/Product/
Design/Enterprise. Сужать ICP до eCommerce = терять 70% addressable contentmatch.

**Обоснование:**
- Контент покрывает 7 функций, ICP должен соответствовать
- "Transformation lead" — точная роль которая видит value across functions
- 50-500 employee size — sweet spot между «нет budget» и «slow enterprise»

**Альтернативы:**
- ✗ eCommerce-only — слишком узко
- ✗ "AI Learners" — anti-ICP, low WTP
- ✗ "Anyone" — generic, no positioning
- ✓ Product/Ops/Strategy lead — specific, role-clear, multi-function content match

**Status:** HYPOTHESIS — pending Phase 1 валидация (interview confirmation).

**Reverts:** 2026-05-24 «Primary ICP: eCommerce Transformation Lead» запись выше (V1).

---

## 2026-05-24 — GTM Channel #1: Nordic LinkedIn + финский moat

**Решение:** Phase 1-2 — 80% усилий на Nordic LinkedIn outbound с финским tier-card
как hook. US/UK LinkedIn — Phase 2-3, после Nordic валидации.

**Контекст:**
Product audit § value pockets — full Finnish locale = aномалия рынка. Никто
больше не имеет commercial AI-handbook на финском. Это самый сильный
differentiator который у нас есть.

**Обоснование:**
- Финский moat не воспроизводим за <6 месяцев
- Nordic ICP — high purchasing power + LinkedIn density
- Low competition (никаких других Nordic AI products)
- Network density (финский B2B-community компактный)

**Альтернативы:**
- ✗ Global LinkedIn (US/UK first) — теряем moat advantage
- ✗ SEO-first — slow, no validation signal
- ✗ Twitter — premature без brand recognition
- ✓ Nordic LinkedIn → US/UK → SEO/Twitter

**Status:** PLAN — execution Phase 1.

**Reverts:** 2026-05-24 «Channel mix: SEO 50% + LinkedIn 30% + Partners 20%» (V1).

---

## 2026-05-24 — First $1 path: 3 weeks not 90 days

**Решение:** Первый платящий пользователь — за 3-5 недель, не 90 дней.
Build needed: Stripe + tier-tagging + paywall UI. **Не нужны** AI Companion,
team workspace, premium playbook PDFs.

**Контекст:**
Product audit § honest verdict — продукт не готов к paid tier СЕГОДНЯ не из-за
нехватки контента, а из-за **отсутствия commerce-инфраструктуры**. Контент уже
есть. Stripe — 1-2 недели. Tagging — 2-3 дня. Paywall UI — 3-5 дней.

**Обоснование:**
- Не строим то что не нужно для first $1
- Validates WTP через actual payment, не через interview answers
- $145-435 MRR в первый месяц — signal, не business

**Альтернативы:**
- ✗ Build AI Companion first (3 weeks) — defers payment to month 2
- ✗ Build team workspace first (1-2 months) — defers further
- ✗ Wait для всех P1 контент задач — defers indefinitely
- ✓ Stripe + paywall на existing контенте → launch → iterate

**Status:** PLAN — execution Phase 1-3.

---



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

---

## 2026-06-06 — Builder монетизируется через BYOK + capability-gate, НЕ через кредиты Artlist

**Решение:** Agent Builder монетизируется как второй revenue-слой поверх knowledge-Pro,
по модели **BYOK (свой Anthropic-ключ) + подписка за автоматизацию**. Кредитную систему
Artlist (перепродажа токенов) НЕ внедряем. Knowledge-Pro и Builder-Pro — единый tier $29.

**Контекст:** пользователь прислал разбор бизнес-модели Artlist (подписка+кредиты+
маркетплейс+enterprise, агрегатор сторонних AI-моделей). Запрос — адаптировать под Atlas.
Бизнес-доки V2 (01–07) не учитывали Builder как монетизируемый актив — разрыв закрыт
документом 08-builder-monetization.md. Анализ проведён 3 агентами (monetization-architect,
competitive-intelligence, product-strategist).

**Обоснование:** BYOK снимает с нас inference-COGS (главную статью затрат Artlist) →
маржа 80–95%, нулевая юр.ответственность за чужой биллинг, монетизируем уже построенную
инфраструктуру (расписания/вебхуки/мультиключи/защита кошелька). Кредиты решают проблему,
которой у нас при BYOK нет.

**Альтернативы:**
- ✗ Managed credits (как Artlist) — требует метеринг/circuit-breakers/anti-abuse/буфер,
  структурный риск маржи, юр.ответственность; нереалистично для solo/early. Отложено в Phase 5+.
- ✗ Builder как самостоятельный automation-SaaS против Zapier/Make/Dust — проигрыш на
  интеграциях и деньгах.
- ✓ BYOK + capability-gate + монетизация СВЯЗКИ «знание+конструктор+язык» — defensible,
  на готовой инфраструктуре, category-of-one (финский moat).

**Честная оценка выручки:** $1–4k MRR за 12 мес (валидация, не бизнес). $50k MRR —
фантазия для нашей стадии.

**Что дальше:** MVP = Stripe + capability-gate (расписания/вебхуки/мультиключи) +
free-лимит запусков + Subscription tab. First-party Builder-шаблоны из transformation-узлов.
ВСЕ цены — гипотезы до Phase 0 validation interviews (§15a).

**Owner:** Denis

**Status:** PLAN

---

## DECISION (2026-06-08): n8n как ценовой ориентир Builder — «за автозапуски, безлимит людей/схем»

**Контекст:** разбор бизнес-модели n8n.io (прямой аналог Agent Builder). См. doc 09.

**Решение:** принять n8n-механику ценообразования как ориентир для Builder-тарифов:
платить за **автозапуски/активные автоматизации**, а пользователей и схемы — безлимит на
всех тарифах. Метрика — НЕ сырые executions (под BYOK токены платит пользователь), а то,
что крутится на нашем сервере без него (расписания/вебхуки).

**Обоснование:** BYOK делает наш compute-COGS ~нулевым → можем быть щедрее n8n на ручные
прогоны и монетизировать связку «знание+конструктор+язык» + автоматизацию. Простота n8n
(«платишь за прогоны, безлимит людей/схем») снимает трение тарифной сетки. Подтверждает,
не меняет doc 08 (BYOK + capability-gate).

**Что взять:** (1) ценообразование за автозапуски + безлимит людей/схем; (2) щедрый free;
(3) галерея шаблонов как канал активации; (4) self-host для enterprise — Phase 5+.

**Что НЕ брать:** open-source/fair-code лицензию (снижает defensibility на ранней стадии);
managed-исполнение нашим compute (ломает BYOK-маржу).

**Честная оценка:** ориентир выручки без изменений — $1–4k MRR / 12 мес (валидация).
ВСЕ цены — гипотезы до Phase 0 validation (§15a).

**Owner:** Denis · **Status:** HYPOTHESIS

---

## DECISION (2026-06-08): расширить позиционирование до «AI для всех» (видение) + плацдарм нетехнического соло-оператора (вход)

**Контекст:** основатель решил расширить аудиторию с узкого B2B «Transformation Lead»
(doc 02) на ВСЕХ — блогеров, обычных людей, малый/сервисный бизнес, офлайн-профессии.
См. doc 10. Опора на конкурентов: n8n (devs), Zapier (ops), Artlist (креаторы) — все
узкие; белый рынок = нетехнический обычный пользователь.

**Решение:**
- **Видение/категория:** «AI для всех, не для разработчиков» — учим, что ИИ может для
  твоего дела, и даём собрать это простым языком без кода.
- **Плацдарм входа:** недообслуженный нетехнический соло-оператор (создатели/блогеры,
  малый сервисный бизнес, мастера). «Transformation Lead» (doc 02) — один из сегментов
  «всех», не выбрасывается.
- **Дифференциация (moat):** learning-first + plain language + шаблоны по роли/делу +
  Claude-native BYOK + охват офлайн-профессий.

**Что меняется в разработке:** шаблоны Builder по роли/делу (не по тех-функции);
онбординг-роли для нетехнических; plain-language как жёсткий принцип; Atlas use-case узлы
для офлайн-профессий; ценообразование по doc 09 (за автозапуски, безлимит людей/схем).

**Честная оговорка:** «для всех» = видение/TAM, не go-to-market. Без плацдарма расфокус
убивает ранний продукт. Distribution остаётся замороженным (PIVOT-PRODUCT-FIRST) — это
направление РАЗРАБОТКИ, не запуск маркетинга. Цены/сегменты — гипотезы до Phase 0 (§15a).

**Не нарушает** правило «не академия»: обучение — средство, не продукт.

**Owner:** Denis · **Status:** DIRECTION

# Interview questions — Atlas Pro validation

> **Длительность:** 45 минут (флекс 30-60)
> **Формат:** Zoom + запись (с consent)
> **Цель:** понять WTP + collect quotes для marketing
>
> **Goal output per interview:** 1 «Yes I'd pay $29» signal OR clear «no, here's why»

---

## Pre-call setup (5 min до звонка)

- [ ] Open `06-recordings/interview-{date}-{name}.md` (использовать template)
- [ ] Re-read interviewee LinkedIn profile (1-2 min)
- [ ] Open Atlas в browser tab + найди наиболее relevant transformation direction для их role
- [ ] Calendly: confirm time
- [ ] Zoom recording ON (если consent уже дан) или попроси consent в первой минуте

---

## Опening (1-2 min)

> «Привет [Name], рад что нашёл время. Перед началом — я строю продукт про AI transformation для Product/Ops команд. Хочу учиться, не продавать. Это интервью для понимания твоей реальности, не demo-pitch. Возражаешь если я записываю чтобы не отвлекаться на заметки?»

**Tone:** humble, learning, not pitching.

**Если consent для recording:**
> «Спасибо. Никому не покажу — only для my notes. Если в какой-то момент скажешь "off the record" — обрезаю.»

---

## Часть 1 — Их контекст (10 min)

**Goal:** понять кто перед тобой, дать им рассказать (75% они говорят, 25% ты).

### Open with broad

> «Расскажи коротко про свою роль и как проходит твой обычный день»

Listen for:
- Time spent on what types of work
- Pain points они mention spontaneously
- Their seniority signal (operational vs strategic)

### Probe их AI relationship

> «Каков сейчас отношение твоей команды к AI?»

Listen for:
- Stage 0-4 maturity (см. `docs/strategy/06-transformation-layer.md`)
- Who в team owns AI initiatives
- Recent AI projects (success / failure stories)

### Понять decision power

> «Кто ещё в твоей компании думает про AI стратегию?»

Listen for:
- Names + roles (для future referrals)
- Buying committee structure
- Who approves tool budget

**Records:**
- Должность точно (для LinkedIn statistics)
- Размер команды + размер компании
- Текущий AI maturity (Stage 0-4)
- Decision committee composition

---

## Часть 2 — Их pain points (15 min)

**Goal:** понять что не работает + какие workarounds они используют.

### Когда они нуждались в AI roadmap

> «Когда тебе нужна была AI roadmap для команды, куда ты смотрел?»

Listen for:
- Specific sources mentioned (Anthropic Academy, Maven, consultants, blogs, Twitter, books)
- Frustration level в их голосе
- What they bookmarked / saved

### Что было missing

> «Что было upset/missing в том что ты попробовал?»

Listen for:
- Specific gaps
- "I wish there was..."
- "If only it..."

### Последнее AI decision

> «Расскажи последний раз когда ты принимал AI-связанное решение для команды»

Listen for:
- Concrete workflow они описывают
- Time spent
- Tools they considered
- What blocked them

### Big blockers

> «Что блокирует тебя сейчас от bigger AI adoption?»

Listen for:
- Budget? Skills? Strategy? Team buy-in? Compliance?
- These → marketing copy themes

**Records (дословно):**
- Цитаты про frustrations
- Конкретные источники которые они пытались
- Decision criteria для AI-tools
- Workarounds которые они currently используют

---

## Часть 3 — Демо (10 min)

**Goal:** показать продукт + observe reactions. **Минимум talk, максимум observe.**

### Setup

> «Покажу тебе что я строю — это Atlas, операционный playbook для AI transformation. 30 секунд free exploration, потом я дам контекст.»

### Share screen, open Atlas

**Step 1 (30 sec) — Open atlas.example/**
> «Что ты видишь?»

Listen for **first 5 words** — это раскрывает что они see.

### Step 2 (3 min) — Open their relevant direction

Если they're eCommerce-focused → open `#/node/ai-native-ecommerce`.
Если Operations → `#/node/ai-native-operations`.
Если Product → `#/node/ai-native-product`.

> «Это direction для [их роль]. Прокликай 2-3 узла что зацепило.»

Watch:
- Where they linger
- Where they squint / frown
- What они read aloud
- What они skip

### Step 3 (3 min) — Show cross-link

Click on `[[node:af-embeddings]]` или похожую inline-ссылку в тексте узла.

> «Это inline cross-link — связи между Foundation, Systems, Transformation видны кликом. Это unique в этом продукте — не plain knowledge base.»

Watch их reaction.

### Step 4 (3 min) — Ask

> «Полезно? Что было бы missing?»

Listen for:
- Specific feature requests
- "Could you also do X?"
- "What about [adjacent need]?"

**Records:**
- Где задерживается (interest signal)
- Где морщится (confusion signal)
- Что говорит дословно про value
- Просит ли ссылку или access (strong intent signal)
- Feature requests

---

## Часть 4 — Pricing (10 min)

**Goal:** прямой вопрос про WTP. Это **самая важная часть**.

### Anchor с open question

> «Если бы это был tool для твоей команды, какой бюджет уместен?»

**КРИТИЧНО:** не упоминай $29 first. Listen что они называют.

- Если они называют < $19 → red flag (или dev tier mindset)
- $20-50 → green light для Pro pricing
- $100+ → green light для Team
- "Depends" → ask "depends on what?"

### Введи $29 anchor

> «Pro tier $29/mo per person — что думаешь?»

Watch:
- Face reaction (microexpression)
- Tone shift
- Words («reasonable» / «expensive» / «no-brainer»)
- Score 1-5 (mental):
  - 5: "Yes immediately, where do I pay"
  - 4: "Yes for team budget, no questions"
  - 3: "Maybe, depends on [specifics]"
  - 2: "Too expensive, I'd consider $15"
  - 1: "No"

### Введи $149/team anchor

> «Team tier $149/mo за 5 seats — это для тебя или для personal use?»

Listen:
- Кто платил бы — company или personal
- Approval process if company

### Decision criteria

> «Что бы заставило тебя реально pay vs использовать free?»

Listen for:
- Specific features they need
- Use cases that would justify
- Frequency of use

**Records (дословно):**
- Их initial budget estimate
- Reaction на $29 (face, words)
- Reaction на $149 Team
- Score 1-5
- Decision criteria для payment
- Кто approves payment в их компании

---

## Часть 5 — Follow-up (5 min)

**Goal:** referrals + future relationship.

### Launch notify

> «Когда продукт launch как paid — могу тебя info notify?»

Если да → email сохрани в notes (NOT в public file).

### Referrals

> «Знаешь кого-то ещё кого было бы полезно опросить?»

**Это самый ценный вопрос interview.** Hot referrals конвертят в 5-10× выше cold outreach.

> «Спасибо! Не мог бы ты intro по email когда удобно?»

### Early access list

> «Хочешь продолжать тестировать когда у нас будет beta?»

Если да → add к private list (NOT в public repo).

### Thank you

> «Огромное спасибо за время. Буду регулярно обновлять прогресс — увидимся в LinkedIn / email.»

---

## После interview (5 min)

**Immediately:**

1. Open `06-recordings/interview-{date}-{name}.md` (template ниже)
2. Fill дословные quotes пока memory свежий
3. Update `01-target-list.md` — status to ✅ held
4. Update `tasks/pricing-validation.md` — score + signal

**В течение 2 часов:**

1. Send Thank You message via LinkedIn DM (template из `05-message-templates.md`)
2. Если они promised referrals — follow up в течение 24h

---

## Template для interview notes file

Создай новый файл: `06-recordings/interview-{YYYY-MM-DD}-{first-last}.md`

```markdown
# Interview — {Date} — {Name} ({Company})

**Role:** {role}
**Company size:** {N employees}
**Country:** {FI / SE / NO / DK / EE / US / UK}
**LinkedIn:** {URL}
**Date/Time:** {YYYY-MM-DD HH:MM TZ}
**Duration:** {actual minutes}
**Format:** {Zoom / Google Meet}
**Recording:** {yes/no/declined}
**Consent для quotes в marketing:** {yes/no/asked-later}

---

## Their context

- **Daily work:**
- **Team structure:**
- **AI maturity stage:** 0-4 (per `docs/strategy/06-transformation-layer.md`)
- **AI champion in company:**
- **Decision committee для tools:**

## Pain points (дословно)

- "..."
- "..."
- "..."

## Sources they tried before

- {source 1} — {their feedback}
- {source 2} — {their feedback}

## Demo reaction

- **First impression:** "..."
- **Most interested in:** {direction / узел}
- **Confused by:** {что}
- **Asked about:** {feature requests}
- **Cross-link reaction:** {comment}

## Pricing reaction

- **Initial budget estimate:** $ {amount}
- **Reaction на $29 Pro:** "..."
- **Score 1-5:** {N}
- **Reaction на $149 Team:** "..."
- **Approval process в их компании:** {company card / personal / approval / etc}

## Decision criteria

> What would make them actually pay vs use free:
- "..."
- "..."

## WTP signal

- {YES / MAYBE / NO}
- Reasoning: ...

## Quote of the day (для marketing)

> "..."

(Their consent для use в marketing: ___)

## Follow-up

- **Notify on launch:** yes/no
- **Email:** {private — не в public file}
- **Early access list:** yes/no
- **Referrals offered:** {names + intros promised}

## Personal observations

- **Their level of frustration с current options:** {low/medium/high}
- **Tone of voice про AI:** {skeptic / optimist / pragmatic}
- **Authority within company:** {individual contributor / influencer / decision maker}
- **Time-to-decision estimate:** {days/weeks/months}

## Lessons для next interview

- What I'd ask differently:
- What signals I missed:
- What worked в demo flow:

---

_Interview completed: {date}. Next interview booked: {date or none}._
```

---

## Anti-patterns во время interview

❌ **Не pitch продукт во время Part 2 (pain points)** — это закрывает их up. Listening mode.

❌ **Не defend критику.** Если они говорят «это не для меня» — "Tell me more" не "But actually..."

❌ **Не assume что они нашего ICP.** Validate через questions.

❌ **Не filter тяжёлые quotes.** Если они говорят «too expensive» — записать дословно, не softening.

❌ **Не пропускай Part 4 (pricing) даже если awkward.** Это THE critical moment.

❌ **Не enchant их.** Pre-revenue founder = humble researcher. Не "this product will change everything".

✅ **Слушай в 2 раза больше чем говоришь.**

---

## Если они отвечают «не для нас»

**Don't push.** Instead:

> «Понял, спасибо за честный ответ. Кто-то по твоему мнению попадает в эту аудиторию?»

Hot referrals могут прийти даже от «no» interview.

---

## Если они отвечают «возможно, но...»

**Probe specifics:**

> «Что было бы 'но'?»

Listen — это **conditions** которые tell you what to build / what to communicate.

---

## Common patterns to watch for

После 3-5 interviews начни замечать:

### Pricing patterns
- Все говорят $40-50 OK → можно raise к $39
- Все говорят $20 max → consider lower tier OR repositioning
- Большая variance → ICP unclear или value unclear

### ICP patterns
- Все жалуются на одно и то же → strong signal
- Никто не понимает для чего им это → positioning issue
- Все говорят «у нас уже есть internal» → wrong ICP или small TAM

### Demo patterns
- Все cling на одну ветку (eCommerce / Ops / etc) → focus messaging
- Все спрашивают про feature X → build it в Phase 2
- Все смотрят 30 sec и закрывают → demo flow broken

---

_File created: 2026-05-24. Use as live reference per interview._

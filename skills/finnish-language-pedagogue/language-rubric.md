# Finnish Language Rubric — детальный чеклист

> Используется агентом `finnish-language-pedagogue`. Каждый пункт —
> отдельная проверка. Группируется по 5 категориям (A-E из
> `docs/language-pedagogy-shared.md`).

---

## A. Грамматика финского

### A1. Падежи (sijat)
- [ ] Партитив корректен в количественных выражениях, отрицаниях,
      незавершённых действиях (ostan kahvia, en juo kahvia)
- [ ] Нет смешения partitive/nominative (`tein työn` vs `tein työtä`)
- [ ] Genitive в правильных конструкциях (omistus, объект инфинитива)
- [ ] Illative/inessive/elative — verb requires (mennä kouluun,
      olla koulussa, tulla koulusta)
- [ ] Translative (-ksi) и essive (-na) правильно различены

### A2. Глагольные формы
- [ ] Времена: preesens / imperfekti / perfekti / pluskvamperfekti
- [ ] Согласование подлежащего и сказуемого (он/она — оба `hän`,
      без gender)
- [ ] Conditional (-isi) — правильное место и форма
- [ ] Passive (myydään, tehdään) — без agent (no «by» как в EN)
- [ ] Инфинитивы I/II/III/IV — правильный выбор (osaan tehdä,
      pyydän tekemään, alkaa tehdä)

### A3. Owner suffixes (omistusliitteet)
- [ ] `talossani` ✓ vs `minun talossa` (избыточно)
- [ ] Согласование с pronoun: `minun työni` (оба обязательны в
      формальном письме)

### A4. Compound words (yhdyssanat)
- [ ] Сложные слова пишутся слитно: `tietokoneohjelma`, не
      `tietokone ohjelma`
- [ ] Дефис только в составных с числами/аббревиатурами:
      `5-vuotias`, `AI-järjestelmä`

### A5. Negation
- [ ] `en/et/ei/emme/ette/eivät` + правильная форма глагола
      (negation verb conjugation)
- [ ] Не «ei minä», а «en minä» (если нужно местоимение)

---

## B. Орфография и пунктуация

### B1. Орфография
- [ ] Двойные согласные: `kissa` не `kisa`
- [ ] Долгие гласные: `tuli` (огонь) vs `tuuli` (ветер)
- [ ] Vowel harmony: `työ` (front) + harmonious endings, не
      `työssa` → `työssä`
- [ ] Заглавные только для имён собственных и начала предложений
      (не для всех существительных как в немецком)

### B2. Пунктуация
- [ ] Запятая перед `että`, `joka`, `kun`, `jos`, `koska`,
      `vaikka` в придаточных
- [ ] Точка в конце предложений (в списках с точкой допустимо,
      без — тоже)
- [ ] Двоеточие после `Esim:`, `Huom:`
- [ ] Тире en-dash `–` с пробелами: `Helsinki – Tampere`
- [ ] Кавычки: «...» или "..." (выбрать одно, держать консистентно)

### B3. Финские специфичные пунктуационные правила
- [ ] Время через двоеточие: `10:30` не `10.30` в современном
      финском (хотя `10.30` тоже встречается)
- [ ] Десятичная запятая: `3,14` не `3.14`
- [ ] Большие числа с пробелом: `10 000` не `10,000`

---

## C. Лексика и стиль

### C1. Translation-ese детекторы
- [ ] Нет калькированных предлогов: `kysymys X:stä` (про X) вместо
      `kysymys koskien X:ää`
- [ ] Нет «mahdollistaa+nominalization» (English «enables ...ing»):
      «AI mahdollistaa tiimien parantumisen» → «AI auttaa tiimejä
      parantumaan»
- [ ] Нет лишних `se`/`tämä` в начале предложений (русский паттерн)
- [ ] Нет цепочек -minen/-ttaminen nominalizations подряд

### C2. Англицизмы
- [ ] Технические термины — OK: `MCP`, `API`, `RAG`, `LLM`
      (это интернационализмы)
- [ ] Бизнес-сленг — заменять: `launchaa` → `käynnistä`,
      `aboutme` → `tietoja minusta`
- [ ] Smart slang в кавычках допустим один раз, второй раз —
      финский: «`workflow`» → дальше `työnkulku`

### C3. Lexical accuracy
- [ ] Не путать близкие слова: `oppia` (учиться) vs `opettaa`
      (учить)
- [ ] Не путать `tieto` (знание/информация) vs `tietoa` (часть
      info)
- [ ] Не использовать `valita` где нужен `valikoida`

### C4. Регистр (rekisteri)
- [ ] Atlas — yleiskieli, не puhekieli: `sinä saat` ✓, не `sä saat`
- [ ] Не канцеляризм: не «mahdollistetaan käyttäjälle...» в
      Atlas-узлах
- [ ] Без архаизмов: не «moninainen» где можно «monenlainen»

---

## D. Связность и читаемость

### D1. Длина предложений
- [ ] В среднем 10-20 слов в предложении (финский более компактный
      чем русский за счёт падежей)
- [ ] Если >25 слов — разбить
- [ ] Subordinate clauses не глубже 2 уровней

### D2. Параллелизм в списках
- [ ] Все элементы списка в одинаковой грамматической форме:
      все инфинитивы или все имена существительные, не микс
- [ ] Все элементы начинаются с одинаковой буквы
      (заглавной или строчной)

### D3. Cohesion connectors
- [ ] Используются типичные финские: `näin`, `siten`, `tällä tavoin`,
      `lisäksi`, `toisaalta`
- [ ] Не калькированные английские: «in other words» → `toisin sanoen`

### D4. Pronouns
- [ ] Pronouns не повторяются слишком часто (финский часто опускает
      местоимения если из глагольной формы ясно)
- [ ] `minä/sinä/hän/me/te/he` — только если нужно подчеркнуть

---

## E. Педагогика финского для целевой аудитории Atlas

### E1. Целевой уровень
- [ ] Atlas пишется на уровне **B1-B2** для не-носителей и
      **полностью понятен** носителям
- [ ] Не используются редкие случаи (abessive, comitative,
      instructive) — есть, но в Atlas-контексте редко уместны
- [ ] Идиомы (sananlasku) — только если они общеизвестны
      (no `kuin koira soittaa pianoa`)

### E2. Объяснение терминов
- [ ] При первом упоминании английского термина — расшифровка:
      `MCP (Model Context Protocol)` или `MCP (palvelimien
      yhdistämisstandardi)`
- [ ] Финские технические термины — без расшифровки если они
      common: `työnkulku`, `käyttäjä`

### E3. Cultural appropriateness
- [ ] Примеры из жизни — нейтральные международные (Google, iPhone,
      Notion), не Helsinki-specific
- [ ] Цены/денежные суммы — в евро (€) если упоминаются
- [ ] Никаких русских реалий «Сбербанк», «ВТБ» в финских текстах

### E4. «Звучит как живой человек»
- [ ] Можно прочитать вслух без «спотыкания» на падежах
- [ ] Не похоже на машинный перевод (нет «kone-suomi» признаков)
- [ ] Native speaker при чтении говорит «kyllä, kuulostaa hyvältä»

---

## Финальный score (по аналогии с learning-content-auditor)

| Категория | Вес | Score 0-3 |
|-----------|-----|-----------|
| A. Grammar | ×3 | 0/1/2/3 |
| B. Spelling & punctuation | ×2 | 0/1/2/3 |
| C. Lexicon & style | ×3 | 0/1/2/3 |
| D. Cohesion & readability | ×1 | 0/1/2/3 |
| E. Pedagogy | ×2 | 0/1/2/3 |

Max = 33. Узел/туториал считается «native-quality» если score ≥ 28
И нет ни одной P0 (грамматическая ошибка).

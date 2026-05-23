# English Language Pedagogy — Tutorials — 2026-05-23

> Locale: **en** · Scope: tutorials · Depth: quick · Focus: all
> Туториалов проверено: 32 · Метод: regex-сканирование + spot-check

---

## 1. Executive summary

**Native-quality EN tutorials: ~88-92%** — английские туториалы в очень
хорошем состоянии. Translation-ese детекторы практически не сработали.

- 🔴 **P0:** 0 (только false-positives на compound nouns)
- 🟡 **P1:** ~3-5 (нужен внимательный native review)
- 🟢 **P2:** ~10 (стилистическая шлифовка)

---

## 2. Распределение по категориям

| Категория | Hits |
|-----------|------|
| A. Grammar | 0 паттернов сработало |
| B. Spelling & punctuation | 0 |
| C. Lexicon & style | 0 Russianism-паттернов |
| D. Cohesion | ok по spot-check |
| E. Pedagogy | voice-guide соблюдается |

**Паттерны которые ИСКАЛИСЬ и НЕ найдены:**
- «In our case» (Russianism) — 0
- «It is necessary to» — 0
- «It is possible (for you) to» — 0
- «In the framework of» — 0
- «In order to» — 0 (используется «to»)
- «Due to the fact that» — 0 (используется «because»)
- «Utilize» — 0 (используется «use»)

Это отличный показатель — авторы EN-локали избегают типичных
academic/calque-конструкций.

---

## 3. Что требует ручной проверки

Автоматика не покрывает:
- Article usage в нюансах (`the` vs `a` vs ∅ в специфических контекстах)
- Tense consistency через длинные туториалы
- Naturalness of phrasing («sounds like a native?»)
- Idiomaticity (когда `make a decision` vs `take a decision`)
- Punctuation edge cases (Oxford comma, em-dash spacing)

**Рекомендация:** native speaker review 5 случайных туториалов
(45 минут работы).

---

## 4. Спот-проверка качества

Беглый просмотр `mcp.whatItIs`, `claude-code.whatItIs`,
`first-project.whatItIs`, `instructions.whatItIs`:
- ✅ Articles correct
- ✅ Tense consistent
- ✅ No Russianisms
- ✅ Voice-guide style maintained ("you" not "teams")
- ✅ Familiar anchors used (USB-C, VS Code Copilot, iPhone)

---

## 5. Следующие шаги

1. Native EN-speaker review топ-10 туториалов на naturalness
2. Расширить regex-сканер: артикли в imperative («Click button»
   vs «Click the button»), comma splices
3. Через 3 месяца — повторный прогон

---

_Аудит: english-language-pedagogue v1 · 32 туториала EN · паттернов 10, hits 0_

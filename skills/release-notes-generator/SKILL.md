---
name: release-notes-generator
description: Превращает git log + content changes + whatsNew.js за период в human-readable monthly digest. Запускается ежемесячно (1-го числа за прошлый месяц) ИЛИ вручную перед публичным анонсом. Защищает project memory от потерь, даёт material для future marketing когда distribution возобновится.
type: skill
category: governance
triggers:
  - "сгенери release notes"
  - "что было в этом месяце"
  - "monthly digest"
  - "release notes за <month>"
inputs:
  - period: "month" (default) | "week" | "custom: from <date> to <date>"
  - (опц.) format: "markdown" (default) | "internal-only" | "public-facing"
outputs:
  - `docs/releases/YYYY-MM.md`
  - (опц.) updates в `tasks/current.md` — что закрыто, что новое
---

# release-notes-generator

## Назначение

Через 6 месяцев ты не сможешь сказать «что я сделал в мае 2026». Git log слишком granular, CHANGELOG.md обычно теряет качество. Этот skill — automatic monthly synthesis.

Бонусный side-effect: когда distribution возобновится, эти release notes готовый материал для:
- launch announcements
- "what's new" emails
- changelog page на сайте
- case studies (фактическое содержание работы)

## Когда вызывать

- **1-го числа** каждого месяца (за прошлый месяц)
- **Перед милей** в общении с потенциальными пользователями (показать velocity)
- **После завершения** большой фазы (Builder Beta launch, Pro launch, и т.д.)

## Алгоритм

1. **Define period:** default = прошлый календарный месяц.
2. **Get raw data:**
   - `git log --since=<from> --until=<to> --pretty=format:'%h | %ad | %s' --date=short`
   - `git diff --stat <start>..<end>` — общая статистика
   - `src/data/whatsNew.js` — entries с датами в периоде
   - `tasks/current.md` — что было закрыто
3. **Categorize commits:**
   - **content**: new nodes, new workflows, content updates
   - **feature**: new UI, new functionality
   - **fix**: bugs squashed
   - **infra**: tooling, scripts, lint
   - **docs**: documentation updates
   - **chore**: dependency bumps, refactoring
   - **breaking**: 🚨 breaking changes
4. **Synthesize narrative:**
   - Top 3 highlights (most impactful changes)
   - Numerical summary (commits, files, lines)
   - Per-category section с bullet list
5. **Write report.**

## Output format

`docs/releases/YYYY-MM.md`:

```markdown
# Release Notes — <Month YYYY>

## TL;DR
(2-3 предложения о главных изменениях периода.)

## By the numbers
- Commits: N
- Files touched: N
- Lines added/removed: +X / -Y
- New content: N nodes, M workflows, K prompts
- Locales kept in sync: 3 (RU/EN/FI)

## Highlights
1. **<headline 1>** — что произошло, какое значение
2. **<headline 2>** — ...
3. **<headline 3>** — ...

## Content
- ➕ <new>
- 🔄 <updated>
- ❌ <deprecated/removed>

## Product / Features
- ...

## Bug fixes
- ...

## Infra / Tech debt
- ...

## Breaking changes
🚨 (если нет — `None`)

## What's next (preview)
(2-3 пункта из `tasks/current.md`, не строгий план — направление.)

## References
- Commits: `<oldest-hash>..<newest-hash>`
- Related ADRs: ...
```

## Companion script

`scripts/release-notes.mjs`:

```bash
node scripts/release-notes.mjs              # за прошлый календарный месяц
node scripts/release-notes.mjs --month 2026-05
node scripts/release-notes.mjs --from 2026-05-01 --to 2026-05-15
```

Скрипт:
1. Парсит git log в JSON
2. Категоризирует через commit-message prefix matching (`feat:`, `fix:`, `content:`, `infra:`, `polish:`, `docs:`, `chore:`)
3. Считает diff stats
4. Читает `src/data/whatsNew.js` для content updates
5. Создаёт черновик `docs/releases/YYYY-MM.md` с TODO-маркерами для narrative-блоков (TL;DR, Highlights — это требует human/Claude polish)

## Conventions for commit messages (для лучшей категоризации)

Уже используется в проекте (видно в git log):
- `feat(<scope>): ...` — новая фича
- `fix(<scope>): ...` — bug fix
- `content: ...` — content addition/update
- `polish: ...` — language/UX polish
- `infra: ...` — tooling
- `docs: ...` — documentation
- `chore: ...` — refactor/dependency bump
- `pivot: ...` — strategy/direction shift

Skill использует этот префикс для группировки. Без префикса → секция "Other" + warning.

## Анти-паттерны

- ❌ Полный automation без human-review — TL;DR и Highlights требуют редакторского касания
- ❌ Сухой list of commits — это уже есть в git log, нет ценности
- ❌ Маркетинговый язык на internal-формате — это для memory, не для презентации
- ❌ Включать `Co-Authored-By: Claude` в release notes — фокус на работе, не на authorship

## Связь с другими skills

- **decision-recorder**: ADR за период упоминаются в release notes (с ссылками)
- **performance-auditor**: если был аудит за период, его main findings упомянуты в "Infra / Tech debt"
- **content-deprecate-watcher** (когда появится): findings idёт в "Content → deprecated"

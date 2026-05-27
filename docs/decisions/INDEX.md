# Decisions Index

Architecture Decision Records (ADRs) для 105 Atlas.

См. `skills/decision-recorder/SKILL.md` — методология записи и формат.

| ID | Date | Title | Status | Tags |
|----|------|-------|--------|------|
| [0001](./0001-workflow-schema-v1.md) | 2026-05-27 | Workflow schema v1 — recipe-style fields | accepted | content, business |
| [0002](./0002-af-cap-separation.md) | 2026-05-27 | Foundation layer separation — af-* vs cap-* | accepted | content, architecture |
| [0003](./0003-pivot-product-first.md) | 2026-05-27 | Pivot — product-first focus, freeze distribution | accepted | business, strategy |

---

**Back-fill кандидаты** (decisions, которые были сделаны но ещё не записаны):

- Builder как отдельный workspace (`src/builder/`) vs встроенный в Atlas
- Pre-commit hook без husky (native git hooks)
- Inline-links syntax `[[type:id|label]]`
- 3 локали (RU/EN/FI) — фиксация состава
- Plain CSS vs Tailwind/CSS-in-JS
- Atlas preview как inline-component vs new-tab
- Hash-based routing с locale-prefix
- Workflow schema steps as object (keyed by step-id) vs array

Будут добавлены по мере того как возникает потребность сослаться («почему мы сделали X?»).

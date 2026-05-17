# Current Tasks

Активная работа. До 5 задач одновременно. Закрытые удаляются (история — в git).

| status | task | skill / workflow | дата открытия |
|--------|------|------------------|---------------|
| open | **Аудит-спринт C: i18n Phase 5** — перевести контент узлов, туториалов, промптов и paths из RU → EN и RU → FI. Сейчас EN/FI файлы содержат RU-текст. Узлы: `locales/{en,fi}/nodes.json` (~130 узлов × 7 полей). Туториалы: `locales/{en,fi}/tutorials.json` (~21 tutorial). Промпты: `locales/{en,fi}/{prompts,prompt-library}.json`. Paths: `locales/{en,fi}/paths.json`. Выполнять через skill `translate-to-finnish` (для FI) и прямым переводом (для EN) | `translate-to-finnish` | 2026-05-17 |
| open | **Аудит устаревших узлов** — обновить содержимое 3 узлов по deprecate-watch: `cap-computer` (Computer Use — актуальный статус GA/beta), `b-knowledge` (knowledge cutoff текущих моделей), `pl-platforms` (актуальные платформы и версии). Правки в `locales/ru/nodes.json` + `locales/en/nodes.json` | `content-gap-auditor` | 2026-05-17 |
| open | **Learning Paths: For Business + For Educators** — добавить 2 новых маршрута в `src/data/learningPaths.js` и `locales/{ru,en,fi}/paths.json`. For Business (beginner): claude-setup → pl-cowork → pl-integrations → prompting → scenarios. For Educators (intermediate): ai-limitations → cap-thinking → prompting-techniques → subagents → agents | `ai-pedagogy-architect` | 2026-05-17 |

## Сделано в этой сессии (2026-05-17) ✅
- Password gate (SHA-256, VITE_PASSWORD_HASH), Mastercard spinner
- Cookie consent + GA4 conditional loading
- Atlas rebrand (убрали «Claude» из UI)
- What's New badge system (TTL 60 дней, max 10, archive modal)
- 9 узлов cc-grp-* (Claude Code slash groups)
- Узлы: pl-web-setup, pl-desktop, pl-cowork, pl-integrations, cap-limitations, pr-4d, pl-api
- Tutorial routing bug fix (tutorialByNodeId reverse index)
- i18n Phase 5 partial: 18 EN tutorials переведены с RU на EN
- Tutorial claude-setup (6 шагов, EN/RU/FI)
- Tutorial claude-cowork (5 шагов, EN/RU/FI)
- Tutorial ai-limitations (5 шагов, EN/RU/FI)
- Tutorial api-basics (6 шагов, EN/RU/FI) + узел pl-api
- Updates archive modal в стиле глобальных модалок
- Compact filters (всегда dropdown, без wide mode)
- ProfilePanel: language picker как dropdown с флагами + chevron

## Заметки
- Перед началом задачи: переведи `status` в `in_progress` и обнови дату.
- После завершения: удали из этого файла. История — в коммитах.
- Если задача забуксовала > 2 дней — переноси в `backlog.md` или открой обсуждение.

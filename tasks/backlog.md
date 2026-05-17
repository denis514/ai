# Backlog

Задачи, готовые к работе, не активные сейчас.
Структура: **P1 → P2 → P3** по приоритету. Внутри каждого приоритета — порядок исполнения.

---

## Supabase — Backend & Auth (2026-05-17)

Решение принято: **Supabase** как backend platform. Промпт для аудита: `prompts/supabase-auth-audit.md`.

| Phase | Задача | Статус |
|-------|--------|--------|
| **1** | Auth Foundation — Supabase project, env vars, `supabaseClient.js`, `AuthContext.jsx`, таблица `profiles` + RLS, login/register UI | open |
| **2** | Profile & Account page — display_name, email change, delete account (GDPR), export data (GDPR) | open |
| **3** | Learning Progress — перенести localStorage → Supabase `learning_progress` + `favorites` | open |
| **4** | Scenarios & Comments — таблицы `personal_scenarios`, `comments` | open |
| **5** | Monetization — Stripe + `subscriptions` + `ai_usage` limits | open |

**Перед стартом Phase 1:** запустить промпт `prompts/supabase-auth-audit.md` → получить аудит-отчёт → подтвердить план.

GDPR / Финляндия: privacy by design, data minimisation, RLS на всех таблицах, consent timestamps, механизм удаления и экспорта данных пользователя (30 дней по финскому закону).

---

## Инфраструктурный план (по итогам аудита 2026-05-11)

### P1 — Фундамент ✅ ЗАВЕРШЁН (2026-05-11)

Полная история — в `tasks/current.md`. Все 6 пунктов закрыты.

### P2 — Структурные ходы

✅ Завершены 3 из 5: **№7** (Прогресс на узлах), **№8** (Cross-links), **№9** (Learning paths).
История — в `current.md`. Отложены пользователем:

| # | Задача | Статус |
|---|---|---|
| **10** | Data validation в CI | отложено — требует git репо |
| **11** | AI Companion mode | отложено |

### P3 — Большие ставки (1+ месяц)

Меняют масштаб проекта. Браться после того, как P1+P2 закрыты и видна аудиторная реакция.

| # | Задача | Эффорт | Риск | Что меняется |
|---|---|---|---|---|
| **12** | ✅ **News-watcher skill v1** — готов (`skills/news-watcher/SKILL.md`). Spec + workflow + источники + output-формат. Запуск: вручную или по cron. | done | низкий | новый skill в `skills/` |
| **13** | **Self-updating mindmap** — `scripts/ai-add-node.js`, pre-commit guard, scheduled review | ~3-5 дней | высокий | автоматизация на Claude Code SDK |
| **14** | **MCP server для mindmap** — выставить mindmap как MCP-ресурс, чтобы любая Claude Code сессия имела базу знаний в контексте | ~5-7 дней | высокий | новый артефакт `mcp-server/` |

---

## Контентный план (расширение mindmap)

### High priority
- [ ] Аудит текущего mindmap по prompt `improve-mindmap.md` (focus: gaps).
  Цель: найти тематические дыры по Claude Code / sub-agents / scheduled tasks.
- [ ] Прогон содержимого `src/data/mindmapData.js` через `content-rules.md`:
  все ли узлы соблюдают 6-вопросную схему, нет ли пустых полей.

### Medium priority
- [ ] Расширить раздел MCP — применить `prompts/expand-mcp-section.md`
  с фокусом `security` и `patterns`.
- [ ] Создать узлы про sub-agents (Claude Code).
- [ ] Описать в mindmap различие Skills (claude.ai) vs Sub-agents (Claude Code) —
  частая путаница.

### Low priority
- [ ] Реструктурировать ветку «Промпт-инжиниринг», если в ней > 12 детей.

### Deprecate-watch

Узлы и факты, которые **гарантированно устареют** и требуют ревизии.
Полная политика — в `docs/maintenance.md`.

| Узел / факт | Что проверять | Каденс |
|---|---|---|
| `b-models` (Семейство моделей) | Текущие версии Opus/Sonnet/Haiku | После каждого релиза Claude |
| `pl-plans` (Тарифные планы) | Цены, состав планов | Раз в квартал |
| `pl-limits` (Лимиты использования) | 5-часовые / недельные значения | Раз в квартал |
| `pl-models` (Модели по плану) | Какие модели на каком плане | Раз в квартал |
| `pl-rate` (Rate limits API) | RPM / TPM / Tier пороги | Раз в квартал |
| `cap-memory` (Memory) | Состояние раскатки фичи | Раз в месяц |
| `cap-search` (Web search) | Доступность по тарифам | Раз в квартал |
| `cap-computer` (Computer use) | Статус GA / beta | Раз в квартал |
| `m-ready` (Готовые MCP-серверы) | Что добавилось в экосистему | Раз в квартал |
| `b-knowledge` (Knowledge cutoff) | Текущая дата cutoff моделей | После каждого релиза |

---

## Заметки
- Один пункт = один skill / prompt, не «решить всё разом».
- Перед взятием в работу — переноси в `current.md`.
- Раз в месяц — grooming: убирать неактуальное.
- Инфраструктурные задачи (P1-P3) и контентные задачи **независимы** — можно
  чередовать или делать параллельно. Зависимости явно отмечены в колонке
  «Что меняется».

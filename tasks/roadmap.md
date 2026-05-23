# Roadmap

Долгосрочное направление развития. Не дедлайны — а векторы.

**Стратегия:** Atlas — AI-Native Transformation OS (Foundation → Systems →
Transformation), не «курсы по Claude». Полная декларация —
`docs/strategy/01-positioning.md` (статус IMPLEMENTED 2026-05-22).

**Метрики** теперь считаются по плотности карты, а не «сколько курсов».

---

## Q1 (next 1-2 месяца) — Закрыть разрывы с позиционированием

Источник задач: `tasks/audit-strategy-vs-reality-2026-05-23.md`.

| Цель | Метрика |
|------|---------|
| **UI/i18n под новый словарь** | 0 строк «курс / обучение / tutorial / знакомство» в `src/locales/{ru,en,fi}/ui.json` |
| **eCommerce flagship Transformation** | `ai-native-ecommerce` direction с ≥ 10 узлами + 3 use cases |
| **Tutorials → Workflows reformat** | Схема `tutorials.js` расширена полями `whenToApply/KPI/artefacts`; ≥ 5 пилотных workflow мигрированы |
| **Deprecate-watch sweep** | 7 stale-узлов (pl-plans, pl-limits, pl-rate, cap-memory, cap-computer, m-ready, b-knowledge) актуализированы |

Подробности задач — `tasks/backlog.md` § P0-P1.

---

## Q2 (3-4 месяца) — Углубление Systems-уровня

| Цель | Метрика |
|------|---------|
| **Systems density** | Systems layer: 10 → 35+ узлов. Каждое из 6 направлений ≥ 4 листьев. |
| **Cross-link density Foundation** | Среднее `relatedIds` у Foundation-узлов: 2.5 → 5+ |
| **Foundation cleanup** | Решено: `cap-tools` / `cap-vision` мигрированы в `ai-fundamentals` или явно задокументированы как Claude-specific |
| **Workflow-формат раскат** | 32 → все tutorials мигрированы в workflow-формат с whenToApply/KPI/artefacts |
| **Технические workflows** | `mcp-advanced`, `claude-code-project`, `building-evaluations` реализованы |

---

## Q3 (5-6 месяцев) — AI-инфраструктура и масштабирование

| Цель | Метрика |
|------|---------|
| **Verify-mindmap-integrity skill** | Pre-commit hook прогоняет schema-валидацию + dangling refs. 0 ошибок схемы в main |
| **News-watcher cadence** | Еженедельный прогон → дельты Anthropic попадают в `tasks/current.md` автоматически |
| **MCP server для Atlas** | Атлас доступен как MCP-ресурс для Claude Code сессий |
| **AI Companion mode** | Кнопка «спросить Claude об этом узле» с контекстом узла + cross-links |
| **Performance** | ≥ 250 узлов, рендер ≤ 1.5с на mid-range mobile, JS initial ≤ 110 KB gzip |

---

## Long-term векторы (без сроков)

- **Self-updating mindmap** — Claude SDK + cron + pre-commit guard для авто-расширения карты.
- **Content-автопубликация** — `content/content-queue.json` + GH Actions для workflow-публикаций.
- **Personalized transformation maps** — срез карты под конкретную роль (CIO / Marketing / Product / Dev).
- **Граф связей** альтернативный визуал помимо радиального дерева.
- **Multi-tenant Atlas** — компании создают свои forks с приватными узлами под их специфику.

---

## Целевое состояние карты

| Слой | Сейчас | Q1 цель | Q2 цель | Q3 цель |
|------|--------|---------|---------|---------|
| Foundation | ~80 узлов | 90 | 110 | 130 |
| Systems | 10 листьев | 15 | 35 | 50 |
| Transformation | 6 directions (40 узлов) | 7 directions с eCommerce (55) | 7+ (70) | 8+ (90) |
| Use Cases | 13 | 16 | 25 | 35 |
| **Итого** | **~140** | **~175** | **~240** | **~305** |

---

## Целевое состояние workflows

| Состояние | Tutorials | Workflows (workflow-формат) |
|-----------|-----------|-----------------------------|
| Сейчас | 32 | 0 |
| Q1 | 32 | 5 пилотных |
| Q2 | 0 | 32 (все мигрированы) |
| Q3 | 0 | 40+ (новые technical) |

---

## Анти-цели

- ❌ Превращение в «всё про AI вообще» (фокус: Claude + AI-Native transformation).
- ❌ Возврат к LMS / Academy / Course Platform позиционированию.
- ❌ Полный visual redesign без причины.
- ❌ Переход на TypeScript / другой стек без обоснования.
- ❌ Stripe / monetization до закрытия P0-P1 разрывов.
- ❌ Любые «курсы по теме X» — переформулируем как узлы / workflows / use cases.

---

_Последнее обновление: 2026-05-23 (после audit стратегия ↔ реальность)._

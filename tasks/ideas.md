# Ideas

Сырые гипотезы. Минимум фильтрации, чтобы ничего не терять.
Раз в N итераций — promote в `backlog.md` или удаление.

> ⚠️ **С 2026-05-22 действует новая стратегия:** Atlas — не «курсы по Claude»,
> а **AI-Native Transformation OS** (Foundation → Systems → Transformation).
> Идеи в формате «курс / tutorial / learn X» — антипаттерн.
> Идеи в формате «узел / workflow / playbook / use case» — приветствуются.

---

## Контент Foundation (узлы)

- Узел «Knowledge cutoff strategies» — как работать с устаревающим знанием модели
  (RAG, web search, Memory). Связать с `b-knowledge`.
- Узел «Token economics» — детальнее `pl-rate`/`cap-caching`: как считать стоимость
  workflow, не только одного запроса.
- Узел «Safety layers» — guardrails, content filtering, prompt injection defense.
- Узел «Latency budgets» — когда выбирать Haiku vs Sonnet vs Opus по бюджету
  отклика, а не по «качеству».
- Узел «Streaming patterns» — UX-эффекты потоковой генерации.
- Углубить «Fine-tuning» — границы возможностей через Anthropic (если откроют).

## Контент Systems (узлы)

- «Agent-to-agent communication patterns» — расширение `multi-agent-patterns`.
- «Error recovery in AI pipelines» — retry, fallback на меньшую модель, human-in-loop.
- «Drift detection» — как замечать деградацию AI-системы в проде.
- «Vector DB freshness» — когда переиндексировать, как мерить покрытие.
- «Cost-aware orchestration» — выбор модели в рантайме по бюджету.
- «Webhook + queue patterns» для асинхронных AI-операций.
- «Auth strategies для AI-агентов» — service accounts vs user impersonation.

## Контент Transformation (use cases + новые узлы)

- **AI-Native eCommerce direction** (флагман по стратегии) — см. backlog №2.
- Use case «AI-driven OKR setting» — Enterprise direction.
- Use case «AI customer journey mapping» — Marketing / Product cross.
- Use case «AI-augmented sales discovery» — новый Sales sub-direction?
- Use case «AI for compliance/audit» — Enterprise + Operations.

## AI infrastructure

- Skill `transformation-architect` — даёт цельный план для конкретной компании,
  спускаясь по 3 уровням.
- Skill `use-case-composer` — собирает Use Case из существующих узлов
  Foundation+Systems+Transformation.
- Prompt `generate-workflow-from-node` — авто-черновик workflow по узлу
  (под новый формат с whenToApply/KPI/artefacts).
- Prompt `find-orphan-nodes` — поиск узлов без cross-links вниз/вверх.

## UI (вторично)

- «Layer mode» — toggle, который скрывает 2 из 3 уровней, оставляя
  только Foundation / Systems / Transformation отдельно. Для systems thinking.
- «Show transformation path» — фильтр: «покажи всё, что нужно для AI-Native eCommerce».
- «Cost overlay» — на узлах с моделью показывать ориентировочную цену.
- Локальные закладки на use cases (не только узлы).

## Эксперименты

- **AI Companion mode** — кнопка «спросить Claude об этом узле»,
  передающая контекст узла + cross-links в чат. Сейчас в P3 backlog.
- **Граф связей** (помимо радиального дерева) — показать, какие узлы цитируют
  друг друга. Полезно для аудита cross-link density.
- **Embed Atlas в Claude Code** — выставить как MCP-ресурс. Сейчас в P3 backlog.
- **Personalized transformation map** — пользователь выбирает роль
  (CIO / Marketing lead / dev), получает срез карты под себя.

---

## Заметки

- Не пытаемся реализовать всё. Это пул для разговора.
- Идея → backlog: должна пройти через `knowledge-architect` или
  `ai-system-designer` (для архитектурных).
- Идея «курс по теме X» автоматически отклоняется — переформулируй как узел /
  workflow / use case.

---

## 🗑 Архив отброшенных идей (off-strategy)

Сохраняю для истории и чтобы не возвращаться.

### Anthropic Academy course matrix (2026-05-19)

Старая идея: повторить 18 курсов Anthropic Academy под аудитории
(everyone / developers / business / educators). Отброшено 2026-05-23: прямой
антипаттерн нового позиционирования («мы не LMS, не курсы»).

Из этой матрицы реально пригодились только узлы под Foundation
(`mcp-advanced` темы, `building-evaluations` концепция) — они переехали в
`backlog.md` как Foundation-узлы / workflows, не курсы.

### Cloud-интеграции как курсы

Старая идея: `bedrock`, `vertex-ai` как отдельные курсы для developers.
Отброшено: узкая аудитория, не про transformation. Если понадобятся —
делаем 1 узел `pl-cloud-providers` в Foundation, не 2 курса.

### AI Fluency расширение трека

Старая идея: nonprofit, students, teaching tracks. Отброшено: классическая
LMS-логика «курсы под N аудиторий». Если темы важны — становятся узлами
Transformation/Use Cases под соответствующий контекст.

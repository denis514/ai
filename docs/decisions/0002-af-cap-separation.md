# ADR-0002: Foundation layer separation — af-* (concepts) vs cap-* (Claude features)

**Status:** accepted
**Date:** 2026-05-27
**Tags:** content, architecture

## Context

Foundation-слой Atlas содержал и общие концепции AI (LLM, embeddings, RAG, multimodal), и Claude-specific features (Memory, Tools, Vision, Files). При audit'е #22 предполагалось что есть «дубли» между ними. Анализ показал: это не дубли, а **два разных слоя** по уровню абстракции.

Альтернативы:
1. Удалить одну из сторон (af-* или cap-*) — потерять либо AI-literacy, либо product-knowledge.
2. Объединить в один слой — терять навигационную ясность.
3. Сохранить оба + добавить cross-links — обе грани сохранены, навигация двунаправленная.

## Decision

We will keep both layers explicitly separated:
- `af-*` под `foundation/ai-fundamentals` — vendor-agnostic AI concepts (RAG, LLM-basics, embeddings, vector-db, multimodal, memory-systems, fine-tuning).
- `cap-*` под `foundation/capabilities` — Claude-specific features (Memory, Vision, Files, Tools, Search, Caching, Code-exec, Computer, Citations, Limitations, Input-modalities, Thinking).

Связь между слоями — через inline `[[node:id|label]]` cross-links в поле `example` каждого узла. Минимум 1 bridge на каждую концептуальную пару (af-rag-basics → cap-search/files; af-multimodal → cap-vision/files; af-memory-systems → cap-memory; etc).

## Consequences

**Positive:**
- Пользователь-новичок начинает с af-* (learn the concept), затем переходит к cap-* (apply it in Claude). Естественная progression.
- SEO выигрывает: af-* ловит общие AI-запросы, cap-* ловит Claude-specific.
- Расширение на новых вендоров (если в будущем) — добавлять под af-* без ломки cap-*.

**Negative / trade-offs:**
- Возможна путаница «зачем мне читать оба?» — митigируется cross-link-фрейзингом «общая концепция → реализация в Claude».
- Контентный долг: каждая af-* нода требует bridge'а на cap-* counterpart (30 правок).

**Neutral observations:**
- Принцип «concept layer / product layer» применим и к sys-* (production patterns) vs cap-* (Claude features) — потенциально третий уровень.

## References

- Commits: `3f07d64` (foundation cross-links af-* ↔ cap-*)
- Related ADRs: ADR-0003 (sys-* layer как production patterns)
- Discussions: task #22 в conversation 2026-05-27

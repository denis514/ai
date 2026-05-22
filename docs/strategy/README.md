# 105 Atlas — Strategy Pack

> Стратегический комплект документов: переосмысление Atlas как **AI-Native Transformation Operating System**.
> Дата: 2026-05-22 | Статус: DRAFT — требует review перед имплементацией Фазы 1.

---

## Зачем эти документы

Эта папка — не туториалы и не правила кодирования. Это **architect-level стратегия**:
КАК Atlas переходит из «Claude knowledge base» в «AI Transformation OS» — без потери существующего контента.

Документы пишутся в логике:
1. **Что мы есть сегодня** — честный audit.
2. **Чем мы хотим быть** — позиционирование и архитектура.
3. **Как пройти путь** — миграция, scaling, relationships.

Никаких изменений в `src/` до согласования этих документов.

---

## Порядок чтения

| # | Документ | Кому читать первым | Время |
|---|----------|--------------------|-------|
| 01 | [Positioning](./01-positioning.md) | Всем — что такое Atlas теперь | 5 мин |
| 02 | [Three-Layer Architecture](./02-architecture.md) | Всем — как устроена новая модель | 10 мин |
| 03 | [Node Classification](./03-node-classification.md) | Архитектору контента | 15 мин |
| 04 | [Foundation Mapping](./04-foundation-mapping.md) | Кто работает с существующими 133 узлами | 10 мин |
| 05 | [Systems Layer](./05-systems-layer.md) | Кто проектирует Systems-узлы | 10 мин |
| 06 | [Transformation Layer](./06-transformation-layer.md) | Кто разрабатывает eCommerce/Marketing/etc | 15 мин |
| 07 | [Use Cases](./07-use-cases.md) | Кто связывает Foundation→Systems→Transformation | 8 мин |
| 08 | [Migration Plan](./08-migration-plan.md) | Кто будет имплементировать | 10 мин |
| 09 | [Relationships & Scaling](./09-relationships-scaling.md) | Кто думает о росте на 1+ год вперёд | 10 мин |

**Total: ~90 минут на полное прочтение.**

---

## Краткая суть в 5 предложений

1. **Atlas сегодня** — глубокая Claude-энциклопедия (133 узла, 12 разделов), позиционирована как «обучение Claude».
2. **Atlas должен стать** — AI-Native Transformation OS: knowledge graph + workflows + business transformation maps.
3. **Архитектура** — 3 уровня: Foundation (как работают AI-компоненты), Systems (как они соединяются), Transformation (как меняют бизнес).
4. **Миграция** — расширение, не переписывание: существующие 133 узла остаются в Foundation, добавляются Systems-узлы и Transformation-направления (флагман — AI-Native eCommerce).
5. **Принцип** — Use Cases как связующий элемент: каждый Transformation-сценарий ссылается вниз на конкретные Foundation-блоки.

---

## Что НЕ делаем

❌ Не удаляем существующие узлы.
❌ Не переименовываем категории до согласования.
❌ Не меняем root-структуру `mindmapData.js` до Фазы 1.
❌ Не пишем «курсы» — пишем **workflows**, **systems**, **transformation maps**.
❌ Не позиционируем Atlas как LMS / Academy / Course Platform.

---

## Что делаем

✅ Создаём новые root-узлы `systems` и `transformation` (Фаза 1).
✅ Добавляем `ai-fundamentals` под Foundation (LLM, RAG, Vector DB, Embeddings).
✅ Строим `ai-native-ecommerce` как flagship Transformation (12-15 узлов).
✅ Сохраняем все существующие 133 узла — они становятся Foundation.
✅ Связываем уровни через `relatedIds` cross-links.

---

## Соглашения документации

- Каждый документ открывается **TL;DR в 3-5 строк**.
- Концепции иллюстрируются конкретными узлами/файлами.
- Тон — architect, не tutorial-author. Сжато, без воды.
- Любая strategy → имеет следствие в `mindmapData.js` или `tutorials.js`.
- Версионируем дату создания + статус (`DRAFT` / `APPROVED` / `IMPLEMENTED`).

---

_Maintained by: Atlas architecture team_
_Last reviewed: 2026-05-22_

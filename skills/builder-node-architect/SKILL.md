# builder-node-architect

> Skill для согласованного добавления и изменения типов узлов Agent Builder.
> Держит реестр узлов, модель способностей, палитру, i18n и шаблоны в одном
> консистентном состоянии.

---

## Назначение

Domain expert по реестру узлов Builder. Любое добавление/изменение типа узла
(`NODE_DEFS`), правил связей или шаблонов проходит через этот чек-лист, чтобы не
сломать модель совместимости (ADR-0007).

**Когда вызывать:**
- «Добавь новый узел/инструмент/агента в Builder»
- «Поменяй правила соединения узлов»
- «Добавь новый шаблон workflow»
- «Почему эта связь не создаётся / запрещена?»
- Перед коммитом изменений в `src/builder/data/` или `connectionRules.js`

---

## Context (читать перед работой)

1. **`docs/decisions/0007-builder-node-capability-model.md`** — модель и фиксации.
2. **`docs/agent-builder/10-node-capability-model.md`** — порты, типы связей, матрица.
3. **`src/builder/data/nodeTypes.js`** — `NODE_DEFS`, `TOOLBOX_GROUPS`, `KIND_TO_NODE_TYPE`.
4. **`src/builder/data/nodeCapabilities.js`** — `KIND_PORTS`, `LINK`, `linkKind`.
5. **`src/builder/services/connectionRules.js`** — `evaluateConnection`, `validateGraph`.
6. **`src/builder/data/templates.js`** — встроенные шаблоны.

---

## Модель (кратко)

Два типа связей:
- **DATA** — поток: trigger → agent → … → output (DAG, без циклов).
- **ATTACH** — способность: tool → agent (не шаг данных).

Порты по категориям (`KIND_PORTS`):

| kind | входы | выходы |
|------|-------|--------|
| trigger | — | DATA |
| agent | DATA + ATTACH | DATA |
| tool | — | ATTACH |
| output | DATA (required) | — |

Совместимость **выводится** из портов (`linkKind`). Матрицу руками НЕ пишем.

---

## Чек-лист: добавить новый тип узла

1. **Категория (`kind`).** Если узел вписывается в существующие (agent/tool/
   trigger/output) — используй их. Новый kind → СНАЧАЛА опиши порты в `KIND_PORTS`
   (`nodeCapabilities.js`) и продумай, какие связи он создаёт.
2. **Entry в `NODE_DEFS`** (`nodeTypes.js`): `kind`, `role`, `icon` (из реестра
   `Icon.jsx`, без эмодзи), `color`, `labelKey`, `descKey`, `atlasAnchor`.
3. **i18n** — добавь `labelKey` и `descKey` во ВСЕ локали (`src/locales/{ru,en,fi}/ui.json`)
   под `builder.node.*`. Без пропусков (lint проверяет).
4. **Палитра** — добавь id в нужную группу `TOOLBOX_GROUPS`, иначе узел не виден.
5. **Если новый kind** — продумай, какой React Flow nodeType (`KIND_TO_NODE_TYPE`)
   и хэндлы (`BaseNode.jsx`: showIn/showOut).
6. **Edge-функция** (`supabase/functions/builder-execute/`) — если узел исполняется,
   опиши его обработку (DATA-узел) либо как ATTACH-способность.
7. **Прогнать lint:** `npm run lint:builder` — должно быть «passed».
8. **Build:** `npm run build`.

## Чек-лист: добавить/изменить шаблон

1. Все `node.defId` — существующие ключи `NODE_DEFS`.
2. Связи — только допустимые: инструмент прикрепляется как `tool → agent`
   (НЕ `agent → tool`), поток данных идёт trigger → agent → output.
3. `npm run lint:builder` — обязателен (он симулирует каждую связь через
   `evaluateConnection`).

---

## Анти-паттерны (lint их ловит)

- `agent → tool` вместо `tool → agent` (инструмент = способность).
- Связь в `trigger` (у него нет входа).
- `output → *` (выход — тупик).
- `tool → tool`, `tool → output`.
- Цикл в DATA-потоке.
- def без i18n-ключа в какой-либо локали.
- def вне всех групп палитры (невидим).

---

## Outputs

- Обновлённые `nodeTypes.js` / `nodeCapabilities.js` / `templates.js` / локали.
- `npm run lint:builder` = passed, `npm run build` = ok.
- При смене модели/правил — обнови `docs/agent-builder/10-node-capability-model.md`
  и при необходимости запиши ADR (см. `skills/decision-recorder/`).

/**
 * nodeCapabilities.js — модель «портов и типов связей» для Builder.
 *
 * Зачем: чтобы система ПОНИМАЛА, какие узлы можно соединять, а какие конфликтуют,
 * а не проверяла только структуру (self/dup/cycle). Источник правды о семантике
 * связей. Читается движком connectionRules.js, палитрой и валидацией перед запуском.
 *
 * ── Два смысла связи ──────────────────────────────────────────────────────────
 *  • DATA   — поток данных: trigger → agent → … → output. Бегущий текст
 *             задачи/результата. Здесь действует DAG (циклы запрещены).
 *  • ATTACH — прикрепление способности: tool → agent. «Агент умеет искать /
 *             читать файл / видеть / помнить». НЕ шаг данных, в topo-порядок не
 *             входит, текст по нему не течёт.
 *
 * ── Порты по категориям (kind) ────────────────────────────────────────────────
 *  trigger: вход — нет;                 выход — DATA (∞, можно разветвить)
 *  agent:   вход — DATA (∞) + ATTACH;   выход — DATA (∞)
 *  tool:    вход — нет;                  выход — ATTACH (к агентам)
 *  output:  вход — DATA (≥1, required); выход — нет (тупик)
 *
 * Добавляя новый kind — допиши сюда порты, и матрица совместимости + валидация
 * пересоберутся автоматически (см. connectionRules.js).
 */

export const LINK = {
  DATA: 'data',
  ATTACH: 'attach',
};

/**
 * Порты на категорию узла. required на входе используется валидацией графа.
 */
export const KIND_PORTS = {
  trigger: {
    inputs: [],
    outputs: [{ type: LINK.DATA, max: Infinity }],
  },
  agent: {
    inputs: [
      { type: LINK.DATA, max: Infinity, required: false },
      { type: LINK.ATTACH, max: Infinity, required: false },
    ],
    outputs: [{ type: LINK.DATA, max: Infinity }],
  },
  tool: {
    inputs: [],
    outputs: [{ type: LINK.ATTACH, max: Infinity }],
  },
  output: {
    inputs: [{ type: LINK.DATA, max: Infinity, required: true }],
    outputs: [],
  },
  // logic — управляющие узлы (Condition и т.п.): вход DATA, выходы DATA по веткам
  // (true/false). Ветка кодируется в edge.sourceHandle, не отдельными портами в модели.
  logic: {
    inputs: [{ type: LINK.DATA, max: Infinity, required: false }],
    outputs: [{ type: LINK.DATA, max: Infinity }],
  },
};

/**
 * Тип связи между двумя категориями — выводится из портов.
 * tool→agent = ATTACH; trigger/agent → agent/output = DATA; иначе несовместимо (null).
 *
 * @returns {'data'|'attach'|null}
 */
export function linkKind(sourceKind, targetKind) {
  if (!sourceKind || !targetKind) return null;
  // Источник должен иметь выход, цель — совместимый вход.
  const out = KIND_PORTS[sourceKind]?.outputs || [];
  const ins = KIND_PORTS[targetKind]?.inputs || [];
  for (const o of out) {
    if (ins.some(i => i.type === o.type)) return o.type;
  }
  return null;
}

/**
 * Может ли узел этой категории быть стартовым (источником без входа данных).
 */
export function isEntryKind(kind) {
  const ins = KIND_PORTS[kind]?.inputs || [];
  return !ins.some(i => i.type === LINK.DATA);
}

/**
 * Является ли категория «тупиком» (нет выходов вообще).
 */
export function isSinkKind(kind) {
  return (KIND_PORTS[kind]?.outputs || []).length === 0;
}

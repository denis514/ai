/**
 * connectionRules.js — движок совместимости узлов Builder.
 *
 * Чистые функции, без побочных эффектов. Используются в трёх местах:
 *  1. isValidConnection (live-проверка перед созданием связи)
 *  2. подсветка валидных целей при перетягивании (фаза 2)
 *  3. validateGraph — проверка схемы перед реальным запуском (C1)
 *
 * Семантика — из nodeCapabilities.js (порты + типы связей DATA/ATTACH).
 */

import { LINK, linkKind, isEntryKind, isSinkKind, KIND_PORTS } from '../data/nodeCapabilities.js';

const deny = (code) => ({ ok: false, code });
const allow = (linkType) => ({ ok: true, linkType });

/**
 * Можно ли соединить source → target (направление = родитель → ребёнок).
 *
 * @param {object} p
 * @param {string} p.source       — id узла-источника
 * @param {string} p.target       — id узла-цели
 * @param {Record<string,string>} p.nodeKind — id → kind ('agent'|'tool'|'trigger'|'output')
 * @param {Array<{source:string,target:string}>} p.edges — текущие связи
 * @returns {{ok:boolean, code?:string, linkType?:string}}
 */
export function evaluateConnection({ source, target, nodeKind, edges = [] }) {
  if (!source || !target) return deny('unknown');
  if (source === target) return deny('self');

  const sk = nodeKind[source];
  const tk = nodeKind[target];
  const lk = linkKind(sk, tk);
  if (!lk) return deny('incompatible');

  // Дубликат (та же пара в том же направлении).
  if (edges.some(e => e.source === source && e.target === target)) return deny('duplicate');

  // Цикл — только для DATA-потока (ATTACH в topo не участвует).
  if (lk === LINK.DATA && createsDataCycle(source, target, edges, nodeKind)) {
    return deny('cycle');
  }
  return allow(lk);
}

/**
 * Достижим ли source из target по существующим DATA-связям (т.е. новая связь
 * source→target замкнула бы петлю).
 */
function createsDataCycle(source, target, edges, nodeKind) {
  const adj = new Map();
  for (const e of edges) {
    if (linkKind(nodeKind[e.source], nodeKind[e.target]) !== LINK.DATA) continue;
    if (!adj.has(e.source)) adj.set(e.source, []);
    adj.get(e.source).push(e.target);
  }
  const seen = new Set();
  const stack = [target];
  while (stack.length) {
    const cur = stack.pop();
    if (cur === source) return true;
    if (seen.has(cur)) continue;
    seen.add(cur);
    for (const nx of adj.get(cur) || []) stack.push(nx);
  }
  return false;
}

/**
 * Человекочитаемый код причины отказа → i18n-ключ.
 */
export function denyReasonKey(code) {
  return `builder.connect.deny.${code}`;
}

/**
 * Проверка всей схемы перед РЕАЛЬНЫМ запуском.
 * errors блокируют запуск; warnings допускают «запустить всё равно».
 *
 * Формат совместим с модалкой валидации в BuilderApp:
 *   { errors: string[], warnings: Array<{type, count?}> }
 */
export function validateGraph(nodes = [], edges = []) {
  const errors = [];
  const warnings = [];
  const nodeKind = Object.fromEntries(nodes.map(n => [n.id, n.data?.kind]));

  const agents = nodes.filter(n => n.data?.kind === 'agent');
  if (agents.length === 0) errors.push('no-agent');

  if (nodes.length <= 1) return { errors, warnings };

  // Разбиваем связи на DATA и ATTACH.
  const dataIn = new Set();
  const dataOut = new Set();
  const attachTargets = new Set(); // агенты, к которым прикреплён инструмент
  const attachSources = new Set(); // инструменты, которые куда-то прикреплены
  for (const e of edges) {
    const lk = linkKind(nodeKind[e.source], nodeKind[e.target]);
    if (lk === LINK.DATA) { dataOut.add(e.source); dataIn.add(e.target); }
    else if (lk === LINK.ATTACH) { attachSources.add(e.source); attachTargets.add(e.target); }
  }

  // Изолированные узлы — без единой связи любого типа.
  const isolated = nodes.filter(n =>
    !dataIn.has(n.id) && !dataOut.has(n.id) &&
    !attachTargets.has(n.id) && !attachSources.has(n.id)
  );
  if (isolated.length) warnings.push({ type: 'isolated', count: isolated.length });

  // Несколько триггеров.
  const triggers = nodes.filter(n => n.data?.kind === 'trigger');
  if (triggers.length > 1) warnings.push({ type: 'multi-trigger', count: triggers.length });

  // Output без входящих данных.
  const emptyOutputs = nodes.filter(n => isSinkKind(n.data?.kind) && !dataIn.has(n.id));
  if (emptyOutputs.length) warnings.push({ type: 'output-empty', count: emptyOutputs.length });

  // Инструмент, ни к чему не прикреплённый (бесполезен в запуске).
  const looseTools = nodes.filter(n => n.data?.kind === 'tool' && !attachSources.has(n.id));
  if (looseTools.length) warnings.push({ type: 'tool-unattached', count: looseTools.length });

  return { errors, warnings };
}

/**
 * Для палитры/подсветки: какие категории-цели валидны от данной категории.
 * @returns {Set<string>} набор target-kind
 */
export function validTargetKinds(sourceKind) {
  const out = new Set();
  for (const tk of Object.keys(KIND_PORTS)) {
    if (linkKind(sourceKind, tk)) out.add(tk);
  }
  return out;
}

/**
 * Может ли категория быть стартовой (re-export для удобства потребителей).
 */
export { isEntryKind };

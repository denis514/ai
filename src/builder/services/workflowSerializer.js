/**
 * workflowSerializer.js — конвертеры между React Flow runtime-форматом и
 * persistence-форматами (Supabase rows / localStorage JSON).
 *
 * Принцип: React Flow node.data почти полностью восстановим из NODE_DEFS по
 * defId (icon/color/labelKey/descKey/atlasAnchor/kind/role — всё из def).
 * Поэтому в storage мы храним МИНИМУМ: defId + position + client id + config
 * (любые пользовательские overrides поверх def-дефолтов). `status` — runtime,
 * не персистится.
 *
 * Round-trip identity: deserialize(serialize(x)) даёт эквивалентный canvas
 * (с точностью до runtime-полей status, которые сбрасываются в 'idle').
 *
 * Используется в workflowStorage.js. Pure-функции, без побочных эффектов —
 * тестируемо в изоляции.
 */

import { getNodeDef, KIND_TO_NODE_TYPE } from '../data/nodeTypes.js';

// Поля node.data, которые ВЫЧИСЛЯЮТСЯ из def (не храним — рехидрируем).
const DERIVED_DATA_KEYS = new Set([
  'icon', 'color', 'labelKey', 'descKey', 'atlasAnchor', 'kind', 'role',
]);
// Runtime-поля, которые НЕ персистим.
const RUNTIME_DATA_KEYS = new Set(['status']);

/**
 * Извлекает config (пользовательские overrides) из node.data:
 * всё, что НЕ derived и НЕ runtime и НЕ defId.
 */
function extractConfig(data = {}) {
  const config = {};
  for (const [k, v] of Object.entries(data)) {
    if (k === 'defId') continue;
    if (DERIVED_DATA_KEYS.has(k)) continue;
    if (RUNTIME_DATA_KEYS.has(k)) continue;
    config[k] = v;
  }
  return config;
}

/**
 * Рехидрирует React Flow node.data из defId + config.
 */
function hydrateData(defId, config = {}) {
  const def = getNodeDef(defId);
  if (!def) {
    // Граничный случай: def удалён/переименован. Сохраняем что можем.
    return { defId, status: 'idle', ...config };
  }
  return {
    defId,
    icon: def.icon,
    color: def.color,
    labelKey: def.labelKey,
    descKey: def.descKey,
    atlasAnchor: def.atlasAnchor,
    kind: def.kind,
    role: def.role,
    status: 'idle',
    ...config, // overrides поверх def-дефолтов
  };
}

// ─── DB format (Supabase rows) ──────────────────────────────────────────────

/**
 * React Flow nodes/edges → массивы строк для builder_workflow_nodes/_edges.
 * Не включает workflow_id (проставляется в storage-слое при insert).
 *
 * @returns {{ nodes: Array, edges: Array }}
 */
export function serializeForDb(rfNodes = [], rfEdges = []) {
  const nodes = rfNodes.map(n => {
    const defId = n.data?.defId;
    const def = getNodeDef(defId);
    return {
      client_id: n.id,
      node_type: def?.kind || n.data?.kind || 'agent',
      role: def?.role || n.data?.role || null,
      def_id: defId,
      position_x: n.position?.x ?? 0,
      position_y: n.position?.y ?? 0,
      config: extractConfig(n.data),
    };
  });

  const edges = rfEdges.map(e => ({
    client_id: e.id,
    source_client_id: e.source,
    target_client_id: e.target,
    label: e.label || null,
    config: {
      ...(e.animated != null ? { animated: e.animated } : {}),
    },
  }));

  return { nodes, edges };
}

/**
 * Строки builder_workflow_nodes/_edges → React Flow nodes/edges.
 *
 * @param {Array} dbNodes
 * @param {Array} dbEdges
 * @param {object} edgeStyle — стиль рёбер (передаётся из BuilderApp EDGE_STYLE)
 * @returns {{ nodes: Array, edges: Array }}
 */
export function deserializeFromDb(dbNodes = [], dbEdges = [], edgeStyle = undefined) {
  const nodes = dbNodes.map(row => {
    const defId = row.def_id;
    const def = getNodeDef(defId);
    return {
      id: row.client_id,
      type: (def && KIND_TO_NODE_TYPE[def.kind]) || 'agentNode',
      position: { x: row.position_x ?? 0, y: row.position_y ?? 0 },
      data: hydrateData(defId, row.config || {}),
    };
  });

  const edges = dbEdges.map(row => ({
    id: row.client_id,
    source: row.source_client_id,
    target: row.target_client_id,
    type: 'builder',
    ...(row.label ? { label: row.label } : {}),
  }));

  return { nodes, edges };
}

// ─── localStorage format (plain JSON) ────────────────────────────────────────

/**
 * Компактный JSON-снимок для localStorage (анонимные пользователи).
 * Тот же минимализм, что и DB-формат, но в одном объекте.
 */
export function serializeForLocal(rfNodes = [], rfEdges = []) {
  const { nodes, edges } = serializeForDb(rfNodes, rfEdges);
  return { nodes, edges };
}

/**
 * Восстановление из localStorage-снимка.
 */
export function deserializeFromLocal(snapshot = {}, edgeStyle = undefined) {
  return deserializeFromDb(snapshot.nodes || [], snapshot.edges || [], edgeStyle);
}

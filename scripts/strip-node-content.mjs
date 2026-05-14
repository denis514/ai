// Regenerates src/data/mindmapData.js with structural-only nodes
// (no title, no details). Walks the current tree, outputs a clean JS file.
//
// Usage: node scripts/strip-node-content.mjs

import { mindmapData, CATEGORIES, FILTER_CATEGORIES } from '../src/data/mindmapData.js';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FILE = resolve(__dirname, '../src/data/mindmapData.js');

// Поля узла, которые остаются в data-файле (структура).
const KEEP = ['id', 'icon', 'category', 'minLevel', 'isRoot', 'relatedIds', 'children'];

function ind(n) { return '  '.repeat(n); }

function js(value, depth) {
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const parts = value.map(v => ind(depth + 1) + js(v, depth + 1));
    return '[\n' + parts.join(',\n') + '\n' + ind(depth) + ']';
  }
  if (value && typeof value === 'object') {
    const keys = Object.keys(value).filter(k => KEEP.includes(k));
    if (keys.length === 0) return '{}';
    const parts = keys.map(k => {
      const v = value[k];
      return ind(depth + 1) + JSON.stringify(k) + ': ' + js(v, depth + 1);
    });
    return '{\n' + parts.join(',\n') + '\n' + ind(depth) + '}';
  }
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'boolean' || typeof value === 'number' || value === null) return JSON.stringify(value);
  return JSON.stringify(value);
}

function pickStructure(node) {
  const out = {};
  for (const k of KEEP) {
    if (node[k] === undefined) continue;
    if (k === 'children' && Array.isArray(node.children)) {
      out.children = node.children.map(pickStructure);
    } else {
      out[k] = node[k];
    }
  }
  return out;
}

const structure = pickStructure(mindmapData);

const header = `// Структура mindmap: id, icon, category, children, relatedIds, minLevel, isRoot.
// Текстовый контент (title + details) — в src/locales/<lang>/nodes.json.
// Резолвинг через t() / useNodeContent() из src/i18n/.

export const CATEGORIES = ${JSON.stringify(CATEGORIES, null, 2)};

export const FILTER_CATEGORIES = ${JSON.stringify(FILTER_CATEGORIES, null, 2)};

export const mindmapData = ${js(structure, 0)};

/**
 * Плоский индекс id → узел (структура).
 */
function buildNodeIndex(root, acc = {}) {
  acc[root.id] = root;
  if (root.children) for (const c of root.children) buildNodeIndex(c, acc);
  return acc;
}
export const nodeIndex = buildNodeIndex(mindmapData);

/**
 * Двусторонний индекс связей.
 */
function buildRelatedIndex() {
  const map = {};
  for (const id of Object.keys(nodeIndex)) map[id] = new Set();
  for (const id of Object.keys(nodeIndex)) {
    const node = nodeIndex[id];
    const related = node.relatedIds || [];
    for (const otherId of related) {
      if (otherId === id) continue;
      if (!nodeIndex[otherId]) continue;
      map[id].add(otherId);
      map[otherId].add(id);
    }
  }
  const out = {};
  for (const [id, set] of Object.entries(map)) {
    if (set.size > 0) out[id] = Array.from(set);
  }
  return out;
}
export const relatedIndex = buildRelatedIndex();

export function getRelatedNodes(id) {
  const ids = relatedIndex[id] || [];
  return ids.map(rid => nodeIndex[rid]).filter(Boolean);
}
`;

writeFileSync(FILE, header, 'utf8');
console.log(`✓ Regenerated ${FILE} (structure-only)`);

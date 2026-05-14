import { useMemo } from 'react';

const LEVEL_GAP_X = 320;
const LEAF_HEIGHT  = 92;
const ROOT_OFFSET  = 0;

// Главные ветки распределяем: первые N — справа, остальные — слева
const RIGHT_BRANCHES = 6;

// Считаем «листья» поддерева — определяет вертикальное место.
function countLeaves(node, isExpanded) {
  if (!node.children || !node.children.length || !isExpanded(node.id)) {
    return 1;
  }
  return node.children.reduce((sum, c) => sum + countLeaves(c, isExpanded), 0);
}

// Назначаем координаты: x растёт по уровню, y — стек листьев.
function placeSubtree(node, x, y, side, isExpanded, positions) {
  positions[node.id] = { x, y, side };
  if (!node.children || !node.children.length || !isExpanded(node.id)) return;

  const totalLeaves = countLeaves(node, isExpanded);
  const totalHeight = totalLeaves * LEAF_HEIGHT;
  let cursor = y - totalHeight / 2;

  for (const child of node.children) {
    const cl = countLeaves(child, isExpanded);
    const childCenter = cursor + (cl * LEAF_HEIGHT) / 2;
    const childX = x + side * LEVEL_GAP_X;
    placeSubtree(child, childX, childCenter, side, isExpanded, positions);
    cursor += cl * LEAF_HEIGHT;
  }
}

// Рут разводим на 2 стороны — это специальный случай.
function placeRoot(root, isExpanded) {
  const positions = {};
  positions[root.id] = { x: 0, y: ROOT_OFFSET, side: 0 };

  if (!root.children || !isExpanded(root.id)) return positions;

  const right = root.children.slice(0, RIGHT_BRANCHES);
  const left  = root.children.slice(RIGHT_BRANCHES);

  // Правая сторона
  const rightLeaves = right.reduce((s, c) => s + countLeaves(c, isExpanded), 0);
  const rightHeight = rightLeaves * LEAF_HEIGHT;
  let rCursor = ROOT_OFFSET - rightHeight / 2;
  for (const child of right) {
    const cl = countLeaves(child, isExpanded);
    const center = rCursor + (cl * LEAF_HEIGHT) / 2;
    placeSubtree(child, LEVEL_GAP_X, center, 1, isExpanded, positions);
    rCursor += cl * LEAF_HEIGHT;
  }

  // Левая сторона
  const leftLeaves = left.reduce((s, c) => s + countLeaves(c, isExpanded), 0);
  const leftHeight = leftLeaves * LEAF_HEIGHT;
  let lCursor = ROOT_OFFSET - leftHeight / 2;
  for (const child of left) {
    const cl = countLeaves(child, isExpanded);
    const center = lCursor + (cl * LEAF_HEIGHT) / 2;
    placeSubtree(child, -LEVEL_GAP_X, center, -1, isExpanded, positions);
    lCursor += cl * LEAF_HEIGHT;
  }

  return positions;
}

// Собираем плоский список видимых узлов и связей.
function flatten(root, isExpanded, positions) {
  const nodes = [];
  const edges = [];

  function walk(node, parent, depth) {
    const pos = positions[node.id];
    if (!pos) return;
    nodes.push({ node, pos, depth });

    if (parent) {
      const a = positions[parent.id];
      const b = pos;
      edges.push({
        id: `${parent.id}::${node.id}`,
        fromId: parent.id,
        toId: node.id,
        from: a, to: b,
        side: b.side,
        depth
      });
    }

    if (node.children && isExpanded(node.id)) {
      for (const child of node.children) {
        walk(child, node, depth + 1);
      }
    }
  }

  walk(root, null, 0);
  return { nodes, edges };
}

export function useMindmapLayout(root, expandedIds) {
  return useMemo(() => {
    const isExpanded = (id) => expandedIds.has(id);
    const positions = placeRoot(root, isExpanded);
    const { nodes, edges } = flatten(root, isExpanded, positions);

    // bounding box — пригодится для fit-to-screen
    let minX = 0, maxX = 0, minY = 0, maxY = 0;
    for (const { pos } of nodes) {
      minX = Math.min(minX, pos.x);
      maxX = Math.max(maxX, pos.x);
      minY = Math.min(minY, pos.y);
      maxY = Math.max(maxY, pos.y);
    }
    return {
      nodes,
      edges,
      bounds: { minX, maxX, minY, maxY }
    };
  }, [root, expandedIds]);
}

export const LAYOUT_CONSTANTS = { LEVEL_GAP_X, LEAF_HEIGHT };

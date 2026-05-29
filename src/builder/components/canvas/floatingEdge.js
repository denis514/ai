import { Position } from 'reactflow';

/**
 * floatingEdge.js — геометрия «плавающих» связей.
 *
 * Связь не привязана к конкретному хэндлу: её концы автоматически встают на ту
 * сторону узла, которая обращена к соседу. Поэтому линия не «прыгает» на
 * дефолтный коннектор при перемещении узлов — она всегда соединяет ближайшие
 * грани (низ верхнего узла ↔ верх нижнего и т.п.).
 *
 * Адаптировано из официального примера React Flow «Floating Edges».
 */

function center(node) {
  const p = node.positionAbsolute || node.position || { x: 0, y: 0 };
  const w = node.width || 0;
  const h = node.height || 0;
  return { x: p.x, y: p.y, w, h, cx: p.x + w / 2, cy: p.y + h / 2 };
}

// Точка пересечения границы узла `node` с линией к центру `other`.
function nodeIntersection(node, other) {
  const n = center(node);
  const o = center(other);
  const w = n.w / 2;
  const h = n.h / 2;
  if (!w || !h) return { x: n.cx, y: n.cy };
  const x2 = n.cx;
  const y2 = n.cy;
  const x1 = o.cx;
  const y1 = o.cy;
  const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h);
  const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h);
  const a = 1 / (Math.abs(xx1) + Math.abs(yy1) || 1);
  const xx3 = a * xx1;
  const yy3 = a * yy1;
  const x = w * (xx3 + yy3) + x2;
  const y = h * (-xx3 + yy3) + y2;
  return { x, y };
}

// На какой грани узла лежит точка пересечения → Position для изгиба безье.
function edgePosition(node, point) {
  const n = center(node);
  const nx = Math.round(n.x);
  const ny = Math.round(n.y);
  const px = Math.round(point.x);
  const py = Math.round(point.y);
  if (px <= nx + 1) return Position.Left;
  if (px >= nx + n.w - 1) return Position.Right;
  if (py <= ny + 1) return Position.Top;
  if (py >= ny + n.h - 1) return Position.Bottom;
  return Position.Top;
}

/**
 * Параметры плавающей связи между двумя узлами.
 * @returns {{sx,sy,tx,ty,sourcePos,targetPos}|null} null, если размеры ещё не
 *          измерены (узел только что добавлен) — тогда падаем на хэндл-геометрию.
 */
export function getFloatingEdgeParams(source, target) {
  if (!source || !target) return null;
  if (!source.width || !source.height || !target.width || !target.height) return null;
  const sp = nodeIntersection(source, target);
  const tp = nodeIntersection(target, source);
  return {
    sx: sp.x, sy: sp.y,
    tx: tp.x, ty: tp.y,
    sourcePos: edgePosition(source, sp),
    targetPos: edgePosition(target, tp),
  };
}

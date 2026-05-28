import React from 'react';
import { getBezierPath, useStore } from 'reactflow';

/**
 * BuilderEdge — кастомная связь между узлами.
 *
 *  • Без стрелки.
 *  • Градиент: от цвета источника к цвету цели (показывает «откуда → куда»).
 *  • Пунктир с анимацией, текущей в сторону цели — видно направление потока.
 *
 * Цвета берём из текущих узлов (store), поэтому связь сама подхватывает цвет,
 * даже если узел перекрасили/продублировали.
 */
export default function BuilderEdge({
  id, source, target,
  sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
}) {
  const [path] = getBezierPath({
    sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition,
  });

  const sColor = useStore(s => s.nodeInternals.get(source)?.data?.color) || '#94a3b8';
  const tColor = useStore(s => s.nodeInternals.get(target)?.data?.color) || sColor;
  const gid = `builder-edge-grad-${id}`;

  return (
    <>
      <defs>
        <linearGradient
          id={gid}
          gradientUnits="userSpaceOnUse"
          x1={sourceX} y1={sourceY} x2={targetX} y2={targetY}
        >
          <stop offset="0%" stopColor={sColor} />
          <stop offset="100%" stopColor={tColor} />
        </linearGradient>
      </defs>
      <path
        id={id}
        className="builder-edge__path react-flow__edge-path"
        d={path}
        fill="none"
        style={{ stroke: `url(#${gid})` }}
      />
    </>
  );
}

import React, { useState } from 'react';
import { getBezierPath, useStore, useReactFlow, EdgeLabelRenderer } from 'reactflow';
import Icon from '../../../components/Icon.jsx';
import { historyBridge } from '../../services/historyBridge.js';

/**
 * BuilderEdge — кастомная связь.
 *
 *  • Без стрелки.
 *  • Градиент: цвет источника → цвет цели.
 *  • Пунктир с анимацией, текущей ВСЕГДА от родителя (source) к цели —
 *    независимо от того, с какой стороны подключены порты.
 *  • На hover — красный кружок с иконкой «разъединить»; клик удаляет связь,
 *    узлы остаются.
 */
export default function BuilderEdge({
  id, source, target,
  sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
}) {
  const { setEdges } = useReactFlow();
  const [hovered, setHovered] = useState(false);
  const [btnHover, setBtnHover] = useState(false);

  const [path, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition,
  });

  const sColor = useStore(s => s.nodeInternals.get(source)?.data?.color) || '#94a3b8';
  const tColor = useStore(s => s.nodeInternals.get(target)?.data?.color) || sColor;
  const gid = `builder-edge-grad-${id}`;

  const unlink = (e) => {
    e.stopPropagation();
    historyBridge.push?.();
    setEdges(eds => eds.filter(ed => ed.id !== id));
  };

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

      {/* Видимая связь */}
      <path
        id={id}
        className="builder-edge__path react-flow__edge-path"
        d={path}
        fill="none"
        style={{ stroke: `url(#${gid})` }}
      />
      {/* Невидимая широкая дорожка — ловит наведение для кнопки */}
      <path
        d={path}
        fill="none"
        strokeWidth={18}
        stroke="transparent"
        style={{ cursor: 'pointer' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />

      {hovered && (
        <EdgeLabelRenderer>
          <div
            className="builder-edge__unlink"
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
            onMouseEnter={() => { setHovered(true); setBtnHover(true); }}
            onMouseLeave={() => { setHovered(false); setBtnHover(false); }}
            onClick={unlink}
            role="button"
            title="Unlink"
          >
            <Icon name={btnHover ? 'unlink' : 'link'} size={12} strokeWidth={2} />
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

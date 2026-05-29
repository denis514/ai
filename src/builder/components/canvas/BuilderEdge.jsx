import React, { useState, useRef } from 'react';
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

  // Grace-таймаут: кнопка «разъединить» не должна мгновенно прятаться, когда
  // курсор перескакивает с тонкой линии на кружок (иначе её трудно поймать).
  const hideTimer = useRef(null);
  const show = () => {
    if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; }
    setHovered(true);
  };
  const scheduleHide = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setHovered(false), 160);
  };

  const [path, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition,
  });

  const sColor = useStore(s => s.nodeInternals.get(source)?.data?.color) || '#94a3b8';
  const tColor = useStore(s => s.nodeInternals.get(target)?.data?.color) || sColor;
  // Тип связи: ATTACH (инструмент → агент) рисуем иначе, чем поток данных (DATA),
  // чтобы пользователь видел разницу. Анимация в обоих случаях «бежит» от
  // источника (родителя) к цели — направление = откуда тянули линию.
  const sKind = useStore(s => s.nodeInternals.get(source)?.data?.kind);
  const tKind = useStore(s => s.nodeInternals.get(target)?.data?.kind);
  const isAttach = sKind === 'tool' && tKind === 'agent';
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

      {/* Видимая связь. Модификатор --attach для прикрепления инструмента. */}
      <path
        id={id}
        className={`builder-edge__path react-flow__edge-path${isAttach ? ' builder-edge__path--attach' : ' builder-edge__path--data'}`}
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
        onMouseEnter={show}
        onMouseLeave={scheduleHide}
      />

      {hovered && (
        <EdgeLabelRenderer>
          <div
            className="builder-edge__unlink"
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
            onMouseEnter={() => { show(); setBtnHover(true); }}
            onMouseLeave={() => { scheduleHide(); setBtnHover(false); }}
            onClick={unlink}
            role="button"
            aria-label="Разъединить связь"
            title="Разъединить связь"
          >
            <Icon name={btnHover ? 'unlink' : 'link'} size={12} strokeWidth={2} />
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

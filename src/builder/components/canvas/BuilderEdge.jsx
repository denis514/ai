import React, { useState, useRef } from 'react';
import { getBezierPath, useStore, useReactFlow, EdgeLabelRenderer } from 'reactflow';
import Icon from '../../../components/Icon.jsx';
import { historyBridge } from '../../services/historyBridge.js';
import { getFloatingEdgeParams } from './floatingEdge.js';

const BRANCH_COLOR = { true: '#16a34a', false: '#dc2626' };
const BRANCH_LABEL = { true: 'Да', false: 'Нет' };

/**
 * BuilderEdge — кастомная связь.
 *
 *  • Без стрелки.
 *  • Градиент: цвет источника → цвет цели.
 *  • Пунктир с анимацией, текущей ВСЕГДА от источника (откуда тянули) к цели.
 *  • «Плавающие» концы: точки подключения сами встают на грани узлов, обращённые
 *    друг к другу — линия не «прыгает» на фиксированный коннектор при перемещении.
 *  • На hover — красный кружок с иконкой «разъединить»; клик удаляет связь,
 *    узлы остаются.
 */
export default function BuilderEdge({
  id, source, target,
  sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  sourceHandleId,
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

  // Узлы из стора — для цвета и плавающей геометрии.
  const sourceNode = useStore(s => s.nodeInternals.get(source));
  const targetNode = useStore(s => s.nodeInternals.get(target));

  // Связь из «Условия»: ветка кодируется хэндлом 'true'/'false' (для цвета и
  // подписи). Геометрия — плавающая, как у всех связей (концы «крутятся» вокруг
  // узла при перемещении). Зелёная точка = Да, красная = Нет.
  const branch = (sourceNode?.data?.kind === 'logic' && (sourceHandleId === 'true' || sourceHandleId === 'false'))
    ? sourceHandleId : null;

  // Плавающие концы (грань, обращённая к соседу). Пока размеры не измерены —
  // падаем на хэндл-координаты из props.
  const floating = getFloatingEdgeParams(sourceNode, targetNode);
  const sx = floating ? floating.sx : sourceX;
  const sy = floating ? floating.sy : sourceY;
  const tx = floating ? floating.tx : targetX;
  const ty = floating ? floating.ty : targetY;
  const sPos = floating ? floating.sourcePos : sourcePosition;
  const tPos = floating ? floating.targetPos : targetPosition;

  const [path, labelX, labelY] = getBezierPath({
    sourceX: sx, sourceY: sy, sourcePosition: sPos,
    targetX: tx, targetY: ty, targetPosition: tPos,
  });

  const sColor = sourceNode?.data?.color || '#94a3b8';
  const tColor = targetNode?.data?.color || sColor;
  const gid = `builder-edge-grad-${id}`;
  // Цвет линии: ветка Да = зелёный, Нет = красный; иначе градиент источник→цель.
  const stroke = branch ? BRANCH_COLOR[branch] : `url(#${gid})`;

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
          x1={sx} y1={sy} x2={tx} y2={ty}
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
        style={{ stroke }}
      />

      {/* Подпись ветки ПРЯМО НА ЛИНИИ (середина) — следует за линией при
          перемещении узлов. Чуть выше центра, чтобы не накрывать кнопку «разъединить». */}
      {branch && !hovered && (
        <EdgeLabelRenderer>
          <div
            className={`builder-edge__branch builder-edge__branch--${branch}`}
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
          >
            {BRANCH_LABEL[branch]}
          </div>
        </EdgeLabelRenderer>
      )}
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

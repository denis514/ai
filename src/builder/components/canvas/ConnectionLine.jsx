import React from 'react';

/**
 * ConnectionLine — кастомная линия, которую видно во время перетаскивания связи.
 *
 * React Flow передаёт координаты начала (fromX/Y) и текущего курсора (toX/Y).
 * Рисуем:
 *  • анимированную пунктирную кривую (эффект «течения вперёд»);
 *  • на конце (у курсора) — кружок со стрелкой, показывающий, куда тянем.
 *
 * Поток только вперёд: начало всегда из source-порта (React Flow это гарантирует —
 * перетаскивание стартует только с выходной точки).
 */
export default function ConnectionLine({ fromX, fromY, toX, toY }) {
  // Плавная вертикальная кривая (как у edges по умолчанию).
  const midY = (fromY + toY) / 2;
  const d = `M${fromX},${fromY} C ${fromX},${midY} ${toX},${midY} ${toX},${toY}`;

  return (
    <g className="builder-conn-line">
      <path className="builder-conn-line__path" d={d} fill="none" />
      <circle className="builder-conn-line__end" cx={toX} cy={toY} r={9} />
      {/* Стрелка внутри кружка — указывает «вперёд» (вниз к цели) */}
      <path
        className="builder-conn-line__arrow"
        d={`M${toX - 3},${toY - 1} L${toX},${toY + 3} L${toX + 3},${toY - 1}`}
        fill="none"
      />
    </g>
  );
}

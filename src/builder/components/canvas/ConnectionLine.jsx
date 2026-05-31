import React from 'react';

/**
 * ConnectionLine — линия, видимая во время перетаскивания связи.
 *
 *  • Цвет = цвет исходного узла (fromNode.data.color).
 *  • Анимированный пунктир «течёт вперёд».
 *  • На конце (у курсора) — кружок со стрелкой; стрелка направлена в ту сторону,
 *    с которой тянем (верх/низ/лево/право — по fromPosition).
 *  • Толщина в единицах потока → масштабируется с зумом автоматически.
 *
 * Поток только вперёд (React Flow стартует тягу только с source-порта).
 */
const ARROW_ROTATION = { top: 0, bottom: 180, left: 270, right: 90 };
const BRANCH_COLOR = { true: '#16a34a', false: '#dc2626' };
const BRANCH_LABEL = { true: 'Да', false: 'Нет' };

export default function ConnectionLine({ fromX, fromY, toX, toY, fromPosition, fromNode, fromHandle }) {
  // Тянем из «Условия» по ветке Да/Нет → красим линию и показываем слово на ней.
  const branch = (fromNode?.data?.kind === 'logic' && (fromHandle?.id === 'true' || fromHandle?.id === 'false'))
    ? fromHandle.id : null;
  const color = branch ? BRANCH_COLOR[branch] : (fromNode?.data?.color || '#2563eb');
  const midY = (fromY + toY) / 2;
  const d = `M${fromX},${fromY} C ${fromX},${midY} ${toX},${midY} ${toX},${toY}`;
  const deg = ARROW_ROTATION[fromPosition] ?? 0;
  const mx = (fromX + toX) / 2;
  const my = (fromY + toY) / 2;

  return (
    <g className="builder-conn-line">
      <path className="builder-conn-line__path" d={d} fill="none" style={{ stroke: color }} />
      <circle className="builder-conn-line__end" cx={toX} cy={toY} r={9} style={{ fill: color }} />
      {/* Стрелка-шеврон, повёрнутая по направлению тяги (вверх = базовая) */}
      <path
        className="builder-conn-line__arrow"
        d={`M${toX - 3},${toY + 2} L${toX},${toY - 3} L${toX + 3},${toY + 2}`}
        fill="none"
        transform={`rotate(${deg} ${toX} ${toY})`}
      />
      {/* Слово ветки прямо на линии во время перетаскивания */}
      {branch && (
        <g>
          <rect x={mx - 17} y={my - 11} width={34} height={20} rx={10} fill={color} />
          <text x={mx} y={my + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">
            {BRANCH_LABEL[branch]}
          </text>
        </g>
      )}
    </g>
  );
}

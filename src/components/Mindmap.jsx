import React, { useImperativeHandle, useRef, forwardRef, useEffect } from 'react';
import MindmapNode from './MindmapNode.jsx';
import { useMindmapLayout } from '../hooks/useMindmapLayout.js';
import { usePanZoom } from '../hooks/usePanZoom.js';

// Приблизительные half-width узлов по depth — для подгонки концов линий к границе узла.
// Без этого линии идут от центра к центру и «врезаются» в узлы на разную глубину.
// Точные значения через DOM-замер потребовали бы доп. рендера — здесь компромисс.
// Должно быть ≤ половины самого УЗКОГО узла на каждом уровне.
// Иначе появляется gap между концом линии и узлом ("узел съезжает от линии").
// Замеры: layer min = 78 (Systems), branches ~ 70-180.
function nodeHalfWidth(depth) {
  if (depth === 0) return 32;   // root (64px fixed diameter)
  if (depth === 1) return 75;   // layer nodes (min Systems=78)
  return 65;                     // обычные узлы (consistent margin)
}

function buildEdgePath(from, to, depthFrom, depthTo) {
  // Endpoint у границы узла со стороны линии, не у центра.
  // Направление: line идёт от from к to, значит, on from-side прижимаем к стороне TO, и наоборот.
  const dir = Math.sign(to.x - from.x);  // +1 = to справа, -1 = to слева
  const fromX = from.x + dir * nodeHalfWidth(depthFrom);
  const toX   = to.x   - dir * nodeHalfWidth(depthTo);

  // Гладкая безье — bend mid-point
  const dx = (toX - fromX);
  const cx1 = fromX + dx * 0.5;
  const cx2 = toX   - dx * 0.5;
  return `M ${fromX} ${from.y} C ${cx1} ${from.y}, ${cx2} ${to.y}, ${toX} ${to.y}`;
}

const Mindmap = forwardRef(function Mindmap(
  { root, expandedIds, selectedId, matchedIds, searchActive, onToggle, onSelect, tutorialState, nodeStatusOf, isBookmarkedNode, isNewNode, newTypeOf, hasNewInside },
  ref
) {
  const containerRef = useRef(null);
  const { nodes, edges, bounds } = useMindmapLayout(root, expandedIds);
  const { transform, isAnimating, handlers, zoomIn, zoomOut, reset, fitToScreen, panTo, MIN_ZOOM, MAX_ZOOM } =
    usePanZoom(containerRef);

  useImperativeHandle(ref, () => ({
    zoomIn, zoomOut, reset,
    fitToScreen: (padding) => fitToScreen(bounds, padding),
    zoom: transform.k,
    minZoom: MIN_ZOOM,
    maxZoom: MAX_ZOOM,
    /**
     * Плавно перемещает канвас так, чтобы узел с данным id оказался по центру.
     * @param {string} nodeId
     * @param {{ xOffset?: number, yOffset?: number, duration?: number }} [opts]
     * @returns {boolean} true если узел найден в текущем layout
     */
    panToNode: (nodeId, opts) => {
      const entry = nodes.find(n => n.node.id === nodeId);
      if (!entry) return false;
      panTo(entry.pos.x, entry.pos.y, opts);
      return true;
    }
  }), [zoomIn, zoomOut, reset, fitToScreen, bounds, transform.k, MIN_ZOOM, MAX_ZOOM, nodes, panTo]);

  // По умолчанию НЕ делаем авто-fit: первый экран = 100% зум, root по центру.
  // Это согласовано с initial expandedIds={root} в App.jsx — на старте видна
  // только корневая нода, и зум не «уплывает» в 25%, как при fitToScreen.
  // Пользователь может явно нажать «Вписать» в зум-панели.

  return (
    <div
      ref={containerRef}
      className="mm-canvas"
      style={{
        // Точки масштабируются с зумом, но НЕ смещаются при панораме —
        // остаются на месте, когда перетаскиваешь холст.
        backgroundImage: `radial-gradient(rgba(145,145,154,0.5) ${Math.max(0.5 * transform.k, 0.4)}px, transparent ${Math.max(0.5 * transform.k, 0.4)}px)`,
        backgroundSize: `${20 * transform.k}px ${20 * transform.k}px`,
        backgroundPosition: '0 0',
        transition: isAnimating ? 'background-size 420ms cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
      }}
      onWheel={handlers.onWheel}
      onMouseDown={handlers.onMouseDown}
      onTouchStart={handlers.onTouchStart}
      onTouchMove={handlers.onTouchMove}
      onTouchEnd={handlers.onTouchEnd}
    >
      <div
        className="mm-canvas__inner"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
          transition: isAnimating ? 'transform 420ms cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
        }}
      >
        <svg
          className="mm-edges"
          width="1" height="1"
          style={{ overflow: 'visible' }}
          aria-hidden="true"
        >
          {edges.map(e => {
            const dimmed = searchActive && !(matchedIds.has(e.fromId) && matchedIds.has(e.toId));
            return (
              <path
                key={e.id}
                d={buildEdgePath(e.from, e.to, e.depth - 1, e.depth)}
                className={`mm-edge mm-edge--depth-${Math.min(e.depth, 3)} ${dimmed ? 'is-dimmed' : ''}`}
                fill="none"
              />
            );
          })}
        </svg>

        {nodes.map(({ node, pos, depth }) => {
          const isMatched = matchedIds.has(node.id);
          const isDimmed  = searchActive && !isMatched;
          const tState = tutorialState ? tutorialState(node.id) : null;
          const nodeStatus = nodeStatusOf ? nodeStatusOf(node.id) : null;
          const isBookmarked = isBookmarkedNode ? isBookmarkedNode(node.id) : false;
          return (
            <MindmapNode
              key={node.id}
              node={node}
              pos={pos}
              depth={depth}
              isExpanded={expandedIds.has(node.id)}
              isSelected={selectedId === node.id}
              isMatched={isMatched && searchActive}
              isDimmed={isDimmed}
              hasTutorial={!!tState?.has}
              tutorialDone={!!tState?.done}
              tutorialStarted={!!tState?.started}
              nodeStatus={nodeStatus}
              isBookmarked={isBookmarked}
              isNew={isNewNode ? isNewNode(node.id) : false}
              newType={newTypeOf ? newTypeOf(node.id) : null}
              hasNewInside={hasNewInside ? hasNewInside(node.id) : false}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          );
        })}
      </div>
    </div>
  );
});

export default Mindmap;

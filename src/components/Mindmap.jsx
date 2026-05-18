import React, { useImperativeHandle, useRef, forwardRef, useEffect } from 'react';
import MindmapNode from './MindmapNode.jsx';
import { useMindmapLayout } from '../hooks/useMindmapLayout.js';
import { usePanZoom } from '../hooks/usePanZoom.js';

function buildEdgePath(from, to) {
  // Гладкая бокс-кривая Безье — типичный mindmap-style
  const dx = (to.x - from.x);
  const cx1 = from.x + dx * 0.5;
  const cx2 = to.x   - dx * 0.5;
  return `M ${from.x} ${from.y} C ${cx1} ${from.y}, ${cx2} ${to.y}, ${to.x} ${to.y}`;
}

const Mindmap = forwardRef(function Mindmap(
  { root, expandedIds, selectedId, matchedIds, searchActive, onToggle, onSelect, tutorialState, nodeStatusOf, isBookmarkedNode, isNewNode, newTypeOf, hasNewInside },
  ref
) {
  const containerRef = useRef(null);
  const { nodes, edges, bounds } = useMindmapLayout(root, expandedIds);
  const { transform, handlers, zoomIn, zoomOut, reset, fitToScreen, MIN_ZOOM, MAX_ZOOM } =
    usePanZoom(containerRef);

  useImperativeHandle(ref, () => ({
    zoomIn, zoomOut, reset,
    fitToScreen: () => fitToScreen(bounds),
    zoom: transform.k,
    minZoom: MIN_ZOOM,
    maxZoom: MAX_ZOOM
  }), [zoomIn, zoomOut, reset, fitToScreen, bounds, transform.k, MIN_ZOOM, MAX_ZOOM]);

  // По умолчанию НЕ делаем авто-fit: первый экран = 100% зум, root по центру.
  // Это согласовано с initial expandedIds={root} в App.jsx — на старте видна
  // только корневая нода, и зум не «уплывает» в 25%, как при fitToScreen.
  // Пользователь может явно нажать «Вписать» в зум-панели.

  return (
    <div
      ref={containerRef}
      className="mm-canvas"
      onWheel={handlers.onWheel}
      onMouseDown={handlers.onMouseDown}
      onTouchStart={handlers.onTouchStart}
      onTouchMove={handlers.onTouchMove}
      onTouchEnd={handlers.onTouchEnd}
    >
      <div
        className="mm-canvas__inner"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`
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
                d={buildEdgePath(e.from, e.to)}
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

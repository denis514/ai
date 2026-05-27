import React, { useRef, useCallback, useEffect } from 'react';
import Icon from '../../../components/Icon.jsx';
import { useT } from '../../../i18n/LocaleContext.jsx';

/**
 * ToolboxItem — draggable item в палитре + hover trigger for tooltip.
 *
 * Props:
 *  • defId, def        — NODE_DEFS entry
 *  • onHover(info|null) — called when tooltip should show/hide
 *
 * Hover delay 400ms (industry-standard для tooltips).
 * Position для tooltip — getBoundingClientRect() + offset вправо.
 *
 * Phase B-1 Day 22-23.
 */

const HOVER_DELAY_MS = 400;

export default function ToolboxItem({ defId, def, onHover }) {
  const t = useT();
  const buttonRef = useRef(null);
  const hoverTimerRef = useRef(null);

  const handleEnter = useCallback(() => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      onHover({
        defId,
        top: rect.top - 8,
        // Position to the right of toolbox (240px width + gap)
        left: rect.right + 12,
      });
    }, HOVER_DELAY_MS);
  }, [defId, onHover]);

  const handleLeave = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    onHover(null);
  }, [onHover]);

  // Cleanup на unmount
  useEffect(() => () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
  }, []);

  return (
    <button
      ref={buttonRef}
      type="button"
      className="builder-toolbox__item"
      style={{ '--node-color': def.color }}
      draggable
      onDragStart={(e) => {
        // Hide tooltip during drag
        handleLeave();
        e.dataTransfer.setData('application/builder-node', defId);
        e.dataTransfer.effectAllowed = 'copy';
      }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
      aria-label={t(def.labelKey) || defId}
    >
      <Icon name={def.icon} size={14} strokeWidth={1.5} />
      <span>{t(def.labelKey) || defId}</span>
    </button>
  );
}

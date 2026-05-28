import React, { useRef, useCallback, useEffect } from 'react';
import Icon from '../../../components/Icon.jsx';
import { useT } from '../../../i18n/LocaleContext.jsx';

/**
 * ToolboxItem — draggable item в палитре + hover trigger for tooltip.
 *
 * Props:
 *  • defId, def     — NODE_DEFS entry
 *  • onShow(info)   — called когда tooltip should appear (с задержкой 400ms)
 *  • onHide()       — schedule tooltip hide (handled в parent с задержкой)
 *
 * Hover delay 400ms перед show (industry-standard для tooltips).
 * Hide задержка обрабатывается на стороне parent (BuilderApp), чтобы мышка
 * успевала перейти на сам tooltip (например клик на «Learn more»).
 *
 * Phase B-1 Day 22-23.
 */

const HOVER_DELAY_MS = 400;

export default function ToolboxItem({ defId, def, onShow, onHide, onAdd, variant = 'row' }) {
  const t = useT();
  const buttonRef = useRef(null);
  const hoverTimerRef = useRef(null);

  const handleEnter = useCallback(() => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      onShow({
        defId,
        top: rect.top - 8,
        // Position to the right of toolbox (240px width + gap)
        left: rect.right + 12,
      });
    }, HOVER_DELAY_MS);
  }, [defId, onShow]);

  const handleLeave = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    onHide();
  }, [onHide]);

  // Cleanup на unmount
  useEffect(() => () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
  }, []);

  return (
    <button
      ref={buttonRef}
      type="button"
      className={variant === 'tile' ? 'builder-palette__tile' : 'builder-toolbox__item'}
      style={{ '--node-color': def.color }}
      draggable
      onDragStart={(e) => {
        // Hide tooltip during drag
        handleLeave();
        e.dataTransfer.setData('application/builder-node', defId);
        e.dataTransfer.effectAllowed = 'copy';
      }}
      onClick={() => { handleLeave(); onAdd?.(defId); }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
      aria-label={t(def.labelKey) || defId}
    >
      <Icon name={def.icon} size={variant === 'tile' ? 18 : 14} strokeWidth={1.5} />
      <span>{t(def.labelKey) || defId}</span>
    </button>
  );
}

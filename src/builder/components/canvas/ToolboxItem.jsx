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

export default function ToolboxItem({ defId, def, onShow, onHide, onAdd, variant = 'row', disabled = false }) {
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

  const cls = variant === 'cta'
    ? 'builder-palette__cta'
    : variant === 'tile'
      ? 'builder-palette__tile'
      : 'builder-toolbox__item';
  const iconSize = variant === 'row' ? 14 : 18;

  return (
    <button
      ref={buttonRef}
      type="button"
      className={`${cls}${disabled ? ' is-disabled' : ''}`}
      style={{ '--node-color': def.color }}
      draggable={!disabled}
      aria-disabled={disabled || undefined}
      onDragStart={(e) => {
        if (disabled) { e.preventDefault(); return; }
        // Hide tooltip during drag
        handleLeave();
        e.dataTransfer.setData('application/builder-node', defId);
        e.dataTransfer.effectAllowed = 'copy';
      }}
      onClick={() => { handleLeave(); if (!disabled) onAdd?.(defId); }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
      aria-label={t(def.labelKey) || defId}
    >
      {/* CTA «Старт»: 2 дополнительных blob'а (оранжевый + янтарный) — пара
          к двум красным из ::before / ::after, чтобы получился живой градиент.
          Только для variant='cta'; aria-hidden, чтобы не мешать скринридерам. */}
      {variant === 'cta' && (
        <>
          <span className="builder-cta-blob-o" aria-hidden="true" />
          <span className="builder-cta-blob-a" aria-hidden="true" />
        </>
      )}
      <Icon name={def.icon} size={iconSize} strokeWidth={1.5} />
      <span>{t(def.labelKey) || defId}</span>
    </button>
  );
}

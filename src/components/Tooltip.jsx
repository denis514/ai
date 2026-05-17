import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useT } from '../i18n/LocaleContext.jsx';

/**
 * Tooltip — умное позиционирование относительно viewport.
 *
 * Проблема прежней версии: position:absolute внутри скролл-контейнера
 * обрезается overflow:hidden родителя и прячется за хедер.
 *
 * Решение: при открытии читаем getBoundingClientRect() триггера,
 * рендерим пузырь через position:fixed с вычисленными координатами.
 * Автоматически переключаемся вниз если сверху мало места.
 */
export default function Tooltip({ children, label }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [pos, setPos]   = useState({ top: 0, left: 0, dir: 'up' });
  const triggerRef = useRef(null);

  const BUBBLE_WIDTH  = 220;
  const BUBBLE_HEIGHT = 80;  // примерная высота
  const GAP           = 8;
  const HEADER_HEIGHT = 56;  // высота sticky-хедера detail panel

  const calcPos = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const centerX = r.left + r.width / 2;

    // Сверху достаточно места (с учётом хедера)?
    const spaceAbove = r.top - HEADER_HEIGHT;
    const dir = spaceAbove >= BUBBLE_HEIGHT + GAP * 2 ? 'up' : 'down';

    let top;
    if (dir === 'up') {
      top = r.top - GAP;               // нижний край пузыря = верх триггера - GAP
    } else {
      top = r.bottom + GAP;            // верхний край пузыря = низ триггера + GAP
    }

    // Горизонтальное: центрируем, но держим в пределах viewport
    let left = centerX - BUBBLE_WIDTH / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - BUBBLE_WIDTH - 8));

    setPos({ top, left, dir });
  }, []);

  const handleOpen = useCallback((e) => {
    e.stopPropagation();
    calcPos();
    setOpen(o => !o);
  }, [calcPos]);

  // Закрыть при клике вне или скролле
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    document.addEventListener('scroll', close, true); // capture: закрывает при любом скролле
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('touchstart', close);
      document.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  return (
    <span className="tooltip" ref={triggerRef}>
      <button
        type="button"
        className="tooltip__trigger"
        aria-expanded={open}
        aria-label={t('tooltip.aria')}
        onClick={handleOpen}
      >?</button>

      {open && (
        <span
          className={`tooltip__bubble tooltip__bubble--fixed ${pos.dir === 'down' ? 'tooltip__bubble--down' : ''}`}
          role="tooltip"
          style={{
            top:  pos.dir === 'up'   ? `${pos.top}px`   : undefined,
            bottom: pos.dir === 'up' ? undefined         : undefined,
            left: `${pos.left}px`,
            // При dir=down: top = низ триггера + GAP
            ...(pos.dir === 'down' ? { top: `${pos.top}px` } : {}),
          }}
          onMouseDown={e => e.stopPropagation()}
        >
          {label || children}
        </span>
      )}
    </span>
  );
}

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useT } from '../i18n/LocaleContext.jsx';

const BUBBLE_W = 220;
const GAP      = 8;
// Минимальная высота detail header (sticky) — не показывать пузырь за ним
const SAFE_TOP = 64;

export default function Tooltip({ children, label }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState({});
  const [dir, setDir]     = useState('up');
  const btnRef = useRef(null);

  const calcStyle = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;

    // Показываем вверх если хватает места, иначе вниз
    const spaceAbove = r.top - SAFE_TOP;
    const showUp = spaceAbove >= 120;

    let left = cx - BUBBLE_W / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - BUBBLE_W - 8));

    if (showUp) {
      setDir('up');
      // bottom пузыря = r.top - GAP
      setStyle({ position: 'fixed', bottom: `${window.innerHeight - r.top + GAP}px`, left: `${left}px` });
    } else {
      setDir('down');
      // top пузыря = r.bottom + GAP
      setStyle({ position: 'fixed', top: `${r.bottom + GAP}px`, left: `${left}px` });
    }
  }, []);

  const toggle = useCallback((e) => {
    e.stopPropagation();
    if (!open) calcStyle();
    setOpen(o => !o);
  }, [open, calcStyle]);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      // не закрываем если клик по самой кнопке — toggle() уже отработает
      if (btnRef.current && btnRef.current.contains(e.target)) return;
      setOpen(false);
    };
    const closeAlways = () => setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    window.addEventListener('resize', closeAlways);
    // Скролл закрывает только если это скролл внутри detail__body
    const body = btnRef.current?.closest('.detail__body');
    if (body) body.addEventListener('scroll', closeAlways);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('touchstart', close);
      window.removeEventListener('resize', closeAlways);
      if (body) body.removeEventListener('scroll', closeAlways);
    };
  }, [open]);

  return (
    <span className="tooltip" ref={btnRef}>
      <button
        type="button"
        className="tooltip__trigger"
        aria-expanded={open}
        aria-label={t('tooltip.aria')}
        onClick={toggle}
      >?</button>

      {open && (
        <span
          className={`tooltip__bubble tooltip__bubble--portal ${dir === 'down' ? 'tooltip__bubble--down' : ''}`}
          role="tooltip"
          style={{ ...style, width: BUBBLE_W + 'px', zIndex: 9999 }}
          onMouseDown={e => e.stopPropagation()}
        >
          {label || children}
        </span>
      )}
    </span>
  );
}

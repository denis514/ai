import React, { useState, useRef, useEffect } from 'react';
import { useT } from '../i18n/LocaleContext.jsx';

export default function Tooltip({ children, label }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('touchstart', onClick);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('touchstart', onClick);
    };
  }, [open]);

  return (
    <span className="tooltip" ref={ref}>
      <button
        type="button"
        className="tooltip__trigger"
        aria-expanded={open}
        aria-label={t('tooltip.aria')}
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
      >?</button>
      {open && (
        <span className="tooltip__bubble" role="tooltip">
          {label || children}
        </span>
      )}
    </span>
  );
}

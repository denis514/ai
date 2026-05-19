import React, { useEffect, useRef, useState } from 'react';
import { FILTER_CATEGORIES, CATEGORIES } from '../data/mindmapData.js';
import Icon from './Icon.jsx';
import { useT } from '../i18n/LocaleContext.jsx';
import WhatsNewPanel from './WhatsNewPanel.jsx';
import { useWhatsNew } from '../hooks/useWhatsNew.js';
import { WHATS_NEW } from '../data/whatsNew.js';

function categoryLabel(t, id) {
  return t(`category.${id}`);
}

/**
 * Плавающий фильтр — всегда компактный dropdown (desktop + wide).
 * На mobile скрыт (живёт в MobileFab).
 */
export default function CanvasFilters({ category, onCategory, onSelectNode, onOpenTutorial, onOpenArchive }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [updatesOpen, setUpdatesOpen] = useState(false);
  const containerRef = useRef(null);
  const updatesRef = useRef(null);
  const { isNew } = useWhatsNew();
  const TTL_DAYS = 60;
  const unseenCount = Object.entries(WHATS_NEW).filter(([id, e]) => {
    const age = (Date.now() - new Date(e.date).getTime()) / (1000 * 60 * 60 * 24);
    return age <= TTL_DAYS && isNew(id);
  }).length;

  useEffect(() => {
    if (!open && !updatesOpen) return;
    const onClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
      if (updatesRef.current && !updatesRef.current.contains(e.target)) setUpdatesOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') { setOpen(false); setUpdatesOpen(false); }
    };
    document.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, updatesOpen]);

  const activeEntry = FILTER_CATEGORIES.find((c) => c.id === category) || FILTER_CATEGORIES[0];
  const activeColor = CATEGORIES[activeEntry.id]?.color;

  return (
    <div className="canvas-filters canvas-filters--compact" ref={containerRef}>
      {/* Updates button compact */}
      <div className="canvas-filters__updates-wrap" ref={updatesRef}>
        <button
          type="button"
          className={`chip canvas-filters__updates-btn ${updatesOpen ? 'is-active' : ''}`}
          onClick={() => { setUpdatesOpen(v => !v); setOpen(false); }}
        >
          <Icon name="flash" size={13} strokeWidth={1.75} />
          {t('category.updatesBtn')}
          {unseenCount > 0 && (
            <span className="canvas-filters__updates-dot">{unseenCount}</span>
          )}
        </button>
        {updatesOpen && (
          <WhatsNewPanel
            onSelectNode={onSelectNode}
            onOpenTutorial={onOpenTutorial}
            onClose={() => setUpdatesOpen(false)}
            onOpenArchive={onOpenArchive}
          />
        )}
      </div>

      <button
        type="button"
        className={`canvas-filters__toggle ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={t('category.filterTitle')}
      >
        <span className="canvas-filters__toggle-label">{t('category.label')}:</span>
        {activeColor && (
          <span
            className="chip__dot"
            style={{ background: activeColor }}
            aria-hidden="true"
          />
        )}
        <strong>{categoryLabel(t, activeEntry.id)}</strong>
        <Icon
          name={open ? 'arrow-up' : 'arrow-down'}
          size={11}
          strokeWidth={1.75}
        />
      </button>

      {open && (
        <div className="canvas-filters__menu" role="menu">
          {FILTER_CATEGORIES.map((c) => {
            const colorEntry = CATEGORIES[c.id];
            const dotStyle = colorEntry ? { background: colorEntry.color } : null;
            const isActive = category === c.id;
            return (
              <button
                key={c.id}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                className={`canvas-filters__menu-item ${isActive ? 'is-active' : ''}`}
                onClick={() => { onCategory(c.id); setOpen(false); }}
              >
                {dotStyle && (
                  <span className="chip__dot" style={dotStyle} aria-hidden="true" />
                )}
                <span>{categoryLabel(t, c.id)}</span>
                {isActive && (
                  <Icon name="check" size={13} strokeWidth={1.75} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

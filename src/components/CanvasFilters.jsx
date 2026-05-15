import React, { useEffect, useRef, useState } from 'react';
import { FILTER_CATEGORIES, CATEGORIES } from '../data/mindmapData.js';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import Icon from './Icon.jsx';
import { useT } from '../i18n/LocaleContext.jsx';
import WhatsNewPanel from './WhatsNewPanel.jsx';
import { useWhatsNew } from '../hooks/useWhatsNew.js';
import { WHATS_NEW } from '../data/whatsNew.js';

// Локализованный label для категории.
// Для 'all' (псевдо-категория фильтра) и реальных id ('основы' и т.п.)
// есть отдельные ключи в category.*.
function categoryLabel(t, id) {
  return t(`category.${id}`);
}

/**
 * Плавающий фильтр по категориям над canvas (top-center, desktop).
 *
 * Адаптивность:
 *   >1350px — горизонтальный pill-список чипсов (как было)
 *   721-1350px — pill-кнопка с текущей категорией → popover-меню
 *   ≤720px — скрыт (на mobile живёт в TL FAB-меню)
 */
export default function CanvasFilters({ category, onCategory, onSelectNode }) {
  const t = useT();
  const isCompact = useMediaQuery('(max-width: 1350px)');
  const [open, setOpen] = useState(false);
  const [updatesOpen, setUpdatesOpen] = useState(false);
  const containerRef = useRef(null);
  const updatesRef = useRef(null);
  const { isNew } = useWhatsNew();
  const unseenCount = Object.keys(WHATS_NEW).filter(id => isNew(id)).length;

  // Click-outside / Esc — закрыть popovers
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

  // Горизонтальный режим (>1350px)
  if (!isCompact) {
    return (
      <div className="canvas-filters" role="group" aria-label={t('category.filterAria')}>
        <div className="canvas-filters__chips">
          {FILTER_CATEGORIES.map((c) => {
            const colorEntry = CATEGORIES[c.id];
            const dotStyle = colorEntry ? { background: colorEntry.color } : null;
            return (
              <button
                key={c.id}
                type="button"
                className={`chip ${category === c.id ? 'is-active' : ''}`}
                onClick={() => onCategory(c.id)}
              >
                {dotStyle && (
                  <span className="chip__dot" style={dotStyle} aria-hidden="true" />
                )}
                {categoryLabel(t, c.id)}
              </button>
            );
          })}

          {/* Updates button */}
          <div className="canvas-filters__updates-wrap" ref={updatesRef}>
            <button
              type="button"
              className={`chip canvas-filters__updates-btn ${updatesOpen ? 'is-active' : ''}`}
              onClick={() => setUpdatesOpen(v => !v)}
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
                onClose={() => setUpdatesOpen(false)}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Компактный режим (721-1350px) — dropdown
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
            onClose={() => setUpdatesOpen(false)}
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

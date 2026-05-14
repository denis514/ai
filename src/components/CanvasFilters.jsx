import React, { useEffect, useRef, useState } from 'react';
import { FILTER_CATEGORIES, CATEGORIES } from '../data/mindmapData.js';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import Icon from './Icon.jsx';
import { useT } from '../i18n/LocaleContext.jsx';

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
export default function CanvasFilters({ category, onCategory }) {
  const t = useT();
  const isCompact = useMediaQuery('(max-width: 1350px)');
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Click-outside / Esc — закрыть popover
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

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
        </div>
      </div>
    );
  }

  // Компактный режим (721-1350px) — dropdown
  const activeEntry = FILTER_CATEGORIES.find((c) => c.id === category) || FILTER_CATEGORIES[0];
  const activeColor = CATEGORIES[activeEntry.id]?.color;

  return (
    <div className="canvas-filters canvas-filters--compact" ref={containerRef}>
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

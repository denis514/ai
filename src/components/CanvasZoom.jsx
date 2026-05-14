import React, { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import { useT } from '../i18n/LocaleContext.jsx';

/**
 * Нижняя плавающая плашка управления картой (bottom-center, pill).
 */
export default function CanvasZoom({
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onFit,
  onReset,
  onExpandAll,
  onCollapseAll
}) {
  const t = useT();
  const isCompact = useMediaQuery('(max-width: 850px)');
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const runAction = (fn) => {
    setMenuOpen(false);
    fn?.();
  };

  if (isCompact) {
    return (
      <div
        className="canvas-zoom canvas-zoom--compact"
        ref={containerRef}
        role="group"
        aria-label={t('zoom.controlAria')}
      >
        <button
          type="button"
          className={`canvas-zoom__btn canvas-zoom__menu-btn ${menuOpen ? 'is-open' : ''}`}
          onClick={() => setMenuOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          title={t('zoom.controlAria')}
        >
          <Icon name="more" size={18} strokeWidth={1.75} />
        </button>

        <div className="canvas-zoom__divider" aria-hidden="true" />

        <button
          type="button"
          className="canvas-zoom__btn"
          onClick={onZoomOut}
          aria-label={t('zoom.zoomOut')}
          title={t('zoom.zoomOut')}
        >
          <Icon name="minus" size={16} strokeWidth={1.75} />
        </button>
        <span className="canvas-zoom__value" title={t('zoom.scale')}>
          {Math.round(zoomLevel * 100)}%
        </span>
        <button
          type="button"
          className="canvas-zoom__btn"
          onClick={onZoomIn}
          aria-label={t('zoom.zoomIn')}
          title={t('zoom.zoomIn')}
        >
          <Icon name="plus" size={16} strokeWidth={1.75} />
        </button>

        {menuOpen && (
          <div className="canvas-zoom__menu" role="menu">
            <button
              type="button"
              className="canvas-zoom__menu-item"
              onClick={() => runAction(onExpandAll)}
              role="menuitem"
            >
              <Icon name="plus" size={14} strokeWidth={1.5} />
              <span>{t('zoom.expandAllTitle')}</span>
            </button>
            <button
              type="button"
              className="canvas-zoom__menu-item"
              onClick={() => runAction(onCollapseAll)}
              role="menuitem"
            >
              <Icon name="minus" size={14} strokeWidth={1.5} />
              <span>{t('zoom.collapseAllTitle')}</span>
            </button>
            <div className="canvas-zoom__menu-divider" />
            <button
              type="button"
              className="canvas-zoom__menu-item"
              onClick={() => runAction(onFit)}
              role="menuitem"
            >
              <Icon name="target" size={14} strokeWidth={1.5} />
              <span>{t('zoom.fitTitle')}</span>
            </button>
            <button
              type="button"
              className="canvas-zoom__menu-item"
              onClick={() => runAction(onReset)}
              role="menuitem"
            >
              <Icon name="repeat" size={14} strokeWidth={1.5} />
              <span>{t('zoom.resetTitle')}</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="canvas-zoom" role="group" aria-label={t('zoom.controlAria')}>
      <button
        type="button"
        className="canvas-zoom__btn canvas-zoom__btn--text"
        onClick={onExpandAll}
        title={t('zoom.expandAllTitle')}
      >
        {t('zoom.expandAll')}
      </button>
      <button
        type="button"
        className="canvas-zoom__btn canvas-zoom__btn--text"
        onClick={onCollapseAll}
        title={t('zoom.collapseAllTitle')}
      >
        {t('zoom.collapseAll')}
      </button>

      <div className="canvas-zoom__divider" aria-hidden="true" />

      <button
        type="button"
        className="canvas-zoom__btn"
        onClick={onZoomOut}
        aria-label={t('zoom.zoomOut')}
        title={t('zoom.zoomOut')}
      >
        <Icon name="minus" size={16} strokeWidth={1.75} />
      </button>
      <span className="canvas-zoom__value" title={t('zoom.scale')}>
        {Math.round(zoomLevel * 100)}%
      </span>
      <button
        type="button"
        className="canvas-zoom__btn"
        onClick={onZoomIn}
        aria-label={t('zoom.zoomIn')}
        title={t('zoom.zoomIn')}
      >
        <Icon name="plus" size={16} strokeWidth={1.75} />
      </button>
      <button
        type="button"
        className="canvas-zoom__btn canvas-zoom__btn--text"
        onClick={onFit}
        title={t('zoom.fitTitle')}
      >
        {t('zoom.fit')}
      </button>
      <button
        type="button"
        className="canvas-zoom__btn canvas-zoom__btn--text"
        onClick={onReset}
        title={t('zoom.resetTitle')}
      >
        {t('zoom.reset')}
      </button>
    </div>
  );
}

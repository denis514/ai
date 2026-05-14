import React, { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { useT } from '../i18n/LocaleContext.jsx';

/**
 * CanvasHeader — плавающая шапка в левом-верхнем углу canvas (desktop).
 *
 * Состав:
 *   - Логотип «Claude Atlas» + chevron-кнопка → раскрывает dropdown:
 *       · Библиотека
 *       · Обучение (с бейджем completed/total)
 *       · ─── divider
 *       · Раскрыть все ветки
 *       · Свернуть все ветки
 *   - Кнопка поиска (icon) — рядом с brand, видна всегда (до раскрытия dropdown).
 *     Клик раскрывает inline input с автофокусом.
 *
 * На mobile скрыта — там работает FAB-система.
 */
export default function CanvasHeader({
  query, onQuery,
  tutorialsCompleted, tutorialsTotal,
  onOpenCourses, onOpenLibrary, onOpenHelp
}) {
  const t = useT();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Click-outside закрывает dropdown
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  // Esc — закрывает оба попапа
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (menuOpen) setMenuOpen(false);
        if (searchOpen) {
          if (query) onQuery('');
          setSearchOpen(false);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen, searchOpen, query, onQuery]);

  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => inputRef.current?.focus(), 30);
  };

  const runAction = (fn) => {
    setMenuOpen(false);
    fn?.();
  };

  return (
    <div className="canvas-header" ref={containerRef}>
      <div className="canvas-header__bar">
        <button
          type="button"
          className={`canvas-header__brand ${menuOpen ? 'is-open' : ''}`}
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          title={t('header.menu.title')}
        >
          <span className="canvas-header__logo" aria-hidden="true">
            <Icon name="sparkles" size={18} strokeWidth={1.5} />
          </span>
          <strong>Claude Atlas</strong>
          <span className="canvas-header__chevron" aria-hidden="true">
            <Icon
              name={menuOpen ? 'arrow-up' : 'arrow-down'}
              size={12}
              strokeWidth={1.75}
            />
          </span>
        </button>

        {!searchOpen ? (
          <button
            type="button"
            className={`canvas-header__search-btn ${query ? 'has-query' : ''}`}
            onClick={openSearch}
            aria-label={t('header.searchOpen')}
            title={query ? t('header.searchActive', { query }) : t('header.searchIdle')}
          >
            <Icon name="search" size={16} strokeWidth={1.5} />
            {query && <span className="canvas-header__search-dot" aria-hidden="true" />}
          </button>
        ) : (
          <div className="canvas-header__search">
            <span className="canvas-header__search-icon" aria-hidden="true">
              <Icon name="search" size={14} strokeWidth={1.5} />
            </span>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              onBlur={() => { if (!query) setSearchOpen(false); }}
              placeholder={t('header.searchPlaceholder')}
              aria-label={t('header.searchAria')}
            />
            <button
              type="button"
              className="canvas-header__search-clear"
              onClick={() => { onQuery(''); setSearchOpen(false); }}
              aria-label={t('header.searchClose')}
            >
              <Icon name="close" size={12} strokeWidth={1.75} />
            </button>
          </div>
        )}
      </div>

      {menuOpen && (
        <div className="canvas-header__menu" role="menu">
          <button
            type="button"
            className="canvas-header__menu-item"
            onClick={() => runAction(onOpenLibrary)}
            role="menuitem"
          >
            <Icon name="books" size={16} strokeWidth={1.5} />
            <span>{t('header.library')}</span>
          </button>
          <button
            type="button"
            className="canvas-header__menu-item"
            onClick={() => runAction(onOpenCourses)}
            role="menuitem"
          >
            <Icon name="graduation" size={16} strokeWidth={1.5} />
            <span>{t('header.learning')}</span>
            <span className="canvas-header__menu-badge">
              {tutorialsCompleted}/{tutorialsTotal}
            </span>
          </button>
          <button
            type="button"
            className="canvas-header__menu-item"
            onClick={() => runAction(onOpenHelp)}
            role="menuitem"
          >
            <Icon name="question" size={16} strokeWidth={1.5} />
            <span>{t('header.help')}</span>
          </button>
        </div>
      )}
    </div>
  );
}

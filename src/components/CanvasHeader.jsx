import React, { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { useT, useLocale } from '../i18n/LocaleContext.jsx';
import { LOCALE_LABEL } from '../i18n/config.js';
import { useTheme } from '../hooks/useTheme.js';


/**
 * CanvasHeader — плавающая шапка в левом-верхнем углу canvas (desktop).
 *
 * Состав:
 *   - Логотип «Atlas» + chevron-кнопка → раскрывает dropdown:
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
  onOpenCourses, onOpenLibrary, onOpenHelp, onOpenBuilder,
  route
}) {
  const t = useT();
  const { mode, setThemeMode } = useTheme();
  const { locale, setLocale, locales } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const [bar, setBar] = useState(null); // 'theme' | 'lang' | null — независимые кнопки справа
  const [searchOpen, setSearchOpen] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Закрываем все попапы при любом изменении route (открытие узла, модалки и т.д.)
  useEffect(() => {
    setMenuOpen(false);
    setBar(null);
  }, [route]);

  const THEME_OPTS = [
    { m: 'light', icon: 'sun',    label: t('profile.theme.light') || 'Светлая тема' },
    { m: 'dark',  icon: 'moon',   label: t('profile.theme.dark')  || 'Тёмная тема' },
    { m: 'auto',  icon: 'laptop', label: t('profile.theme.auto')  || 'Как в системе' },
  ];

  // Click-outside закрывает меню «Atlas» и независимые попапы (тема/язык)
  useEffect(() => {
    if (!menuOpen && !bar) return;
    const onClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setMenuOpen(false);
        setBar(null);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen, bar]);

  // Esc — закрывает попапы
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (menuOpen) setMenuOpen(false);
        if (bar) setBar(null);
        if (searchOpen) {
          if (query) onQuery('');
          setSearchOpen(false);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen, bar, searchOpen, query, onQuery]);

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
      <div className="canvas-header__row">
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
          <strong>Atlas</strong>
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

      {/* Независимые кнопки справа от плашки «Atlas»: тема и язык */}
      <div className="canvas-header__tools">
        <div className="canvas-header__tool">
          <button
            type="button"
            className={`canvas-header__tool-btn ${bar === 'theme' ? 'is-open' : ''}`}
            onClick={() => setBar(b => (b === 'theme' ? null : 'theme'))}
            aria-haspopup="listbox"
            aria-expanded={bar === 'theme'}
            title={t('profile.theme.cycle') || 'Тема'}
          >
            <Icon
              name={mode === 'auto' ? 'laptop' : mode === 'dark' ? 'moon' : 'sun'}
              size={16}
              strokeWidth={1.5}
            />
          </button>
          {bar === 'theme' && (
            <div className="canvas-header__pop" role="listbox">
              {THEME_OPTS.map(({ m, icon, label }) => (
                <button
                  key={m}
                  type="button"
                  className={`canvas-header__menu-item ${mode === m ? 'is-active' : ''}`}
                  onClick={() => { setThemeMode(m); setBar(null); }}
                  role="option"
                  aria-selected={mode === m}
                >
                  <Icon name={icon} size={16} strokeWidth={1.5} />
                  <span>{label}</span>
                  {mode === m && <Icon name="check" size={14} strokeWidth={2} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="canvas-header__tool">
          <button
            type="button"
            className={`canvas-header__tool-btn ${bar === 'lang' ? 'is-open' : ''}`}
            onClick={() => setBar(b => (b === 'lang' ? null : 'lang'))}
            aria-haspopup="listbox"
            aria-expanded={bar === 'lang'}
            title="Язык"
          >
            <Icon name="globe" size={18} strokeWidth={1.5} />
          </button>
          {bar === 'lang' && (
            <div className="canvas-header__pop" role="listbox">
              {locales.map(code => (
                <button
                  key={code}
                  type="button"
                  className={`canvas-header__menu-item canvas-header__lang-opt ${locale === code ? 'is-active' : ''}`}
                  onClick={() => { setLocale(code); setBar(null); }}
                  role="option"
                  aria-selected={locale === code}
                >
                  <span className="canvas-header__lang-check" aria-hidden="true">
                    {locale === code && <Icon name="check" size={14} strokeWidth={2} />}
                  </span>
                  <span>{LOCALE_LABEL[code]}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
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
          {onOpenBuilder && (
            <button
              type="button"
              className="canvas-header__menu-item"
              onClick={() => runAction(onOpenBuilder)}
              role="menuitem"
            >
              <Icon name="sparkles" size={16} strokeWidth={1.5} />
              <span>{t('header.builder')}</span>
              <span className="canvas-header__menu-badge canvas-header__menu-badge--beta">
                BETA
              </span>
            </button>
          )}
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

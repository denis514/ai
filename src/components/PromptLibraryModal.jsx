import React, { useEffect, useMemo, useState } from 'react';
import Icon from './Icon.jsx';
import PromptModal from './PromptModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useFocusReturn } from '../hooks/useFocusReturn.js';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock.js';
import { useToast } from '../hooks/useToast.js';
import {
  PROMPT_CATEGORIES,
  PROMPT_LEVELS,
  promptLibrary,
  promptIndex,
  countByCategory
} from '../data/promptLibrary.js';
import { useT, useLocale } from '../i18n/LocaleContext.jsx';
import {
  getAllLocalizedLibrary,
  getAllLibraryCategories,
  getAllLibraryLevels,
  getLocalizedLibraryTemplate
} from '../i18n/usePrompt.js';

export default function PromptLibraryModal({
  onClose,
  activePromptId = null,
  onActivePromptChange,
  bookmarksApi
}) {
  const t = useT();
  const { locale, contentVersion } = useLocale();
  const { toast } = useToast();
  useFocusReturn();
  useBodyScrollLock();

  // Bookmark toggle с feedback-toast. При удалении — undo на 5 секунд.
  const handleBmToggle = (promptId) => {
    if (!bookmarksApi) return;
    const wasOn = bookmarksApi.isBookmarked('prompt', promptId);
    bookmarksApi.toggle('prompt', promptId);
    if (wasOn) {
      toast({
        message: t('detail.bookmark.removedToast') || t('detail.bookmark.remove'),
        duration: 5000,
        action: {
          label: t('common.undo') || 'Отменить',
          onClick: () => bookmarksApi.toggle('prompt', promptId),
        },
      });
    } else {
      toast.success(t('detail.bookmark.addedToast') || t('detail.bookmark.added'));
    }
  };
  const { isLoggedIn } = useAuth();
  const GUEST_LIMIT = 15;
  const LEVEL_FILTERS = [
    { id: 'all',          label: t('library.level.all') },
    { id: 'beginner',     label: t('level.beginner') },
    { id: 'intermediate', label: t('level.intermediate') },
    { id: 'advanced',     label: t('level.advanced') }
  ];
  // Локализованные коллекции — пересобираются при смене локали.
  // contentVersion в deps критичен: prompt-library грузится ЛЕНИВО,
  // без него memo не пересчитывается после loadLocaleContent().
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const localizedLibrary = useMemo(() => getAllLocalizedLibrary(locale), [locale, contentVersion]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const localizedCategories = useMemo(() => getAllLibraryCategories(locale), [locale, contentVersion]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const localizedLevels = useMemo(() => getAllLibraryLevels(locale), [locale, contentVersion]);
  const [activeCategory, setActiveCategory] = useState('start');
  const [levelFilter, setLevelFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [showCategories, setShowCategories] = useState(false); // mobile
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Выбранный для fullscreen-чтения шаблон. Источник истины — родитель (через
  // activePromptId), но компонент может работать и автономно, если родитель
  // не передал callback. Резолвим в локализованный объект для PromptModal.
  const [internalOpen, setInternalOpen] = useState(null);
  const openPrompt = onActivePromptChange
    ? (activePromptId ? getLocalizedLibraryTemplate(activePromptId, locale) : null)
    : internalOpen;
  const setOpenPrompt = (p) => {
    if (onActivePromptChange) {
      onActivePromptChange(p ? p.id : null);
    } else {
      setInternalOpen(p);
    }
  };

  // Если открыли библиотеку с deep-link на шаблон — переключиться в его категорию.
  useEffect(() => {
    if (activePromptId && promptIndex[activePromptId]) {
      setActiveCategory(promptIndex[activePromptId].category);
    }
  }, [activePromptId]);

  // Search/filter работает по локализованной коллекции.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return localizedLibrary.filter(p => {
      if (!q && p.category !== activeCategory) return false;
      if (levelFilter !== 'all' && p.level !== levelFilter) return false;
      if (q) {
        const hay = `${p.title} ${p.description} ${p.text}`.toLowerCase();
        return hay.includes(q);
      }
      return true;
    });
  }, [activeCategory, levelFilter, query, localizedLibrary]);

  // Esc to close library. PromptModal (если открыт поверх) перехватывает
  // ESC через stopImmediatePropagation+capture — поэтому здесь нам не нужно
  // условие `!openPrompt`: библиотека получит ESC только если child закрыт.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const counts = useMemo(() => countByCategory(), []);

  const totalShown = filtered.length;
  const isSearching = query.trim().length > 0;
  const categoryEntries = Object.entries(PROMPT_CATEGORIES);

  return (
    <div
      className="lib-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lib-title"
      onClick={(e) => { if (e.target === e.currentTarget && !openPrompt) onClose(); }}
    >
      <div className={`lib-modal ${isFullscreen ? 'is-fullscreen' : ''}`}>

        {/* HEADER */}
        <header className="lib-header">
          <div className="lib-header__main">
            <span className="lib-header__icon" aria-hidden="true">
              <Icon name="books" size={26} strokeWidth={1.5} />
            </span>
            <div>
              <span className="lib-header__kicker">{t('library.title')}</span>
              <h2 id="lib-title" className="lib-header__title">
                {t('library.summary', { n: promptLibrary.length, c: categoryEntries.length })}
              </h2>
              <p className="lib-header__subtitle">
                {t('library.subtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="lib-header__expand"
            onClick={() => setIsFullscreen(v => !v)}
            aria-label={isFullscreen ? 'Свернуть окно' : 'Развернуть на весь экран'}
            title={isFullscreen ? 'Свернуть' : 'На весь экран'}
          >
            <Icon name={isFullscreen ? 'restore' : 'fullscreen'} size={17} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            className="lib-header__close"
            onClick={onClose}
            aria-label={t('library.closeAria')}
          >
            <Icon name="close" size={20} strokeWidth={1.75} />
          </button>
        </header>

        {/* FILTER BAR */}
        <div className="lib-filterbar">
          <div className="lib-search">
            <span className="lib-search__icon" aria-hidden="true">
              <Icon name="search" size={16} strokeWidth={1.5} />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('library.searchPlaceholder')}
              aria-label={t('library.searchAria')}
            />
            {query && (
              <button
                type="button"
                className="lib-search__clear"
                onClick={() => setQuery('')}
                aria-label={t('common.clearSearch')}
              >
                <Icon name="close" size={14} strokeWidth={1.75} />
              </button>
            )}
          </div>

          <div className="lib-levels" role="group" aria-label={t('library.levels.aria')}>
            {LEVEL_FILTERS.map(l => (
              <button
                key={l.id}
                type="button"
                className={`lib-level-chip ${levelFilter === l.id ? 'is-active' : ''}`}
                onClick={() => setLevelFilter(l.id)}
              >
                {l.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="lib-categories-toggle"
            onClick={() => setShowCategories(s => !s)}
            aria-expanded={showCategories}
          >
            <Icon name="folder" size={14} strokeWidth={1.5} />
            {t('library.categoriesBtn')}
          </button>
        </div>

        <div className="lib-body">

          {/* SIDEBAR — категории */}
          <nav
            className={`lib-side ${showCategories ? 'is-open' : ''}`}
            aria-label={t('library.categories.aria')}
          >
            <ul className="lib-side__list">
              {categoryEntries.map(([key]) => {
                const cat = localizedCategories[key];
                const count = counts[key] || 0;
                const isActive = !isSearching && key === activeCategory;
                return (
                  <li key={key}>
                    <button
                      type="button"
                      className={`lib-cat ${isActive ? 'is-active' : ''}`}
                      onClick={() => {
                        setActiveCategory(key);
                        setQuery('');
                        setShowCategories(false);
                      }}
                    >
                      <span className="lib-cat__icon" aria-hidden="true">
                        <Icon name={cat?.icon} size={18} strokeWidth={1.5} />
                      </span>
                      <span className="lib-cat__main">
                        <span className="lib-cat__label">{cat?.label}</span>
                        <span className="lib-cat__desc">{cat?.description}</span>
                      </span>
                      <span className="lib-cat__count">{count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* MAIN — карточки шаблонов */}
          <main className="lib-main">
            <div className="lib-main__meta">
              {isSearching ? (
                <>{t('library.searchResult', { q: query, n: totalShown })}</>
              ) : (
                <>
                  <strong>{localizedCategories[activeCategory]?.label}</strong>
                  {' · '}{totalShown} {totalShown === 1 ? t('library.templateOne') : t('library.templateMany')}
                  {levelFilter !== 'all' && (
                    <> · {LEVEL_FILTERS.find(l => l.id === levelFilter)?.label}</>
                  )}
                </>
              )}
            </div>

            {totalShown === 0 ? (
              <div className="lib-empty">
                <Icon name="search" size={28} strokeWidth={1.5} />
                <p>{t('library.empty')}</p>
                <button type="button" onClick={() => { setQuery(''); setLevelFilter('all'); }}>
                  {t('library.resetFilters')}
                </button>
              </div>
            ) : (
              <div className="lib-grid">
                {filtered.map((p, idx) => {
                  const lvl = localizedLevels[p.level];
                  const cat = localizedCategories[p.category];
                  const isLocked = !isLoggedIn && idx >= GUEST_LIMIT;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      className={`lib-card ${isLocked ? 'lib-card--locked' : ''}`}
                      onClick={() => {
                        if (isLocked) {
                          document.dispatchEvent(new CustomEvent('atlas:open-auth'));
                        } else {
                          setOpenPrompt(p);
                        }
                      }}
                      data-prompt-id={p.id}
                      title={isLocked ? t('auth.gatePrompts') : undefined}
                    >
                      <div className="lib-card__head">
                        <span className="lib-card__icon" aria-hidden="true">
                          <Icon name={p.icon} size={20} strokeWidth={1.5} />
                        </span>
                        <span className="lib-card__head-right">
                          {bookmarksApi && (
                            <span
                              role="button"
                              tabIndex={0}
                              className={`lib-card__bm ${bookmarksApi.isBookmarked('prompt', p.id) ? 'is-on' : ''}`}
                              onClick={(e) => { e.stopPropagation(); handleBmToggle(p.id); }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  handleBmToggle(p.id);
                                }
                              }}
                              aria-label={bookmarksApi.isBookmarked('prompt', p.id) ? t('detail.bookmark.remove') : t('detail.bookmark.toAdd')}
                              title={bookmarksApi.isBookmarked('prompt', p.id) ? t('detail.bookmark.added') : t('detail.bookmark.toAdd')}
                            >
                              <Icon
                                name={bookmarksApi.isBookmarked('prompt', p.id) ? 'bookmark-filled' : 'bookmark'}
                                size={14}
                                strokeWidth={1.5}
                              />
                            </span>
                          )}
                          <span
                            className="lib-card__level"
                            style={{ '--lvl-color': lvl?.color }}
                          >
                            {lvl?.label}
                          </span>
                        </span>
                      </div>
                      <h4 className="lib-card__title">{p.title}</h4>
                      <p className="lib-card__desc">{p.description}</p>
                      {isSearching && cat && (
                        <span className="lib-card__cat">
                          <Icon name={cat.icon} size={12} strokeWidth={1.5} />
                          {cat.label}
                        </span>
                      )}
                      {isLocked ? (
                        <span className="lib-card__lock" aria-hidden="true">
                          <Icon name="lock" size={14} strokeWidth={1.5} /> {t('auth.signIn')}
                        </span>
                      ) : (
                        <span className="lib-card__cta" aria-hidden="true">
                          {t('library.cta')} <Icon name="arrow-right" size={14} strokeWidth={1.5} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </main>
        </div>

        {/* HOTKEY HINT */}
        <div className="lib-hotkeys" aria-hidden="true">
          <span><kbd>Esc</kbd> {t('library.escClose')}</span>
        </div>
      </div>

      {openPrompt && (
        <PromptModal prompt={openPrompt} onClose={() => setOpenPrompt(null)} />
      )}
    </div>
  );
}

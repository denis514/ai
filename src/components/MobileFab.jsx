import React, { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import BottomSheet from './BottomSheet.jsx';
import { readyPrompts } from '../data/prompts.js';
import { FILTER_CATEGORIES, CATEGORIES } from '../data/mindmapData.js';
import { useT, useLocale } from '../i18n/LocaleContext.jsx';
import { getLocalizedFeaturedPrompt } from '../i18n/usePrompt.js';
import WhatsNewPanel from './WhatsNewPanel.jsx';
import { useWhatsNew } from '../hooks/useWhatsNew.js';
import { WHATS_NEW } from '../data/whatsNew.js';

/**
 * MobileFab — 4 FAB-кнопки в углах canvas (только mobile).
 *
 * TL: Brand/Menu (настройки, поиск, категории, управление картой)
 * TR: Поиск — открывает меню с автофокусом в поле поиска
 * BL: Промпты — быстрые готовые промпты
 * BR: Курсы — открывает WorkflowsModal напрямую
 */
export default function MobileFab({
  query, onQuery,
  category, onCategory,
  onFit, onReset, onExpandAll, onCollapseAll,
  onOpenCourses, onOpenLibrary,
  onOpenPrompt, onSelectNode, onOpenArchive
}) {
  const t = useT();
  const { locale } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const [promptsOpen, setPromptsOpen] = useState(false);
  const [updatesOpen, setUpdatesOpen] = useState(false);
  const searchInputRef = useRef(null);
  const { isNew } = useWhatsNew();
  const TTL_DAYS = 60;
  const unseenCount = Object.entries(WHATS_NEW).filter(([id, e]) => {
    const age = (Date.now() - new Date(e.date).getTime()) / (1000 * 60 * 60 * 24);
    return age <= TTL_DAYS && isNew(id);
  }).length;

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 720) {
        setMenuOpen(false);
        setPromptsOpen(false);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <>
      <div className="fab fab--tl">
        <button
          type="button"
          className="fab__btn fab__btn--brand"
          onClick={() => setMenuOpen(true)}
          aria-label={t('mobile.brandAria')}
          title={t('mobile.menuTitle')}
        >
          <Icon name="sparkles" size={22} strokeWidth={1.5} />
        </button>
      </div>

      {/* TR-зона отдана кнопке профиля/входа (ProfileFab) — как на десктопе.
          Поиск доступен внутри меню (кнопка-бренд слева). */}

      <div className="fab fab--bl">
        <button
          type="button"
          className="fab__btn"
          onClick={() => setPromptsOpen(true)}
          aria-label={t('mobile.promptsAria')}
          title={t('mobile.promptsTitle')}
        >
          <Icon name="flash" size={22} strokeWidth={1.5} />
        </button>
      </div>

      {/* BR: Курсы — прямой доступ к WorkflowsModal */}
      <div className="fab fab--br">
        <button
          type="button"
          className="fab__btn"
          onClick={onOpenCourses}
          aria-label={t('header.learning')}
          title={t('header.learning')}
        >
          <Icon name="graduation" size={22} strokeWidth={1.5} />
        </button>
      </div>

      <BottomSheet
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        title={t('mobile.menuTitle')}
        icon="settings"
        className="bsheet--menu"
      >
        <div className="fab-menu">
          <div className="fab-menu__section">
            <label className="fab-menu__label">{t('common.search')}</label>
            <div className="fab-menu__search">
              <span className="fab-menu__search-icon" aria-hidden="true">
                <Icon name="search" size={16} strokeWidth={1.5} />
              </span>
              <input
                ref={searchInputRef}
                type="search"
                value={query}
                onChange={(e) => onQuery(e.target.value)}
                placeholder={t('header.searchPlaceholder')}
                aria-label={t('common.search')}
              />
              {query && (
                <button
                  type="button"
                  className="fab-menu__search-clear"
                  onClick={() => onQuery('')}
                  aria-label={t('common.clearSearch')}
                >
                  <Icon name="close" size={14} strokeWidth={1.75} />
                </button>
              )}
            </div>
          </div>

          <div className="fab-menu__section">
            <label className="fab-menu__label">{t('category.label')}</label>
            <div className="fab-menu__chips">
              {FILTER_CATEGORIES.map((c) => {
                const colorEntry = CATEGORIES[c.id];
                const dotStyle = colorEntry
                  ? { background: colorEntry.color }
                  : null;
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={`chip ${category === c.id ? 'is-active' : ''}`}
                    onClick={() => onCategory(c.id)}
                  >
                    {dotStyle && (
                      <span
                        className="chip__dot"
                        style={dotStyle}
                        aria-hidden="true"
                      />
                    )}
                    {t(`category.${c.id}`)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="fab-menu__section">
            <label className="fab-menu__label">{t('mobile.section.map')}</label>
            <div className="fab-menu__actions">
              <button
                type="button"
                className="fab-menu__action"
                onClick={() => { onFit(); setMenuOpen(false); }}
              >
                {t('zoom.fitTitle')}
              </button>
              <button
                type="button"
                className="fab-menu__action"
                onClick={() => { onReset(); setMenuOpen(false); }}
              >
                {t('zoom.resetTitle')}
              </button>
              <button
                type="button"
                className="fab-menu__action"
                onClick={() => { onExpandAll(); setMenuOpen(false); }}
              >
                {t('zoom.expandAll')}
              </button>
              <button
                type="button"
                className="fab-menu__action"
                onClick={() => { onCollapseAll(); setMenuOpen(false); }}
              >
                {t('zoom.collapseAll')}
              </button>
            </div>
          </div>

          <div className="fab-menu__section">
            <label className="fab-menu__label">{t('mobile.section.content')}</label>
            <button
              type="button"
              className="fab-menu__big-action"
              onClick={() => { setMenuOpen(false); setUpdatesOpen(true); }}
            >
              <Icon name="flash" size={18} strokeWidth={1.5} />
              <span>{t('category.updatesBtn')}</span>
              {unseenCount > 0 && (
                <span className="canvas-filters__updates-dot">{unseenCount}</span>
              )}
              <Icon name="arrow-right" size={14} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              className="fab-menu__big-action"
              onClick={() => { setMenuOpen(false); onOpenCourses(); }}
            >
              <Icon name="graduation" size={18} strokeWidth={1.5} />
              <span>{t('header.learning')}</span>
              <Icon name="arrow-right" size={14} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              className="fab-menu__big-action"
              onClick={() => { setMenuOpen(false); onOpenLibrary(); }}
            >
              <Icon name="books" size={18} strokeWidth={1.5} />
              <span>{t('header.library')}</span>
              <Icon name="arrow-right" size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* Updates bottom sheet (mobile) */}
      <BottomSheet
        isOpen={updatesOpen}
        onClose={() => setUpdatesOpen(false)}
        title={t('category.updatesTitle')}
        icon="flash"
        className="bsheet--updates"
      >
        <WhatsNewPanel
          onSelectNode={(id) => { onSelectNode?.(id); setUpdatesOpen(false); }}
          onClose={() => setUpdatesOpen(false)}
          onOpenArchive={() => { setUpdatesOpen(false); onOpenArchive?.(); }}
        />
      </BottomSheet>

      <BottomSheet
        isOpen={promptsOpen}
        onClose={() => setPromptsOpen(false)}
        title={t('mobile.promptsTitle')}
        icon="flash"
        className="bsheet--prompts"
      >
        <p className="fab-prompts__hint">{t('mobile.promptsHint')}</p>
        <div className="fab-prompts__list">
          {readyPrompts.map((struct) => {
            const p = getLocalizedFeaturedPrompt(struct.id, locale);
            return (
              <button
                key={struct.id}
                type="button"
                className="fab-prompts__item"
                onClick={() => {
                  setPromptsOpen(false);
                  onOpenPrompt?.(p);
                }}
              >
                <span className="fab-prompts__item-icon" aria-hidden="true">
                  <Icon name={struct.icon} size={18} strokeWidth={1.5} />
                </span>
                <span className="fab-prompts__item-main">
                  <span className="fab-prompts__item-title">{p?.title}</span>
                  <span className="fab-prompts__item-desc">{p?.description}</span>
                </span>
                <Icon name="arrow-right" size={14} strokeWidth={1.5} />
              </button>
            );
          })}
        </div>
      </BottomSheet>
    </>
  );
}

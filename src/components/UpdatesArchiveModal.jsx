import React, { useState, useEffect } from 'react';
import { WHATS_NEW } from '../data/whatsNew.js';
import { nodeIndex } from '../data/mindmapData.js';
import { useT } from '../i18n/LocaleContext.jsx';
import { useLocale } from '../i18n/LocaleContext.jsx';
import { useWhatsNew } from '../hooks/useWhatsNew.js';
import Icon from './Icon.jsx';

const PAGE_SIZE = 10;

export default function UpdatesArchiveModal({ onSelectNode, onClose }) {
  const t = useT();
  const { locale } = useLocale();
  const { isNew, markSeen } = useWhatsNew();
  const [page, setPage] = useState(1);
  const [titles, setTitles] = useState({});

  useEffect(() => {
    import(`../locales/${locale}/nodes.json`).then(m => {
      const map = {};
      Object.entries(WHATS_NEW).forEach(([id]) => {
        map[id] = m.default?.[id]?.title || m[id]?.title || id;
      });
      setTitles(map);
    }).catch(() => {});
  }, [locale]);

  // Esc to close
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const allEntries = Object.entries(WHATS_NEW)
    .sort((a, b) => b[1].date.localeCompare(a[1].date));

  const totalPages = Math.max(1, Math.ceil(allEntries.length / PAGE_SIZE));
  const pageEntries = allEntries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSelect = (id) => {
    markSeen(id);
    onSelectNode(id);
    onClose();
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(
      locale === 'ru' ? 'ru-RU' : locale === 'fi' ? 'fi-FI' : 'en-GB',
      { day: 'numeric', month: 'long', year: 'numeric' }
    );
  };

  const pageLabel = t('category.updatesArchivePage')
    .replace('{page}', page)
    .replace('{total}', totalPages);

  return (
    <div className="ua-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ua-modal" role="dialog" aria-modal="true" aria-label={t('category.updatesArchiveTitle')}>

        {/* Header */}
        <div className="ua-modal__header">
          <div className="ua-modal__header-left">
            <Icon name="archive" size={16} strokeWidth={1.5} />
            <h2 className="ua-modal__title">{t('category.updatesArchiveTitle')}</h2>
            <span className="ua-modal__total">{allEntries.length}</span>
          </div>
          <button type="button" className="ua-modal__close" onClick={onClose} aria-label="Close">
            <Icon name="close" size={16} strokeWidth={1.75} />
          </button>
        </div>

        {/* List */}
        <div className="ua-modal__body">
          {allEntries.length === 0 ? (
            <p className="ua-modal__empty">{t('category.updatesArchiveEmpty')}</p>
          ) : (
            <ul className="ua-modal__list">
              {pageEntries.map(([id, entry]) => {
                if (!nodeIndex[id]) return null;
                const unseen = isNew(id);
                return (
                  <li key={id}>
                    <button
                      type="button"
                      className={`ua-modal__item ${unseen ? 'is-unseen' : ''}`}
                      onClick={() => handleSelect(id)}
                    >
                      <span className={`wn-panel__badge wn-panel__badge--${entry.type}`}>
                        {entry.type === 'new' ? t('category.updatesNew') : t('category.updatesUpdated')}
                      </span>
                      <span className="ua-modal__item-title">{titles[id] || id}</span>
                      <span className="ua-modal__item-date">{formatDate(entry.date)}</span>
                      <Icon name="arrow-right" size={13} strokeWidth={1.5} className="ua-modal__item-arrow" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="ua-modal__pagination">
            <button
              type="button"
              className="ua-modal__page-btn"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
            >
              <Icon name="arrow-left" size={14} strokeWidth={1.75} />
            </button>

            <span className="ua-modal__page-label">{pageLabel}</span>

            <button
              type="button"
              className="ua-modal__page-btn"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Next page"
            >
              <Icon name="arrow-right" size={14} strokeWidth={1.75} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

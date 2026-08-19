import React, { useState, useEffect } from 'react';
import { WHATS_NEW } from '../data/whatsNew.js';
import { nodeIndex } from '../data/mindmapData.js';
import { useT, useLocale } from '../i18n/LocaleContext.jsx';
import { useWhatsNew } from '../hooks/useWhatsNew.js';
import { useFocusReturn } from '../hooks/useFocusReturn.js';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock.js';
import Icon from './Icon.jsx';

const PAGE_SIZE = 10;

export default function UpdatesArchiveModal({ onSelectNode, onOpenTutorial, onClose }) {
  const t = useT();
  const { locale } = useLocale();
  const { isNew, markSeen } = useWhatsNew();
  const [page, setPage] = useState(1);
  const [titles, setTitles] = useState({});
  useFocusReturn();
  useBodyScrollLock();

  useEffect(() => {
    // Узлы в 3 секциях — параллельная загрузка.
    Promise.all([
      import(`../locales/${locale}/nodes/core.json`).catch(() => ({ default: {} })),
      import(`../locales/${locale}/nodes/sys.json`).catch(() => ({ default: {} })),
      import(`../locales/${locale}/nodes/commerce.json`).catch(() => ({ default: {} })),
      import(`../locales/${locale}/tutorials/titles.json`).catch(() => ({ default: {} })),
    ]).then(([coreM, sysM, commerceM, titlesM]) => {
      const allNodes = { ...coreM.default, ...sysM.default, ...commerceM.default };
      const allTuts = titlesM.default || {};
      const map = {};
      Object.entries(WHATS_NEW).forEach(([id, entry]) => {
        map[id] = (entry.kind === 'tutorial' ? allTuts[id]?.title : allNodes[id]?.title) || id;
      });
      setTitles(map);
    }).catch(() => {});
  }, [locale]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Показываем и узлы, и туториалы. Отсев делаем ДО нарезки на страницы: раньше
  // запись без узла пропускалась внутри map, поэтому страницы с туториалами
  // выглядели пустыми, а счётчик обещал 366 записей.
  const allEntries = Object.entries(WHATS_NEW)
    .filter(([id, entry]) => entry.kind === 'tutorial' ? true : !!nodeIndex[id])
    .sort((a, b) => b[1].date.localeCompare(a[1].date));

  const totalPages = Math.max(1, Math.ceil(allEntries.length / PAGE_SIZE));
  const pageEntries = allEntries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSelect = (id, entry) => {
    markSeen(id);
    if (entry.kind === 'tutorial') onOpenTutorial?.(id);
    else onSelectNode(id);
    onClose();
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString(
      locale === 'ru' ? 'ru-RU' : locale === 'fi' ? 'fi-FI' : 'en-GB',
      { day: 'numeric', month: 'long', year: 'numeric' }
    );
  };

  const pageLabel = t('category.updatesArchivePage')
    .replace('{page}', page)
    .replace('{total}', totalPages);

  return (
    <div
      className="courses-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="archive-modal">

        {/* Header — same structure as help-modal__head */}
        <div className="archive-modal__head">
          <div className="help-modal__head-icon">
            <Icon name="archive" size={20} strokeWidth={1.5} />
          </div>
          <div className="help-modal__head-text">
            <h2>{t('category.updatesBtn')}</h2>
            <p>{t('category.updatesArchivePeriod')} · {allEntries.length} {t('category.updatesBtn').toLowerCase()}</p>
          </div>
          <button
            type="button"
            className="help-modal__close"
            onClick={onClose}
            aria-label={t('common.close')}
          >
            <Icon name="close" size={16} strokeWidth={1.75} />
          </button>
        </div>

        {/* Body */}
        <div className="archive-modal__body">
          {allEntries.length === 0 ? (
            <p className="archive-modal__empty">{t('category.updatesArchiveEmpty')}</p>
          ) : (
            <ul className="archive-modal__list">
              {pageEntries.map(([id, entry]) => {
                const unseen = isNew(id);
                return (
                  <li key={id}>
                    <button
                      type="button"
                      className={`archive-modal__item ${unseen ? 'is-unseen' : ''}`}
                      onClick={() => handleSelect(id, entry)}
                    >
                      <span className="archive-modal__item-top">
                        <span className={`wn-panel__badge wn-panel__badge--${entry.type}`}>
                          {entry.type === 'new' ? t('category.updatesNew') : t('category.updatesUpdated')}
                        </span>
                        <span className="archive-modal__item-date">{formatDate(entry.date)}</span>
                      </span>
                      <span className="archive-modal__item-title">
                        {titles[id] || id}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="archive-modal__pagination">
            <button
              type="button"
              className="archive-modal__page-btn"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <Icon name="arrow-left" size={14} strokeWidth={1.75} />
            </button>
            <span className="archive-modal__page-label">{pageLabel}</span>
            <button
              type="button"
              className="archive-modal__page-btn"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <Icon name="arrow-right" size={14} strokeWidth={1.75} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

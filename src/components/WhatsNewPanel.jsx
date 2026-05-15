import React from 'react';
import { WHATS_NEW } from '../data/whatsNew.js';
import { nodeIndex } from '../data/mindmapData.js';
import { useT } from '../i18n/LocaleContext.jsx';
import { useWhatsNew } from '../hooks/useWhatsNew.js';
import { useLocale } from '../i18n/LocaleContext.jsx';

const TTL_DAYS = 60;
const MAX_SHOWN = 10;

function isWithinTTL(dateStr) {
  const age = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
  return age <= TTL_DAYS;
}

export default function WhatsNewPanel({ onSelectNode, onClose, onOpenArchive }) {
  const t = useT();
  const { locale } = useLocale();
  const { isNew, markSeen } = useWhatsNew();

  const [titles, setTitles] = React.useState({});
  React.useEffect(() => {
    import(`../locales/${locale}/nodes.json`).then(m => {
      const map = {};
      Object.entries(WHATS_NEW).forEach(([id]) => {
        map[id] = m.default?.[id]?.title || m[id]?.title || id;
      });
      setTitles(map);
    }).catch(() => {});
  }, [locale]);

  // Filter by TTL, sort by date desc, cap at MAX_SHOWN
  const allEntries = Object.entries(WHATS_NEW)
    .filter(([, entry]) => isWithinTTL(entry.date))
    .sort((a, b) => b[1].date.localeCompare(a[1].date));

  const entries = allEntries.slice(0, MAX_SHOWN);
  const hiddenCount = allEntries.length - entries.length;

  const handleSelect = (id) => {
    markSeen(id);
    onSelectNode(id);
    onClose?.();
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(
      locale === 'ru' ? 'ru-RU' : locale === 'fi' ? 'fi-FI' : 'en-GB',
      { day: 'numeric', month: 'short' }
    );
  };

  return (
    <div className="wn-panel">
      <div className="wn-panel__header">
        <div className="wn-panel__header-text">
          <span className="wn-panel__title">{t('category.updatesTitle')}</span>
          <span className="wn-panel__period">{t('category.updatesPeriod')}</span>
        </div>
        {entries.length > 0 && (
          <span className="wn-panel__count">{entries.length}</span>
        )}
      </div>

      {entries.length === 0 ? (
        <p className="wn-panel__empty">{t('category.updatesEmpty')}</p>
      ) : (
        <>
          <ul className="wn-panel__list">
            {entries.map(([id, entry]) => {
              const unseen = isNew(id);
              if (!nodeIndex[id]) return null;
              return (
                <li key={id}>
                  <button
                    type="button"
                    className={`wn-panel__item ${unseen ? 'is-unseen' : ''}`}
                    onClick={() => handleSelect(id)}
                  >
                    <span className={`wn-panel__badge wn-panel__badge--${entry.type}`}>
                      {entry.type === 'new' ? t('category.updatesNew') : t('category.updatesUpdated')}
                    </span>
                    <span className="wn-panel__item-title">
                      {titles[id] || id}
                    </span>
                    <span className="wn-panel__item-date">{formatDate(entry.date)}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          {hiddenCount > 0 && (
            <p className="wn-panel__more">
              {t('category.updatesMore').replace('{n}', hiddenCount)}
            </p>
          )}
        </>
      )}

      <div className="wn-panel__footer">
        <button
          type="button"
          className="wn-panel__archive-btn"
          onClick={() => { onClose?.(); onOpenArchive?.(); }}
        >
          {t('category.updatesArchiveBtn')}
        </button>
      </div>
    </div>
  );
}

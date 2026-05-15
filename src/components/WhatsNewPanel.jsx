import React from 'react';
import { WHATS_NEW } from '../data/whatsNew.js';
import { nodeIndex } from '../data/mindmapData.js';
import { useT } from '../i18n/LocaleContext.jsx';
import { useWhatsNew } from '../hooks/useWhatsNew.js';
import { useLocale } from '../i18n/LocaleContext.jsx';

function getNodeTitle(id, locale) {
  try {
    // Dynamic import won't work synchronously — use a pre-loaded map instead
    return null;
  } catch {
    return null;
  }
}

export default function WhatsNewPanel({ onSelectNode, onClose }) {
  const t = useT();
  const { locale } = useLocale();
  const { isNew, markSeen } = useWhatsNew();

  // Load node titles from locale
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

  const entries = Object.entries(WHATS_NEW).sort((a, b) => {
    // new before updated, then by date desc
    if (a[1].type !== b[1].type) return a[1].type === 'new' ? -1 : 1;
    return b[1].date.localeCompare(a[1].date);
  });

  const handleSelect = (id) => {
    markSeen(id);
    onSelectNode(id);
    onClose?.();
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(locale === 'ru' ? 'ru-RU' : locale === 'fi' ? 'fi-FI' : 'en-GB', {
      day: 'numeric', month: 'short'
    });
  };

  return (
    <div className="wn-panel">
      <div className="wn-panel__header">
        <span className="wn-panel__title">{t('category.updatesTitle')}</span>
        <span className="wn-panel__count">{entries.length}</span>
      </div>

      {entries.length === 0 ? (
        <p className="wn-panel__empty">{t('category.updatesEmpty')}</p>
      ) : (
        <ul className="wn-panel__list">
          {entries.map(([id, entry]) => {
            const unseen = isNew(id);
            const node = nodeIndex[id];
            if (!node) return null;
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
      )}
    </div>
  );
}

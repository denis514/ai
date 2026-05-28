import React, { useEffect, useState } from 'react';
import Icon from '../../../components/Icon.jsx';
import { useT } from '../../../i18n/LocaleContext.jsx';
import { listWorkflows } from '../../services/workflowStorage.js';

/**
 * RecentWorkflows — полоса «Продолжить» в пустом холсте Builder.
 *
 * Показывает до `limit` последних сохранённых workflow (cloud если auth,
 * localStorage если anon). Клик по карточке → onOpen(id). Если сохранённых
 * нет — ничего не рендерит (пустой холст остаётся как был).
 *
 * Props:
 *  • userId    — id пользователя (null = anon → localStorage)
 *  • onOpen(id)— открыть workflow
 *  • limit     — сколько показать (default 4)
 */
export default function RecentWorkflows({ userId, onOpen, limit = 4, refreshKey }) {
  const t = useT();
  const [items, setItems] = useState(null);

  useEffect(() => {
    let alive = true;
    listWorkflows(userId)
      .then(list => { if (alive) setItems(list.slice(0, limit)); })
      .catch(() => { if (alive) setItems([]); });
    return () => { alive = false; };
  }, [userId, limit, refreshKey]);

  if (!items || items.length === 0) return null;

  const fmtDate = (ts) => {
    if (!ts) return '';
    try { return new Date(ts).toLocaleDateString(); } catch { return ''; }
  };

  return (
    <div className="builder-recent">
      <div className="builder-recent__label">
        {t('builder.recent.title') || 'Continue where you left off'}
      </div>
      <div className="builder-recent__grid">
        {items.map(w => (
          <button
            key={w.id}
            type="button"
            className="builder-recent__card"
            onClick={() => onOpen(w.id)}
            style={{ pointerEvents: 'auto' }}
          >
            <span className="builder-recent__card-icon" aria-hidden="true">
              <Icon name="folder" size={18} strokeWidth={1.5} />
            </span>
            <span className="builder-recent__card-main">
              <span className="builder-recent__card-name">{w.name}</span>
              <span className="builder-recent__card-date">{fmtDate(w.updatedAt)}</span>
            </span>
            <Icon name="arrow-right" size={14} strokeWidth={1.75} />
          </button>
        ))}
      </div>
    </div>
  );
}

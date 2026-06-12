import React from 'react';
import Icon from '../../../components/Icon.jsx';
import { useT } from '../../../i18n/LocaleContext.jsx';
import { TEMPLATES } from '../../data/templates.js';
import { listPublicTemplates } from '../../services/publicTemplateService.js';

/**
 * TemplateGallery — модалка с template cards.
 *
 * Опции:
 *  • Использовать template — загружает в canvas (через onUseTemplate callback)
 *  • Empty option — «Start from scratch» (просто закрывает модалку)
 *
 * Не использует existing Atlas modal components — builder-isolated UI.
 * Closes on Escape, on backdrop click, on close button.
 *
 * Phase B-1 Day 15-16.
 */

export default function TemplateGallery({ onUseTemplate, onUseCommunity, onScratch, onClose }) {
  const t = useT();
  const [community, setCommunity] = React.useState(null); // null=загрузка, []=пусто

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Шаблоны сообщества (одобренные). Тихо игнорируем ошибку/недоступность бэкенда.
  React.useEffect(() => {
    let alive = true;
    listPublicTemplates({ limit: 60 })
      .then(rows => { if (alive) setCommunity(rows); })
      .catch(() => { if (alive) setCommunity([]); });
    return () => { alive = false; };
  }, []);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div className="builder-modal-backdrop" onClick={handleBackdropClick}>
      <div className="builder-modal" role="dialog" aria-modal="true">
        <header className="builder-modal__header">
          <h2 className="builder-modal__title">
            {t('builder.gallery.title') || 'Templates'}
          </h2>
          <button
            type="button"
            className="builder-btn builder-btn--ghost builder-btn--small"
            onClick={onClose}
            aria-label={t('builder.gallery.close') || 'Close'}
          >
            <Icon name="close" size={14} strokeWidth={1.75} />
          </button>
        </header>

        <p className="builder-modal__subtitle">
          {t('builder.gallery.subtitle') || 'Start with a pre-built agent workflow, or build from scratch.'}
        </p>

        <div className="builder-template-grid">
          {TEMPLATES.map(template => (
            <button
              key={template.id}
              type="button"
              className="builder-template-card"
              onClick={() => onUseTemplate?.(template)}
            >
              <div className="builder-template-card__icon">
                <Icon name={template.iconName} size={22} strokeWidth={1.5} />
              </div>
              <div className="builder-template-card__body">
                <div className="builder-template-card__name">
                  {t(template.nameKey) || template.id}
                </div>
                <div className="builder-template-card__desc">
                  {t(template.descKey) || ''}
                </div>
                <div className="builder-template-card__meta">
                  <span className={`builder-difficulty builder-difficulty--${template.difficulty}`}>
                    {t(`builder.difficulty.${template.difficulty}`) || template.difficulty}
                  </span>
                  <span className="builder-template-card__count">
                    {template.nodes.length} {t(template.nodes.length === 1 ? 'builder.counter.node' : 'builder.counter.nodes') || (template.nodes.length === 1 ? 'node' : 'nodes')}
                  </span>
                </div>
              </div>
              <span className="builder-template-card__arrow" aria-hidden="true">
                <Icon name="arrow-right" size={14} strokeWidth={1.5} />
              </span>
            </button>
          ))}
        </div>

        {community && community.length > 0 && (
          <>
            <h3 className="builder-gallery__section">
              <Icon name="users" size={15} strokeWidth={1.6} />
              {t('builder.gallery.community') || 'От сообщества'}
            </h3>
            <div className="builder-template-grid">
              {community.map(item => {
                const count = Array.isArray(item.graph?.nodes) ? item.graph.nodes.length : 0;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className="builder-template-card"
                    onClick={() => onUseCommunity?.(item)}
                  >
                    <div className="builder-template-card__icon">
                      <Icon name="users" size={22} strokeWidth={1.5} />
                    </div>
                    <div className="builder-template-card__body">
                      <div className="builder-template-card__name">{item.title}</div>
                      <div className="builder-template-card__desc">
                        {item.author_name
                          ? (t('builder.gallery.byAuthor') || 'Автор: {name}').replace('{name}', item.author_name)
                          : (t('builder.gallery.byCommunity') || 'Из сообщества')}
                      </div>
                      <div className="builder-template-card__meta">
                        {item.difficulty && (
                          <span className={`builder-difficulty builder-difficulty--${item.difficulty}`}>
                            {t(`builder.difficulty.${item.difficulty}`) || item.difficulty}
                          </span>
                        )}
                        <span className="builder-template-card__count">
                          {count} {t(count === 1 ? 'builder.counter.node' : 'builder.counter.nodes') || (count === 1 ? 'node' : 'nodes')}
                        </span>
                      </div>
                    </div>
                    <span className="builder-template-card__arrow" aria-hidden="true">
                      <Icon name="arrow-right" size={14} strokeWidth={1.5} />
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        <footer className="builder-modal__footer">
          <button
            type="button"
            className="builder-btn builder-btn--ghost"
            onClick={onScratch}
          >
            {t('builder.gallery.scratch') || 'Start from scratch'}
          </button>
        </footer>
      </div>
    </div>
  );
}

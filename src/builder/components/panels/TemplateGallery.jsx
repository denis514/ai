import React, { useMemo, useState } from 'react';
import Icon from '../../../components/Icon.jsx';
import { useT } from '../../../i18n/LocaleContext.jsx';
import { TEMPLATES, TEMPLATE_CATEGORIES } from '../../data/templates.js';

/**
 * TemplateGallery — модалка с template cards.
 *
 * Опции:
 *  • Использовать template — загружает в canvas (через onUseTemplate callback)
 *  • Empty option — «Start from scratch» (просто закрывает модалку)
 *  • Фильтр по роду занятий — чипы над сеткой. Человек приходит с задачей
 *    («мне бы отвечать клиентам»), а не с типом схемы, поэтому категории
 *    названы по деятельности. Чипы — канонические `.chip` из стайлгайда.
 *
 * Не использует existing Atlas modal components — builder-isolated UI.
 * Closes on Escape, on backdrop click, on close button.
 *
 * Phase B-1 Day 15-16.
 */

export default function TemplateGallery({ onUseTemplate, onScratch, onClose }) {
  const t = useT();
  const [activeCat, setActiveCat] = useState('all');

  // Категории показываем только те, в которых реально есть шаблоны, — пустой
  // чип это обещание, за которым ничего нет.
  const cats = useMemo(
    () => TEMPLATE_CATEGORIES
      .map(c => ({ ...c, count: TEMPLATES.filter(x => x.category === c.id).length }))
      .filter(c => c.count > 0),
    []
  );
  const visible = useMemo(
    () => activeCat === 'all' ? TEMPLATES : TEMPLATES.filter(x => x.category === activeCat),
    [activeCat]
  );

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

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

        <p className="builder-modal__subtitle">
          {t('builder.gallery.catHint') || 'Выберите по своей задаче: чем вы занимаетесь, а не как устроена схема.'}
        </p>

        <div className="builder-gallery-cats" role="group" aria-label={t('builder.gallery.catsAria') || 'Категории шаблонов'}>
          <button
            type="button"
            className={`chip ${activeCat === 'all' ? 'is-active' : ''}`}
            onClick={() => setActiveCat('all')}
          >
            {t('builder.gallery.cat.all') || 'Все'} · {TEMPLATES.length}
          </button>
          {cats.map(c => (
            <button
              key={c.id}
              type="button"
              className={`chip ${activeCat === c.id ? 'is-active' : ''}`}
              onClick={() => setActiveCat(c.id)}
            >
              {t(c.labelKey) || c.id} · {c.count}
            </button>
          ))}
        </div>

        <div className="builder-template-grid">
          {visible.map(template => (
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

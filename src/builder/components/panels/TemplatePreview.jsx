import React, { useEffect } from 'react';
import Icon from '../../../components/Icon.jsx';
import { useT } from '../../../i18n/LocaleContext.jsx';
import { TEMPLATES } from '../../data/templates.js';

/**
 * TemplatePreview — модальное превью одного шаблона перед использованием.
 *
 *  • Показывает, ЧТО за шаблон (иконка, имя, описание, сложность, число узлов).
 *  • Кнопка «Использовать шаблон» — загружает его на холст.
 *  • Стрелки ‹ › (и клавиши ←/→) листают шаблоны; родитель синхронно
 *    подсвечивает текущий в левом списке (через onIndex).
 */
export default function TemplatePreview({ index, onIndex, onUse, onClose }) {
  const t = useT();
  const total = TEMPLATES.length;
  const tpl = TEMPLATES[index];

  const prev = () => onIndex((index - 1 + total) % total);
  const next = () => onIndex((index + 1) % total);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
      else if (e.key === 'ArrowRight') onIndex((index + 1) % total);
      else if (e.key === 'ArrowLeft') onIndex((index - 1 + total) % total);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, total, onIndex, onClose]);

  if (!tpl) return null;

  return (
    <div className="builder-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="builder-modal builder-tpl-preview" role="dialog" aria-modal="true">
        <header className="builder-modal__header">
          <h2 className="builder-modal__title">{t('builder.gallery.title') || 'Шаблоны'}</h2>
          <button
            type="button"
            className="builder-btn builder-btn--ghost builder-btn--small"
            onClick={onClose}
            aria-label={t('builder.gallery.close') || 'Закрыть'}
          >
            <Icon name="close" size={14} strokeWidth={1.75} />
          </button>
        </header>

        <div className="builder-tpl-preview__body">
          <div className="builder-tpl-preview__icon">
            <Icon name={tpl.iconName} size={30} strokeWidth={1.4} />
          </div>
          <div className="builder-tpl-preview__name">{t(tpl.nameKey) || tpl.id}</div>
          <div className="builder-tpl-preview__meta">
            <span className={`builder-difficulty builder-difficulty--${tpl.difficulty}`}>
              {t(`builder.difficulty.${tpl.difficulty}`) || tpl.difficulty}
            </span>
            <span className="builder-tpl-preview__count">
              {tpl.nodes.length} {t(tpl.nodes.length === 1 ? 'builder.counter.node' : 'builder.counter.nodes') || 'узлов'}
            </span>
          </div>
          <p className="builder-tpl-preview__desc">{t(tpl.descKey) || ''}</p>
        </div>

        <div className="builder-tpl-preview__nav">
          <button type="button" className="builder-tpl-preview__arrow" onClick={prev} aria-label={t('common.prev') || 'Назад'}>
            <Icon name="arrow-left" size={16} strokeWidth={1.75} />
          </button>
          <span className="builder-tpl-preview__counter">{index + 1} / {total}</span>
          <button type="button" className="builder-tpl-preview__arrow" onClick={next} aria-label={t('common.next') || 'Вперёд'}>
            <Icon name="arrow-right" size={16} strokeWidth={1.75} />
          </button>
        </div>

        <footer className="builder-modal__footer">
          <button type="button" className="builder-btn builder-btn--primary" onClick={() => onUse?.(tpl)}>
            <Icon name="check" size={14} strokeWidth={1.75} />
            <span>{t('builder.gallery.use') || 'Использовать шаблон'}</span>
          </button>
        </footer>
      </div>
    </div>
  );
}

import React from 'react';
import Icon from './Icon.jsx';
import { useT } from '../i18n/LocaleContext.jsx';

/**
 * Footer-навигация для DetailPanel / BottomSheet: ← Назад / Далее →.
 */
export default function DetailNavFooter({ prev, next, onGo }) {
  const t = useT();
  if (!prev && !next) return null;
  const prevTitle = prev ? t(`nodes.${prev.id}.title`) : '';
  const nextTitle = next ? t(`nodes.${next.id}.title`) : '';

  return (
    <nav className="detail-nav" aria-label={t('nav.byNodes')}>
      <button
        type="button"
        className="detail-nav__btn detail-nav__btn--prev"
        disabled={!prev}
        onClick={() => prev && onGo(prev.id)}
        title={prev ? t('nav.prevTitle', { title: prevTitle }) : t('nav.prevEmpty')}
      >
        <Icon name="arrow-left" size={14} strokeWidth={1.5} />
        <span className="detail-nav__label">
          <span className="detail-nav__caption">{t('common.back')}</span>
          {prev && <span className="detail-nav__title">{prevTitle}</span>}
        </span>
      </button>

      <button
        type="button"
        className="detail-nav__btn detail-nav__btn--next"
        disabled={!next}
        onClick={() => next && onGo(next.id)}
        title={next ? t('nav.nextTitle', { title: nextTitle }) : t('nav.nextEmpty')}
      >
        <span className="detail-nav__label">
          <span className="detail-nav__caption">{t('common.next')}</span>
          {next && <span className="detail-nav__title">{nextTitle}</span>}
        </span>
        <Icon name="arrow-right" size={14} strokeWidth={1.5} />
      </button>
    </nav>
  );
}

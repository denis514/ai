import React from 'react';
import Icon from './Icon.jsx';
import { useT } from '../i18n/LocaleContext.jsx';

/**
 * UpdateBanner — тонкий баннер снизу экрана.
 * Показывается когда useVersionCheck обнаружил новый деплой.
 * Предлагает перезагрузить страницу.
 */
export default function UpdateBanner({ onReload, onDismiss }) {
  const t = useT();

  return (
    <div className="update-banner" role="alert" aria-live="polite">
      <span className="update-banner__icon" aria-hidden="true">
        <Icon name="refresh" size={15} strokeWidth={2} />
      </span>
      <span className="update-banner__text">
        {t('app.updateAvailable')}
      </span>
      <button
        type="button"
        className="update-banner__reload"
        onClick={onReload}
      >
        {t('app.updateReload')}
      </button>
      <button
        type="button"
        className="update-banner__dismiss"
        onClick={onDismiss}
        aria-label={t('common.close')}
      >
        <Icon name="close" size={14} strokeWidth={2} />
      </button>
    </div>
  );
}

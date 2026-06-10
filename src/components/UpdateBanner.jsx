import React from 'react';
import Icon from './Icon.jsx';
import { useT } from '../i18n/LocaleContext.jsx';

/**
 * UpdateBanner — баннер снизу экрана при обнаружении нового деплоя.
 * Обновление ОБЯЗАТЕЛЬНОЕ: закрыть нельзя (нет ×), единственное действие —
 * перезагрузить страницу. Иначе старый код может работать некорректно
 * со свежим контентом/бэкендом.
 */
export default function UpdateBanner({ onReload }) {
  const t = useT();

  return (
    <div className="update-banner update-banner--forced" role="alertdialog" aria-live="assertive">
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
        autoFocus
      >
        {t('app.updateReload')}
      </button>
    </div>
  );
}

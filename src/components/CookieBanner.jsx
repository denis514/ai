import React from 'react';
import Icon from './Icon.jsx';
import { useT } from '../i18n/LocaleContext.jsx';

export default function CookieBanner({ onAccept, onDecline }) {
  const t = useT();

  return (
    <div className="cookie-banner" role="dialog" aria-label={t('cookie.accept')}>
      <div className="cookie-banner__inner">

        <div className="cookie-banner__icon">
          <Icon name="shield" size={18} strokeWidth={1.5} />
        </div>

        {/* dangerouslySetInnerHTML — текст содержит <strong>Google Analytics</strong> */}
        <p
          className="cookie-banner__text"
          dangerouslySetInnerHTML={{ __html: t('cookie.text') }}
        />

        <div className="cookie-banner__actions">
          <button
            className="cookie-banner__btn cookie-banner__btn--accept"
            onClick={onAccept}
          >
            {t('cookie.accept')}
          </button>
          <button
            className="cookie-banner__btn cookie-banner__btn--decline"
            onClick={onDecline}
          >
            {t('cookie.decline')}
          </button>
        </div>

      </div>
    </div>
  );
}

import React from 'react';
import Icon from './Icon.jsx';

export default function CookieBanner({ onAccept, onDecline }) {
  return (
    <div className="cookie-banner" role="dialog" aria-label="Согласие на использование cookie">
      <div className="cookie-banner__inner">

        <div className="cookie-banner__icon">
          <Icon name="shield" size={18} strokeWidth={1.5} />
        </div>

        <p className="cookie-banner__text">
          We use <strong>Google Analytics</strong> to understand how visitors interact
          with the site. Data is anonymous and never shared with third parties.
          Session data (login status) is stored locally and never transmitted.
        </p>

        <div className="cookie-banner__actions">
          <button
            className="cookie-banner__btn cookie-banner__btn--accept"
            onClick={onAccept}
          >
            Accept
          </button>
          <button
            className="cookie-banner__btn cookie-banner__btn--decline"
            onClick={onDecline}
          >
            Decline
          </button>
        </div>

      </div>
    </div>
  );
}

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
          Мы используем <strong>Google Analytics</strong>, чтобы понимать, как пользователи
          взаимодействуют с сайтом. Данные анонимны и не передаются третьим лицам.
          Технические данные (статус входа) хранятся локально и не отправляются.
        </p>

        <div className="cookie-banner__actions">
          <button
            className="cookie-banner__btn cookie-banner__btn--accept"
            onClick={onAccept}
          >
            Принять
          </button>
          <button
            className="cookie-banner__btn cookie-banner__btn--decline"
            onClick={onDecline}
          >
            Отклонить
          </button>
        </div>

      </div>
    </div>
  );
}

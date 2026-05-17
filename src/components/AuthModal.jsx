import React, { useEffect, useState } from 'react';
import Icon from './Icon.jsx';
import { sendMagicLink } from '../services/authService.js';
import { useT } from '../i18n/LocaleContext.jsx';

/**
 * AuthModal — модалка входа через Magic Link.
 *
 * Шаги:
 *   'email'   — ввод email + галочка согласия
 *   'sent'    — подтверждение «письмо отправлено»
 *
 * Стилизована как остальные модалки (courses-overlay / help-modal pattern).
 */
export default function AuthModal({ onClose }) {
  const t = useT();

  const [step, setStep] = useState('email'); // 'email' | 'sent'
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Закрыть по Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError(t('auth.errorInvalidEmail'));
      return;
    }
    if (!consent) {
      setError(t('auth.errorConsent'));
      return;
    }

    setLoading(true);
    const { error: err } = await sendMagicLink(email, consent);
    setLoading(false);

    if (err) {
      setError(err);
      return;
    }
    setStep('sent');
  };

  return (
    <div
      className="courses-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="auth-modal">
        {/* Заголовок */}
        <header className="auth-modal__head">
          <span className="auth-modal__head-icon" aria-hidden="true">
            <Icon name="lock" size={20} strokeWidth={1.5} />
          </span>
          <div className="auth-modal__head-text">
            <h2 id="auth-modal-title">
              {step === 'email' ? t('auth.title') : t('auth.sentTitle')}
            </h2>
            <p>
              {step === 'email' ? t('auth.subtitle') : t('auth.sentSubtitle', { email })}
            </p>
          </div>
          <button
            type="button"
            className="courses-close"
            onClick={onClose}
            aria-label={t('common.close')}
          >
            <Icon name="close" size={20} strokeWidth={1.75} />
          </button>
        </header>

        {/* Контент */}
        <div className="auth-modal__body">
          {step === 'email' ? (
            <form className="auth-modal__form" onSubmit={handleSubmit} noValidate>
              <label className="auth-modal__label" htmlFor="auth-email">
                {t('auth.emailLabel')}
              </label>
              <input
                id="auth-email"
                className="auth-modal__input"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="you@example.com"
                autoFocus
                autoComplete="email"
                inputMode="email"
                disabled={loading}
              />

              <label className="auth-modal__consent">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => { setConsent(e.target.checked); setError(''); }}
                  disabled={loading}
                />
                <span>
                  {t('auth.consentText')}{' '}
                  <a
                    href="/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="auth-modal__link"
                  >
                    {t('auth.privacyPolicy')}
                  </a>
                  {'. '}
                  {t('auth.consentGdpr')}
                </span>
              </label>

              {error && (
                <p className="auth-modal__error" role="alert">
                  <Icon name="warning" size={14} strokeWidth={1.75} />
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="auth-modal__submit"
                disabled={loading || !email.trim() || !consent}
              >
                {loading ? (
                  <><Icon name="refresh" size={16} strokeWidth={1.75} /> {t('auth.sending')}</>
                ) : (
                  <><Icon name="send" size={16} strokeWidth={1.75} /> {t('auth.sendLink')}</>
                )}
              </button>

              <p className="auth-modal__hint">
                <Icon name="info" size={13} strokeWidth={1.5} />
                {t('auth.magicLinkHint')}
              </p>
            </form>
          ) : (
            <div className="auth-modal__sent">
              <div className="auth-modal__sent-icon" aria-hidden="true">
                <Icon name="mail" size={48} strokeWidth={1} />
              </div>
              <h3>{t('auth.sentHeading')}</h3>
              <p>{t('auth.sentBody', { email })}</p>
              <p className="auth-modal__sent-hint">{t('auth.sentSpam')}</p>
              <button
                type="button"
                className="auth-modal__resend"
                onClick={() => { setStep('email'); setError(''); }}
              >
                {t('auth.resend')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

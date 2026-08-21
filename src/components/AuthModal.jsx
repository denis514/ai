import React, { useEffect, useState } from 'react';
import Icon from './Icon.jsx';
import { sendMagicLink, signInWithGoogle, signInWithApple, getGoogleOAuthUrl } from '../services/authService.js';
import { useT } from '../i18n/LocaleContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useFocusReturn } from '../hooks/useFocusReturn.js';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock.js';
import { openCenteredPopup, popupRedirectTo, OAUTH_DONE_MESSAGE } from '../lib/oauthPopup.js';

// «Войти через Apple» — кнопка и логика готовы, но провайдер Apple ещё не
// настроен (нужен платный Apple Developer аккаунт + конфиг в Supabase, см.
// docs/auth-apple-setup.md). Пока скрываем, чтобы не показывать нерабочую
// кнопку. Переключить в true ПОСЛЕ настройки провайдера.
const APPLE_SIGNIN_ENABLED = false;

/**
 * AuthModal — модалка входа.
 *
 * Варианты входа:
 *   1. Google OAuth (основной) — редирект → Google → обратно
 *   2. Magic Link (fallback) — email → письмо → ссылка
 *
 * Шаги Magic Link:
 *   'email'   — ввод email + галочка согласия
 *   'sent'    — подтверждение «письмо отправлено»
 */
export default function AuthModal({ onClose }) {
  const t = useT();
  const { user } = useAuth();
  useFocusReturn();
  useBodyScrollLock();

  // Вход во всплывающем окне завершён → закрываем модалку, как только появился
  // пользователь (сессия синхронизируется из попапа через localStorage).
  useEffect(() => { if (user) onClose?.(); }, [user, onClose]);

  const [step, setStep] = useState('email'); // 'email' | 'sent'
  const [email, setEmail] = useState('');
  // Единое GDPR-согласие: покрывает оба метода входа (Google + Magic Link)
  const [consent, setConsent] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [error, setError] = useState('');

  // Оба условия должны быть выполнены для любого метода входа
  const canProceed = consent && ageConfirmed;

  // Закрыть по Escape. AuthModal — topmost layer когда открыт; перехватываем
  // ESC через capture+stopImmediatePropagation, чтобы он НЕ доходил до
  // модала под ним (туториал, интро), который тоже слушает Escape.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  const handleGoogle = async () => {
    if (!canProceed) { setError(t('auth.errorConsent')); return; }
    setError('');
    setGoogleLoading(true);

    // На мобильных попапы ненадёжны (часто открываются вкладкой/блокируются) —
    // оставляем привычный полноэкранный редирект.
    const isMobile = typeof window !== 'undefined'
      && window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
      const { error: err } = await signInWithGoogle();
      setGoogleLoading(false);
      if (err) setError(err);
      return; // редирект уведёт страницу
    }

    // Десктоп: открываем попап СИНХРОННО (до await), иначе блокировщик зарежет.
    const popup = openCenteredPopup();
    const { error: err, url } = await getGoogleOAuthUrl(popupRedirectTo());
    if (err || !url) {
      try { popup && popup.close(); } catch { /* noop */ }
      setGoogleLoading(false);
      setError(err || t('auth.errorGeneric') || 'Не удалось начать вход');
      return;
    }
    if (!popup || popup.closed) {
      // Попап заблокирован → откатываемся на обычный редирект на тот же URL.
      window.location.href = url;
      return;
    }
    try { popup.location.href = url; } catch { window.location.href = url; return; }

    // Если пользователь закрыл попап, не завершив вход — снимаем загрузку.
    const poll = setInterval(() => {
      if (popup.closed) { clearInterval(poll); setGoogleLoading(false); }
    }, 600);
    // Успех придёт через onAuthStateChange (useEffect выше закроет модалку) +
    // сообщение из попапа (на случай задержки синхронизации).
    const onMsg = (e) => {
      if (e.origin === window.location.origin && e.data === OAUTH_DONE_MESSAGE) {
        clearInterval(poll);
        window.removeEventListener('message', onMsg);
        setGoogleLoading(false);
      }
    };
    window.addEventListener('message', onMsg);
  };

  const handleApple = async () => {
    if (!canProceed) { setError(t('auth.errorConsent')); return; }
    setError('');
    setAppleLoading(true);
    const { error: err } = await signInWithApple();
    setAppleLoading(false);
    if (err) setError(err);
    // При успехе — браузер уйдёт на Apple, onClose не нужен
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !email.includes('@')) {
      setError(t('auth.errorInvalidEmail'));
      return;
    }
    if (!canProceed) {
      setError(t('auth.errorConsent'));
      return;
    }
    setLoading(true);
    const { error: err } = await sendMagicLink(email, consent);
    setLoading(false);
    if (err) { setError(err); return; }
    setStep('sent');
  };

  return (
    <div
      className="courses-overlay auth-overlay"
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
            <>
              {/* ── GDPR: единое согласие для обоих методов ── */}
              <div className="auth-modal__gdpr">
                <label className="auth-modal__consent">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => { setConsent(e.target.checked); setError(''); }}
                  />
                  <span>
                    {t('auth.consentText')}{' '}
                    <a href="/privacy-policy" target="_blank" rel="noopener noreferrer"
                      className="auth-modal__link">{t('auth.privacyPolicy')}</a>
                    {/* consentGdpr: пустая строка → ничего не рендерится; FI → «& GDPR» со ссылкой */}
                    {t('auth.consentGdpr') && <>{' '}<span dangerouslySetInnerHTML={{ __html: t('auth.consentGdpr') }} /></>}
                  </span>
                </label>
                <label className="auth-modal__consent">
                  <input
                    type="checkbox"
                    checked={ageConfirmed}
                    onChange={(e) => { setAgeConfirmed(e.target.checked); setError(''); }}
                  />
                  {/* ageConfirm может содержать HTML-ссылки (напр. FI ссылка на GDPR Art. 8) */}
                  <span dangerouslySetInnerHTML={{ __html: t('auth.ageConfirm') }} />
                </label>
              </div>

              {/* ── Google OAuth ── */}
              <button
                type="button"
                className="auth-google-btn"
                onClick={handleGoogle}
                disabled={googleLoading || loading || !canProceed}
                title={!canProceed ? t('auth.errorConsent') : ''}
              >
                {googleLoading ? (
                  <Icon name="refresh" size={18} strokeWidth={1.75} />
                ) : (
                  <svg className="auth-google-btn__icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                <span>{googleLoading ? t('auth.connecting') : t('auth.continueGoogle')}</span>
              </button>

              {/* ── Apple Sign-In (скрыта до настройки провайдера, см. флаг выше) ── */}
              {APPLE_SIGNIN_ENABLED && (
              <button
                type="button"
                className="auth-apple-btn"
                onClick={handleApple}
                disabled={appleLoading || loading || !canProceed}
                title={!canProceed ? t('auth.errorConsent') : ''}
              >
                {appleLoading ? (
                  <Icon name="refresh" size={18} strokeWidth={1.75} />
                ) : (
                  <svg className="auth-apple-btn__icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="currentColor" d="M17.05 12.04c-.03-2.43 1.99-3.6 2.08-3.66-1.13-1.66-2.9-1.89-3.52-1.91-1.5-.15-2.93.88-3.69.88-.76 0-1.93-.86-3.18-.84-1.63.02-3.14.95-3.98 2.41-1.7 2.95-.43 7.31 1.22 9.7.81 1.17 1.77 2.48 3.03 2.43 1.22-.05 1.68-.79 3.15-.79 1.47 0 1.88.79 3.16.76 1.31-.02 2.14-1.19 2.94-2.37.93-1.36 1.31-2.68 1.33-2.75-.03-.01-2.55-.98-2.58-3.9zM14.62 4.84c.67-.81 1.12-1.94.99-3.06-.96.04-2.13.64-2.82 1.45-.62.72-1.16 1.87-1.02 2.97 1.07.08 2.17-.55 2.85-1.36z"/>
                  </svg>
                )}
                <span>{appleLoading ? t('auth.connecting') : (t('auth.continueApple') || 'Войти через Apple')}</span>
              </button>
              )}

              {/* ── Разделитель ── */}
              <div className="auth-divider">
                <span>{t('auth.orEmail')}</span>
              </div>

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

                {error && (
                  <p className="auth-modal__error" role="alert">
                    <Icon name="warning" size={14} strokeWidth={1.75} />
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="auth-modal__submit"
                  disabled={loading || !email.trim() || !canProceed}
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
            </>
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

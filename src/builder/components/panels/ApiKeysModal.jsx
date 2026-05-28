import React, { useEffect, useState, useCallback } from 'react';
import Icon from '../../../components/Icon.jsx';
import { useT } from '../../../i18n/LocaleContext.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { connectKey, disconnectKey, getKeyStatus } from '../../services/apiKeyService.js';

/**
 * ApiKeysModal — управление API-ключом Claude для реального запуска.
 *
 * Ключ вводится, отправляется на сервер (валидация + шифрование), в браузере
 * не хранится. Показывает статус «подключён ••••XXXX» / форму ввода.
 *
 * Props: onClose()
 */
export default function ApiKeysModal({ onClose, onSignIn }) {
  const t = useT();
  const { isLoggedIn } = useAuth();
  const [status, setStatus] = useState(null);   // null=loading | {connected, hint}
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // Telegram (доставка результата) — отдельный провайдер.
  const [tgStatus, setTgStatus] = useState(null);
  const [tgDraft, setTgDraft] = useState('');
  const [tgBusy, setTgBusy] = useState(false);
  const [tgError, setTgError] = useState(null);

  const refresh = useCallback(() => {
    getKeyStatus('anthropic')
      .then(setStatus)
      .catch(() => setStatus({ connected: false, hint: null }));
    getKeyStatus('telegram')
      .then(setTgStatus)
      .catch(() => setTgStatus({ connected: false, hint: null }));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const errMessage = useCallback((code) => {
    const map = {
      key_rejected: t('builder.keys.errRejected') || 'Claude rejected this key. Check it and try again.',
      invalid_key_format: t('builder.keys.errFormat') || 'This does not look like a valid key.',
      not_authenticated: t('builder.keys.errAuth') || 'Sign in first to connect a key.',
      backend_unavailable: t('builder.keys.errBackend') || 'Backend is not available right now.',
      server_misconfigured: t('builder.keys.errServer') || 'Server is not configured yet.',
    };
    return map[code] || (t('builder.keys.errGeneric') || 'Something went wrong. Try again.');
  }, [t]);

  const handleConnect = useCallback(async () => {
    const key = draft.trim();
    if (!key) return;
    setBusy(true); setError(null);
    try {
      await connectKey(key, 'anthropic');
      setDraft('');
      refresh();
    } catch (e) {
      setError(errMessage(e.code || e.message));
    } finally {
      setBusy(false);
    }
  }, [draft, refresh, errMessage]);

  const handleDisconnect = useCallback(async () => {
    setBusy(true); setError(null);
    try {
      await disconnectKey('anthropic');
      refresh();
    } catch (e) {
      setError(errMessage(e.code || e.message));
    } finally {
      setBusy(false);
    }
  }, [refresh, errMessage]);

  const tgErrMessage = useCallback((code) => {
    const map = {
      key_rejected: t('builder.keys.tgErrRejected') || 'Telegram отклонил этот токен. Проверьте и попробуйте снова.',
      invalid_key_format: t('builder.keys.tgErrFormat') || 'Это не похоже на токен бота.',
      unsupported_provider: t('builder.keys.tgErrUnsupported') || 'Сервер ещё не обновлён для Telegram — нужно переразвернуть функцию подключения ключа.',
      storage_failed: t('builder.keys.tgErrStorage') || 'Не удалось сохранить токен на сервере.',
      not_authenticated: t('builder.keys.errAuth') || 'Sign in first to connect a key.',
      unauthorized: t('builder.keys.errAuth') || 'Sign in first to connect a key.',
      backend_unavailable: t('builder.keys.errBackend') || 'Backend is not available right now.',
      server_misconfigured: t('builder.keys.errServer') || 'Server is not configured yet.',
    };
    // Для неизвестных кодов показываем сам код — чтобы быстро диагностировать.
    return map[code] || `${t('builder.keys.errGeneric') || 'Something went wrong. Try again.'} (${code})`;
  }, [t]);

  const handleTgConnect = useCallback(async () => {
    const tok = tgDraft.trim();
    if (!tok) return;
    setTgBusy(true); setTgError(null);
    try {
      await connectKey(tok, 'telegram');
      setTgDraft('');
      refresh();
    } catch (e) {
      setTgError(tgErrMessage(e.code || e.message));
    } finally {
      setTgBusy(false);
    }
  }, [tgDraft, refresh, tgErrMessage]);

  const handleTgDisconnect = useCallback(async () => {
    setTgBusy(true); setTgError(null);
    try {
      await disconnectKey('telegram');
      refresh();
    } catch (e) {
      setTgError(tgErrMessage(e.code || e.message));
    } finally {
      setTgBusy(false);
    }
  }, [refresh, tgErrMessage]);

  return (
    <div className="builder-name-modal__overlay" onClick={onClose}>
      <div
        className="builder-name-modal builder-keys-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t('builder.keys.title') || 'API keys'}
      >
        <h3 className="builder-name-modal__title">
          {t('builder.keys.title') || 'Connect your Claude key'}
        </h3>
        <p className="builder-name-modal__hint">
          {t('builder.keys.desc') || 'Needed to run workflows for real. Your key is encrypted on the server and never stored in the browser.'}
        </p>

        {!isLoggedIn ? (
          <div className="builder-keys__notice">
            <p style={{ margin: '0 0 12px' }}>
              {t('builder.keys.signInFirst') || 'Sign in to connect a key.'}
            </p>
            <button
              type="button"
              className="builder-btn builder-btn--primary"
              onClick={() => onSignIn?.()}
            >
              <Icon name="lock" size={14} strokeWidth={1.5} />
              {t('builder.keys.signInBtn') || 'Sign in'}
            </button>
          </div>
        ) : status === null ? (
          <div className="builder-keys__notice">{t('builder.keys.loading') || 'Loading…'}</div>
        ) : status.connected ? (
          <div className="builder-keys__connected">
            <span className="builder-keys__badge">
              <Icon name="check-circle" size={16} strokeWidth={1.75} />
              {t('builder.keys.connected') || 'Connected'} ••••{status.hint}
            </span>
            <button
              type="button"
              className="builder-btn builder-btn--ghost"
              onClick={handleDisconnect}
              disabled={busy}
            >
              {t('builder.keys.disconnect') || 'Disconnect'}
            </button>
          </div>
        ) : (
          <div className="builder-keys__form">
            <input
              type="password"
              className="builder-name-modal__input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && draft.trim()) handleConnect(); }}
              placeholder={t('builder.keys.placeholder') || 'sk-ant-...'}
              autoComplete="off"
              spellCheck={false}
              disabled={busy}
            />
            <button
              type="button"
              className="builder-btn builder-btn--primary"
              onClick={handleConnect}
              disabled={busy || !draft.trim()}
            >
              {busy ? (t('builder.keys.connecting') || 'Checking…') : (t('builder.keys.connect') || 'Connect')}
            </button>
          </div>
        )}

        {error && <div className="builder-keys__error">{error}</div>}

        {/* ── Telegram (доставка результата) ── */}
        {isLoggedIn && (
          <div className="builder-keys__provider">
            <h4 className="builder-keys__provider-title">
              <Icon name="send" size={14} strokeWidth={1.75} />
              {t('builder.keys.tgTitle') || 'Telegram-доставка (необязательно)'}
            </h4>
            <p className="builder-name-modal__hint" style={{ marginTop: 0 }}>
              {t('builder.keys.tgDesc') || 'Подключите токен бота, чтобы узел «Telegram» слал результат в чат. Токен шифруется на сервере.'}
            </p>
            {tgStatus === null ? (
              <div className="builder-keys__notice">{t('builder.keys.loading') || 'Loading…'}</div>
            ) : tgStatus.connected ? (
              <div className="builder-keys__connected">
                <span className="builder-keys__badge">
                  <Icon name="check-circle" size={16} strokeWidth={1.75} />
                  {t('builder.keys.connected') || 'Connected'} ••••{tgStatus.hint}
                </span>
                <button type="button" className="builder-btn builder-btn--ghost" onClick={handleTgDisconnect} disabled={tgBusy}>
                  {t('builder.keys.disconnect') || 'Disconnect'}
                </button>
              </div>
            ) : (
              <div className="builder-keys__form">
                <input
                  type="password"
                  className="builder-name-modal__input"
                  value={tgDraft}
                  onChange={(e) => setTgDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && tgDraft.trim()) handleTgConnect(); }}
                  placeholder={t('builder.keys.tgPlaceholder') || '123456:ABC-DEF...'}
                  autoComplete="off"
                  spellCheck={false}
                  disabled={tgBusy}
                />
                <button type="button" className="builder-btn builder-btn--primary" onClick={handleTgConnect} disabled={tgBusy || !tgDraft.trim()}>
                  {tgBusy ? (t('builder.keys.connecting') || 'Checking…') : (t('builder.keys.connect') || 'Connect')}
                </button>
              </div>
            )}
            {tgError && <div className="builder-keys__error">{tgError}</div>}
          </div>
        )}

        <div className="builder-name-modal__actions">
          <button type="button" className="builder-btn builder-btn--ghost" onClick={onClose}>
            {t('builder.keys.close') || 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}

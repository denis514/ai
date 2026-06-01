import React, { useEffect, useState, useCallback } from 'react';
import Icon from '../../../components/Icon.jsx';
import { useT } from '../../../i18n/LocaleContext.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { connectKey, disconnectKey, getKeyStatus, connectGoogleCalendar } from '../../services/apiKeyService.js';

/**
 * ApiKeysModal — каталог коннекторов в стиле Claude Directory.
 *
 * Сетка карточек с логотипами → клик открывает детальную карточку с описанием
 * и полем ввода ключа (или кнопкой Connect для OAuth). Ключи отправляются на
 * сервер (валидация + шифрование), в браузере не хранятся.
 *
 * Props: onClose(), onSignIn()
 */

/* ─── Бренд-логотипы (из public/connectors/*.svg) ─────────────────────────── */
const LOGO_SRC = {
  anthropic: '/connectors/claude.svg',
  telegram: '/connectors/telegram.svg',
  resend: '/connectors/resend.svg',
  gcal: '/connectors/google-calendar.svg',
};
function ConnectorLogo({ id, size = 36 }) {
  const src = LOGO_SRC[id];
  if (!src) return <span style={{ width: size, height: size, borderRadius: 9, background: 'var(--surface-2)', display: 'block' }} />;
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      style={{ width: size, height: size, borderRadius: 9, display: 'block', objectFit: 'contain' }}
    />
  );
}

export default function ApiKeysModal({ onClose, onSignIn }) {
  const t = useT();
  const { isLoggedIn } = useAuth();
  const [openId, setOpenId] = useState(null); // открытая детальная карточка

  // anthropic
  const [status, setStatus] = useState(null);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  // telegram
  const [tgStatus, setTgStatus] = useState(null);
  const [tgDraft, setTgDraft] = useState('');
  const [tgBusy, setTgBusy] = useState(false);
  const [tgError, setTgError] = useState(null);
  // resend
  const [rsStatus, setRsStatus] = useState(null);
  const [rsDraft, setRsDraft] = useState('');
  const [rsBusy, setRsBusy] = useState(false);
  const [rsError, setRsError] = useState(null);
  // gcal (oauth)
  const [gcStatus, setGcStatus] = useState(null);
  const [gcBusy, setGcBusy] = useState(false);
  const [gcError, setGcError] = useState(null);

  const refresh = useCallback(() => {
    getKeyStatus('anthropic').then(setStatus).catch(() => setStatus({ connected: false, hint: null }));
    getKeyStatus('telegram').then(setTgStatus).catch(() => setTgStatus({ connected: false, hint: null }));
    getKeyStatus('resend').then(setRsStatus).catch(() => setRsStatus({ connected: false, hint: null }));
    getKeyStatus('gcal').then(setGcStatus).catch(() => setGcStatus({ connected: false, hint: null }));
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  const genErr = useCallback((code, map) => {
    const base = {
      not_authenticated: t('builder.keys.errAuth') || 'Sign in first to connect a key.',
      unauthorized: t('builder.keys.errAuth') || 'Sign in first to connect a key.',
      backend_unavailable: t('builder.keys.errBackend') || 'Backend is not available right now.',
      server_misconfigured: t('builder.keys.errServer') || 'Server is not configured yet.',
      ...map,
    };
    return base[code] || `${t('builder.keys.errGeneric') || 'Something went wrong. Try again.'} (${code})`;
  }, [t]);

  const mkConnect = (provider, draftVal, setDraftVal, setB, setE, errMap) => async () => {
    const key = draftVal.trim();
    if (!key) return;
    setB(true); setE(null);
    try { await connectKey(key, provider); setDraftVal(''); refresh(); }
    catch (e) { setE(genErr(e.code || e.message, errMap)); }
    finally { setB(false); }
  };
  const mkDisconnect = (provider, setB, setE, errMap) => async () => {
    setB(true); setE(null);
    try { await disconnectKey(provider); refresh(); }
    catch (e) { setE(genErr(e.code || e.message, errMap)); }
    finally { setB(false); }
  };

  const handleGcConnect = useCallback(async () => {
    setGcBusy(true); setGcError(null);
    try { await connectGoogleCalendar(); }
    catch { setGcError(t('builder.keys.gcErr') || 'Не удалось начать подключение Google Calendar.'); setGcBusy(false); }
  }, [t]);
  const handleGcDisconnect = mkDisconnect('gcal', setGcBusy, setGcError);

  // Реестр коннекторов (порядок = сетка).
  const connectors = [
    {
      id: 'anthropic', name: 'Claude API', type: 'key', required: true,
      short: t('builder.keys.shortClaude') || 'Запуск схем на реальном Claude',
      desc: t('builder.keys.desc') || 'Нужен для реального запуска схем. Ключ шифруется на сервере и никогда не хранится в браузере.',
      placeholder: t('builder.keys.placeholder') || 'sk-ant-...',
      status, draft, setDraft, busy, error,
      onConnect: mkConnect('anthropic', draft, setDraft, setBusy, setError, { key_rejected: t('builder.keys.errRejected') || 'Claude отклонил этот ключ. Проверьте и попробуйте снова.', invalid_key_format: t('builder.keys.errFormat') || 'Это не похоже на верный ключ.' }),
      onDisconnect: mkDisconnect('anthropic', setBusy, setError),
    },
    {
      id: 'telegram', name: 'Telegram', type: 'key',
      short: t('builder.keys.shortTg') || 'Доставка результата в чат',
      desc: t('builder.keys.tgDesc') || 'Подключите токен бота, чтобы узел «Telegram» слал результат в чат. Токен шифруется на сервере.',
      placeholder: t('builder.keys.tgPlaceholder') || '123456:ABC-DEF...',
      status: tgStatus, draft: tgDraft, setDraft: setTgDraft, busy: tgBusy, error: tgError,
      onConnect: mkConnect('telegram', tgDraft, setTgDraft, setTgBusy, setTgError, { key_rejected: t('builder.keys.tgErrRejected') || 'Telegram отклонил этот токен. Проверьте и попробуйте снова.' }),
      onDisconnect: mkDisconnect('telegram', setTgBusy, setTgError),
    },
    {
      id: 'resend', name: 'Email (Resend)', type: 'key',
      short: t('builder.keys.shortRs') || 'Доставка результата на почту',
      desc: t('builder.keys.rsDesc') || 'Подключите ключ Resend, чтобы узел «Email» отправлял результат на почту. Ключ шифруется на сервере.',
      placeholder: t('builder.keys.rsPlaceholder') || 're_...',
      status: rsStatus, draft: rsDraft, setDraft: setRsDraft, busy: rsBusy, error: rsError,
      onConnect: mkConnect('resend', rsDraft, setRsDraft, setRsBusy, setRsError, { key_rejected: t('builder.keys.rsErrRejected') || 'Resend отклонил этот ключ. Проверьте и попробуйте снова.' }),
      onDisconnect: mkDisconnect('resend', setRsBusy, setRsError),
    },
    {
      id: 'gcal', name: 'Google Calendar', type: 'oauth',
      short: t('builder.keys.shortGc') || 'Создание событий в календаре',
      desc: t('builder.keys.gcDesc') || 'Подключите Google-аккаунт, чтобы узел «Календарь» создавал события. Доступ — только к событиям календаря.',
      status: gcStatus, busy: gcBusy, error: gcError,
      onConnect: handleGcConnect, onDisconnect: handleGcDisconnect,
      connectLabel: t('builder.keys.gcConnect') || 'Подключить Google Calendar',
    },
  ];

  const open = connectors.find(c => c.id === openId) || null;

  return (
    <div className="builder-name-modal__overlay" onClick={onClose}>
      <div
        className="builder-name-modal builder-directory"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t('builder.keys.title') || 'Коннекторы'}
      >
        <div className="builder-directory__head">
          <h3 className="builder-directory__title">{t('builder.keys.directory') || 'Коннекторы'}</h3>
          <button type="button" className="builder-prompt-pop__close" onClick={onClose} aria-label={t('builder.keys.close') || 'Close'}>
            <Icon name="close" size={14} strokeWidth={1.75} />
          </button>
        </div>

        {!isLoggedIn ? (
          <div className="builder-keys__notice">
            <p style={{ margin: '0 0 12px' }}>{t('builder.keys.signInFirst') || 'Войдите, чтобы подключать ключи.'}</p>
            <button type="button" className="builder-btn builder-btn--primary" onClick={() => onSignIn?.()}>
              <Icon name="lock" size={14} strokeWidth={1.5} />
              {t('builder.keys.signInBtn') || 'Войти'}
            </button>
          </div>
        ) : open ? (
          /* ── Детальная карточка ── */
          <div className="builder-directory__detail">
            <button type="button" className="builder-directory__back" onClick={() => setOpenId(null)}>
              <Icon name="arrow-left" size={14} strokeWidth={1.75} />
              <span>{t('common.back') || 'Назад'}</span>
            </button>
            <div className="builder-directory__detail-head">
              <ConnectorLogo id={open.id} size={44} />
              <div>
                <div className="builder-directory__detail-name">
                  {open.name}{open.required && <span className="builder-directory__req">{t('builder.keys.required') || 'обязательно'}</span>}
                </div>
                <div className="builder-directory__detail-short">{open.short}</div>
              </div>
            </div>
            <p className="builder-directory__detail-desc">{open.desc}</p>

            {open.status === null ? (
              <div className="builder-keys__notice">{t('builder.keys.loading') || 'Loading…'}</div>
            ) : open.status.connected ? (
              <div className="builder-keys__connected">
                <span className="builder-keys__badge">
                  <Icon name="check-circle" size={16} strokeWidth={1.75} />
                  {t('builder.keys.connected') || 'Подключён'}{open.status.hint ? ` ••••${open.status.hint}` : ''}
                </span>
                <button type="button" className="builder-btn builder-btn--ghost" onClick={open.onDisconnect} disabled={open.busy}>
                  {t('builder.keys.disconnect') || 'Отключить'}
                </button>
              </div>
            ) : open.type === 'oauth' ? (
              <button type="button" className="builder-btn builder-btn--primary" onClick={open.onConnect} disabled={open.busy}>
                <ConnectorLogo id={open.id} size={16} />
                <span>{open.busy ? (t('builder.keys.connecting') || 'Проверка…') : open.connectLabel}</span>
              </button>
            ) : (
              <div className="builder-keys__form">
                <input
                  type="password"
                  className="builder-name-modal__input"
                  value={open.draft}
                  onChange={(e) => open.setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && open.draft.trim()) open.onConnect(); }}
                  placeholder={open.placeholder}
                  autoComplete="off" spellCheck={false} disabled={open.busy} autoFocus
                />
                <button type="button" className="builder-btn builder-btn--primary" onClick={open.onConnect} disabled={open.busy || !open.draft.trim()}>
                  {open.busy ? (t('builder.keys.connecting') || 'Проверка…') : (t('builder.keys.connect') || 'Подключить')}
                </button>
              </div>
            )}
            {open.error && <div className="builder-keys__error">{open.error}</div>}
          </div>
        ) : (
          /* ── Сетка карточек ── */
          <div className="builder-directory__grid">
            {connectors.map(c => {
              const connected = c.status?.connected;
              return (
                <button key={c.id} type="button" className="builder-directory__card" onClick={() => setOpenId(c.id)}>
                  <ConnectorLogo id={c.id} size={36} />
                  <span className="builder-directory__card-body">
                    <span className="builder-directory__card-name">{c.name}</span>
                    <span className="builder-directory__card-short">{c.short}</span>
                  </span>
                  {connected
                    ? <span className="builder-directory__dot" title={t('builder.keys.connected') || 'Подключён'}><Icon name="check" size={11} strokeWidth={3} /></span>
                    : <span className="builder-directory__plus"><Icon name="plus" size={15} strokeWidth={2} /></span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

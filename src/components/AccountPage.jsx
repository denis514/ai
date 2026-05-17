import React, { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useT, useLocale } from '../i18n/LocaleContext.jsx';
import { updateProfile, deleteProfile } from '../services/profileService.js';
import { supabase } from '../lib/supabaseClient.js';

/**
 * AccountPage — страница управления аккаунтом.
 * Маршрут: #/account
 *
 * Содержит:
 *   - Email пользователя (read-only)
 *   - Display name (редактируемое)
 *   - Язык интерфейса (sync в Supabase)
 *   - Экспорт данных (GDPR Art. 20)
 *   - Удаление аккаунта (GDPR Art. 17)
 *   - Выход
 */
export default function AccountPage({ onClose, onNavigate }) {
  const t = useT();
  const { locale, setLocale, locales } = useLocale();
  const { user, profile, setProfile, signOut, refreshProfile } = useAuth();

  // Display name
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [nameSaving, setNameSaving]   = useState(false);
  const [nameMsg, setNameMsg]         = useState('');

  // Delete account
  const [deleteStep, setDeleteStep] = useState('idle'); // idle | confirm | deleting | done
  const [deleteInput, setDeleteInput] = useState('');

  // Export
  const [exporting, setExporting] = useState(false);

  // Scroll to top on mount
  const topRef = useRef(null);
  useEffect(() => { topRef.current?.scrollIntoView({ behavior: 'smooth' }); }, []);

  // Esc → закрыть
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // ── Сохранить имя ────────────────────────────────────────────────────────
  const saveName = async () => {
    if (!user) return;
    setNameSaving(true);
    setNameMsg('');
    const { error } = await updateProfile(user.id, {
      display_name: displayName.trim() || null,
    });
    setNameSaving(false);
    if (error) {
      setNameMsg(t('account.saveError'));
    } else {
      setProfile(p => ({ ...p, display_name: displayName.trim() || null }));
      setNameMsg(t('account.saved'));
      setTimeout(() => setNameMsg(''), 2500);
    }
  };

  // ── Сохранить язык ────────────────────────────────────────────────────────
  const saveLocale = async (code) => {
    setLocale(code);
    if (user) {
      await updateProfile(user.id, { locale: code });
      setProfile(p => ({ ...p, locale: code }));
    }
  };

  // ── Экспорт данных (GDPR Art. 20) ────────────────────────────────────────
  const exportData = async () => {
    if (!user || !supabase) return;
    setExporting(true);
    try {
      const [progressRes, nodeRes, favRes] = await Promise.all([
        supabase.from('learning_progress').select('*').eq('user_id', user.id),
        supabase.from('node_progress').select('*').eq('user_id', user.id),
        supabase.from('favorites').select('*').eq('user_id', user.id),
      ]);

      const dump = {
        exported_at:      new Date().toISOString(),
        gdpr_note:        'This is your personal data export as required by GDPR Art. 20.',
        profile:          profile,
        learning_progress: progressRes.data || [],
        node_progress:    nodeRes.data || [],
        favorites:        favRes.data || [],
      };

      const blob = new Blob(
        [JSON.stringify(dump, null, 2)],
        { type: 'application/json' }
      );
      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');
      a.href     = url;
      a.download = `atlas-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  // ── Удалить аккаунт (GDPR Art. 17) ───────────────────────────────────────
  const handleDelete = async () => {
    if (!user) return;
    if (deleteInput.trim().toLowerCase() !== 'delete') return;
    setDeleteStep('deleting');
    const { error } = await deleteProfile(user.id);
    if (error) {
      setDeleteStep('confirm');
      return;
    }
    await signOut();
    setDeleteStep('done');
    setTimeout(() => onClose?.(), 1500);
  };

  if (!user) {
    return (
      <div className="account-page">
        <div className="account-page__empty">
          <Icon name="user" size={32} strokeWidth={1.25} />
          <p>{t('account.notLoggedIn')}</p>
          <button
            type="button"
            className="account-btn account-btn--primary"
            onClick={() => document.dispatchEvent(new CustomEvent('atlas:open-auth'))}
          >
            {t('auth.signIn')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="account-page" ref={topRef}>
      {/* ── Header ── */}
      <header className="account-page__header">
        <button type="button" className="account-page__back" onClick={onClose}>
          <Icon name="arrow-left" size={16} strokeWidth={2} />
          {t('common.back')}
        </button>
        <h1>{t('account.title')}</h1>
      </header>

      <div className="account-page__body">

        {/* ── Profile section ── */}
        <section className="account-section">
          <h2>{t('account.profile')}</h2>

          <div className="account-field">
            <label className="account-label">{t('account.email')}</label>
            <div className="account-value account-value--readonly">
              <Icon name="mail" size={14} strokeWidth={1.5} />
              {user.email}
            </div>
            <span className="account-hint">{t('account.emailHint')}</span>
          </div>

          <div className="account-field">
            <label className="account-label" htmlFor="acc-name">
              {t('account.displayName')}
            </label>
            <div className="account-input-row">
              <input
                id="acc-name"
                type="text"
                className="account-input"
                value={displayName}
                onChange={e => { setDisplayName(e.target.value); setNameMsg(''); }}
                placeholder={t('profile.namePlaceholder')}
                maxLength={30}
                onKeyDown={e => { if (e.key === 'Enter') saveName(); }}
              />
              <button
                type="button"
                className="account-btn account-btn--sm"
                onClick={saveName}
                disabled={nameSaving}
              >
                {nameSaving
                  ? <Icon name="refresh" size={14} strokeWidth={1.75} />
                  : t('common.save')}
              </button>
            </div>
            {nameMsg && (
              <span className={`account-msg ${nameMsg === t('account.saved') ? 'is-ok' : 'is-err'}`}>
                {nameMsg}
              </span>
            )}
          </div>

          <div className="account-field">
            <label className="account-label">{t('account.language')}</label>
            <div className="account-lang-row">
              {locales.map(code => (
                <button
                  key={code}
                  type="button"
                  className={`account-lang-btn ${locale === code ? 'is-active' : ''}`}
                  onClick={() => saveLocale(code)}
                >
                  {code === 'en' ? '🇬🇧 EN' : code === 'ru' ? '🇷🇺 RU' : '🇫🇮 FI'}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Data & Privacy section ── */}
        <section className="account-section">
          <h2>{t('account.dataPrivacy')}</h2>
          <p className="account-section__desc">{t('account.gdprNote')}</p>

          <div className="account-actions">
            {/* Export */}
            <button
              type="button"
              className="account-btn account-btn--outline"
              onClick={exportData}
              disabled={exporting}
            >
              <Icon name="download" size={16} strokeWidth={1.5} />
              {exporting ? t('account.exporting') : t('account.export')}
            </button>

            {/* Privacy policy */}
            <a
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="account-btn account-btn--ghost"
            >
              <Icon name="external-link" size={16} strokeWidth={1.5} />
              {t('account.privacyPolicy')}
            </a>
          </div>
        </section>

        {/* ── Sign out ── */}
        <section className="account-section">
          <h2>{t('account.session')}</h2>
          <div className="account-value account-value--readonly" style={{ marginBottom: 12 }}>
            <Icon name="mail" size={14} strokeWidth={1.5} />
            {t('auth.signedInAs')} <strong>{user.email}</strong>
          </div>
          <button
            type="button"
            className="account-btn account-btn--outline"
            onClick={async () => { await signOut(); onClose?.(); }}
          >
            <Icon name="login" size={16} strokeWidth={1.5} />
            {t('auth.signOut')}
          </button>
        </section>

        {/* ── Danger zone ── */}
        <section className="account-section account-section--danger">
          <h2>{t('account.dangerZone')}</h2>
          <p className="account-section__desc">{t('account.deleteDesc')}</p>

          {deleteStep === 'idle' && (
            <button
              type="button"
              className="account-btn account-btn--danger"
              onClick={() => setDeleteStep('confirm')}
            >
              <Icon name="close" size={16} strokeWidth={1.75} />
              {t('account.deleteBtn')}
            </button>
          )}

          {deleteStep === 'confirm' && (
            <div className="account-delete-confirm">
              <p className="account-delete-confirm__warning">
                <Icon name="warning" size={16} strokeWidth={1.75} />
                {t('account.deleteWarning')}
              </p>
              <label className="account-label">{t('account.deleteConfirmLabel')}</label>
              <div className="account-input-row">
                <input
                  type="text"
                  className="account-input account-input--danger"
                  placeholder="delete"
                  value={deleteInput}
                  onChange={e => setDeleteInput(e.target.value)}
                  autoFocus
                />
                <button
                  type="button"
                  className="account-btn account-btn--danger"
                  onClick={handleDelete}
                  disabled={deleteInput.trim().toLowerCase() !== 'delete'}
                >
                  {t('account.deleteConfirm')}
                </button>
              </div>
              <button
                type="button"
                className="account-btn account-btn--ghost"
                onClick={() => { setDeleteStep('idle'); setDeleteInput(''); }}
              >
                {t('common.cancel')}
              </button>
            </div>
          )}

          {deleteStep === 'deleting' && (
            <div className="account-delete-confirm">
              <Icon name="refresh" size={20} strokeWidth={1.5} />
              <p>{t('account.deleting')}</p>
            </div>
          )}

          {deleteStep === 'done' && (
            <div className="account-delete-confirm">
              <Icon name="check" size={20} strokeWidth={2} />
              <p>{t('account.deleted')}</p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

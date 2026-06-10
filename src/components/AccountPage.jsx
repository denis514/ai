import React, { useEffect, useState } from 'react';
import Icon from './Icon.jsx';
import PlanetLogo from './PlanetLogo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useT, useLocale } from '../i18n/LocaleContext.jsx';
import { updateProfile, deleteProfile } from '../services/profileService.js';
import { supabase } from '../lib/supabaseClient.js';
import { useSupabaseStats } from '../hooks/useSupabaseStats.js';

/**
 * AccountPage — страница управления аккаунтом.
 * Маршрут: #/account
 *
 * Раскладка повторяет Agent Builder: слева сверху — плашка с кнопкой «назад»
 * (стрелка) и логотипом-сферой + «Аккаунт». Ниже — боковая панель с кнопками
 * разделов профиля; по клику в основной области показывается выбранный раздел.
 */
export default function AccountPage({ onClose, onRequestAuth }) {
  const t = useT();
  const { locale, setLocale, locales } = useLocale();
  const { user, profile, setProfile, signOut } = useAuth();

  // Статистика активности из Supabase
  const supaStats = useSupabaseStats(user?.id || null);

  // Активный раздел боковой панели
  const [section, setSection] = useState('profile');

  // Delete account
  const [deleteStep, setDeleteStep] = useState('idle'); // idle | confirm | deleting | done
  const [deleteInput, setDeleteInput] = useState('');

  // Export
  const [exporting, setExporting] = useState(false);

  // Esc → закрыть
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

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

  // ── Шапка (стрелка назад + плашка «Аккаунт») ─────────────────────────────
  const header = (
    <header className="account-page__topbar">
      <div className="account-page__brandpill">
        <button
          type="button"
          className="account-page__back"
          onClick={onClose}
          aria-label={t('common.back') || 'Назад'}
          title={t('common.back') || 'Назад'}
        >
          <Icon name="arrow-left" size={16} strokeWidth={1.75} />
        </button>
        <span className="account-page__brand">
          <PlanetLogo size={22} className="account-page__logo" />
          <strong>{t('account.title') || 'Аккаунт'}</strong>
        </span>
      </div>
    </header>
  );

  if (!user) {
    return (
      <div className="account-page">
        {header}
        <div className="account-page__empty">
          <Icon name="user" size={32} strokeWidth={1.25} />
          <p>{t('account.notLoggedIn')}</p>
          <button
            type="button"
            className="account-btn account-btn--primary"
            onClick={() => onRequestAuth
              ? onRequestAuth()
              : document.dispatchEvent(new CustomEvent('atlas:open-auth'))
            }
          >
            {t('auth.signIn')}
          </button>
        </div>
      </div>
    );
  }

  // ── Разделы боковой панели ───────────────────────────────────────────────
  const NAV = [
    { id: 'profile',  icon: 'user',     label: t('account.profile')     || 'Профиль' },
    { id: 'activity', icon: 'flash',    label: t('profile.activity')    || 'Активность' },
    { id: 'data',     icon: 'download', label: t('account.dataPrivacy') || 'Данные и приватность' },
    { id: 'cookie',   icon: 'settings', label: t('account.cookieTitle') || 'Cookie' },
    { id: 'support',  icon: 'mail',     label: t('account.gdprContact') || 'Поддержка' },
    { id: 'session',  icon: 'login',    label: t('account.session')     || 'Сессия' },
    { id: 'danger',   icon: 'trash',    label: t('account.dangerZone')  || 'Удаление', danger: true },
  ];

  const renderSection = () => {
    switch (section) {
      // ── Профиль ──
      case 'profile':
        return (
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
              <label className="account-label">{t('account.displayName')}</label>
              <div className="account-value account-value--readonly">
                <Icon name="user" size={14} strokeWidth={1.5} />
                {profile?.display_name || <span style={{ opacity: 0.45 }}>{t('profile.namePlaceholder')}</span>}
              </div>
              <span className="account-hint">{t('account.nameHint')}</span>
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
                    {code === 'en' ? 'EN' : code === 'ru' ? 'RU' : 'FI'}
                  </button>
                ))}
              </div>
            </div>
          </section>
        );

      // ── Активность ──
      case 'activity':
        return (
          <section className="account-section">
            <h2>{t('profile.activity')}</h2>
            {supaStats.loading ? (
              <div className="account-activity-loading">
                <Icon name="refresh" size={14} strokeWidth={1.5} />
                <span>{t('common.loading')}</span>
              </div>
            ) : (
              <div className="account-activity-row">
                <div className="account-activity-card">
                  <span className="account-activity-val">{supaStats.streak}</span>
                  <span className="account-activity-label">
                    {supaStats.streak === 1
                      ? t('profile.activity.dayStreak.one')
                      : t('profile.activity.dayStreak.many')}
                  </span>
                  {supaStats.streak >= 3 && <span className="account-activity-fire">🔥</span>}
                </div>
                <div className="account-activity-card">
                  <span className="account-activity-val">{supaStats.totalDays}</span>
                  <span className="account-activity-label">
                    {supaStats.totalDays === 1
                      ? t('profile.activity.daysTotal.one')
                      : t('profile.activity.daysTotal.many')}
                  </span>
                </div>
              </div>
            )}
          </section>
        );

      // ── Данные и приватность ──
      case 'data':
        return (
          <section className="account-section">
            <h2>{t('account.dataPrivacy')}</h2>
            <p className="account-section__desc">{t('account.gdprNote')}</p>
            <div className="account-actions">
              <button
                type="button"
                className="account-btn account-btn--outline"
                onClick={exportData}
                disabled={exporting}
              >
                <Icon name="download" size={16} strokeWidth={1.5} />
                {exporting ? t('account.exporting') : t('account.export')}
              </button>
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
        );

      // ── Cookie ──
      case 'cookie':
        return (
          <section className="account-section">
            <h2>{t('account.cookieTitle')}</h2>
            <p className="account-section__desc">{t('account.cookieDesc')}</p>
            <div className="account-actions">
              <button
                type="button"
                className="account-btn account-btn--outline"
                onClick={() => {
                  localStorage.removeItem('ca_consent');
                  window.location.reload();
                }}
              >
                <Icon name="refresh" size={16} strokeWidth={1.5} />
                {t('account.cookieReset')}
              </button>
            </div>
          </section>
        );

      // ── Поддержка / GDPR contact ──
      case 'support':
        return (
          <section className="account-section">
            <h2>{t('account.gdprContact')}</h2>
            <p className="account-section__desc">{t('account.gdprContactDesc')}</p>
            <a
              href="mailto:privacy@105-atlas.vercel.app"
              className="account-btn account-btn--ghost"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <Icon name="mail" size={16} strokeWidth={1.5} />
              privacy@105-atlas.vercel.app
            </a>
          </section>
        );

      // ── Сессия / выход ──
      case 'session':
        return (
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
        );

      // ── Опасная зона ──
      case 'danger':
        return (
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
        );

      default:
        return null;
    }
  };

  return (
    <div className="account-page">
      {header}

      <div className="account-page__layout">
        {/* Боковая панель с кнопками разделов профиля */}
        <nav className="account-sidebar" aria-label={t('account.title') || 'Аккаунт'}>
          {NAV.map(item => (
            <button
              key={item.id}
              type="button"
              className={`account-nav-btn ${section === item.id ? 'is-active' : ''} ${item.danger ? 'account-nav-btn--danger' : ''}`}
              onClick={() => setSection(item.id)}
              aria-current={section === item.id ? 'page' : undefined}
            >
              <Icon name={item.icon} size={16} strokeWidth={1.6} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Основная область — содержимое выбранного раздела */}
        <main className="account-main">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}

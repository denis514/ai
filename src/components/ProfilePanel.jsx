import React, { useMemo, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { tutorialIds, tutorials } from '../data/tutorials.js';
import { initialFromName, colorFromName } from '../hooks/useUserIdentity.js';
import { useLocale, useT } from '../i18n/LocaleContext.jsx';
import { LOCALE_LABEL } from '../i18n/config.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useSupabaseStats } from '../hooks/useSupabaseStats.js';
import { updateProfile } from '../services/profileService.js';

const LOCALE_FLAG = { en: '🇬🇧', ru: '🇷🇺', fi: '🇫🇮' };

const STORAGE_KEYS = [
  'claude-mindmap:bookmarks:v1',
  'claude-mindmap:node-progress:v1',
  'claude-mindmap.tutorial-progress.v1',
  'claude-mindmap:user-level:v1',
  'claude-mindmap:tutorial-mode:v1',
  'claude-mindmap:activity-log:v1',
  'claude-mindmap:user-identity:v1',
  'claude-mindmap:locale:v1'
];

export default function ProfilePanel({
  level,
  onLevelChange,
  progressApi,
  nodeProgressApi,
  bookmarksApi,
  activityApi,
  identityApi,
  onShowNodes,
  onStartTutorial,
  onClose
}) {
  const t = useT();
  const { locale, setLocale, locales } = useLocale();
  const { user, profile, setProfile, isLoggedIn } = useAuth();
  const [langOpen, setLangOpen] = useState(false);

  // Supabase stats (только когда залогинен)
  const supaStats = useSupabaseStats(user?.id || null);

  // Имя: приоритет Supabase profile → localStorage identity
  const displayName = profile?.display_name || identityApi?.name || null;
  const displayInitial = displayName ? ([...displayName.trim()][0]?.toUpperCase() || '?') : '?';
  const displayColor  = displayName ? colorFromName(displayName) : '#94a3b8';

  // ── Единое инлайн-редактирование имени ──────────────────────────────────
  // Для залогиненных — сохраняет в Supabase + обновляет AuthContext.
  // Для гостей — сохраняет в localStorage через identityApi.
  const initialDraft = isLoggedIn ? (profile?.display_name || '') : (identityApi?.name || '');
  const [editingName, setEditingName] = useState(!isLoggedIn && !identityApi?.isSet);
  const [nameDraft, setNameDraft]     = useState(initialDraft);
  const [nameSaving, setNameSaving]   = useState(false);
  const nameInputRef = useRef(null);

  const saveName = async () => {
    const trimmed = nameDraft.trim();
    if (!trimmed) return;
    if (isLoggedIn && user) {
      setNameSaving(true);
      const { error } = await updateProfile(user.id, { display_name: trimmed });
      setNameSaving(false);
      if (!error) {
        setProfile(p => ({ ...p, display_name: trimmed }));
        setEditingName(false);
      }
    } else {
      identityApi?.setName(trimmed);
      setEditingName(false);
    }
  };
  const startEdit = () => {
    setNameDraft(isLoggedIn ? (profile?.display_name || '') : (identityApi?.name || ''));
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 30);
  };

  // ── Статистики: Supabase когда залогинен, иначе localStorage ──────────────
  // Локальные значения (всегда актуальны, т.к. localStorage пишется синхронно)
  const localTutsDone = (() => {
    let n = 0;
    for (const id of tutorialIds) { if (progressApi.getProgress(id)?.completedAt) n++; }
    return n;
  })();
  const localTutsStarted = (() => {
    let n = 0;
    for (const id of tutorialIds) {
      const p = progressApi.getProgress(id);
      if (!p?.completedAt && ((p?.completedSteps?.length || 0) > 0 || (p?.lastStepIndex || 0) > 0)) n++;
    }
    return n;
  })();

  // Когда залогинен — берём максимум из Supabase и localStorage.
  // Это защищает от ситуации когда Supabase ещё не получил последний sync.
  const tutsDone    = isLoggedIn
    ? Math.max(supaStats.tutorialsDone,    localTutsDone)
    : localTutsDone;
  const tutsStarted = isLoggedIn
    ? Math.max(supaStats.tutorialsStarted, localTutsStarted)
    : localTutsStarted;
  const tutsTotal   = tutorialIds.length;
  const tutPercent  = Math.round((tutsDone / tutsTotal) * 100);

  const nodesViewed  = isLoggedIn ? supaStats.nodesViewed  : nodeProgressApi.counts.viewed;
  const nodesReview  = isLoggedIn ? supaStats.nodesReview  : nodeProgressApi.counts.review;
  // Math.max — защита от задержки Supabase: localStorage всегда актуален
  const bmCount      = isLoggedIn
    ? Math.max(supaStats.bookmarksCount, bookmarksApi.count)
    : bookmarksApi.count;
  const streak       = isLoggedIn ? supaStats.streak       : activityApi.streak;
  const totalDays    = isLoggedIn ? supaStats.totalDays    : activityApi.totalDays;
  const loading      = isLoggedIn ? supaStats.loading      : false;

  // ── Достижения ────────────────────────────────────────────────────────────
  const ACHIEVEMENTS = [
    { id: 'first-tut',  threshold: () => tutsDone >= 1,   icon: 'graduation', key: 'achievement.firstTutorial' },
    { id: 'five-tuts',  threshold: () => tutsDone >= 5,   icon: 'graduation', key: 'achievement.fiveTutorials' },
    { id: 'ten-tuts',   threshold: () => tutsDone >= 10,  icon: 'trophy',     key: 'achievement.tenTutorials'  },
    { id: 'explorer10', threshold: () => nodesViewed >= 10, icon: 'compass',  key: 'achievement.explorer10'    },
    { id: 'explorer50', threshold: () => nodesViewed >= 50, icon: 'compass',  key: 'achievement.explorer50'    },
    { id: 'collector',  threshold: () => bmCount >= 5,    icon: 'bookmark-filled', key: 'achievement.collector' },
    { id: 'streak3',    threshold: () => streak >= 3,     icon: 'flash',      key: 'achievement.streak3'       },
    { id: 'streak7',    threshold: () => streak >= 7,     icon: 'flash',      key: 'achievement.streak7'       },
    { id: 'streak30',   threshold: () => streak >= 30,    icon: 'trophy',     key: 'achievement.streak30'      },
  ];
  const earned = ACHIEVEMENTS.filter(a => a.threshold());

  // ── Export (localStorage) ─────────────────────────────────────────────────
  const fileInputRef = useRef(null);
  const [importMsg, setImportMsg] = useState('');

  const exportData = () => {
    const dump = {};
    for (const key of STORAGE_KEYS) {
      try { const v = localStorage.getItem(key); if (v != null) dump[key] = v; } catch {}
    }
    const blob = new Blob(
      [JSON.stringify({ exportedAt: new Date().toISOString(), data: dump }, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `claude-atlas-progress-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const importData = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const data = parsed?.data || parsed;
      let restored = 0;
      for (const key of STORAGE_KEYS) {
        if (data[key] != null) { localStorage.setItem(key, data[key]); restored++; }
      }
      setImportMsg(t('profile.data.importRestored', { n: restored }));
    } catch {
      setImportMsg(t('profile.data.importError'));
    }
    e.target.value = '';
  };

  const resetAll = () => {
    if (!window.confirm(t('profile.data.resetConfirm'))) return;
    for (const key of STORAGE_KEYS) { try { localStorage.removeItem(key); } catch {} }
    window.location.reload();
  };

  const streakLabel = streak === 1
    ? t('profile.activity.dayStreak.one')
    : t('profile.activity.dayStreak.many');
  const totalLabel = totalDays === 1
    ? t('profile.activity.daysTotal.one')
    : t('profile.activity.daysTotal.many');

  return (
    <div className="profile-panel">

      {/* ── HEADER ── */}
      <header className="profile-panel__head">
        <span
          className={`profile-panel__avatar ${displayName ? 'has-identity' : ''}`}
          aria-hidden="true"
          style={displayName ? { '--avatar-color': displayColor } : undefined}
        >
          {displayName
            ? <span className="profile-panel__avatar-initial">{displayInitial}</span>
            : <Icon name="user" size={28} strokeWidth={1.25} />}
        </span>

        <div className="profile-panel__head-text">
          {/* Единое редактирование имени: залогинен → Supabase, гость → localStorage */}
          {editingName ? (
            <div className="profile-panel__name-edit">
              <input
                ref={nameInputRef}
                type="text"
                value={nameDraft}
                onChange={e => setNameDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') saveName();
                  if (e.key === 'Escape' && (isLoggedIn ? !!profile?.display_name : identityApi?.isSet)) setEditingName(false);
                }}
                placeholder={t('profile.namePlaceholder')}
                maxLength={30}
                autoFocus
                disabled={nameSaving}
              />
              <button
                type="button"
                onClick={saveName}
                disabled={!nameDraft.trim() || nameSaving}
                title={t('common.save')}
              >
                {nameSaving
                  ? <Icon name="refresh" size={14} strokeWidth={1.75} />
                  : <Icon name="check" size={14} strokeWidth={1.75} />}
              </button>
            </div>
          ) : (
            <div className="profile-panel__name-row">
              <strong className="profile-panel__name">{displayName || t('common.anonymous')}</strong>
              <button
                type="button"
                className="profile-panel__name-edit-btn"
                onClick={startEdit}
                title={t('common.edit')}
              >
                <Icon name="pencil" size={12} strokeWidth={1.75} />
              </button>
            </div>
          )}
          {isLoggedIn && (
            <span className="profile-panel__email">{user.email}</span>
          )}
          <span className="profile-panel__level">
            {t('profile.level')}: <strong>{t(`profile.level.${level}`)}</strong>
          </span>
        </div>

        {onClose && (
          <button type="button" className="profile-panel__close" onClick={onClose} aria-label={t('common.close')}>
            <Icon name="close" size={16} strokeWidth={1.75} />
          </button>
        )}
      </header>

      {/* ── PRO TEASER ── */}
      <section className="profile-panel__pro">
        <span className="profile-panel__pro-badge">{t('common.soon')}</span>
        <strong>{t('profile.pro.title')}</strong>
        <p>{t('profile.pro.desc')}</p>
      </section>

      {/* ── LEVEL SWITCHER ── */}
      <section className="profile-panel__section">
        <h4>{t('profile.level')}</h4>
        <div className="profile-panel__level-row">
          {['beginner', 'intermediate', 'expert'].map(lvl => (
            <button
              key={lvl}
              type="button"
              className={`profile-panel__level-btn ${level === lvl ? 'is-active' : ''}`}
              onClick={() => onLevelChange(lvl)}
            >
              {t(`profile.level.${lvl}`)}
            </button>
          ))}
        </div>
      </section>

      {/* ── STREAK ── */}
      <section className="profile-panel__section">
        <h4>{t('profile.activity')}</h4>
        {loading ? (
          <div className="profile-panel__loading">
            <Icon name="refresh" size={14} strokeWidth={1.5} />
            <span>{t('common.loading')}</span>
          </div>
        ) : (
          <div className="profile-panel__streak-row">
            <div className="profile-panel__streak-card">
              <span className="profile-panel__streak-val">{streak}</span>
              <span className="profile-panel__streak-label">{streakLabel}</span>
              {streak >= 3 && <span className="profile-panel__streak-fire">🔥</span>}
            </div>
            <div className="profile-panel__streak-card">
              <span className="profile-panel__streak-val">{totalDays}</span>
              <span className="profile-panel__streak-label">{totalLabel}</span>
            </div>
            {isLoggedIn && (
              <div className="profile-panel__streak-card profile-panel__streak-card--sync">
                <Icon name="check" size={13} strokeWidth={2} />
                <span>{t('profile.synced')}</span>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── TUTORIAL PROGRESS ── */}
      <section className="profile-panel__section">
        <h4>{t('profile.tutorials')}</h4>
        <div className="profile-panel__progress">
          <div className="profile-panel__progress-meta">
            <span>{t('profile.tutorials.done', { done: tutsDone, total: tutsTotal })}</span>
            <span>{tutPercent}%</span>
          </div>
          <div className="profile-panel__progress-bar">
            <div className="profile-panel__progress-fill" style={{ width: `${tutPercent}%` }} />
          </div>
          {tutsStarted > 0 && (
            <span className="profile-panel__progress-note">
              {t('profile.tutorials.inProgress', { n: tutsStarted })}
            </span>
          )}
          {onStartTutorial && (
            <button type="button" className="profile-panel__welcome-link" onClick={() => onStartTutorial('welcome')}>
              <Icon name="rocket" size={13} strokeWidth={1.5} />
              <span>{t('profile.welcome.replay')}</span>
            </button>
          )}
        </div>
      </section>

      {/* ── NODE PROGRESS ── */}
      <section className="profile-panel__section">
        <h4>{t('profile.map')}</h4>
        <div className="profile-panel__stat-grid">
          <button
            type="button"
            className="profile-panel__stat profile-panel__stat--green profile-panel__stat--clickable"
            disabled={!nodesViewed}
            onClick={() => {
              const ids = nodeProgressApi.idsBy?.('viewed') || [];
              if (ids.length) onShowNodes?.(ids, t('profile.map.viewed'));
            }}
            title={nodesViewed ? t('profile.map.showOnMap') : ''}
          >
            <span className="profile-panel__stat-val">{nodesViewed}</span>
            <span className="profile-panel__stat-label">{t('profile.map.viewed')}</span>
          </button>
          <button
            type="button"
            className="profile-panel__stat profile-panel__stat--amber profile-panel__stat--clickable"
            disabled={!nodesReview}
            onClick={() => {
              const ids = nodeProgressApi.idsBy?.('review') || [];
              if (ids.length) onShowNodes?.(ids, t('profile.map.review'));
            }}
            title={nodesReview ? t('profile.map.showOnMap') : ''}
          >
            <span className="profile-panel__stat-val">{nodesReview}</span>
            <span className="profile-panel__stat-label">{t('profile.map.review')}</span>
          </button>
          <button
            type="button"
            className="profile-panel__stat profile-panel__stat--clickable"
            disabled={!bmCount}
            onClick={() => {
              const ids = Array.from(bookmarksApi.bookmarks?.values?.() || [])
                .filter(b => b.type === 'node').map(b => b.id);
              if (ids.length) onShowNodes?.(ids, t('profile.map.bookmarks'));
            }}
            title={bmCount ? t('profile.map.showOnMap') : ''}
          >
            <span className="profile-panel__stat-val">{bmCount}</span>
            <span className="profile-panel__stat-label">{t('profile.map.bookmarks')}</span>
          </button>
        </div>
      </section>

      {/* ── ACHIEVEMENTS ── */}
      {earned.length > 0 && (
        <section className="profile-panel__section">
          <h4>{t('profile.achievements')}</h4>
          <div className="profile-panel__achievements">
            {earned.map(a => (
              <div key={a.id} className="profile-panel__achievement" title={t(a.key)}>
                <Icon name={a.icon} size={14} strokeWidth={1.5} />
                <span>{t(a.key)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── DATA / SETTINGS ── */}
      <section className="profile-panel__section">
        <h4>{t('profile.data')}</h4>
        <div className="profile-panel__settings">
          <button type="button" className="profile-panel__setting-btn" onClick={exportData}>
            <Icon name="external-link" size={14} strokeWidth={1.5} />
            <span>{t('profile.data.export')}</span>
          </button>
          <button type="button" className="profile-panel__setting-btn" onClick={() => fileInputRef.current?.click()}>
            <Icon name="inbox" size={14} strokeWidth={1.5} />
            <span>{t('profile.data.import')}</span>
          </button>
          <input ref={fileInputRef} type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={importData} />
          {importMsg && <div className="profile-panel__msg">{importMsg}</div>}
          <button type="button" className="profile-panel__setting-btn profile-panel__setting-btn--danger" onClick={resetAll}>
            <Icon name="close" size={14} strokeWidth={1.75} />
            <span>{t('profile.data.reset')}</span>
          </button>
        </div>
      </section>

      {/* ── LANGUAGE ── */}
      <div className="profile-panel__lang-bar">
        <div className="profile-panel__lang-picker">
          <button
            type="button"
            className={`profile-panel__lang-btn ${langOpen ? 'is-open' : ''}`}
            onClick={() => setLangOpen(v => !v)}
            aria-haspopup="listbox"
            aria-expanded={langOpen}
          >
            <span className="profile-panel__lang-flag">{LOCALE_FLAG[locale]}</span>
            <span className="profile-panel__lang-label">{LOCALE_LABEL[locale]}</span>
            <Icon name="arrow-down" size={12} strokeWidth={2} />
          </button>
          {langOpen && (
            <ul className="profile-panel__lang-dropdown" role="listbox">
              {locales.map(code => (
                <li key={code} role="option" aria-selected={locale === code}>
                  <button
                    type="button"
                    className={`profile-panel__lang-option ${locale === code ? 'is-active' : ''}`}
                    onClick={() => { setLocale(code); setLangOpen(false); }}
                  >
                    <span>{LOCALE_FLAG[code]}</span>
                    <span>{LOCALE_LABEL[code]}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

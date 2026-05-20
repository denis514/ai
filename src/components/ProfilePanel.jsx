import React, { useMemo, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { tutorialIds, tutorials } from '../data/tutorials.js';
import { initialFromName, colorFromName } from '../hooks/useUserIdentity.js';
import { useLocale, useT } from '../i18n/LocaleContext.jsx';
import { LOCALE_LABEL } from '../i18n/config.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useSupabaseStats } from '../hooks/useSupabaseStats.js';
import { updateProfile } from '../services/profileService.js';
import { getLocalizedTutorial } from '../i18n/useTutorial.js';

const LOCALE_FLAG = { en: '🇬🇧', ru: '🇷🇺', fi: '🇫🇮' };

const STORAGE_KEYS = [
  'claude-mindmap:bookmarks:v1',
  'claude-mindmap:node-progress:v1',
  'claude-mindmap.tutorial-progress.v1',
  'claude-mindmap:user-level:v1',
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
  // Для залогиненных — Supabase источник правды.
  // Для гостей — localStorage.
  const tutsDone    = isLoggedIn ? supaStats.tutorialsDone    : localTutsDone;
  const tutsTotal   = tutorialIds.length;
  const tutPercent  = Math.round((tutsDone / tutsTotal) * 100);

  const nodesViewed  = isLoggedIn ? supaStats.nodesViewed  : nodeProgressApi.counts.viewed;
  const nodesReview  = isLoggedIn ? supaStats.nodesReview  : nodeProgressApi.counts.review;
  const bmCount      = isLoggedIn ? supaStats.bookmarksCount : bookmarksApi.count;
  const loading      = isLoggedIn ? supaStats.loading      : false;

  // ── Список активных курсов (В процессе) ──────────────────────────────────
  // Активный = начат но не завершён. Сортировка: startedAt desc (новейший первый).
  const activeCourses = useMemo(() => {
    const result = [];
    for (const id of tutorialIds) {
      const p = progressApi.getProgress(id);
      const isStarted = (p?.completedSteps?.length || 0) > 0 || (p?.lastStepIndex || 0) > 0;
      const isDone = !!p?.completedAt;
      if (!isStarted || isDone) continue;

      const stepCount = tutorials[id]?.steps?.length || 1;
      const doneCount = p?.completedSteps?.length || 0;
      const percent = Math.round((doneCount / stepCount) * 100);
      const localized = getLocalizedTutorial(id, locale);
      const title = localized?.title || id;
      const startedAt = p?.startedAt || null;

      result.push({ id, title, percent, stepCount, doneCount, startedAt });
    }
    // Сортировка: startedAt desc, без startedAt — в конец
    result.sort((a, b) => {
      if (!a.startedAt && !b.startedAt) return 0;
      if (!a.startedAt) return 1;
      if (!b.startedAt) return -1;
      return b.startedAt.localeCompare(a.startedAt);
    });
    return result;
  }, [progressApi, locale]);

  // ── Достижения ────────────────────────────────────────────────────────────
  const ACHIEVEMENTS = [
    { id: 'first-tut',  threshold: () => tutsDone >= 1,   icon: 'graduation', key: 'achievement.firstTutorial' },
    { id: 'five-tuts',  threshold: () => tutsDone >= 5,   icon: 'graduation', key: 'achievement.fiveTutorials' },
    { id: 'ten-tuts',   threshold: () => tutsDone >= 10,  icon: 'trophy',     key: 'achievement.tenTutorials'  },
    { id: 'explorer10', threshold: () => nodesViewed >= 10, icon: 'compass',  key: 'achievement.explorer10'    },
    { id: 'explorer50', threshold: () => nodesViewed >= 50, icon: 'compass',  key: 'achievement.explorer50'    },
    { id: 'collector',  threshold: () => bmCount >= 5,    icon: 'bookmark-filled', key: 'achievement.collector' },
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
    a.href = url; a.download = `105-atlas-progress-${new Date().toISOString().slice(0,10)}.json`;
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
          {onStartTutorial && (
            <button type="button" className="profile-panel__welcome-link" onClick={() => onStartTutorial('welcome')}>
              <Icon name="rocket" size={13} strokeWidth={1.5} />
              <span>{t('profile.welcome.replay')}</span>
            </button>
          )}
        </div>
      </section>

      {/* ── В ПРОЦЕССЕ ── */}
      <section className="profile-panel__section">
        <h4>{t('profile.inProgress.title')}</h4>
        {activeCourses.length === 0 ? (
          <p className="profile-panel__empty-hint">{t('profile.inProgress.empty')}</p>
        ) : (
          <ul className="profile-panel__active-courses">
            {activeCourses.map(course => (
              <li key={course.id}>
                <button
                  type="button"
                  className="profile-panel__active-course"
                  onClick={() => onStartTutorial?.(course.id)}
                  title={course.title}
                >
                  <span className="profile-panel__active-course-title">{course.title}</span>
                  <span className="profile-panel__active-course-right">
                    <span className="profile-panel__active-course-pct">{course.percent}%</span>
                    <span className="profile-panel__active-course-bar">
                      <span
                        className="profile-panel__active-course-fill"
                        style={{ width: `${course.percent}%` }}
                      />
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
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
              // Для залогиненных: приоритет Supabase-IDs, fallback localStorage
              const ids = isLoggedIn && supaStats.viewedIds.length
                ? supaStats.viewedIds
                : (nodeProgressApi.idsBy?.('viewed') || []);
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
              const ids = isLoggedIn && supaStats.reviewIds.length
                ? supaStats.reviewIds
                : (nodeProgressApi.idsBy?.('review') || []);
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
              // Supabase-IDs (точные, включая данные с других устройств),
              // fallback — localStorage если Supabase ещё не загрузился
              const ids = isLoggedIn && supaStats.bookmarkNodeIds.length
                ? supaStats.bookmarkNodeIds
                : Array.from(bookmarksApi.bookmarks?.values?.() || [])
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

      {/* ── DATA / SETTINGS — только для гостей ── */}
      {/* Залогиненные используют AccountPage: там Supabase-экспорт (GDPR Art.20) */}
      {!isLoggedIn && (
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
      )}

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

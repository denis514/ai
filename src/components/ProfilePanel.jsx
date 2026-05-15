import React, { useMemo, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { tutorialIds, tutorials } from '../data/tutorials.js';
import { initialFromName, colorFromName } from '../hooks/useUserIdentity.js';
import { useLocale, useT } from '../i18n/LocaleContext.jsx';
import { LOCALE_LABEL, LOCALE_SHORT } from '../i18n/config.js';

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

/**
 * ProfilePanel — содержимое профиля пользователя.
 * Рендерится внутри ProfileFab (dropdown desktop / bottom sheet mobile).
 */
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
  const [langOpen, setLangOpen] = useState(false);

  // ===== Name editing =====
  const [editingName, setEditingName] = useState(!identityApi?.isSet);
  const [nameDraft, setNameDraft] = useState(identityApi?.name || '');
  const nameInputRef = useRef(null);

  const saveName = () => {
    const trimmed = nameDraft.trim();
    if (trimmed) {
      identityApi.setName(trimmed);
      setEditingName(false);
    }
  };

  const startEdit = () => {
    setNameDraft(identityApi?.name || '');
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 30);
  };

  // ===== Phase 1: статистики =====
  const tutorialStats = useMemo(() => {
    let done = 0;
    let started = 0;
    for (const id of tutorialIds) {
      const p = progressApi.getProgress(id);
      if (p?.completedAt) done++;
      else if ((p?.completedSteps?.length || 0) > 0 || (p?.lastStepIndex || 0) > 0) started++;
    }
    return { done, started, total: tutorialIds.length };
  }, [progressApi]);
  const tutPercent = Math.round((tutorialStats.done / tutorialStats.total) * 100);

  const nodeCounts = nodeProgressApi.counts;

  // ===== Achievements (labels пока RU; переведём в Phase 2) =====
  const achievements = useMemo(() => {
    const list = [];
    if (tutorialStats.done >= 1) list.push({ id: 'first-course', label: 'Первый курс', icon: 'graduation', earned: true });
    if (tutorialStats.done >= 5) list.push({ id: 'five-courses', label: '5 курсов', icon: 'graduation', earned: true });
    if (tutorialStats.done >= 10) list.push({ id: 'ten-courses', label: '10 курсов', icon: 'trophy', earned: true });
    if (nodeCounts.viewed >= 10) list.push({ id: 'explorer-10', label: 'Изучил 10 узлов', icon: 'compass', earned: true });
    if (nodeCounts.viewed >= 50) list.push({ id: 'explorer-50', label: 'Изучил 50 узлов', icon: 'compass', earned: true });
    if (bookmarksApi.count >= 5) list.push({ id: 'bookmarker', label: 'Коллекционер (5+)', icon: 'bookmark-filled', earned: true });
    if (activityApi.streak >= 3) list.push({ id: 'streak-3', label: '3 дня подряд', icon: 'flash', earned: true });
    if (activityApi.streak >= 7) list.push({ id: 'streak-7', label: 'Неделя', icon: 'flash', earned: true });
    if (activityApi.streak >= 30) list.push({ id: 'streak-30', label: 'Месяц подряд', icon: 'trophy', earned: true });
    return list;
  }, [tutorialStats, nodeCounts, bookmarksApi.count, activityApi.streak]);

  // ===== Export / Import =====
  const exportData = () => {
    const dump = {};
    for (const key of STORAGE_KEYS) {
      try {
        const v = localStorage.getItem(key);
        if (v != null) dump[key] = v;
      } catch {}
    }
    const blob = new Blob(
      [JSON.stringify({ exportedAt: new Date().toISOString(), data: dump }, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `claude-atlas-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const fileInputRef = useRef(null);
  const [importMsg, setImportMsg] = useState('');
  const importData = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const data = parsed?.data || parsed;
      let restored = 0;
      for (const key of STORAGE_KEYS) {
        if (data[key] != null) {
          localStorage.setItem(key, data[key]);
          restored++;
        }
      }
      setImportMsg(t('profile.data.importRestored', { n: restored }));
    } catch (err) {
      setImportMsg(t('profile.data.importError'));
    }
    e.target.value = '';
  };

  const resetAll = () => {
    if (!window.confirm(t('profile.data.resetConfirm'))) return;
    for (const key of STORAGE_KEYS) {
      try { localStorage.removeItem(key); } catch {}
    }
    window.location.reload();
  };

  const streakLabel = activityApi.streak === 1
    ? t('profile.activity.dayStreak.one')
    : t('profile.activity.dayStreak.many');
  const totalLabel = activityApi.totalDays === 1
    ? t('profile.activity.daysTotal.one')
    : t('profile.activity.daysTotal.many');

  return (
    <div className="profile-panel">
      {/* HEADER */}
      <header className="profile-panel__head">
        <span
          className={`profile-panel__avatar ${identityApi?.isSet ? 'has-identity' : ''}`}
          aria-hidden="true"
          style={identityApi?.isSet ? { '--avatar-color': identityApi.color } : undefined}
        >
          {identityApi?.isSet ? (
            <span className="profile-panel__avatar-initial">{identityApi.initial}</span>
          ) : (
            <Icon name="user" size={28} strokeWidth={1.25} />
          )}
        </span>
        <div className="profile-panel__head-text">
          {editingName ? (
            <div className="profile-panel__name-edit">
              <input
                ref={nameInputRef}
                type="text"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveName();
                  if (e.key === 'Escape') { setEditingName(!!identityApi?.isSet ? false : true); }
                }}
                placeholder={t('profile.namePlaceholder')}
                maxLength={20}
                autoFocus
              />
              <button
                type="button"
                onClick={saveName}
                disabled={!nameDraft.trim()}
                title={t('common.save')}
              >
                <Icon name="check" size={14} strokeWidth={1.75} />
              </button>
            </div>
          ) : (
            <>
              <strong>{identityApi?.name || t('common.anonymous')}</strong>
              <button
                type="button"
                className="profile-panel__name-edit-btn"
                onClick={startEdit}
                title={t('common.edit')}
              >
                {t('common.edit')}
              </button>
            </>
          )}
          <span className="profile-panel__level">
            {t('profile.level')}: <strong>{t(`profile.level.${level}`)}</strong>
          </span>
        </div>
        {onClose && (
          <button
            type="button"
            className="profile-panel__close"
            onClick={onClose}
            aria-label={t('common.close')}
          >
            <Icon name="close" size={16} strokeWidth={1.75} />
          </button>
        )}
      </header>

      {/* PRO TEASER — под именем */}
      <section className="profile-panel__pro">
        <span className="profile-panel__pro-badge">{t('common.soon')}</span>
        <strong>{t('profile.pro.title')}</strong>
        <p>{t('profile.pro.desc')}</p>
      </section>

      {/* LEVEL SWITCHER */}
      <section className="profile-panel__section">
        <h4>{t('profile.level')}</h4>
        <div className="profile-panel__level-row">
          {['beginner', 'intermediate', 'expert'].map((lvl) => (
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

      {/* STREAK */}
      <section className="profile-panel__section">
        <h4>{t('profile.activity')}</h4>
        <div className="profile-panel__stat-grid">
          <div className="profile-panel__stat">
            <span className="profile-panel__stat-val">{activityApi.streak}</span>
            <span className="profile-panel__stat-label">{streakLabel}</span>
          </div>
          <div className="profile-panel__stat">
            <span className="profile-panel__stat-val">{activityApi.totalDays}</span>
            <span className="profile-panel__stat-label">{totalLabel}</span>
          </div>
        </div>
      </section>

      {/* TUTORIAL PROGRESS */}
      <section className="profile-panel__section">
        <h4>{t('profile.tutorials')}</h4>
        <div className="profile-panel__progress">
          <div className="profile-panel__progress-meta">
            <span>{t('profile.tutorials.done', { done: tutorialStats.done, total: tutorialStats.total })}</span>
            <span>{tutPercent}%</span>
          </div>
          <div className="profile-panel__progress-bar">
            <div className="profile-panel__progress-fill" style={{ width: `${tutPercent}%` }} />
          </div>
          {tutorialStats.started > 0 && (
            <span className="profile-panel__progress-note">
              {t('profile.tutorials.inProgress', { n: tutorialStats.started })}
            </span>
          )}
          {/* Возможность пере-открыть вводный урок даже если карточка
              «Добро пожаловать» уже скрыта кнопкой «Я уже знаю». */}
          {onStartTutorial && (
            <button
              type="button"
              className="profile-panel__welcome-link"
              onClick={() => onStartTutorial('welcome')}
            >
              <Icon name="rocket" size={13} strokeWidth={1.5} />
              <span>{t('profile.welcome.replay')}</span>
            </button>
          )}
        </div>
      </section>

      {/* NODE PROGRESS — кликабельные карточки. Клик → показать эти ноды на карте. */}
      <section className="profile-panel__section">
        <h4>{t('profile.map')}</h4>
        <div className="profile-panel__stat-grid">
          <button
            type="button"
            className="profile-panel__stat profile-panel__stat--green profile-panel__stat--clickable"
            disabled={!nodeCounts.viewed}
            onClick={() => {
              const ids = nodeProgressApi.idsBy?.('viewed') || [];
              if (ids.length) onShowNodes?.(ids, t('profile.map.viewed'));
            }}
            title={nodeCounts.viewed ? t('profile.map.showOnMap') : ''}
          >
            <span className="profile-panel__stat-val">{nodeCounts.viewed}</span>
            <span className="profile-panel__stat-label">{t('profile.map.viewed')}</span>
          </button>
          <button
            type="button"
            className="profile-panel__stat profile-panel__stat--amber profile-panel__stat--clickable"
            disabled={!nodeCounts.review}
            onClick={() => {
              const ids = nodeProgressApi.idsBy?.('review') || [];
              if (ids.length) onShowNodes?.(ids, t('profile.map.review'));
            }}
            title={nodeCounts.review ? t('profile.map.showOnMap') : ''}
          >
            <span className="profile-panel__stat-val">{nodeCounts.review}</span>
            <span className="profile-panel__stat-label">{t('profile.map.review')}</span>
          </button>
          <button
            type="button"
            className="profile-panel__stat profile-panel__stat--clickable"
            disabled={!bookmarksApi.count}
            onClick={() => {
              const ids = Array.from(bookmarksApi.bookmarks?.values?.() || [])
                .filter(b => b.type === 'node')
                .map(b => b.id);
              if (ids.length) onShowNodes?.(ids, t('profile.map.bookmarks'));
            }}
            title={bookmarksApi.count ? t('profile.map.showOnMap') : ''}
          >
            <span className="profile-panel__stat-val">{bookmarksApi.count}</span>
            <span className="profile-panel__stat-label">{t('profile.map.bookmarks')}</span>
          </button>
        </div>
      </section>

      {/* ACHIEVEMENTS */}
      {achievements.length > 0 && (
        <section className="profile-panel__section">
          <h4>{t('profile.achievements')}</h4>
          <div className="profile-panel__achievements">
            {achievements.map((a) => (
              <div key={a.id} className="profile-panel__achievement" title={a.label}>
                <Icon name={a.icon} size={14} strokeWidth={1.5} />
                <span>{a.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SETTINGS */}
      <section className="profile-panel__section">
        <h4>{t('profile.data')}</h4>
        <div className="profile-panel__settings">
          <button type="button" className="profile-panel__setting-btn" onClick={exportData}>
            <Icon name="external-link" size={14} strokeWidth={1.5} />
            <span>{t('profile.data.export')}</span>
          </button>
          <button
            type="button"
            className="profile-panel__setting-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <Icon name="inbox" size={14} strokeWidth={1.5} />
            <span>{t('profile.data.import')}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            style={{ display: 'none' }}
            onChange={importData}
          />
          {importMsg && <div className="profile-panel__msg">{importMsg}</div>}
          <button
            type="button"
            className="profile-panel__setting-btn profile-panel__setting-btn--danger"
            onClick={resetAll}
          >
            <Icon name="close" size={14} strokeWidth={1.75} />
            <span>{t('profile.data.reset')}</span>
          </button>
        </div>
      </section>

      {/* LANGUAGE PICKER — bottom right flag dropdown */}
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
          </button>
          {langOpen && (
            <ul className="profile-panel__lang-dropdown" role="listbox">
              {locales.map((code) => (
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

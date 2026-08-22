import React, { useMemo, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { tutorialIds, tutorials } from '../data/tutorials.js';
import { initialFromName, colorFromName } from '../hooks/useUserIdentity.js';
import { useLocale, useT } from '../i18n/LocaleContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useSupabaseStats } from '../hooks/useSupabaseStats.js';
import { getLocalizedTutorial } from '../i18n/useTutorial.js';



export default function ProfilePanel({
  progressApi,
  nodeProgressApi,
  bookmarksApi,
  activityApi,
  identityApi,
  onShowNodes,
  onStartTutorial,
  onOpenAuth,
  onOpenAccount,
  onClose
}) {
  const t = useT();
  const { locale } = useLocale();
  const { user, profile, isLoggedIn, signOut } = useAuth();

  // Supabase stats (только когда залогинен)
  const supaStats = useSupabaseStats(user?.id || null);

  // Имя: profile (async) → localStorage identity → метаданные сессии (синхронно).
  // Фолбэк на user даёт цвет/букву сразу, не дожидаясь async-профиля.
  const sessionName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || null;
  const displayName = profile?.display_name || identityApi?.name || sessionName || null;
  const displayInitial = displayName ? ([...displayName.trim()][0]?.toUpperCase() || '?') : '?';
  const displayColor  = displayName ? colorFromName(displayName) : '#94a3b8';


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

      const stepCount = tutorials[id]?.stepCount || 1;
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
          {/* Имя — только показ; редактирование живёт в кабинете (Настройки).
              Тап по имени ведёт туда же. */}
          <button
            type="button"
            className="profile-panel__name-row profile-panel__name-row--link"
            onClick={() => onOpenAccount?.()}
            title={t('account.title')}
          >
            <strong className="profile-panel__name">{displayName || t('profile.namePlaceholder')}</strong>
            <Icon name="pencil" size={12} strokeWidth={1.75} />
          </button>
          {/* ── Выйти — прямо из панели, не только из кабинета ── */}
      {isLoggedIn && (
            <span className="profile-panel__email">{user.email}</span>
          )}
        </div>

        {onClose && (
          <button type="button" className="profile-panel__close" onClick={onClose} aria-label={t('common.close')}>
            <Icon name="close" size={16} strokeWidth={1.75} />
          </button>
        )}
      </header>

      {/* ── Гостю: мягкое предложение войти, НЕ стена ──
          Читать карту, проходить курсы и копировать промпты можно без входа —
          прогресс живёт в этом браузере. Вход нужен, только чтобы он не пропал
          при смене устройства. Поэтому предложение стоит внутри панели профиля,
          а не поперёк содержимого. */}
      {!isLoggedIn && (
        <section className="profile-panel__pro">
          <strong>{t('profile.guest.title')}</strong>
          <p>{t('profile.guest.desc')}</p>
          <button
            type="button"
            className="btn btn--primary"
            style={{ marginTop: 8, alignSelf: 'flex-start' }}
            onClick={() => (onOpenAuth ? onOpenAuth() : document.dispatchEvent(new CustomEvent('atlas:open-auth')))}
          >
            {t('auth.signIn')}
          </button>
        </section>
      )}


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
          {/* Один шаг вместо списков: продолжить активный разбор; списки — в кабинете */}
          {onStartTutorial && (activeCourses[0] ? (
            <button
              type="button"
              className="profile-panel__welcome-link"
              onClick={() => onStartTutorial(activeCourses[0].id)}
              title={activeCourses[0].title}
            >
              <Icon name="rocket" size={13} strokeWidth={1.5} />
              <span>{t('profile.continue', { title: activeCourses[0].title })}</span>
            </button>
          ) : (
            <button type="button" className="profile-panel__welcome-link" onClick={() => onStartTutorial('welcome')}>
              <Icon name="rocket" size={13} strokeWidth={1.5} />
              <span>{t('profile.welcome.replay')}</span>
            </button>
          ))}
        </div>
      </section>



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


      {isLoggedIn && (
        <section className="profile-panel__section">
          <div className="profile-panel__settings">
            <button
              type="button"
              className="profile-panel__setting-btn"
              onClick={async () => { await signOut(); onClose?.(); }}
            >
              <Icon name="logout" size={14} strokeWidth={1.5} />
              <span>{t('auth.signOut')}</span>
            </button>
          </div>
        </section>
      )}

      {/* Тема и язык переехали в выпадающее меню «Atlas» (слева). */}
    </div>
  );
}

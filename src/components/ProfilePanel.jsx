import React, { useMemo, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { tutorialIds, tutorials } from '../data/tutorials.js';
import { initialFromName, colorFromName } from '../hooks/useUserIdentity.js';
import { useLocale, useT } from '../i18n/LocaleContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useSupabaseStats } from '../hooks/useSupabaseStats.js';
import { updateProfile } from '../services/profileService.js';
import { getLocalizedTutorial } from '../i18n/useTutorial.js';
import { useConfirm } from '../hooks/useConfirm.js';
import { useToast } from '../hooks/useToast.js';
import { exportUserData, importLocalDump, resetLocalData } from '../services/dataExport.js';



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
  onOpenAuth,
  onClose
}) {
  const t = useT();
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { locale } = useLocale();
  const { user, profile, setProfile, isLoggedIn, signOut } = useAuth();
  const [completedOpen, setCompletedOpen] = useState(false);

  // Supabase stats (только когда залогинен)
  const supaStats = useSupabaseStats(user?.id || null);

  // Имя: profile (async) → localStorage identity → метаданные сессии (синхронно).
  // Фолбэк на user даёт цвет/букву сразу, не дожидаясь async-профиля.
  const sessionName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || null;
  const displayName = profile?.display_name || identityApi?.name || sessionName || null;
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

  // Есть ли у гостя что экспортировать/сбрасывать: любой прогресс, закладки,
  // имя или начатые разборы. Пустому гостю эти кнопки — шум.
  const guestHasData = !isLoggedIn && (
    localTutsDone > 0 ||
    nodeProgressApi.total > 0 ||
    bookmarksApi.count > 0 ||
    !!identityApi?.isSet ||
    tutorialIds.some(id => !!progressApi.getProgress(id)?.startedAt)
  );

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

  // ── Список завершённых курсов ─────────────────────────────────────────────
  // Для залогиненных — берём ID из Supabase (completedTutorialIds), иначе localStorage.
  const completedCourses = useMemo(() => {
    const idsToUse = isLoggedIn && supaStats.completedTutorialIds.length > 0
      ? supaStats.completedTutorialIds
      : tutorialIds.filter(id => !!progressApi.getProgress(id)?.completedAt);

    return idsToUse
      .map(id => {
        const localized = getLocalizedTutorial(id, locale);
        const title = localized?.title || id;
        // Дата: из localStorage если есть, иначе из Supabase (нет точной даты)
        const completedAt = progressApi.getProgress(id)?.completedAt || '';
        return { id, title, completedAt };
      })
      .sort((a, b) => b.completedAt.localeCompare(a.completedAt));
  }, [isLoggedIn, supaStats.completedTutorialIds, progressApi, locale]);

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

  // Выгрузка / импорт / сброс — общий модуль services/dataExport.js.
  const exportData = () => exportUserData({ user: null });

  const importData = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const restored = importLocalDump(JSON.parse(await file.text()));
      setImportMsg(t('profile.data.importRestored', { n: restored }));
    } catch {
      setImportMsg(t('profile.data.importError'));
    }
    e.target.value = '';
  };

  const resetAll = async () => {
    const ok = await confirm({
      title: t('profile.data.resetTitle') || t('profile.data.resetConfirm'),
      description: t('profile.data.resetDescription') || '',
      confirmLabel: t('profile.data.resetBtn') || t('profile.data.reset'),
      cancelLabel: t('common.cancel') || 'Отмена',
      danger: true,
    });
    if (!ok) return;
    resetLocalData();
    toast.success(t('profile.data.resetDone') || 'Данные сброшены');
    setTimeout(() => window.location.reload(), 600);
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

      {/* ── PRO TEASER ── */}
      <section className="profile-panel__pro">
        <span className="profile-panel__pro-badge">{t('common.soon')}</span>
        <strong>{t('profile.pro.title')}</strong>
        <p>{t('profile.pro.desc')}</p>
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

      {/* ── ЗАВЕРШЁННЫЕ КУРСЫ ── */}
      <section className="profile-panel__section profile-panel__section--completed">
        <button
          type="button"
          className="profile-panel__completed-toggle"
          onClick={() => setCompletedOpen(v => !v)}
          aria-expanded={completedOpen}
        >
          <h4>{t('profile.completed.title')}</h4>
          <span className="profile-panel__completed-count">{completedCourses.length}</span>
          <Icon
            name={completedOpen ? 'arrow-up' : 'arrow-down'}
            size={13}
            strokeWidth={1.75}
          />
        </button>

        {completedOpen && (
          completedCourses.length === 0 ? (
            <p className="profile-panel__empty-hint">{t('profile.completed.empty')}</p>
          ) : (
            <ul className="profile-panel__completed-list">
              {completedCourses.map(course => (
                <li key={course.id}>
                  <button
                    type="button"
                    className="profile-panel__completed-course"
                    onClick={() => onStartTutorial?.(course.id)}
                    title={t('profile.completed.open')}
                  >
                    <span className="profile-panel__completed-check" aria-hidden="true">
                      <Icon name="check" size={11} strokeWidth={2.5} />
                    </span>
                    <span className="profile-panel__completed-title">{course.title}</span>
                    <Icon name="arrow-right" size={13} strokeWidth={1.5} />
                  </button>
                </li>
              ))}
            </ul>
          )
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
      {/* Залогиненные используют AccountPage: там Supabase-экспорт (GDPR Art.20).
          Пока гость ничего не накопил, экспортировать и сбрасывать нечего —
          показываем только «Импорт» (вернуть прогресс из файла). */}
      {!isLoggedIn && (
        <section className="profile-panel__section">
          <h4>{t('profile.data')}</h4>
          <div className="profile-panel__settings">
            {guestHasData && (
              <button type="button" className="profile-panel__setting-btn" onClick={exportData}>
                <Icon name="external-link" size={14} strokeWidth={1.5} />
                <span>{t('profile.data.export')}</span>
              </button>
            )}
            <button type="button" className="profile-panel__setting-btn" onClick={() => fileInputRef.current?.click()}>
              <Icon name="inbox" size={14} strokeWidth={1.5} />
              <span>{t('profile.data.import')}</span>
            </button>
            <input ref={fileInputRef} type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={importData} />
            {importMsg && <div className="profile-panel__msg">{importMsg}</div>}
            {guestHasData && (
              <button type="button" className="profile-panel__setting-btn profile-panel__setting-btn--danger" onClick={resetAll}>
                <Icon name="close" size={14} strokeWidth={1.75} />
                <span>{t('profile.data.reset')}</span>
              </button>
            )}
          </div>
        </section>
      )}

      {/* ── Выйти — прямо из панели, не только из кабинета ── */}
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

import React, { useEffect, useMemo, useState } from 'react';
import Icon from './Icon.jsx';
import PlanetLogo from './PlanetLogo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useT, useLocale } from '../i18n/LocaleContext.jsx';
import { updateProfile, deleteProfile } from '../services/profileService.js';
import { exportUserData, resetLocalData } from '../services/dataExport.js';
import { useConfirm } from '../hooks/useConfirm.js';
import { useSupabaseStats } from '../hooks/useSupabaseStats.js';
import { tutorials, tutorialIds } from '../data/tutorials.js';
import { getLocalizedTutorial } from '../i18n/useTutorial.js';
import { getNode } from '../i18n/strings.js';
import { WHATS_NEW } from '../data/whatsNew.js';
import { nodeIndex } from '../data/mindmapData.js';
import { useWhatsNew, isFresh } from '../hooks/useWhatsNew.js';
import Skeleton from './Skeleton.jsx';
import { listWorkflows } from '../builder/services/workflowStorage.js';
import { listAllSchedules, getTodayUsage } from '../builder/services/scheduleService.js';

/**
 * AccountPage — страница управления аккаунтом.
 * Маршрут: #/account
 *
 * Раскладка повторяет Agent Builder: слева сверху — плашка с кнопкой «назад»
 * (стрелка) и логотипом-сферой + «Аккаунт». Ниже — боковая панель с кнопками
 * разделов профиля; по клику в основной области показывается выбранный раздел.
 */
export default function AccountPage({
  onClose,
  onRequestAuth,
  progressApi,
  nodeProgressApi,
  bookmarksApi,
  activityApi,
  onStartTutorial,
  onShowNodes,
  onOpenCourses,
  onOpenBuilder,
}) {
  const t = useT();
  const { locale, setLocale, locales, contentVersion } = useLocale();
  const { user, profile, setProfile, signOut } = useAuth();
  const { confirm } = useConfirm();

  // Статистика активности из Supabase — только для вошедшего.
  const cloudStats = useSupabaseStats(user?.id || null);

  // ── Откуда берём числа ────────────────────────────────────────────────────
  // Вошёл — из облака. Гость — из этого браузера: у него есть ровно те же
  // данные (пройденные шаги, отметки тем, закладки, дни посещений), просто
  // лежат локально. Раньше кабинет умел читать только облако, поэтому гостю
  // показывалась стена «Вы не вошли» — при том что панель профиля его же
  // статистику прекрасно показывала.
  const localStats = useMemo(() => {
    const completedTutorialIds = progressApi
      ? tutorialIds.filter(id => !!progressApi.getProgress(id)?.completedAt)
      : [];
    const counts = nodeProgressApi?.counts || { viewed: 0, review: 0 };
    const bookmarkNodeIds = bookmarksApi
      ? [...bookmarksApi.bookmarks.values()].filter(b => b.type === 'node').map(b => b.id)
      : [];
    return {
      tutorialsDone:        completedTutorialIds.length,
      tutorialsStarted:     progressApi ? tutorialIds.filter(id => !!progressApi.getProgress(id)?.startedAt).length : 0,
      completedTutorialIds,
      nodesViewed:          counts.viewed,
      nodesReview:          counts.review,
      bookmarksCount:       bookmarksApi?.count || 0,
      viewedIds:            nodeProgressApi?.idsBy ? nodeProgressApi.idsBy('viewed') : [],
      reviewIds:            nodeProgressApi?.idsBy ? nodeProgressApi.idsBy('review') : [],
      bookmarkNodeIds,
      streak:               activityApi?.streak || 0,
      totalDays:            activityApi?.totalDays || 0,
      loading:              false,
    };
  }, [progressApi, nodeProgressApi, bookmarksApi, activityApi]);

  const supaStats = user ? cloudStats : localStats;

  // Активный раздел боковой панели (дефолт — дашборд «Обзор»)
  const [section, setSection] = useState('overview');

  // ── Активные курсы (в процессе) — как в ProfilePanel ──────────────────────
  const activeCourses = useMemo(() => {
    if (!progressApi) return [];
    const result = [];
    for (const id of tutorialIds) {
      const p = progressApi.getProgress(id);
      const isStarted = (p?.completedSteps?.length || 0) > 0 || (p?.lastStepIndex || 0) > 0;
      const isDone = !!p?.completedAt;
      if (!isStarted || isDone) continue;
      const stepCount = tutorials[id]?.stepCount || 1;
      const doneCount = p?.completedSteps?.length || 0;
      const percent = Math.round((doneCount / stepCount) * 100);
      const title = getLocalizedTutorial(id, locale)?.title || id;
      result.push({ id, title, percent, stepCount, doneCount, startedAt: p?.startedAt || null });
    }
    result.sort((a, b) => (b.startedAt || 0) - (a.startedAt || 0));
    return result;
  }, [progressApi, locale, contentVersion]);

  // ── Узлы «на повторение» — заголовки из локали ────────────────────────────
  const reviewNodes = useMemo(() => {
    return (supaStats.reviewIds || [])
      .map(id => ({ id, title: getNode(locale, id)?.title || id }))
      .slice(0, 6);
  }, [supaStats.reviewIds, locale, contentVersion]);

  // ── Что нового (реестр обновлений; срок жизни записи — общий, см. useWhatsNew) ──
  const { isNew, markSeen } = useWhatsNew();
  const whatsNewItems = useMemo(() => {
    return Object.entries(WHATS_NEW)
      .filter(([id, e]) => {
        if (!isFresh(e.date)) return false;
        if (e.kind !== 'tutorial' && !nodeIndex[id]) return false; // узел исчез
        return true;
      })
      .sort((a, b) => b[1].date.localeCompare(a[1].date))
      .slice(0, 4)
      .map(([id, e]) => ({
        id,
        type: e.type,
        kind: e.kind,
        title: e.kind === 'tutorial'
          ? (getLocalizedTutorial(id, locale)?.title || id)
          : (getNode(locale, id)?.title || id),
      }));
  }, [locale, contentVersion]);

  const openWhatsNew = (item) => {
    markSeen(item.id);
    if (item.kind === 'tutorial') onStartTutorial?.(item.id);
    else onShowNodes?.([item.id], item.title);
  };

  // ── Достижения (как в ProfilePanel, на данных Supabase) ───────────────────
  const earnedAchievements = useMemo(() => {
    const d = supaStats.tutorialsDone || 0;
    const v = supaStats.nodesViewed || 0;
    const b = supaStats.bookmarksCount || 0;
    const all = [
      { id: 'first-tut',  ok: d >= 1,  icon: 'graduation',      key: 'achievement.firstTutorial' },
      { id: 'five-tuts',  ok: d >= 5,  icon: 'graduation',      key: 'achievement.fiveTutorials' },
      { id: 'ten-tuts',   ok: d >= 10, icon: 'trophy',          key: 'achievement.tenTutorials' },
      { id: 'explorer10', ok: v >= 10, icon: 'compass',         key: 'achievement.explorer10' },
      { id: 'explorer50', ok: v >= 50, icon: 'compass',         key: 'achievement.explorer50' },
      { id: 'collector',  ok: b >= 5,  icon: 'bookmark-filled', key: 'achievement.collector' },
    ];
    return all.filter(a => a.ok);
  }, [supaStats.tutorialsDone, supaStats.nodesViewed, supaStats.bookmarksCount]);

  // ── Полные списки для раздела «Обучение» (этап 4) ─────────────────────────
  const allReviewNodes = useMemo(() => {
    return (supaStats.reviewIds || []).map(id => ({ id, title: getNode(locale, id)?.title || id }));
  }, [supaStats.reviewIds, locale, contentVersion]);

  const bookmarkNodes = useMemo(() => {
    return (supaStats.bookmarkNodeIds || [])
      .filter(id => nodeIndex[id])
      .map(id => ({ id, title: getNode(locale, id)?.title || id }));
  }, [supaStats.bookmarkNodeIds, locale, contentVersion]);

  const completedCourses = useMemo(() => {
    const ids = (supaStats.completedTutorialIds && supaStats.completedTutorialIds.length)
      ? supaStats.completedTutorialIds
      : (progressApi ? tutorialIds.filter(id => !!progressApi.getProgress(id)?.completedAt) : []);
    return ids.map(id => ({ id, title: getLocalizedTutorial(id, locale)?.title || id }));
  }, [supaStats.completedTutorialIds, progressApi, locale, contentVersion]);

  // Достижения с состоянием (заработано / закрыто) — для полного раздела
  const allAchievements = useMemo(() => {
    const d = supaStats.tutorialsDone || 0;
    const v = supaStats.nodesViewed || 0;
    const b = supaStats.bookmarksCount || 0;
    return [
      { id: 'first-tut',  ok: d >= 1,  icon: 'graduation',      key: 'achievement.firstTutorial' },
      { id: 'five-tuts',  ok: d >= 5,  icon: 'graduation',      key: 'achievement.fiveTutorials' },
      { id: 'ten-tuts',   ok: d >= 10, icon: 'trophy',          key: 'achievement.tenTutorials' },
      { id: 'explorer10', ok: v >= 10, icon: 'compass',         key: 'achievement.explorer10' },
      { id: 'explorer50', ok: v >= 50, icon: 'compass',         key: 'achievement.explorer50' },
      { id: 'collector',  ok: b >= 5,  icon: 'bookmark-filled', key: 'achievement.collector' },
    ];
  }, [supaStats.tutorialsDone, supaStats.nodesViewed, supaStats.bookmarksCount]);

  // ── Сводка конструктора (мои агенты + автозапуски) ────────────────────────
  const [builder, setBuilder] = useState({ loading: true, workflows: [], activeRuns: 0, todayRuns: 0 });
  useEffect(() => {
    let alive = true;
    // Гостю — его местные схемы (они есть: конструктор сохраняет без входа);
    // автозапуски и расход — только у аккаунта.
    Promise.all([
      listWorkflows(user?.id || null).catch(() => []),
      user?.id ? listAllSchedules().catch(() => []) : [],
      user?.id ? getTodayUsage().catch(() => null) : null,
    ]).then(([wfs, scheds, usage]) => {
      if (!alive) return;
      setBuilder({
        loading: false,
        workflows: wfs || [],
        activeRuns: (scheds || []).filter(s => s.enabled).length,
        todayRuns: usage?.runs || 0,
      });
    });
    return () => { alive = false; };
  }, [user?.id]);

  // Delete account
  const [deleteStep, setDeleteStep] = useState('idle'); // idle | confirm | deleting | done
  const [deleteError, setDeleteError] = useState(false); // ошибка показывается в самом блоке:
  // тосты лежат ниже полноэкранного кабинета и здесь не видны
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
  // Одна выгрузка для гостя и вошедшего — services/dataExport.js
  // (браузер + облако, включая схемы конструктора и журнал активности).
  const exportData = async () => {
    setExporting(true);
    try { await exportUserData({ user, profile }); }
    finally { setExporting(false); }
  };

  // ── Гость: стереть всё своё из этого браузера (аккаунта нет — удалять нечего) ──
  const resetGuestData = async () => {
    const ok = await confirm({
      title: t('profile.data.reset'),
      description: t('profile.data.resetConfirm'),
      confirmLabel: t('profile.data.reset'),
      cancelLabel: t('common.cancel'),
      danger: true,
    });
    if (!ok) return;
    resetLocalData();
    window.location.reload();
  };

  // ── Удалить аккаунт (GDPR Art. 17) ───────────────────────────────────────
  const handleDelete = async () => {
    if (!user) return;
    if (deleteInput.trim().toLowerCase() !== 'delete') return;
    setDeleteStep('deleting');
    setDeleteError(false);
    const { error } = await deleteProfile(user.id);
    if (error) {
      console.error('[account] delete failed', error);
      setDeleteError(true);
      setDeleteStep('confirm');
      return;
    }
    // Учётки больше нет — серверу нечего завершать, закрываем сессию локально
    // (обработчик выхода почистит прогресс в браузере).
    await signOut({ scope: 'local' });
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

  // ── Разделы боковой панели ───────────────────────────────────────────────
  const NAV = [
    { id: 'overview', icon: 'grid',       label: t('account.dash.overview') || 'Обзор' },
    { id: 'learning', icon: 'graduation', label: t('account.dash.learning') || 'Обучение' },
    { id: 'settings', icon: 'settings',   label: t('account.settings')      || 'Настройки' },
  ];

  const greetName = user ? (profile?.display_name || (user.email || '').split('@')[0]) : '';
  const coursesDone = supaStats.tutorialsDone || 0;
  const coursesTotal = tutorialIds.length;
  // Hero-метрика: % карты знаний, изученный пользователем (узлы / все узлы карты).
  const mapTotal = Object.keys(nodeIndex).length;
  const mapPct = mapTotal ? Math.round(((supaStats.nodesViewed || 0) / mapTotal) * 100) : 0;
  const dueCount = supaStats.nodesReview || 0;
  const achTotal = allAchievements.length;
  const achDone = earnedAchievements.length;

  const renderSection = () => {
    switch (section) {
      // ── Обзор (дашборд: всё сразу) ──
      case 'overview':
        return (
          <div className="account-dash">
            {/* Гостю — одна честная строка о том, где живут его данные.
                Не стена: всё ниже работает и без входа. */}
            {!user && (
              <div className="account-widget account-widget--wide account-guest-note">
                <div>
                  <strong>{t('account.guest.title')}</strong>
                  <p className="account-hint" style={{ margin: '4px 0 0' }}>{t('account.guest.desc')}</p>
                </div>
                <button
                  type="button"
                  className="account-btn account-btn--primary"
                  onClick={() => (onRequestAuth ? onRequestAuth() : document.dispatchEvent(new CustomEvent('atlas:open-auth')))}
                >
                  {t('auth.signIn')}
                </button>
              </div>
            )}

            {/* Шапка: приветствие + серия + «к повторению»; справа — главная метрика «% карты изучено» */}
            <div className="account-dash__hero">
              <div className="account-dash__hero-main">
                <h2 className="account-dash__hello">
                  {/* У гостя нет имени — здороваемся без него, иначе выходит
                      «С возвращением, Привет». */}
                  {user
                    ? (t('account.dash.greeting') || 'С возвращением, {name}').replace('{name}', greetName)
                    : (t('account.guest.greeting') || 'С возвращением')}
                </h2>
                {!supaStats.loading && (
                  <p className="account-dash__streak">
                    <Icon name="flash" size={14} strokeWidth={1.6} />
                    {supaStats.streak > 0
                      ? (t('account.dash.streak') || 'Серия: {n} дн. подряд').replace('{n}', String(supaStats.streak))
                      : (t('account.dash.streakNone') || 'Загляни сегодня — начни серию')}
                    {dueCount > 0 && (
                      <span className="account-dash__due"> · {(t('account.dash.due') || 'сегодня к повторению: {n}').replace('{n}', String(dueCount))}</span>
                    )}
                  </p>
                )}
              </div>
              {!supaStats.loading && (
                <div
                  className="account-hero-metric"
                  role="img"
                  aria-label={(t('account.dash.mapProgress') || 'Карта изучена на {n}%').replace('{n}', String(mapPct))}
                >
                  <div className="account-hero-metric__ring" style={{ '--pct': mapPct }}>
                    <span className="account-hero-metric__pct">{mapPct}%</span>
                  </div>
                  <div className="account-hero-metric__text">
                    <strong>{t('account.dash.mapTitle') || 'Карта Claude'}</strong>
                    <span>{(t('account.dash.mapOf') || '{a} из {b} тем').replace('{a}', String(supaStats.nodesViewed || 0)).replace('{b}', String(mapTotal))}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="account-dash__grid">
              {/* Продолжить обучение */}
              <div className="account-widget account-widget--wide">
                <div className="account-widget__head">
                  <h3>{t('account.dash.continue') || 'Продолжить обучение'}</h3>
                  {onOpenCourses && (
                    <button type="button" className="account-widget__more" onClick={() => { onClose?.(); onOpenCourses(); }}>
                      {t('account.dash.allCourses') || 'Все курсы'}
                      <Icon name="arrow-right" size={13} strokeWidth={1.75} />
                    </button>
                  )}
                </div>
                {activeCourses.length === 0 ? (
                  <div className="account-widget__empty">
                    <Icon name="idea" size={20} strokeWidth={1.5} />
                    <p>{t('account.dash.continueEmpty') || 'Нет начатых курсов. Начни любой — он появится здесь.'}</p>
                    {onOpenCourses && (
                      <button type="button" className="account-btn account-btn--outline" onClick={() => { onClose?.(); onOpenCourses(); }}>
                        {t('account.dash.browseCourses') || 'Выбрать курс'}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="account-course-list">
                    {/* Верхний (последний начатый) — крупная доминанта с шагом и кнопкой */}
                    <button
                      type="button"
                      className="account-course account-course--lead"
                      onClick={() => onStartTutorial?.(activeCourses[0].id)}
                    >
                      <div className="account-course__top">
                        <span className="account-course__title">{activeCourses[0].title}</span>
                        <span className="account-course__pct">{activeCourses[0].percent}%</span>
                      </div>
                      <div className="account-course__meta">
                        {(t('account.dash.step') || 'шаг {n} из {m}')
                          .replace('{n}', String((activeCourses[0].doneCount || 0) + 1))
                          .replace('{m}', String(activeCourses[0].stepCount))}
                      </div>
                      <div className="account-course__bar"><span style={{ width: `${activeCourses[0].percent}%` }} /></div>
                      <span className="account-course__cta">
                        {t('account.dash.resume') || 'Продолжить'}
                        <Icon name="arrow-right" size={14} strokeWidth={1.75} />
                      </span>
                    </button>
                    {/* Остальные — компактным списком */}
                    {activeCourses.slice(1, 4).map(c => (
                      <button
                        key={c.id}
                        type="button"
                        className="account-course account-course--mini"
                        onClick={() => onStartTutorial?.(c.id)}
                      >
                        <span className="account-course__title">{c.title}</span>
                        <span className="account-course__pct">{c.percent}%</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Мой прогресс одним взглядом */}
              <div className="account-widget">
                <div className="account-widget__head">
                  <h3>{t('account.dash.progress') || 'Мой прогресс'}</h3>
                  <button type="button" className="account-widget__link" onClick={() => setSection('learning')}>
                    {t('account.dash.details') || 'Подробнее'}
                    <Icon name="arrow-right" size={13} strokeWidth={1.75} />
                  </button>
                </div>
                {supaStats.loading ? (
                  <div className="account-stat-grid">
                    {[0, 1, 2, 3].map(i => <Skeleton key={i} height="62px" radius="12px" />)}
                  </div>
                ) : (
                  <div className="account-stat-grid">
                    <button type="button" className="account-stat" disabled={!supaStats.viewedIds?.length}
                      onClick={() => onShowNodes?.(supaStats.viewedIds, t('account.dash.viewed') || 'Изучено')}>
                      <span className="account-stat__val">{supaStats.nodesViewed || 0}</span>
                      <span className="account-stat__label">{t('account.dash.viewed') || 'Изучено'}</span>
                    </button>
                    <button type="button" className="account-stat account-stat--review" disabled={!supaStats.reviewIds?.length}
                      onClick={() => onShowNodes?.(supaStats.reviewIds, t('account.dash.review') || 'На повторение')}>
                      <span className="account-stat__val">{supaStats.nodesReview || 0}</span>
                      <span className="account-stat__label">{t('account.dash.review') || 'На повторение'}</span>
                    </button>
                    <button type="button" className="account-stat" disabled={!supaStats.bookmarkNodeIds?.length}
                      onClick={() => onShowNodes?.(supaStats.bookmarkNodeIds, t('account.dash.bookmarks') || 'Закладки')}>
                      <span className="account-stat__val">{supaStats.bookmarksCount || 0}</span>
                      <span className="account-stat__label">{t('account.dash.bookmarks') || 'Закладки'}</span>
                    </button>
                    <div className="account-stat account-stat--static">
                      <span className="account-stat__val">{coursesDone}<span className="account-stat__of">/{coursesTotal}</span></span>
                      <span className="account-stat__label">{t('account.dash.coursesDone') || 'Курсы'}</span>
                    </div>
                  </div>
                )}
                {!supaStats.loading && achTotal > 0 && (
                  <button type="button" className="account-progress__ach" onClick={() => setSection('learning')}>
                    <Icon name="trophy" size={13} strokeWidth={1.6} />
                    <span>{(t('account.dash.achTeaser') || 'Достижений: {a} из {b}').replace('{a}', String(achDone)).replace('{b}', String(achTotal))}</span>
                    <Icon name="arrow-right" size={12} strokeWidth={1.75} />
                  </button>
                )}
              </div>

              {/* На повторение — блок-действие. Скрыт, когда повторять нечего. */}
              {supaStats.loading ? (
                <div className="account-widget">
                  <div className="account-widget__head"><h3>{t('account.dash.review') || 'На повторение'}</h3></div>
                  <Skeleton.Text lines={3} />
                </div>
              ) : reviewNodes.length > 0 ? (
                <div className="account-widget">
                  <div className="account-widget__head">
                    <h3>{t('account.dash.review') || 'На повторение'}</h3>
                    {allReviewNodes.length > reviewNodes.length && (
                      <button type="button" className="account-widget__link" onClick={() => setSection('learning')}>
                        {t('account.dash.details') || 'Подробнее'}
                        <Icon name="arrow-right" size={13} strokeWidth={1.75} />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    className="account-btn account-btn--primary account-review-cta"
                    onClick={() => onShowNodes?.(supaStats.reviewIds, t('account.dash.review') || 'На повторение')}
                  >
                    <Icon name="refresh-circle" size={15} strokeWidth={1.6} />
                    {(t('account.dash.reviewCta') || 'Повторить {n} тем').replace('{n}', String(dueCount))}
                    <Icon name="arrow-right" size={14} strokeWidth={1.75} />
                  </button>
                  <ul className="account-review-list">
                    {reviewNodes.map(n => (
                      <li key={n.id}>
                        <button type="button" className="account-review__item" onClick={() => onShowNodes?.([n.id], n.title)}>
                          <Icon name="refresh-circle" size={13} strokeWidth={1.6} />
                          <span>{n.title}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {/* Что нового с прошлого визита */}
              <div className="account-widget">
                <div className="account-widget__head"><h3>{t('account.dash.whatsNew') || 'Что нового'}</h3></div>
                {whatsNewItems.length === 0 ? (
                  <div className="account-widget__empty account-widget__empty--sm">
                    <Icon name="check" size={18} strokeWidth={1.75} />
                    <p>{t('account.dash.whatsNewEmpty') || 'Пока без новинок.'}</p>
                  </div>
                ) : (
                  <ul className="account-wn-list">
                    {whatsNewItems.map(item => (
                      <li key={item.id}>
                        <button type="button" className={`account-wn__item ${isNew(item.id) ? 'is-unseen' : ''}`} onClick={() => openWhatsNew(item)}>
                          <span className={`account-wn__badge account-wn__badge--${item.type}`}>
                            {item.type === 'new' ? (t('category.updatesNew') || 'Новое') : (t('category.updatesUpdated') || 'Обновлено')}
                          </span>
                          <span className="account-wn__title">
                            {item.kind === 'tutorial' && <Icon name="graduation" size={12} strokeWidth={1.5} />}
                            {item.title}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Достижения убраны с Обзора — это «история/гордость», а не действие.
                  Полный список — в разделе «Обучение»; тизер — в виджете «Прогресс». */}

              {/* Мои агенты и автозапуски.
                  Новичку без агентов — тонкая подсказка, а не большой пустой виджет;
                  это learning-first продукт, конструктор не навязываем. */}
              {builder.loading ? (
                <div className="account-widget account-widget--wide">
                  <div className="account-widget__head"><h3>{t('account.dash.agents') || 'Мои агенты'}</h3></div>
                  <Skeleton.Text lines={2} />
                </div>
              ) : builder.workflows.length === 0 ? (
                <button type="button" className="account-widget--wide account-agents-hint" onClick={() => onOpenBuilder?.()}>
                  <Icon name="robot" size={16} strokeWidth={1.5} />
                  <span>
                    {user
                      ? (t('account.dash.agentsHint') || 'Собери первого агента в конструкторе')
                      : t('account.guest.agentsHint')}
                  </span>
                  <Icon name="arrow-right" size={14} strokeWidth={1.75} />
                </button>
              ) : (
                <div className="account-widget account-widget--wide">
                  <div className="account-widget__head">
                    <h3>{t('account.dash.agents') || 'Мои агенты'}</h3>
                    <button type="button" className="account-widget__link" onClick={() => onOpenBuilder?.()}>
                      {t('account.dash.openBuilder') || 'Открыть конструктор'}
                      <Icon name="arrow-right" size={13} strokeWidth={1.75} />
                    </button>
                  </div>
                  <div className="account-stat-grid">
                    <div className="account-stat account-stat--static">
                      <span className="account-stat__val">{builder.workflows.length}</span>
                      <span className="account-stat__label">{t('account.dash.agentsWorkflows') || 'Схем'}</span>
                    </div>
                    <div className="account-stat account-stat--static">
                      <span className="account-stat__val">{builder.activeRuns}</span>
                      <span className="account-stat__label">{t('account.dash.agentsActive') || 'Автозапусков'}</span>
                    </div>
                    <div className="account-stat account-stat--static">
                      <span className="account-stat__val">{builder.todayRuns}</span>
                      <span className="account-stat__label">{t('account.dash.agentsToday') || 'Запусков сегодня'}</span>
                    </div>
                  </div>
                  <ul className="account-review-list account-agents-list">
                    {builder.workflows.slice(0, 4).map(w => (
                      <li key={w.id}>
                        <button type="button" className="account-review__item" onClick={() => onOpenBuilder?.()}>
                          <Icon name="folder" size={13} strokeWidth={1.6} />
                          <span>{w.name || (t('account.dash.agentUntitled') || 'Без имени')}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        );

      // ── Обучение (полные списки) ──
      case 'learning':
        return (
          <div className="account-learning">
            <h2 className="account-learning__title">{t('account.dash.learning') || 'Обучение'}</h2>
            <p className="account-learning__lead">{t('account.dash.learningLead') || 'Полные списки твоего обучения. Сводка — на «Обзоре».'}</p>

            {/* Активные курсы (все) */}
            <div className="account-card">
              <div className="account-card__head">
                <h3 className="account-card__title">{t('account.dash.continue') || 'Продолжить обучение'}</h3>
                {onOpenCourses && (
                  <button type="button" className="account-widget__link" onClick={() => { onClose?.(); onOpenCourses(); }}>
                    {t('account.dash.allCourses') || 'Все курсы'}
                    <Icon name="arrow-right" size={13} strokeWidth={1.75} />
                  </button>
                )}
              </div>
              {activeCourses.length === 0 ? (
                <p className="account-card__empty">{t('account.dash.continueEmpty') || 'Нет начатых курсов.'}</p>
              ) : (
                <div className="account-course-list">
                  {activeCourses.map(c => (
                    <button key={c.id} type="button" className="account-course" onClick={() => onStartTutorial?.(c.id)}>
                      <div className="account-course__top">
                        <span className="account-course__title">{c.title}</span>
                        <span className="account-course__pct">{c.percent}%</span>
                      </div>
                      <div className="account-course__bar"><span style={{ width: `${c.percent}%` }} /></div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Завершённые курсы */}
            <div className="account-card">
              <h3 className="account-card__title">
                {t('account.dash.completed') || 'Завершённые курсы'}
                {completedCourses.length > 0 && <span className="account-card__count">{completedCourses.length}</span>}
              </h3>
              {completedCourses.length === 0 ? (
                <p className="account-card__empty">{t('account.dash.completedEmpty') || 'Пока нет завершённых курсов.'}</p>
              ) : (
                <ul className="account-review-list">
                  {completedCourses.map(c => (
                    <li key={c.id}>
                      <button type="button" className="account-review__item" onClick={() => onStartTutorial?.(c.id)}>
                        <Icon name="check" size={13} strokeWidth={2} />
                        <span>{c.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* На повторение (все) */}
            <div className="account-card">
              <h3 className="account-card__title">
                {t('account.dash.review') || 'На повторение'}
                {allReviewNodes.length > 0 && <span className="account-card__count">{allReviewNodes.length}</span>}
              </h3>
              {allReviewNodes.length === 0 ? (
                <p className="account-card__empty">{t('account.dash.reviewEmpty') || 'Пусто — нечего повторять.'}</p>
              ) : (
                <ul className="account-review-list">
                  {allReviewNodes.map(n => (
                    <li key={n.id}>
                      <button type="button" className="account-review__item" onClick={() => onShowNodes?.([n.id], n.title)}>
                        <Icon name="refresh-circle" size={13} strokeWidth={1.6} />
                        <span>{n.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Закладки (все) */}
            <div className="account-card">
              <h3 className="account-card__title">
                {t('account.dash.bookmarks') || 'Закладки'}
                {bookmarkNodes.length > 0 && <span className="account-card__count">{bookmarkNodes.length}</span>}
              </h3>
              {bookmarkNodes.length === 0 ? (
                <p className="account-card__empty">{t('account.dash.bookmarksEmpty') || 'Закладок пока нет.'}</p>
              ) : (
                <ul className="account-review-list">
                  {bookmarkNodes.map(n => (
                    <li key={n.id}>
                      <button type="button" className="account-review__item" onClick={() => onShowNodes?.([n.id], n.title)}>
                        <Icon name="bookmark-filled" size={13} strokeWidth={1.6} />
                        <span>{n.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Достижения (заработано + закрытые) */}
            <div className="account-card">
              <h3 className="account-card__title">{t('account.dash.achievements') || 'Достижения'}</h3>
              <div className="account-ach-grid">
                {allAchievements.map(a => (
                  <span key={a.id} className={`account-ach ${a.ok ? '' : 'account-ach--locked'}`} title={t(a.key)}>
                    <Icon name={a.ok ? a.icon : 'lock'} size={18} strokeWidth={1.5} />
                    <span className="account-ach__label">{t(a.key)}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      // ── Профиль ──
      // ── Настройки (профиль + данные + cookie + поддержка + сессия + удаление) ──
      case 'settings':
        return (
          <div className="account-settings">
          <section className="account-section">
            <h2>{t('account.profile')}</h2>

            {user && (
              <div className="account-field">
                <label className="account-label">{t('account.email')}</label>
                <div className="account-value account-value--readonly">
                  <Icon name="mail" size={14} strokeWidth={1.5} />
                  {user.email}
                </div>
                <span className="account-hint">{t('account.emailHint')}</span>
              </div>
            )}

            {user && (
            <div className="account-field">
              <label className="account-label">{t('account.displayName')}</label>
              <div className="account-value account-value--readonly">
                <Icon name="user" size={14} strokeWidth={1.5} />
                {profile?.display_name || <span style={{ opacity: 0.45 }}>{t('profile.namePlaceholder')}</span>}
              </div>
              <span className="account-hint">{t('account.nameHint')}</span>
            </div>
            )}

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
                <Icon name="refresh-circle" size={16} strokeWidth={1.5} />
                {t('account.cookieReset')}
              </button>
            </div>
          </section>

          <section className="account-section">
            <h2>{t('account.gdprContact')}</h2>
            <p className="account-section__desc">{t('account.gdprContactDesc')}</p>
            <a
              href="mailto:privacy@105-atlas.app"
              className="account-btn account-btn--ghost"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <Icon name="mail" size={16} strokeWidth={1.5} />
              privacy@105-atlas.app
            </a>
          </section>

          {user ? (
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
          ) : (
          <section className="account-section">
            <h2>{t('account.session')}</h2>
            <p className="account-hint" style={{ marginBottom: 12 }}>
              {t('account.guest.settingsHint')}
            </p>
            <button
              type="button"
              className="account-btn account-btn--primary"
              onClick={() => (onRequestAuth ? onRequestAuth() : document.dispatchEvent(new CustomEvent('atlas:open-auth')))}
            >
              <Icon name="login" size={16} strokeWidth={1.5} />
              {t('auth.signIn')}
            </button>
          </section>
          )}

          {/* Удаление аккаунта — только тому, у кого он есть. Гостю вместо
              этого — сброс всего своего из этого браузера. */}
          {!user && (
          <section className="account-section account-section--danger">
            <h2>{t('account.dangerZone')}</h2>
            <p className="account-section__desc">{t('profile.data.resetConfirm')}</p>
            <button
              type="button"
              className="account-btn account-btn--danger"
              onClick={resetGuestData}
            >
              <Icon name="close" size={16} strokeWidth={1.75} />
              {t('profile.data.reset')}
            </button>
          </section>
          )}
          {user && (
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
                {deleteError && (
                  <p className="account-delete-confirm__warning" role="alert">
                    <Icon name="warning" size={16} strokeWidth={1.75} />
                    {t('account.deleteFailed')}
                  </p>
                )}
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
                  onClick={() => { setDeleteStep('idle'); setDeleteInput(''); setDeleteError(false); }}
                >
                  {t('common.cancel')}
                </button>
              </div>
            )}

            {deleteStep === 'deleting' && (
              <div className="account-delete-confirm">
                <Icon name="refresh-circle" size={20} strokeWidth={1.5} />
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
          )}
          </div>
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
              className={`account-nav-btn ${section === item.id ? 'is-active' : ''}`}
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

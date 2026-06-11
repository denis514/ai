import React, { useEffect, useMemo, useState } from 'react';
import Icon from './Icon.jsx';
import PlanetLogo from './PlanetLogo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useT, useLocale } from '../i18n/LocaleContext.jsx';
import { updateProfile, deleteProfile } from '../services/profileService.js';
import { supabase } from '../lib/supabaseClient.js';
import { useSupabaseStats } from '../hooks/useSupabaseStats.js';
import { tutorials, tutorialIds } from '../data/tutorials.js';
import { getLocalizedTutorial } from '../i18n/useTutorial.js';
import { getNode } from '../i18n/strings.js';
import { WHATS_NEW } from '../data/whatsNew.js';
import { nodeIndex } from '../data/mindmapData.js';
import { useWhatsNew } from '../hooks/useWhatsNew.js';
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
  onStartTutorial,
  onShowNodes,
  onOpenCourses,
  onOpenBuilder,
}) {
  const t = useT();
  const { locale, setLocale, locales, contentVersion } = useLocale();
  const { user, profile, setProfile, signOut } = useAuth();

  // Статистика активности из Supabase
  const supaStats = useSupabaseStats(user?.id || null);

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
      const stepCount = tutorials[id]?.steps?.length || 1;
      const doneCount = p?.completedSteps?.length || 0;
      const percent = Math.round((doneCount / stepCount) * 100);
      const title = getLocalizedTutorial(id, locale)?.title || id;
      result.push({ id, title, percent, startedAt: p?.startedAt || null });
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

  // ── Что нового (реестр обновлений, TTL 60 дней) ──────────────────────────
  const { isNew, markSeen } = useWhatsNew();
  const whatsNewItems = useMemo(() => {
    const TTL = 60;
    const now = Date.now();
    return Object.entries(WHATS_NEW)
      .filter(([id, e]) => {
        const age = (now - new Date(e.date).getTime()) / 86400000;
        if (age > TTL) return false;
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

  // ── Сводка конструктора (мои агенты + автозапуски) ────────────────────────
  const [builder, setBuilder] = useState({ loading: true, workflows: [], activeRuns: 0, todayRuns: 0 });
  useEffect(() => {
    if (!user?.id) { setBuilder(b => ({ ...b, loading: false })); return; }
    let alive = true;
    Promise.all([
      listWorkflows(user.id).catch(() => []),
      listAllSchedules().catch(() => []),
      getTodayUsage().catch(() => null),
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
    { id: 'overview', icon: 'grid',     label: t('account.dash.overview') || 'Обзор' },
    { id: 'profile',  icon: 'user',     label: t('account.profile')     || 'Профиль' },
    { id: 'activity', icon: 'flash',    label: t('profile.activity')    || 'Активность' },
    { id: 'data',     icon: 'download', label: t('account.dataPrivacy') || 'Данные и приватность' },
    { id: 'cookie',   icon: 'settings', label: t('account.cookieTitle') || 'Cookie' },
    { id: 'support',  icon: 'mail',     label: t('account.gdprContact') || 'Поддержка' },
    { id: 'session',  icon: 'login',    label: t('account.session')     || 'Сессия' },
    { id: 'danger',   icon: 'trash',    label: t('account.dangerZone')  || 'Удаление', danger: true },
  ];

  const greetName = profile?.display_name || (user.email || '').split('@')[0];
  const coursesDone = supaStats.tutorialsDone || 0;
  const coursesTotal = tutorialIds.length;

  const renderSection = () => {
    switch (section) {
      // ── Обзор (дашборд: всё сразу) ──
      case 'overview':
        return (
          <div className="account-dash">
            {/* Приветствие + серия дней */}
            <div className="account-dash__hero">
              <div>
                <h2 className="account-dash__hello">
                  {(t('account.dash.greeting') || 'С возвращением, {name}').replace('{name}', greetName)}
                </h2>
                {!supaStats.loading && (
                  <p className="account-dash__streak">
                    <Icon name="flash" size={14} strokeWidth={1.6} />
                    {supaStats.streak > 0
                      ? (t('account.dash.streak') || 'Серия: {n} дн. подряд').replace('{n}', String(supaStats.streak))
                      : (t('account.dash.streakNone') || 'Загляни сегодня — начни серию')}
                    <span className="account-dash__streak-total">
                      · {(t('account.dash.totalDays') || 'всего {n} дн.').replace('{n}', String(supaStats.totalDays || 0))}
                    </span>
                  </p>
                )}
              </div>
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
                    {activeCourses.slice(0, 3).map(c => (
                      <button
                        key={c.id}
                        type="button"
                        className="account-course"
                        onClick={() => onStartTutorial?.(c.id)}
                      >
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

              {/* Мой прогресс одним взглядом */}
              <div className="account-widget">
                <div className="account-widget__head"><h3>{t('account.dash.progress') || 'Мой прогресс'}</h3></div>
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
              </div>

              {/* На повторение */}
              <div className="account-widget">
                <div className="account-widget__head"><h3>{t('account.dash.review') || 'На повторение'}</h3></div>
                {reviewNodes.length === 0 ? (
                  <div className="account-widget__empty account-widget__empty--sm">
                    <Icon name="check" size={18} strokeWidth={1.75} />
                    <p>{t('account.dash.reviewEmpty') || 'Пусто — нечего повторять.'}</p>
                  </div>
                ) : (
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
                )}
              </div>

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

              {/* Достижения */}
              <div className="account-widget">
                <div className="account-widget__head"><h3>{t('account.dash.achievements') || 'Достижения'}</h3></div>
                {earnedAchievements.length === 0 ? (
                  <div className="account-widget__empty account-widget__empty--sm">
                    <Icon name="trophy" size={18} strokeWidth={1.5} />
                    <p>{t('account.dash.achievementsEmpty') || 'Учись и собирай достижения.'}</p>
                  </div>
                ) : (
                  <div className="account-ach-grid">
                    {earnedAchievements.map(a => (
                      <span key={a.id} className="account-ach" title={t(a.key)}>
                        <Icon name={a.icon} size={18} strokeWidth={1.5} />
                        <span className="account-ach__label">{t(a.key)}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Мои агенты и автозапуски */}
              <div className="account-widget account-widget--wide">
                <div className="account-widget__head">
                  <h3>{t('account.dash.agents') || 'Мои агенты'}</h3>
                  <button type="button" className="account-widget__link" onClick={() => onOpenBuilder?.()}>
                    {t('account.dash.openBuilder') || 'Открыть конструктор'}
                    <Icon name="arrow-right" size={13} strokeWidth={1.75} />
                  </button>
                </div>
                {builder.workflows.length === 0 ? (
                  <div className="account-widget__empty account-widget__empty--sm">
                    <Icon name="robot" size={18} strokeWidth={1.5} />
                    <p>{t('account.dash.agentsEmpty') || 'У вас пока нет агентов — соберите первого в конструкторе.'}</p>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </div>
          </div>
        );

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
                <Icon name="refresh-circle" size={14} strokeWidth={1.5} />
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
                <Icon name="refresh-circle" size={16} strokeWidth={1.5} />
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

import React, { useEffect, useState } from 'react';
import { tutorials } from '../data/tutorials.js';
import { mindmapData, CATEGORIES } from '../data/mindmapData.js';
import { learningPaths } from '../data/learningPaths.js';
import { promptIndex } from '../data/promptLibrary.js';
import { useIsMobile } from '../hooks/useIsMobile.js';
import TutorialDetail from './TutorialDetail.jsx';
import Icon from './Icon.jsx';
import { useT, useLocale } from '../i18n/LocaleContext.jsx';
import { getLocalizedTutorial } from '../i18n/useTutorial.js';
import { getLocalizedLibraryTemplate, getLocalizedFeaturedPrompt } from '../i18n/usePrompt.js';
import { getAllLocalizedPaths } from '../i18n/usePath.js';

function findNodeById(root, id) {
  if (root.id === id) return root;
  if (root.children) {
    for (const c of root.children) {
      const f = findNodeById(c, id);
      if (f) return f;
    }
  }
  return null;
}

const LEVEL_COLOR = {
  beginner:     '#16a34a',
  intermediate: '#2563eb',
  advanced:     '#7c3aed'
};

const AUDIENCES = ['all', 'everyone', 'business', 'developers'];
const STATUSES  = ['all', 'started', 'done'];
const LEVEL_GROUPS = ['beginner', 'intermediate', 'advanced'];

export default function CoursesModal({ onClose, onOpen, onNavigate, progressApi, nodeProgressApi, onOpenPrompt }) {
  const t = useT();
  const { locale } = useLocale();
  const [tab, setTab] = useState('paths');
  const [audience, setAudience] = useState('all');
  const [status, setStatus]   = useState('all');
  const [selectedTutorialId, setSelectedTutorialId] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        // На mobile сначала закрывается preview, потом сама модалка
        if (selectedTutorialId && isMobile) {
          setSelectedTutorialId(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, selectedTutorialId, isMobile]);

  // Локализованный preview выбранного туториала.
  const selectedTutorialKey = selectedTutorialId;

  const allItems = Object.entries(tutorials).map(([key, struct]) => {
    const tutLocalized = getLocalizedTutorial(key, locale);
    const node = findNodeById(mindmapData, struct.nodeId);
    const p = progressApi.getProgress(struct.nodeId);
    const done = p.completedSteps?.length || 0;
    const total = struct.steps.length;
    const isDone = !!p.completedAt;
    const isStarted = done > 0 || (p.lastStepIndex || 0) > 0;
    const cat = node ? CATEGORIES[node.category] : null;
    return { key, t: tutLocalized, node, p, done, total, isDone, isStarted, cat,
             audience: struct.audience || 'everyone',
             level: struct.level || 'beginner' };
  });

  const completed = allItems.filter(i => i.isDone).length;
  const started   = allItems.filter(i => !i.isDone && i.isStarted).length;

  // Фильтр по аудитории
  const byAudience = audience === 'all'
    ? allItems
    : allItems.filter(i => i.audience === audience);

  // Фильтр по статусу
  const byStatus = status === 'done'
    ? byAudience.filter(i => i.isDone)
    : status === 'started'
      ? byAudience.filter(i => i.isStarted && !i.isDone)
      : byAudience;

  // Группируем по уровню: начальный → средний → продвинутый
  const levelGroups = LEVEL_GROUPS
    .map(lvl => ({ level: lvl, items: byStatus.filter(i => i.level === lvl) }))
    .filter(g => g.items.length > 0);

  return (
    <div
      className="courses-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="courses-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`courses-modal ${selectedTutorialKey ? 'has-detail-open' : ''} ${isFullscreen ? 'is-fullscreen' : ''}`}>
        <header className="courses-header">
          <div>
            <h2 id="courses-title">{t('courses.title')}</h2>
            <p>
              {tab === 'paths'
                ? t('courses.paths.desc', { n: learningPaths.length })
                : t('courses.summary', { done: completed, started, idle: byAudience.length - completed - started })}
            </p>
          </div>
          <button
            type="button"
            className="courses-expand"
            onClick={() => setIsFullscreen(v => !v)}
            aria-label={isFullscreen ? 'Свернуть окно' : 'Развернуть на весь экран'}
            title={isFullscreen ? 'Свернуть' : 'На весь экран'}
          >
            <Icon name="expand" size={18} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            className="courses-close"
            onClick={onClose}
            aria-label={t('common.close')}
          >
            <Icon name="close" size={20} strokeWidth={1.75} />
          </button>
        </header>

        <div className="courses-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'paths'}
            className={`courses-tab ${tab === 'paths' ? 'is-active' : ''}`}
            onClick={() => setTab('paths')}
          >
            <Icon name="compass" size={14} strokeWidth={1.5} />
            {t('courses.paths')}
            <span className="courses-tab__count">{learningPaths.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'courses'}
            className={`courses-tab ${tab === 'courses' ? 'is-active' : ''}`}
            onClick={() => setTab('courses')}
          >
            <Icon name="graduation" size={14} strokeWidth={1.5} />
            {t('courses.courses')}
            <span className="courses-tab__count">{allItems.length}</span>
          </button>
        </div>

        {/* Фильтр аудитории */}
        <div className="courses-audience" role="group" aria-label="Audience filter">
          {AUDIENCES.map(aud => (
            <button
              key={aud}
              type="button"
              className={`courses-audience__pill ${audience === aud ? 'is-active' : ''}`}
              onClick={() => { setAudience(aud); setSelectedTutorialId(null); }}
            >
              {t(`courses.audience.${aud}`)}
            </button>
          ))}
        </div>

        {/* Фильтр статуса — только на вкладке «Курсы» */}
        {tab === 'courses' && (
          <div className="courses-status" role="group" aria-label="Status filter">
            {STATUSES.map(s => {
              const count = s === 'done' ? completed : s === 'started' ? started : null;
              return (
                <button
                  key={s}
                  type="button"
                  className={`courses-status__pill ${status === s ? 'is-active' : ''}`}
                  onClick={() => { setStatus(s); setSelectedTutorialId(null); }}
                >
                  {t(`courses.status.${s}`)}
                  {count != null && count > 0 && (
                    <span className="courses-status__badge">{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {tab === 'courses' ? (
          <div className={`courses-pane-wrap ${selectedTutorialKey ? 'has-detail' : ''}`}>
          <div className="courses-list">
            {levelGroups.length === 0 && (
              <div className="courses-empty">
                <Icon name="graduation" size={28} strokeWidth={1.25} />
                <p>{t(`courses.empty.${status}`)}</p>
              </div>
            )}
            {levelGroups.map(({ level, items: groupItems }) => (
              <div key={level} className="courses-level-group">
                <div className="courses-level-group__header" style={{ '--lvl-color': LEVEL_COLOR[level] }}>
                  <span className="courses-level-group__dot" />
                  <span className="courses-level-group__label">{t(`level.${level}`)}</span>
                  <span className="courses-level-group__count">{groupItems.length}</span>
                </div>
                {groupItems.map(({ key, t: tut, node, p, done, total, isDone, isStarted, cat }) => (
                  <button
                    key={key}
                    type="button"
                    className={`course ${isDone ? 'is-done' : ''} ${isStarted && !isDone ? 'is-started' : ''} ${selectedTutorialKey === key ? 'is-selected' : ''}`}
                    onClick={() => setSelectedTutorialId(key)}
                    style={cat ? { '--cat-color': cat.color } : undefined}
                  >
                    <div className="course__icon" aria-hidden="true">
                      <Icon name={tut.icon} size={22} strokeWidth={1.5} />
                      {isDone && <span className="course__done-badge" aria-hidden="true"><Icon name="check" size={10} strokeWidth={2.5} /></span>}
                    </div>
                    <div className="course__main">
                      <div className="course__title-row">
                        <h3>{tut.title}</h3>
                        {cat && node && <span className="course__cat">{t(`category.${node.category || 'основы'}`)}</span>}
                      </div>
                      <p>{tut.subtitle}</p>
                      <div className="course__meta">
                        <span className="course__meta-item">
                          <Icon name="books" size={14} strokeWidth={1.5} /> {t('courses.stepsCount', { n: total })}
                        </span>
                        <span className="course__meta-item">
                          <Icon name="clock" size={14} strokeWidth={1.5} /> {tut.totalTime}
                        </span>
                        <span className={`course__status ${isDone ? 'is-done' : isStarted ? 'is-started' : ''}`}>
                          {isDone
                            ? (p.completedAt
                                ? t('courses.completedOn', { date: new Date(p.completedAt).toLocaleDateString(locale === 'ru' ? 'ru-RU' : locale === 'fi' ? 'fi-FI' : 'en-US') })
                                : t('courses.completed'))
                            : isStarted
                              ? t('courses.inProgress', { done, total })
                              : t('courses.notStarted')}
                        </span>
                      </div>
                      <div className="course__progress">
                        <div className="course__progress-bar" style={{ width: `${(done / total) * 100}%` }} />
                      </div>
                    </div>
                    <div className="course__cta" aria-hidden="true">
                      <Icon name="arrow-right" size={18} strokeWidth={1.5} />
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Detail panel — превью туториала. На desktop: справа от списка.
              На mobile: полностью замещает список (с кнопкой назад). */}
          {selectedTutorialKey && (
            <div className="courses-detail">
              <TutorialDetail
                tutId={selectedTutorialKey}
                progressApi={progressApi}
                isMobile={isMobile}
                onBack={() => setSelectedTutorialId(null)}
                onStart={() => {
                  setSelectedTutorialId(null);
                  onOpen(selectedTutorialKey); // передаём ключ туториала, не nodeId
                }}
                onOpenNode={(id) => {
                  setSelectedTutorialId(null);
                  // setRoute сам закрывает модалку — onClose() здесь обнулял бы маршрут.
                  onNavigate?.({ type: 'node', id });
                }}
                onOpenTutorial={(id) => setSelectedTutorialId(id)}
                onOpenPrompt={(p) => {
                  setSelectedTutorialId(null);
                  onOpenPrompt?.(p);
                }}
              />
            </div>
          )}
          </div>
        ) : (
          <PathsList
            paths={getAllLocalizedPaths(locale)}
            audience={audience}
            progressApi={progressApi}
            nodeProgressApi={nodeProgressApi}
            onNavigate={(r) => {
              // setRoute сам закрывает модалку (route.type !== 'courses').
              // Дополнительный onClose() здесь побеждал бы в батче и обнулял маршрут.
              onNavigate?.(r);
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ============================================================
   Маршруты — список + раскрывающиеся шаги
   ============================================================ */
function isStepDone(step, { progressApi, nodeProgressApi }) {
  if (step.type === 'node') {
    return nodeProgressApi?.getStatus(step.id) === 'viewed';
  }
  if (step.type === 'tutorial') {
    return !!progressApi?.isCompleted(step.id);
  }
  return false; // для prompt прогресс не отслеживаем
}

function stepTitle(step, tFn, locale) {
  if (step.type === 'node') {
    return tFn ? tFn(`nodes.${step.id}.title`) : step.id;
  }
  if (step.type === 'tutorial') {
    const loc = locale ? getLocalizedTutorial(step.id, locale) : null;
    return loc?.title || step.id;
  }
  if (step.type === 'prompt') {
    const loc = locale
      ? (getLocalizedLibraryTemplate(step.id, locale) || getLocalizedFeaturedPrompt(step.id, locale))
      : null;
    return loc?.title || step.id;
  }
  return step.id;
}

function stepIcon(step) {
  if (step.type === 'node') {
    return findNodeById(mindmapData, step.id)?.icon || 'sparkles';
  }
  if (step.type === 'tutorial') {
    return tutorials[step.id]?.icon || 'graduation';
  }
  if (step.type === 'prompt') {
    return promptIndex[step.id]?.icon || 'note';
  }
  return 'sparkles';
}

const LEVEL_ORDER = { beginner: 0, intermediate: 1, advanced: 2, expert: 3 };

function PathsList({ paths, audience, progressApi, nodeProgressApi, onNavigate }) {
  const t = useT();
  const { locale } = useLocale();
  const [openId, setOpenId] = useState(null);
  const TYPE_LABEL = {
    node: t('courses.kind.node'),
    tutorial: t('courses.kind.tutorial'),
    prompt: t('courses.kind.prompt')
  };

  const filtered = audience === 'all'
    ? paths
    : paths.filter(p => p.audience === audience);

  const sorted = [...filtered].sort(
    (a, b) => (LEVEL_ORDER[a.level] ?? 99) - (LEVEL_ORDER[b.level] ?? 99)
  );

  return (
    <div className="paths-list">
      {sorted.map(path => {
        const total = path.steps.length;
        const done = path.steps.filter(s => isStepDone(s, { progressApi, nodeProgressApi })).length;
        const percent = Math.round((done / total) * 100);
        const isOpen = openId === path.id;
        return (
          <div key={path.id} className={`path ${isOpen ? 'is-open' : ''}`}>
            <button
              type="button"
              className="path__head"
              onClick={() => setOpenId(isOpen ? null : path.id)}
              style={{ '--lvl-color': LEVEL_COLOR[path.level] }}
              aria-expanded={isOpen}
            >
              <span className="path__icon" aria-hidden="true">
                <Icon name={path.icon} size={22} strokeWidth={1.5} />
              </span>
              <span className="path__main">
                <span className="path__title-row">
                  <h3>{path.title}</h3>
                  <span className="path__level">{t(`level.${path.level}`)}</span>
                </span>
                <p>{path.description}</p>
                <span className="path__meta">
                  <span className="path__meta-item">
                    <Icon name="books" size={13} strokeWidth={1.5} /> {t('courses.stepsCount', { n: total })}
                  </span>
                  <span className="path__meta-item">
                    <Icon name="clock" size={13} strokeWidth={1.5} /> {path.duration}
                  </span>
                  <span className="path__progress-text">
                    {done}/{total} · {percent}%
                  </span>
                </span>
                <span className="path__progress">
                  <span className="path__progress-bar" style={{ width: `${percent}%` }} />
                </span>
              </span>
              <span className="path__cta" aria-hidden="true">
                <Icon name={isOpen ? 'minus' : 'plus'} size={16} strokeWidth={1.75} />
              </span>
            </button>

            {isOpen && (
              <ol className="path__steps">
                {path.steps.map((step, idx) => {
                  const sDone = isStepDone(step, { progressApi, nodeProgressApi });
                  return (
                    <li key={`${step.type}:${step.id}`}>
                      <button
                        type="button"
                        className={`path-step ${sDone ? 'is-done' : ''}`}
                        onClick={() => onNavigate({ type: step.type, id: step.id })}
                      >
                        <span className="path-step__num">
                          {sDone ? <Icon name="check" size={12} strokeWidth={2} /> : idx + 1}
                        </span>
                        <span className="path-step__icon" aria-hidden="true">
                          <Icon name={stepIcon(step)} size={14} strokeWidth={1.5} />
                        </span>
                        <span className="path-step__main">
                          <span className="path-step__title">{stepTitle(step, t, locale)}</span>
                          {step.why && <span className="path-step__why">{step.why}</span>}
                        </span>
                        <span className="path-step__type">{TYPE_LABEL[step.type]}</span>
                        <Icon name="arrow-right" size={12} strokeWidth={1.5} />
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        );
      })}
    </div>
  );
}

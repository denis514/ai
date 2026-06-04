import React, { useEffect, useRef, useState } from 'react';
import { tutorials } from '../data/tutorials.js';
import { mindmapData, CATEGORIES } from '../data/mindmapData.js';
import { learningPaths } from '../data/learningPaths.js';
import { promptIndex } from '../data/promptLibrary.js';
import { useIsMobile } from '../hooks/useIsMobile.js';
import { useFocusReturn } from '../hooks/useFocusReturn.js';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock.js';
import TutorialDetail from './TutorialDetail.jsx';
import Icon from './Icon.jsx';
import ShareButton from './ShareButton.jsx';
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

const STATUSES     = ['all', 'started', 'done'];
const PATH_LEVELS  = ['all', 'beginner', 'intermediate', 'advanced'];
const LEVEL_GROUPS = ['beginner', 'intermediate', 'advanced'];
const CAT_KEYS     = Object.keys(CATEGORIES); // порядок категорий для группировки курсов

export default function WorkflowsModal({
  onClose, onOpen, onNavigate, progressApi, nodeProgressApi, onOpenPrompt,
  onMinimize,                  // (state) => void — свернуть в пилюлю
  initialSelectedTutorial,     // string | null — восстановить туториал при разворачивании
  initialPathId,               // string | null — deep-link на конкретный маршрут (/path/<id>)
}) {
  const t = useT();
  const { locale } = useLocale();
  const [tab, setTab] = useState('paths');
  const [status, setStatus]   = useState('all');
  const [levelSort, setLevelSort] = useState('all'); // сортировка Polut по уровню
  const [catSort,   setCatSort]   = useState('all'); // сортировка курсов по категории
  const [statusOpen,   setStatusOpen]   = useState(false);
  const [levelOpen,    setLevelOpen]    = useState(false);
  const [catOpen,      setCatOpen]      = useState(false);
  const [selectedTutorialId, setSelectedTutorialId] = useState(initialSelectedTutorial || null);
  useFocusReturn();
  useBodyScrollLock();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMobile = useIsMobile();
  const statusRef   = useRef(null);
  const levelRef    = useRef(null);
  const catRef      = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        // ESC закрывает topmost layer: если открыт TutorialDetail —
        // сначала закрываем его (возврат к списку), только после второго
        // ESC закрывается модалка. Стандартный паттерн «один ESC = один слой».
        if (selectedTutorialId) {
          setSelectedTutorialId(null);
        } else {
          onClose();
        }
      } else if (e.key === 'Backspace' && selectedTutorialId) {
        // Backspace тоже возвращает к списку (если открыт detail).
        // Игнорируем когда юзер в input/textarea — иначе backspace
        // удалит символ ввода.
        const tag = (e.target?.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea' || e.target?.isContentEditable) return;
        setSelectedTutorialId(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, selectedTutorialId]);

  // Закрываем дропдауны по клику вне
  useEffect(() => {
    if (!statusOpen && !levelOpen && !catOpen) return;
    const onClick = (e) => {
      if (statusRef.current && !statusRef.current.contains(e.target)) setStatusOpen(false);
      if (levelRef.current  && !levelRef.current.contains(e.target))  setLevelOpen(false);
      if (catRef.current    && !catRef.current.contains(e.target))    setCatOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [statusOpen, levelOpen, catOpen]);

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
    return {
      key, t: tutLocalized, node, p, done, total, isDone, isStarted, cat,
      audience: struct.audience || 'everyone',
      level:    struct.level    || 'beginner',
    };
  });

  const completed = allItems.filter(i => i.isDone).length;
  const started   = allItems.filter(i => !i.isDone && i.isStarted).length;

  // Фильтр по статусу
  const byStatus = status === 'done'
    ? allItems.filter(i => i.isDone)
    : status === 'started'
      ? allItems.filter(i => i.isStarted && !i.isDone)
      : allItems;

  // Курсы группируются по КАТЕГОРИИ (лейбл-бейдж на карточке: Foundation /
  // Prompts / Agents …), порядок — как в CATEGORIES. Выбранную в дропдауне
  // категорию поднимаем наверх.
  let catGroups = CAT_KEYS
    .map(c => ({ cat: c, items: byStatus.filter(i => (i.node?.category || '') === c) }))
    .filter(g => g.items.length > 0);
  if (catSort !== 'all') {
    catGroups = [...catGroups].sort(
      (a, b) => (b.cat === catSort ? 1 : 0) - (a.cat === catSort ? 1 : 0)
    );
  }
  // Категории, реально присутствующие в курсах — для опций дропдауна.
  const presentCats = CAT_KEYS.filter(c => allItems.some(i => (i.node?.category || '') === c));

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
                : t('courses.summary', { done: completed, started, idle: allItems.length - completed - started })}
            </p>
          </div>
          <button
            type="button"
            className="courses-expand"
            onClick={() => setIsFullscreen(v => !v)}
            aria-label={isFullscreen ? 'Свернуть окно' : 'Развернуть на весь экран'}
            title={isFullscreen ? 'Свернуть' : 'На весь экран'}
          >
            <Icon name="fullscreen" size={17} strokeWidth={1.75} />
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

        {/* Фильтры — два дропдауна в одной строке */}
        <div className="courses-filters-bar">

          {/* Polut: «Уровень» (выбранный уровень поднимается наверх). */}
          {tab === 'paths' && (
          <div className="cfilter" ref={levelRef}>
              <button
                type="button"
                className={`cfilter__toggle ${levelOpen ? 'is-open' : ''} ${levelSort !== 'all' ? 'is-active' : ''}`}
                onClick={() => { setLevelOpen(v => !v); setStatusOpen(false); setCatOpen(false); }}
                aria-haspopup="listbox"
                aria-expanded={levelOpen}
              >
                <span className="cfilter__label">{t('courses.filter.level') || 'Уровень'}</span>
                <span className="cfilter__value">{levelSort === 'all' ? (t('courses.level.all') || 'Все') : t(`level.${levelSort}`)}</span>
                <Icon name={levelOpen ? 'arrow-up' : 'arrow-down'} size={11} strokeWidth={1.75} />
              </button>
              {levelOpen && (
                <div className="cfilter__menu" role="listbox">
                  {PATH_LEVELS.map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      role="option"
                      aria-selected={levelSort === lvl}
                      className={`cfilter__option ${levelSort === lvl ? 'is-selected' : ''}`}
                      onClick={() => { setLevelSort(lvl); setLevelOpen(false); }}
                    >
                      {lvl === 'all' ? (t('courses.level.all') || 'Все') : t(`level.${lvl}`)}
                      {levelSort === lvl && <Icon name="check" size={13} strokeWidth={1.75} />}
                    </button>
                  ))}
                </div>
              )}
          </div>
          )}

          {/* Курсы: «Категория» (по лейблу-бейджу курса; выбранная — наверх). */}
          {tab === 'courses' && (
          <div className="cfilter" ref={catRef}>
            <button
              type="button"
              className={`cfilter__toggle ${catOpen ? 'is-open' : ''} ${catSort !== 'all' ? 'is-active' : ''}`}
              onClick={() => { setCatOpen(v => !v); setStatusOpen(false); setLevelOpen(false); }}
              aria-haspopup="listbox"
              aria-expanded={catOpen}
            >
              <span className="cfilter__label">{t('courses.filter.category') || 'Категория'}</span>
              <span className="cfilter__value">{catSort === 'all' ? (t('courses.level.all') || 'Все') : t(`category.${catSort}`)}</span>
              <Icon name={catOpen ? 'arrow-up' : 'arrow-down'} size={11} strokeWidth={1.75} />
            </button>
            {catOpen && (
              <div className="cfilter__menu" role="listbox">
                {['all', ...presentCats].map(c => (
                  <button
                    key={c}
                    type="button"
                    role="option"
                    aria-selected={catSort === c}
                    className={`cfilter__option ${catSort === c ? 'is-selected' : ''}`}
                    onClick={() => { setCatSort(c); setCatOpen(false); }}
                  >
                    {c === 'all' ? (t('courses.level.all') || 'Все') : t(`category.${c}`)}
                    {catSort === c && <Icon name="check" size={13} strokeWidth={1.75} />}
                  </button>
                ))}
              </div>
            )}
          </div>
          )}

          {/* Правый дропдаун: «Статус» — только на вкладке «Курсы» */}
          {tab === 'courses' && (
            <div className="cfilter" ref={statusRef}>
              <button
                type="button"
                className={`cfilter__toggle ${statusOpen ? 'is-open' : ''} ${status !== 'all' ? 'is-active' : ''}`}
                onClick={() => { setStatusOpen(v => !v); setLevelOpen(false); setCatOpen(false); }}
                aria-haspopup="listbox"
                aria-expanded={statusOpen}
              >
                <span className="cfilter__label">{t('courses.filter.status')}</span>
                <span className="cfilter__value">{t(`courses.status.${status}`)}</span>
                {status !== 'all' && (status === 'done' ? completed : started) > 0 && (
                  <span className="cfilter__dot" />
                )}
                <Icon name={statusOpen ? 'arrow-up' : 'arrow-down'} size={11} strokeWidth={1.75} />
              </button>
              {statusOpen && (
                <div className="cfilter__menu" role="listbox">
                  {STATUSES.map(s => {
                    const count = s === 'done' ? completed : s === 'started' ? started : null;
                    return (
                      <button
                        key={s}
                        type="button"
                        role="option"
                        aria-selected={status === s}
                        className={`cfilter__option ${status === s ? 'is-selected' : ''}`}
                        onClick={() => { setStatus(s); setStatusOpen(false); setSelectedTutorialId(null); }}
                      >
                        <span>{t(`courses.status.${s}`)}</span>
                        {count != null && count > 0 && (
                          <span className="cfilter__badge">{count}</span>
                        )}
                        {status === s && <Icon name="check" size={13} strokeWidth={1.75} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {tab === 'courses' ? (
          <div className={`courses-pane-wrap ${selectedTutorialKey ? 'has-detail' : ''}`}>
          <div className="courses-list">
            {/* Пустое состояние */}
            {catGroups.length === 0 && (
              <div className="courses-empty">
                <Icon name="graduation" size={28} strokeWidth={1.25} />
                <p>{t(`courses.empty.${status}`)}</p>
              </div>
            )}

            {/* Курсы, сгруппированные по КАТЕГОРИИ (лейбл-бейдж курса) */}
            {catGroups.map(({ cat: catKey, items: groupItems }) => (
              <div key={catKey} className="courses-level-group">
                <div className="courses-level-group__header" style={{ '--lvl-color': CATEGORIES[catKey]?.color || 'var(--accent)' }}>
                  <span className="courses-level-group__dot" />
                  <span className="courses-level-group__label">{t(`category.${catKey}`)}</span>
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
                      {isDone && (
                        <span className="course__done-badge" aria-hidden="true">
                          <Icon name="check" size={10} strokeWidth={2.5} />
                        </span>
                      )}
                    </div>
                    <div className="course__main">
                      <div className="course__title-row">
                        <h3>{tut.title}</h3>
                        {cat && node && <span className="course__cat">{t(`category.${node.category || 'основы'}`)}</span>}
                      </div>
                      <p>{tut.subtitle}</p>
                      {(tut.trigger || tut.savings) && (
                        <div className="course__recipe">
                          {tut.trigger && (
                            <div className="course__trigger" title={tut.trigger}>
                              <Icon name="flash" size={12} strokeWidth={1.75} />
                              <span>{tut.trigger}</span>
                            </div>
                          )}
                          {tut.savings && (
                            <span className="course__savings" title={tut.savings}>
                              <Icon name="rocket" size={11} strokeWidth={1.75} />
                              {tut.savings}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="course__meta">
                        <span className="course__meta-item">
                          <Icon name="books" size={14} strokeWidth={1.5} /> {t('courses.stepsCount', { n: total })}
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
                  // Cross-link клик из туториала-превью → сворачиваем модалку
                  // в пилюлю (если родитель умеет minimize), переходим на узел.
                  if (onMinimize && selectedTutorialKey) {
                    const tutStruct = tutorials[selectedTutorialKey];
                    const tutLoc = getLocalizedTutorial(selectedTutorialKey, locale);
                    onMinimize({
                      type: 'workflows',
                      selectedTutorialKey,
                      displayTitle: tutLoc?.title || selectedTutorialKey,
                      displayIcon: tutStruct?.icon || 'graduation',
                    });
                  } else {
                    setSelectedTutorialId(null);
                  }
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
            levelSort={levelSort}
            progressApi={progressApi}
            nodeProgressApi={nodeProgressApi}
            initialPathId={initialPathId}
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

function PathsList({ paths, levelSort = 'all', progressApi, nodeProgressApi, onNavigate, initialPathId }) {
  const t = useT();
  const { locale } = useLocale();
  const [openId, setOpenId] = useState(initialPathId || null);

  // Deep-link /path/<id>: раскрыть нужный маршрут и подскроллить к нему.
  useEffect(() => {
    if (!initialPathId) return;
    setOpenId(initialPathId);
    const el = document.getElementById(`lp-${initialPathId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [initialPathId]);
  const TYPE_LABEL = {
    node: t('courses.kind.node'),
    tutorial: t('courses.kind.tutorial'),
    prompt: t('courses.kind.prompt')
  };

  // На вкладке Polut фильтруем/сортируем по уровню (не по аудитории).
  const sorted = [...paths].sort(
    (a, b) => (LEVEL_ORDER[a.level] ?? 99) - (LEVEL_ORDER[b.level] ?? 99)
  );
  // Группировка по уровню (лейбл на плашке: Aloittelija / Edistynyt / …).
  let pathGroups = Object.keys(LEVEL_ORDER)
    .map(level => ({ level, items: sorted.filter(p => p.level === level) }))
    .filter(g => g.items.length);
  // Выбранный в дропдауне уровень поднимаем наверх (остальные — обычным порядком).
  if (levelSort !== 'all') {
    pathGroups = [...pathGroups].sort(
      (a, b) => (b.level === levelSort ? 1 : 0) - (a.level === levelSort ? 1 : 0)
    );
  }

  return (
    <div className="paths-list">
      {pathGroups.map(({ level, items }) => (
        <div key={level} className="courses-level-group">
          <div className="courses-level-group__header" style={{ '--lvl-color': LEVEL_COLOR[level] }}>
            <span className="courses-level-group__dot" />
            <span className="courses-level-group__label">{t(`level.${level}`)}</span>
            <span className="courses-level-group__count">{items.length}</span>
          </div>
          {items.map(path => {
        const total = path.steps.length;
        const done = path.steps.filter(s => isStepDone(s, { progressApi, nodeProgressApi })).length;
        const percent = Math.round((done / total) * 100);
        const isOpen = openId === path.id;
        return (
          <div key={path.id} id={`lp-${path.id}`} className={`path ${isOpen ? 'is-open' : ''}`}>
            <div className="path__row">
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
                  <span className="path__progress-text">
                    {done}/{total} · {percent}%
                  </span>
                </span>
                <span className="path__progress">
                  <span className="path__progress-bar" style={{ width: `${percent}%` }} />
                </span>
              </span>
            </button>
            <div className="path__aside">
              <span className="path__share-wrap" onClick={(e) => e.stopPropagation()}>
                <ShareButton type="path" id={path.id} title={path.title} />
              </span>
              <button
                type="button"
                className="path__cta"
                onClick={() => setOpenId(isOpen ? null : path.id)}
                aria-label={isOpen ? (t('common.collapse') || 'Свернуть') : (t('common.expand') || 'Развернуть')}
              >
                <Icon name={isOpen ? 'minus' : 'plus'} size={16} strokeWidth={1.75} />
              </button>
            </div>
            </div>

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
      ))}
    </div>
  );
}

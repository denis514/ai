import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { tutorials } from '../data/tutorials.js';
import { mindmapData } from '../data/mindmapData.js';
import Icon from './Icon.jsx';
import Skeleton from './Skeleton.jsx';
import { openTryInClaude } from '../utils/tryInClaude.js';
import InlineText from './InlineText.jsx';
import { useT, useLocale } from '../i18n/LocaleContext.jsx';
import { useTutorialContent, getLocalizedTutorial } from '../i18n/useTutorial.js';
import { useFocusReturn } from '../hooks/useFocusReturn.js';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock.js';
import { useConfirm } from '../hooks/useConfirm.js';
import { useToast } from '../hooks/useToast.js';

function findNodeById(root, id) {
  if (!root) return null;
  if (root.id === id) return root;
  if (root.children) {
    for (const c of root.children) {
      const found = findNodeById(c, id);
      if (found) return found;
    }
  }
  return null;
}

function stripInlineLinks(s) {
  return (s || '').replace(
    /\[\[(?:node|tutorial|prompt):([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g,
    (_, id, label) => label || id
  );
}

function CopyableBlock({ text, label, copiedLabel, inlineNav, tryMeta }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    const cleanText = stripInlineLinks(text);
    try {
      await navigator.clipboard.writeText(cleanText);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = cleanText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div className="tut-code">
      <InlineText as="pre" text={text} onNavigate={inlineNav} />
      <div className="tut-code__actions">
        <button
          type="button"
          className={`copy-btn ${copied ? 'is-copied' : ''}`}
          onClick={onCopy}
        >
          {copied ? (
            <>
              <Icon name="check" size={14} strokeWidth={1.75} /> {copiedLabel}
            </>
          ) : label}
        </button>
        {tryMeta && (
          <button
            type="button"
            className="tut-code__try"
            onClick={() => openTryInClaude({ ...tryMeta, content: stripInlineLinks(text) })}
          >
            <Icon name="sparkles" size={13} strokeWidth={1.6} />
            {tryMeta.label}
          </button>
        )}
      </div>
    </div>
  );
}

function Troubleshoot({ items, t }) {
  const [open, setOpen] = useState(false);
  const entries = Object.entries(items || {});
  if (!entries.length) return null;

  return (
    <details
      className="tut-trouble"
      open={open}
      onToggle={(e) => setOpen(e.target.open)}
    >
      <summary>
        <span className="tut-trouble__icon" aria-hidden="true"><Icon name="warning" size={15} strokeWidth={1.75} /></span>
        {t('tutorial.troubleshootLabel', { n: entries.length })}
      </summary>
      <ul>
        {entries.map(([symptom, fix]) => (
          <li key={symptom}>
            <strong>{symptom}.</strong> {fix}
          </li>
        ))}
      </ul>
    </details>
  );
}

export default function TutorialModal({
  tutorialId,
  onClose,
  onOpenTutorial,
  onOpenLibrary,
  onOpenNode,
  onOpenPrompt,        // (id) => void — открыть готовый промпт по id (для inline-ссылок)
  onOpenCourses,
  onMinimize,          // (state) => void — свернуть в пилюлю
  progressApi,
}) {
  const t = useT();
  const { locale } = useLocale();
  const { confirm } = useConfirm();
  const { toast } = useToast();
  // Focus возврат на trigger + body-scroll lock когда модал открыт
  useFocusReturn(true);
  useBodyScrollLock(true);
  // Локализованный туториал — структура из tutorials.js + текст из локали.
  const tut = useTutorialContent(tutorialId);

  // Навигаторы для inline-ссылок [[node:|tutorial:|prompt:]] в тексте туториала.
  // node-переход: если родитель умеет minimize — сворачиваем в пилюлю
  // (state восстановим при разворачивании). Иначе закрываем как раньше.
  // tutorial/prompt — открывается поверх, туториал не трогаем.
  const inlineNav = {
    node: (id) => {
      if (onMinimize && tut) {
        onMinimize({
          type: 'tutorial',
          tutorialId,
          displayTitle: tut.title || tutorialId,
          displayIcon: tut.icon || 'graduation',
          progress: {
            current: activeIdx + 1,
            total: tut.steps.length
          }
        });
      } else {
        onClose?.();
      }
      onOpenNode?.(id);
    },
    tutorial: (id) => onOpenTutorial?.(id),
    prompt: (id) => onOpenPrompt?.(id)
  };

  const [isFullscreen, setIsFullscreen] = useState(false);

  const { getProgress, toggleStep, setLastStepIndex, reset, isCompleted } = progressApi;

  const stepIndex = (() => {
    if (!tut) return 0;
    const p = getProgress(tutorialId);
    return Math.max(0, Math.min(p.lastStepIndex || 0, tut.steps.length - 1));
  })();
  const [activeIdx, setActiveIdx] = useState(stepIndex);
  const [showAllSteps, setShowAllSteps] = useState(false);
  const scrollRef = useRef(null);

  // Восстанавливаем шаг при смене туториала. Гость тоже продолжает с того
  // места, где остановился: прогресс лежит в браузере, при входе сливается
  // с облаком (хук перечитает его по событию, см. useTutorialProgress).
  useEffect(() => {
    if (!tut) return;
    const p = getProgress(tutorialId);
    setActiveIdx(Math.max(0, Math.min(p.lastStepIndex || 0, tut.steps.length - 1)));
  }, [tutorialId]); // eslint-disable-line

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [activeIdx, tutorialId]);

  useEffect(() => {
    if (!tut) return;
    setLastStepIndex(tutorialId, activeIdx);
  }, [activeIdx, tutorialId, tut, setLastStepIndex]);

  const onPrev = useCallback(() => setActiveIdx(i => Math.max(0, i - 1)), []);
  const onNext = useCallback(() => {
    if (!tut) return;
    setActiveIdx(i => Math.min(tut.steps.length - 1, i + 1));
  }, [tut]);

  const onToggleCurrent = useCallback(() => {
    if (!tut) return;
    const idx = Math.min(Math.max(0, activeIdx), tut.steps.length - 1);
    const step = tut.steps[idx];
    if (!step) return;
    toggleStep(tutorialId, step.id, tut.steps.length);
  }, [activeIdx, tut, tutorialId, toggleStep]);

  const onMarkAndNext = useCallback(() => {
    if (!tut) return;
    const idx = Math.min(Math.max(0, activeIdx), tut.steps.length - 1);
    const step = tut.steps[idx];
    if (!step) return;
    const p = getProgress(tutorialId);
    if (!p.completedSteps.includes(step.id)) {
      toggleStep(tutorialId, step.id, tut.steps.length);
    }
    if (idx < tut.steps.length - 1) {
      setActiveIdx(idx + 1);
    }
  }, [activeIdx, tut, tutorialId, getProgress, toggleStep]);

  useEffect(() => {
    if (!tut) return;
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'Escape') { onClose(); }
      else if (e.key === 'ArrowLeft') { onPrev(); }
      else if (e.key === 'ArrowRight') { onNext(); }
      else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onMarkAndNext();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tut, onClose, onPrev, onNext, onMarkAndNext]);

  const stepsList = useMemo(() => {
    if (!tut) return [];
    const p = getProgress(tutorialId);
    const set = new Set(p.completedSteps);
    return tut.steps.map((s, i) => ({
      ...s,
      idx: i,
      isDone: set.has(s.id),
      isActive: i === activeIdx
    }));
  }, [tut, getProgress, tutorialId, activeIdx]);

  const completedCount = stepsList.filter(s => s.isDone).length;
  const allDone = tut && completedCount === tut.steps.length;
  const percent = tut ? Math.round((completedCount / tut.steps.length) * 100) : 0;

  // Safety net: route указывает на несуществующий tutorial (битый URL,
  // устаревший hash, ошибка в данных). Возвращаем пользователя — не оставляем
  // пустой экран.
  useEffect(() => {
    if (tutorialId && !tut && onClose) {
      console.warn(`TutorialModal: tutorial "${tutorialId}" не найден, закрываю`);
      onClose();
    }
  }, [tutorialId, tut, onClose]);

  if (!tut) return null;

  // КРИТИЧНО: при переключении между туториалами (например welcome 8 шагов
  // → instructions 5 шагов) activeIdx из useState ещё может быть 7
  // (старое значение от предыдущего туториала). Без clamp tut.steps[7] =
  // undefined → step.title бросает TypeError → нет ErrorBoundary →
  // пустой экран. useEffect [tutorialId] перевыставит activeIdx в
  // следующий тик, но рендер этого фрейма обязан быть безопасным.
  const safeIdx = Math.min(Math.max(0, activeIdx), tut.steps.length - 1);
  const step = tut.steps[safeIdx];
  const isStepDone = stepsList[safeIdx]?.isDone;

  // tut.next содержит МИКС из tutorial-id и node-id (например, uc-* use-cases).
  // Резолвим каждый: сначала пробуем как туториал, затем как узел.
  // Без этого клик на узловую кнопку дёргал onOpenTutorial(node-id) и
  // открывал «пустой» TutorialModal (useTutorialContent возвращал null).
  const nextSuggestions = (tut.next || [])
    .map(id => {
      // 1. Tutorial?
      if (tutorials[id]) {
        const tutLoc = getLocalizedTutorial?.(id, locale);
        return {
          id,
          kind: 'tutorial',
          title: tutLoc?.title || id,
          icon: tutorials[id].icon || 'graduation',
        };
      }
      // 2. Node (use-case или другой)?
      const node = findNodeById(mindmapData, id);
      if (node) {
        const key = `nodes.${id}.title`;
        const got = t(key);
        return {
          id,
          kind: 'node',
          title: (got && got !== key) ? got : id,
          icon: node.icon || 'compass',
        };
      }
      // 3. Не найдено — пропускаем (битая ссылка)
      return null;
    })
    .filter(Boolean);

  return (
    <div
      className="tut-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tut-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`tut-modal ${isFullscreen ? 'is-fullscreen' : ''}`}>
        <header className="tut-header">
          <div className="tut-header__main">
            <span className="tut-header__icon" aria-hidden="true">
              <Icon name={tut.icon} size={26} strokeWidth={1.5} />
            </span>
            <div>
              <span className="tut-header__kicker">{t('tutorial.kicker')}</span>
              <h2 id="tut-title" className="tut-header__title">{tut.title}</h2>
              <p className="tut-header__subtitle">{tut.subtitle}</p>
            </div>
          </div>
          <div className="tut-header__controls">
            <button
              type="button"
              className="tut-header__expand"
              onClick={() => setIsFullscreen(v => !v)}
              aria-label={isFullscreen ? 'Свернуть окно' : 'Развернуть на весь экран'}
              title={isFullscreen ? 'Свернуть' : 'На весь экран'}
            >
              <Icon name={isFullscreen ? 'restore' : 'fullscreen'} size={17} strokeWidth={1.75} />
            </button>
            <button
              type="button"
              className="tut-header__close"
              onClick={onClose}
              aria-label={t('tutorial.closeAria')}
            >
              <Icon name="close" size={20} strokeWidth={1.75} />
            </button>
          </div>
        </header>

        <div className="tut-progress" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
          <div className="tut-progress__bar" style={{ width: `${percent}%` }} />
          <div className="tut-progress__meta">
            <span>{t('tutorial.progress.meta', { current: activeIdx + 1, total: tut.steps.length })}</span>
            <span>{t('tutorial.progress.done', { n: completedCount, p: percent })}</span>
          </div>
        </div>

        <button
          type="button"
          className="tut-steps-toggle"
          onClick={() => setShowAllSteps(s => !s)}
          aria-expanded={showAllSteps}
        >
          {showAllSteps ? t('tutorial.hideSteps') : t('tutorial.showSteps')}
        </button>

        <div className="tut-body">

          <nav className={`tut-side ${showAllSteps ? 'is-open' : ''}`} aria-label={t('tutorial.stepsAria')}>
            <ol className="tut-side__list">
              {stepsList.map(s => {
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      className={`tut-side__item ${s.isActive ? 'is-active' : ''} ${s.isDone ? 'is-done' : ''}`}
                      onClick={() => { setActiveIdx(s.idx); setShowAllSteps(false); }}
                    >
                      <span className="tut-side__num">
                        {s.isDone
                          ? <Icon name="check" size={14} strokeWidth={1.75} />
                          : s.idx + 1}
                      </span>
                      <span className="tut-side__title">{s.title}</span>
                    </button>
                  </li>
                );
              })}
            </ol>

            {allDone && (
              <div className="tut-side__done">
                <strong>
                  <Icon name="trophy" size={16} strokeWidth={1.5} /> {t('tutorial.finished')}
                </strong>
                <p>{t('tutorial.lastStepHint')}</p>
              </div>
            )}

            <button
              type="button"
              className="tut-side__reset"
              onClick={async () => {
                const ok = await confirm({
                  title: t('tutorial.resetProgress'),
                  description: t('tutorial.resetConfirm'),
                  confirmLabel: t('tutorial.resetProgress'),
                  cancelLabel: t('common.cancel') || 'Отмена',
                  danger: true,
                });
                if (ok) {
                  reset(tutorialId);
                  toast.success(t('tutorial.resetDone') || t('tutorial.resetProgress'));
                }
              }}
            >{t('tutorial.resetProgress')}</button>
          </nav>

          <main className="tut-main" ref={scrollRef}>
            {/* Тексты курса грузятся по требованию (индекс → тело). Пока тело
                едет — скелетон вместо пустых заголовков. Название и подзаголовок
                уже есть из индекса, поэтому шапка выглядит нормально. */}
            {!tut.bodyReady && (
              <div className="tut-step" aria-busy="true">
                <Skeleton width="45%" height="14px" />
                <Skeleton width="70%" height="22px" style={{ marginTop: 12 }} />
                <Skeleton.Text lines={6} />
                <Skeleton width="100%" height="120px" radius="10px" style={{ marginTop: 16 }} />
              </div>
            )}
            {tut.bodyReady && <div className="tut-step">
              <div className="tut-step__head">
                <span className="tut-step__num">{t('tutorial.stepLabel', { n: activeIdx + 1 })}</span>
              </div>
              <h3 className="tut-step__title">{step.title}</h3>

              {step.why && (
                <section className="tut-block tut-block--why">
                  <h4>{t('tutorial.section.why')}</h4>
                  <InlineText text={step.why} onNavigate={inlineNav} />
                </section>
              )}

              <section className="tut-block tut-block--how">
                <h4>{t('tutorial.section.do')}</h4>
                <ol className="tut-checklist">
                  {step.instructions.map((inst, i) => (
                    <li key={i}>
                      <InlineText as="span" text={inst} onNavigate={inlineNav} />
                    </li>
                  ))}
                </ol>
              </section>

              {step.prompt && (
                <section className="tut-block">
                  <h4>{t('tutorial.section.copy')}</h4>
                  <CopyableBlock text={step.prompt} label={t('common.copy')} copiedLabel={t('common.copied')} inlineNav={inlineNav}
                    tryMeta={{ type: 'tutorial', id: tutorialId, title: tut.title, contextTpl: t('detail.tryInClaude.context'), instruction: '', label: t('detail.tryInClaude.label') || 'Попробовать в Claude', locale }} />
                </section>
              )}

              {step.example && !step.prompt && (
                <section className="tut-block">
                  <h4>{t('tutorial.section.example')}</h4>
                  <CopyableBlock text={step.example} label={t('tutorial.copyExample')} copiedLabel={t('common.copied')} inlineNav={inlineNav}
                    tryMeta={{ type: 'tutorial', id: tutorialId, title: tut.title, contextTpl: t('detail.tryInClaude.context'), instruction: t('detail.tryInClaude.prompt'), label: t('detail.tryInClaude.label') || 'Попробовать в Claude', locale }} />
                </section>
              )}

              {step.example && step.prompt && (
                <section className="tut-block">
                  <h4>{t('tutorial.section.exampleExtra')}</h4>
                  <CopyableBlock text={step.example} label={t('tutorial.copyExample')} copiedLabel={t('common.copied')} inlineNav={inlineNav}
                    tryMeta={{ type: 'tutorial', id: tutorialId, title: tut.title, contextTpl: t('detail.tryInClaude.context'), instruction: t('detail.tryInClaude.prompt'), label: t('detail.tryInClaude.label') || 'Попробовать в Claude', locale }} />
                </section>
              )}

              {step.validate && (
                <section className="tut-block tut-block--validate">
                  <h4>
                    <Icon name="check" size={16} strokeWidth={1.75} /> {t('tutorial.section.validate')}
                  </h4>
                  <InlineText text={step.validate} onNavigate={inlineNav} />
                </section>
              )}

              {step.tip && (
                <section className="tut-block tut-block--tip">
                  <h4>
                    <Icon name="idea" size={16} strokeWidth={1.5} /> {t('tutorial.tipLabel')}
                  </h4>
                  <InlineText text={step.tip} onNavigate={inlineNav} />
                </section>
              )}

              {Array.isArray(step.actions) && step.actions.length > 0 && (
                <section className="tut-block tut-block--actions">
                  <div className="tut-actions">
                    {step.actions.map((a, i) => {
                      const run = () => {
                        if (a.type === 'external' && a.url) {
                          window.open(a.url, '_blank', 'noopener');
                          return;
                        }
                        // Все навигационные действия закрывают туториал —
                        // setRoute переключает «активный» вид (детальная панель,
                        // другой туториал, библиотека и т.п.).
                        onClose?.();
                        if (a.type === 'open-node' && a.id) onOpenNode?.(a.id);
                        else if (a.type === 'open-tutorial' && a.id) onOpenTutorial?.(a.id);
                        else if (a.type === 'open-library') onOpenLibrary?.();
                        else if (a.type === 'open-courses') onOpenCourses?.();
                      };
                      const iconName =
                        a.type === 'open-node' ? 'target' :
                        a.type === 'open-tutorial' ? 'graduation' :
                        a.type === 'open-library' ? 'books' :
                        a.type === 'external' ? 'external-link' :
                        'arrow-right';
                      return (
                        <button
                          key={i}
                          type="button"
                          className={`tut-action tut-action--${a.type}`}
                          onClick={run}
                        >
                          <Icon name={iconName} size={14} strokeWidth={1.75} />
                          <span>{a.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {step.troubleshoot && <Troubleshoot items={step.troubleshoot} t={t} />}

              {activeIdx === tut.steps.length - 1 && tut.exercises && tut.exercises.length > 0 && (
                <section className="tut-block tut-block--exercises">
                  <h4>
                    <Icon name="target" size={16} strokeWidth={1.5} /> {t('tutorial.exercises')}
                  </h4>
                  <p className="tut-exercises__hint">{t('tutorial.exercisesHint')}</p>
                  <ol className="tut-exercises">
                    {tut.exercises.map((ex, i) => (
                      <li key={i}>
                        <strong>
                          <InlineText as="span" text={ex.question} onNavigate={inlineNav} />
                        </strong>
                        {ex.hint && (
                          <p className="tut-exercises__hint-line">
                            <Icon name="idea" size={12} strokeWidth={1.5} />{' '}
                            <InlineText as="span" text={ex.hint} onNavigate={inlineNav} />
                          </p>
                        )}
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {activeIdx === tut.steps.length - 1 && (
                <section className="tut-finish">
                  <div className="tut-finish__head">
                    <span aria-hidden="true">
                      <Icon name={allDone ? 'trophy' : 'target'} size={24} strokeWidth={1.5} />
                    </span>
                    <h4>{allDone ? t('tutorial.finished') : t('tutorial.lastStep')}</h4>
                  </div>

                  {allDone && (
                    <>
                      {nextSuggestions.length > 0 && (
                        <div className="tut-finish__group">
                          <p className="tut-finish__group-title">{t('tutorial.finish.nextTutorials')}</p>
                          <div className="tut-finish__nexts">
                            {nextSuggestions.map(n => (
                              <button
                                key={n.id}
                                type="button"
                                className={`tut-finish__next tut-finish__next--${n.kind}`}
                                onClick={() => {
                                  if (n.kind === 'tutorial') {
                                    onOpenTutorial?.(n.id);
                                  } else {
                                    // node-id (например use-case) — закрываем туториал
                                    // и открываем узел в DetailPanel
                                    onClose?.();
                                    onOpenNode?.(n.id);
                                  }
                                }}
                              >
                                <span aria-hidden="true">
                                  <Icon name={n.icon} size={18} strokeWidth={1.5} />
                                </span>
                                <span>{n.title}</span>
                                <span aria-hidden="true">
                                  <Icon name="arrow-right" size={16} strokeWidth={1.5} />
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="tut-finish__group">
                        <p className="tut-finish__group-title">{t('tutorial.finish.applyKnowledge')}</p>
                        <div className="tut-finish__nexts">
                          {onOpenLibrary && (
                            <button
                              type="button"
                              className="tut-finish__next"
                              onClick={() => { onClose?.(); onOpenLibrary(); }}
                            >
                              <span aria-hidden="true">
                                <Icon name="books" size={18} strokeWidth={1.5} />
                              </span>
                              <span>{t('tutorial.finish.openLibrary')}</span>
                              <span aria-hidden="true">
                                <Icon name="arrow-right" size={16} strokeWidth={1.5} />
                              </span>
                            </button>
                          )}
                          {onOpenNode && tut.nodeId && (
                            <button
                              type="button"
                              className="tut-finish__next"
                              onClick={() => { onClose?.(); onOpenNode(tut.nodeId); }}
                            >
                              <span aria-hidden="true">
                                <Icon name="compass" size={18} strokeWidth={1.5} />
                              </span>
                              <span>{t('tutorial.finish.backToNode')}</span>
                              <span aria-hidden="true">
                                <Icon name="arrow-right" size={16} strokeWidth={1.5} />
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </section>
              )}
            </div>}
          </main>
        </div>

        <footer className="tut-footer">
          <label className="tut-check">
            <input
              type="checkbox"
              checked={!!isStepDone}
              onChange={onToggleCurrent}
            />
            {t('tutorial.stepDone')}
          </label>

          <div className="tut-footer__nav">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={onPrev}
              disabled={activeIdx === 0}
            >
              <Icon name="arrow-left" size={14} strokeWidth={1.5} /> {t('common.back')}
            </button>

            {activeIdx < tut.steps.length - 1 ? (
              <button
                type="button"
                className="btn btn--primary"
                onClick={onMarkAndNext}
                title="Cmd/Ctrl + Enter"
              >
                {isStepDone ? t('tutorial.nextStep') : t('tutorial.doneNext')}
                <Icon name="arrow-right" size={14} strokeWidth={1.5} />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn--primary"
                onClick={isStepDone ? onClose : onToggleCurrent}
              >
                {allDone ? t('common.close') : (
                  <>
                    {t('tutorial.finishCourse')} <Icon name="check" size={14} strokeWidth={1.75} />
                  </>
                )}
              </button>
            )}
          </div>
        </footer>

        {/* Мобильный горизонтальный индикатор шагов — внизу, скроллится по горизонтали.
            На десктопе скрыт (там шаги в боковой панели). Экономит пространство. */}
        <div className="tut-stepbar" role="tablist" aria-label={t('tutorial.stepsAria')}>
          {stepsList.map(s => {
            return (
              <button
                key={s.id}
                type="button"
                className={`tut-stepbar__item ${s.isActive ? 'is-active' : ''} ${s.isDone ? 'is-done' : ''}`}
                onClick={() => setActiveIdx(s.idx)}
                aria-current={s.isActive ? 'step' : undefined}
              >
                <span className="tut-stepbar__num">
                  {s.isDone
                    ? <Icon name="check" size={12} strokeWidth={2.25} />
                    : s.idx + 1}
                </span>
                <span className="tut-stepbar__title">{s.title}</span>
              </button>
            );
          })}
        </div>

        <div className="tut-hotkeys" aria-hidden="true">
          <span><kbd>←</kbd> <kbd>→</kbd> {t('tutorial.hotkey.switch')}</span>
          <span><kbd>⌘</kbd>+<kbd>↵</kbd> {t('tutorial.hotkey.doneNext')}</span>
          <span><kbd>Esc</kbd> {t('tutorial.hotkey.close')}</span>
        </div>
      </div>
    </div>
  );
}

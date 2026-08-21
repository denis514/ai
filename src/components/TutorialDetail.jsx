import React from 'react';
import Icon from './Icon.jsx';
import Skeleton from './Skeleton.jsx';
import InlineText from './InlineText.jsx';
import ShareButton from './ShareButton.jsx';
import { tutorials } from '../data/tutorials.js';
import { useT, useLocale } from '../i18n/LocaleContext.jsx';
import { getLocalizedTutorial, ensureTutorialBody } from '../i18n/useTutorial.js';
import {
  getLocalizedLibraryTemplate,
  getLocalizedFeaturedPrompt
} from '../i18n/usePrompt.js';

const LEVEL_COLOR = {
  beginner:     '#16a34a',
  intermediate: '#2563eb',
  advanced:     '#7c3aed'
};


export default function TutorialDetail({
  tutId,
  progressApi,
  onStart,
  onOpenNode,
  onOpenPrompt,
  onOpenTutorial,
  onBack,
  isMobile
}) {
  const t = useT();
  const { locale } = useLocale();
  if (tutId) ensureTutorialBody(tutId, locale);
  const tut = tutId ? getLocalizedTutorial(tutId, locale) : null;
  if (!tut) return null;
  // Тело курса ещё едет: показываем скелетон, а не пустые секции.
  if (!tut.bodyReady) {
    return (
      <div className="tut-detail" aria-busy="true">
        <Skeleton width="60%" height="24px" />
        <Skeleton.Text lines={4} />
        <Skeleton width="100%" height="90px" radius="10px" style={{ marginTop: 16 }} />
      </div>
    );
  }

  const p = progressApi?.getProgress?.(tut.id); // прогресс хранится по id курса, не узла
  const done = p?.completedSteps?.length || 0;
  const total = tut.steps.length;

  // Навигаторы для inline-ссылок [[node:|tutorial:|prompt:]] в превью туториала.
  const inlineNav = {
    node: (id) => onOpenNode?.(id),
    tutorial: (id) => onOpenTutorial?.(id),
    prompt: (id) => {
      // onOpenPrompt принимает prompt-object — резолвим id → object
      const prompt = getLocalizedFeaturedPrompt(id, locale)
                  || getLocalizedLibraryTemplate(id, locale);
      if (prompt) onOpenPrompt?.(prompt);
    }
  };
  const isDone = !!p?.completedAt;
  const isStarted = done > 0 || (p?.lastStepIndex || 0) > 0;
  const percent = total ? Math.round((done / total) * 100) : 0;

  const level = tut.level || 'beginner';
  const levelLabel = t(`level.${level}`);

  return (
    <div className="tut-detail" style={{ '--lvl-color': LEVEL_COLOR[level] }}>

      <header className="tut-detail__head">
        {onBack && (
          <button
            type="button"
            className="tut-detail__back"
            onClick={onBack}
            aria-label={t('nav.backToListAria')}
            title={t('nav.backToListShortcut') || t('nav.backToListAria')}
          >
            <Icon name="arrow-left" size={16} strokeWidth={1.5} />
            <span>{t('nav.backToList')}</span>
          </button>
        )}
        <div className="tut-detail__head-main">
          <span className="tut-detail__icon" aria-hidden="true">
            <Icon name={tut.icon || 'graduation'} size={28} strokeWidth={1.5} />
          </span>
          <div className="tut-detail__head-text">
            <div className="tut-detail__badges">
              <span className="tut-detail__level">{levelLabel}</span>
              <span className="tut-detail__steps-count">
                <Icon name="books" size={12} strokeWidth={1.5} /> {t('tutorialDetail.stepsCount', { n: total })}
              </span>
              <ShareButton type="tutorial" id={tutId} title={tut.title} />
            </div>
            <h2 className="tut-detail__title">{tut.title}</h2>
            <p className="tut-detail__subtitle">{tut.subtitle}</p>
          </div>
        </div>

        {(isStarted || isDone) && (
          <div className="tut-detail__progress">
            <div className="tut-detail__progress-bar">
              <div
                className="tut-detail__progress-fill"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="tut-detail__progress-text">
              {isDone
                ? t('tutorialDetail.progress.done', { total })
                : t('tutorialDetail.progress.partial', { done, total, p: percent })}
            </span>
          </div>
        )}
      </header>

      <div className="tut-detail__body">

        {tut.whatItIs && (
          <section className="tut-detail__section">
            <h3>{t('tutorialDetail.what')}</h3>
            <InlineText text={tut.whatItIs} onNavigate={inlineNav} />
          </section>
        )}

        {(tut.trigger || (tut.inputs?.length) || (tut.outputs?.length) || (tut.tools?.length) || tut.savings) && (
          <section className="tut-detail__section tut-detail__workflow-card">
            <h3 className="tut-detail__workflow-card-title">
              <Icon name="clipboard" size={14} strokeWidth={1.75} />
              {t('tutorialDetail.workflow.cardTitle')}
            </h3>
            <div className="tut-detail__workflow-grid">
              {tut.trigger && (
                <div className="tut-detail__workflow-row">
                  <span className="tut-detail__workflow-label">{t('tutorialDetail.workflow.trigger')}</span>
                  <InlineText as="span" className="tut-detail__workflow-value" text={tut.trigger} onNavigate={inlineNav} />
                </div>
              )}
              {tut.inputs?.length > 0 && (
                <div className="tut-detail__workflow-row">
                  <span className="tut-detail__workflow-label">{t('tutorialDetail.workflow.inputs')}</span>
                  <ul className="tut-detail__workflow-list">
                    {tut.inputs.map((x, i) => (
                      <li key={i}><InlineText as="span" text={x} onNavigate={inlineNav} /></li>
                    ))}
                  </ul>
                </div>
              )}
              {tut.outputs?.length > 0 && (
                <div className="tut-detail__workflow-row">
                  <span className="tut-detail__workflow-label">{t('tutorialDetail.workflow.outputs')}</span>
                  <ul className="tut-detail__workflow-list">
                    {tut.outputs.map((x, i) => (
                      <li key={i}><InlineText as="span" text={x} onNavigate={inlineNav} /></li>
                    ))}
                  </ul>
                </div>
              )}
              {tut.tools?.length > 0 && (
                <div className="tut-detail__workflow-row">
                  <span className="tut-detail__workflow-label">{t('tutorialDetail.workflow.tools')}</span>
                  <div className="tut-detail__workflow-chips">
                    {tut.tools.map((x, i) => (
                      <span key={i} className="tut-detail__workflow-chip">
                        {typeof x === 'string' ? x : `${x.name}${x.role ? ` — ${x.role}` : ''}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {tut.savings && (
                <div className="tut-detail__workflow-row tut-detail__workflow-savings">
                  <span className="tut-detail__workflow-label">{t('tutorialDetail.workflow.savings')}</span>
                  <InlineText as="span" className="tut-detail__workflow-value" text={tut.savings} onNavigate={inlineNav} />
                </div>
              )}
            </div>
          </section>
        )}

        {tut.outcomes && tut.outcomes.length > 0 && (
          <section className="tut-detail__section">
            <h3>{t('tutorialDetail.outcomes')}</h3>
            <ul className="tut-detail__outcomes">
              {tut.outcomes.map((o, i) => (
                <li key={i}>
                  <span className="tut-detail__check" aria-hidden="true">
                    <Icon name="check" size={11} strokeWidth={2} />
                  </span>
                  <InlineText as="span" text={o} onNavigate={inlineNav} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {tut.approach && (
          <section className="tut-detail__section">
            <h3>{t('tutorialDetail.approach')}</h3>
            <InlineText as="p" className="tut-detail__approach" text={tut.approach} onNavigate={inlineNav} />
            {tut.prerequisites && tut.prerequisites.length > 0 && (
              <div className="tut-detail__prereq">
                <span className="tut-detail__prereq-label">{t('tutorialDetail.prereq')}</span>
                <div className="tut-detail__prereq-chips">
                  {tut.prerequisites.map(pid => {
                    const preStruct = tutorials[pid];
                    if (!preStruct) return null;
                    const pre = getLocalizedTutorial(pid, locale);
                    return (
                      <button
                        key={pid}
                        type="button"
                        className="tut-detail__prereq-chip"
                        onClick={() => onOpenTutorial?.(pid)}
                      >
                        <Icon name={preStruct.icon} size={12} strokeWidth={1.5} />
                        {pre?.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        )}

        <section className="tut-detail__section">
          <h3>{t('tutorialDetail.plan', { n: total })}</h3>
          <ol className="tut-detail__steps">
            {tut.steps.map((s, idx) => {
              const stepDone = p?.completedSteps?.includes?.(s.id);
              return (
                <li key={s.id} className={stepDone ? 'is-done' : ''}>
                  <span className="tut-detail__step-num">
                    {stepDone ? <Icon name="check" size={11} strokeWidth={2} /> : idx + 1}
                  </span>
                  <span className="tut-detail__step-text">{s.title}</span>
                  <span className="tut-detail__step-time">{s.time}</span>
                </li>
              );
            })}
          </ol>
        </section>

        {tut.applyIn && tut.applyIn.length > 0 && (
          <section className="tut-detail__section">
            <h3>{t('tutorialDetail.applyIn')}</h3>
            <div className="tut-detail__apply">
              {tut.applyIn.map((a, i) => (
                <div key={i} className="tut-detail__apply-card">
                  <h4>{a.title}</h4>
                  <InlineText text={a.description} onNavigate={inlineNav} />
                </div>
              ))}
            </div>
          </section>
        )}

        {tut.relatedPrompts && tut.relatedPrompts.length > 0 && (
          <section className="tut-detail__section">
            <h3>{t('tutorialDetail.relatedPrompts')}</h3>
            <div className="tut-detail__prompts">
              {tut.relatedPrompts.map(pid => {
                const prompt = getLocalizedLibraryTemplate(pid, locale)
                            || getLocalizedFeaturedPrompt(pid, locale);
                if (!prompt) return null;
                return (
                  <button
                    key={pid}
                    type="button"
                    className="tut-detail__prompt"
                    onClick={() => onOpenPrompt?.(prompt)}
                  >
                    <span className="tut-detail__prompt-icon" aria-hidden="true">
                      <Icon name={prompt.icon} size={16} strokeWidth={1.5} />
                    </span>
                    <span className="tut-detail__prompt-main">
                      <span className="tut-detail__prompt-title">{prompt.title}</span>
                      <span className="tut-detail__prompt-desc">{prompt.description}</span>
                    </span>
                    <Icon name="arrow-right" size={12} strokeWidth={1.5} />
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {tut.pitfalls && tut.pitfalls.length > 0 && (
          <section className="tut-detail__section">
            <h3>{t('tutorialDetail.pitfalls')}</h3>
            <ul className="tut-detail__pitfalls">
              {tut.pitfalls.map((pf, i) => (
                <li key={i}>
                  <span className="tut-detail__pitfall-icon" aria-hidden="true">
                    <Icon name="question" size={11} strokeWidth={1.75} />
                  </span>
                  <InlineText as="span" text={pf} onNavigate={inlineNav} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {tut.exercises && tut.exercises.length > 0 && (
          <section className="tut-detail__section">
            <h3>{t('tutorialDetail.exercises')}</h3>
            <p className="tut-detail__exercises-hint">{t('tutorialDetail.exercisesHint')}</p>
            <ol className="tut-detail__exercises">
              {tut.exercises.map((ex, i) => (
                <li key={i}>
                  <strong>
                    <InlineText as="span" text={ex.question} onNavigate={inlineNav} />
                  </strong>
                  {ex.hint && (
                    <p className="tut-detail__exercise-hint">
                      <Icon name="idea" size={12} strokeWidth={1.5} />{' '}
                      <InlineText as="span" text={ex.hint} onNavigate={inlineNav} />
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}

      </div>

      <footer className="tut-detail__footer">
        {onOpenNode && tut.nodeId && (
          <button
            type="button"
            className="tut-detail__cta tut-detail__cta--ghost"
            onClick={() => onOpenNode(tut.nodeId)}
          >
            <Icon name="compass" size={14} strokeWidth={1.5} />
            {t('tutorialDetail.toNode')}
          </button>
        )}
        <button
          type="button"
          className="tut-detail__cta tut-detail__cta--primary"
          onClick={onStart}
        >
          <Icon name={isDone ? 'check' : 'graduation'} size={16} strokeWidth={1.5} />
          {isDone ? t('tutorialDetail.retake') : isStarted ? t('tutorialDetail.continue') : t('tutorialDetail.start')}
        </button>
      </footer>

    </div>
  );
}

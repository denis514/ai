import React from 'react';
import Icon from './Icon.jsx';
import { tutorials } from '../data/tutorials.js';
import { useT, useLocale } from '../i18n/LocaleContext.jsx';
import { getLocalizedTutorial } from '../i18n/useTutorial.js';
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
  const tut = tutId ? getLocalizedTutorial(tutId, locale) : null;
  if (!tut) return null;

  const p = progressApi?.getProgress?.(tut.nodeId);
  const done = p?.completedSteps?.length || 0;
  const total = tut.steps.length;
  const isDone = !!p?.completedAt;
  const isStarted = done > 0 || (p?.lastStepIndex || 0) > 0;
  const percent = total ? Math.round((done / total) * 100) : 0;

  const level = tut.level || 'beginner';
  const levelLabel = t(`level.${level}`);

  return (
    <div className="tut-detail" style={{ '--lvl-color': LEVEL_COLOR[level] }}>

      <header className="tut-detail__head">
        {isMobile && onBack && (
          <button
            type="button"
            className="tut-detail__back"
            onClick={onBack}
            aria-label={t('nav.backToListAria')}
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
              <span className="tut-detail__time">
                <Icon name="clock" size={12} strokeWidth={1.5} /> {tut.totalTime}
              </span>
              <span className="tut-detail__steps-count">
                <Icon name="books" size={12} strokeWidth={1.5} /> {t('tutorialDetail.stepsCount', { n: total })}
              </span>
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
            <p>{tut.whatItIs}</p>
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
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {tut.approach && (
          <section className="tut-detail__section">
            <h3>{t('tutorialDetail.approach')}</h3>
            <p className="tut-detail__approach">{tut.approach}</p>
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
                  <p>{a.description}</p>
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
                  <span>{pf}</span>
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
                  <strong>{ex.question}</strong>
                  {ex.hint && (
                    <p className="tut-detail__exercise-hint">
                      <Icon name="idea" size={12} strokeWidth={1.5} /> {ex.hint}
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

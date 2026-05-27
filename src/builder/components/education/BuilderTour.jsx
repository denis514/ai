import React, { useEffect, useState, useRef } from 'react';
import Icon from '../../../components/Icon.jsx';
import { useT } from '../../../i18n/LocaleContext.jsx';

/**
 * BuilderTour — onboarding walkthrough для first-time visitors Builder.
 *
 * 7 шагов:
 *   0 — Welcome modal (intro + start/skip)
 *   1 — Toolbox highlight (add Main Agent)
 *   2 — Toolbox highlight (add a tool)
 *   3 — Canvas highlight (connect nodes)
 *   4 — Header highlight (press Run)
 *   5 — Execution panel highlight (see logs)
 *   6 — Done card (success + templates CTA)
 *
 * Auto-advance:
 *   • Step 1 → 2 when first agent added
 *   • Step 2 → 3 when first tool added
 *   • Step 3 → 4 when first edge connected
 *   • Step 4 → 5 when execution starts
 *   • Step 5 → 6 when execution completes OR after 5s
 *
 * Skippable anytime via [Skip] / [X]. Persisted в localStorage.
 *
 * Phase B-1 Day 24.
 */

export const TOUR_SEEN_KEY = 'atlas:builder:tour-seen:v1';

export function isTourSeen() {
  try { return !!localStorage.getItem(TOUR_SEEN_KEY); } catch { return false; }
}

export function markTourSeen() {
  try { localStorage.setItem(TOUR_SEEN_KEY, '1'); } catch {}
}

// Step definitions
const STEP_COUNT = 7; // 0=welcome, 1..5 spotlight, 6 done

export default function BuilderTour({
  onClose,
  onOpenTemplates,
  nodes,
  edges,
  execStatus,
}) {
  const t = useT();
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const completedRef = useRef({}); // chronological flags
  const autoTimerRef = useRef(null);

  // Step config с selectors
  const STEPS = [
    null, // 0 = welcome (no spotlight)
    {
      selector: '.builder-toolbox',
      titleKey: 'builder.tour.step1.title',
      bodyKey: 'builder.tour.step1.body',
      checkAdvance: () => nodes.some(n => n.data?.kind === 'agent'),
    },
    {
      selector: '.builder-toolbox',
      titleKey: 'builder.tour.step2.title',
      bodyKey: 'builder.tour.step2.body',
      checkAdvance: () => nodes.some(n => n.data?.kind === 'tool'),
    },
    {
      selector: '.builder-canvas-wrap',
      titleKey: 'builder.tour.step3.title',
      bodyKey: 'builder.tour.step3.body',
      checkAdvance: () => edges.length > 0,
    },
    {
      selector: '.builder-btn--primary',
      titleKey: 'builder.tour.step4.title',
      bodyKey: 'builder.tour.step4.body',
      checkAdvance: () => execStatus === 'running' || execStatus === 'completed' || execStatus === 'failed',
    },
    {
      selector: '.builder-exec',
      titleKey: 'builder.tour.step5.title',
      bodyKey: 'builder.tour.step5.body',
      checkAdvance: () => execStatus === 'completed' || execStatus === 'failed' || execStatus === 'stopped',
    },
    null, // 6 = done (no spotlight)
  ];

  // Auto-advance детекция
  useEffect(() => {
    if (step <= 0 || step >= 6) return;
    const cur = STEPS[step];
    if (!cur) return;
    if (cur.checkAdvance()) {
      if (!completedRef.current[step]) {
        completedRef.current[step] = true;
        // small delay перед advance чтобы user успел увидеть результат своего действия
        setTimeout(() => setStep(s => Math.min(s + 1, STEP_COUNT - 1)), 600);
      }
    }
  }, [nodes, edges, execStatus, step]); // eslint-disable-line react-hooks/exhaustive-deps

  // Recalculate spotlight rect когда step меняется или viewport resize
  useEffect(() => {
    const cur = STEPS[step];
    if (!cur) {
      setTargetRect(null);
      return;
    }
    const update = () => {
      const el = document.querySelector(cur.selector);
      if (el) setTargetRect(el.getBoundingClientRect());
      else setTargetRect(null);
    };
    update();
    window.addEventListener('resize', update);
    const interval = setInterval(update, 1000); // re-poll в случае panel toggle
    return () => {
      window.removeEventListener('resize', update);
      clearInterval(interval);
    };
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  // Step 5 — auto-advance after 5s даже если no execution событий (user скрыл panel)
  useEffect(() => {
    if (step !== 5) return;
    autoTimerRef.current = setTimeout(() => setStep(s => Math.min(s + 1, STEP_COUNT - 1)), 8000);
    return () => clearTimeout(autoTimerRef.current);
  }, [step]);

  // Close handler — mark seen
  const handleFinish = () => {
    markTourSeen();
    onClose();
  };

  const handleSkip = () => {
    markTourSeen();
    onClose();
  };

  const handleNext = () => {
    if (step >= STEP_COUNT - 1) {
      handleFinish();
    } else {
      setStep(s => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
  };

  /* ────────── Welcome modal ────────── */
  if (step === 0) {
    return (
      <div className="builder-tour-backdrop" onClick={(e) => { if (e.target === e.currentTarget) handleSkip(); }}>
        <div className="builder-tour-welcome" role="dialog" aria-modal="true">
          <div className="builder-tour-welcome__icon">
            <Icon name="sparkles" size={28} strokeWidth={1.25} />
          </div>
          <h2 className="builder-tour-welcome__title">
            {t('builder.tour.welcome.title') || 'Welcome to Agent Builder'}
          </h2>
          <p className="builder-tour-welcome__subtitle">
            {t('builder.tour.welcome.subtitle') || 'Want a quick 2-minute tour? Learn the core flow by building together.'}
          </p>
          <div className="builder-tour-welcome__actions">
            <button
              type="button"
              className="builder-btn builder-btn--ghost"
              onClick={handleSkip}
            >
              {t('builder.tour.welcome.skip') || 'Skip — I\'ll explore'}
            </button>
            <button
              type="button"
              className="builder-btn builder-btn--primary"
              onClick={() => setStep(1)}
            >
              <Icon name="rocket" size={14} strokeWidth={1.5} />
              <span>{t('builder.tour.welcome.start') || 'Start tour'}</span>
            </button>
          </div>
          <button
            type="button"
            className="builder-tour-welcome__close"
            onClick={handleSkip}
            aria-label={t('builder.tour.welcome.close') || 'Close'}
          >
            <Icon name="close" size={14} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    );
  }

  /* ────────── Done card ────────── */
  if (step === 6) {
    return (
      <div className="builder-tour-backdrop" onClick={(e) => { if (e.target === e.currentTarget) handleFinish(); }}>
        <div className="builder-tour-welcome" role="dialog" aria-modal="true">
          <div className="builder-tour-welcome__icon builder-tour-welcome__icon--success">
            <Icon name="check" size={24} strokeWidth={2} />
          </div>
          <h2 className="builder-tour-welcome__title">
            {t('builder.tour.done.title') || 'You\'re ready'}
          </h2>
          <p className="builder-tour-welcome__subtitle">
            {t('builder.tour.done.subtitle') || 'That\'s the core flow. Explore templates for ready-made examples — or build your own.'}
          </p>
          <div className="builder-tour-welcome__actions">
            <button
              type="button"
              className="builder-btn builder-btn--ghost"
              onClick={handleFinish}
            >
              {t('builder.tour.done.finish') || 'Done'}
            </button>
            <button
              type="button"
              className="builder-btn builder-btn--primary"
              onClick={() => { markTourSeen(); onClose(); onOpenTemplates?.(); }}
            >
              <Icon name="books" size={14} strokeWidth={1.5} />
              <span>{t('builder.tour.done.templates') || 'Show templates'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ────────── Spotlight step ────────── */
  const cur = STEPS[step];
  if (!cur || !targetRect) return null;

  // Position the bubble next to target — auto-detect best side
  const { top, left, right, bottom, width, height } = targetRect;
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;

  // Default: place bubble right of target
  let bubbleStyle = {};
  let bubblePosition = 'right';
  if (right + 340 < viewportW) {
    bubbleStyle = { top: `${Math.max(16, top)}px`, left: `${right + 16}px` };
    bubblePosition = 'right';
  } else if (left > 340) {
    bubbleStyle = { top: `${Math.max(16, top)}px`, left: `${left - 320 - 16}px` };
    bubblePosition = 'left';
  } else if (bottom + 220 < viewportH) {
    bubbleStyle = { top: `${bottom + 12}px`, left: `${Math.max(16, Math.min(left, viewportW - 340))}px` };
    bubblePosition = 'bottom';
  } else {
    bubbleStyle = { top: `${Math.max(16, top - 220)}px`, left: `${Math.max(16, Math.min(left, viewportW - 340))}px` };
    bubblePosition = 'top';
  }

  return (
    <>
      {/* Dim overlay c hole — 4 panels around target */}
      <div className="builder-tour-dim builder-tour-dim--top" style={{ height: `${Math.max(0, top)}px` }} />
      <div
        className="builder-tour-dim builder-tour-dim--left"
        style={{ top: `${top}px`, height: `${height}px`, width: `${Math.max(0, left)}px` }}
      />
      <div
        className="builder-tour-dim builder-tour-dim--right"
        style={{ top: `${top}px`, height: `${height}px`, left: `${right}px`, width: `${Math.max(0, viewportW - right)}px` }}
      />
      <div
        className="builder-tour-dim builder-tour-dim--bottom"
        style={{ top: `${bottom}px`, height: `${Math.max(0, viewportH - bottom)}px` }}
      />

      {/* Highlight box around target */}
      <div
        className="builder-tour-highlight"
        style={{
          top: `${top - 4}px`,
          left: `${left - 4}px`,
          width: `${width + 8}px`,
          height: `${height + 8}px`,
        }}
      />

      {/* Step bubble */}
      <div className={`builder-tour-bubble builder-tour-bubble--${bubblePosition}`} style={bubbleStyle}>
        <div className="builder-tour-bubble__progress">
          <span>
            {t('builder.tour.step') || 'Step'} {step} / {STEP_COUNT - 2}
          </span>
        </div>
        <h3 className="builder-tour-bubble__title">{t(cur.titleKey) || ''}</h3>
        <p className="builder-tour-bubble__body">{t(cur.bodyKey) || ''}</p>
        <div className="builder-tour-bubble__actions">
          <button
            type="button"
            className="builder-btn builder-btn--ghost builder-btn--small"
            onClick={handleSkip}
          >
            {t('builder.tour.skip') || 'Skip tour'}
          </button>
          <div className="builder-tour-bubble__nav">
            {step > 1 && (
              <button
                type="button"
                className="builder-btn builder-btn--ghost builder-btn--small"
                onClick={handleBack}
              >
                <Icon name="arrow-left" size={11} strokeWidth={1.75} />
                <span>{t('builder.tour.back') || 'Back'}</span>
              </button>
            )}
            <button
              type="button"
              className="builder-btn builder-btn--primary builder-btn--small"
              onClick={handleNext}
            >
              <span>{t('builder.tour.next') || 'Next'}</span>
              <Icon name="arrow-right" size={11} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

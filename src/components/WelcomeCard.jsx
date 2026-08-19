import React, { useMemo, useState, useEffect } from 'react';
import Icon from './Icon.jsx';
import { tutorials } from '../data/tutorials.js';
import { useT, useLocale } from '../i18n/LocaleContext.jsx';
import { getLocalizedTutorial } from '../i18n/useTutorial.js';

const DISMISS_KEY = 'claude-mindmap:welcome-dismissed:v1';
// «Продолжить» (есть активный туториал) — напоминает раз в 14 дней.
// «Добро пожаловать» (нет прогресса) — не показывается 90 дней после dismiss.
const DISMISS_TTL_CONTINUE_MS = 14 * 24 * 60 * 60 * 1000;
const DISMISS_TTL_NEWCOMER_MS = 90 * 24 * 60 * 60 * 1000;

function readDismissed(hasCandidate) {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    const ttl = hasCandidate ? DISMISS_TTL_CONTINUE_MS : DISMISS_TTL_NEWCOMER_MS;
    return Date.now() - ts < ttl;
  } catch { return false; }
}

function writeDismissed() {
  try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch {}
}

/**
 * Находит самый «свежий» туториал в работе:
 *   - не завершён (completedAt пуст)
 *   - имеет прогресс (lastStepIndex > 0 ИЛИ есть выполненные шаги)
 *   - сортируем по lastStepIndex desc как proxy для «недавности»
 *
 * Если нет — возвращает null (тогда покажем «С чего начать»).
 */
function findContinueCandidate(progress) {
  const candidates = [];
  for (const [tutId, p] of Object.entries(progress || {})) {
    if (p.completedAt) continue;
    const hasProgress = (p.lastStepIndex || 0) > 0 || (p.completedSteps?.length || 0) > 0;
    if (!hasProgress) continue;
    if (!tutorials[tutId]) continue;
    candidates.push({ id: tutId, ...p });
  }
  if (!candidates.length) return null;
  candidates.sort((a, b) => (b.lastStepIndex || 0) - (a.lastStepIndex || 0));
  return candidates[0];
}

export default function WelcomeCard({
  progressApi,
  onStartTutorial,
  onOpenCourses
}) {
  const t = useT();
  const { locale } = useLocale();
  const candidate = useMemo(
    () => findContinueCandidate(progressApi?.progress),
    [progressApi?.progress]
  );

  const [dismissed, setDismissed] = useState(() => readDismissed(!!candidate));

  if (dismissed) return null;

  const onDismiss = () => { writeDismissed(); setDismissed(true); };

  // Начать туториал и сразу закрыть карточку
  const onStart = (id) => { onStartTutorial?.(id); onDismiss(); };

  if (candidate) {
    const tut = getLocalizedTutorial(candidate.id, locale);
    const total = tutorials[candidate.id]?.stepCount || 0;
    const current = Math.min((candidate.lastStepIndex || 0) + 1, total);
    return (
      <div className="welcome-card welcome-card--continue" role="region" aria-label="Welcome">
        <button
          type="button"
          className="welcome-card__close"
          onClick={onDismiss}
          aria-label={t('welcome.close')}
        >
          <Icon name="close" size={16} strokeWidth={1.75} />
        </button>
        <div className="welcome-card__icon" aria-hidden="true">
          <Icon name="rocket" size={26} strokeWidth={1.5} />
        </div>
        <div className="welcome-card__body">
          <div className="welcome-card__kicker">{t('welcome.continue.kicker')}</div>
          <div className="welcome-card__title">
            {t('welcome.continue.titlePrefix')} «{tut?.title || candidate.id}»
          </div>
          <div className="welcome-card__meta">
            {t('welcome.continue.step', { current, total })}
          </div>
        </div>
        <div className="welcome-card__actions">
          <button
            type="button"
            className="btn btn--primary welcome-card__cta"
            onClick={() => onStart(candidate.id)}
          >
            <Icon name="arrow-right" size={14} strokeWidth={1.75} /> {t('welcome.continue.cta')}
          </button>
          <button
            type="button"
            className="welcome-card__ghost"
            onClick={() => onOpenCourses?.()}
          >
            {t('welcome.continue.other')}
          </button>
        </div>
      </div>
    );
  }

  // Никакой активности — простая карточка приветствия.
  // Теперь имеет × для явного закрытия + «Начать» закрывает карточку.
  return (
    <div className="welcome-card welcome-card--newcomer" role="region" aria-label="Welcome">
      <button
        type="button"
        className="welcome-card__close"
        onClick={onDismiss}
        aria-label={t('welcome.close')}
      >
        <Icon name="close" size={16} strokeWidth={1.75} />
      </button>
      <div className="welcome-card__icon" aria-hidden="true">
        <Icon name="rocket" size={26} strokeWidth={1.5} />
      </div>
      <div className="welcome-card__body">
        <div className="welcome-card__title">{t('welcome.simple.title')}</div>
        <div className="welcome-card__meta">{t('welcome.simple.subtitle')}</div>
      </div>
      <div className="welcome-card__actions">
        <button
          type="button"
          className="btn btn--primary welcome-card__cta"
          onClick={() => onStart('welcome')}
        >
          <Icon name="arrow-right" size={14} strokeWidth={1.75} /> {t('welcome.simple.cta')}
        </button>
        <button
          type="button"
          className="welcome-card__ghost"
          onClick={onDismiss}
        >
          {t('welcome.simple.dismiss')}
        </button>
      </div>
    </div>
  );
}

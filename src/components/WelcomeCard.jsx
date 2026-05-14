import React, { useMemo, useState, useEffect } from 'react';
import Icon from './Icon.jsx';
import { tutorials } from '../data/tutorials.js';
import { useT, useLocale } from '../i18n/LocaleContext.jsx';
import { getLocalizedTutorial } from '../i18n/useTutorial.js';

const DISMISS_KEY = 'claude-mindmap:welcome-dismissed:v1';
// Сколько дней не показывать после закрытия. После 7 дней снова всплывёт —
// человек, скорее всего, забыл, на чём остановился.
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function readDismissed() {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < DISMISS_TTL_MS;
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
  const [dismissed, setDismissed] = useState(() => readDismissed());

  // Если localStorage обновился извне (например, открыл туториал в другой вкладке) —
  // не подписываемся, это редкий случай. Перерисуем при следующем mount.

  const candidate = useMemo(
    () => findContinueCandidate(progressApi?.progress),
    [progressApi?.progress]
  );

  if (dismissed) return null;

  const onDismiss = () => { writeDismissed(); setDismissed(true); };

  if (candidate) {
    const tut = getLocalizedTutorial(candidate.id, locale);
    const total = tutorials[candidate.id]?.steps?.length || 0;
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
            onClick={() => onStartTutorial?.(candidate.id)}
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

  // Никакой активности — простая карточка приветствия:
  // заголовок, короткое описание, две кнопки. Крестик намеренно убран —
  // «Я уже знаю» сам по себе функционирует как dismiss. Восстановить доступ
  // к вводному уроку можно через Profile → «Открыть вводный урок».
  return (
    <div className="welcome-card welcome-card--newcomer" role="region" aria-label="Welcome">
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
          onClick={() => onStartTutorial?.('welcome')}
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

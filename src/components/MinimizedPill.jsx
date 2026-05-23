import React from 'react';
import Icon from './Icon.jsx';
import { useT } from '../i18n/LocaleContext.jsx';

/**
 * Свёрнутая пилюля workflow/tutorial — отображается рядом с DetailPanel
 * когда пользователь ушёл по cross-link из модалки. Позволяет вернуться
 * в исходное модальное окно одним кликом с восстановлением state.
 *
 * Props:
 *   state: {
 *     type: 'workflows' | 'tutorial',
 *     displayTitle: string,
 *     displayIcon: string,
 *     progress?: { current: number, total: number }
 *   }
 *   onExpand: () => void   — клик по пилюле → восстановить modal
 *   onDismiss: () => void  — клик по × → отказаться от возврата
 *   isMobile: boolean      — другая раскладка на mobile
 */
export default function MinimizedPill({ state, onExpand, onDismiss, isMobile }) {
  const t = useT();
  if (!state) return null;

  const { displayTitle, displayIcon, progress, type } = state;

  const ariaLabel = type === 'workflows'
    ? t('minimized.expandWorkflows', { title: displayTitle })
    : t('minimized.expandTutorial', { title: displayTitle });

  return (
    <div
      className={`minimized-pill minimized-pill--${type} ${isMobile ? 'minimized-pill--mobile' : ''}`}
      role="status"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        className="minimized-pill__main"
        onClick={onExpand}
        title={ariaLabel}
      >
        <span className="minimized-pill__icon" aria-hidden="true">
          <Icon name={displayIcon || 'graduation'} size={16} strokeWidth={1.5} />
        </span>
        <span className="minimized-pill__text">
          <span className="minimized-pill__title">{displayTitle}</span>
          {progress && (
            <span className="minimized-pill__progress">
              {t('minimized.progress', { current: progress.current, total: progress.total })}
            </span>
          )}
        </span>
        <span className="minimized-pill__chevron" aria-hidden="true">
          <Icon name="arrow-up" size={12} strokeWidth={1.75} />
        </span>
      </button>
      <button
        type="button"
        className="minimized-pill__close"
        onClick={onDismiss}
        aria-label={t('minimized.dismiss')}
        title={t('minimized.dismiss')}
      >
        <Icon name="close" size={12} strokeWidth={2} />
      </button>
    </div>
  );
}

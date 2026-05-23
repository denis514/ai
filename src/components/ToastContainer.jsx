import React from 'react';
import Icon from './Icon.jsx';
import { useToastList } from '../hooks/useToast.js';

/**
 * Контейнер для toast-уведомлений. Рендерится один раз в App (вне модалов).
 * Подписан на глобальную очередь из useToast.
 *
 * Позиция — bottom-center на desktop, bottom-stretch на mobile.
 * Стек — новые сверху, старые внизу.
 */

const VARIANT_ICON = {
  success: 'check',
  error:   'close',
  warning: 'question',
  info:    'info',
};

export default function ToastContainer() {
  const { list, dismiss } = useToastList();
  if (!list.length) return null;

  return (
    <div
      className="toast-container"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {list.map(t => (
        <div
          key={t.id}
          className={`toast toast--${t.variant}`}
          role={t.variant === 'error' ? 'alert' : 'status'}
        >
          <span className="toast__icon" aria-hidden="true">
            <Icon name={VARIANT_ICON[t.variant] || 'info'} size={16} strokeWidth={1.75} />
          </span>
          <span className="toast__message">{t.message}</span>
          {t.action && (
            <button
              type="button"
              className="toast__action"
              onClick={() => { t.action.onClick(); dismiss(t.id); }}
            >
              {t.action.label}
            </button>
          )}
          <button
            type="button"
            className="toast__close"
            onClick={() => dismiss(t.id)}
            aria-label="Dismiss"
          >
            <Icon name="close" size={12} strokeWidth={2} />
          </button>
        </div>
      ))}
    </div>
  );
}

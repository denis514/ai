import React from 'react';

/**
 * Глобальный Error Boundary — ловит исключения в render-фазе любых детей.
 *
 * Зачем: без ErrorBoundary одна .throw() в render любого компонента
 * (например, обращение к undefined.title при rapid state-transition)
 * вызывает unmount всего дерева и показывает пользователю «пустой экран».
 *
 * Поведение:
 *   - В dev-режиме: console.error + stack для отладки.
 *   - В production: компактный fallback с кнопкой «Обновить страницу».
 *   - Reset error при route change (если ребёнок изменился по ключу).
 *
 * Использование (в App.jsx):
 *   <ErrorBoundary>
 *     ...app tree...
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Логируем в консоль; в production можно слать в Sentry/etc.
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary] caught:', error, info?.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg, #fafaf9)',
        color: 'var(--text, #1c1917)',
        padding: 24,
        zIndex: 9999,
        fontFamily: 'inherit',
      }}>
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ margin: '0 0 12px', fontSize: 20 }}>
            Что-то пошло не так
          </h2>
          <p style={{ margin: '0 0 20px', fontSize: 14, opacity: 0.7 }}>
            Произошла техническая ошибка. Попробуй обновить страницу.
            Если повторится — напиши в поддержку.
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 18px',
                background: 'var(--text, #1c1917)',
                color: 'var(--bg, #fafaf9)',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Обновить страницу
            </button>
            <button
              type="button"
              onClick={() => { window.location.hash = ''; this.reset(); }}
              style={{
                padding: '10px 18px',
                background: 'transparent',
                color: 'var(--text, #1c1917)',
                border: '1px solid currentColor',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 14,
                opacity: 0.7,
              }}
            >
              На главную
            </button>
          </div>
          {import.meta.env.DEV && (
            <details style={{ marginTop: 24, textAlign: 'left', fontSize: 12 }}>
              <summary style={{ cursor: 'pointer', opacity: 0.6 }}>
                Детали (только в dev-режиме)
              </summary>
              <pre style={{
                marginTop: 8,
                padding: 12,
                background: 'rgba(0,0,0,0.05)',
                borderRadius: 6,
                overflow: 'auto',
                maxHeight: 200,
                fontSize: 11,
              }}>
                {String(this.state.error?.stack || this.state.error)}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}

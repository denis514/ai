import React from 'react';

/**
 * Skeleton — placeholder для loading-состояний. Заменяет «Loading...» текст
 * и spinners на shimmer-блоки, которые занимают то же место что будущий
 * контент (предотвращает layout shift).
 *
 * Использование:
 *   <Skeleton width="80%" height="16px" />
 *   <Skeleton width="100%" height="200px" radius="8px" />
 *   <Skeleton.Text lines={3} />  // несколько строк текста
 *   <Skeleton.Card />            // готовый card-placeholder
 *
 * Theme-aware через color-mix.
 */
export default function Skeleton({
  width = '100%',
  height = '12px',
  radius = '4px',
  className = '',
  style = {},
}) {
  return (
    <span
      className={`skeleton ${className}`}
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width,
        height,
        borderRadius: radius,
        ...style,
      }}
    />
  );
}

/**
 * Несколько строк текста — имитация параграфа.
 */
Skeleton.Text = function SkeletonText({ lines = 3, lastLineWidth = '60%' }) {
  return (
    <span className="skeleton-text" aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? lastLineWidth : '100%'}
          height="12px"
          style={{ marginBottom: i < lines - 1 ? '8px' : 0, display: 'block' }}
        />
      ))}
    </span>
  );
};

/**
 * Готовый card-placeholder: image + 2 строки текста.
 */
Skeleton.Card = function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true" style={{ padding: 14 }}>
      <Skeleton width="48px" height="48px" radius="12px" style={{ marginBottom: 12 }} />
      <Skeleton width="70%" height="14px" style={{ display: 'block', marginBottom: 8 }} />
      <Skeleton.Text lines={2} lastLineWidth="40%" />
    </div>
  );
};

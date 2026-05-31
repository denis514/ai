import React from 'react';

/**
 * Skeleton — заглушка-плейсхолдер с мерцанием, пока грузится контент.
 *
 *   <Skeleton w="100%" h={14} />
 *   <SkeletonList rows={3} />  // несколько строк-карточек
 */
export default function Skeleton({ w = '100%', h = 12, r = 6, style }) {
  return (
    <span
      className="builder-skeleton"
      style={{ width: w, height: typeof h === 'number' ? `${h}px` : h, borderRadius: r, ...style }}
      aria-hidden="true"
    />
  );
}

/** Несколько строк-«карточек» для списков (workflow, шаблоны). */
export function SkeletonList({ rows = 3 }) {
  return (
    <div className="builder-skeleton-list" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="builder-skeleton-row">
          <Skeleton w={28} h={28} r={8} />
          <div className="builder-skeleton-row__lines">
            <Skeleton w="60%" h={11} />
            <Skeleton w="35%" h={9} />
          </div>
        </div>
      ))}
    </div>
  );
}

import React from 'react';

/**
 * BranchLoader — фирменная анимация «импульс по ветвям» (метафора mindmap).
 *
 * Центральный узел-логотип (искра ✦) пульсирует, по трём ветвям к листьям-узлам
 * бегут светящиеся точки. Используется на полноэкранных загрузках: стартовая
 * заставка (LoadingScreen) и переходы между разделами (Atlas ↔ Agent Builder).
 * Для мелких мест — Loader (волна), для списков — .skeleton.
 *
 * iOS-safe: только transform/opacity + offset-path (без backdrop-filter).
 */
export default function BranchLoader({ label }) {
  return (
    <div className="branch-loader" role="status" aria-live="polite">
      <div className="ls__branch" aria-hidden="true">
        <svg viewBox="0 0 160 120" width="160" height="120">
          <path className="ls__twig" d="M28 60 C 70 60, 84 28, 138 28" />
          <path className="ls__twig" d="M28 60 C 70 60, 84 60, 138 60" />
          <path className="ls__twig" d="M28 60 C 70 60, 84 92, 138 92" />
          <circle className="ls__leaf" cx="138" cy="28" r="5" />
          <circle className="ls__leaf" cx="138" cy="60" r="5" />
          <circle className="ls__leaf" cx="138" cy="92" r="5" />
          <g className="ls__core">
            <rect className="ls__core-bg" x="12" y="44" width="32" height="32" rx="9" />
            <g className="ls__core-mark" transform="translate(20 52) scale(0.66)">
              <path d="M12 2.5c.6 5.4 1.1 7 9.5 9.5-8.4 2.5-8.9 4.1-9.5 9.5-.6-5.4-1.1-7-9.5-9.5C10.9 9.5 11.4 7.9 12 2.5Z" />
            </g>
          </g>
          <g className="ls__pulse ls__pulse--1"><circle r="4" /></g>
          <g className="ls__pulse ls__pulse--2"><circle r="4" /></g>
          <g className="ls__pulse ls__pulse--3"><circle r="4" /></g>
        </svg>
      </div>
      {label ? <span className="branch-loader__label">{label}</span> : null}
    </div>
  );
}

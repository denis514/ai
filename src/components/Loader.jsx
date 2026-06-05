import React from 'react';

/**
 * Loader — единый индикатор загрузки для МЕЛКИХ мест (бренд 105 Atlas).
 *
 * Три терракотовые точки «волной» подпрыгивают по очереди. Лёгкий, не отвлекает,
 * подходит для модалок, кнопок, инлайн-секций. Полноэкранную загрузку рисует
 * LoadingScreen (импульс по ветвям). Для списков — класс .skeleton.
 *
 * size: 'sm' (инлайн/кнопка) | 'md' (модалка/секция) | 'lg' (крупно).
 * label: опциональная подпись.
 *
 * iOS-safe: только transform/opacity. При prefers-reduced-motion — статичные точки.
 */
export default function Loader({ size = 'md', label, className = '' }) {
  return (
    <div className={`loader loader--${size} ${className}`.trim()} role="status" aria-live="polite">
      <span className="loader__wave" aria-hidden="true">
        <i /><i /><i />
      </span>
      {label ? <span className="loader__label">{label}</span> : null}
    </div>
  );
}

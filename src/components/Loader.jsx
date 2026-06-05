import React from 'react';
import Icon from './Icon.jsx';

/**
 * Loader — единый «дышащая искра» индикатор загрузки (бренд 105 Atlas).
 *
 * Терракотовая искра ✦ мягко пульсирует (scale+opacity) с лёгким свечением,
 * вокруг — два расходящихся кольца. Один визуальный язык во всей системе.
 *
 * size: 'sm' (инлайн/кнопка, без колец) | 'md' (модалка/секция) | 'lg' (крупно).
 * label: опциональная подпись под искрой.
 *
 * iOS-safe: только transform/opacity (без backdrop-filter). При
 * prefers-reduced-motion — статичная искра (CSS).
 */
const SIZE_PX = { sm: 18, md: 30, lg: 42 };

export default function Loader({ size = 'md', label, className = '' }) {
  const px = SIZE_PX[size] || SIZE_PX.md;
  return (
    <div className={`loader loader--${size} ${className}`.trim()} role="status" aria-live="polite">
      <span className="loader__spark" aria-hidden="true">
        <span className="loader__ring" />
        <span className="loader__ring loader__ring--2" />
        <Icon name="sparkles" size={px} strokeWidth={1.5} />
      </span>
      {label ? <span className="loader__label">{label}</span> : null}
    </div>
  );
}

import React from 'react';

/**
 * PlanetLogo — анимированная сфера-планета 105 Atlas (день/ночь), как в
 * логотипе и /styleguide. Переиспользуемый мини-логотип для шапок.
 *
 * Внутренний слой .mm-sphere__inner зафиксирован 32px (см. App.css);
 * масштабируем его под нужный диаметр (size / 32, с лёгким запасом на
 * полное заполнение круга).
 *
 * Props:
 *   size  — диаметр в px (по умолчанию 22)
 *   className — доп. класс контейнера
 */
export default function PlanetLogo({ size = 22, className = '' }) {
  const scale = (size / 32) * 1.04;
  return (
    <span
      className={`planet-logo ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span className="mm-sphere__inner" style={{ transform: `scale(${scale})` }}>
        <span className="planet--live">
          <span className="pl-liquid">
            <span className="blob b-a" /><span className="blob b-b" /><span className="blob b-c" />
            <span className="blob b-d" /><span className="blob b-e" /><span className="blob b-f" />
            <span className="blob b-a2" /><span className="blob b-b2" /><span className="blob b-c2" />
            <span className="blob b-d2" /><span className="blob b-e2" /><span className="blob b-f2" />
          </span>
        </span>
      </span>
    </span>
  );
}

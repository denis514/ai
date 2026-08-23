import React from 'react';
import Icon from '../../components/Icon.jsx';

/**
 * CostGlyph — знак денег по языку интерфейса: $ (en), € (fi), ₽ (ru).
 * Суммы при этом всегда в долларах — так выставляет счёт Anthropic; значок
 * лишь говорит «это стоит денег» на привычном человеку языке.
 * В бесплатном наборе Hugeicons нет знака рубля — рисуем его текстом.
 */
export default function CostGlyph({ locale = 'en', size = 13 }) {
  if (locale === 'ru') {
    return (
      <span className="builder-cost-glyph" style={{ width: size, height: size, fontSize: size * 0.8 }} aria-hidden="true">₽</span>
    );
  }
  return <Icon name={locale === 'fi' ? 'cost-eur' : 'cost-usd'} size={size} strokeWidth={2} />;
}

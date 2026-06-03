import React, { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { useT } from '../i18n/LocaleContext.jsx';
import { useFocusReturn } from '../hooks/useFocusReturn.js';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock.js';

/**
 * BottomSheet — слайд-ап оверлей из низа экрана.
 * Используется на mobile для вывода данных, которые на desktop в slide-in панели.
 *
 * Props:
 *   isOpen      — boolean
 *   onClose     — callback
 *   title       — заголовок (опционально)
 *   icon        — Icon name (опционально)
 *   children    — содержимое
 *   footer      — footer-узел (например, prev/next кнопки)
 *   className   — extra CSS class
 *
 * Особенности:
 *  - Click outside (по dimming) закрывает.
 *  - Drag handle сверху + swipe down → close.
 *  - Esc закрывает.
 *  - Body scroll lock пока открыт.
 */
export default function BottomSheet({
  isOpen,
  onClose,
  title,
  kicker,
  accent,
  icon,
  children,
  footer,
  className = ''
}) {
  const t = useT();
  const sheetRef = useRef(null);
  const [dragY, setDragY] = useState(0);
  const dragStartY = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);
  useFocusReturn(isOpen);
  useBodyScrollLock(isOpen);

  // Swipe-down to dismiss (только в зоне drag handle)
  const onTouchStart = (e) => {
    dragStartY.current = e.touches[0].clientY;
    setDragY(0);
  };
  const onTouchMove = (e) => {
    if (dragStartY.current === null) return;
    const delta = e.touches[0].clientY - dragStartY.current;
    if (delta > 0) setDragY(delta);
  };
  const onTouchEnd = () => {
    if (dragY > 80) onClose();
    setDragY(0);
    dragStartY.current = null;
  };

  if (!isOpen) return null;

  return (
    <div
      className={`bsheet-overlay ${className}`}
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bsheet"
        ref={sheetRef}
        style={{ ...(accent ? { '--cat-color': accent } : {}), ...(dragY > 0 ? { transform: `translateY(${dragY}px)` } : {}) }}
      >
        {/* Swipe-зона: handle + header. Расширили с маленького handle на всю
            верхнюю зону sheet — стандартный iOS-pattern. Content (.bsheet__body)
            остаётся скроллируемым отдельно. */}
        <div
          className="bsheet__handle"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          aria-hidden="true"
        >
          <span className="bsheet__grip" />
        </div>

        {title && (
          <header
            className="bsheet__header"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {icon && (
              <span className="bsheet__icon" aria-hidden="true">
                <Icon name={icon} size={20} strokeWidth={1.5} />
              </span>
            )}
            <div className="bsheet__heading">
              {kicker && <span className="bsheet__kicker">{kicker}</span>}
              <h3 className="bsheet__title">{title}</h3>
            </div>
            <button
              type="button"
              className="bsheet__close"
              onClick={onClose}
              aria-label={t('common.close')}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <Icon name="close" size={18} strokeWidth={1.75} />
            </button>
          </header>
        )}

        <div className="bsheet__body">{children}</div>

        {footer && (
          <div className="bsheet__footer">{footer}</div>
        )}
      </div>
    </div>
  );
}

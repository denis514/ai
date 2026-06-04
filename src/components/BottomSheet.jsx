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

  // Адаптация под экранную клавиатуру: при её появлении visualViewport
  // сжимается. Считаем перекрытие снизу (kbd) и видимую высоту (vh), чтобы
  // поднять лист над клавиатурой и ограничить его высоту — тело само скроллится.
  const [kbInset, setKbInset] = useState(0);
  const [vvHeight, setVvHeight] = useState(0);
  useEffect(() => {
    const vp = typeof window !== 'undefined' && window.visualViewport;
    if (!isOpen || !vp) { setKbInset(0); setVvHeight(0); return; }
    const update = () => {
      const overlap = Math.max(0, window.innerHeight - vp.height - vp.offsetTop);
      setKbInset(overlap > 80 ? overlap : 0); // <80px — не клавиатура (адресная строка)
      setVvHeight(vp.height);
    };
    update();
    vp.addEventListener('resize', update);
    vp.addEventListener('scroll', update);
    return () => { vp.removeEventListener('resize', update); vp.removeEventListener('scroll', update); };
  }, [isOpen]);

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
      style={kbInset ? { paddingBottom: `${kbInset}px` } : undefined}
    >
      <div
        className="bsheet"
        ref={sheetRef}
        style={{
          ...(accent ? { '--cat-color': accent } : {}),
          // Высота не больше видимой части над клавиатурой (минус запас сверху).
          ...(kbInset && vvHeight ? { '--bsheet-max': `${Math.max(240, vvHeight - 24)}px` } : {}),
          ...(dragY > 0 ? { transform: `translateY(${dragY}px)` } : {}),
        }}
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

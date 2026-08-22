import React, { useEffect, useId, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { useLocale } from '../i18n/LocaleContext.jsx';
import { LOCALE_LABEL } from '../i18n/config.js';
import { useAuth } from '../context/AuthContext.jsx';
import { updateProfile } from '../services/profileService.js';
import { announcePopover, onOtherPopover } from '../utils/popoverBus.js';

/**
 * LanguageSwitcher — единый переключатель языка для всех поверхностей
 * (Atlas, Builder, аккаунт, лендинг, будущая админка).
 *
 * Источник правды — ОДИН: LocaleContext (localStorage + IP-детект). Выбор здесь
 * меняет язык глобально для всего приложения; для залогиненного пользователя
 * дополнительно синхронит profile.locale (следует между устройствами).
 *
 * Самодостаточен: своё open-state, click-outside, Escape. Вставляется куда угодно.
 *
 * Props:
 *   • className     — доп. класс на контейнер (для встраивания в чужой ряд кнопок)
 *   • align         — 'right' | 'left' — сторона раскрытия выпадашки
 *   • title         — подсказка/aria для кнопки-глобуса
 *   • open / onOpenChange — опциональный controlled-режим: если переданы, открытием
 *       управляет хост (нужно там, где попап взаимоисключается с другими, напр. Atlas).
 *       Если не переданы — компонент самодостаточен (click-outside + Escape).
 */
export default function LanguageSwitcher({
  className = '', align = 'right', title = 'Язык',
  open: openProp, onOpenChange,
}) {
  const { locale, setLocale, locales } = useLocale();
  const { user, setProfile } = useAuth();
  const controlled = openProp !== undefined;
  const [openState, setOpenState] = useState(false);
  const open = controlled ? openProp : openState;
  const popId = useId();
  const setOpen = (v) => {
    const next = typeof v === 'function' ? v(open) : v;
    if (next) announcePopover(popId); // в шапке открыт только один попап
    if (controlled) onOpenChange?.(next);
    else setOpenState(next);
  };
  const ref = useRef(null);

  // Кто-то другой открылся — закрываемся (и в controlled-режиме тоже).
  useEffect(() => {
    if (!open) return;
    return onOtherPopover(popId, () => {
      if (controlled) onOpenChange?.(false);
      else setOpenState(false);
    });
  }, [open, controlled]); // eslint-disable-line

  // Самостоятельный режим: сами закрываемся по клику вне и Escape.
  // В controlled-режиме закрытием управляет хост (свой click-outside).
  useEffect(() => {
    if (controlled || !open) return;
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpenState(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpenState(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [controlled, open]);

  const choose = (code) => {
    setLocale(code);            // глобально: LocaleContext + localStorage
    setOpen(false);
    if (user) {                 // залогинен → синхрон с профилем (между устройствами)
      updateProfile(user.id, { locale: code }).catch(() => {});
      setProfile?.(p => (p ? { ...p, locale: code } : p));
    }
  };

  return (
    <div className={`lang-switcher ${className}`} ref={ref}>
      <button
        type="button"
        className={`lang-switcher__btn ${open ? 'is-open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={title}
        aria-label={title}
      >
        <Icon name="globe" size={18} strokeWidth={1.5} />
      </button>
      {open && (
        <div className={`lang-switcher__pop lang-switcher__pop--${align}`} role="listbox">
          {locales.map(code => (
            <button
              key={code}
              type="button"
              role="option"
              aria-selected={locale === code}
              className={`lang-switcher__opt ${locale === code ? 'is-active' : ''}`}
              onClick={() => choose(code)}
            >
              <span className="lang-switcher__check" aria-hidden="true">
                {locale === code && <Icon name="check" size={14} strokeWidth={2} />}
              </span>
              <span>{LOCALE_LABEL[code]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

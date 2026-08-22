import React, { useEffect, useId, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { useT } from '../i18n/LocaleContext.jsx';
import { useTheme } from '../hooks/useTheme.js';
import { announcePopover, onOtherPopover } from '../utils/popoverBus.js';

/**
 * ThemeSwitcher — единый переключатель темы для всех поверхностей,
 * парный к LanguageSwitcher (та же круглая «стеклянная» кнопка и попап —
 * классы .lang-switcher__* СПЕЦИАЛЬНО переиспользуются как единственный
 * источник стиля, см. стайлгайд; корневой класс .theme-switcher — только
 * маркер для тестов/поиска, стилей на нём нет).
 *
 * Иконка кнопки показывает текущий режим: солнце / луна / ноутбук («как в системе»).
 *
 * Props — как у LanguageSwitcher:
 *   • className, align ('right'|'left'), title
 *   • open / onOpenChange — опциональный controlled-режим для хостов
 *     со взаимоисключающимися попапами.
 */
export default function ThemeSwitcher({
  className = '', align = 'right', title,
  open: openProp, onOpenChange,
}) {
  const t = useT();
  const { mode, setThemeMode } = useTheme();
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

  useEffect(() => {
    if (!open) return;
    return onOtherPopover(popId, () => {
      if (controlled) onOpenChange?.(false);
      else setOpenState(false);
    });
  }, [open, controlled]); // eslint-disable-line

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

  const OPTS = [
    { m: 'light', icon: 'sun',    label: t('profile.theme.light') || 'Светлая тема' },
    { m: 'dark',  icon: 'moon',   label: t('profile.theme.dark')  || 'Тёмная тема' },
    { m: 'auto',  icon: 'laptop', label: t('profile.theme.auto')  || 'Как в системе' },
  ];
  const btnTitle = title || t('profile.theme.cycle') || 'Тема';

  return (
    <div className={`lang-switcher theme-switcher ${className}`} ref={ref}>
      <button
        type="button"
        className={`lang-switcher__btn ${open ? 'is-open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={btnTitle}
        aria-label={btnTitle}
      >
        <Icon name={mode === 'auto' ? 'laptop' : mode === 'dark' ? 'moon' : 'sun'} size={18} strokeWidth={1.5} />
      </button>
      {/* Компактный столбик: только иконки, ширина как у круглой кнопки;
          активный режим отмечен серым кружком-плашкой. Подпись — в title/aria. */}
      {open && (
        <div className={`lang-switcher__pop theme-switcher__pop lang-switcher__pop--${align}`} role="listbox">
          {OPTS.map(({ m, icon, label }) => (
            <button
              key={m}
              type="button"
              role="option"
              aria-selected={mode === m}
              className={`theme-switcher__opt ${mode === m ? 'is-active' : ''}`}
              onClick={() => { setThemeMode(m); setOpen(false); }}
              title={label}
              aria-label={label}
            >
              <Icon name={icon} size={17} strokeWidth={1.5} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

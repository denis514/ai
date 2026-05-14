import React, { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import ProfilePanel from './ProfilePanel.jsx';
import BottomSheet from './BottomSheet.jsx';
import { useIsMobile } from '../hooks/useIsMobile.js';
import { useT } from '../i18n/LocaleContext.jsx';

/**
 * ProfileFab — круглая кнопка профиля (TR угол).
 *
 * Если имя задано → показывает первую букву на фоне детерминированного цвета.
 * Если нет → иконка user (подсказка пользователю «настрой профиль»).
 *
 * Размер совпадает с другими FAB-кнопками (52×52). На desktop —
 * popover-dropdown, на mobile — BottomSheet.
 */
export default function ProfileFab(props) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const containerRef = useRef(null);

  const { identityApi } = props;
  const { initial, color, isSet } = identityApi;

  useEffect(() => {
    if (!open || isMobile) return;
    const onClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, isMobile]);

  const close = () => setOpen(false);

  // Когда пользователь кликает на статистику внутри ProfilePanel — нужно и
  // показать ноды на карте (через App.onShowNodes), и закрыть саму панель.
  const onShowNodes = (ids, label) => {
    props.onShowNodes?.(ids, label);
    close();
  };

  // Запуск туториала из Profile (вводный урок) — открыть его и закрыть панель.
  // close() через RAF — даём setRoute полностью отработать и смонтировать
  // TutorialModal перед тем как ProfileFab уберёт dropdown.
  const onStartTutorial = (id) => {
    props.onStartTutorial?.(id);
    requestAnimationFrame(() => close());
  };

  return (
    <>
      <div className="profile-fab" ref={containerRef}>
        <button
          type="button"
          className={`profile-fab__btn ${open ? 'is-open' : ''} ${isSet ? 'has-identity' : ''}`}
          onClick={() => setOpen((o) => !o)}
          aria-label={t('profile.fabAria')}
          aria-expanded={open}
          style={isSet ? { '--avatar-color': color } : undefined}
        >
          {isSet ? (
            <span className="profile-fab__initial">{initial}</span>
          ) : (
            <Icon name="user" size={22} strokeWidth={1.5} />
          )}
        </button>

        {/* Desktop dropdown */}
        {open && !isMobile && (
          <div className="profile-fab__dropdown" role="dialog" aria-label={t('profile.fabAria')}>
            <ProfilePanel {...props} onShowNodes={onShowNodes} onStartTutorial={onStartTutorial} onClose={close} />
          </div>
        )}
      </div>

      {/* Mobile bottom sheet */}
      {isMobile && (
        <BottomSheet
          isOpen={open}
          onClose={close}
          title={t('profile.fabTitle')}
          icon="user"
          className="bsheet--profile"
        >
          <ProfilePanel {...props} onShowNodes={onShowNodes} onClose={null} />
        </BottomSheet>
      )}
    </>
  );
}

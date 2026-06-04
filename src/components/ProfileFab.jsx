import React, { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import ProfilePanel from './ProfilePanel.jsx';
import BottomSheet from './BottomSheet.jsx';
import { useIsMobile } from '../hooks/useIsMobile.js';
import { useT } from '../i18n/LocaleContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

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
  const { isLoggedIn, user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const containerRef = useRef(null);

  const { identityApi, onOpenAuth } = props;
  const { initial, color, isSet } = identityApi;

  // Если пользователь авторизован — используем имя из Supabase profile как приоритет
  const displayName = profile?.display_name || identityApi?.name || null;
  const displayInitial = displayName
    ? [...displayName.trim()][0]?.toUpperCase() || '?'
    : initial;
  const displayColor = color;

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

  const openAccount = () => {
    close();
    props.onOpenAccount?.();
  };

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

  // Если Supabase не сконфигурирован или пользователь не вошёл —
  // показываем кнопку «Войти» вместо открытия профиля
  const handleClick = () => {
    if (!isLoggedIn && onOpenAuth) {
      onOpenAuth();
    } else {
      setOpen((o) => !o);
    }
  };

  const hasAvatar = isLoggedIn ? !!displayName : isSet;
  const avatarInitial = isLoggedIn ? displayInitial : initial;
  const avatarColor = displayColor;

  return (
    <>
      <div className="profile-fab" ref={containerRef}>
        <button
          type="button"
          className={`profile-fab__btn ${open ? 'is-open' : ''} ${hasAvatar ? 'has-identity' : ''} ${isLoggedIn ? 'is-auth' : ''}`}
          onClick={handleClick}
          aria-label={isLoggedIn ? t('profile.fabAria') : t('auth.signIn')}
          aria-expanded={isLoggedIn ? open : undefined}
          style={hasAvatar ? { '--avatar-color': avatarColor } : undefined}
        >
          {hasAvatar ? (
            <span className="profile-fab__initial">{avatarInitial}</span>
          ) : (
            <Icon name="user" size={22} strokeWidth={1.5} />
          )}
          {/* Зелёная точка — индикатор авторизации */}
          {isLoggedIn && <span className="profile-fab__auth-dot" aria-hidden="true" />}
        </button>

        {/* Desktop dropdown */}
        {open && !isMobile && (
          <div className="profile-fab__dropdown" role="dialog" aria-label={t('profile.fabAria')}>
            {isLoggedIn && (
              <button
                type="button"
                className="profile-fab__account-link"
                onClick={openAccount}
              >
                <Icon name="user" size={14} strokeWidth={1.5} />
                {t('account.title')}
                <Icon name="arrow-right" size={12} strokeWidth={1.5} />
              </button>
            )}
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
          {isLoggedIn && (
            <button
              type="button"
              className="profile-fab__account-link"
              onClick={openAccount}
            >
              <Icon name="user" size={14} strokeWidth={1.5} />
              {t('account.title')}
              <Icon name="arrow-right" size={12} strokeWidth={1.5} />
            </button>
          )}
          <ProfilePanel {...props} onShowNodes={onShowNodes} onClose={null} />
        </BottomSheet>
      )}
    </>
  );
}

import React, { useEffect, useRef, useState, Suspense } from 'react';
import Icon from './Icon.jsx';
import { announcePopover, onOtherPopover } from '../utils/popoverBus.js';
import { lazyWithRetry } from '../utils/lazyWithRetry.js';
// Лениво: панель профиля со статистикой открывается по клику, а весит
// заметно — держать её в стартовом пакете карты незачем.
const ProfilePanel = lazyWithRetry(() => import('./ProfilePanel.jsx'), 'ProfilePanel');
import BottomSheet from './BottomSheet.jsx';
import { useIsMobile } from '../hooks/useIsMobile.js';
import { useT } from '../i18n/LocaleContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { colorFromName } from '../hooks/useUserIdentity.js';

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
  // Шина попапов шапки: плашка профиля закрывается, когда открылись тема/язык/меню
  useEffect(() => {
    if (!open) return;
    return onOtherPopover('profile-fab', () => setOpen(false));
  }, [open]);
  const containerRef = useRef(null);

  const { identityApi, onOpenAuth } = props;
  const { initial, isSet } = identityApi;

  // Имя: profile (Supabase, async) → localStorage identity → метаданные сессии.
  // Фолбэк на user.user_metadata/email КРИТИЧЕН: profile грузится отдельным
  // async-запросом уже после установки user. Без фолбэка на первом рендере
  // displayName=null → colorFromName(null)=дефолт, и иконка профиля БЕЛАЯ, пока
  // не доедет профиль. user (и его metadata) доступен синхронно из сессии —
  // берём имя оттуда, чтобы цвет/буква появились сразу.
  const sessionName = user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || user?.email
    || null;
  const displayName = profile?.display_name || identityApi?.name || sessionName || null;
  const displayInitial = displayName
    ? [...displayName.trim()][0]?.toUpperCase() || '?'
    : initial;
  // Цвет считаем ИЗ displayName (не из identityApi.color) — иначе угловая
  // кнопка и большая иконка в выпадающем меню расходятся в цвете.
  const displayColor = colorFromName(displayName);

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

  // Панель профиля открывается всем: у гостя тоже есть имя и прогресс — они
  // лежат в браузере. Раньше гостя отсюда сразу отправляли ко входу, из-за чего
  // он не мог посмотреть даже собственную статистику. Вход предлагается ВНУТРИ
  // панели — как способ сохранить прогресс, а не как условие входа в неё.
  const handleClick = () => setOpen((o) => { if (!o) announcePopover('profile-fab'); return !o; });

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
          aria-label={t('profile.fabAria')}
          aria-expanded={open}
          style={hasAvatar ? { '--avatar-color': avatarColor } : undefined}
        >
          {hasAvatar ? (
            <span className="profile-fab__initial">{avatarInitial}</span>
          ) : (
            <Icon name="user" size={22} strokeWidth={1.5} />
          )}
          {/* Зелёная точка — индикатор авторизации */}
        </button>

        {/* Desktop dropdown */}
        {open && !isMobile && (
          <div className="profile-fab__dropdown" role="dialog" aria-label={t('profile.fabAria')}>
            <Suspense fallback={null}>
              <ProfilePanel {...props} onOpenAccount={openAccount} onShowNodes={onShowNodes} onStartTutorial={onStartTutorial} onClose={close} />
            </Suspense>
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
          <Suspense fallback={null}>
            <ProfilePanel {...props} onOpenAccount={openAccount} onShowNodes={onShowNodes} onClose={null} />
          </Suspense>
        </BottomSheet>
      )}
    </>
  );
}

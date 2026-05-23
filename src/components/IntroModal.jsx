import React, { useState, useEffect, useCallback } from 'react';
import Icon from './Icon.jsx';
import { useT } from '../i18n/LocaleContext.jsx';
import { useFocusReturn } from '../hooks/useFocusReturn.js';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock.js';

/**
 * IntroModal — первое знакомство с Atlas для новых посетителей.
 *
 * Показывается один раз при первом визите (до авторизации).
 * Ключ в localStorage: INTRO_SEEN_KEY.
 *
 * Слайд 1 — «Что такое Atlas»: заголовок + 3 фичи
 * Слайд 2 — «Ваша роль»: 4 варианта аудитории
 *
 * Props:
 *   onDone(role: string) — вызывается по завершении (выбранная роль)
 */

export const INTRO_SEEN_KEY = 'atlas:intro-seen:v1';
export const INTRO_ROLE_KEY = 'atlas:intro-role:v1';

export function isIntroSeen() {
  try { return !!localStorage.getItem(INTRO_SEEN_KEY); } catch { return false; }
}

const ROLES = [
  {
    id: 'everyone',
    icon: 'sparkles',
    color: '#16a34a',
    titleKey: 'intro.role.everyone.title',
    descKey: 'intro.role.everyone.desc',
  },
  {
    id: 'business',
    icon: 'building',
    color: '#2563eb',
    titleKey: 'intro.role.business.title',
    descKey: 'intro.role.business.desc',
  },
  {
    id: 'educators',
    icon: 'graduation',
    color: '#7c3aed',
    titleKey: 'intro.role.educators.title',
    descKey: 'intro.role.educators.desc',
  },
  {
    id: 'developers',
    icon: 'developer',
    color: '#d97706',
    titleKey: 'intro.role.developers.title',
    descKey: 'intro.role.developers.desc',
  },
];

const FEATURES = [
  { icon: 'compass', key: 'intro.feature.map' },
  { icon: 'rocket', key: 'intro.feature.courses' },
  { icon: 'flash', key: 'intro.feature.prompts' },
];

export default function IntroModal({ onDone, onRequestAuth }) {
  const t = useT();
  useFocusReturn();
  useBodyScrollLock();
  const [slide, setSlide] = useState(0);
  const [role, setRole] = useState('everyone');
  const [leaving, setLeaving] = useState(false);
  const [slideDir, setSlideDir] = useState('forward'); // 'forward' | 'back'
  const [animKey, setAnimKey] = useState(0);

  const goTo = useCallback((next, dir = 'forward') => {
    setSlideDir(dir);
    setAnimKey(k => k + 1);
    setSlide(next);
  }, []);

  const handleDone = useCallback(() => {
    if (leaving) return;
    try {
      localStorage.setItem(INTRO_SEEN_KEY, '1');
      localStorage.setItem(INTRO_ROLE_KEY, role);
    } catch {}
    setLeaving(true);
    setTimeout(() => onDone(role), 480);
  }, [leaving, role, onDone]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') handleDone();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleDone]);

  return (
    <div className={`onboarding-overlay intro-overlay${leaving ? ' is-entering' : ''}`}>
      <div className="intro-card">

        {/* Dots-навигация */}
        <div className="intro-dots" aria-hidden="true">
          {[0, 1].map(i => (
            <span key={i} className={`intro-dot${slide === i ? ' is-active' : ''}`} />
          ))}
        </div>

        {/* Слайд 1 — Что такое Atlas */}
        {slide === 0 && (
          <div className={`intro-slide intro-slide--${slideDir}`} key={`slide-0-${animKey}`}>
            <div className="intro-hero">
              <div className="intro-logo" aria-hidden="true">
                <Icon name="brain" size={30} strokeWidth={1.25} />
              </div>
              <h1 className="intro-title">{t('intro.slide1.title')}</h1>
              <p className="intro-subtitle">{t('intro.slide1.subtitle')}</p>
            </div>

            <div className="intro-features">
              {FEATURES.map(f => (
                <div key={f.key} className="intro-feature">
                  <span className="intro-feature__icon" aria-hidden="true">
                    <Icon name={f.icon} size={17} strokeWidth={1.5} />
                  </span>
                  <span className="intro-feature__text">{t(f.key)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Слайд 2 — Ваша роль */}
        {slide === 1 && (
          <div className={`intro-slide intro-slide--${slideDir}`} key={`slide-1-${animKey}`}>
            <div className="intro-hero">
              <h1 className="intro-title">{t('intro.slide2.title')}</h1>
              <p className="intro-subtitle">{t('intro.slide2.subtitle')}</p>
            </div>

            <div className="onboarding-levels" role="radiogroup" aria-label={t('intro.slide2.title')}>
              {ROLES.map(r => (
                <button
                  key={r.id}
                  type="button"
                  role="radio"
                  aria-checked={role === r.id}
                  className={`onboarding-level${role === r.id ? ' is-selected' : ''}`}
                  style={{ '--lvl-color': r.color }}
                  onClick={() => setRole(r.id)}
                >
                  <span className="onboarding-level__icon" aria-hidden="true">
                    <Icon name={r.icon} size={20} strokeWidth={1.5} />
                  </span>
                  <span className="onboarding-level__text">
                    <strong>{t(r.titleKey)}</strong>
                    <span>{t(r.descKey)}</span>
                  </span>
                  <span className="onboarding-level__check" aria-hidden="true">
                    {role === r.id && <Icon name="check" size={13} strokeWidth={2.5} />}
                  </span>
                </button>
              ))}
            </div>

            {/* Блок авторизации */}
            {onRequestAuth && (
              <div className="intro-auth">
                <div className="intro-auth__divider">
                  <span>{t('intro.authHint')}</span>
                </div>
                <button
                  type="button"
                  className="intro-auth__btn"
                  onClick={onRequestAuth}
                >
                  <Icon name="login" size={16} strokeWidth={1.75} />
                  {t('intro.authCta')}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Навигация */}
        <div className="intro-nav">
          <button
            type="button"
            className="intro-nav__skip"
            onClick={handleDone}
          >
            {t('intro.skip')}
          </button>

          <div className="intro-nav__actions">
            {slide > 0 && (
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => goTo(slide - 1, 'back')}
              >
                <Icon name="arrow-left" size={14} strokeWidth={1.5} />
                {t('common.back')}
              </button>
            )}

            {slide < 1 ? (
              <button
                type="button"
                className="btn btn--primary intro-nav__next"
                onClick={() => goTo(1, 'forward')}
              >
                {t('common.next')}
                <Icon name="arrow-right" size={14} strokeWidth={1.75} />
              </button>
            ) : (
              <button
                type="button"
                className={`btn btn--primary intro-nav__next${leaving ? ' is-loading' : ''}`}
                onClick={handleDone}
                disabled={leaving}
              >
                {leaving
                  ? <Icon name="refresh" size={14} strokeWidth={1.75} />
                  : <>{t('intro.start')} <Icon name="arrow-right" size={14} strokeWidth={1.75} /></>
                }
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

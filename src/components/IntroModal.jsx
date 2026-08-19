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
 * Один экран: что это и что здесь есть. Кнопка входа — предложением, не условием.
 *
 * Шаг «Твоя роль?» убран 2026-08-19 по итогам UX-аудита: он обещал «покажем
 * подходящие пути», а выбор нигде не использовался — карта была одинаковой для
 * всех. Обещание, которого продукт не держал, плюс лишний шаг в самом узком
 * месте воронки. Вернуть можно только вместе с реальной фильтрацией карты.
 *
 * Props:
 *   onDone() — вызывается по завершении
 */

export const INTRO_SEEN_KEY = 'atlas:intro-seen:v1';

export function isIntroSeen() {
  try { return !!localStorage.getItem(INTRO_SEEN_KEY); } catch { return false; }
}

const FEATURES = [
  { icon: 'compass', key: 'intro.feature.map' },
  { icon: 'rocket', key: 'intro.feature.courses' },
  { icon: 'flash', key: 'intro.feature.prompts' },
  { icon: 'sparkles', key: 'intro.feature.builder', beta: true },
];

export default function IntroModal({ onDone, onRequestAuth }) {
  const t = useT();
  useFocusReturn();
  useBodyScrollLock();
  const [leaving, setLeaving] = useState(false);

  const handleDone = useCallback(() => {
    if (leaving) return;
    try { localStorage.setItem(INTRO_SEEN_KEY, '1'); } catch { /* приватный режим */ }
    // Сообщаем приложению: знакомство закрыто, можно показывать плашку согласия
    // (одновременно они перекрывали друг друга на телефоне).
    try { window.dispatchEvent(new Event('atlas:intro-done')); } catch { /* SSR */ }
    setLeaving(true);
    setTimeout(() => onDone(), 480);
  }, [leaving, onDone]);

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

        {/* Закрыть intro в любой момент — мостик к контенту без прохождения слайдов */}
        <button
          type="button"
          className="intro-close"
          onClick={handleDone}
          aria-label={t('intro.skipAria') || 'Закрыть'}
          title={t('intro.skipAria') || 'Закрыть'}
        >
          <Icon name="close" size={18} strokeWidth={1.75} />
        </button>

        <div className="intro-slide intro-slide--forward">
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
                  <span className="intro-feature__text">
                    {t(f.key)}
                    {f.beta && <span className="intro-feature__beta">BETA</span>}
                  </span>
                </div>
              ))}
            </div>
        </div>

        {/* Вход — предложение, а не условие: всё содержимое открыто и без него */}
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
          </div>
        </div>

      </div>
    </div>
  );
}

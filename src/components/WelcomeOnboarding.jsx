import React, { useEffect, useState } from 'react';
import Icon from './Icon.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useT } from '../i18n/LocaleContext.jsx';

/**
 * WelcomeOnboarding — экран приветствия после первого логина.
 *
 * Показывается когда isNewUser === true в AuthContext.
 * Пользователь выбирает уровень → карта раскрывается под него.
 * Нажимает «Войти в Atlas» → онбординг закрывается.
 *
 * Props:
 *   onSelectLevel(level) — вызывается когда пользователь выбрал уровень
 *   onDismiss()          — закрыть онбординг
 */

const LEVELS = [
  {
    id: 'beginner',
    icon: 'sparkles',
    titleKey: 'onboarding.level.beginner.title',
    descKey:  'onboarding.level.beginner.desc',
    color: '#16a34a',
  },
  {
    id: 'intermediate',
    icon: 'flash',
    titleKey: 'onboarding.level.intermediate.title',
    descKey:  'onboarding.level.intermediate.desc',
    color: '#2563eb',
  },
  {
    id: 'expert',
    icon: 'brain',
    titleKey: 'onboarding.level.expert.title',
    descKey:  'onboarding.level.expert.desc',
    color: '#7c3aed',
  },
];

export default function WelcomeOnboarding({ onSelectLevel, onDismiss }) {
  const t = useT();
  const { profile } = useAuth();
  const [selected, setSelected] = useState('beginner');
  const [entering, setEntering] = useState(false);

  // Закрыть по Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') handleEnter(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]); // eslint-disable-line

  const handleEnter = () => {
    if (entering) return;
    setEntering(true);
    onSelectLevel(selected);
    setTimeout(() => onDismiss(), 600);
  };

  const firstName = profile?.display_name?.split(' ')[0] || null;

  return (
    <div className={`onboarding-overlay ${entering ? 'is-entering' : ''}`}>
      <div className="onboarding-card">

        {/* Header */}
        <div className="onboarding-header">
          <div className="onboarding-logo" aria-hidden="true">
            <Icon name="sparkles" size={28} strokeWidth={1.25} />
          </div>
          <h1>
            {firstName
              ? t('onboarding.titleName', { name: firstName })
              : t('onboarding.title')}
          </h1>
          <p>{t('onboarding.subtitle')}</p>
        </div>

        {/* Level picker */}
        <div className="onboarding-levels" role="radiogroup" aria-label={t('onboarding.levelAria')}>
          {LEVELS.map(lvl => (
            <button
              key={lvl.id}
              type="button"
              role="radio"
              aria-checked={selected === lvl.id}
              className={`onboarding-level ${selected === lvl.id ? 'is-selected' : ''}`}
              style={{ '--lvl-color': lvl.color }}
              onClick={() => setSelected(lvl.id)}
            >
              <span className="onboarding-level__icon" aria-hidden="true">
                <Icon name={lvl.icon} size={22} strokeWidth={1.5} />
              </span>
              <span className="onboarding-level__text">
                <strong>{t(lvl.titleKey)}</strong>
                <span>{t(lvl.descKey)}</span>
              </span>
              <span className="onboarding-level__check" aria-hidden="true">
                {selected === lvl.id && <Icon name="check" size={14} strokeWidth={2.5} />}
              </span>
            </button>
          ))}
        </div>

        {/* CTA */}
        <button
          type="button"
          className={`onboarding-enter ${entering ? 'is-loading' : ''}`}
          onClick={handleEnter}
          disabled={entering}
        >
          {entering
            ? <><Icon name="refresh" size={16} strokeWidth={1.75} /> {t('onboarding.entering')}</>
            : <>{t('onboarding.enter')} <Icon name="arrow-right" size={16} strokeWidth={2} /></>
          }
        </button>

        <p className="onboarding-hint">{t('onboarding.hint')}</p>
      </div>
    </div>
  );
}

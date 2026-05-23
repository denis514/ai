import React, { useEffect, useMemo, useState } from 'react';
import Icon from './Icon.jsx';
import { useT, useLocale } from '../i18n/LocaleContext.jsx';
import { getLocalizedHelp } from '../i18n/useHelp.js';
import { useFocusReturn } from '../hooks/useFocusReturn.js';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock.js';

/**
 * HelpModal — справка по продукту с динамическим FAQ.
 *
 * Слева — сайдбар с категориями (sections), справа — items (q/a/actions).
 * Action-кнопки внутри ответа открывают конкретные ноды, туториалы,
 * библиотеку, курсы или другую секцию справки.
 *
 * Props:
 *   onClose          — закрыть модалку
 *   activeSectionId  — id секции из deep-link (route.id)
 *   onNavigate       — глобальный setRoute (используется для open-section)
 *   onOpenNode       — (id) => void
 *   onOpenTutorial   — (id) => void
 *   onOpenLibrary    — () => void
 *   onOpenCourses    — () => void
 */
export default function HelpModal({
  onClose,
  activeSectionId,
  onNavigate,
  onOpenNode,
  onOpenTutorial,
  onOpenLibrary,
  onOpenCourses
}) {
  const t = useT();
  const { locale } = useLocale();
  useFocusReturn();
  useBodyScrollLock();

  const sections = useMemo(() => getLocalizedHelp(locale), [locale]);
  const initialId = activeSectionId && sections.find(s => s.id === activeSectionId)
    ? activeSectionId
    : sections[0]?.id || null;
  const [activeId, setActiveId] = useState(initialId);

  // Sync с deep-link при изменении.
  useEffect(() => {
    if (activeSectionId && sections.find(s => s.id === activeSectionId)) {
      setActiveId(activeSectionId);
    }
  }, [activeSectionId, sections]);

  const active = sections.find(s => s.id === activeId) || sections[0];

  // Esc → close
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const runAction = (action) => {
    if (!action) return;
    switch (action.type) {
      case 'open-node':       onOpenNode?.(action.id); break;
      case 'open-tutorial':   onOpenTutorial?.(action.id); break;
      case 'open-library':    onOpenLibrary?.(); break;
      case 'open-courses':    onOpenCourses?.(); break;
      case 'open-section':    setActiveId(action.id); break;
      case 'link':            if (action.url) window.open(action.url, '_blank', 'noopener'); break;
      default: break;
    }
  };

  return (
    <div className="help-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="help-modal" role="dialog" aria-modal="true" aria-label={t('help.title')}>
        <header className="help-modal__head">
          <span className="help-modal__head-icon" aria-hidden="true">
            <Icon name="question" size={20} strokeWidth={1.5} />
          </span>
          <div className="help-modal__head-text">
            <h2>{t('help.title')}</h2>
            <p>{t('help.subtitle')}</p>
          </div>
          <button
            type="button"
            className="help-modal__close"
            onClick={onClose}
            aria-label={t('common.close')}
          >
            <Icon name="close" size={16} strokeWidth={1.75} />
          </button>
        </header>

        <div className="help-modal__body">
          <aside className="help-sidebar" aria-label={t('help.sectionsAria')}>
            {sections.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`help-sidebar__item ${activeId === s.id ? 'is-active' : ''}`}
                onClick={() => setActiveId(s.id)}
              >
                <Icon name={s.icon || 'compass'} size={16} strokeWidth={1.5} />
                <span>{s.title}</span>
              </button>
            ))}
          </aside>

          <div className="help-content">
            {!active && (
              <div className="help-empty">{t('help.empty')}</div>
            )}
            {active && (
              <>
                <h3 className="help-content__title">{active.title}</h3>
                <div className="help-items">
                  {(active.items || []).map((item) => (
                    <article key={item.id} className="help-item">
                      <h4 className="help-item__q">{item.q}</h4>
                      <p className="help-item__a">{item.a}</p>
                      {Array.isArray(item.actions) && item.actions.length > 0 && (
                        <div className="help-item__actions">
                          {item.actions.map((a, i) => (
                            <button
                              key={i}
                              type="button"
                              className={`help-action help-action--${a.type}`}
                              onClick={() => runAction(a)}
                            >
                              <Icon
                                name={
                                  a.type === 'open-node' ? 'target' :
                                  a.type === 'open-tutorial' ? 'graduation' :
                                  a.type === 'open-library' ? 'books' :
                                  a.type === 'open-courses' ? 'graduation' :
                                  a.type === 'open-section' ? 'arrow-right' :
                                  a.type === 'link' ? 'external-link' :
                                  'arrow-right'
                                }
                                size={13}
                                strokeWidth={1.75}
                              />
                              <span>{a.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

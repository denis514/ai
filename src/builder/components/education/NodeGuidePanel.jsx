import React from 'react';
import Icon from '../../../components/Icon.jsx';
import { useLocale, useT } from '../../../i18n/LocaleContext.jsx';
import { getNodeDef } from '../../data/nodeTypes.js';
import { getNodeGuide } from '../../data/nodeGuides.js';

/**
 * NodeGuidePanel — короткая инструкция «Как использовать узел» в правой панели.
 *
 * Открывается кнопкой «Как использовать» в ConceptTooltip (hover на палитре)
 * и в NodeDetails (выбранный узел). В отличие от AtlasNodePreview, показывает
 * не теорию Atlas, а практический микро-урок: что делает узел в потоке и как
 * его применить (summary + steps + tip).
 *
 * Источник данных: src/builder/data/nodeGuides.js (getNodeGuide).
 *
 * Props:
 *  • defId        — id типа узла из NODE_DEFS
 *  • onClose      — вернуться к обычной панели
 *  • onOpenAtlas  — (опц.) переключиться на превью Atlas для этого же узла
 */
export default function NodeGuidePanel({ defId, onClose, onOpenAtlas }) {
  const t = useT();
  const { locale } = useLocale();
  const def = getNodeDef(defId);
  const guide = getNodeGuide(defId, locale);

  const title = def ? (t(def.labelKey) || def.labelKey) : defId;
  const icon = def?.icon || 'idea';
  const color = def?.color || 'var(--accent, #2563eb)';

  return (
    <div className="builder-guide" style={{ '--node-color': color }}>
      <div className="builder-guide__head">
        <div className="builder-guide__head-main">
          <span className="builder-guide__head-icon" aria-hidden="true">
            <Icon name={icon} size={16} strokeWidth={1.5} />
          </span>
          <div>
            <div className="builder-guide__head-title">{title}</div>
            <div className="builder-guide__head-sub">
              {t('builder.guide.subtitle') || 'Как использовать'}
            </div>
          </div>
        </div>
        <button
          type="button"
          className="builder-guide__close"
          onClick={onClose}
          aria-label={t('builder.preview.close') || 'Close'}
          title={t('builder.preview.close') || 'Close'}
        >
          <Icon name="close" size={14} strokeWidth={1.75} />
        </button>
      </div>

      {guide ? (
        <div className="builder-guide__body">
          <p className="builder-guide__summary">{guide.summary}</p>

          {Array.isArray(guide.steps) && guide.steps.length > 0 && (
            <div className="builder-guide__section">
              <h4 className="builder-guide__label">
                <Icon name="clipboard" size={12} strokeWidth={1.6} />
                <span>{t('builder.guide.steps') || 'Шаги'}</span>
              </h4>
              <ol className="builder-guide__steps">
                {guide.steps.map((step, i) => (
                  <li key={i} className="builder-guide__step">
                    <span className="builder-guide__step-num">{i + 1}</span>
                    <span className="builder-guide__step-text">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {guide.tip && (
            <div className="builder-guide__tip">
              <Icon name="idea" size={13} strokeWidth={1.6} />
              <span>{guide.tip}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="builder-guide__missing">
          <Icon name="question" size={22} strokeWidth={1.5} />
          <p>{t('builder.guide.empty') || 'Инструкция пока не готова.'}</p>
        </div>
      )}

      {def?.atlasAnchor && onOpenAtlas && (
        <footer className="builder-guide__footer">
          <button
            type="button"
            className="builder-guide__atlas-btn"
            onClick={() => onOpenAtlas(def.atlasAnchor)}
          >
            <Icon name="compass" size={12} strokeWidth={1.5} />
            <span>{t('builder.details.learnMore') || 'Узнать больше в Atlas'}</span>
            <Icon name="arrow-right" size={12} strokeWidth={1.5} />
          </button>
        </footer>
      )}
    </div>
  );
}

import React from 'react';
import Icon from '../../../components/Icon.jsx';
import { useT } from '../../../i18n/LocaleContext.jsx';
import { getNodeDef } from '../../data/nodeTypes.js';

/**
 * ConceptTooltip — образовательная подсказка для node-type из toolbox.
 *
 * Показывается при hover на ToolboxItem (с 400ms задержкой).
 * Содержит:
 *  • Icon + Name + Kind badge
 *  • Description (≤140 chars per ai-education-designer skill)
 *  • «Learn more in Atlas →» — opens Atlas node в новой вкладке
 *
 * Позиционируется absolute от .builder-app. Координаты top/left прокидывает parent.
 *
 * Phase B-1 Day 22-23 (см. docs/agent-builder/03-mvp-30day.md).
 */

export default function ConceptTooltip({ defId, top, left, onShow, onHide }) {
  const t = useT();
  const def = getNodeDef(defId);
  if (!def) return null;

  // Сохраняем tooltip когда курсор на нём (отменяем pending hide).
  const handleMouseEnter = () => {
    if (onShow) onShow({ defId, top, left });
  };
  const handleMouseLeave = () => {
    if (onHide) onHide();
  };

  const { icon, color, labelKey, descKey, atlasAnchor, kind } = def;

  const handleAtlasOpen = (e) => {
    e.stopPropagation();
    // Open в новой вкладке чтобы не вытащить пользователя из Builder
    if (atlasAnchor) {
      const url = `${window.location.origin}${window.location.pathname}#/node/${atlasAnchor}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className="builder-tooltip"
      style={{
        top: `${top}px`,
        left: `${left}px`,
        '--node-color': color,
      }}
      role="tooltip"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="builder-tooltip__head">
        <span className="builder-tooltip__icon" aria-hidden="true">
          <Icon name={icon} size={18} strokeWidth={1.5} />
        </span>
        <div>
          <div className="builder-tooltip__title">{t(labelKey) || labelKey}</div>
          <div className="builder-tooltip__kind">{t(`builder.kind.${kind}`) || kind}</div>
        </div>
      </div>

      {descKey && (
        <p className="builder-tooltip__desc">{t(descKey) || ''}</p>
      )}

      {atlasAnchor && (
        <button
          type="button"
          className="builder-tooltip__link"
          onClick={handleAtlasOpen}
        >
          <Icon name="compass" size={11} strokeWidth={1.75} />
          <span>{t('builder.tooltip.learnMore') || 'Learn more in Atlas'}</span>
          <Icon name="arrow-right" size={11} strokeWidth={1.75} />
        </button>
      )}

      <div className="builder-tooltip__hint">
        {t('builder.tooltip.dragHint') || 'Drag to canvas to use'}
      </div>
    </div>
  );
}

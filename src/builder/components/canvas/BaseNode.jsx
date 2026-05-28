import React from 'react';
import { Handle, Position } from 'reactflow';
import Icon from '../../../components/Icon.jsx';
import { useT } from '../../../i18n/LocaleContext.jsx';

/**
 * BaseNode — общий компонент для всех custom node types в Builder.
 *
 * Параметры через data:
 *  • defId      — id из NODE_DEFS
 *  • icon       — Atlas icon name
 *  • color      — accent цвет
 *  • labelKey   — i18n ключ для отображаемого названия
 *  • kind       — 'agent' | 'tool' | 'trigger' | 'output'
 *  • status     — 'idle' | 'running' | 'completed' | 'failed' (mock execution)
 *
 * Handles:
 *  • trigger:  только bottom (output)
 *  • output:   только top (input)
 *  • остальное: top (input) + bottom (output)
 *
 * Селекция управляется React Flow (selected prop).
 *
 * Этот компонент memoized — состояние status и selected — единственные триггеры
 * re-render. Drag/positioning React Flow handles внутренне.
 */

function BaseNodeInner({ data, selected }) {
  const t = useT();
  const { icon, color, labelKey, kind, status = 'idle', orderLevel, hasPrompt, unlinkedOut } = data || {};

  const showTop = kind !== 'trigger';
  const showBottom = kind !== 'output';

  return (
    <div
      className={[
        'builder-node',
        `builder-node--${kind}`,
        `builder-node--status-${status}`,
        selected ? 'is-selected' : '',
      ].join(' ').trim()}
      style={{ '--node-color': color }}
    >
      {orderLevel != null && (
        <span className="builder-node__order" aria-hidden="true" title={`Step ${orderLevel}`}>
          {orderLevel}
        </span>
      )}
      {hasPrompt && kind === 'agent' && (
        <span className="builder-node__configured" aria-hidden="true" title="Custom instruction set">
          <Icon name="check" size={9} strokeWidth={3} />
        </span>
      )}

      {showTop && (
        <Handle
          type="target"
          position={Position.Top}
          className="builder-node__handle builder-node__handle--in"
        />
      )}

      <div className="builder-node__inner">
        <span className="builder-node__icon" aria-hidden="true">
          <Icon name={icon} size={16} strokeWidth={1.5} />
        </span>
        <span className="builder-node__label">{t(labelKey) || labelKey || ''}</span>
        {status !== 'idle' && (
          <span
            className={`builder-node__status builder-node__status--${status}`}
            aria-label={status}
          >
            {status === 'running' && <span className="builder-node__pulse" />}
            {status === 'completed' && <Icon name="check" size={10} strokeWidth={2.5} />}
            {status === 'failed' && <Icon name="close" size={10} strokeWidth={2.5} />}
          </span>
        )}
      </div>

      {showBottom && (
        <Handle
          type="source"
          position={Position.Bottom}
          className={`builder-node__handle builder-node__handle--out ${unlinkedOut ? 'is-pulsing' : ''}`}
          title={t('builder.connectHint') || 'Drag from here to connect'}
        />
      )}
    </div>
  );
}

export default React.memo(BaseNodeInner);

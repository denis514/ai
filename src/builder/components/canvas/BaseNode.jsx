import React from 'react';
import { Handle, Position } from 'reactflow';
import Icon from '../../../components/Icon.jsx';
import { EXPENSIVE_DEFS } from '../../data/nodeCost.js';
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
  const { icon, color, labelKey, kind, role, status = 'idle', orderLevel, hasPrompt, hasInput, unlinkedOut, unlinkedIn, condValue, defId } = data || {};
  const expensive = EXPENSIVE_DEFS.has(defId);

  // «Заполнен» → плашка заливается цветом узла (инверсия): агент с инструкцией
  // или User Input с введённой задачей. Сразу видно, какие узлы готовы.
  const filled = (kind === 'agent' && hasPrompt) || (kind === 'trigger' && hasInput);

  // Условие (condition / condition-agent) рисует ДВА выхода Да/Нет.
  // Цикл (loop) — обычный узел с одним входом/выходом.
  const isCondition = kind === 'logic' && role !== 'loop';
  // target-порты (вход): сверху + слева — для всех кроме trigger.
  // source-порты (выход): снизу + справа — для всех кроме output и condition.
  const showIn = kind !== 'trigger';
  const showOut = kind !== 'output' && !isCondition;
  const inPulse = unlinkedIn ? 'is-pulsing' : '';
  const outPulse = unlinkedOut ? 'is-pulsing' : '';

  return (
    <div
      className={[
        'builder-node',
        `builder-node--${kind}`,
        `builder-node--status-${status}`,
        selected ? 'is-selected' : '',
        filled ? 'is-filled' : '',
      ].join(' ').trim()}
      style={{ '--node-color': color }}
    >
      {orderLevel != null && (
        <span className="builder-node__order" aria-hidden="true" title={`Step ${orderLevel}`}>
          {orderLevel}
        </span>
      )}
      {/* Заполненность показывает сама плашка (заливка). Пустому агенту —
          янтарная точка «нужна инструкция». */}
      {kind === 'agent' && !hasPrompt && (
        <span className="builder-node__needsetup" title={t('builder.node.needsSetup') || 'Нужна инструкция — кликните, чтобы настроить'}>
          <Icon name="edit" size={9} strokeWidth={2.5} />
        </span>
      )}

      {/* Дорогой шаг (веб-поиск, код): монетка слева сверху, подсказка с ценой. */}
      {expensive && (
        <span className="builder-node__cost" title={t('builder.cost.nodeHint')}>
          <Icon name="coins" size={9} strokeWidth={2.5} />
        </span>
      )}

      {/* Итог тестового прогона — кружок в правом верхнем углу:
          зелёный чек / красный крест / жёлтый «!». */}
      {(status === 'completed' || status === 'failed' || status === 'warn') && (
        <span className={`builder-node__statbadge builder-node__statbadge--${status}`} aria-label={status}>
          <Icon
            name={status === 'completed' ? 'check' : status === 'failed' ? 'close' : 'warning'}
            size={11}
            strokeWidth={3}
          />
        </span>
      )}

      {showIn && (
        <Handle
          type="target"
          position={Position.Top}
          className={`builder-node__handle builder-node__handle--in ${inPulse}`}
          title={t('builder.connectInHint') || 'Точка входа: сюда приходит связь'}
        />
      )}
      {showIn && (
        <Handle
          id="l"
          type="target"
          position={Position.Left}
          className="builder-node__handle builder-node__handle--left"
        />
      )}

      <div className="builder-node__inner">
        <span className="builder-node__icon" aria-hidden="true">
          <Icon name={icon} size={16} strokeWidth={1.5} />
        </span>
        <span className="builder-node__label">{t(labelKey) || labelKey || ''}</span>
        {isCondition && condValue ? (
          <span className="builder-node__cond" title={condValue}>«{condValue}»</span>
        ) : null}
        {status === 'running' && (
          <span className="builder-node__status builder-node__status--running" aria-label="running">
            <span className="builder-node__pulse" />
          </span>
        )}
      </div>

      {showOut && (
        <Handle
          type="source"
          position={Position.Bottom}
          className={`builder-node__handle builder-node__handle--out ${outPulse}`}
          title={t('builder.connectHint') || 'Перетащите отсюда, чтобы соединить'}
        />
      )}
      {showOut && (
        <Handle
          id="r"
          type="source"
          position={Position.Right}
          className="builder-node__handle builder-node__handle--right"
          title={t('builder.connectHint') || 'Перетащите отсюда, чтобы соединить'}
        />
      )}

      {/* Condition: два подписанных выхода — «Да» (true) и «Нет» (false) */}
      {isCondition && (
        <>
          <Handle
            id="true"
            type="source"
            position={Position.Bottom}
            style={{ left: '30%' }}
            className="builder-node__handle builder-node__handle--out builder-node__handle--true"
            title={t('builder.condition.trueHint') || 'Ветка «Да» — если условие выполнено'}
          />
          <span className="builder-node__branch builder-node__branch--true" aria-hidden="true">
            {t('builder.condition.yes') || 'Да'}
          </span>
          <Handle
            id="false"
            type="source"
            position={Position.Bottom}
            style={{ left: '70%' }}
            className="builder-node__handle builder-node__handle--out builder-node__handle--false"
            title={t('builder.condition.falseHint') || 'Ветка «Нет» — если условие не выполнено'}
          />
          <span className="builder-node__branch builder-node__branch--false" aria-hidden="true">
            {t('builder.condition.no') || 'Нет'}
          </span>
        </>
      )}
    </div>
  );
}

export default React.memo(BaseNodeInner);

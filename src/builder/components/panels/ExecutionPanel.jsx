import React, { useEffect, useRef } from 'react';
import Icon from '../../../components/Icon.jsx';
import { useT } from '../../../i18n/LocaleContext.jsx';

/**
 * ExecutionPanel — bottom panel с live логами выполнения.
 *
 * Props:
 *  • logs: Array<{level, nodeId, nodeName, message, ts}>
 *  • status: 'idle' | 'running' | 'completed' | 'failed' | 'stopped'
 *  • nodesTotal, nodesDone, nodesFailed
 *  • onStop(): останов running execution
 *  • onClear(): сбросить logs
 *  • onClose(): закрыть панель
 *
 * Auto-scroll к bottom при новых логах.
 *
 * Phase B-1 Day 19-20.
 */

export default function ExecutionPanel({
  logs,
  status,
  nodesTotal,
  nodesDone,
  nodesFailed,
  onStop,
  onClear,
  onClose,
}) {
  const t = useT();
  const bodyRef = useRef(null);

  // Auto-scroll к bottom при appearing новых логов
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [logs.length]);

  const summaryText = (() => {
    if (status === 'idle') return t('builder.exec.summaryIdle') || 'Press Run to execute';
    if (status === 'running') return `${nodesDone}/${nodesTotal} ${t('builder.exec.completed') || 'completed'}`;
    if (status === 'completed') return `${nodesDone}/${nodesTotal} ${t('builder.exec.completed') || 'completed'} ✓`;
    if (status === 'failed') return `${nodesFailed} ${t('builder.exec.failed') || 'failed'}, ${nodesDone} ${t('builder.exec.completed') || 'completed'}`;
    if (status === 'stopped') return t('builder.exec.stopped') || 'Stopped';
    return '';
  })();

  return (
    <section className="builder-exec" aria-label={t('builder.exec.aria') || 'Execution log'}>
      <div className="builder-exec__header">
        <span className="builder-exec__title-wrap">
          <span className="builder-exec__title">{t('builder.exec.title') || 'Execution'}</span>
          <span className={`builder-exec__summary builder-exec__summary--${status}`}>
            {status === 'running' && <span className="builder-exec__pulse" />}
            {summaryText}
          </span>
        </span>

        <div className="builder-exec__actions">
          {status === 'running' && onStop && (
            <button
              type="button"
              className="builder-btn builder-btn--ghost builder-btn--small"
              onClick={onStop}
              title={t('builder.exec.stop') || 'Stop'}
            >
              <Icon name="close" size={12} strokeWidth={1.75} />
              <span>{t('builder.exec.stop') || 'Stop'}</span>
            </button>
          )}
          {logs.length > 0 && status !== 'running' && (
            <button
              type="button"
              className="builder-btn builder-btn--ghost builder-btn--small"
              onClick={onClear}
              title={t('builder.exec.clear') || 'Clear'}
            >
              <span>{t('builder.exec.clear') || 'Clear'}</span>
            </button>
          )}
          <button
            type="button"
            className="builder-btn builder-btn--ghost builder-btn--small"
            onClick={onClose}
            aria-label={t('builder.exec.close') || 'Close panel'}
          >
            <Icon name="close" size={12} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <div className="builder-exec__body" ref={bodyRef}>
        {logs.length === 0 ? (
          <div className="builder-empty-state builder-empty-state--small">
            <Icon name="terminal" size={20} strokeWidth={1.5} />
            <p>{t('builder.exec.empty') || 'Press Run to see mock execution logs.'}</p>
          </div>
        ) : (
          <ol className="builder-exec__log">
            {logs.map((log, i) => (
              <li
                key={i}
                className={`builder-log builder-log--${log.level}`}
              >
                <span className="builder-log__ts">{formatTs(log.ts)}</span>
                {log.nodeName && (
                  <span className="builder-log__node">[{log.nodeName}]</span>
                )}
                <span className="builder-log__msg">{log.message}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

function formatTs(ms) {
  const sec = (ms / 1000).toFixed(1);
  return `+${sec}s`;
}

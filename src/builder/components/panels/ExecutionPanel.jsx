import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../../components/Icon.jsx';
import { useT } from '../../../i18n/LocaleContext.jsx';
import { OUTPUT_TIERS } from '../../data/outputTiers.js';

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
  result,
  runSetup,   // { task, onTaskChange, tierId, onTierChange, estimate } | null — только real-режим
  onStop,
  onClear,
  onClose,
}) {
  const t = useT();
  const bodyRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!result?.output) return;
    try {
      navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* noop */ }
  };

  const handleDownload = () => {
    if (!result?.output) return;
    try {
      const blob = new Blob([result.output], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workflow-result-${new Date().toISOString().slice(0, 10)}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* noop */ }
  };

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

      {runSetup && status !== 'running' && (
        <div className="builder-exec__setup">
          <label className="builder-exec__setup-label" htmlFor="builder-task-input">
            {t('builder.runInput.title') || 'What should the workflow work on?'}
          </label>
          <textarea
            id="builder-task-input"
            className="builder-name-modal__input builder-runinput__area"
            value={runSetup.task}
            onChange={(e) => runSetup.onTaskChange(e.target.value)}
            placeholder={t('builder.runInput.placeholder') || 'Describe the task, paste text, ask a question…'}
            rows={2}
          />
          <div className="builder-tier builder-tier--compact">
            <div className="builder-tier__opts">
              {Object.values(OUTPUT_TIERS).map(tier => (
                <button
                  key={tier.id}
                  type="button"
                  role="radio"
                  aria-checked={runSetup.tierId === tier.id}
                  className={`builder-tier__opt ${runSetup.tierId === tier.id ? 'is-active' : ''}`}
                  onClick={() => runSetup.onTierChange(tier.id)}
                  title={t(tier.descKey) || ''}
                >
                  <span className="builder-tier__opt-name">{t(tier.labelKey) || tier.id.toUpperCase()}</span>
                </button>
              ))}
            </div>
            <span className="builder-exec__setup-est">
              ≈ {runSetup.estimate.totalMax.toLocaleString()} {t('builder.runInput.tokens') || 'tokens'}
              {' · '}≈ ${runSetup.estimate.costUsd < 0.01 ? '0.01' : runSetup.estimate.costUsd.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {result?.output && (
        <div className="builder-exec__result">
          <div className="builder-exec__result-head">
            <span className="builder-exec__result-title">
              {t('builder.exec.resultTitle') || 'Result'}
              {result.tokensUsed ? <span className="builder-exec__result-tokens"> · {result.tokensUsed} {t('builder.exec.tokens') || 'tokens'}</span> : null}
            </span>
            <span className="builder-exec__result-actions">
              <button type="button" className="builder-btn builder-btn--ghost builder-btn--small" onClick={handleCopy}>
                <Icon name={copied ? 'check' : 'clipboard'} size={12} strokeWidth={1.75} />
                <span>{copied ? (t('builder.exec.copied') || 'Copied') : (t('builder.exec.copy') || 'Copy')}</span>
              </button>
              <button type="button" className="builder-btn builder-btn--ghost builder-btn--small" onClick={handleDownload}>
                <Icon name="file" size={12} strokeWidth={1.75} />
                <span>{t('builder.exec.download') || 'Download'}</span>
              </button>
            </span>
          </div>
          <div className="builder-exec__result-text">{result.output}</div>
        </div>
      )}

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

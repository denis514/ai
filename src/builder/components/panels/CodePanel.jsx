import React, { useState, useMemo, useEffect } from 'react';
import Icon from '../../../components/Icon.jsx';
import { serializeForLocal } from '../../services/workflowSerializer.js';
import { validateGraph } from '../../services/connectionRules.js';
import { toShareGraph, fromShareGraph } from '../../services/shareGraph.js';

/**
 * CodePanel — прозрачный «код ↔ холст» для Agent Builder.
 *
 * Показывает читаемое описание схемы (узлы + связи) в реальном времени и
 * позволяет вставить такой код, чтобы автоматически собрать узлы на холсте
 * с правильными подключениями (с проверкой корректности).
 *
 * Двусторонне через проверенный workflowSerializer (round-trip identity).
 */

/** Холст → читаемый объект кода. */
function toCode(nodes, edges) {
  const { nodes: dn, edges: de } = serializeForLocal(nodes, edges);
  return {
    nodes: dn.map(n => {
      const o = { id: n.client_id, type: n.def_id, x: Math.round(n.position_x), y: Math.round(n.position_y) };
      if (n.config && Object.keys(n.config).length) o.config = n.config;
      return o;
    }),
    edges: de.map(e => {
      const o = { from: e.source_client_id, to: e.target_client_id };
      if (e.label) o.label = e.label;
      if (e.config && Object.keys(e.config).length) o.config = e.config;
      return o;
    }),
  };
}

export default function CodePanel({ nodes, edges, edgeStyle, onApply, t }) {
  const canvasCode = useMemo(() => JSON.stringify(toCode(nodes, edges), null, 2), [nodes, edges]);
  const [draft, setDraft] = useState(canvasCode);
  const [edited, setEdited] = useState(false);
  const [msg, setMsg] = useState(null); // { type: 'ok'|'err', text }
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  // Пока пользователь не редактировал — код «живой» (следует за холстом).
  useEffect(() => { if (!edited) setDraft(canvasCode); }, [canvasCode, edited]);

  const onChange = (e) => { setDraft(e.target.value); setEdited(true); setMsg(null); };

  const resetToCanvas = () => { setDraft(canvasCode); setEdited(false); setMsg(null); };

  const copy = async () => {
    try { await navigator.clipboard.writeText(draft); setCopied(true); setTimeout(() => setCopied(false), 1400); }
    catch { /* clipboard недоступен — игнорируем */ }
  };

  // «Поделиться»: копируем безопасную версию кода (без личных данных и ключей).
  const share = async () => {
    const text = JSON.stringify(toShareGraph(nodes, edges), null, 2);
    try {
      await navigator.clipboard.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 1600);
      setMsg({ type: 'ok', text: t('builder.code.shareHint') || 'Код скопирован для отправки — личные данные (чат, почта) удалены. Получатель вставит его сюда и нажмёт «Собрать».' });
    } catch { /* clipboard недоступен */ }
  };

  const apply = () => {
    let obj;
    try { obj = JSON.parse(draft); }
    catch (e) { setMsg({ type: 'err', text: t('builder.code.badJson') + ' ' + e.message }); return; }
    let rf;
    try { rf = fromShareGraph(obj, edgeStyle); }
    catch (e) { setMsg({ type: 'err', text: e.message }); return; }
    onApply(rf.nodes, rf.edges);
    setEdited(false);
    // Мягкая проверка собранной схемы правилами запуска (не блокирует сборку).
    const v = validateGraph(rf.nodes, rf.edges);
    const reason = (code) => t(code === 'no-agent' ? 'builder.validation.noAgent' : `builder.validation.${code}`);
    const issues = [
      ...v.errors.map(reason),
      ...v.warnings.map(w => reason(w.type)),
    ];
    const okText = t('builder.code.applied', { n: rf.nodes.length, e: rf.edges.length });
    if (issues.length) {
      setMsg({ type: 'warn', text: okText + ' ' + (t('builder.code.checkRun') || 'Проверьте связи перед запуском:'), issues });
    } else {
      setMsg({ type: 'ok', text: okText });
    }
  };

  return (
    <div className="builder-code-panel__content" role="group" aria-label={t('builder.code.title') || 'Код схемы'}>
      <p className="builder-code-panel__hint">
        {t('builder.code.hint') || 'Узлы и связи схемы в реальном времени. Вставьте свой код и нажмите «Собрать», чтобы построить схему на холсте.'}
      </p>

      <textarea
        className="builder-code-panel__area"
        value={draft}
        onChange={onChange}
        spellCheck={false}
        wrap="off"
        aria-label={t('builder.code.title') || 'Код схемы'}
      />

      {msg && (
        <div className={`builder-code-panel__msg builder-code-panel__msg--${msg.type}`}>
          {msg.text}
          {msg.issues && msg.issues.length > 0 && (
            <ul className="builder-code-panel__issues">
              {msg.issues.map((it, i) => <li key={i}>{it}</li>)}
            </ul>
          )}
        </div>
      )}

      <div className="builder-code-panel__actions">
        <button type="button" className="builder-btn builder-btn--ghost" onClick={copy}>
          <Icon name={copied ? 'check' : 'clipboard'} size={14} strokeWidth={1.6} />
          {copied ? (t('builder.code.copied') || 'Скопировано') : (t('builder.code.copy') || 'Копировать')}
        </button>
        <button type="button" className="builder-btn builder-btn--ghost" onClick={share} title={t('builder.code.shareTitle') || 'Скопировать схему для другого пользователя (без личных данных)'}>
          <Icon name={shared ? 'check' : 'send'} size={14} strokeWidth={1.6} />
          {shared ? (t('builder.code.shared') || 'Скопировано') : (t('builder.code.share') || 'Поделиться')}
        </button>
        {edited && (
          <button type="button" className="builder-btn builder-btn--ghost" onClick={resetToCanvas}>
            {t('builder.code.reset') || 'Вернуть к холсту'}
          </button>
        )}
        <button type="button" className="builder-code-panel__apply" onClick={apply}>
          {t('builder.code.apply') || 'Собрать на холсте'}
        </button>
      </div>
    </div>
  );
}

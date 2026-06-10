import React, { useState, useMemo, useEffect } from 'react';
import Icon from '../../../components/Icon.jsx';
import { serializeForLocal, deserializeFromDb } from '../../services/workflowSerializer.js';
import { getNodeDef } from '../../data/nodeTypes.js';
import { validateGraph } from '../../services/connectionRules.js';

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

/** Объект кода → React Flow nodes/edges (с валидацией). Бросает понятную ошибку. */
function fromCode(obj, edgeStyle) {
  if (!obj || typeof obj !== 'object') throw new Error('Нужен объект { nodes: [...], edges: [...] }');
  if (!Array.isArray(obj.nodes)) throw new Error('Поле "nodes" должно быть массивом');
  const dbNodes = obj.nodes.map((n, i) => {
    if (!n || !n.type) throw new Error(`Узел #${i + 1}: нет поля "type"`);
    if (!getNodeDef(n.type)) throw new Error(`Узел #${i + 1}: неизвестный тип "${n.type}"`);
    return {
      client_id: String(n.id || `n${i + 1}`),
      def_id: n.type,
      position_x: Number(n.x) || 0,
      position_y: Number(n.y) || 0,
      config: n.config || {},
    };
  });
  const ids = new Set(dbNodes.map(n => n.client_id));
  if (ids.size !== dbNodes.length) throw new Error('Повторяющиеся id узлов — id должны быть уникальны');
  const edgesArr = Array.isArray(obj.edges) ? obj.edges : [];
  const dbEdges = edgesArr.map((e, i) => {
    if (!e || e.from == null || e.to == null) throw new Error(`Связь #${i + 1}: нужны поля "from" и "to"`);
    if (String(e.from) === String(e.to)) throw new Error(`Связь #${i + 1}: узел не может быть связан сам с собой`);
    if (!ids.has(String(e.from))) throw new Error(`Связь #${i + 1}: узел "${e.from}" не найден`);
    if (!ids.has(String(e.to))) throw new Error(`Связь #${i + 1}: узел "${e.to}" не найден`);
    return {
      client_id: String(e.id || `e${i + 1}`),
      source_client_id: String(e.from),
      target_client_id: String(e.to),
      label: e.label || null,
      config: e.config || {},
    };
  });
  return deserializeFromDb(dbNodes, dbEdges, edgeStyle);
}

export default function CodePanel({ nodes, edges, edgeStyle, onApply, onClose, t, tabs = null }) {
  const canvasCode = useMemo(() => JSON.stringify(toCode(nodes, edges), null, 2), [nodes, edges]);
  const [draft, setDraft] = useState(canvasCode);
  const [edited, setEdited] = useState(false);
  const [msg, setMsg] = useState(null); // { type: 'ok'|'err', text }
  const [copied, setCopied] = useState(false);

  // Пока пользователь не редактировал — код «живой» (следует за холстом).
  useEffect(() => { if (!edited) setDraft(canvasCode); }, [canvasCode, edited]);

  const onChange = (e) => { setDraft(e.target.value); setEdited(true); setMsg(null); };

  const resetToCanvas = () => { setDraft(canvasCode); setEdited(false); setMsg(null); };

  const copy = async () => {
    try { await navigator.clipboard.writeText(draft); setCopied(true); setTimeout(() => setCopied(false), 1400); }
    catch { /* clipboard недоступен — игнорируем */ }
  };

  const apply = () => {
    let obj;
    try { obj = JSON.parse(draft); }
    catch (e) { setMsg({ type: 'err', text: t('builder.code.badJson') + ' ' + e.message }); return; }
    let rf;
    try { rf = fromCode(obj, edgeStyle); }
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
    <aside className="builder-code-panel" role="dialog" aria-label={t('builder.code.title') || 'Код схемы'}>
      <header className="builder-code-panel__head">
        {tabs || (
          <span className="builder-code-panel__title">
            <Icon name="terminal" size={15} strokeWidth={1.6} />
            {t('builder.code.title') || 'Код схемы'}
          </span>
        )}
        <button type="button" className="builder-code-panel__close" onClick={onClose} aria-label={t('common.close') || 'Закрыть'}>
          <Icon name="close" size={14} strokeWidth={2} />
        </button>
      </header>

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
        {edited && (
          <button type="button" className="builder-btn builder-btn--ghost" onClick={resetToCanvas}>
            {t('builder.code.reset') || 'Вернуть к холсту'}
          </button>
        )}
        <button type="button" className="builder-code-panel__apply" onClick={apply}>
          {t('builder.code.apply') || 'Собрать на холсте'}
        </button>
      </div>
    </aside>
  );
}

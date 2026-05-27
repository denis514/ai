import React, { useCallback, useState, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import Icon from '../components/Icon.jsx';
import { useT } from '../i18n/LocaleContext.jsx';
import { NODE_DEFS, TOOLBOX_GROUPS, getNodeDef, KIND_TO_NODE_TYPE } from './data/nodeTypes.js';
import { nodeTypes } from './components/canvas/index.js';
import './BuilderApp.css';

/**
 * BuilderApp — entry point Agent Builder.
 *
 * Phase B-1 Day 8-14: node interactions.
 *  • Custom AgentNode/ToolNode/TriggerNode/OutputNode (через BaseNode)
 *  • Drag-and-drop из toolbox на canvas
 *  • Click node → selection → sidebar shows details + Atlas link
 *  • Delete key → remove selected
 *  • Edge connections drag from handle to handle
 *
 * Загружается через React.lazy() из App.jsx → не affects main bundle.
 *
 * НЕ импортирует ничего из src/components/ кроме Icon (registry, OK).
 * НЕ модифицирует ничего за пределами src/builder/.
 *
 * Status: DAY 8-14 — interactions complete.
 * Days 15-21: templates + mock execution.
 * Days 22-30: education tooltips + Atlas deep-links + polish.
 * См. docs/agent-builder/03-mvp-30day.md.
 */

let nodeIdCounter = 1;
const genNodeId = () => `n${nodeIdCounter++}`;

function BuilderApp() {
  return (
    <ReactFlowProvider>
      <BuilderAppInner />
    </ReactFlowProvider>
  );
}

function BuilderAppInner() {
  const t = useT();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [toolboxOpen, setToolboxOpen] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [execPanelOpen, setExecPanelOpen] = useState(false);

  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();

  const selectedNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) : null;

  /* ────────── Edge connection ────────── */
  const onConnect = useCallback(
    (params) => setEdges(eds => addEdge({ ...params, animated: false }, eds)),
    [setEdges]
  );

  /* ────────── Drag-drop из toolbox ────────── */
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const defId = event.dataTransfer.getData('application/builder-node');
      if (!defId) return;
      const def = getNodeDef(defId);
      if (!def) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: genNodeId(),
        type: KIND_TO_NODE_TYPE[def.kind] || 'agentNode',
        position,
        data: {
          defId,
          icon: def.icon,
          color: def.color,
          labelKey: def.labelKey,
          descKey: def.descKey,
          atlasAnchor: def.atlasAnchor,
          kind: def.kind,
          role: def.role,
          status: 'idle',
        },
      };

      setNodes(nds => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  /* ────────── Selection ────────── */
  const onNodeClick = useCallback((event, node) => {
    setSelectedNodeId(node.id);
    setSidebarOpen(true);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  /* ────────── Delete key ────────── */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId) {
          // Не trigger Delete если фокус в input/textarea
          const tag = document.activeElement?.tagName;
          if (tag === 'INPUT' || tag === 'TEXTAREA') return;
          setNodes(nds => nds.filter(n => n.id !== selectedNodeId));
          setEdges(eds => eds.filter(e => e.source !== selectedNodeId && e.target !== selectedNodeId));
          setSelectedNodeId(null);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedNodeId, setNodes, setEdges]);

  /* ────────── Atlas anchor link ────────── */
  const openAtlasNode = useCallback((nodeId) => {
    window.location.hash = `#/node/${nodeId}`;
  }, []);

  /* ────────── Header actions ────────── */
  const handleAtlasBack = useCallback(() => {
    window.location.hash = '';
  }, []);

  const handleRun = useCallback(() => {
    // Day 17-18 будет mock execution. Сейчас просто open panel + set всех в running на 2 сек.
    setExecPanelOpen(true);
    setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, status: 'running' } })));
    setTimeout(() => {
      setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, status: 'completed' } })));
    }, 2000);
  }, [setNodes]);

  const handleClear = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
  }, [setNodes, setEdges]);

  return (
    <div
      className={[
        'builder-app',
        toolboxOpen ? 'has-toolbox' : 'no-toolbox',
        sidebarOpen ? 'has-sidebar' : 'no-sidebar',
        execPanelOpen ? 'has-exec' : 'no-exec',
      ].join(' ')}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="builder-header">
        <button
          type="button"
          className="builder-header__back"
          onClick={handleAtlasBack}
          aria-label={t('builder.backToAtlas') || 'Back to Atlas'}
        >
          <Icon name="arrow-left" size={16} strokeWidth={1.75} />
          <span>{t('builder.backToAtlas') || 'Atlas'}</span>
        </button>

        <div className="builder-header__title">
          <Icon name="sparkles" size={16} strokeWidth={1.5} />
          <span>{t('builder.title') || 'Agent Builder'}</span>
          <span className="builder-header__beta">BETA</span>
          {nodes.length > 0 && (
            <span className="builder-header__counter">
              {nodes.length} {nodes.length === 1 ? 'node' : 'nodes'}
            </span>
          )}
        </div>

        <div className="builder-header__actions">
          {nodes.length > 0 && (
            <button
              type="button"
              className="builder-btn builder-btn--ghost"
              onClick={handleClear}
              title={t('builder.clear') || 'Clear canvas'}
            >
              <Icon name="close" size={14} strokeWidth={1.5} />
            </button>
          )}
          <button
            type="button"
            className="builder-btn builder-btn--ghost"
            onClick={() => setToolboxOpen(v => !v)}
            aria-pressed={toolboxOpen}
            title="Toggle toolbox"
          >
            <Icon name="archive" size={14} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            className="builder-btn builder-btn--ghost"
            onClick={() => setSidebarOpen(v => !v)}
            aria-pressed={sidebarOpen}
            title="Toggle sidebar"
          >
            <Icon name="clipboard" size={14} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            className="builder-btn builder-btn--ghost"
            onClick={() => setExecPanelOpen(v => !v)}
            aria-pressed={execPanelOpen}
            title="Toggle execution panel"
          >
            <Icon name="terminal" size={14} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            className="builder-btn builder-btn--primary"
            onClick={handleRun}
            disabled={nodes.length === 0}
            title="Run (mock)"
          >
            <Icon name="flash" size={14} strokeWidth={1.5} />
            <span>{t('builder.run') || 'Run'}</span>
          </button>
        </div>
      </header>

      {/* ── Main layout grid ───────────────────────────────────── */}
      <div className="builder-grid">

        {/* Toolbox (left) */}
        {toolboxOpen && (
          <aside className="builder-toolbox" aria-label={t('builder.toolbox.aria') || 'Node toolbox'}>
            <div className="builder-toolbox__header">
              <span>{t('builder.toolbox.title') || 'Nodes'}</span>
            </div>
            <div className="builder-toolbox__body">
              {TOOLBOX_GROUPS.map(group => (
                <div key={group.id} className="builder-toolbox__group">
                  <div className="builder-toolbox__group-label">
                    {t(group.labelKey) || group.id}
                  </div>
                  {group.items.map(defId => {
                    const def = NODE_DEFS[defId];
                    if (!def) return null;
                    return (
                      <button
                        key={defId}
                        type="button"
                        className="builder-toolbox__item"
                        style={{ '--node-color': def.color }}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('application/builder-node', defId);
                          e.dataTransfer.effectAllowed = 'copy';
                        }}
                        title={t(def.labelKey) || defId}
                      >
                        <Icon name={def.icon} size={14} strokeWidth={1.5} />
                        <span>{t(def.labelKey) || defId}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="builder-toolbox__hint">
              {t('builder.toolbox.hint') || 'Drag nodes to the canvas'}
            </div>
          </aside>
        )}

        {/* Canvas (center) */}
        <main className="builder-canvas-wrap" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
            proOptions={{ hideAttribution: true }}
            deleteKeyCode={null /* мы handle delete сами для control */}
          >
            <Background gap={20} size={1} />
            <Controls />
            <MiniMap pannable zoomable />
          </ReactFlow>

          {/* Empty state — when no nodes */}
          {nodes.length === 0 && (
            <div className="builder-empty-canvas">
              <Icon name="sparkles" size={32} strokeWidth={1.25} />
              <h2>{t('builder.canvas.emptyTitle') || 'Build your first agent'}</h2>
              <p>{t('builder.canvas.emptyDesc') || 'Drag a node from the left panel to start building.'}</p>
            </div>
          )}

          {/* Status hint — поверх canvas */}
          {nodes.length > 0 && (
            <div className="builder-status-hint">
              <Icon name="idea" size={14} strokeWidth={1.5} />
              <span>{t('builder.canvas.hint') || 'Click a node to see details. Drag handles to connect. Delete key to remove.'}</span>
            </div>
          )}
        </main>

        {/* Sidebar (right) */}
        {sidebarOpen && (
          <aside className="builder-sidebar" aria-label={t('builder.sidebar.aria') || 'Selection details'}>
            <div className="builder-sidebar__header">
              <span>{t('builder.sidebar.title') || 'Details'}</span>
            </div>
            <div className="builder-sidebar__body">
              {selectedNode ? (
                <NodeDetails node={selectedNode} t={t} onAtlasLink={openAtlasNode} />
              ) : (
                <div className="builder-empty-state">
                  <Icon name="idea" size={24} strokeWidth={1.5} />
                  <p>{t('builder.sidebar.empty') || 'Select a node to see details and education tips.'}</p>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Execution panel (bottom) */}
        {execPanelOpen && (
          <section className="builder-exec" aria-label={t('builder.exec.aria') || 'Execution log'}>
            <div className="builder-exec__header">
              <span>{t('builder.exec.title') || 'Execution'}</span>
              <button
                type="button"
                className="builder-btn builder-btn--ghost builder-btn--small"
                onClick={() => setExecPanelOpen(false)}
                aria-label={t('builder.exec.close') || 'Close panel'}
              >
                <Icon name="close" size={12} strokeWidth={1.75} />
              </button>
            </div>
            <div className="builder-exec__body">
              <div className="builder-empty-state builder-empty-state--small">
                <Icon name="terminal" size={20} strokeWidth={1.5} />
                <p>{t('builder.exec.empty') || 'Real-time logs coming Days 17-18. Press Run to see node status changes.'}</p>
              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* NodeDetails — содержимое sidebar для выбранного узла        */
/* ─────────────────────────────────────────────────────────── */

function NodeDetails({ node, t, onAtlasLink }) {
  const { icon, color, labelKey, descKey, atlasAnchor, kind, role, status } = node.data;
  return (
    <div className="builder-node-details">
      <div className="builder-node-details__head" style={{ '--node-color': color }}>
        <span className="builder-node-details__icon" aria-hidden="true">
          <Icon name={icon} size={20} strokeWidth={1.5} />
        </span>
        <div>
          <div className="builder-node-details__title">{t(labelKey) || labelKey}</div>
          <div className="builder-node-details__kind">{t(`builder.kind.${kind}`) || kind}</div>
        </div>
      </div>

      {descKey && (
        <p className="builder-node-details__desc">
          {t(descKey) || ''}
        </p>
      )}

      <dl className="builder-node-details__meta">
        <div>
          <dt>{t('builder.details.role') || 'Role'}</dt>
          <dd>{role}</dd>
        </div>
        <div>
          <dt>{t('builder.details.status') || 'Status'}</dt>
          <dd>
            <span className={`builder-status-badge builder-status-badge--${status}`}>
              {status}
            </span>
          </dd>
        </div>
      </dl>

      {atlasAnchor && (
        <button
          type="button"
          className="builder-atlas-link"
          onClick={() => onAtlasLink(atlasAnchor)}
        >
          <Icon name="compass" size={12} strokeWidth={1.5} />
          <span>{t('builder.details.learnMore') || 'Learn more in Atlas'}</span>
          <Icon name="arrow-right" size={12} strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
}

export default BuilderApp;

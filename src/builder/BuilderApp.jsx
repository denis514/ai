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
import ToolboxItem from './components/canvas/ToolboxItem.jsx';
import ConceptTooltip from './components/education/ConceptTooltip.jsx';
import TemplateGallery from './components/panels/TemplateGallery.jsx';
import ExecutionPanel from './components/panels/ExecutionPanel.jsx';
import { createExecution } from './services/mockExecutor.js';
import './BuilderApp.css';

/**
 * BuilderApp — entry point Agent Builder.
 *
 * Phase B-1 Day 15-21: templates + mock execution.
 *  • 4 ready-to-use templates (UX Audit, Analytics, Content, Research)
 *  • TemplateGallery modal — pick template или start from scratch
 *  • Mock executor с topological sort, fake logs, 5% failure rate
 *  • ExecutionPanel с live log streaming, status summary, stop/clear
 *
 * Загружается через React.lazy() из App.jsx → не affects main bundle.
 *
 * Status: DAY 15-21 — templates + execution complete.
 * Days 22-30: education tooltips + Atlas deep-link previews + polish + launch.
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
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [tooltipInfo, setTooltipInfo] = useState(null); // { defId, top, left }

  // Execution state
  const [execStatus, setExecStatus] = useState('idle'); // 'idle' | 'running' | 'completed' | 'failed' | 'stopped'
  const [execLogs, setExecLogs] = useState([]);
  const [execStats, setExecStats] = useState({ total: 0, done: 0, failed: 0 });
  const execRef = useRef(null);

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

  /* ────────── Load template ────────── */
  const loadTemplate = useCallback((template) => {
    // Generate IDs для nodes
    const tempIdMap = {};
    const newNodes = template.nodes.map((tn, idx) => {
      const def = getNodeDef(tn.defId);
      if (!def) return null;
      const id = genNodeId();
      tempIdMap[idx] = id;
      return {
        id,
        type: KIND_TO_NODE_TYPE[def.kind] || 'agentNode',
        position: tn.position,
        data: {
          defId: tn.defId,
          icon: def.icon,
          color: def.color,
          labelKey: def.labelKey,
          descKey: def.descKey,
          atlasAnchor: def.atlasAnchor,
          kind: def.kind,
          role: def.role,
          status: 'idle',
          ...(tn.dataOverride || {}),
        },
      };
    }).filter(Boolean);

    const newEdges = template.edges.map((e, i) => ({
      id: `e${i}-${tempIdMap[e.from]}-${tempIdMap[e.to]}`,
      source: tempIdMap[e.from],
      target: tempIdMap[e.to],
    }));

    setNodes(newNodes);
    setEdges(newEdges);
    setSelectedNodeId(null);
    setGalleryOpen(false);
    // Reset exec state
    setExecLogs([]);
    setExecStatus('idle');
  }, [setNodes, setEdges]);

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

  /* ────────── Mock execution ────────── */
  const handleRun = useCallback(() => {
    if (nodes.length === 0) return;
    if (execStatus === 'running') return;

    // Reset all node statuses
    setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, status: 'idle' } })));
    setExecLogs([]);
    setExecStatus('running');
    setExecPanelOpen(true);

    const stats = { total: nodes.length, done: 0, failed: 0 };
    setExecStats(stats);

    execRef.current = createExecution({
      nodes,
      edges,
      onUpdate: (nodeId, status) => {
        setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, status } } : n));
        if (status === 'completed') {
          stats.done += 1;
          setExecStats({ ...stats });
        } else if (status === 'failed') {
          stats.failed += 1;
          setExecStats({ ...stats });
        }
      },
      onLog: (entry) => {
        setExecLogs(prev => [...prev, entry]);
      },
      onComplete: () => {
        setExecStatus(prev => {
          if (prev === 'stopped') return 'stopped';
          return stats.failed > 0 ? 'failed' : 'completed';
        });
        execRef.current = null;
      },
    });
  }, [nodes, edges, execStatus, setNodes]);

  const handleStopExec = useCallback(() => {
    if (execRef.current) {
      execRef.current.stop();
      setExecStatus('stopped');
    }
  }, []);

  const handleClearLogs = useCallback(() => {
    setExecLogs([]);
    setExecStatus('idle');
    setExecStats({ total: 0, done: 0, failed: 0 });
    setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, status: 'idle' } })));
  }, [setNodes]);

  const handleClearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    setExecLogs([]);
    setExecStatus('idle');
  }, [setNodes, setEdges]);

  /* ────────── Keyboard shortcuts ────────── */
  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      // R — run
      if (e.key === 'r' || e.key === 'R') {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        e.preventDefault();
        handleRun();
      }
      // Esc — close gallery
      if (e.key === 'Escape') {
        if (galleryOpen) setGalleryOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleRun, galleryOpen]);

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
          <button
            type="button"
            className="builder-btn builder-btn--ghost"
            onClick={() => setGalleryOpen(true)}
            title={t('builder.gallery.open') || 'Open templates'}
          >
            <Icon name="books" size={14} strokeWidth={1.5} />
            <span>{t('builder.gallery.openShort') || 'Templates'}</span>
          </button>
          {nodes.length > 0 && (
            <button
              type="button"
              className="builder-btn builder-btn--ghost"
              onClick={handleClearCanvas}
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
            disabled={nodes.length === 0 || execStatus === 'running'}
            title="Run (R)"
          >
            <Icon name={execStatus === 'running' ? 'refresh' : 'flash'} size={14} strokeWidth={1.5} />
            <span>{execStatus === 'running'
              ? (t('builder.running') || 'Running…')
              : (t('builder.run') || 'Run')}</span>
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
                      <ToolboxItem
                        key={defId}
                        defId={defId}
                        def={def}
                        onHover={setTooltipInfo}
                      />
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
            deleteKeyCode={null}
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
              <p>{t('builder.canvas.emptyDesc') || 'Drag a node from the left panel, or pick a template.'}</p>
              <button
                type="button"
                className="builder-btn builder-btn--primary"
                onClick={() => setGalleryOpen(true)}
                style={{ pointerEvents: 'auto', marginTop: 16 }}
              >
                <Icon name="books" size={14} strokeWidth={1.5} />
                <span>{t('builder.canvas.browseTemplates') || 'Browse templates'}</span>
              </button>
            </div>
          )}

          {/* Status hint */}
          {nodes.length > 0 && execStatus !== 'running' && (
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
          <ExecutionPanel
            logs={execLogs}
            status={execStatus}
            nodesTotal={execStats.total}
            nodesDone={execStats.done}
            nodesFailed={execStats.failed}
            onStop={handleStopExec}
            onClear={handleClearLogs}
            onClose={() => setExecPanelOpen(false)}
          />
        )}

      </div>

      {/* Template Gallery modal */}
      {galleryOpen && (
        <TemplateGallery
          onUseTemplate={loadTemplate}
          onScratch={() => setGalleryOpen(false)}
          onClose={() => setGalleryOpen(false)}
        />
      )}

      {/* Education tooltip — hover on toolbox items */}
      {tooltipInfo && !galleryOpen && (
        <ConceptTooltip
          defId={tooltipInfo.defId}
          top={tooltipInfo.top}
          left={tooltipInfo.left}
        />
      )}
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

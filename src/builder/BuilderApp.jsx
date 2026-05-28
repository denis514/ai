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
import { useAuth } from '../context/AuthContext.jsx';
import { NODE_DEFS, TOOLBOX_GROUPS, getNodeDef, KIND_TO_NODE_TYPE } from './data/nodeTypes.js';
import { nodeTypes } from './components/canvas/index.js';
import ToolboxItem from './components/canvas/ToolboxItem.jsx';
import ConceptTooltip from './components/education/ConceptTooltip.jsx';
import AtlasNodePreview from './components/education/AtlasNodePreview.jsx';
import BuilderTour, { isTourSeen } from './components/education/BuilderTour.jsx';
import TemplateGallery from './components/panels/TemplateGallery.jsx';
import ExecutionPanel from './components/panels/ExecutionPanel.jsx';
import WorkflowSwitcher from './components/panels/WorkflowSwitcher.jsx';
import RecentWorkflows from './components/panels/RecentWorkflows.jsx';
import { TEMPLATES } from './data/templates.js';
import { createExecution } from './services/mockExecutor.js';
import { saveWorkflow as storageSave, loadWorkflow as storageLoad } from './services/workflowStorage.js';
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

/**
 * Строит React Flow nodes/edges из template-объекта.
 * Pure (кроме genNodeId counter). Используется и для загрузки в canvas,
 * и для немедленного persist при создании нового workflow из шаблона.
 */
function buildTemplateGraph(template, edgeStyle) {
  const tempIdMap = {};
  const nodes = template.nodes.map((tn, idx) => {
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

  const edges = template.edges.map((e, i) => ({
    id: `e${i}-${tempIdMap[e.from]}-${tempIdMap[e.to]}`,
    source: tempIdMap[e.from],
    target: tempIdMap[e.to],
    style: edgeStyle,
  }));

  return { nodes, edges };
}

// Default edge style — apply inline чтобы перебить React Flow defaults.
// Через CSS !important иногда не работает в production: React Flow может
// inject inline style attr на path element, и только inline-style на edge
// object его перебивает.
const EDGE_STYLE = {
  stroke: '#94a3b8',
  strokeWidth: 2,
};

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
  const tooltipHideTimerRef = useRef(null);

  // Atlas preview state — когда установлено, заменяет NodeDetails в sidebar.
  const [atlasPreviewId, setAtlasPreviewId] = useState(null);

  // Onboarding tour — показываем при first visit
  const [tourOpen, setTourOpen] = useState(() => !isTourSeen());

  const openAtlasPreview = useCallback((atlasId) => {
    if (!atlasId) return;
    setAtlasPreviewId(atlasId);
    setSidebarOpen(true); // open sidebar если был закрыт
    // Сразу скрываем tooltip — preview в sidebar более полный
    if (tooltipHideTimerRef.current) {
      clearTimeout(tooltipHideTimerRef.current);
      tooltipHideTimerRef.current = null;
    }
    setTooltipInfo(null);
  }, []);

  const closeAtlasPreview = useCallback(() => {
    setAtlasPreviewId(null);
  }, []);

  /* ────────── Tooltip show/hide с graceful delay ────────── */
  // Show: immediately + cancels pending hide (если мышка вернулась)
  const handleTooltipShow = useCallback((info) => {
    if (tooltipHideTimerRef.current) {
      clearTimeout(tooltipHideTimerRef.current);
      tooltipHideTimerRef.current = null;
    }
    if (info) setTooltipInfo(info);
  }, []);

  // Hide: 200ms delay чтобы мышка успела перейти tooltipа
  const handleTooltipHide = useCallback(() => {
    if (tooltipHideTimerRef.current) clearTimeout(tooltipHideTimerRef.current);
    tooltipHideTimerRef.current = setTimeout(() => {
      setTooltipInfo(null);
      tooltipHideTimerRef.current = null;
    }, 200);
  }, []);

  // Cleanup
  useEffect(() => () => {
    if (tooltipHideTimerRef.current) clearTimeout(tooltipHideTimerRef.current);
  }, []);

  // Execution state
  const [execStatus, setExecStatus] = useState('idle'); // 'idle' | 'running' | 'completed' | 'failed' | 'stopped'
  const [execLogs, setExecLogs] = useState([]);
  const [execStats, setExecStats] = useState({ total: 0, done: 0, failed: 0 });
  const execRef = useRef(null);

  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();

  /* ────────── Persistence state (B-2.1) ────────── */
  const { user } = useAuth();
  const userId = user?.id || null;
  const [currentWorkflowId, setCurrentWorkflowId] = useState(null);
  const [workflowName, setWorkflowName] = useState('');
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [nameModalStep, setNameModalStep] = useState('name'); // 'name' | 'template'
  const [nameDraft, setNameDraft] = useState('');
  const isDirtyRef = useRef(false);
  const saveTimerRef = useRef(null);
  const skipDirtyRef = useRef(false); // подавляет dirty при программной загрузке

  // Помечаем dirty при любом изменении nodes/edges (кроме программной загрузки).
  useEffect(() => {
    if (skipDirtyRef.current) {
      skipDirtyRef.current = false;
      return;
    }
    if (nodes.length === 0 && edges.length === 0) return;
    isDirtyRef.current = true;
    setSaveStatus(s => (s === 'saved' ? 'idle' : s));
  }, [nodes, edges]);

  // Низкоуровневое сохранение с явным именем.
  // overrideNodes/overrideEdges — для случаев, когда state ещё не успел
  // обновиться (создание из шаблона: setNodes async, closure видит старое).
  const persist = useCallback(async (name, overrideNodes, overrideEdges, overrideId) => {
    setSaveStatus('saving');
    try {
      const { id } = await storageSave(
        {
          id: overrideId !== undefined ? overrideId : currentWorkflowId,
          name,
          rfNodes: overrideNodes ?? nodes,
          rfEdges: overrideEdges ?? edges,
        },
        userId
      );
      setCurrentWorkflowId(id);
      setWorkflowName(name);
      isDirtyRef.current = false;
      setSaveStatus('saved');
    } catch (e) {
      console.error('[Builder] save failed', e);
      setSaveStatus('error');
    }
  }, [nodes, edges, currentWorkflowId, userId]);

  // Сохранение (manual + auto). Если имени нет — запрашиваем через модалку.
  // Сохраняем даже пустой холст, если имя задано (это валидный черновик).
  const doSave = useCallback(async () => {
    const name = workflowName.trim();
    if (!name) {
      setNameDraft('');
      setNameModalStep('name');
      setNameModalOpen(true); // спросить имя перед первым сохранением
      return;
    }
    await persist(name);
  }, [workflowName, persist]);

  // Шаг 1 «Чистый холст»: создаём пустой workflow с введённым именем.
  const startBlank = useCallback(async () => {
    const name = nameDraft.trim();
    if (!name) return;
    skipDirtyRef.current = true;
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    setExecLogs([]);
    setExecStatus('idle');
    setNameModalOpen(false);
    setNameModalStep('name');
    // Создаём пустой черновик с этим именем (новая запись → id передаём null).
    await persist(name, [], [], null);
  }, [nameDraft, persist, setNodes, setEdges]);

  // Шаг 2 «Из шаблона»: строим граф шаблона, имя берём из введённого
  // пользователем (а не из шаблона), сразу создаём запись.
  const pickTemplateForNew = useCallback(async (template) => {
    const name = nameDraft.trim() || (template.nameKey ? t(template.nameKey) : '') || 'Workflow';
    const { nodes: newNodes, edges: newEdges } = buildTemplateGraph(template, EDGE_STYLE);
    skipDirtyRef.current = true;
    setNodes(newNodes);
    setEdges(newEdges);
    setSelectedNodeId(null);
    setExecLogs([]);
    setExecStatus('idle');
    setNameModalOpen(false);
    setNameModalStep('name');
    await persist(name, newNodes, newEdges, null);
  }, [nameDraft, t, persist, setNodes, setEdges]);

  // Закрытие модалки (cancel) — сброс на шаг имени.
  const closeNameModal = useCallback(() => {
    setNameModalOpen(false);
    setNameModalStep('name');
  }, []);

  // Auto-save: каждые 30с, только если dirty И уже есть имя.
  // Без имени НЕ автосейвим (иначе модалка имени всплывёт сама).
  useEffect(() => {
    saveTimerRef.current = setInterval(() => {
      if (isDirtyRef.current && nodes.length > 0 && workflowName.trim()) {
        persist(workflowName.trim());
      }
    }, 30000);
    return () => {
      if (saveTimerRef.current) clearInterval(saveTimerRef.current);
    };
  }, [persist, workflowName, nodes.length]);

  // Загрузка существующего workflow по id.
  const handleLoadWorkflow = useCallback(async (wfId) => {
    try {
      const wf = await storageLoad(wfId, userId, EDGE_STYLE);
      if (!wf) return;
      skipDirtyRef.current = true;
      setNodes(wf.nodes);
      setEdges(wf.edges);
      setCurrentWorkflowId(wf.id);
      setWorkflowName(wf.name || '');
      setSelectedNodeId(null);
      setSwitcherOpen(false);
      isDirtyRef.current = false;
      setSaveStatus('saved');
    } catch (e) {
      console.error('[Builder] load failed', e);
    }
  }, [userId, setNodes, setEdges]);

  // Новый пустой workflow — сразу спрашиваем имя.
  // «Новый workflow» — открываем модалку выбора. Холст НЕ трогаем до того,
  // как пользователь подтвердит (Чистый / Из шаблона). Отмена ничего не теряет.
  const handleNewWorkflow = useCallback(() => {
    setSwitcherOpen(false);
    setNameDraft('');
    setNameModalStep('name');
    setNameModalOpen(true);
  }, []);

  const selectedNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) : null;

  /* ────────── Edge connection ────────── */
  const onConnect = useCallback(
    (params) => setEdges(eds => addEdge({ ...params, animated: false, style: EDGE_STYLE }, eds)),
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

  /* ────────── Load template (из галереи) ────────── */
  const loadTemplate = useCallback((template) => {
    const { nodes: newNodes, edges: newEdges } = buildTemplateGraph(template, EDGE_STYLE);
    skipDirtyRef.current = true;
    setNodes(newNodes);
    setEdges(newEdges);
    setSelectedNodeId(null);
    setGalleryOpen(false);
    // Имя нового workflow берём из шаблона (localized). Это новый workflow —
    // сбрасываем currentWorkflowId, чтобы Save создал новую запись.
    setWorkflowName(template.nameKey ? (t(template.nameKey) || '') : '');
    setCurrentWorkflowId(null);
    setSaveStatus('idle');
    isDirtyRef.current = false;
    // Reset exec state
    setExecLogs([]);
    setExecStatus('idle');
  }, [setNodes, setEdges, t]);

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
              {nodes.length} {t(nodes.length === 1 ? 'builder.counter.node' : 'builder.counter.nodes') || (nodes.length === 1 ? 'node' : 'nodes')}
            </span>
          )}
        </div>

        <div className="builder-header__actions">
          <button
            type="button"
            className="builder-btn builder-btn--ghost"
            onClick={() => setTourOpen(true)}
            title={t('builder.tour.openBtn') || 'Take the tour'}
            aria-label={t('builder.tour.openBtn') || 'Take the tour'}
          >
            <Icon name="question" size={14} strokeWidth={1.5} />
          </button>
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
            title={t('builder.header.toggleToolbox') || 'Toggle toolbox'}
            aria-label={t('builder.header.toggleToolbox') || 'Toggle toolbox'}
          >
            <Icon name="archive" size={14} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            className="builder-btn builder-btn--ghost"
            onClick={() => setSidebarOpen(v => !v)}
            aria-pressed={sidebarOpen}
            title={t('builder.header.toggleSidebar') || 'Toggle sidebar'}
            aria-label={t('builder.header.toggleSidebar') || 'Toggle sidebar'}
          >
            <Icon name="clipboard" size={14} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            className="builder-btn builder-btn--ghost"
            onClick={() => setExecPanelOpen(v => !v)}
            aria-pressed={execPanelOpen}
            title={t('builder.header.toggleExec') || 'Toggle execution panel'}
            aria-label={t('builder.header.toggleExec') || 'Toggle execution panel'}
          >
            <Icon name="terminal" size={14} strokeWidth={1.5} />
          </button>
          {/* Workflow switcher dropdown */}
          <div className="builder-header__switcher-wrap">
            <button
              type="button"
              className="builder-btn builder-btn--ghost"
              onClick={() => setSwitcherOpen(v => !v)}
              aria-expanded={switcherOpen}
              title={t('builder.workflows.open') || 'My workflows'}
            >
              <Icon name="folder" size={14} strokeWidth={1.5} />
              <span className="builder-header__wf-name">
                {workflowName.trim() || (t('builder.workflows.untitled') || 'Untitled')}
              </span>
              <Icon name="arrow-down" size={12} strokeWidth={1.75} />
            </button>
            {switcherOpen && (
              <WorkflowSwitcher
                userId={userId}
                currentId={currentWorkflowId}
                onOpen={handleLoadWorkflow}
                onNew={handleNewWorkflow}
                onClose={() => setSwitcherOpen(false)}
              />
            )}
          </div>

          {/* Save */}
          <button
            type="button"
            className={`builder-btn builder-btn--ghost builder-save builder-save--${saveStatus}`}
            onClick={doSave}
            disabled={nodes.length === 0 || saveStatus === 'saving'}
            title={t('builder.save.hint') || 'Save workflow'}
          >
            <Icon
              name={saveStatus === 'saved' ? 'check' : saveStatus === 'saving' ? 'refresh' : saveStatus === 'error' ? 'question' : 'archive'}
              size={14}
              strokeWidth={1.5}
            />
            <span>{
              saveStatus === 'saving' ? (t('builder.save.saving') || 'Saving…')
              : saveStatus === 'saved' ? (t('builder.save.saved') || 'Saved')
              : saveStatus === 'error' ? (t('builder.save.error') || 'Retry')
              : (t('builder.save.label') || 'Save')
            }</span>
          </button>

          <button
            type="button"
            className="builder-btn builder-btn--primary"
            onClick={handleRun}
            disabled={nodes.length === 0 || execStatus === 'running'}
            title={t('builder.header.runHint') || 'Run (R)'}
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
                        onShow={handleTooltipShow}
                        onHide={handleTooltipHide}
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

              <RecentWorkflows userId={userId} onOpen={handleLoadWorkflow} />
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
          <aside
            className={[
              'builder-sidebar',
              atlasPreviewId ? 'builder-sidebar--preview' : '',
            ].join(' ').trim()}
            aria-label={atlasPreviewId
              ? (t('builder.preview.aria') || 'Atlas preview')
              : (t('builder.sidebar.aria') || 'Selection details')}
          >
            {atlasPreviewId ? (
              // Atlas preview takes over entire sidebar — собственный header внутри
              <AtlasNodePreview
                atlasId={atlasPreviewId}
                onClose={closeAtlasPreview}
                onOpenAtlas={openAtlasPreview}
              />
            ) : (
              <>
                <div className="builder-sidebar__header">
                  <span>{t('builder.sidebar.title') || 'Details'}</span>
                </div>
                <div className="builder-sidebar__body">
                  {selectedNode ? (
                    <NodeDetails node={selectedNode} t={t} onAtlasLink={openAtlasPreview} />
                  ) : (
                    <div className="builder-empty-state">
                      <Icon name="idea" size={24} strokeWidth={1.5} />
                      <p>{t('builder.sidebar.empty') || 'Select a node to see details and education tips.'}</p>
                    </div>
                  )}
                </div>
              </>
            )}
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

      {/* Education tooltip — hover on toolbox items.
          Передаём show/hide handlers чтобы tooltip сам мог cancel pending hide
          (когда мышка переходит с item на tooltip) и schedule hide (когда уходит). */}
      {tooltipInfo && !galleryOpen && (
        <ConceptTooltip
          defId={tooltipInfo.defId}
          top={tooltipInfo.top}
          left={tooltipInfo.left}
          onShow={handleTooltipShow}
          onHide={handleTooltipHide}
          onOpenAtlas={openAtlasPreview}
        />
      )}

      {/* Onboarding tour — first-time visitors + replay через ? button */}
      {tourOpen && (
        <BuilderTour
          nodes={nodes}
          edges={edges}
          execStatus={execStatus}
          onClose={() => setTourOpen(false)}
          onOpenTemplates={() => setGalleryOpen(true)}
        />
      )}

      {/* New-workflow wizard: шаг 1 — имя + выбор; шаг 2 — список шаблонов */}
      {nameModalOpen && (
        <div
          className="builder-name-modal__overlay"
          onClick={closeNameModal}
        >
          <div
            className="builder-name-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={t('builder.nameModal.title') || 'Name your workflow'}
          >
            {nameModalStep === 'name' ? (
              <>
                <h3 className="builder-name-modal__title">
                  {t('builder.nameModal.title') || 'Name your workflow'}
                </h3>
                <input
                  type="text"
                  className="builder-name-modal__input"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && nameDraft.trim()) startBlank();
                    if (e.key === 'Escape') closeNameModal();
                  }}
                  placeholder={t('builder.nameModal.placeholder') || 'e.g. Customer support triage'}
                  autoFocus
                  maxLength={80}
                />
                <p className="builder-name-modal__hint">
                  {t('builder.nameModal.chooseHint') || 'Start blank, or pick a ready-made template.'}
                </p>
                <div className="builder-name-modal__actions">
                  <button
                    type="button"
                    className="builder-btn builder-btn--ghost"
                    onClick={closeNameModal}
                  >
                    {t('builder.nameModal.cancel') || 'Cancel'}
                  </button>
                  <button
                    type="button"
                    className="builder-btn builder-btn--ghost"
                    onClick={() => setNameModalStep('template')}
                  >
                    <Icon name="books" size={14} strokeWidth={1.5} />
                    {t('builder.nameModal.fromTemplate') || 'From template'}
                  </button>
                  <button
                    type="button"
                    className="builder-btn builder-btn--primary"
                    onClick={startBlank}
                    disabled={!nameDraft.trim()}
                  >
                    {t('builder.nameModal.blank') || 'Create'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="builder-name-modal__tpl-head">
                  <button
                    type="button"
                    className="builder-name-modal__back"
                    onClick={() => setNameModalStep('name')}
                    aria-label={t('builder.nameModal.back') || 'Back'}
                  >
                    <Icon name="arrow-left" size={14} strokeWidth={1.75} />
                    {t('builder.nameModal.back') || 'Back'}
                  </button>
                  <h3 className="builder-name-modal__title">
                    {t('builder.nameModal.pickTemplate') || 'Pick a template'}
                  </h3>
                </div>
                <div className="builder-name-modal__tpl-list">
                  {TEMPLATES.map(tpl => (
                    <button
                      key={tpl.id}
                      type="button"
                      className="builder-name-modal__tpl"
                      onClick={() => pickTemplateForNew(tpl)}
                    >
                      <span className="builder-name-modal__tpl-icon" aria-hidden="true">
                        <Icon name={tpl.iconName || 'sparkles'} size={18} strokeWidth={1.5} />
                      </span>
                      <span className="builder-name-modal__tpl-main">
                        <span className="builder-name-modal__tpl-name">{t(tpl.nameKey) || tpl.id}</span>
                        <span className="builder-name-modal__tpl-desc">{t(tpl.descKey) || ''}</span>
                      </span>
                      <Icon name="arrow-right" size={14} strokeWidth={1.75} />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Mobile blocker — отображается через CSS @media on small screens */}
      <div className="builder-mobile-blocker" aria-hidden="false">
        <div className="builder-mobile-blocker__icon">
          <Icon name="laptop" size={32} strokeWidth={1.25} />
        </div>
        <h2 className="builder-mobile-blocker__title">
          {t('builder.mobile.title') || 'Open on a larger screen'}
        </h2>
        <p className="builder-mobile-blocker__body">
          {t('builder.mobile.body') || 'Agent Builder needs space — open on desktop or tablet to design workflows.'}
        </p>
        <button
          type="button"
          className="builder-mobile-blocker__back"
          onClick={handleAtlasBack}
        >
          <Icon name="arrow-left" size={14} strokeWidth={1.75} />
          <span>{t('builder.backToAtlas') || 'Back to Atlas'}</span>
        </button>
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

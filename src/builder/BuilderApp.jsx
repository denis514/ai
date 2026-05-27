import React, { useCallback, useState } from 'react';
import { ReactFlow, Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import Icon from '../components/Icon.jsx';
import { useT } from '../i18n/LocaleContext.jsx';
import './BuilderApp.css';

/**
 * BuilderApp — entry point Agent Builder.
 *
 * Phase B-1 Day 3-7: layout structure.
 *  • Header (top): logo + back-to-Atlas + Run button placeholder
 *  • Toolbox (left, collapsible): drag-from palette
 *  • Canvas (center): React Flow
 *  • Sidebar (right, collapsible): selected node detail panel
 *  • Execution panel (bottom, collapsible): logs + status
 *
 * Загружается через React.lazy() из App.jsx → не affects main bundle.
 *
 * НЕ импортирует ничего из src/components/ кроме Icon (registry, OK).
 * НЕ модифицирует ничего за пределами src/builder/.
 *
 * Status: DAY 3-7 LAYOUT — node interactions Days 8-14, templates Days 15-21,
 * education Days 22-30. См. docs/agent-builder/03-mvp-30day.md.
 */

const initialNodes = [
  {
    id: 'placeholder',
    type: 'default',
    position: { x: 250, y: 150 },
    data: { label: 'Agent Builder — coming soon' },
    style: {
      background: 'var(--surface)',
      color: 'var(--text)',
      border: '2px dashed var(--text-soft)',
      padding: '20px 32px',
      borderRadius: '12px',
      fontFamily: 'inherit',
      fontSize: '15px',
    },
  },
];

const initialEdges = [];

// Toolbox items для drag-and-drop (Day 8-9 — real nodes; пока заглушки)
const TOOLBOX_GROUPS = [
  {
    id: 'agents',
    label: 'builder.toolbox.agents',
    items: [
      { id: 'agent-main', icon: 'brain', label: 'builder.node.agent_main' },
      { id: 'agent-research', icon: 'search', label: 'builder.node.agent_research' },
      { id: 'agent-ux', icon: 'paint', label: 'builder.node.agent_ux' },
      { id: 'agent-analytics', icon: 'chart', label: 'builder.node.agent_analytics' },
    ],
  },
  {
    id: 'tools',
    label: 'builder.toolbox.tools',
    items: [
      { id: 'tool-search', icon: 'globe', label: 'builder.node.tool_search' },
      { id: 'tool-file', icon: 'file', label: 'builder.node.tool_file' },
      { id: 'tool-vision', icon: 'eye', label: 'builder.node.tool_vision' },
      { id: 'tool-memory', icon: 'brain', label: 'builder.node.tool_memory' },
    ],
  },
  {
    id: 'flow',
    label: 'builder.toolbox.flow',
    items: [
      { id: 'trigger-input', icon: 'flash', label: 'builder.node.trigger_input' },
      { id: 'output-text', icon: 'note', label: 'builder.node.output_text' },
    ],
  },
];

export default function BuilderApp() {
  const t = useT();
  const [toolboxOpen, setToolboxOpen] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [execPanelOpen, setExecPanelOpen] = useState(false);

  const handleAtlasBack = useCallback(() => {
    window.location.hash = '';
  }, []);

  const handleRun = useCallback(() => {
    // Day 17-18 will implement mock execution. Now just opens panel.
    setExecPanelOpen(true);
  }, []);

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
        </div>

        <div className="builder-header__actions">
          <button
            type="button"
            className="builder-btn builder-btn--ghost"
            onClick={() => setToolboxOpen(v => !v)}
            aria-pressed={toolboxOpen}
            title="Toggle toolbox (⌘[)"
          >
            <Icon name="archive" size={14} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            className="builder-btn builder-btn--ghost"
            onClick={() => setSidebarOpen(v => !v)}
            aria-pressed={sidebarOpen}
            title="Toggle sidebar (⌘])"
          >
            <Icon name="clipboard" size={14} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            className="builder-btn builder-btn--ghost"
            onClick={() => setExecPanelOpen(v => !v)}
            aria-pressed={execPanelOpen}
            title="Toggle execution panel (⌘J)"
          >
            <Icon name="terminal" size={14} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            className="builder-btn builder-btn--primary"
            onClick={handleRun}
            title="Run (R)"
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
                    {t(group.label) || group.id}
                  </div>
                  {group.items.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      className="builder-toolbox__item"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/builder-node', item.id);
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      title={t(item.label) || item.id}
                    >
                      <Icon name={item.icon} size={14} strokeWidth={1.5} />
                      <span>{t(item.label) || item.id}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* Canvas (center) */}
        <main className="builder-canvas-wrap">
          <ReactFlow
            nodes={initialNodes}
            edges={initialEdges}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={20} size={1} />
            <Controls />
            <MiniMap pannable zoomable />
          </ReactFlow>

          {/* Status hint — поверх canvas */}
          <div className="builder-status-hint">
            <Icon name="construction" size={14} strokeWidth={1.5} />
            <span>{t('builder.statusHint') || 'Layout ready. Node interactions coming Days 8-14.'}</span>
          </div>
        </main>

        {/* Sidebar (right) */}
        {sidebarOpen && (
          <aside className="builder-sidebar" aria-label={t('builder.sidebar.aria') || 'Selection details'}>
            <div className="builder-sidebar__header">
              <span>{t('builder.sidebar.title') || 'Details'}</span>
            </div>
            <div className="builder-sidebar__body">
              <div className="builder-empty-state">
                <Icon name="idea" size={24} strokeWidth={1.5} />
                <p>{t('builder.sidebar.empty') || 'Select a node to see details and education tips.'}</p>
              </div>
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
                <p>{t('builder.exec.empty') || 'Press Run to see mock execution logs (Days 17-18).'}</p>
              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}

import React, { useCallback } from 'react';
import { ReactFlow, Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import Icon from '../components/Icon.jsx';
import { useT } from '../i18n/LocaleContext.jsx';
import './BuilderApp.css';

/**
 * BuilderApp — entry point Agent Builder.
 *
 * Phase B-1 Day 1-2: placeholder + empty React Flow canvas.
 * Загружается через React.lazy() из App.jsx → не affects main bundle.
 *
 * Routing: `#/builder`, `#/{locale}/builder`
 *
 * НЕ импортирует ничего из src/components/ кроме Icon (registry, OK).
 * НЕ модифицирует ничего за пределами src/builder/.
 *
 * Status: DAY 1-2 STUB — full implementation Days 3-30 (см. docs/agent-builder/03-mvp-30day.md).
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

export default function BuilderApp() {
  const t = useT();

  const handleAtlasBack = useCallback(() => {
    // Возврат на Atlas — просто чистим hash
    window.location.hash = '';
  }, []);

  return (
    <div className="builder-app">
      {/* Header */}
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
          {/* Placeholder для будущих кнопок (Save, Run, etc) */}
        </div>
      </header>

      {/* Main canvas area */}
      <main className="builder-main">
        <div className="builder-canvas">
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
        </div>

        {/* Status hint — поверх canvas */}
        <div className="builder-status-hint">
          <Icon name="construction" size={14} strokeWidth={1.5} />
          <span>{t('builder.statusHint') || 'Builder in early development. Visual canvas coming online.'}</span>
        </div>
      </main>
    </div>
  );
}

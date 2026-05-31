/**
 * templates.js — pre-built workflows готовые к загрузке в canvas.
 *
 * Каждый template имеет:
 *  • id, nameKey, descKey, iconName, difficulty, category
 *  • nodes: array { defId, position: {x,y}, dataOverride? }
 *  • edges: array { from, to } — индексы в nodes array
 *  • author: 'builtin' (later: user templates)
 *
 * defId должен быть валидным ключом из NODE_DEFS.
 *
 * Эти 4 templates — анкор MVP (см. docs/agent-builder/03-mvp-30day.md Day 15-16).
 * Расширение templates — Phase B-2+.
 */

export const TEMPLATES = [
  /* ──────────────────────────────────────────────────────── */
  /* 1. UX Audit Agent                                        */
  /* ──────────────────────────────────────────────────────── */
  {
    id: 'ux-audit',
    nameKey: 'builder.template.uxAudit.name',
    descKey: 'builder.template.uxAudit.desc',
    inputKey: 'builder.template.uxAudit.input',
    outputKey: 'builder.template.uxAudit.output',
    iconName: 'paint',
    difficulty: 'beginner',
    category: 'design',
    author: 'builtin',
    nodes: [
      { defId: 'trigger-input', position: { x: 100, y: 50 } },
      { defId: 'agent-main',    position: { x: 100, y: 180 } },
      { defId: 'tool-vision',   position: { x: -120, y: 320 } },
      { defId: 'agent-research',position: { x: 100, y: 320 } },
      { defId: 'agent-ux',      position: { x: 320, y: 320 } },
      { defId: 'output-text',   position: { x: 100, y: 480 } },
    ],
    edges: [
      { from: 0, to: 1 }, // trigger → main
      { from: 2, to: 1 }, // vision tool ⇒ прикреплён к main (attach)
      { from: 1, to: 3 }, // main → research
      { from: 1, to: 4 }, // main → ux
      { from: 3, to: 5 }, // research → output
      { from: 4, to: 5 }, // ux → output
    ],
  },

  /* ──────────────────────────────────────────────────────── */
  /* 2. Analytics Agent                                       */
  /* ──────────────────────────────────────────────────────── */
  {
    id: 'analytics',
    nameKey: 'builder.template.analytics.name',
    descKey: 'builder.template.analytics.desc',
    inputKey: 'builder.template.analytics.input',
    outputKey: 'builder.template.analytics.output',
    iconName: 'chart',
    difficulty: 'beginner',
    category: 'data',
    author: 'builtin',
    nodes: [
      { defId: 'trigger-input',    position: { x: 100, y: 50 } },
      { defId: 'agent-main',       position: { x: 100, y: 180 } },
      { defId: 'tool-file',        position: { x: -100, y: 320 } },
      { defId: 'agent-analytics',  position: { x: 100, y: 320 } },
      { defId: 'agent-research',   position: { x: 300, y: 320 } },
      { defId: 'output-text',      position: { x: 100, y: 480 } },
    ],
    edges: [
      { from: 0, to: 1 },
      { from: 2, to: 1 }, // file tool ⇒ прикреплён к main (attach)
      { from: 1, to: 3 },
      { from: 1, to: 4 },
      { from: 3, to: 5 },
      { from: 4, to: 5 },
    ],
  },

  /* ──────────────────────────────────────────────────────── */
  /* 3. Content Agent                                         */
  /* ──────────────────────────────────────────────────────── */
  {
    id: 'content',
    nameKey: 'builder.template.content.name',
    descKey: 'builder.template.content.desc',
    inputKey: 'builder.template.content.input',
    outputKey: 'builder.template.content.output',
    iconName: 'pencil',
    difficulty: 'intermediate',
    category: 'marketing',
    author: 'builtin',
    nodes: [
      { defId: 'trigger-input',   position: { x: 100, y: 50 } },
      { defId: 'agent-main',      position: { x: 100, y: 180 } },
      { defId: 'agent-research',  position: { x: -120, y: 320 } },
      { defId: 'tool-search',     position: { x: -120, y: 450 } },
      { defId: 'agent-ux',        position: { x: 100, y: 320 } },
      { defId: 'tool-memory',     position: { x: 320, y: 320 } },
      { defId: 'output-text',     position: { x: 100, y: 600 } },
    ],
    edges: [
      { from: 0, to: 1 }, // trigger → main
      { from: 1, to: 2 }, // main → research
      { from: 3, to: 2 }, // search tool ⇒ прикреплён к research (attach)
      { from: 1, to: 4 }, // main → ux
      { from: 5, to: 1 }, // memory tool ⇒ прикреплён к main (attach)
      { from: 2, to: 6 }, // research → output
      { from: 4, to: 6 }, // ux → output
    ],
  },

  /* ──────────────────────────────────────────────────────── */
  /* 4. Research Agent                                        */
  /* ──────────────────────────────────────────────────────── */
  {
    id: 'research',
    nameKey: 'builder.template.research.name',
    descKey: 'builder.template.research.desc',
    inputKey: 'builder.template.research.input',
    outputKey: 'builder.template.research.output',
    iconName: 'compass',
    difficulty: 'intermediate',
    category: 'research',
    author: 'builtin',
    nodes: [
      { defId: 'trigger-input',   position: { x: 100, y: 50 } },
      { defId: 'agent-main',      position: { x: 100, y: 180 } },
      { defId: 'tool-search',     position: { x: -150, y: 320 } },
      { defId: 'tool-file',       position: { x: 0, y: 320 } },
      { defId: 'agent-research',  position: { x: 150, y: 320 } },
      { defId: 'agent-analytics', position: { x: 320, y: 320 } },
      { defId: 'output-text',     position: { x: 100, y: 500 } },
    ],
    edges: [
      { from: 0, to: 1 }, // trigger → main
      { from: 2, to: 1 }, // search tool ⇒ прикреплён к main (attach)
      { from: 3, to: 1 }, // file tool ⇒ прикреплён к main (attach)
      { from: 1, to: 4 }, // main → research
      { from: 4, to: 5 }, // research → analytics
      { from: 5, to: 6 }, // analytics → output
    ],
  },
];

/**
 * Получить template по id, null если не найдено.
 */
export function getTemplate(id) {
  return TEMPLATES.find(t => t.id === id) || null;
}

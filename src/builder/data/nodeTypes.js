/**
 * nodeTypes.js — определения типов узлов в Builder.
 *
 * Используется в:
 *  • Toolbox panel (палитра, откуда drag)
 *  • Canvas (custom nodeTypes для React Flow)
 *  • Sidebar (показывает details выбранного)
 *
 * Каждое определение:
 *  • id            — uniq для drag-drop dataTransfer
 *  • kind          — 'agent' | 'tool' | 'trigger' | 'output' (категория)
 *  • role          — для agents: subtype (main / research / ux / analytics)
 *  • icon          — name из Atlas Icon registry
 *  • color         — accent для node стиля (CSS-var-aware)
 *  • labelKey      — i18n ключ для названия (builder.node.*)
 *  • descKey       — i18n ключ для описания (sidebar / tooltip)
 *  • atlasAnchor   — id Atlas узла для «Learn more» (см. ai-education-designer skill)
 *
 * Чтобы добавить новый тип:
 *  1. Добавь сюда entry
 *  2. Добавь i18n keys в src/locales/{ru,en,fi}/ui.json под builder.node.*
 *  3. Добавь в TOOLBOX_GROUPS если нужен в палитре
 */

export const NODE_DEFS = {
  // ────────── Agents ──────────
  'agent-main': {
    kind: 'agent',
    role: 'main',
    icon: 'brain',
    color: '#2563eb',
    labelKey: 'builder.node.agent_main',
    descKey: 'builder.node.agent_main_desc',
    atlasAnchor: 'agents',
  },
  'agent-research': {
    kind: 'agent',
    role: 'research',
    icon: 'search',
    color: '#7c3aed',
    labelKey: 'builder.node.agent_research',
    descKey: 'builder.node.agent_research_desc',
    atlasAnchor: 'ag-research',
  },
  'agent-ux': {
    kind: 'agent',
    role: 'ux',
    icon: 'paint',
    color: '#db2777',
    labelKey: 'builder.node.agent_ux',
    descKey: 'builder.node.agent_ux_desc',
    atlasAnchor: 'ag-ux',
  },
  'agent-analytics': {
    kind: 'agent',
    role: 'analytics',
    icon: 'chart',
    color: '#059669',
    labelKey: 'builder.node.agent_analytics',
    descKey: 'builder.node.agent_analytics_desc',
    atlasAnchor: 'sc-analysis',
  },

  // ────────── Tools ──────────
  'tool-search': {
    kind: 'tool',
    role: 'web_search',
    icon: 'globe',
    color: '#0ea5e9',
    labelKey: 'builder.node.tool_search',
    descKey: 'builder.node.tool_search_desc',
    atlasAnchor: 'cap-search',
  },
  'tool-file': {
    kind: 'tool',
    role: 'file_read',
    icon: 'file',
    color: '#0ea5e9',
    labelKey: 'builder.node.tool_file',
    descKey: 'builder.node.tool_file_desc',
    atlasAnchor: 'cap-files',
  },
  'tool-vision': {
    kind: 'tool',
    role: 'vision',
    icon: 'eye',
    color: '#0ea5e9',
    labelKey: 'builder.node.tool_vision',
    descKey: 'builder.node.tool_vision_desc',
    atlasAnchor: 'cap-vision',
  },
  'tool-memory': {
    kind: 'tool',
    role: 'memory',
    icon: 'brain',
    color: '#0ea5e9',
    labelKey: 'builder.node.tool_memory',
    descKey: 'builder.node.tool_memory_desc',
    atlasAnchor: 'cap-memory',
  },

  // ────────── Flow ──────────
  'trigger-input': {
    kind: 'trigger',
    role: 'user_input',
    icon: 'flash',
    color: '#f59e0b',
    labelKey: 'builder.node.trigger_input',
    descKey: 'builder.node.trigger_input_desc',
    atlasAnchor: 'sys-workflows-basics',
  },
  'output-text': {
    kind: 'output',
    role: 'markdown',
    icon: 'note',
    color: '#64748b',
    labelKey: 'builder.node.output_text',
    descKey: 'builder.node.output_text_desc',
    atlasAnchor: 'sys-workflows-basics',
  },
};

/**
 * Toolbox grouping — порядок в палитре левой панели.
 */
export const TOOLBOX_GROUPS = [
  {
    id: 'agents',
    labelKey: 'builder.toolbox.agents',
    items: ['agent-main', 'agent-research', 'agent-ux', 'agent-analytics'],
  },
  {
    id: 'tools',
    labelKey: 'builder.toolbox.tools',
    items: ['tool-search', 'tool-file', 'tool-vision', 'tool-memory'],
  },
  {
    id: 'flow',
    labelKey: 'builder.toolbox.flow',
    items: ['trigger-input', 'output-text'],
  },
];

/**
 * Получить def по id; null если не найдено.
 */
export function getNodeDef(defId) {
  return NODE_DEFS[defId] || null;
}

/**
 * Маппинг def.kind → React Flow nodeType key.
 */
export const KIND_TO_NODE_TYPE = {
  agent: 'agentNode',
  tool: 'toolNode',
  trigger: 'triggerNode',
  output: 'outputNode',
};

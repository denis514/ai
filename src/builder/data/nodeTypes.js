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
  'agent-code': {
    kind: 'agent',
    role: 'code',
    icon: 'developer',
    color: '#0d9488',
    labelKey: 'builder.node.agent_code',
    descKey: 'builder.node.agent_code_desc',
    atlasAnchor: 'ag-code',
  },
  'agent-designer': {
    kind: 'agent',
    role: 'designer',
    icon: 'pencil',
    color: '#c026d3',
    labelKey: 'builder.node.agent_designer',
    descKey: 'builder.node.agent_designer_desc',
    atlasAnchor: 'ag-designer',
  },
  'agent-pm': {
    kind: 'agent',
    role: 'pm',
    icon: 'clipboard',
    color: '#ea580c',
    labelKey: 'builder.node.agent_pm',
    descKey: 'builder.node.agent_pm_desc',
    atlasAnchor: 'ag-pm',
  },
  'agent-content': {
    kind: 'agent',
    role: 'content',
    icon: 'scroll',
    color: '#ca8a04',
    labelKey: 'builder.node.agent_content',
    descKey: 'builder.node.agent_content_desc',
    atlasAnchor: 'sc-content',
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
  'tool-code-exec': {
    kind: 'tool',
    role: 'code_exec',
    icon: 'terminal',
    color: '#0ea5e9',
    labelKey: 'builder.node.tool_code_exec',
    descKey: 'builder.node.tool_code_exec_desc',
    atlasAnchor: 'cap-code-exec',
  },
  'tool-computer': {
    kind: 'tool',
    role: 'computer',
    icon: 'laptop',
    color: '#0ea5e9',
    labelKey: 'builder.node.tool_computer',
    descKey: 'builder.node.tool_computer_desc',
    atlasAnchor: 'cap-computer',
  },
  'tool-citations': {
    kind: 'tool',
    role: 'citations',
    icon: 'quote',
    color: '#0ea5e9',
    labelKey: 'builder.node.tool_citations',
    descKey: 'builder.node.tool_citations_desc',
    atlasAnchor: 'cap-citations',
  },
  'tool-mcp': {
    kind: 'tool',
    role: 'mcp',
    icon: 'plug',
    color: '#0ea5e9',
    labelKey: 'builder.node.tool_mcp',
    descKey: 'builder.node.tool_mcp_desc',
    atlasAnchor: 'mcp',
  },

  // ────────── Logic (управление потоком) ──────────
  'logic-condition': {
    kind: 'logic',
    role: 'condition',
    icon: 'branch',
    color: '#f59e0b',
    labelKey: 'builder.node.condition',
    descKey: 'builder.node.condition_desc',
    atlasAnchor: 'sys-quality-gates',
  },
  'logic-condition-agent': {
    kind: 'logic',
    role: 'condition-agent',
    icon: 'sparkles',
    color: '#a855f7',
    labelKey: 'builder.node.condition_agent',
    descKey: 'builder.node.condition_agent_desc',
    atlasAnchor: 'sys-multi-agent-patterns',
  },
  'logic-loop': {
    kind: 'logic',
    role: 'loop',
    icon: 'loop',
    color: '#ea580c',
    labelKey: 'builder.node.loop',
    descKey: 'builder.node.loop_desc',
    atlasAnchor: 'sys-loop-patterns',
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
    singleton: true, // «Старт» — единственная точка входа: только один на схему
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
  'output-telegram': {
    kind: 'output',
    role: 'telegram',
    icon: 'send',
    color: '#0088cc',
    labelKey: 'builder.node.output_telegram',
    descKey: 'builder.node.output_telegram_desc',
    atlasAnchor: 'sys-api-patterns',
  },
  'output-email': {
    kind: 'output',
    role: 'email',
    icon: 'mail',
    color: '#d97757',
    labelKey: 'builder.node.output_email',
    descKey: 'builder.node.output_email_desc',
    atlasAnchor: 'sys-api-patterns',
  },
  'output-calendar': {
    kind: 'output',
    role: 'calendar',
    icon: 'calendar',
    color: '#4285f4',
    labelKey: 'builder.node.output_calendar',
    descKey: 'builder.node.output_calendar_desc',
    atlasAnchor: 'sys-api-patterns',
  },
};

/**
 * Toolbox grouping — порядок в палитре левой панели.
 */
export const TOOLBOX_GROUPS = [
  {
    id: 'agents',
    labelKey: 'builder.toolbox.agents',
    items: ['agent-main', 'agent-research', 'agent-ux', 'agent-analytics', 'agent-code', 'agent-designer', 'agent-pm', 'agent-content'],
  },
  {
    id: 'tools',
    labelKey: 'builder.toolbox.tools',
    items: ['tool-search', 'tool-file', 'tool-vision', 'tool-memory', 'tool-code-exec', 'tool-computer', 'tool-citations', 'tool-mcp'],
  },
  {
    id: 'logic',
    labelKey: 'builder.toolbox.logic',
    items: ['logic-condition', 'logic-condition-agent', 'logic-loop'],
  },
  {
    id: 'flow',
    labelKey: 'builder.toolbox.flow',
    // 'trigger-input' (Старт) вынесен в отдельную CTA-кнопку наверху палитры.
    items: ['output-text', 'output-telegram', 'output-email', 'output-calendar'],
  },
];

/**
 * Получить def по id; null если не найдено.
 */
export function getNodeDef(defId) {
  return NODE_DEFS[defId] || null;
}

/**
 * Есть ли у узла окно настройки (ввод данных/текста), которое нужно открыть
 * автоматически при попадании на холст. Узлы-способности без данных
 * (веб-поиск, память, цитаты, запуск кода, управление, Markdown-выход) — false.
 * @param {object} def — запись NODE_DEFS
 * @returns {boolean}
 */
export function hasConfigPanel(def) {
  if (!def) return false;
  if (def.kind === 'agent') return true;        // инструкция агенту
  if (def.kind === 'trigger') return true;      // задача (Старт)
  if (def.kind === 'logic') return true;        // условие / условие-агент / цикл
  // Выходы и инструменты с настройкой данных:
  return ['telegram', 'email', 'calendar', 'mcp', 'file_read', 'vision'].includes(def.role);
}

/**
 * Можно ли добавить ещё один такой узел на холст.
 * Singleton-узлы (например «Старт») допускаются в единственном экземпляре.
 * @param {string} defId
 * @param {Array} nodes — текущие узлы холста (с data.defId)
 * @returns {boolean}
 */
export function canAddNode(defId, nodes = []) {
  const def = NODE_DEFS[defId];
  if (!def) return false;
  if (!def.singleton) return true;
  return !nodes.some(n => n.data?.defId === defId);
}

/**
 * Маппинг def.kind → React Flow nodeType key.
 */
export const KIND_TO_NODE_TYPE = {
  agent: 'agentNode',
  tool: 'toolNode',
  trigger: 'triggerNode',
  output: 'outputNode',
  logic: 'conditionNode',
};

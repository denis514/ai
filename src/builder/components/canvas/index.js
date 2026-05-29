/**
 * canvas/index.js — barrel для React Flow nodeTypes map.
 *
 * Все 4 kind узлов используют один BaseNode component с разным CSS-классом
 * (через kind в data). Это упрощает поддержку и снижает bundle size.
 *
 * Регистрация в React Flow:
 *   <ReactFlow nodeTypes={nodeTypes} ... />
 */

import BaseNode from './BaseNode.jsx';

export const nodeTypes = {
  agentNode: BaseNode,
  toolNode: BaseNode,
  triggerNode: BaseNode,
  outputNode: BaseNode,
  conditionNode: BaseNode,
};

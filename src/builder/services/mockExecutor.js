/**
 * mockExecutor.js — симуляция выполнения workflow без реальных API calls.
 *
 * Phase B-1 Day 17-18.
 * Phase B-2 заменит это на real execution через Edge Functions.
 *
 * Pipeline:
 *  1. buildExecutionPlan(nodes, edges) → topologically sorted list
 *  2. executeStep(node) → status idle→running (1-3s)→completed (or failed)
 *  3. Generates fake logs за каждый step
 *  4. 5% random failure rate per node
 *
 * API:
 *  • createExecution({ nodes, edges, onUpdate, onLog }) — fires async
 *    returns { id, stop() }
 *  • Caller подписывается через onUpdate(nodeId, status) + onLog({...})
 *
 * Все timings — mock. Real production использует Anthropic API call latency.
 */

const FAILURE_RATE = 0.05; // 5% nodes сбоят в demo для реалистичности
const STEP_MIN_MS = 800;
const STEP_MAX_MS = 2400;

let execIdCounter = 1;

/**
 * Build topological order of execution.
 *
 * @param {Array} nodes — React Flow nodes
 * @param {Array} edges — React Flow edges
 * @returns {Array<string>} — node IDs в порядке execution
 */
export function buildExecutionPlan(nodes, edges) {
  const nodeIds = new Set(nodes.map(n => n.id));
  // Build adjacency и in-degree
  const inDegree = new Map();
  const dependents = new Map();
  nodeIds.forEach(id => {
    inDegree.set(id, 0);
    dependents.set(id, []);
  });
  edges.forEach(e => {
    if (nodeIds.has(e.source) && nodeIds.has(e.target)) {
      inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
      dependents.get(e.source).push(e.target);
    }
  });
  // Kahn's algorithm
  const queue = [];
  inDegree.forEach((deg, id) => {
    if (deg === 0) queue.push(id);
  });
  const order = [];
  while (queue.length) {
    const id = queue.shift();
    order.push(id);
    dependents.get(id).forEach(next => {
      inDegree.set(next, inDegree.get(next) - 1);
      if (inDegree.get(next) === 0) queue.push(next);
    });
  }
  // Если order.length < nodes.length — есть cycle.
  // Остальные nodes добавим в конец (они не run, но не теряем).
  if (order.length < nodes.length) {
    nodes.forEach(n => {
      if (!order.includes(n.id)) order.push(n.id);
    });
  }
  return order;
}

/* ────────── Fake log generators per kind/role ────────── */

const LOG_TEMPLATES = {
  trigger: {
    start: ['Receiving user input...', 'Parsing trigger payload...'],
    progress: ['Validating input schema...', 'Forwarding to main agent...'],
    done: ['Input forwarded successfully.', 'Trigger complete.'],
  },
  agent: {
    main: {
      start: ['Orchestrator initialized.', 'Parsing task description...', 'Planning execution strategy...'],
      progress: ['Delegating to sub-agents...', 'Tracking sub-agent progress...', 'Waiting on parallel branches...'],
      done: ['All sub-agents completed.', 'Synthesizing final output...', 'Orchestration complete.'],
    },
    research: {
      start: ['Search initialized.', 'Building query plan...', 'Analyzing scope...'],
      progress: ['Querying web sources...', 'Filtering by relevance...', 'Cross-referencing sources...', 'Validating credibility...'],
      done: ['Research complete. 12 sources gathered.', '8 high-relevance findings extracted.', 'Returning structured output.'],
    },
    ux: {
      start: ['UX agent online.', 'Loading heuristic checklist...', 'Preparing evaluation framework...'],
      progress: ['Scanning UI elements...', 'Checking accessibility WCAG 2.1 AA...', 'Detecting friction points...', 'Cross-referencing best practices...'],
      done: ['UX audit complete.', '3 critical issues found.', '7 recommendations generated.'],
    },
    analytics: {
      start: ['Analytics agent online.', 'Loading dataset...', 'Detecting schema...'],
      progress: ['Running statistical analysis...', 'Detecting anomalies...', 'Comparing to baseline...', 'Generating insights...'],
      done: ['Analytics complete.', '4 trend patterns identified.', '2 anomalies flagged for review.'],
    },
  },
  tool: {
    web_search: {
      start: ['Connecting to search backend...'],
      progress: ['Fetching results...', 'Reranking by relevance...'],
      done: ['Search complete. 10 results retrieved.'],
    },
    file_read: {
      start: ['Reading attached files...'],
      progress: ['Parsing PDF structure...', 'Extracting tables...', 'OCR pass on images...'],
      done: ['File extraction complete.'],
    },
    vision: {
      start: ['Vision tool initialized.'],
      progress: ['Analyzing image regions...', 'Detecting UI elements...'],
      done: ['Vision analysis complete.'],
    },
    memory: {
      start: ['Loading memory store...'],
      progress: ['Querying past interactions...', 'Retrieving context...'],
      done: ['Memory context loaded.'],
    },
  },
  output: {
    start: ['Formatting output...'],
    progress: ['Rendering Markdown...', 'Applying brand voice...'],
    done: ['Output ready.', '✓ Workflow finished successfully.'],
  },
};

/**
 * Получить набор log templates для node.
 */
function getLogPack(node) {
  const { kind, role } = node.data || {};
  if (kind === 'agent' && LOG_TEMPLATES.agent[role]) return LOG_TEMPLATES.agent[role];
  if (kind === 'tool' && LOG_TEMPLATES.tool[role]) return LOG_TEMPLATES.tool[role];
  if (kind === 'trigger') return LOG_TEMPLATES.trigger;
  if (kind === 'output') return LOG_TEMPLATES.output;
  // Fallback
  return {
    start: ['Initializing...'],
    progress: ['Processing...'],
    done: ['Complete.'],
  };
}

/* ────────── Public API ────────── */

/**
 * Создать execution.
 *
 * @param {Object} opts
 *   • nodes, edges    — Reactflow data
 *   • onUpdate(id,st) — node status change callback ('running' | 'completed' | 'failed')
 *   • onLog({level,nodeId,nodeName,message,ts}) — log emit
 *   • onComplete()    — workflow finished (regardless success/fail)
 *
 * @returns { id, stop }
 */
export function createExecution({ nodes, edges, onUpdate, onLog, onComplete }) {
  const id = `exec-${execIdCounter++}-${Date.now()}`;
  const plan = buildExecutionPlan(nodes, edges);
  let stopped = false;
  const startTs = Date.now();

  // Helper для emitting log с timestamp
  const log = (level, nodeId, nodeName, message) => {
    if (!onLog) return;
    onLog({
      level,
      nodeId,
      nodeName,
      message,
      ts: Date.now() - startTs,
    });
  };

  log('info', null, null, `Execution ${id} started. ${plan.length} nodes queued.`);

  // Last node failure cascades: остальные skipped
  let cascadeSkip = false;

  (async () => {
    for (const nodeId of plan) {
      if (stopped) break;

      const node = nodes.find(n => n.id === nodeId);
      if (!node) continue;
      const nodeName = (node.data?.labelKey || node.id).replace(/^builder\.node\./, '');

      if (cascadeSkip) {
        log('warn', nodeId, nodeName, 'Skipped (upstream failure).');
        onUpdate?.(nodeId, 'idle');
        continue;
      }

      // Set running
      onUpdate?.(nodeId, 'running');
      const pack = getLogPack(node);

      // Start logs
      const startMsg = pickRandom(pack.start);
      log('info', nodeId, nodeName, startMsg);

      // Progress logs (1-3 шт)
      const progressCount = 1 + Math.floor(Math.random() * Math.min(3, pack.progress.length));
      for (let i = 0; i < progressCount; i++) {
        if (stopped) break;
        await sleep(STEP_MIN_MS / 3 + Math.random() * (STEP_MAX_MS / 3));
        log('info', nodeId, nodeName, pickRandom(pack.progress));
      }

      if (stopped) break;

      // Decide success/fail
      const failed = Math.random() < FAILURE_RATE && (node.data?.kind !== 'trigger' && node.data?.kind !== 'output');

      // Final delay
      await sleep(STEP_MIN_MS / 2 + Math.random() * (STEP_MAX_MS / 2));

      if (failed) {
        log('error', nodeId, nodeName, 'Execution failed: simulated error for demo purposes.');
        onUpdate?.(nodeId, 'failed');
        cascadeSkip = true;
      } else {
        log('success', nodeId, nodeName, pickRandom(pack.done));
        onUpdate?.(nodeId, 'completed');
      }
    }

    if (!stopped) {
      const finalLevel = cascadeSkip ? 'error' : 'success';
      const finalMsg = cascadeSkip
        ? `Execution ${id} aborted due to node failure.`
        : `Execution ${id} completed. Total time: ${((Date.now() - startTs) / 1000).toFixed(1)}s.`;
      log(finalLevel, null, null, finalMsg);
    } else {
      log('warn', null, null, `Execution ${id} stopped by user.`);
    }

    onComplete?.();
  })();

  return {
    id,
    stop: () => { stopped = true; },
  };
}

/* ────────── Utilities ────────── */

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

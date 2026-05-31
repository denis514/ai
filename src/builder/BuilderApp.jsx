import React, { useCallback, useState, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  NodeToolbar,
  Position,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import Icon from '../components/Icon.jsx';
import { useT, useLocale } from '../i18n/LocaleContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { NODE_DEFS, TOOLBOX_GROUPS, getNodeDef, KIND_TO_NODE_TYPE } from './data/nodeTypes.js';
import { nodeTypes } from './components/canvas/index.js';
import NodePalette from './components/canvas/NodePalette.jsx';
import ConnectionLine from './components/canvas/ConnectionLine.jsx';
import BuilderEdge from './components/canvas/BuilderEdge.jsx';
import ConceptTooltip from './components/education/ConceptTooltip.jsx';
import AtlasNodePreview from './components/education/AtlasNodePreview.jsx';
import BuilderTour, { isTourSeen } from './components/education/BuilderTour.jsx';
import TemplateGallery from './components/panels/TemplateGallery.jsx';
import TemplatePreview from './components/panels/TemplatePreview.jsx';
import ExecutionPanel from './components/panels/ExecutionPanel.jsx';
import WorkflowSwitcher from './components/panels/WorkflowSwitcher.jsx';
import RecentWorkflows from './components/panels/RecentWorkflows.jsx';
import ApiKeysModal from './components/panels/ApiKeysModal.jsx';
import AuthModal from '../components/AuthModal.jsx';
import { TEMPLATES } from './data/templates.js';
import { OUTPUT_TIERS, DEFAULT_TIER, estimateRun, countAgentNodes } from './data/outputTiers.js';
import { templateForRole } from './data/rolePrompts.js';
import { createExecution } from './services/mockExecutor.js';
import { createRealExecution } from './services/realExecutor.js';
import { getKeyStatus } from './services/apiKeyService.js';
import { saveWorkflow as storageSave, loadWorkflow as storageLoad } from './services/workflowStorage.js';
import { historyBridge } from './services/historyBridge.js';
import ToastHost, { toast } from './components/Toast.jsx';
import { saveDraft, loadDraft, clearDraft } from './services/draftBackup.js';
import { evaluateConnection, validateGraph, denyReasonKey } from './services/connectionRules.js';
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

// Синхронизация счётчика id с уже существующими узлами (после загрузки схемы
// из БД/localStorage). Без этого genNodeId() выдаёт id вида n1/n2…, которые
// СОВПАДАЮТ с id загруженных узлов → новый узел «наезжает» на существующий.
function syncNodeIdCounter(nodes) {
  let max = 0;
  for (const n of nodes || []) {
    const m = /^n(\d+)$/.exec(n?.id || '');
    if (m) max = Math.max(max, Number(m[1]));
  }
  if (nodeIdCounter <= max) nodeIdCounter = max + 1;
}

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
    type: 'builder',
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

// Кастомный тип связи — градиент + анимированный пунктир, без стрелки.
const edgeTypes = { builder: BuilderEdge };

/**
 * Уровни очерёдности выполнения (топологическая глубина). Узлы без входящих
 * связей = уровень 1; уровень узла = max(уровни источников) + 1. Узлы одного
 * уровня выполняются параллельно. Возвращает Map(client_id → level).
 */
function computeOrderLevels(nodes, edges) {
  const incoming = new Map(nodes.map(n => [n.id, []]));
  for (const e of edges) {
    if (incoming.has(e.target)) incoming.get(e.target).push(e.source);
  }
  const level = new Map();
  const visiting = new Set();
  const compute = (id) => {
    if (level.has(id)) return level.get(id);
    if (visiting.has(id)) return 1; // цикл — обрываем
    visiting.add(id);
    const srcs = incoming.get(id) || [];
    const lvl = srcs.length === 0 ? 1 : Math.max(...srcs.map(compute)) + 1;
    visiting.delete(id);
    level.set(id, lvl);
    return lvl;
  };
  for (const n of nodes) compute(n.id);
  return level;
}

function BuilderApp() {
  return (
    <ReactFlowProvider>
      <BuilderAppInner />
    </ReactFlowProvider>
  );
}

function BuilderAppInner() {
  const t = useT();
  const { locale } = useLocale();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [toolboxOpen, setToolboxOpen] = useState(true);
  const [toolboxTab, setToolboxTab] = useState('nodes'); // 'nodes' | 'templates'
  // Ширина левой панели (px) — тянется за правый край, сохраняется в браузере.
  const [toolboxW, setToolboxW] = useState(() => {
    const v = parseInt(localStorage.getItem('atlas:builder:toolbox-w') || '', 10);
    return v >= 200 && v <= 460 ? v : 240;
  });
  const startToolboxResize = useCallback((e) => {
    e.preventDefault();
    const onMove = (ev) => {
      const w = Math.min(Math.max(ev.clientX, 200), 460); // от левого края окна
      setToolboxW(w);
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      setToolboxW(w => { try { localStorage.setItem('atlas:builder:toolbox-w', String(w)); } catch { /* noop */ } return w; });
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.body.style.cursor = 'col-resize';
  }, []);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [execPanelOpen, setExecPanelOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [previewTplIndex, setPreviewTplIndex] = useState(null); // превью шаблона из левого списка
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
  // Намерение окна имени: 'create' — новый workflow (холст можно очистить),
  // 'save' — дать имя ТЕКУЩЕМУ холсту и сохранить его (НЕ стирать). Критично:
  // раньше «Сохранить» дёргало startBlank и теряло собранную схему.
  const [nameIntent, setNameIntent] = useState('create');
  const [keysModalOpen, setKeysModalOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  // Реальный запуск (B-2.2)
  const [runMode, setRunMode] = useState('mock');     // 'mock' | 'real'
  const [keyConnected, setKeyConnected] = useState(false);
  const [telegramConnected, setTelegramConnected] = useState(false);
  const [runInput, setRunInput] = useState('');
  // Переменные для переиспользуемых схем: {{ключ}} в задаче/инструкциях → значение.
  const [runVars, setRunVars] = useState([]); // [{ key, value }]
  // Намерение «Реально» переживает перезагрузку страницы (вход через
  // Google/magic-link = редирект). Храним в sessionStorage.
  const REAL_INTENT_KEY = 'atlas:builder:real-intent';
  const [realIntent, setRealIntent] = useState(() => {
    try { return sessionStorage.getItem(REAL_INTENT_KEY) === '1'; } catch { return false; }
  });
  const [realConfirmOpen, setRealConfirmOpen] = useState(false); // окно «осторожно, реальный режим»
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [validation, setValidation] = useState(null); // { errors:[], warnings:[] } перед реальным запуском
  const [outputTier, setOutputTier] = useState(DEFAULT_TIER);    // 's' | 'm' | 'l'
  const [execResult, setExecResult] = useState(null);            // { output, tokensUsed } реального запуска
  // Счётчик версии списка workflow — бампается при save/delete, чтобы
  // «Недавние» в центре экрана и список в dropdown пере-загружались.
  const [wfVersion, setWfVersion] = useState(0);
  const isDirtyRef = useRef(false);
  const saveTimerRef = useRef(null);
  const savedResetTimerRef = useRef(null); // авто-возврат кнопки «Сохранено» → «Сохранить»
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

  // L1-страховка: непрерывный черновик холста в браузере (debounce 1.5с).
  // Переживает перезагрузку/краш ДО облачного сохранения. См. docs 13.
  const draftTimerRef = useRef(null);
  useEffect(() => {
    if (nodes.length === 0 && edges.length === 0) return;
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(() => {
      saveDraft({ workflowId: currentWorkflowId, name: workflowName, nodes, edges });
    }, 1500);
    return () => { if (draftTimerRef.current) clearTimeout(draftTimerRef.current); };
  }, [nodes, edges, currentWorkflowId, workflowName]);

  // Предупреждение браузера ПЕРЕД перезагрузкой/закрытием, если есть
  // несохранённая работа — чтобы не сбросить молча. Кнопки в этом окне рисует
  // сам браузер; «Отмена» = остаться и сохранить.
  const unsavedRef = useRef(false);
  useEffect(() => { unsavedRef.current = isDirtyRef.current && nodes.length > 0; });
  useEffect(() => {
    const h = (e) => { if (unsavedRef.current) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, []);

  // На возврате: если осталась НЕсохранённая работа (черновик с узлами без id) —
  // предлагаем решить: «Сохранить под именем» или «Сбросить». Без пассивного
  // «восстановить» (бессмысленно: не сохранил при обновлении — теряешь).
  const [draftOffer, setDraftOffer] = useState(null);
  useEffect(() => {
    const d = loadDraft();
    if (d && d.nodes.length > 0 && !d.workflowId) setDraftOffer(d);
    // один раз на маунт
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // «Сохранить»: возвращаем черновик на холст и сразу открываем окно имени (save).
  const keepDraftAndName = useCallback(() => {
    if (!draftOffer) return;
    skipDirtyRef.current = true;
    syncNodeIdCounter(draftOffer.nodes);
    setNodes(draftOffer.nodes);
    setEdges(draftOffer.edges || []);
    setNameDraft(draftOffer.name || '');
    setDraftOffer(null);
    setNameIntent('save');
    setNameModalStep('name');
    setNameModalOpen(true);
  }, [draftOffer, setNodes, setEdges]);
  // «Сбросить»: чистим черновик, холст остаётся пустым.
  const dismissDraft = useCallback(() => { clearDraft(); setDraftOffer(null); }, []);

  // Заливка узла User Input, когда в задаче есть текст. hasInput — runtime-флаг
  // (не персистится). skipDirtyRef, чтобы ввод задачи не помечал схему «изменённой».
  useEffect(() => {
    const has = !!runInput.trim();
    setNodes(nds => {
      let changed = false;
      const next = nds.map(n => {
        if (n.data?.kind !== 'trigger') return n;
        if (!!n.data.hasInput === has) return n;
        changed = true;
        return { ...n, data: { ...n.data, hasInput: has } };
      });
      if (changed) skipDirtyRef.current = true;
      return changed ? next : nds;
    });
  }, [runInput, setNodes]);

  // Номера очерёдности на узлах. Пересчитываем при изменении структуры
  // (набор узлов/связей), не при перетаскивании. Guarded — без лупа.
  const structSig = nodes.map(n => n.id).join(',') + '|' + edges.map(e => `${e.source}>${e.target}`).join(',');
  useEffect(() => {
    const levels = computeOrderLevels(nodes, edges);
    const hasOutgoing = new Set(edges.map(e => e.source));
    const hasIncoming = new Set(edges.map(e => e.target));
    setNodes(nds => {
      let changed = false;
      const multi = nds.length > 1;
      const next = nds.map(n => {
        const lvl = levels.get(n.id) ?? null;
        // Несоединённые порты пульсируют волнами — подсказка «тяни отсюда».
        const unlinkedOut = n.data?.kind !== 'output' && !hasOutgoing.has(n.id) && multi;
        const unlinkedIn = n.data?.kind !== 'trigger' && !hasIncoming.has(n.id) && multi;
        if (n.data?.orderLevel !== lvl || n.data?.unlinkedOut !== unlinkedOut || n.data?.unlinkedIn !== unlinkedIn) {
          changed = true;
          return { ...n, data: { ...n.data, orderLevel: lvl, unlinkedOut, unlinkedIn } };
        }
        return n;
      });
      return changed ? next : nds;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structSig]);

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
      // Через ~2.5с вернуть кнопку в исходное «Сохранить» (если ничего не меняли).
      if (savedResetTimerRef.current) clearTimeout(savedResetTimerRef.current);
      savedResetTimerRef.current = setTimeout(() => {
        setSaveStatus(s => (s === 'saved' ? 'idle' : s));
      }, 2500);
      clearDraft(); // сохранили в облако → черновик-страховка больше не нужен
      setWfVersion(v => v + 1); // список изменился → обновить «Недавние»/dropdown
    } catch (e) {
      console.error('[Builder] save failed', e);
      setSaveStatus('error');
      toast.error(t('builder.toast.saveFailed') || 'Не удалось сохранить схему. Попробуйте ещё раз.');
    }
  }, [nodes, edges, currentWorkflowId, userId]);

  // Сохранение (manual + auto). Если имени нет — запрашиваем через модалку.
  // Сохраняем даже пустой холст, если имя задано (это валидный черновик).
  const doSave = useCallback(async () => {
    const name = workflowName.trim();
    if (!name) {
      setNameDraft('');
      setNameModalStep('name');
      setNameIntent('save'); // дать имя ТЕКУЩЕМУ холсту, не стирая
      setNameModalOpen(true); // спросить имя перед первым сохранением
      return;
    }
    await persist(name);
  }, [workflowName, persist]);

  // Подтверждение имени в окне: ветвимся по намерению. Для 'save' сохраняем
  // ТЕКУЩИЙ холст (persist берёт actual nodes/edges), для 'create' — startBlank.
  const confirmName = useCallback(() => {
    const name = nameDraft.trim();
    if (!name) return;
    if (nameIntent === 'save') {
      setNameModalOpen(false);
      setNameModalStep('name');
      persist(name);
    } else {
      startBlank();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameDraft, nameIntent, persist]);

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

  // Авто-сохранение в облако: debounce ~2.5с после ПОСЛЕДНЕГО изменения
  // (а не раз в 30с — иначе между тиками работа терялась). Срабатывает только
  // если у схемы есть имя (без имени — только черновик-страховка) и есть узлы.
  // Каждое изменение сбрасывает таймер → сохраняем, когда пользователь замер.
  useEffect(() => {
    if (!workflowName.trim() || nodes.length === 0 || !isDirtyRef.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      if (isDirtyRef.current) persist(workflowName.trim());
    }, 2500);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [nodes, edges, workflowName, persist]);

  // Если не авторизован — сразу окно входа; иначе окно ключей.
  const openKeysOrAuth = useCallback(() => {
    if (!user) setAuthOpen(true);
    else setKeysModalOpen(true);
  }, [user]);

  // Запрос реального режима когда он заблокирован: запоминаем намерение и ведём
  // ко входу/ключу. После того как вход+ключ готовы — авто-переход (эффект ниже).
  const requestRealMode = useCallback(() => {
    setRealIntent(true);
    try { sessionStorage.setItem(REAL_INTENT_KEY, '1'); } catch { /* noop */ }
    openKeysOrAuth();
  }, [openKeysOrAuth]);

  // Проверка подключённого ключа. Перечитываем при монтировании, закрытии
  // модалки ключей И при смене пользователя (после входа).
  useEffect(() => {
    let alive = true;
    getKeyStatus('anthropic')
      .then(s => { if (alive) setKeyConnected(!!s.connected); })
      .catch(() => { if (alive) setKeyConnected(false); });
    getKeyStatus('telegram')
      .then(s => { if (alive) setTelegramConnected(!!s.connected); })
      .catch(() => { if (alive) setTelegramConnected(false); });
    return () => { alive = false; };
  }, [keysModalOpen, user]);

  // Если ключ отключили — принудительно вернуть демо-режим.
  useEffect(() => {
    if (!keyConnected && runMode === 'real') setRunMode('mock');
  }, [keyConnected, runMode]);

  // В реальном режиме сразу показываем панель выполнения — там поле задачи.
  useEffect(() => {
    if (runMode === 'real') setExecPanelOpen(true);
  }, [runMode]);

  // Авто-переход в реальный режим после того, как пользователь вошёл и ключ есть
  // (он жал «Реально» раньше). Показываем предупреждающее окно.
  useEffect(() => {
    if (!realIntent || !user) return;
    if (keyConnected) {
      setRunMode('real');
      setRealConfirmOpen(true);
      setRealIntent(false);
      try { sessionStorage.removeItem(REAL_INTENT_KEY); } catch { /* noop */ }
    } else {
      // Вошёл, но ключа нет — ведём подключать.
      setKeysModalOpen(true);
    }
  }, [realIntent, user, keyConnected]);

  // Загрузка существующего workflow по id.
  const handleLoadWorkflow = useCallback(async (wfId) => {
    try {
      const wf = await storageLoad(wfId, userId, EDGE_STYLE);
      if (!wf) return;
      skipDirtyRef.current = true;
      syncNodeIdCounter(wf.nodes); // не дать новым id столкнуться с загруженными
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
      toast.error(t('builder.toast.loadFailed') || 'Не удалось открыть схему.');
    }
  }, [userId, setNodes, setEdges, t]);

  // Новый пустой workflow — сразу спрашиваем имя.
  // «Новый workflow» — открываем модалку выбора. Холст НЕ трогаем до того,
  // как пользователь подтвердит (Чистый / Из шаблона). Отмена ничего не теряет.
  const handleNewWorkflow = useCallback(() => {
    setSwitcherOpen(false);
    setNameDraft('');
    setNameModalStep('name');
    setNameIntent('create'); // новый workflow (холст можно очистить)
    setNameModalOpen(true);
  }, []);

  const selectedNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) : null;
  const selectedAgentNode = selectedNode && selectedNode.data?.kind === 'agent' ? selectedNode : null;
  const selectedTelegramNode = selectedNode && selectedNode.data?.role === 'telegram' ? selectedNode : null;
  const selectedConditionNode = selectedNode && selectedNode.data?.kind === 'logic' && selectedNode.data?.role !== 'loop' ? selectedNode : null;
  const selectedLoopNode = selectedNode && selectedNode.data?.role === 'loop' ? selectedNode : null;
  const selectedTriggerNode = selectedNode && selectedNode.data?.kind === 'trigger' ? selectedNode : null;

  // Удалить узел кнопкой (надёжно, без зависимости от фокуса/клавиш).
  const handleDeleteNode = useCallback((nodeId) => {
    pushHistoryRef.current?.();
    setNodes(nds => nds.filter(n => n.id !== nodeId));
    setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
    setSelectedNodeId(null);
  }, [setNodes, setEdges]);

  // Дублировать узел вместе с инструкцией (со смещением).
  const handleDuplicateNode = useCallback((nodeId) => {
    setNodes(nds => {
      const src = nds.find(n => n.id === nodeId);
      if (!src) return nds;
      pushHistoryRef.current?.();
      const copy = {
        ...src,
        id: genNodeId(),
        position: { x: (src.position?.x || 0) + 40, y: (src.position?.y || 0) + 40 },
        selected: false,
        data: { ...src.data, status: 'idle', orderLevel: undefined },
      };
      return nds.concat(copy);
    });
  }, [setNodes]);

  // Задать/обновить инструкцию узла (data.prompt + флаг hasPrompt для значка).
  const handleSetPrompt = useCallback((nodeId, value) => {
    setNodes(nds => nds.map(n =>
      n.id === nodeId
        ? { ...n, data: { ...n.data, prompt: value, hasPrompt: !!value.trim() } }
        : n
    ));
  }, [setNodes]);

  // Задать chatId для Telegram-выхода (сохраняется в config через сериализатор).
  const handleSetChatId = useCallback((nodeId, value) => {
    setNodes(nds => nds.map(n =>
      n.id === nodeId ? { ...n, data: { ...n.data, chatId: value } } : n
    ));
  }, [setNodes]);

  // Настройка узла «Условие»: оператор + значение (сохраняются в config).
  const handleSetCondition = useCallback((nodeId, patch) => {
    setNodes(nds => nds.map(n =>
      n.id === nodeId ? { ...n, data: { ...n.data, ...patch } } : n
    ));
  }, [setNodes]);

  /* ────────── Undo / Redo (H1) ────────── */
  const historyRef = useRef({ past: [], future: [] });
  const pushHistoryRef = useRef(null); // мост: handlers выше используют его
  const snapshot = useCallback(
    () => ({ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }),
    [nodes, edges]
  );
  // Снимок ТЕКУЩЕГО состояния — вызывать ПЕРЕД мутацией.
  const pushHistory = useCallback(() => {
    const h = historyRef.current;
    h.past.push(snapshot());
    if (h.past.length > 50) h.past.shift();
    h.future = [];
  }, [snapshot]);
  pushHistoryRef.current = pushHistory; // мост для handlers, объявленных выше
  // Мост для BuilderEdge (кнопка «разъединить»). В effect + cleanup, чтобы не
  // оставлять глобальную ссылку на stale-замыкание после размонтирования.
  useEffect(() => {
    historyBridge.push = pushHistory;
    return () => { historyBridge.push = () => {}; };
  }, [pushHistory]);
  const [histVer, setHistVer] = useState(0); // для перерисовки кнопок
  const undo = useCallback(() => {
    const h = historyRef.current;
    if (h.past.length === 0) return;
    h.future.push(snapshot());
    const prev = h.past.pop();
    skipDirtyRef.current = true;
    setNodes(prev.nodes);
    setEdges(prev.edges);
    setSelectedNodeId(null);
    setHistVer(v => v + 1);
  }, [snapshot, setNodes, setEdges]);
  const redo = useCallback(() => {
    const h = historyRef.current;
    if (h.future.length === 0) return;
    h.past.push(snapshot());
    const next = h.future.pop();
    skipDirtyRef.current = true;
    setNodes(next.nodes);
    setEdges(next.edges);
    setSelectedNodeId(null);
    setHistVer(v => v + 1);
  }, [snapshot, setNodes, setEdges]);
  const canUndo = historyRef.current.past.length > 0;
  const canRedo = historyRef.current.future.length > 0;
  void histVer; // canUndo/canRedo пересчитываются на ререндере (histVer триггерит)

  /* ────────── Edge connection ────────── */
  // Запоминаем узел, ОТ которого пользователь потянул линию. Это и есть
  // родитель — независимо от того, выше или ниже окажется цель на холсте.
  const connectOriginRef = useRef(null);
  const [isConnecting, setIsConnecting] = useState(false);
  // Объяснение запрета связи: запоминаем последнюю причину отказа и, если связь
  // в итоге не создалась, показываем понятную подсказку (а не «молчит как Flowise»).
  const lastDenyRef = useRef(null);
  const connectMadeRef = useRef(false);
  const [connectHint, setConnectHint] = useState(null);
  const hintTimerRef = useRef(null);
  const showConnectHint = useCallback((code) => {
    const msg = t(denyReasonKey(code)) || t('builder.connect.deny.unknown') || 'Так соединить нельзя.';
    setConnectHint(msg);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    hintTimerRef.current = setTimeout(() => setConnectHint(null), 3200);
  }, [t]);
  // Живой тултип у курсора во время перетягивания связи: показывает ПРИЧИНУ,
  // как только наводишь на узел, к которому подключиться нельзя (а не после).
  // Управляем DOM напрямую (без ререндеров на каждом mousemove).
  const denyTipRef = useRef(null);
  const showDenyTip = useCallback((code) => {
    const el = denyTipRef.current;
    if (!el) return;
    el.textContent = t(denyReasonKey(code)) || t('builder.connect.deny.unknown') || 'Так соединить нельзя.';
    el.style.display = 'block';
  }, [t]);
  const hideDenyTip = useCallback(() => {
    const el = denyTipRef.current;
    if (el) el.style.display = 'none';
  }, []);

  const onConnectStart = useCallback((_evt, { nodeId }) => {
    connectOriginRef.current = nodeId;
    connectMadeRef.current = false;
    lastDenyRef.current = null;
    setIsConnecting(true);
    hideDenyTip();
  }, [hideDenyTip]);
  const onConnectEnd = useCallback(() => {
    connectOriginRef.current = null;
    setIsConnecting(false);
    hideDenyTip(); // причину уже показали вживую во время тяги
  }, [hideDenyTip]);

  // Позиционируем живой тултип за курсором, пока тянем связь.
  useEffect(() => {
    if (!isConnecting) { hideDenyTip(); return; }
    const move = (e) => {
      const el = denyTipRef.current;
      if (el) el.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 18}px)`;
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [isConnecting, hideDenyTip]);

  const onConnect = useCallback(
    (params) => {
      let { source, target, sourceHandle, targetHandle } = params;
      const origin = connectOriginRef.current;
      // В loose-режиме React Flow может назначить source/target по геометрии.
      // Делаем source = узел, ОТ которого тянули. Анимация/градиент идут от него
      // к цели — ровно так, как пользователь нарисовал линию (в любую сторону,
      // в т.ч. агент → инструмент). Семантику «инструмент↔агент = способность»
      // система понимает независимо от направления (см. connectionRules/executor).
      if (origin && target === origin && source !== origin) {
        [source, target] = [target, source];
        [sourceHandle, targetHandle] = [targetHandle, sourceHandle];
      }
      connectOriginRef.current = null;
      connectMadeRef.current = true; // связь создана — подсказку-причину не показываем
      lastDenyRef.current = null;
      pushHistory();
      setEdges(eds => addEdge(
        { ...params, source, target, sourceHandle, targetHandle, type: 'builder' },
        eds,
      ));
    },
    [setEdges, pushHistory]
  );

  // Совместимость узлов — через движок connectionRules (порты + типы связей).
  // Блокирует несовместимые пары (tool→output, →trigger, agent→tool…), дубликаты
  // и циклы в DATA-потоке. Направление нормализуем по узлу-источнику перетягивания.
  const isValidConnection = useCallback((conn) => {
    let { source, target } = conn;
    const nodeKind = Object.fromEntries(nodes.map(n => [n.id, n.data?.kind]));
    const origin = connectOriginRef.current;
    if (origin && target === origin && source !== origin) {
      [source, target] = [target, source];
    }
    // Инструмент ↔ агент: разрешаем тянуть в любую сторону (ориентируем в onConnect).
    if (nodeKind[source] === 'agent' && nodeKind[target] === 'tool') {
      [source, target] = [target, source];
    }
    const res = evaluateConnection({ source, target, nodeKind, edges });
    if (!res.ok) { lastDenyRef.current = res.code; showDenyTip(res.code); } // живой тултип
    else hideDenyTip();
    return res.ok;
  }, [nodes, edges, showDenyTip, hideDenyTip]);

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

      pushHistory();
      setNodes(nds => nds.concat(newNode));
      // Стартовый узел — сразу выделяем, чтобы рядом открылось окно задачи.
      if (def.kind === 'trigger') { setSelectedNodeId(newNode.id); setSelectedEdgeId(null); }
    },
    [screenToFlowPosition, setNodes, pushHistory]
  );

  // Клик по плитке в палитре — добавить узел в центр видимой области холста (M4).
  const addNodeAtCenter = useCallback((defId) => {
    const def = getNodeDef(defId);
    if (!def) return;
    const rect = reactFlowWrapper.current?.getBoundingClientRect();
    const screen = rect
      ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      : { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const center = screenToFlowPosition(screen);
    // Небольшой случайный сдвиг, чтобы повторные добавления не ложились стопкой.
    const jitter = () => (Math.random() - 0.5) * 60;
    const newNode = {
      id: genNodeId(),
      type: KIND_TO_NODE_TYPE[def.kind] || 'agentNode',
      position: { x: center.x + jitter(), y: center.y + jitter() },
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
    pushHistory();
    setNodes(nds => nds.concat(newNode));
    if (def.kind === 'trigger') { setSelectedNodeId(newNode.id); setSelectedEdgeId(null); }
  }, [screenToFlowPosition, setNodes, pushHistory]);

  /* ────────── Load template (из галереи) ────────── */
  const loadTemplate = useCallback((template) => {
    const { nodes: newNodes, edges: newEdges } = buildTemplateGraph(template, EDGE_STYLE);
    if (nodes.length > 0) pushHistory(); // даём откат, если на холсте уже было
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
  }, [setNodes, setEdges, t, nodes.length, pushHistory]);

  /* ────────── Selection ────────── */
  const onNodeClick = useCallback((event, node) => {
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
    setSidebarOpen(true);
  }, []);

  const onEdgeClick = useCallback((event, edge) => {
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(null);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, []);

  /* ────────── Delete key ────────── */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const tag = document.activeElement?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        if (selectedNodeId) {
          pushHistory();
          setNodes(nds => nds.filter(n => n.id !== selectedNodeId));
          setEdges(eds => eds.filter(e => e.source !== selectedNodeId && e.target !== selectedNodeId));
          setSelectedNodeId(null);
        } else if (selectedEdgeId) {
          pushHistory();
          setEdges(eds => eds.filter(ed => ed.id !== selectedEdgeId));
          setSelectedEdgeId(null);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedNodeId, selectedEdgeId, setNodes, setEdges, pushHistory]);

  /* ────────── Header actions ────────── */
  const handleAtlasBack = useCallback(() => {
    window.location.hash = '';
  }, []);

  // Общие колбэки статуса/логов для обоих режимов.
  const beginExecUi = useCallback(() => {
    setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, status: 'idle' } })));
    setExecLogs([]);
    setExecStatus('running');
    setExecPanelOpen(true);
    const stats = { total: nodes.length, done: 0, failed: 0 };
    setExecStats(stats);
    return stats;
  }, [nodes.length, setNodes]);

  const makeCallbacks = useCallback((stats) => ({
    onUpdate: (nodeId, status) => {
      setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, status } } : n));
      if (status === 'completed') { stats.done += 1; setExecStats({ ...stats }); }
      else if (status === 'failed') { stats.failed += 1; setExecStats({ ...stats }); }
    },
    onLog: (entry) => setExecLogs(prev => [...prev, entry]),
    onComplete: (finalStatus) => {
      setExecStatus(prev => {
        if (prev === 'stopped') return 'stopped';
        if (finalStatus === 'failed') return 'failed';
        return stats.failed > 0 ? 'failed' : 'completed';
      });
      if (finalStatus === 'failed' || stats.failed > 0) {
        toast.error(t('builder.toast.runFailed') || 'Запуск завершился с ошибкой — смотрите консоль.');
      }
      execRef.current = null;
    },
  }), [setNodes, t]);

  /* ────────── Mock execution ────────── */
  const runMock = useCallback(() => {
    const stats = beginExecUi();
    execRef.current = createExecution({ nodes, edges, ...makeCallbacks(stats) });
  }, [nodes, edges, beginExecUi, makeCallbacks]);

  /* ────────── Real execution (B-2.2) ────────── */
  const runReal = useCallback((input, tier) => {
    const stats = beginExecUi();
    setExecResult(null);
    // Переменные {{ключ}} → значение (для переиспользуемых схем).
    const variables = {};
    for (const { key, value } of runVars) {
      const k = String(key || '').trim();
      if (k) variables[k] = String(value ?? '');
    }
    execRef.current = createRealExecution({
      workflowId: currentWorkflowId,
      input,
      tier: tier || outputTier,
      locale,
      variables,
      ...makeCallbacks(stats),
      onResult: ({ output, tokensUsed }) => setExecResult({ output, tokensUsed }),
    });
  }, [currentWorkflowId, outputTier, locale, runVars, beginExecUi, makeCallbacks]);

  // Кнопка Run: задача вводится заранее в панели выполнения; Run запускает сразу.
  // Реальный запуск без валидации (вызывается после прохождения проверки).
  const proceedRealRun = useCallback(() => {
    setExecPanelOpen(true); // показать поле задачи/результат
    if (!currentWorkflowId || isDirtyRef.current) {
      // Перед реальным запуском схема должна быть сохранена.
      if (!workflowName.trim()) { setNameDraft(''); setNameModalStep('name'); setNameIntent('save'); setNameModalOpen(true); return; }
      doSave().then(() => { if (runInput.trim()) runReal(runInput.trim(), outputTier); });
      return;
    }
    if (!runInput.trim()) return; // поле пустое — пользователь введёт задачу в панели
    runReal(runInput.trim(), outputTier);
  }, [currentWorkflowId, workflowName, runInput, outputTier, runReal, doSave]);

  const handleRun = useCallback(() => {
    if (nodes.length === 0 || execStatus === 'running') return;
    if (runMode === 'real') {
      if (!keyConnected) { requestRealMode(); return; }
      // Задача пуста — открываем окно у стартового узла, чтобы было видно, куда писать.
      if (!runInput.trim()) {
        const trigger = nodes.find(n => n.data?.kind === 'trigger');
        if (trigger) { setSelectedNodeId(trigger.id); setSelectedEdgeId(null); setSidebarOpen(true); }
        return;
      }
      // C1: проверка схемы перед тратой токенов. Ошибки блокируют, предупреждения
      // дают «запустить всё равно». Чисто → запускаем сразу.
      const v = validateGraph(nodes, edges);
      if (v.errors.length || v.warnings.length) { setValidation(v); return; }
      proceedRealRun();
      return;
    }
    runMock();
  }, [nodes, edges, execStatus, runMode, keyConnected, runInput, runMock, requestRealMode, proceedRealRun]);

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

  // Очистка холста — через подтверждение (H2). Само действие восстановимо Undo.
  const doClearCanvas = useCallback(() => {
    pushHistory();
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    setExecLogs([]);
    setExecStatus('idle');
    setClearConfirmOpen(false);
  }, [setNodes, setEdges, pushHistory]);
  const handleClearCanvas = useCallback(() => {
    if (nodes.length === 0) return;
    setClearConfirmOpen(true);
  }, [nodes.length]);

  /* ────────── Keyboard shortcuts ────────── */
  useEffect(() => {
    const handler = (e) => {
      // Undo / Redo — работают даже из полей (стандартное поведение).
      if ((e.metaKey || e.ctrlKey) && (e.key === 'z' || e.key === 'Z')) {
        const tag = document.activeElement?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return; // не мешаем правке текста
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
        return;
      }

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
  }, [handleRun, galleryOpen, undo, redo]);

  return (
    <div
      className={[
        'builder-app',
        toolboxOpen ? 'has-toolbox' : 'no-toolbox',
        sidebarOpen ? 'has-sidebar' : 'no-sidebar',
        execPanelOpen ? 'has-exec' : 'no-exec',
      ].join(' ')}
      style={{ '--toolbox-w': `${toolboxW}px` }}
    >
      <ToastHost />
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
          <span className="builder-header__logo" aria-hidden="true">
            <Icon name="sparkles" size={18} strokeWidth={1.5} />
          </span>
          <strong>Agent Builder</strong>
          <span className="builder-header__beta">BETA</span>
          {nodes.length > 0 && (
            <span className="builder-header__counter">
              {nodes.length} {t(nodes.length === 1 ? 'builder.counter.node' : 'builder.counter.nodes') || (nodes.length === 1 ? 'node' : 'nodes')}
            </span>
          )}
        </div>

        {/* Центр шапки: Демо / Реально */}
        <div className="builder-header__center">
          <div className="builder-runmode" role="group" aria-label={t('builder.runmode.aria') || 'Run mode'}>
            <button
              type="button"
              className={`builder-runmode__opt ${runMode === 'mock' ? 'is-active' : ''}`}
              onClick={() => setRunMode('mock')}
            >
              {t('builder.runmode.mock') || 'Demo'}
            </button>
            <button
              type="button"
              className={`builder-runmode__opt ${runMode === 'real' ? 'is-active' : ''}`}
              onClick={() => keyConnected ? setRunMode('real') : requestRealMode()}
              title={keyConnected ? '' : (t('builder.runmode.needKey') || 'Connect a Claude key first')}
            >
              {t('builder.runmode.real') || 'Real'}
              {!keyConnected && <Icon name="lock" size={11} strokeWidth={1.75} />}
            </button>
          </div>
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
            onClick={openKeysOrAuth}
            title={t('builder.keys.openBtn') || 'API keys'}
            aria-label={t('builder.keys.openBtn') || 'API keys'}
          >
            <Icon name="lock" size={14} strokeWidth={1.5} />
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

        </div>
      </header>

      {/* ── Main layout grid ───────────────────────────────────── */}
      <div className="builder-grid">

        {/* Toolbox (left) */}
        {toolboxOpen && (
          <aside className="builder-toolbox" aria-label={t('builder.toolbox.aria') || 'Node toolbox'}>
            {/* Узкая рейка вкладок — как в Figma (File / Assets) */}
            <div className="builder-toolrail" role="tablist" aria-orientation="vertical">
              <button
                type="button"
                role="tab"
                aria-selected={toolboxTab === 'nodes'}
                className={`builder-toolrail__tab ${toolboxTab === 'nodes' ? 'is-active' : ''}`}
                onClick={() => setToolboxTab('nodes')}
                title={t('builder.toolbox.title') || 'Узлы'}
              >
                <Icon name="grid" size={18} strokeWidth={1.6} />
                <span>{t('builder.toolbox.title') || 'Узлы'}</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={toolboxTab === 'templates'}
                className={`builder-toolrail__tab ${toolboxTab === 'templates' ? 'is-active' : ''}`}
                onClick={() => setToolboxTab('templates')}
                title={t('builder.gallery.title') || 'Шаблоны'}
              >
                <Icon name="books" size={18} strokeWidth={1.6} />
                <span>{t('builder.gallery.title') || 'Шаблоны'}</span>
              </button>
            </div>

            {/* Широкая панель — содержимое зависит от вкладки */}
            <div className="builder-toolbox__panel">
              <div className="builder-toolbox__header">
                <span>{toolboxTab === 'templates'
                  ? (t('builder.gallery.title') || 'Шаблоны')
                  : (t('builder.toolbox.title') || 'Узлы')}</span>
                <button
                  type="button"
                  className="builder-panel-collapse"
                  onClick={() => setToolboxOpen(false)}
                  title={t('builder.header.toggleToolbox') || 'Скрыть панель'}
                  aria-label={t('builder.header.toggleToolbox') || 'Скрыть панель'}
                >
                  <Icon name="panel-left" size={15} strokeWidth={1.6} />
                </button>
              </div>
              {toolboxTab === 'nodes' ? (
                <NodePalette
                  groups={TOOLBOX_GROUPS}
                  defs={NODE_DEFS}
                  onShow={handleTooltipShow}
                  onHide={handleTooltipHide}
                  onAdd={addNodeAtCenter}
                />
              ) : (
                <div className="builder-template-list">
                  {TEMPLATES.map((tpl, i) => (
                    <button
                      key={tpl.id}
                      type="button"
                      className={`builder-template-row ${previewTplIndex === i ? 'is-active' : ''}`}
                      onClick={() => setPreviewTplIndex(i)}
                    >
                      <span className="builder-template-row__icon">
                        <Icon name={tpl.iconName} size={18} strokeWidth={1.5} />
                      </span>
                      <span className="builder-template-row__body">
                        <span className="builder-template-row__name">{t(tpl.nameKey) || tpl.id}</span>
                        <span className="builder-template-row__desc">{t(tpl.descKey) || ''}</span>
                      </span>
                      <Icon name="arrow-right" size={14} strokeWidth={1.5} />
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Ручка изменения ширины — тянуть за правый край */}
            <div
              className="builder-toolbox__resize"
              onMouseDown={startToolboxResize}
              role="separator"
              aria-orientation="vertical"
              title={t('builder.toolbox.resize') || 'Потяните, чтобы изменить ширину'}
            />
          </aside>
        )}

        {/* Canvas (center) */}
        <main
          className={`builder-canvas-wrap ${selectedAgentNode ? 'is-node-focused' : ''} ${isConnecting ? 'is-connecting' : ''}`}
          ref={reactFlowWrapper}
        >
          {/* Слева вверху, одна линия: [показать узлы] + Мои workflow */}
          <div className="builder-canvas-controls builder-canvas-controls--left builder-header__switcher-wrap">
            {!toolboxOpen && (
              <button
                type="button"
                className="builder-canvas-btn builder-canvas-btn--icon"
                onClick={() => setToolboxOpen(true)}
                title={t('builder.header.toggleToolbox') || 'Показать узлы'}
                aria-label={t('builder.header.toggleToolbox') || 'Показать узлы'}
              >
                <Icon name="panel-left" size={15} strokeWidth={1.6} />
              </button>
            )}
            <button
              type="button"
              className="builder-canvas-btn"
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
                refreshKey={wfVersion}
                onOpen={handleLoadWorkflow}
                onNew={handleNewWorkflow}
                onDeleted={(deletedId) => {
                  setWfVersion(v => v + 1);
                  if (deletedId && deletedId === currentWorkflowId) {
                    setCurrentWorkflowId(null);
                    setWorkflowName('');
                  }
                }}
                onRenamed={(id, name) => {
                  setWfVersion(v => v + 1);
                  if (id === currentWorkflowId) setWorkflowName(name);
                }}
                onClose={() => setSwitcherOpen(false)}
              />
            )}
          </div>

          {/* Сохранить + Запуск — на холсте, справа вверху, с подписями */}
          <div className="builder-canvas-controls">
            <button
              type="button"
              className={`builder-canvas-btn builder-canvas-btn--save builder-save--${saveStatus}`}
              onClick={doSave}
              disabled={nodes.length === 0 || saveStatus === 'saving'}
              title={t('builder.save.hint') || 'Сохранить схему'}
            >
              <Icon
                name={saveStatus === 'saved' ? 'check' : saveStatus === 'saving' ? 'refresh' : saveStatus === 'error' ? 'question' : 'archive'}
                size={15}
                strokeWidth={1.6}
              />
              <span>{
                saveStatus === 'saving' ? (t('builder.save.saving') || 'Сохранение…')
                : saveStatus === 'saved' ? (t('builder.save.saved') || 'Сохранено')
                : saveStatus === 'error' ? (t('builder.save.error') || 'Повторить')
                : (t('builder.save.label') || 'Сохранить')
              }</span>
            </button>
            <button
              type="button"
              className={`builder-canvas-btn builder-canvas-btn--run ${runMode === 'real' ? 'builder-canvas-btn--real' : ''}`}
              onClick={handleRun}
              disabled={nodes.length === 0 || execStatus === 'running'}
              title={runMode === 'real'
                ? (t('builder.runmode.realHint') || 'Запуск на реальном Claude — тратит токены')
                : (t('builder.header.runHint') || 'Запуск (R)')}
            >
              <Icon name={execStatus === 'running' ? 'refresh' : 'flash'} size={16} strokeWidth={1.6} />
              <span>{execStatus === 'running'
                ? (t('builder.running') || 'Выполняется…')
                : (t('builder.run') || 'Запуск')}</span>
            </button>
            {/* Показать детали — только когда правая панель ЗАКРЫТА.
                Свернуть открытую панель можно кнопкой внутри самой панели. */}
            {!sidebarOpen && (
              <button
                type="button"
                className="builder-canvas-btn builder-canvas-btn--icon"
                onClick={() => setSidebarOpen(true)}
                title={t('builder.header.toggleSidebar') || 'Показать детали'}
                aria-label={t('builder.header.toggleSidebar') || 'Показать детали'}
              >
                <Icon name="panel-right" size={15} strokeWidth={1.6} />
              </button>
            )}
          </div>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnectStart={onConnectStart}
            onConnectEnd={onConnectEnd}
            onConnect={onConnect}
            isValidConnection={isValidConnection}
            connectionMode="loose"
            connectionLineComponent={ConnectionLine}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
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

            {/* Панель действий узла — сверху, для любого выбранного узла */}
            {selectedNodeId && (
              <NodeToolbar nodeId={selectedNodeId} isVisible position={Position.Top} offset={28}>
                <div className="builder-node-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="builder-node-actions__btn"
                    onClick={() => handleDuplicateNode(selectedNodeId)}
                    title={t('builder.nodeActions.duplicate') || 'Duplicate'}
                  >
                    <Icon name="clipboard" size={13} strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    className="builder-node-actions__btn builder-node-actions__btn--danger"
                    onClick={() => handleDeleteNode(selectedNodeId)}
                    title={t('builder.nodeActions.delete') || 'Delete (Del)'}
                  >
                    <Icon name="trash" size={14} strokeWidth={1.75} />
                  </button>
                </div>
              </NodeToolbar>
            )}

            {/* Плавающее окно инструкции — привязано к узлу, едет за ним */}
            {selectedAgentNode && (
              <NodeToolbar
                nodeId={selectedNodeId}
                isVisible
                position={Position.Right}
                offset={28}
              >
                <NodePromptPopover
                  node={selectedAgentNode}
                  t={t}
                  locale={locale}
                  onSetPrompt={handleSetPrompt}
                  onClose={() => setSelectedNodeId(null)}
                />
              </NodeToolbar>
            )}

            {/* Конфиг Telegram-выхода — поле «куда слать» (chatId) */}
            {selectedTelegramNode && (
              <NodeToolbar
                nodeId={selectedNodeId}
                isVisible
                position={Position.Right}
                offset={28}
              >
                <TelegramConfigPopover
                  node={selectedTelegramNode}
                  t={t}
                  telegramConnected={telegramConnected}
                  onSetChatId={handleSetChatId}
                  onConnect={() => setKeysModalOpen(true)}
                  onClose={() => setSelectedNodeId(null)}
                />
              </NodeToolbar>
            )}

            {/* Конфиг узла «Условие» — оператор + значение */}
            {selectedConditionNode && (
              <NodeToolbar
                nodeId={selectedNodeId}
                isVisible
                position={Position.Right}
                offset={28}
              >
                <ConditionConfigPopover
                  node={selectedConditionNode}
                  t={t}
                  onSet={handleSetCondition}
                  onClose={() => setSelectedNodeId(null)}
                />
              </NodeToolbar>
            )}

            {/* Конфиг узла «Цикл» — к какому узлу вернуться + сколько раз */}
            {selectedLoopNode && (
              <NodeToolbar
                nodeId={selectedNodeId}
                isVisible
                position={Position.Right}
                offset={28}
              >
                <LoopConfigPopover
                  node={selectedLoopNode}
                  nodes={nodes}
                  t={t}
                  onSet={handleSetCondition}
                  onClose={() => setSelectedNodeId(null)}
                />
              </NodeToolbar>
            )}

            {/* Задача рядом со стартовым узлом User Input — точка входа всего flow */}
            {selectedTriggerNode && (
              <NodeToolbar
                nodeId={selectedNodeId}
                isVisible
                position={Position.Right}
                offset={28}
              >
                <TriggerTaskPopover
                  node={selectedTriggerNode}
                  t={t}
                  runMode={runMode}
                  task={runInput}
                  onTaskChange={setRunInput}
                  tierId={outputTier}
                  onTierChange={setOutputTier}
                  estimate={estimateRun(countAgentNodes(nodes), outputTier)}
                  vars={runVars}
                  onVarsChange={setRunVars}
                  onClose={() => setSelectedNodeId(null)}
                />
              </NodeToolbar>
            )}
          </ReactFlow>

          {/* Onboarding empty state — только когда НЕТ активного workflow.
              После «Создать» (currentWorkflowId задан) показываем чистый холст. */}
          {nodes.length === 0 && !currentWorkflowId && (
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

              <RecentWorkflows
                userId={userId}
                onOpen={handleLoadWorkflow}
                refreshKey={wfVersion}
              />
            </div>
          )}

          {/* Connect hint — есть узлы, но нет связей: учим соединять */}
          {nodes.length >= 2 && edges.length === 0 && execStatus !== 'running' && (
            <div className="builder-connect-banner">
              <Icon name="link" size={15} strokeWidth={1.75} />
              <span>{t('builder.connectBanner') || 'Drag from the dot at the bottom of one node to the top of another to connect them.'}</span>
            </div>
          )}

          {/* Status hint */}
          {nodes.length > 0 && !(nodes.length >= 2 && edges.length === 0) && execStatus !== 'running' && (
            <div className="builder-status-hint">
              <Icon name="idea" size={14} strokeWidth={1.5} />
              <span>{t('builder.canvas.hint') || 'Click a node to see details. Drag handles to connect. Delete key to remove.'}</span>
            </div>
          )}

          {/* Подсказка-причина, почему связь нельзя создать (исчезает сама) */}
          {connectHint && (
            <div className="builder-connect-hint" role="status">
              <Icon name="close" size={13} strokeWidth={2} />
              <span>{connectHint}</span>
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
                  <button
                    type="button"
                    className="builder-panel-collapse"
                    onClick={() => setSidebarOpen(false)}
                    title={t('builder.header.toggleSidebar') || 'Скрыть панель деталей'}
                    aria-label={t('builder.header.toggleSidebar') || 'Скрыть панель деталей'}
                  >
                    <Icon name="panel-right" size={15} strokeWidth={1.6} />
                  </button>
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
            result={execResult}
            runSetup={null}
            onStop={handleStopExec}
            onClear={() => { setExecResult(null); handleClearLogs(); }}
            onClose={() => setExecPanelOpen(false)}
          />
        )}

        {/* Свёрнутая консоль — маленькая кнопка снизу, чтобы вернуть панель */}
        {!execPanelOpen && nodes.length > 0 && (
          <button
            type="button"
            className={`builder-console-launcher ${execStatus === 'running' ? 'is-running' : ''}`}
            onClick={() => setExecPanelOpen(true)}
            title={t('builder.exec.open') || 'Открыть консоль'}
          >
            <Icon name={execStatus === 'running' ? 'refresh' : 'terminal'} size={13} strokeWidth={1.75} />
            <span>{t('builder.exec.console') || 'Консоль'}</span>
            {execStatus === 'running' && <span className="builder-console-launcher__dot" />}
          </button>
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

      {/* Превью одного шаблона (из левого списка «Шаблоны») с навигацией */}
      {previewTplIndex !== null && (
        <TemplatePreview
          index={previewTplIndex}
          onIndex={setPreviewTplIndex}
          onUse={(tpl) => { loadTemplate(tpl); setPreviewTplIndex(null); }}
          onClose={() => setPreviewTplIndex(null)}
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
      {/* Живой тултип причины запрета связи — следует за курсором при тяге */}
      <div ref={denyTipRef} className="builder-connect-tip" style={{ display: 'none' }} />

      {/* L1: предложение восстановить несохранённую работу из браузера */}
      {draftOffer && (
        <div className="builder-draft-restore" role="status">
          <Icon name="archive" size={15} strokeWidth={1.75} />
          <span className="builder-draft-restore__text">
            {t('builder.draft.found') || 'Осталась несохранённая схема. Сохранить под именем или сбросить?'}
          </span>
          <button type="button" className="builder-btn builder-btn--primary builder-btn--small" onClick={keepDraftAndName}>
            {t('builder.draft.save') || 'Сохранить'}
          </button>
          <button type="button" className="builder-btn builder-btn--ghost builder-btn--small" onClick={dismissDraft}>
            {t('builder.draft.discard') || 'Сбросить'}
          </button>
        </div>
      )}

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
                  {nameIntent === 'save'
                    ? (t('builder.nameModal.saveTitle') || 'Назовите схему, чтобы сохранить')
                    : (t('builder.nameModal.title') || 'Name your workflow')}
                </h3>
                <input
                  type="text"
                  className="builder-name-modal__input"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && nameDraft.trim()) confirmName();
                    if (e.key === 'Escape') closeNameModal();
                  }}
                  placeholder={t('builder.nameModal.placeholder') || 'e.g. Customer support triage'}
                  autoFocus
                  maxLength={80}
                />
                <p className="builder-name-modal__hint">
                  {nameIntent === 'save'
                    ? (t('builder.nameModal.saveHint') || 'Текущая схема сохранится под этим именем — ничего не потеряется.')
                    : (t('builder.nameModal.chooseHint') || 'Start blank, or pick a ready-made template.')}
                </p>
                <div className="builder-name-modal__actions">
                  <button
                    type="button"
                    className="builder-btn builder-btn--ghost"
                    onClick={closeNameModal}
                  >
                    {t('builder.nameModal.cancel') || 'Cancel'}
                  </button>
                  {nameIntent === 'create' && (
                    <button
                      type="button"
                      className="builder-btn builder-btn--ghost"
                      onClick={() => setNameModalStep('template')}
                    >
                      <Icon name="books" size={14} strokeWidth={1.5} />
                      {t('builder.nameModal.fromTemplate') || 'From template'}
                    </button>
                  )}
                  <button
                    type="button"
                    className="builder-btn builder-btn--primary"
                    onClick={confirmName}
                    disabled={!nameDraft.trim()}
                  >
                    {nameIntent === 'save'
                      ? (t('builder.nameModal.save') || 'Сохранить')
                      : (t('builder.nameModal.blank') || 'Create')}
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

      {/* Clear-canvas confirm (H2) */}
      {clearConfirmOpen && (
        <div className="builder-name-modal__overlay" onClick={() => setClearConfirmOpen(false)}>
          <div className="builder-name-modal" onClick={(e) => e.stopPropagation()} role="alertdialog" aria-modal="true">
            <h3 className="builder-name-modal__title">
              {t('builder.clearConfirm.title') || 'Clear the whole canvas?'}
            </h3>
            <p className="builder-name-modal__hint">
              {t('builder.clearConfirm.body') || 'All nodes and connections will be removed. You can undo with Cmd/Ctrl+Z.'}
            </p>
            <div className="builder-name-modal__actions">
              <button type="button" className="builder-btn builder-btn--ghost" onClick={() => setClearConfirmOpen(false)}>
                {t('builder.clearConfirm.cancel') || 'Cancel'}
              </button>
              <button
                type="button"
                className="builder-btn builder-btn--primary builder-btn--real"
                onClick={doClearCanvas}
              >
                {t('builder.clearConfirm.confirm') || 'Clear canvas'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API keys modal */}
      {keysModalOpen && (
        <ApiKeysModal
          onClose={() => setKeysModalOpen(false)}
          onSignIn={() => setAuthOpen(true)}
        />
      )}

      {/* Auth modal — Builder рендерится вместо Atlas, поэтому свой инстанс */}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}

      {/* Real-mode confirm — после входа+ключа, раз юзер жал «Реально» */}
      {validation && (
        <div className="builder-name-modal__overlay" onClick={() => setValidation(null)}>
          <div
            className="builder-name-modal builder-validation"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={t('builder.validation.title') || 'Проверьте схему перед запуском'}
          >
            <h3 className="builder-name-modal__title">
              {validation.errors.length
                ? (t('builder.validation.blockTitle') || 'Схему пока нельзя запустить')
                : (t('builder.validation.warnTitle') || 'Проверьте схему перед запуском')}
            </h3>

            <ul className="builder-validation__list">
              {validation.errors.map((code) => (
                <li key={code} className="builder-validation__item builder-validation__item--error">
                  <Icon name="close" size={14} strokeWidth={2} />
                  <span>
                    {code === 'no-agent'
                      ? (t('builder.validation.noAgent') || 'Нет ни одного агента — нечего исполнять. Добавьте хотя бы один узел-агент.')
                      : code}
                  </span>
                </li>
              ))}
              {validation.warnings.map((w, i) => {
                const fallback = {
                  isolated: 'Есть несоединённые узлы (не участвуют в потоке)',
                  'multi-trigger': 'Несколько стартовых узлов — поток может запуститься не так, как ожидаете',
                  'output-empty': 'Узел-выход ни с чем не соединён — результата не будет',
                  'tool-unattached': 'Инструмент не прикреплён к агенту — он не задействован',
                  'telegram-no-chat': 'У узла Telegram не указан адрес чата — доставки не будет',
                };
                const text = t(`builder.validation.${w.type}`) || fallback[w.type] || w.type;
                return (
                  <li key={`w${i}`} className="builder-validation__item builder-validation__item--warn">
                    <Icon name="flash" size={14} strokeWidth={1.75} />
                    <span>{w.count ? `${text}: ${w.count}` : text}</span>
                  </li>
                );
              })}
            </ul>

            <div className="builder-name-modal__actions">
              <button
                type="button"
                className="builder-btn builder-btn--ghost"
                onClick={() => setValidation(null)}
              >
                {validation.errors.length
                  ? (t('builder.validation.fix') || 'Исправить')
                  : (t('common.cancel') || 'Отмена')}
              </button>
              {validation.errors.length === 0 && (
                <button
                  type="button"
                  className="builder-btn builder-btn--primary builder-btn--real"
                  onClick={() => { setValidation(null); proceedRealRun(); }}
                >
                  {t('builder.validation.runAnyway') || 'Запустить всё равно'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {realConfirmOpen && (
        <div className="builder-name-modal__overlay" onClick={() => setRealConfirmOpen(false)}>
          <div
            className="builder-name-modal builder-realconfirm"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={t('builder.realConfirm.title') || 'Real-time mode is on'}
          >
            <h3 className="builder-name-modal__title">
              {t('builder.realConfirm.title') || 'You are in real-time mode'}
            </h3>

            {/* Миниатюра кнопки режима — показываем, что активно «Реально» */}
            <div className="builder-realconfirm__preview" aria-hidden="true">
              <span className="builder-runmode">
                <span className="builder-runmode__opt">{t('builder.runmode.mock') || 'Demo'}</span>
                <span className="builder-runmode__opt is-active">{t('builder.runmode.real') || 'Real'}</span>
              </span>
            </div>

            <p className="builder-realconfirm__warn">
              <Icon name="flash" size={14} strokeWidth={1.75} />
              {t('builder.realConfirm.body') || 'Careful: runs now use the real Claude API and spend tokens on your key. Switch back to Demo anytime — it is free.'}
            </p>

            <div className="builder-name-modal__actions">
              <button
                type="button"
                className="builder-btn builder-btn--ghost"
                onClick={() => { setRunMode('mock'); setRealConfirmOpen(false); }}
              >
                {t('builder.realConfirm.backToDemo') || 'Back to Demo'}
              </button>
              <button
                type="button"
                className="builder-btn builder-btn--primary builder-btn--real"
                onClick={() => setRealConfirmOpen(false)}
              >
                {t('builder.realConfirm.gotIt') || 'Got it'}
              </button>
            </div>
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

/* ─────────────────────────────────────────────────────────── */
/* NodePromptPopover — плавающее окно инструкции у агент-узла   */
/* ─────────────────────────────────────────────────────────── */

function NodePromptPopover({ node, t, locale, onSetPrompt, onClose }) {
  const { role, labelKey, prompt = '' } = node.data;
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '').slice(0, 8000);
      onSetPrompt(node.id, (prompt ? prompt + '\n\n' : '') + text);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div
      className="builder-prompt-pop nodrag nowheel"
      onClick={(e) => e.stopPropagation()}
      onWheelCapture={(e) => e.stopPropagation()}
    >
      <div className="builder-prompt-pop__head">
        <span className="builder-prompt-pop__title">
          {t(labelKey) || labelKey} · {t('builder.prompt.title') || 'Instruction'}
        </span>
        <button
          type="button"
          className="builder-prompt-pop__close"
          onClick={onClose}
          aria-label={t('builder.prompt.close') || 'Close'}
        >
          <Icon name="close" size={12} strokeWidth={1.75} />
        </button>
      </div>
      <p className="builder-prompt-pop__hint">
        {t('builder.prompt.hint') || 'Tell this agent exactly what to do. Empty = built-in role.'}
      </p>
      <textarea
        className="builder-prompt-pop__area"
        value={prompt}
        onChange={(e) => onSetPrompt(node.id, e.target.value)}
        placeholder={t('builder.prompt.placeholder') || 'e.g. Study the site example.com and list the top UX problems.'}
        rows={5}
        autoFocus
      />
      <div className="builder-prompt-pop__actions">
        <button
          type="button"
          className="builder-btn builder-btn--ghost builder-btn--small"
          onClick={() => onSetPrompt(node.id, templateForRole(role, locale))}
        >
          <Icon name="books" size={12} strokeWidth={1.5} />
          <span>{t('builder.prompt.useTemplate') || 'Use template'}</span>
        </button>
        <button
          type="button"
          className="builder-btn builder-btn--ghost builder-btn--small"
          onClick={() => fileRef.current?.click()}
        >
          <Icon name="file" size={12} strokeWidth={1.5} />
          <span>{t('builder.prompt.fromFile') || 'From file'}</span>
        </button>
        {prompt && (
          <button
            type="button"
            className="builder-btn builder-btn--ghost builder-btn--small"
            onClick={() => onSetPrompt(node.id, '')}
          >
            <span>{t('builder.prompt.clear') || 'Clear'}</span>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept=".txt,.md,.json,text/*"
          style={{ display: 'none' }}
          onChange={handleFile}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* TriggerTaskPopover — задача рядом со стартовым узлом User Input */
/* ─────────────────────────────────────────────────────────── */

function TriggerTaskPopover({ node, t, runMode, task, onTaskChange, tierId, onTierChange, estimate, vars, onVarsChange, onClose }) {
  const { labelKey } = node.data;
  return (
    <div
      className="builder-prompt-pop nodrag nowheel"
      onClick={(e) => e.stopPropagation()}
      onWheelCapture={(e) => e.stopPropagation()}
    >
      <div className="builder-prompt-pop__head">
        <span className="builder-prompt-pop__title">
          {t(labelKey) || labelKey} · {t('builder.runInput.title') || 'Задача'}
        </span>
        <button
          type="button"
          className="builder-prompt-pop__close"
          onClick={onClose}
          aria-label={t('builder.prompt.close') || 'Close'}
        >
          <Icon name="close" size={12} strokeWidth={1.75} />
        </button>
      </div>
      <p className="builder-prompt-pop__hint">
        {t('builder.runInput.startHint') || 'Это вход всей схемы. Опиши задачу — она пойдёт по стрелкам к узлам.'}
      </p>
      <textarea
        className="builder-prompt-pop__area"
        value={task}
        onChange={(e) => onTaskChange(e.target.value)}
        placeholder={t('builder.runInput.placeholder') || 'Опиши задачу, вставь текст, задай вопрос…'}
        rows={4}
        autoFocus
      />

      {runMode === 'real' && (
        <div className="builder-tier builder-tier--compact" style={{ marginTop: 10 }}>
          <div className="builder-tier__opts">
            {Object.values(OUTPUT_TIERS).map(tier => (
              <button
                key={tier.id}
                type="button"
                role="radio"
                aria-checked={tierId === tier.id}
                className={`builder-tier__opt ${tierId === tier.id ? 'is-active' : ''}`}
                onClick={() => onTierChange(tier.id)}
                title={t(tier.descKey) || ''}
              >
                <span className="builder-tier__opt-name">{t(tier.labelKey) || tier.id.toUpperCase()}</span>
              </button>
            ))}
          </div>
          {estimate && (
            <span className="builder-exec__setup-est">
              ≈ {estimate.totalMax.toLocaleString()} {t('builder.runInput.tokens') || 'tokens'}
              {' · '}≈ ${estimate.costUsd < 0.01 ? '0.01' : estimate.costUsd.toFixed(2)}
            </span>
          )}
        </div>
      )}

      {/* Переменные {{ключ}} — для переиспользуемых схем */}
      {runMode === 'real' && onVarsChange && (
        <div className="builder-vars">
          <div className="builder-vars__head">
            <span>{t('builder.vars.title') || 'Variables'}</span>
            <span className="builder-vars__hint">{t('builder.vars.hint') || 'Use {{name}} in the task or instructions'}</span>
          </div>
          {(vars || []).map((row, i) => (
            <div className="builder-vars__row" key={i}>
              <input
                className="builder-name-modal__input builder-vars__key"
                value={row.key}
                onChange={(e) => { const n = [...vars]; n[i] = { ...n[i], key: e.target.value }; onVarsChange(n); }}
                placeholder={t('builder.vars.keyPh') || 'name'}
              />
              <input
                className="builder-name-modal__input builder-vars__val"
                value={row.value}
                onChange={(e) => { const n = [...vars]; n[i] = { ...n[i], value: e.target.value }; onVarsChange(n); }}
                placeholder={t('builder.vars.valPh') || 'value'}
              />
              <button
                type="button"
                className="builder-vars__del"
                onClick={() => onVarsChange(vars.filter((_, j) => j !== i))}
                aria-label={t('builder.vars.remove') || 'Remove variable'}
              >
                <Icon name="close" size={12} strokeWidth={2} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="builder-btn builder-btn--ghost builder-btn--small builder-vars__add"
            onClick={() => onVarsChange([...(vars || []), { key: '', value: '' }])}
          >
            <Icon name="plus" size={12} strokeWidth={2} />
            <span>{t('builder.vars.add') || 'Add variable'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* TelegramConfigPopover — поле «куда слать» + статус токена бота */
/* ─────────────────────────────────────────────────────────── */

function TelegramConfigPopover({ node, t, telegramConnected, onSetChatId, onConnect, onClose }) {
  const { labelKey, chatId = '' } = node.data;
  return (
    <div
      className="builder-prompt-pop nodrag nowheel"
      onClick={(e) => e.stopPropagation()}
      onWheelCapture={(e) => e.stopPropagation()}
    >
      <div className="builder-prompt-pop__head">
        <span className="builder-prompt-pop__title">
          {t(labelKey) || labelKey} · {t('builder.telegram.title') || 'Доставка'}
        </span>
        <button
          type="button"
          className="builder-prompt-pop__close"
          onClick={onClose}
          aria-label={t('builder.prompt.close') || 'Close'}
        >
          <Icon name="close" size={12} strokeWidth={1.75} />
        </button>
      </div>

      {!telegramConnected ? (
        <>
          <p className="builder-prompt-pop__hint">
            {t('builder.telegram.needToken') || 'Сначала подключите токен Telegram-бота в «Мои ключи».'}
          </p>
          <button type="button" className="builder-btn builder-btn--primary builder-btn--small" onClick={onConnect}>
            <Icon name="plug" size={12} strokeWidth={1.5} />
            <span>{t('builder.telegram.connectBtn') || 'Подключить бота'}</span>
          </button>
        </>
      ) : (
        <>
          <p className="builder-prompt-pop__hint">
            {t('builder.telegram.chatHint') || 'ID чата или @username, куда бот пришлёт результат.'}
          </p>
          <input
            className="builder-name-modal__input"
            value={chatId}
            onChange={(e) => onSetChatId(node.id, e.target.value)}
            placeholder={t('builder.telegram.chatPlaceholder') || 'например, @my_channel или 123456789'}
            autoFocus
          />
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* ConditionConfigPopover — правило ветвления узла «Условие»     */
/* ─────────────────────────────────────────────────────────── */

function ConditionConfigPopover({ node, t, onSet, onClose }) {
  const isAgent = node.data?.role === 'condition-agent';
  const operator = node.data?.operator || 'contains';
  const condValue = node.data?.condValue || '';
  const question = node.data?.question || '';
  const OPS = [
    { id: 'contains', label: t('builder.condition.opContains') || 'содержит' },
    { id: 'not_contains', label: t('builder.condition.opNotContains') || 'не содержит' },
    { id: 'equals', label: t('builder.condition.opEquals') || 'равно' },
  ];
  return (
    <div
      className="builder-prompt-pop nodrag nowheel"
      onClick={(e) => e.stopPropagation()}
      onWheelCapture={(e) => e.stopPropagation()}
    >
      <div className="builder-prompt-pop__head">
        <span className="builder-prompt-pop__title">
          {isAgent
            ? (t('builder.condition.agentTitle') || 'Условие-агент — вопрос для решения')
            : (t('builder.condition.title') || 'Условие — куда пойдёт поток')}
        </span>
        <button
          type="button"
          className="builder-prompt-pop__close"
          onClick={onClose}
          aria-label={t('builder.prompt.close') || 'Закрыть'}
        >
          <Icon name="close" size={12} strokeWidth={1.75} />
        </button>
      </div>

      {isAgent ? (
        <>
          <p className="builder-prompt-pop__hint">
            {t('builder.condition.agentHint') || 'Агент сам ответит «Да» или «Нет» на твой вопрос про результат предыдущего узла и направит поток.'}
          </p>
          <textarea
            className="builder-prompt-pop__area"
            value={question}
            onChange={(e) => onSet(node.id, { question: e.target.value })}
            placeholder={t('builder.condition.agentPlaceholder') || 'например: Это срочное обращение? Тон сообщения негативный?'}
            rows={4}
            autoFocus
          />
        </>
      ) : (
        <>
          <p className="builder-prompt-pop__hint">
            {t('builder.condition.hint') || 'Если результат предыдущего узла проходит проверку — поток идёт по ветке «Да», иначе — «Нет».'}
          </p>
          <div className="builder-cond__row">
            <span className="builder-cond__label">{t('builder.condition.ifResult') || 'Если результат'}</span>
            <select
              className="builder-cond__op"
              value={operator}
              onChange={(e) => onSet(node.id, { operator: e.target.value })}
            >
              {OPS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </div>
          <input
            type="text"
            className="builder-prompt-pop__area"
            value={condValue}
            onChange={(e) => onSet(node.id, { condValue: e.target.value })}
            placeholder={t('builder.condition.placeholder') || 'например: ошибка, успех, да…'}
            autoFocus
          />
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* LoopConfigPopover — настройка узла «Цикл»                     */
/* ─────────────────────────────────────────────────────────── */

function LoopConfigPopover({ node, nodes, t, onSet, onClose }) {
  const loopBackTo = node.data?.loopBackTo || '';
  const maxLoops = node.data?.maxLoops ?? 3;
  // Кандидаты для возврата — агент-узлы (кроме самого цикла).
  const targets = (nodes || []).filter(n => n.id !== node.id && n.data?.kind === 'agent');
  return (
    <div
      className="builder-prompt-pop nodrag nowheel"
      onClick={(e) => e.stopPropagation()}
      onWheelCapture={(e) => e.stopPropagation()}
    >
      <div className="builder-prompt-pop__head">
        <span className="builder-prompt-pop__title">
          {t('builder.loop.title') || 'Цикл — повторить шаги'}
        </span>
        <button
          type="button"
          className="builder-prompt-pop__close"
          onClick={onClose}
          aria-label={t('builder.prompt.close') || 'Закрыть'}
        >
          <Icon name="close" size={12} strokeWidth={1.75} />
        </button>
      </div>
      <p className="builder-prompt-pop__hint">
        {t('builder.loop.hint') || 'Поток вернётся к выбранному узлу и повторит цепочку до этого цикла заданное число раз. Каждый повтор получает результат предыдущего.'}
      </p>
      <div className="builder-cond__row">
        <span className="builder-cond__label">{t('builder.loop.backTo') || 'Вернуться к'}</span>
        <select
          className="builder-cond__op"
          value={loopBackTo}
          onChange={(e) => onSet(node.id, { loopBackTo: e.target.value })}
        >
          <option value="">{t('builder.loop.pick') || '— выберите узел —'}</option>
          {targets.map(n => (
            <option key={n.id} value={n.id}>{t(n.data.labelKey) || n.data.labelKey || n.id}</option>
          ))}
        </select>
      </div>
      <div className="builder-cond__row">
        <span className="builder-cond__label">{t('builder.loop.maxLoops') || 'Сколько раз (макс.)'}</span>
        <input
          type="number"
          min={1}
          max={8}
          className="builder-cond__op"
          value={maxLoops}
          onChange={(e) => onSet(node.id, { maxLoops: Math.min(Math.max(parseInt(e.target.value, 10) || 1, 1), 8) })}
        />
      </div>
    </div>
  );
}

function NodeDetails({ node, t, onAtlasLink }) {
  const { icon, color, labelKey, descKey, kind, role, status, atlasAnchor } = node.data;
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

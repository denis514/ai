import React, { useCallback, useState, useRef, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Panel,
  ReactFlowProvider,
  NodeToolbar,
  Position,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  useViewport,
} from 'reactflow';
import 'reactflow/dist/style.css';
import Icon from '../components/Icon.jsx';
import PlanetLogo from '../components/PlanetLogo.jsx';
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';
import { useT, useLocale } from '../i18n/LocaleContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { NODE_DEFS, TOOLBOX_GROUPS, getNodeDef, KIND_TO_NODE_TYPE, canAddNode, hasConfigPanel } from './data/nodeTypes.js';
import { nodeTypes } from './components/canvas/index.js';
import NodePalette from './components/canvas/NodePalette.jsx';
import HelpPanel from './components/panels/HelpPanel.jsx';
import CodePanel from './components/panels/CodePanel.jsx';
import ConsoleWindow from './components/panels/ConsoleWindow.jsx';
import ConnectionLine from './components/canvas/ConnectionLine.jsx';
import BuilderEdge from './components/canvas/BuilderEdge.jsx';
import ConceptTooltip from './components/education/ConceptTooltip.jsx';
import AtlasNodePreview from './components/education/AtlasNodePreview.jsx';
import NodeGuidePanel from './components/education/NodeGuidePanel.jsx';
import BuilderTour, { isTourSeen } from './components/education/BuilderTour.jsx';
import TemplateGallery from './components/panels/TemplateGallery.jsx';
import TemplatePreview from './components/panels/TemplatePreview.jsx';
import ExecutionPanel from './components/panels/ExecutionPanel.jsx';
import WorkflowSwitcher from './components/panels/WorkflowSwitcher.jsx';
import RecentWorkflows from './components/panels/RecentWorkflows.jsx';
import ApiKeysModal from './components/panels/ApiKeysModal.jsx';
import ScheduleModal from './components/panels/ScheduleModal.jsx';
import AllSchedulesModal from './components/panels/AllSchedulesModal.jsx';
import AuthModal from '../components/AuthModal.jsx';
import { TEMPLATES } from './data/templates.js';
import { OUTPUT_TIERS, DEFAULT_TIER, estimateRun, countAgentNodes } from './data/outputTiers.js';
import { templateForRole } from './data/rolePrompts.js';
import { createRealExecution } from './services/realExecutor.js';
import { createDryRun } from './services/dryRunExecutor.js';
import { getKeyStatus, listMcpServers, listKeys } from './services/apiKeyService.js';
import { saveWorkflow as storageSave, loadWorkflow as storageLoad } from './services/workflowStorage.js';
import { historyBridge } from './services/historyBridge.js';
import ToastHost, { toast } from './components/Toast.jsx';
import { saveDraft, loadDraft, clearDraft, setResumeAfterAuth, hasResumeAfterAuth, clearResumeAfterAuth } from './services/draftBackup.js';
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

// Стабильные сеты (чтобы не пересоздавать объект на каждый рендер палитры).
const EMPTY_SET = new Set();
const TRIGGER_TAKEN = new Set(['trigger-input']);

// Свежий стартовый узел «Старт» — единая точка входа новой схемы.
function buildStartNode(position = { x: 240, y: 110 }) {
  const def = getNodeDef('trigger-input');
  return {
    id: genNodeId(),
    type: KIND_TO_NODE_TYPE[def.kind] || 'triggerNode',
    position,
    data: {
      defId: 'trigger-input', icon: def.icon, color: def.color,
      labelKey: def.labelKey, descKey: def.descKey, atlasAnchor: def.atlasAnchor,
      kind: def.kind, role: def.role, status: 'idle',
    },
  };
}

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
// Переменные «Старта» из набора узлов (для инициализации панели запуска).
function triggerVarsOf(nodes) {
  const trig = (nodes || []).find(n => n.data?.kind === 'trigger');
  return Array.isArray(trig?.data?.vars) ? trig.data.vars : [];
}

function buildTemplateGraph(template, edgeStyle, t) {
  const tr = typeof t === 'function' ? t : (k) => k;
  const tempIdMap = {};
  const nodes = template.nodes.map((tn, idx) => {
    const def = getNodeDef(tn.defId);
    if (!def) return null;
    const id = genNodeId();
    tempIdMap[idx] = id;
    const data = {
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
    };
    // Локализуем промпт шаблона: promptKey → текст на языке пользователя.
    if (data.promptKey) {
      data.prompt = tr(data.promptKey);
      data.hasPrompt = true;
      delete data.promptKey;
    }
    return { id, type: KIND_TO_NODE_TYPE[def.kind] || 'agentNode', position: tn.position, data };
  }).filter(Boolean);

  // Демо-задача «Старта»: берём из i18n builder.template.<ns>.start (ns выводим из
  // nameKey). Без задачи в «Старте» схема не запускается — поэтому шаблон всегда
  // приходит с примерным текстом (точка отправления для пользователя). Если ключа
  // нет (t вернул сам ключ) — не трогаем.
  if (template.nameKey) {
    const startKey = template.nameKey.replace(/\.name$/, '.start');
    const startText = tr(startKey);
    if (startText && startText !== startKey) {
      const trig = nodes.find(n => n.data?.kind === 'trigger');
      if (trig && !String(trig.data.task || '').trim()) {
        trig.data.task = startText;
        trig.data.hasInput = true;
      }
    }
  }

  // Переменные «Старта»: i18n builder.template.<ns>.vars — JSON-массив
  // [{"k":"city","v":"Москва"}, …]. Плейсхолдеры {{k}} стоят в тексте «Старт»,
  // значения v — примерные (точка отправления, пользователь меняет под себя).
  if (template.nameKey) {
    const varsKey = template.nameKey.replace(/\.name$/, '.vars');
    const varsRaw = tr(varsKey);
    if (varsRaw && varsRaw !== varsKey) {
      try {
        const arr = JSON.parse(varsRaw);
        if (Array.isArray(arr)) {
          const trig = nodes.find(n => n.data?.kind === 'trigger');
          if (trig) {
            trig.data.vars = arr
              .map(v => ({ key: String(v.k ?? v.key ?? ''), value: String(v.v ?? v.value ?? '') }))
              .filter(v => v.key);
          }
        }
      } catch { /* плохой JSON — пропускаем, схема не ломается */ }
    }
  }

  // Резолвим ссылку Цикла на узел по индексу шаблона → реальный client_id.
  template.nodes.forEach((tn, idx) => {
    if (tn.dataOverride?.loopBackToIndex != null) {
      const node = nodes.find(n => n.id === tempIdMap[idx]);
      if (node) {
        node.data.loopBackTo = tempIdMap[tn.dataOverride.loopBackToIndex];
        delete node.data.loopBackToIndex;
      }
    }
  });

  const edges = template.edges.map((e, i) => ({
    id: `e${i}-${tempIdMap[e.from]}-${tempIdMap[e.to]}`,
    source: tempIdMap[e.from],
    target: tempIdMap[e.to],
    type: 'builder',
    // Ветка Условия (Да/Нет) кодируется sourceHandle: 'true'|'false'.
    ...(e.sourceHandle ? { sourceHandle: e.sourceHandle } : {}),
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
  const kindOf = new Map(nodes.map(n => [n.id, n.data?.kind]));
  const incoming = new Map(nodes.map(n => [n.id, []]));
  for (const e of edges) {
    // Связь «инструмент → агент» — это прикрепление способности, а НЕ шаг потока.
    // Поэтому она не нумеруется и не сдвигает порядок (иначе Vision получал бы
    // номер 1, как Старт, хотя он просто умение главного агента).
    if (kindOf.get(e.source) === 'tool') continue;
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
  for (const n of nodes) {
    if (n.data?.kind === 'tool') { level.set(n.id, null); continue; } // инструмент — без номера
    compute(n.id);
  }
  return level;
}

// Модификатор-клавиша для подсказок: ⌘ на Mac, Ctrl на остальных платформах.
const KBD_META = (typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || ''))
  ? '⌘' : 'Ctrl';

function BuilderApp({ initialTemplateId = null }) {
  return (
    <ReactFlowProvider>
      <BuilderAppInner initialTemplateId={initialTemplateId} />
    </ReactFlowProvider>
  );
}

function BuilderAppInner({ initialTemplateId = null }) {
  const t = useT();
  const { locale } = useLocale();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  // По умолчанию обе панели ЗАКРЫТЫ — чистый холст приветствия с центральным CTA.
  // Открываются только когда пользователь нажмёт «Старт» / «Templates» / Recent
  // (или вручную через хедер). Тогда же запускается обучающий тур.
  const [toolboxOpen, setToolboxOpen] = useState(false);
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [consoleOpen, setConsoleOpen] = useState(false); // объединённая «Консоль»
  const [consoleTab, setConsoleTab] = useState('code');  // 'code' | 'run'
  // Общий режим окна Консоли — поднят сюда, чтобы плавающее/перетаскиваемое окно
  // вело себя одинаково в обеих вкладках (Код/Запуск) и сохранялось при переключении.
  const [consoleFloating, setConsoleFloating] = useState(false);
  const [consoleMax, setConsoleMax] = useState(false);
  const [consolePos, setConsolePos] = useState({ x: 0, y: 0 });
  // Мини-карта холста — скрыта по умолчанию, открывается отдельной
  // кнопкой в ряду Controls (правый нижний угол).
  const [miniMapOpen, setMiniMapOpen] = useState(false);
  // Ширина консоли (правая боковая панель), сохраняется в браузере.
  const [execW, setExecW] = useState(() => {
    const v = parseInt(localStorage.getItem('atlas:builder:exec-w') || '', 10);
    return v >= 320 && v <= 720 ? v : 460;
  });
  const [execResizing, setExecResizing] = useState(false);
  const startExecResize = useCallback((e) => {
    // Старт ресайза: запоминаем pointer X и начальную ширину; листенеры
    // на window — onMove тянет ширину, onUp снимает листенеры и сохраняет.
    e.preventDefault();
    const startX = e.clientX;
    const startW = execW;
    setExecResizing(true);
    document.body.style.cursor = 'col-resize';
    const onMove = (ev) => {
      // Тянем за ЛЕВУЮ кромку → движение влево увеличивает ширину
      const dx = startX - ev.clientX;
      const next = Math.max(320, Math.min(720, startW + dx));
      setExecW(next);
    };
    const onUp = () => {
      setExecResizing(false);
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      try { localStorage.setItem('atlas:builder:exec-w', String(execW)); } catch { /* noop */ }
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [execW]);
  // Сохраняем ширину при изменении (если пользователь резает несколько раз).
  useEffect(() => {
    try { localStorage.setItem('atlas:builder:exec-w', String(execW)); } catch { /* noop */ }
  }, [execW]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [previewTplIndex, setPreviewTplIndex] = useState(null); // превью шаблона из левого списка
  const [tooltipInfo, setTooltipInfo] = useState(null); // { defId, top, left }
  const tooltipHideTimerRef = useRef(null);

  // Atlas preview state — когда установлено, заменяет NodeDetails в sidebar.
  const [atlasPreviewId, setAtlasPreviewId] = useState(null);
  // Гайд «Как использовать узел» — defId типа узла; тоже заменяет NodeDetails.
  const [guideDefId, setGuideDefId] = useState(null);

  // Onboarding tour — НЕ показываем при заходе. Запускается только когда
  // пользователь нажал «Старт» / «Templates» / Recent (через engageBuilder ниже).
  const [tourOpen, setTourOpen] = useState(false);

  /**
   * engageBuilder — пользователь начал работу: раскрываем обе панели и
   * (если первая встреча) запускаем обучающий тур. Подвешен на 3 CTA на
   * пустом холсте: «Старт», «Открыть templates», карточки Recent.
   */
  const engageBuilder = useCallback(() => {
    setToolboxOpen(true);
    setSidebarOpen(true);
    if (!isTourSeen()) setTourOpen(true);
  }, []);

  const openAtlasPreview = useCallback((atlasId) => {
    if (!atlasId) return;
    setGuideDefId(null);     // взаимоисключение с гайдом
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

  // Открыть гайд «Как использовать» по defId типа узла.
  const openNodeGuide = useCallback((defId) => {
    if (!defId) return;
    setAtlasPreviewId(null); // взаимоисключение с превью Atlas
    setGuideDefId(defId);
    setSidebarOpen(true);
    if (tooltipHideTimerRef.current) {
      clearTimeout(tooltipHideTimerRef.current);
      tooltipHideTimerRef.current = null;
    }
    setTooltipInfo(null);
  }, []);

  const closeNodeGuide = useCallback(() => {
    setGuideDefId(null);
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

  // Cleanup при размонтировании: гасим тултип-таймер И живой запуск (иначе
  // Realtime-подписка на логи остаётся открытой — утечка).
  useEffect(() => () => {
    if (tooltipHideTimerRef.current) clearTimeout(tooltipHideTimerRef.current);
    if (execRef.current) execRef.current.stop();
  }, []);

  // Execution state
  const [execStatus, setExecStatus] = useState('idle'); // 'idle' | 'running' | 'completed' | 'failed' | 'stopped'
  const [execLogs, setExecLogs] = useState([]);
  const [execStats, setExecStats] = useState({ total: 0, done: 0, failed: 0 });
  const execRef = useRef(null);

  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition, zoomIn, zoomOut, fitView } = useReactFlow();
  const { zoom } = useViewport();   // живой % масштаба для зум-бара

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
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  // Production-only: демо-режим удалён, запуск всегда реальный (на ключе Claude).
  const runMode = 'real';
  const [keyConnected, setKeyConnected] = useState(false);
  const [telegramConnected, setTelegramConnected] = useState(false);
  const [resendConnected, setResendConnected] = useState(false);
  const [gcalConnected, setGcalConnected] = useState(false);
  const [runInput, setRunInput] = useState('');
  // Переменные для переиспользуемых схем: {{ключ}} в задаче/инструкциях → значение.
  const [runVars, setRunVars] = useState([]); // [{ key, value }]
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
    // hasResumeAfterAuth() → намеренный редирект на вход: черновик уже сохранён,
    // не пугаем браузерным «уйти со страницы?».
    const h = (e) => { if (unsavedRef.current && !hasResumeAfterAuth()) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, []);

  // На возврате: если осталась НЕсохранённая работа (черновик с узлами без id) —
  // предлагаем решить: «Сохранить под именем» или «Сбросить». Без пассивного
  // «восстановить» (бессмысленно: не сохранил при обновлении — теряешь).
  const [draftOffer, setDraftOffer] = useState(null);
  useEffect(() => {
    // Возврат с входа из билдера обрабатывает авто-восстановление ниже — баннер не нужен.
    if (hasResumeAfterAuth()) return;
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

  // Синхронизируем задачу Старта В САМ узел (data.task) — чтобы она сохранялась
  // вместе со схемой (сериализатор берёт config из node.data). Плюс hasInput —
  // флаг заливки. Здесь НЕ ставим skipDirtyRef: правка задачи должна помечать
  // схему изменённой, чтобы автосохранение записало текст. На загрузке task и
  // hasInput уже выставлены в узле (см. handleLoadWorkflow) → changed=false → без
  // ложной пометки dirty.
  useEffect(() => {
    const has = !!runInput.trim();
    setNodes(nds => {
      let changed = false;
      const next = nds.map(n => {
        if (n.data?.kind !== 'trigger') return n;
        if ((n.data.task || '') === runInput && !!n.data.hasInput === has) return n;
        changed = true;
        return { ...n, data: { ...n.data, task: runInput, hasInput: has } };
      });
      return changed ? next : nds;
    });
  }, [runInput, setNodes]);

  // Синхронизируем переменные «Старта» (runVars) в сам узел (data.vars) — чтобы
  // правки сохранялись со схемой (сериализатор берёт config из node.data) и
  // восстанавливались при загрузке (см. handleLoadWorkflow → setRunVars).
  useEffect(() => {
    const cur = JSON.stringify(runVars || []);
    setNodes(nds => {
      let changed = false;
      const next = nds.map(n => {
        if (n.data?.kind !== 'trigger') return n;
        if (JSON.stringify(n.data.vars || []) === cur) return n;
        changed = true;
        return { ...n, data: { ...n.data, vars: runVars } };
      });
      return changed ? next : nds;
    });
  }, [runVars, setNodes]);

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

  // Возврат с OAuth-входа, начатого ИЗ билдера: авто-восстанавливаем черновик на
  // холст и сразу сохраняем его как «Без названия» (переименовать можно потом).
  // Это убирает «сброс»: то, что человек собрал ДО входа, остаётся ПОСЛЕ входа.
  const resumedRef = useRef(false);
  useEffect(() => {
    if (!hasResumeAfterAuth() || resumedRef.current) return;
    if (!user) return; // ждём, пока сессия после редиректа подтянется
    const d = loadDraft();
    // Восстанавливаем ЛЮБОЙ непустой черновик — и безымянный, и уже названный
    // шаблон (у анонима workflowId мог быть локальным; после входа всё равно
    // пересохраняем в облако под пользователем).
    if (!d || !Array.isArray(d.nodes) || d.nodes.length === 0) {
      clearResumeAfterAuth(); // восстанавливать нечего — снимаем флаг
      return;
    }
    resumedRef.current = true;
    clearResumeAfterAuth();
    skipDirtyRef.current = true;
    syncNodeIdCounter(d.nodes);
    setNodes(d.nodes);
    setEdges(d.edges || []);
    const name = (d.name && d.name.trim()) || t('builder.workflows.defaultName') || 'Без названия';
    // persist берёт явные узлы (state ещё не обновился), overrideId=null → свежая
    // облачная копия под текущим пользователем; при успехе чистит черновик.
    persist(name, d.nodes, d.edges || [], null);
  }, [user, persist, setNodes, setEdges, t]);

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

  // Шаг 1 «Чистый холст»: создаём новый workflow с введённым именем.
  // На холст СРАЗУ кладём стартовый узел «Старт» — единая, очевидная точка входа.
  const startBlank = useCallback(async () => {
    const name = nameDraft.trim();
    if (!name) return;
    const startNode = buildStartNode();
    const seed = [startNode];
    skipDirtyRef.current = true;
    setNodes(seed);
    setEdges([]);
    setSelectedNodeId(startNode.id); // сразу выделяем → справа открывается поле задачи
    setExecLogs([]);
    setExecStatus('idle');
    setNameModalOpen(false);
    setNameModalStep('name');
    // Создаём черновик с этим именем и стартовым узлом (новая запись → id = null).
    await persist(name, seed, [], null);
  }, [nameDraft, persist, setNodes, setEdges]);

  // Шаг 2 «Из шаблона»: строим граф шаблона, имя берём из введённого
  // пользователем (а не из шаблона), сразу создаём запись.
  const pickTemplateForNew = useCallback(async (template) => {
    const name = nameDraft.trim() || (template.nameKey ? t(template.nameKey) : '') || 'Workflow';
    const { nodes: newNodes, edges: newEdges } = buildTemplateGraph(template, EDGE_STYLE, t);
    skipDirtyRef.current = true;
    setNodes(newNodes);
    setEdges(newEdges);
    setRunVars(triggerVarsOf(newNodes));
    setSelectedNodeId(null);
    setExecLogs([]);
    setExecStatus('idle');
    setNameModalOpen(false);
    setNameModalStep('name');
    // Центрируем загруженный шаблон на холсте (иначе он остаётся слева и
    // непонятно, загрузилось ли). Задержка — чтобы узлы успели измериться.
    setTimeout(() => fitView({ padding: 0.25, maxZoom: 1, duration: 400 }), 90);
    await persist(name, newNodes, newEdges, null);
  }, [nameDraft, t, persist, setNodes, setEdges, fitView]);

  // Закрытие модалки (cancel) — сброс на шаг имени.
  const closeNameModal = useCallback(() => {
    setNameModalOpen(false);
    setNameModalStep('name');
  }, []);

  // Авто-имя: как только у безымянной схемы появились узлы — присваиваем имя
  // по умолчанию. Без этого автосохранение не запустилось бы (оно требует имя),
  // а отдельной кнопки «Сохранить» больше нет. Переименовать можно в переключателе.
  useEffect(() => {
    if (nodes.length > 0 && !workflowName.trim()) {
      setWorkflowName(t('builder.workflows.defaultName') || 'Без названия');
    }
  }, [nodes.length, workflowName, t]);

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

  // Открыть вход ИЗ билдера: перед редиректом на OAuth флэшим черновик и ставим
  // флаг «возобновить после входа» — чтобы собранная до входа схема не потерялась.
  const openAuth = useCallback(() => {
    if (nodes.length > 0) {
      saveDraft({ workflowId: currentWorkflowId, name: workflowName, nodes, edges });
      setResumeAfterAuth();
    }
    setAuthOpen(true);
  }, [nodes, edges, currentWorkflowId, workflowName]);

  // Если не авторизован — сразу окно входа; иначе окно ключей.
  const openKeysOrAuth = useCallback(() => {
    if (!user) openAuth();
    else setKeysModalOpen(true);
  }, [user, openAuth]);

  // Нет ключа/входа для запуска — ведём ко входу или подключению ключа.
  const requestRealMode = useCallback(() => {
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
    getKeyStatus('resend')
      .then(s => { if (alive) setResendConnected(!!s.connected); })
      .catch(() => { if (alive) setResendConnected(false); });
    getKeyStatus('gcal')
      .then(s => { if (alive) setGcalConnected(!!s.connected); })
      .catch(() => { if (alive) setGcalConnected(false); });
    return () => { alive = false; };
  }, [keysModalOpen, user]);

  // Возврат из OAuth Google Calendar: ?gcal=connected|denied|error|norefresh.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const g = p.get('gcal');
    if (!g) return;
    const map = {
      connected: ['success', t('builder.gcal.ok') || 'Google Calendar подключён ✓'],
      denied: ['info', t('builder.gcal.denied') || 'Доступ к календарю не выдан.'],
      norefresh: ['error', t('builder.gcal.norefresh') || 'Google не вернул токен — отключите доступ приложения в аккаунте Google и подключите заново.'],
      error: ['error', t('builder.gcal.err') || 'Не удалось подключить Google Calendar.'],
    };
    const m = map[g];
    if (m) toast[m[0]]?.(m[1]);
    // Убираем параметр из URL, чтобы тост не повторялся.
    p.delete('gcal');
    const q = p.toString();
    window.history.replaceState(null, '', window.location.pathname + (q ? `?${q}` : ''));
  }, [t]);

  // Консоль скрыта по умолчанию. Открывается ТОЛЬКО по явному действию
  // пользователя: иконка terminal в шапке или launcher-кнопка внизу.

  // Загрузка существующего workflow по id.
  const handleLoadWorkflow = useCallback(async (wfId) => {
    try {
      const wf = await storageLoad(wfId, userId, EDGE_STYLE);
      if (!wf) return;
      skipDirtyRef.current = true;
      syncNodeIdCounter(wf.nodes); // не дать новым id столкнуться с загруженными
      // Восстанавливаем задачу Старта из узла (data.task) и «запекаем» hasInput,
      // чтобы эффект синхронизации не пометил схему изменённой сразу после загрузки.
      const triggerTask = wf.nodes.find(n => n.data?.kind === 'trigger')?.data?.task || '';
      const hydrated = wf.nodes.map(n =>
        n.data?.kind === 'trigger'
          ? { ...n, data: { ...n.data, hasInput: !!String(n.data?.task || '').trim() } }
          : n
      );
      setNodes(hydrated);
      setEdges(wf.edges);
      setCurrentWorkflowId(wf.id);
      setWorkflowName(wf.name || '');
      setRunInput(triggerTask);
      setRunVars(triggerVarsOf(hydrated));
      setSelectedNodeId(null);
      setSwitcherOpen(false);
      isDirtyRef.current = false;
      setSaveStatus('saved');
      // Центрируем загруженную схему — чтобы не искать узлы при смене workflow.
      setTimeout(() => fitView({ padding: 0.25, maxZoom: 1, duration: 400 }), 90);
    } catch (e) {
      console.error('[Builder] load failed', e);
      toast.error(t('builder.toast.loadFailed') || 'Не удалось открыть схему.');
    }
  }, [userId, setNodes, setEdges, t, fitView]);

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

  // «Начать с нуля» (из галереи): закрываем галерею и кладём стартовый узел на
  // пустой холст. Имя присвоится автоматически, как только появятся узлы.
  const startFromScratch = useCallback(() => {
    setGalleryOpen(false);
    if (nodes.length === 0) {
      const startNode = buildStartNode();
      skipDirtyRef.current = true;
      setNodes([startNode]);
      setEdges([]);
      setSelectedNodeId(startNode.id);
      setSidebarOpen(true);
    }
  }, [nodes.length, setNodes, setEdges]);

  const selectedNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) : null;
  const selectedAgentNode = selectedNode && selectedNode.data?.kind === 'agent' ? selectedNode : null;
  const selectedTelegramNode = selectedNode && selectedNode.data?.role === 'telegram' ? selectedNode : null;
  const selectedEmailNode = selectedNode && selectedNode.data?.role === 'email' ? selectedNode : null;
  const selectedCalendarNode = selectedNode && selectedNode.data?.role === 'calendar' ? selectedNode : null;
  const selectedMcpNode = selectedNode && selectedNode.data?.role === 'mcp' ? selectedNode : null;
  const selectedToolNode = selectedNode && (selectedNode.data?.role === 'file_read' || selectedNode.data?.role === 'vision')
    ? selectedNode : null;
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
      // «Старт» можно только удалить — он singleton (один вход = один поток).
      if (src.data?.kind === 'trigger') {
        showHintText(t('builder.singleton.start') || '«Старт» может быть только один — его нельзя дублировать.');
        return nds;
      }
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
    // showHintText/t намеренно не в deps: showHintText объявлена ниже по файлу,
    // в массиве зависимостей это TDZ. В теле ссылка безопасна (вызов после монтирования).
  }, [setNodes]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Этап 2: выбрать конкретный ключ (бот/почта) для узла доставки.
  // '' = использовать основной (default). Сохраняется в config через сериализатор.
  const handleSetNodeConnection = useCallback((nodeId, connectionId) => {
    setNodes(nds => nds.map(n =>
      n.id === nodeId ? { ...n, data: { ...n.data, connectionId: connectionId || undefined } } : n
    ));
  }, [setNodes]);
  // Этап 3 (веер): список адресатов [{connectionId, chatId}] для узла Telegram.
  // Непустой → шлём в каждый; пустой → одиночный (connectionId+chatId, Этап 1/2).
  const handleSetNodeTargets = useCallback((nodeId, targets) => {
    // Храним массив как есть (включая пустые строки во время ввода — иначе строка
    // исчезнет пока печатаешь chatId). Пустые отсеивает execute при чтении.
    const arr = Array.isArray(targets) ? targets : [];
    setNodes(nds => nds.map(n =>
      n.id === nodeId ? { ...n, data: { ...n.data, targets: arr.length ? arr : undefined } } : n
    ));
  }, [setNodes]);
  // Списки ключей пользователя (для выпадающего выбора бота/почты в узле).
  const [telegramKeys, setTelegramKeys] = useState([]);
  const [resendKeys, setResendKeys] = useState([]);
  useEffect(() => {
    if (!user) { setTelegramKeys([]); setResendKeys([]); return; }
    listKeys('telegram').then(setTelegramKeys).catch(() => setTelegramKeys([]));
    listKeys('resend').then(setResendKeys).catch(() => setResendKeys([]));
  }, [user, keysModalOpen]); // перечитываем после изменений в «Мои ключи»

  // Настройка инструмента (Файлы/Vision): загруженный контент в config узла.
  const handleSetToolData = useCallback((nodeId, patch) => {
    setNodes(nds => nds.map(n =>
      n.id === nodeId ? { ...n, data: { ...n.data, ...patch } } : n
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
  // Показать произвольный текст подсказки в той же плашке (исчезает сама).
  const showHintText = useCallback((msg) => {
    setConnectHint(msg);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    hintTimerRef.current = setTimeout(() => setConnectHint(null), 3200);
  }, []);
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
      // Singleton-узлы (Старт) — только один на схему.
      if (!canAddNode(defId, nodes)) {
        showHintText(t('builder.singleton.start') || '«Старт» уже есть на схеме — он может быть только один.');
        return;
      }

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
      // Узлы с окном настройки (ввод данных/текста) — сразу выделяем, чтобы рядом
      // открылось их окно и можно было сразу вводить.
      if (hasConfigPanel(def)) { setSelectedNodeId(newNode.id); setSelectedEdgeId(null); }
    },
    [screenToFlowPosition, setNodes, pushHistory, nodes, showHintText, t]
  );

  // Клик по плитке в палитре — добавить узел в центр видимой области холста (M4).
  const addNodeAtCenter = useCallback((defId) => {
    const def = getNodeDef(defId);
    if (!def) return;
    // Singleton-узлы (Старт) — только один на схему.
    if (!canAddNode(defId, nodes)) {
      showHintText(t('builder.singleton.start') || '«Старт» уже есть на схеме — он может быть только один.');
      return;
    }
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
    // Узлы с окном настройки — сразу открываем его рядом для ввода данных.
    if (hasConfigPanel(def)) { setSelectedNodeId(newNode.id); setSelectedEdgeId(null); }
  }, [screenToFlowPosition, setNodes, pushHistory, nodes, showHintText, t]);

  /* ────────── Load template (из галереи) ────────── */
  const loadTemplate = useCallback((template) => {
    const { nodes: newNodes, edges: newEdges } = buildTemplateGraph(template, EDGE_STYLE, t);
    if (nodes.length > 0) pushHistory(); // даём откат, если на холсте уже было
    skipDirtyRef.current = true;
    setNodes(newNodes);
    setEdges(newEdges);
    // Синхронизируем поле «Старта» (runInput) с задачей нового шаблона — иначе
    // панель Старта показывала бы текст предыдущего шаблона до перезагрузки.
    setRunInput(newNodes.find(n => n.data?.kind === 'trigger')?.data?.task || '');
    setRunVars(triggerVarsOf(newNodes));
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
    // Центрируем загруженный шаблон на холсте (иначе остаётся слева).
    setTimeout(() => fitView({ padding: 0.25, maxZoom: 1, duration: 400 }), 90);
  }, [setNodes, setEdges, t, nodes.length, pushHistory, fitView]);

  /* ────────── Приход из Atlas: /<lang>/builder/<templateId> ────────── */
  // Кнопка «Собрать в Agent Builder» в узле карты открывает конструктор сразу
  // с нужным шаблоном. Загружаем один раз за монтирование: дальше пользователь
  // работает со схемой сам, и повторная загрузка стёрла бы его правки.
  const initialTemplateDone = useRef(false);
  useEffect(() => {
    if (initialTemplateDone.current || !initialTemplateId) return;
    const tpl = TEMPLATES.find(x => x.id === initialTemplateId);
    if (!tpl) return;                      // шаблон переименован/удалён — тихо игнорируем
    initialTemplateDone.current = true;
    loadTemplate(tpl);
  }, [initialTemplateId, loadTemplate]);

  /* ────────── Применить код (панель «Код схемы») ────────── */
  // Получает готовые React Flow nodes/edges (CodePanel уже распарсил и проверил)
  // и собирает их на холсте с центрированием.
  const applyCode = useCallback((rfNodes, rfEdges) => {
    if (nodes.length > 0) pushHistory();
    skipDirtyRef.current = true;
    setNodes(rfNodes);
    setEdges(rfEdges);
    setRunInput(rfNodes.find(n => n.data?.kind === 'trigger')?.data?.task || '');
    setSelectedNodeId(null);
    setExecLogs([]);
    setExecStatus('idle');
    setTimeout(() => fitView({ padding: 0.25, maxZoom: 1, duration: 400 }), 90);
  }, [nodes.length, pushHistory, setNodes, setEdges, fitView]);

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
    // Назад в Atlas (корень текущей локали) — path-routing.
    const loc = (locale && ['ru', 'en', 'fi'].includes(locale)) ? `/${locale}` : '/';
    window.history.pushState(null, '', loc);
    window.dispatchEvent(new Event('atlas:routechange'));
  }, [locale]);

  // Общие колбэки статуса/логов для обоих режимов.
  const beginExecUi = useCallback(() => {
    setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, status: 'idle' } })));
    setExecLogs([]);
    setExecStatus('running');
    // Открываем консоль на вкладке «Запуск» — видно ход выполнения сразу.
    setConsoleOpen(true);
    setConsoleTab('run');
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

  /* ────────── Real execution (B-2.2, production-only) ────────── */
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
    // Консоль НЕ открываем — она доступна по запросу пользователя (см. launcher).
    if (!currentWorkflowId || isDirtyRef.current) {
      // Перед реальным запуском схема должна быть сохранена.
      if (!workflowName.trim()) { setNameDraft(''); setNameModalStep('name'); setNameIntent('save'); setNameModalOpen(true); return; }
      doSave().then(() => { if (runInput.trim()) runReal(runInput.trim(), outputTier); });
      return;
    }
    if (!runInput.trim()) return; // поле пустое — пользователь введёт задачу в панели
    runReal(runInput.trim(), outputTier);
  }, [currentWorkflowId, workflowName, runInput, outputTier, runReal, doSave]);

  // Тестовый прогон (dry-run) — без сервера и токенов: показывает, как проходит
  // цепочка, и есть ли ошибки связей. Рисуется в той же консоли (вкладка «Запуск»).
  const handleDryRun = useCallback(() => {
    if (nodes.length === 0 || execStatus === 'running') return;
    const stats = beginExecUi();
    setExecResult(null);
    execRef.current = createDryRun({ nodes, edges, t, ...makeCallbacks(stats) });
  }, [nodes, edges, execStatus, beginExecUi, makeCallbacks, t]);

  const handleRun = useCallback(() => {
    if (nodes.length === 0 || execStatus === 'running') return;
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
  }, [nodes, edges, execStatus, keyConnected, runInput, requestRealMode, proceedRealRun]);

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
      // Cmd/Ctrl+S — форс-сохранение (страховка). Работает даже из полей.
      // Кнопки «Сохранить» нет: схема и так автосохраняется, это лишь мгновенный flush.
      if ((e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        if (nodes.length > 0) doSave();
        return;
      }

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
  }, [handleRun, galleryOpen, undo, redo, doSave, nodes.length]);

  // Переключатель вкладок объединённой «Консоли» (Код ↔ Запуск).
  // Перетаскивание плавающего окна Консоли за шапку (но не за кнопки).
  const consoleHeaderPointerDown = useCallback((e) => {
    if (!consoleFloating || consoleMax) return;
    if (e.target.closest('button')) return;
    const start = { mx: e.clientX, my: e.clientY, px: consolePos.x, py: consolePos.y };
    const move = (ev) => setConsolePos({ x: start.px + (ev.clientX - start.mx), y: start.py + (ev.clientY - start.my) });
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }, [consoleFloating, consoleMax, consolePos]);

  const consoleToggleFloat = () => { setConsoleFloating(f => !f); setConsoleMax(false); };
  const consoleToggleMax = () => setConsoleMax(m => !m);

  const consoleTabs = (
    <div className="builder-console-tabs" role="tablist">
      <button
        type="button" role="tab" aria-selected={consoleTab === 'code'}
        className={`builder-console-tab ${consoleTab === 'code' ? 'is-active' : ''}`}
        onClick={() => setConsoleTab('code')}
      >{t('builder.console.tabCode') || 'Код'}</button>
      <button
        type="button" role="tab" aria-selected={consoleTab === 'run'}
        className={`builder-console-tab ${consoleTab === 'run' ? 'is-active' : ''}`}
        onClick={() => setConsoleTab('run')}
      >
        {t('builder.console.tabRun') || 'Запуск'}
        {execStatus === 'running' && <span className="builder-console-tab__dot" aria-hidden="true" />}
      </button>
      <button
        type="button" role="tab" aria-selected={consoleTab === 'sched'}
        className={`builder-console-tab ${consoleTab === 'sched' ? 'is-active' : ''}`}
        onClick={() => setConsoleTab('sched')}
      >{t('builder.console.tabSched') || 'Автозапуски'}</button>
    </div>
  );

  // ── Рельса правых панелей: НЕ перекрываются, стыкуются рядом ──────────────
  // Порядок справа налево (приоритет, не зависит от очереди открытия):
  //   1) Автозапуск (расписание) — ВСЕГДА крайний справа,
  //   2) Консоль (запуск/автозапуски),
  //   3) Детали — крайняя слева. Каждая панель толкает левую дальше влево.
  const DOCK_BASE = 16, DOCK_GAP = 12;
  const consoleDocked = consoleOpen && !consoleFloating && !consoleMax;
  const consoleW = consoleDocked ? Math.min(720, Math.max(320, execW || 460)) : 0;
  const schedDockedOpen = scheduleOpen && !!currentWorkflowId;
  let dockAcc = DOCK_BASE;
  const rightSchedule = dockAcc; if (schedDockedOpen) dockAcc += 360 + DOCK_GAP;
  const rightConsole = dockAcc; if (consoleDocked) dockAcc += consoleW + DOCK_GAP;
  const rightDetails = dockAcc;

  return (
    <div
      className={[
        'builder-app',
        toolboxOpen ? 'has-toolbox' : 'no-toolbox',
        sidebarOpen ? 'has-sidebar' : 'no-sidebar',
        consoleOpen ? 'has-exec' : 'no-exec',
      ].join(' ')}
      style={{ '--toolbox-w': `${toolboxW}px` }}
    >
      <ToastHost />
      {/* SVG-фильтр Liquid Glass для CTA «Старт» (палитра и пустой холст).
          Размещён один раз на корне Builder, ссылка url(#builder-liquid-displace)
          из CSS на ::before стеклянного слоя. */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <filter id="builder-liquid-displace" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018 0.025" numOctaves="2" seed="3" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="1.2" result="softNoise" />
          <feDisplacementMap in="SourceGraphic" in2="softNoise" scale="6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="builder-header">
        <div className="builder-header__left-group">
          <div className="builder-header__left">
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
              <PlanetLogo size={22} className="builder-header__logo" />
              <strong>Agent Builder</strong>
              <span className="builder-header__beta">BETA</span>
              {nodes.length > 0 && (
                <span className="builder-header__counter">
                  {nodes.length} {t(nodes.length === 1 ? 'builder.counter.node' : 'builder.counter.nodes') || (nodes.length === 1 ? 'node' : 'nodes')}
                </span>
              )}
            </div>
          </div>

          {/* Свёрнута левая панель → независимая круглая кнопка справа от плашки
              (в стиле кнопок правой части). */}
          {!toolboxOpen && (
            <button
              type="button"
              className="builder-header__sidebtn"
              onClick={() => setToolboxOpen(true)}
              title={t('builder.header.toggleToolbox') || 'Показать узлы'}
              aria-label={t('builder.header.toggleToolbox') || 'Показать узлы'}
            >
              <Icon name="panel-left" size={16} strokeWidth={1.6} />
            </button>
          )}

          {/* Переключатель языка — ВСЕГДА в левой части (как в Atlas) */}
          <LanguageSwitcher title={t('common.language') || 'Язык'} />
        </div>

        {/* Центр: переключатель «Мои workflow» (имя текущей схемы + список) */}
        <div className="builder-header__center">
          <div className="builder-header__switcher-wrap">
            <button
              type="button"
              className="builder-header__wf"
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
        </div>

        <div className="builder-header__actions">
          {/* «Очистить» — отдельная плашка слева, появляется только при наличии узлов */}
          {nodes.length > 0 && (
            <button
              type="button"
              className="builder-clear-pill"
              onClick={handleClearCanvas}
              title={t('builder.clear') || 'Clear canvas'}
            >
              <span>{t('builder.clearLabel') || 'Очистить'}</span>
            </button>
          )}
          <button
            type="button"
            className={`builder-btn builder-btn--ghost builder-console-btn ${consoleOpen ? 'is-active' : ''}`}
            onClick={() => setConsoleOpen(o => !o)}
            title={t('builder.console.openBtn') || 'Консоль'}
            aria-label={t('builder.console.openBtn') || 'Консоль'}
            aria-pressed={consoleOpen}
          >
            <Icon name="terminal" size={15} strokeWidth={1.6} />
            {execStatus === 'running' && <span className="builder-console-dot" aria-hidden="true" />}
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
          {/* Кнопка «Все автозапуски» убрана из шапки — история теперь внизу
              боковой панели «Автозапуск» (раскрывающийся блок). */}
          {/* Показать панель «Детали» — стоит ПЕРЕД сплитом, чтобы зелёная плашка
              осталась в самом правом краю ряда (требование референса). */}
          {!sidebarOpen && (
            <button
              type="button"
              className="builder-btn builder-btn--ghost"
              onClick={() => setSidebarOpen(true)}
              title={t('builder.header.toggleSidebar') || 'Показать детали'}
              aria-label={t('builder.header.toggleSidebar') || 'Показать детали'}
            >
              <Icon name="panel-right" size={14} strokeWidth={1.5} />
            </button>
          )}

          {/* Тестовый прогон — без токенов, проверяет, что цепочка проходит. */}
          <button
            type="button"
            className="builder-dry-btn"
            onClick={handleDryRun}
            disabled={nodes.length === 0 || execStatus === 'running'}
            title={t('builder.dry.btnHint') || 'Тестовый прогон без токенов — проверить, что цепочка проходит без ошибок'}
          >
            {t('builder.dry.btn') || 'Тестовый запуск'}
          </button>

          {/* Сплит-кнопка Запуск + расписание — последний элемент справа. */}
          <div className="builder-run-split builder-run-split--real">
            <button
              type="button"
              className="builder-run-split__main"
              onClick={handleRun}
              disabled={nodes.length === 0 || execStatus === 'running'}
              title={t('builder.runmode.realHint') || 'Запуск на реальном Claude — тратит токены'}
            >
              {execStatus === 'running' && <Icon name="refresh" size={15} strokeWidth={1.6} />}
              <span>{execStatus === 'running'
                ? (t('builder.running') || 'Выполняется…')
                : (t('builder.run') || 'Запуск')}</span>
            </button>
            {userId && nodes.length > 0 && (
              <button
                type="button"
                className="builder-run-split__clock"
                onClick={() => {
                  if (currentWorkflowId) { setScheduleOpen(true); return; }
                  toast.info(t('builder.schedule.saveFirst') || 'Сначала сохраните схему — потом нажмите часики ещё раз.');
                  doSave();
                }}
                title={t('builder.schedule.title') || 'Автозапуск по расписанию'}
                aria-label={t('builder.schedule.title') || 'Автозапуск по расписанию'}
              >
                <Icon name="clock" size={15} strokeWidth={1.6} />
              </button>
            )}
          </div>
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
              <button
                type="button"
                role="tab"
                aria-selected={toolboxTab === 'help'}
                className={`builder-toolrail__tab ${toolboxTab === 'help' ? 'is-active' : ''}`}
                onClick={() => setToolboxTab('help')}
                title={t('builder.help.title') || 'Помощь'}
              >
                <Icon name="idea" size={18} strokeWidth={1.6} />
                <span>{t('builder.help.title') || 'Помощь'}</span>
              </button>

              {/* Тур — действие (открывает обучающий обзор), внизу рейки */}
              <button
                type="button"
                className="builder-toolrail__tab builder-toolrail__tour"
                onClick={() => setTourOpen(true)}
                title={t('builder.tour.openBtn') || 'Запустить тур'}
              >
                <Icon name="compass" size={18} strokeWidth={1.6} />
                <span>{t('builder.tour.short') || 'Тур'}</span>
              </button>
            </div>

            {/* Широкая панель — содержимое зависит от вкладки */}
            <div className="builder-toolbox__panel">
              <div className="builder-toolbox__header">
                <span>{toolboxTab === 'templates'
                  ? (t('builder.gallery.title') || 'Шаблоны')
                  : toolboxTab === 'help'
                  ? (t('builder.help.title') || 'Помощь')
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
              {toolboxTab === 'help' ? (
                <HelpPanel t={t} />
              ) : toolboxTab === 'nodes' ? (
                <NodePalette
                  groups={TOOLBOX_GROUPS}
                  defs={NODE_DEFS}
                  onShow={handleTooltipShow}
                  onHide={handleTooltipHide}
                  onAdd={addNodeAtCenter}
                  disabledDefs={nodes.some(n => n.data?.defId === 'trigger-input') ? TRIGGER_TAKEN : EMPTY_SET}
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
          {/* Живой статус сохранения — маленький бейдж под шапкой, по центру.
              Появляется только при реальном результате (сохранено / сбой). */}
          {(saveStatus === 'saved' || saveStatus === 'error') && (
            <div
              className={`builder-save-badge builder-save-badge--${saveStatus}`}
              role="status"
              aria-live="polite"
            >
              <Icon name={saveStatus === 'saved' ? 'check' : 'question'} size={12} strokeWidth={2} />
              <span>{saveStatus === 'saved'
                ? (t('builder.save.saved') || 'Сохранено')
                : (t('builder.save.error') || 'Не удалось сохранить')}</span>
            </div>
          )}

          {/* Запуск перенесён в header__actions — становится правым сегментом
              единой плашки [иконки | Запуск]. См. строки около 1395. */}
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
            fitViewOptions={{ maxZoom: 1, padding: 0.2 }}
            minZoom={0.25}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
            deleteKeyCode={null}
          >
            {/* Зум-бар в стиле Atlas — плавающая pill по центру снизу */}
            <Panel position="bottom-center">
              <div className="builder-zoom">
                <button type="button" className="builder-zoom__btn" onClick={() => zoomOut()}
                  title={t('builder.zoom.out') || 'Уменьшить'} aria-label={t('builder.zoom.out') || 'Zoom out'}>
                  <Icon name="minus" size={15} strokeWidth={1.9} />
                </button>
                <button type="button" className="builder-zoom__value" onClick={() => fitView({ padding: 0.2, duration: 300 })}
                  title={t('builder.zoom.reset') || 'Вписать в экран'}>
                  {Math.round((zoom || 1) * 100)}%
                </button>
                <button type="button" className="builder-zoom__btn" onClick={() => zoomIn()}
                  title={t('builder.zoom.in') || 'Увеличить'} aria-label={t('builder.zoom.in') || 'Zoom in'}>
                  <Icon name="plus" size={15} strokeWidth={1.9} />
                </button>
                <span className="builder-zoom__divider" />
                <button type="button" className="builder-zoom__btn" onClick={() => fitView({ padding: 0.2, duration: 300 })}
                  title={t('builder.zoom.fit') || 'Вписать в экран'} aria-label={t('builder.zoom.fit') || 'Fit view'}>
                  <Icon name="fullscreen" size={15} strokeWidth={1.75} />
                </button>
                <button type="button"
                  className={`builder-zoom__btn ${miniMapOpen ? 'is-active' : ''}`}
                  onClick={() => setMiniMapOpen(v => !v)}
                  title={t(miniMapOpen ? 'builder.minimap.hide' : 'builder.minimap.show') || (miniMapOpen ? 'Скрыть мини-карту' : 'Мини-карта')}
                  aria-label={t('builder.minimap.toggle') || 'Toggle minimap'}
                  aria-pressed={miniMapOpen}>
                  <Icon name="grid" size={14} strokeWidth={1.75} />
                </button>
              </div>
            </Panel>
            {miniMapOpen && <MiniMap pannable zoomable />}

            {/* Панель действий узла — сверху, для любого выбранного узла */}
            {selectedNodeId && (
              <NodeToolbar nodeId={selectedNodeId} isVisible position={Position.Top} offset={28}>
                <div className="builder-node-actions" onClick={(e) => e.stopPropagation()}>
                  {/* «Старт» — singleton: дублировать нельзя, только удалить. */}
                  {!selectedTriggerNode && (
                    <button
                      type="button"
                      className="builder-node-actions__btn"
                      onClick={() => handleDuplicateNode(selectedNodeId)}
                      title={t('builder.nodeActions.duplicate') || 'Duplicate'}
                    >
                      <Icon name="clipboard" size={13} strokeWidth={1.75} />
                    </button>
                  )}
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
                  keys={telegramKeys}
                  onSetChatId={handleSetChatId}
                  onSetConnection={handleSetNodeConnection}
                  onSetTargets={handleSetNodeTargets}
                  onConnect={openKeysOrAuth}
                  onClose={() => setSelectedNodeId(null)}
                />
              </NodeToolbar>
            )}

            {/* Конфиг Email-выхода — адрес получателя + тема */}
            {selectedEmailNode && (
              <NodeToolbar nodeId={selectedNodeId} isVisible position={Position.Right} offset={28}>
                <EmailConfigPopover
                  node={selectedEmailNode}
                  t={t}
                  resendConnected={resendConnected}
                  keys={resendKeys}
                  onSet={handleSetToolData}
                  onSetConnection={handleSetNodeConnection}
                  onConnect={openKeysOrAuth}
                  onClose={() => setSelectedNodeId(null)}
                />
              </NodeToolbar>
            )}

            {/* Конфиг Calendar-выхода — подключение Google + выбор календаря */}
            {selectedCalendarNode && (
              <NodeToolbar nodeId={selectedNodeId} isVisible position={Position.Right} offset={28}>
                <CalendarConfigPopover
                  node={selectedCalendarNode}
                  t={t}
                  gcalConnected={gcalConnected}
                  onSet={handleSetToolData}
                  onConnect={openKeysOrAuth}
                  onClose={() => setSelectedNodeId(null)}
                />
              </NodeToolbar>
            )}

            {/* Конфиг узла MCP — выбор сервера(ов) из подключённых */}
            {selectedMcpNode && (
              <NodeToolbar nodeId={selectedNodeId} isVisible position={Position.Right} offset={28}>
                <McpNodeConfigPopover
                  node={selectedMcpNode}
                  t={t}
                  onSet={handleSetToolData}
                  onManage={() => setKeysModalOpen(true)}
                  onClose={() => setSelectedNodeId(null)}
                />
              </NodeToolbar>
            )}

            {/* Конфиг инструмента Файлы/Vision — загрузка контента */}
            {selectedToolNode && (
              <NodeToolbar
                nodeId={selectedNodeId}
                isVisible
                position={Position.Right}
                offset={28}
              >
                <ToolDataPopover
                  node={selectedToolNode}
                  t={t}
                  onSet={handleSetToolData}
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

              {/* Главный CTA — «Старт»: сразу добавляет узел trigger-input на холст.
                  Pill-форма с живым градиентом (Figma эталон, вариант A). */}
              <button
                type="button"
                className="builder-start-cta"
                onClick={() => { addNodeAtCenter('trigger-input'); engageBuilder(); }}
                style={{ pointerEvents: 'auto', marginTop: 18 }}
                aria-label={t('builder.node.trigger_input') || 'Старт'}
              >
                <span className="builder-cta-blob-r1" aria-hidden="true" />
                <span className="builder-cta-blob-r2" aria-hidden="true" />
                <span className="builder-cta-blob-p"  aria-hidden="true" />
                <span className="builder-cta-blob-d"  aria-hidden="true" />
                <span className="builder-cta-blob-o"  aria-hidden="true" />
                <span className="builder-cta-blob-a"  aria-hidden="true" />
                <span className="builder-start-cta__label">
                  <Icon name="flash" size={15} strokeWidth={1.6} />
                  <span>{t('builder.node.trigger_input') || 'Старт'}</span>
                </span>
              </button>

              <button
                type="button"
                className="builder-btn builder-btn--ghost"
                onClick={() => { setGalleryOpen(true); engageBuilder(); }}
                style={{ pointerEvents: 'auto', marginTop: 10 }}
              >
                <Icon name="books" size={14} strokeWidth={1.5} />
                <span>{t('builder.canvas.browseTemplates') || 'Browse templates'}</span>
              </button>

              <RecentWorkflows
                userId={userId}
                onOpen={(id) => { handleLoadWorkflow(id); engageBuilder(); }}
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

          {/* Легенда горячих клавиш — keycap-чипы в стиле Atlas */}
          {nodes.length > 0 && !(nodes.length >= 2 && edges.length === 0) && execStatus !== 'running' && (
            <div className="builder-keyhint" aria-label={t('builder.kbd.aria') || 'Keyboard shortcuts'}>
              {[
                { keys: ['Del'], label: t('builder.kbd.delete') || 'удалить', when: !!selectedNodeId || !!selectedEdgeId },
                { keys: [KBD_META, 'Z'], label: t('builder.kbd.undo') || 'отменить', when: true },
                { keys: ['R'], label: t('builder.kbd.run') || 'запуск', when: true },
                { keys: [KBD_META, 'S'], label: t('builder.kbd.save') || 'сохранить', when: true },
              ].filter(s => s.when).map((s, i) => (
                <span className="builder-keyhint__item" key={i}>
                  <span className="builder-keyhint__keys">
                    {s.keys.map((k, j) => <kbd className="builder-kbd" key={j}>{k}</kbd>)}
                  </span>
                  <span className="builder-keyhint__label">{s.label}</span>
                </span>
              ))}
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
              (atlasPreviewId || guideDefId) ? 'builder-sidebar--preview' : '',
            ].join(' ').trim()}
            style={{ right: `${rightDetails}px` }}
            aria-label={atlasPreviewId
              ? (t('builder.preview.aria') || 'Atlas preview')
              : guideDefId
                ? (t('builder.guide.aria') || 'Node guide')
                : (t('builder.sidebar.aria') || 'Selection details')}
          >
            {guideDefId ? (
              // Гайд «Как использовать узел» — занимает sidebar, свой header внутри
              <NodeGuidePanel
                defId={guideDefId}
                onClose={closeNodeGuide}
                onOpenAtlas={openAtlasPreview}
              />
            ) : atlasPreviewId ? (
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
                    <NodeDetails node={selectedNode} t={t} onAtlasLink={openAtlasPreview} onGuide={openNodeGuide} />
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

        {/* Единое окно «Консоль» — одна рамка, внутри переключаются вкладки. */}
        {consoleOpen && (
          <ConsoleWindow
            tabs={consoleTabs}
            floating={consoleFloating}
            maximized={consoleMax}
            pos={consolePos}
            onToggleFloat={consoleToggleFloat}
            onToggleMax={consoleToggleMax}
            onHeaderPointerDown={consoleHeaderPointerDown}
            onClose={() => setConsoleOpen(false)}
            wrapperStyle={{ '--exec-w': `${execW}px`, right: `${rightConsole}px` }}
            wrapperClass={execResizing ? 'is-resizing' : ''}
            onResizeStart={startExecResize}
            t={t}
          >
            {consoleTab === 'run' && (
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
              />
            )}
            {consoleTab === 'code' && (
              <CodePanel
                nodes={nodes}
                edges={edges}
                edgeStyle={EDGE_STYLE}
                onApply={applyCode}
                t={t}
              />
            )}
            {consoleTab === 'sched' && (
              <AllSchedulesModal embedded />
            )}
          </ConsoleWindow>
        )}

        {/* Автозапуск — правая панель (стыкуется рядом с «Деталями») */}
        {scheduleOpen && currentWorkflowId && (
          <ScheduleModal
            workflowId={currentWorkflowId}
            workflowName={workflowName}
            locale={locale}
            dockRight={rightSchedule}
            onClose={() => setScheduleOpen(false)}
          />
        )}

      </div>

      {/* Template Gallery modal */}
      {galleryOpen && (
        <TemplateGallery
          onUseTemplate={loadTemplate}
          onScratch={startFromScratch}
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
          onOpenGuide={openNodeGuide}
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
          onSignIn={openAuth}
        />
      )}


      {/* Auth modal — Builder рендерится вместо Atlas, поэтому свой инстанс */}
      {authOpen && <AuthModal onClose={() => { setAuthOpen(false); if (!user) clearResumeAfterAuth(); }} />}

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
                    <span>{w.count > 1 ? `${text} (узлов: ${w.count})` : text}</span>
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
      className="builder-prompt-pop nodrag nopan nowheel"
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
        className="builder-prompt-pop__area nodrag nopan"
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
      className="builder-prompt-pop nodrag nopan nowheel"
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
        className="builder-prompt-pop__area nodrag nopan"
        value={task}
        onChange={(e) => onTaskChange(e.target.value)}
        placeholder={t('builder.runInput.placeholder') || 'Опиши задачу, вставь текст, задай вопрос…'}
        rows={4}
        autoFocus
      />

      {runMode === 'real' && (
        <div className="builder-tier builder-tier--slider" style={{ marginTop: 10 }}>
          <input
            type="range" min="0" max="2" step="1"
            value={Math.max(0, ['s', 'm', 'l'].indexOf(tierId))}
            onChange={(e) => onTierChange(['s', 'm', 'l'][+e.target.value])}
            className="builder-tier__range nodrag nopan"
            aria-label={t('builder.tier.heading') || 'Размер и качество ответа'}
          />
          <div className="builder-tier__ticks">
            {['s', 'm', 'l'].map(id => (
              <button
                key={id} type="button"
                className={`builder-tier__tick ${tierId === id ? 'is-active' : ''}`}
                onClick={() => onTierChange(id)}
              >
                {t(OUTPUT_TIERS[id].labelKey) || id.toUpperCase()}
              </button>
            ))}
          </div>
          {estimate && (
            <span className="builder-exec__setup-est">
              {t(OUTPUT_TIERS[tierId]?.descKey || 'builder.tier.s.desc')} · ≈ {estimate.totalMax.toLocaleString()} {t('builder.runInput.tokens') || 'токенов'}
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

function TelegramConfigPopover({ node, t, telegramConnected, keys = [], onSetChatId, onSetConnection, onSetTargets, onConnect, onClose }) {
  const { labelKey, chatId = '', connectionId = '', targets } = node.data;
  // Этап 3: редактируем список адресатов. Если targets ещё нет — берём одиночный
  // (legacy chatId/connectionId) как первую строку. multi = показываем веер-UI.
  const rows = (Array.isArray(targets) && targets.length)
    ? targets
    : [{ connectionId: connectionId || '', chatId: chatId || '' }];
  const updateRow = (i, patch) => {
    const next = rows.map((r, idx) => idx === i ? { ...r, ...patch } : r);
    onSetTargets(node.id, next);
  };
  const addRow = () => onSetTargets(node.id, [...rows, { connectionId: '', chatId: '' }]);
  const removeRow = (i) => onSetTargets(node.id, rows.filter((_, idx) => idx !== i));
  return (
    <div
      className="builder-prompt-pop nodrag nopan nowheel"
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
            {rows.length > 1
              ? (t('builder.telegram.fanHint') || 'Результат уйдёт в каждый адрес из списка.')
              : (t('builder.telegram.chatHint') || 'ID чата или @username, куда бот пришлёт результат.')}
          </p>
          {/* Объяснение «почему адрес — это получатель, а не бот» + как узнать свой ID */}
          <div className="builder-tg-help">
            <p>{t('builder.telegram.explain') || 'Бот — это отправитель. В адрес впишите ПОЛУЧАТЕЛЯ: чтобы пришло вам в личку — ваш числовой ID; в группу — ID группы; в канал — @имя_канала, где бот сделан администратором. Имя бота адресом быть не может.'}</p>
            <a className="builder-tg-help__link" href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer">
              <Icon name="external-link" size={11} strokeWidth={1.75} />
              <span>{t('builder.telegram.myId') || 'Узнать мой ID (через @userinfobot)'}</span>
            </a>
          </div>
          {/* Этап 3 (веер): список адресатов — для каждого свой бот + чат. */}
          {rows.map((r, i) => (
            <div key={i} className="builder-tg-target">
              {keys.length > 1 && (
                <select
                  className="builder-name-modal__input"
                  value={r.connectionId || ''}
                  onChange={(e) => updateRow(i, { connectionId: e.target.value })}
                  title={t('builder.telegram.botPick') || 'Каким ботом слать'}
                >
                  <option value="">{t('builder.telegram.botDefault') || 'Основной бот'}</option>
                  {keys.map(k => (
                    <option key={k.id} value={k.id}>
                      {(k.label || `••••${k.key_hint}`) + (k.is_default ? ' ★' : '')}
                    </option>
                  ))}
                </select>
              )}
              <div className="builder-tg-target__row">
                <input
                  className="builder-name-modal__input"
                  value={r.chatId || ''}
                  onChange={(e) => updateRow(i, { chatId: e.target.value })}
                  placeholder={t('builder.telegram.chatPlaceholder') || 'например, @my_channel или 123456789'}
                  autoFocus={i === 0}
                />
                {rows.length > 1 && (
                  <button
                    type="button"
                    className="builder-mcp__del"
                    onClick={() => removeRow(i)}
                    title={t('common.remove') || 'Убрать'}
                  >
                    <Icon name="trash" size={13} strokeWidth={1.6} />
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            type="button"
            className="builder-btn builder-btn--ghost builder-btn--small"
            onClick={addRow}
          >
            <Icon name="plus" size={12} strokeWidth={1.75} />
            <span>{t('builder.telegram.addTarget') || 'Добавить адрес (веер)'}</span>
          </button>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* EmailConfigPopover — адрес получателя + тема (Resend)         */
/* ─────────────────────────────────────────────────────────── */

function EmailConfigPopover({ node, t, resendConnected, keys = [], onSet, onSetConnection, onClose, onConnect }) {
  const { labelKey, toEmail = '', subject = '', connectionId = '' } = node.data;
  return (
    <div
      className="builder-prompt-pop nodrag nopan nowheel"
      onClick={(e) => e.stopPropagation()}
      onWheelCapture={(e) => e.stopPropagation()}
    >
      <div className="builder-prompt-pop__head">
        <span className="builder-prompt-pop__title">
          {t(labelKey) || labelKey} · {t('builder.email.title') || 'Доставка на email'}
        </span>
        <button type="button" className="builder-prompt-pop__close" onClick={onClose} aria-label={t('builder.prompt.close') || 'Close'}>
          <Icon name="close" size={12} strokeWidth={1.75} />
        </button>
      </div>

      {!resendConnected ? (
        <>
          <p className="builder-prompt-pop__hint">
            {t('builder.email.needKey') || 'Сначала подключите ключ Resend в «Мои ключи».'}
          </p>
          <button type="button" className="builder-btn builder-btn--primary builder-btn--small" onClick={onConnect}>
            <Icon name="plug" size={12} strokeWidth={1.5} />
            <span>{t('builder.email.connectBtn') || 'Подключить email'}</span>
          </button>
        </>
      ) : (
        <>
          {/* Этап 2: выбор конкретной почты (Resend-ключа), если их несколько. */}
          {keys.length > 1 && (
            <>
              <p className="builder-prompt-pop__hint">
                {t('builder.email.keyPick') || 'С какой почты слать:'}
              </p>
              <select
                className="builder-name-modal__input"
                value={connectionId}
                onChange={(e) => onSetConnection(node.id, e.target.value)}
              >
                <option value="">{t('builder.email.keyDefault') || 'Основная почта'}</option>
                {keys.map(k => (
                  <option key={k.id} value={k.id}>
                    {(k.label || `••••${k.key_hint}`) + (k.is_default ? ' ★' : '')}
                  </option>
                ))}
              </select>
            </>
          )}
          <p className="builder-prompt-pop__hint">
            {t('builder.email.toHint') || 'Email получателя, куда отправить результат.'}
          </p>
          <input
            className="builder-name-modal__input"
            type="email"
            value={toEmail}
            onChange={(e) => onSet(node.id, { toEmail: e.target.value })}
            placeholder={t('builder.email.toPlaceholder') || 'name@example.com'}
            autoFocus
          />
          <input
            className="builder-name-modal__input"
            style={{ marginTop: 8 }}
            value={subject}
            onChange={(e) => onSet(node.id, { subject: e.target.value })}
            placeholder={t('builder.email.subjectPlaceholder') || 'Тема письма (необязательно)'}
          />
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* CalendarConfigPopover — подключение Google + календарь        */
/* ─────────────────────────────────────────────────────────── */

function CalendarConfigPopover({ node, t, gcalConnected, onSet, onConnect, onClose }) {
  const { labelKey, calendarId = '' } = node.data;
  return (
    <div
      className="builder-prompt-pop nodrag nopan nowheel"
      onClick={(e) => e.stopPropagation()}
      onWheelCapture={(e) => e.stopPropagation()}
    >
      <div className="builder-prompt-pop__head">
        <span className="builder-prompt-pop__title">
          {t(labelKey) || labelKey} · {t('builder.calendar.title') || 'Событие в календаре'}
        </span>
        <button type="button" className="builder-prompt-pop__close" onClick={onClose} aria-label={t('builder.prompt.close') || 'Close'}>
          <Icon name="close" size={12} strokeWidth={1.75} />
        </button>
      </div>

      {!gcalConnected ? (
        <>
          <p className="builder-prompt-pop__hint">
            {t('builder.calendar.needConnect') || 'Сначала подключите Google Calendar в «Мои ключи».'}
          </p>
          <button type="button" className="builder-btn builder-btn--primary builder-btn--small" onClick={onConnect}>
            <Icon name="calendar" size={12} strokeWidth={1.5} />
            <span>{t('builder.calendar.connectBtn') || 'Подключить календарь'}</span>
          </button>
        </>
      ) : (
        <>
          <p className="builder-prompt-pop__hint">
            {t('builder.calendar.hint') || 'Событие создаётся в основном календаре. Можно указать ID другого календаря.'}
          </p>
          <input
            className="builder-name-modal__input"
            value={calendarId}
            onChange={(e) => onSet(node.id, { calendarId: e.target.value })}
            placeholder={t('builder.calendar.idPlaceholder') || 'primary (по умолчанию) или ID календаря'}
          />
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* McpNodeConfigPopover — выбор MCP-серверов для этого агента     */
/* ─────────────────────────────────────────────────────────── */

function McpNodeConfigPopover({ node, t, onSet, onManage, onClose }) {
  const [servers, setServers] = useState(null); // null = loading
  useEffect(() => { listMcpServers().then(setServers).catch(() => setServers([])); }, []);
  const selected = Array.isArray(node.data?.mcpServerIds) ? node.data.mcpServerIds : [];

  const toggle = (id) => {
    const next = selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id];
    onSet(node.id, { mcpServerIds: next });
  };

  return (
    <div className="builder-prompt-pop nodrag nopan nowheel" onClick={(e) => e.stopPropagation()} onWheelCapture={(e) => e.stopPropagation()}>
      <div className="builder-prompt-pop__head">
        <span className="builder-prompt-pop__title">
          {t(node.data?.labelKey) || 'MCP'} · {t('builder.mcpNode.title') || 'Серверы'}
        </span>
        <button type="button" className="builder-prompt-pop__close" onClick={onClose} aria-label={t('builder.prompt.close') || 'Close'}>
          <Icon name="close" size={12} strokeWidth={1.75} />
        </button>
      </div>

      {servers === null ? (
        <p className="builder-prompt-pop__hint">{t('builder.keys.loading') || 'Loading…'}</p>
      ) : servers.length === 0 ? (
        <>
          <p className="builder-prompt-pop__hint">
            {t('builder.mcpNode.empty') || 'Нет подключённых MCP-серверов. Добавьте сервер в «Мои ключи» → MCP-серверы.'}
          </p>
          <button type="button" className="builder-btn builder-btn--primary builder-btn--small" onClick={onManage}>
            <Icon name="plug" size={12} strokeWidth={1.5} />
            <span>{t('builder.mcpNode.manage') || 'Открыть MCP-серверы'}</span>
          </button>
        </>
      ) : (
        <>
          <p className="builder-prompt-pop__hint">
            {t('builder.mcpNode.pick') || 'Какие серверы дать этому агенту. Если ничего не выбрано — будут доступны все.'}
          </p>
          <div className="builder-mcpnode__list">
            {servers.map(s => (
              <label key={s.id} className="builder-mcpnode__item">
                <input type="checkbox" checked={selected.includes(s.id)} onChange={() => toggle(s.id)} />
                <span className="builder-mcpnode__name">{s.name}</span>
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* ToolDataPopover — загрузка контента для Файлы / Vision        */
/* ─────────────────────────────────────────────────────────── */

const MAX_FILE_CHARS = 12000;
const MAX_IMG_BYTES = 1.5 * 1024 * 1024; // 1.5 МБ

function ToolDataPopover({ node, t, onSet, onClose }) {
  const fileRef = useRef(null);
  const isVision = node.data?.role === 'vision';
  const { fileName, imageName } = node.data || {};

  const onFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (isVision) {
      if (!file.type.startsWith('image/')) return;
      if (file.size > MAX_IMG_BYTES) {
        toast.error(t('builder.tool.imgTooBig') || 'Картинка больше 1.5 МБ — выберите меньше.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result || '');
        const base64 = dataUrl.split(',')[1] || '';
        onSet(node.id, { imageData: base64, imageMime: file.type, imageName: file.name, hasPrompt: !!base64 });
        toast.success(t('builder.tool.imgLoaded') || 'Картинка загружена');
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result || '').slice(0, MAX_FILE_CHARS);
        onSet(node.id, { fileText: text, fileName: file.name, hasPrompt: !!text.trim() });
        toast.success(t('builder.tool.fileLoaded') || 'Файл загружен');
      };
      reader.readAsText(file);
    }
  };

  const clear = () => onSet(node.id, isVision
    ? { imageData: '', imageMime: '', imageName: '', hasPrompt: false }
    : { fileText: '', fileName: '', hasPrompt: false });

  const loadedName = isVision ? imageName : fileName;

  return (
    <div className="builder-prompt-pop nodrag nopan nowheel" onClick={(e) => e.stopPropagation()} onWheelCapture={(e) => e.stopPropagation()}>
      <div className="builder-prompt-pop__head">
        <span className="builder-prompt-pop__title">
          {isVision ? (t('builder.tool.visionTitle') || 'Картинка для анализа') : (t('builder.tool.fileTitle') || 'Файл для агента')}
        </span>
        <button type="button" className="builder-prompt-pop__close" onClick={onClose} aria-label={t('builder.prompt.close') || 'Закрыть'}>
          <Icon name="close" size={12} strokeWidth={1.75} />
        </button>
      </div>
      <p className="builder-prompt-pop__hint">
        {isVision
          ? (t('builder.tool.visionHint') || 'Загрузите картинку — прикреплённый агент её «увидит» при запуске. До 1.5 МБ.')
          : (t('builder.tool.fileHint') || 'Загрузите текстовый файл — его содержимое получит прикреплённый агент.')}
      </p>
      {loadedName && (
        <div className="builder-tool-file">
          <Icon name={isVision ? 'eye' : 'file'} size={13} strokeWidth={1.5} />
          <span className="builder-tool-file__name">{loadedName}</span>
        </div>
      )}
      <div className="builder-prompt-pop__actions">
        <button type="button" className="builder-btn builder-btn--ghost builder-btn--small" onClick={() => fileRef.current?.click()}>
          <Icon name="archive" size={12} strokeWidth={1.5} />
          <span>{loadedName ? (t('builder.tool.replace') || 'Заменить') : (t('builder.tool.upload') || 'Загрузить')}</span>
        </button>
        {loadedName && (
          <button type="button" className="builder-btn builder-btn--ghost builder-btn--small" onClick={clear}>
            <span>{t('builder.prompt.clear') || 'Очистить'}</span>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept={isVision ? 'image/*' : '.txt,.md,.json,.csv,text/*'}
          style={{ display: 'none' }}
          onChange={onFile}
        />
      </div>
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
      className="builder-prompt-pop nodrag nopan nowheel"
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
            className="builder-prompt-pop__area nodrag nopan"
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
            className="builder-prompt-pop__area nodrag nopan"
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
      className="builder-prompt-pop nodrag nopan nowheel"
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

function NodeDetails({ node, t, onAtlasLink, onGuide }) {
  const { icon, color, labelKey, descKey, kind, role, status, atlasAnchor, defId } = node.data;
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

      {defId && onGuide && (
        <button
          type="button"
          className="builder-atlas-link builder-atlas-link--guide"
          onClick={() => onGuide(defId)}
        >
          <Icon name="idea" size={12} strokeWidth={1.5} />
          <span>{t('builder.tooltip.howTo') || 'Как использовать'}</span>
          <Icon name="arrow-right" size={12} strokeWidth={1.5} />
        </button>
      )}

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

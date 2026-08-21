/**
 * workflowStorage.js — единый storage-слой для Builder workflow.
 *
 * Роутинг по auth-состоянию:
 *   userId present  → Supabase (builder_* таблицы, RLS owner-only)
 *   userId null/anon → localStorage (сохраняет MVP-поведение)
 *   supabase === null (env не задан) → всегда localStorage (dev fallback)
 *
 * API (все async, возвращают Promise):
 *   listWorkflows(userId)            → [{ id, name, description, updatedAt, isLocal }]
 *   loadWorkflow(id, userId)         → { id, name, description, nodes, edges } | null
 *   saveWorkflow(payload, userId)    → { id }   (create или update)
 *   deleteWorkflow(id, userId)       → boolean  (soft-delete для Supabase)
 *   countWorkflows(userId)           → number
 *   migrateLocalToCloud(userId)      → { migrated, idMap }   (AuthContext, при входе)
 *
 * payload для saveWorkflow:
 *   { id?, name, description?, templateId?, rfNodes, rfEdges }
 *
 * Сериализация делегируется workflowSerializer.js (pure).
 */

import { supabase } from '../../lib/supabaseClient.js';
import {
  serializeForDb,
  deserializeFromDb,
  serializeForLocal,
  deserializeFromLocal,
} from './workflowSerializer.js';

const LS_KEY = 'atlas:builder:workflows:v1';

// ─── localStorage helpers ────────────────────────────────────────────────────

function readLocalAll() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalAll(list) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

function localId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Решает: используем ли облако.
function useCloud(userId) {
  return !!(userId && supabase);
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Список workflow (без полного содержимого — только метаданные для списка).
 */
export async function listWorkflows(userId) {
  if (!useCloud(userId)) {
    return readLocalAll()
      .filter(w => !w.isArchived)
      .map(w => ({
        id: w.id,
        name: w.name,
        description: w.description || '',
        updatedAt: w.updatedAt,
        templateId: w.templateId || null,
        isLocal: true,
      }))
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }

  const { data, error } = await supabase
    .from('builder_workflows')
    .select('id, name, description, template_id, updated_at')
    .eq('is_archived', false)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    description: row.description || '',
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : 0,
    templateId: row.template_id || null,
    isLocal: false,
  }));
}

/**
 * Полная загрузка workflow с nodes/edges (готовый React Flow формат).
 * @param edgeStyle — EDGE_STYLE из BuilderApp для консистентного вида рёбер.
 */
export async function loadWorkflow(id, userId, edgeStyle) {
  if (!useCloud(userId)) {
    const w = readLocalAll().find(x => x.id === id);
    if (!w) return null;
    const { nodes, edges } = deserializeFromLocal(w.snapshot || {}, edgeStyle);
    return {
      id: w.id,
      name: w.name,
      description: w.description || '',
      templateId: w.templateId || null,
      nodes,
      edges,
    };
  }

  // Cloud: один запрос на workflow + параллельно nodes/edges.
  const [wfRes, nodesRes, edgesRes] = await Promise.all([
    supabase.from('builder_workflows').select('*').eq('id', id).single(),
    supabase.from('builder_workflow_nodes').select('*').eq('workflow_id', id),
    supabase.from('builder_workflow_edges').select('*').eq('workflow_id', id),
  ]);

  if (wfRes.error) throw wfRes.error;
  if (!wfRes.data) return null;
  if (nodesRes.error) throw nodesRes.error;
  if (edgesRes.error) throw edgesRes.error;

  const { nodes, edges } = deserializeFromDb(nodesRes.data, edgesRes.data, edgeStyle);
  return {
    id: wfRes.data.id,
    name: wfRes.data.name,
    description: wfRes.data.description || '',
    templateId: wfRes.data.template_id || null,
    nodes,
    edges,
  };
}

/**
 * Создать или обновить workflow.
 * @returns {{ id: string }}
 */
export async function saveWorkflow(payload, userId) {
  const { id, name, description, templateId, rfNodes, rfEdges } = payload;

  if (!useCloud(userId)) {
    const list = readLocalAll();
    const snapshot = serializeForLocal(rfNodes, rfEdges);
    const now = Date.now();
    if (id) {
      const idx = list.findIndex(w => w.id === id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], name, description, templateId, snapshot, updatedAt: now };
        writeLocalAll(list);
        return { id };
      }
    }
    const newId = localId();
    list.push({
      id: newId, name, description: description || '', templateId: templateId || null,
      snapshot, isArchived: false, createdAt: now, updatedAt: now,
    });
    writeLocalAll(list);
    return { id: newId };
  }

  // Cloud path.
  const { nodes, edges } = serializeForDb(rfNodes, rfEdges);

  // 1. Upsert workflow row. Локальный id (гость вошёл, не перезагружая
  //    страницу) в облаке не существует — создаём новую запись.
  let workflowId = id && !String(id).startsWith('local-') ? id : null;
  if (workflowId) {
    const { error } = await supabase
      .from('builder_workflows')
      .update({ name, description, template_id: templateId })
      .eq('id', workflowId);
    if (error) throw error;
  } else {
    const { data, error } = await supabase
      .from('builder_workflows')
      .insert({ user_id: userId, name, description, template_id: templateId })
      .select('id')
      .single();
    if (error) throw error;
    workflowId = data.id;
  }

  // 2. Replace nodes/edges (delete-then-insert — простая стратегия для B-2.1).
  //    Транзакционность пока не критична: одиночный пользователь, single-save.
  const isFresh = !id || workflowId !== id;
  try {
    await supabase.from('builder_workflow_nodes').delete().eq('workflow_id', workflowId);
    await supabase.from('builder_workflow_edges').delete().eq('workflow_id', workflowId);

    if (nodes.length > 0) {
      const { error: nErr } = await supabase
        .from('builder_workflow_nodes')
        .insert(nodes.map(n => ({ ...n, workflow_id: workflowId })));
      if (nErr) throw nErr;
    }
    if (edges.length > 0) {
      const { error: eErr } = await supabase
        .from('builder_workflow_edges')
        .insert(edges.map(e => ({ ...e, workflow_id: workflowId })));
      if (eErr) throw eErr;
    }
  } catch (e) {
    // Строка схемы уже создана, а содержимое не легло — не оставляем пустую
    // «болванку» в списке (при переезде гостя она бы ещё и задвоилась).
    if (isFresh) {
      await supabase.from('builder_workflows').delete().eq('id', workflowId);
    }
    throw e;
  }

  return { id: workflowId };
}

/**
 * Soft-delete (cloud) или удаление из массива (local).
 */
export async function deleteWorkflow(id, userId) {
  if (!useCloud(userId)) {
    const list = readLocalAll();
    const next = list.filter(w => w.id !== id);
    writeLocalAll(next);
    return true;
  }
  const { error } = await supabase
    .from('builder_workflows')
    .update({ is_archived: true })
    .eq('id', id);
  if (error) throw error;
  // Удаляем расписания удалённой схемы — иначе серверный планировщик продолжит
  // запускать её в фоне (схема «мягко» архивируется, поэтому FK-каскад не сработал
  // бы). RLS owner-only гарантирует, что трогаем только свои.
  await supabase.from('builder_schedules').delete().eq('workflow_id', id);
  return true;
}

/**
 * Переименовать workflow (только имя; узлы/связи не трогаем).
 */
export async function renameWorkflow(id, name, userId) {
  const clean = String(name || '').trim();
  if (!clean) return false;
  if (!useCloud(userId)) {
    const list = readLocalAll();
    const next = list.map(w => (w.id === id ? { ...w, name: clean, updatedAt: Date.now() } : w));
    writeLocalAll(next);
    return true;
  }
  const { error } = await supabase
    .from('builder_workflows')
    .update({ name: clean })
    .eq('id', id);
  if (error) throw error;
  return true;
}

/**
 * Количество активных workflow (для tier-лимитов в будущем).
 */
export async function countWorkflows(userId) {
  if (!useCloud(userId)) {
    return readLocalAll().filter(w => !w.isArchived).length;
  }
  const { count, error } = await supabase
    .from('builder_workflows')
    .select('id', { count: 'exact', head: true })
    .eq('is_archived', false);
  if (error) throw error;
  return count || 0;
}

/** Событие «схемы гостя переехали в аккаунт» — списки в конструкторе обновляются. */
export const WORKFLOWS_MIGRATED_EVENT = 'atlas:builder:workflows-migrated';
// Соответствие «локальный id → облачный id» после переезда. Нужно потоку
// «возврат после входа»: черновик, который гость понёс на вход, должен лечь
// поверх уже переехавшей схемы, а не стать второй копией.
const MIGRATED_IDS_KEY = 'atlas:builder:migrated-ids';

// В localStorage, а не sessionStorage: переезд выполняет одна вкладка (замок),
// а черновик может ждать восстановления в соседней. Карту не стираем при
// чтении — она маленькая и перезаписывается следующим переездом.
export function takeMigratedIdMap() {
  try {
    const raw = localStorage.getItem(MIGRATED_IDS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

/**
 * Переезд схем гостя в аккаунт при входе. Вызывается из AuthContext после
 * успешного слияния прогресса (см. runSync). Архивные не переносим.
 * @returns {{ migrated: number, idMap: Record<string,string> }}
 */
export async function migrateLocalToCloud(userId) {
  if (!useCloud(userId)) return { migrated: 0, idMap: {} };
  // Вход приходит во все открытые вкладки сразу; без замка каждая вставила бы
  // схемы ещё раз. Внутри замка список перечитывается — во второй вкладке он
  // уже пуст. Где Web Locks нет — работаем без замка (старые браузеры).
  if (typeof navigator !== 'undefined' && navigator.locks?.request) {
    return navigator.locks.request('atlas:builder:migrate', () => migrateLocalToCloudUnlocked(userId));
  }
  return migrateLocalToCloudUnlocked(userId);
}

async function migrateLocalToCloudUnlocked(userId) {
  const local = readLocalAll().filter(w => !w.isArchived);
  if (local.length === 0) return { migrated: 0, idMap: {} };

  const idMap = {};
  for (const w of local) {
    const { nodes, edges } = deserializeFromLocal(w.snapshot || {});
    try {
      const { id } = await saveWorkflow(
        { name: w.name, description: w.description, templateId: w.templateId, rfNodes: nodes, rfEdges: edges },
        userId
      );
      idMap[w.id] = id;
    } catch {
      // сбойную оставляем локально, остальные переносим
    }
  }
  // Локально остаются только те, что не переехали: иначе после выхода они
  // всплыли бы второй копией.
  const migrated = Object.keys(idMap).length;
  if (migrated > 0) {
    writeLocalAll(readLocalAll().filter(w => w.isArchived || !idMap[w.id]));
    try { localStorage.setItem(MIGRATED_IDS_KEY, JSON.stringify(idMap)); } catch { /* noop */ }
    try { window.dispatchEvent(new CustomEvent(WORKFLOWS_MIGRATED_EVENT, { detail: { idMap } })); } catch { /* SSR */ }
  }
  return { migrated, idMap };
}

/** Есть ли локальные workflow (для предложения миграции). */
export function hasLocalWorkflows() {
  return readLocalAll().filter(w => !w.isArchived).length > 0;
}

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
 *   migrateLocalToCloud(userId)      → { migrated: number }  (при first signup)
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

  // 1. Upsert workflow row.
  let workflowId = id;
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

/**
 * Миграция локальных workflow в облако при первом входе.
 * Вызывается из UI после signup с подтверждением пользователя.
 * @returns {{ migrated: number }}
 */
export async function migrateLocalToCloud(userId) {
  if (!useCloud(userId)) return { migrated: 0 };
  const local = readLocalAll().filter(w => !w.isArchived);
  if (local.length === 0) return { migrated: 0 };

  let migrated = 0;
  for (const w of local) {
    const { nodes, edges } = deserializeFromLocal(w.snapshot || {});
    try {
      await saveWorkflow(
        { name: w.name, description: w.description, templateId: w.templateId, rfNodes: nodes, rfEdges: edges },
        userId
      );
      migrated++;
    } catch {
      // Пропускаем сбойный, продолжаем остальные.
    }
  }
  // После успешной миграции очищаем локальные, чтобы не дублировать.
  if (migrated > 0) writeLocalAll([]);
  return { migrated };
}

/** Есть ли локальные workflow (для предложения миграции). */
export function hasLocalWorkflows() {
  return readLocalAll().filter(w => !w.isArchived).length > 0;
}

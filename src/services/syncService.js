/**
 * syncService.js — миграция localStorage прогресса → Supabase при первом логине.
 *
 * Стратегия: при входе один раз читаем localStorage, пишем в Supabase,
 * не удаляем из localStorage (он остаётся как offline fallback).
 *
 * Вызывается из AuthContext при событии SIGNED_IN.
 * Идемпотентен: повторный вызов не дублирует данные (upsert).
 */

import { supabase } from '../lib/supabaseClient.js';

const KEYS = {
  tutorials:   'claude-mindmap.tutorial-progress.v1',
  nodeProgress:'claude-mindmap:node-progress:v1',
  bookmarks:   'claude-mindmap:bookmarks:v1',
  level:       'claude-mindmap:user-level:v1',
  locale:      'claude-mindmap:locale:v1',
};

function readLocal(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Синхронизировать всё из localStorage в Supabase.
 * @param {string} userId
 * @returns {{ synced: number, errors: string[] }}
 */
export async function syncLocalToSupabase(userId) {
  if (!supabase || !userId) return { synced: 0, errors: ['Not available'] };

  const errors = [];
  let synced = 0;

  // ── 1. Tutorial progress ──────────────────────────────────────────────────
  const tutorials = readLocal(KEYS.tutorials);
  if (tutorials && typeof tutorials === 'object') {
    const rows = Object.entries(tutorials).map(([tutorial_id, p]) => ({
      user_id:         userId,
      tutorial_id,
      completed_steps: p.completedSteps || [],
      last_step_index: p.lastStepIndex  || 0,
      completed_at:    p.completedAt    || null,
      updated_at:      new Date().toISOString(),
    }));

    if (rows.length > 0) {
      const { error } = await supabase
        .from('learning_progress')
        .upsert(rows, { onConflict: 'user_id,tutorial_id' });
      if (error) errors.push(`tutorials: ${error.message}`);
      else synced += rows.length;
    }
  }

  // ── 2. Node progress ──────────────────────────────────────────────────────
  const nodeProgress = readLocal(KEYS.nodeProgress);
  if (nodeProgress && typeof nodeProgress === 'object') {
    const rows = Object.entries(nodeProgress)
      .filter(([, status]) => status === 'viewed' || status === 'review')
      .map(([node_id, status]) => ({
        user_id,
        node_id,
        status,
        updated_at: new Date().toISOString(),
      }));

    if (rows.length > 0) {
      const { error } = await supabase
        .from('node_progress')
        .upsert(rows, { onConflict: 'user_id,node_id' });
      if (error) errors.push(`nodes: ${error.message}`);
      else synced += rows.length;
    }
  }

  // ── 3. Bookmarks ──────────────────────────────────────────────────────────
  const bookmarks = readLocal(KEYS.bookmarks);
  if (Array.isArray(bookmarks)) {
    const rows = bookmarks.map(b => ({
      user_id:   userId,
      item_type: b.type,
      item_id:   b.id,
      added_at:  b.addedAt ? new Date(b.addedAt).toISOString() : new Date().toISOString(),
    }));

    if (rows.length > 0) {
      const { error } = await supabase
        .from('favorites')
        .upsert(rows, { onConflict: 'user_id,item_type,item_id' });
      if (error) errors.push(`bookmarks: ${error.message}`);
      else synced += rows.length;
    }
  }

  return { synced, errors };
}

/**
 * Пометить что sync уже был сделан для этого userId.
 * Храним в localStorage чтобы не синкать повторно при каждом входе.
 */
const SYNC_DONE_KEY = 'claude-mindmap:sync-done:v1';

/**
 * Точечный реал-тайм синк прогресса туториалов → Supabase.
 * Вызывается после каждого toggleStep пока пользователь залогинен.
 * @param {string} userId
 * @param {Object} progressMap  — { [tutorialId]: { completedSteps, lastStepIndex, completedAt } }
 */
export async function syncTutorialProgress(userId, progressMap) {
  if (!supabase || !userId || !progressMap) return;
  const rows = Object.entries(progressMap).map(([tutorial_id, p]) => ({
    user_id:         userId,
    tutorial_id,
    completed_steps: p.completedSteps || [],
    last_step_index: p.lastStepIndex  || 0,
    completed_at:    p.completedAt    || null,
    updated_at:      new Date().toISOString(),
  }));
  if (!rows.length) return;
  await supabase
    .from('learning_progress')
    .upsert(rows, { onConflict: 'user_id,tutorial_id' });
}

export function isSyncDone(userId) {
  try {
    const done = JSON.parse(localStorage.getItem(SYNC_DONE_KEY) || '{}');
    return !!done[userId];
  } catch {
    return false;
  }
}

export function markSyncDone(userId) {
  try {
    const done = JSON.parse(localStorage.getItem(SYNC_DONE_KEY) || '{}');
    done[userId] = new Date().toISOString();
    localStorage.setItem(SYNC_DONE_KEY, JSON.stringify(done));
  } catch {}
}

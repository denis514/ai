/**
 * syncService.js — перенос прогресса между браузером и облаком.
 *
 * Порядок обязателен и важен:
 *   1. pullRemoteToLocal(userId) — забрать из Supabase и СЛИТЬ с тем, что уже
 *      есть в браузере (объединение, не замена). Только после этого локальные
 *      данные можно считать полными.
 *   2. syncLocalToSupabase(userId) — записать слитый результат обратно.
 *   3. Дальше — точечные syncTutorialProgress / syncNodeProgress / syncBookmarks
 *      после каждого изменения.
 *
 * Почему порядок критичен: точечные функции считают браузер источником правды и
 * УДАЛЯЮТ из облака то, чего нет локально. Пока не подтянули облако, локальный
 * список неполон — и такая запись стирала данные, добавленные на другом
 * устройстве. Поэтому все три записи молчат, пока для этого пользователя не
 * прошёл pull (см. hydrated ниже).
 *
 * Ограничение, о котором надо знать: слияние происходит в момент входа и при
 * восстановлении сессии. Если два устройства работают ОДНОВРЕМЕННО, второе
 * узнает о правках первого только при следующем запуске. Полное решение — метки
 * времени на каждую запись, это отдельная задача.
 */

import { supabase } from '../lib/supabaseClient.js';
import { mergeTutorials, mergeNodes, mergeBookmarks } from './progressMerge.js';

const KEYS = {
  tutorials:   'claude-mindmap.tutorial-progress.v1',
  nodeProgress:'claude-mindmap:node-progress:v1',
  bookmarks:   'claude-mindmap:bookmarks:v1',
  level:       'claude-mindmap:user-level:v1',
  locale:      'claude-mindmap:locale:v1',
};

// Для каких пользователей уже подтянули облако в этом сеансе страницы.
// Пока пользователя здесь нет — писать в облако нельзя (см. комментарий выше).
const hydrated = new Set();

/** Подтянуто ли облако для этого пользователя в текущем сеансе. */
export function isHydrated(userId) {
  return !!userId && hydrated.has(userId);
}

/** Событие «локальные данные заменены» — хуки перечитывают localStorage. */
export const LOCAL_HYDRATED_EVENT = 'atlas:local-hydrated';

function writeLocal(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* приватный режим */ }
}

function readLocal(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Забрать данные из Supabase и слить с локальными.
 *
 * Правила слияния (везде — объединение, никто никого не затирает):
 *   • курсы: пройденные шаги объединяем, номер текущего шага берём больший,
 *     дату завершения — ту, что есть (облачная в приоритете: она уже подтверждена);
 *   • темы: объединяем; если статусы разные, «на повторение» сильнее «просмотрено»
 *     — это осознанная отметка пользователя, её терять обиднее;
 *   • закладки: объединяем по паре тип+id, дату добавления берём раннюю.
 *
 * После успешного слияния помечает пользователя как hydrated (разрешает запись)
 * и стреляет событием, по которому хуки перечитывают localStorage.
 */
export async function pullRemoteToLocal(userId) {
  if (!supabase || !userId) return { pulled: 0, errors: ['Not available'] };

  const errors = [];
  let pulled = 0;

  try {
    const [tutRes, nodeRes, favRes] = await Promise.all([
      supabase.from('learning_progress')
        .select('tutorial_id, completed_steps, last_step_index, completed_at')
        .eq('user_id', userId),
      supabase.from('node_progress').select('node_id, status').eq('user_id', userId),
      supabase.from('favorites').select('item_type, item_id, added_at').eq('user_id', userId),
    ]);

    // ── Курсы ──
    if (tutRes.error) errors.push(`tutorials: ${tutRes.error.message}`);
    else {
      const rows = tutRes.data || [];
      writeLocal(KEYS.tutorials, mergeTutorials(readLocal(KEYS.tutorials) || {}, rows));
      pulled += rows.length;
    }

    // ── Темы ──
    if (nodeRes.error) errors.push(`nodes: ${nodeRes.error.message}`);
    else {
      const rows = nodeRes.data || [];
      writeLocal(KEYS.nodeProgress, mergeNodes(readLocal(KEYS.nodeProgress) || {}, rows));
      pulled += rows.length;
    }

    // ── Закладки ──
    if (favRes.error) errors.push(`bookmarks: ${favRes.error.message}`);
    else {
      const rows = favRes.data || [];
      writeLocal(KEYS.bookmarks, mergeBookmarks(readLocal(KEYS.bookmarks), rows));
      pulled += rows.length;
    }
  } catch (e) {
    errors.push(e?.message || String(e));
  }

  // Разрешаем запись в облако, даже если часть таблиц не ответила: иначе
  // пользователь вообще потеряет синхронизацию. Но если не ответило ВСЁ —
  // не разрешаем, чтобы пустой браузер не затёр облако.
  if (errors.length < 3) {
    hydrated.add(userId);
    try { window.dispatchEvent(new Event(LOCAL_HYDRATED_EVENT)); } catch { /* SSR */ }
  }

  return { pulled, errors };
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
  if (!hydrated.has(userId)) return;   // облако ещё не подтянуто — писать опасно
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

/**
 * Реал-тайм синк прогресса узлов → Supabase.
 * @param {string} userId
 * @param {Object} nodeProgressMap — { [nodeId]: 'viewed' | 'review' }
 */
export async function syncNodeProgress(userId, nodeProgressMap) {
  if (!supabase || !userId || !nodeProgressMap) return;
  if (!hydrated.has(userId)) return;   // иначе удалим из облака то, чего нет в этом браузере

  const { data: existing } = await supabase
    .from('node_progress')
    .select('node_id, status')
    .eq('user_id', userId);

  const localEntries = Object.entries(nodeProgressMap).filter(([, v]) => v);
  const localIds = new Set(localEntries.map(([id]) => id));
  const remoteIds = new Set((existing || []).map(r => r.node_id));

  // Upsert новых / изменённых
  if (localEntries.length) {
    const rows = localEntries.map(([node_id, status]) => ({
      user_id: userId, node_id, status,
      updated_at: new Date().toISOString(),
    }));
    await supabase.from('node_progress')
      .upsert(rows, { onConflict: 'user_id,node_id' });
  }

  // Удалить записи которых больше нет
  for (const { node_id } of (existing || [])) {
    if (!localIds.has(node_id)) {
      await supabase.from('node_progress')
        .delete().eq('user_id', userId).eq('node_id', node_id);
    }
  }
}

/**
 * Реал-тайм синк закладок → Supabase.
 * Вызывается при каждом toggle закладки пока пользователь залогинен.
 * @param {string} userId
 * @param {Map} bookmarksMap — Map<key, { type, id, addedAt }>
 */
export async function syncBookmarks(userId, bookmarksMap) {
  if (!supabase || !userId || !bookmarksMap) return;
  if (!hydrated.has(userId)) return;   // иначе удалим из облака то, чего нет в этом браузере

  // Получаем текущие закладки из Supabase чтобы найти удалённые
  const { data: existing } = await supabase
    .from('favorites')
    .select('item_type, item_id')
    .eq('user_id', userId);

  const localKeys = new Set(
    Array.from(bookmarksMap.values()).map(b => `${b.type}:${b.id}`)
  );
  const remoteKeys = new Set(
    (existing || []).map(r => `${r.item_type}:${r.item_id}`)
  );

  // Добавить новые
  const toAdd = Array.from(bookmarksMap.values()).filter(
    b => !remoteKeys.has(`${b.type}:${b.id}`)
  );
  if (toAdd.length) {
    const rows = toAdd.map(b => ({
      user_id:   userId,
      item_type: b.type,
      item_id:   b.id,
      added_at:  b.addedAt ? new Date(b.addedAt).toISOString() : new Date().toISOString(),
    }));
    await supabase.from('favorites').upsert(rows, { onConflict: 'user_id,item_type,item_id' });
  }

  // Удалить те что убрали из localStorage
  const toDelete = (existing || []).filter(
    r => !localKeys.has(`${r.item_type}:${r.item_id}`)
  );
  for (const r of toDelete) {
    await supabase.from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('item_type', r.item_type)
      .eq('item_id', r.item_id);
  }
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

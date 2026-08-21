/**
 * dataExport.js — одна выгрузка личных данных для всех поверхностей.
 *
 * Раньше профиль и кабинет выгружали два разных файла в двух форматах, причём
 * у вошедшего файл был беднее (без журнала активности) и ни один не включал
 * схемы конструктора — хотя текст обещал «все данные». Теперь формат один:
 *
 *   {
 *     format: '105-atlas/v2',
 *     exportedAt, gdpr_note, source: 'browser' | 'browser+cloud',
 *     data:  { <ключ localStorage>: <строка как есть> },   ← то, что можно импортировать
 *     cloud: { profile, learning_progress, … }              ← только у вошедшего, справочно
 *   }
 *
 * Импорт читает `data` (и понимает старый формат профиля — там тоже `data`).
 */

import { supabase } from '../lib/supabaseClient.js';
import { PROGRESS_KEYS, LOCAL_HYDRATED_EVENT } from './localData.js';

/** Всё личное, что лежит в браузере, включая схемы конструктора и язык. */
export const LOCAL_EXPORT_KEYS = [
  ...PROGRESS_KEYS,
  'claude-mindmap:user-level:v1', // текст сброса обещает «уровень» — держим слово
  'claude-mindmap:locale:v1',
  'atlas:builder:workflows:v1',
];

export function buildLocalDump() {
  const dump = {};
  for (const key of LOCAL_EXPORT_KEYS) {
    try { const v = localStorage.getItem(key); if (v != null) dump[key] = v; } catch { /* noop */ }
  }
  return dump;
}

async function fetchCloud(user, profile) {
  if (!supabase || !user) return null;
  const own = (table, cols = '*') => supabase.from(table).select(cols).eq('user_id', user.id);
  const [lp, np, fav, act, wf] = await Promise.all([
    own('learning_progress'),
    own('node_progress'),
    own('favorites'),
    own('activity_log', 'date'),
    own('builder_workflows', 'id, name, description, template_id, is_archived, created_at, updated_at'),
  ]);
  return {
    profile:           profile || null,
    learning_progress: lp.data  || [],
    node_progress:     np.data  || [],
    favorites:         fav.data || [],
    activity_log:      (act.data || []).map(r => r.date),
    builder_workflows: wf.data  || [],
  };
}

function download(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

/**
 * Собрать и скачать выгрузку. У вошедшего — браузер + облако, у гостя — браузер.
 * @param {{ user?: object|null, profile?: object|null }} ctx
 */
export async function exportUserData({ user = null, profile = null } = {}) {
  const cloud = await fetchCloud(user, profile).catch(() => null);
  const dump = {
    format:     '105-atlas/v2',
    exportedAt: new Date().toISOString(),
    gdpr_note:  'Your personal data export (GDPR Art. 20).',
    source:     cloud ? 'browser+cloud' : 'browser',
    data:       buildLocalDump(),
    ...(cloud ? { cloud } : {}),
  };
  download(dump, `105-atlas-data-${dump.exportedAt.slice(0, 10)}.json`);
}

/**
 * Восстановить локальные данные из выгрузки. Возвращает число ключей.
 * Понимает v2 и старый формат профиля (оба кладут ключи в `data`).
 */
export function importLocalDump(parsed) {
  const data = parsed?.data || parsed || {};
  let restored = 0;
  for (const key of LOCAL_EXPORT_KEYS) {
    if (typeof data[key] === 'string') {
      try { localStorage.setItem(key, data[key]); restored++; } catch { /* noop */ }
    }
  }
  if (restored) {
    try { window.dispatchEvent(new Event(LOCAL_HYDRATED_EVENT)); } catch { /* SSR */ }
  }
  return restored;
}

/** Стереть всё личное из браузера (прогресс, имя, язык, схемы конструктора). */
export function resetLocalData() {
  for (const key of LOCAL_EXPORT_KEYS) {
    try { localStorage.removeItem(key); } catch { /* noop */ }
  }
}

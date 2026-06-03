/**
 * scheduleService.js — клиентский CRUD для расписаний автозапуска.
 *
 * Пишет/читает builder_schedules напрямую (RLS owner-only — пользователь видит
 * только свои). Сам ЗАПУСК по расписанию делает сервер (builder-scheduler по cron),
 * не браузер — поэтому работает, даже когда компьютер выключен.
 *
 * Требует входа (для anon — расписаний нет, только облако). next_run_at и реальный
 * прогон считает сервер; клиент лишь задаёт частоту/время/задачу.
 */

import { supabase } from '../../lib/supabaseClient.js';

// Вычислить ближайший next_run_at (UTC, ISO) — чтобы сервер подхватил вовремя.
// Сервер пересчитывает дальше сам; здесь — стартовое значение.
function computeNext(freq, hour, minute, weekday) {
  const now = new Date();
  const n = new Date(now);
  n.setUTCSeconds(0, 0);
  if (freq === 'minutes') {
    const step = Math.min(Math.max(minute || 1, 1), 59);
    n.setUTCMinutes(n.getUTCMinutes() + step);
    return n.toISOString();
  }
  if (freq === 'hourly') {
    n.setUTCMinutes(minute);
    if (n <= now) n.setUTCHours(n.getUTCHours() + 1);
    return n.toISOString();
  }
  if (freq === 'weekly') {
    n.setUTCHours(hour, minute, 0, 0);
    const target = ((weekday ?? 1) % 7 + 7) % 7;
    let add = (target - n.getUTCDay() + 7) % 7;
    if (add === 0 && n <= now) add = 7;
    n.setUTCDate(n.getUTCDate() + add);
    return n.toISOString();
  }
  n.setUTCHours(hour, minute, 0, 0);
  if (n <= now) n.setUTCDate(n.getUTCDate() + 1);
  return n.toISOString();
}

export async function listSchedules(workflowId) {
  if (!supabase || !workflowId) return [];
  const { data, error } = await supabase
    .from('builder_schedules')
    .select('*')
    .eq('workflow_id', workflowId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

/**
 * Все расписания пользователя по ВСЕМ схемам (а не только по открытой).
 * Дополняет каждую запись именем схемы (workflowName) для отображения.
 * RLS owner-only — вернёт только свои.
 */
export async function listAllSchedules() {
  if (!supabase) return [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data: rows, error } = await supabase
    .from('builder_schedules')
    .select('*')
    .order('enabled', { ascending: false })
    .order('last_run_at', { ascending: false, nullsFirst: false });
  if (error) throw error;
  const schedules = rows || [];
  // Подтягиваем имена схем одним запросом.
  const ids = [...new Set(schedules.map(s => s.workflow_id).filter(Boolean))];
  let nameById = {};
  if (ids.length) {
    const { data: wfs } = await supabase
      .from('builder_workflows')
      .select('id, name')
      .in('id', ids);
    nameById = Object.fromEntries((wfs || []).map(w => [w.id, w.name]));
  }
  return schedules.map(s => ({ ...s, workflowName: nameById[s.workflow_id] || null }));
}

/**
 * Аварийная остановка: выключить ВСЕ включённые расписания пользователя.
 * Возвращает количество затронутых строк. RLS гарантирует, что только свои.
 */
export async function disableAllSchedules() {
  if (!supabase) throw new Error('backend_unavailable');
  const { data, error } = await supabase
    .from('builder_schedules')
    .update({ enabled: false })
    .eq('enabled', true)
    .select('id');
  if (error) throw error;
  return (data || []).length;
}

/**
 * Расход за сегодня (UTC-сутки) — для «защиты кошелька».
 * @returns {{ runs: number, tokens: number }}
 */
export async function getTodayUsage() {
  if (!supabase) return { runs: 0, tokens: 0 };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { runs: 0, tokens: 0 };
  const sod = new Date(); sod.setUTCHours(0, 0, 0, 0);
  const { data, error } = await supabase
    .from('builder_executions')
    .select('tokens_used')
    .eq('user_id', user.id)
    .gte('created_at', sod.toISOString());
  if (error || !data) return { runs: 0, tokens: 0 };
  return {
    runs: data.length,
    tokens: data.reduce((s, r) => s + (r.tokens_used || 0), 0),
  };
}

/**
 * История последних прогонов пользователя (по всем схемам) — для «журнала
 * автозапусков» в UI. Дополняет именем схемы. RLS owner-only.
 * @param {number} limit
 * @returns {Array<{id, workflowName, status, tokens_used, error_message, created_at, completed_at, scheduled}>}
 */
export async function listRecentRuns(limit = 20) {
  if (!supabase) return [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data: rows, error } = await supabase
    .from('builder_executions')
    .select('id, workflow_id, status, tokens_used, error_message, input_data, created_at, completed_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error || !rows) return [];
  const ids = [...new Set(rows.map(r => r.workflow_id).filter(Boolean))];
  let nameById = {};
  if (ids.length) {
    const { data: wfs } = await supabase
      .from('builder_workflows').select('id, name').in('id', ids);
    nameById = Object.fromEntries((wfs || []).map(w => [w.id, w.name]));
  }
  return rows.map(r => ({
    ...r,
    workflowName: nameById[r.workflow_id] || null,
    // Эвристика: автозапуск идёт без текста задачи (движок берёт её из «Старта»),
    // ручной — с введённым input. Не 100%, но для метки «по расписанию» достаточно.
    scheduled: !((r.input_data && r.input_data.input) || '').toString().trim(),
  }));
}

export async function createSchedule({ workflowId, frequency, hour, minute, weekday, tier, locale }) {
  if (!supabase) throw new Error('backend_unavailable');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('not_authenticated');
  const row = {
    workflow_id: workflowId,
    user_id: user.id,
    frequency: frequency || 'daily',
    hour: hour ?? 9,
    minute: minute ?? 0,
    weekday: frequency === 'weekly' ? (weekday ?? 1) : null,
    // Задачу не храним: при запуске движок берёт её из узла «Старт» схемы.
    input: '',
    tier: tier || 's',
    locale: locale || 'ru',
    enabled: true,
    next_run_at: computeNext(frequency, hour ?? 9, minute ?? 0, weekday),
  };
  const { data, error } = await supabase.from('builder_schedules').insert(row).select().single();
  if (error) throw error;
  return data;
}

export async function toggleSchedule(id, enabled) {
  if (!supabase) throw new Error('backend_unavailable');
  const { error } = await supabase.from('builder_schedules').update({ enabled }).eq('id', id);
  if (error) throw error;
}

export async function deleteSchedule(id) {
  if (!supabase) throw new Error('backend_unavailable');
  const { error } = await supabase.from('builder_schedules').delete().eq('id', id);
  if (error) throw error;
}

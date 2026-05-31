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

export async function createSchedule({ workflowId, frequency, hour, minute, weekday, input, tier, locale }) {
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
    input: input || '',
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

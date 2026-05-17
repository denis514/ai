/**
 * useSupabaseStats — читает статистику пользователя из Supabase.
 *
 * Используется в ProfilePanel когда пользователь авторизован.
 * Fallback на localStorage-апи когда Supabase недоступен или пользователь guest.
 *
 * Возвращает:
 *   tutorialsDone    — кол-во завершённых туториалов
 *   tutorialsStarted — кол-во начатых
 *   nodesViewed      — кол-во просмотренных узлов
 *   nodesReview      — кол-во в "review"
 *   bookmarksCount   — кол-во закладок
 *   streak           — текущий streak (дней подряд)
 *   totalDays        — всего дней использования
 *   loading          — true пока данные грузятся
 */

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';

const ACTIVITY_KEY = 'claude-mindmap:activity-log:v1';

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function computeStreak(sortedDates) {
  if (!sortedDates.length) return 0;
  const today = todayKey();
  const set = new Set(sortedDates);
  if (!set.has(today)) return 0;
  let streak = 0;
  let cursor = new Date(today);
  while (true) {
    const key = cursor.toISOString().slice(0,10);
    if (set.has(key)) { streak++; cursor.setDate(cursor.getDate()-1); }
    else break;
  }
  return streak;
}

// Записать сегодняшний визит в Supabase activity_log
async function recordTodayActivity(userId) {
  if (!supabase || !userId) return;
  const today = todayKey();
  await supabase
    .from('activity_log')
    .upsert({ user_id: userId, date: today }, { onConflict: 'user_id,date', ignoreDuplicates: true });
}

// Получить все даты активности из Supabase
async function fetchActivityDates(userId) {
  if (!supabase || !userId) return [];
  const { data } = await supabase
    .from('activity_log')
    .select('date')
    .eq('user_id', userId)
    .order('date', { ascending: true });
  return (data || []).map(r => r.date);
}

export function useSupabaseStats(userId) {
  const [stats, setStats] = useState({
    tutorialsDone: 0,
    tutorialsStarted: 0,
    nodesViewed: 0,
    nodesReview: 0,
    bookmarksCount: 0,
    streak: 0,
    totalDays: 0,
    loading: true,
  });

  const load = useCallback(async () => {
    if (!supabase || !userId) {
      setStats(s => ({ ...s, loading: false }));
      return;
    }

    // Записываем сегодняшний визит
    await recordTodayActivity(userId);

    // Параллельно грузим все данные
    const [progressRes, nodeRes, favRes, dates] = await Promise.all([
      supabase.from('learning_progress').select('completed_at,completed_steps,last_step_index').eq('user_id', userId),
      supabase.from('node_progress').select('status').eq('user_id', userId),
      supabase.from('favorites').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      fetchActivityDates(userId),
    ]);

    const progress = progressRes.data || [];
    const nodes    = nodeRes.data   || [];

    const tutorialsDone    = progress.filter(p => !!p.completed_at).length;
    const tutorialsStarted = progress.filter(p =>
      !p.completed_at && ((p.completed_steps?.length || 0) > 0 || (p.last_step_index || 0) > 0)
    ).length;
    const nodesViewed  = nodes.filter(n => n.status === 'viewed').length;
    const nodesReview  = nodes.filter(n => n.status === 'review').length;
    const bookmarksCount = favRes.count || 0;
    const streak     = computeStreak(dates);
    const totalDays  = dates.length;

    setStats({
      tutorialsDone,
      tutorialsStarted,
      nodesViewed,
      nodesReview,
      bookmarksCount,
      streak,
      totalDays,
      loading: false,
    });
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  return { ...stats, refresh: load };
}

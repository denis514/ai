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
    // ID-списки для навигации по карте из ProfilePanel.
    // Источник правды — Supabase, а не localStorage.
    viewedIds: [],
    reviewIds: [],
    bookmarkNodeIds: [],
    streak: 0,
    totalDays: 0,
    loading: true,
  });

  const load = useCallback(async () => {
    if (!supabase || !userId) {
      setStats(s => ({ ...s, loading: false }));
      return;
    }

    try {
      // Записываем сегодняшний визит
      await recordTodayActivity(userId);

      // Параллельно грузим все данные.
      // node_progress теперь возвращает node_id + status (для ID-списков).
      // favorites возвращает item_id + item_type (для bookmarkNodeIds).
      const [progressRes, nodeRes, favRes, dates] = await Promise.all([
        supabase.from('learning_progress').select('completed_at,completed_steps,last_step_index').eq('user_id', userId),
        supabase.from('node_progress').select('node_id,status').eq('user_id', userId),
        supabase.from('favorites').select('item_id,item_type').eq('user_id', userId),
        fetchActivityDates(userId),
      ]);

      const progress = progressRes.data || [];
      const nodes    = nodeRes.data   || [];
      const favs     = favRes.data    || [];

      const tutorialsDone    = progress.filter(p => !!p.completed_at).length;
      const tutorialsStarted = progress.filter(p =>
        !p.completed_at && ((p.completed_steps?.length || 0) > 0 || (p.last_step_index || 0) > 0)
      ).length;

      const viewedNodes  = nodes.filter(n => n.status === 'viewed');
      const reviewNodes  = nodes.filter(n => n.status === 'review');
      const bookmarkFavs = favs.filter(f => f.item_type === 'node');

      const nodesViewed  = viewedNodes.length;
      const nodesReview  = reviewNodes.length;
      const bookmarksCount = bookmarkFavs.length;
      const viewedIds    = viewedNodes.map(n => n.node_id).filter(Boolean);
      const reviewIds    = reviewNodes.map(n => n.node_id).filter(Boolean);
      const bookmarkNodeIds = bookmarkFavs.map(f => f.item_id).filter(Boolean);

      const streak    = computeStreak(dates);
      const totalDays = dates.length;

      setStats({
        tutorialsDone,
        tutorialsStarted,
        nodesViewed,
        nodesReview,
        bookmarksCount,
        viewedIds,
        reviewIds,
        bookmarkNodeIds,
        streak,
        totalDays,
        loading: false,
      });
    } catch {
      // Сетевая ошибка или RLS-исключение — сбрасываем loading чтобы не зависнуть
      setStats(s => ({ ...s, loading: false }));
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  return { ...stats, refresh: load };
}

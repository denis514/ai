/**
 * progressMerge.js — правила слияния прогресса «браузер + облако».
 *
 * Вынесено из syncService.js отдельно и намеренно без единой зависимости:
 * это самая опасная часть переноса (ошибка = потерянный прогресс), и её надо
 * уметь проверять обычным `node`, без Vite и без сети.
 * Проверки: scratch/merge_test.mjs (см. комментарий в syncService.js).
 *
 * Общее правило: слияние НИКОГДА не удаляет. Что было хотя бы с одной стороны —
 * остаётся.
 */

/** Курсы: шаги объединяем, номер шага берём больший, дату завершения не теряем. */
export function mergeTutorials(local = {}, remoteRows = []) {
  const out = { ...local };
  for (const row of remoteRows) {
    const cur = out[row.tutorial_id] || {};
    const steps = new Set([...(cur.completedSteps || []), ...(row.completed_steps || [])]);
    out[row.tutorial_id] = {
      ...cur,
      completedSteps: [...steps],
      lastStepIndex: Math.max(cur.lastStepIndex || 0, row.last_step_index || 0),
      completedAt: row.completed_at || cur.completedAt || null,
    };
  }
  return out;
}

/** Темы: объединяем; «на повторение» сильнее «просмотрено» — это осознанная отметка. */
export function mergeNodes(local = {}, remoteRows = []) {
  const out = { ...local };
  for (const row of remoteRows) {
    const cur = out[row.node_id];
    out[row.node_id] = (cur === 'review' || row.status === 'review') ? 'review' : (row.status || cur);
  }
  return out;
}

/** Закладки: объединяем по паре тип+id, дату добавления берём раннюю. */
export function mergeBookmarks(local = [], remoteRows = []) {
  const byKey = new Map(
    (Array.isArray(local) ? local : [])
      .filter(b => b && b.type && b.id)
      .map(b => [`${b.type}:${b.id}`, b])
  );
  for (const row of remoteRows) {
    const key = `${row.item_type}:${row.item_id}`;
    const cur = byKey.get(key);
    const remoteAdded = row.added_at || new Date().toISOString();
    byKey.set(key, {
      type: row.item_type,
      id: row.item_id,
      addedAt: cur?.addedAt && cur.addedAt < remoteAdded ? cur.addedAt : remoteAdded,
    });
  }
  return [...byKey.values()];
}


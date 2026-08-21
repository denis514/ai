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

/** Курсы: шаги объединяем, номер шага берём больший, даты начала/завершения не теряем. */
export function mergeTutorials(local = {}, remoteRows = []) {
  const out = { ...local };
  for (const row of remoteRows) {
    const cur = out[row.tutorial_id] || {};
    const steps = new Set([...(cur.completedSteps || []), ...(row.completed_steps || [])]);
    // Дату начала берём раннюю: «начал» — это первое касание, где бы оно ни было.
    const starts = [cur.startedAt, row.started_at]
      .filter(Boolean)
      .sort((a, b) => Date.parse(a) - Date.parse(b)); // форматы ISO различаются (Z / +00:00)
    out[row.tutorial_id] = {
      ...cur,
      completedSteps: [...steps],
      lastStepIndex: Math.max(cur.lastStepIndex || 0, row.last_step_index || 0),
      completedAt: row.completed_at || cur.completedAt || null,
      startedAt: starts[0] || null,
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


/** Дни активности: объединение дат YYYY-MM-DD, по возрастанию. */
export function mergeActivity(local = [], remoteDates = []) {
  const set = new Set([
    ...(Array.isArray(local) ? local : []),
    ...(Array.isArray(remoteDates) ? remoteDates : []),
  ].filter(d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)));
  return [...set].sort();
}

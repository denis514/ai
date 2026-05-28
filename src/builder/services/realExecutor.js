/**
 * realExecutor.js — реальный запуск workflow через edge function + Realtime.
 *
 * API зеркалит mockExecutor.createExecution: { onUpdate, onLog, onComplete }.
 * Отличия: нужны workflowId (сохранённый) + input. Статус узлов прилетает
 * вживую через подписку на builder_execution_logs (Realtime).
 *
 * Поток:
 *   1. Сгенерировать executionId (uuid) на клиенте.
 *   2. Подписаться на логи этого executionId (Realtime) — ДО вызова функции.
 *   3. После SUBSCRIBED — вызвать edge function builder-execute.
 *   4. Каждая лог-строка → onUpdate(nodeId, status) + onLog(entry).
 *   5. UPDATE execution.status в completed/failed → onComplete.
 *
 * Возвращает { stop(), executionId }.
 */

import { supabase } from '../../lib/supabaseClient.js';

const FN_URL = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/builder-execute`
  : null;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function createRealExecution({ workflowId, input, onUpdate, onLog, onComplete }) {
  const executionId =
    (crypto.randomUUID && crypto.randomUUID()) ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  let channel = null;
  let done = false;

  function cleanup() {
    try { if (channel) supabase.removeChannel(channel); } catch { /* noop */ }
    channel = null;
  }
  function finish(status) {
    if (done) return;
    done = true;
    cleanup();
    onComplete?.(status);
  }

  if (!supabase || !FN_URL) {
    onLog?.({ level: 'error', message: 'Backend unavailable', ts: new Date().toISOString() });
    Promise.resolve().then(() => finish('failed'));
    return { stop: () => finish('stopped'), executionId };
  }

  channel = supabase
    .channel(`exec-${executionId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'builder_execution_logs', filter: `execution_id=eq.${executionId}` },
      (payload) => {
        const row = payload.new || {};
        const status = row.data?.status;
        if (row.node_client_id && status) onUpdate?.(row.node_client_id, status);
        if (row.message) {
          onLog?.({
            level: row.level || 'info',
            nodeId: row.node_client_id || null,
            message: row.message,
            ts: row.created_at || new Date().toISOString(),
          });
        }
      },
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'builder_executions', filter: `id=eq.${executionId}` },
      (payload) => {
        const st = payload.new?.status;
        if (st === 'completed' || st === 'failed') finish(st);
      },
    )
    .subscribe(async (state) => {
      if (state !== 'SUBSCRIBED') return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          onLog?.({ level: 'error', message: 'Not signed in', ts: new Date().toISOString() });
          return finish('failed');
        }
        const res = await fetch(FN_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: ANON,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ executionId, workflowId, input }),
        });
        const out = await res.json().catch(() => ({}));
        if (!res.ok) {
          onLog?.({ level: 'error', message: out.error || `http_${res.status}`, ts: new Date().toISOString() });
          return finish('failed');
        }
        // Функция завершилась — финал (на случай если UPDATE-событие не дошло).
        finish(out.status || 'completed');
      } catch (e) {
        onLog?.({ level: 'error', message: e.message || 'request failed', ts: new Date().toISOString() });
        finish('failed');
      }
    });

  return { stop: () => finish('stopped'), executionId };
}

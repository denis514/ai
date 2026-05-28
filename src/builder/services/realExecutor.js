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

export function createRealExecution({ workflowId, input, tier, locale, onUpdate, onLog, onComplete, onResult }) {
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

  // Завершение с дочиткой: перед закрытием канала вычитываем ВСЕ логи из БД и
  // применяем последний статус по каждому узлу. Закрывает гонку, при которой
  // Realtime-событие статуса ПОСЛЕДНЕГО узла приходит уже после HTTP-ответа
  // функции (узел иначе «зависает» в running). Идемпотентно.
  async function settle(status) {
    if (done) return;
    try {
      const { data: logs } = await supabase
        .from('builder_execution_logs')
        .select('node_client_id, data, created_at')
        .eq('execution_id', executionId)
        .order('created_at', { ascending: true });
      if (logs) {
        for (const r of logs) {
          const st = r.data?.status;
          if (r.node_client_id && st) onUpdate?.(r.node_client_id, st);
        }
      }
    } catch { /* noop — финал всё равно вызовем */ }
    finish(status);
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
        if (st === 'completed' || st === 'failed') settle(st);
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
          body: JSON.stringify({ executionId, workflowId, input, tier, locale }),
        });
        const out = await res.json().catch(() => ({}));
        if (!res.ok) {
          onLog?.({ level: 'error', message: out.error || `http_${res.status}`, ts: new Date().toISOString() });
          return finish('failed');
        }
        if (out.output != null) onResult?.({ output: out.output, tokensUsed: out.tokensUsed || 0 });
        // Функция завершилась — дочитываем финальные статусы узлов и финализируем
        // (закрывает гонку: статус последнего узла мог не успеть прийти по Realtime).
        settle(out.status || 'completed');
      } catch (e) {
        onLog?.({ level: 'error', message: e.message || 'request failed', ts: new Date().toISOString() });
        finish('failed');
      }
    });

  return { stop: () => finish('stopped'), executionId };
}

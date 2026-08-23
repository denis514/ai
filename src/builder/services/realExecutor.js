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

export function createRealExecution({ workflowId, input, tier, locale, variables, onUpdate, onLog, onComplete, onResult }) {
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
            // Токены шага (если есть в data) — для счётчика по узлу.
            tokens: typeof row.data?.tokens === 'number' ? row.data.tokens : undefined,
            // Живой прогресс шага (поток с сервера): заменяет предыдущую строку
            // того же узла, а не добавляется новой (см. BuilderApp.onLog).
            progress: !!row.data?.progress,
            liveTokens: typeof row.data?.liveTokens === 'number' ? row.data.liveTokens : undefined,
            liveSearch: typeof row.data?.liveSearch === 'string' ? row.data.liveSearch : undefined,
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
          body: JSON.stringify({ executionId, workflowId, input, tier, locale, variables: variables || {} }),
        });
        const out = await res.json().catch(() => ({}));
        if (!res.ok) {
          // Понятные сообщения на языке интерфейса (раньше — только по-русски,
          // а неизвестные коды вроде http_500 показывались как есть).
          // daily_limit — говорим правду: расписания ВЫКЛЮЧЕНЫ, сами не включатся.
          const F = {
            ru: {
              already_running: 'Предыдущий запуск ещё идёт — дождитесь его окончания.',
              daily_limit: 'Достигнут дневной лимит запусков. Все автозапуски выключены, чтобы не тратить лишнее. Лимит обновляется в 00:00 UTC — после этого включите нужные заново в окне «Все автозапуски».',
              no_api_key: 'Не подключён ключ Claude — добавьте его в окне «Ключи».',
              empty_workflow: 'Схема пустая — добавьте блоки.',
              _default: 'Запуск не удался. Попробуйте ещё раз; если повторится — напишите нам.',
            },
            en: {
              already_running: 'The previous run is still going — wait for it to finish.',
              daily_limit: 'Daily run limit reached. All autoruns are switched off to avoid extra spend. The limit resets at 00:00 UTC — re-enable the ones you need in “All autoruns” after that.',
              no_api_key: 'Claude key is not connected — add it in “Keys”.',
              empty_workflow: 'The scheme is empty — add blocks.',
              _default: 'The run failed. Try again; if it repeats, contact us.',
            },
            fi: {
              already_running: 'Edellinen ajo on vielä kesken — odota sen päättymistä.',
              daily_limit: 'Päivän ajoraja täynnä. Kaikki automaattiajot on kytketty pois ylimääräisen kulutuksen välttämiseksi. Raja nollautuu klo 00:00 UTC — kytke tarvittavat uudelleen päälle kohdassa ”Kaikki automaattiajot”.',
              no_api_key: 'Claude-avainta ei ole yhdistetty — lisää se kohdassa ”Avaimet”.',
              empty_workflow: 'Kaavio on tyhjä — lisää lohkoja.',
              _default: 'Ajo epäonnistui. Yritä uudelleen; jos toistuu, ota yhteyttä.',
            },
          };
          const dict = F[locale] || F.en;
          const msg = dict[out.error] || dict._default;
          console.error('[builder] run rejected', out.error || res.status);
          onLog?.({ level: 'error', message: msg, ts: new Date().toISOString() });
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

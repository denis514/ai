/**
 * webhookService.js — вебхук-триггеры схемы (запуск по внешнему событию).
 *
 * Пишет/читает builder_webhooks напрямую (RLS owner-only). Токен генерируется
 * в браузере (случайный) и хранится в БД; сам запуск делает публичная функция
 * builder-webhook по этому токену. Один вебхук на схему (UNIQUE workflow_id).
 */

import { supabase } from '../../lib/supabaseClient.js';

const FN_BASE = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
  : null;

/** Случайный токен (32 байта → hex). */
function genToken() {
  const a = new Uint8Array(32);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Полная публичная ссылка вебхука по токену. */
export function webhookUrl(token) {
  return token && FN_BASE ? `${FN_BASE}/builder-webhook/${token}` : '';
}

/** Получить вебхук схемы (или null). */
export async function getWebhook(workflowId) {
  if (!supabase || !workflowId) return null;
  const { data, error } = await supabase
    .from('builder_webhooks')
    .select('id, token, enabled, tier, locale, last_triggered_at')
    .eq('workflow_id', workflowId)
    .maybeSingle();
  if (error) return null;
  return data || null;
}

/** Создать вебхук (если ещё нет) и включить. Возвращает запись. */
export async function ensureWebhook(workflowId, { tier = 's', locale = 'ru' } = {}) {
  if (!supabase) throw new Error('backend_unavailable');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('not_authenticated');
  const existing = await getWebhook(workflowId);
  if (existing) {
    if (!existing.enabled) await toggleWebhook(existing.id, true);
    return { ...existing, enabled: true };
  }
  const row = {
    workflow_id: workflowId,
    user_id: user.id,
    token: genToken(),
    enabled: true,
    tier,
    locale,
  };
  const { data, error } = await supabase.from('builder_webhooks').insert(row).select().single();
  if (error) throw error;
  return data;
}

/** Включить/выключить вебхук. */
export async function toggleWebhook(id, enabled) {
  if (!supabase) throw new Error('backend_unavailable');
  const { error } = await supabase.from('builder_webhooks').update({ enabled }).eq('id', id);
  if (error) throw error;
}

/** Сгенерировать новый токен (старая ссылка перестаёт работать). */
export async function regenerateWebhook(id) {
  if (!supabase) throw new Error('backend_unavailable');
  const token = genToken();
  const { error } = await supabase.from('builder_webhooks').update({ token }).eq('id', id);
  if (error) throw error;
  return token;
}

/** Удалить вебхук. */
export async function deleteWebhook(id) {
  if (!supabase) throw new Error('backend_unavailable');
  const { error } = await supabase.from('builder_webhooks').delete().eq('id', id);
  if (error) throw error;
}

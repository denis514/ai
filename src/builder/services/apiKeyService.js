/**
 * apiKeyService.js — клиентский слой для управления API-ключами Builder.
 *
 * Ключ НИКОГДА не хранится и не расшифровывается в браузере. Подключение и
 * отключение идут через edge functions (builder-connect-key / -disconnect-key),
 * которые валидируют, шифруют и пишут в БД на сервере.
 *
 * Статус («подключён ли ключ») читается напрямую из builder_api_connections —
 * но только метаданные (provider, key_hint, is_active), не сам ciphertext.
 *
 * Все функции no-op / безопасный fallback, если supabase не сконфигурирован
 * (anonymous / dev без backend) — реальный запуск в этом режиме недоступен.
 */

import { supabase } from '../../lib/supabaseClient.js';

const FN_BASE = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
  : null;

async function callFunction(name, body) {
  if (!supabase || !FN_BASE) throw new Error('backend_unavailable');
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('not_authenticated');

  const res = await fetch(`${FN_BASE}/${name}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(out.error || `http_${res.status}`);
    err.code = out.error || `http_${res.status}`;
    throw err;
  }
  return out;
}

/**
 * Подключить ключ: валидируется на сервере, шифруется, сохраняется.
 * @returns {{ ok: true, provider, hint }}
 */
export function connectKey(apiKey, provider = 'anthropic') {
  return callFunction('builder-connect-key', { provider, apiKey });
}

/** Отключить (удалить) ключ. */
export function disconnectKey(provider = 'anthropic') {
  return callFunction('builder-disconnect-key', { provider });
}

/**
 * Статус ключа для UI — только метаданные, без ciphertext.
 * @returns {{ connected: boolean, hint: string|null }}
 */
export async function getKeyStatus(provider = 'anthropic') {
  if (!supabase) return { connected: false, hint: null };
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { connected: false, hint: null };

  const { data, error } = await supabase
    .from('builder_api_connections')
    .select('key_hint, is_active')
    .eq('provider', provider)
    .maybeSingle();

  if (error || !data || !data.is_active) return { connected: false, hint: null };
  return { connected: true, hint: data.key_hint || null };
}

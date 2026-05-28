// builder-connect-key — проверяет API-ключ Claude, шифрует и сохраняет.
//
// Поток:
//   1. Авторизация по JWT (Supabase Auth).
//   2. Принять { provider, apiKey }.
//   3. Проверить ключ — лёгкий запрос к Anthropic API (1 токен). 401 → невалиден.
//   4. Зашифровать (AES-GCM, env secret) и upsert в builder_api_connections.
//   5. Вернуть { ok, hint } — последние 4 символа для UI.
//
// Деплой:
//   supabase functions deploy builder-connect-key
//   supabase secrets set BUILDER_KEY_ENCRYPTION_SECRET=<32+ случайных символов>
//
// Ключ никогда не пишется в логи и не возвращается клиенту.

import { getUser, adminClient, json, cors } from '../_shared/auth.ts';
import { encrypt, secretConfigured } from '../_shared/crypto.ts';

const VALIDATE_URL = 'https://api.anthropic.com/v1/messages';

async function validateAnthropicKey(apiKey: string): Promise<boolean> {
  try {
    const res = await fetch(VALIDATE_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'hi' }],
      }),
    });
    // 200 = валиден. 400 (bad request) тоже значит, что ключ принят авторизацией.
    // 401/403 = ключ невалиден.
    if (res.status === 401 || res.status === 403) return false;
    return res.status < 500;
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  if (!secretConfigured()) {
    return json({ error: 'server_misconfigured', detail: 'encryption secret not set' }, 500);
  }

  const user = await getUser(req);
  if (!user) return json({ error: 'unauthorized' }, 401);

  let body: { provider?: string; apiKey?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'bad_json' }, 400);
  }

  const provider = (body.provider || 'anthropic').toLowerCase();
  const apiKey = (body.apiKey || '').trim();
  if (provider !== 'anthropic') return json({ error: 'unsupported_provider' }, 400);
  if (!apiKey || apiKey.length < 20) return json({ error: 'invalid_key_format' }, 400);

  const valid = await validateAnthropicKey(apiKey);
  if (!valid) return json({ error: 'key_rejected' }, 400);

  const encrypted = await encrypt(apiKey);
  const hint = apiKey.slice(-4);

  const admin = adminClient();
  const { error } = await admin
    .from('builder_api_connections')
    .upsert(
      {
        user_id: user.id,
        provider,
        encrypted_key: encrypted,
        key_hint: hint,
        is_active: true,
      },
      { onConflict: 'user_id,provider' },
    );

  if (error) {
    console.error('[connect-key] db error', error.message);
    return json({ error: 'storage_failed' }, 500);
  }

  return json({ ok: true, provider, hint });
});

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
const SUPPORTED = ['anthropic', 'telegram', 'resend'];

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
    if (res.status === 401 || res.status === 403) return false;
    return res.status < 500;
  } catch {
    return false;
  }
}

// Валидация Telegram bot-токена через getMe.
async function validateTelegramToken(token: string): Promise<boolean> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const data = await res.json().catch(() => ({}));
    return res.ok && data?.ok === true;
  } catch {
    return false;
  }
}

// Валидация Resend API-ключа через сам эндпоинт отправки. /domains требует
// прав «full access», а ключи «sending access» туда не пускают (403) — это зря
// отклоняло рабочие ключи. POST /emails с пустым телом: 401/403 = неверный ключ;
// 422 (тело невалидно) = ключ ВЕРНЫЙ (письмо не отправляется). Формат re_… тоже.
async function validateResendKey(key: string): Promise<boolean> {
  if (!key.startsWith('re_')) return false;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: '{}',
    });
    if (res.status === 401 || res.status === 403) return false; // ключ отклонён
    return true; // 422/400/200 — аутентификация прошла, ключ валиден
  } catch {
    return false;
  }
}

async function validateKey(provider: string, key: string): Promise<boolean> {
  if (provider === 'anthropic') return validateAnthropicKey(key);
  if (provider === 'telegram') return validateTelegramToken(key);
  if (provider === 'resend') return validateResendKey(key);
  return false;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  if (!secretConfigured()) {
    return json({ error: 'server_misconfigured', detail: 'encryption secret not set' }, 500);
  }

  const user = await getUser(req);
  if (!user) return json({ error: 'unauthorized' }, 401);

  let body: { provider?: string; apiKey?: string; label?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'bad_json' }, 400);
  }

  const provider = (body.provider || 'anthropic').toLowerCase();
  const apiKey = (body.apiKey || '').trim();
  if (!SUPPORTED.includes(provider)) return json({ error: 'unsupported_provider' }, 400);
  if (!apiKey || apiKey.length < 20) return json({ error: 'invalid_key_format' }, 400);

  const valid = await validateKey(provider, apiKey);
  if (!valid) return json({ error: 'key_rejected' }, 400);

  const encrypted = await encrypt(apiKey);
  const hint = apiKey.slice(-4);
  // Имя ключа: заданное пользователем, иначе «••••1234» по последним цифрам.
  const label = (body.label || '').trim() || `••••${hint}`;

  const admin = adminClient();

  // Первый ключ провайдера → default. Следующие — нет (выбор default отдельно).
  const { count } = await admin
    .from('builder_api_connections')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('provider', provider);
  const isFirst = (count ?? 0) === 0;

  const { error } = await admin
    .from('builder_api_connections')
    .insert({
      user_id: user.id,
      provider,
      label,
      encrypted_key: encrypted,
      key_hint: hint,
      is_active: true,
      is_default: isFirst,
    });

  if (error) {
    // 23505 — нарушение уникальности (user, provider, label): имя занято.
    if ((error as { code?: string }).code === '23505') return json({ error: 'label_exists' }, 409);
    console.error('[connect-key] db error', error.message);
    return json({ error: 'storage_failed' }, 500);
  }

  return json({ ok: true, provider, hint, label });
});

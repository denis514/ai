// builder-gcal-callback — Google возвращает сюда после согласия.
//
// Поток: проверяем подпись state → меняем code на refresh+access токены →
// шифруем refresh_token → upsert в builder_api_connections (provider 'gcal') →
// редирект обратно в приложение. См. ADR-0009.
//
// Деплой С ФЛАГОМ (Google зовёт без JWT):
//   supabase functions deploy builder-gcal-callback --no-verify-jwt
// Секреты: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, BUILDER_SERVICE_SECRET,
//          SUPABASE_URL, BUILDER_KEY_ENCRYPTION_SECRET.

import { adminClient, cors } from '../_shared/auth.ts';
import { encrypt, secretConfigured } from '../_shared/crypto.ts';

async function sign(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function redirect(to: string): Response {
  return new Response(null, { status: 302, headers: { ...cors, Location: to } });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  const u = new URL(req.url);
  const code = u.searchParams.get('code');
  const state = u.searchParams.get('state') || '';
  const errParam = u.searchParams.get('error');

  const secret = Deno.env.get('BUILDER_SERVICE_SECRET') || '';
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID') || '';
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET') || '';
  const supaUrl = Deno.env.get('SUPABASE_URL') || '';

  // Проверяем state и достаём userId + appOrigin.
  let userId = '', appOrigin = '';
  try {
    const [payloadB64, sig] = state.split('.');
    const payload = atob(payloadB64);
    if (await sign(payload, secret) !== sig) throw new Error('bad signature');
    [userId, appOrigin] = payload.split('|');
  } catch {
    return redirect((appOrigin || '/') + '/?gcal=error');
  }

  const back = (status: string) => redirect(`${appOrigin || ''}/?gcal=${status}`);

  if (errParam || !code) return back('denied');
  if (!secretConfigured() || !clientId || !clientSecret) return back('error');

  try {
    // Обмен code → токены.
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${supaUrl}/functions/v1/builder-gcal-callback`,
        grant_type: 'authorization_code',
      }).toString(),
    });
    const tok = await tokenRes.json();
    if (!tokenRes.ok || !tok.refresh_token) {
      // refresh_token приходит только при первом согласии — иначе просим заново.
      return back(tok.refresh_token === undefined ? 'norefresh' : 'error');
    }

    const encrypted = await encrypt(tok.refresh_token);
    const admin = adminClient();
    const { error } = await admin.from('builder_api_connections').upsert(
      {
        user_id: userId,
        provider: 'gcal',
        encrypted_key: encrypted,
        key_hint: 'cal',
        is_active: true,
      },
      { onConflict: 'user_id,provider' },
    );
    if (error) return back('error');
    return back('connected');
  } catch {
    return back('error');
  }
});

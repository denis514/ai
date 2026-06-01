// builder-gcal-connect — старт OAuth Google Calendar.
//
// Авторизованный пользователь зовёт эту функцию → она возвращает URL согласия
// Google с подписанным `state` (защита от CSRF + кого подключаем). Фронт делает
// redirect на этот URL. Google после согласия вернёт пользователя на
// builder-gcal-callback. См. ADR-0009.
//
// Секреты: GOOGLE_CLIENT_ID, BUILDER_SERVICE_SECRET (для подписи state),
//          SUPABASE_URL (для redirect_uri).
// Деплой: supabase functions deploy builder-gcal-connect

import { getUser, json, cors } from '../_shared/auth.ts';

const SCOPE = 'https://www.googleapis.com/auth/calendar.events';

async function sign(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  const user = await getUser(req);
  if (!user) return json({ error: 'unauthorized' }, 401);

  const clientId = Deno.env.get('GOOGLE_CLIENT_ID') || '';
  const secret = Deno.env.get('BUILDER_SERVICE_SECRET') || '';
  const supaUrl = Deno.env.get('SUPABASE_URL') || '';
  if (!clientId || !secret || !supaUrl) {
    return json({ error: 'server_misconfigured', detail: 'GOOGLE_CLIENT_ID / secret / SUPABASE_URL missing' }, 500);
  }

  // origin приложения для возврата после callback (куда редиректить юзера в конце).
  let appOrigin = '';
  try { appOrigin = new URL(req.headers.get('origin') || '').origin; } catch { appOrigin = ''; }

  // state = userId|appOrigin|подпись — проверим в callback.
  const payload = `${user.id}|${appOrigin}`;
  const state = `${btoa(payload).replace(/=+$/, '')}.${await sign(payload, secret)}`;

  const redirectUri = `${supaUrl}/functions/v1/builder-gcal-callback`;
  const url = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPE,
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    state,
  }).toString();

  return json({ url });
});

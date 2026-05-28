// builder-disconnect-key — удаляет сохранённый API-ключ пользователя.
//
// Поток: JWT-авторизация → удалить строку (user_id, provider).
// Деплой: supabase functions deploy builder-disconnect-key

import { getUser, adminClient, json, cors } from '../_shared/auth.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const user = await getUser(req);
  if (!user) return json({ error: 'unauthorized' }, 401);

  let body: { provider?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'bad_json' }, 400);
  }
  const provider = (body.provider || 'anthropic').toLowerCase();

  const admin = adminClient();
  const { error } = await admin
    .from('builder_api_connections')
    .delete()
    .eq('user_id', user.id)
    .eq('provider', provider);

  if (error) {
    console.error('[disconnect-key] db error', error.message);
    return json({ error: 'delete_failed' }, 500);
  }

  return json({ ok: true, provider });
});

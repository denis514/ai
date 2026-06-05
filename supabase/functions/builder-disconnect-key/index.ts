// builder-disconnect-key — удаляет сохранённый API-ключ пользователя.
//
// Поток: JWT-авторизация → удалить ключ.
//   • { id }       — удалить конкретный ключ (мультиключи, Этап 1).
//   • { provider } — back-compat: удалить ВСЕ ключи провайдера.
// Если удалили default-ключ — назначаем default самому свежему из оставшихся.
// Деплой: supabase functions deploy builder-disconnect-key

import { getUser, adminClient, json, cors } from '../_shared/auth.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const user = await getUser(req);
  if (!user) return json({ error: 'unauthorized' }, 401);

  let body: { provider?: string; id?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'bad_json' }, 400);
  }

  const admin = adminClient();
  let provider = (body.provider || '').toLowerCase();

  if (body.id) {
    // Удаляем конкретный ключ (только свой — фильтр по user_id).
    const { data: del, error } = await admin
      .from('builder_api_connections')
      .delete()
      .eq('user_id', user.id)
      .eq('id', body.id)
      .select('provider, is_default')
      .maybeSingle();
    if (error) {
      console.error('[disconnect-key] db error', error.message);
      return json({ error: 'delete_failed' }, 500);
    }
    // Если снесли default — повышаем самый свежий оставшийся ключ провайдера.
    if (del?.is_default) {
      provider = del.provider;
      const { data: next } = await admin
        .from('builder_api_connections')
        .select('id')
        .eq('user_id', user.id)
        .eq('provider', provider)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (next?.id) {
        await admin.from('builder_api_connections')
          .update({ is_default: true }).eq('id', next.id).eq('user_id', user.id);
      }
    }
    return json({ ok: true, id: body.id });
  }

  // back-compat: удалить все ключи провайдера.
  provider = provider || 'anthropic';
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

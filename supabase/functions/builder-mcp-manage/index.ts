// builder-mcp-manage — добавить/удалить пользовательский MCP-сервер.
//
// action 'add':    { name, url, token? } → валидирует URL, шифрует token, insert.
// action 'delete': { id }               → удаляет сервер пользователя.
// Чтение списка идёт напрямую из БД клиентом (RLS), без токена. ADR/MCP.
//
// Деплой: supabase functions deploy builder-mcp-manage
// Секрет: BUILDER_KEY_ENCRYPTION_SECRET (как у ключей).

import { getUser, adminClient, json, cors } from '../_shared/auth.ts';
import { encrypt, secretConfigured } from '../_shared/crypto.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const user = await getUser(req);
  if (!user) return json({ error: 'unauthorized' }, 401);

  let body: { action?: string; id?: string; name?: string; url?: string; token?: string };
  try { body = await req.json(); } catch { return json({ error: 'bad_json' }, 400); }

  const admin = adminClient();

  if (body.action === 'delete') {
    if (!body.id) return json({ error: 'missing_id' }, 400);
    const { error } = await admin.from('builder_mcp_servers')
      .delete().eq('id', body.id).eq('user_id', user.id);
    if (error) return json({ error: 'storage_failed' }, 500);
    return json({ ok: true });
  }

  // action 'add'
  const name = (body.name || '').trim();
  const url = (body.url || '').trim();
  const token = (body.token || '').trim();
  if (!name) return json({ error: 'missing_name' }, 400);

  // URL обязателен и должен быть https.
  let u: URL;
  try { u = new URL(url); } catch { return json({ error: 'invalid_url' }, 400); }
  if (u.protocol !== 'https:') return json({ error: 'invalid_url' }, 400);

  if (!secretConfigured()) return json({ error: 'server_misconfigured' }, 500);

  let encrypted: string | null = null;
  let hint: string | null = null;
  if (token) {
    encrypted = await encrypt(token);
    hint = token.slice(-4);
  }

  const { error } = await admin.from('builder_mcp_servers').insert({
    user_id: user.id,
    name,
    url: u.toString(),
    encrypted_token: encrypted,
    token_hint: hint,
    enabled: true,
  });
  if (error) {
    console.error('[mcp-manage] insert error', error.message);
    return json({ error: 'storage_failed', detail: error.message }, 500);
  }
  return json({ ok: true });
});

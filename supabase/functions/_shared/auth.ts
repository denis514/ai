// Shared helpers: достать авторизованного пользователя + service-role client.
import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON = Deno.env.get('SUPABASE_ANON_KEY')!;

export const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

/** Константно-временное сравнение строк (защита от timing-атак на секреты). */
export function safeEqual(a: string, b: string): boolean {
  const ae = new TextEncoder().encode(a || '');
  const be = new TextEncoder().encode(b || '');
  if (ae.length !== be.length) return false;
  let r = 0;
  for (let i = 0; i < ae.length; i++) r |= ae[i] ^ be[i];
  return r === 0;
}

/** Service-role client — обходит RLS, для серверных операций с ключами. */
export function adminClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Достаёт user из Authorization: Bearer <jwt>. Возвращает user | null.
 */
export async function getUser(req: Request) {
  const authHeader = req.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const client = createClient(SUPABASE_URL, ANON, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.getUser();
  if (error || !data?.user) return null;
  return data.user;
}

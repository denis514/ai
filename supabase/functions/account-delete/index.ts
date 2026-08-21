// account-delete — безвозвратно удаляет учётную запись вызывающего пользователя.
//
// Почему серверная функция: удалить пользователя из auth.users можно только
// сервисным ключом, из браузера — нельзя. А все таблицы проекта (прогресс,
// закладки, активность, схемы, ключи, расписания, вебхуки) каскадом привязаны
// именно к auth.users — см. docs/supabase-setup.sql и миграции билдера.
// Удаление одной строки profiles (как было раньше) данных не трогало.
//
// Поток: JWT-авторизация → admin.auth.admin.deleteUser(user.id) → каскад.
// Удаляется ТОЛЬКО сам вызывающий: id берётся из токена, из тела — ничего.
// Деплой: supabase functions deploy account-delete

import { getUser, adminClient, json, cors } from '../_shared/auth.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const user = await getUser(req);
  if (!user) return json({ error: 'unauthorized' }, 401);

  const admin = adminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error('[account-delete] failed', error.message);
    return json({ error: 'delete_failed' }, 500);
  }
  return json({ ok: true });
});

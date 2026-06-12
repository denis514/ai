-- 010_template_moderation.sql — модерация публичных шаблонов из кабинета (не из БД).
--
-- Добавляет флаг администратора в profiles и права, по которым АДМИН может из UI:
--   • видеть шаблоны на модерации (чужие approved=false),
--   • одобрять (UPDATE approved=true),
--   • отклонять/удалять (DELETE).
-- Обычные пользователи — без изменений (видят только одобренные и свои).
--
-- Применить: Supabase → SQL Editor → Run. Зависит от 009_builder_public_templates.sql
-- и таблицы profiles (docs/supabase-setup.sql). Идемпотентно.

-- 1) Флаг администратора в профиле.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- КРИТИЧНО: запрещаем пользователю писать в свою колонку is_admin напрямую.
-- Политика "profiles: own update" разрешает UPDATE своей строки — без этого
-- REVOKE любой залогиненный мог бы выставить себе is_admin=true из браузера
-- (полная эскалация до админа). Назначение админа — только через service role
-- (SQL Editor), который column-grants игнорирует.
REVOKE UPDATE (is_admin) ON public.profiles FROM authenticated, anon;

-- Двойная защита на уровне RLS: даже если право вернут, флаг нельзя изменить
-- относительно текущего значения обычным апдейтом.
DROP POLICY IF EXISTS "profiles: own update" ON public.profiles;
CREATE POLICY "profiles: own update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND is_admin IS NOT DISTINCT FROM (SELECT p.is_admin FROM public.profiles p WHERE p.id = auth.uid())
  );

-- ВАЖНО (одноразовый bootstrap — сделать ОДИН раз вручную, замените email):
--   UPDATE public.profiles SET is_admin = true
--     WHERE id = (SELECT id FROM auth.users WHERE email = 'denisantropov@gmail.com');

-- Хелпер: текущий пользователь — админ? SECURITY DEFINER, чтобы не зависеть от
-- RLS таблицы profiles внутри политик других таблиц.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT is_admin FROM public.profiles WHERE id = auth.uid()), false);
$$;
-- Гигиена прав: исполнять может только залогиненный (функция и так читает лишь
-- свою строку, но не оставляем её доступной анонимам без нужды).
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 2) Права админа на builder_public_templates.

-- Чтение: одобренные — всем; свои — автору; ВСЕ — админу (видит очередь модерации).
DROP POLICY IF EXISTS "bpt: read approved or own" ON public.builder_public_templates;
DROP POLICY IF EXISTS "bpt: read approved own or admin" ON public.builder_public_templates;
CREATE POLICY "bpt: read approved own or admin"
  ON public.builder_public_templates
  FOR SELECT
  USING (approved = true OR auth.uid() = author_id OR public.is_admin());

-- Обновление (одобрение): только админ.
DROP POLICY IF EXISTS "bpt: admin update" ON public.builder_public_templates;
CREATE POLICY "bpt: admin update"
  ON public.builder_public_templates
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Удаление: свои — автор; любые — админ (отклонение/чистка).
DROP POLICY IF EXISTS "bpt: delete own" ON public.builder_public_templates;
DROP POLICY IF EXISTS "bpt: delete own or admin" ON public.builder_public_templates;
CREATE POLICY "bpt: delete own or admin"
  ON public.builder_public_templates
  FOR DELETE
  USING (auth.uid() = author_id OR public.is_admin());

-- Вставка остаётся прежней (009): своё, approved=false. Самоодобрение через INSERT
-- по-прежнему невозможно; админ одобряет отдельным шагом (UPDATE) или авто-одобряет
-- свои публикации на клиенте (publishTemplate видит profile.is_admin).

-- ============================================================================
-- VERIFICATION
--   SELECT column_name FROM information_schema.columns
--     WHERE table_name='profiles' AND column_name='is_admin';
--   SELECT polname FROM pg_policies WHERE tablename='builder_public_templates';
--   SELECT public.is_admin();   -- должна вернуть true для админа
-- ============================================================================

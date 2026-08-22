-- 012 — журнал автосборок «текст → схема» (builder-generate).
-- Нужен для лимитов спонсорских генераций (3/день на клиента, 6/день на IP,
-- месячный потолок) и для понимания расходов основателя.
-- IP хранится ТОЛЬКО как хеш (приватность). RLS: только сервис — клиентам
-- в этой таблице делать нечего.

create table if not exists public.builder_generations (
  id          uuid default gen_random_uuid() primary key,
  client_id   text not null,          -- анонимный id браузера (localStorage)
  ip_hash     text not null,          -- sha256 от IP, сырой IP не храним
  user_id     uuid references auth.users(id) on delete set null,
  sponsored   boolean not null default true,
  ok          boolean not null default false,
  tokens      int not null default 0,
  locale      text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_gen_client_day on public.builder_generations (client_id, created_at);
create index if not exists idx_gen_ip_day     on public.builder_generations (ip_hash, created_at);
create index if not exists idx_gen_created    on public.builder_generations (created_at);

alter table public.builder_generations enable row level security;
-- Политик нет намеренно: доступ только у service role (edge-функции).

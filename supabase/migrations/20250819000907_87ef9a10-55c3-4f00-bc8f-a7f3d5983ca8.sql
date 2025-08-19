-- Enable required extension for UUID generation (usually enabled by default)
create extension if not exists pgcrypto;

-- Create enums
create type if not exists public.subscription_tier as enum ('free', 'premium');
create type if not exists public.store_status as enum ('active', 'suspended');
create type if not exists public.giveaway_status as enum ('draft', 'active', 'completed');

-- Stores table
create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  store_name text not null,
  store_url text not null,
  subscription_tier public.subscription_tier not null default 'free',
  status public.store_status not null default 'active',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Indexes
create index if not exists idx_stores_user_id on public.stores(user_id);

-- RLS
alter table public.stores enable row level security;

create policy if not exists "Users can view their own stores"
  on public.stores for select to authenticated
  using (auth.uid() = user_id);

create policy if not exists "Users can insert their own stores"
  on public.stores for insert to authenticated
  with check (auth.uid() = user_id);

create policy if not exists "Users can update their own stores"
  on public.stores for update to authenticated
  using (auth.uid() = user_id);

create policy if not exists "Users can delete their own stores"
  on public.stores for delete to authenticated
  using (auth.uid() = user_id);

-- Giveaways table
create table if not exists public.giveaways (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  title text not null,
  prize_amount integer not null default 0,
  status public.giveaway_status not null default 'draft',
  total_entries integer not null default 0,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Indexes
create index if not exists idx_giveaways_store_id on public.giveaways(store_id);

-- RLS
alter table public.giveaways enable row level security;

create policy if not exists "Owners can view their giveaways"
  on public.giveaways for select to authenticated
  using (exists (
    select 1 from public.stores s where s.id = store_id and s.user_id = auth.uid()
  ));

create policy if not exists "Owners can insert giveaways"
  on public.giveaways for insert to authenticated
  with check (exists (
    select 1 from public.stores s where s.id = store_id and s.user_id = auth.uid()
  ));

create policy if not exists "Owners can update their giveaways"
  on public.giveaways for update to authenticated
  using (exists (
    select 1 from public.stores s where s.id = store_id and s.user_id = auth.uid()
  ));

create policy if not exists "Owners can delete their giveaways"
  on public.giveaways for delete to authenticated
  using (exists (
    select 1 from public.stores s where s.id = store_id and s.user_id = auth.uid()
  ));

-- Participants table
create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  giveaway_id uuid not null references public.giveaways(id) on delete cascade,
  email text not null,
  entry_count integer not null default 1 check (entry_count >= 1),
  created_at timestamp with time zone not null default now()
);

-- Indexes
create index if not exists idx_participants_giveaway_id on public.participants(giveaway_id);
create index if not exists idx_participants_email on public.participants(email);

-- RLS
alter table public.participants enable row level security;

create policy if not exists "Owners can view participants"
  on public.participants for select to authenticated
  using (exists (
    select 1 from public.giveaways g
    join public.stores s on s.id = g.store_id
    where g.id = giveaway_id and s.user_id = auth.uid()
  ));

create policy if not exists "Owners can insert participants"
  on public.participants for insert to authenticated
  with check (exists (
    select 1 from public.giveaways g
    join public.stores s on s.id = g.store_id
    where g.id = giveaway_id and s.user_id = auth.uid()
  ));

create policy if not exists "Owners can update participants"
  on public.participants for update to authenticated
  using (exists (
    select 1 from public.giveaways g
    join public.stores s on s.id = g.store_id
    where g.id = giveaway_id and s.user_id = auth.uid()
  ));

create policy if not exists "Owners can delete participants"
  on public.participants for delete to authenticated
  using (exists (
    select 1 from public.giveaways g
    join public.stores s on s.id = g.store_id
    where g.id = giveaway_id and s.user_id = auth.uid()
  ));

-- Updated_at helper
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers
create trigger if not exists trg_update_stores_updated_at
before update on public.stores
for each row execute function public.update_updated_at_column();

create trigger if not exists trg_update_giveaways_updated_at
before update on public.giveaways
for each row execute function public.update_updated_at_column();

-- Keep giveaways.total_entries in sync
create or replace function public.recalc_giveaway_total_entries()
returns trigger as $$
begin
  update public.giveaways g
    set total_entries = coalesce((
      select sum(entry_count)::int from public.participants p where p.giveaway_id = g.id
    ), 0),
    updated_at = now()
  where g.id = coalesce(new.giveaway_id, old.giveaway_id);
  return null;
end;
$$ language plpgsql;

create trigger if not exists trg_participants_after_insert
after insert on public.participants
for each row execute function public.recalc_giveaway_total_entries();

create trigger if not exists trg_participants_after_update
after update on public.participants
for each row execute function public.recalc_giveaway_total_entries();

create trigger if not exists trg_participants_after_delete
after delete on public.participants
for each row execute function public.recalc_giveaway_total_entries();
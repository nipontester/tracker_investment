-- Dime! Investment Tracker — Supabase schema
-- Run this once in your Supabase project's SQL Editor (Dashboard -> SQL Editor -> New query).
-- Safe to re-run: uses "if not exists" / "or replace" where possible.

-- ---------------------------------------------------------------------
-- 1. Deposits table
-- ---------------------------------------------------------------------
create table if not exists public.deposits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  amount numeric not null check (amount > 0),
  category text not null default 'other',
  note text default '',
  created_at timestamptz not null default now()
);

create index if not exists deposits_user_id_idx on public.deposits(user_id);
create index if not exists deposits_date_idx on public.deposits(date);

-- Row Level Security: each user can only ever see/edit their own rows.
alter table public.deposits enable row level security;

drop policy if exists "Users can view their own deposits" on public.deposits;
create policy "Users can view their own deposits"
  on public.deposits for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own deposits" on public.deposits;
create policy "Users can insert their own deposits"
  on public.deposits for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own deposits" on public.deposits;
create policy "Users can update their own deposits"
  on public.deposits for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own deposits" on public.deposits;
create policy "Users can delete their own deposits"
  on public.deposits for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 2. User settings table (goal amount + language + theme)
-- ---------------------------------------------------------------------
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  goal numeric not null default 1000000,
  lang text not null default 'en',
  dark boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;

drop policy if exists "Users can view their own settings" on public.user_settings;
create policy "Users can view their own settings"
  on public.user_settings for select
  using (auth.uid() = user_id);

drop policy if exists "Users can upsert their own settings" on public.user_settings;
create policy "Users can upsert their own settings"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own settings" on public.user_settings;
create policy "Users can update their own settings"
  on public.user_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- Done. After running this, every signed-up user automatically gets
-- their own isolated rows -- there is no way for one account to see
-- another account's deposits or settings, enforced at the database
-- level (not just in the app's UI).
-- ---------------------------------------------------------------------

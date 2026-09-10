-- Skema awal mjs-tool (Supabase / Postgres).
-- Cara pakai: buka Supabase Dashboard > SQL Editor > New query,
-- tempel seluruh file ini > Run. Aman dijalankan ulang (idempotent).
--
-- Tabel:
--   bills, bill_members, bill_items  -> fitur Split Bill
--   gitlab_profiles, timesheet_entries -> fitur GitLab Activity / Timesheet
--
-- Catatan keamanan: policy di bawah mengizinkan anon key penuh (setup awal
-- tanpa auth). Sebelum production, aktifkan Supabase Auth dan ganti policy
-- dengan `auth.uid() = user_id`. Token GitLab JANGAN disimpan di DB —
-- simpan di browser (localStorage) per perangkat.

-- ============ helper updated_at ============
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============ bills ============
create table if not exists public.bills (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Split Bill',
  tax_percent numeric not null default 0,
  service_percent numeric not null default 0,
  discount numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists bills_set_updated_at on public.bills;
create trigger bills_set_updated_at
  before update on public.bills
  for each row execute function public.set_updated_at();

-- ============ bill_members ============
create table if not exists public.bill_members (
  id uuid primary key default gen_random_uuid(),
  bill_id uuid not null references public.bills (id) on delete cascade,
  name text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists bill_members_bill_id_idx
  on public.bill_members (bill_id);

-- ============ bill_items ============
create table if not exists public.bill_items (
  id uuid primary key default gen_random_uuid(),
  bill_id uuid not null references public.bills (id) on delete cascade,
  name text not null,
  price numeric not null default 0,
  -- ID anggota yang patungan item ini. Array kosong = dibagi ke semua anggota.
  shared_member_ids uuid[] not null default '{}',
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists bill_items_bill_id_idx
  on public.bill_items (bill_id);

-- ============ gitlab_profiles ============
-- Profil koneksi TANPA token (token disimpan di browser per perangkat).
create table if not exists public.gitlab_profiles (
  id uuid primary key default gen_random_uuid(),
  label text not null default 'Default',
  instance_url text not null default 'https://gitlab.com',
  project_id text not null,
  username text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists gitlab_profiles_set_updated_at on public.gitlab_profiles;
create trigger gitlab_profiles_set_updated_at
  before update on public.gitlab_profiles
  for each row execute function public.set_updated_at();

-- ============ timesheet_entries ============
create table if not exists public.timesheet_entries (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  summary text not null,
  source text not null default 'manual',
  profile_id uuid references public.gitlab_profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists timesheet_entries_date_idx
  on public.timesheet_entries (date desc);

drop trigger if exists timesheet_entries_set_updated_at on public.timesheet_entries;
create trigger timesheet_entries_set_updated_at
  before update on public.timesheet_entries
  for each row execute function public.set_updated_at();

-- ============ RLS ============
alter table public.bills enable row level security;
alter table public.bill_members enable row level security;
alter table public.bill_items enable row level security;
alter table public.gitlab_profiles enable row level security;
alter table public.timesheet_entries enable row level security;

-- Policy setup awal: akses penuh via anon/publishable key (TANPA auth).
-- Ganti dengan policy berbasis auth.uid() sebelum production.
drop policy if exists "setup_full_access" on public.bills;
create policy "setup_full_access" on public.bills
  for all using (true) with check (true);

drop policy if exists "setup_full_access" on public.bill_members;
create policy "setup_full_access" on public.bill_members
  for all using (true) with check (true);

drop policy if exists "setup_full_access" on public.bill_items;
create policy "setup_full_access" on public.bill_items
  for all using (true) with check (true);

drop policy if exists "setup_full_access" on public.gitlab_profiles;
create policy "setup_full_access" on public.gitlab_profiles
  for all using (true) with check (true);

drop policy if exists "setup_full_access" on public.timesheet_entries;
create policy "setup_full_access" on public.timesheet_entries
  for all using (true) with check (true);

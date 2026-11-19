-- =====================================================================
-- Gentleman Gym — core schema
-- Run order: 1 core_schema -> 2 rls_policies -> 3 storage -> 4 enquiry_rpc_and_stats -> 5 seed_existing_content
-- =====================================================================

-- ---------- helper: updated_at trigger ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- admin_profiles ----------
-- One row per administrator. Rows are created ONLY by the owner via SQL
-- (see supabase/scripts/create_first_admin.sql). No client can insert/update/delete.
create table if not exists public.admin_profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text,
  role        text not null default 'admin' check (role in ('super_admin', 'admin')),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger admin_profiles_set_updated_at
  before update on public.admin_profiles
  for each row execute function public.set_updated_at();

-- ---------- authorization helpers (used by RLS and storage policies) ----------
-- SECURITY DEFINER so the check works even though admin_profiles is locked down.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_profiles
    where id = (select auth.uid()) and is_active
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_profiles
    where id = (select auth.uid()) and is_active and role = 'super_admin'
  );
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.is_super_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.is_super_admin() to anon, authenticated;

-- ---------- enquiries ----------
create table if not exists public.enquiries (
  id            uuid primary key default gen_random_uuid(),
  full_name     text not null check (char_length(btrim(full_name)) between 2 and 80),
  phone         text not null check (phone ~ '^[6-9][0-9]{9}$'),
  fitness_goal  text not null check (char_length(btrim(fitness_goal)) between 2 and 80),
  message       text check (message is null or char_length(message) <= 600),
  status        text not null default 'new'
                check (status in ('new', 'contacted', 'interested', 'converted', 'not_interested')),
  admin_notes   text check (admin_notes is null or char_length(admin_notes) <= 4000),
  source        text not null default 'website',
  ip_hash       text,                      -- sha256 of the visitor IP; used only for rate limiting
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists enquiries_created_at_idx on public.enquiries (created_at desc);
create index if not exists enquiries_status_idx     on public.enquiries (status);
create index if not exists enquiries_goal_idx       on public.enquiries (fitness_goal);
create index if not exists enquiries_phone_idx      on public.enquiries (phone, created_at desc);
create index if not exists enquiries_ip_hash_idx    on public.enquiries (ip_hash, created_at desc) where ip_hash is not null;

create trigger enquiries_set_updated_at
  before update on public.enquiries
  for each row execute function public.set_updated_at();

-- ---------- trainers ----------
create table if not exists public.trainers (
  id             uuid primary key default gen_random_uuid(),
  name           text not null check (char_length(btrim(name)) between 1 and 80),
  title          text not null check (char_length(btrim(title)) between 1 and 120),
  description    text not null default '' check (char_length(description) <= 1000),
  image_url      text,
  image_path     text,                     -- storage object path when the image lives in the trainer-images bucket
  image_alt      text check (image_alt is null or char_length(image_alt) <= 200),
  display_order  integer not null default 0,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists trainers_public_idx on public.trainers (is_active, display_order);

create trigger trainers_set_updated_at
  before update on public.trainers
  for each row execute function public.set_updated_at();

-- ---------- gallery ----------
create table if not exists public.gallery_categories (
  id             uuid primary key default gen_random_uuid(),
  name           text not null check (char_length(btrim(name)) between 1 and 60),
  display_order  integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create unique index if not exists gallery_categories_name_key on public.gallery_categories (lower(btrim(name)));

create trigger gallery_categories_set_updated_at
  before update on public.gallery_categories
  for each row execute function public.set_updated_at();

create table if not exists public.gallery (
  id             uuid primary key default gen_random_uuid(),
  title          text not null check (char_length(btrim(title)) between 1 and 120),
  description    text check (description is null or char_length(description) <= 300),
  image_url      text not null,
  image_path     text,                     -- storage object path when the image lives in the gallery-images bucket
  category_id    uuid references public.gallery_categories (id) on delete set null,
  display_order  integer not null default 0,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists gallery_public_idx   on public.gallery (is_active, display_order);
create index if not exists gallery_category_idx on public.gallery (category_id);

create trigger gallery_set_updated_at
  before update on public.gallery
  for each row execute function public.set_updated_at();

-- ---------- membership_plans ----------
-- price is optional on purpose: the gym shares prices directly, so nothing is invented.
create table if not exists public.membership_plans (
  id              uuid primary key default gen_random_uuid(),
  name            text not null check (char_length(btrim(name)) between 1 and 80),
  description     text not null default '' check (char_length(description) <= 600),
  price           numeric(10, 2) check (price is null or price >= 0),
  currency        text not null default 'INR' check (currency ~ '^[A-Z]{3}$'),
  duration_value  integer not null default 1 check (duration_value > 0 and duration_value <= 1000),
  duration_unit   text not null default 'month' check (duration_unit in ('day', 'week', 'month', 'year')),
  features        text[] not null default '{}',
  is_featured     boolean not null default false,
  is_active       boolean not null default true,
  display_order   integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists membership_plans_public_idx on public.membership_plans (is_active, display_order);

create trigger membership_plans_set_updated_at
  before update on public.membership_plans
  for each row execute function public.set_updated_at();

-- ---------- faqs ----------
create table if not exists public.faqs (
  id             uuid primary key default gen_random_uuid(),
  question       text not null check (char_length(btrim(question)) between 3 and 300),
  answer         text not null check (char_length(btrim(answer)) between 1 and 2000),
  display_order  integer not null default 0,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists faqs_public_idx on public.faqs (is_active, display_order);

create trigger faqs_set_updated_at
  before update on public.faqs
  for each row execute function public.set_updated_at();

-- ---------- members (foundation; the public site has no member sign-up) ----------
create table if not exists public.members (
  id                 uuid primary key default gen_random_uuid(),
  full_name          text not null check (char_length(btrim(full_name)) between 2 and 80),
  phone              text not null check (phone ~ '^\+?[0-9]{7,15}$'),
  email              text check (email is null or char_length(email) <= 254),
  joined_on          date not null default current_date,
  membership_status  text not null default 'none'
                     check (membership_status in ('none', 'active', 'expired', 'frozen', 'cancelled')),
  current_plan_id    uuid references public.membership_plans (id) on delete set null,
  membership_start   date,
  membership_end     date,
  notes              text check (notes is null or char_length(notes) <= 4000),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint members_dates_check check (membership_end is null or membership_start is null or membership_end >= membership_start)
);

create unique index if not exists members_phone_key on public.members (phone);
create index if not exists members_status_idx on public.members (membership_status, membership_end);
create index if not exists members_created_idx on public.members (created_at desc);

create trigger members_set_updated_at
  before update on public.members
  for each row execute function public.set_updated_at();

create table if not exists public.member_memberships (
  id          uuid primary key default gen_random_uuid(),
  member_id   uuid not null references public.members (id) on delete cascade,
  plan_id     uuid references public.membership_plans (id) on delete set null,
  plan_name   text not null,                 -- snapshot so history survives plan edits/deletes
  start_date  date not null,
  end_date    date not null,
  status      text not null default 'active' check (status in ('active', 'frozen', 'cancelled')),
  notes       text check (notes is null or char_length(notes) <= 1000),
  created_at  timestamptz not null default now(),
  constraint member_memberships_dates_check check (end_date >= start_date)
);

create index if not exists member_memberships_member_idx on public.member_memberships (member_id, start_date desc);
create index if not exists member_memberships_plan_idx on public.member_memberships (plan_id);

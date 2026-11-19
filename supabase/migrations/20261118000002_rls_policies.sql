-- =====================================================================
-- Row Level Security + table privileges
-- Defence in depth: RLS policies AND explicit grants. Anything not granted
-- or not matched by a policy is denied.
-- =====================================================================

alter table public.admin_profiles      enable row level security;
alter table public.enquiries           enable row level security;
alter table public.trainers            enable row level security;
alter table public.gallery_categories  enable row level security;
alter table public.gallery             enable row level security;
alter table public.membership_plans    enable row level security;
alter table public.faqs                enable row level security;
alter table public.members             enable row level security;
alter table public.member_memberships  enable row level security;

-- Start from a clean slate so re-running the migration is safe.
revoke all on public.admin_profiles, public.enquiries, public.trainers, public.gallery_categories,
              public.gallery, public.membership_plans, public.faqs, public.members,
              public.member_memberships
  from anon, authenticated;

-- ---------------------------------------------------------------------
-- admin_profiles: read-only from the client. No insert/update/delete grants
-- exist, so nobody can promote themselves. Rows are created via SQL only.
-- ---------------------------------------------------------------------
grant select on public.admin_profiles to authenticated;

drop policy if exists "admin_profiles: read own row" on public.admin_profiles;
create policy "admin_profiles: read own row"
  on public.admin_profiles for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "admin_profiles: super admins read all" on public.admin_profiles;
create policy "admin_profiles: super admins read all"
  on public.admin_profiles for select to authenticated
  using ((select public.is_super_admin()));

-- ---------------------------------------------------------------------
-- enquiries: NO anon access at all. Visitors submit through the
-- public.submit_enquiry() function (migration 4), which validates and
-- rate-limits. Admins can read, change status/notes, and delete.
-- ---------------------------------------------------------------------
grant select, delete on public.enquiries to authenticated;
grant update (status, admin_notes) on public.enquiries to authenticated;

drop policy if exists "enquiries: admins read" on public.enquiries;
create policy "enquiries: admins read"
  on public.enquiries for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "enquiries: admins update" on public.enquiries;
create policy "enquiries: admins update"
  on public.enquiries for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "enquiries: admins delete" on public.enquiries;
create policy "enquiries: admins delete"
  on public.enquiries for delete to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------
-- Public website content: anyone may read ACTIVE rows; only admins write.
-- ---------------------------------------------------------------------
-- trainers
grant select on public.trainers to anon, authenticated;
grant insert, update, delete on public.trainers to authenticated;

drop policy if exists "trainers: public reads active" on public.trainers;
create policy "trainers: public reads active"
  on public.trainers for select to anon, authenticated
  using (is_active);

drop policy if exists "trainers: admins manage" on public.trainers;
create policy "trainers: admins manage"
  on public.trainers for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- gallery_categories (labels only, safe to expose)
grant select on public.gallery_categories to anon, authenticated;
grant insert, update, delete on public.gallery_categories to authenticated;

drop policy if exists "gallery_categories: public read" on public.gallery_categories;
create policy "gallery_categories: public read"
  on public.gallery_categories for select to anon, authenticated
  using (true);

drop policy if exists "gallery_categories: admins manage" on public.gallery_categories;
create policy "gallery_categories: admins manage"
  on public.gallery_categories for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- gallery
grant select on public.gallery to anon, authenticated;
grant insert, update, delete on public.gallery to authenticated;

drop policy if exists "gallery: public reads active" on public.gallery;
create policy "gallery: public reads active"
  on public.gallery for select to anon, authenticated
  using (is_active);

drop policy if exists "gallery: admins manage" on public.gallery;
create policy "gallery: admins manage"
  on public.gallery for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- membership_plans
grant select on public.membership_plans to anon, authenticated;
grant insert, update, delete on public.membership_plans to authenticated;

drop policy if exists "membership_plans: public reads active" on public.membership_plans;
create policy "membership_plans: public reads active"
  on public.membership_plans for select to anon, authenticated
  using (is_active);

drop policy if exists "membership_plans: admins manage" on public.membership_plans;
create policy "membership_plans: admins manage"
  on public.membership_plans for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- faqs
grant select on public.faqs to anon, authenticated;
grant insert, update, delete on public.faqs to authenticated;

drop policy if exists "faqs: public reads active" on public.faqs;
create policy "faqs: public reads active"
  on public.faqs for select to anon, authenticated
  using (is_active);

drop policy if exists "faqs: admins manage" on public.faqs;
create policy "faqs: admins manage"
  on public.faqs for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------------------------------------------------------------
-- members + history: admins only. Anonymous users get nothing.
-- ---------------------------------------------------------------------
grant select, insert, update, delete on public.members to authenticated;
grant select, insert, update, delete on public.member_memberships to authenticated;

drop policy if exists "members: admins manage" on public.members;
create policy "members: admins manage"
  on public.members for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "member_memberships: admins manage" on public.member_memberships;
create policy "member_memberships: admins manage"
  on public.member_memberships for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

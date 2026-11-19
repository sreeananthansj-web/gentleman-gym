-- =====================================================================
-- FIRST ADMINISTRATOR SETUP  (run once, manually, in the Supabase SQL Editor)
--
-- Step 1 — create the login in the Supabase dashboard (NOT in this file):
--   Authentication -> Users -> Add user -> Create new user
--   Email:    admin@gentlemangym.com        (or your real address)
--   Password: choose a strong, unique password yourself (12+ characters)
--   Tick "Auto Confirm User".
--   Public sign-ups must stay disabled (Authentication -> Sign In / Providers
--   -> disable "Allow new users to sign up").
--
-- Step 2 — run the statement below to grant that user admin rights.
--   Change the email if you used a different one.
--
-- No password appears anywhere in this repository. Change it any time from
-- /admin/settings (or Authentication -> Users in the dashboard).
-- =====================================================================

insert into public.admin_profiles (id, email, full_name, role)
select u.id, u.email, 'Gentleman Gym Admin', 'super_admin'
from auth.users u
where lower(u.email) = lower('admin@gentlemangym.com')
on conflict (id) do update
  set role = 'super_admin',
      is_active = true,
      email = excluded.email;

-- Verify: should return exactly one row for your admin.
select id, email, role, is_active from public.admin_profiles;

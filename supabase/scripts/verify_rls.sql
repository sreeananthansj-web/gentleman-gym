-- =====================================================================
-- RLS / authorization verification. Run in the Supabase SQL Editor AFTER
-- all migrations. Every check should print PASS. It runs inside a
-- transaction that is rolled back, so it leaves no data behind.
-- =====================================================================
begin;

create temp table _results (check_name text, outcome text) on commit drop;
grant all on _results to anon, authenticated;

-- Seed one enquiry as the privileged role so we have something to try to read.
insert into public.enquiries (full_name, phone, fitness_goal) values ('RLS Test', '9876543210', 'General fitness');

-- ---------------------------------------------------------------
-- 1. Anonymous visitor
-- ---------------------------------------------------------------
set local role anon;

do $$
declare n int;
begin
  begin
    select count(*) into n from public.enquiries;
    insert into _results values ('anon cannot read enquiries', 'FAIL (query allowed, saw ' || n || ' rows)');
  exception when insufficient_privilege then
    insert into _results values ('anon cannot read enquiries', 'PASS');
  end;

  begin
    insert into public.enquiries (full_name, phone, fitness_goal) values ('x y', '9876543210', 'g');
    insert into _results values ('anon cannot insert directly into enquiries', 'FAIL');
  exception when insufficient_privilege then
    insert into _results values ('anon cannot insert directly into enquiries', 'PASS');
  end;

  begin
    select count(*) into n from public.admin_profiles;
    insert into _results values ('anon cannot read admin_profiles', 'FAIL');
  exception when insufficient_privilege then
    insert into _results values ('anon cannot read admin_profiles', 'PASS');
  end;

  begin
    insert into public.admin_profiles (id, email) values (gen_random_uuid(), 'x@x.com');
    insert into _results values ('anon cannot insert admin_profiles', 'FAIL');
  exception when insufficient_privilege then
    insert into _results values ('anon cannot insert admin_profiles', 'PASS');
  end;

  begin
    select count(*) into n from public.members;
    insert into _results values ('anon cannot read members', 'FAIL');
  exception when insufficient_privilege then
    insert into _results values ('anon cannot read members', 'PASS');
  end;

  begin
    delete from public.faqs;
    get diagnostics n = row_count;
    insert into _results values ('anon cannot delete faqs', 'FAIL');
  exception when insufficient_privilege then
    insert into _results values ('anon cannot delete faqs', 'PASS');
  end;

  -- Public may read only active content
  select count(*) into n from public.faqs where is_active = false;
  insert into _results values ('anon sees no inactive faqs', case when n = 0 then 'PASS' else 'FAIL' end);

  -- The one allowed write path: submit_enquiry()
  if (public.submit_enquiry('Visitor Test', '+91 98765 43211', 'Weight loss', 'hello', null) ->> 'ok')::boolean then
    insert into _results values ('anon can submit via submit_enquiry()', 'PASS');
  else
    insert into _results values ('anon can submit via submit_enquiry()', 'FAIL');
  end if;

  if (public.submit_enquiry('A', '123', 'x', null, null) ->> 'ok')::boolean then
    insert into _results values ('submit_enquiry rejects invalid input', 'FAIL');
  else
    insert into _results values ('submit_enquiry rejects invalid input', 'PASS');
  end if;
end $$;

reset role;

-- ---------------------------------------------------------------
-- 2. Signed-in user who is NOT an admin (random uuid not in admin_profiles)
-- ---------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', gen_random_uuid(), 'role', 'authenticated')::text, true);

do $$
declare n int;
begin
  select count(*) into n from public.enquiries;
  insert into _results values ('non-admin user sees 0 enquiries', case when n = 0 then 'PASS' else 'FAIL (saw ' || n || ')' end);

  select count(*) into n from public.admin_profiles;
  insert into _results values ('non-admin user sees 0 admin_profiles', case when n = 0 then 'PASS' else 'FAIL' end);

  begin
    insert into public.admin_profiles (id, email, role) values ((select auth.uid()), 'me@x.com', 'super_admin');
    insert into _results values ('non-admin cannot self-promote', 'FAIL');
  exception when insufficient_privilege then
    insert into _results values ('non-admin cannot self-promote', 'PASS');
  end;

  begin
    insert into public.faqs (question, answer) values ('hack?', 'yes');
    insert into _results values ('non-admin cannot add faqs', 'FAIL');
  exception when insufficient_privilege or check_violation then
    insert into _results values ('non-admin cannot add faqs', 'PASS');
  end;

  update public.enquiries set status = 'converted';
  get diagnostics n = row_count;
  insert into _results values ('non-admin cannot update enquiries', case when n = 0 then 'PASS' else 'FAIL' end);

  delete from public.enquiries;
  get diagnostics n = row_count;
  insert into _results values ('non-admin cannot delete enquiries', case when n = 0 then 'PASS' else 'FAIL' end);
end $$;

reset role;

-- ---------------------------------------------------------------
-- 3. Real admin: temporarily create one inside this transaction
-- ---------------------------------------------------------------
do $$
declare uid uuid := gen_random_uuid();
begin
  insert into auth.users (id, email, aud, role) values (uid, 'rls-test-admin@example.invalid', 'authenticated', 'authenticated');
  insert into public.admin_profiles (id, email, role) values (uid, 'rls-test-admin@example.invalid', 'admin');
  perform set_config('app.test_admin', uid::text, true);
end $$;

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', current_setting('app.test_admin'), 'role', 'authenticated')::text, true);

do $$
declare n int;
begin
  select count(*) into n from public.enquiries;
  insert into _results values ('admin can read enquiries', case when n >= 1 then 'PASS' else 'FAIL' end);

  update public.enquiries set status = 'contacted', admin_notes = 'called' where full_name = 'RLS Test';
  get diagnostics n = row_count;
  insert into _results values ('admin can update enquiry status/notes', case when n = 1 then 'PASS' else 'FAIL' end);

  begin
    update public.enquiries set phone = '9000000000' where full_name = 'RLS Test';
    insert into _results values ('admin cannot edit customer phone', 'FAIL');
  exception when insufficient_privilege then
    insert into _results values ('admin cannot edit customer phone', 'PASS');
  end;

  begin
    insert into public.admin_profiles (id, email) values (gen_random_uuid(), 'other@x.com');
    insert into _results values ('admin cannot create other admins from the client', 'FAIL');
  exception when insufficient_privilege then
    insert into _results values ('admin cannot create other admins from the client', 'PASS');
  end;

  insert into public.faqs (question, answer, is_active) values ('RLS test question?', 'RLS test answer', false);
  select count(*) into n from public.faqs where question = 'RLS test question?';
  insert into _results values ('admin can add and see inactive faq', case when n = 1 then 'PASS' else 'FAIL' end);

  delete from public.enquiries where full_name = 'RLS Test';
  get diagnostics n = row_count;
  insert into _results values ('admin can delete enquiries', case when n = 1 then 'PASS' else 'FAIL' end);

  insert into _results values ('admin_enquiry_stats works for admin',
    case when (public.admin_enquiry_stats() ->> 'total')::int >= 0 then 'PASS' else 'FAIL' end);
end $$;

reset role;

select * from _results order by outcome desc, check_name;

rollback;

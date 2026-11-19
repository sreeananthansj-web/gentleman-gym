-- =====================================================================
-- 1. submit_enquiry(): the ONLY way the public website can write an enquiry
-- 2. admin_enquiry_stats(): dashboard numbers computed in the database
-- 3. add_member_membership(): atomic "new membership period" for a member
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Public enquiry submission
--    * anon has no table privileges on public.enquiries; it can only call this function
--    * validates every field server-side (never trust the browser)
--    * honeypot: a filled hidden "website" field is silently discarded
--    * rate limits (per hour): 3 per phone number, 5 per visitor IP hash, 300 site-wide
--    * identical resubmission within 10 minutes is accepted but not stored twice
--    Returns {"ok": true} or {"ok": false, "error": "<code>"}.
-- ---------------------------------------------------------------------
create or replace function public.submit_enquiry(
  p_full_name    text,
  p_phone        text,
  p_fitness_goal text,
  p_message      text default null,
  p_website      text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name     text := btrim(coalesce(p_full_name, ''));
  v_digits   text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  v_phone    text;
  v_goal     text := btrim(coalesce(p_fitness_goal, ''));
  v_message  text := nullif(btrim(coalesce(p_message, '')), '');
  v_headers  json;
  v_ip       text;
  v_ip_hash  text;
begin
  -- Honeypot (bots fill hidden fields). Pretend success, store nothing.
  if btrim(coalesce(p_website, '')) <> '' then
    return jsonb_build_object('ok', true);
  end if;

  if char_length(v_name) < 2 or char_length(v_name) > 80 then
    return jsonb_build_object('ok', false, 'error', 'invalid_name');
  end if;

  -- Normalise Indian mobile numbers: +91XXXXXXXXXX, 91XXXXXXXXXX, 0XXXXXXXXXX -> 10 digits
  if char_length(v_digits) = 12 and left(v_digits, 2) = '91' then
    v_phone := substr(v_digits, 3);
  elsif char_length(v_digits) = 11 and left(v_digits, 1) = '0' then
    v_phone := substr(v_digits, 2);
  else
    v_phone := v_digits;
  end if;
  if v_phone !~ '^[6-9][0-9]{9}$' then
    return jsonb_build_object('ok', false, 'error', 'invalid_phone');
  end if;

  if char_length(v_goal) < 2 or char_length(v_goal) > 80 then
    return jsonb_build_object('ok', false, 'error', 'invalid_goal');
  end if;

  if v_message is not null and char_length(v_message) > 600 then
    return jsonb_build_object('ok', false, 'error', 'invalid_message');
  end if;

  -- Visitor IP (best effort; PostgREST exposes request headers). Only a hash is stored.
  begin
    v_headers := nullif(current_setting('request.headers', true), '')::json;
  exception when others then
    v_headers := null;
  end;
  v_ip := coalesce(
    nullif(btrim(v_headers ->> 'cf-connecting-ip'), ''),
    nullif(btrim(split_part(coalesce(v_headers ->> 'x-forwarded-for', ''), ',', 1)), '')
  );
  if v_ip is not null then
    v_ip_hash := encode(sha256(convert_to(v_ip, 'UTF8')), 'hex');
  end if;

  -- Idempotency: same person re-sending the same enquiry within 10 minutes.
  if exists (
    select 1 from public.enquiries
    where phone = v_phone
      and fitness_goal = v_goal
      and coalesce(message, '') = coalesce(v_message, '')
      and created_at > now() - interval '10 minutes'
  ) then
    return jsonb_build_object('ok', true);
  end if;

  -- Rate limits.
  if (select count(*) from public.enquiries
      where phone = v_phone and created_at > now() - interval '1 hour') >= 3 then
    return jsonb_build_object('ok', false, 'error', 'rate_limited');
  end if;

  if v_ip_hash is not null and (select count(*) from public.enquiries
      where ip_hash = v_ip_hash and created_at > now() - interval '1 hour') >= 5 then
    return jsonb_build_object('ok', false, 'error', 'rate_limited');
  end if;

  if (select count(*) from public.enquiries
      where created_at > now() - interval '1 hour') >= 300 then
    return jsonb_build_object('ok', false, 'error', 'rate_limited');
  end if;

  insert into public.enquiries (full_name, phone, fitness_goal, message, ip_hash)
  values (v_name, v_phone, v_goal, v_message, v_ip_hash);

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.submit_enquiry(text, text, text, text, text) from public;
grant execute on function public.submit_enquiry(text, text, text, text, text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- 2. Dashboard statistics. SECURITY INVOKER: RLS applies, so a non-admin
--    caller simply sees zeros. Months are bucketed in India time.
-- ---------------------------------------------------------------------
create or replace function public.admin_enquiry_stats()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'total', (select count(*) from public.enquiries),
    'by_status', (
      select jsonb_build_object(
        'new',            count(*) filter (where status = 'new'),
        'contacted',      count(*) filter (where status = 'contacted'),
        'interested',     count(*) filter (where status = 'interested'),
        'converted',      count(*) filter (where status = 'converted'),
        'not_interested', count(*) filter (where status = 'not_interested')
      ) from public.enquiries
    ),
    'by_goal', (
      select coalesce(jsonb_object_agg(g.fitness_goal, g.c), '{}'::jsonb)
      from (select fitness_goal, count(*) as c from public.enquiries group by fitness_goal) g
    ),
    'monthly', (
      select coalesce(
        jsonb_agg(
          jsonb_build_object('month', to_char(m.month_start, 'YYYY-MM'), 'count', coalesce(e.cnt, 0))
          order by m.month_start
        ), '[]'::jsonb)
      from generate_series(
             date_trunc('month', now() at time zone 'Asia/Kolkata') - interval '5 months',
             date_trunc('month', now() at time zone 'Asia/Kolkata'),
             interval '1 month'
           ) as m(month_start)
      left join (
        select date_trunc('month', created_at at time zone 'Asia/Kolkata') as mo, count(*) as cnt
        from public.enquiries
        group by 1
      ) e on e.mo = m.month_start
    )
  );
$$;

revoke all on function public.admin_enquiry_stats() from public;
grant execute on function public.admin_enquiry_stats() to authenticated;

-- ---------------------------------------------------------------------
-- 3. Add a membership period to a member (history row + current status) in one transaction.
--    SECURITY INVOKER: only admins can pass the RLS checks on both tables.
-- ---------------------------------------------------------------------
create or replace function public.add_member_membership(
  p_member_id uuid,
  p_plan_id   uuid,
  p_plan_name text,
  p_start     date,
  p_end       date,
  p_notes     text default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_plan_name text;
  v_id        uuid;
begin
  if p_plan_id is not null then
    select name into v_plan_name from public.membership_plans where id = p_plan_id;
  end if;
  v_plan_name := coalesce(v_plan_name, nullif(btrim(coalesce(p_plan_name, '')), ''));
  if v_plan_name is null then
    raise exception 'plan_required' using errcode = '22023';
  end if;
  if p_start is null or p_end is null or p_end < p_start then
    raise exception 'invalid_dates' using errcode = '22023';
  end if;

  insert into public.member_memberships (member_id, plan_id, plan_name, start_date, end_date, notes)
  values (p_member_id, p_plan_id, v_plan_name, p_start, p_end, nullif(btrim(coalesce(p_notes, '')), ''))
  returning id into v_id;

  update public.members
     set membership_status = 'active',
         current_plan_id   = p_plan_id,
         membership_start  = p_start,
         membership_end    = p_end
   where id = p_member_id;

  if not found then
    raise exception 'member_not_found' using errcode = 'P0002';
  end if;

  return v_id;
end;
$$;

revoke all on function public.add_member_membership(uuid, uuid, text, date, date, text) from public;
grant execute on function public.add_member_membership(uuid, uuid, text, date, date, text) to authenticated;

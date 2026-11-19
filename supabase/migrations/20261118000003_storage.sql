-- =====================================================================
-- Storage buckets and policies
--  * trainer-images, gallery-images: public READ (they are shown on the website)
--  * upload / replace / delete: active admins only
--  * 5 MB limit and JPEG/PNG/WebP only, enforced by the bucket itself
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('trainer-images', 'trainer-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('gallery-images', 'gallery-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public buckets serve files by URL without any SELECT policy, so anonymous
-- users cannot LIST the bucket. Admins get explicit access for the dashboard.
drop policy if exists "site images: admins read" on storage.objects;
create policy "site images: admins read"
  on storage.objects for select to authenticated
  using (bucket_id in ('trainer-images', 'gallery-images') and (select public.is_admin()));

drop policy if exists "site images: admins upload" on storage.objects;
create policy "site images: admins upload"
  on storage.objects for insert to authenticated
  with check (bucket_id in ('trainer-images', 'gallery-images') and (select public.is_admin()));

drop policy if exists "site images: admins update" on storage.objects;
create policy "site images: admins update"
  on storage.objects for update to authenticated
  using (bucket_id in ('trainer-images', 'gallery-images') and (select public.is_admin()))
  with check (bucket_id in ('trainer-images', 'gallery-images') and (select public.is_admin()));

drop policy if exists "site images: admins delete" on storage.objects;
create policy "site images: admins delete"
  on storage.objects for delete to authenticated
  using (bucket_id in ('trainer-images', 'gallery-images') and (select public.is_admin()));

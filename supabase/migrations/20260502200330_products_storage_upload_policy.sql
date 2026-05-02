-- GAP-011: versioned storage configuration for product images.
--
-- Product images are public catalog assets, but uploads must go through the
-- Next.js admin API using SUPABASE_SERVICE_ROLE_KEY. Do not add anon or
-- authenticated INSERT policies for this bucket unless the upload architecture
-- changes and is reviewed again.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'products',
  'products',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "products_public_read" on storage.objects;
create policy "products_public_read"
on storage.objects
for select
to public
using (bucket_id = 'products');

-- Remove policy names known to represent direct browser upload patterns.
-- Service-role uploads bypass RLS, so no replacement INSERT policy is needed.
drop policy if exists "products_anon_insert" on storage.objects;
drop policy if exists "products_authenticated_insert" on storage.objects;
drop policy if exists "products_public_insert" on storage.objects;
drop policy if exists "products_public_update" on storage.objects;
drop policy if exists "products_public_delete" on storage.objects;

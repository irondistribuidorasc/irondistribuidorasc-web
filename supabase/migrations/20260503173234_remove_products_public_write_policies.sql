-- GAP-011 follow-up: remove legacy public write policies for products.
--
-- These policy names were created in Supabase before uploads were moved to the
-- Next.js admin API. Product image uploads must use SUPABASE_SERVICE_ROLE_KEY
-- server-side, so anon/authenticated clients must not write to this bucket.

drop policy if exists "Allow Public Uploads 1ifhysk_1" on storage.objects;
drop policy if exists "Allow Public Uploads 1ifhysk_2" on storage.objects;
drop policy if exists "Allow Public Uploads 1ifhysk_3" on storage.objects;

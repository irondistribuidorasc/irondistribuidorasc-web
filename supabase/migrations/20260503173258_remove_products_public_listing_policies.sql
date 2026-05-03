-- GAP-011 follow-up: remove broad listing policies for products.
--
-- The `products` bucket is public, so direct public object URLs keep working
-- without broad SELECT policies on storage.objects. Removing these policies
-- prevents public clients from listing bucket contents.

drop policy if exists "Allow Public Uploads 1ifhysk_0" on storage.objects;
drop policy if exists "products_public_read" on storage.objects;

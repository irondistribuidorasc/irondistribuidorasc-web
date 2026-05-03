-- Database advisor hardening.
--
-- These Prisma tables are accessed by the Next.js server through the database
-- connection, not directly by browser Supabase clients. RLS was already
-- enabled, so the Data API denied access by default. Explicit deny policies
-- keep that behavior while removing the "RLS enabled no policy" advisor noise.

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'Account',
    'Notification',
    'Order',
    'OrderItem',
    'Product',
    'Session',
    'User',
    'VerificationToken',
    '_prisma_migrations'
  ]
  loop
    if to_regclass(format('public.%I', table_name)) is not null then
      execute format(
        'drop policy if exists "deny_data_api_access" on public.%I',
        table_name
      );

      execute format(
        'create policy "deny_data_api_access" on public.%I for all to anon, authenticated using (false) with check (false)',
        table_name
      );
    end if;
  end loop;
end $$;

-- Mirror the Prisma-managed performance hardening so this Supabase migration
-- can clean the live advisor state immediately. The matching Prisma migration
-- keeps future Prisma deploys aligned with schema.prisma.
do $$
begin
  if to_regclass('public."Account"') is not null then
    create index if not exists "Account_userId_idx" on public."Account"("userId");
  end if;

  if to_regclass('public."Session"') is not null then
    create index if not exists "Session_userId_idx" on public."Session"("userId");
  end if;

  if to_regclass('public."VerificationToken"') is not null
    and not exists (
      select 1
      from pg_constraint
      where conname = 'VerificationToken_pkey'
        and conrelid = 'public."VerificationToken"'::regclass
    )
  then
    alter table public."VerificationToken"
      add constraint "VerificationToken_pkey"
      primary key using index "VerificationToken_identifier_token_key";
  end if;

  drop index if exists public."Order_orderNumber_idx";
end $$;

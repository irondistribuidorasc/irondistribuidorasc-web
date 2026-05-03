-- Align Prisma-managed tables with Supabase database advisor recommendations.

-- Foreign keys should have covering indexes for update/delete checks.
CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account"("userId");
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");

-- VerificationToken already has the same unique index from the initial
-- NextAuth schema. Promote it to the table primary key instead of adding a
-- redundant constraint/index. Keep this idempotent because this hardening may
-- be applied through Supabase MCP before Prisma migrate is available locally.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'VerificationToken_pkey'
      AND conrelid = '"VerificationToken"'::regclass
  ) THEN
    ALTER TABLE "VerificationToken"
      ADD CONSTRAINT "VerificationToken_pkey"
      PRIMARY KEY USING INDEX "VerificationToken_identifier_token_key";
  END IF;
END $$;

-- orderNumber is already covered by the unique index from @unique.
DROP INDEX IF EXISTS "Order_orderNumber_idx";

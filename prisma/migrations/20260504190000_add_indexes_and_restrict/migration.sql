-- Migration: Add performance indexes and prevent accidental order deletion
-- Created: 2026-05-04

-- Product indexes
CREATE INDEX IF NOT EXISTS "Product_category_idx" ON "Product"("category");
CREATE INDEX IF NOT EXISTS "Product_brand_idx" ON "Product"("brand");
CREATE INDEX IF NOT EXISTS "Product_popularity_idx" ON "Product"("popularity");
CREATE INDEX IF NOT EXISTS "Product_price_idx" ON "Product"("price");
CREATE INDEX IF NOT EXISTS "Product_createdAt_idx" ON "Product"("createdAt");

-- Order indexes
CREATE INDEX IF NOT EXISTS "Order_status_idx" ON "Order"("status");
CREATE INDEX IF NOT EXISTS "Order_createdAt_idx" ON "Order"("createdAt");

-- User indexes
CREATE INDEX IF NOT EXISTS "User_role_createdAt_idx" ON "User"("role", "createdAt");

-- Change Order.user onDelete from Cascade to Restrict
-- Note: This requires dropping and recreating the foreign key constraint
-- WARNING: Run this only after ensuring no code calls prisma.user.delete() on users with orders

-- First, drop the existing foreign key constraint
ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS "Order_userId_fkey";

-- Recreate with ON DELETE RESTRICT
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT;

-- Note: For pg_trgm GIN indexes on text search, run the following manually after enabling the extension:
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- CREATE INDEX IF NOT EXISTS "Product_name_trgm_idx" ON "Product" USING GIN ("name" gin_trgm_ops);
-- CREATE INDEX IF NOT EXISTS "Product_code_trgm_idx" ON "Product" USING GIN ("code" gin_trgm_ops);
-- CREATE INDEX IF NOT EXISTS "Product_model_trgm_idx" ON "Product" USING GIN ("model" gin_trgm_ops);
-- CREATE INDEX IF NOT EXISTS "Order_customerName_trgm_idx" ON "Order" USING GIN ("customerName" gin_trgm_ops);
-- CREATE INDEX IF NOT EXISTS "Order_customerEmail_trgm_idx" ON "Order" USING GIN ("customerEmail" gin_trgm_ops);
-- CREATE INDEX IF NOT EXISTS "Order_customerPhone_trgm_idx" ON "Order" USING GIN ("customerPhone" gin_trgm_ops);
-- CREATE INDEX IF NOT EXISTS "User_name_trgm_idx" ON "User" USING GIN ("name" gin_trgm_ops);
-- CREATE INDEX IF NOT EXISTS "User_storeName_trgm_idx" ON "User" USING GIN ("storeName" gin_trgm_ops);

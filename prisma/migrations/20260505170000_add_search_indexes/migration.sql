-- Migration: Add text search and composite performance indexes
-- Created: 2026-05-05

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Product trigram search indexes
CREATE INDEX IF NOT EXISTS "Product_name_trgm_idx" ON "Product" USING GIN ("name" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Product_code_trgm_idx" ON "Product" USING GIN ("code" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Product_model_trgm_idx" ON "Product" USING GIN ("model" gin_trgm_ops);

-- Order trigram search indexes
CREATE INDEX IF NOT EXISTS "Order_customerName_trgm_idx" ON "Order" USING GIN ("customerName" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Order_customerEmail_trgm_idx" ON "Order" USING GIN ("customerEmail" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Order_customerPhone_trgm_idx" ON "Order" USING GIN ("customerPhone" gin_trgm_ops);

-- User trigram search indexes
CREATE INDEX IF NOT EXISTS "User_name_trgm_idx" ON "User" USING GIN ("name" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "User_storeName_trgm_idx" ON "User" USING GIN ("storeName" gin_trgm_ops);

-- Composite indexes for common list ordering
CREATE INDEX IF NOT EXISTS "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "Order_status_createdAt_idx" ON "Order"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "User_role_updatedAt_idx" ON "User"("role", "updatedAt");

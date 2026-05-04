-- Migration: Create PostgreSQL sequence for atomic order numbers
-- Created: 2026-05-04

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1001;

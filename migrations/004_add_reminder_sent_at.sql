-- Migration: Add reminder_sent_at column to orders table
-- Run with: npx wrangler d1 execute bakes-coral-db --remote --file=migrations/004_add_reminder_sent_at.sql

-- Add column for tracking when pickup reminder was sent
ALTER TABLE orders ADD COLUMN reminder_sent_at TEXT;

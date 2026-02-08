-- Migration 007: Multi-Tenant Foundation
-- Adds tenants, user_tenants, tenant_settings tables
-- Adds tenant_id to existing tables

-- Tenants table (each client business)
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#541409',
  secondary_color TEXT DEFAULT '#EAD6D6',
  timezone TEXT DEFAULT 'America/New_York',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_domain ON tenants(domain);

-- User-Tenant relationship (allows users to access multiple tenants)
CREATE TABLE IF NOT EXISTS user_tenants (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'editor', 'viewer')),
  is_default INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_user_tenants_user ON user_tenants(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tenants_tenant ON user_tenants(tenant_id);

-- Per-tenant settings (overrides global settings)
CREATE TABLE IF NOT EXISTS tenant_settings (
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(tenant_id, key)
);

CREATE INDEX IF NOT EXISTS idx_tenant_settings_tenant ON tenant_settings(tenant_id);

-- Insert default tenants
INSERT INTO tenants (id, slug, name, domain, primary_color, secondary_color) VALUES
  ('bakes-by-coral', 'bakes-by-coral', 'Bakes by Coral', 'bakesbycoral.com', '#541409', '#EAD6D6'),
  ('leango', 'leango', 'LeanGo', 'leango.com', '#1e40af', '#dbeafe');

-- Add tenant_id to orders table
ALTER TABLE orders ADD COLUMN tenant_id TEXT REFERENCES tenants(id) DEFAULT 'bakes-by-coral';
CREATE INDEX IF NOT EXISTS idx_orders_tenant ON orders(tenant_id);

-- Add tenant_id to customers table
ALTER TABLE customers ADD COLUMN tenant_id TEXT REFERENCES tenants(id) DEFAULT 'bakes-by-coral';
CREATE INDEX IF NOT EXISTS idx_customers_tenant ON customers(tenant_id);

-- Add tenant_id to blackout_dates table
ALTER TABLE blackout_dates ADD COLUMN tenant_id TEXT REFERENCES tenants(id) DEFAULT 'bakes-by-coral';
CREATE INDEX IF NOT EXISTS idx_blackout_tenant ON blackout_dates(tenant_id);

-- Add tenant_id to pickup_slots table
ALTER TABLE pickup_slots ADD COLUMN tenant_id TEXT REFERENCES tenants(id) DEFAULT 'bakes-by-coral';
CREATE INDEX IF NOT EXISTS idx_pickup_slots_tenant ON pickup_slots(tenant_id);

-- Add tenant_id to coupons table
ALTER TABLE coupons ADD COLUMN tenant_id TEXT REFERENCES tenants(id) DEFAULT 'bakes-by-coral';
CREATE INDEX IF NOT EXISTS idx_coupons_tenant ON coupons(tenant_id);

-- Add tenant_id to quotes table
ALTER TABLE quotes ADD COLUMN tenant_id TEXT REFERENCES tenants(id) DEFAULT 'bakes-by-coral';
CREATE INDEX IF NOT EXISTS idx_quotes_tenant ON quotes(tenant_id);

-- Add tenant_id to order_notes table
ALTER TABLE order_notes ADD COLUMN tenant_id TEXT REFERENCES tenants(id) DEFAULT 'bakes-by-coral';
CREATE INDEX IF NOT EXISTS idx_order_notes_tenant ON order_notes(tenant_id);

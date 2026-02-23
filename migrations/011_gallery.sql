CREATE TABLE IF NOT EXISTS gallery_images (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  category TEXT NOT NULL DEFAULT 'cakes',
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Migration 009: Blog CMS System
-- Adds blog_posts, blog_categories, blog_post_categories tables

-- Blog categories
CREATE TABLE IF NOT EXISTS blog_categories (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(tenant_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_blog_categories_tenant ON blog_categories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(tenant_id, slug);

-- Blog posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  author_id TEXT REFERENCES users(id),
  category_id TEXT REFERENCES blog_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
  publish_at TEXT,
  published_at TEXT,
  meta_title TEXT,
  meta_description TEXT,
  og_image TEXT,
  views INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(tenant_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_tenant ON blog_posts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(tenant_id, slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);

-- Blog post tags (many-to-many)
CREATE TABLE IF NOT EXISTS blog_tags (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(tenant_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_blog_tags_tenant ON blog_tags(tenant_id);

CREATE TABLE IF NOT EXISTS blog_post_tags (
  post_id TEXT NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Insert default blog categories for LeanGo
INSERT INTO blog_categories (id, tenant_id, name, slug, description, sort_order) VALUES
  ('leango-lean', 'leango', 'Lean Methodology', 'lean', 'Articles about lean principles and practices', 1),
  ('leango-analytics', 'leango', 'Analytics', 'analytics', 'Insights on data-driven decision making', 2),
  ('leango-training', 'leango', 'Training', 'training', 'Resources for continuous improvement training', 3),
  ('leango-case-studies', 'leango', 'Case Studies', 'case-studies', 'Real-world examples of our work', 4);

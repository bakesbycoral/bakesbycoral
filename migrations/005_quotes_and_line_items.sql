-- Quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  quote_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'approved', 'expired', 'converted')),
  subtotal INTEGER NOT NULL DEFAULT 0,
  deposit_percentage INTEGER DEFAULT 50,
  deposit_amount INTEGER,
  total_amount INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  customer_message TEXT,
  valid_until TEXT,
  approval_token TEXT UNIQUE,
  approved_at TEXT,
  stripe_invoice_id TEXT,
  stripe_invoice_url TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Line items table
CREATE TABLE IF NOT EXISTS quote_line_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id TEXT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price INTEGER NOT NULL,
  total_price INTEGER NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quotes_order ON quotes(order_id);
CREATE INDEX IF NOT EXISTS idx_quotes_token ON quotes(approval_token);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_line_items_quote ON quote_line_items(quote_id);

-- Add tasting settings
INSERT OR IGNORE INTO settings (key, value, description) VALUES
  ('quote_validity_days', '7', 'Days until quote expires'),
  ('tasting_price_cake', '7000', 'Cake tasting price (cents)'),
  ('tasting_price_cookie', '3000', 'Cookie tasting price (cents)'),
  ('tasting_price_both', '10000', 'Both tastings price (cents)'),
  ('lead_time_tasting', '3', 'Min days notice for tastings');

-- Update orders table to support tasting order type
-- Note: SQLite doesn't support ALTER TABLE to modify CHECK constraint
-- The application will handle the 'tasting' order type validation

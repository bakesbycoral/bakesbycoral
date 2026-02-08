-- Migration: Add 'tasting' to order_type CHECK constraint
-- This requires recreating the orders table in SQLite

-- Step 1: Create new table with updated constraint
CREATE TABLE orders_new (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  order_type TEXT NOT NULL CHECK (order_type IN ('cookies', 'cookies_large', 'cake', 'wedding', 'tasting')),
  status TEXT NOT NULL DEFAULT 'inquiry' CHECK (status IN (
    'inquiry', 'pending_payment', 'deposit_paid', 'confirmed',
    'completed', 'cancelled'
  )),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  event_date TEXT,
  pickup_date TEXT,
  pickup_time TEXT,
  backup_date TEXT,
  backup_time TEXT,
  pickup_person_name TEXT,
  total_amount INTEGER,
  deposit_amount INTEGER,
  notes TEXT,
  form_data TEXT,
  stripe_session_id TEXT,
  stripe_payment_id TEXT,
  stripe_invoice_id TEXT,
  stripe_invoice_url TEXT,
  paid_at TEXT,
  deposit_paid_at TEXT,
  completed_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Step 2: Copy all data from old table
INSERT INTO orders_new SELECT * FROM orders;

-- Step 3: Drop old table
DROP TABLE orders;

-- Step 4: Rename new table
ALTER TABLE orders_new RENAME TO orders;

-- Step 5: Recreate indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_pickup_date ON orders(pickup_date);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

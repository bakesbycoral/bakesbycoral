-- Bakes by Coral Database Schema
-- Run with: npm run db:migrate

-- Users table (for admin authentication)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin')),
  last_login_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Orders table (unified structure for all order types)
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  order_type TEXT NOT NULL CHECK (order_type IN ('cookies', 'cookies_large', 'cake', 'wedding')),
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
  form_data TEXT, -- JSON blob with order-type-specific data
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

CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_type ON orders(order_type);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_pickup_date ON orders(pickup_date);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);

-- Blackout dates table
CREATE TABLE IF NOT EXISTS blackout_dates (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL UNIQUE,
  reason TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_blackout_date ON blackout_dates(date);

-- Settings table for configurable business rules
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Insert default settings
INSERT OR IGNORE INTO settings (key, value, description) VALUES
  -- Pricing (matches website values)
  ('cookie_price_per_dozen', '3000', 'Price per dozen cookies in cents ($30)'),
  ('cake_price_4_inch', '6000', 'Base price for 4 inch cake in cents ($60)'),
  ('cake_price_6_inch', '10000', 'Base price for 6 inch cake in cents ($100)'),
  ('cake_price_8_inch', '14000', 'Base price for 8 inch cake in cents ($140)'),
  ('cake_price_10_inch', '18000', 'Base price for 10 inch cake in cents ($180)'),
  ('design_multiplier_simple', '1.0', 'Price multiplier for simple cake designs'),
  ('design_multiplier_moderate', '1.25', 'Price multiplier for moderate cake designs'),
  ('design_multiplier_intricate', '1.5', 'Price multiplier for intricate cake designs'),
  ('deposit_percentage', '50', 'Deposit percentage for large orders'),

  -- Lead times (in days)
  ('lead_time_small_cookie', '7', 'Minimum days notice for small cookie orders'),
  ('lead_time_large_cookie', '14', 'Minimum days notice for large cookie orders'),
  ('lead_time_cake', '14', 'Minimum days notice for cake orders'),
  ('lead_time_wedding', '30', 'Minimum days notice for wedding orders'),

  -- Pickup hours (JSON format: {start: "HH:MM", end: "HH:MM"} or null for closed)
  ('pickup_hours_sunday', '{"start":"09:00","end":"12:00"}', 'Sunday pickup hours'),
  ('pickup_hours_monday', '{"start":"09:00","end":"19:00"}', 'Monday pickup hours'),
  ('pickup_hours_tuesday', '{"start":"09:00","end":"12:00"}', 'Tuesday pickup hours'),
  ('pickup_hours_wednesday', '{"start":"09:00","end":"12:00"}', 'Wednesday pickup hours'),
  ('pickup_hours_thursday', '{"start":"09:00","end":"12:00"}', 'Thursday pickup hours'),
  ('pickup_hours_friday', '{"start":"09:00","end":"19:00"}', 'Friday pickup hours'),
  ('pickup_hours_saturday', '{"start":"09:00","end":"12:00"}', 'Saturday pickup hours'),

  -- Slot capacity
  ('default_slot_capacity', '2', 'Default number of pickups per time slot'),
  ('slot_interval_minutes', '30', 'Duration of each time slot in minutes');

-- Pickup slots table for tracking capacity per time slot
CREATE TABLE IF NOT EXISTS pickup_slots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  capacity INTEGER DEFAULT 2,
  booked INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(date, time)
);

CREATE INDEX IF NOT EXISTS idx_pickup_slots_date ON pickup_slots(date);
CREATE INDEX IF NOT EXISTS idx_pickup_slots_date_time ON pickup_slots(date, time);

-- Admin notes table for internal order notes
CREATE TABLE IF NOT EXISTS order_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_by TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_order_notes_order ON order_notes(order_id);

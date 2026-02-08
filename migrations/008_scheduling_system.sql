-- Migration 008: Calendly-Style Scheduling System
-- Adds availability_windows, booking_types, bookings, availability_overrides tables

-- Availability windows (recurring weekly schedule)
CREATE TABLE IF NOT EXISTS availability_windows (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_availability_windows_tenant ON availability_windows(tenant_id);
CREATE INDEX IF NOT EXISTS idx_availability_windows_day ON availability_windows(tenant_id, day_of_week);

-- Booking types (consultation, discovery call, etc.)
CREATE TABLE IF NOT EXISTS booking_types (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER DEFAULT 30,
  buffer_after_minutes INTEGER DEFAULT 15,
  max_bookings_per_day INTEGER,
  requires_approval INTEGER DEFAULT 0,
  confirmation_message TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(tenant_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_booking_types_tenant ON booking_types(tenant_id);
CREATE INDEX IF NOT EXISTS idx_booking_types_slug ON booking_types(tenant_id, slug);

-- Bookings (scheduled appointments)
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  booking_type_id TEXT NOT NULL REFERENCES booking_types(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_company TEXT,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  notes TEXT,
  internal_notes TEXT,
  confirmation_token TEXT UNIQUE,
  cancellation_token TEXT UNIQUE,
  reminder_sent_at TEXT,
  confirmed_at TEXT,
  cancelled_at TEXT,
  cancellation_reason TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_bookings_tenant ON bookings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bookings_type ON bookings(booking_type_id);
CREATE INDEX IF NOT EXISTS idx_bookings_start ON bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(customer_email);

-- Availability overrides (specific date exceptions)
CREATE TABLE IF NOT EXISTS availability_overrides (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  is_available INTEGER DEFAULT 0,
  start_time TEXT,
  end_time TEXT,
  reason TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(tenant_id, date)
);

CREATE INDEX IF NOT EXISTS idx_availability_overrides_tenant ON availability_overrides(tenant_id);
CREATE INDEX IF NOT EXISTS idx_availability_overrides_date ON availability_overrides(tenant_id, date);

-- Insert default booking types for LeanGo
INSERT INTO booking_types (id, tenant_id, name, slug, description, duration_minutes, buffer_after_minutes) VALUES
  ('leango-consultation', 'leango', 'Free Consultation', 'consultation', 'A 30-minute introductory call to discuss your business challenges and how we can help.', 30, 15),
  ('leango-discovery', 'leango', 'Discovery Session', 'discovery', 'A 60-minute deep-dive session to understand your processes and identify improvement opportunities.', 60, 15);

-- Insert default availability windows for LeanGo (Mon-Fri 9am-5pm)
INSERT INTO availability_windows (id, tenant_id, day_of_week, start_time, end_time) VALUES
  ('leango-mon', 'leango', 1, '09:00', '17:00'),
  ('leango-tue', 'leango', 2, '09:00', '17:00'),
  ('leango-wed', 'leango', 3, '09:00', '17:00'),
  ('leango-thu', 'leango', 4, '09:00', '17:00'),
  ('leango-fri', 'leango', 5, '09:00', '17:00');

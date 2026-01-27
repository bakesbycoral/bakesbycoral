-- Seed data for Bakes by Coral development
-- Run with: npm run db:seed
-- Note: Settings are already populated by schema.sql migration

-- Sample orders (various types and statuses)
INSERT OR IGNORE INTO orders (
  id, order_number, order_type, status,
  customer_name, customer_email, customer_phone,
  event_date, pickup_date, pickup_time,
  total_amount, deposit_amount, notes, form_data,
  created_at, updated_at
) VALUES
  -- Completed small cookie order
  (
    'order-001', 'CK-TEST001', 'cookies', 'completed',
    'Sarah Johnson', 'sarah@example.com', '513-555-0101',
    NULL, date('now', '-7 days'), '10:00',
    8000, 8000, '2 dozen chocolate chip',
    '{"flavors":["chocolate_chip","snickerdoodle"],"quantity":"2"}',
    datetime('now', '-14 days'), datetime('now', '-7 days')
  ),

  -- Paid cake order awaiting pickup
  (
    'order-002', 'CAKE-TEST001', 'cake', 'confirmed',
    'Mike Chen', 'mike.chen@example.com', '513-555-0102',
    date('now', '+3 days'), date('now', '+3 days'), '11:00',
    9500, 4750, 'Birthday cake for son, Mario theme',
    '{"size":"8","flavor":"vanilla","filling":"strawberry","buttercream":"vanilla","design_style":"moderate","color_palette":"Red, Blue, Yellow"}',
    datetime('now', '-10 days'), datetime('now', '-3 days')
  ),

  -- Inquiry received for large cookie order
  (
    'order-003', 'CKL-TEST001', 'cookies_large', 'inquiry',
    'Emily Davis', 'emily.davis@example.com', '513-555-0103',
    date('now', '+14 days'), date('now', '+14 days'), '09:30',
    NULL, NULL, 'Corporate event, 8 dozen assorted',
    '{"quantity":"8","flavor_mix":"4 dozen chocolate chip, 2 dozen snickerdoodle, 2 dozen lemon sugar","individual_wrap":true,"event_type":"corporate"}',
    datetime('now', '-2 days'), datetime('now', '-2 days')
  ),

  -- Wedding inquiry with quote sent
  (
    'order-004', 'WED-TEST001', 'wedding', 'pending_payment',
    'Jennifer Wilson', 'jen.wilson@example.com', '513-555-0104',
    date('now', '+60 days'), date('now', '+59 days'), '14:00',
    45000, 22500, '3-tier wedding cake, blush pink with florals',
    '{"services_needed":"cake_and_desserts","guest_count":"100-150","cake_tiers":"3","cake_flavor":"almond","theme":"Romantic Garden"}',
    datetime('now', '-5 days'), datetime('now', '-3 days')
  ),

  -- Pending payment cake order
  (
    'order-005', 'CAKE-TEST002', 'cake', 'pending_payment',
    'David Brown', 'dbrown@example.com', '513-555-0105',
    date('now', '+10 days'), date('now', '+10 days'), '10:30',
    7500, 3750, 'Baby shower cake, gender neutral',
    '{"size":"6","flavor":"chocolate","filling":"chocolate_mousse","buttercream":"chocolate","design_style":"simple","color_palette":"Sage Green, Cream"}',
    datetime('now', '-1 days'), datetime('now')
  );

-- Sample blackout dates
INSERT OR IGNORE INTO blackout_dates (id, date, reason) VALUES
  ('black-001', date('now', '+30 days'), 'Vacation'),
  ('black-002', '2026-12-25', 'Christmas Day'),
  ('black-003', '2026-12-31', 'New Years Eve'),
  ('black-004', '2027-01-01', 'New Years Day');

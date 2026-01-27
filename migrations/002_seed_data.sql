-- Migration: Seed data from local development
-- Run with: npx wrangler d1 execute bakes-coral-db --remote --file=migrations/002_seed_data.sql

-- First, ensure the schema is up to date (run schema.sql first if not done)

-- Clear existing data (optional - comment out if you want to keep existing remote data)
-- DELETE FROM orders;
-- DELETE FROM blackout_dates;
-- DELETE FROM settings;

-- Insert Orders
INSERT OR REPLACE INTO orders (id, order_number, order_type, status, customer_name, customer_email, customer_phone, event_date, pickup_date, pickup_time, backup_date, backup_time, pickup_person_name, total_amount, deposit_amount, notes, form_data, stripe_session_id, stripe_payment_id, paid_at, deposit_paid_at, completed_at, created_at, updated_at) VALUES
('order-001', 'CK-TEST001', 'cookies', 'completed', 'Sarah Johnson', 'sarah@example.com', '513-555-0101', NULL, '2026-01-10', '10:00', NULL, NULL, NULL, 8000, 8000, '2 dozen chocolate chip', '{"flavors":["chocolate_chip","snickerdoodle"],"quantity":"2"}', NULL, NULL, NULL, NULL, NULL, '2026-01-03 21:28:34', '2026-01-10 21:28:34'),
('order-002', 'CAKE-TEST001', 'cake', 'confirmed', 'Mike Chen', 'mike.chen@example.com', '513-555-0102', '2026-01-20', '2026-01-20', '11:00', NULL, NULL, NULL, 9500, 4750, 'Birthday cake for son, Mario theme', '{"size":"8","flavor":"vanilla","filling":"strawberry","buttercream":"vanilla","design_style":"moderate","color_palette":"Red, Blue, Yellow"}', NULL, NULL, NULL, NULL, NULL, '2026-01-07 21:28:34', '2026-01-14 21:28:34'),
('order-003', 'CKL-TEST001', 'cookies_large', 'inquiry', 'Emily Davis', 'emily.davis@example.com', '513-555-0103', '2026-01-31', '2026-01-31', '09:30', NULL, NULL, NULL, NULL, NULL, 'Corporate event, 8 dozen assorted', '{"quantity":"8","flavor_mix":"4 dozen chocolate chip, 2 dozen snickerdoodle, 2 dozen lemon sugar","individual_wrap":true,"event_type":"corporate"}', NULL, NULL, NULL, NULL, NULL, '2026-01-15 21:28:34', '2026-01-15 21:28:34'),
('order-004', 'WED-TEST001', 'wedding', 'pending_payment', 'Jennifer Wilson', 'jen.wilson@example.com', '513-555-0104', '2026-03-18', '2026-03-17', '14:00', NULL, NULL, NULL, 45000, 22500, '3-tier wedding cake, blush pink with florals', '{"services_needed":"cake_and_desserts","guest_count":"100-150","cake_tiers":"3","cake_flavor":"almond","theme":"Romantic Garden"}', NULL, NULL, NULL, NULL, NULL, '2026-01-12 21:28:34', '2026-01-14 21:28:34'),
('order-005', 'CAKE-TEST002', 'cake', 'pending_payment', 'David Brown', 'dbrown@example.com', '513-555-0105', '2026-01-27', '2026-01-27', '10:30', NULL, NULL, NULL, 7500, 3750, 'Baby shower cake, gender neutral', '{"size":"6","flavor":"chocolate","filling":"chocolate_mousse","buttercream":"chocolate","design_style":"simple","color_palette":"Sage Green, Cream"}', NULL, NULL, NULL, NULL, NULL, '2026-01-16 21:28:34', '2026-01-17 21:28:34');

-- Insert Blackout Dates
INSERT OR REPLACE INTO blackout_dates (id, date, reason, created_at) VALUES
('black-001', '2026-02-16', 'Vacation', '2026-01-17 21:28:34'),
('black-002', '2026-12-25', 'Christmas Day', '2026-01-17 21:28:34'),
('black-003', '2026-12-31', 'New Years Eve', '2026-01-17 21:28:34'),
('black-004', '2027-01-01', 'New Years Day', '2026-01-17 21:28:34');

-- Update Settings (using INSERT OR REPLACE to update existing or insert new)
INSERT OR REPLACE INTO settings (key, value, description, updated_at) VALUES
('cookie_price_per_dozen', '4000', 'Price per dozen cookies in cents', '2026-01-17 21:28:27'),
('cake_price_4_inch', '4500', 'Base price for 4 inch cake in cents', '2026-01-17 21:28:27'),
('cake_price_6_inch', '6500', 'Base price for 6 inch cake in cents', '2026-01-17 21:28:27'),
('cake_price_8_inch', '8500', 'Base price for 8 inch cake in cents', '2026-01-17 21:28:27'),
('cake_price_10_inch', '11000', 'Base price for 10 inch cake in cents', '2026-01-17 21:28:27'),
('design_multiplier_simple', '1.0', 'Price multiplier for simple cake designs', '2026-01-17 21:28:27'),
('design_multiplier_moderate', '1.25', 'Price multiplier for moderate cake designs', '2026-01-17 21:28:27'),
('design_multiplier_intricate', '1.5', 'Price multiplier for intricate cake designs', '2026-01-17 21:28:27'),
('deposit_percentage', '50', 'Deposit percentage for large orders', '2026-01-17 21:28:27'),
('lead_time_small_cookie', '7', 'Minimum days notice for small cookie orders', '2026-01-17 21:28:27'),
('lead_time_large_cookie', '14', 'Minimum days notice for large cookie orders', '2026-01-17 21:28:27'),
('lead_time_cake', '14', 'Minimum days notice for cake orders', '2026-01-17 21:28:27'),
('lead_time_wedding', '30', 'Minimum days notice for wedding orders', '2026-01-17 21:28:27'),
('pickup_hours_sunday', '{"start":"09:00","end":"12:00"}', 'Sunday pickup hours', '2026-01-17 21:28:27'),
('pickup_hours_monday', '{"start":"09:00","end":"19:00"}', 'Monday pickup hours', '2026-01-17 21:28:27'),
('pickup_hours_tuesday', '{"start":"09:00","end":"12:00"}', 'Tuesday pickup hours', '2026-01-17 21:28:27'),
('pickup_hours_wednesday', '{"start":"09:00","end":"12:00"}', 'Wednesday pickup hours', '2026-01-17 21:28:27'),
('pickup_hours_thursday', '{"start":"09:00","end":"12:00"}', 'Thursday pickup hours', '2026-01-17 21:28:27'),
('pickup_hours_friday', '{"start":"09:00","end":"19:00"}', 'Friday pickup hours', '2026-01-17 21:28:27'),
('pickup_hours_saturday', '{"start":"09:00","end":"12:00"}', 'Saturday pickup hours', '2026-01-17 21:28:27'),
('default_slot_capacity', '2', 'Default number of pickups per time slot', '2026-01-17 21:28:27'),
('slot_interval_minutes', '30', 'Duration of each time slot in minutes', '2026-01-17 21:28:27');

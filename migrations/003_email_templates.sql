-- Migration: Add email template settings
-- Run with: npx wrangler d1 execute bakes-coral-db --remote --file=migrations/003_email_templates.sql

-- Email template settings (stored as HTML in value)
INSERT OR REPLACE INTO settings (key, value, description, updated_at) VALUES
-- Admin notification email
('admin_email', 'hello@bakesbycoral.com', 'Admin email address for notifications', datetime('now')),

-- Pickup reminder settings
('reminder_days_before', '1', 'Days before pickup to send reminder email', datetime('now')),
('reminder_enabled', 'true', 'Enable pickup reminder emails', datetime('now')),

-- Email subject lines
('email_subject_form_submission', 'Thanks for your order request - {{order_number}}', 'Subject for form submission email', datetime('now')),
('email_subject_confirmation', 'Order Confirmed - {{order_number}}', 'Subject for order confirmation email', datetime('now')),
('email_subject_reminder', 'Pickup Reminder - {{order_number}}', 'Subject for pickup reminder email', datetime('now')),

-- Email body templates (use {{variable}} for placeholders)
-- Available variables: customer_name, order_number, order_type, pickup_date, pickup_time, total_amount, order_details
('email_template_form_submission', 'Hi {{customer_name}},

Thank you for submitting your order request! We''ve received your {{order_type}} order and are reviewing it now.

**Order Number:** {{order_number}}
**Requested Pickup:** {{pickup_date}} at {{pickup_time}}

{{order_details}}

**What''s Next?**
Please complete your payment to confirm your order. You should have been redirected to our secure payment page. If you didn''t complete payment, you can contact us to finish your order.

Questions? Just reply to this email!

Sweet regards,
Coral', 'Template for form submission email (before payment)', datetime('now')),

('email_template_confirmation', 'Hi {{customer_name}},

Great news - your order is confirmed! Payment has been received and I''m excited to start working on your order.

**Order Number:** {{order_number}}
**Pickup:** {{pickup_date}} at {{pickup_time}}

{{order_details}}

**Pickup Location:**
I''ll send you the exact address closer to your pickup date. Pickups are from my home in Cincinnati.

**Reminder:**
You''ll receive a reminder email the day before your pickup.

Can''t wait to see you!

Sweet regards,
Coral', 'Template for order confirmation email (after payment)', datetime('now')),

('email_template_reminder', 'Hi {{customer_name}},

Just a friendly reminder that your order is ready for pickup tomorrow!

**Order Number:** {{order_number}}
**Pickup:** {{pickup_date}} at {{pickup_time}}

{{order_details}}

**Pickup Address:**
[Address will be provided separately]

Please reply to this email or text me if you need to reschedule.

See you soon!

Sweet regards,
Coral', 'Template for pickup reminder email', datetime('now'));

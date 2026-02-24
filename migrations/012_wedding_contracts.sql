-- Wedding Contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  contract_number TEXT NOT NULL UNIQUE,
  tenant_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'signed', 'expired')),

  -- Event details
  event_date TEXT,
  venue_name TEXT,
  venue_address TEXT,
  guest_count TEXT,
  ceremony_time TEXT,
  reception_time TEXT,

  -- Services
  services_description TEXT,

  -- Pricing
  total_amount INTEGER NOT NULL DEFAULT 0,
  deposit_percentage INTEGER DEFAULT 50,
  deposit_amount INTEGER,
  payment_schedule TEXT,

  -- Contract terms
  contract_body TEXT,

  -- Admin
  notes TEXT,

  -- Signing
  signing_token TEXT UNIQUE,
  valid_until TEXT,
  signed_at TEXT,
  signer_name TEXT,
  signer_ip TEXT,

  -- Timestamps
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contracts_order ON contracts(order_id);
CREATE INDEX IF NOT EXISTS idx_contracts_token ON contracts(signing_token);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_tenant ON contracts(tenant_id);

-- Default contract template body
INSERT OR IGNORE INTO settings (key, value, description) VALUES
  ('contract_validity_days', '30', 'Days until contract expires'),
  ('default_contract_body', 'WEDDING SERVICES AGREEMENT

This agreement is entered into between Bakes by Coral ("Provider") and the client named below ("Client") for wedding dessert services.

1. EVENT DETAILS
Event Date: {{event_date}}
Venue: {{venue_name}}
Venue Address: {{venue_address}}
Guest Count: {{guest_count}}
Ceremony Time: {{ceremony_time}}
Reception Time: {{reception_time}}

2. SERVICES PROVIDED
{{services_description}}

3. PRICING & PAYMENT
Total Amount: {{total_amount}}
Deposit ({{deposit_percentage}}%): {{deposit_amount}}

Payment Schedule:
{{payment_schedule}}

4. TERMS & CONDITIONS

a) DEPOSIT: A non-refundable deposit of {{deposit_percentage}}% is required to secure your date. Your date is not reserved until the deposit is received and this contract is signed.

b) FINAL PAYMENT: The remaining balance is due 2 weeks prior to the event date. Late payments may result in cancellation of services.

c) CHANGES: Any changes to the order must be communicated at least 4 weeks before the event. Changes within 4 weeks may incur additional charges or may not be possible.

d) CANCELLATION: If the event is cancelled more than 60 days before the event date, the deposit may be applied to a future event within 12 months. Cancellations within 60 days forfeit the full deposit. Cancellations within 2 weeks forfeit the full contract amount.

e) ALLERGIES: All products are made in a facility that is 100% gluten-free. However, products may contain or come into contact with nuts, dairy, eggs, and soy. Client is responsible for communicating any guest allergies.

f) DELIVERY & SETUP: If delivery and setup are included, Provider will arrive at the agreed-upon time. Client is responsible for ensuring venue access and a suitable display area. Provider is not responsible for damage to products after delivery and setup are complete.

g) TASTING: A complimentary tasting session may be scheduled prior to finalizing flavors and design.

h) PHOTOS: Provider reserves the right to photograph finished products for portfolio use unless otherwise agreed in writing.

i) FORCE MAJEURE: Neither party shall be liable for failure to perform due to circumstances beyond their control, including but not limited to natural disasters, pandemics, or government restrictions.

By signing below, both parties agree to the terms outlined in this contract.', 'Default wedding contract template body');

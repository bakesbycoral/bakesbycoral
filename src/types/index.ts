// Order types (match database values)
export type OrderType = 'cookies' | 'cookies_large' | 'cake' | 'wedding' | 'tasting' | 'cookie_cups' | 'easter_collection';

export type OrderStatus =
  | 'inquiry'
  | 'pending_payment'
  | 'deposit_paid'
  | 'confirmed'
  | 'completed'
  | 'cancelled';

// Quote types
export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'expired' | 'converted';

export interface Quote {
  id: string;
  order_id: string;
  quote_number: string;
  status: QuoteStatus;
  subtotal: number;
  deposit_percentage: number;
  deposit_amount: number | null;
  total_amount: number;
  notes: string | null;
  customer_message: string | null;
  valid_until: string | null;
  approval_token: string | null;
  approved_at: string | null;
  stripe_invoice_id: string | null;
  stripe_invoice_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuoteLineItem {
  id: number;
  quote_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  sort_order: number;
  created_at?: string;
}

export interface QuoteWithLineItems extends Quote {
  line_items: QuoteLineItem[];
}

// Contract types
export type ContractStatus = 'draft' | 'sent' | 'signed' | 'expired';

export interface Contract {
  id: string;
  order_id: string;
  contract_number: string;
  tenant_id: string;
  status: ContractStatus;
  event_date: string | null;
  venue_name: string | null;
  venue_address: string | null;
  guest_count: string | null;
  ceremony_time: string | null;
  reception_time: string | null;
  services_description: string | null;
  total_amount: number;
  deposit_percentage: number;
  deposit_amount: number | null;
  payment_schedule: string | null;
  contract_body: string | null;
  notes: string | null;
  signing_token: string | null;
  valid_until: string | null;
  signed_at: string | null;
  signer_name: string | null;
  signer_ip: string | null;
  created_at: string;
  updated_at: string;
}

// Tasting order data
export interface TastingOrderData {
  name: string;
  email: string;
  phone: string;
  wedding_date: string;
  tasting_type: 'cake' | 'cookie' | 'both';
  cake_flavors?: string[];
  fillings?: string[];
  cookie_flavors?: string[];
  pickup_or_delivery: 'pickup' | 'delivery';
  delivery_location?: string;
  pickup_date: string;
  pickup_time: string;
}

// Database models
export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: 'admin';
  last_login_at?: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  order_type: OrderType;
  status: OrderStatus;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  event_date: string | null;
  pickup_date: string | null;
  pickup_time: string | null;
  backup_date: string | null;
  backup_time: string | null;
  pickup_person_name: string | null;
  total_amount: number | null;
  deposit_amount: number | null;
  notes: string | null;
  form_data: string | null;
  stripe_session_id: string | null;
  stripe_payment_id: string | null;
  stripe_invoice_id: string | null;
  stripe_invoice_url: string | null;
  paid_at: string | null;
  deposit_paid_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlackoutDate {
  id: string;
  date: string;
  reason: string | null;
}

export interface Setting {
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
}

// Extended types with relations
// Form data types
export interface SmallCookieOrderData {
  name: string;
  email: string;
  phone: string;
  flavors: string[];
  quantity: number;
  notes?: string;
  pickup_date: string;
  pickup_time: string;
  backup_date?: string;
  backup_time?: string;
  pickup_person_name?: string;
  acknowledge_pickup: boolean;
  acknowledge_allergy: boolean;
  acknowledge_payment: boolean;
}

export interface LargeCookieOrderData {
  name: string;
  email: string;
  phone: string;
  quantity: number;
  flavor_mix: string;
  individual_wrap: boolean;
  event_date?: string;
  event_type?: string;
  location_notes?: string;
  pickup_person_name?: string;
  setup_needs?: string;
  handling_notes?: string;
  pickup_date: string;
  pickup_time: string;
  acknowledge_availability: boolean;
  acknowledge_deposit: boolean;
  acknowledge_allergy: boolean;
}

export interface CakeInquiryData {
  name: string;
  email: string;
  phone: string;
  occasion: string;
  event_date: string;
  pickup_date: string;
  pickup_time: string;
  backup_date?: string;
  backup_time?: string;
  size: string;
  shape: string;
  servings?: number;
  flavor: string;
  filling: string;
  buttercream: string;
  design_style: string;
  inspiration_links: string[];
  color_palette?: string;
  design_notes?: string;
  dietary_notes?: string;
  budget_range: string;
  pickup_person_name?: string;
  acknowledge_deposit: boolean;
  acknowledge_payment: boolean;
  acknowledge_refund: boolean;
  acknowledge_allergy: boolean;
}

export interface WeddingInquiryData {
  name: string;
  email: string;
  phone: string;
  partner_name?: string;
  wedding_date: string;
  venue_name?: string;
  venue_address?: string;
  ceremony_time?: string;
  reception_time?: string;
  guest_count: string;
  services_needed: string;
  cake_tiers?: string;
  cake_flavor?: string;
  cake_design_notes?: string;
  cake_inspiration_1?: string;
  cake_inspiration_2?: string;
  dessert_preferences?: string;
  dessert_count?: string;
  favor_count?: string;
  favor_packaging?: string;
  favor_flavors?: string;
  color_palette?: string;
  theme?: string;
  additional_notes?: string;
  dietary_restrictions?: string;
  budget_range?: string;
  how_found_us?: string;
  pickup_or_delivery: 'pickup' | 'delivery';
  delivery_address?: string;
  setup_needed?: boolean;
  acknowledge_lead_time: boolean;
  acknowledge_deposit: boolean;
  acknowledge_allergy: boolean;
}

// API response types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
}

export interface SlotAvailability {
  time: string;
  available: boolean;
  remaining: number;
}

// Cloudflare bindings
export interface Env {
  DB: D1Database;
  UPLOADS: R2Bucket;
  bakesbycoral_stripe_secret_key: string;
  bakesbycoral_stripe_webhook_secret: string;
  bakesbycoral_resend_api_key: string;
  bakesbycoral_session_secret: string;
  NEXT_PUBLIC_SITE_URL?: string;
}

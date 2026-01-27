


import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { validateOrder, isSpamSubmission, sanitizeInput } from '@/lib/validation';
import { validateRequestedDate } from '@/lib/scheduling';

interface WeddingOrderData {
  // Contact Info
  name: string;
  email: string;
  phone: string;
  partner_name: string;

  // Event Details
  wedding_date: string;
  venue_name: string;
  venue_address: string;
  ceremony_time: string;
  reception_time: string;
  guest_count: string;

  // Services
  services_needed: string;

  // Cake Details
  cake_tiers: string;
  cake_flavor: string;
  cake_design_notes: string;
  cake_inspiration_1: string;
  cake_inspiration_2: string;

  // Dessert Table
  dessert_preferences: string;
  dessert_count: string;

  // Cookie Favors
  favor_count: string;
  favor_packaging: string;
  favor_flavors: string;

  // Additional
  color_palette: string;
  theme: string;
  additional_notes: string;
  dietary_restrictions: string;
  budget_range: string;
  how_found_us: string;

  // Pickup/Delivery
  pickup_or_delivery: string;
  delivery_address: string;
  setup_needed: boolean;

  // Acknowledgements
  acknowledge_lead_time: boolean;
  acknowledge_deposit: boolean;
  acknowledge_allergy: boolean;

  // Honeypot fields
  website?: string;
  company?: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: WeddingOrderData = await request.json();

    // Spam check
    if (isSpamSubmission(data.website, data.company)) {
      return NextResponse.json({ error: 'Invalid submission' }, { status: 400 });
    }

    // Validate required fields
    const validation = validateOrder({
      name: data.name,
      email: data.email,
      phone: data.phone,
    });

    if (!validation.isValid) {
      return NextResponse.json({ error: validation.errors[0] }, { status: 400 });
    }

    // Additional validations
    if (!data.wedding_date) {
      return NextResponse.json({ error: 'Wedding date is required' }, { status: 400 });
    }
    if (!data.guest_count) {
      return NextResponse.json({ error: 'Guest count is required' }, { status: 400 });
    }
    if (!data.services_needed) {
      return NextResponse.json({ error: 'Please select which services you need' }, { status: 400 });
    }

    const dateError = await validateRequestedDate(data.wedding_date, 'wedding');
    if (dateError) {
      return NextResponse.json({ error: dateError }, { status: 400 });
    }

    const db = getDB();
    

    // Create inquiry in database
    const orderId = crypto.randomUUID();
    const orderNumber = `WED-${Date.now().toString(36).toUpperCase()}`;

    await db.prepare(`
      INSERT INTO orders (
        id, order_number, order_type, status, customer_name, customer_email, customer_phone,
        event_date, notes, form_data, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      orderId,
      orderNumber,
      'wedding',
      'inquiry',
      sanitizeInput(data.name),
      sanitizeInput(data.email),
      sanitizeInput(data.phone),
      data.wedding_date,
      sanitizeInput(data.additional_notes || ''),
      JSON.stringify({
        partner_name: sanitizeInput(data.partner_name || ''),
        venue_name: sanitizeInput(data.venue_name || ''),
        venue_address: sanitizeInput(data.venue_address || ''),
        ceremony_time: data.ceremony_time,
        reception_time: data.reception_time,
        guest_count: data.guest_count,
        services_needed: data.services_needed,

        // Cake details
        cake: {
          tiers: data.cake_tiers,
          flavor: data.cake_flavor,
          design_notes: sanitizeInput(data.cake_design_notes || ''),
          inspiration_links: [
            data.cake_inspiration_1,
            data.cake_inspiration_2,
          ].filter(Boolean),
        },

        // Dessert table
        dessert_table: {
          preferences: sanitizeInput(data.dessert_preferences || ''),
          count: data.dessert_count,
        },

        // Cookie favors
        cookie_favors: {
          count: data.favor_count,
          packaging: sanitizeInput(data.favor_packaging || ''),
          flavors: sanitizeInput(data.favor_flavors || ''),
        },

        // Style
        color_palette: sanitizeInput(data.color_palette || ''),
        theme: sanitizeInput(data.theme || ''),
        dietary_restrictions: sanitizeInput(data.dietary_restrictions || ''),
        budget_range: data.budget_range,
        how_found_us: sanitizeInput(data.how_found_us || ''),

        // Logistics
        pickup_or_delivery: data.pickup_or_delivery,
        delivery_address: sanitizeInput(data.delivery_address || ''),
        setup_needed: data.setup_needed,
      })
    ).run();

    // TODO: Send confirmation email via Resend

    return NextResponse.json({
      success: true,
      orderNumber,
      message: 'Inquiry submitted successfully'
    });
  } catch (error) {
    console.error('Wedding order error:', error);
    return NextResponse.json(
      { error: 'Failed to submit inquiry. Please try again.' },
      { status: 500 }
    );
  }
}

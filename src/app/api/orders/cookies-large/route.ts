


import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { validateOrder, isSpamSubmission, sanitizeInput } from '@/lib/validation';
import { validateRequestedDate } from '@/lib/scheduling';

interface LargeCookieOrderData {
  name: string;
  email: string;
  phone: string;
  quantity: string;
  flavor_mix: string;
  individual_wrap: boolean;
  event_date: string;
  event_type: string;
  location_notes: string;
  pickup_person_name: string;
  setup_needs: string;
  handling_notes: string;
  pickup_date: string;
  pickup_time: string;
  acknowledge_availability: boolean;
  acknowledge_deposit: boolean;
  acknowledge_allergy: boolean;
  // Honeypot fields
  website?: string;
  company?: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: LargeCookieOrderData = await request.json();

    // Spam check
    if (isSpamSubmission(data.website, data.company)) {
      return NextResponse.json({ error: 'Invalid submission' }, { status: 400 });
    }

    // Validate required fields
    const validation = validateOrder({
      name: data.name,
      email: data.email,
      phone: data.phone,
      pickup_date: data.pickup_date,
    });

    if (!validation.isValid) {
      return NextResponse.json({ error: validation.errors[0] }, { status: 400 });
    }

    const quantity = parseInt(data.quantity);
    if (!quantity || quantity < 4) {
      return NextResponse.json({ error: 'Minimum 4 dozen required for large orders' }, { status: 400 });
    }

    if (!data.flavor_mix?.trim()) {
      return NextResponse.json({ error: 'Please describe your flavor preferences' }, { status: 400 });
    }

    const dateError = await validateRequestedDate(data.pickup_date, 'cookies_large');
    if (dateError) {
      return NextResponse.json({ error: dateError }, { status: 400 });
    }

    const db = getDB();
    

    // Create inquiry in database
    const orderId = crypto.randomUUID();
    const orderNumber = `CKL-${Date.now().toString(36).toUpperCase()}`;

    await db.prepare(`
      INSERT INTO orders (
        id, order_number, order_type, status, customer_name, customer_email, customer_phone,
        event_date, pickup_date, pickup_time, pickup_person_name,
        notes, form_data, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      orderId,
      orderNumber,
      'cookies_large',
      'inquiry',
      sanitizeInput(data.name),
      sanitizeInput(data.email),
      sanitizeInput(data.phone),
      data.event_date,
      data.pickup_date,
      data.pickup_time || null,
      sanitizeInput(data.pickup_person_name || ''),
      sanitizeInput(data.setup_needs || ''),
      JSON.stringify({
        quantity: data.quantity,
        flavor_mix: sanitizeInput(data.flavor_mix),
        individual_wrap: data.individual_wrap,
        event_type: data.event_type,
        location_notes: sanitizeInput(data.location_notes || ''),
        handling_notes: sanitizeInput(data.handling_notes || ''),
      })
    ).run();

    // TODO: Send confirmation email via Resend

    return NextResponse.json({
      success: true,
      orderNumber,
      message: 'Inquiry submitted successfully'
    });
  } catch (error) {
    console.error('Large cookie order error:', error);
    return NextResponse.json(
      { error: 'Failed to submit inquiry. Please try again.' },
      { status: 500 }
    );
  }
}

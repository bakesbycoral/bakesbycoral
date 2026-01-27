


import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { validateOrder, isSpamSubmission, sanitizeInput } from '@/lib/validation';
import { validateRequestedDate } from '@/lib/scheduling';

interface CakeOrderData {
  name: string;
  email: string;
  phone: string;
  occasion: string;
  event_date: string;
  pickup_date: string;
  pickup_time: string;
  backup_date: string;
  backup_time: string;
  size: string;
  shape: string;
  servings: string;
  flavor: string;
  filling: string;
  buttercream: string;
  design_style: string;
  inspiration_link_1: string;
  inspiration_link_2: string;
  inspiration_link_3: string;
  color_palette: string;
  design_notes: string;
  dietary_notes: string;
  budget_range: string;
  pickup_person_name: string;
  acknowledge_deposit: boolean;
  acknowledge_payment: boolean;
  acknowledge_refund: boolean;
  acknowledge_allergy: boolean;
  // Honeypot fields
  website?: string;
  company?: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: CakeOrderData = await request.json();

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

    // Additional validations
    if (!data.occasion) {
      return NextResponse.json({ error: 'Please select an occasion' }, { status: 400 });
    }
    if (!data.event_date) {
      return NextResponse.json({ error: 'Event date is required' }, { status: 400 });
    }
    if (!data.size) {
      return NextResponse.json({ error: 'Please select a cake size' }, { status: 400 });
    }
    if (!data.flavor) {
      return NextResponse.json({ error: 'Please select a flavor' }, { status: 400 });
    }
    if (!data.filling) {
      return NextResponse.json({ error: 'Please select a filling' }, { status: 400 });
    }
    if (!data.buttercream) {
      return NextResponse.json({ error: 'Please select a buttercream' }, { status: 400 });
    }
    if (!data.design_style) {
      return NextResponse.json({ error: 'Please select a design style' }, { status: 400 });
    }

    const dateError = await validateRequestedDate(data.pickup_date, 'cake');
    if (dateError) {
      return NextResponse.json({ error: dateError }, { status: 400 });
    }

    const db = getDB();
    

    // Create inquiry in database
    const orderId = crypto.randomUUID();
    const orderNumber = `CAKE-${Date.now().toString(36).toUpperCase()}`;

    await db.prepare(`
      INSERT INTO orders (
        id, order_number, order_type, status, customer_name, customer_email, customer_phone,
        event_date, pickup_date, pickup_time, backup_date, backup_time, pickup_person_name,
        notes, form_data, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      orderId,
      orderNumber,
      'cake',
      'inquiry',
      sanitizeInput(data.name),
      sanitizeInput(data.email),
      sanitizeInput(data.phone),
      data.event_date,
      data.pickup_date,
      data.pickup_time || null,
      data.backup_date || null,
      data.backup_time || null,
      sanitizeInput(data.pickup_person_name || ''),
      sanitizeInput(data.dietary_notes || ''),
      JSON.stringify({
        occasion: data.occasion,
        size: data.size,
        shape: data.shape || 'round',
        servings: data.servings,
        flavor: data.flavor,
        filling: data.filling,
        buttercream: data.buttercream,
        design_style: data.design_style,
        inspiration_links: [
          data.inspiration_link_1,
          data.inspiration_link_2,
          data.inspiration_link_3,
        ].filter(Boolean),
        color_palette: sanitizeInput(data.color_palette || ''),
        design_notes: sanitizeInput(data.design_notes || ''),
        budget_range: data.budget_range,
      })
    ).run();

    // TODO: Send confirmation email via Resend

    return NextResponse.json({
      success: true,
      orderNumber,
      message: 'Inquiry submitted successfully'
    });
  } catch (error) {
    console.error('Cake order error:', error);
    return NextResponse.json(
      { error: 'Failed to submit inquiry. Please try again.' },
      { status: 500 }
    );
  }
}

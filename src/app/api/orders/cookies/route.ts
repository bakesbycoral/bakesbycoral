


import { NextRequest, NextResponse } from 'next/server';
import { getDB, getEnvVar } from '@/lib/db';
import Stripe from 'stripe';
import { validateOrder, isSpamSubmission, sanitizeInput } from '@/lib/validation';
import { validateRequestedDate } from '@/lib/scheduling';

interface CookieOrderData {
  name: string;
  email: string;
  phone: string;
  flavors: string[];
  quantity: string;
  notes: string;
  pickup_date: string;
  pickup_time: string;
  backup_date: string;
  backup_time: string;
  pickup_person_name: string;
  different_pickup_person: boolean;
  acknowledge_pickup: boolean;
  acknowledge_allergy: boolean;
  acknowledge_payment: boolean;
  // Honeypot fields
  website?: string;
  company?: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: CookieOrderData = await request.json();

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
      pickup_time: data.pickup_time,
    });

    if (!validation.isValid) {
      return NextResponse.json({ error: validation.errors[0] }, { status: 400 });
    }

    if (!data.flavors || data.flavors.length === 0) {
      return NextResponse.json({ error: 'Please select at least one flavor' }, { status: 400 });
    }

    if (!data.quantity || parseInt(data.quantity) < 1 || parseInt(data.quantity) > 3) {
      return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
    }

    if (!data.pickup_time) {
      return NextResponse.json({ error: 'Pickup time is required' }, { status: 400 });
    }

    const dateError = await validateRequestedDate(data.pickup_date, 'cookies');
    if (dateError) {
      return NextResponse.json({ error: dateError }, { status: 400 });
    }

    const db = getDB();
    

    // Get pricing from settings
    const priceSetting = await db.prepare('SELECT value FROM settings WHERE key = ?').bind('cookie_price_per_dozen').first<{ value: string }>();
    const pricePerDozen = priceSetting ? parseInt(priceSetting.value) : 4000;
    const quantity = parseInt(data.quantity);
    const totalAmount = pricePerDozen * quantity;

    // Create order in database
    const orderId = crypto.randomUUID();
    const orderNumber = `CK-${Date.now().toString(36).toUpperCase()}`;

    await db.prepare(`
      INSERT INTO orders (
        id, order_number, order_type, status, customer_name, customer_email, customer_phone,
        pickup_date, pickup_time, backup_date, backup_time, pickup_person_name,
        total_amount, deposit_amount, notes, form_data, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      orderId,
      orderNumber,
      'cookies',
      'pending_payment',
      sanitizeInput(data.name),
      sanitizeInput(data.email),
      sanitizeInput(data.phone),
      data.pickup_date,
      data.pickup_time,
      data.backup_date || null,
      data.backup_time || null,
      data.different_pickup_person ? sanitizeInput(data.pickup_person_name) : null,
      totalAmount,
      totalAmount, // Full payment for small orders
      sanitizeInput(data.notes || ''),
      JSON.stringify({
        flavors: data.flavors,
        quantity: data.quantity,
      })
    ).run();

    // Create Stripe checkout session
    const stripe = new Stripe(getEnvVar('bakesbycoral_stripe_secret_key'), {
      apiVersion: '2025-12-15.clover',
    });

    const flavorLabels: Record<string, string> = {
      chocolate_chip: 'Chocolate Chip',
      snickerdoodle: 'Snickerdoodle',
      peanut_butter: 'Peanut Butter',
      double_chocolate: 'Double Chocolate',
      lemon_sugar: 'Lemon Sugar',
      oatmeal_raisin: 'Oatmeal Raisin',
    };

    const flavorDescription = data.flavors.map(f => flavorLabels[f] || f).join(', ');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Gluten-Free Cookies (${quantity} dozen)`,
              description: `Flavors: ${flavorDescription}`,
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.nextUrl.origin}/order/success?order=${orderNumber}`,
      cancel_url: `${request.nextUrl.origin}/order/cookies?cancelled=true`,
      customer_email: data.email,
      metadata: {
        order_id: orderId,
        order_number: orderNumber,
        order_type: 'cookies',
      },
    });

    // Update order with Stripe session ID
    await db.prepare('UPDATE orders SET stripe_session_id = ? WHERE id = ?')
      .bind(session.id, orderId)
      .run();

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error('Cookie order error:', error);
    return NextResponse.json(
      { error: 'Failed to process order. Please try again.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getDB, getEnvVar } from '@/lib/db';
import Stripe from 'stripe';
import { sanitizeInput } from '@/lib/validation';

interface TastingOrderData {
  name: string;
  email: string;
  phone: string;
  wedding_date: string;
  tasting_type: string;
  cake_flavors?: string[];
  fillings?: string[];
  cookie_flavors?: string[];
  pickup_or_delivery: string;
  delivery_location?: string;
  pickup_date: string;
  pickup_time: string;
  coupon_code?: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const data: TastingOrderData = await request.json();

    // Basic validation
    if (!data.name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!data.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    if (!data.phone?.trim()) {
      return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
    }
    if (!data.tasting_type || !['cake', 'cookie', 'both'].includes(data.tasting_type)) {
      return NextResponse.json({ error: 'Please select a tasting type' }, { status: 400 });
    }
    if (!data.wedding_date) {
      return NextResponse.json({ error: 'Wedding date is required' }, { status: 400 });
    }
    if (!data.pickup_date) {
      return NextResponse.json({ error: 'Pickup date is required' }, { status: 400 });
    }

    // Pricing
    const prices: Record<string, number> = {
      cake: 7000,
      cookie: 3000,
      both: 10000,
    };
    const totalAmount = prices[data.tasting_type] || 7000;

    // Create order
    const db = getDB();
    const orderId = crypto.randomUUID();
    const orderNumber = `TST-${Date.now().toString(36).toUpperCase()}`;

    const formDataJson = JSON.stringify({
      wedding_date: data.wedding_date,
      tasting_type: data.tasting_type,
      cake_flavors: data.cake_flavors || [],
      fillings: data.fillings || [],
      cookie_flavors: data.cookie_flavors || [],
      pickup_or_delivery: data.pickup_or_delivery,
      delivery_location: data.delivery_location || null,
      coupon_code: data.coupon_code || null,
    });

    await db.prepare(`
      INSERT INTO orders (
        id, order_number, order_type, status, customer_name, customer_email, customer_phone,
        event_date, pickup_date, pickup_time, total_amount, deposit_amount, form_data, created_at
      ) VALUES (?, ?, 'tasting', 'pending_payment', ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      orderId,
      orderNumber,
      sanitizeInput(data.name),
      sanitizeInput(data.email),
      sanitizeInput(data.phone),
      data.wedding_date,
      data.pickup_date,
      data.pickup_time || null,
      totalAmount,
      totalAmount,
      formDataJson
    ).run();

    // Send email
    const resendApiKey = getEnvVar('bakesbycoral_resend_api_key');
    if (resendApiKey) {
      try {
        const tastingTypeLabel = data.tasting_type === 'cake' ? 'Cake Tasting' :
                                 data.tasting_type === 'cookie' ? 'Cookie Tasting' : 'Cake & Cookie Tasting';

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Bakes by Coral <onboarding@resend.dev>',
            to: ['coral@bakesbycoral.com'],
            reply_to: data.email,
            subject: `New Tasting Order - ${orderNumber}`,
            html: `
              <h2>New Tasting Order</h2>
              <p><strong>Order Number:</strong> ${orderNumber}</p>
              <p><strong>Amount:</strong> $${(totalAmount / 100).toFixed(2)}</p>
              <hr>
              <p><strong>Customer:</strong> ${sanitizeInput(data.name)}</p>
              <p><strong>Email:</strong> ${sanitizeInput(data.email)}</p>
              <p><strong>Phone:</strong> ${sanitizeInput(data.phone)}</p>
              <hr>
              <p><strong>Type:</strong> ${tastingTypeLabel}</p>
              <p><strong>Wedding Date:</strong> ${data.wedding_date}</p>
              <p><strong>Pickup Date:</strong> ${data.pickup_date}</p>
              <p><strong>Pickup Time:</strong> ${data.pickup_time || 'TBD'}</p>
              <hr>
              <p><a href="https://bakesbycoral.com/admin/orders">View in Admin Dashboard</a></p>
            `,
          }),
        });
      } catch (emailErr) {
        console.error('Email error:', emailErr);
      }
    }

    // Create Stripe checkout
    const stripeKey = getEnvVar('bakesbycoral_stripe_secret_key');
    if (!stripeKey) {
      return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey, {
      httpClient: Stripe.createFetchHttpClient(),
    });

    const tastingNames: Record<string, string> = {
      cake: 'Cake Tasting Box',
      cookie: 'Cookie Tasting Box',
      both: 'Cake & Cookie Tasting Boxes',
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: tastingNames[data.tasting_type] || 'Tasting Box',
              description: `Wedding tasting for ${data.wedding_date}`,
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `https://bakes-by-coral.coral-44f.workers.dev/order/success?order=${orderNumber}`,
      cancel_url: `https://bakes-by-coral.coral-44f.workers.dev/tasting?cancelled=true`,
      customer_email: data.email,
      metadata: {
        order_id: orderId,
        order_number: orderNumber,
        order_type: 'tasting',
      },
    });

    // Update order with Stripe session ID
    await db.prepare('UPDATE orders SET stripe_session_id = ? WHERE id = ?')
      .bind(session.id, orderId)
      .run();

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error('Tasting order error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to process order: ${errorMessage}` },
      { status: 500 }
    );
  }
}

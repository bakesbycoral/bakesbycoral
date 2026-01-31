import { NextRequest, NextResponse } from 'next/server';
import { getDB, getEnvVar } from '@/lib/db';
import Stripe from 'stripe';
import { sanitizeInput } from '@/lib/validation';
import { sendEmail, buildTastingOrderNotification } from '@/lib/email';

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
        // Get email template from settings
        const tastingTemplate = await db.prepare('SELECT value FROM settings WHERE key = ?')
          .bind('email_template_tasting_order')
          .first<{ value: string }>();
        const tastingSubject = await db.prepare('SELECT value FROM settings WHERE key = ?')
          .bind('email_subject_tasting_order')
          .first<{ value: string }>();

        const emailContent = buildTastingOrderNotification(
          tastingTemplate?.value,
          tastingSubject?.value,
          {
            orderNumber,
            amount: totalAmount,
            customerName: sanitizeInput(data.name),
            customerEmail: sanitizeInput(data.email),
            customerPhone: sanitizeInput(data.phone),
            tastingType: data.tasting_type,
            weddingDate: data.wedding_date,
            pickupDate: data.pickup_date,
            pickupTime: data.pickup_time || '',
            adminUrl: 'https://bakesbycoral.com/admin/orders',
          }
        );

        await sendEmail(resendApiKey, {
          to: 'coral@bakesbycoral.com',
          subject: emailContent.subject,
          html: emailContent.html,
          replyTo: data.email,
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

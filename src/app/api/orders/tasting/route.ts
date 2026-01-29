import { NextRequest, NextResponse } from 'next/server';
import { getDB, getEnvVar } from '@/lib/db';
import Stripe from 'stripe';
import { validateOrder, isSpamSubmission, sanitizeInput } from '@/lib/validation';
import { sendEmail, orderConfirmationEmail, adminNewOrderEmail } from '@/lib/email';

interface TastingOrderData {
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
  // Honeypot fields
  website?: string;
  company?: string;
}

// Default prices in cents
const DEFAULT_PRICES = {
  cake: 7000,    // $70
  cookie: 3000,  // $30
  both: 10000,   // $100
};

export async function POST(request: NextRequest) {
  try {
    const data: TastingOrderData = await request.json();

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

    // Validate tasting type
    if (!['cake', 'cookie', 'both'].includes(data.tasting_type)) {
      return NextResponse.json({ error: 'Invalid tasting type' }, { status: 400 });
    }

    // Validate wedding date
    if (!data.wedding_date) {
      return NextResponse.json({ error: 'Wedding date is required' }, { status: 400 });
    }

    const db = getDB();

    // Get pricing from settings
    const cakePriceSetting = await db.prepare('SELECT value FROM settings WHERE key = ?')
      .bind('tasting_price_cake').first<{ value: string }>();
    const cookiePriceSetting = await db.prepare('SELECT value FROM settings WHERE key = ?')
      .bind('tasting_price_cookie').first<{ value: string }>();
    const bothPriceSetting = await db.prepare('SELECT value FROM settings WHERE key = ?')
      .bind('tasting_price_both').first<{ value: string }>();

    const prices = {
      cake: cakePriceSetting ? parseInt(cakePriceSetting.value) : DEFAULT_PRICES.cake,
      cookie: cookiePriceSetting ? parseInt(cookiePriceSetting.value) : DEFAULT_PRICES.cookie,
      both: bothPriceSetting ? parseInt(bothPriceSetting.value) : DEFAULT_PRICES.both,
    };

    const totalAmount = prices[data.tasting_type];

    // Create order in database
    const orderId = crypto.randomUUID();
    const orderNumber = `TST-${Date.now().toString(36).toUpperCase()}`;

    // Store form data
    const formData = {
      wedding_date: data.wedding_date,
      tasting_type: data.tasting_type,
      cake_flavors: data.cake_flavors || [],
      fillings: data.fillings || [],
      cookie_flavors: data.cookie_flavors || [],
      pickup_or_delivery: data.pickup_or_delivery,
      delivery_location: data.delivery_location || null,
    };

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
      data.pickup_time,
      totalAmount,
      totalAmount, // Full payment for tastings (no deposit)
      JSON.stringify(formData)
    ).run();

    // Send confirmation emails (non-blocking)
    const resendApiKey = getEnvVar('bakesbycoral_resend_api_key');
    if (resendApiKey) {
      const adminEmailSetting = await db.prepare('SELECT value FROM settings WHERE key = ?')
        .bind('admin_email').first<{ value: string }>();
      const adminEmail = adminEmailSetting?.value || 'hello@bakesbycoral.com';

      // Email to customer
      sendEmail(resendApiKey, {
        to: data.email,
        subject: `Tasting Order Received - ${orderNumber}`,
        html: orderConfirmationEmail({
          customerName: data.name,
          orderNumber: orderNumber,
          orderType: 'tasting',
          pickupDate: data.pickup_date,
          pickupTime: data.pickup_time,
        }),
        replyTo: adminEmail,
      }).catch(err => console.error('Failed to send customer email:', err));

      // Email to admin
      sendEmail(resendApiKey, {
        to: adminEmail,
        subject: `New Tasting Order - ${orderNumber}`,
        html: adminNewOrderEmail({
          customerName: data.name,
          customerEmail: data.email,
          customerPhone: data.phone,
          orderNumber: orderNumber,
          orderType: 'tasting',
          pickupDate: data.pickup_date,
          formData: formData,
        }),
      }).catch(err => console.error('Failed to send admin email:', err));
    }

    // Create Stripe checkout session
    const stripe = new Stripe(getEnvVar('bakesbycoral_stripe_secret_key'), {
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Build product name based on tasting type
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
              name: tastingNames[data.tasting_type],
              description: `Wedding tasting for ${data.wedding_date}`,
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.nextUrl.origin}/order/success?order=${orderNumber}`,
      cancel_url: `${request.nextUrl.origin}/tasting?cancelled=true`,
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
    return NextResponse.json(
      { error: 'Failed to process order. Please try again.' },
      { status: 500 }
    );
  }
}

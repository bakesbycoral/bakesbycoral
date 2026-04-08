import { NextRequest, NextResponse } from 'next/server';
import { getDB, getEnvVar, upsertClientFromOrder } from '@/lib/db';
import Stripe from 'stripe';
import { sanitizeInput } from '@/lib/validation';
import { sendEmail, buildTastingOrderNotification, orderConfirmationEmail } from '@/lib/email';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';

interface CakeItem {
  name: string;
  cake: string;
  filling: string;
}

interface TastingOrderData {
  name: string;
  email: string;
  phone: string;
  wedding_date?: string;
  tasting_type: 'cake' | 'cookie' | 'bundle';
  // Cake box
  box_name?: string;
  box_count?: number;
  cakes?: CakeItem[];
  add_on_cakes?: CakeItem[];
  // Cookie box
  cookie_box_name?: string;
  cookie_flavors?: string[];
  // Logistics
  pickup_or_delivery: string;
  delivery_location?: string;
  pickup_date: string;
  pickup_time: string;
  coupon_code?: string | null;
}

const CAKE_PRICES: Record<number, number> = { 6: 7500, 4: 5500 };
const COOKIE_PRICE = 3500;
const BUNDLE_PRICES: Record<number, number> = { 6: 10000, 4: 8500 };
const ADD_ON_PRICE = 1500;

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = rateLimit(request, 'order-form', RATE_LIMITS.publicForm);
    if (rateLimitResponse) return rateLimitResponse;

    const data: TastingOrderData = await request.json();

    // Basic validation
    if (!data.name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    if (!data.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    if (!data.phone?.trim()) return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
    if (!data.pickup_date) return NextResponse.json({ error: 'Pickup date is required' }, { status: 400 });
    if (!['cake', 'cookie', 'bundle'].includes(data.tasting_type))
      return NextResponse.json({ error: 'Please select a tasting type' }, { status: 400 });

    // Validate cake data
    if (data.tasting_type === 'cake' || data.tasting_type === 'bundle') {
      if (!data.box_count || ![4, 6].includes(data.box_count))
        return NextResponse.json({ error: 'Please select a 4 or 6 count box' }, { status: 400 });
      if (!data.cakes || data.cakes.length !== data.box_count)
        return NextResponse.json({ error: `Please select exactly ${data.box_count} cakes` }, { status: 400 });
    }

    // Validate cookie data
    if (data.tasting_type === 'cookie' || data.tasting_type === 'bundle') {
      if (!data.cookie_flavors || data.cookie_flavors.length !== 6)
        return NextResponse.json({ error: 'Please select 6 cookie flavors' }, { status: 400 });
    }

    // Calculate pricing
    const addOnCount = data.add_on_cakes?.length || 0;
    const addOnTotal = addOnCount * ADD_ON_PRICE;
    let baseAmount = 0;

    if (data.tasting_type === 'cake') {
      baseAmount = CAKE_PRICES[data.box_count!] || 7500;
    } else if (data.tasting_type === 'cookie') {
      baseAmount = COOKIE_PRICE;
    } else if (data.tasting_type === 'bundle') {
      baseAmount = BUNDLE_PRICES[data.box_count!] || 10000;
    }

    const totalAmount = baseAmount + addOnTotal;

    // Create order
    const db = getDB();
    const orderId = crypto.randomUUID();
    const orderNumber = `TST-${Date.now().toString(36).toUpperCase()}`;

    const formDataJson = JSON.stringify({
      wedding_date: data.wedding_date || null,
      tasting_type: data.tasting_type,
      box_name: data.box_name || null,
      cookie_box_name: data.cookie_box_name || null,
      box_count: data.box_count || null,
      cakes: data.cakes || [],
      cookie_flavors: data.cookie_flavors || [],
      add_on_cakes: data.add_on_cakes || [],
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
      orderId, orderNumber,
      sanitizeInput(data.name), sanitizeInput(data.email), sanitizeInput(data.phone),
      data.wedding_date || null, data.pickup_date, data.pickup_time || null,
      totalAmount, totalAmount, formDataJson
    ).run();

    await upsertClientFromOrder(sanitizeInput(data.name), sanitizeInput(data.email), sanitizeInput(data.phone));

    // Send email notification
    const resendApiKey = getEnvVar('bakesbycoral_resend_api_key');
    if (resendApiKey) {
      try {
        const tastingTemplate = await db.prepare('SELECT value FROM settings WHERE key = ?')
          .bind('email_template_tasting_order').first<{ value: string }>();
        const tastingSubject = await db.prepare('SELECT value FROM settings WHERE key = ?')
          .bind('email_subject_tasting_order').first<{ value: string }>();

        const emailContent = buildTastingOrderNotification(
          tastingTemplate?.value, tastingSubject?.value,
          {
            orderNumber, amount: totalAmount,
            customerName: sanitizeInput(data.name), customerEmail: sanitizeInput(data.email),
            customerPhone: sanitizeInput(data.phone), tastingType: data.tasting_type,
            weddingDate: data.wedding_date || '', pickupDate: data.pickup_date,
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

        // Customer confirmation
        sendEmail(resendApiKey, {
          to: data.email,
          subject: `Tasting Box Order Received - ${orderNumber}`,
          html: orderConfirmationEmail({
            customerName: data.name,
            orderNumber,
            orderType: 'tasting',
            pickupDate: data.pickup_date,
            pickupTime: data.pickup_time,
            totalAmount: totalAmount,
            formData: JSON.parse(formDataJson),
          }),
          replyTo: 'coral@bakesbycoral.com',
        }).catch(err => console.error('Failed to send customer email:', err));
      } catch (emailErr) {
        console.error('Email error:', emailErr);
      }
    }

    // Create Stripe checkout
    const stripeKey = getEnvVar('bakesbycoral_stripe_secret_key');
    if (!stripeKey) return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 });

    const stripe = new Stripe(stripeKey, { httpClient: Stripe.createFetchHttpClient() });

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    if (data.tasting_type === 'cake') {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${data.box_name || 'Cake'} Tasting Box`,
            description: `${data.box_count} mini cakes with filling pairings & mock swiss buttercream`,
          },
          unit_amount: CAKE_PRICES[data.box_count!] || 7500,
        },
        quantity: 1,
      });
    } else if (data.tasting_type === 'cookie') {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${data.cookie_box_name || 'Cookie'} Tasting Box`,
            description: '6 flavors, 2 of each — 12 cookies',
          },
          unit_amount: COOKIE_PRICE,
        },
        quantity: 1,
      });
    } else if (data.tasting_type === 'bundle') {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'The All In Bride Bundle',
            description: `${data.box_count}-count cake box + cookie box`,
          },
          unit_amount: BUNDLE_PRICES[data.box_count!] || 10000,
        },
        quantity: 1,
      });
    }

    if (addOnCount > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Add-On Mini Cake', description: 'Additional 12oz mini cake with filling & buttercream' },
          unit_amount: ADD_ON_PRICE,
        },
        quantity: addOnCount,
      });
    }

    const siteUrl = getEnvVar('NEXT_PUBLIC_SITE_URL') || 'https://bakesbycoral.com';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${siteUrl}/order/success?order=${orderNumber}`,
      cancel_url: `${siteUrl}/tasting?cancelled=true`,
      customer_email: data.email,
      metadata: { order_id: orderId, order_number: orderNumber, order_type: 'tasting' },
    });

    await db.prepare('UPDATE orders SET stripe_session_id = ? WHERE id = ?').bind(session.id, orderId).run();

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error('Tasting order error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to process order: ${errorMessage}` }, { status: 500 });
  }
}

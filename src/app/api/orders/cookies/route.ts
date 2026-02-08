import { NextRequest, NextResponse } from 'next/server';
import { getDB, getEnvVar } from '@/lib/db';
import Stripe from 'stripe';
import { validateOrder, isSpamSubmission, sanitizeInput } from '@/lib/validation';
import { validateRequestedDate } from '@/lib/scheduling';
import { sendEmail, orderConfirmationEmail, adminNewOrderEmail } from '@/lib/email';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';

interface CartItem {
  flavor: string;
}

interface CookieOrderData {
  name: string;
  email: string;
  phone: string;
  // New cart-based format (each item = half dozen / 6 cookies)
  cart_items?: CartItem[];
  packaging?: 'standard' | 'heat-sealed';
  // Legacy format (backward compatibility)
  flavors?: string[];
  quantity?: string;
  // Common fields
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
  coupon_code?: string | null;
  // Honeypot fields
  website?: string;
  company?: string;
}

const FLAVOR_LABELS: Record<string, string> = {
  chocolate_chip: 'Chocolate Chip',
  vanilla_bean_sugar: 'Vanilla Bean Sugar',
  cherry_almond: 'Cherry Almond',
  espresso_butterscotch: 'Espresso Butterscotch',
  lemon_sugar: 'Lemon Sugar',
  // Legacy flavors for backward compatibility
  snickerdoodle: 'Snickerdoodle',
  peanut_butter: 'Peanut Butter',
  double_chocolate: 'Double Chocolate',
  oatmeal_raisin: 'Oatmeal Raisin',
};

const PRICE_PER_DOZEN = 3000; // cents - fallback if not in settings
const HEAT_SEAL_FEE = 500;   // cents per dozen
const COOKIES_PER_HALF_DOZEN = 6;
const COOKIES_PER_DOZEN = 12;

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = rateLimit(request, 'order-form', RATE_LIMITS.publicForm);
    if (rateLimitResponse) return rateLimitResponse;

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

    // Determine if using new cart format or legacy format
    const isCartFormat = Array.isArray(data.cart_items) && data.cart_items.length > 0;

    let quantity: number; // in dozens
    let cartItems: CartItem[];
    let packaging: 'standard' | 'heat-sealed';

    if (isCartFormat) {
      // New cart format - each cart_item represents a half-dozen (6 cookies)
      cartItems = data.cart_items!;
      const totalHalfDozens = cartItems.length;
      const totalCookies = totalHalfDozens * COOKIES_PER_HALF_DOZEN;

      // Validate total is a multiple of 12 (full dozens)
      if (totalCookies % COOKIES_PER_DOZEN !== 0) {
        return NextResponse.json({ error: 'Total cookies must be in full dozens (12, 24, or 36)' }, { status: 400 });
      }

      quantity = totalCookies / COOKIES_PER_DOZEN;
      packaging = data.packaging || 'standard';

      if (quantity < 1 || quantity > 3) {
        return NextResponse.json({ error: 'Orders must be 1-3 dozen' }, { status: 400 });
      }
    } else {
      // Legacy format
      if (!data.flavors || data.flavors.length === 0) {
        return NextResponse.json({ error: 'Please select at least one flavor' }, { status: 400 });
      }

      if (!data.quantity || parseInt(data.quantity) < 1 || parseInt(data.quantity) > 3) {
        return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
      }

      quantity = parseInt(data.quantity);
      cartItems = data.flavors.map(flavor => ({ flavor }));
      packaging = 'standard';
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
    const pricePerDozen = priceSetting ? parseInt(priceSetting.value) : PRICE_PER_DOZEN;

    // Calculate total
    const cookieTotal = pricePerDozen * quantity;
    const packagingTotal = packaging === 'heat-sealed' ? HEAT_SEAL_FEE * quantity : 0;
    const totalAmount = cookieTotal + packagingTotal;

    // Create order in database
    const orderId = crypto.randomUUID();
    const orderNumber = `CK-${Date.now().toString(36).toUpperCase()}`;

    // Count cookies per flavor for storage
    const flavorCounts: Record<string, number> = {};
    for (const item of cartItems) {
      flavorCounts[item.flavor] = (flavorCounts[item.flavor] || 0) + COOKIES_PER_HALF_DOZEN;
    }

    // Store in structured format for form_data
    const formData = {
      cart_items: cartItems,
      flavor_counts: flavorCounts, // e.g. { chocolate_chip: 12, vanilla_bean_sugar: 6 }
      packaging: packaging,
      quantity: quantity,
    };

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
      JSON.stringify(formData)
    ).run();

    // Send form submission emails (non-blocking)
    const resendApiKey = getEnvVar('bakesbycoral_resend_api_key');
    if (resendApiKey) {
      // Get admin email from settings
      const adminEmailSetting = await db.prepare('SELECT value FROM settings WHERE key = ?').bind('admin_email').first<{ value: string }>();
      const adminEmail = adminEmailSetting?.value || 'hello@bakesbycoral.com';

      // Email to customer
      sendEmail(resendApiKey, {
        to: data.email,
        subject: `Order Received - ${orderNumber}`,
        html: orderConfirmationEmail({
          customerName: data.name,
          orderNumber: orderNumber,
          orderType: 'cookies',
          pickupDate: data.pickup_date,
          pickupTime: data.pickup_time,
        }),
        replyTo: adminEmail,
      }).catch(err => console.error('Failed to send customer email:', err));

      // Email to admin
      sendEmail(resendApiKey, {
        to: adminEmail,
        subject: `New Cookie Order - ${orderNumber}`,
        html: adminNewOrderEmail({
          customerName: data.name,
          customerEmail: data.email,
          customerPhone: data.phone,
          orderNumber: orderNumber,
          orderType: 'cookies',
          pickupDate: data.pickup_date,
          formData: formData,
        }),
      }).catch(err => console.error('Failed to send admin email:', err));
    }

    // Create Stripe checkout session
    const stripeKey = getEnvVar('bakesbycoral_stripe_secret_key');
    console.log('Stripe key found:', stripeKey ? 'yes' : 'no');

    const stripe = new Stripe(stripeKey, {
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Create line items per flavor for better receipt clarity
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = Object.entries(flavorCounts).map(([flavor, cookieCount]) => {
      const dozenCount = cookieCount / COOKIES_PER_DOZEN;
      const isFullDozen = cookieCount % COOKIES_PER_DOZEN === 0;

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${FLAVOR_LABELS[flavor] || flavor} Cookies`,
            description: isFullDozen
              ? `${dozenCount} dozen (${cookieCount} cookies)`
              : `${cookieCount} cookies`,
          },
          unit_amount: Math.round((pricePerDozen / COOKIES_PER_DOZEN) * cookieCount),
        },
        quantity: 1,
      };
    });

    // Add packaging fee as separate line item if applicable
    if (packagingTotal > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Heat-Sealed Packaging',
            description: `Individual heat-sealed packaging for ${quantity} dozen cookies`,
          },
          unit_amount: packagingTotal,
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
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
    console.error('Cookie order error:', error instanceof Error ? error.message : error);
    console.error('Full error:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: 'Failed to process order. Please try again.' },
      { status: 500 }
    );
  }
}

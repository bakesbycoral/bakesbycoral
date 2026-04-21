import { NextRequest, NextResponse } from 'next/server';
import { getDB, getEnvVar, upsertClientFromOrder } from '@/lib/db';
import { sanitizeInput } from '@/lib/validation';
import { sendEmail, orderConfirmationEmail, buildLimitedCollectionOrderNotification } from '@/lib/email';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import Stripe from 'stripe';

const VALID_ITEM_KEYS = ['floral_cake', 'vintage_cake', 'floral_cookie_cups', 'vintage_cookie_cups'];
const VALID_CAKE_FLAVORS = ['vanilla-bean', 'chocolate', 'marble', 'confetti', 'red-velvet', 'lemon'];
const VALID_COOKIE_FLAVORS = ['sugar', 'chocolate-chip'];
const VALID_FILLINGS = ['', 'fresh-strawberries', 'raspberry', 'vanilla-bean-ganache'];
const VALID_PICKUP_DATES = ['2025-05-08', '2025-05-09'];

const CAKE_FLAVOR_LABELS: Record<string, string> = {
  'vanilla-bean': 'Vanilla Bean',
  'chocolate': 'Chocolate',
  'marble': 'Marble',
  'confetti': 'Confetti',
  'red-velvet': 'Red Velvet',
  'lemon': 'Lemon',
};

const COOKIE_FLAVOR_LABELS: Record<string, string> = {
  'sugar': 'Sugar',
  'chocolate-chip': 'Chocolate Chip',
};

const FILLING_OPTIONS: Record<string, { label: string; price: number }> = {
  'fresh-strawberries': { label: 'Fresh Strawberries', price: 400 },
  'raspberry': { label: 'Raspberry', price: 400 },
  'vanilla-bean-ganache': { label: 'Vanilla Bean Ganache', price: 500 },
};

const ITEM_PRICES: Record<string, number> = {
  'floral_cake': 4200,
  'vintage_cake': 4000,
  'floral_cookie_cups': 3200,
  'vintage_cookie_cups': 3000,
};

const ITEM_LABELS: Record<string, string> = {
  'floral_cake': 'Floral Mini Cake',
  'vintage_cake': 'Vintage Mini Cake',
  'floral_cookie_cups': 'Floral Cookie Cups',
  'vintage_cookie_cups': 'Vintage Cookie Cups',
};

function isCakeKey(key: string): boolean {
  return key === 'floral_cake' || key === 'vintage_cake';
}

function isCookieCupsKey(key: string): boolean {
  return key === 'floral_cookie_cups' || key === 'vintage_cookie_cups';
}

interface OrderItem {
  key: string;
  cake_flavor?: string;
  filling?: string;
  cake_message?: string;
  cookie_flavor?: string;
}

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = rateLimit(request, 'order-form', RATE_LIMITS.publicForm);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json() as Record<string, unknown>;

    const items = body.items as OrderItem[] | undefined;
    const name = (body.name as string) || '';
    const email = (body.email as string) || '';
    const phone = (body.phone as string) || '';
    const pickupDate = (body.pickup_date as string) || '';
    const pickupTime = (body.pickup_time as string) || '';
    const allergies = (body.allergies as string) || '';
    const howDidYouHear = (body.how_did_you_hear as string) || '';
    const notes = (body.notes as string) || '';
    const rushOrder = body.rush_order === 'true';

    // Validation
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    if (!phone?.trim()) {
      return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Please select at least one item' }, { status: 400 });
    }
    if (items.length > 4) {
      return NextResponse.json({ error: 'Maximum 4 items per order' }, { status: 400 });
    }
    if (!pickupDate || !VALID_PICKUP_DATES.includes(pickupDate)) {
      return NextResponse.json({ error: 'Please select a valid pickup date (May 8 or May 9)' }, { status: 400 });
    }
    if (!pickupTime) {
      return NextResponse.json({ error: 'Please select a pickup time slot' }, { status: 400 });
    }

    // Validate each item
    const seenKeys = new Set<string>();
    for (const item of items) {
      if (!item.key || !VALID_ITEM_KEYS.includes(item.key)) {
        return NextResponse.json({ error: 'Invalid item selection' }, { status: 400 });
      }
      if (seenKeys.has(item.key)) {
        return NextResponse.json({ error: 'Duplicate item in order' }, { status: 400 });
      }
      seenKeys.add(item.key);

      if (isCakeKey(item.key)) {
        if (!item.cake_flavor || !VALID_CAKE_FLAVORS.includes(item.cake_flavor)) {
          return NextResponse.json({ error: `Please select a cake flavor for ${ITEM_LABELS[item.key]}` }, { status: 400 });
        }
        if (item.filling && !VALID_FILLINGS.includes(item.filling)) {
          return NextResponse.json({ error: `Invalid filling for ${ITEM_LABELS[item.key]}` }, { status: 400 });
        }
      }

      if (isCookieCupsKey(item.key)) {
        if (!item.cookie_flavor || !VALID_COOKIE_FLAVORS.includes(item.cookie_flavor)) {
          return NextResponse.json({ error: `Please select a cookie flavor for ${ITEM_LABELS[item.key]}` }, { status: 400 });
        }
      }
    }

    // Validate slot availability (max 2 per slot)
    const db = getDB();
    const slotCount = await db.prepare(`
      SELECT COUNT(*) as count FROM orders
      WHERE order_type = 'mothers_day_collection'
        AND status IN ('pending_payment', 'deposit_paid', 'confirmed')
        AND pickup_date = ? AND pickup_time = ?
    `).bind(pickupDate, pickupTime).first<{ count: number }>();

    if (slotCount && slotCount.count >= 2) {
      return NextResponse.json({ error: 'This time slot is no longer available. Please select a different time.' }, { status: 400 });
    }

    // Calculate total
    let totalAmount = 0;
    const processedItems = items.map(item => {
      const basePrice = ITEM_PRICES[item.key] || 0;
      const fillingAddon = isCakeKey(item.key) && item.filling ? (FILLING_OPTIONS[item.filling]?.price || 0) : 0;
      totalAmount += basePrice + fillingAddon;

      return {
        key: item.key,
        label: ITEM_LABELS[item.key],
        base_price: basePrice,
        cake_flavor: isCakeKey(item.key) ? sanitizeInput(item.cake_flavor || '') : null,
        cake_flavor_label: isCakeKey(item.key) && item.cake_flavor ? CAKE_FLAVOR_LABELS[item.cake_flavor] : null,
        cookie_flavor: isCookieCupsKey(item.key) ? sanitizeInput(item.cookie_flavor || '') : null,
        cookie_flavor_label: isCookieCupsKey(item.key) && item.cookie_flavor ? COOKIE_FLAVOR_LABELS[item.cookie_flavor] : null,
        filling: isCakeKey(item.key) ? sanitizeInput(item.filling || '') : null,
        filling_label: isCakeKey(item.key) && item.filling ? FILLING_OPTIONS[item.filling]?.label : null,
        filling_addon_cents: fillingAddon,
        cake_message: isCakeKey(item.key) ? sanitizeInput(item.cake_message || '') : null,
      };
    });

    const rushAddon = rushOrder ? 2000 : 0;
    totalAmount += rushAddon;

    const orderId = crypto.randomUUID();
    const orderNumber = `MDAY-${Date.now().toString(36).toUpperCase()}`;

    const formData = {
      items: processedItems,
      rush_order: rushOrder,
      rush_addon_cents: rushAddon,
      allergies: sanitizeInput(allergies),
      how_did_you_hear: sanitizeInput(howDidYouHear),
    };

    await db.prepare(`
      INSERT INTO orders (
        id, order_number, order_type, status, customer_name, customer_email, customer_phone,
        pickup_date, pickup_time, total_amount, deposit_amount, notes, form_data, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      orderId,
      orderNumber,
      'mothers_day_collection',
      'pending_payment',
      sanitizeInput(name),
      sanitizeInput(email),
      sanitizeInput(phone),
      pickupDate,
      pickupTime,
      totalAmount,
      totalAmount,
      sanitizeInput(notes),
      JSON.stringify(formData)
    ).run();

    await upsertClientFromOrder(sanitizeInput(name), sanitizeInput(email), sanitizeInput(phone));

    // Send emails (non-blocking)
    const resendApiKey = getEnvVar('bakesbycoral_resend_api_key');
    if (resendApiKey) {
      const adminEmailSetting = await db.prepare('SELECT value FROM settings WHERE key = ?').bind('admin_email').first<{ value: string }>();
      const adminEmail = adminEmailSetting?.value || 'coral@bakesbycoral.com';

      sendEmail(resendApiKey, {
        to: email,
        subject: `Order Received - ${orderNumber}`,
        html: orderConfirmationEmail({
          customerName: name,
          orderNumber: orderNumber,
          orderType: 'mothers_day_collection',
          pickupDate: pickupDate,
          pickupTime: pickupTime,
        }),
        replyTo: adminEmail,
      }).catch(err => console.error('Failed to send customer email:', err));

      // Build order details summary
      const detailParts: string[] = [];
      for (const pi of processedItems) {
        detailParts.push(`**${pi.label}**`);
        if (pi.cake_flavor_label) detailParts.push(`  Flavor: ${pi.cake_flavor_label}`);
        if (pi.filling_label) detailParts.push(`  Filling: ${pi.filling_label}`);
        if (pi.cookie_flavor_label) detailParts.push(`  Cookie Flavor: ${pi.cookie_flavor_label}`);
        if (pi.cake_message) detailParts.push(`  Message: ${pi.cake_message}`);
      }
      if (formData.rush_order) detailParts.push(`\n**Rush Order:** Yes (+$20)`);
      if (formData.allergies) detailParts.push(`**Allergies:** ${formData.allergies}`);

      const adminTemplate = await db.prepare('SELECT value FROM settings WHERE key = ?').bind('email_template_limited_collection_order').first<{ value: string }>();
      const adminSubject = await db.prepare('SELECT value FROM settings WHERE key = ?').bind('email_subject_limited_collection_order').first<{ value: string }>();

      const adminNotification = buildLimitedCollectionOrderNotification(
        adminTemplate?.value,
        adminSubject?.value,
        {
          orderNumber,
          amount: totalAmount,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          pickupDate,
          pickupTime,
          orderDetails: detailParts.join('\n'),
          notes: formData.how_did_you_hear ? `How they heard about us: ${formData.how_did_you_hear}` : '',
          adminUrl: 'https://bakesbycoral.com/admin/orders',
        }
      );

      sendEmail(resendApiKey, {
        to: adminEmail,
        subject: adminNotification.subject,
        html: adminNotification.html,
      }).catch(err => console.error('Failed to send admin email:', err));
    }

    // Create Stripe checkout session
    const stripeKey = getEnvVar('bakesbycoral_stripe_secret_key');
    const stripe = new Stripe(stripeKey, {
      httpClient: Stripe.createFetchHttpClient(),
    });

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const pi of processedItems) {
      const descParts: string[] = [];
      if (pi.cake_flavor_label) descParts.push(pi.cake_flavor_label);
      if (pi.filling_label) descParts.push(`with ${pi.filling_label}`);
      if (pi.cookie_flavor_label) descParts.push(`${pi.cookie_flavor_label} cookie cups`);
      if (pi.cake_message) descParts.push(`Message: "${pi.cake_message}"`);

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: pi.label,
            description: descParts.join(' | ') || undefined,
          },
          unit_amount: pi.base_price,
        },
        quantity: 1,
      });

      if (pi.filling_addon_cents > 0) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Filling: ${pi.filling_label} (${pi.label})`,
            },
            unit_amount: pi.filling_addon_cents,
          },
          quantity: 1,
        });
      }
    }

    if (rushAddon > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Rush Order Fee',
          },
          unit_amount: rushAddon,
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${request.nextUrl.origin}/order/success?order=${orderNumber}`,
      cancel_url: `${request.nextUrl.origin}/collection/mothers-day?cancelled=true`,
      customer_email: email,
      metadata: {
        order_id: orderId,
        order_number: orderNumber,
        order_type: 'mothers_day_collection',
      },
    });

    await db.prepare('UPDATE orders SET stripe_session_id = ? WHERE id = ?')
      .bind(session.id, orderId)
      .run();

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error("Mother's Day collection order error:", error);
    return NextResponse.json(
      { error: 'Failed to process order. Please try again.' },
      { status: 500 }
    );
  }
}

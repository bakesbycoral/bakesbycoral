import { NextRequest, NextResponse } from 'next/server';
import { getDB, getEnvVar, upsertClientFromOrder } from '@/lib/db';
import { sanitizeInput } from '@/lib/validation';
import { sendEmail, orderConfirmationEmail, adminNewOrderEmail } from '@/lib/email';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import Stripe from 'stripe';

const VALID_SELECTIONS = ['bento', 'cookie_cake', 'cookies_dozen', 'bundle_bento', 'bundle_cookie_cake'];
const VALID_FLAVORS = ['vanilla-bean', 'chocolate', 'confetti', 'red-velvet', 'lemon', 'vanilla-latte', 'marble'];
const VALID_FILLINGS = ['', 'chocolate-ganache', 'cookies-and-cream', 'vanilla-bean-ganache', 'fresh-strawberries', 'lemon-ganache', 'raspberry'];
const VALID_COLORS = ['pastel-yellow', 'baby-pink', 'light-blue', 'lavender', 'pastel-orange', 'white'];

const FLAVOR_OPTIONS: Record<string, { label: string; price: number }> = {
  'vanilla-bean': { label: 'Vanilla Bean', price: 0 },
  'chocolate': { label: 'Chocolate', price: 0 },
  'confetti': { label: 'Confetti', price: 0 },
  'red-velvet': { label: 'Red Velvet', price: 0 },
  'lemon': { label: 'Lemon', price: 0 },
  'vanilla-latte': { label: 'Vanilla Latte', price: 500 },
  'marble': { label: 'Marble', price: 0 },
};

const FILLING_OPTIONS: Record<string, { label: string; price: number }> = {
  'chocolate-ganache': { label: 'Chocolate Ganache', price: 500 },
  'cookies-and-cream': { label: 'Cookies & Cream', price: 300 },
  'vanilla-bean-ganache': { label: 'Vanilla Bean Ganache', price: 500 },
  'fresh-strawberries': { label: 'Fresh Strawberries', price: 400 },
  'lemon-ganache': { label: 'Lemon Ganache', price: 500 },
  'raspberry': { label: 'Raspberry', price: 400 },
};

function getPrice(selection: string): number {
  switch (selection) {
    case 'bento':
    case 'cookie_cake':
      return 4000;
    case 'cookies_dozen':
      return 2600;
    case 'bundle_bento':
    case 'bundle_cookie_cake':
      return 4800;
    default:
      return 0;
  }
}

function getItemLabel(selection: string): string {
  switch (selection) {
    case 'bento': return 'Bento Cake';
    case 'cookie_cake': return 'Cookie Cake';
    case 'cookies_dozen': return 'Thumbprint Confetti Cookies - 1 Dozen';
    case 'bundle_bento': return 'Bundle: Bento Cake + 1/2 Dozen Cookies';
    case 'bundle_cookie_cake': return 'Bundle: Cookie Cake + 1/2 Dozen Cookies';
    default: return '';
  }
}

function formatColor(color: string): string {
  return color.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function getItemDescription(selection: string, cakeFlavor: string, filling: string, baseColor?: string, borderColor?: string, messagingColor?: string, cakeMessage?: string): string {
  if (selection === 'cookies_dozen') {
    return 'Easter thumbprint confetti cookies';
  }
  if (selection === 'cookie_cake' || selection === 'bundle_cookie_cake') {
    const parts: string[] = ['6" 2-layer Easter egg cookie cake - chocolate chip & Cadbury eggs'];
    if (selection === 'bundle_cookie_cake') {
      parts.push('+ 1/2 dozen thumbprint confetti cookies');
    }
    return parts.join(' ');
  }
  const parts: string[] = ['4" 2-layer Easter bento cake'];
  if (cakeFlavor) parts.push(`- ${FLAVOR_OPTIONS[cakeFlavor]?.label || cakeFlavor}`);
  if (filling) parts.push(`with ${FILLING_OPTIONS[filling]?.label || filling}`);
  if (baseColor && borderColor && messagingColor) {
    parts.push(`| Colors: ${formatColor(baseColor)} base, ${formatColor(borderColor)} border, ${formatColor(messagingColor)} messaging`);
  }
  if (cakeMessage) parts.push(`| Message: "${cakeMessage}"`);
  if (selection === 'bundle_bento') {
    parts.push('+ 1/2 dozen thumbprint confetti cookies');
  }
  return parts.join(' ');
}

function needsBentoOptions(selection: string): boolean {
  return ['bento', 'bundle_bento'].includes(selection);
}

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = rateLimit(request, 'order-form', RATE_LIMITS.publicForm);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json() as Record<string, string>;

    const selection = body.selection || '';
    const cakeFlavor = body.cake_flavor || '';
    const filling = body.filling || '';
    const baseColor = body.base_color || '';
    const borderColor = body.border_color || '';
    const messagingColor = body.messaging_color || '';
    const cakeMessage = body.cake_message || '';
    const name = body.name || '';
    const email = body.email || '';
    const phone = body.phone || '';
    const pickupDate = body.pickup_date || '';
    const pickupTime = body.pickup_time || '';
    const allergies = body.allergies || '';
    const howDidYouHear = body.how_did_you_hear || '';
    const notes = body.notes || '';

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
    if (!selection || !VALID_SELECTIONS.includes(selection)) {
      return NextResponse.json({ error: 'Please select a valid item' }, { status: 400 });
    }
    if (needsBentoOptions(selection)) {
      if (!cakeFlavor || !VALID_FLAVORS.includes(cakeFlavor)) {
        return NextResponse.json({ error: 'Please select a cake flavor' }, { status: 400 });
      }
      if (filling && !VALID_FILLINGS.includes(filling)) {
        return NextResponse.json({ error: 'Invalid filling selection' }, { status: 400 });
      }
      if (!baseColor || !VALID_COLORS.includes(baseColor) || !borderColor || !VALID_COLORS.includes(borderColor) || !messagingColor || !VALID_COLORS.includes(messagingColor)) {
        return NextResponse.json({ error: 'Please select all three cake colors' }, { status: 400 });
      }
    }

    const db = getDB();
    const basePrice = getPrice(selection);
    const flavorAddon = needsBentoOptions(selection) && cakeFlavor ? (FLAVOR_OPTIONS[cakeFlavor]?.price || 0) : 0;
    const fillingAddon = needsBentoOptions(selection) && filling ? (FILLING_OPTIONS[filling]?.price || 0) : 0;
    const totalAmount = basePrice + flavorAddon + fillingAddon;

    const orderId = crypto.randomUUID();
    const orderNumber = `EASTER-${Date.now().toString(36).toUpperCase()}`;

    const formData = {
      selection,
      item_label: getItemLabel(selection),
      is_bundle: selection === 'bundle_bento' || selection === 'bundle_cookie_cake',
      cake_flavor: needsBentoOptions(selection) ? sanitizeInput(cakeFlavor) : null,
      cake_flavor_label: needsBentoOptions(selection) && cakeFlavor ? FLAVOR_OPTIONS[cakeFlavor]?.label : null,
      filling: needsBentoOptions(selection) ? sanitizeInput(filling) : null,
      filling_label: needsBentoOptions(selection) && filling ? FILLING_OPTIONS[filling]?.label : null,
      base_color: needsBentoOptions(selection) ? baseColor : null,
      border_color: needsBentoOptions(selection) ? borderColor : null,
      messaging_color: needsBentoOptions(selection) ? messagingColor : null,
      cake_message: needsBentoOptions(selection) ? sanitizeInput(cakeMessage) : null,
      flavor_addon_cents: flavorAddon,
      filling_addon_cents: fillingAddon,
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
      'easter_collection',
      'pending_payment',
      sanitizeInput(name),
      sanitizeInput(email),
      sanitizeInput(phone),
      pickupDate || null,
      pickupTime || null,
      totalAmount,
      totalAmount, // Full payment upfront
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
          orderType: 'easter_collection',
          pickupDate: pickupDate,
          pickupTime: pickupTime,
        }),
        replyTo: adminEmail,
      }).catch(err => console.error('Failed to send customer email:', err));

      sendEmail(resendApiKey, {
        to: adminEmail,
        subject: `New Easter Collection Order - ${orderNumber}`,
        html: adminNewOrderEmail({
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          orderNumber: orderNumber,
          orderType: 'easter_collection',
          pickupDate: pickupDate,
          formData: formData,
        }),
      }).catch(err => console.error('Failed to send admin email:', err));
    }

    // Create Stripe checkout session
    const stripeKey = getEnvVar('bakesbycoral_stripe_secret_key');
    const stripe = new Stripe(stripeKey, {
      httpClient: Stripe.createFetchHttpClient(),
    });

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: getItemLabel(selection),
            description: getItemDescription(selection, cakeFlavor, filling, baseColor, borderColor, messagingColor, cakeMessage),
          },
          unit_amount: basePrice,
        },
        quantity: 1,
      },
    ];

    if (flavorAddon > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Flavor Upgrade: ${FLAVOR_OPTIONS[cakeFlavor]?.label || cakeFlavor}`,
          },
          unit_amount: flavorAddon,
        },
        quantity: 1,
      });
    }

    if (fillingAddon > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Filling: ${FILLING_OPTIONS[filling]?.label || filling}`,
          },
          unit_amount: fillingAddon,
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${request.nextUrl.origin}/order/success?order=${orderNumber}`,
      cancel_url: `${request.nextUrl.origin}/collection/easter?cancelled=true`,
      customer_email: email,
      metadata: {
        order_id: orderId,
        order_number: orderNumber,
        order_type: 'easter_collection',
      },
    });

    await db.prepare('UPDATE orders SET stripe_session_id = ? WHERE id = ?')
      .bind(session.id, orderId)
      .run();

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error('Easter collection order error:', error);
    return NextResponse.json(
      { error: 'Failed to process order. Please try again.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getDB, getEnvVar } from '@/lib/db';
import { sanitizeInput } from '@/lib/validation';
import { sendEmail, buildLargeCookieOrderNotification } from '@/lib/email';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';

interface LargeCookieOrderData {
  name: string;
  email: string;
  phone: string;
  event_date: string;
  pickup_date: string | null;
  pickup_time: string | null;
  event_type: string;
  event_location: string;
  pickup_or_delivery: string;
  quantity: number;
  flavors: {
    chocolateChip: number;
    vanillaBeanSugar: number;
    cherryAlmond: number;
    espressoButterscotch: number;
    lemonSugar: number;
  };
  packaging: string;
  allergies: string;
  how_did_you_hear: string;
  notes: string;
  acknowledge_deposit: boolean;
  acknowledge_allergens: boolean;
  acknowledge_lead_time: boolean;
  coupon_code: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = rateLimit(request, 'order-form', RATE_LIMITS.publicForm);
    if (rateLimitResponse) return rateLimitResponse;

    const data: LargeCookieOrderData = await request.json();

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

    if (!data.quantity || data.quantity < 4) {
      return NextResponse.json({ error: 'Minimum 4 dozen required for large orders' }, { status: 400 });
    }

    const db = getDB();

    // Format flavors for display
    const flavorList = [];
    if (data.flavors.chocolateChip > 0) flavorList.push(`Chocolate Chip: ${data.flavors.chocolateChip}`);
    if (data.flavors.vanillaBeanSugar > 0) flavorList.push(`Vanilla Bean Sugar: ${data.flavors.vanillaBeanSugar}`);
    if (data.flavors.cherryAlmond > 0) flavorList.push(`Cherry Almond: ${data.flavors.cherryAlmond}`);
    if (data.flavors.espressoButterscotch > 0) flavorList.push(`Espresso Butterscotch: ${data.flavors.espressoButterscotch}`);
    if (data.flavors.lemonSugar > 0) flavorList.push(`Lemon Sugar: ${data.flavors.lemonSugar}`);

    // Create inquiry in database
    const orderId = crypto.randomUUID();
    const orderNumber = `CKL-${Date.now().toString(36).toUpperCase()}`;

    await db.prepare(`
      INSERT INTO orders (
        id, order_number, order_type, status, customer_name, customer_email, customer_phone,
        event_date, pickup_date, pickup_time, notes, form_data, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      orderId,
      orderNumber,
      'cookies_large',
      'inquiry',
      sanitizeInput(data.name),
      sanitizeInput(data.email),
      sanitizeInput(data.phone),
      data.event_date || null,
      data.pickup_date || null,
      data.pickup_time || null,
      sanitizeInput(data.notes || ''),
      JSON.stringify({
        quantity: data.quantity,
        flavors: data.flavors,
        packaging: data.packaging,
        event_type: data.event_type,
        event_location: sanitizeInput(data.event_location || ''),
        pickup_or_delivery: data.pickup_or_delivery,
        allergies: sanitizeInput(data.allergies || ''),
        how_did_you_hear: sanitizeInput(data.how_did_you_hear || ''),
        coupon_code: data.coupon_code || null,
      })
    ).run();

    // Send email via Resend
    const resendApiKey = getEnvVar('bakesbycoral_resend_api_key');
    if (resendApiKey) {
      try {
        // Get email template from settings
        const cookieTemplate = await db.prepare('SELECT value FROM settings WHERE key = ?')
          .bind('email_template_large_cookie_order')
          .first<{ value: string }>();
        const cookieSubject = await db.prepare('SELECT value FROM settings WHERE key = ?')
          .bind('email_subject_large_cookie_order')
          .first<{ value: string }>();

        const emailContent = buildLargeCookieOrderNotification(
          cookieTemplate?.value,
          cookieSubject?.value,
          {
            orderNumber,
            customerName: sanitizeInput(data.name),
            customerEmail: sanitizeInput(data.email),
            customerPhone: sanitizeInput(data.phone),
            quantity: data.quantity,
            flavors: flavorList.join(', ') || 'Not specified',
            packaging: data.packaging,
            eventType: data.event_type || '',
            eventDate: data.event_date || '',
            pickupDelivery: data.pickup_or_delivery === 'delivery' ? `Delivery to: ${data.event_location}` : 'Pickup',
            pickupDate: data.pickup_date || '',
            pickupTime: data.pickup_time || '',
            allergies: data.allergies || '',
            notes: data.notes ? sanitizeInput(data.notes) : '',
            adminUrl: 'https://bakesbycoral.com/admin/orders',
          }
        );

        await sendEmail(resendApiKey, {
          to: 'coral@bakesbycoral.com',
          subject: emailContent.subject,
          html: emailContent.html,
          replyTo: data.email,
        });
      } catch (emailError) {
        console.error('Email sending error:', emailError);
      }
    }

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

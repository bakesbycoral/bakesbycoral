import { NextRequest, NextResponse } from 'next/server';
import { getDB, getEnvVar } from '@/lib/db';
import { sanitizeInput } from '@/lib/validation';

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

    // Send email via Resend (same way as contact form which works)
    const resendApiKey = getEnvVar('bakesbycoral_resend_api_key');
    if (resendApiKey) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Bakes by Coral <onboarding@resend.dev>',
            to: ['coral@bakesbycoral.com'],
            reply_to: data.email,
            subject: `New Large Cookie Order - ${orderNumber}`,
            html: `
              <h2>New Large Cookie Order</h2>
              <p><strong>Order Number:</strong> ${orderNumber}</p>
              <hr>
              <p><strong>Customer:</strong> ${sanitizeInput(data.name)}</p>
              <p><strong>Email:</strong> ${sanitizeInput(data.email)}</p>
              <p><strong>Phone:</strong> ${sanitizeInput(data.phone)}</p>
              <hr>
              <h3>Order Details</h3>
              <p><strong>Quantity:</strong> ${data.quantity} dozen (${data.quantity * 12} cookies)</p>
              <p><strong>Flavors:</strong> ${flavorList.join(', ') || 'Not specified'}</p>
              <p><strong>Packaging:</strong> ${data.packaging === 'heat-sealed' ? 'Individually Heat Sealed' : 'Standard'}</p>
              <p><strong>Event Type:</strong> ${data.event_type || 'Not specified'}</p>
              <p><strong>Event Date:</strong> ${data.event_date || 'TBD'}</p>
              <p><strong>Pickup/Delivery:</strong> ${data.pickup_or_delivery === 'delivery' ? `Delivery to: ${data.event_location}` : 'Pickup'}</p>
              <p><strong>Pickup Date:</strong> ${data.pickup_date || 'TBD'}</p>
              <p><strong>Pickup Time:</strong> ${data.pickup_time || 'TBD'}</p>
              <p><strong>Allergies:</strong> ${data.allergies || 'None noted'}</p>
              ${data.notes ? `<p><strong>Additional Notes:</strong> ${sanitizeInput(data.notes)}</p>` : ''}
              <hr>
              <p><a href="https://bakesbycoral.com/admin/orders">View in Admin Dashboard</a></p>
            `,
          }),
        });

        if (!response.ok) {
          console.error('Failed to send email:', await response.text());
        }
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

import { NextRequest, NextResponse } from 'next/server';
import { getDB, getEnvVar } from '@/lib/db';
import { sanitizeInput } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const name = formData.get('name') as string || '';
    const email = formData.get('email') as string || '';
    const phone = formData.get('phone') as string || '';
    const pickupDate = formData.get('pickup_date') as string || '';
    const pickupTime = formData.get('pickup_time') as string || '';
    const eventType = formData.get('event_type') as string || '';
    const cakeSize = formData.get('cake_size') as string || '';
    const cakeShape = formData.get('cake_shape') as string || '';
    const cakeFlavor = formData.get('cake_flavor') as string || '';
    const filling = formData.get('filling') as string || '';
    const baseColor = formData.get('base_color') as string || '';
    const pipingColors = formData.get('piping_colors') as string || '';
    const customMessaging = formData.get('custom_messaging') as string || '';
    const messageStyle = formData.get('message_style') as string || '';
    const toppings = formData.get('toppings') as string || '[]';
    const allergies = formData.get('allergies') as string || '';
    const notes = formData.get('notes') as string || '';
    const howDidYouHear = formData.get('how_did_you_hear') as string || '';
    const couponCode = formData.get('coupon_code') as string || '';

    // Basic validation
    if (!name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    if (!phone.trim()) {
      return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
    }

    const db = getDB();

    // Count inspiration images (don't store them in DB - too large)
    const inspirationImages = formData.getAll('inspiration_images') as File[];
    const imageCount = inspirationImages.filter(f => f && f.size > 0).length;

    // Create inquiry in database
    const orderId = crypto.randomUUID();
    const orderNumber = `CAKE-${Date.now().toString(36).toUpperCase()}`;

    await db.prepare(`
      INSERT INTO orders (
        id, order_number, order_type, status, customer_name, customer_email, customer_phone,
        pickup_date, pickup_time, notes, form_data, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      orderId,
      orderNumber,
      'cake',
      'inquiry',
      sanitizeInput(name),
      sanitizeInput(email),
      sanitizeInput(phone),
      pickupDate || null,
      pickupTime || null,
      sanitizeInput(notes),
      JSON.stringify({
        event_type: eventType,
        cake_size: cakeSize,
        cake_shape: cakeShape,
        cake_flavor: cakeFlavor,
        filling: filling || null,
        base_color: baseColor,
        piping_colors: pipingColors,
        custom_messaging: customMessaging,
        message_style: messageStyle,
        toppings: JSON.parse(toppings || '[]'),
        allergies: sanitizeInput(allergies),
        how_did_you_hear: sanitizeInput(howDidYouHear),
        inspiration_image_count: imageCount,
        coupon_code: couponCode || null,
      })
    ).run();

    // Send email via Resend (same way as contact form which works)
    const resendApiKey = getEnvVar('bakesbycoral_resend_api_key');
    if (resendApiKey) {
      try {
        const toppingsList = JSON.parse(toppings || '[]').join(', ') || 'None';

        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Bakes by Coral <onboarding@resend.dev>',
            to: ['coral@bakesbycoral.com'],
            reply_to: email,
            subject: `New Cake Inquiry - ${orderNumber}`,
            html: `
              <h2>New Cake Inquiry</h2>
              <p><strong>Order Number:</strong> ${orderNumber}</p>
              <hr>
              <p><strong>Customer:</strong> ${sanitizeInput(name)}</p>
              <p><strong>Email:</strong> ${sanitizeInput(email)}</p>
              <p><strong>Phone:</strong> ${sanitizeInput(phone)}</p>
              <hr>
              <h3>Cake Details</h3>
              <p><strong>Event Type:</strong> ${eventType}</p>
              <p><strong>Pickup Date:</strong> ${pickupDate || 'TBD'}</p>
              <p><strong>Pickup Time:</strong> ${pickupTime || 'TBD'}</p>
              <p><strong>Size:</strong> ${cakeSize}</p>
              <p><strong>Shape:</strong> ${cakeShape}</p>
              <p><strong>Flavor:</strong> ${cakeFlavor}</p>
              <p><strong>Filling:</strong> ${filling || 'None'}</p>
              <p><strong>Base Color:</strong> ${baseColor}</p>
              <p><strong>Piping Colors:</strong> ${pipingColors}</p>
              <p><strong>Custom Message:</strong> ${customMessaging}</p>
              <p><strong>Message Style:</strong> ${messageStyle}</p>
              <p><strong>Toppings:</strong> ${toppingsList}</p>
              <p><strong>Allergies:</strong> ${allergies || 'None'}</p>
              <p><strong>Inspiration Images:</strong> ${imageCount} uploaded</p>
              ${notes ? `<p><strong>Additional Notes:</strong> ${sanitizeInput(notes)}</p>` : ''}
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
    console.error('Cake order error:', error);
    return NextResponse.json(
      { error: 'Failed to submit inquiry. Please try again.' },
      { status: 500 }
    );
  }
}

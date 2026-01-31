import { NextRequest, NextResponse } from 'next/server';
import { getDB, getEnvVar } from '@/lib/db';
import { sanitizeInput } from '@/lib/validation';
import { sendEmail, buildCakeInquiryNotification } from '@/lib/email';

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

    // Send email via Resend
    const resendApiKey = getEnvVar('bakesbycoral_resend_api_key');
    if (resendApiKey) {
      try {
        const toppingsList = JSON.parse(toppings || '[]').join(', ') || 'None';

        // Get email template from settings
        const cakeTemplate = await db.prepare('SELECT value FROM settings WHERE key = ?')
          .bind('email_template_cake_inquiry')
          .first<{ value: string }>();
        const cakeSubject = await db.prepare('SELECT value FROM settings WHERE key = ?')
          .bind('email_subject_cake_inquiry')
          .first<{ value: string }>();

        const emailContent = buildCakeInquiryNotification(
          cakeTemplate?.value,
          cakeSubject?.value,
          {
            orderNumber,
            customerName: sanitizeInput(name),
            customerEmail: sanitizeInput(email),
            customerPhone: sanitizeInput(phone),
            eventType,
            pickupDate: pickupDate || '',
            pickupTime: pickupTime || '',
            cakeSize,
            cakeShape,
            cakeFlavor,
            filling: filling || '',
            baseColor,
            pipingColors,
            customMessaging,
            toppings: toppingsList,
            allergies: allergies || '',
            notes: notes ? sanitizeInput(notes) : '',
            adminUrl: 'https://bakesbycoral.com/admin/orders',
          }
        );

        await sendEmail(resendApiKey, {
          to: 'coral@bakesbycoral.com',
          subject: emailContent.subject,
          html: emailContent.html,
          replyTo: email,
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
    console.error('Cake order error:', error);
    return NextResponse.json(
      { error: 'Failed to submit inquiry. Please try again.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getDB, getEnvVar } from '@/lib/db';
import { sanitizeInput } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const name = formData.get('name') as string || '';
    const partnerName = formData.get('partner_name') as string || '';
    const email = formData.get('email') as string || '';
    const phone = formData.get('phone') as string || '';
    const weddingDate = formData.get('wedding_date') as string || '';
    const pickupOrDelivery = formData.get('pickup_or_delivery') as string || 'pickup';
    const pickupDate = formData.get('pickup_date') as string || '';
    const pickupTime = formData.get('pickup_time') as string || '';
    const deliveryTime = formData.get('delivery_time') as string || '';
    const setupRequirements = formData.get('setup_requirements') as string || '';
    const venueName = formData.get('venue_name') as string || '';
    const venueAddress = formData.get('venue_address') as string || '';
    const startTime = formData.get('start_time') as string || '';
    const onsiteContact = formData.get('onsite_contact') as string || '';
    const guestCount = formData.get('guest_count') as string || '';
    const servicesNeeded = formData.get('services_needed') as string || '';
    const cakeShape = formData.get('cake_shape') as string || '';
    const cakeSize = formData.get('cake_size') as string || '';
    const cakeFlavor = formData.get('cake_flavor') as string || '';
    const cakeFilling = formData.get('cake_filling') as string || '';
    const baseColor = formData.get('base_color') as string || '';
    const pipingColors = formData.get('piping_colors') as string || '';
    const customMessaging = formData.get('custom_messaging') as string || '';
    const messageStyle = formData.get('message_style') as string || '';
    const cakeToppings = formData.get('cake_toppings') as string || '[]';
    const cakeDesignNotes = formData.get('cake_design_notes') as string || '';
    const cookieQuantity = formData.get('cookie_quantity') as string || '';
    const cookieFlavors = formData.get('cookie_flavors') as string || '{}';
    const cookiePackaging = formData.get('cookie_packaging') as string || '';
    const dietaryRestrictions = formData.get('dietary_restrictions') as string || '';
    const howFoundUs = formData.get('how_found_us') as string || '';

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
    if (!weddingDate) {
      return NextResponse.json({ error: 'Wedding date is required' }, { status: 400 });
    }

    const db = getDB();

    // Count inspiration images
    const inspirationImages = formData.getAll('inspiration_images') as File[];
    const imageCount = inspirationImages.filter(f => f && f.size > 0).length;

    // Create inquiry in database
    const orderId = crypto.randomUUID();
    const orderNumber = `WED-${Date.now().toString(36).toUpperCase()}`;

    await db.prepare(`
      INSERT INTO orders (
        id, order_number, order_type, status, customer_name, customer_email, customer_phone,
        event_date, pickup_date, pickup_time, notes, form_data, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      orderId,
      orderNumber,
      'wedding',
      'inquiry',
      sanitizeInput(name),
      sanitizeInput(email),
      sanitizeInput(phone),
      weddingDate || null,
      pickupDate || null,
      pickupTime || null,
      sanitizeInput(cakeDesignNotes),
      JSON.stringify({
        partner_name: sanitizeInput(partnerName),
        venue_name: sanitizeInput(venueName),
        venue_address: sanitizeInput(venueAddress),
        start_time: startTime,
        onsite_contact: sanitizeInput(onsiteContact),
        guest_count: guestCount,
        services_needed: servicesNeeded,
        pickup_or_delivery: pickupOrDelivery,
        delivery_time: deliveryTime,
        setup_requirements: sanitizeInput(setupRequirements),
        cake: {
          shape: cakeShape,
          size: cakeSize,
          flavor: cakeFlavor,
          filling: cakeFilling,
          base_color: baseColor,
          piping_colors: pipingColors,
          custom_messaging: customMessaging,
          message_style: messageStyle,
          toppings: JSON.parse(cakeToppings || '[]'),
        },
        cookies: {
          quantity: cookieQuantity,
          flavors: JSON.parse(cookieFlavors || '{}'),
          packaging: cookiePackaging,
        },
        dietary_restrictions: sanitizeInput(dietaryRestrictions),
        how_found_us: sanitizeInput(howFoundUs),
        inspiration_image_count: imageCount,
      })
    ).run();

    // Send email via Resend (same way as contact form which works)
    const resendApiKey = getEnvVar('bakesbycoral_resend_api_key');
    if (resendApiKey) {
      try {
        const servicesLabel = servicesNeeded === 'cutting_cake' ? 'Cutting Cake' :
                             servicesNeeded === 'cookies' ? 'Cookies' :
                             servicesNeeded === 'cake_and_cookies' ? 'Cake + Cookies' : servicesNeeded;

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
            subject: `New Wedding Inquiry - ${orderNumber}`,
            html: `
              <h2>New Wedding Inquiry</h2>
              <p><strong>Order Number:</strong> ${orderNumber}</p>
              <hr>
              <p><strong>Customer:</strong> ${sanitizeInput(name)}</p>
              <p><strong>Partner:</strong> ${sanitizeInput(partnerName)}</p>
              <p><strong>Email:</strong> ${sanitizeInput(email)}</p>
              <p><strong>Phone:</strong> ${sanitizeInput(phone)}</p>
              <hr>
              <h3>Wedding Details</h3>
              <p><strong>Wedding Date:</strong> ${weddingDate}</p>
              <p><strong>Venue:</strong> ${sanitizeInput(venueName)}, ${sanitizeInput(venueAddress)}</p>
              <p><strong>Start Time:</strong> ${startTime || 'TBD'}</p>
              <p><strong>Guest Count:</strong> ${guestCount}</p>
              <p><strong>Services Needed:</strong> ${servicesLabel}</p>
              <p><strong>Pickup/Delivery:</strong> ${pickupOrDelivery === 'delivery' ? 'Delivery' : 'Pickup'}</p>
              ${cakeSize ? `<p><strong>Cake Size:</strong> ${cakeSize}</p>` : ''}
              ${cakeFlavor ? `<p><strong>Cake Flavor:</strong> ${cakeFlavor}</p>` : ''}
              ${cookieQuantity ? `<p><strong>Cookie Quantity:</strong> ${cookieQuantity} dozen</p>` : ''}
              <p><strong>Dietary Restrictions:</strong> ${dietaryRestrictions || 'None'}</p>
              <p><strong>Inspiration Images:</strong> ${imageCount} uploaded</p>
              ${cakeDesignNotes ? `<p><strong>Design Notes:</strong> ${sanitizeInput(cakeDesignNotes)}</p>` : ''}
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
    console.error('Wedding order error:', error);
    return NextResponse.json(
      { error: 'Failed to submit inquiry. Please try again.' },
      { status: 500 }
    );
  }
}

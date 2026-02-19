import { NextRequest, NextResponse } from 'next/server';
import { getDB, getEnvVar, upsertClientFromOrder } from '@/lib/db';
import { sanitizeInput } from '@/lib/validation';
import { sendEmail, buildWeddingInquiryNotification } from '@/lib/email';
import { uploadInspirationImages } from '@/lib/uploads';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = rateLimit(request, 'order-form', RATE_LIMITS.publicForm);
    if (rateLimitResponse) return rateLimitResponse;

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
    const tieredCakeTiers = formData.get('tiered_cake_tiers') as string || '';
    const tieredCakeSize = formData.get('tiered_cake_size') as string || '';
    const tieredCakeShape = formData.get('tiered_cake_shape') as string || '';
    const tieredCakeFlavorTier1 = formData.get('tiered_cake_flavor_tier1') as string || '';
    const tieredCakeFlavorTier2 = formData.get('tiered_cake_flavor_tier2') as string || '';
    const tieredCakeFlavorTier3 = formData.get('tiered_cake_flavor_tier3') as string || '';
    const tieredCakeFillingTier1 = formData.get('tiered_cake_filling_tier1') as string || '';
    const tieredCakeFillingTier2 = formData.get('tiered_cake_filling_tier2') as string || '';
    const tieredCakeFillingTier3 = formData.get('tiered_cake_filling_tier3') as string || '';
    const tieredCakeBaseColor = formData.get('tiered_cake_base_color') as string || '';
    const tieredCakePipingColors = formData.get('tiered_cake_piping_colors') as string || '';
    const tieredCakeMessaging = formData.get('tiered_cake_messaging') as string || '';
    const tieredCakeMessageStyle = formData.get('tiered_cake_message_style') as string || '';
    const tieredCakeToppings = formData.get('tiered_cake_toppings') as string || '[]';
    const tieredCakeDesignNotes = formData.get('tiered_cake_design_notes') as string || '';
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

    // Upload inspiration images to R2
    const inspirationImages = formData.getAll('inspiration_images') as File[];
    const validImages = inspirationImages.filter(f => f && f.size > 0);
    const imageUrls = await uploadInspirationImages(validImages, 'wedding');
    const imageCount = validImages.length;

    // Upload tiered cake inspiration images to R2
    const tieredCakeImages = formData.getAll('tiered_cake_inspiration_images') as File[];
    const validTieredCakeImages = tieredCakeImages.filter(f => f && f.size > 0);
    const tieredCakeImageUrls = await uploadInspirationImages(validTieredCakeImages, 'wedding');
    const tieredCakeImageCount = validTieredCakeImages.length;

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
        tiered_cake: {
          tiers: tieredCakeTiers,
          size: tieredCakeSize,
          shape: tieredCakeShape,
          flavors: {
            tier1: tieredCakeFlavorTier1,
            tier2: tieredCakeFlavorTier2,
            tier3: tieredCakeFlavorTier3,
          },
          fillings: {
            tier1: tieredCakeFillingTier1,
            tier2: tieredCakeFillingTier2,
            tier3: tieredCakeFillingTier3,
          },
          base_color: tieredCakeBaseColor,
          piping_colors: tieredCakePipingColors,
          messaging: tieredCakeMessaging,
          message_style: tieredCakeMessageStyle,
          toppings: JSON.parse(tieredCakeToppings || '[]'),
          design_notes: sanitizeInput(tieredCakeDesignNotes),
          inspiration_image_urls: tieredCakeImageUrls,
          inspiration_image_count: tieredCakeImageCount,
        },
        dietary_restrictions: sanitizeInput(dietaryRestrictions),
        how_found_us: sanitizeInput(howFoundUs),
        inspiration_image_count: imageCount,
        inspiration_image_urls: imageUrls,
      })
    ).run();

    // Auto-add customer to clients list
    await upsertClientFromOrder(sanitizeInput(name), sanitizeInput(email), sanitizeInput(phone));

    // Send email via Resend
    const resendApiKey = getEnvVar('bakesbycoral_resend_api_key');
    if (resendApiKey) {
      try {
        const serviceLabels: Record<string, string> = {
          cutting_cake: 'Cutting Cake',
          cookies: 'Cookies',
          cookie_cups: 'Cookie Cups',
          tiered_cake: 'Tiered Wedding Cake',
        };
        const servicesLabel = servicesNeeded.split(',').map(s => serviceLabels[s.trim()] || s.trim()).filter(Boolean).join(', ');

        // Get email template from settings
        const weddingTemplate = await db.prepare('SELECT value FROM settings WHERE key = ?')
          .bind('email_template_wedding_inquiry')
          .first<{ value: string }>();
        const weddingSubject = await db.prepare('SELECT value FROM settings WHERE key = ?')
          .bind('email_subject_wedding_inquiry')
          .first<{ value: string }>();

        const cakeDetails = cakeSize || cakeFlavor ? `Size: ${cakeSize || 'TBD'}, Flavor: ${cakeFlavor || 'TBD'}` : '';
        const cookieDetails = cookieQuantity ? `${cookieQuantity} dozen` : '';

        const emailContent = buildWeddingInquiryNotification(
          weddingTemplate?.value,
          weddingSubject?.value,
          {
            orderNumber,
            customerName: sanitizeInput(name),
            partnerName: sanitizeInput(partnerName),
            customerEmail: sanitizeInput(email),
            customerPhone: sanitizeInput(phone),
            weddingDate,
            venue: venueName ? `${sanitizeInput(venueName)}, ${sanitizeInput(venueAddress)}` : '',
            startTime: startTime || '',
            guestCount,
            services: servicesLabel,
            pickupDelivery: pickupOrDelivery,
            cakeDetails,
            cookieDetails,
            dietaryRestrictions: dietaryRestrictions || '',
            imageCount,
            designNotes: cakeDesignNotes ? sanitizeInput(cakeDesignNotes) : '',
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
    console.error('Wedding order error:', error);
    return NextResponse.json(
      { error: 'Failed to submit inquiry. Please try again.' },
      { status: 500 }
    );
  }
}

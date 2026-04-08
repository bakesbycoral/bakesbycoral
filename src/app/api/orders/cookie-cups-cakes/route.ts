import { NextRequest, NextResponse } from 'next/server';
import { getDB, getEnvVar, upsertClientFromOrder } from '@/lib/db';
import { parseAdminEmails, sendEmail, textToHtmlEmail, orderConfirmationEmail } from '@/lib/email';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { uploadInspirationImages } from '@/lib/uploads';
import { sanitizeInput } from '@/lib/validation';
import Stripe from 'stripe';

const COOKIE_CAKE_PRICING: Record<string, Record<string, { price: number; servings: string }>> = {
  '6-inch': {
    '1': { price: 2500, servings: '2-4' },
    '2': { price: 5000, servings: '6-8' },
  },
  '8-inch': {
    '1': { price: 4000, servings: '6-8' },
    '2': { price: 8000, servings: '10-14' },
  },
  '10-inch': {
    '1': { price: 5500, servings: '10-14' },
    '2': { price: 11000, servings: '16-20' },
  },
};

const COOKIE_CAKE_ADD_ONS: Record<string, number> = {
  'chocolate-molds': 400,
  'edible-glitter': 200,
  sprinkles: 400,
  other: 400,
};

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function toTitleCase(value: string): string {
  return value.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = rateLimit(request, 'order-form', RATE_LIMITS.publicForm);
    if (rateLimitResponse) return rateLimitResponse;

    const data = await request.formData();
    const productType = (data.get('product_type') as string) || 'cookie_cups';
    const name = (data.get('name') as string) || '';
    const email = (data.get('email') as string) || '';
    const phone = (data.get('phone') as string) || '';
    const pickupDate = (data.get('pickup_date') as string) || '';
    const pickupTime = (data.get('pickup_time') as string) || '';
    const eventType = (data.get('event_type') as string) || '';
    const allergies = (data.get('allergies') as string) || '';
    const howDidYouHear = (data.get('how_did_you_hear') as string) || '';
    const notes = (data.get('notes') as string) || '';

    if (!name.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    if (!phone.trim()) return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
    if (!pickupDate || !pickupTime) {
      return NextResponse.json({ error: 'Pickup date and time are required' }, { status: 400 });
    }
    if (!eventType) return NextResponse.json({ error: 'Event type is required' }, { status: 400 });

    const inspirationImages = data.getAll('inspiration_images') as File[];
    const validImages = inspirationImages.filter((file) => file && file.size > 0);
    const imageUrls = await uploadInspirationImages(validImages, productType === 'cookie_cake' || productType === 'cookie_cups_and_cake' ? 'cookie-cake' : 'cookie-cups');

    const includesCookieCake = productType === 'cookie_cake' || productType === 'cookie_cups_and_cake';
    const includesCookieCups = productType === 'cookie_cups' || productType === 'cookie_cups_and_cake';

    let orderNumber = '';
    let totalAmount = 0;
    let formData: Record<string, unknown> = {};
    let emailTitle = '';
    let detailLines: string[] = [];
    const quantity = (data.get('quantity') as string) || '';
    const chocolateMolds = data.get('chocolate_molds') === 'true';
    const edibleGlitter = data.get('edible_glitter') === 'true';
    const colors = (data.get('colors') as string) || '';
    const size = (data.get('size') as string) || '';
    const shape = (data.get('shape') as string) || '';
    const layers = (data.get('layers') as string) || '';
    const baseColor = (data.get('base_color') as string) || '';
    const pipingColors = (data.get('piping_colors') as string) || '';
    const customMessaging = (data.get('custom_messaging') as string) || '';
    const messageStyle = (data.get('message_style') as string) || '';
    const designDetails = (data.get('design_details') as string) || '';
    const toppings = JSON.parse(((data.get('toppings') as string) || '[]')) as string[];

    let cookieCupsTotal = 0;
    let cookieCakeTotal = 0;
    let cookieCakeServings = '';

    if (!includesCookieCake && !includesCookieCups) {
      return NextResponse.json({ error: 'Please choose cookie cups, a cookie cake, or both' }, { status: 400 });
    }

    if (includesCookieCups) {
      if (!['12', '24', '36', '48'].includes(quantity)) {
        return NextResponse.json({ error: 'Please select a valid cookie cup quantity' }, { status: 400 });
      }

      const dozensCount = parseInt(quantity, 10) / 12;
      cookieCupsTotal = (dozensCount * 3000) + (chocolateMolds ? dozensCount * 400 : 0) + (edibleGlitter ? dozensCount * 200 : 0);
    }

    if (includesCookieCake) {
      const pricing = COOKIE_CAKE_PRICING[size]?.[layers];
      if (!pricing) {
        return NextResponse.json({ error: 'Please choose a valid cookie cake size and layer count' }, { status: 400 });
      }
      if (!['round', 'heart'].includes(shape) || (size === '10-inch' && shape !== 'round')) {
        return NextResponse.json({ error: 'Please choose a valid cookie cake shape' }, { status: 400 });
      }

      cookieCakeServings = pricing.servings;
      cookieCakeTotal = pricing.price + toppings.reduce((sum, topping) => sum + (COOKIE_CAKE_ADD_ONS[topping] || 0), 0);
    }

    totalAmount = cookieCupsTotal + cookieCakeTotal;

    if (productType === 'cookie_cups_and_cake') {
      orderNumber = `CCB-${Date.now().toString(36).toUpperCase()}`;
      formData = {
        product_type: 'cookie_cups_and_cake',
        event_type: eventType,
        quantity: parseInt(quantity, 10),
        chocolate_molds: chocolateMolds,
        edible_glitter: edibleGlitter,
        colors: sanitizeInput(colors),
        size,
        shape,
        layers,
        servings: cookieCakeServings,
        flavor: 'chocolate-chip',
        base_color: sanitizeInput(baseColor),
        piping_colors: sanitizeInput(pipingColors),
        custom_messaging: sanitizeInput(customMessaging),
        message_style: messageStyle,
        toppings,
        design_details: sanitizeInput(designDetails),
        allergies: sanitizeInput(allergies),
        how_did_you_hear: sanitizeInput(howDidYouHear),
        inspiration_image_count: validImages.length,
        inspiration_image_urls: imageUrls,
      };
      emailTitle = 'New Cookie Cups + Cake Inquiry';
      detailLines = [
        `Order Number: ${orderNumber}`,
        `Amount: ${formatPrice(totalAmount)}`,
        '',
        `Customer: ${sanitizeInput(name)}`,
        `Email: ${sanitizeInput(email)}`,
        `Phone: ${sanitizeInput(phone)}`,
        '',
        `Pickup: ${pickupDate} at ${pickupTime}`,
        `Event Type: ${toTitleCase(eventType)}`,
        '',
        'Cookie Cups:',
        `Quantity: ${quantity} cookie cups`,
        `Chocolate Molds: ${chocolateMolds ? 'Yes' : 'No'}`,
        `Edible Glitter: ${edibleGlitter ? 'Yes' : 'No'}`,
        `Colors: ${sanitizeInput(colors) || 'Not specified'}`,
        `Cookie Cup Total: ${formatPrice(cookieCupsTotal)}`,
        '',
        'Cookie Cake:',
        `Size: ${size}`,
        `Shape: ${toTitleCase(shape)}`,
        `Layers: ${layers}`,
        `Servings: ${cookieCakeServings}`,
        'Flavor: Chocolate Chip',
        `Base Color: ${sanitizeInput(baseColor) || 'Not specified'}`,
        `Piping Colors: ${sanitizeInput(pipingColors) || 'Not specified'}`,
        `Message: ${sanitizeInput(customMessaging) || 'N/A'}`,
        `Message Style: ${messageStyle ? toTitleCase(messageStyle) : 'Not specified'}`,
        `Add-Ons: ${toppings.length > 0 ? toppings.map(toTitleCase).join(', ') : 'None'}`,
        `Cookie Cake Total: ${formatPrice(cookieCakeTotal)}`,
        '',
        `Design Details: ${sanitizeInput(designDetails) || 'None'}`,
        `Allergies: ${sanitizeInput(allergies) || 'None'}`,
        `How They Heard About Me: ${sanitizeInput(howDidYouHear) || 'Not specified'}`,
        `Inspiration Images: ${validImages.length}`,
      ];
    } else if (productType === 'cookie_cake') {
      orderNumber = `CKE-${Date.now().toString(36).toUpperCase()}`;
      formData = {
        product_type: 'cookie_cake',
        event_type: eventType,
        size,
        shape,
        layers,
        servings: cookieCakeServings,
        flavor: 'chocolate-chip',
        base_color: sanitizeInput(baseColor),
        piping_colors: sanitizeInput(pipingColors),
        custom_messaging: sanitizeInput(customMessaging),
        message_style: messageStyle,
        toppings,
        design_details: sanitizeInput(designDetails),
        allergies: sanitizeInput(allergies),
        how_did_you_hear: sanitizeInput(howDidYouHear),
        inspiration_image_count: validImages.length,
        inspiration_image_urls: imageUrls,
      };
      emailTitle = 'New Cookie Cake Inquiry';
      detailLines = [
        `Order Number: ${orderNumber}`,
        `Amount: ${formatPrice(totalAmount)}`,
        '',
        `Customer: ${sanitizeInput(name)}`,
        `Email: ${sanitizeInput(email)}`,
        `Phone: ${sanitizeInput(phone)}`,
        '',
        `Pickup: ${pickupDate} at ${pickupTime}`,
        `Event Type: ${toTitleCase(eventType)}`,
        `Size: ${size}`,
        `Shape: ${toTitleCase(shape)}`,
        `Layers: ${layers}`,
        `Servings: ${cookieCakeServings}`,
        'Flavor: Chocolate Chip',
        `Base Color: ${sanitizeInput(baseColor) || 'Not specified'}`,
        `Piping Colors: ${sanitizeInput(pipingColors) || 'Not specified'}`,
        `Message: ${sanitizeInput(customMessaging) || 'N/A'}`,
        `Message Style: ${messageStyle ? toTitleCase(messageStyle) : 'Not specified'}`,
        `Add-Ons: ${toppings.length > 0 ? toppings.map(toTitleCase).join(', ') : 'None'}`,
        `Design Details: ${sanitizeInput(designDetails) || 'None'}`,
        `Allergies: ${sanitizeInput(allergies) || 'None'}`,
        `How They Heard About Me: ${sanitizeInput(howDidYouHear) || 'Not specified'}`,
        `Inspiration Images: ${validImages.length}`,
      ];
    } else {
      orderNumber = `CUP-${Date.now().toString(36).toUpperCase()}`;
      formData = {
        product_type: 'cookie_cups',
        event_type: eventType,
        quantity: parseInt(quantity, 10),
        chocolate_molds: chocolateMolds,
        edible_glitter: edibleGlitter,
        colors: sanitizeInput(colors),
        design_details: sanitizeInput(designDetails),
        allergies: sanitizeInput(allergies),
        how_did_you_hear: sanitizeInput(howDidYouHear),
        inspiration_image_count: validImages.length,
        inspiration_image_urls: imageUrls,
      };
      emailTitle = 'New Cookie Cups Inquiry';
      detailLines = [
        `Order Number: ${orderNumber}`,
        `Amount: ${formatPrice(totalAmount)}`,
        '',
        `Customer: ${sanitizeInput(name)}`,
        `Email: ${sanitizeInput(email)}`,
        `Phone: ${sanitizeInput(phone)}`,
        '',
        `Pickup: ${pickupDate} at ${pickupTime}`,
        `Event Type: ${toTitleCase(eventType)}`,
        `Quantity: ${quantity} cookie cups`,
        `Chocolate Molds: ${chocolateMolds ? 'Yes' : 'No'}`,
        `Edible Glitter: ${edibleGlitter ? 'Yes' : 'No'}`,
        `Colors: ${sanitizeInput(colors) || 'Not specified'}`,
        `Design Details: ${sanitizeInput(designDetails) || 'None'}`,
        `Allergies: ${sanitizeInput(allergies) || 'None'}`,
        `How They Heard About Me: ${sanitizeInput(howDidYouHear) || 'Not specified'}`,
        `Inspiration Images: ${validImages.length}`,
      ];
    }

    if (notes.trim()) {
      detailLines.push(`Additional Notes: ${sanitizeInput(notes)}`);
    }
    if (imageUrls.length > 0) {
      detailLines.push('', 'Image URLs:', ...imageUrls.map((url) => `- https://bakesbycoral.com${url}`));
    }

    const db = getDB();
    const orderId = crypto.randomUUID();

    await db.prepare(`
      INSERT INTO orders (
        id, order_number, order_type, status, customer_name, customer_email, customer_phone,
        pickup_date, pickup_time, total_amount, deposit_amount, notes, form_data, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      orderId,
      orderNumber,
      'cookie_cups',
      'pending_payment',
      sanitizeInput(name),
      sanitizeInput(email),
      sanitizeInput(phone),
      pickupDate,
      pickupTime,
      totalAmount,
      totalAmount, // full payment upfront
      sanitizeInput(notes),
      JSON.stringify(formData)
    ).run();

    await upsertClientFromOrder(sanitizeInput(name), sanitizeInput(email), sanitizeInput(phone));

    // Send emails (non-blocking)
    const resendApiKey = getEnvVar('bakesbycoral_resend_api_key');
    if (resendApiKey) {
      try {
        const adminEmailSetting = await db.prepare('SELECT value FROM settings WHERE key = ?').bind('admin_email').first<{ value: string }>();
        const recipients = parseAdminEmails(adminEmailSetting?.value);
        sendEmail(resendApiKey, {
          to: recipients,
          subject: `${emailTitle} - ${orderNumber}`,
          html: textToHtmlEmail(detailLines.join('\n'), emailTitle),
          replyTo: email,
        }).catch(err => console.error('Admin email error:', err));

        sendEmail(resendApiKey, {
          to: email,
          subject: `Order Received - ${orderNumber}`,
          html: orderConfirmationEmail({
            customerName: name,
            orderNumber,
            orderType: 'cookie_cups',
            pickupDate: pickupDate || undefined,
            pickupTime: pickupTime || undefined,
            totalAmount: totalAmount,
            formData: formData,
          }),
          replyTo: recipients[0],
        }).catch(err => console.error('Customer email error:', err));
      } catch (emailError) {
        console.error('Cookie cups/cakes email error:', emailError);
      }
    }

    // Create Stripe checkout session
    const stripeKey = getEnvVar('bakesbycoral_stripe_secret_key');
    if (!stripeKey) {
      return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey, { httpClient: Stripe.createFetchHttpClient() });

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    if (includesCookieCups && cookieCupsTotal > 0) {
      const dozensCount = parseInt(quantity, 10) / 12;
      const addOns = [
        chocolateMolds ? 'chocolate molds' : '',
        edibleGlitter ? 'edible glitter' : '',
      ].filter(Boolean).join(', ');
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Cookie Cups (${quantity} ct)`,
            description: `${dozensCount} dozen cookie cups${addOns ? ` with ${addOns}` : ''}`,
          },
          unit_amount: cookieCupsTotal,
        },
        quantity: 1,
      });
    }

    if (includesCookieCake && cookieCakeTotal > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Cookie Cake (${size}, ${layers}-layer)`,
            description: `${toTitleCase(shape)} cookie cake, serves ${cookieCakeServings}${toppings.length > 0 ? ` + ${toppings.map(toTitleCase).join(', ')}` : ''}`,
          },
          unit_amount: cookieCakeTotal,
        },
        quantity: 1,
      });
    }

    const siteUrl = getEnvVar('NEXT_PUBLIC_SITE_URL') || 'https://bakesbycoral.com';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${siteUrl}/order/success?order=${orderNumber}`,
      cancel_url: `${siteUrl}/cookie-cups-cakes?cancelled=true`,
      customer_email: email,
      metadata: {
        order_id: orderId,
        order_number: orderNumber,
        order_type: 'cookie_cups',
      },
    });

    await db.prepare('UPDATE orders SET stripe_session_id = ? WHERE id = ?')
      .bind(session.id, orderId).run();

    return NextResponse.json({
      success: true,
      orderNumber,
      checkoutUrl: session.url,
    });
  } catch (error) {
    console.error('Cookie cups/cakes order error:', error);
    return NextResponse.json({ error: 'Failed to submit inquiry. Please try again.' }, { status: 500 });
  }
}

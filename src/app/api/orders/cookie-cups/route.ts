import { NextRequest, NextResponse } from 'next/server';
import { getDB, getEnvVar, upsertClientFromOrder } from '@/lib/db';
import { sanitizeInput } from '@/lib/validation';
import { sendEmail } from '@/lib/email';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = rateLimit(request, 'order-form', RATE_LIMITS.publicForm);
    if (rateLimitResponse) return rateLimitResponse;

    const formData = await request.formData();

    const name = formData.get('name') as string || '';
    const email = formData.get('email') as string || '';
    const phone = formData.get('phone') as string || '';
    const quantity = formData.get('quantity') as string || '';
    const chocolateMolds = formData.get('chocolate_molds') === 'true';
    const edibleGlitter = formData.get('edible_glitter') === 'true';
    const pickupDate = formData.get('pickup_date') as string || '';
    const pickupTime = formData.get('pickup_time') as string || '';
    const designDetails = formData.get('design_details') as string || '';
    const colors = formData.get('colors') as string || '';
    const occasion = formData.get('occasion') as string || '';
    const allergies = formData.get('allergies') as string || '';
    const howDidYouHear = formData.get('how_did_you_hear') as string || '';
    const notes = formData.get('notes') as string || '';

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
    if (!quantity || !['12', '24', '36', '48'].includes(quantity)) {
      return NextResponse.json({ error: 'Please select a valid quantity' }, { status: 400 });
    }

    const db = getDB();

    // Count inspiration images
    const inspirationImages = formData.getAll('inspiration_images') as File[];
    const imageCount = inspirationImages.filter(f => f && f.size > 0).length;

    // Calculate pricing
    const dozensCount = parseInt(quantity) / 12;
    const basePrice = dozensCount * 3000;
    const moldPrice = chocolateMolds ? (dozensCount * 400) : 0;
    const glitterPrice = edibleGlitter ? (dozensCount * 200) : 0;
    const total = basePrice + moldPrice + glitterPrice;

    // Create inquiry in database
    const orderId = crypto.randomUUID();
    const orderNumber = `CUP-${Date.now().toString(36).toUpperCase()}`;

    await db.prepare(`
      INSERT INTO orders (
        id, order_number, order_type, status, customer_name, customer_email, customer_phone,
        pickup_date, pickup_time, total_cents, notes, form_data, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      orderId,
      orderNumber,
      'cookie_cups',
      'inquiry',
      sanitizeInput(name),
      sanitizeInput(email),
      sanitizeInput(phone),
      pickupDate || null,
      pickupTime || null,
      total,
      sanitizeInput(notes),
      JSON.stringify({
        quantity: parseInt(quantity),
        chocolate_molds: chocolateMolds,
        edible_glitter: edibleGlitter,
        design_details: sanitizeInput(designDetails),
        colors: sanitizeInput(colors),
        occasion: sanitizeInput(occasion),
        allergies: sanitizeInput(allergies),
        how_did_you_hear: sanitizeInput(howDidYouHear),
        inspiration_image_count: imageCount,
      })
    ).run();

    // Auto-add customer to clients list
    await upsertClientFromOrder(sanitizeInput(name), sanitizeInput(email), sanitizeInput(phone));

    // Send email notification with attachments
    const resendApiKey = getEnvVar('bakesbycoral_resend_api_key');
    if (resendApiKey) {
      try {
        const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`;

        // Convert images to base64 attachments
        const attachments = [];
        for (let i = 0; i < inspirationImages.length; i++) {
          const file = inspirationImages[i];
          if (file && file.size > 0) {
            const buffer = await file.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');
            attachments.push({
              filename: file.name || `inspiration-${i + 1}.jpg`,
              content: base64,
            });
          }
        }

        await sendEmail(resendApiKey, {
          to: 'coral@bakesbycoral.com',
          subject: `New Cookie Cups Order: ${orderNumber}`,
          html: `
            <h2>New Cookie Cups Order!</h2>
            <p><strong>Order Number:</strong> ${orderNumber}</p>

            <h3>Customer</h3>
            <p>
              <strong>Name:</strong> ${sanitizeInput(name)}<br>
              <strong>Email:</strong> ${sanitizeInput(email)}<br>
              <strong>Phone:</strong> ${sanitizeInput(phone)}
            </p>

            <h3>Order Details</h3>
            <p>
              <strong>Quantity:</strong> ${quantity} cookie cups<br>
              <strong>Chocolate Molds:</strong> ${chocolateMolds ? 'Yes (+$4/dz)' : 'No'}<br>
              <strong>Edible Glitter:</strong> ${edibleGlitter ? 'Yes (+$2/dz)' : 'No'}<br>
              <strong>Total:</strong> ${formatPrice(total)}
            </p>

            <h3>Customization</h3>
            <p>
              <strong>Occasion:</strong> ${occasion || 'Not specified'}<br>
              <strong>Colors:</strong> ${colors || 'Not specified'}<br>
              <strong>Design Details:</strong> ${designDetails || 'Not specified'}
            </p>

            <h3>Pickup</h3>
            <p>
              <strong>Date:</strong> ${pickupDate || 'Not specified'}<br>
              <strong>Time:</strong> ${pickupTime || 'Not specified'}
            </p>

            ${allergies ? `<p><strong>Allergies:</strong> ${sanitizeInput(allergies)}</p>` : ''}
            ${notes ? `<p><strong>Additional Notes:</strong> ${sanitizeInput(notes)}</p>` : ''}

            <p><strong>Inspiration Images:</strong> ${imageCount > 0 ? `${imageCount} attached` : 'None'}</p>

            <p><a href="https://bakesbycoral.com/admin/orders">View in Admin</a></p>
          `,
          replyTo: email,
          attachments: attachments.length > 0 ? attachments : undefined,
        });
      } catch (emailError) {
        console.error('Email sending error:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      orderNumber,
      message: 'Order submitted successfully'
    });
  } catch (error) {
    console.error('Cookie cups order error:', error);
    return NextResponse.json(
      { error: 'Failed to submit order. Please try again.' },
      { status: 500 }
    );
  }
}




import { NextRequest, NextResponse } from 'next/server';
import { getDB, getEnvVar } from '@/lib/db';
import Stripe from 'stripe';
import { sendEmail, orderConfirmationEmail, adminNewOrderEmail } from '@/lib/email';

async function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<Stripe.Event | null> {
  // For edge runtime, we need to manually verify the webhook signature
  // Stripe's SDK uses Node.js crypto which isn't available in edge
  const encoder = new TextEncoder();

  // Parse the signature header
  const parts = signature.split(',');
  let timestamp = '';
  let v1Signature = '';

  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key === 't') timestamp = value;
    if (key === 'v1') v1Signature = value;
  }

  if (!timestamp || !v1Signature) {
    return null;
  }

  // Check timestamp tolerance (5 minutes)
  const timestampNum = parseInt(timestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestampNum) > 300) {
    return null;
  }

  // Create signed payload
  const signedPayload = `${timestamp}.${payload}`;

  // Compute expected signature
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(signedPayload)
  );

  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Compare signatures (timing-safe comparison)
  if (expectedSignature.length !== v1Signature.length) {
    return null;
  }

  let match = true;
  for (let i = 0; i < expectedSignature.length; i++) {
    if (expectedSignature[i] !== v1Signature[i]) {
      match = false;
    }
  }

  if (!match) {
    return null;
  }

  // Parse and return the event
  try {
    return JSON.parse(payload) as Stripe.Event;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDB();
    

    const payload = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const event = await verifyStripeSignature(
      payload,
      signature,
      getEnvVar('bakesbycoral_stripe_webhook_secret')
    );

    if (!event) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.payment_status === 'paid') {
          const orderId = session.metadata?.order_id;
          const orderNumber = session.metadata?.order_number;

          if (orderId) {
            // Update order status
            await db.prepare(`
              UPDATE orders
              SET status = 'confirmed',
                  stripe_payment_id = ?,
                  paid_at = datetime('now'),
                  updated_at = datetime('now')
              WHERE id = ?
            `).bind(session.payment_intent as string, orderId).run();

            // Fetch order details for emails
            const order = await db.prepare(`
              SELECT order_number, order_type, customer_name, customer_email, customer_phone,
                     pickup_date, pickup_time, form_data
              FROM orders WHERE id = ?
            `).bind(orderId).first<{
              order_number: string;
              order_type: string;
              customer_name: string;
              customer_email: string;
              customer_phone: string;
              pickup_date: string | null;
              pickup_time: string | null;
              form_data: string | null;
            }>();

            if (order && getEnvVar('bakesbycoral_resend_api_key')) {
              // Send confirmation email to customer
              await sendEmail(getEnvVar('bakesbycoral_resend_api_key'), {
                to: order.customer_email,
                subject: `Order Confirmed - ${order.order_number}`,
                html: orderConfirmationEmail({
                  customerName: order.customer_name,
                  orderNumber: order.order_number,
                  orderType: order.order_type,
                  pickupDate: order.pickup_date || undefined,
                  pickupTime: order.pickup_time || undefined,
                }),
                replyTo: 'hello@bakesbycoral.com',
              });

              // Send notification email to admin
              await sendEmail(getEnvVar('bakesbycoral_resend_api_key'), {
                to: 'hello@bakesbycoral.com',
                subject: `New Paid Order - ${order.order_number}`,
                html: adminNewOrderEmail({
                  customerName: order.customer_name,
                  customerEmail: order.customer_email,
                  customerPhone: order.customer_phone,
                  orderNumber: order.order_number,
                  orderType: order.order_type,
                  pickupDate: order.pickup_date || undefined,
                  formData: order.form_data ? JSON.parse(order.form_data) : undefined,
                }),
              });

              console.log(`Order ${orderNumber} confirmed - emails sent`);
            } else {
              console.log(`Order ${orderNumber} confirmed (email not configured)`);
            }
          }
        }
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;

        if (orderId) {
          // Mark order as expired/cancelled
          await db.prepare(`
            UPDATE orders
            SET status = 'cancelled',
                notes = COALESCE(notes, '') || ' | Payment session expired',
                updated_at = datetime('now')
            WHERE id = ? AND status = 'pending_payment'
          `).bind(orderId).run();
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment failed for intent: ${paymentIntent.id}`);
        break;
      }

      case 'invoice.paid': {
        // For custom quotes sent via Stripe Invoices
        const invoice = event.data.object as Stripe.Invoice;
        const orderId = invoice.metadata?.order_id;

        if (orderId) {
          const isDeposit = invoice.metadata?.payment_type === 'deposit';

          await db.prepare(`
            UPDATE orders
            SET status = ?,
                ${isDeposit ? 'deposit_paid_at' : 'paid_at'} = datetime('now'),
                updated_at = datetime('now')
            WHERE id = ?
          `).bind(
            isDeposit ? 'deposit_paid' : 'confirmed',
            orderId
          ).run();

          // Fetch order details for confirmation email
          const order = await db.prepare(`
            SELECT order_number, order_type, customer_name, customer_email, customer_phone,
                   pickup_date, pickup_time, form_data
            FROM orders WHERE id = ?
          `).bind(orderId).first<{
            order_number: string;
            order_type: string;
            customer_name: string;
            customer_email: string;
            customer_phone: string;
            pickup_date: string | null;
            pickup_time: string | null;
            form_data: string | null;
          }>();

          if (order && getEnvVar('bakesbycoral_resend_api_key')) {
            // Send confirmation email to customer
            await sendEmail(getEnvVar('bakesbycoral_resend_api_key'), {
              to: order.customer_email,
              subject: isDeposit
                ? `Deposit Received - ${order.order_number}`
                : `Payment Confirmed - ${order.order_number}`,
              html: orderConfirmationEmail({
                customerName: order.customer_name,
                orderNumber: order.order_number,
                orderType: order.order_type,
                pickupDate: order.pickup_date || undefined,
                pickupTime: order.pickup_time || undefined,
              }),
              replyTo: 'hello@bakesbycoral.com',
            });

            // Send notification email to admin
            await sendEmail(getEnvVar('bakesbycoral_resend_api_key'), {
              to: 'hello@bakesbycoral.com',
              subject: isDeposit
                ? `Deposit Received - ${order.order_number}`
                : `Payment Received - ${order.order_number}`,
              html: adminNewOrderEmail({
                customerName: order.customer_name,
                customerEmail: order.customer_email,
                customerPhone: order.customer_phone,
                orderNumber: order.order_number,
                orderType: order.order_type,
                pickupDate: order.pickup_date || undefined,
                formData: order.form_data ? JSON.parse(order.form_data) : undefined,
              }),
            });
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getDB, getEnvVar } from '@/lib/db';
import Stripe from 'stripe';
import { sendEmail, buildBalanceInvoiceFromTemplate } from '@/lib/email';
import { sendSms, buildSmsMessage, DEFAULT_SMS_TEMPLATES } from '@/lib/sms';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  pickup_date: string | null;
  total_amount: number | null;
  deposit_amount: number | null;
  stripe_invoice_id: string | null;
  form_data: string | null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const db = getDB();

    // Get the order
    const order = await db.prepare(`
      SELECT id, order_number, customer_name, customer_email, customer_phone, pickup_date, total_amount, deposit_amount, stripe_invoice_id, form_data
      FROM orders WHERE id = ?
    `).bind(orderId).first<Order>();

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (!order.total_amount) {
      return NextResponse.json(
        { error: 'Order does not have a total amount set' },
        { status: 400 }
      );
    }

    if (!order.deposit_amount) {
      return NextResponse.json(
        { error: 'Order does not have a deposit amount' },
        { status: 400 }
      );
    }

    const balanceDue = order.total_amount - order.deposit_amount;
    if (balanceDue <= 0) {
      return NextResponse.json(
        { error: 'No balance remaining' },
        { status: 400 }
      );
    }

    // Initialize Stripe
    const stripeKey = getEnvVar('bakesbycoral_stripe_secret_key');
    if (!stripeKey) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeKey, {
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Create or get customer
    const customers = await stripe.customers.list({
      email: order.customer_email,
      limit: 1,
    });

    let customerId: string;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: order.customer_email,
        name: order.customer_name,
        metadata: {
          order_id: order.id,
          order_number: order.order_number,
        },
      });
      customerId = customer.id;
    }

    // Create invoice
    const invoice = await stripe.invoices.create({
      customer: customerId,
      collection_method: 'send_invoice',
      days_until_due: 7,
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
        invoice_type: 'balance',
      },
    });

    // Add invoice item for balance
    await stripe.invoiceItems.create({
      customer: customerId,
      invoice: invoice.id,
      amount: balanceDue,
      currency: 'usd',
      description: `Balance due for order ${order.order_number}`,
    });

    // Finalize and send invoice
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
    await stripe.invoices.sendInvoice(invoice.id);

    // Update order with balance invoice info
    await db.prepare(`
      UPDATE orders
      SET updated_at = datetime("now")
      WHERE id = ?
    `).bind(orderId).run();

    // Send custom branded email notification
    const resendApiKey = getEnvVar('bakesbycoral_resend_api_key');
    if (resendApiKey && finalizedInvoice.hosted_invoice_url) {
      // Parse form_data to check for delivery
      const formData = order.form_data ? JSON.parse(order.form_data) : {};
      const isDelivery = formData.pickup_or_delivery === 'delivery';
      const deliveryAddress = formData.delivery_location || formData.venue_address || formData.event_location || '';

      // Get email template from settings (use delivery version if applicable)
      const emailTemplateKey = isDelivery ? 'email_template_balance_invoice_delivery' : 'email_template_balance_invoice';
      const emailSubjectKey = isDelivery ? 'email_subject_balance_invoice_delivery' : 'email_subject_balance_invoice';

      const balanceTemplate = await db.prepare('SELECT value FROM settings WHERE key = ?')
        .bind(emailTemplateKey)
        .first<{ value: string }>();
      const balanceSubject = await db.prepare('SELECT value FROM settings WHERE key = ?')
        .bind(emailSubjectKey)
        .first<{ value: string }>();

      const balanceEmail = buildBalanceInvoiceFromTemplate(
        balanceTemplate?.value,
        balanceSubject?.value,
        {
          customerName: order.customer_name,
          orderNumber: order.order_number,
          pickupDate: order.pickup_date || '',
          totalAmount: order.total_amount!,
          depositAmount: order.deposit_amount!,
          balanceDue,
          invoiceUrl: finalizedInvoice.hosted_invoice_url,
          isDelivery,
          deliveryAddress,
        }
      );

      await sendEmail(resendApiKey, {
        to: order.customer_email,
        subject: balanceEmail.subject,
        html: balanceEmail.html,
        replyTo: 'hello@bakesbycoral.com',
      });

      // Send SMS notification
      const twilioAccountSid = getEnvVar('bakesbycoral_twilio_account_sid');
      const twilioAuthToken = getEnvVar('bakesbycoral_twilio_auth_token');
      const twilioPhoneNumber = getEnvVar('bakesbycoral_twilio_phone_number');

      if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber && order.customer_phone) {
        try {
          const smsTemplateKey = isDelivery ? 'sms_template_balance_invoice_delivery' : 'sms_template_balance_invoice';
          const smsTemplate = await db.prepare('SELECT value FROM settings WHERE key = ?')
            .bind(smsTemplateKey)
            .first<{ value: string }>();

          const smsBody = buildSmsMessage(
            smsTemplate?.value,
            isDelivery ? DEFAULT_SMS_TEMPLATES.balance_invoice_delivery : DEFAULT_SMS_TEMPLATES.balance_invoice,
            {
              customer_name: order.customer_name,
              order_number: order.order_number,
              balance_due: `$${(balanceDue / 100).toFixed(2)}`,
              payment_url: finalizedInvoice.hosted_invoice_url,
            }
          );

          await sendSms(
            { accountSid: twilioAccountSid, authToken: twilioAuthToken, fromNumber: twilioPhoneNumber },
            { to: order.customer_phone, body: smsBody }
          );
        } catch (smsError) {
          console.error('SMS send error (non-fatal):', smsError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      invoiceId: finalizedInvoice.id,
      invoiceUrl: finalizedInvoice.hosted_invoice_url,
      balanceDue: balanceDue / 100,
    });
  } catch (error) {
    console.error('Error creating balance invoice:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create balance invoice' },
      { status: 500 }
    );
  }
}

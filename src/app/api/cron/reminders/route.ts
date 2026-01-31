import { NextRequest, NextResponse } from 'next/server';
import { getDB, getEnvVar } from '@/lib/db';
import { sendEmail, adminPickupReminderEmail, buildPickupReminderFromTemplate } from '@/lib/email';
import { sendSms, buildSmsMessage, DEFAULT_SMS_TEMPLATES } from '@/lib/sms';

interface OrderForReminder {
  id: string;
  order_number: string;
  order_type: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  pickup_date: string;
  pickup_time: string;
  form_data: string | null;
  reminder_sent_at: string | null;
}

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  const cronSecret = getEnvVar('bakesbycoral_cron_secret');

  // Allow access if no secret is set (for development) or if secret matches
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getDB();
    const resendApiKey = getEnvVar('bakesbycoral_resend_api_key');

    if (!resendApiKey) {
      return NextResponse.json({ error: 'Email not configured' }, { status: 500 });
    }

    // Check if reminders are enabled
    const reminderEnabled = await db.prepare('SELECT value FROM settings WHERE key = ?')
      .bind('reminder_enabled')
      .first<{ value: string }>();

    if (reminderEnabled?.value === 'false') {
      return NextResponse.json({ message: 'Reminders disabled', sent: 0 });
    }

    // Get days before setting (default 1)
    const daysBefore = await db.prepare('SELECT value FROM settings WHERE key = ?')
      .bind('reminder_days_before')
      .first<{ value: string }>();
    const daysBeforePickup = parseInt(daysBefore?.value || '1');

    // Get admin email
    const adminEmailSetting = await db.prepare('SELECT value FROM settings WHERE key = ?')
      .bind('admin_email')
      .first<{ value: string }>();
    const adminEmail = adminEmailSetting?.value || 'hello@bakesbycoral.com';

    // Get email template and subject from settings
    const reminderTemplate = await db.prepare('SELECT value FROM settings WHERE key = ?')
      .bind('email_template_reminder')
      .first<{ value: string }>();
    const reminderSubject = await db.prepare('SELECT value FROM settings WHERE key = ?')
      .bind('email_subject_reminder')
      .first<{ value: string }>();

    // Calculate target pickup date
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysBeforePickup);
    const targetDateStr = targetDate.toISOString().split('T')[0];

    // Find confirmed orders with pickup on target date that haven't received reminders
    const orders = await db.prepare(`
      SELECT id, order_number, order_type, customer_name, customer_email, customer_phone,
             pickup_date, pickup_time, form_data, reminder_sent_at
      FROM orders
      WHERE pickup_date = ?
        AND status IN ('confirmed', 'deposit_paid')
        AND reminder_sent_at IS NULL
    `).bind(targetDateStr).all<OrderForReminder>();

    let sentCount = 0;
    const errors: string[] = [];

    for (const order of orders.results || []) {
      try {
        const formData = order.form_data ? JSON.parse(order.form_data) : {};
        const isDelivery = formData.pickup_or_delivery === 'delivery';
        const deliveryAddress = formData.delivery_location || formData.venue_address || formData.event_location || '';

        // Get appropriate template based on delivery status
        const emailTemplateKey = isDelivery ? 'email_template_reminder_delivery' : 'email_template_reminder';
        const emailSubjectKey = isDelivery ? 'email_subject_reminder_delivery' : 'email_subject_reminder';

        const orderReminderTemplate = await db.prepare('SELECT value FROM settings WHERE key = ?')
          .bind(emailTemplateKey)
          .first<{ value: string }>();
        const orderReminderSubject = await db.prepare('SELECT value FROM settings WHERE key = ?')
          .bind(emailSubjectKey)
          .first<{ value: string }>();

        // Build reminder email from template
        const reminderEmail = buildPickupReminderFromTemplate(
          orderReminderTemplate?.value || reminderTemplate?.value,
          orderReminderSubject?.value || reminderSubject?.value,
          {
            customerName: order.customer_name,
            orderNumber: order.order_number,
            orderType: order.order_type,
            pickupDate: order.pickup_date,
            pickupTime: order.pickup_time,
            formData,
            isDelivery,
            deliveryAddress,
          }
        );

        // Send reminder to customer
        await sendEmail(resendApiKey, {
          to: order.customer_email,
          subject: reminderEmail.subject,
          html: reminderEmail.html,
          replyTo: adminEmail,
        });

        // Send reminder to admin
        await sendEmail(resendApiKey, {
          to: adminEmail,
          subject: isDelivery ? `Delivery Tomorrow - ${order.order_number}` : `Pickup Tomorrow - ${order.order_number}`,
          html: adminPickupReminderEmail({
            customerName: order.customer_name,
            customerEmail: order.customer_email,
            customerPhone: order.customer_phone,
            orderNumber: order.order_number,
            orderType: order.order_type,
            pickupDate: order.pickup_date,
            pickupTime: order.pickup_time,
            formData,
          }),
        });

        // Send SMS reminder
        const twilioAccountSid = getEnvVar('bakesbycoral_twilio_account_sid');
        const twilioAuthToken = getEnvVar('bakesbycoral_twilio_auth_token');
        const twilioPhoneNumber = getEnvVar('bakesbycoral_twilio_phone_number');

        if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber && order.customer_phone) {
          try {
            const smsTemplateKey = isDelivery ? 'sms_template_delivery_reminder' : 'sms_template_pickup_reminder';
            const smsTemplate = await db.prepare('SELECT value FROM settings WHERE key = ?')
              .bind(smsTemplateKey)
              .first<{ value: string }>();

            const dateFormatted = new Date(order.pickup_date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });

            const smsBody = buildSmsMessage(
              smsTemplate?.value,
              isDelivery ? DEFAULT_SMS_TEMPLATES.delivery_reminder : DEFAULT_SMS_TEMPLATES.pickup_reminder,
              {
                customer_name: order.customer_name,
                order_number: order.order_number,
                pickup_date: dateFormatted,
                pickup_time: order.pickup_time || '',
                delivery_date: dateFormatted,
                delivery_time: order.pickup_time || '',
              }
            );

            await sendSms(
              { accountSid: twilioAccountSid, authToken: twilioAuthToken, fromNumber: twilioPhoneNumber },
              { to: order.customer_phone, body: smsBody }
            );
          } catch (smsError) {
            console.error('SMS reminder error (non-fatal):', smsError);
          }
        }

        // Mark reminder as sent
        await db.prepare('UPDATE orders SET reminder_sent_at = datetime(\'now\') WHERE id = ?')
          .bind(order.id)
          .run();

        sentCount++;
        console.log(`Sent reminder for order ${order.order_number}`);
      } catch (error) {
        const errorMsg = `Failed to send reminder for ${order.order_number}: ${error}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    return NextResponse.json({
      message: `Processed ${orders.results?.length || 0} orders`,
      sent: sentCount,
      targetDate: targetDateStr,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Reminder cron error:', error);
    return NextResponse.json(
      { error: 'Failed to process reminders' },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}

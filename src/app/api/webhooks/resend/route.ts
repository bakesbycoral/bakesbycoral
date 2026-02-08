import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

interface ResendWebhookEvent {
  type: string;
  data: {
    email_id?: string;
    to?: string[];
    from?: string;
    subject?: string;
    created_at?: string;
    bounce?: {
      message?: string;
      type?: string;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const event = await request.json() as ResendWebhookEvent;
    const db = getDB();

    const emailTo = event.data.to?.[0];
    if (!emailTo) {
      return NextResponse.json({ received: true });
    }

    const normalizedEmail = emailTo.toLowerCase().trim();

    switch (event.type) {
      case 'email.bounced': {
        // Mark subscriber as bounced
        await db.prepare(`
          UPDATE newsletter_subscribers SET status = 'bounced'
          WHERE email = ? AND status = 'subscribed'
        `).bind(normalizedEmail).run();

        // Update send record if tracking_id matches
        if (event.data.email_id) {
          await db.prepare(`
            UPDATE newsletter_sends SET
              status = 'bounced',
              bounce_type = ?,
              bounce_message = ?
            WHERE tracking_id = ?
          `).bind(
            event.data.bounce?.type || 'hard',
            event.data.bounce?.message || 'Bounced',
            event.data.email_id
          ).run();
        }
        break;
      }

      case 'email.complained': {
        // Mark subscriber as complained
        await db.prepare(`
          UPDATE newsletter_subscribers SET status = 'complained'
          WHERE email = ? AND status = 'subscribed'
        `).bind(normalizedEmail).run();

        if (event.data.email_id) {
          await db.prepare(`
            UPDATE newsletter_sends SET status = 'complained'
            WHERE tracking_id = ?
          `).bind(event.data.email_id).run();
        }
        break;
      }

      case 'email.delivered': {
        if (event.data.email_id) {
          await db.prepare(`
            UPDATE newsletter_sends SET status = 'delivered'
            WHERE tracking_id = ? AND status = 'sent'
          `).bind(event.data.email_id).run();
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Resend webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

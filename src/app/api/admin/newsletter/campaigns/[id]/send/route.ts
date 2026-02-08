import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { getAdminSession } from '@/lib/auth/admin-session';
import { sendEmail } from '@/lib/email';
import { getTenantEmailConfig, formatFromAddress } from '@/lib/email/tenant-email';

interface Subscriber {
  id: string;
  email: string;
  unsubscribe_token: string;
}

interface Campaign {
  id: string;
  tenant_id: string;
  name: string;
  subject: string;
  preview_text: string | null;
  from_name: string | null;
  from_email: string | null;
  reply_to: string | null;
  content: string;
  status: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const db = getDB();

    // Get the campaign
    const campaign = await db.prepare(`
      SELECT * FROM newsletter_campaigns
      WHERE id = ? AND tenant_id = ?
    `).bind(id, session.tenantId).first<Campaign>();

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.status !== 'sending' && campaign.status !== 'draft') {
      return NextResponse.json({ error: 'Campaign cannot be sent in its current status' }, { status: 400 });
    }

    // Get tenant email config
    const emailConfig = await getTenantEmailConfig(session.tenantId);

    // Build from address: campaign-level overrides > tenant config
    const fromName = campaign.from_name || emailConfig.fromName;
    const fromAddress = campaign.from_email || emailConfig.fromAddress;
    const fromString = `${fromName} <${fromAddress}>`;
    const replyTo = campaign.reply_to || emailConfig.replyTo || undefined;

    // Get all subscribed subscribers
    const subscribersResult = await db.prepare(`
      SELECT id, email, unsubscribe_token FROM newsletter_subscribers
      WHERE tenant_id = ? AND status = 'subscribed'
    `).bind(session.tenantId).all<Subscriber>();

    const subscribers = subscribersResult.results || [];

    if (subscribers.length === 0) {
      return NextResponse.json({ error: 'No active subscribers' }, { status: 400 });
    }

    // Mark campaign as sending
    await db.prepare(`
      UPDATE newsletter_campaigns SET
        status = 'sending',
        sent_at = datetime('now'),
        total_recipients = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(subscribers.length, id).run();

    // Determine the base URL for unsubscribe links
    const origin = request.headers.get('origin') || request.nextUrl.origin;

    let sentCount = 0;

    // Send to each subscriber
    for (const subscriber of subscribers) {
      const unsubscribeUrl = `${origin}/api/newsletter/unsubscribe?token=${subscriber.unsubscribe_token}`;

      // Append unsubscribe link to email HTML
      const htmlWithUnsubscribe = `${campaign.content}
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #999;">
            You received this email because you subscribed to our newsletter.
            <br>
            <a href="${unsubscribeUrl}" style="color: #999; text-decoration: underline;">Unsubscribe</a>
          </p>
        </div>`;

      // Create send record
      const sendId = `send_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const trackingId = crypto.randomUUID();

      await db.prepare(`
        INSERT INTO newsletter_sends (id, campaign_id, subscriber_id, status, tracking_id)
        VALUES (?, ?, ?, 'pending', ?)
      `).bind(sendId, id, subscriber.id, trackingId).run();

      // Send the email
      const success = await sendEmail(emailConfig.apiKey, {
        to: subscriber.email,
        subject: campaign.subject,
        html: htmlWithUnsubscribe,
        from: fromString,
        replyTo,
      });

      if (success) {
        sentCount++;
        await db.prepare(`
          UPDATE newsletter_sends SET status = 'sent', sent_at = datetime('now')
          WHERE id = ?
        `).bind(sendId).run();
      } else {
        await db.prepare(`
          UPDATE newsletter_sends SET status = 'bounced', bounce_message = 'Send failed'
          WHERE id = ?
        `).bind(sendId).run();
      }
    }

    // Mark campaign as sent
    await db.prepare(`
      UPDATE newsletter_campaigns SET
        status = 'sent',
        total_sent = ?,
        completed_at = datetime('now'),
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(sentCount, id).run();

    return NextResponse.json({
      success: true,
      totalRecipients: subscribers.length,
      totalSent: sentCount,
    });
  } catch (error) {
    console.error('Campaign send error:', error);
    return NextResponse.json({ error: 'Failed to send campaign' }, { status: 500 });
  }
}

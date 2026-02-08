import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = rateLimit(request, 'newsletter', RATE_LIMITS.newsletter);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json() as {
      email?: string;
      tenantId?: string;
      source?: string;
    };

    const { email, tenantId, source } = body;

    if (!email || !tenantId) {
      return NextResponse.json({ error: 'Email and tenantId are required' }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const db = getDB();

    // Check for existing subscriber
    const existing = await db.prepare(
      'SELECT id, status FROM newsletter_subscribers WHERE tenant_id = ? AND email = ?'
    ).bind(tenantId, normalizedEmail).first<{ id: string; status: string }>();

    if (existing) {
      if (existing.status === 'subscribed') {
        // Already subscribed
        return NextResponse.json({ success: true, message: 'Already subscribed' });
      }

      // Re-subscribe
      const token = crypto.randomUUID();
      await db.prepare(`
        UPDATE newsletter_subscribers
        SET status = 'subscribed', unsubscribed_at = NULL, unsubscribe_token = ?, subscribed_at = datetime('now')
        WHERE id = ?
      `).bind(token, existing.id).run();

      return NextResponse.json({ success: true, message: 'Re-subscribed' });
    }

    // Create new subscriber
    const id = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const unsubscribeToken = crypto.randomUUID();
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('cf-connecting-ip') || '';

    await db.prepare(`
      INSERT INTO newsletter_subscribers (id, tenant_id, email, status, source, ip_address, unsubscribe_token)
      VALUES (?, ?, ?, 'subscribed', ?, ?, ?)
    `).bind(id, tenantId, normalizedEmail, source || 'website', ip, unsubscribeToken).run();

    return NextResponse.json({ success: true, message: 'Subscribed' });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}

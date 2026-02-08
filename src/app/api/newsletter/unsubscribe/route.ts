import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

// GET: one-click unsubscribe via link in email
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/unsubscribe?error=missing-token', request.url));
  }

  const db = getDB();
  const subscriber = await db.prepare(
    'SELECT id, status FROM newsletter_subscribers WHERE unsubscribe_token = ?'
  ).bind(token).first<{ id: string; status: string }>();

  if (!subscriber) {
    return NextResponse.redirect(new URL('/unsubscribe?error=invalid-token', request.url));
  }

  if (subscriber.status !== 'subscribed') {
    return NextResponse.redirect(new URL('/unsubscribe?done=1', request.url));
  }

  await db.prepare(`
    UPDATE newsletter_subscribers
    SET status = 'unsubscribed', unsubscribed_at = datetime('now')
    WHERE id = ?
  `).bind(subscriber.id).run();

  return NextResponse.redirect(new URL('/unsubscribe?done=1', request.url));
}

// POST: unsubscribe via token in request body
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { token?: string };
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const db = getDB();
    const subscriber = await db.prepare(
      'SELECT id, status FROM newsletter_subscribers WHERE unsubscribe_token = ?'
    ).bind(token).first<{ id: string; status: string }>();

    if (!subscriber) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 });
    }

    if (subscriber.status !== 'subscribed') {
      return NextResponse.json({ success: true, message: 'Already unsubscribed' });
    }

    await db.prepare(`
      UPDATE newsletter_subscribers
      SET status = 'unsubscribed', unsubscribed_at = datetime('now')
      WHERE id = ?
    `).bind(subscriber.id).run();

    return NextResponse.json({ success: true, message: 'Unsubscribed' });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDB, getEnvVar } from '@/lib/db';
import { verifySession } from '@/lib/auth/session';
import { sendEmail, quoteEmail } from '@/lib/email';
import type { Quote, QuoteLineItem } from '@/types';

// Verify admin session helper
async function verifyAdmin() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;

  if (!sessionToken) {
    return null;
  }

  const userId = await verifySession(sessionToken, getEnvVar('bakesbycoral_session_secret'));
  if (!userId) {
    return null;
  }

  const db = getDB();
  const user = await db.prepare('SELECT role FROM users WHERE id = ?')
    .bind(userId)
    .first<{ role: string }>();

  if (!user || user.role !== 'admin') {
    return null;
  }

  return userId;
}

// POST /api/admin/quotes/[id]/send - Send quote to customer
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = await verifyAdmin();
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const db = getDB();

    // Get quote with order details
    const quote = await db.prepare(`
      SELECT q.*, o.order_number, o.order_type, o.customer_name, o.customer_email
      FROM quotes q
      JOIN orders o ON q.order_id = o.id
      WHERE q.id = ?
    `).bind(id).first<Quote & {
      order_number: string;
      order_type: string;
      customer_name: string;
      customer_email: string;
    }>();

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    if (quote.status === 'approved' || quote.status === 'converted') {
      return NextResponse.json({ error: 'Quote has already been approved' }, { status: 400 });
    }

    // Get line items
    const lineItemsResult = await db.prepare(`
      SELECT * FROM quote_line_items WHERE quote_id = ? ORDER BY sort_order ASC
    `).bind(id).all<QuoteLineItem>();

    const lineItems = lineItemsResult.results || [];

    if (lineItems.length === 0) {
      return NextResponse.json({ error: 'Quote must have at least one line item' }, { status: 400 });
    }

    // Generate quote URL
    const siteUrl = getEnvVar('NEXT_PUBLIC_SITE_URL') || request.nextUrl.origin;
    const quoteUrl = `${siteUrl}/quote/${quote.approval_token}`;

    // Send email
    const resendApiKey = getEnvVar('bakesbycoral_resend_api_key');
    if (!resendApiKey) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const emailSent = await sendEmail(resendApiKey, {
      to: quote.customer_email,
      subject: `Your Quote from Bakes by Coral - ${quote.quote_number}`,
      html: quoteEmail({
        customerName: quote.customer_name,
        quoteNumber: quote.quote_number,
        orderNumber: quote.order_number,
        orderType: quote.order_type,
        lineItems,
        subtotal: quote.subtotal,
        depositAmount: quote.deposit_amount || 0,
        depositPercentage: quote.deposit_percentage,
        totalAmount: quote.total_amount,
        validUntil: quote.valid_until || '',
        customerMessage: quote.customer_message || '',
        quoteUrl,
      }),
      replyTo: 'hello@bakesbycoral.com',
    });

    if (!emailSent) {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    // Update quote status to sent
    await db.prepare(`
      UPDATE quotes SET status = 'sent', updated_at = datetime('now') WHERE id = ?
    `).bind(id).run();

    return NextResponse.json({
      success: true,
      quoteUrl,
    });
  } catch (error) {
    console.error('Send quote error:', error);
    return NextResponse.json({ error: 'Failed to send quote' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import type { Quote, QuoteLineItem } from '@/types';

// GET /api/quotes/[token] - Public: view quote by approval token
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const db = getDB();

    // Get quote with order details
    const quote = await db.prepare(`
      SELECT q.*, o.order_number, o.order_type, o.customer_name, o.customer_email, o.pickup_date, o.event_date
      FROM quotes q
      JOIN orders o ON q.order_id = o.id
      WHERE q.approval_token = ?
    `).bind(token).first<Quote & {
      order_number: string;
      order_type: string;
      customer_name: string;
      customer_email: string;
      pickup_date: string | null;
      event_date: string | null;
    }>();

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Check if expired
    if (quote.valid_until) {
      const validUntil = new Date(quote.valid_until);
      validUntil.setHours(23, 59, 59, 999); // End of day
      if (new Date() > validUntil && quote.status === 'sent') {
        // Mark as expired
        await db.prepare(`
          UPDATE quotes SET status = 'expired', updated_at = datetime('now') WHERE id = ?
        `).bind(quote.id).run();
        quote.status = 'expired';
      }
    }

    // Get line items
    const lineItemsResult = await db.prepare(`
      SELECT * FROM quote_line_items WHERE quote_id = ? ORDER BY sort_order ASC
    `).bind(quote.id).all<QuoteLineItem>();

    return NextResponse.json({
      quote: {
        id: quote.id,
        quote_number: quote.quote_number,
        status: quote.status,
        subtotal: quote.subtotal,
        deposit_percentage: quote.deposit_percentage,
        deposit_amount: quote.deposit_amount,
        total_amount: quote.total_amount,
        customer_message: quote.customer_message,
        valid_until: quote.valid_until,
        approved_at: quote.approved_at,
        stripe_invoice_url: quote.stripe_invoice_url,
        order_number: quote.order_number,
        order_type: quote.order_type,
        customer_name: quote.customer_name,
        pickup_date: quote.pickup_date,
        event_date: quote.event_date,
        line_items: lineItemsResult.results || [],
      },
    });
  } catch (error) {
    console.error('Get quote by token error:', error);
    return NextResponse.json({ error: 'Failed to get quote' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDB, getEnvVar } from '@/lib/db';
import { verifySession } from '@/lib/auth/session';
import type { Quote, QuoteLineItem } from '@/types';

interface UpdateQuoteRequest {
  deposit_percentage?: number;
  notes?: string;
  customer_message?: string;
  valid_until?: string;
}

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

// GET /api/admin/quotes/[id] - Get a single quote with line items
export async function GET(
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

    const quote = await db.prepare(`
      SELECT q.*, o.order_number as order_order_number, o.customer_name, o.customer_email
      FROM quotes q
      JOIN orders o ON q.order_id = o.id
      WHERE q.id = ?
    `).bind(id).first<Quote & { order_order_number: string; customer_name: string; customer_email: string }>();

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Get line items
    const lineItemsResult = await db.prepare(`
      SELECT * FROM quote_line_items WHERE quote_id = ? ORDER BY sort_order ASC
    `).bind(id).all<QuoteLineItem>();

    return NextResponse.json({
      quote: {
        ...quote,
        line_items: lineItemsResult.results || [],
      },
    });
  } catch (error) {
    console.error('Get quote error:', error);
    return NextResponse.json({ error: 'Failed to get quote' }, { status: 500 });
  }
}

// PUT /api/admin/quotes/[id] - Update a quote
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = await verifyAdmin();
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body: UpdateQuoteRequest = await request.json();
    const db = getDB();

    // Verify quote exists and is still editable
    const quote = await db.prepare('SELECT id, status FROM quotes WHERE id = ?')
      .bind(id)
      .first<{ id: string; status: string }>();

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    if (!['draft', 'sent'].includes(quote.status)) {
      return NextResponse.json({ error: 'Cannot edit quote in this status' }, { status: 400 });
    }

    // Build update query
    const updates: string[] = ['updated_at = datetime(\'now\')'];
    const values: (string | number | null)[] = [];

    if (body.deposit_percentage !== undefined) {
      updates.push('deposit_percentage = ?');
      values.push(body.deposit_percentage);
    }
    if (body.notes !== undefined) {
      updates.push('notes = ?');
      values.push(body.notes || null);
    }
    if (body.customer_message !== undefined) {
      updates.push('customer_message = ?');
      values.push(body.customer_message || null);
    }
    if (body.valid_until !== undefined) {
      updates.push('valid_until = ?');
      values.push(body.valid_until);
    }

    values.push(id);

    await db.prepare(`UPDATE quotes SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();

    // Recalculate totals
    await recalculateQuoteTotals(db, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update quote error:', error);
    return NextResponse.json({ error: 'Failed to update quote' }, { status: 500 });
  }
}

// DELETE /api/admin/quotes/[id] - Delete a quote
export async function DELETE(
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

    // Verify quote exists and is deletable
    const quote = await db.prepare('SELECT id, status FROM quotes WHERE id = ?')
      .bind(id)
      .first<{ id: string; status: string }>();

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    if (['approved', 'converted'].includes(quote.status)) {
      return NextResponse.json({ error: 'Cannot delete approved or converted quotes' }, { status: 400 });
    }

    // Delete line items first (cascade should handle this, but being explicit)
    await db.prepare('DELETE FROM quote_line_items WHERE quote_id = ?').bind(id).run();

    // Delete quote
    await db.prepare('DELETE FROM quotes WHERE id = ?').bind(id).run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete quote error:', error);
    return NextResponse.json({ error: 'Failed to delete quote' }, { status: 500 });
  }
}

// Helper function to recalculate quote totals
async function recalculateQuoteTotals(db: ReturnType<typeof getDB>, quoteId: string) {
  // Get sum of line items
  const result = await db.prepare(`
    SELECT COALESCE(SUM(total_price), 0) as subtotal FROM quote_line_items WHERE quote_id = ?
  `).bind(quoteId).first<{ subtotal: number }>();

  const subtotal = result?.subtotal || 0;

  // Get deposit percentage
  const quote = await db.prepare('SELECT deposit_percentage FROM quotes WHERE id = ?')
    .bind(quoteId)
    .first<{ deposit_percentage: number }>();

  const depositPercentage = quote?.deposit_percentage || 50;
  const depositAmount = Math.round(subtotal * (depositPercentage / 100));

  // Update quote totals
  await db.prepare(`
    UPDATE quotes
    SET subtotal = ?, total_amount = ?, deposit_amount = ?, updated_at = datetime('now')
    WHERE id = ?
  `).bind(subtotal, subtotal, depositAmount, quoteId).run();
}

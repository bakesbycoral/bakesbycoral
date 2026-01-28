import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDB, getEnvVar } from '@/lib/db';
import { verifySession } from '@/lib/auth/session';
import type { QuoteLineItem } from '@/types';

interface CreateLineItemRequest {
  description: string;
  quantity?: number;
  unit_price: number;
  sort_order?: number;
}

interface UpdateLineItemsRequest {
  items: Array<{
    id?: number;
    description: string;
    quantity: number;
    unit_price: number;
    sort_order: number;
  }>;
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

// Helper function to recalculate quote totals
async function recalculateQuoteTotals(db: ReturnType<typeof getDB>, quoteId: string) {
  const result = await db.prepare(`
    SELECT COALESCE(SUM(total_price), 0) as subtotal FROM quote_line_items WHERE quote_id = ?
  `).bind(quoteId).first<{ subtotal: number }>();

  const subtotal = result?.subtotal || 0;

  const quote = await db.prepare('SELECT deposit_percentage FROM quotes WHERE id = ?')
    .bind(quoteId)
    .first<{ deposit_percentage: number }>();

  const depositPercentage = quote?.deposit_percentage || 50;
  const depositAmount = Math.round(subtotal * (depositPercentage / 100));

  await db.prepare(`
    UPDATE quotes
    SET subtotal = ?, total_amount = ?, deposit_amount = ?, updated_at = datetime('now')
    WHERE id = ?
  `).bind(subtotal, subtotal, depositAmount, quoteId).run();
}

// GET /api/admin/quotes/[id]/line-items - Get all line items for a quote
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

    const result = await db.prepare(`
      SELECT * FROM quote_line_items WHERE quote_id = ? ORDER BY sort_order ASC
    `).bind(id).all<QuoteLineItem>();

    return NextResponse.json({ line_items: result.results || [] });
  } catch (error) {
    console.error('Get line items error:', error);
    return NextResponse.json({ error: 'Failed to get line items' }, { status: 500 });
  }
}

// POST /api/admin/quotes/[id]/line-items - Add a line item
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
    const body: CreateLineItemRequest = await request.json();
    const db = getDB();

    // Verify quote exists and is editable
    const quote = await db.prepare('SELECT id, status FROM quotes WHERE id = ?')
      .bind(id)
      .first<{ id: string; status: string }>();

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    if (!['draft', 'sent'].includes(quote.status)) {
      return NextResponse.json({ error: 'Cannot edit quote in this status' }, { status: 400 });
    }

    if (!body.description || body.unit_price === undefined) {
      return NextResponse.json({ error: 'Description and unit price are required' }, { status: 400 });
    }

    const quantity = body.quantity ?? 1;
    const totalPrice = quantity * body.unit_price;

    // Get next sort order if not provided
    let sortOrder = body.sort_order;
    if (sortOrder === undefined) {
      const maxOrder = await db.prepare(`
        SELECT MAX(sort_order) as max_order FROM quote_line_items WHERE quote_id = ?
      `).bind(id).first<{ max_order: number | null }>();
      sortOrder = (maxOrder?.max_order ?? -1) + 1;
    }

    await db.prepare(`
      INSERT INTO quote_line_items (quote_id, description, quantity, unit_price, total_price, sort_order, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(id, body.description, quantity, body.unit_price, totalPrice, sortOrder).run();

    // Recalculate quote totals
    await recalculateQuoteTotals(db, id);

    return NextResponse.json({
      success: true,
      line_item: {
        quote_id: id,
        description: body.description,
        quantity,
        unit_price: body.unit_price,
        total_price: totalPrice,
        sort_order: sortOrder,
      },
    });
  } catch (error) {
    console.error('Create line item error:', error);
    return NextResponse.json({ error: 'Failed to create line item' }, { status: 500 });
  }
}

// PUT /api/admin/quotes/[id]/line-items - Replace all line items (bulk update)
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
    const body: UpdateLineItemsRequest = await request.json();
    const db = getDB();

    // Verify quote exists and is editable
    const quote = await db.prepare('SELECT id, status FROM quotes WHERE id = ?')
      .bind(id)
      .first<{ id: string; status: string }>();

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    if (!['draft', 'sent'].includes(quote.status)) {
      return NextResponse.json({ error: 'Cannot edit quote in this status' }, { status: 400 });
    }

    // Delete existing line items
    await db.prepare('DELETE FROM quote_line_items WHERE quote_id = ?').bind(id).run();

    // Insert new line items
    for (const item of body.items) {
      const totalPrice = item.quantity * item.unit_price;
      await db.prepare(`
        INSERT INTO quote_line_items (quote_id, description, quantity, unit_price, total_price, sort_order, created_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `).bind(id, item.description, item.quantity, item.unit_price, totalPrice, item.sort_order).run();
    }

    // Recalculate quote totals
    await recalculateQuoteTotals(db, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update line items error:', error);
    return NextResponse.json({ error: 'Failed to update line items' }, { status: 500 });
  }
}

// DELETE /api/admin/quotes/[id]/line-items - Delete a specific line item
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
    const { searchParams } = new URL(request.url);
    const lineItemId = searchParams.get('item_id');

    if (!lineItemId) {
      return NextResponse.json({ error: 'Line item ID is required' }, { status: 400 });
    }

    const db = getDB();

    // Verify quote exists and is editable
    const quote = await db.prepare('SELECT id, status FROM quotes WHERE id = ?')
      .bind(id)
      .first<{ id: string; status: string }>();

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    if (!['draft', 'sent'].includes(quote.status)) {
      return NextResponse.json({ error: 'Cannot edit quote in this status' }, { status: 400 });
    }

    await db.prepare('DELETE FROM quote_line_items WHERE id = ? AND quote_id = ?')
      .bind(parseInt(lineItemId), id)
      .run();

    // Recalculate quote totals
    await recalculateQuoteTotals(db, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete line item error:', error);
    return NextResponse.json({ error: 'Failed to delete line item' }, { status: 500 });
  }
}

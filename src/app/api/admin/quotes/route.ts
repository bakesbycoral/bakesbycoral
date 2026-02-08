import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { getAdminSession } from '@/lib/auth/admin-session';
import { getTenantSetting } from '@/lib/db/settings';

interface CreateQuoteRequest {
  order_id: string;
  deposit_percentage?: number;
  notes?: string;
  customer_message?: string;
  valid_days?: number;
}

function generateQuoteNumber(): string {
  return `Q-${Date.now().toString(36).toUpperCase()}`;
}

// GET /api/admin/quotes - List all quotes, optionally filtered by order_id
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');

    const db = getDB();

    let query = `
      SELECT q.*, o.order_number as order_order_number, o.customer_name
      FROM quotes q
      JOIN orders o ON q.order_id = o.id
      WHERE o.tenant_id = ?
    `;
    const bindings: string[] = [session.tenantId];

    if (orderId) {
      query += ` AND q.order_id = ?`;
      bindings.push(orderId);
    }

    query += ` ORDER BY q.created_at DESC`;

    const result = await db.prepare(query).bind(...bindings).all();

    return NextResponse.json({ quotes: result.results || [] });
  } catch (error) {
    console.error('List quotes error:', error);
    return NextResponse.json({ error: 'Failed to list quotes' }, { status: 500 });
  }
}

// POST /api/admin/quotes - Create a new quote
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateQuoteRequest = await request.json();

    if (!body.order_id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const db = getDB();

    // Verify order exists and belongs to this tenant
    const order = await db.prepare('SELECT id, status FROM orders WHERE id = ? AND tenant_id = ?')
      .bind(body.order_id, session.tenantId)
      .first<{ id: string; status: string }>();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Get validity days from tenant settings
    const validityDaysSetting = await getTenantSetting(session.tenantId, 'quote_validity_days');
    const validityDays = body.valid_days ?? (validityDaysSetting ? parseInt(validityDaysSetting) : 7);

    // Calculate valid_until date
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validityDays);

    const quoteId = crypto.randomUUID();
    const quoteNumber = generateQuoteNumber();
    const approvalToken = crypto.randomUUID();

    await db.prepare(`
      INSERT INTO quotes (
        id, order_id, quote_number, status, subtotal, deposit_percentage,
        notes, customer_message, valid_until, approval_token, tenant_id, created_at, updated_at
      ) VALUES (?, ?, ?, 'draft', 0, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      quoteId,
      body.order_id,
      quoteNumber,
      body.deposit_percentage ?? 50,
      body.notes || null,
      body.customer_message || null,
      validUntil.toISOString().split('T')[0],
      approvalToken,
      session.tenantId
    ).run();

    return NextResponse.json({
      success: true,
      quote: {
        id: quoteId,
        quote_number: quoteNumber,
        approval_token: approvalToken,
      },
    });
  } catch (error) {
    console.error('Create quote error:', error);
    return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 });
  }
}

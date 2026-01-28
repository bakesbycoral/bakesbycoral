import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDB, getEnvVar } from '@/lib/db';
import { verifySession } from '@/lib/auth/session';

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

// GET /api/admin/quotes - List all quotes, optionally filtered by order_id
export async function GET(request: NextRequest) {
  try {
    const adminId = await verifyAdmin();
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');

    const db = getDB();

    let query = `
      SELECT q.*, o.order_number as order_order_number, o.customer_name
      FROM quotes q
      JOIN orders o ON q.order_id = o.id
    `;

    if (orderId) {
      query += ` WHERE q.order_id = ?`;
    }

    query += ` ORDER BY q.created_at DESC`;

    const result = orderId
      ? await db.prepare(query).bind(orderId).all()
      : await db.prepare(query).all();

    return NextResponse.json({ quotes: result.results || [] });
  } catch (error) {
    console.error('List quotes error:', error);
    return NextResponse.json({ error: 'Failed to list quotes' }, { status: 500 });
  }
}

// POST /api/admin/quotes - Create a new quote
export async function POST(request: NextRequest) {
  try {
    const adminId = await verifyAdmin();
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateQuoteRequest = await request.json();

    if (!body.order_id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const db = getDB();

    // Verify order exists
    const order = await db.prepare('SELECT id, status FROM orders WHERE id = ?')
      .bind(body.order_id)
      .first<{ id: string; status: string }>();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Get validity days from settings
    const validityDaysSetting = await db.prepare('SELECT value FROM settings WHERE key = ?')
      .bind('quote_validity_days')
      .first<{ value: string }>();
    const validityDays = body.valid_days ?? (validityDaysSetting ? parseInt(validityDaysSetting.value) : 7);

    // Calculate valid_until date
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validityDays);

    const quoteId = crypto.randomUUID();
    const quoteNumber = generateQuoteNumber();
    const approvalToken = crypto.randomUUID();

    await db.prepare(`
      INSERT INTO quotes (
        id, order_id, quote_number, status, subtotal, deposit_percentage,
        notes, customer_message, valid_until, approval_token, created_at, updated_at
      ) VALUES (?, ?, ?, 'draft', 0, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      quoteId,
      body.order_id,
      quoteNumber,
      body.deposit_percentage ?? 50,
      body.notes || null,
      body.customer_message || null,
      validUntil.toISOString().split('T')[0],
      approvalToken
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

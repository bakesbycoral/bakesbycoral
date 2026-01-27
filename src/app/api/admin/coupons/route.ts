import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  current_uses: number;
  valid_from: string | null;
  valid_until: string | null;
  order_types: string | null;
  is_active: number;
  created_at: string;
}

// GET all coupons
export async function GET() {
  try {
    const db = getDB();
    const results = await db.prepare(`
      SELECT * FROM coupons ORDER BY created_at DESC
    `).all<Coupon>();

    return NextResponse.json({ coupons: results.results || [] });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

// POST create new coupon
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      code?: string;
      description?: string;
      discount_type?: 'percentage' | 'fixed';
      discount_value?: number;
      min_order_amount?: number;
      max_uses?: number | null;
      valid_from?: string | null;
      valid_until?: string | null;
      order_types?: string[] | null;
    };

    const { code, description, discount_type, discount_value, min_order_amount, max_uses, valid_from, valid_until, order_types } = body;

    if (!code || !discount_type || discount_value === undefined) {
      return NextResponse.json({ error: 'Code, discount type, and discount value are required' }, { status: 400 });
    }

    const db = getDB();
    const id = `coupon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    await db.prepare(`
      INSERT INTO coupons (id, code, description, discount_type, discount_value, min_order_amount, max_uses, valid_from, valid_until, order_types)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      code.toUpperCase().trim(),
      description || null,
      discount_type,
      discount_value,
      min_order_amount || 0,
      max_uses || null,
      valid_from || null,
      valid_until || null,
      order_types ? JSON.stringify(order_types) : null
    ).run();

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error creating coupon:', error);
    if (String(error).includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'A coupon with this code already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}

// DELETE a coupon
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 });
    }

    const db = getDB();
    await db.prepare('DELETE FROM coupons WHERE id = ?').bind(id).run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
}

// PATCH toggle coupon active status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json() as { id?: string; is_active?: boolean };
    const { id, is_active } = body;

    if (!id || is_active === undefined) {
      return NextResponse.json({ error: 'Coupon ID and active status are required' }, { status: 400 });
    }

    const db = getDB();
    await db.prepare('UPDATE coupons SET is_active = ?, updated_at = datetime("now") WHERE id = ?')
      .bind(is_active ? 1 : 0, id)
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating coupon:', error);
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
  }
}

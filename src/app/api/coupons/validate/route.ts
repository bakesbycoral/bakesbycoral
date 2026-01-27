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
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { code?: string; orderType?: string };
    const { code, orderType } = body;

    if (!code) {
      return NextResponse.json({ valid: false, error: 'Coupon code is required' }, { status: 400 });
    }

    const db = getDB();

    const coupon = await db.prepare(`
      SELECT * FROM coupons WHERE code = ? COLLATE NOCASE AND is_active = 1
    `).bind(code.trim()).first<Coupon>();

    if (!coupon) {
      return NextResponse.json({ valid: false, error: 'Invalid coupon code' });
    }

    // Check if coupon has reached max uses
    if (coupon.max_uses !== null && coupon.current_uses >= coupon.max_uses) {
      return NextResponse.json({ valid: false, error: 'This coupon has reached its usage limit' });
    }

    // Check valid date range
    const now = new Date().toISOString().split('T')[0];
    if (coupon.valid_from && now < coupon.valid_from) {
      return NextResponse.json({ valid: false, error: 'This coupon is not yet active' });
    }
    if (coupon.valid_until && now > coupon.valid_until) {
      return NextResponse.json({ valid: false, error: 'This coupon has expired' });
    }

    // Check order type restriction
    if (coupon.order_types && orderType) {
      try {
        const allowedTypes = JSON.parse(coupon.order_types) as string[];
        if (!allowedTypes.includes(orderType)) {
          return NextResponse.json({
            valid: false,
            error: 'This coupon is not valid for this order type'
          });
        }
      } catch {
        // If JSON parsing fails, ignore the restriction
      }
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value,
        minOrderAmount: coupon.min_order_amount,
      }
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json({ valid: false, error: 'Failed to validate coupon' }, { status: 500 });
  }
}

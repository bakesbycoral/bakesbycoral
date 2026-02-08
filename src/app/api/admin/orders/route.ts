import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { getAdminSession } from '@/lib/auth/admin-session';

interface CreateOrderRequest {
  order_type?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  pickup_date?: string;
  pickup_time?: string;
  total_amount?: number;
  notes?: string;
}

function generateOrderNumber(tenantId: string): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const prefix = tenantId === 'leango' ? 'LG' : 'BC';
  return `${prefix}${year}${month}${day}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as CreateOrderRequest;
    const {
      order_type,
      customer_name,
      customer_email,
      customer_phone,
      pickup_date,
      pickup_time,
      total_amount,
      notes,
    } = body;

    // Validate required fields
    if (!order_type || !customer_name || !customer_email || !customer_phone || !pickup_date || !pickup_time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate order type
    const validTypes = ['cookies', 'cookies_large', 'cake', 'wedding'];
    if (!validTypes.includes(order_type)) {
      return NextResponse.json({ error: 'Invalid order type' }, { status: 400 });
    }

    const db = getDB();
    const id = crypto.randomUUID();
    const orderNumber = generateOrderNumber(session.tenantId);

    // Calculate deposit amount (50% for large orders/cake/wedding, 100% for regular cookies)
    let depositAmount = null;
    if (total_amount) {
      if (order_type === 'cookies') {
        depositAmount = total_amount; // 100% for small cookie orders
      } else {
        depositAmount = Math.round(total_amount * 0.5); // 50% for others
      }
    }

    await db.prepare(`
      INSERT INTO orders (
        id, order_number, order_type, status, customer_name, customer_email, customer_phone,
        pickup_date, pickup_time, total_amount, deposit_amount, notes, form_data, tenant_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      id,
      orderNumber,
      order_type,
      total_amount ? 'pending_payment' : 'inquiry',
      customer_name,
      customer_email,
      customer_phone,
      pickup_date,
      pickup_time,
      total_amount || null,
      depositAmount,
      notes || null,
      JSON.stringify({ manually_created: true }),
      session.tenantId
    ).run();

    return NextResponse.json({ id, order_number: orderNumber });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

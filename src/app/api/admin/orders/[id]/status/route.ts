import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { getAdminSession } from '@/lib/auth/admin-session';

interface StatusUpdateRequest {
  status: string;
  totalAmount?: number;
}

const validStatuses = ['inquiry', 'pending_payment', 'deposit_paid', 'confirmed', 'completed', 'cancelled'];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const db = getDB();

    const { status, totalAmount }: StatusUpdateRequest = await request.json();

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Get current order (with tenant check)
    const order = await db.prepare('SELECT * FROM orders WHERE id = ? AND tenant_id = ?')
      .bind(id, session.tenantId)
      .first<{ status: string; order_type: string }>();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update order
    let updateQuery = `
      UPDATE orders
      SET status = ?, updated_at = datetime('now')
    `;
    const bindings: (string | number)[] = [status];

    // If moving to pending_payment with a quote amount
    if (status === 'pending_payment' && totalAmount) {
      updateQuery += `, total_amount = ?, deposit_amount = ?`;
      // For large orders and weddings, deposit is 50%
      const depositAmount = ['cookies_large', 'cake', 'wedding'].includes(order.order_type)
        ? Math.round(totalAmount / 2)
        : totalAmount;
      bindings.push(totalAmount, depositAmount);
    }

    // If marking as completed
    if (status === 'completed') {
      updateQuery += `, completed_at = datetime('now')`;
    }

    updateQuery += ` WHERE id = ? AND tenant_id = ?`;
    bindings.push(id, session.tenantId);

    await db.prepare(updateQuery).bind(...bindings).run();

    // TODO: Send email notification based on status change
    // - pending_payment: Send quote/payment request
    // - confirmed: Send confirmation
    // - completed: Send thank you

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Status update error:', error);
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
}

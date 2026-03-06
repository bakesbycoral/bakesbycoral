import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { getAdminSession } from '@/lib/auth/admin-session';

interface UpdateOrderBody {
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  pickup_person_name?: string;
  pickup_date?: string;
  pickup_time?: string;
  event_date?: string;
  backup_date?: string;
  backup_time?: string;
  total_amount?: number;
  deposit_amount?: number;
  notes?: string;
  form_data?: Record<string, unknown>;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body: UpdateOrderBody = await request.json();

    const db = getDB();

    // Build dynamic update query
    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    if (body.customer_name !== undefined) {
      updates.push('customer_name = ?');
      values.push(body.customer_name);
    }
    if (body.customer_email !== undefined) {
      updates.push('customer_email = ?');
      values.push(body.customer_email);
    }
    if (body.customer_phone !== undefined) {
      updates.push('customer_phone = ?');
      values.push(body.customer_phone);
    }
    if (body.pickup_person_name !== undefined) {
      updates.push('pickup_person_name = ?');
      values.push(body.pickup_person_name || null);
    }
    if (body.pickup_date !== undefined) {
      updates.push('pickup_date = ?');
      values.push(body.pickup_date || null);
    }
    if (body.pickup_time !== undefined) {
      updates.push('pickup_time = ?');
      values.push(body.pickup_time || null);
    }
    if (body.event_date !== undefined) {
      updates.push('event_date = ?');
      values.push(body.event_date || null);
    }
    if (body.backup_date !== undefined) {
      updates.push('backup_date = ?');
      values.push(body.backup_date || null);
    }
    if (body.backup_time !== undefined) {
      updates.push('backup_time = ?');
      values.push(body.backup_time || null);
    }
    if (body.total_amount !== undefined) {
      updates.push('total_amount = ?');
      values.push(body.total_amount);
    }
    if (body.deposit_amount !== undefined) {
      updates.push('deposit_amount = ?');
      values.push(body.deposit_amount);
    }
    if (body.notes !== undefined) {
      updates.push('notes = ?');
      values.push(body.notes || null);
    }
    if (body.form_data !== undefined) {
      updates.push('form_data = ?');
      values.push(JSON.stringify(body.form_data));
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Add updated_at
    updates.push('updated_at = ?');
    values.push(new Date().toISOString());

    // Add the id and tenant_id for the WHERE clause
    values.push(id);
    values.push(session.tenantId);

    const query = `UPDATE orders SET ${updates.join(', ')} WHERE id = ? AND tenant_id = ?`;
    await db.prepare(query).bind(...values).run();

    // Fetch the updated order
    const updatedOrder = await db.prepare('SELECT * FROM orders WHERE id = ? AND tenant_id = ?')
      .bind(id, session.tenantId)
      .first();

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

export async function GET(
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

    const order = await db.prepare('SELECT * FROM orders WHERE id = ? AND tenant_id = ?')
      .bind(id, session.tenantId)
      .first();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { error: 'Failed to get order' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // First check if order exists for this tenant
    const order = await db.prepare('SELECT id FROM orders WHERE id = ? AND tenant_id = ?')
      .bind(id, session.tenantId)
      .first();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Delete related notes first
    await db.prepare('DELETE FROM order_notes WHERE order_id = ?').bind(id).run();

    // Delete the order
    await db.prepare('DELETE FROM orders WHERE id = ? AND tenant_id = ?')
      .bind(id, session.tenantId)
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete order error:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}

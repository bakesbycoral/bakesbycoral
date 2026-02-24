import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { getAdminSession } from '@/lib/auth/admin-session';
import type { Contract } from '@/types';

interface UpdateContractRequest {
  event_date?: string;
  venue_name?: string;
  venue_address?: string;
  guest_count?: string;
  ceremony_time?: string;
  reception_time?: string;
  services_description?: string;
  total_amount?: number;
  deposit_percentage?: number;
  payment_schedule?: string;
  contract_body?: string;
  notes?: string;
  valid_until?: string;
}

// GET /api/admin/contracts/[id] - Get a single contract
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

    const contract = await db.prepare(`
      SELECT c.*, o.order_number as order_order_number, o.customer_name, o.customer_email
      FROM contracts c
      JOIN orders o ON c.order_id = o.id
      WHERE c.id = ? AND c.tenant_id = ?
    `).bind(id, session.tenantId).first<Contract & { order_order_number: string; customer_name: string; customer_email: string }>();

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    return NextResponse.json({ contract });
  } catch (error) {
    console.error('Get contract error:', error);
    return NextResponse.json({ error: 'Failed to get contract' }, { status: 500 });
  }
}

// PUT /api/admin/contracts/[id] - Update a contract
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
    const body: UpdateContractRequest = await request.json();
    const db = getDB();

    // Verify contract exists and is still editable
    const contract = await db.prepare('SELECT id, status FROM contracts WHERE id = ? AND tenant_id = ?')
      .bind(id, session.tenantId)
      .first<{ id: string; status: string }>();

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    if (!['draft', 'sent'].includes(contract.status)) {
      return NextResponse.json({ error: 'Cannot edit contract in this status' }, { status: 400 });
    }

    // Build update query
    const updates: string[] = ["updated_at = datetime('now')"];
    const values: (string | number | null)[] = [];

    const fields: Array<{ key: keyof UpdateContractRequest; column: string }> = [
      { key: 'event_date', column: 'event_date' },
      { key: 'venue_name', column: 'venue_name' },
      { key: 'venue_address', column: 'venue_address' },
      { key: 'guest_count', column: 'guest_count' },
      { key: 'ceremony_time', column: 'ceremony_time' },
      { key: 'reception_time', column: 'reception_time' },
      { key: 'services_description', column: 'services_description' },
      { key: 'total_amount', column: 'total_amount' },
      { key: 'deposit_percentage', column: 'deposit_percentage' },
      { key: 'payment_schedule', column: 'payment_schedule' },
      { key: 'contract_body', column: 'contract_body' },
      { key: 'notes', column: 'notes' },
      { key: 'valid_until', column: 'valid_until' },
    ];

    for (const field of fields) {
      if (body[field.key] !== undefined) {
        updates.push(`${field.column} = ?`);
        values.push(body[field.key] as string | number | null ?? null);
      }
    }

    // Auto-calculate deposit_amount if total or percentage changed
    const totalAmount = body.total_amount;
    const depositPercentage = body.deposit_percentage;
    if (totalAmount !== undefined || depositPercentage !== undefined) {
      // Get current values for what wasn't provided
      const current = await db.prepare('SELECT total_amount, deposit_percentage FROM contracts WHERE id = ?')
        .bind(id)
        .first<{ total_amount: number; deposit_percentage: number }>();

      const finalTotal = totalAmount ?? current?.total_amount ?? 0;
      const finalPercentage = depositPercentage ?? current?.deposit_percentage ?? 50;
      const depositAmount = Math.round(finalTotal * (finalPercentage / 100));

      updates.push('deposit_amount = ?');
      values.push(depositAmount);
    }

    values.push(id);
    values.push(session.tenantId);

    await db.prepare(`UPDATE contracts SET ${updates.join(', ')} WHERE id = ? AND tenant_id = ?`)
      .bind(...values)
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update contract error:', error);
    return NextResponse.json({ error: 'Failed to update contract' }, { status: 500 });
  }
}

// DELETE /api/admin/contracts/[id] - Delete a draft contract
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

    const contract = await db.prepare('SELECT id, status FROM contracts WHERE id = ? AND tenant_id = ?')
      .bind(id, session.tenantId)
      .first<{ id: string; status: string }>();

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    if (contract.status === 'signed') {
      return NextResponse.json({ error: 'Signed contracts cannot be deleted' }, { status: 400 });
    }

    await db.prepare('DELETE FROM contracts WHERE id = ? AND tenant_id = ?')
      .bind(id, session.tenantId)
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete contract error:', error);
    return NextResponse.json({ error: 'Failed to delete contract' }, { status: 500 });
  }
}

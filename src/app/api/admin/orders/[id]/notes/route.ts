import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { getOrderNotes, addOrderNote } from '@/lib/db/notes';
import { getAdminSession } from '@/lib/auth/admin-session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: orderId } = await params;
    const db = getDB();

    // Verify order belongs to this tenant
    const order = await db.prepare('SELECT id FROM orders WHERE id = ? AND tenant_id = ?')
      .bind(orderId, session.tenantId)
      .first();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const notes = await getOrderNotes(orderId);
    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: orderId } = await params;
    const body = await request.json() as { note?: string };
    const { note } = body;

    if (!note || typeof note !== 'string' || !note.trim()) {
      return NextResponse.json(
        { error: 'Note text is required' },
        { status: 400 }
      );
    }

    // Verify order exists and belongs to this tenant
    const db = getDB();
    const order = await db.prepare('SELECT id FROM orders WHERE id = ? AND tenant_id = ?')
      .bind(orderId, session.tenantId)
      .first();

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const noteId = await addOrderNote(orderId, note.trim());

    // Update order's updated_at timestamp
    await db.prepare('UPDATE orders SET updated_at = datetime("now") WHERE id = ? AND tenant_id = ?')
      .bind(orderId, session.tenantId)
      .run();

    return NextResponse.json({ success: true, noteId });
  } catch (error) {
    console.error('Error adding note:', error);
    return NextResponse.json(
      { error: 'Failed to add note' },
      { status: 500 }
    );
  }
}

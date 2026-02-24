import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { getAdminSession } from '@/lib/auth/admin-session';

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as {
      order?: { id: string; sort_order: number }[];
    };

    if (!Array.isArray(body.order) || body.order.length === 0) {
      return NextResponse.json({ error: 'Invalid order data' }, { status: 400 });
    }

    const db = getDB();

    const statements = body.order.map(({ id, sort_order }) =>
      db.prepare(
        'UPDATE gallery_images SET sort_order = ? WHERE id = ? AND tenant_id = ?'
      ).bind(sort_order, id, session.tenantId)
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.batch(statements as any);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering gallery:', error);
    return NextResponse.json({ error: 'Failed to reorder gallery' }, { status: 500 });
  }
}

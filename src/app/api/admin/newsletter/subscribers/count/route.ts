import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { getAdminSession } from '@/lib/auth/admin-session';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDB();
    const result = await db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'subscribed' THEN 1 ELSE 0 END) as active
      FROM newsletter_subscribers
      WHERE tenant_id = ?
    `).bind(session.tenantId).first<{ total: number; active: number }>();

    return NextResponse.json({
      total: result?.total || 0,
      active: result?.active || 0,
    });
  } catch (error) {
    console.error('Error fetching subscriber count:', error);
    return NextResponse.json({ error: 'Failed to fetch count' }, { status: 500 });
  }
}

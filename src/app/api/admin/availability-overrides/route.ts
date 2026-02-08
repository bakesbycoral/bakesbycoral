import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { getAdminSession } from '@/lib/auth/admin-session';

interface AvailabilityOverride {
  id: string;
  tenant_id: string;
  date: string;
  is_available: number;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
}

// GET availability overrides
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    const db = getDB();
    let query = 'SELECT * FROM availability_overrides WHERE tenant_id = ?';
    const bindings: string[] = [session.tenantId];

    if (startDate && endDate) {
      query += ' AND date >= ? AND date <= ?';
      bindings.push(startDate, endDate);
    } else {
      // Default to showing overrides from today onwards
      query += " AND date >= date('now')";
    }

    query += ' ORDER BY date ASC';

    const results = await db.prepare(query).bind(...bindings).all<AvailabilityOverride>();

    return NextResponse.json({ overrides: results.results || [] });
  } catch (error) {
    console.error('Error fetching availability overrides:', error);
    return NextResponse.json({ error: 'Failed to fetch overrides' }, { status: 500 });
  }
}

// POST create availability override
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as {
      date: string;
      is_available: boolean;
      start_time?: string;
      end_time?: string;
      reason?: string;
    };

    const { date, is_available, start_time, end_time, reason } = body;

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const db = getDB();
    const id = `override_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Delete any existing override for this date first
    await db.prepare('DELETE FROM availability_overrides WHERE tenant_id = ? AND date = ?')
      .bind(session.tenantId, date)
      .run();

    // Insert new override
    await db.prepare(`
      INSERT INTO availability_overrides (id, tenant_id, date, is_available, start_time, end_time, reason)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      session.tenantId,
      date,
      is_available ? 1 : 0,
      start_time || null,
      end_time || null,
      reason?.trim() || null
    ).run();

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error creating availability override:', error);
    return NextResponse.json({ error: 'Failed to create override' }, { status: 500 });
  }
}

// DELETE an availability override
export async function DELETE(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const date = searchParams.get('date');

    if (!id && !date) {
      return NextResponse.json({ error: 'Override ID or date is required' }, { status: 400 });
    }

    const db = getDB();

    if (id) {
      await db.prepare('DELETE FROM availability_overrides WHERE id = ? AND tenant_id = ?')
        .bind(id, session.tenantId)
        .run();
    } else if (date) {
      await db.prepare('DELETE FROM availability_overrides WHERE date = ? AND tenant_id = ?')
        .bind(date, session.tenantId)
        .run();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting availability override:', error);
    return NextResponse.json({ error: 'Failed to delete override' }, { status: 500 });
  }
}

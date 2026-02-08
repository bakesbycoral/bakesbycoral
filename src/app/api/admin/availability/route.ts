import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { getAdminSession } from '@/lib/auth/admin-session';

interface AvailabilityWindow {
  id: string;
  tenant_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: number;
}

// GET availability windows
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDB();
    const results = await db.prepare(`
      SELECT * FROM availability_windows
      WHERE tenant_id = ?
      ORDER BY day_of_week ASC
    `).bind(session.tenantId).all<AvailabilityWindow>();

    return NextResponse.json({ windows: results.results || [] });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
}

// POST create/update availability window
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as {
      day_of_week: number;
      start_time: string;
      end_time: string;
      is_active: boolean;
    };

    const { day_of_week, start_time, end_time, is_active } = body;

    if (day_of_week === undefined || day_of_week < 0 || day_of_week > 6) {
      return NextResponse.json({ error: 'Invalid day of week' }, { status: 400 });
    }

    const db = getDB();
    const id = `avail_${session.tenantId}_${day_of_week}`;

    // Upsert the availability window
    await db.prepare(`
      INSERT INTO availability_windows (id, tenant_id, day_of_week, start_time, end_time, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        start_time = excluded.start_time,
        end_time = excluded.end_time,
        is_active = excluded.is_active
    `).bind(
      id,
      session.tenantId,
      day_of_week,
      start_time || '09:00',
      end_time || '17:00',
      is_active ? 1 : 0
    ).run();

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error saving availability:', error);
    return NextResponse.json({ error: 'Failed to save availability' }, { status: 500 });
  }
}

// PUT bulk update all days
export async function PUT(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as {
      windows: Array<{
        day_of_week: number;
        start_time: string;
        end_time: string;
        is_active: boolean;
      }>;
    };

    const { windows } = body;

    if (!Array.isArray(windows)) {
      return NextResponse.json({ error: 'Invalid windows data' }, { status: 400 });
    }

    const db = getDB();

    // Process each window
    for (const window of windows) {
      const id = `avail_${session.tenantId}_${window.day_of_week}`;

      await db.prepare(`
        INSERT INTO availability_windows (id, tenant_id, day_of_week, start_time, end_time, is_active)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          start_time = excluded.start_time,
          end_time = excluded.end_time,
          is_active = excluded.is_active
      `).bind(
        id,
        session.tenantId,
        window.day_of_week,
        window.start_time || '09:00',
        window.end_time || '17:00',
        window.is_active ? 1 : 0
      ).run();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error bulk updating availability:', error);
    return NextResponse.json({ error: 'Failed to update availability' }, { status: 500 });
  }
}

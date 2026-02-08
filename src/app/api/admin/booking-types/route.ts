import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { getAdminSession } from '@/lib/auth/admin-session';

interface BookingType {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description: string | null;
  duration_minutes: number;
  buffer_after_minutes: number;
  max_bookings_per_day: number | null;
  requires_approval: number;
  confirmation_message: string | null;
  is_active: number;
}

// GET all booking types
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDB();
    const results = await db.prepare(`
      SELECT * FROM booking_types
      WHERE tenant_id = ?
      ORDER BY name ASC
    `).bind(session.tenantId).all<BookingType>();

    return NextResponse.json({ bookingTypes: results.results || [] });
  } catch (error) {
    console.error('Error fetching booking types:', error);
    return NextResponse.json({ error: 'Failed to fetch booking types' }, { status: 500 });
  }
}

// POST create new booking type
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as {
      name?: string;
      slug?: string;
      description?: string;
      duration_minutes?: number;
      buffer_after_minutes?: number;
      max_bookings_per_day?: number | null;
      requires_approval?: boolean;
      confirmation_message?: string;
      is_active?: boolean;
    };

    const { name, description, duration_minutes, buffer_after_minutes, max_bookings_per_day, requires_approval, confirmation_message, is_active } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Generate slug from name
    const slug = body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const db = getDB();
    const id = `bt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    await db.prepare(`
      INSERT INTO booking_types (id, tenant_id, name, slug, description, duration_minutes, buffer_after_minutes, max_bookings_per_day, requires_approval, confirmation_message, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      session.tenantId,
      name.trim(),
      slug,
      description?.trim() || null,
      duration_minutes || 30,
      buffer_after_minutes || 15,
      max_bookings_per_day || null,
      requires_approval ? 1 : 0,
      confirmation_message?.trim() || null,
      is_active !== false ? 1 : 0
    ).run();

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error creating booking type:', error);
    return NextResponse.json({ error: 'Failed to create booking type' }, { status: 500 });
  }
}

// PATCH update booking type
export async function PATCH(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as {
      id?: string;
      name?: string;
      slug?: string;
      description?: string;
      duration_minutes?: number;
      buffer_after_minutes?: number;
      max_bookings_per_day?: number | null;
      requires_approval?: boolean;
      confirmation_message?: string;
      is_active?: boolean;
    };

    const { id, name, description, duration_minutes, buffer_after_minutes, max_bookings_per_day, requires_approval, confirmation_message, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: 'Booking type ID is required' }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Generate slug from name if not provided
    const slug = body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const db = getDB();

    await db.prepare(`
      UPDATE booking_types
      SET name = ?, slug = ?, description = ?, duration_minutes = ?, buffer_after_minutes = ?,
          max_bookings_per_day = ?, requires_approval = ?, confirmation_message = ?, is_active = ?
      WHERE id = ? AND tenant_id = ?
    `).bind(
      name.trim(),
      slug,
      description?.trim() || null,
      duration_minutes || 30,
      buffer_after_minutes || 15,
      max_bookings_per_day || null,
      requires_approval ? 1 : 0,
      confirmation_message?.trim() || null,
      is_active !== false ? 1 : 0,
      id,
      session.tenantId
    ).run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating booking type:', error);
    return NextResponse.json({ error: 'Failed to update booking type' }, { status: 500 });
  }
}

// DELETE a booking type
export async function DELETE(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Booking type ID is required' }, { status: 400 });
    }

    const db = getDB();

    // Check if there are any bookings using this type
    const bookingsCount = await db.prepare(`
      SELECT COUNT(*) as count FROM bookings WHERE booking_type_id = ? AND tenant_id = ?
    `).bind(id, session.tenantId).first<{ count: number }>();

    if (bookingsCount && bookingsCount.count > 0) {
      return NextResponse.json({
        error: 'Cannot delete booking type with existing bookings. Deactivate it instead.'
      }, { status: 400 });
    }

    await db.prepare('DELETE FROM booking_types WHERE id = ? AND tenant_id = ?')
      .bind(id, session.tenantId)
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting booking type:', error);
    return NextResponse.json({ error: 'Failed to delete booking type' }, { status: 500 });
  }
}

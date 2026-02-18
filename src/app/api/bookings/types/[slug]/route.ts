import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const tenant = searchParams.get('tenant') || 'bakesbycoral';

    const db = getDB();
    const bookingType = await db.prepare(`
      SELECT id, name, slug, description, duration_minutes, buffer_after_minutes
      FROM booking_types
      WHERE tenant_id = ? AND slug = ? AND is_active = 1
    `).bind(tenant, slug).first();

    if (!bookingType) {
      return NextResponse.json({ error: 'Booking type not found' }, { status: 404 });
    }

    return NextResponse.json(bookingType);
  } catch (error) {
    console.error('Error fetching booking type:', error);
    return NextResponse.json({ error: 'Failed to fetch booking type' }, { status: 500 });
  }
}

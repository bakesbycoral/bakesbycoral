import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const tenant = searchParams.get('tenant') || 'leango';

    const db = getDB();
    const bookingType = await db.prepare(`
      SELECT id, name, slug, description, duration_minutes, buffer_after_minutes
      FROM booking_types
      WHERE tenant_id = ? AND slug = ? AND is_active = 1
    `).bind(tenant, slug).first();

    if (!bookingType) {
      // Default booking types for LeanGo
      if (tenant === 'leango' && slug === 'consultation') {
        return NextResponse.json({
          id: 'default-consultation',
          name: 'Free Consultation',
          slug: 'consultation',
          description: 'A 60-minute conversation to discuss your challenges and explore how we can help.',
          duration_minutes: 60,
          buffer_after_minutes: 0,
        });
      }
      return NextResponse.json({ error: 'Booking type not found' }, { status: 404 });
    }

    return NextResponse.json(bookingType);
  } catch (error) {
    console.error('Error fetching booking type:', error);
    return NextResponse.json({ error: 'Failed to fetch booking type' }, { status: 500 });
  }
}

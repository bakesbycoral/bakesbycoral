import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

function generateId(): string {
  return crypto.randomUUID();
}

function generateToken(): string {
  return crypto.randomUUID().replace(/-/g, '');
}

interface BookingRequest {
  tenantId?: string;
  bookingTypeId?: string;
  date?: string;
  time?: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as BookingRequest;
    const {
      tenantId,
      bookingTypeId,
      date,
      time,
      name,
      email,
      phone,
      company,
      notes,
    } = body;

    if (!tenantId || !bookingTypeId || !date || !time || !name || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = getDB();

    // Verify booking type exists
    const bookingType = await db.prepare(`
      SELECT id, name, duration_minutes
      FROM booking_types
      WHERE id = ? AND tenant_id = ? AND is_active = 1
    `).bind(bookingTypeId, tenantId).first<{ id: string; name: string; duration_minutes: number }>();

    if (!bookingType) {
      return NextResponse.json({ error: 'Booking type not found' }, { status: 404 });
    }

    // Calculate end time
    const [hour, min] = time.split(':').map(Number);
    const startMinutes = hour * 60 + min;
    const endMinutes = startMinutes + bookingType.duration_minutes;
    const endHour = Math.floor(endMinutes / 60);
    const endMin = endMinutes % 60;
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;

    const startTimeISO = `${date}T${time}:00`;
    const endTimeISO = `${date}T${endTime}:00`;

    // Check for conflicts
    const conflict = await db.prepare(`
      SELECT id FROM bookings
      WHERE tenant_id = ?
        AND booking_type_id = ?
        AND status IN ('pending', 'confirmed')
        AND start_time < ?
        AND end_time > ?
    `).bind(tenantId, bookingTypeId, endTimeISO, startTimeISO).first();

    if (conflict) {
      return NextResponse.json({ error: 'Time slot is no longer available' }, { status: 409 });
    }

    // Create booking
    const id = generateId();
    const confirmationToken = generateToken();
    const cancellationToken = generateToken();

    await db.prepare(`
      INSERT INTO bookings (
        id, tenant_id, booking_type_id, customer_name, customer_email,
        customer_phone, customer_company, start_time, end_time, status,
        notes, confirmation_token, cancellation_token
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, ?, ?)
    `).bind(
      id, tenantId, bookingTypeId, name, email,
      phone || null, company || null, startTimeISO, endTimeISO,
      notes || null, confirmationToken, cancellationToken
    ).run();

    // TODO: Send confirmation email

    return NextResponse.json({
      success: true,
      bookingId: id,
      confirmationToken,
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

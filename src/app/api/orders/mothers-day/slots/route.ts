import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

const MAX_PER_SLOT = 2;

// May 8: 9:00 AM - 1:00 PM (last slot 12:45)
// May 9: 9:00 AM - 2:00 PM (last slot 1:45)
function generateTimeSlots(date: string): { time: string; label: string }[] {
  const endHour = date === '2025-05-08' ? 13 : 14; // 1 PM vs 2 PM
  const slots: { time: string; label: string }[] = [];

  for (let hour = 9; hour < endHour; hour++) {
    for (let min = 0; min < 60; min += 15) {
      const time = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      const label = `${hour12}:${String(min).padStart(2, '0')} ${ampm}`;
      slots.push({ time, label });
    }
  }

  return slots;
}

export async function GET() {
  try {
    const db = getDB();

    // Count bookings per date+time for mothers_day_collection orders
    // Include pending_payment, deposit_paid, and confirmed statuses
    const bookings = await db.prepare(`
      SELECT pickup_date, pickup_time, COUNT(*) as count
      FROM orders
      WHERE order_type = 'mothers_day_collection'
        AND status IN ('pending_payment', 'deposit_paid', 'confirmed')
        AND pickup_date IN ('2025-05-08', '2025-05-09')
        AND pickup_time IS NOT NULL
        AND pickup_time != ''
      GROUP BY pickup_date, pickup_time
    `).all<{ pickup_date: string; pickup_time: string; count: number }>();

    const bookingMap = new Map<string, number>();
    for (const row of bookings.results || []) {
      bookingMap.set(`${row.pickup_date}_${row.pickup_time}`, row.count);
    }

    const result: Record<string, { time: string; label: string; available: boolean }[]> = {};

    for (const date of ['2025-05-08', '2025-05-09']) {
      const timeSlots = generateTimeSlots(date);
      result[date] = timeSlots.map(slot => {
        const booked = bookingMap.get(`${date}_${slot.time}`) || 0;
        return {
          time: slot.time,
          label: slot.label,
          available: booked < MAX_PER_SLOT,
        };
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching Mother\'s Day slots:', error);
    return NextResponse.json({
      '2025-05-08': generateTimeSlots('2025-05-08').map(s => ({ ...s, available: true })),
      '2025-05-09': generateTimeSlots('2025-05-09').map(s => ({ ...s, available: true })),
    });
  }
}

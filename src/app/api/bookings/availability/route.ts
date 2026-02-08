import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

interface AvailabilityWindow {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface BookingType {
  duration_minutes: number;
  buffer_after_minutes: number;
}

interface Booking {
  start_time: string;
  end_time: string;
}

interface Override {
  date: string;
  is_available: number;
  start_time: string | null;
  end_time: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenant = searchParams.get('tenant') || 'leango';
    const typeId = searchParams.get('typeId');
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());

    if (!typeId) {
      return NextResponse.json({ error: 'typeId is required' }, { status: 400 });
    }

    const db = getDB();

    // Get booking type details
    let bookingType = await db.prepare(`
      SELECT duration_minutes, buffer_after_minutes
      FROM booking_types
      WHERE id = ? AND tenant_id = ? AND is_active = 1
    `).bind(typeId, tenant).first<BookingType>();

    // Force 60-minute hourly slots for LeanGo
    if (tenant === 'leango') {
      bookingType = {
        duration_minutes: 60,
        buffer_after_minutes: 0,
      };
    }

    if (!bookingType) {
      return NextResponse.json({ error: 'Booking type not found' }, { status: 404 });
    }

    // Get availability windows
    const windowsResult = await db.prepare(`
      SELECT day_of_week, start_time, end_time
      FROM availability_windows
      WHERE tenant_id = ? AND is_active = 1
    `).bind(tenant).all<AvailabilityWindow>();
    let windows = windowsResult.results;

    // Default availability for LeanGo: Mon-Fri 8am-4pm Eastern (hourly slots)
    if (windows.length === 0 && tenant === 'leango') {
      windows = [
        { day_of_week: 1, start_time: '08:00', end_time: '16:00' }, // Monday
        { day_of_week: 2, start_time: '08:00', end_time: '16:00' }, // Tuesday
        { day_of_week: 3, start_time: '08:00', end_time: '16:00' }, // Wednesday
        { day_of_week: 4, start_time: '08:00', end_time: '16:00' }, // Thursday
        { day_of_week: 5, start_time: '08:00', end_time: '16:00' }, // Friday
      ];
    }

    // Get date overrides for the month
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${(month + 1).toString().padStart(2, '0')}-01`;

    const overridesResult = await db.prepare(`
      SELECT date, is_available, start_time, end_time
      FROM availability_overrides
      WHERE tenant_id = ? AND date >= ? AND date < ?
    `).bind(tenant, startDate, endDate).all<Override>();
    const overrides: Record<string, Override> = {};
    for (const override of overridesResult.results) {
      overrides[override.date] = override;
    }

    // Get existing bookings for the month
    const bookingsResult = await db.prepare(`
      SELECT start_time, end_time
      FROM bookings
      WHERE tenant_id = ?
        AND booking_type_id = ?
        AND status IN ('pending', 'confirmed')
        AND start_time >= ?
        AND start_time < ?
    `).bind(tenant, typeId, startDate, endDate).all<Booking>();
    const bookings = bookingsResult.results;

    // Build availability map
    const dates: Record<string, { time: string; available: boolean }[]> = {};

    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dateKey = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const dayOfWeek = date.getDay();

      // Check if date is in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        dates[dateKey] = [];
        continue;
      }

      // Check for override
      const override = overrides[dateKey];
      if (override && !override.is_available) {
        dates[dateKey] = [];
        continue;
      }

      // Get time range
      let startTime: string | null = null;
      let endTime: string | null = null;

      if (override && override.is_available && override.start_time && override.end_time) {
        startTime = override.start_time;
        endTime = override.end_time;
      } else {
        const window = windows.find(w => w.day_of_week === dayOfWeek);
        if (window) {
          startTime = window.start_time;
          endTime = window.end_time;
        }
      }

      if (!startTime || !endTime) {
        dates[dateKey] = [];
        continue;
      }

      // Generate time slots
      const slots: { time: string; available: boolean }[] = [];
      const slotDuration = bookingType.duration_minutes + bookingType.buffer_after_minutes;

      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);

      let currentMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      while (currentMinutes + bookingType.duration_minutes <= endMinutes) {
        const hour = Math.floor(currentMinutes / 60);
        const min = currentMinutes % 60;
        const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        const slotStart = `${dateKey}T${timeStr}:00`;
        const slotEndMinutes = currentMinutes + bookingType.duration_minutes;
        const slotEndHour = Math.floor(slotEndMinutes / 60);
        const slotEndMin = slotEndMinutes % 60;
        const slotEnd = `${dateKey}T${slotEndHour.toString().padStart(2, '0')}:${slotEndMin.toString().padStart(2, '0')}:00`;

        // Check if slot conflicts with existing booking
        const isBooked = bookings.some(booking => {
          const bookingStart = booking.start_time;
          const bookingEnd = booking.end_time;
          return (slotStart < bookingEnd && slotEnd > bookingStart);
        });

        slots.push({
          time: timeStr,
          available: !isBooked,
        });

        currentMinutes += slotDuration;
      }

      dates[dateKey] = slots;
    }

    return NextResponse.json({ dates });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
}

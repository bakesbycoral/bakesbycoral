


import { NextRequest, NextResponse } from 'next/server';
import { getDB, getEnvVar } from '@/lib/db';

interface PickupHours {
  start: string;
  end: string;
}

interface SlotAvailability {
  date: string;
  time: string;
  available: boolean;
  remaining: number;
}

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function generateTimeSlots(start: string, end: string, intervalMinutes: number = 30): string[] {
  const slots: string[] = [];
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);

  let currentMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  while (currentMinutes < endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const mins = currentMinutes % 60;
    slots.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
    currentMinutes += intervalMinutes;
  }

  return slots;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const orderType = searchParams.get('type') || 'cookies';

    if (!startDate) {
      return NextResponse.json({ error: 'Start date is required' }, { status: 400 });
    }

    const db = getDB();
    

    // Get lead time for this order type
    // Tasting boxes have a fixed 2-week lead time
    let leadTimeDays = 7; // Default
    if (orderType === 'tasting') {
      leadTimeDays = 14; // 2 weeks for tasting boxes
    } else {
      const leadTimeKey =
        orderType === 'cookies' || orderType === 'cookie_cups'
          ? 'lead_time_small_cookie'
          : orderType === 'cookies_large'
            ? 'lead_time_large_cookie'
            : orderType === 'easter_collection'
              ? 'lead_time_small_cookie'
              : `lead_time_${orderType}`;

      const leadTimeSetting = await db.prepare('SELECT value FROM settings WHERE key = ?')
        .bind(leadTimeKey)
        .first<{ value: string }>();
      leadTimeDays = leadTimeSetting ? parseInt(leadTimeSetting.value) : 7;
    }

    // Get default slot capacity
    const capacitySetting = await db.prepare('SELECT value FROM settings WHERE key = ?')
      .bind('default_slot_capacity')
      .first<{ value: string }>();
    const defaultCapacity = capacitySetting ? parseInt(capacitySetting.value) : 2;

    const intervalSetting = await db.prepare('SELECT value FROM settings WHERE key = ?')
      .bind('slot_interval_minutes')
      .first<{ value: string }>();
    const slotIntervalMinutes = intervalSetting ? parseInt(intervalSetting.value) : 30;

    // Calculate minimum allowed date based on lead time
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() + leadTimeDays);
    const minDateStr = minDate.toISOString().split('T')[0];

    // Parse date range (add time to avoid timezone issues)
    const start = new Date(startDate + 'T12:00:00');
    const end = endDate ? new Date(endDate + 'T12:00:00') : new Date(start);
    end.setDate(end.getDate() + 14); // Default to 2 weeks

    // Get blackout dates
    const blackoutDates = await db.prepare(`
      SELECT date FROM blackout_dates
      WHERE date >= ? AND date <= ?
    `).bind(startDate, end.toISOString().split('T')[0]).all<{ date: string }>();

    const blackoutSet = new Set(blackoutDates.results?.map(b => b.date) || []);

    // Get existing orders for the date range
    const existingOrders = await db.prepare(`
      SELECT pickup_date, pickup_time, COUNT(*) as count
      FROM orders
      WHERE pickup_date >= ? AND pickup_date <= ?
        AND status NOT IN ('cancelled', 'pending_payment')
      GROUP BY pickup_date, pickup_time
    `).bind(startDate, end.toISOString().split('T')[0]).all<{
      pickup_date: string;
      pickup_time: string;
      count: number;
    }>();

    const orderCounts: Record<string, Record<string, number>> = {};
    for (const order of existingOrders.results || []) {
      if (!orderCounts[order.pickup_date]) {
        orderCounts[order.pickup_date] = {};
      }
      orderCounts[order.pickup_date][order.pickup_time] = order.count;
    }

    // Get slot-specific capacity overrides from pickup_slots table
    const slotOverrides = await db.prepare(`
      SELECT date, time, capacity FROM pickup_slots
      WHERE date >= ? AND date <= ?
    `).bind(startDate, end.toISOString().split('T')[0]).all<{
      date: string;
      time: string;
      capacity: number;
    }>();

    const slotCapacities: Record<string, Record<string, number>> = {};
    for (const slot of slotOverrides.results || []) {
      if (!slotCapacities[slot.date]) {
        slotCapacities[slot.date] = {};
      }
      slotCapacities[slot.date][slot.time] = slot.capacity;
    }

    // Get pickup hours for each day
    const pickupHoursSettings = await db.prepare(`
      SELECT key, value FROM settings
      WHERE key LIKE 'pickup_hours_%'
    `).all<{ key: string; value: string }>();

    const pickupHours: Record<string, PickupHours> = {};
    for (const setting of pickupHoursSettings.results || []) {
      const day = setting.key.replace('pickup_hours_', '');
      try {
        pickupHours[day] = JSON.parse(setting.value);
      } catch {
        // Invalid JSON, skip
      }
    }

    // Generate available slots
    const slots: SlotAvailability[] = [];
    const current = new Date(start); // Copy the start date

    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      const dayOfWeek = current.getUTCDay(); // Use UTC to match the date string
      const dayName = DAY_NAMES[dayOfWeek];

      // Skip if before minimum date
      if (dateStr < minDateStr) {
        current.setDate(current.getDate() + 1);
        continue;
      }

      // Skip if blackout date
      if (blackoutSet.has(dateStr)) {
        current.setDate(current.getDate() + 1);
        continue;
      }

      // Get hours for this day
      const hours = pickupHours[dayName];
      if (!hours || !hours.start || !hours.end) {
        current.setDate(current.getDate() + 1);
        continue;
      }

      // Generate time slots for this day
      const timeSlots = generateTimeSlots(hours.start, hours.end, slotIntervalMinutes);
      const dayOrderCounts = orderCounts[dateStr] || {};
      const daySlotCapacities = slotCapacities[dateStr] || {};

      for (const time of timeSlots) {
        const booked = dayOrderCounts[time] || 0;
        // Use custom capacity if set, otherwise use default
        const capacity = daySlotCapacities[time] ?? defaultCapacity;
        const remaining = capacity - booked;

        slots.push({
          date: dateStr,
          time,
          available: remaining > 0,
          remaining: Math.max(0, remaining),
        });
      }

      current.setDate(current.getDate() + 1);
    }

    return NextResponse.json({
      slots,
      leadTimeDays,
      minDate: minDateStr,
    });
  } catch (error) {
    console.error('Slots API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available slots' },
      { status: 500 }
    );
  }
}

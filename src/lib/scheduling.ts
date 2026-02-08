import { isBlackoutDate } from './db/blackout';
import {
  getPickupHoursForDay,
  getAllPickupHours,
  getLeadTimes,
  getSlotDurationMinutes,
  type PickupHours,
} from './db/settings';
import type { OrderType } from '@/types';

// Default values used as fallbacks when DB is not available
const DEFAULT_PICKUP_HOURS: Record<number, PickupHours> = {
  0: { start: '09:00', end: '12:00' }, // Sunday
  1: { start: '09:00', end: '19:00' }, // Monday
  2: { start: '09:00', end: '12:00' }, // Tuesday
  3: { start: '09:00', end: '12:00' }, // Wednesday
  4: { start: '09:00', end: '12:00' }, // Thursday
  5: { start: '09:00', end: '19:00' }, // Friday
  6: { start: '09:00', end: '12:00' }, // Saturday
};

const DEFAULT_LEAD_TIMES: Record<OrderType, number> = {
  cookies: 7,
  cookies_large: 14,
  cake: 14,
  wedding: 30,
  tasting: 14,
  cookie_cups: 7,
};

// Generate time slots with configurable duration
export function generateTimeSlots(startHour: string, endHour: string, durationMinutes: number = 30): string[] {
  const slots: string[] = [];
  const [startH, startM] = startHour.split(':').map(Number);
  const [endH, endM] = endHour.split(':').map(Number);

  let currentH = startH;
  let currentM = startM;

  while (currentH < endH || (currentH === endH && currentM < endM)) {
    slots.push(
      `${currentH.toString().padStart(2, '0')}:${currentM.toString().padStart(2, '0')}`
    );
    currentM += durationMinutes;
    if (currentM >= 60) {
      currentH += Math.floor(currentM / 60);
      currentM = currentM % 60;
    }
  }

  return slots;
}

// Get pickup hours for a specific date (from database)
export async function getPickupHours(date: Date): Promise<PickupHours> {
  const dayOfWeek = date.getDay();
  try {
    const hours = await getPickupHoursForDay(dayOfWeek);
    return hours;
  } catch {
    // Fallback to defaults if DB unavailable
    return DEFAULT_PICKUP_HOURS[dayOfWeek] || null;
  }
}

// Synchronous version using preloaded data
export function getPickupHoursSync(date: Date, hoursConfig: Record<number, PickupHours>): PickupHours {
  const dayOfWeek = date.getDay();
  return hoursConfig[dayOfWeek] || null;
}

// Get time slots for a specific date
export async function getTimeSlotsForDate(date: Date): Promise<string[]> {
  const hours = await getPickupHours(date);
  if (!hours) return [];

  const duration = await getSlotDurationMinutes();
  return generateTimeSlots(hours.start, hours.end, duration);
}

// Synchronous version
export function getTimeSlotsForDateSync(
  date: Date,
  hoursConfig: Record<number, PickupHours>,
  durationMinutes: number = 30
): string[] {
  const hours = getPickupHoursSync(date, hoursConfig);
  if (!hours) return [];
  return generateTimeSlots(hours.start, hours.end, durationMinutes);
}

// Get lead time for order type (from database)
export async function getLeadTime(orderType: OrderType): Promise<number> {
  try {
    const leadTimes = await getLeadTimes();
    return leadTimes[orderType] ?? DEFAULT_LEAD_TIMES[orderType];
  } catch {
    return DEFAULT_LEAD_TIMES[orderType];
  }
}

// Synchronous version
export function getLeadTimeSync(orderType: OrderType, leadTimes: Record<string, number>): number {
  return leadTimes[orderType] ?? DEFAULT_LEAD_TIMES[orderType];
}

// Get minimum date for order type
export async function getMinimumDate(orderType: OrderType): Promise<Date> {
  const leadDays = await getLeadTime(orderType);
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + leadDays);
  minDate.setHours(0, 0, 0, 0);
  return minDate;
}

// Synchronous version
export function getMinimumDateSync(orderType: OrderType, leadTimes: Record<string, number>): Date {
  const leadDays = getLeadTimeSync(orderType, leadTimes);
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + leadDays);
  minDate.setHours(0, 0, 0, 0);
  return minDate;
}

// Check if date is within lead time
export async function isWithinLeadTime(date: Date, orderType: OrderType): Promise<boolean> {
  const minDate = await getMinimumDate(orderType);
  return date >= minDate;
}

export async function validateRequestedDate(dateStr: string, orderType: OrderType, tenantId: string = 'bakes-by-coral'): Promise<string | null> {
  if (!dateStr) return 'Date is required';

  const date = new Date(dateStr + 'T12:00:00');
  if (isNaN(date.getTime())) return 'Please enter a valid date';

  const withinLeadTime = await isWithinLeadTime(date, orderType);
  if (!withinLeadTime) {
    const minDate = await getMinimumDate(orderType);
    const minDateStr = minDate.toISOString().split('T')[0];
    return `Date must be on or after ${minDateStr}`;
  }

  const available = await isDateAvailable(dateStr, tenantId);
  if (!available) {
    return 'Selected date is not available for pickup';
  }

  return null;
}

// Check if a date is available for pickup
export async function isDateAvailable(dateStr: string, tenantId: string = 'bakes-by-coral'): Promise<boolean> {
  // Check if it's a blackout date
  if (await isBlackoutDate(tenantId, dateStr)) {
    return false;
  }

  // Check if the bakery is open that day
  const date = new Date(dateStr + 'T12:00:00');
  const hours = await getPickupHours(date);
  return hours !== null;
}

// Get available slots for a date
// Get next available date for order type
export async function getNextAvailableDate(orderType: OrderType, tenantId: string = 'bakes-by-coral'): Promise<string> {
  const minDate = await getMinimumDate(orderType);
  const maxIterations = 90; // Don't look more than 90 days ahead

  for (let i = 0; i < maxIterations; i++) {
    const checkDate = new Date(minDate);
    checkDate.setDate(checkDate.getDate() + i);

    // Check if there are pickup hours for this day
    const hours = await getPickupHours(checkDate);
    if (hours) {
      const dateStr = checkDate.toISOString().split('T')[0];
      // Also check it's not a blackout date
      if (!(await isBlackoutDate(tenantId, dateStr))) {
        return dateStr;
      }
    }
  }

  // Fallback to minimum date
  return minDate.toISOString().split('T')[0];
}

// Format time for display (24h to 12h)
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Format date for display
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Format date short
export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Load all scheduling config at once for efficient rendering
export interface SchedulingConfig {
  pickupHours: Record<number, PickupHours>;
  leadTimes: Record<string, number>;
  slotDurationMinutes: number;
}

export async function loadSchedulingConfig(): Promise<SchedulingConfig> {
  const [pickupHours, leadTimes, slotDurationMinutes] = await Promise.all([
    getAllPickupHours(),
    getLeadTimes(),
    getSlotDurationMinutes(),
  ]);

  return {
    pickupHours,
    leadTimes,
    slotDurationMinutes,
  };
}

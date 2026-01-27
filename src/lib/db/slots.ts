import { getDB } from './index';

export interface PickupSlot {
  id: number;
  date: string;
  time: string;
  capacity: number;
  booked: number;
  created_at: string;
}

export interface SlotAvailability {
  date: string;
  time: string;
  available: boolean;
  remaining: number;
  capacity: number;
}

// Get slot by date and time
export async function getSlot(date: string, time: string): Promise<PickupSlot | null> {
  const db = getDB();
  const result = await db
    .prepare('SELECT * FROM pickup_slots WHERE date = ? AND time = ?')
    .bind(date, time)
    .first<PickupSlot>();
  return result ?? null;
}

// Get all slots for a date
export async function getSlotsForDate(date: string): Promise<PickupSlot[]> {
  const db = getDB();
  const result = await db
    .prepare('SELECT * FROM pickup_slots WHERE date = ? ORDER BY time')
    .bind(date)
    .all<PickupSlot>();
  return result.results || [];
}

// Get slots for a date range
export async function getSlotsForRange(startDate: string, endDate: string): Promise<PickupSlot[]> {
  const db = getDB();
  const result = await db
    .prepare('SELECT * FROM pickup_slots WHERE date >= ? AND date <= ? ORDER BY date, time')
    .bind(startDate, endDate)
    .all<PickupSlot>();
  return result.results || [];
}

// Create or update a slot
export async function upsertSlot(date: string, time: string, capacity: number): Promise<void> {
  const db = getDB();
  await db
    .prepare(`
      INSERT INTO pickup_slots (date, time, capacity, booked)
      VALUES (?, ?, ?, 0)
      ON CONFLICT(date, time) DO UPDATE SET capacity = excluded.capacity
    `)
    .bind(date, time, capacity)
    .run();
}

// Increment booked count for a slot (when order is placed)
export async function incrementSlotBooked(date: string, time: string, defaultCapacity: number = 2): Promise<boolean> {
  const db = getDB();

  // First, ensure the slot exists
  await db
    .prepare(`
      INSERT INTO pickup_slots (date, time, capacity, booked)
      VALUES (?, ?, ?, 0)
      ON CONFLICT(date, time) DO NOTHING
    `)
    .bind(date, time, defaultCapacity)
    .run();

  // Then increment booked count if capacity allows
  const result = await db
    .prepare(`
      UPDATE pickup_slots
      SET booked = booked + 1
      WHERE date = ? AND time = ? AND booked < capacity
    `)
    .bind(date, time)
    .run();

  return (result.meta?.changes ?? 0) > 0;
}

// Decrement booked count for a slot (when order is cancelled)
export async function decrementSlotBooked(date: string, time: string): Promise<void> {
  const db = getDB();
  await db
    .prepare(`
      UPDATE pickup_slots
      SET booked = MAX(0, booked - 1)
      WHERE date = ? AND time = ?
    `)
    .bind(date, time)
    .run();
}

// Check if a slot is available
export async function isSlotAvailable(date: string, time: string, defaultCapacity: number = 2): Promise<boolean> {
  const db = getDB();

  // Check existing slot record
  const slot = await db
    .prepare('SELECT capacity, booked FROM pickup_slots WHERE date = ? AND time = ?')
    .bind(date, time)
    .first<{ capacity: number; booked: number }>();

  if (slot) {
    return slot.booked < slot.capacity;
  }

  // If no slot record, check order count against default capacity
  const orderCount = await db
    .prepare(`
      SELECT COUNT(*) as count FROM orders
      WHERE pickup_date = ? AND pickup_time = ?
        AND status NOT IN ('cancelled', 'pending_payment')
    `)
    .bind(date, time)
    .first<{ count: number }>();

  return (orderCount?.count ?? 0) < defaultCapacity;
}

// Get remaining capacity for a slot
export async function getSlotRemaining(date: string, time: string, defaultCapacity: number = 2): Promise<number> {
  const db = getDB();

  // Check existing slot record
  const slot = await db
    .prepare('SELECT capacity, booked FROM pickup_slots WHERE date = ? AND time = ?')
    .bind(date, time)
    .first<{ capacity: number; booked: number }>();

  if (slot) {
    return Math.max(0, slot.capacity - slot.booked);
  }

  // If no slot record, check order count against default capacity
  const orderCount = await db
    .prepare(`
      SELECT COUNT(*) as count FROM orders
      WHERE pickup_date = ? AND pickup_time = ?
        AND status NOT IN ('cancelled', 'pending_payment')
    `)
    .bind(date, time)
    .first<{ count: number }>();

  return Math.max(0, defaultCapacity - (orderCount?.count ?? 0));
}

// Sync slot booked counts from actual orders (useful for data integrity)
export async function syncSlotBookedCounts(startDate: string, endDate: string): Promise<void> {
  const db = getDB();

  // Get actual order counts grouped by date and time
  const orderCounts = await db
    .prepare(`
      SELECT pickup_date, pickup_time, COUNT(*) as count
      FROM orders
      WHERE pickup_date >= ? AND pickup_date <= ?
        AND pickup_date IS NOT NULL AND pickup_time IS NOT NULL
        AND status NOT IN ('cancelled', 'pending_payment')
      GROUP BY pickup_date, pickup_time
    `)
    .bind(startDate, endDate)
    .all<{ pickup_date: string; pickup_time: string; count: number }>();

  // Update slot records
  for (const row of orderCounts.results || []) {
    await db
      .prepare(`
        UPDATE pickup_slots
        SET booked = ?
        WHERE date = ? AND time = ?
      `)
      .bind(row.count, row.pickup_date, row.pickup_time)
      .run();
  }
}

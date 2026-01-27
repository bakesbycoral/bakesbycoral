import { getDB, generateId } from './index';
import type { BlackoutDate } from '@/types';

export async function getBlackoutDates(): Promise<BlackoutDate[]> {
  const db = getDB();
  const result = await db
    .prepare('SELECT * FROM blackout_dates ORDER BY date ASC')
    .all<BlackoutDate>();
  return result.results;
}

export async function getBlackoutDate(date: string): Promise<BlackoutDate | null> {
  const db = getDB();
  const result = await db
    .prepare('SELECT * FROM blackout_dates WHERE date = ?')
    .bind(date)
    .first<BlackoutDate>();
  return result || null;
}

export async function isBlackoutDate(date: string): Promise<boolean> {
  const blackout = await getBlackoutDate(date);
  return blackout !== null;
}

export async function addBlackoutDate(date: string, reason?: string): Promise<BlackoutDate> {
  const db = getDB();

  // Check if already exists
  const existing = await getBlackoutDate(date);
  if (existing) {
    // Update reason if provided
    if (reason !== undefined) {
      await db
        .prepare('UPDATE blackout_dates SET reason = ? WHERE date = ?')
        .bind(reason, date)
        .run();
    }
    return getBlackoutDate(date) as Promise<BlackoutDate>;
  }

  const id = generateId();
  await db
    .prepare('INSERT INTO blackout_dates (id, date, reason) VALUES (?, ?, ?)')
    .bind(id, date, reason || null)
    .run();

  return getBlackoutDate(date) as Promise<BlackoutDate>;
}

export async function removeBlackoutDate(date: string): Promise<boolean> {
  const db = getDB();
  const result = await db
    .prepare('DELETE FROM blackout_dates WHERE date = ?')
    .bind(date)
    .run();
  return result.meta.changes > 0;
}

export async function getUpcomingBlackoutDates(days: number = 90): Promise<BlackoutDate[]> {
  const db = getDB();
  const today = new Date().toISOString().split('T')[0];
  const future = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const result = await db
    .prepare('SELECT * FROM blackout_dates WHERE date >= ? AND date <= ? ORDER BY date ASC')
    .bind(today, future)
    .all<BlackoutDate>();

  return result.results;
}

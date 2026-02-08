import { getDB, generateId } from './index';
import type { BlackoutDate } from '@/types';

export async function getBlackoutDates(tenantId: string): Promise<BlackoutDate[]> {
  const db = getDB();
  const result = await db
    .prepare('SELECT * FROM blackout_dates WHERE tenant_id = ? ORDER BY date ASC')
    .bind(tenantId)
    .all<BlackoutDate>();
  return result.results;
}

export async function getBlackoutDate(tenantId: string, date: string): Promise<BlackoutDate | null> {
  const db = getDB();
  const result = await db
    .prepare('SELECT * FROM blackout_dates WHERE tenant_id = ? AND date = ?')
    .bind(tenantId, date)
    .first<BlackoutDate>();
  return result || null;
}

export async function isBlackoutDate(tenantId: string, date: string): Promise<boolean> {
  const blackout = await getBlackoutDate(tenantId, date);
  return blackout !== null;
}

export async function addBlackoutDate(tenantId: string, date: string, reason?: string): Promise<BlackoutDate> {
  const db = getDB();

  // Check if already exists
  const existing = await getBlackoutDate(tenantId, date);
  if (existing) {
    // Update reason if provided
    if (reason !== undefined) {
      await db
        .prepare('UPDATE blackout_dates SET reason = ? WHERE tenant_id = ? AND date = ?')
        .bind(reason, tenantId, date)
        .run();
    }
    return getBlackoutDate(tenantId, date) as Promise<BlackoutDate>;
  }

  const id = generateId();
  await db
    .prepare('INSERT INTO blackout_dates (id, date, reason, tenant_id) VALUES (?, ?, ?, ?)')
    .bind(id, date, reason || null, tenantId)
    .run();

  return getBlackoutDate(tenantId, date) as Promise<BlackoutDate>;
}

export async function removeBlackoutDate(tenantId: string, date: string): Promise<boolean> {
  const db = getDB();
  const result = await db
    .prepare('DELETE FROM blackout_dates WHERE tenant_id = ? AND date = ?')
    .bind(tenantId, date)
    .run();
  return result.meta.changes > 0;
}

export async function getUpcomingBlackoutDates(tenantId: string, days: number = 90): Promise<BlackoutDate[]> {
  const db = getDB();
  const today = new Date().toISOString().split('T')[0];
  const future = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const result = await db
    .prepare('SELECT * FROM blackout_dates WHERE tenant_id = ? AND date >= ? AND date <= ? ORDER BY date ASC')
    .bind(tenantId, today, future)
    .all<BlackoutDate>();

  return result.results;
}

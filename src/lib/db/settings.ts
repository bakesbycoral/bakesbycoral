import { getDB } from './index';

export interface Setting {
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
}

// Get a single setting by key
export async function getSetting(key: string): Promise<string | null> {
  const db = getDB();
  const result = await db
    .prepare('SELECT value FROM settings WHERE key = ?')
    .bind(key)
    .first<{ value: string }>();
  return result?.value ?? null;
}

// Get a setting as a number
export async function getSettingNumber(key: string, defaultValue: number = 0): Promise<number> {
  const value = await getSetting(key);
  if (value === null) return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

// Get a setting as JSON
export async function getSettingJSON<T>(key: string, defaultValue: T): Promise<T> {
  const value = await getSetting(key);
  if (value === null) return defaultValue;
  try {
    return JSON.parse(value) as T;
  } catch {
    return defaultValue;
  }
}

// Get multiple settings by prefix
export async function getSettingsByPrefix(prefix: string): Promise<Record<string, string>> {
  const db = getDB();
  const result = await db
    .prepare('SELECT key, value FROM settings WHERE key LIKE ?')
    .bind(`${prefix}%`)
    .all<{ key: string; value: string }>();

  const settings: Record<string, string> = {};
  for (const row of result.results) {
    settings[row.key] = row.value;
  }
  return settings;
}

// Get all settings
export async function getAllSettings(): Promise<Setting[]> {
  const db = getDB();
  const result = await db
    .prepare('SELECT * FROM settings ORDER BY key')
    .all<Setting>();
  return result.results;
}

// Update a setting
export async function updateSetting(key: string, value: string): Promise<void> {
  const db = getDB();
  await db
    .prepare('UPDATE settings SET value = ?, updated_at = datetime("now") WHERE key = ?')
    .bind(value, key)
    .run();
}

// Update multiple settings
export async function updateSettings(settings: Record<string, string>): Promise<void> {
  const db = getDB();
  const stmt = db.prepare('UPDATE settings SET value = ?, updated_at = datetime("now") WHERE key = ?');

  // Use batch for efficiency
  const batch = Object.entries(settings).map(([key, value]) => stmt.bind(value, key));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db.batch(batch as any);
}

// Pricing getters
export async function getCookiePricePerDozen(): Promise<number> {
  return getSettingNumber('cookie_price_per_dozen', 4000);
}

export async function getCakeBasePrices(): Promise<Record<string, number>> {
  const [price4, price6, price8, price10] = await Promise.all([
    getSettingNumber('cake_price_4_inch', 4500),
    getSettingNumber('cake_price_6_inch', 6500),
    getSettingNumber('cake_price_8_inch', 8500),
    getSettingNumber('cake_price_10_inch', 11000),
  ]);
  return { '4': price4, '6': price6, '8': price8, '10': price10 };
}

export async function getStyleMultipliers(): Promise<Record<string, number>> {
  const [simple, moderate, intricate] = await Promise.all([
    getSettingNumber('design_multiplier_simple', 1.0),
    getSettingNumber('design_multiplier_moderate', 1.25),
    getSettingNumber('design_multiplier_intricate', 1.5),
  ]);
  return { simple, moderate, intricate };
}

export async function getDepositPercentage(): Promise<number> {
  return getSettingNumber('deposit_percentage', 50);
}

// Lead time getters
export async function getLeadTimes(): Promise<Record<string, number>> {
  const [smallCookie, largeCookie, cake, wedding] = await Promise.all([
    getSettingNumber('lead_time_small_cookie', 7),
    getSettingNumber('lead_time_large_cookie', 14),
    getSettingNumber('lead_time_cake', 14),
    getSettingNumber('lead_time_wedding', 30),
  ]);
  return {
    cookies: smallCookie,
    cookies_large: largeCookie,
    cake,
    wedding,
  };
}

// Pickup hours getters
export type PickupHours = { start: string; end: string } | null;

export async function getPickupHoursForDay(dayOfWeek: number): Promise<PickupHours> {
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[dayOfWeek];
  if (!dayName) return null;

  return getSettingJSON<PickupHours>(`pickup_hours_${dayName}`, null);
}

export async function getAllPickupHours(): Promise<Record<number, PickupHours>> {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const results = await Promise.all(
    days.map((day) => getSettingJSON<PickupHours>(`pickup_hours_${day}`, null))
  );

  const hours: Record<number, PickupHours> = {};
  results.forEach((h, i) => {
    hours[i] = h;
  });
  return hours;
}

export async function getSlotCapacity(): Promise<number> {
  return getSettingNumber('default_slot_capacity', 2);
}

export async function getSlotDurationMinutes(): Promise<number> {
  return getSettingNumber('slot_interval_minutes', 30);
}

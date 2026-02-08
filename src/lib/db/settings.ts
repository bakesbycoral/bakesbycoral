import { getDB } from './index';

export interface Setting {
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
}

export interface TenantSetting {
  tenant_id: string;
  key: string;
  value: string;
  updated_at: string;
}

// Get a single setting by key (global only)
export async function getSetting(key: string): Promise<string | null> {
  const db = getDB();
  const result = await db
    .prepare('SELECT value FROM settings WHERE key = ?')
    .bind(key)
    .first<{ value: string }>();
  return result?.value ?? null;
}

// Get a tenant-specific setting with fallback to global
export async function getTenantSetting(
  tenantId: string,
  key: string
): Promise<string | null> {
  const db = getDB();

  // First try tenant-specific setting
  const tenantResult = await db
    .prepare('SELECT value FROM tenant_settings WHERE tenant_id = ? AND key = ?')
    .bind(tenantId, key)
    .first<{ value: string }>();

  if (tenantResult?.value !== undefined) {
    return tenantResult.value;
  }

  // Fall back to global setting
  return getSetting(key);
}

// Get a setting as a number
export async function getSettingNumber(key: string, defaultValue: number = 0): Promise<number> {
  const value = await getSetting(key);
  if (value === null) return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

// Get a tenant-specific setting as a number with fallback
export async function getTenantSettingNumber(
  tenantId: string,
  key: string,
  defaultValue: number = 0
): Promise<number> {
  const value = await getTenantSetting(tenantId, key);
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

// Get a tenant-specific setting as JSON with fallback
export async function getTenantSettingJSON<T>(
  tenantId: string,
  key: string,
  defaultValue: T
): Promise<T> {
  const value = await getTenantSetting(tenantId, key);
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

// Get tenant-specific settings by prefix with fallback to global
export async function getTenantSettingsByPrefix(
  tenantId: string,
  prefix: string
): Promise<Record<string, string>> {
  const db = getDB();

  // Get global settings first
  const globalSettings = await getSettingsByPrefix(prefix);

  // Get tenant-specific overrides
  const tenantResult = await db
    .prepare('SELECT key, value FROM tenant_settings WHERE tenant_id = ? AND key LIKE ?')
    .bind(tenantId, `${prefix}%`)
    .all<{ key: string; value: string }>();

  // Merge tenant settings over global
  for (const row of tenantResult.results) {
    globalSettings[row.key] = row.value;
  }

  return globalSettings;
}

// Get all settings
export async function getAllSettings(): Promise<Setting[]> {
  const db = getDB();
  const result = await db
    .prepare('SELECT * FROM settings ORDER BY key')
    .all<Setting>();
  return result.results;
}

// Get all tenant-specific settings
export async function getAllTenantSettings(tenantId: string): Promise<TenantSetting[]> {
  const db = getDB();
  const result = await db
    .prepare('SELECT * FROM tenant_settings WHERE tenant_id = ? ORDER BY key')
    .bind(tenantId)
    .all<TenantSetting>();
  return result.results;
}

// Update a global setting
export async function updateSetting(key: string, value: string): Promise<void> {
  const db = getDB();
  await db
    .prepare('UPDATE settings SET value = ?, updated_at = datetime("now") WHERE key = ?')
    .bind(value, key)
    .run();
}

// Update a tenant-specific setting (insert or update)
export async function updateTenantSetting(
  tenantId: string,
  key: string,
  value: string
): Promise<void> {
  const db = getDB();
  await db
    .prepare(`
      INSERT INTO tenant_settings (tenant_id, key, value, updated_at)
      VALUES (?, ?, ?, datetime('now'))
      ON CONFLICT(tenant_id, key)
      DO UPDATE SET value = excluded.value, updated_at = datetime('now')
    `)
    .bind(tenantId, key, value)
    .run();
}

// Delete a tenant-specific setting (revert to global)
export async function deleteTenantSetting(tenantId: string, key: string): Promise<void> {
  const db = getDB();
  await db
    .prepare('DELETE FROM tenant_settings WHERE tenant_id = ? AND key = ?')
    .bind(tenantId, key)
    .run();
}

// Update multiple global settings
export async function updateSettings(settings: Record<string, string>): Promise<void> {
  const db = getDB();
  const stmt = db.prepare('UPDATE settings SET value = ?, updated_at = datetime("now") WHERE key = ?');

  // Use batch for efficiency
  const batch = Object.entries(settings).map(([key, value]) => stmt.bind(value, key));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db.batch(batch as any);
}

// Update multiple tenant-specific settings
export async function updateTenantSettings(
  tenantId: string,
  settings: Record<string, string>
): Promise<void> {
  const db = getDB();
  const stmt = db.prepare(`
    INSERT INTO tenant_settings (tenant_id, key, value, updated_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(tenant_id, key)
    DO UPDATE SET value = excluded.value, updated_at = datetime('now')
  `);

  const batch = Object.entries(settings).map(([key, value]) =>
    stmt.bind(tenantId, key, value)
  );
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

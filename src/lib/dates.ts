import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

export const TIMEZONE = 'America/New_York';

type DateSource = 'auto' | 'utc' | 'business_local';

const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;
const SQLITE_DATETIME_RE = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
const LOCAL_ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;
const HAS_TIMEZONE_RE = /(Z|[+-]\d{2}:\d{2})$/;

function parseDateValue(dateStr: string | null, source: DateSource = 'auto'): Date | null {
  if (!dateStr) return null;

  if (DATE_ONLY_RE.test(dateStr)) {
    return new Date(`${dateStr}T12:00:00Z`);
  }

  if (source === 'utc' || (source === 'auto' && SQLITE_DATETIME_RE.test(dateStr))) {
    return new Date(dateStr.replace(' ', 'T') + 'Z');
  }

  if (source === 'business_local' || (source === 'auto' && LOCAL_ISO_RE.test(dateStr))) {
    return fromZonedTime(dateStr, TIMEZONE);
  }

  if (HAS_TIMEZONE_RE.test(dateStr)) {
    return new Date(dateStr);
  }

  return new Date(dateStr);
}

function formatYmdFromUtcDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function formatDateTime(dateStr: string | null, source: DateSource = 'auto'): string {
  const date = parseDateValue(dateStr, source);
  if (!date || Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function formatDate(dateStr: string | null): string {
  const date = parseDateValue(dateStr);
  if (!date || Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatDateShort(dateStr: string | null): string {
  const date = parseDateValue(dateStr);
  if (!date || Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatDateMedium(dateStr: string | null): string {
  const date = parseDateValue(dateStr);
  if (!date || Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatTime(timeStr: string | null): string {
  if (!timeStr) return '-';
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

export function formatClockTime(dateStr: string | null, source: DateSource = 'auto'): string {
  const date = parseDateValue(dateStr, source);
  if (!date || Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function formatRelativeTime(dateStr: string | null, source: DateSource = 'auto', now: Date = new Date()): string {
  const date = parseDateValue(dateStr, source);
  if (!date || Number.isNaN(date.getTime())) return '-';

  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDateShort(dateStr);
}

export function getCurrentDateInTimeZone(now: Date = new Date()): string {
  return formatInTimeZone(now, TIMEZONE, 'yyyy-MM-dd');
}

export function getCurrentDateTimeInTimeZone(now: Date = new Date()): string {
  return formatInTimeZone(now, TIMEZONE, "yyyy-MM-dd'T'HH:mm:ss");
}

export function getStartOfMonthInTimeZone(now: Date = new Date()): string {
  return formatInTimeZone(now, TIMEZONE, 'yyyy-MM-01');
}

export function addDaysToDateString(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return formatYmdFromUtcDate(date);
}

export function getDateDaysFromNowInTimeZone(days: number, now: Date = new Date()): string {
  return addDaysToDateString(getCurrentDateInTimeZone(now), days);
}

export function toSqliteUtcString(date: Date): string {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

export function getCurrentMonthStartUtcSqlite(now: Date = new Date()): string {
  const monthStart = getStartOfMonthInTimeZone(now);
  return toSqliteUtcString(fromZonedTime(`${monthStart}T00:00:00`, TIMEZONE));
}

export function getCurrentDatePartsInTimeZone(now: Date = new Date()): { year: number; month: number; day: number } {
  const today = getCurrentDateInTimeZone(now);
  const [year, month, day] = today.split('-').map(Number);
  return { year, month, day };
}

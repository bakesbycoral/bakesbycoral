// All admin timestamps should display in Eastern Time (Cincinnati, OH)
export const TIMEZONE = 'America/New_York';

export function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('en-US', {
    timeZone: TIMEZONE,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  // If it's already a full datetime string (contains T or Z), parse directly
  // Otherwise it's a date-only string (YYYY-MM-DD), add noon to avoid timezone shift
  const date = (dateStr.includes('T') || dateStr.includes('Z'))
    ? new Date(dateStr)
    : new Date(dateStr + 'T12:00:00');
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-US', {
    timeZone: TIMEZONE,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(timeStr: string | null): string {
  if (!timeStr) return '-';
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

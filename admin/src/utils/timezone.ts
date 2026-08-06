// Belgium/Netherlands timezone utilities for the admin panel.
// Business operates in Europe/Brussels. All admin views must render that calendar,
// regardless of where the admin logs in from.

export const BELGIUM_TIMEZONE = 'Europe/Brussels';

/**
 * Today's Belgium calendar date as YYYY-MM-DD — immune to browser timezone.
 */
export const getBelgiumTodayStr = (): string => {
  return new Intl.DateTimeFormat('en-CA', { timeZone: BELGIUM_TIMEZONE }).format(new Date());
};

/**
 * Belgium calendar date (YYYY-MM-DD) for any Date or ISO string.
 */
export const getBelgiumDateStr = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-CA', { timeZone: BELGIUM_TIMEZONE }).format(d);
};

/**
 * Day of week (0=Sunday..6=Saturday) as the Belgium calendar sees it.
 */
export const getBelgiumDayOfWeek = (date: Date | string): number => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: BELGIUM_TIMEZONE,
    weekday: 'long'
  }).format(d).toLowerCase();
  const map: Record<string, number> = {
    sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
    thursday: 4, friday: 5, saturday: 6
  };
  return map[weekday] ?? 0;
};

/**
 * Month number (0-11) as the Belgium calendar sees it.
 */
export const getBelgiumMonth = (date: Date | string): number => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const m = new Intl.DateTimeFormat('en-US', {
    timeZone: BELGIUM_TIMEZONE,
    month: 'numeric'
  }).format(d);
  return Number(m) - 1;
};

/**
 * Format a date for display — always in Belgium timezone.
 */
export const formatBelgiumDate = (
  date: Date | string,
  options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', { timeZone: BELGIUM_TIMEZONE, ...options }).format(d);
};

/**
 * Compare two Date/ISO values by their Belgium calendar day.
 * Returns: -1 if a<b, 0 if same day, 1 if a>b. Timezone-safe for range filters.
 */
export const compareBelgiumDays = (a: Date | string, b: Date | string): number => {
  const aStr = getBelgiumDateStr(a);
  const bStr = getBelgiumDateStr(b);
  if (aStr < bStr) return -1;
  if (aStr > bStr) return 1;
  return 0;
};

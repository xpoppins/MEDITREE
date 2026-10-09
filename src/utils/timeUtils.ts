/**
 * Indian Standard Time (IST, UTC+05:30) Date & Time Utilities
 */

/**
 * Returns current date/time formatted as YYYY-MM-DDTHH:mm in Asia/Kolkata (IST)
 * suitable for HTML5 `<input type="datetime-local">`
 */
export function getISTDateTimeLocal(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const getPart = (type: string) => parts.find((p) => p.type === type)?.value || '00';
  const year = getPart('year');
  const month = getPart('month');
  const day = getPart('day');
  const hour = getPart('hour');
  const minute = getPart('minute');
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

/**
 * Formats a Date in Indian Standard Time (IST) with live second or minute precision
 */
export function formatLiveIST(
  date: Date = new Date(),
  language: 'en' | 'hi' = 'en',
  includeSeconds: boolean = true
): string {
  const locale = language === 'hi' ? 'hi-IN' : 'en-IN';

  const dateStr = date.toLocaleDateString(locale, {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const timeStr = date.toLocaleTimeString(locale, {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    ...(includeSeconds ? { second: '2-digit' } : {}),
    hour12: true,
  });

  return `${dateStr}, ${timeStr} IST`;
}

/**
 * Formats a stored ISO timestamp string or custom datetime-local string to IST
 */
export function formatStoredToIST(
  dateTimeStr: string,
  language: 'en' | 'hi' = 'en',
  includeSeconds: boolean = false
): string {
  if (!dateTimeStr) return '';
  // If it's a datetime-local string without timezone (e.g. 2026-10-09T21:30), append IST offset
  const normalized =
    dateTimeStr.length === 16 && !dateTimeStr.endsWith('Z') && !dateTimeStr.includes('+')
      ? `${dateTimeStr}:00+05:30`
      : dateTimeStr;
  const d = new Date(normalized);
  if (isNaN(d.getTime())) return dateTimeStr;
  return formatLiveIST(d, language, includeSeconds);
}

/**
 * Converts a datetime-local input string into an ISO string in UTC
 * treating the input as Indian Standard Time (+05:30)
 */
export function istDateTimeLocalToISO(dateTimeLocalStr: string): string {
  if (!dateTimeLocalStr) return new Date().toISOString();
  // If it already has offset or Z, parse directly
  if (dateTimeLocalStr.endsWith('Z') || dateTimeLocalStr.includes('+')) {
    return new Date(dateTimeLocalStr).toISOString();
  }
  // Otherwise treat as IST (+05:30)
  const fullStr =
    dateTimeLocalStr.length === 16
      ? `${dateTimeLocalStr}:00+05:30`
      : `${dateTimeLocalStr}+05:30`;
  const d = new Date(fullStr);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

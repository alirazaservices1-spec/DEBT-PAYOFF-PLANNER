/**
 * Parse MM/YYYY, M/YYYY, MM-YYYY (month 1–12, year 1990–2100).
 */
export function parseMonthYearString(raw: string): { month: number; year: number } | null {
  const s = raw.trim();
  if (!s) return null;
  const m = s.match(/^(\d{1,2})\s*[\/\-\s]\s*(\d{4})$/);
  if (!m) return null;
  const month = parseInt(m[1], 10);
  const year = parseInt(m[2], 10);
  if (month < 1 || month > 12 || year < 1990 || year > 2100) return null;
  return { month, year };
}

export function formatMonthYear(month: number, year: number): string {
  return `${String(month).padStart(2, "0")}/${year}`;
}

/** Date at noon on first of month (stable across TZ) */
export function monthYearToDate(month: number, year: number): Date {
  return new Date(year, month - 1, 15, 12, 0, 0, 0);
}

export function dateToMonthYear(d: Date): { month: number; year: number } {
  return { month: d.getMonth() + 1, year: d.getFullYear() };
}

/**
 * Intro / promo end must not be absurdly in the past (e.g. 25 years ago) or far future.
 * Uses last day of that month as the "end" of the promo period.
 */
export function validateIntroPromoMonthYear(
  month: number,
  year: number
): { valid: boolean; message?: string } {
  const lastDay = new Date(year, month, 0);
  const now = new Date();
  const maxFuture = new Date(now.getFullYear() + 20, 11, 31);
  const minPast = new Date(now.getFullYear() - 5, now.getMonth(), 1);

  if (lastDay < minPast) {
    return {
      valid: false,
      message:
        "That intro end is too far in the past. Enter the month/year your promotional rate ends (usually this year or next).",
    };
  }
  if (lastDay > maxFuture) {
    return {
      valid: false,
      message: "That date is too far in the future - please double-check the year.",
    };
  }
  return { valid: true };
}

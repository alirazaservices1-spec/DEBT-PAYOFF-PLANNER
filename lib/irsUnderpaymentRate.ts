/**
 * IRS standard underpayment interest (corporate & non-corporate), IRC §6621
 * (federal short-term rate + 3 percentage points).
 *
 * Update `UNDERPAYMENT_BY_QUARTER` when the IRS publishes new quarters:
 * https://www.irs.gov/payments/quarterly-interest-rates-for-underpayment-and-overpayment-of-tax
 */

const UNDERPAYMENT_BY_QUARTER: Record<string, number> = {
  "2026-Q2": 6,
  "2026-Q1": 7,
  "2025-Q4": 7,
  "2025-Q3": 7,
  "2025-Q2": 7,
  "2025-Q1": 7,
  "2024-Q4": 8,
  "2024-Q3": 8,
  "2024-Q2": 8,
  "2024-Q1": 8,
  "2023-Q4": 8,
  "2023-Q3": 8,
  "2023-Q2": 7,
  "2023-Q1": 7,
};

const QUARTER_NAMES = ["Jan–Mar", "Apr–Jun", "Jul–Sep", "Oct–Dec"] as const;
// 8 years of quarter walkback before returning an "unavailable" fallback.
const MAX_LOOKBACK_QUARTERS = 32;
// Keep this in sync whenever UNDERPAYMENT_BY_QUARTER is updated.
const TABLE_LAST_UPDATED = "2026-03-01";
// Monitor IRS newsroom RSS for quarterly rate announcements and update triggers.
const IRS_NEWSROOM_RSS_URL = "https://www.irs.gov/newsroom/rss";
const STALE_TABLE_WARNING_DAYS_INTO_QUARTER = 45;
let hasWarnedStaleCurrentQuarter = false;

function calendarQuarter(d: Date): { year: number; quarter: 1 | 2 | 3 | 4 } {
  const q = (Math.floor(d.getMonth() / 3) + 1) as 1 | 2 | 3 | 4;
  return { year: d.getFullYear(), quarter: q };
}

function quarterKey(year: number, quarter: number): string {
  return `${year}-Q${quarter}`;
}

function quarterDisplayLabel(year: number, quarter: number): string {
  return `${QUARTER_NAMES[quarter - 1]} ${year}`;
}

function prevQuarter(year: number, quarter: 1 | 2 | 3 | 4): { year: number; quarter: 1 | 2 | 3 | 4 } {
  if (quarter === 1) return { year: year - 1, quarter: 4 };
  return { year, quarter: (quarter - 1) as 1 | 2 | 3 | 4 };
}

function quarterStartDate(year: number, quarter: 1 | 2 | 3 | 4): Date {
  return new Date(year, (quarter - 1) * 3, 1);
}

function maybeWarnStaleCurrentQuarterTable(
  requestedYear: number,
  requestedQuarter: 1 | 2 | 3 | 4,
  provisional: boolean
): void {
  if (!provisional || hasWarnedStaleCurrentQuarter) return;
  const now = new Date();
  const { year: nowYear, quarter: nowQuarter } = calendarQuarter(now);
  // Warn only for current-quarter lookups that are still provisional deep into the quarter.
  if (requestedYear !== nowYear || requestedQuarter !== nowQuarter) return;
  const start = quarterStartDate(nowYear, nowQuarter);
  const daysIntoQuarter = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  if (daysIntoQuarter < STALE_TABLE_WARNING_DAYS_INTO_QUARTER) return;
  hasWarnedStaleCurrentQuarter = true;
  console.warn(
    `[irsUnderpaymentRate] UNDERPAYMENT_BY_QUARTER may be stale (${nowYear}-Q${nowQuarter} still provisional ` +
      `${Math.floor(daysIntoQuarter)} days into quarter). Last table update: ${TABLE_LAST_UPDATED}. ` +
      `Check IRS announcements (${IRS_NEWSROOM_RSS_URL}).`
  );
}

export function getIrsUnderpaymentRateSummary(d: Date = new Date()): {
  annualPercent: number;
  /** e.g. "Apr–Jun 2026" */
  quarterLabel: string;
  /** True when the IRS has not yet published this calendar quarter’s rate (prior quarter shown). */
  provisional: boolean;
} {
  if (!Number.isFinite(d.getTime())) {
    return { annualPercent: Number.NaN, quarterLabel: "see IRS.gov", provisional: true };
  }
  const requested = calendarQuarter(d);
  let { year, quarter } = requested;
  let provisional = false;
  for (let i = 0; i < MAX_LOOKBACK_QUARTERS; i++) {
    const key = quarterKey(year, quarter);
    if (Object.prototype.hasOwnProperty.call(UNDERPAYMENT_BY_QUARTER, key)) {
      maybeWarnStaleCurrentQuarterTable(requested.year, requested.quarter, provisional);
      return {
        annualPercent: UNDERPAYMENT_BY_QUARTER[key],
        quarterLabel: quarterDisplayLabel(year, quarter),
        provisional,
      };
    }
    provisional = true;
    ({ year, quarter } = prevQuarter(year, quarter));
  }
  return { annualPercent: Number.NaN, quarterLabel: "see IRS.gov", provisional: true };
}

/** Primary clause: what the IRS is charging for the (published) quarter. */
export function getIrsUnderpaymentRateSentence(d: Date = new Date()): string {
  const { annualPercent, quarterLabel, provisional } = getIrsUnderpaymentRateSummary(d);
  if (!Number.isFinite(annualPercent)) {
    return "IRS underpayment interest unavailable for this date. Confirm the applicable quarter on irs.gov or your notice.";
  }
  if (provisional) {
    return `Last published IRS underpayment interest: ${annualPercent}% per year (${quarterLabel}). Confirm the current quarter on irs.gov or your notice.`;
  }
  return `IRS underpayment interest: ${annualPercent}% per year (${quarterLabel}).`;
}

/** Copy under the tax-debt APR field in onboarding / forms. */
export function getIrsUnderpaymentAprFieldHint(d: Date = new Date()): string {
  return `${getIrsUnderpaymentRateSentence(d)} Use your notice if yours differs; penalties are separate.`;
}

/**
 * Compare a tax debt's stored APR against the current published IRS rate.
 * Returns a nudge message if the rate has drifted by >= 0.5pp, or null if current.
 * Use in debt detail/edit surfaces to prompt users to update explicitly.
 */
export function irsRateDriftCheck(
  storedApr: number,
  asOfDate: Date = new Date()
): { message: string; currentRate: number } | null {
  // Treat non-positive APRs as unset/invalid; avoid false "update it?" nudges.
  if (!Number.isFinite(storedApr) || storedApr <= 0) return null;
  const { annualPercent, quarterLabel } = getIrsUnderpaymentRateSummary(asOfDate);
  if (!Number.isFinite(annualPercent)) return null;
  const drift = Math.abs(storedApr - annualPercent);
  if (drift < 0.5) return null;
  const direction = annualPercent < storedApr ? "dropped" : "increased";
  return {
    message: `The IRS underpayment rate ${direction} to ${annualPercent}% for ${quarterLabel}. Your tax debt is set to ${storedApr}%. Update it?`,
    currentRate: annualPercent,
  };
}

/** Backward-compatible alias for existing onboarding/form call sites. */
export function getIrsAprUpdateNotice(
  enteredApr: number | null | undefined,
  d: Date = new Date()
): { message: string; currentApr: number } | null {
  /** @see irsRateDriftCheck - maps currentRate -> currentApr for backward compatibility. */
  if (enteredApr == null || enteredApr <= 0) return null;
  const drift = irsRateDriftCheck(enteredApr, d);
  if (!drift) return null;
  return { message: drift.message, currentApr: drift.currentRate };
}

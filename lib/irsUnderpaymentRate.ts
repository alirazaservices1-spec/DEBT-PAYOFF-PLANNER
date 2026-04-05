/**
 * IRS standard underpayment interest (corporate & non-corporate), IRC §6621
 * (federal short-term rate + 3 percentage points).
 *
 * Update `UNDERPAYMENT_BY_QUARTER` when the IRS publishes new quarters:
 * https://www.irs.gov/payments/quarterly-interest-rates-for-underpayment-and-overpayment-of-tax
 */

const UNDERPAYMENT_BY_QUARTER: Record<string, number> = {
  "2026-Q2": 7,
  "2026-Q1": 6,
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

export function getIrsUnderpaymentRateSummary(d: Date = new Date()): {
  annualPercent: number;
  /** e.g. "Apr–Jun 2026" */
  quarterLabel: string;
  /** True when the IRS has not yet published this calendar quarter’s rate (prior quarter shown). */
  provisional: boolean;
} {
  let { year, quarter } = calendarQuarter(d);
  let provisional = false;
  for (let i = 0; i < 32; i++) {
    const key = quarterKey(year, quarter);
    if (Object.prototype.hasOwnProperty.call(UNDERPAYMENT_BY_QUARTER, key)) {
      return {
        annualPercent: UNDERPAYMENT_BY_QUARTER[key],
        quarterLabel: quarterDisplayLabel(year, quarter),
        provisional,
      };
    }
    provisional = true;
    ({ year, quarter } = prevQuarter(year, quarter));
  }
  return { annualPercent: 7, quarterLabel: "see IRS.gov", provisional: true };
}

/** Primary clause: what the IRS is charging for the (published) quarter. */
export function getIrsUnderpaymentRateSentence(d: Date = new Date()): string {
  const { annualPercent, quarterLabel, provisional } = getIrsUnderpaymentRateSummary(d);
  if (provisional) {
    return `Last published IRS underpayment interest: ${annualPercent}% per year (${quarterLabel}). Confirm the current quarter on irs.gov or your notice.`;
  }
  return `IRS underpayment interest: ${annualPercent}% per year (${quarterLabel}).`;
}

/** Copy under the tax-debt APR field in onboarding / forms. */
export function getIrsUnderpaymentAprFieldHint(d: Date = new Date()): string {
  return `${getIrsUnderpaymentRateSentence(d)} Use your notice if yours differs; penalties are separate.`;
}

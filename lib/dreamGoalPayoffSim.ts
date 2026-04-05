/**
 * Month-by-month avalanche-style simulation for onboarding Step 4 (dream goal).
 * Extra payment goes to highest APR after minimums are applied.
 */

export type DreamGoalSimDebt = {
  balance: number;
  rate: number; // APR percent, e.g. 18 for 18%
  minimumPayment: number;
};

export function simulateDebtPayoffMonths(
  debts: DreamGoalSimDebt[],
  extraMonthly: number,
  maxMonths = 720
): number {
  if (debts.length === 0) return 0;

  let bals = debts.map((d) => d.balance);
  const rates = debts.map((d) => d.rate / 100 / 12);
  const mins = debts.map((d) => d.minimumPayment || 0);
  const totalMin = mins.reduce((s, m) => s + m, 0);
  const mp = totalMin + extraMonthly;

  if (mp <= 0) return Number.POSITIVE_INFINITY;

  const firstMonthInterest = bals.reduce((s, b, i) => s + (b > 0 ? b * rates[i] : 0), 0);
  if (mp <= firstMonthInterest) return Number.POSITIVE_INFINITY;

  let months = 0;
  while (months < maxMonths && bals.some((b) => b > 0)) {
    bals = bals.map((b, i) => (b > 0 ? b + b * rates[i] : 0));
    let rem = mp;
    bals = bals.map((b, i) => {
      if (b <= 0) return 0;
      const pay = Math.min(mins[i], b);
      rem -= pay;
      return b - pay;
    });
    const sorted = bals.map((b, i) => ({ b, i, r: rates[i] })).sort((a, z) => z.r - a.r);
    for (const { i } of sorted) {
      if (bals[i] > 0 && rem > 0) {
        const pay = Math.min(rem, bals[i]);
        bals[i] -= pay;
        rem -= pay;
      }
    }
    bals = bals.map((b) => (b < 0.01 ? 0 : b));
    months++;
  }

  return bals.some((b) => b > 0) ? Number.POSITIVE_INFINITY : months;
}

export function firstMonthInterestTotal(debts: DreamGoalSimDebt[]): number {
  return debts.reduce((s, d) => s + d.balance * (d.rate / 100 / 12), 0);
}

export function totalMinimumPayments(debts: DreamGoalSimDebt[]): number {
  return debts.reduce((s, d) => s + (d.minimumPayment || 0), 0);
}

/** Months to reach goal with monthly deposits at 4% APY, monthly compounding. */
export function monthsToSavingsGoal(savingsMonthly: number, goal: number, annualRate = 0.04): number | null {
  const r = annualRate / 12;
  if (savingsMonthly <= 0 || goal <= 0) return null;
  const n = Math.log(1 + (goal * r) / savingsMonthly) / Math.log(1 + r);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.ceil(n);
}

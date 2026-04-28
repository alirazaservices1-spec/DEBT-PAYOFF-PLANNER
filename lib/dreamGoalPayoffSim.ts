/**
 * Month-by-month avalanche-style simulation for onboarding Step 4 (dream goal).
 * Extra payment goes to highest APR after minimums are applied.
 *
 * INTENTIONAL SIMPLIFICATIONS vs the main engine (calculations.ts):
 * - No intro/promotional APR - users haven't entered promo details during onboarding.
 * - No daily compounding for tax debt - uses standard monthly like all other types.
 * - No taxPaymentPlan gating - all entered debts are included.
 * - Extra cascades through all debts in APR-desc order (same behavior as main engine).
 *
 * Payoff horizon (`MAX_SIM_MONTHS`) and unpaid-interest capitalization match the main engine.
 */

import { MAX_SIM_MONTHS } from "./calculations";

export type DreamGoalSimDebt = {
  balance: number;
  rate: number; // APR percent, e.g. 18 for 18%
  minimumPayment: number;
};

export function simulateDebtPayoffMonths(
  debts: DreamGoalSimDebt[],
  extraMonthly: number,
  maxMonths = MAX_SIM_MONTHS
): number {
  // NOTE: returns Number.POSITIVE_INFINITY for both:
  // 1) mathematically impossible payoff under current budget, and
  // 2) simulations that do not finish within `maxMonths` (same cap as main strategy engine, 60y).
  if (debts.length === 0) return 0;

  const clean = debts.filter(
    (d) =>
      Number.isFinite(d.balance) &&
      Number.isFinite(d.rate) &&
      d.balance > 0 &&
      d.rate >= 0
  );
  if (clean.length === 0) return 0;

  let bals = clean.map((d) => d.balance);
  const rates = clean.map((d) => d.rate / 100 / 12);
  const mins = clean.map((d) =>
    Number.isFinite(d.minimumPayment) ? Math.max(0, d.minimumPayment) : 0
  );
  // Prevent month-1 over-allocation when entered minimum exceeds starting balance.
  const effectiveMins = clean.map((d, i) =>
    Math.min(Math.max(0, mins[i]), Math.max(0, d.balance || 0))
  );
  const totalMin = effectiveMins.reduce((s, m) => s + m, 0);
  const mp = totalMin + extraMonthly;

  if (mp <= 0) return Number.POSITIVE_INFINITY;

  const firstMonthInterest = bals.reduce((s, b, i) => s + (b > 0 ? b * rates[i] : 0), 0);
  // Early impossible-payoff detection: if payment cannot cover first month's interest,
  // total balance cannot decrease in month 1 under this simplified model.
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
        if (rem < 0.01) rem = 0;
      }
    }
    bals = bals.map((b) => (b < 0.01 ? 0 : b));
    months++;
  }

  return bals.some((b) => b > 0) ? Number.POSITIVE_INFINITY : months;
}

export function firstMonthInterestTotal(debts: DreamGoalSimDebt[]): number {
  const clean = debts.filter(
    (d) =>
      Number.isFinite(d.balance) &&
      Number.isFinite(d.rate) &&
      d.balance > 0 &&
      d.rate >= 0
  );
  return clean.reduce((s, d) => s + d.balance * (d.rate / 100 / 12), 0);
}

export function totalMinimumPayments(debts: DreamGoalSimDebt[]): number {
  return debts.reduce((s, d) => s + (d.minimumPayment || 0), 0);
}

/** Months to reach goal with monthly deposits at 4% APY, monthly compounding. */
export function monthsToSavingsGoal(savingsMonthly: number, goal: number, annualRate = 0.04): number | null {
  if (savingsMonthly <= 0 || goal <= 0 || annualRate < 0) return null;
  if (annualRate === 0) return Math.ceil(goal / savingsMonthly);
  const r = annualRate / 12;
  const n = Math.log(1 + (goal * r) / savingsMonthly) / Math.log(1 + r);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.ceil(n);
}

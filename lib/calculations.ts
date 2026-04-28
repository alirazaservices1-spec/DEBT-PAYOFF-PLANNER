import { dateToMonthYear } from "./monthYear";
import { getIrsUnderpaymentRateSummary } from "./irsUnderpaymentRate";

/** Simulation horizon (60 years). Anything longer is treated as stuck / impossible in UI. */
export const MAX_SIM_MONTHS = 720;

export type DebtType =
  | "creditCard"
  | "medical"
  | "personalLoan"
  | "studentLoan"
  | "taxDebt"
  | "auto"
  | "collectionAccount"
  | "repossessedVehicle"
  | "businessDebt"
  | "businessCreditCard"
  | "securedBusinessDebt"
  | "other";

export interface Debt {
  id: string;
  name: string;
  balance: number;
  /** Stated APR. For IRS/state tax on a payment plan: use underpayment interest from agency notices (updates quarterly; not a negotiated fixed rate). */
  apr: number;
  minimumPayment: number;
  debtType: DebtType;
  isSecured: boolean;
  dueDate: number;
  dateAdded: string;
  taxRate?: number;
  order?: number;
  /** When tax debt: true = on IRS/state payment plan (APR/min/due apply). False/undefined = not in plan; excluded from payoff strategy sim unless plan. */
  taxPaymentPlan?: boolean;
  /**
   * Promotional / intro APR (e.g. 0%). Used with `introEndsMonth` + `introEndsYear` through that calendar month (inclusive), then `apr` applies.
   * Ignored for tax debt. Strategy order still uses standard `apr` (avalanche/snowball).
   */
  introApr?: number;
  introEndsMonth?: number;
  introEndsYear?: number;
}

export interface DebtMonthSnapshot {
  debtId: string;
  balance: number;
  payment: number;
  principal: number;
  interest: number;
}

export interface MonthlySnapshot {
  month: number;
  date: Date;
  totalBalance: number;
  totalInterestPaid: number;
  totalPrincipalPaid: number;
  debtBreakdown: DebtMonthSnapshot[];
  paidOffDebts: string[];
}

export interface StrategyResult {
  snapshots: MonthlySnapshot[];
  totalInterestPaid: number;
  totalMonths: number;
  payoffDate: Date;
  totalPaid: number;
}

export type Strategy = "snowball" | "avalanche" | "custom";

export type RunStrategyOptions = {
  /** First simulated payment month; defaults to today. Use in tests for stable results. */
  simulationStartDate?: Date;
};

export function isSecuredByType(type: DebtType): boolean {
  return type === "auto" || type === "securedBusinessDebt";
}

export function isBusinessDebtType(type: DebtType): boolean {
  return type === "businessDebt" || type === "businessCreditCard" || type === "securedBusinessDebt";
}

/**
 * Standard monthly interest: balance × (APR / 12).
 */
function calculateMonthlyInterest(balance: number, apr: number): number {
  return balance * (apr / 100 / 12);
}

/**
 * APR charged for this payment month (intro vs standard). Tax debt always uses `apr`.
 * Intro applies through the end of `introEndsMonth` / `introEndsYear` (inclusive).
 */
export function effectiveAprForDebtMonth(debt: Debt, paymentMonthDate: Date): number {
  if (debt.debtType === "taxDebt") return debt.apr;
  if (
    debt.introApr != null &&
    debt.introEndsMonth != null &&
    debt.introEndsYear != null &&
    !Number.isNaN(debt.introApr)
  ) {
    const { month, year } = dateToMonthYear(paymentMonthDate);
    const endM = debt.introEndsMonth;
    const endY = debt.introEndsYear;
    const inIntro = year < endY || (year === endY && month <= endM);
    if (inIntro) return debt.introApr;
  }
  return debt.apr;
}

/**
 * IRS/tax debt uses DAILY compounding per IRS rules.
 * Daily rate = APR / 365. One month ≈ 365/12 = 30.4375 days.
 * Monthly interest = balance × ((1 + dailyRate)^(365/12) − 1)
 */
function calculateMonthlyInterestForDebt(debt: Debt, balance: number, asOfDate: Date): number {
  if (debt.debtType === "taxDebt" && debt.apr > 0) {
    const dailyRate = debt.apr / 100 / 365;
    const daysPerMonth = 365 / 12;
    return balance * (Math.pow(1 + dailyRate, daysPerMonth) - 1);
  }
  const apr = effectiveAprForDebtMonth(debt, asOfDate);
  return calculateMonthlyInterest(balance, apr);
}

/**
 * Debts included in avalanche/snowball/custom simulation.
 * - Tax debt is separate from payoff strategy unless explicitly on a payment plan:
 *   only included when taxPaymentPlan === true AND minimumPayment > 0.
 * - Any non-tax debt with $0 minimum would stall the sim — exclude.
 */
/**
 * For “interest saved vs minimum payments,” normalize revolving minimums to a
 * typical card-style baseline (~2% of current balance at setup, floor $25).
 * This avoids two distortions:
 * - extremely high entered minimums understating savings, and
 * - very low entered minimums causing non-amortizing baselines and absurd savings.
 *
 * We also enforce an amortization floor against the debt's stated APR so
 * the baseline remains realistic and does not run away from compounding.
 */
export function debtsForMinimumPaymentComparison(debts: Debt[]): Debt[] {
  return debts.map((d) => {
    if (d.debtType === "taxDebt") return d;
    if ((d.minimumPayment ?? 0) <= 0) return d;
    if (d.balance <= 0) return d;
    const revolving =
      d.debtType === "creditCard" ||
      d.debtType === "businessCreditCard" ||
      d.debtType === "collectionAccount";
    if (!revolving) return d;
    const typical = Math.max(25, Math.round(d.balance * 0.02));
    const monthlyInterestAtStatedApr = d.balance * (Math.max(0, d.apr) / 100 / 12);
    const amortizingFloor = Math.ceil(monthlyInterestAtStatedApr + Math.max(10, d.balance * 0.005));
    const normalizedMinimum = Math.max(typical, amortizingFloor);
    return { ...d, minimumPayment: normalizedMinimum };
  });
}

export function debtsEligibleForStrategy(debts: Debt[]): Debt[] {
  return debts.filter((d) => {
    if (d.debtType === "taxDebt") {
      return d.taxPaymentPlan === true && d.minimumPayment > 0;
    }
    if (d.minimumPayment <= 0) return false;
    return true;
  });
}

/** True if this tax debt is excluded from strategy (no plan or no min payment). */
export function isTaxDebtExcludedFromStrategy(d: Debt): boolean {
  if (d.debtType !== "taxDebt") return false;
  return !(d.taxPaymentPlan === true && d.minimumPayment > 0);
}

/**
 * IRS / state tax without a payment plan should not appear in payment reminders.
 * Same rules as strategy eligibility: positive balance, due day, min payment, and tax only if on plan.
 */
export function debtEligibleForPaymentReminder(d: Debt): boolean {
  if (d.balance <= 0 || d.dueDate == null || (d.minimumPayment || 0) <= 0) return false;
  return debtsEligibleForStrategy([d]).length > 0;
}

/**
 * Next calendar date (local) for a monthly due on `dueDayOfMonth` (1–31), on or after the start of `from`'s day.
 * Clamps to the last day of the month when the due day does not exist (e.g. 31 in February).
 */
export function getNextPaymentDueDate(dueDayOfMonth: number, from: Date = new Date()): Date {
  const y = from.getFullYear();
  const m = from.getMonth();
  const d = from.getDate();
  const lastDayOfMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();
  const clamp = (year: number, month: number, day: number) =>
    Math.min(Math.max(1, day), lastDayOfMonth(year, month));
  const thisDue = new Date(y, m, clamp(y, m, dueDayOfMonth));
  const todayStart = new Date(y, m, d);
  if (thisDue.getTime() >= todayStart.getTime()) return thisDue;
  let nm = m + 1;
  let ny = y;
  if (nm > 11) {
    nm = 0;
    ny += 1;
  }
  return new Date(ny, nm, clamp(ny, nm, dueDayOfMonth));
}

/** Whole calendar days from the start of `from` until the next due date (0 = due today). */
export function calendarDaysUntilPaymentDue(dueDayOfMonth: number, from: Date = new Date()): number {
  const next = getNextPaymentDueDate(dueDayOfMonth, from);
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(next.getFullYear(), next.getMonth(), next.getDate());
  return Math.round((b - a) / 86400000);
}

export function runStrategy(
  debts: Debt[],
  extraPayment: number,
  strategy: Strategy,
  customOrder?: string[],
  options?: RunStrategyOptions
): StrategyResult {
  const eligibleDebts = debtsEligibleForStrategy(debts);
  if (eligibleDebts.length === 0) {
    return {
      snapshots: [],
      totalInterestPaid: 0,
      totalMonths: 0,
      payoffDate: new Date(),
      totalPaid: 0,
    };
  }

  let sortedDebts: Debt[];
  if (strategy === "snowball") {
    // Snowball: smallest BALANCE first (roll momentum)
    sortedDebts = [...eligibleDebts].sort((a, b) => {
      if (a.balance !== b.balance) return a.balance - b.balance;
      // Tie-break uses stated APR (not effective intro APR): prioritizes higher post-promo cost.
      return b.apr - a.apr;
    });
  } else if (strategy === "avalanche") {
    // Stated-APR sort removed: effective APR (incl. 0% intro) is applied inside the loop each month.
    sortedDebts = [...eligibleDebts];
  } else {
    if (customOrder && customOrder.length > 0) {
      sortedDebts = customOrder
        .map((id) => eligibleDebts.find((d) => d.id === id))
        .filter(Boolean) as Debt[];
      const remaining = eligibleDebts.filter((d) => !customOrder.includes(d.id));
      sortedDebts = [...sortedDebts, ...remaining];
    } else {
      sortedDebts = [...eligibleDebts];
    }
  }

  // Total monthly budget = sum of all minimums + any extra the user adds.
  // When a debt is paid off, its freed minimum automatically becomes extra
  // (budget stays constant, active minimums shrink → extra pool grows).
  const baseMinimums = sortedDebts.reduce((sum, d) => sum + d.minimumPayment, 0);
  const monthlyBudget = baseMinimums + extraPayment;

  const balances = new Map<string, number>();
  sortedDebts.forEach((d) => balances.set(d.id, d.balance));

  const snapshots: MonthlySnapshot[] = [];
  let totalInterestPaid = 0;
  let totalPrincipalPaid = 0;
  let month = 0;
  const startDate = options?.simulationStartDate ? new Date(options.simulationStartDate) : new Date();

  while (month < MAX_SIM_MONTHS) {
    const allPaid = [...balances.values()].every((b) => b <= 0);
    if (allPaid) break;

    month++;
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + (month - 1));

    const breakdown: DebtMonthSnapshot[] = [];
    let monthInterest = 0;
    let monthPrincipal = 0;
    const paidOffThisMonth: string[] = [];

    // Active debts in strategy order (zero-balance debts are already paid off)
    let activeDebts = sortedDebts.filter((d) => (balances.get(d.id) ?? 0) > 0);

    if (activeDebts.length === 0) break;

    // Avalanche: re-rank every month by effective APR (0% intro, then stated APR after promo ends).
    // A one-time sort by `debt.apr` would always target high-stated-APR cards even while they charge 0%.
    if (strategy === "avalanche") {
      activeDebts = [...activeDebts].sort((a, b) => {
        const aprA = effectiveAprForDebtMonth(a, date);
        const aprB = effectiveAprForDebtMonth(b, date);
        if (aprB !== aprA) return aprB - aprA;
        return (balances.get(a.id) ?? 0) - (balances.get(b.id) ?? 0);
      });
    }

    // Step 1: compute this month's interest and minimum payment for each debt.
    // Tax debts use daily compounding; all others use standard monthly compounding.
    const monthInterestByDebt = new Map<string, number>();
    const monthMinByDebt = new Map<string, number>();
    let minTotalThisMonth = 0;

    for (const debt of activeDebts) {
      const balance = balances.get(debt.id) ?? 0;
      // Use per-debt interest calculation (daily for tax, monthly for others; intro APR by payment month)
      const interest = calculateMonthlyInterestForDebt(debt, balance, date);
      // Cap minimum at total owed (balance + interest) so we never overpay
      const minPay = Math.min(debt.minimumPayment, balance + interest);

      monthInterestByDebt.set(debt.id, interest);
      monthMinByDebt.set(debt.id, minPay);
      minTotalThisMonth += minPay;
    }

    // Step 2: this month's extra pool.
    // minTotalThisMonth <= baseMinimums <= monthlyBudget by construction, so extraPool is nonnegative.
    // Freed minimums from paid-off debts flow in automatically.
    const extraPool = monthlyBudget - minTotalThisMonth;
    let remainingExtra = extraPool;

    // Step 3: apply payments in strategy order.
    // Cascade extra across debts so surplus from paying off one target is not lost.
    for (let i = 0; i < activeDebts.length; i++) {
      const debt = activeDebts[i];
      const id = debt.id;
      const balance = balances.get(id) ?? 0;
      if (balance <= 0) continue;

      const interest = monthInterestByDebt.get(id) ?? 0;
      let payment = monthMinByDebt.get(id) ?? 0;

      // Strategy-ordered debts absorb extra one-by-one.
      // If a debt is fully paid and still leaves surplus, remainder flows to the next debt.
      if (remainingExtra > 0) {
        const maxExtra = Math.max(0, balance + interest - payment);
        const appliedExtra = Math.min(remainingExtra, maxExtra);
        payment += appliedExtra;
        remainingExtra -= appliedExtra;
      }

      const cappedPayment = Math.min(payment, balance + interest);
      // Balance accounting: interest accrues, then payment applies. When payment < interest,
      // the shortfall capitalizes and balance grows (was previously silently zeroed out).
      const newBalance = Math.max(0, balance + interest - cappedPayment);
      const principal = Math.max(0, cappedPayment - interest); // cash that reduced balance (display)

      monthInterest += interest;
      monthPrincipal += principal;

      balances.set(id, newBalance);

      breakdown.push({
        debtId: id,
        balance: newBalance,
        payment: cappedPayment,
        principal,
        interest,
      });

      if (newBalance <= 0) {
        paidOffThisMonth.push(id);
      }
    }

    totalInterestPaid += monthInterest;
    totalPrincipalPaid += monthPrincipal;

    const totalBalance = [...balances.values()].reduce((sum, b) => sum + Math.max(0, b), 0);

    snapshots.push({
      month,
      date,
      totalBalance,
      totalInterestPaid,
      totalPrincipalPaid,
      debtBreakdown: breakdown,
      paidOffDebts: paidOffThisMonth,
    });
  }

  const payoffDate = snapshots.length > 0 ? snapshots[snapshots.length - 1].date : new Date();

  return {
    snapshots,
    totalInterestPaid,
    totalMonths: month,
    payoffDate,
    totalPaid: totalInterestPaid + eligibleDebts.reduce((s, d) => s + d.balance, 0),
  };
}

/**
 * Minimum-payment baseline with each debt simulated in isolation: only that debt’s minimum is paid,
 * no shared monthly budget and no rollover of freed minimums. Matches “true” min-only interest per card summed.
 */
export function runMinOnlyBaseline(debts: Debt[], options?: RunStrategyOptions): number {
  const eligible = debtsEligibleForStrategy(debts);
  const startDate = options?.simulationStartDate ? new Date(options.simulationStartDate) : new Date();
  startDate.setHours(12, 0, 0, 0);
  let totalInterest = 0;
  for (const debt of eligible) {
    let bal = debt.balance;
    let month = 0;
    while (bal > 0.005 && month < MAX_SIM_MONTHS) {
      month++;
      const d = new Date(startDate);
      d.setMonth(startDate.getMonth() + month - 1);
      const interest = calculateMonthlyInterestForDebt(debt, bal, d);
      const pay = Math.min(debt.minimumPayment, bal + interest);
      bal = Math.max(0, bal + interest - pay);
      totalInterest += interest;
    }
  }
  return totalInterest;
}

/** Interest avoided: isolated min-only baseline (typical revolving mins) vs your plan’s total interest. */
export function projectedInterestSavedVsMinimumPayments(
  debts: Debt[],
  activeTotalInterestPaid: number,
  _selectedStrategy: Strategy,
  _customOrder?: string[],
  options?: RunStrategyOptions
): number {
  if (debtsEligibleForStrategy(debts).length === 0) return 0;
  const adjusted = debtsForMinimumPaymentComparison(debts);
  const minOnlyInterest = runMinOnlyBaseline(adjusted, options);
  return Math.max(0, Math.round(minOnlyInterest - activeTotalInterestPaid));
}

/**
 * Test function — logs snowball vs avalanche comparison to console.
 * Run manually to verify correct strategy separation.
 */
export function testStrategyCalcs(): void {
  if (typeof __DEV__ !== "undefined" && !__DEV__) return;

  const testDebts: Debt[] = [
    {
      id: "chase",
      name: "Chase",
      balance: 26000,
      apr: 25,
      minimumPayment: 200,
      debtType: "creditCard",
      isSecured: false,
      dueDate: 15,
      dateAdded: new Date().toISOString(),
    },
    {
      id: "personal",
      name: "Personal Loan",
      balance: 5000,
      apr: 15,
      minimumPayment: 150,
      debtType: "personalLoan",
      isSecured: false,
      dueDate: 15,
      dateAdded: new Date().toISOString(),
    },
    // IRS $25k at 0% with no payment plan — excluded from strategy by design
  ];

  const extraPayment = 500;
  const snowball = runStrategy(testDebts, extraPayment, "snowball");
  const avalanche = runStrategy(testDebts, extraPayment, "avalanche");

  console.log("=== Strategy Test (extra $500/mo) ===");
  console.log("Snowball  — months:", snowball.totalMonths, "| interest: $" + snowball.totalInterestPaid.toFixed(2));
  console.log("Avalanche — months:", avalanche.totalMonths, "| interest: $" + avalanche.totalInterestPaid.toFixed(2));
  console.log("Interest saved by Avalanche: $" + Math.max(0, snowball.totalInterestPaid - avalanche.totalInterestPaid).toFixed(2));
  console.log("Snowball payoff order: Personal first, then Chase");
  console.log("Avalanche payoff order: Chase first (25% APR), then Personal (15% APR)");

  const irsPublishedApr = getIrsUnderpaymentRateSummary().annualPercent;
  const irsApr = Number.isFinite(irsPublishedApr) ? irsPublishedApr : 6;

  // IRS tax debt daily compounding example (APR from published underpayment table)
  const irsDebt: Debt = {
    id: "irs",
    name: "IRS",
    balance: 25000,
    apr: irsApr,
    minimumPayment: 300,
    debtType: "taxDebt",
    isSecured: false,
    dueDate: 15,
    dateAdded: new Date().toISOString(),
    taxPaymentPlan: true,
  };
  const monthlyStandard = calculateMonthlyInterest(irsDebt.balance, irsDebt.apr);
  const dailyRate = irsDebt.apr / 100 / 365;
  const monthlyDaily = irsDebt.balance * (Math.pow(1 + dailyRate, 365 / 12) - 1);
  console.log(`=== IRS Daily vs Monthly Compounding ($25k at ${irsApr}%) ===`);
  console.log("Monthly compounding: $" + monthlyStandard.toFixed(2) + "/mo");
  console.log("Daily compounding:   $" + monthlyDaily.toFixed(2) + "/mo");
}

export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 10_000) {
    return `$${(amount / 1_000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyFull(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function monthsToText(months: number): string {
  if (months < 1) return "< 1 mo";
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m} mo`;
  if (m === 0) return `${y} ${y === 1 ? "yr" : "yrs"}`;
  return `${y} ${y === 1 ? "yr" : "yrs"} ${m} mo`;
}

export function debtTypeLabel(type: DebtType): string {
  const labels: Record<DebtType, string> = {
    creditCard: "Credit Card",
    medical: "Medical",
    personalLoan: "Personal Loan",
    studentLoan: "Student Loan",
    taxDebt: "Tax Debt",
    auto: "Auto Loan",
    collectionAccount: "Collection Account",
    repossessedVehicle: "Repossessed Vehicle",
    businessDebt: "Business Loan",
    businessCreditCard: "Business Credit Card",
    securedBusinessDebt: "Secured Business Debt",
    other: "Other",
  };
  return labels[type] ?? "Other";
}

export function debtTypeIcon(type: DebtType): string {
  const icons: Record<DebtType, string> = {
    creditCard: "card",
    medical: "medkit",
    personalLoan: "cash",
    studentLoan: "school",
    taxDebt: "receipt",
    auto: "car",
    collectionAccount: "alert-circle",
    repossessedVehicle: "car-outline",
    businessDebt: "briefcase",
    businessCreditCard: "card-outline",
    securedBusinessDebt: "lock-closed",
    other: "ellipsis-horizontal-circle",
  };
  return icons[type] ?? "ellipsis-horizontal-circle";
}

export interface ConsolidationResult {
  monthlyPayment: number;
  totalInterestPaid: number;
  totalMonths: number;
  payoffDate: Date;
  totalPaid: number;
}

export function runConsolidationScenario(
  totalBalance: number,
  consolidationApr: number,
  monthlyPayment: number
): ConsolidationResult {
  if (totalBalance <= 0 || monthlyPayment <= 0) {
    return { monthlyPayment, totalInterestPaid: 0, totalMonths: 0, payoffDate: new Date(), totalPaid: totalBalance };
  }
  const monthlyRate = consolidationApr / 100 / 12;
  let balance = totalBalance;
  let totalInterest = 0;
  let months = 0;

  while (balance > 0 && months < MAX_SIM_MONTHS) {
    const interest = balance * monthlyRate;
    const payment = Math.min(monthlyPayment, balance + interest);
    balance = Math.max(0, balance + interest - payment);
    totalInterest += interest;
    months++;
  }

  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + months);
  return {
    monthlyPayment,
    totalInterestPaid: totalInterest,
    totalMonths: months,
    payoffDate,
    totalPaid: totalBalance + totalInterest,
  };
}

/**
 * Rough per-card payoff date using only that debt’s minimum (not the full plan budget).
 * @param startDate First simulated payment month anchor (default: today).
 */
export function estimatePayoffDate(debt: Debt, startDate: Date = new Date()): Date {
  const anchor = new Date(startDate);
  anchor.setHours(12, 0, 0, 0);
  if (debt.minimumPayment <= 0 || debt.balance <= 0) return new Date(anchor);

  let balance = debt.balance;
  let months = 0;

  while (balance > 0 && months < MAX_SIM_MONTHS) {
    const currentDate = new Date(anchor);
    currentDate.setMonth(anchor.getMonth() + months);

    // Single source of truth: daily for tax debt, monthly + intro APR for everything else.
    const interest = calculateMonthlyInterestForDebt(debt, balance, currentDate);
    const pay = Math.min(debt.minimumPayment, balance + interest);
    balance = Math.max(0, balance + interest - pay);
    months++;
  }

  const payoff = new Date(anchor);
  payoff.setMonth(anchor.getMonth() + months);
  return payoff;
}

export function approximateDebtRange(totalUnsecured: number): string {
  const t = Math.max(0, totalUnsecured);
  const low = Math.round(t * 0.4 / 1000) * 1000;
  const high = Math.round(t * 0.6 / 1000) * 1000;
  return `$${low.toLocaleString()} - $${high.toLocaleString()}`;
}

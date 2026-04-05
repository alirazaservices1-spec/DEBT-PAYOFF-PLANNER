import { dateToMonthYear } from "./monthYear";

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
 * For “interest saved vs minimum payments,” cap revolving minimums to a typical ~2% of balance
 * (floor $25). Users sometimes enter a pay-down amount as “minimum,” which makes the baseline
 * payoff too fast and understates savings vs true card-style minimums.
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
    if (d.minimumPayment <= typical) return d;
    return { ...d, minimumPayment: typical };
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
  debts = debtsEligibleForStrategy(debts);
  if (debts.length === 0) {
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
    sortedDebts = [...debts].sort((a, b) => {
      if (a.balance !== b.balance) return a.balance - b.balance;
      return b.apr - a.apr; // tie-break: higher APR first
    });
  } else if (strategy === "avalanche") {
    // Avalanche: highest APR first (minimize total interest)
    sortedDebts = [...debts].sort((a, b) => {
      if (b.apr !== a.apr) return b.apr - a.apr;
      return a.balance - b.balance; // tie-break: smaller balance first
    });
  } else {
    if (customOrder && customOrder.length > 0) {
      sortedDebts = customOrder
        .map((id) => debts.find((d) => d.id === id))
        .filter(Boolean) as Debt[];
      const remaining = debts.filter((d) => !customOrder.includes(d.id));
      sortedDebts = [...sortedDebts, ...remaining];
    } else {
      sortedDebts = [...debts];
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
  const MAX_MONTHS = 600;
  const startDate = options?.simulationStartDate ? new Date(options.simulationStartDate) : new Date();

  while (month < MAX_MONTHS) {
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
    const activeDebts = sortedDebts.filter((d) => (balances.get(d.id) ?? 0) > 0);

    if (activeDebts.length === 0) break;

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

    // Step 2: compute this month's available budget.
    // If minimums exceed budget (edge case: very high interest), still pay minimums.
    const available = Math.max(monthlyBudget, minTotalThisMonth);
    // Extra pool = everything above required minimums.
    // This naturally includes freed minimums from paid-off debts.
    const extraPool = Math.max(0, available - minTotalThisMonth);

    // Step 3: apply payments in strategy order.
    // The FIRST active debt gets all extra; remaining debts get their minimums.
    for (let i = 0; i < activeDebts.length; i++) {
      const debt = activeDebts[i];
      const id = debt.id;
      const balance = balances.get(id) ?? 0;
      if (balance <= 0) continue;

      const interest = monthInterestByDebt.get(id) ?? 0;
      let payment = monthMinByDebt.get(id) ?? 0;

      // Target debt (first in strategy order) absorbs all extra.
      if (i === 0 && extraPool > 0) {
        const maxExtra = Math.max(0, balance + interest - payment);
        payment += Math.min(extraPool, maxExtra);
      }

      const cappedPayment = Math.min(payment, balance + interest);
      const principal = Math.max(0, cappedPayment - interest);

      monthInterest += interest;
      monthPrincipal += principal;

      const newBalance = Math.max(0, balance - principal);
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
    totalPaid: totalInterestPaid + debts.reduce((s, d) => s + d.balance, 0),
  };
}

/** Interest avoided: pay-only-minimums baseline (typical revolving mins) vs your plan’s total interest. */
export function projectedInterestSavedVsMinimumPayments(
  debts: Debt[],
  activeTotalInterestPaid: number,
  selectedStrategy: Strategy,
  customOrder?: string[]
): number {
  if (debtsEligibleForStrategy(debts).length === 0) return 0;
  const adjusted = debtsForMinimumPaymentComparison(debts);
  const minOnly = runStrategy(
    adjusted,
    0,
    selectedStrategy === "custom" ? "custom" : selectedStrategy,
    selectedStrategy === "custom" ? customOrder : undefined
  );
  return Math.max(0, Math.round(minOnly.totalInterestPaid - activeTotalInterestPaid));
}

/**
 * Test function — logs snowball vs avalanche comparison to console.
 * Run manually to verify correct strategy separation.
 */
export function testStrategyCalcs(): void {
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

  // IRS tax debt daily compounding example
  const irsDebt: Debt = {
    id: "irs",
    name: "IRS",
    balance: 25000,
    apr: 7, // IRS current rate ~7%
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
  console.log("=== IRS Daily vs Monthly Compounding ($25k at 7%) ===");
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

  while (balance > 0 && months < 600) {
    const interest = balance * monthlyRate;
    const payment = Math.min(monthlyPayment, balance + interest);
    const principal = payment - interest;
    if (principal <= 0) { months = 600; break; }
    balance -= principal;
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

export function estimatePayoffDate(debt: Debt): Date {
  const date = new Date();
  if (debt.minimumPayment <= 0 || debt.balance <= 0) return date;

  let balance = debt.balance;
  let months = 0;
  const monthlyRate = debt.apr / 100 / 12;

  while (balance > 0 && months < 600) {
    const interest = balance * monthlyRate;
    const principalRaw = Math.max(0, debt.minimumPayment - interest);
    if (principalRaw <= 0) {
      months = 600;
      break;
    }
    const principal = Math.min(principalRaw, balance);
    balance -= principal;
    months++;
  }

  date.setMonth(date.getMonth() + months);
  return date;
}

export function approximateDebtRange(totalUnsecured: number): string {
  const low = Math.round(totalUnsecured * 0.4 / 1000) * 1000;
  const high = Math.round(totalUnsecured * 0.6 / 1000) * 1000;
  return `$${low.toLocaleString()} - $${high.toLocaleString()}`;
}

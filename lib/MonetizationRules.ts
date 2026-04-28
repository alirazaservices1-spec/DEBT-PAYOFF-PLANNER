// Affiliate URLs via affiliateKey only.

export type MonetizationScreen = "dashboard" | "debtDetail" | "strategy" | "calc";

export interface RecommendationDebt {
  id: string;
  name: string;
  balance: number;
  apr: number;
  category: string;
  debtType?: string;
  isSecured?: boolean;
  debtFreeDate?: Date | null;
}

export interface Recommendation {
  id: string;
  icon: string;
  header: string;
  /** Sentence only — "Check if you qualify." is rendered as inline link in UI */
  body: string;
  /** Inline link text at end of sentence */
  linkText: string;
  affiliateKey: string;
}

function isTaxDebt(d: RecommendationDebt): boolean {
  return d.debtType === "taxDebt" || d.category === "taxDebt" || d.category === "IRS / Tax Debt";
}

function isBusinessMCA(d: RecommendationDebt): boolean {
  return (
    d.debtType === "businessDebt" ||
    d.debtType === "businessCreditCard" ||
    d.debtType === "securedBusinessDebt" ||
    d.category === "businessDebt" ||
    d.category === "Business Loan" ||
    d.category === "Merchant Cash Advance"
  );
}

/** Unsecured = credit cards, personal loans, medical, etc. — NOT tax, NOT secured, NOT business/MCA */
function isUnsecured(d: RecommendationDebt): boolean {
  return !isTaxDebt(d) && !isBusinessMCA(d) && !d.isSecured;
}

const LINK_TEXT = "Check if you qualify.";
const MEANS_TEST_LINK_TEXT = "Get a free bankruptcy assessment →";

/** Minimum balance for that debt category before we show a recommendation (per product rules). */
export const RECOMMENDATION_MIN_BALANCE = 10000;

const fmtDollars = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const fmtApr = (n: number) => `${Number(n.toFixed(2))}`;

/**
 * Recommendation engine — exact client rules. Only returns cards whose threshold is met.
 * Each rule applies only when that category's total balance exceeds RECOMMENDATION_MIN_BALANCE.
 */
export function getRecommendations(
  debts: RecommendationDebt[],
  _screen: MonetizationScreen
): Recommendation[] {
  if (debts.length === 0) return [];

  const taxDebts = debts.filter(isTaxDebt);
  const businessDebts = debts.filter(isBusinessMCA);
  const unsecuredDebts = debts.filter(isUnsecured);
  const taxTotal = taxDebts.reduce((s, d) => s + d.balance, 0);
  const businessTotal = businessDebts.reduce((s, d) => s + d.balance, 0);
  const unsecuredTotal = unsecuredDebts.reduce((s, d) => s + d.balance, 0);
  const unsecuredCount = unsecuredDebts.length;
  const taxCount = taxDebts.length;
  const totalDebt = debts.reduce((s, d) => s + d.balance, 0);
  const highestApr = debts.reduce((max, d) => Math.max(max, d.apr || 0), 0);
  const highAprBalanceTotal = debts
    .filter((d) => (d.apr || 0) >= 18)
    .reduce((s, d) => s + d.balance, 0);

  const out: Recommendation[] = [];

  // 1. IRS / State tax debt
  if (taxTotal > RECOMMENDATION_MIN_BALANCE) {
    const taxAcct =
      taxCount === 1 ? "1 tax account" : `${taxCount} tax accounts`;
    out.push({
      id: "tax",
      icon: "🏛️",
      header: "Tax debt relief",
      body: `About ${fmtDollars(taxTotal)} across ${taxAcct} in your list (IRS / tax only - not credit cards). Get a free tax debt relief consultation.`,
      linkText: LINK_TEXT,
      affiliateKey: "TAX_RELIEF",
    });
  }

  // 2. Unsecured debt (credit cards, personal loans, etc.—not tax, not secured, not business/MCA)
  if (unsecuredTotal > RECOMMENDATION_MIN_BALANCE) {
    const acct =
      unsecuredCount === 1 ? "1 unsecured account" : `${unsecuredCount} unsecured accounts`;
    out.push({
      id: "relief",
      icon: "✨",
      header: "Debt relief",
      body: `About ${fmtDollars(unsecuredTotal)} across ${acct} (cards & similar - tax and secured loans are separate). Get a free debt relief consultation.`,
      linkText: LINK_TEXT,
      affiliateKey: "DEBT_RELIEF",
    });
  }

  // 3. Business / MCA
  if (businessTotal > RECOMMENDATION_MIN_BALANCE) {
    out.push({
      id: "business",
      icon: "🏢",
      header: "Business debt relief",
      body: `About ${fmtDollars(businessTotal)} in business-related debts in your list. Get a free business debt relief consultation.`,
      linkText: LINK_TEXT,
      affiliateKey: "BUSINESS_RELIEF",
    });
  }

  // 4. High interest — balance on APR ≥ 18% debts must exceed threshold
  if (highestApr >= 18 && highAprBalanceTotal > RECOMMENDATION_MIN_BALANCE) {
    out.push({
      id: "rate",
      icon: "📉",
      header: "Lower interest rate",
      body: `Because you are paying ${fmtApr(highestApr)}% APR, you may qualify for a lower interest rate.`,
      linkText: LINK_TEXT,
      affiliateKey: "CONSOLIDATION",
    });
  }

  // 5. Bankruptcy assessment (everything in the list, including tax)
  if (totalDebt > RECOMMENDATION_MIN_BALANCE) {
    const acct = debts.length === 1 ? "1 account" : `${debts.length} accounts`;
    out.push({
      id: "means_test",
      icon: "⚖️",
      header: "Free bankruptcy assessment",
      body: `About ${fmtDollars(totalDebt)} total across ${acct} in your debt list (all types). Get a free bankruptcy assessment.`,
      linkText: MEANS_TEST_LINK_TEXT,
      affiliateKey: "MEANS_TEST",
    });
  }

  return out;
}

export const RESOURCE_CENTER = [
  { label: "Lower My Interest", sublabel: "Consolidation Loans", affiliateKey: "CONSOLIDATION" },
  { label: "Reduce My Balance", sublabel: "Debt Relief Programs", affiliateKey: "DEBT_RELIEF" },
  { label: "Help with Business Debt", sublabel: "Commercial Restructuring", affiliateKey: "BUSINESS_RELIEF" },
  { label: "Help with IRS Debt", sublabel: "Tax Relief Programs", affiliateKey: "TAX_RELIEF" },
];

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

/**
 * Recommendation engine — exact client rules. Only returns cards whose threshold is met.
 * 1. Tax debt > $5k  2. Unsecured > $10k  3. Business/MCA > $15k  4. Any debt APR >= 18%
 */
export function getRecommendations(
  debts: RecommendationDebt[],
  _screen: MonetizationScreen
): Recommendation[] {
  if (debts.length === 0) return [];

  const taxTotal = debts.filter(isTaxDebt).reduce((s, d) => s + d.balance, 0);
  const businessTotal = debts.filter(isBusinessMCA).reduce((s, d) => s + d.balance, 0);
  const unsecuredTotal = debts.filter(isUnsecured).reduce((s, d) => s + d.balance, 0);
  const highestApr = debts.reduce((max, d) => Math.max(max, d.apr || 0), 0);

  const fmtDollars = (n: number) =>
    `$${Math.round(n).toLocaleString("en-US")}`;
  const fmtApr = (n: number) => `${Number(n.toFixed(2))}`;

  const out: Recommendation[] = [];

  // 1. IRS / State tax debt — trigger: total tax debt > $5,000
  if (taxTotal > 5000) {
    out.push({
      id: "tax",
      icon: "🏛️",
      header: "Tax debt relief",
      body: `Because you have ${fmtDollars(taxTotal)} in tax debt, you may benefit from tax debt relief.`,
      linkText: LINK_TEXT,
      affiliateKey: "TAX_RELIEF",
    });
  }

  // 2. Unsecured debt — trigger: total unsecured > $10,000
  if (unsecuredTotal > 10000) {
    out.push({
      id: "relief",
      icon: "✨",
      header: "Debt relief",
      body: `Because you have ${fmtDollars(unsecuredTotal)} in unsecured debts, you may benefit from debt relief.`,
      linkText: LINK_TEXT,
      affiliateKey: "DEBT_RELIEF",
    });
  }

  // 3. Business / MCA — trigger: total business or MCA debt > $15,000
  if (businessTotal > 15000) {
    out.push({
      id: "business",
      icon: "🏢",
      header: "Business debt relief",
      body: `Because you have ${fmtDollars(businessTotal)} in business debts, you may benefit from business debt relief.`,
      linkText: LINK_TEXT,
      affiliateKey: "BUSINESS_RELIEF",
    });
  }

  // 4. High interest — trigger: ANY debt has APR >= 18% (use highest APR)
  if (highestApr >= 18) {
    out.push({
      id: "rate",
      icon: "📉",
      header: "Lower interest rate",
      body: `Because you are paying ${fmtApr(highestApr)}% APR, you may qualify for a lower interest rate.`,
      linkText: LINK_TEXT,
      affiliateKey: "CONSOLIDATION",
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

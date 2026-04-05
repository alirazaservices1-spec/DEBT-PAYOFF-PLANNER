/**
 * Intro APR + payoff strategy checks (deterministic dates).
 * Includes month-by-month numbers you can paste into ChatGPT / a spreadsheet
 * (same rules: monthly interest = balance × APR/12, pay minimums then extra to first debt).
 *
 * Run: npx tsx scripts/test-intro-strategy.ts
 */
import assert from "node:assert";
import {
  runStrategy,
  effectiveAprForDebtMonth,
  type Debt,
} from "../lib/calculations";

/** Float compare for dollar math (binary rounding). */
function approx(a: number, b: number, eps = 0.02, label?: string) {
  const ok = Math.abs(a - b) < eps;
  assert.ok(ok, label ?? `expected ~${b}, got ${a} (eps ${eps})`);
}

function ok(name: string, fn: () => void) {
  try {
    fn();
    console.log("OK:", name);
  } catch (e) {
    console.error("FAIL:", name, e);
    process.exitCode = 1;
  }
}

const baseDebt = (over: Partial<Debt> & Pick<Debt, "id" | "name" | "balance" | "apr" | "minimumPayment">): Debt => ({
  debtType: "creditCard",
  isSecured: false,
  dueDate: 15,
  dateAdded: new Date().toISOString(),
  ...over,
});

const START = new Date(2026, 0, 15, 12, 0, 0, 0); // Jan 15, 2026 — stable “first payment month”

ok("effectiveApr: 0% intro through end month, then standard APR", () => {
  const d = baseDebt({
    id: "c1",
    name: "Card",
    balance: 1000,
    apr: 24,
    minimumPayment: 50,
    introApr: 0,
    introEndsMonth: 3,
    introEndsYear: 2026,
  });
  assert.strictEqual(effectiveAprForDebtMonth(d, new Date(2026, 0, 10)), 0);
  assert.strictEqual(effectiveAprForDebtMonth(d, new Date(2026, 2, 28)), 0);
  assert.strictEqual(effectiveAprForDebtMonth(d, new Date(2026, 3, 1)), 24);
});

ok("intro months accrue $0 interest (single debt, avalanche)", () => {
  const debts: Debt[] = [
    baseDebt({
      id: "a",
      name: "Promo",
      balance: 1200,
      apr: 24,
      minimumPayment: 100,
      introApr: 0,
      introEndsMonth: 3,
      introEndsYear: 2026,
    }),
  ];
  const r = runStrategy(debts, 0, "avalanche", undefined, { simulationStartDate: START });
  const snap = r.snapshots;
  assert(snap.length >= 3, "expected ≥3 months");
  // Jan–Mar 2026: payment month dates are Jan, Feb, Mar → still intro
  assert.strictEqual(snap[0].debtBreakdown[0].interest, 0);
  assert.strictEqual(snap[1].debtBreakdown[0].interest, 0);
  assert.strictEqual(snap[2].debtBreakdown[0].interest, 0);
  // April 2026: first month after intro end → positive interest
  assert(snap[3].debtBreakdown[0].interest > 0, "Apr should charge standard APR interest");
});

ok("total interest with intro < same sim without intro (apples-to-apples)", () => {
  const common = {
    id: "x",
    name: "Card",
    balance: 2000,
    apr: 22,
    minimumPayment: 80,
  };
  const withIntro = baseDebt({
    ...common,
    introApr: 0,
    introEndsMonth: 2,
    introEndsYear: 2026,
  });
  const noIntro = baseDebt({ ...common });
  const a = runStrategy([withIntro], 50, "avalanche", undefined, { simulationStartDate: START });
  const b = runStrategy([noIntro], 50, "avalanche", undefined, { simulationStartDate: START });
  assert(a.totalInterestPaid < b.totalInterestPaid, "intro should reduce total interest");
});

ok("avalanche vs snowball both finite; order differs but same budget", () => {
  const debts: Debt[] = [
    baseDebt({
      id: "high",
      name: "High",
      balance: 800,
      apr: 26,
      minimumPayment: 40,
      introApr: 0,
      introEndsMonth: 1,
      introEndsYear: 2026,
    }),
    baseDebt({
      id: "low",
      name: "Low",
      balance: 500,
      apr: 12,
      minimumPayment: 25,
    }),
  ];
  const av = runStrategy(debts, 100, "avalanche", undefined, { simulationStartDate: START });
  const sb = runStrategy(debts, 100, "snowball", undefined, { simulationStartDate: START });
  assert(av.totalMonths > 0 && sb.totalMonths > 0);
  assert(Number.isFinite(av.totalInterestPaid) && Number.isFinite(sb.totalInterestPaid));
});

/**
 * Temporary / promo rate — hand check (matches typical ChatGPT walkthrough):
 * - Start Jan 2026, 0% intro through Mar 2026 inclusive, then 24% APR.
 * - Balance $1000, minimum $100/mo, $0 extra, avalanche (only one debt).
 *
 * Month 1 (Jan): interest $0 → pay $100 principal → $900
 * Month 2 (Feb): $0 → $800
 * Month 3 (Mar): $0 → $700
 * Month 4 (Apr): interest = 700×(24%/12) = $14 → principal $86 → $614
 */
ok("spreadsheet parity: 0% intro through Mar 2026, then 24% (exact month balances)", () => {
  const debts: Debt[] = [
    baseDebt({
      id: "promo",
      name: "Promo Card",
      balance: 1000,
      apr: 24,
      minimumPayment: 100,
      introApr: 0,
      introEndsMonth: 3,
      introEndsYear: 2026,
    }),
  ];
  const r = runStrategy(debts, 0, "avalanche", undefined, { simulationStartDate: START });
  const s = r.snapshots;
  assert.strictEqual(s[0].debtBreakdown[0].interest, 0);
  assert.strictEqual(s[1].debtBreakdown[0].interest, 0);
  assert.strictEqual(s[2].debtBreakdown[0].interest, 0);
  assert.strictEqual(s[0].debtBreakdown[0].balance, 900);
  assert.strictEqual(s[1].debtBreakdown[0].balance, 800);
  assert.strictEqual(s[2].debtBreakdown[0].balance, 700);
  assert.strictEqual(s[3].debtBreakdown[0].interest, 14);
  assert.strictEqual(s[3].debtBreakdown[0].balance, 614);
  assert.strictEqual(s[0].date.getMonth(), 0); // January
  assert.strictEqual(s[3].date.getMonth(), 3); // April (first month after intro)
});

/**
 * Non-zero temporary rate (e.g. 3.99% promo): intro through Jan 2026 only, then 22% APR.
 * Jan: interest = 2000 × 3.99% / 12 = 6.65; pay $150 → principal 143.35 → balance 1856.65
 * Feb: interest = 1856.65 × 22% / 12 ≈ 34.038833…
 */
ok("spreadsheet parity: 3.99% intro one month, then 22% APR", () => {
  const debts: Debt[] = [
    baseDebt({
      id: "split",
      name: "Split Rate Card",
      balance: 2000,
      apr: 22,
      minimumPayment: 150,
      introApr: 3.99,
      introEndsMonth: 1,
      introEndsYear: 2026,
    }),
  ];
  const r = runStrategy(debts, 0, "avalanche", undefined, { simulationStartDate: START });
  const jan = r.snapshots[0].debtBreakdown[0];
  const feb = r.snapshots[1].debtBreakdown[0];
  approx(jan.interest, 2000 * (3.99 / 100) / 12, 0.001, "Jan interest = balance × 3.99% / 12");
  approx(jan.balance, 2000 - (150 - jan.interest), 0.01, "Jan ending balance");
  const balAfterJan = 2000 - (150 - jan.interest);
  const febInt = balAfterJan * (22 / 100) / 12;
  approx(feb.interest, febInt, 0.02, "Feb interest = post-Jan balance × 22% / 12");
  approx(feb.balance, balAfterJan - (150 - feb.interest), 0.02, "Feb ending balance");
});

console.log("\nDone. Exit code:", process.exitCode ?? 0);

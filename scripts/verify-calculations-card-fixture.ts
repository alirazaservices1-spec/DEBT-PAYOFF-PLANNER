/**
 * Regression fixture: Card A/B + $480/mo budget after avalanche intro + neutral-baseline fixes.
 * Run: npx tsx scripts/verify-calculations-card-fixture.ts
 *
 * Intro “24 months” from first payment Apr 2026: last 0% month = Mar 2028 → introEndsMonth 3, introEndsYear 2028.
 */
import assert from "node:assert";
import { runStrategy, projectedInterestSavedVsMinimumPayments } from "../lib/calculations";

const SIM_START = new Date(2026, 3, 1, 12, 0, 0, 0);

const base = {
  debtType: "creditCard" as const,
  isSecured: false,
  dueDate: 15,
  dateAdded: new Date().toISOString(),
};

const fixtureDebts = [
  {
    ...base,
    id: "A",
    name: "Card A",
    balance: 8000,
    apr: 24.99,
    minimumPayment: 160,
    introApr: 0,
    introEndsMonth: 3,
    introEndsYear: 2028,
  },
  {
    ...base,
    id: "B",
    name: "Card B",
    balance: 6000,
    apr: 21.99,
    minimumPayment: 120,
  },
];

const EXTRA = 200; // 160 + 120 + 200 = 480/mo

function firstSnapshotMonthDebtZero(
  snapshots: { debtBreakdown: { debtId: string; balance: number }[] }[],
  debtId: string
): number | null {
  for (let i = 0; i < snapshots.length; i++) {
    const row = snapshots[i].debtBreakdown.find((d) => d.debtId === debtId);
    const prev = i > 0 ? snapshots[i - 1].debtBreakdown.find((d) => d.debtId === debtId) : null;
    if (row && row.balance <= 0.01 && prev && prev.balance > 0.01) return i + 1;
  }
  return null;
}

const sb = runStrategy(fixtureDebts, EXTRA, "snowball", undefined, { simulationStartDate: SIM_START });
const av = runStrategy(fixtureDebts, EXTRA, "avalanche", undefined, { simulationStartDate: SIM_START });

const saved = projectedInterestSavedVsMinimumPayments(
  fixtureDebts,
  sb.totalInterestPaid,
  "snowball",
  undefined,
  { simulationStartDate: SIM_START }
);
const savedAv = projectedInterestSavedVsMinimumPayments(
  fixtureDebts,
  av.totalInterestPaid,
  "avalanche",
  undefined,
  { simulationStartDate: SIM_START }
);

console.log("Snowball  — months:", sb.totalMonths, "| interest: $" + sb.totalInterestPaid.toFixed(2));
console.log("Avalanche — months:", av.totalMonths, "| interest: $" + av.totalInterestPaid.toFixed(2));
console.log("Interest saved vs min-only (snowball plan): $" + saved.toFixed(2));
console.log("Interest saved vs min-only (avalanche plan): $" + savedAv.toFixed(2));
console.log("Card B paid off (snapshot month):", firstSnapshotMonthDebtZero(sb.snapshots, "B"));

assert.strictEqual(sb.totalMonths, 34);
assert.strictEqual(av.totalMonths, 34);
assert.strictEqual(Math.round(sb.totalInterestPaid), 1895);
assert.strictEqual(Math.round(av.totalInterestPaid), 1895);
assert.strictEqual(sb.totalInterestPaid, av.totalInterestPaid);
assert.strictEqual(firstSnapshotMonthDebtZero(sb.snapshots, "B"), 24);
assert.strictEqual(firstSnapshotMonthDebtZero(av.snapshots, "B"), 24);
assert.strictEqual(saved, 10386);
assert.strictEqual(savedAv, 10386);

console.log("\nOK — calculations card fixture passed.\n");

/**
 * Snowball vs Avalanche with intro APR (12 mo vs 24 mo scenarios).
 * Run: npx tsx scripts/test-strategy-comparison.ts
 */
import assert from "node:assert";
import { runStrategy, type Debt } from "../lib/calculations";

const START = new Date(2026, 3, 1, 12, 0, 0, 0); // Apr 1, 2026 — stable first payment month

function base(over: Partial<Debt> & Pick<Debt, "id" | "name" | "balance" | "apr" | "minimumPayment">): Debt {
  return {
    debtType: "creditCard",
    isSecured: false,
    dueDate: 15,
    dateAdded: new Date().toISOString(),
    ...over,
  };
}

function firstPayoffMonth(snapshots: { month: number; paidOffDebts: string[] }[]): number | null {
  for (const s of snapshots) {
    if (s.paidOffDebts.length > 0) return s.month;
  }
  return null;
}

console.log("=== Scenario A: Card A 0% intro ends Apr 2027 (~12 mo from Apr 2026) ===\n");
const scenarioA: Debt[] = [
  base({
    id: "chase",
    name: "Chase",
    balance: 3200,
    apr: 26,
    minimumPayment: 80,
    introApr: 0,
    introEndsMonth: 4,
    introEndsYear: 2027,
  }),
  base({
    id: "citi",
    name: "Citi",
    balance: 5100,
    apr: 24,
    minimumPayment: 120,
    introApr: 0,
    introEndsMonth: 4,
    introEndsYear: 2028,
  }),
];

const sbA = runStrategy(scenarioA, 0, "snowball", undefined, { simulationStartDate: START });
const avA = runStrategy(scenarioA, 0, "avalanche", undefined, { simulationStartDate: START });
const saveA = Math.max(0, sbA.totalInterestPaid - avA.totalInterestPaid);

console.log("Snowball  — months:", sbA.totalMonths, "| interest: $" + sbA.totalInterestPaid.toFixed(2), "| first payoff month:", firstPayoffMonth(sbA.snapshots));
console.log("Avalanche — months:", avA.totalMonths, "| interest: $" + avA.totalInterestPaid.toFixed(2), "| first payoff month:", firstPayoffMonth(avA.snapshots));
console.log("Interest saved (avalanche vs snowball): $" + saveA.toFixed(2));
assert(sbA.totalMonths > 0 && avA.totalMonths > 0);
assert(avA.totalInterestPaid <= sbA.totalInterestPaid + 0.01);

console.log("\n=== Scenario B: Same balances; both promos 12 months (end Apr 2027) ===\n");
const scenarioB: Debt[] = [
  base({
    id: "chase",
    name: "Chase",
    balance: 3200,
    apr: 26,
    minimumPayment: 80,
    introApr: 0,
    introEndsMonth: 4,
    introEndsYear: 2027,
  }),
  base({
    id: "citi",
    name: "Citi",
    balance: 5100,
    apr: 24,
    minimumPayment: 120,
    introApr: 0,
    introEndsMonth: 4,
    introEndsYear: 2027,
  }),
];

const sbB = runStrategy(scenarioB, 0, "snowball", undefined, { simulationStartDate: START });
const avB = runStrategy(scenarioB, 0, "avalanche", undefined, { simulationStartDate: START });
console.log("Snowball  — months:", sbB.totalMonths, "| interest: $" + sbB.totalInterestPaid.toFixed(2));
console.log("Avalanche — months:", avB.totalMonths, "| interest: $" + avB.totalInterestPaid.toFixed(2));
console.log("Delta (save vs snowball): $" + Math.max(0, sbB.totalInterestPaid - avB.totalInterestPaid).toFixed(2));

console.log("\nDone.\n");

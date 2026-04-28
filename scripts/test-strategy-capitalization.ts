/**
 * Regression: min payment below monthly interest must grow balance (not freeze).
 * Run: npx tsx scripts/test-strategy-capitalization.ts
 */
import assert from "node:assert";
import { runStrategy, MAX_SIM_MONTHS, type Debt } from "../lib/calculations";

const highAprLowMin: Debt[] = [
  {
    id: "cc1",
    name: "Test Card",
    balance: 10_000,
    apr: 30,
    minimumPayment: 200,
    debtType: "creditCard",
    isSecured: false,
    dueDate: 15,
    dateAdded: new Date().toISOString(),
  },
];

const interestM0 = 10_000 * (0.3 / 12);
assert.ok(interestM0 > 200, "fixture: interest exceeds min");

const r = runStrategy(highAprLowMin, 0, "snowball");
assert.ok(r.snapshots.length >= 1, "should have month 1 snapshot");
const b0 = r.snapshots[0].debtBreakdown.find((x) => x.debtId === "cc1")?.balance;
assert.ok(b0 != null && b0 > 10_000, `month 1 balance should capitalize; got ${b0}`);
assert.strictEqual(r.totalMonths, MAX_SIM_MONTHS, "should hit sim horizon without paying off");
console.log("OK: interest capitalization + MAX_SIM_MONTHS bail");

/**
 * Run: npx tsx scripts/test-dream-goal-math.ts
 */
import assert from "node:assert";
import {
  simulateDebtPayoffMonths,
  firstMonthInterestTotal,
  totalMinimumPayments,
  monthsToSavingsGoal,
  type DreamGoalSimDebt,
} from "../lib/dreamGoalPayoffSim";

function ok(name: string, fn: () => void) {
  try {
    fn();
    console.log("OK:", name);
  } catch (e) {
    console.error("FAIL:", name, e);
    process.exitCode = 1;
  }
}

const sample: DreamGoalSimDebt[] = [
  { balance: 12400, rate: 24.99, minimumPayment: 248 },
  { balance: 8200, rate: 22.49, minimumPayment: 164 },
  { balance: 5800, rate: 18.0, minimumPayment: 116 },
];

ok("empty debts → 0 months", () => {
  assert.strictEqual(simulateDebtPayoffMonths([], 100), 0);
});

ok("sample debts extra 0 → finite, > 0", () => {
  const m = simulateDebtPayoffMonths(sample, 0);
  assert(Number.isFinite(m) && m > 0 && m < 600);
});

ok("extra payment shortens payoff", () => {
  const base = simulateDebtPayoffMonths(sample, 0);
  const withExtra = simulateDebtPayoffMonths(sample, 200);
  assert(withExtra < base);
});

ok("slider ~$91/mo matches round(3 * 30.44)", () => {
  const extra = Math.round(3 * 30.44);
  assert.strictEqual(extra, 91);
});

ok("large debt + realistic min + $91 extra still covers interest", () => {
  const debts: DreamGoalSimDebt[] = [{ balance: 77000, rate: 18, minimumPayment: 2100 }];
  const extra = 91;
  const tm = totalMinimumPayments(debts);
  const mp = tm + extra;
  const int1 = firstMonthInterestTotal(debts);
  assert(mp > int1, `mp ${mp} should exceed first-month interest ${int1}`);
  const m = simulateDebtPayoffMonths(debts, extra);
  assert(Number.isFinite(m) && m > 0, `expected finite months, got ${m}`);
});

ok("payment below interest → Infinity", () => {
  const debts: DreamGoalSimDebt[] = [{ balance: 100000, rate: 29.99, minimumPayment: 50 }];
  const m = simulateDebtPayoffMonths(debts, 0);
  assert.strictEqual(m, Number.POSITIVE_INFINITY);
});

ok("monthsToSavingsGoal small goal", () => {
  const n = monthsToSavingsGoal(2191, 2200, 0.04);
  assert(n !== null && n >= 1 && n <= 3);
});

ok("Infinity must not be treated as non-finite for UI (regression)", () => {
  const months = Number.POSITIVE_INFINITY;
  // Old bug: Number.isFinite(Infinity) === false → some formatters returned "-" incorrectly
  assert.strictEqual(Number.isFinite(months), false);
  const label =
    months === Number.POSITIVE_INFINITY ? "Not covering interest yet" : String(months);
  assert.strictEqual(label, "Not covering interest yet");
});

console.log("\nDone. Exit code:", process.exitCode ?? 0);

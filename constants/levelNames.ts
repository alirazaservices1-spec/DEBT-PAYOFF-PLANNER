const LEVEL_NAMES: Record<number, string> = {
  1: "Debt Rookie",
  2: "Payment Starter",
  3: "Budget Builder",
  4: "Interest Fighter",
  5: "Payment Warrior",
  6: "Debt Crusher",
  7: "Interest Slayer",
  8: "Balance Buster",
  9: "Payoff Pro",
  10: "Debt Destroyer",
};

export function getLevelName(level: number): string {
  return LEVEL_NAMES[level] ?? "Debt Freedom Legend";
}

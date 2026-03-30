export type HomeDexContext = {
  goalName: string;
  streakCount: number;
  xpToNext: number;
  nextLevelName: string;
  daysSinceLastOpen: number | null;
};

/** "Wardrobe" → "your Wardrobe"; already-possessive phrases left as-is. */
function goalWithYour(name: string): string {
  const t = name.trim();
  if (!t) return t;
  if (/^(your|my|our|the)\s/i.test(t)) return t;
  return `your ${t}`;
}

const STREAK_PHRASES: Record<number, string> = {
  3: "3 days. PROOF of exactly who you are - someone who keeps going.",
  7: "7 days straight. A FULL WEEK. Most people dream about this. You are LIVING it.",
  14: "14 days of showing up. You are not the same person who started. Not even close.",
  30: "30 DAYS. That is a NEW IDENTITY forming. You ARE the person who does this.",
  60: "60 days. You have done something most people spend their whole lives wishing they could do.",
  90: "90 days. This is not discipline anymore - it is who you ARE.",
  180: "SIX MONTHS. Half a year of total commitment. You have built something no one can take from you.",
  365: "365 DAYS. ONE FULL YEAR. You have proven beyond any doubt that you are UNSTOPPABLE.",
};

export function getHomeDexMessages(ctx: HomeDexContext): string[] {
  const { goalName, streakCount, xpToNext, nextLevelName, daysSinceLastOpen } = ctx;
  const cleanGoal = goalName.trim();
  const streakPhrase = STREAK_PHRASES[streakCount];

  // Priority order for app-open context:
  // 1) Comeback after inactivity (3+ or 7+ days)
  // 2) Milestone day (exact streak milestone)
  // 3) First/opening momentum statements
  if (daysSinceLastOpen != null && daysSinceLastOpen >= 7) {
    return [
      "You took a breath. Now you are back stronger than ever. That is how champions recharge.",
      "TODAY is the day everything gets even better. You have everything you need. Come back and CLAIM it.",
      "The hard work you have already done is fuel for where you are going. ALL of it counts.",
      "Your dream is RIGHT THERE. Take the next step. Then the one after that.",
    ];
  }

  if (daysSinceLastOpen != null && daysSinceLastOpen >= 3) {
    return [
      "YOU ARE BACK. Champions come back. You came back. That makes you a champion.",
      "Every payment you made and every point you earned is still here. Your progress is PERMANENT.",
      "Dex never stopped believing in you. Not for one second.",
      "That energy you feel right now is your champion self saying LET'S GO.",
    ];
  }

  if (streakPhrase) {
    return [
      streakPhrase,
      "Showing up every single day - THAT is what champions are made of.",
      cleanGoal
        ? `Keep going. Every action pulls ${goalWithYour(cleanGoal)} closer.`
        : "Keep going. Every action pulls your debt-free life closer.",
      xpToNext > 0 && nextLevelName
        ? `${nextLevelName} is ${xpToNext.toLocaleString()} XP away. Keep the momentum.`
        : "Keep logging payments and stack your progress.",
    ];
  }

  return [
    "THE FACT THAT YOU ARE HERE MEANS YOU ARE WINNING. You are DOING it.",
    "Champions show up ANYWAY. Welcome back, champion.",
    "Every time you open this app, you cast a vote for the person you are becoming.",
    cleanGoal
      ? `Every payment is one step closer to ${goalWithYour(cleanGoal)}.`
      : "Every payment is one step closer to your debt-free life.",
    "Small steps daily beat big leaps rarely. Keep stacking wins.",
    xpToNext > 0 && nextLevelName
      ? `${nextLevelName} is just ${xpToNext.toLocaleString()} XP away.`
      : "Keep logging payments to level up.",
  ];
}


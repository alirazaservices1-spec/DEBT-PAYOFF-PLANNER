/**
 * Onboarding step “mini celebrations” — aligned with DebtPath celebration tiers
 * (see all-celebrations.html: Tier 1 Micro, Tier 2 Small).
 * Non-XP copy; motivation-only (no duplicate XP grants).
 */

export type OnboardingMiniId = "how_it_works" | "debts_entered" | "dream_set" | "strategy_chosen";

export type OnboardingMiniAnim = "check" | "coin" | "star" | "arrow" | "shield";

export type OnboardingMiniCelebrationConfig = {
  tier: 1 | 2;
  anim: OnboardingMiniAnim;
  /** Tier-2 center icon (tier 1 derives from anim) */
  icon?: string;
  slam?: string;
  sub?: string;
  /** Floating pill line (not real XP) */
  pillText: string;
  sound: "xp_earned" | "payment_logged" | "variable_bonus";
  durationMs: number;
};

export const ONBOARDING_MINI_CELEBRATIONS: Record<OnboardingMiniId, OnboardingMiniCelebrationConfig> = {
  how_it_works: {
    tier: 1,
    anim: "check",
    pillText: "You know the playbook",
    sound: "xp_earned",
    durationMs: 1900,
  },
  debts_entered: {
    tier: 1,
    anim: "coin",
    pillText: "+50 XP",
    sound: "payment_logged",
    durationMs: 2000,
  },
  dream_set: {
    tier: 2,
    anim: "arrow",
    icon: "🎯",
    slam: "DREAM SET.",
    sub: "Your north star is live.",
    pillText: "Keep it in sight every day",
    sound: "variable_bonus",
    durationMs: 2600,
  },
  strategy_chosen: {
    tier: 2,
    anim: "star",
    icon: "⭐",
    slam: "METHOD LOCKED.",
    sub: "Snowball or avalanche — you're in motion.",
    pillText: "Plan saved",
    sound: "variable_bonus",
    durationMs: 2600,
  },
};

export function miniIconForAnim(anim: OnboardingMiniAnim): string {
  switch (anim) {
    case "check":
      return "✅";
    case "coin":
      return "💰";
    case "star":
      return "⭐";
    case "arrow":
      return "⬆️";
    case "shield":
      return "🛡️";
    default:
      return "✨";
  }
}

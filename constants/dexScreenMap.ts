import type { DexCoinMood, DexCoinMotion } from "@/components/DexCoin";

export type DexState = {
  mood: DexCoinMood;
  motion: DexCoinMotion;
};

export const DEX_SCREEN_MAP = {
  homeOnTrack: { mood: "happyClassic", motion: "float" } as DexState,
  homeNeedsBoost: { mood: "happyClassic", motion: "float" } as DexState,
  welcomeBack: { mood: "encouraging", motion: "float" } as DexState,
  dayComplete: { mood: "keepGoing", motion: "nod" } as DexState,
  debtsHeader: { mood: "happyClassic", motion: "float" } as DexState,
  strategyHeader: { mood: "smartAnalyst", motion: "float" } as DexState,
  strategyHero: { mood: "smartAnalyst", motion: "float" } as DexState,
  planHeader: { mood: "congratulating", motion: "pulse" } as DexState,
  levelsHero: { mood: "happy", motion: "float" } as DexState,
  levelsNudge: { mood: "encouraging", motion: "float" } as DexState,
  /** Settings / More tab — Dex vocalization row (So Proud + nod). */
  settingsDexVocal: { mood: "proud", motion: "nod" } as DexState,
} as const;

export const DEX_STREAK_MAP: Array<{ min: number; state: DexState }> = [
  { min: 365, state: { mood: "celebrating", motion: "pulse" } },
  { min: 180, state: { mood: "celebrating", motion: "bounce" } },
  { min: 90, state: { mood: "happy", motion: "bounce" } },
  { min: 30, state: { mood: "happy", motion: "pulse" } },
  { min: 7, state: { mood: "encouraging", motion: "bounce" } },
  { min: 0, state: { mood: "encouraging", motion: "float" } },
];

export function getDexStateForStreak(streak: number): DexState {
  const found = DEX_STREAK_MAP.find((row) => streak >= row.min);
  return found?.state ?? DEX_SCREEN_MAP.homeNeedsBoost;
}

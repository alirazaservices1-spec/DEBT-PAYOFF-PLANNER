import { LEVELS_DATA } from "./levelsData";

export function getLevelName(level: number): string {
  const def = LEVELS_DATA[Math.min(level, LEVELS_DATA.length) - 1];
  return def?.name ?? "Debt-Free Legend";
}

export function getLevelIcon(level: number): string {
  const def = LEVELS_DATA[Math.min(level, LEVELS_DATA.length) - 1];
  return def?.icon ?? "🌟";
}

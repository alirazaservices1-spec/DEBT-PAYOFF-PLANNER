export interface LevelDef {
  level: number;
  name: string;
  icon: string;
  minXp: number;
  maxXp: number | null;
}

export const LEVELS_DATA: LevelDef[] = [
  { level: 1, name: "Seedling",          icon: "🌱", minXp: 0,    maxXp: 199  },
  { level: 2, name: "Bronze Starter",    icon: "🥉", minXp: 200,  maxXp: 499  },
  { level: 3, name: "Momentum Builder",  icon: "⚡", minXp: 500,  maxXp: 999  },
  { level: 4, name: "Gold Saver",        icon: "🪙", minXp: 1000, maxXp: 1999 },
  { level: 5, name: "Diamond Warrior",   icon: "💎", minXp: 2000, maxXp: 3999 },
  { level: 6, name: "Freedom Champion",  icon: "🏆", minXp: 4000, maxXp: 6999 },
  { level: 7, name: "Debt-Free Legend",  icon: "🌟", minXp: 7000, maxXp: null },
];

export function getLevelDef(level: number): LevelDef {
  return LEVELS_DATA[Math.min(level, LEVELS_DATA.length) - 1] ?? LEVELS_DATA[LEVELS_DATA.length - 1];
}

export function formatXpRange(def: LevelDef): string {
  if (def.maxXp === null) return `${def.minXp.toLocaleString()}+ XP`;
  return `${def.minXp.toLocaleString()} - ${def.maxXp.toLocaleString()} XP`;
}

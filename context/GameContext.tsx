import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { soundManager } from "@/utils/SoundManager";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const GAME_STATE_KEY = "@debtfree_game_v2";

// ─── XP Events ───────────────────────────────────────────────────────────────

export const XP_REWARDS = {
  LOG_PAYMENT: 50,
  PAY_OFF_DEBT: 500,
  COMPLETE_ONBOARDING: 100,
  HIT_MILESTONE: 200,
  DAILY_STREAK: 25,
} as const;

export type XPEventType = keyof typeof XP_REWARDS;

// ─── Streak milestones ────────────────────────────────────────────────────────

export const STREAK_MILESTONES: Record<number, number> = {
  3: 75,
  7: 150,
  14: 300,
  30: 500,
  60: 750,
  100: 1000,
};

export const STREAK_MILESTONE_MESSAGES: Record<number, string> = {
  3: "You're building real momentum!",
  7: "One full week — you're unstoppable!",
  14: "Two weeks of dedication. Amazing!",
  30: "30 days — a new habit is born!",
  60: "Two months! Debt freedom is closer!",
  100: "100 days! You're a debt-crushing legend!",
};

// ─── Levels ───────────────────────────────────────────────────────────────────

const LEVEL_THRESHOLDS = [0, 200, 500, 1000, 2000, 4000];

function getThresholdForLevel(level: number): number {
  if (level - 1 < LEVEL_THRESHOLDS.length) return LEVEL_THRESHOLDS[level - 1];
  const last = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  return last + (level - LEVEL_THRESHOLDS.length + 1) * 3000;
}

function computeLevel(totalXp: number) {
  let level = 1;
  while (true) {
    if (totalXp < getThresholdForLevel(level + 1)) break;
    level++;
  }
  const floor = getThresholdForLevel(level);
  const next = getThresholdForLevel(level + 1);
  const currentLevelXp = totalXp - floor;
  const nextLevelXp = next - floor;
  const progress = nextLevelXp > 0 ? currentLevelXp / nextLevelXp : 1;
  return { level, currentLevelXp, nextLevelXp, progress };
}

// ─── Dex ─────────────────────────────────────────────────────────────────────

export type DexState =
  | "idle"
  | "happy"
  | "celebrating"
  | "worried"
  | "sleeping"
  | "encouraging"
  | "onboarding_clipboard"
  | "surprised";

// ─── Celebration ─────────────────────────────────────────────────────────────

export interface CelebrationState {
  type: "level_up" | "debt_cleared" | "streak_milestone" | "first_payment" | "first_debt" | null;
  level?: number;
  debtName?: string;
  streakDays?: number;
  bonusXp?: number;
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function toDateStr(date: Date): string {
  return date.toISOString().split("T")[0];
}

function subDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - n);
  return d;
}

function calendarDaysBetween(a: Date, b: Date): number {
  const aStr = toDateStr(a);
  const bStr = toDateStr(b);
  const msA = new Date(aStr).getTime();
  const msB = new Date(bStr).getTime();
  return Math.round((msB - msA) / (1000 * 60 * 60 * 24));
}

// ─── Persisted state ──────────────────────────────────────────────────────────

interface GameState {
  totalXp: number;
  streakCount: number;
  longestStreak: number;
  lastPaymentDate: string | null;
  graceUsedAt: string | null;
  milestonesAwarded: number[];
  lastOpenedAt: string | null;
  streakShield: boolean;
  firstPaymentCelebrated: boolean;
  firstDebtCelebrated: boolean;
}

const DEFAULT_STATE: GameState = {
  totalXp: 0,
  streakCount: 0,
  longestStreak: 0,
  lastPaymentDate: null,
  graceUsedAt: null,
  milestonesAwarded: [],
  lastOpenedAt: null,
  streakShield: false,
  firstPaymentCelebrated: false,
  firstDebtCelebrated: false,
};

// ─── Context shape ────────────────────────────────────────────────────────────

interface GameContextValue {
  totalXp: number;
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progress: number;

  streakCount: number;
  longestStreak: number;
  gracePeriodActive: boolean;

  celebration: CelebrationState;
  dismissCelebration: () => void;
  triggerCelebration: (state: CelebrationState, timeoutMs?: number) => void;

  dexState: DexState;
  dexOverrideMessage: string | null;
  triggerDex: (state: DexState, durationMs?: number) => void;
  triggerDexWithMessage: (state: DexState, message: string, durationMs?: number) => void;

  prevLastOpenedAt: string | null;
  lastPaymentDate: string | null;

  awardXp: (event: XPEventType, meta?: { debtName?: string }) => void;
  grantBonusXp: (amount: number) => void;
  recordPaymentForStreak: () => void;
  resetGame: () => Promise<void>;
  triggerFirstDebtCelebration: () => void;
  hasStreakShield: boolean;
  lastXpGain: { amount: number; seq: number };
  flamePulseSeq: number;
  triggerFlamePulse: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

async function sendShieldUsedNotification(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") return;
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("shield", {
        name: "Streak Shield",
        importance: Notifications.AndroidImportance.HIGH,
      });
    }
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Streak Shield Activated 🛡️",
        body: "Your Streak Shield saved your streak! You're back on track 🛡️",
        data: { type: "shield_used" },
        sound: true,
      },
      trigger: { seconds: 1 } as any,
    });
  } catch {}
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(DEFAULT_STATE);
  const gameStateRef = useRef<GameState>(DEFAULT_STATE);

  const [gracePeriodActive, setGracePeriodActive] = useState(false);
  const [prevLastOpenedAt, setPrevLastOpenedAt] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<CelebrationState>({ type: null });
  const [dexState, setDexState] = useState<DexState>("idle");
  const [loaded, setLoaded] = useState(false);
  const [lastXpGain, setLastXpGain] = useState<{ amount: number; seq: number }>({ amount: 0, seq: 0 });
  const [flamePulseSeq, setFlamePulseSeq] = useState(0);

  const celebrationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dexTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveState = useCallback(async (s: GameState) => {
    await AsyncStorage.setItem(GAME_STATE_KEY, JSON.stringify(s));
  }, []);

  const applyState = useCallback((s: GameState) => {
    gameStateRef.current = s;
    setGameState(s);
  }, []);

  // ── Load & streak-on-open check ────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(GAME_STATE_KEY);
        let s: GameState = raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : { ...DEFAULT_STATE };

        const today = toDateStr(new Date());
        const yesterday = toDateStr(subDays(new Date(), 1));
        const twoDaysAgo = toDateStr(subDays(new Date(), 2));

        if (s.lastPaymentDate) {
          if (s.lastPaymentDate === today || s.lastPaymentDate === yesterday) {
            // Streak alive
          } else if (s.lastPaymentDate === twoDaysAgo) {
            const graceAvailable =
              !s.graceUsedAt || calendarDaysBetween(new Date(s.graceUsedAt), new Date()) >= 7;
            if (graceAvailable) {
              setGracePeriodActive(true);
            } else if (s.streakShield) {
              s = { ...s, streakShield: false };
              sendShieldUsedNotification();
            } else {
              s = { ...s, streakCount: 0 };
            }
          } else {
            if (s.streakShield) {
              s = { ...s, streakShield: false };
              sendShieldUsedNotification();
            } else {
              s = { ...s, streakCount: 0 };
            }
          }
        }

        setPrevLastOpenedAt(s.lastOpenedAt);
        s = { ...s, lastOpenedAt: today };

        applyState(s);
        await saveState(s);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // ── Celebration ────────────────────────────────────────────────────────────
  const triggerCelebration = useCallback(
    (state: CelebrationState, timeoutMs = 3000) => {
      if (celebrationTimerRef.current) clearTimeout(celebrationTimerRef.current);
      setCelebration(state);
      celebrationTimerRef.current = setTimeout(() => setCelebration({ type: null }), timeoutMs);
    },
    []
  );

  const dismissCelebration = useCallback(() => {
    if (celebrationTimerRef.current) clearTimeout(celebrationTimerRef.current);
    setCelebration({ type: null });
  }, []);

  // ── Dex override message ──────────────────────────────────────────────────
  const [dexOverrideMessage, setDexOverrideMessage] = useState<string | null>(null);
  const dexMsgTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Dex ───────────────────────────────────────────────────────────────────
  const triggerDex = useCallback((state: DexState, durationMs = 4000) => {
    if (dexTimerRef.current) clearTimeout(dexTimerRef.current);
    setDexState(state);
    if (state !== "idle") {
      if (state === "happy" || state === "celebrating") soundManager.playDexVocal("approval");
      else if (state === "worried") soundManager.playDexVocal("concern");
      else if (state === "surprised") soundManager.playDexVocal("surprise");
      dexTimerRef.current = setTimeout(() => setDexState("idle"), durationMs);
    }
  }, []);

  const triggerDexWithMessage = useCallback((state: DexState, message: string, durationMs = 5000) => {
    if (dexTimerRef.current) clearTimeout(dexTimerRef.current);
    if (dexMsgTimerRef.current) clearTimeout(dexMsgTimerRef.current);
    setDexState(state);
    setDexOverrideMessage(message);
    if (state === "happy" || state === "celebrating") soundManager.playDexVocal("approval");
    else if (state === "worried") soundManager.playDexVocal("concern");
    else if (state === "surprised") soundManager.playDexVocal("surprise");
    dexMsgTimerRef.current = setTimeout(() => {
      setDexState("idle");
      setDexOverrideMessage(null);
    }, durationMs);
  }, []);

  // ── Flame pulse ───────────────────────────────────────────────────────────
  const triggerFlamePulse = useCallback(() => {
    setFlamePulseSeq((n) => n + 1);
  }, []);

  // ── Raw XP add (internal) ─────────────────────────────────────────────────
  const addXpInternal = useCallback(
    (amount: number, skipCelebration = false): { oldLevel: number; newLevel: number; newXp: number } => {
      const cur = gameStateRef.current;
      const oldLevel = computeLevel(cur.totalXp).level;
      const newXp = cur.totalXp + amount;
      const newLevel = computeLevel(newXp).level;
      const updated = { ...cur, totalXp: newXp };
      applyState(updated);
      saveState(updated);
      if (!skipCelebration && newLevel > oldLevel) {
        triggerCelebration({ type: "level_up", level: newLevel });
        triggerDex("celebrating");
        soundManager.play("level_up");
      }
      return { oldLevel, newLevel, newXp };
    },
    [applyState, saveState, triggerCelebration, triggerDex]
  );

  // ── Public grantBonusXp (arbitrary amount, e.g. streak goal reward) ────────
  const grantBonusXp = useCallback(
    (amount: number) => {
      if (amount <= 0) return;
      addXpInternal(amount);
      setLastXpGain((prev) => ({ amount, seq: prev.seq + 1 }));
    },
    [addXpInternal]
  );

  // ── Public awardXp ────────────────────────────────────────────────────────
  const awardXp = useCallback(
    (event: XPEventType, meta?: { debtName?: string }) => {
      const amount = XP_REWARDS[event];
      const cur = gameStateRef.current;
      const oldLevel = computeLevel(cur.totalXp).level;

      const isFirstPayment = event === "LOG_PAYMENT" && !cur.firstPaymentCelebrated;
      const bonusXp = isFirstPayment ? 100 : 0;
      const totalAmount = amount + bonusXp;
      const newXp = cur.totalXp + totalAmount;
      const newLevel = computeLevel(newXp).level;

      const updated: GameState = {
        ...cur,
        totalXp: newXp,
        ...(isFirstPayment ? { firstPaymentCelebrated: true } : {}),
      };
      applyState(updated);
      saveState(updated);
      setLastXpGain((prev) => ({ amount: totalAmount, seq: prev.seq + 1 }));

      if (isFirstPayment) {
        triggerCelebration({ type: "first_payment", bonusXp: 100 }, 4500);
        triggerDex("celebrating");
        soundManager.play("milestone");
      } else if (event === "PAY_OFF_DEBT") {
        triggerCelebration({ type: "debt_cleared", debtName: meta?.debtName });
        triggerDex("celebrating");
        soundManager.play("debt_paid_off");
      } else if (newLevel > oldLevel) {
        triggerCelebration({ type: "level_up", level: newLevel });
        triggerDex("celebrating");
        soundManager.play("level_up");
      } else if (event === "LOG_PAYMENT") {
        // Normal payment — brief: coin-drop tone + Dex happy bounce
        triggerDex("happy", 3000);
        soundManager.play("payment_logged");
      }
    },
    [applyState, saveState, triggerCelebration, triggerDex]
  );

  const triggerFirstDebtCelebration = useCallback(() => {
    const cur = gameStateRef.current;
    if (cur.firstDebtCelebrated) return;
    const newXp = cur.totalXp + 100;
    const updated: GameState = { ...cur, totalXp: newXp, firstDebtCelebrated: true };
    applyState(updated);
    saveState(updated);
    setLastXpGain((prev) => ({ amount: 100, seq: prev.seq + 1 }));
    triggerCelebration({ type: "first_debt", bonusXp: 100 }, 3500);
    triggerDex("celebrating");
  }, [applyState, saveState, triggerCelebration, triggerDex]);

  // ── Streak recording ──────────────────────────────────────────────────────
  const resetGame = useCallback(async () => {
    applyState({ ...DEFAULT_STATE });
    await AsyncStorage.removeItem(GAME_STATE_KEY);
  }, [applyState]);

  const recordPaymentForStreak = useCallback(() => {
    const cur = gameStateRef.current;
    const today = toDateStr(new Date());
    const yesterday = toDateStr(subDays(new Date(), 1));
    const twoDaysAgo = toDateStr(subDays(new Date(), 2));

    if (cur.lastPaymentDate === today) return;

    let newStreak = cur.streakCount;
    let graceUsedAt = cur.graceUsedAt;
    let newGracePeriodActive = gracePeriodActive;

    if (!cur.lastPaymentDate || cur.lastPaymentDate === yesterday) {
      newStreak = cur.streakCount + 1;
    } else if (gracePeriodActive && cur.lastPaymentDate === twoDaysAgo) {
      newStreak = cur.streakCount + 1;
      graceUsedAt = today;
      newGracePeriodActive = false;
      setGracePeriodActive(false);
    } else {
      newStreak = 1;
    }

    const longest = Math.max(newStreak, cur.longestStreak);

    const xpFromStreak = XP_REWARDS.DAILY_STREAK;
    const xpAfterStreak = cur.totalXp + xpFromStreak;
    const levelAfterStreak = computeLevel(xpAfterStreak).level;
    const oldLevel = computeLevel(cur.totalXp).level;

    const newMilestone = Object.keys(STREAK_MILESTONES)
      .map(Number)
      .find((m) => m === newStreak && !cur.milestonesAwarded.includes(m));

    const milestonesAwarded = newMilestone
      ? [...cur.milestonesAwarded, newMilestone]
      : cur.milestonesAwarded;

    const bonusXp = newMilestone ? STREAK_MILESTONES[newMilestone] : 0;
    const totalNewXp = xpAfterStreak + bonusXp;
    const finalLevel = computeLevel(totalNewXp).level;

    const earnedShield = newStreak >= 30 && !cur.streakShield;

    const updated: GameState = {
      ...cur,
      totalXp: totalNewXp,
      streakCount: newStreak,
      longestStreak: longest,
      lastPaymentDate: today,
      graceUsedAt,
      milestonesAwarded,
      ...(earnedShield ? { streakShield: true } : {}),
    };

    applyState(updated);
    saveState(updated);
    setLastXpGain((prev) => ({ amount: xpFromStreak + bonusXp, seq: prev.seq + 1 }));

    if (newMilestone) {
      triggerCelebration(
        {
          type: "streak_milestone",
          streakDays: newMilestone,
          bonusXp: STREAK_MILESTONES[newMilestone],
        },
        4000
      );
      triggerDex("celebrating");
      soundManager.play("milestone");
    } else if (finalLevel > oldLevel) {
      triggerCelebration({ type: "level_up", level: finalLevel });
      triggerDex("celebrating");
      soundManager.play("level_up");
    } else {
      soundManager.play("streak_maintained");
    }
  }, [gracePeriodActive, applyState, saveState, triggerCelebration, triggerDex]);

  // ── Derived values ────────────────────────────────────────────────────────
  const derived = useMemo(() => computeLevel(gameState.totalXp), [gameState.totalXp]);

  const value: GameContextValue = useMemo(
    () => ({
      totalXp: gameState.totalXp,
      level: derived.level,
      currentLevelXp: derived.currentLevelXp,
      nextLevelXp: derived.nextLevelXp,
      progress: derived.progress,
      streakCount: gameState.streakCount,
      longestStreak: gameState.longestStreak,
      gracePeriodActive,
      celebration,
      dismissCelebration,
      triggerCelebration,
      dexState,
      dexOverrideMessage,
      triggerDex,
      triggerDexWithMessage,
      prevLastOpenedAt,
      lastPaymentDate: gameState.lastPaymentDate,
      awardXp,
      grantBonusXp,
      recordPaymentForStreak,
      resetGame,
      triggerFirstDebtCelebration,
      hasStreakShield: gameState.streakShield,
      lastXpGain,
      flamePulseSeq,
      triggerFlamePulse,
    }),
    [
      gameState,
      derived,
      gracePeriodActive,
      celebration,
      dismissCelebration,
      triggerCelebration,
      dexState,
      dexOverrideMessage,
      triggerDex,
      triggerDexWithMessage,
      prevLastOpenedAt,
      awardXp,
      grantBonusXp,
      recordPaymentForStreak,
      resetGame,
      triggerFirstDebtCelebration,
      lastXpGain,
      flamePulseSeq,
      triggerFlamePulse,
    ]
  );

  if (!loaded) return null;

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}

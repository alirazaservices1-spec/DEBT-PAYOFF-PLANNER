import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform, AppState } from "react-native";
import { useGame } from "@/context/GameContext";
import { useGoal } from "@/context/GoalContext";
import { cancelScheduledNextDayActivitiesReminder } from "@/lib/dayActivitiesReminder";

const PREFS_KEY = "@debtpath_streak_reminder_prefs_v1";
const NOTIF_ID_KEY = "@debtpath_streak_reminder_notif_id";
const CHANNEL = "streak-reminder";

interface StreakReminderContextValue {
  streakReminderEnabled: boolean;
  setStreakReminderEnabled: (enabled: boolean) => Promise<void>;
  cancelTonightsReminder: () => Promise<void>;
}

const StreakReminderContext = createContext<StreakReminderContextValue | null>(null);

/** Silently checks if permission is already granted — never prompts. */
async function checkPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const { status } = await Notifications.getPermissionsAsync();
  return status === "granted";
}

/** Prompts the user — only call on explicit user action. */
async function requestPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

async function ensureChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(CHANNEL, {
    name: "Streak Reminders",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 300],
    lightColor: "#FF6B1A",
  });
}

async function cancelStoredReminder(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    const id = await AsyncStorage.getItem(NOTIF_ID_KEY);
    if (id) {
      await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
      await AsyncStorage.removeItem(NOTIF_ID_KEY);
    }
  } catch {}
}

async function scheduleForTonight(
  streakCount: number,
  lastPaymentDate: string | null,
  enabled: boolean,
  hasGoal: boolean
): Promise<void> {
  if (Platform.OS === "web") return;
  if (!enabled) return;

  // Rule: if streak is 0 AND user has no goal, fire nothing
  if (streakCount === 0 && !hasGoal) {
    await cancelStoredReminder();
    return;
  }

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const tonight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    20,
    0,
    0,
    0
  );

  const nextTonight = new Date(
    tomorrow.getFullYear(),
    tomorrow.getMonth(),
    tomorrow.getDate(),
    20,
    0,
    0,
    0
  );

  // Candidate reminder is the next 8:00 PM. If that day is already paid,
  // advance until we find an unpaid day.
  let targetDate = now < tonight ? tonight : nextTonight;
  let targetDayStr = now < tonight ? todayStr : tomorrowStr;

  let attempts = 0;
  while (lastPaymentDate === targetDayStr && attempts < 3) {
    const next = new Date(targetDate);
    next.setDate(next.getDate() + 1);
    targetDate = new Date(
      next.getFullYear(),
      next.getMonth(),
      next.getDate(),
      20,
      0,
      0,
      0
    );
    targetDayStr = targetDate.toISOString().split("T")[0];
    attempts++;
  }

  if (now >= targetDate) return;

  const granted = await checkPermission();
  if (!granted) return;

  await ensureChannel();
  await cancelStoredReminder();

  const title = "DebtPath - Streak Reminder 🔥";
  const body =
    streakCount > 0
      ? `🔥 Your ${streakCount}-day streak ends at midnight. Log your daily saving to keep it alive - even $0.50 counts!`
      : "💪 Start a new streak today! Log your daily saving to begin.";

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { type: "streak_reminder" },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: targetDate,
      },
    });
    await AsyncStorage.setItem(NOTIF_ID_KEY, id);
  } catch (err) {
    console.warn("[StreakReminder] schedule failed:", err);
  }
}

export function StreakReminderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { streakCount, lastPaymentDate } = useGame();
  const { hasGoal } = useGoal();
  const [enabled, setEnabled] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(PREFS_KEY).then((raw) => {
      if (raw !== null) {
        try {
          setEnabled(JSON.parse(raw));
        } catch {}
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    scheduleForTonight(streakCount, lastPaymentDate, enabled, hasGoal);
  }, [loaded, enabled, streakCount, lastPaymentDate, hasGoal]);

  useEffect(() => {
    if (!loaded) return;
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        scheduleForTonight(streakCount, lastPaymentDate, enabled, hasGoal);
      }
    });
    return () => sub.remove();
  }, [loaded, enabled, streakCount, lastPaymentDate, hasGoal]);

  const setStreakReminderEnabled = useCallback(async (value: boolean) => {
    setEnabled(value);
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(value));
    if (!value) {
      await cancelStoredReminder();
      await cancelScheduledNextDayActivitiesReminder();
    } else {
      // User explicitly enabled — prompt for permission here if needed
      await requestPermission();
      await scheduleForTonight(streakCount, lastPaymentDate, true, hasGoal);
    }
  }, [streakCount, lastPaymentDate, hasGoal]);

  const cancelTonightsReminder = useCallback(async () => {
    await cancelStoredReminder();
  }, []);

  return (
    <StreakReminderContext.Provider
      value={{ streakReminderEnabled: enabled, setStreakReminderEnabled, cancelTonightsReminder }}
    >
      {children}
    </StreakReminderContext.Provider>
  );
}

export function useStreakReminder(): StreakReminderContextValue {
  const ctx = useContext(StreakReminderContext);
  if (!ctx)
    throw new Error("useStreakReminder must be inside StreakReminderProvider");
  return ctx;
}

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

const PREFS_KEY = "@debtpath_streak_reminder_prefs_v1";
const NOTIF_ID_KEY = "@debtpath_streak_reminder_notif_id";
const CHANNEL = "streak-reminder";

interface StreakReminderContextValue {
  streakReminderEnabled: boolean;
  setStreakReminderEnabled: (enabled: boolean) => Promise<void>;
  cancelTonightsReminder: () => Promise<void>;
}

const StreakReminderContext = createContext<StreakReminderContextValue | null>(null);

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
  hasPaidToday: boolean,
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
  const tonight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    20,
    0,
    0,
    0
  );

  if (now >= tonight) return;
  if (hasPaidToday) {
    await cancelStoredReminder();
    return;
  }

  const granted = await requestPermission();
  if (!granted) return;

  await ensureChannel();
  await cancelStoredReminder();

  const title = "DebtPath — Streak Reminder 🔥";
  const body =
    streakCount > 0
      ? `🔥 Your ${streakCount}-day streak ends at midnight. Log your daily saving to keep it alive — even $0.50 counts!`
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
        date: tonight,
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

  const today = new Date().toISOString().split("T")[0];
  const hasPaidToday = lastPaymentDate === today;

  useEffect(() => {
    if (!loaded) return;
    scheduleForTonight(streakCount, hasPaidToday, enabled, hasGoal);
  }, [loaded, enabled, streakCount, hasPaidToday, hasGoal]);

  useEffect(() => {
    if (!loaded) return;
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        scheduleForTonight(streakCount, hasPaidToday, enabled, hasGoal);
      }
    });
    return () => sub.remove();
  }, [loaded, enabled, streakCount, hasPaidToday, hasGoal]);

  const setStreakReminderEnabled = useCallback(async (value: boolean) => {
    setEnabled(value);
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(value));
    if (!value) {
      await cancelStoredReminder();
    } else {
      await scheduleForTonight(streakCount, hasPaidToday, true, hasGoal);
    }
  }, [streakCount, hasPaidToday, hasGoal]);

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

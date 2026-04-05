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
import { useDebts } from "@/context/DebtContext";
import { useCurrency } from "@/context/CurrencyContext";

const PREFS_KEY = "@debtfree_weekly_summary_v1";
const NOTIF_ID_KEY = "@debtfree_weekly_summary_notif_id";
const CHANNEL = "weekly-summary";

interface WeeklySummaryContextValue {
  weeklySummaryEnabled: boolean;
  setWeeklySummaryEnabled: (enabled: boolean) => Promise<void>;
}

const WeeklySummaryContext = createContext<WeeklySummaryContextValue | null>(null);

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
    name: "Weekly Summary",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250],
    lightColor: "#2ECC71",
  });
}

async function cancelStoredNotif(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    const id = await AsyncStorage.getItem(NOTIF_ID_KEY);
    if (id) {
      await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
      await AsyncStorage.removeItem(NOTIF_ID_KEY);
    }
  } catch {}
}

function getNextSunday6PM(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntilSunday);
  next.setHours(18, 0, 0, 0);
  return next;
}

function getWeeklyTotal(
  payments: { amount: number; isMissed: boolean; date: string }[]
): number {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  return payments
    .filter((p) => !p.isMissed && new Date(p.date) >= weekAgo)
    .reduce((sum, p) => sum + p.amount, 0);
}

async function scheduleWeeklySummary(
  enabled: boolean,
  weeklyTotal: number,
  fmtFn: (n: number) => string
): Promise<void> {
  if (Platform.OS === "web") return;
  if (!enabled) {
    await cancelStoredNotif();
    return;
  }

  const granted = await checkPermission();
  if (!granted) return;

  await ensureChannel();
  await cancelStoredNotif();

  const body =
    weeklyTotal > 0
      ? `This week you paid ${fmtFn(weeklyTotal)} toward your debts. Great work! 💪`
      : "A new week is a fresh start! Log a payment this week to keep your momentum going 💪";

  try {
    const trigger = getNextSunday6PM();
    if (trigger <= new Date()) return;
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "DebtPath - Weekly Summary 📊",
        body,
        data: { type: "weekly_summary" },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: trigger,
      },
    });
    await AsyncStorage.setItem(NOTIF_ID_KEY, id);
  } catch (err) {
    console.warn("[WeeklySummary] schedule failed:", err);
  }
}

export function WeeklySummaryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { payments } = useDebts();
  const { fmtFull } = useCurrency();
  const [enabled, setEnabled] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(PREFS_KEY).then((raw) => {
      if (raw !== null) {
        try { setEnabled(JSON.parse(raw)); } catch {}
      }
      setLoaded(true);
    });
  }, []);

  const weeklyTotal = getWeeklyTotal(payments);

  useEffect(() => {
    if (!loaded) return;
    scheduleWeeklySummary(enabled, weeklyTotal, fmtFull);
  }, [loaded, enabled, weeklyTotal]);

  useEffect(() => {
    if (!loaded) return;
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        scheduleWeeklySummary(enabled, weeklyTotal, fmtFull);
      }
    });
    return () => sub.remove();
  }, [loaded, enabled, weeklyTotal]);

  const setWeeklySummaryEnabled = useCallback(async (value: boolean) => {
    setEnabled(value);
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(value));
    if (!value) {
      await cancelStoredNotif();
    } else {
      // User explicitly enabled — prompt for permission here if needed
      await requestPermission();
      await scheduleWeeklySummary(true, weeklyTotal, fmtFull);
    }
  }, [weeklyTotal, fmtFull]);

  return (
    <WeeklySummaryContext.Provider value={{ weeklySummaryEnabled: enabled, setWeeklySummaryEnabled }}>
      {children}
    </WeeklySummaryContext.Provider>
  );
}

export function useWeeklySummary(): WeeklySummaryContextValue {
  const ctx = useContext(WeeklySummaryContext);
  if (!ctx) throw new Error("useWeeklySummary must be inside WeeklySummaryProvider");
  return ctx;
}

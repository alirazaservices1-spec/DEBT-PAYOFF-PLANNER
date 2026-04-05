// ─── Design Brief Notifications (Section 8) ───────────────────────────────────
// Interest saved weekly (Sunday), Payoff date moved, Variable bonus day, 7-day re-engagement

import React, { createContext, useCallback, useContext, useEffect, useRef } from "react";
import { AppState, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { useDebts } from "@/context/DebtContext";
import { useCurrency } from "@/context/CurrencyContext";
import { projectedInterestSavedVsMinimumPayments, runStrategy } from "@/lib/calculations";

const CHANNEL_INTEREST = "interest-saved-weekly";
const CHANNEL_PAYOFF = "payoff-date-moved";
const CHANNEL_BONUS = "variable-bonus";
const CHANNEL_REENGAGE = "re-engagement";

/** Silently checks if permission is already granted — never prompts. */
async function checkPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const { status } = await Notifications.getPermissionsAsync();
  return status === "granted";
}

async function ensureChannels(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(CHANNEL_INTEREST, {
    name: "Interest Saved",
    importance: Notifications.AndroidImportance.DEFAULT,
    lightColor: "#1E7A45",
  });
  await Notifications.setNotificationChannelAsync(CHANNEL_PAYOFF, {
    name: "Payoff Date",
    importance: Notifications.AndroidImportance.DEFAULT,
    lightColor: "#1F4E8C",
  });
  await Notifications.setNotificationChannelAsync(CHANNEL_BONUS, {
    name: "Bonus Day",
    importance: Notifications.AndroidImportance.DEFAULT,
    lightColor: "#D4A017",
  });
  await Notifications.setNotificationChannelAsync(CHANNEL_REENGAGE, {
    name: "Re-engagement",
    importance: Notifications.AndroidImportance.DEFAULT,
    lightColor: "#E8600A",
  });
}

function getNextSunday9AM(): Date {
  const now = new Date();
  const day = now.getDay();
  const daysUntilSunday = day === 0 ? 7 : 7 - day;
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntilSunday);
  next.setHours(9, 0, 0, 0);
  return next;
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

interface DesignBriefNotificationsContextValue {
  schedulePayoffDateMoved: (newDate: Date, monthsFaster: number) => Promise<void>;
}

const DesignBriefNotificationsContext = createContext<DesignBriefNotificationsContextValue | null>(null);

export function DesignBriefNotificationsProvider({ children }: { children: React.ReactNode }) {
  const { debts, payments, extraPayment, selectedStrategy, customOrder } = useDebts();
  const { fmt } = useCurrency();
  const scheduledRef = useRef<{ interest?: string; reengage?: string }>({});

  const scheduleInterestSavedWeekly = useCallback(async () => {
    if (Platform.OS === "web" || debts.length === 0) return;
    const granted = await checkPermission();
    if (!granted) return;
    await ensureChannels();

    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of scheduled) {
      if ((n.content.data as { type?: string })?.type === "interest_saved_weekly") {
        await Notifications.cancelScheduledNotificationAsync(n.identifier).catch(() => {});
      }
    }

    const strat = selectedStrategy === "custom" ? "custom" : selectedStrategy;
    const withExtra = runStrategy(
      debts,
      extraPayment,
      strat,
      selectedStrategy === "custom" ? customOrder : undefined
    );
    const interestSaved = projectedInterestSavedVsMinimumPayments(
      debts,
      withExtra.totalInterestPaid,
      selectedStrategy,
      customOrder
    );
    const payoffDate = withExtra.payoffDate;

    const trigger = getNextSunday9AM();
    if (trigger <= new Date()) return;

    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "DebtPath 💚",
          body: `You've saved ${fmt(interestSaved)} in interest so far. Your debt-free date: ${formatShortDate(payoffDate)}.`,
          data: { type: "interest_saved_weekly" },
          sound: true,
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: trigger },
      });
      scheduledRef.current.interest = id;
    } catch (e) {
      if (__DEV__) console.warn("[DesignBrief] interest weekly schedule failed", e);
    }
  }, [debts, extraPayment, fmt, selectedStrategy, customOrder]);

  const schedulePayoffDateMoved = useCallback(async (newDate: Date, monthsFaster: number) => {
    if (Platform.OS === "web") return;
    const granted = await checkPermission();
    if (!granted) return;
    await ensureChannels();
    const fireAt = new Date(Date.now() + 2000);
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "DebtPath 📅",
          body: `Your debt-free date just moved to ${formatShortDate(newDate)}. ${monthsFaster} months faster!`,
          data: { type: "payoff_date_moved" },
          sound: true,
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireAt },
      });
    } catch (e) {
      if (__DEV__) console.warn("[DesignBrief] payoff moved schedule failed", e);
    }
  }, []);

  const scheduleReengagement = useCallback(async () => {
    if (Platform.OS === "web") return;
    const granted = await checkPermission();
    if (!granted) return;
    await ensureChannels();
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of scheduled) {
      if ((n.content.data as { type?: string })?.type === "re_engagement") {
        await Notifications.cancelScheduledNotificationAsync(n.identifier).catch(() => {});
      }
    }
    const in7Days = new Date();
    in7Days.setDate(in7Days.getDate() + 7);
    in7Days.setHours(10, 0, 0, 0);
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "DebtPath 💤",
          body: "Dex misses you. Your streak is paused, not gone. Tap to restart.",
          data: { type: "re_engagement" },
          sound: true,
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: in7Days },
      });
      scheduledRef.current.reengage = id;
    } catch (e) {
      if (__DEV__) console.warn("[DesignBrief] re-engagement schedule failed", e);
    }
  }, []);

  useEffect(() => {
    scheduleInterestSavedWeekly();
  }, [scheduleInterestSavedWeekly]);

  // Variable bonus days: 8th and 22nd of each month at 8 AM (1–2x/month per brief)
  useEffect(() => {
    if (Platform.OS === "web") return;
    let cancelled = false;
    (async () => {
      const granted = await checkPermission();
      if (!granted || cancelled) return;
      await ensureChannels();
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      for (const n of scheduled) {
        if ((n.content.data as { type?: string })?.type === "variable_bonus") {
          await Notifications.cancelScheduledNotificationAsync(n.identifier).catch(() => {});
        }
      }
      if (cancelled) return;
      const now = new Date();
      const body = "🌟 Bonus day! Log any payment today for 3x XP. Dex is waiting.";
      for (const dayOfMonth of [8, 22]) {
        const trigger = new Date(now.getFullYear(), now.getMonth(), dayOfMonth, 8, 0, 0, 0);
        if (trigger <= now) trigger.setMonth(trigger.getMonth() + 1);
        if (cancelled) return;
        try {
          await Notifications.scheduleNotificationAsync({
            content: { title: "DebtPath 🌟", body, data: { type: "variable_bonus" }, sound: true },
            trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: trigger },
          });
        } catch {}
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let mounted = true;
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active" && mounted) {
        scheduleReengagement();
      }
    });
    scheduleReengagement();
    return () => {
      mounted = false;
      sub.remove();
    };
  }, [scheduleReengagement]);

  return (
    <DesignBriefNotificationsContext.Provider value={{ schedulePayoffDateMoved }}>
      {children}
    </DesignBriefNotificationsContext.Provider>
  );
}

export function useDesignBriefNotifications(): DesignBriefNotificationsContextValue {
  const ctx = useContext(DesignBriefNotificationsContext);
  if (!ctx) throw new Error("useDesignBriefNotifications must be inside DesignBriefNotificationsProvider");
  return ctx;
}

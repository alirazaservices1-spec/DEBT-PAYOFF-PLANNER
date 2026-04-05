import AsyncStorage from "@react-native-async-storage/async-storage";

/** User finished the day-complete screen (primary dismiss actions). */
const ACK_KEY = "@debtpath_day_complete_ack_date";
/** We already navigated to day-complete from a payment today — do not auto-push again. */
const AUTO_ROUTED_KEY = "@debtpath_day_complete_auto_routed_date";
/** User tapped “Skip” — show home banner until they complete the celebration flow. */
const SKIP_BANNER_KEY = "@debtpath_day_complete_skip_pending_date";
/** One-shot Home feedback after leaving day-complete (survives navigation remount). */
const HOME_WRAPPED_FEEDBACK_KEY = "@debtpath_home_wrapped_feedback_pending";

/** User's local calendar date (YYYY-MM-DD). UTC-only keys caused mismatches around midnight and broke "done today" checks. */
function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** After logging a payment today, should we navigate to the day-complete screen (at most once per day)? */
export async function shouldOfferAutoRouteToDayComplete(): Promise<boolean> {
  try {
    const today = todayKey();
    if ((await AsyncStorage.getItem(ACK_KEY)) === today) return false;
    if ((await AsyncStorage.getItem(AUTO_ROUTED_KEY)) === today) return false;
    return true;
  } catch {
    return true;
  }
}

export async function markDayCompleteAutoRoutedToday(): Promise<void> {
  try {
    await AsyncStorage.setItem(AUTO_ROUTED_KEY, todayKey());
  } catch {
    // best-effort
  }
}

/** Call when the user leaves day-complete via See you tomorrow / Go to main menu (completed flow). */
export async function markDayCompleteAcknowledgedToday(): Promise<void> {
  try {
    const t = todayKey();
    await AsyncStorage.setItem(ACK_KEY, t);
    await AsyncStorage.removeItem(SKIP_BANNER_KEY);
  } catch {
    // best-effort
  }
}

/** User skipped day-complete — show the home streak banner until they open day-complete and finish. */
export async function markDayCompleteSkippedToday(): Promise<void> {
  try {
    await AsyncStorage.setItem(SKIP_BANNER_KEY, todayKey());
  } catch {
    // best-effort
  }
}

export async function shouldShowDayCompleteStreakBanner(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(SKIP_BANNER_KEY)) === todayKey();
  } catch {
    return false;
  }
}

/** User finished the day-complete celebration flow today (see you tomorrow / main menu). */
export async function hasCompletedDayFlowToday(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(ACK_KEY)) === todayKey();
  } catch {
    return false;
  }
}

export async function setHomeWrappedFeedbackPending(kind: "success" | "error"): Promise<void> {
  try {
    await AsyncStorage.setItem(HOME_WRAPPED_FEEDBACK_KEY, kind);
  } catch {
    // best-effort
  }
}

/** Read and clear pending “wrapped” toast on Home (call from dashboard focus). */
export async function consumeHomeWrappedFeedback(): Promise<"success" | "error" | null> {
  try {
    const v = await AsyncStorage.getItem(HOME_WRAPPED_FEEDBACK_KEY);
    if (v === "success" || v === "error") {
      await AsyncStorage.removeItem(HOME_WRAPPED_FEEDBACK_KEY);
      return v;
    }
    return null;
  } catch {
    return null;
  }
}

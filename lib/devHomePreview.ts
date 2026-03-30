import AsyncStorage from "@react-native-async-storage/async-storage";

const K_ACTIVITY_DAY = "@debtpath_dev_preview_activity_day";
const K_HOME_STATE = "@debtpath_dev_preview_home_state";
const K_STREAK_DAYS = "@debtpath_dev_preview_streak_days";

export type DevHomePreviewState = "default" | "completed_today" | "skipped_wrap" | "needs_wrap";

export function isDevHomePreviewAvailable(): boolean {
  return typeof __DEV__ !== "undefined" && __DEV__;
}

/** When set (1–30), main menu CTA uses "Complete Day N activities" regardless of streak. */
export async function getDevPreviewActivityDay(): Promise<number | null> {
  if (!isDevHomePreviewAvailable()) return null;
  try {
    const v = await AsyncStorage.getItem(K_ACTIVITY_DAY);
    if (v == null || v === "" || v === "off") return null;
    const n = parseInt(v, 10);
    if (!Number.isFinite(n) || n < 1 || n > 30) return null;
    return n;
  } catch {
    return null;
  }
}

export async function setDevPreviewActivityDay(day: number | null): Promise<void> {
  if (!isDevHomePreviewAvailable()) return;
  try {
    if (day == null) await AsyncStorage.removeItem(K_ACTIVITY_DAY);
    else await AsyncStorage.setItem(K_ACTIVITY_DAY, String(day));
  } catch {
    // best-effort
  }
}

/** Override which home banners appear (only in __DEV__). */
export async function getDevPreviewHomeState(): Promise<DevHomePreviewState> {
  if (!isDevHomePreviewAvailable()) return "default";
  try {
    const v = await AsyncStorage.getItem(K_HOME_STATE);
    if (v === "completed_today" || v === "skipped_wrap" || v === "needs_wrap") return v;
    return "default";
  } catch {
    return "default";
  }
}

export async function setDevPreviewHomeState(s: DevHomePreviewState): Promise<void> {
  if (!isDevHomePreviewAvailable()) return;
  try {
    if (s === "default") await AsyncStorage.removeItem(K_HOME_STATE);
    else await AsyncStorage.setItem(K_HOME_STATE, s);
  } catch {
    // best-effort
  }
}

/** When set (0–999), Home header + stats show this streak instead of real data (__DEV__ only). */
export async function getDevPreviewStreakDays(): Promise<number | null> {
  if (!isDevHomePreviewAvailable()) return null;
  try {
    const v = await AsyncStorage.getItem(K_STREAK_DAYS);
    if (v == null || v === "") return null;
    const n = parseInt(v, 10);
    if (!Number.isFinite(n) || n < 0 || n > 999) return null;
    return n;
  } catch {
    return null;
  }
}

export async function setDevPreviewStreakDays(days: number | null): Promise<void> {
  if (!isDevHomePreviewAvailable()) return;
  try {
    if (days == null) await AsyncStorage.removeItem(K_STREAK_DAYS);
    else await AsyncStorage.setItem(K_STREAK_DAYS, String(days));
  } catch {
    // best-effort
  }
}

export async function clearDevHomePreview(): Promise<void> {
  if (!isDevHomePreviewAvailable()) return;
  try {
    await AsyncStorage.multiRemove([K_ACTIVITY_DAY, K_HOME_STATE, K_STREAK_DAYS]);
  } catch {
    // best-effort
  }
}

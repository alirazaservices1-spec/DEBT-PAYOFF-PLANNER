import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

const LOG_KEY = "@debtpath_feedback_log_v1";
const ACTION_LOG_KEY = "@debtpath_action_log_v1";

export type AppFeedbackPayload = {
  source: "post_day1" | "multi_trigger";
  trigger?: string;
  sentiment?: "love" | "ok" | "off";
  categories?: string[];
  otherNote?: string;
  context?: string;
  email?: string;
  consent?: boolean;
  consentTimestamp?: string;
  screenAtTime?: string;
  sessionId?: string;
};

/** Append an event to the rolling action log (last 50 kept). */
export async function logAction(action: string, meta?: Record<string, unknown>): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(ACTION_LOG_KEY);
    const arr: unknown[] = raw ? JSON.parse(raw) : [];
    arr.push({ action, ...meta, ts: new Date().toISOString() });
    await AsyncStorage.setItem(ACTION_LOG_KEY, JSON.stringify(arr.slice(-50)));
  } catch {
    /* best-effort */
  }
}

async function getRecentActionLog(): Promise<unknown[]> {
  try {
    const raw = await AsyncStorage.getItem(ACTION_LOG_KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as unknown[]).slice(-10);
  } catch {
    return [];
  }
}

function makeSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Resolve the API base URL — works in Expo Go, dev builds, and production. */
function apiBase(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}`;
  return "";
}

/**
 * Store feedback locally and forward it to the Express backend
 * (which then sends an email to aliraza.services1@gmail.com).
 */
export async function appendFeedbackLog(entry: AppFeedbackPayload): Promise<void> {
  const actionLog = await getRecentActionLog();
  const enriched = {
    ...entry,
    ts: new Date().toISOString(),
    deviceOs: Platform.OS,
    buildVersion: Constants.expoConfig?.version ?? "unknown",
    sessionId: entry.sessionId ?? makeSessionId(),
    actionLog,
  };

  // 1. Persist locally (last 40 entries)
  try {
    const raw = await AsyncStorage.getItem(LOG_KEY);
    const arr: unknown[] = raw ? JSON.parse(raw) : [];
    arr.push(enriched);
    await AsyncStorage.setItem(LOG_KEY, JSON.stringify(arr.slice(-40)));
  } catch {
    /* storage failure is non-fatal */
  }

  // 2. POST to Express backend → email
  const base = apiBase();
  const url = `${base}/api/feedback`;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(enriched),
    });
  } catch (err) {
    console.warn("[feedback] Could not reach /api/feedback (offline?):", err);
  }
}

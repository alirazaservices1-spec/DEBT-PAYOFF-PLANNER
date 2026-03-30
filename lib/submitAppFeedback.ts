import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

const LOG_KEY = "@debtpath_feedback_log_v1";

export type AppFeedbackPayload = {
  source: "post_day1";
  sentiment?: "love" | "ok" | "off";
  categories?: string[];
  otherNote?: string;
  context?: string;
  email?: string;
  /** Required when collecting identifiable feedback; omitted for anonymous check-in logs. */
  consent?: boolean;
  requestedReview?: boolean;
};

export async function appendFeedbackLog(entry: AppFeedbackPayload): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(LOG_KEY);
    const arr: unknown[] = raw ? JSON.parse(raw) : [];
    arr.push({
      ...entry,
      ts: new Date().toISOString(),
      platform: Platform.OS,
      appVersion: Constants.expoConfig?.version ?? "unknown",
    });
    await AsyncStorage.setItem(LOG_KEY, JSON.stringify(arr.slice(-40)));
  } catch {
    // best-effort
  }

  const url = process.env.EXPO_PUBLIC_FEEDBACK_URL;
  if (url && typeof fetch === "function") {
    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
    } catch {
      /* offline */
    }
  }
}

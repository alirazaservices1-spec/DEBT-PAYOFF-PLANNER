import AsyncStorage from "@react-native-async-storage/async-storage";

export type FeedbackTrigger =
  | "day1_complete"
  | "debt_paid_off"
  | "streak_7"
  | "session_5"
  | "level_up_5plus";

const TRIGGER_KEYS: Record<FeedbackTrigger, string> = {
  day1_complete:  "@debtpath_fb_day1_v2",
  debt_paid_off:  "@debtpath_fb_debtpaid_v2",
  streak_7:       "@debtpath_fb_streak7_v2",
  session_5:      "@debtpath_fb_session5_v2",
  level_up_5plus: "@debtpath_fb_lvl5_v2",
};

const LAST_SHOWN_KEY = "@debtpath_feedback_last_shown_v1";
const SESSION_COUNT_KEY = "@debtpath_session_count_v2";

export async function incrementSessionCount(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_COUNT_KEY);
    const count = raw ? parseInt(raw, 10) : 0;
    const next = count + 1;
    await AsyncStorage.setItem(SESSION_COUNT_KEY, String(next));
    return next;
  } catch {
    return 0;
  }
}

export async function hasTriggerFired(trigger: FeedbackTrigger): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(TRIGGER_KEYS[trigger]);
    return v === "1";
  } catch {
    return false;
  }
}

export async function markFeedbackShown(trigger?: FeedbackTrigger): Promise<void> {
  await AsyncStorage.setItem(LAST_SHOWN_KEY, new Date().toISOString());
  if (trigger) {
    await AsyncStorage.setItem(TRIGGER_KEYS[trigger], "1");
  }
}

// ── Legacy shims (kept so existing callers in day-complete.tsx compile) ──
export const POST_D1_SATISFACTION_KEY = "@debtpath_post_d1_satisfaction_v1";

export async function hasCompletedPostDay1Satisfaction(): Promise<boolean> {
  return hasTriggerFired("day1_complete");
}

export async function markPostDay1SatisfactionComplete(): Promise<void> {
  await markFeedbackShown("day1_complete");
}

export function shouldOfferPostDay1Prompt(streakCount: number): boolean {
  return streakCount === 1;
}

export async function getSessionCount(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_COUNT_KEY);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

export async function shouldShowFeedback(): Promise<boolean> {
  return true;
}

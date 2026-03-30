import AsyncStorage from "@react-native-async-storage/async-storage";

/** One-time prompt after the user’s first Day Complete (streak === 1). */
export const POST_D1_SATISFACTION_KEY = "@debtpath_post_d1_satisfaction_v1";

export async function hasCompletedPostDay1Satisfaction(): Promise<boolean> {
  const v = await AsyncStorage.getItem(POST_D1_SATISFACTION_KEY);
  return v === "1";
}

export async function markPostDay1SatisfactionComplete(): Promise<void> {
  await AsyncStorage.setItem(POST_D1_SATISFACTION_KEY, "1");
}

/** First day-complete screen only (fresh from onboarding Day 1). */
export function shouldOfferPostDay1Prompt(streakCount: number): boolean {
  return streakCount === 1;
}

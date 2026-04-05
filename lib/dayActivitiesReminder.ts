import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const NOTIF_ID_KEY = "@debtpath_day_activities_next_id_v1";
const CHANNEL = "day-activities";

async function ensureChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(CHANNEL, {
    name: "Daily check-in",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250],
    lightColor: "#FF6B1A",
  });
}

/** Cancels the single pending “next morning” day-activities nudge, if any. */
export async function cancelScheduledNextDayActivitiesReminder(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    const id = await AsyncStorage.getItem(NOTIF_ID_KEY);
    if (id) {
      await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
      await AsyncStorage.removeItem(NOTIF_ID_KEY);
    }
  } catch {}
}

/**
 * After the user finishes the day-complete flow (acknowledged), schedule a local
 * notification for the next calendar day at 9:00 (device local time).
 * Respects streak reminder prefs: no schedule when streak reminders are off.
 */
export async function scheduleNextDayActivitiesReminderAfterAck(
  streakCount: number,
  streakRemindersEnabled: boolean
): Promise<void> {
  if (Platform.OS === "web") return;
  if (!streakRemindersEnabled) return;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let granted = existing === "granted";
  if (!granted) {
    const { status } = await Notifications.requestPermissionsAsync();
    granted = status === "granted";
  }
  if (!granted) return;

  await ensureChannel();
  await cancelScheduledNextDayActivitiesReminder();

  const now = new Date();
  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    9,
    0,
    0,
    0
  );
  if (tomorrow.getTime() <= now.getTime()) return;

  const nextDayLabel = streakCount >= 1 ? streakCount + 1 : null;
  const title = "DebtPath — Today’s check-in 🔥";
  const body =
    nextDayLabel != null
      ? `Day ${nextDayLabel} is ready — open DebtPath to finish today’s activities and keep your streak.`
      : `Open DebtPath to finish today’s activities and build your streak.`;

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { type: "day_activities_reminder", nextDayLabel },
        sound: true,
        ...(Platform.OS === "android" ? { android: { channelId: CHANNEL } } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: tomorrow,
      },
    });
    await AsyncStorage.setItem(NOTIF_ID_KEY, id);
  } catch (err) {
    console.warn("[DayActivitiesReminder] schedule failed:", err);
  }
}

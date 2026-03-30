import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const STORAGE_KEY = "@debtpath_goal_v1";
const NOTIF_CHANNEL = "daily-reminder";

// 6 rotating motivational messages; {goal} is replaced with the goal name.
const MOTIVATIONAL_MESSAGES = [
  "Keep going! You're one day closer to {goal}. Stay on track with your debt payoff today.",
  "Every dollar you put toward debt is a dollar closer to {goal}. You've got this!",
  "Small steps, big results. Your goal of {goal} is within reach - keep paying it down!",
  "Don't stop now! {goal} is waiting for you. Log a payment and stay on track.",
  "You're building momentum toward {goal}. One payment at a time - keep it going!",
  "Financial freedom and {goal} are closer than you think. Great job staying the course!",
];

const GENERAL_MESSAGES = [
  "Stay on track with your debt payoff today. Every payment counts!",
  "Reminder: one payment at a time is all it takes. Keep going!",
  "You're doing great. Log a payment today and stay on your debt-free path.",
  "Small consistent payments lead to big results. Keep it up!",
  "Debt-free is the goal. You're one step closer - log today's payment.",
  "Stay focused and consistent. Your future self will thank you!",
];

export interface GoalState {
  goalName: string;
  goalAmount: number;
  goalProgress: number;
  remindersEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
  savedAt: string | null;
  milestonesAwarded: number[];
}

const DEFAULT_STATE: GoalState = {
  goalName: "",
  goalAmount: 0,
  goalProgress: 0,
  remindersEnabled: false,
  reminderHour: 9,
  reminderMinute: 0,
  savedAt: null,
  milestonesAwarded: [],
};

const GOAL_MILESTONE_PCTS = [25, 50, 75, 100];

interface GoalContextValue extends GoalState {
  loaded: boolean;
  hasGoal: boolean;
  saveGoal: (name: string, amount: number) => Promise<void>;
  deleteGoal: () => Promise<void>;
  setRemindersEnabled: (enabled: boolean) => Promise<void>;
  sendTestReminder: () => Promise<boolean>;
  addGoalProgress: (amount: number) => Promise<number | null>;
  resetGoal: () => Promise<void>;
  dailySaving: number;
  daysToGoal: number;
}

const GoalContext = createContext<GoalContextValue | null>(null);

// Configure how notifications behave when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

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

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(NOTIF_CHANNEL, {
    name: "Daily Reminder",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250],
    lightColor: "#2ECC71",
  });
}

async function cancelDailyReminder(): Promise<void> {
  if (Platform.OS === "web") return;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if ((n.content.data as any)?.type === "daily_reminder") {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }
}

async function scheduleDailyReminder(
  goalName: string,
  hour: number,
  minute: number
): Promise<void> {
  if (Platform.OS === "web") return;

  const granted = await checkPermission();
  if (!granted) return;

  await ensureAndroidChannel();
  await cancelDailyReminder();

  const messageTemplate = goalName
    ? MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]
    : GENERAL_MESSAGES[Math.floor(Math.random() * GENERAL_MESSAGES.length)];

  const body = goalName
    ? messageTemplate.replace("{goal}", goalName)
    : messageTemplate;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "DebtPath - Daily Check-in 🔥",
      body,
      data: { type: "daily_reminder" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export function GoalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GoalState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setState({ ...DEFAULT_STATE, ...JSON.parse(raw) });
        } catch {}
      }
      setLoaded(true);
    });
  }, []);

  const persist = useCallback(async (next: GoalState) => {
    setState(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const saveGoal = useCallback(
    async (name: string, amount: number) => {
      const next: GoalState = {
        ...state,
        goalName: name.trim(),
        goalAmount: amount,
        remindersEnabled: true,
        savedAt: new Date().toISOString(),
      };
      await persist(next);
      // Schedule daily reminder at default 9:00 AM
      await scheduleDailyReminder(name.trim(), next.reminderHour, next.reminderMinute);
    },
    [state, persist]
  );

  const deleteGoal = useCallback(async () => {
    const next: GoalState = {
      ...DEFAULT_STATE,
      reminderHour: state.reminderHour,
      reminderMinute: state.reminderMinute,
    };
    await persist(next);
    await cancelDailyReminder();
  }, [state, persist]);

  const setRemindersEnabled = useCallback(
    async (enabled: boolean) => {
      const next = { ...state, remindersEnabled: enabled };
      await persist(next);
      if (enabled) {
        // User explicitly enabled — prompt for permission here if needed
        const granted = await requestPermission();
        if (granted) {
          await scheduleDailyReminder(state.goalName, state.reminderHour, state.reminderMinute);
        }
      } else {
        await cancelDailyReminder();
      }
    },
    [state, persist]
  );

  const sendTestReminder = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === "web") return false;
    const granted = await requestPermission();
    if (!granted) return false;
    await ensureAndroidChannel();

    const messageTemplate = state.goalName
      ? MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]
      : GENERAL_MESSAGES[Math.floor(Math.random() * GENERAL_MESSAGES.length)];

    const body = state.goalName
      ? messageTemplate.replace("{goal}", state.goalName)
      : messageTemplate;

    const fireAt = new Date(Date.now() + 60 * 1000);

    await Notifications.scheduleNotificationAsync({
      content: {
      title: "DebtPath - Daily Check-in 🔥 (TEST)",
        body,
        data: { type: "daily_reminder_test" },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fireAt,
      },
    });
    return true;
  }, [state.goalName]);

  const addGoalProgress = useCallback(
    async (amount: number): Promise<number | null> => {
      if (!state.goalName || state.goalAmount <= 0 || amount <= 0) return null;
      const oldProgress = state.goalProgress ?? 0;
      const newProgress = Math.min(state.goalAmount, oldProgress + amount);
      const oldPct = state.goalAmount > 0 ? (oldProgress / state.goalAmount) * 100 : 0;
      const newPct = state.goalAmount > 0 ? (newProgress / state.goalAmount) * 100 : 0;
      const awarded = state.milestonesAwarded ?? [];
      const newMilestone = GOAL_MILESTONE_PCTS.find(
        (pct) => !awarded.includes(pct) && oldPct < pct && newPct >= pct
      ) ?? null;
      const nextAwarded = newMilestone ? [...awarded, newMilestone] : awarded;
      await persist({ ...state, goalProgress: newProgress, milestonesAwarded: nextAwarded });
      return newMilestone;
    },
    [state, persist]
  );

  const resetGoal = useCallback(async () => {
    setState(DEFAULT_STATE);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const hasGoal = !!state.goalName && state.goalAmount > 0;

  // Calculate: save $X/day → reach goal in Y days
  // Assumes the user directs their daily saving toward debt payoff to accelerate it
  const dailySaving = hasGoal && state.goalAmount > 0 ? Math.max(1, state.goalAmount / 365) : 0;
  const daysToGoal = hasGoal && state.goalAmount > 0 ? Math.ceil(state.goalAmount / dailySaving) : 0;

  const value: GoalContextValue = {
    ...state,
    loaded,
    hasGoal,
    saveGoal,
    deleteGoal,
    setRemindersEnabled,
    sendTestReminder,
    addGoalProgress,
    resetGoal,
    dailySaving,
    daysToGoal,
  };

  return <GoalContext.Provider value={value}>{children}</GoalContext.Provider>;
}

export function useGoal(): GoalContextValue {
  const ctx = useContext(GoalContext);
  if (!ctx) throw new Error("useGoal must be used inside GoalProvider");
  return ctx;
}

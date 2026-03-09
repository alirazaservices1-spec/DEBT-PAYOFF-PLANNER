import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DISMISSED_KEY = "@debtfree_dismissed_reminders";
const PREFS_KEY = "@debtfree_reminder_prefs";

export type ReminderDays = 1 | 3 | 7;

export interface ReminderPrefs {
  enabled: boolean;
  daysBefore: ReminderDays[];
}

export interface Reminder {
  id: string;
  debtId: string;
  debtName: string;
  amount: number;
  dueDate: Date;
  daysUntilDue: number;
  isOverdue: boolean;
}

interface NotificationContextValue {
  reminders: Reminder[];
  dismissedIds: string[];
  prefs: ReminderPrefs;
  pendingCount: number;
  dismiss: (id: string) => Promise<void>;
  dismissAll: () => Promise<void>;
  updatePrefs: (prefs: ReminderPrefs) => Promise<void>;
  setDebts: (debts: { id: string; name: string; minimumPayment: number; dueDate: number }[]) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const DEFAULT_PREFS: ReminderPrefs = {
  enabled: true,
  daysBefore: [1, 3, 7],
};

function buildReminders(
  debts: { id: string; name: string; minimumPayment: number; dueDate: number }[],
  prefs: ReminderPrefs
): Reminder[] {
  if (!prefs.enabled || debts.length === 0) return [];

  const now = new Date();
  const results: Reminder[] = [];
  const maxDays = Math.max(...prefs.daysBefore, 7);

  for (const debt of debts) {
    const day = debt.dueDate;
    if (!day || day < 1 || day > 31) continue;

    for (let monthOffset = 0; monthOffset <= 1; monthOffset++) {
      const dueDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, day);
      if (dueDate < now && monthOffset === 0) continue;

      const diff = Math.round((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (diff < -1) continue;
      if (diff > maxDays + 1) continue;

      const isOverdue = diff < 0;
      const id = `${debt.id}-${dueDate.getFullYear()}-${dueDate.getMonth() + 1}`;

      const shouldShow =
        isOverdue ||
        prefs.daysBefore.some((d) => diff <= d);

      if (shouldShow) {
        results.push({
          id,
          debtId: debt.id,
          debtName: debt.name,
          amount: debt.minimumPayment,
          dueDate,
          daysUntilDue: diff,
          isOverdue,
        });
      }
    }
  }

  return results.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [prefs, setPrefs] = useState<ReminderPrefs>(DEFAULT_PREFS);
  const [debtList, setDebtList] = useState<
    { id: string; name: string; minimumPayment: number; dueDate: number }[]
  >([]);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(DISMISSED_KEY),
      AsyncStorage.getItem(PREFS_KEY),
    ]).then(([dismissed, prefsStr]) => {
      if (dismissed) setDismissedIds(JSON.parse(dismissed));
      if (prefsStr) setPrefs(JSON.parse(prefsStr));
    });
  }, []);

  const reminders = useMemo(
    () => buildReminders(debtList, prefs).filter((r) => !dismissedIds.includes(r.id)),
    [debtList, prefs, dismissedIds]
  );

  const pendingCount = reminders.length;

  const dismiss = useCallback(
    async (id: string) => {
      const next = [...dismissedIds, id];
      setDismissedIds(next);
      await AsyncStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
    },
    [dismissedIds]
  );

  const dismissAll = useCallback(async () => {
    const ids = reminders.map((r) => r.id);
    const next = [...new Set([...dismissedIds, ...ids])];
    setDismissedIds(next);
    await AsyncStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
  }, [reminders, dismissedIds]);

  const updatePrefs = useCallback(async (newPrefs: ReminderPrefs) => {
    setPrefs(newPrefs);
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(newPrefs));
  }, []);

  const setDebts = useCallback(
    (debts: { id: string; name: string; minimumPayment: number; dueDate: number }[]) => {
      setDebtList(debts);
    },
    []
  );

  return (
    <NotificationContext.Provider
      value={{ reminders, dismissedIds, prefs, pendingCount, dismiss, dismissAll, updatePrefs, setDebts }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be inside NotificationProvider");
  return ctx;
}

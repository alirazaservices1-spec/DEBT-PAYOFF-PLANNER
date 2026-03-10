import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useNotifications, type ReminderDays } from "@/context/NotificationContext";
import { useCurrency } from "@/context/CurrencyContext";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDueDate(date: Date): string {
  return `${DAY_NAMES[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
}

function getDaysLabel(days: number, isOverdue: boolean): { text: string; color: string } {
  if (isOverdue) return { text: "Overdue", color: Colors.danger };
  if (days === 0) return { text: "Due today", color: Colors.warning };
  if (days === 1) return { text: "Due tomorrow", color: Colors.warning };
  return { text: `Due in ${days} days`, color: Colors.accent };
}

export function NotificationBell() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const { reminders, pendingCount, prefs, dismiss, dismissAll, updatePrefs } = useNotifications();
  const { fmt } = useCurrency();

  const toggleReminder = async (day: ReminderDays) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const current = prefs.daysBefore;
    const next = current.includes(day)
      ? current.filter((d) => d !== day)
      : ([...current, day].sort((a, b) => a - b) as ReminderDays[]);
    await updatePrefs({ ...prefs, daysBefore: next });
  };

  return (
    <>
      <Pressable
        onPress={() => {
          setOpen(true);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        style={styles.bellBtn}
        hitSlop={8}
      >
        <Ionicons name={pendingCount > 0 ? "notifications" : "notifications-outline"} size={22} color={C.text} />
        {pendingCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pendingCount > 9 ? "9+" : pendingCount}</Text>
          </View>
        )}
      </Pressable>

      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setOpen(false)}
      >
        <View style={[styles.modal, { backgroundColor: C.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: C.border, paddingTop: insets.top + 16 }]}>
            <Text style={[styles.modalTitle, { color: C.text }]}>Payment Reminders</Text>
            <Pressable onPress={() => setOpen(false)} hitSlop={8}>
              <Ionicons name="close" size={24} color={C.textSecondary} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
              <Text style={[styles.sectionTitle, { color: C.textSecondary }]}>Remind Me</Text>
              <View style={styles.chipRow}>
                {([1, 3, 7] as ReminderDays[]).map((day) => {
                  const active = prefs.daysBefore.includes(day);
                  return (
                    <Pressable
                      key={day}
                      onPress={() => toggleReminder(day)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: active ? Colors.primary : C.surfaceSecondary,
                          borderColor: active ? Colors.primary : C.border,
                        },
                      ]}
                    >
                      <Text style={[styles.chipText, { color: active ? "#05130A" : C.textSecondary }]}>
                        {day === 1 ? "1 day before" : `${day} days before`}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {reminders.length > 0 ? (
              <View style={{ gap: 10 }}>
                <View style={styles.upcomingHeader}>
                  <Text style={[styles.sectionTitle, { color: C.textSecondary }]}>
                    Upcoming Payments ({reminders.length})
                  </Text>
                  <Pressable onPress={() => { dismissAll(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
                    <Text style={[styles.clearAll, { color: Colors.primary }]}>Clear all</Text>
                  </Pressable>
                </View>
                {reminders.map((r) => {
                  const { text, color } = getDaysLabel(r.daysUntilDue, r.isOverdue);
                  return (
                    <View key={r.id} style={[styles.reminderCard, { backgroundColor: C.surface, borderColor: C.border, borderLeftColor: color }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.reminderName, { color: C.text }]}>{r.debtName}</Text>
                        <Text style={[styles.reminderDate, { color: C.textSecondary }]}>{formatDueDate(r.dueDate)}</Text>
                        <Text style={[styles.reminderStatus, { color }]}>{text}</Text>
                      </View>
                      <View style={styles.reminderRight}>
                        <Text style={[styles.reminderAmount, { color: C.text }]}>{fmt(r.amount)}</Text>
                        <Pressable onPress={() => { dismiss(r.id); Haptics.selectionAsync(); }} hitSlop={8}>
                          <Ionicons name="checkmark-circle-outline" size={22} color={Colors.primary} />
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.empty}>
                <Ionicons name="checkmark-circle" size={48} color={Colors.progressGreen} />
                <Text style={[styles.emptyTitle, { color: C.text }]}>All caught up!</Text>
                <Text style={[styles.emptyBody, { color: C.textSecondary }]}>
                  No upcoming payments in the next {Math.max(...prefs.daysBefore, 7)} days.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bellBtn: { position: "relative", padding: 4 },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: Colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: { fontSize: 20, fontWeight: "700" },
  modalScroll: { padding: 16, gap: 14 },
  section: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  chipRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: "600" },
  upcomingHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  clearAll: { fontSize: 13, fontWeight: "600" },
  reminderCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: 14,
    gap: 12,
  },
  reminderName: { fontSize: 15, fontWeight: "700" },
  reminderDate: { fontSize: 13, marginTop: 2 },
  reminderStatus: { fontSize: 13, fontWeight: "600", marginTop: 2 },
  reminderRight: { alignItems: "flex-end", gap: 8 },
  reminderAmount: { fontSize: 16, fontWeight: "800" },
  empty: { alignItems: "center", gap: 12, paddingVertical: 40 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyBody: { fontSize: 14, textAlign: "center" },
});

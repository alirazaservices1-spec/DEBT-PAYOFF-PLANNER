import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useIsDark } from "@/context/ThemeContext";
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  Platform, Animated, Modal, Linking,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { soundManager } from "@/utils/SoundManager";
import { useDebts } from "@/context/DebtContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useGame } from "@/context/GameContext";
import { useStreakReminder } from "@/context/StreakReminderContext";
import { useGoal } from "@/context/GoalContext";
import { useNotifications } from "@/context/NotificationContext";
import {
  monthsToText, MonthlySnapshot, Debt, debtsEligibleForStrategy, DebtMonthSnapshot,
  projectedInterestSavedVsMinimumPayments,
} from "@/lib/calculations";
import {
  shouldOfferAutoRouteToDayComplete,
  markDayCompleteAutoRoutedToday,
} from "@/lib/dayCompleteGate";
import {
  usePaymentEffects, PaymentEffectsOverlay,
} from "@/components/PaymentSuccessEffects";
import { ConsultationCarousel } from "@/components/ConsultationCarousel";
import { DexCoin } from "@/components/DexCoin";
import { DEX_SCREEN_MAP } from "@/constants/dexScreenMap";

function openURL(url: string) {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    (window as any).open(url, "_blank");
  } else {
    Linking.openURL(url).catch(() => {});
  }
}

// ── Color constants matching reference ────────────────────────────────────────
const DARK = "#1A0A00";
/** Near-black on white/cream — `#1A0A00` reads brown on butter-yellow cards; client asked for black text. */
const INK = "#1A0F08";
const MID  = "#2E1408";
const GOLD = "#F5C030";
// Primary text on dark brown / black plan surfaces.
const WHITE_ON_DARK = "#FFFFFF";
// Legacy alias — use solid white on hero for maximum readability.
const ACCENT_TEXT = WHITE_ON_DARK;
const GREEN_LT = "#8BC34A";
const BLUE = "#1A6FC4";
const BORDER = "#E0D8CE";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const FULL_MONTH_NAMES = ["January","February","March","April","May","June","July",
  "August","September","October","November","December"];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const DEX_MSGS = [
  "Each month you check in = one month closer to freedom! 🔥",
  "Tap any month to see exactly what to pay. Knowledge = power! 💪",
  "Your strategy is working - stay the course! ❄️",
  "One debt at a time. The plan is rolling. Keep going! 💪",
  "You will save real money vs. minimums only. That is real money! 💰",
];

function fmt2(n: number): string { return `${MONTH_NAMES[n.getMonth()]} ${n.getFullYear()}`; }
function fmtFull2(n: Date): string { return `${FULL_MONTH_NAMES[n.getMonth()]} ${n.getFullYear()}`; }


// ── Month Row ─────────────────────────────────────────────────────────────────
type RowStatus = "done" | "current" | "upcoming";

function MonthRow({
  snapshot, monthNum, status, expanded, onToggle, debts, fmt, fmtFull, targetDebtId, extraPayment, onLogPayment,
}: {
  snapshot: MonthlySnapshot;
  monthNum: number;
  status: RowStatus;
  expanded: boolean;
  onToggle: () => void;
  debts: Debt[];
  fmt: (n: number) => string;
  fmtFull: (n: number) => string;
  targetDebtId: string | null;
  extraPayment: number;
  onLogPayment?: (e: { debtId: string; amount: number }) => Promise<void>;
}) {
  const isDone = status === "done";
  const isCurrent = status === "current";

  return (
    <Pressable
      onPress={onToggle}
      style={[
        styles.monthRow,
        isCurrent && styles.monthRowCurrent,
        isDone && styles.monthRowDone,
      ]}
    >
      <View style={styles.mrTop}>
        <View style={styles.mrLeft}>
          <View style={[
            styles.mrNum,
            isDone && styles.mrNumDone,
            isCurrent && styles.mrNumCurrent,
          ]}>
            <Text style={[
              styles.mrNumText,
              isDone && { color: "#6B7280" },
              isCurrent && { color: INK },
            ]}>{monthNum}</Text>
          </View>
          <Text style={[
            styles.mrMonth,
            isDone && styles.mrMonthDone,
          ]}>{fmtFull2(snapshot.date)}</Text>
          {isDone && (
            <View style={styles.tagDone}><Text style={styles.tagDoneText}>✓ Done</Text></View>
          )}
          {isCurrent && (
            <View style={styles.tagNow}><Text style={styles.tagNowText}>NOW</Text></View>
          )}
        </View>
        <View style={styles.mrRight}>
          <Text style={styles.mrBalance}>{fmt(snapshot.totalBalance)}</Text>
          <Text style={styles.mrInterest}>${Math.round(snapshot.totalInterestPaid)} cumulative</Text>
        </View>
      </View>

      {expanded && (
        <View style={styles.mrDetail}>
          {snapshot.debtBreakdown.map((b: DebtMonthSnapshot) => {
            const debt = debts.find((d) => d.id === b.debtId);
            if (!debt) return null;
            const isTarget = b.debtId === targetDebtId;
            const isPaidOff = b.balance <= 0 && b.payment <= 0;
            if (isPaidOff) return null;

            // In the simulation, the target debt receives all "extra pool",
            // which includes both:
            //  - what the user committed to (extraPayment)
            //  - plus freed minimums from paid-off debts.
            // The UI request is to show "minimums + what the user committed to".
            const committedTargetMax = (debt.minimumPayment ?? 0) + extraPayment;
            const displayPayment = isTarget
              ? Math.min(b.payment, committedTargetMax)
              : b.payment;

            return (
              <View key={b.debtId} style={styles.mrDebtRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.mdrName}>{debt.name}</Text>
                  {isCurrent && (
                    <Text style={styles.mdrType}>
                      {isTarget ? "🎯 Attack - minimums + your commitment" : "Minimum only"}
                    </Text>
                  )}
                </View>
                <View style={{ alignItems: "flex-end", gap: 2 }}>
                  <Text style={[styles.mdrPay, isTarget && styles.mdrPayExtra]}>
                    {fmtFull(displayPayment)}/mo{isTarget ? " ⚡" : ""}
                  </Text>
                  {isCurrent && onLogPayment && (
                    <Pressable
                      onPress={() => onLogPayment({ debtId: b.debtId, amount: displayPayment })}
                      style={({ pressed }) => [
                        styles.logBtn,
                        { opacity: pressed ? 0.85 : 1 },
                      ]}
                      hitSlop={10}
                    >
                      <Text style={styles.logBtnText}>Log</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </Pressable>
  );
}

// ── Milestone row ─────────────────────────────────────────────────────────────
function MilestoneRow({ icon, title, sub, isFinal }: {
  icon: string; title: string; sub: string; isFinal?: boolean;
}) {
  return (
    <LinearGradient
      colors={isFinal ? ["#0D3B2E", "#0A4A20"] as const : [DARK, "#2A1808"] as const}
      style={[styles.milestoneRow, isFinal && { borderWidth: 2, borderColor: "rgba(139,195,74,.3)" }]}
    >
      <Text style={styles.milIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.milTitle, isFinal && { color: GREEN_LT }]}>{title}</Text>
        <Text style={styles.milSub}>{sub}</Text>
      </View>
    </LinearGradient>
  );
}

// ── Calendar types ─────────────────────────────────────────────────────────────
interface CalendarDebtEvent {
  debtId: string; debtName: string; amount: number; color: string;
  status: "paid" | "upcoming" | "overdue"; scheduledDate: Date;
}

const DEBT_COLORS = ["#3498DB","#9B59B6","#E67E22","#E74C3C","#C07820","#F39C12","#E91E63","#00BCD4","#FF5722"];

// ── Calendar View ─────────────────────────────────────────────────────────────
function CalendarView({
  debts, payments, C, fmt, onMarkPayment,
}: {
  debts: Debt[];
  payments: { debtId: string; amount: number; date: string; isMissed: boolean }[];
  C: typeof Colors.light;
  fmt: (n: number) => string;
  onMarkPayment: (e: CalendarDebtEvent) => Promise<void>;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<{ day: number; events: CalendarDebtEvent[] } | null>(null);

  const debtColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    debts.forEach((d, i) => { map[d.id] = DEBT_COLORS[i % DEBT_COLORS.length]; });
    return map;
  }, [debts]);

  const eventsByDay = useMemo(() => {
    const map: Record<number, CalendarDebtEvent[]> = {};
    const paidByKey = new Set<string>();
    payments.forEach((p) => {
      if (p.isMissed) return;
      const d = new Date(p.date);
      paidByKey.add(`${p.debtId}-${d.getFullYear()}-${d.getMonth()}`);
    });
    debts.forEach((d) => {
      if (d.debtType === "taxDebt" && d.minimumPayment <= 0) return;
      const day = d.dueDate;
      if (!day || day < 1 || day > 31) return;
      const dueDate = new Date(viewYear, viewMonth, day);
      if (dueDate.getMonth() !== viewMonth) return;
      const now = new Date(); now.setHours(0, 0, 0, 0);
      const hasPaid = paidByKey.has(`${d.id}-${dueDate.getFullYear()}-${dueDate.getMonth()}`);
      const status: CalendarDebtEvent["status"] = hasPaid ? "paid" : dueDate < now ? "overdue" : "upcoming";
      if (!map[day]) map[day] = [];
      map[day].push({ debtId: d.id, debtName: d.name, amount: d.minimumPayment, color: debtColorMap[d.id], status, scheduledDate: dueDate });
    });
    return map;
  }, [debts, payments, viewYear, viewMonth, debtColorMap]);

  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };
  const cells: (number | null)[] = [...Array(firstDayOfWeek).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);
  const isToday = (day: number) => day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  const statusColor = (s: CalendarDebtEvent["status"]) => s === "paid" ? Colors.progressGreen : s === "overdue" ? Colors.danger : Colors.accent;

  return (
    <View style={{ flex: 1 }}>
      <View style={[calStyles.navRow, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <Pressable onPress={prevMonth} hitSlop={12} style={calStyles.navBtn}><Ionicons name="chevron-back" size={22} color={Colors.primary} /></Pressable>
        <Text style={[calStyles.monthTitle, { color: C.text }]}>{FULL_MONTH_NAMES[viewMonth]} {viewYear}</Text>
        <Pressable onPress={nextMonth} hitSlop={12} style={calStyles.navBtn}><Ionicons name="chevron-forward" size={22} color={Colors.primary} /></Pressable>
      </View>
      <View style={[calStyles.dayHeaders, { backgroundColor: C.surfaceSecondary }]}>
        {DAY_NAMES.map(d => <View key={d} style={calStyles.dayHeaderCell}><Text style={[calStyles.dayHeaderText, { color: C.textSecondary }]}>{d}</Text></View>)}
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 8, gap: 4 }}>
        {Array.from({ length: cells.length / 7 }, (_, row) => (
          <View key={row} style={calStyles.week}>
            {cells.slice(row * 7, row * 7 + 7).map((day, col) => {
              const events = day ? (eventsByDay[day] ?? []) : [];
              const todayCell = day ? isToday(day) : false;
              return (
                <Pressable key={col} onPress={() => day && events.length > 0 ? setSelected({ day, events }) : null}
                  style={[calStyles.dayCell, { backgroundColor: todayCell ? Colors.primary + "15" : "transparent" }, todayCell && { borderRadius: 8, borderWidth: 1, borderColor: Colors.primary + "40" }]}>
                  {day ? (
                    <>
                      <Text style={[calStyles.dayNum, { color: todayCell ? Colors.primary : C.text }, todayCell && { fontFamily: Fonts.bold, fontWeight: "700" }]}>{day}</Text>
                      <View style={calStyles.chips}>
                        {events.slice(0, 2).map(e => <View key={e.debtId} style={[calStyles.chip, { backgroundColor: statusColor(e.status) }]}><Text style={calStyles.chipText} numberOfLines={1}>{e.debtName.slice(0, 8)}</Text></View>)}
                        {events.length > 2 && <Text style={[calStyles.moreText, { color: C.textSecondary }]}>+{events.length - 2}</Text>}
                      </View>
                    </>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ))}
        <View style={[calStyles.legend, { backgroundColor: C.surface, borderColor: C.border }]}>
          {[{ color: Colors.progressGreen, label: "Paid" }, { color: Colors.accent, label: "Upcoming" }, { color: Colors.danger, label: "Overdue" }].map(({ color, label }) => (
            <View key={label} style={calStyles.legendItem}>
              <View style={[calStyles.legendDot, { backgroundColor: color }]} />
              <Text style={[calStyles.legendText, { color: C.textSecondary }]}>{label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <Modal visible={!!selected} animationType="fade" transparent onRequestClose={() => setSelected(null)}>
        <Pressable style={calStyles.overlay} onPress={() => setSelected(null)}>
          <View style={[calStyles.popup, { backgroundColor: C.surface, borderColor: C.border }]}>
            <Text style={[calStyles.popupTitle, { color: C.text }]}>{selected ? `${FULL_MONTH_NAMES[viewMonth]} ${selected.day}` : ""}</Text>
            {selected?.events.map(e => (
              <View key={e.debtId} style={[calStyles.popupRow, { borderColor: C.border }]}>
                <View style={[calStyles.popupDot, { backgroundColor: statusColor(e.status) }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[calStyles.popupName, { color: C.text }]}>{e.debtName}</Text>
                  <Text style={[calStyles.popupStatus, { color: statusColor(e.status) }]}>{e.status.charAt(0).toUpperCase() + e.status.slice(1)}</Text>
                  <Text style={[calStyles.popupStatus, { color: C.textSecondary }]}>Due {e.scheduledDate.toLocaleDateString()}</Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 6 }}>
                  <Text style={[calStyles.popupAmount, { color: C.text }]}>{fmt(e.amount)}</Text>
                  {e.status !== "paid" && (
                    <Pressable onPress={async () => { await onMarkPayment(e); setSelected(null); }} style={calStyles.markPaidBtn}>
                      <Text style={calStyles.markPaidBtnText}>Mark as Paid</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            ))}
            <Pressable onPress={() => setSelected(null)} style={[calStyles.popupClose, { backgroundColor: Colors.buttonGreen }]}>
              <Text style={calStyles.popupCloseText}>Close</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

// ── Calendar styles ───────────────────────────────────────────────────────────
const calStyles = StyleSheet.create({
  navRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, marginTop: 4, borderBottomWidth: StyleSheet.hairlineWidth },
  navBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  monthTitle: { fontSize: 20, fontFamily: Fonts.bold, fontWeight: "700" },
  dayHeaders: { flexDirection: "row", paddingHorizontal: 8, paddingVertical: 6 },
  dayHeaderCell: { flex: 1, alignItems: "center" },
  dayHeaderText: { fontSize: 14, fontFamily: Fonts.semiBold, fontWeight: "600" },
  week: { flexDirection: "row" },
  dayCell: { flex: 1, minHeight: 58, padding: 3 },
  dayNum: { fontSize: 16 },
  chips: { gap: 3, marginTop: 3 },
  chip: { borderRadius: 5, paddingHorizontal: 4, paddingVertical: 2 },
  chipText: { fontSize: 11, fontFamily: Fonts.bold, fontWeight: "700", color: "#fff" },
  moreText: { fontSize: 11 },
  legend: { flexDirection: "row", gap: 16, justifyContent: "center", padding: 12, borderRadius: 10, borderWidth: 1, margin: 8 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 15 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 24 },
  popup: { width: "100%", maxWidth: 360, borderRadius: 20, borderWidth: 1, padding: 20, gap: 12, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  popupTitle: { fontSize: 20, fontFamily: Fonts.bold, fontWeight: "700" },
  popupRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  popupDot: { width: 12, height: 12, borderRadius: 6 },
  popupName: { fontSize: 17, fontFamily: Fonts.semiBold, fontWeight: "600" },
  popupStatus: { fontSize: 14, fontWeight: "500", marginTop: 1 },
  popupAmount: { fontSize: 19, fontFamily: Fonts.mono, fontWeight: "500" },
  markPaidBtn: { marginTop: 2, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: Colors.progressGreen + "15" },
  markPaidBtnText: { fontSize: 14, fontFamily: Fonts.semiBold, fontWeight: "600", color: Colors.progressGreen },
  popupClose: { borderRadius: 10, paddingVertical: 12, alignItems: "center", marginTop: 4 },
  popupCloseText: { color: "#fff", fontFamily: Fonts.bold, fontWeight: "700", fontSize: 15 },
});

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function PlanScreen() {
  const isDark = useIsDark();
  const C = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const webTopPad = Platform.OS === "web" ? 67 : 0;

  const {
    activeResult, debts, selectedStrategy, customOrder, payments, logPayment,
    extraPayment,
  } = useDebts();
  const { fmt, fmtFull } = useCurrency();
  const { awardXp, recordPaymentForStreak, triggerDex, triggerFlamePulse, grantBonusXp } = useGame();
  const { xpFloatActive, xpAmount, xpY, xpOpacity, xpScale, bonusActive, runPayment } = usePaymentEffects();
  const { cancelTonightsReminder } = useStreakReminder();
  const { addGoalProgress } = useGoal();
  const { dismiss } = useNotifications();

  const [expandedMonths, setExpandedMonths] = useState<Set<number>>(() => new Set());
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [reliefDismissed, setReliefDismissed] = useState(false);

  // Dex bobbing animation
  const bobAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim, { toValue: -4, duration: 700, useNativeDriver: true }),
        Animated.timing(bobAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Dex rotating messages
  const [dexMsgIdx, setDexMsgIdx] = useState(0);
  const dexMsgOpacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(dexMsgOpacity, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
        setDexMsgIdx(i => (i + 1) % DEX_MSGS.length);
        Animated.timing(dexMsgOpacity, { toValue: 1, duration: 250, useNativeDriver: true }).start();
      });
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const toggleMonth = useCallback((month: number) => {
    setExpandedMonths(prev => {
      const next = new Set(prev);
      if (next.has(month)) next.delete(month);
      else { next.clear(); next.add(month); }
      return next;
    });
  }, []);

  const { snapshots, totalInterestPaid, totalMonths, payoffDate, totalPaid } = activeResult;
  const eligibleDebts = useMemo(() => debtsEligibleForStrategy(debts), [debts]);
  const stratLabel = selectedStrategy === "avalanche" ? "Avalanche" : selectedStrategy === "snowball" ? "Snowball" : "Custom";
  const stratEmoji = selectedStrategy === "avalanche" ? "🔥" : selectedStrategy === "snowball" ? "❄️" : "⚙️";
  const hasMissingDebtInputs = debts.length > 0 && eligibleDebts.length === 0;

  const interestSaved = useMemo(
    () =>
      projectedInterestSavedVsMinimumPayments(
        debts,
        activeResult.totalInterestPaid,
        selectedStrategy,
        customOrder
      ),
    [debts, activeResult.totalInterestPaid, selectedStrategy, customOrder]
  );

  // Today's month detection
  const today = new Date();
  const todayMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const currentSnapshotIdx = useMemo(() => {
    const idx = snapshots.findIndex(s =>
      s.date.getFullYear() === today.getFullYear() && s.date.getMonth() === today.getMonth()
    );
    return idx >= 0 ? idx : -1;
  }, [snapshots]);

  // Journey progress (0–1)
  const journeyProgress = useMemo(() => {
    if (totalMonths === 0) return 0;
    const done = currentSnapshotIdx >= 0 ? currentSnapshotIdx : 0;
    return Math.min(done / totalMonths, 1);
  }, [currentSnapshotIdx, totalMonths]);

  const journeyPct = Math.round(journeyProgress * 100);
  const startDate = snapshots.length > 0 ? snapshots[0].date : today;

  // Target debt (the one being "attacked" this month)
  const targetDebtId = useMemo(() => {
    if (eligibleDebts.length === 0) return null;
    if (selectedStrategy === "snowball") {
      const active = eligibleDebts.filter(d => d.balance > 0);
      if (!active.length) return null;
      return active.slice().sort((a, b) => a.balance - b.balance)[0].id;
    }
    if (selectedStrategy === "avalanche") {
      const active = eligibleDebts.filter(d => d.balance > 0);
      if (!active.length) return null;
      return active.slice().sort((a, b) => b.apr - a.apr)[0].id;
    }
    return null;
  }, [eligibleDebts, selectedStrategy]);

  /** Spotlight row for a named debt (plan balance + this month’s planned payment). */
  const belleDebt = useMemo(
    () => debts.find((d) => d.name.trim().toLowerCase() === "belle"),
    [debts],
  );

  const bellePlanNumbers = useMemo(() => {
    if (!belleDebt || snapshots.length === 0) return null;
    const snapIdx = currentSnapshotIdx >= 0 ? currentSnapshotIdx : 0;
    const snap = snapshots[snapIdx];
    const br = snap.debtBreakdown.find((x) => x.debtId === belleDebt.id);
    const isTarget = belleDebt.id === targetDebtId;
    const committedTargetMax = (belleDebt.minimumPayment ?? 0) + extraPayment;
    const displayBalance = br != null ? br.balance : belleDebt.balance;
    const displayPayment = br != null
      ? (isTarget ? Math.min(br.payment, committedTargetMax) : br.payment)
      : (belleDebt.minimumPayment ?? 0);
    return { displayBalance, displayPayment };
  }, [belleDebt, snapshots, currentSnapshotIdx, targetDebtId, extraPayment]);

  // Build list items: snapshots interleaved with milestone rows
  const listItems = useMemo(() => {
    const items: Array<{ type: "month"; snapshot: MonthlySnapshot; idx: number } | { type: "milestone"; snapshot: MonthlySnapshot; idx: number; isFinal: boolean }> = [];
    snapshots.forEach((s, idx) => {
      items.push({ type: "month", snapshot: s, idx });
      if (s.paidOffDebts.length > 0) {
        const isFinal = idx === snapshots.length - 1;
        items.push({ type: "milestone", snapshot: s, idx, isFinal });
      }
    });
    return items;
  }, [snapshots]);

  // Keep hook order stable to avoid runtime hook mismatch crashes.
  if (hasMissingDebtInputs) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? DARK : "#FAF8F5", paddingTop: insets.top + 60, paddingHorizontal: 20 }]}>
        <View style={{ backgroundColor: "#fff", borderRadius: 18, borderWidth: 1.5, borderColor: "#EDE7DA", padding: 16 }}>
          <Text style={{ fontFamily: Fonts.extraBold, fontSize: 16, color: INK, marginBottom: 6 }}>
            Add missing debt info to see the payoff estimate
          </Text>
          <Text style={{ fontFamily: Fonts.semiBold, fontSize: 13.5, color: INK, lineHeight: 20, marginBottom: 12 }}>
            For a plan to calculate, each debt needs APR% and a minimum monthly payment greater than 0.
            If you do not know the exact values, use your best estimate.
          </Text>
          <Pressable
            onPress={() => router.push("/(tabs)/dashboard")}
            style={({ pressed }) => ([
              {
                backgroundColor: "#1A6FC4",
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 14,
                alignItems: "center",
                opacity: pressed ? 0.9 : 1,
              },
            ])}
          >
            <Text style={{ fontFamily: Fonts.extraBold, fontSize: 15, color: "#fff" }}>Go to Debts</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Empty state
  if (debts.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: C.background }]}>
        <View style={[styles.emptyWrap, { paddingTop: Platform.OS === "web" ? webTopPad + 40 : insets.top + 60 }]}>
          <View style={[styles.emptyIcon, { backgroundColor: Colors.primary + "15" }]}>
            <Ionicons name="calendar-outline" size={48} color={Colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: C.text }]}>No Plan Yet</Text>
          <Text style={[styles.emptyBody, { color: C.textSecondary }]}>
            Add your debts on the Debts tab and choose a strategy to see your month-by-month payoff plan.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? DARK : "#FAF8F5" }]}>
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <LinearGradient
          colors={["#1A0A00", "#2E1408", "#1A0A00"]}
          start={{ x: 0, y: 0 }} end={{ x: 0.6, y: 1 }}
          style={[
            styles.hero,
            { paddingTop: Platform.OS === "web" ? webTopPad + 14 : insets.top + 14 },
          ]}
        >
          {/* Title + strategy chip */}
          <View style={styles.heroTop}>
            <View style={styles.heroTitleWrap}>
              <Text style={styles.heroTitle}>
                Your <Text style={{ color: WHITE_ON_DARK }}>Payoff Plan</Text>
              </Text>
            </View>
            <Pressable
              style={styles.methodChip}
              onPress={() => router.push("/(tabs)/strategy" as any)}
            >
              <Text style={styles.methodChipText}>{stratEmoji} {stratLabel}</Text>
              <Text style={styles.methodChipArrow}>▾</Text>
            </Pressable>
          </View>

          {/* Header stats */}
          <View style={styles.heroStats}>
            <View style={styles.hstat}>
              <Text style={[styles.hstatVal, { color: WHITE_ON_DARK }]}>{fmt2(payoffDate)}</Text>
              <Text style={styles.hstatLbl}>Debt-Free</Text>
            </View>
            <View style={styles.hstat}>
              <Text style={[styles.hstatVal, { color: GREEN_LT }]}>{fmt(interestSaved)}</Text>
              <Text style={styles.hstatLbl}>Interest Saved*</Text>
            </View>
          </View>

          {/* Dex motivational strip */}
          <View style={styles.dexStrip}>
            <Animated.View style={{ transform: [{ translateY: bobAnim }] }}>
              <DexCoin size={42} mood={DEX_SCREEN_MAP.planHeader.mood} motion={DEX_SCREEN_MAP.planHeader.motion} />
            </Animated.View>
            <View style={{ flex: 1 }}>
              <Animated.Text style={[styles.dexMsg, { opacity: dexMsgOpacity }]}>
                {DEX_MSGS[dexMsgIdx]}
              </Animated.Text>
              <Text style={styles.dexSub}>Tap any month to see exactly what to pay</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── TIMELINE BAR ─────────────────────────────────────────────────── */}
        <View style={styles.timelineBar}>
          <View style={styles.tbTop}>
            <Text style={styles.tbLabel}>Journey Progress</Text>
            <Text style={styles.tbPct}>{journeyPct}% complete</Text>
          </View>
          <View style={styles.tbTrack}>
            <View style={[styles.tbFill, { width: `${Math.max(journeyPct, 2)}%` }]}>
              <View style={styles.tbDot} />
            </View>
          </View>
          <View style={styles.tbDates}>
            <Text style={styles.tbDate}>{fmt2(startDate)}</Text>
            <Text style={styles.tbDate}>Today</Text>
            <Text style={styles.tbDate}>{fmt2(payoffDate)}</Text>
          </View>
        </View>

        {/* The rest of the screen (relief, list) scrolls normally. */}
        <View style={{ padding: 14, gap: 10 }}>
          {belleDebt && bellePlanNumbers != null && (
            <View style={styles.debtSpotlightCard}>
              <Text style={styles.debtSpotlightName}>{belleDebt.name}</Text>
              <View style={styles.debtSpotlightRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Edit debt balance and details"
                  onPress={() =>
                    router.push(`/debt/${belleDebt.id}?tab=details&openEdit=1` as any)
                  }
                  style={({ pressed }) => [
                    styles.debtSpotlightHalf,
                    pressed && { opacity: 0.92 },
                  ]}
                >
                  <Text style={styles.debtSpotlightLbl}>Debt</Text>
                  <Text style={styles.debtSpotlightVal}>{fmt(bellePlanNumbers.displayBalance)}</Text>
                </Pressable>
                <View style={styles.debtSpotlightDivider} />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Edit monthly payment"
                  onPress={() =>
                    belleDebt.id === targetDebtId
                      ? router.push("/(tabs)/strategy" as any)
                      : router.push(`/debt/${belleDebt.id}?tab=details&openEdit=1` as any)
                  }
                  style={({ pressed }) => [
                    styles.debtSpotlightHalf,
                    pressed && { opacity: 0.92 },
                  ]}
                >
                  <Text style={styles.debtSpotlightLbl}>Payment</Text>
                  <Text style={[styles.debtSpotlightVal, styles.debtSpotlightPay]}>
                    {fmtFull(bellePlanNumbers.displayPayment)}/mo
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Recommendations carousel (free consultations) */}
          {!reliefDismissed && (
            <View style={[styles.reliefCard, { paddingHorizontal: 0, paddingVertical: 12 }]}>
              <Pressable
                onPress={() => setReliefDismissed(true)}
                style={styles.reliefClose}
                hitSlop={10}
              >
                <Text style={styles.reliefCloseText}>✕</Text>
              </Pressable>
              <ConsultationCarousel />
            </View>
          )}

          {/* Section label */}
          <Text style={styles.secLabel}>Monthly Breakdown - tap to expand</Text>

          {/* Month rows + milestone rows */}
          {listItems.map((item) => {
            if (item.type === "month") {
              const { snapshot, idx } = item;
              const monthNum = snapshot.month;
              const snapshotMonthStart = new Date(snapshot.date.getFullYear(), snapshot.date.getMonth(), 1);
              const status: RowStatus =
                idx === currentSnapshotIdx ? "current" :
                snapshotMonthStart < todayMonthStart ? "done" :
                "upcoming";

              return (
                <MonthRow
                  key={`month-${snapshot.month}`}
                  snapshot={snapshot}
                  monthNum={monthNum}
                  status={status}
                  expanded={expandedMonths.has(snapshot.month)}
                  onToggle={() => toggleMonth(snapshot.month)}
                  debts={eligibleDebts}
                  fmt={fmt}
                  fmtFull={fmtFull}
                  targetDebtId={targetDebtId}
                  extraPayment={extraPayment}
                  onLogPayment={async ({ debtId, amount }) => {
                    // Log payment for the current (NOW) month from the plan breakdown.
                    // We store it with today's date so it behaves like a "real" log.
                    const dateISO = new Date().toISOString();
                    const isToday =
                      dateISO.split("T")[0] === new Date().toISOString().split("T")[0];

                    await runPayment(
                      async () => {
                        await logPayment({ debtId, amount, date: dateISO, isMissed: false });

                        // Stop the payment reminder for this due-month once it is logged.
                        const due = new Date(dateISO);
                        const reminderId = `${debtId}-${due.getFullYear()}-${due.getMonth() + 1}`;
                        try {
                          await dismiss(reminderId);
                        } catch (_) {}

                        awardXp("LOG_PAYMENT");
                        recordPaymentForStreak();
                        grantBonusXp(10);

                        // Keep goal progress consistent with the Calendar logging.
                        const milestoneHit = await addGoalProgress(amount);
                        if (milestoneHit !== null) awardXp("HIT_MILESTONE");

                        return { milestoneHit: milestoneHit ?? null };
                      },
                      {
                        onBonus: () => grantBonusXp(50),
                        onFlamePulse: () => triggerFlamePulse(),
                        onDex: (isBonus) => {
                          if (isBonus) {
                            triggerDex("surprised", 450);
                            setTimeout(() => triggerDex("celebrating", 3000), 450);
                          } else {
                            triggerDex("happy");
                          }
                        },
                        onSuccessAfterSheetClosed: async (_isBonus, milestoneHit) => {
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          soundManager.play("payment_logged");
                          if (milestoneHit !== null) setTimeout(() => soundManager.play("milestone"), 200);

                          if (isToday && await shouldOfferAutoRouteToDayComplete()) {
                            await markDayCompleteAutoRoutedToday();
                            router.replace("/day-complete");
                          }
                        },
                      }
                    );
                  }}
                />
              );
            }

            // Milestone row
            const { snapshot, isFinal } = item;
            const debtNames = snapshot.paidOffDebts
              .map(id => debts.find(d => d.id === id)?.name ?? "Debt")
              .filter(Boolean);
            const icon = isFinal ? "🌟" : snapshot.paidOffDebts.length > 1 ? "🎉" : "🏆";
              const title = isFinal
                ? `Month ${snapshot.month} - DEBT FREE! ${fmt2(snapshot.date)}`
                : `Month ${snapshot.month} - ${debtNames.join(" & ")}: GONE!`;
            const sub = isFinal
              ? `${fmt(totalPaid)} paid off. Your monthly payment is now yours. Dream savings start immediately. You did it.`
              : `${debtNames.join(" & ")} wiped out. Stack that payment onto the next debt!`;

            return (
              <MilestoneRow
                key={`milestone-${snapshot.month}`}
                icon={icon}
                title={title}
                sub={sub}
                isFinal={isFinal}
              />
            );
          })}

          {/* Footnote */}
          <View style={styles.footnote}>
            <Text style={styles.footnoteText}>
              * Interest savings vs. making only minimum payments on all debts at current APRs. Assumes no new charges added.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ── Calendar Modal ─────────────────────────────────────────────── */}
      <Modal
        visible={calendarVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCalendarVisible(false)}
      >
        <View style={[styles.calModal, { backgroundColor: C.background }]}>
          <View style={[styles.calModalHeader, { borderBottomColor: C.border, paddingTop: 20 }]}>
            <Text style={[styles.calModalTitle, { color: C.text }]}>Payment Calendar</Text>
            <Pressable onPress={() => setCalendarVisible(false)} hitSlop={12}>
              <Ionicons name="close" size={24} color={C.textSecondary} />
            </Pressable>
          </View>
          <CalendarView
            debts={debts}
            payments={payments}
            C={C}
            fmt={fmt}
            onMarkPayment={async (event) => {
              const isToday = event.scheduledDate.toISOString().split("T")[0] === new Date().toISOString().split("T")[0];
              await runPayment(
                async () => {
                  await logPayment({ debtId: event.debtId, amount: event.amount, date: event.scheduledDate.toISOString(), isMissed: false });
                  // Stop the payment reminder for the specific due-month once it is logged.
                  // NotificationContext reminder ids are `${debtId}-${dueYear}-${dueMonthNumber}`.
                  const reminderId = `${event.debtId}-${event.scheduledDate.getFullYear()}-${event.scheduledDate.getMonth() + 1}`;
                  try {
                    await dismiss(reminderId);
                  } catch (_) {}
                  awardXp("LOG_PAYMENT");
                  recordPaymentForStreak();
                  // Matches `day-complete` breakdown: "+10 XP — Showed up today"
                  grantBonusXp(10);
                  cancelTonightsReminder();
                  const milestoneHit = await addGoalProgress(event.amount);
                  if (milestoneHit !== null) awardXp("HIT_MILESTONE");
                  return { milestoneHit: milestoneHit ?? null };
                },
                {
                  onBonus: () => grantBonusXp(50),
                  onFlamePulse: () => triggerFlamePulse(),
                  onDex: (isBonus) => {
                    if (isBonus) { triggerDex("surprised", 450); setTimeout(() => triggerDex("celebrating", 3000), 450); }
                    else { triggerDex("happy"); }
                  },
                  onClose: () => setCalendarVisible(false),
                  onSuccessAfterSheetClosed: async (_isBonus, milestoneHit) => {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    soundManager.play("payment_logged");
                    if (milestoneHit !== null) setTimeout(() => soundManager.play("milestone"), 200);
                    if (isToday && await shouldOfferAutoRouteToDayComplete()) {
                      await markDayCompleteAutoRoutedToday();
                      router.replace("/day-complete");
                    }
                  },
                }
              );
            }}
          />
        </View>
      </Modal>

      {/* FAB after Modal so it stays above the scroll area and reliably receives taps when the sheet is closed. */}
      {!calendarVisible && (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setCalendarVisible(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="Open payment calendar"
          style={[
            styles.calFab,
            {
              backgroundColor: Colors.buttonGreen,
              bottom: Math.max(insets.bottom, 12) + 52,
            },
          ]}
        >
          <Ionicons name="calendar" size={20} color="#fff" />
          <Text style={styles.calFabText}>Calendar</Text>
        </Pressable>
      )}

      <PaymentEffectsOverlay
        xpFloatActive={xpFloatActive} xpAmount={xpAmount} xpY={xpY}
        xpOpacity={xpOpacity} xpScale={xpScale} bonusActive={bonusActive}
      />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },

  // Hero
  hero: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    position: "relative",
    overflow: "hidden",
  },
  heroTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 10 },
  heroTitleWrap: { flex: 1, minWidth: 0, paddingRight: 4 },
  heroTitle: { fontSize: 30, fontFamily: Fonts.black, fontWeight: "900", color: "#FFFFFF", lineHeight: 36 },
  methodChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    flexShrink: 0,
    backgroundColor: "rgba(255,255,255,0.16)", borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.28)", borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  methodChipText: { fontSize: 16, fontFamily: Fonts.extraBold, fontWeight: "800", color: "#FFFFFF" },
  methodChipArrow: { fontSize: 14, color: "#FFFFFF" },

  heroStats: { flexDirection: "row", gap: 8, marginBottom: 14 },
  hstat: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.22)", borderRadius: 12,
    paddingVertical: 16, paddingHorizontal: 8, alignItems: "center",
  },
  hstatVal: { fontSize: 20, fontFamily: Fonts.black, fontWeight: "900", color: "#FFFFFF", lineHeight: 24 },
  hstatLbl: { fontSize: 13, fontFamily: Fonts.semiBold, fontWeight: "700", color: "#FFFFFF", textTransform: "uppercase", letterSpacing: 0.8, marginTop: 4 },

  dexStrip: {
    backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.24)", borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 14,
    flexDirection: "row", alignItems: "center", gap: 10,
  },
  dexMsg: { fontSize: 16, fontFamily: Fonts.extraBold, fontWeight: "800", color: "#FFFFFF", lineHeight: 22 },
  dexSub: { fontSize: 14, fontFamily: Fonts.semiBold, fontWeight: "600", color: "#FFFFFF", marginTop: 3 },

  // Timeline
  timelineBar: { backgroundColor: DARK, paddingHorizontal: 18, paddingTop: 12, paddingBottom: 14 },
  tbTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  tbLabel: { fontSize: 13, fontFamily: Fonts.extraBold, fontWeight: "800", color: "#FFFFFF" },
  tbPct: { fontSize: 13, fontFamily: Fonts.black, fontWeight: "900", color: "#FFFFFF" },
  tbTrack: { height: 12, backgroundColor: "rgba(255,255,255,0.16)", borderRadius: 6, marginBottom: 8, position: "relative" },
  tbFill: {
    height: "100%", borderRadius: 6,
    backgroundColor: GREEN_LT,
    position: "relative", alignItems: "flex-end", justifyContent: "center",
  },
  tbDot: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: GREEN_LT, position: "absolute", right: -6, top: -3,
    borderWidth: 3, borderColor: DARK,
    shadowColor: GREEN_LT, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 6, elevation: 4,
  },
  tbDates: { flexDirection: "row", justifyContent: "space-between" },
  tbDate: { fontSize: 11, fontFamily: Fonts.semiBold, fontWeight: "700", color: "#FFFFFF" },

  // Scroll
  scrollArea: { flex: 1 },
  scrollContent: { padding: 14, paddingBottom: 120, gap: 10 },

  debtSpotlightCard: {
    backgroundColor: "#fff", borderWidth: 2, borderColor: BORDER,
    borderRadius: 18, padding: 16, gap: 12,
  },
  debtSpotlightName: { fontSize: 17, fontFamily: Fonts.extraBold, fontWeight: "800", color: INK },
  debtSpotlightRow: { flexDirection: "row", alignItems: "stretch" },
  debtSpotlightHalf: { flex: 1, paddingVertical: 10, paddingHorizontal: 8, gap: 4 },
  debtSpotlightDivider: { width: StyleSheet.hairlineWidth * 2, backgroundColor: BORDER, marginVertical: 4 },
  debtSpotlightLbl: { fontSize: 12, fontFamily: Fonts.semiBold, fontWeight: "700", color: INK, opacity: 0.55, textTransform: "uppercase", letterSpacing: 0.6 },
  debtSpotlightVal: { fontSize: 20, fontFamily: Fonts.black, fontWeight: "900", color: INK },
  debtSpotlightPay: { color: MID },

  // Relief card
  reliefCard: {
    backgroundColor: "#fff", borderWidth: 2, borderColor: BORDER,
    borderRadius: 16, padding: 18, position: "relative",
  },
  reliefClose: { position: "absolute", top: 12, right: 14, zIndex: 1 },
  reliefCloseText: { fontSize: 18, color: "#C0B0A0" },
  reliefInner: { flexDirection: "row", alignItems: "center", gap: 14, paddingRight: 18 },
  reliefIconWrap: {
    width: 54, height: 54, backgroundColor: "#FAFAF8", borderRadius: 14,
    borderWidth: 1, borderColor: "#E4DFD6",
    alignItems: "center", justifyContent: "center",
  },
  reliefTitle: { fontSize: 17, fontFamily: Fonts.extraBold, fontWeight: "900", color: INK, marginBottom: 4 },
  reliefDesc: { fontSize: 14, fontFamily: Fonts.semiBold, fontWeight: "600", color: INK, opacity: 0.92, lineHeight: 20 },
  reliefCTA: {
    marginTop: 14, backgroundColor: "#F5F4F1", borderWidth: 1.5, borderColor: "#E4DFD6",
    borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  reliefCTAText: { fontSize: 16, fontFamily: Fonts.extraBold, fontWeight: "800", color: INK },
  reliefDisclosure: { fontSize: 12, fontFamily: Fonts.semiBold, fontWeight: "600", color: INK, opacity: 0.88, marginTop: 8, lineHeight: 16 },

  // Section label — neutral black on cream (avoid brown #1A0A00)
  secLabel: { fontSize: 12, fontFamily: Fonts.extraBold, fontWeight: "800", color: INK, textTransform: "uppercase", letterSpacing: 1.5 },

  // Month rows
  monthRow: {
    backgroundColor: "#fff", borderWidth: 2, borderColor: BORDER,
    borderRadius: 18, padding: 20, overflow: "hidden",
  },
  /** White card + gold ring — butter-cream #FFFBEB made copy look “brown on beige”. */
  monthRowCurrent: { borderColor: GOLD, borderWidth: 3, backgroundColor: "#FFFFFF" },
  /** Don’t apply opacity to the whole row — it washes text into low-contrast brown/grey on cream. */
  monthRowDone: { backgroundColor: "#F4F2EF", borderColor: "#D8D4CC" },

  mrTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  mrLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "nowrap" },
  mrNum: {
    width: 40, height: 40, borderRadius: 20, flexShrink: 0,
    backgroundColor: "#FAFAF8", borderWidth: 2, borderColor: "#E4DFD6",
    alignItems: "center", justifyContent: "center",
  },
  mrNumDone: { backgroundColor: "#F2F0EC", borderColor: "#D5D0C6" },
  mrNumCurrent: { backgroundColor: "#FFF9ED", borderColor: "#E2B020" },
  mrNumText: { fontSize: 15, fontFamily: Fonts.black, fontWeight: "900", color: INK },
  mrMonth: { fontSize: 18, fontFamily: Fonts.extraBold, fontWeight: "800", color: INK, flexShrink: 1 },
  mrMonthDone: { textDecorationLine: "line-through", color: "#8A9A80" },

  tagNow: {
    backgroundColor: "#FFFBF3",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#EDE5D8",
  },
  tagNowText: { fontSize: 12, fontFamily: Fonts.black, fontWeight: "900", color: INK },
  tagDone: { backgroundColor: "#F0F0F0", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  tagDoneText: { fontSize: 12, fontFamily: Fonts.bold, fontWeight: "700", color: "#707070" },

  mrRight: { alignItems: "flex-end", flexShrink: 0 },
  mrBalance: { fontSize: 18, fontFamily: Fonts.black, fontWeight: "900", color: INK },
  mrInterest: { fontSize: 13, fontFamily: Fonts.semiBold, fontWeight: "700", color: INK, opacity: 0.92, marginTop: 3 },

  mrDetail: { marginTop: 14, paddingTop: 14, borderTopWidth: 1.5, borderTopColor: BORDER, gap: 2 },
  mrDebtRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F0EAE0",
  },
  mdrName: { fontSize: 16, fontFamily: Fonts.extraBold, fontWeight: "800", color: INK },
  mdrType: { fontSize: 13, fontFamily: Fonts.semiBold, fontWeight: "600", color: INK, opacity: 0.85 },
  mdrPay: { fontSize: 17, fontFamily: Fonts.black, fontWeight: "900", color: BLUE },
  mdrPayExtra: { color: "#3A9A20" },

  // Log button (plan month breakdown) — solid fill for WCAG-friendly contrast on light cards
  logBtn: {
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.amber,
    borderWidth: 1,
    borderColor: Colors.amberDark,
  },
  logBtnText: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },

  // Milestone
  milestoneRow: { borderRadius: 18, paddingHorizontal: 18, paddingVertical: 20, flexDirection: "row", alignItems: "center", gap: 14 },
  milIcon: { fontSize: 32 },
  milTitle: { fontSize: 17, fontFamily: Fonts.black, fontWeight: "900", color: ACCENT_TEXT },
  milSub: { fontSize: 14, fontFamily: Fonts.semiBold, fontWeight: "700", color: "#FFFFFF", marginTop: 3, lineHeight: 20 },

  // Footnote
  footnote: {
    backgroundColor: "#EFF6FF", borderWidth: 1.5,
    borderColor: "rgba(26,111,196,0.2)", borderRadius: 12,
    padding: 12,
  },
  footnoteText: { fontSize: 13, fontFamily: Fonts.semiBold, fontWeight: "700", color: INK, opacity: 0.92, lineHeight: 19, textAlign: "center" },

  // Calendar FAB (bottom offset set inline with safe area so it clears the tab bar)
  calFab: {
    position: "absolute", right: 16,
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 24, shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 12,
    zIndex: 100,
  },
  calFabText: { color: "#FFFFFF", fontFamily: Fonts.bold, fontWeight: "700", fontSize: 14 },

  // Calendar Modal
  calModal: { flex: 1 },
  calModalHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  calModalTitle: { fontSize: 20, fontFamily: Fonts.bold, fontWeight: "700" },

  // Empty state
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 16 },
  emptyIcon: { width: 96, height: 96, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 24, fontFamily: Fonts.extraBold, fontWeight: "800", textAlign: "center" },
  emptyBody: { fontSize: 15, lineHeight: 22, textAlign: "center" },
});

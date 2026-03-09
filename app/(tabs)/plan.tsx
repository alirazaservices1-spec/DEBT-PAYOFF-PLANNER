import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  Pressable,
  useColorScheme,
  Platform,
  Modal,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useDebts } from "@/context/DebtContext";
import { useCurrency } from "@/context/CurrencyContext";
import {
  monthsToText,
  MonthlySnapshot,
  Debt,
} from "@/lib/calculations";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const FULL_MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const DEBT_COLORS = [
  "#3498DB","#9B59B6","#E67E22","#E74C3C","#1ABC9C",
  "#F39C12","#2ECC71","#E91E63","#00BCD4","#FF5722",
];

function formatMonth(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

function AmortizationRow({
  snapshot,
  debts,
  expanded,
  onToggle,
  C,
  fmt,
  fmtFull,
}: {
  snapshot: MonthlySnapshot;
  debts: Debt[];
  expanded: boolean;
  onToggle: () => void;
  C: typeof Colors.light;
  fmt: (n: number) => string;
  fmtFull: (n: number) => string;
}) {
  const isFirst = snapshot.month === 1;
  const hasPaidOff = snapshot.paidOffDebts.length > 0;

  return (
    <View>
      <Pressable
        onPress={onToggle}
        style={[
          styles.monthRow,
          {
            backgroundColor: hasPaidOff ? Colors.progressGreen + "15" : C.surface,
            borderColor: hasPaidOff ? Colors.progressGreen + "40" : C.border,
          },
        ]}
      >
        <View style={styles.monthLeft}>
          <Text style={[styles.monthNum, { color: C.textSecondary }]}>Mo {snapshot.month}</Text>
          <Text style={[styles.monthDate, { color: C.text }]}>{formatMonth(snapshot.date)}</Text>
          {hasPaidOff && (
            <View style={styles.paidOffBadge}>
              <Ionicons name="checkmark-circle" size={12} color={Colors.progressGreen} />
              <Text style={[styles.paidOffText, { color: Colors.progressGreen }]}>
                Paid off{" "}
                {snapshot.paidOffDebts
                  .map((id) => debts.find((d) => d.id === id)?.name)
                  .filter(Boolean)
                  .join(", ")}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.monthRight}>
          <Text style={[styles.monthBalance, { color: C.text }]}>{fmt(snapshot.totalBalance)}</Text>
          <Text style={[styles.monthInterest, { color: Colors.danger }]}>
            {fmt(snapshot.totalInterestPaid)} Total Interest Paid to Date
          </Text>
        </View>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={16} color={C.textSecondary} />
      </Pressable>

      {expanded && (
        <View style={[styles.breakdown, { backgroundColor: C.surfaceSecondary, borderColor: C.border }]}>
          {snapshot.debtBreakdown.map((b) => {
            const debt = debts.find((d) => d.id === b.debtId);
            if (!debt) return null;
            const isPaidOff = b.balance <= 0;
            return (
              <View key={b.debtId} style={[styles.breakdownRow, { borderBottomColor: C.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.breakdownName, { color: isPaidOff ? Colors.progressGreen : C.text }]}>
                    {debt.name}{isPaidOff ? " ✓" : ""}
                  </Text>
                  <View style={styles.breakdownStats}>
                    <Text style={[styles.breakdownStat, { color: C.textSecondary }]}>Interest: {fmtFull(b.interest)}</Text>
                    <Text style={[styles.breakdownStat, { color: C.textSecondary }]}>Principal: {fmtFull(b.principal)}</Text>
                  </View>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={[styles.breakdownPayment, { color: C.text }]}>{fmtFull(b.payment)}</Text>
                  <Text style={[styles.breakdownBalance, { color: isPaidOff ? Colors.progressGreen : C.textSecondary }]}>
                    {isPaidOff ? `Paid off ${debt.name}` : fmt(b.balance)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

interface CalendarDebtEvent {
  debtId: string;
  debtName: string;
  amount: number;
  color: string;
  status: "paid" | "upcoming" | "overdue";
  scheduledDate: Date;
}

function CalendarView({
  debts,
  payments,
  C,
  fmt,
  onMarkPayment,
}: {
  debts: Debt[];
  payments: { debtId: string; amount: number; date: string; isMissed: boolean }[];
  C: typeof Colors.light;
  fmt: (n: number) => string;
  onMarkPayment: (event: CalendarDebtEvent) => Promise<void>;
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
      const key = `${p.debtId}-${d.getFullYear()}-${d.getMonth()}`;
      paidByKey.add(key);
    });

    debts.forEach((d) => {
      const day = d.dueDate;
      if (!day || day < 1 || day > 31) return;
      const dueDate = new Date(viewYear, viewMonth, day);
      if (dueDate.getMonth() !== viewMonth) return;
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const isPast = dueDate < now;
      const key = `${d.id}-${dueDate.getFullYear()}-${dueDate.getMonth()}`;
      const hasPaid = paidByKey.has(key);
      const status: CalendarDebtEvent["status"] = hasPaid ? "paid" : isPast ? "overdue" : "upcoming";
      if (!map[day]) map[day] = [];
      map[day].push({
        debtId: d.id,
        debtName: d.name,
        amount: d.minimumPayment,
        color: debtColorMap[d.id],
        status,
        scheduledDate: dueDate,
      });
    });
    return map;
  }, [debts, payments, viewYear, viewMonth, debtColorMap]);

  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const isToday = (day: number) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  const statusColor = (status: CalendarDebtEvent["status"]) =>
    status === "paid" ? Colors.progressGreen : status === "overdue" ? Colors.danger : Colors.accent;

  return (
    <View style={{ flex: 1 }}>
      <View style={[calStyles.navRow, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <Pressable onPress={prevMonth} hitSlop={12} style={calStyles.navBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.primary} />
        </Pressable>
        <Text style={[calStyles.monthTitle, { color: C.text }]}>
          {FULL_MONTH_NAMES[viewMonth]} {viewYear}
        </Text>
        <Pressable onPress={nextMonth} hitSlop={12} style={calStyles.navBtn}>
          <Ionicons name="chevron-forward" size={22} color={Colors.primary} />
        </Pressable>
      </View>

      <View style={[calStyles.dayHeaders, { backgroundColor: C.surfaceSecondary }]}>
        {DAY_NAMES.map((d) => (
          <View key={d} style={calStyles.dayHeaderCell}>
            <Text style={[calStyles.dayHeaderText, { color: C.textSecondary }]}>{d}</Text>
          </View>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 8, gap: 4 }}>
        {Array.from({ length: cells.length / 7 }, (_, row) => (
          <View key={row} style={calStyles.week}>
            {cells.slice(row * 7, row * 7 + 7).map((day, col) => {
              const events = day ? (eventsByDay[day] ?? []) : [];
              const todayCell = day ? isToday(day) : false;
              return (
                <Pressable
                  key={col}
                  onPress={() => day && events.length > 0 ? setSelected({ day, events }) : null}
                  style={[
                    calStyles.dayCell,
                    { backgroundColor: todayCell ? Colors.primary + "15" : "transparent" },
                    todayCell && { borderRadius: 8, borderWidth: 1, borderColor: Colors.primary + "40" },
                  ]}
                >
                  {day ? (
                    <>
                      <Text style={[
                        calStyles.dayNum,
                        { color: todayCell ? Colors.primary : C.text },
                        todayCell && { fontWeight: "700" },
                      ]}>
                        {day}
                      </Text>
                      <View style={calStyles.chips}>
                        {events.slice(0, 2).map((e) => (
                          <View key={e.debtId} style={[calStyles.chip, { backgroundColor: statusColor(e.status) }]}>
                            <Text style={calStyles.chipText} numberOfLines={1}>{e.debtName.slice(0, 8)}</Text>
                          </View>
                        ))}
                        {events.length > 2 && (
                          <Text style={[calStyles.moreText, { color: C.textSecondary }]}>+{events.length - 2}</Text>
                        )}
                      </View>
                    </>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ))}

      <View style={[calStyles.legend, { backgroundColor: C.surface, borderColor: C.border }]}>
            {[
              { color: Colors.progressGreen, label: "Paid" },
              { color: Colors.accent, label: "Upcoming" },
              { color: Colors.danger, label: "Overdue" },
            ].map(({ color, label }) => (
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
            <Text style={[calStyles.popupTitle, { color: C.text }]}>
              {selected ? `${FULL_MONTH_NAMES[viewMonth]} ${selected.day}` : ""}
            </Text>
            {selected?.events.map((e) => (
              <View key={e.debtId} style={[calStyles.popupRow, { borderColor: C.border }]}>
                <View style={[calStyles.popupDot, { backgroundColor: statusColor(e.status) }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[calStyles.popupName, { color: C.text }]}>{e.debtName}</Text>
                  <Text style={[calStyles.popupStatus, { color: statusColor(e.status) }]}>
                    {e.status.charAt(0).toUpperCase() + e.status.slice(1)}
                  </Text>
                  <Text style={[calStyles.popupStatus, { color: C.textSecondary }]}>
                    Due {e.scheduledDate.toLocaleDateString()}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 6 }}>
                  <Text style={[calStyles.popupAmount, { color: C.text }]}>{fmt(e.amount)}</Text>
                  {e.status !== "paid" && (
                    <Pressable
                      onPress={async () => {
                        await onMarkPayment(e);
                        setSelected(null);
                      }}
                      style={calStyles.markPaidBtn}
                    >
                      <Text style={calStyles.markPaidBtnText}>Mark as Paid</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            ))}
            <Pressable onPress={() => setSelected(null)} style={[calStyles.popupClose, { backgroundColor: Colors.primary }]}>
              <Text style={calStyles.popupCloseText}>Close</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const calStyles = StyleSheet.create({
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  monthTitle: { fontSize: 17, fontWeight: "700" },
  dayHeaders: { flexDirection: "row", paddingHorizontal: 8, paddingVertical: 6 },
  dayHeaderCell: { flex: 1, alignItems: "center" },
  dayHeaderText: { fontSize: 12, fontWeight: "600" },
  week: { flexDirection: "row" },
  dayCell: { flex: 1, minHeight: 58, padding: 3 },
  dayNum: { fontSize: 13 },
  chips: { gap: 2, marginTop: 2 },
  chip: { borderRadius: 4, paddingHorizontal: 3, paddingVertical: 1 },
  chipText: { fontSize: 9, fontWeight: "700", color: "#fff" },
  moreText: { fontSize: 9 },
  legend: { flexDirection: "row", gap: 16, justifyContent: "center", padding: 12, borderRadius: 10, borderWidth: 1, margin: 8 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 13 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 24 },
  popup: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 12,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  popupTitle: { fontSize: 18, fontWeight: "700" },
  popupRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  popupDot: { width: 12, height: 12, borderRadius: 6 },
  popupName: { fontSize: 15, fontWeight: "600" },
  popupStatus: { fontSize: 13, fontWeight: "500", marginTop: 1 },
  popupAmount: { fontSize: 17, fontWeight: "800" },
  markPaidBtn: {
    marginTop: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.progressGreen + "15",
  },
  markPaidBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.progressGreen,
  },
  popupClose: { borderRadius: 10, paddingVertical: 12, alignItems: "center", marginTop: 4 },
  popupCloseText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});

export default function PlanScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { activeResult, debts, selectedStrategy, payments, logPayment } = useDebts();
  const { fmt, fmtFull } = useCurrency();

  const [expandedMonths, setExpandedMonths] = useState<Set<number>>(new Set([1]));
  const [calendarVisible, setCalendarVisible] = useState(false);

  const toggleMonth = (month: number) => {
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(month)) next.delete(month);
      else next.add(month);
      return next;
    });
  };

  const webTopPad = Platform.OS === "web" ? 67 : 0;
  const { snapshots, totalInterestPaid, totalMonths, totalPaid } = activeResult;
  const stratLabel = selectedStrategy === "avalanche" ? "Avalanche" : selectedStrategy === "snowball" ? "Snowball" : "Custom";

  if (debts.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: C.background }]}>
        <View style={[styles.header, { paddingTop: Platform.OS === "web" ? webTopPad : insets.top + 8, backgroundColor: C.background, borderBottomColor: C.border }]}>
          <Text style={[styles.headerTitle, { color: C.text }]}>Payoff Plan</Text>
        </View>
        <View style={styles.emptyWrap}>
          <View style={[styles.emptyIcon, { backgroundColor: Colors.primary + "15" }]}>
            <Ionicons name="calendar-outline" size={48} color={Colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: C.text }]}>No Plan Yet</Text>
          <Text style={[styles.emptyBody, { color: C.textSecondary }]}>
            Add your debts and choose a strategy to see your month-by-month payoff plan.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? webTopPad : insets.top + 8, backgroundColor: C.background, borderBottomColor: C.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: C.text }]}>Payoff Plan</Text>
          <Text style={[styles.headerSub, { color: C.textSecondary }]}>
            {stratLabel} • {monthsToText(totalMonths)}
          </Text>
        </View>
      </View>

      <View style={[styles.summaryRow, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <View style={styles.summaryStat}>
          <Text style={[styles.summaryLabel, { color: C.textSecondary }]}>Total Paid</Text>
          <Text style={[styles.summaryValue, { color: C.text }]}>{fmt(totalPaid)}</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: C.border }]} />
        <View style={styles.summaryStat}>
          <Text style={[styles.summaryLabel, { color: C.textSecondary }]}>Total Interest Paid to Date</Text>
          <Text style={[styles.summaryValue, { color: Colors.danger }]}>{fmt(totalInterestPaid)}</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: C.border }]} />
        <View style={styles.summaryStat}>
          <Text style={[styles.summaryLabel, { color: C.textSecondary }]}>Months</Text>
          <Text style={[styles.summaryValue, { color: Colors.primary }]}>{totalMonths}</Text>
        </View>
      </View>

      <View style={[styles.colHeader, { backgroundColor: C.surfaceSecondary, borderBottomColor: C.border }]}>
        <Text style={[styles.colHeaderText, { color: C.textSecondary }]}>Month</Text>
        <Text style={[styles.colHeaderText, { color: C.textSecondary }]}>Balance / Cumulative Interest</Text>
        <View style={{ width: 20 }} />
      </View>

      <SectionList
        sections={[{ data: snapshots }]}
        keyExtractor={(item) => item.month.toString()}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[styles.listContent, Platform.OS === "web" && { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        renderItem={({ item }) => (
          <AmortizationRow
            snapshot={item}
            debts={debts}
            expanded={expandedMonths.has(item.month)}
            onToggle={() => toggleMonth(item.month)}
            C={C}
            fmt={fmt}
            fmtFull={fmtFull}
          />
        )}
        renderSectionHeader={() => null}
      />

      <Pressable
        onPress={() => setCalendarVisible(true)}
        style={[styles.calFab, { backgroundColor: Colors.primary }]}
      >
        <Ionicons name="calendar" size={22} color="#fff" />
        <Text style={styles.calFabText}>Calendar</Text>
      </Pressable>

      <Modal
        visible={calendarVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCalendarVisible(false)}
      >
        <View style={[styles.calModal, { backgroundColor: C.background }]}>
          <View style={[styles.calModalHeader, { borderBottomColor: C.border, paddingTop: insets.top + 16 }]}>
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
              await logPayment({
                debtId: event.debtId,
                amount: event.amount,
                date: event.scheduledDate.toISOString(),
                isMissed: false,
              });
            }}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 28, fontWeight: "700", letterSpacing: -0.5 },
  headerSub: { fontSize: 16, marginTop: 2 },
  calFab: {
    position: "absolute",
    bottom: 100,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  calFabText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  calModal: { flex: 1 },
  calModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  calModalTitle: { fontSize: 20, fontWeight: "700" },
  summaryRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  summaryStat: { flex: 1, alignItems: "center" },
  summaryLabel: { fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5 },
  summaryValue: { fontSize: 17, fontWeight: "700", marginTop: 3 },
  summaryDivider: { width: StyleSheet.hairlineWidth },
  colHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  colHeaderText: { fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  listContent: { gap: 2, padding: 8, paddingTop: 4 },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  monthLeft: { flex: 1, gap: 2 },
  monthNum: { fontSize: 13, textTransform: "uppercase", letterSpacing: 0.4 },
  monthDate: { fontSize: 15, fontWeight: "600" },
  paidOffBadge: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 },
  paidOffText: { fontSize: 13, fontWeight: "600" },
  monthRight: { alignItems: "flex-end" },
  monthBalance: { fontSize: 15, fontWeight: "700" },
  monthInterest: { fontSize: 13, marginTop: 1 },
  breakdown: {
    marginTop: 2,
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 2,
  },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  breakdownName: { fontSize: 14, fontWeight: "600" },
  breakdownStats: { flexDirection: "row", gap: 8, marginTop: 2 },
  breakdownStat: { fontSize: 13 },
  breakdownPayment: { fontSize: 14, fontWeight: "700" },
  breakdownBalance: { fontSize: 13, marginTop: 2 },
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 14 },
  emptyIcon: { width: 96, height: 96, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 22, fontWeight: "700" },
  emptyBody: { fontSize: 15, textAlign: "center", lineHeight: 22 },
});

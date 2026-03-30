import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useGame } from "@/context/GameContext";
import { useDebts } from "@/context/DebtContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useNotifications } from "@/context/NotificationContext";
import { debtTypeIcon, debtTypeLabel } from "@/lib/calculations";
import {
  shouldOfferAutoRouteToDayComplete,
  markDayCompleteAutoRoutedToday,
} from "@/lib/dayCompleteGate";
import { Fonts } from "@/constants/fonts";
import Colors from "@/constants/colors";
import { DexCoin } from "@/components/DexCoin";
import { DEX_SCREEN_MAP } from "@/constants/dexScreenMap";

const DARK = "#1A0A00";
const DARK2 = "#2A1400";
const GOLD = "#F5C030";
const GOLD_DK = "#D4900A";
const BLUE = "#1A6FC4";
const GREEN = "#8BC34A";
const GREEN_DK = "#3A9A20";
const RED_LT = "#FF8A80";
const BORDER = "#E0D8CE";
const SAFE_TEXT_MUTED = Colors.WarmContrast.textMuted;
const SAFE_TEXT_ON_YELLOW_BOLD = Colors.WarmContrast.textOnYellowBold;
const MUTED = SAFE_TEXT_MUTED;
const BG = "#FAF8F5";

function calDays(from: string): number {
  const fromStr = new Date(from).toISOString().split("T")[0];
  const toStr = new Date().toISOString().split("T")[0];
  const msA = new Date(fromStr).getTime();
  const msB = new Date(toStr).getTime();
  return Math.round((msB - msA) / (1000 * 60 * 60 * 24));
}

function fmtMonthYear(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function fmtDayMonth(day: number): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), day);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function WelcomeBackScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    prevLastOpenedAt,
    prevStreakCount,
    streakCount,
    recordPaymentForStreak,
    awardXp,
  } = useGame();
  const { debts, payments, logPayment, activeResult } = useDebts();
  const { fmt } = useCurrency();
  const { dismiss } = useNotifications();

  const daysAway = prevLastOpenedAt ? calDays(prevLastOpenedAt) : 3;
  const oldStreak = prevStreakCount;

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const [loggedIds, setLoggedIds] = useState<Set<string>>(new Set());
  const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set());
  const [streakRestarted, setStreakRestarted] = useState(false);
  const [dexMsgIdx, setDexMsgIdx] = useState(0);

  const DEX_MSGS = [
    "Life happens. No judgment. Your plan is still here and waiting. Let's pick up right where you left off. 💪",
    "I kept your plan safe while you were gone! 😄",
    "Every champion takes a break. Champions also come back! 💪",
    "Your future self is SO glad you came back today. 🌟",
    daysAway <= 3
      ? `Only ${daysAway} days! Your streak is still warm. Let's fire it back up! 🔥`
      : `${daysAway} days, but your debt-free date hasn't changed. Let's get back on track! 🎯`,
  ];

  const heroSub =
    daysAway <= 3
      ? "Just a couple days away - your streak is still warm! Let's get it back right now."
      : daysAway <= 7
      ? "A week away - totally understandable. Your plan survived. Let's review what you missed."
      : "Life got busy - we get it. Your plan is still solid and your debt-free date hasn't changed. Let's catch you up.";

  const yOffset = useSharedValue(0);
  useEffect(() => {
    yOffset.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, []);

  const dexAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: yOffset.value }],
  }));

  const getDaysUntilDue = (debt: (typeof debts)[0]): number => {
    if (!debt.dueDate) return 0;
    const due = new Date(currentYear, currentMonth, debt.dueDate);
    return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const pendingDebts = debts.filter((debt) => {
    if (debt.debtType === "taxDebt" && !debt.taxPaymentPlan) return false;
    if (debt.minimumPayment <= 0) return false;
    if (loggedIds.has(debt.id)) return false;
    const hasPaymentThisMonth = payments.some((p) => {
      if (p.debtId !== debt.id || p.isMissed) return false;
      const pDate = new Date(p.date);
      return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
    });
    if (hasPaymentThisMonth) return false;
    if (!debt.dueDate) return true;
    return getDaysUntilDue(debt) <= 7;
  });

  const interestAccrued = debts.reduce((sum, d) => {
    const dailyRate = d.apr / 100 / 365;
    return sum + d.balance * dailyRate * daysAway;
  }, 0);

  const daysToNextPayment = debts.reduce((min, d) => {
    if (!d.dueDate) return min;
    const diff = getDaysUntilDue(d);
    if (diff >= 0 && diff < min) return diff;
    return min;
  }, 999);

  const payoffDate: Date | null =
    (activeResult as any)?.payoffDate ?? (activeResult as any)?.finalDate ?? null;

  const handleLogPayment = async (debtId: string, amount: number, debtName: string) => {
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      await logPayment({
        debtId,
        amount,
        date: todayStr,
        isMissed: false,
        note: "Logged from welcome-back screen",
      });

      // Stop the matching due-month reminder once the user logs payment.
      // Bell reminders are keyed by the due-month: `${debtId}-${dueYear}-${dueMonthNumber}`.
      const paymentDate = new Date();
      const dueDay = debts.find((d) => d.id === debtId)?.dueDate ?? 1;
      let dueDateForReminder = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), dueDay);
      if (dueDateForReminder < paymentDate) {
        dueDateForReminder = new Date(paymentDate.getFullYear(), paymentDate.getMonth() + 1, dueDay);
      }
      const reminderId = `${debtId}-${dueDateForReminder.getFullYear()}-${dueDateForReminder.getMonth() + 1}`;
      try {
        await dismiss(reminderId);
      } catch (_) {}

      awardXp("LOG_PAYMENT");
      setLoggedIds((prev) => new Set([...prev, debtId]));
      setCheckedTasks((prev) => new Set([...prev, "log-payment"]));
      setDexMsgIdx(1);
      // Option 1: only payment logging triggers the Day Complete flow.
      if (await shouldOfferAutoRouteToDayComplete()) {
        await markDayCompleteAutoRoutedToday();
        router.replace("/day-complete");
      }
    } catch {
      Alert.alert("Error", "Could not log payment. Please try again.");
    }
  };

  const handleTask = (taskId: string) => {
    if (checkedTasks.has(taskId)) return;
    setCheckedTasks((prev) => new Set([...prev, taskId]));
    setDexMsgIdx((i) => Math.min(i + 1, DEX_MSGS.length - 1));
  };

  const handleRestart = () => {
    if (!streakRestarted) {
      recordPaymentForStreak();
      setStreakRestarted(true);
    }
    router.replace("/(tabs)/dashboard");
  };

  const getUrgency = (
    daysUntilDue: number
  ): { label: string; kind: "overdue" | "soon" | "today" } => {
    if (daysUntilDue < 0)
      return { label: `Overdue - ${Math.abs(daysUntilDue)} days`, kind: "overdue" };
    if (daysUntilDue === 0) return { label: "Due Today!", kind: "today" };
    return { label: `Due in ${daysUntilDue} days`, kind: "soon" };
  };

  const TASKS = [
    { id: "no-debt", icon: "🚫", name: "No new debt today", desc: "Confirm no new charges on enrolled cards.", xp: 25 },
    { id: "review-plan", icon: "📊", name: "Review your debt plan", desc: "Check your balances and payoff progress.", xp: 25 },
    { id: "log-payment", icon: "📅", name: "Log a pending payment", desc: "Log any payment above to clear overdue status.", xp: 50 },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} bounces>

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <LinearGradient
          colors={[DARK, "#2A1400", DARK]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroGlow} />

          <View style={styles.awayChip}>
            <Text style={styles.awayChipText}>Away for </Text>
            <Text style={[styles.awayChipText, { color: GOLD }]}>{daysAway} days</Text>
          </View>

          <Text style={styles.heroTitle}>
            Welcome back,{"\n"}
            <Text style={{ color: GOLD }}>Eric! 👋</Text>
          </Text>
          <Text style={styles.heroSub}>{heroSub}</Text>

          <View style={styles.dexCenter}>
            <Pressable onPress={() => setDexMsgIdx((i) => (i + 1) % DEX_MSGS.length)}>
              <Animated.View style={dexAnimStyle}>
                <DexCoin size={90} mood={DEX_SCREEN_MAP.welcomeBack.mood} motion={DEX_SCREEN_MAP.welcomeBack.motion} />
              </Animated.View>
            </Pressable>
          </View>

          <View style={styles.dexBubble}>
            <Text style={styles.dexBubbleText}>{DEX_MSGS[dexMsgIdx]}</Text>
            <View style={styles.dexBubbleTip} />
          </View>

          {oldStreak > 0 && (
            <View style={styles.streakRow}>
              <View style={styles.streakSide}>
                <Text style={[styles.streakVal, { color: "rgba(255,255,255,0.3)" }]}>
                  🔥 {oldStreak}
                </Text>
                <Text style={styles.streakLbl}>Old streak</Text>
              </View>
              <Text style={styles.streakArrow}>→</Text>
              <View style={styles.streakSide}>
                <Text style={[styles.streakVal, { color: GOLD }]}>🌱 Start fresh</Text>
                <Text style={styles.streakLbl}>Build a new one today</Text>
              </View>
            </View>
          )}
        </LinearGradient>

        {/* ── SCROLL CONTENT ───────────────────────────────────────── */}
        <View style={styles.scrollContent}>

          {/* CATCH-UP SUMMARY */}
          <Text style={styles.secLabel}>What happened while you were away</Text>
          <View style={styles.catchupCard}>
            <Text style={styles.catchupTitle}>{daysAway}-Day Catch-Up 📋</Text>

            <View style={styles.ccRow}>
              <Text style={styles.ccLabel}>Your plan</Text>
              <Text style={[styles.ccVal, { color: GREEN }]}>Still on track ✓</Text>
            </View>

            {payoffDate && (
              <View style={styles.ccRow}>
                <Text style={styles.ccLabel}>Debt-free date</Text>
                <Text style={styles.ccVal}>{fmtMonthYear(payoffDate)} - unchanged</Text>
              </View>
            )}

            <View style={styles.ccRow}>
              <Text style={styles.ccLabel}>Payments needing attention</Text>
              <Text style={[styles.ccVal, { color: pendingDebts.length > 0 ? RED_LT : GREEN }]}>
                {pendingDebts.length > 0 ? `${pendingDebts.length} need attention` : "All clear ✓"}
              </Text>
            </View>

            {interestAccrued > 0 && (
              <View style={styles.ccRow}>
                <Text style={styles.ccLabel}>Interest accrued (est.)</Text>
                <Text style={[styles.ccVal, { color: GOLD }]}>
                  ~{fmt(interestAccrued)} while away
                </Text>
              </View>
            )}

            {daysToNextPayment < 999 && (
              <View style={[styles.ccRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                <Text style={styles.ccLabel}>Days until next payment</Text>
                <Text
                  style={[
                    styles.ccVal,
                    { color: daysToNextPayment <= 3 ? RED_LT : GOLD },
                  ]}
                >
                  {daysToNextPayment === 0
                    ? "Today - act now"
                    : `${daysToNextPayment} days${daysToNextPayment <= 3 ? " - act now" : ""}`}
                </Text>
              </View>
            )}
          </View>

          {/* PENDING PAYMENTS */}
          {pendingDebts.length > 0 && (
            <>
              <View style={styles.missedHeader}>
                <Text style={{ fontSize: 20 }}>⚠️</Text>
                <Text style={styles.missedTitle}>Payments needing attention</Text>
              </View>

              {pendingDebts.map((debt) => {
                const daysUntilDue = getDaysUntilDue(debt);
                const { label, kind } = getUrgency(daysUntilDue);
                const isLogged = loggedIds.has(debt.id);

                return (
                  <View
                    key={debt.id}
                    style={[
                      styles.paymentCard,
                      kind === "overdue" && styles.paymentCardOverdue,
                      kind === "soon" && styles.paymentCardSoon,
                    ]}
                  >
                    <View
                      style={[
                        styles.urgencyBadge,
                        kind === "overdue" && styles.urgencyOverdue,
                        kind === "today" && styles.urgencyToday,
                        kind === "soon" && styles.urgencySoon,
                      ]}
                    >
                      <Text
                        style={[
                          styles.urgencyText,
                          kind === "overdue" && { color: "#991B1B" },
                          kind === "today" && { color: "#166534" },
                          kind === "soon" && { color: SAFE_TEXT_ON_YELLOW_BOLD },
                        ]}
                      >
                        {label}
                      </Text>
                    </View>

                    <View style={styles.pcTop}>
                      <View style={styles.pcLeft}>
                        <View
                          style={[
                            styles.pcIcon,
                            {
                              backgroundColor:
                                debt.debtType === "creditCard" ? "#EFF6FF" : "#F3E8FF",
                            },
                          ]}
                        >
                          <Ionicons
                            name={debtTypeIcon(debt.debtType) as any}
                            size={18}
                            color={debt.debtType === "creditCard" ? BLUE : "#9B59B6"}
                          />
                        </View>
                        <View>
                          <Text style={styles.pcName}>{debt.name}</Text>
                          <Text style={styles.pcType}>
                            {debtTypeLabel(debt.debtType)} · {debt.apr}% APR
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.pcAmount}>{fmt(debt.minimumPayment)}</Text>
                    </View>

                    <View style={styles.pcDetail}>
                      <View>
                        <Text style={styles.pcdLbl}>Due Date</Text>
                        <Text
                          style={[
                            styles.pcdVal,
                            daysUntilDue < 0 && styles.pcdValRed,
                            daysUntilDue >= 0 && daysUntilDue <= 3 && styles.pcdValAmber,
                          ]}
                        >
                          {debt.dueDate
                            ? `${fmtDayMonth(debt.dueDate)}${daysUntilDue < 0 ? " - LATE" : ""}`
                            : "-"}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.pcdLbl}>Min. Payment</Text>
                        <Text style={styles.pcdVal}>{fmt(debt.minimumPayment)}</Text>
                      </View>
                      <View>
                        <Text style={styles.pcdLbl}>Balance</Text>
                        <Text style={styles.pcdVal}>{fmt(debt.balance)}</Text>
                      </View>
                    </View>

                    {isLogged ? (
                      <View style={styles.payBtnLogged}>
                        <Ionicons name="checkmark-circle" size={16} color="#fff" />
                        <Text style={styles.payBtnLoggedText}>✓ {debt.name} - Logged!</Text>
                      </View>
                    ) : (
                      <Pressable
                        onPress={() => handleLogPayment(debt.id, debt.minimumPayment, debt.name)}
                        style={styles.payBtnPrimary}
                      >
                        <LinearGradient
                          colors={[BLUE, "#0D5BAE"]}
                          style={styles.payBtnGradient}
                        >
                          <Text style={styles.payBtnText}>
                            📝 Log Payment - {fmt(debt.minimumPayment)}
                          </Text>
                        </LinearGradient>
                      </Pressable>
                    )}
                  </View>
                );
              })}
            </>
          )}

          {/* TODAY'S TASKS */}
          <Text style={[styles.secLabel, { marginTop: 8 }]}>
            Complete today to start your new streak
          </Text>

          {TASKS.map((task) => {
            const done = checkedTasks.has(task.id);
            return (
              <Pressable
                key={task.id}
                onPress={() => handleTask(task.id)}
                style={[styles.taskMini, done && styles.taskMiniDone]}
              >
                <View style={[styles.tmRing, done && styles.tmRingDone]}>
                  {done && <Ionicons name="checkmark" size={13} color="#fff" />}
                </View>
                <Text style={{ fontSize: 20 }}>{task.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.tmName, done && styles.tmNameDone]}>{task.name}</Text>
                  <Text style={[styles.tmDesc, done && styles.tmDescDone]}>{task.desc}</Text>
                </View>
                <View style={[styles.tmXp, done && styles.tmXpDone]}>
                  <Text style={[styles.tmXpText, done && styles.tmXpTextDone]}>
                    +{task.xp} XP
                  </Text>
                </View>
              </Pressable>
            );
          })}

          {/* RESTART CTA */}
          <Pressable onPress={handleRestart} style={styles.restartBtn}>
            <LinearGradient
              colors={streakRestarted ? [GREEN_DK, "#2A8010"] : [GOLD, GOLD_DK]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.restartGradient}
            >
              <Text style={styles.restartText}>
                {streakRestarted
                  ? "🎉 Day 1 streak started!"
                  : "🔥 I'm Back - Restart My Streak!"}
              </Text>
            </LinearGradient>
          </Pressable>

          <Text style={styles.footerNote}>
            {payoffDate
              ? `Your debt-free date is ${fmtMonthYear(payoffDate)}. Missing a few days doesn't change that.\nWhat matters is today. 💪`
              : "Missing a few days doesn't change your goal.\nWhat matters is today. 💪"}
          </Text>

          <Pressable
            onPress={() => router.replace("/(tabs)/dashboard")}
            style={styles.skipBtn}
          >
            <Text style={styles.skipText}>Skip - take me to my plan →</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  // Hero
  hero: {
    paddingHorizontal: 18,
    paddingBottom: 20,
    paddingTop: 16,
    overflow: "hidden",
    position: "relative",
  },
  heroGlow: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(245,192,48,0.08)",
  },

  awayChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 14,
  },
  awayChipText: {
    fontFamily: Fonts.extraBold,
    fontWeight: "800",
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  heroTitle: {
    fontFamily: Fonts.black,
    fontWeight: "900",
    fontSize: 28,
    color: "#fff",
    lineHeight: 34,
    marginBottom: 6,
  },
  heroSub: {
    fontFamily: Fonts.semiBold,
    fontWeight: "600",
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
    lineHeight: 20,
    marginBottom: 16,
  },

  dexCenter: { alignItems: "center", marginBottom: 12 },

  dexBubble: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "rgba(245,192,48,0.5)",
    borderRadius: 14,
    padding: 12,
    marginBottom: 4,
    position: "relative",
  },
  dexBubbleText: {
    fontFamily: Fonts.semiBold,
    fontWeight: "700",
    fontSize: 13,
    color: DARK,
    lineHeight: 20,
    textAlign: "center",
  },
  dexBubbleTip: {
    position: "absolute",
    bottom: -9,
    left: "50%",
    marginLeft: -8,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 9,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "rgba(245,192,48,0.5)",
  },

  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 12,
  },
  streakSide: {
    flex: 1,
    alignItems: "center",
  },
  streakVal: {
    fontFamily: Fonts.black,
    fontWeight: "900",
    fontSize: 20,
    lineHeight: 24,
  },
  streakLbl: {
    fontFamily: Fonts.semiBold,
    fontWeight: "700",
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 2,
  },
  streakArrow: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 18,
    fontFamily: Fonts.bold,
  },

  // Scroll content
  scrollContent: { padding: 14, paddingBottom: 40 },

  secLabel: {
    fontFamily: Fonts.extraBold,
    fontWeight: "800",
    fontSize: 10,
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 8,
  },

  // Catch-up card
  catchupCard: {
    backgroundColor: DARK,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  catchupTitle: {
    fontFamily: Fonts.black,
    fontWeight: "900",
    fontSize: 14,
    color: GOLD,
    marginBottom: 10,
  },
  ccRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.07)",
  },
  ccLabel: {
    fontFamily: Fonts.semiBold,
    fontWeight: "700",
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    flex: 1,
  },
  ccVal: {
    fontFamily: Fonts.extraBold,
    fontWeight: "800",
    fontSize: 13,
    color: "#fff",
    textAlign: "right",
    flexShrink: 1,
    marginLeft: 8,
  },

  // Missed header
  missedHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  missedTitle: {
    fontFamily: Fonts.extraBold,
    fontWeight: "900",
    fontSize: 14,
    color: "#C03010",
  },

  // Payment card
  paymentCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: BORDER,
  },
  paymentCardOverdue: {
    borderColor: "#FF8A80",
    backgroundColor: "#FFF5F5",
  },
  paymentCardSoon: {
    borderColor: GOLD,
    backgroundColor: "#FFFBEB",
  },

  urgencyBadge: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  urgencyOverdue: { backgroundColor: "#FECACA" },
  urgencySoon: { backgroundColor: "#FEF3C7" },
  urgencyToday: { backgroundColor: "#DCFCE7" },
  urgencyText: {
    fontFamily: Fonts.black,
    fontWeight: "900",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  pcTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  pcLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  pcIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  pcName: {
    fontFamily: Fonts.extraBold,
    fontWeight: "800",
    fontSize: 15,
    color: DARK,
  },
  pcType: {
    fontFamily: Fonts.semiBold,
    fontWeight: "700",
    fontSize: 11,
    color: MUTED,
    marginTop: 1,
  },
  pcAmount: {
    fontFamily: Fonts.black,
    fontWeight: "900",
    fontSize: 18,
    color: DARK,
    flexShrink: 0,
  },

  pcDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: BG,
    borderRadius: 9,
    padding: 10,
    gap: 4,
  },
  pcdLbl: {
    fontFamily: Fonts.semiBold,
    fontWeight: "700",
    fontSize: 9,
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  pcdVal: {
    fontFamily: Fonts.extraBold,
    fontWeight: "800",
    fontSize: 12,
    color: DARK,
    marginTop: 2,
  },
  pcdValRed: { color: "#C03010" },
  pcdValAmber: { color: GOLD_DK },

  payBtnPrimary: {
    marginTop: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  payBtnGradient: {
    padding: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  payBtnText: {
    fontFamily: Fonts.extraBold,
    fontWeight: "800",
    fontSize: 14,
    color: "#fff",
  },
  payBtnLogged: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: GREEN_DK,
    borderRadius: 10,
    padding: 11,
    marginTop: 10,
    justifyContent: "center",
  },
  payBtnLoggedText: {
    fontFamily: Fonts.extraBold,
    fontWeight: "800",
    fontSize: 14,
    color: "#fff",
  },

  // Tasks
  taskMini: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  taskMiniDone: {
    borderColor: GREEN_DK,
    backgroundColor: "#F0FFF4",
  },
  tmRing: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: BORDER,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  tmRingDone: {
    backgroundColor: GREEN_DK,
    borderColor: GREEN_DK,
  },
  tmName: {
    fontFamily: Fonts.extraBold,
    fontWeight: "800",
    fontSize: 13,
    color: DARK,
  },
  tmNameDone: {
    textDecorationLine: "line-through",
    color: "#5A7A50",
  },
  tmDesc: {
    fontFamily: Fonts.semiBold,
    fontWeight: "600",
    fontSize: 15,
    color: DARK,
    marginTop: 3,
    lineHeight: 22,
  },
  tmDescDone: {
    color: MUTED,
  },
  tmXp: {
    backgroundColor: "#EFF6FF",
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexShrink: 0,
  },
  tmXpDone: {
    backgroundColor: "#DCFCE7",
  },
  tmXpText: {
    fontFamily: Fonts.black,
    fontWeight: "900",
    fontSize: 11,
    color: BLUE,
  },
  tmXpTextDone: {
    color: GREEN_DK,
  },

  // Restart CTA
  restartBtn: {
    borderRadius: 22,
    overflow: "hidden",
    marginTop: 6,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  restartGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  restartText: {
    fontFamily: Fonts.black,
    fontWeight: "900",
    fontSize: 16,
    color: DARK,
  },

  footerNote: {
    fontFamily: Fonts.semiBold,
    fontWeight: "700",
    fontSize: 12,
    color: MUTED,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 14,
    paddingHorizontal: 8,
  },

  skipBtn: {
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 4,
  },
  skipText: {
    fontFamily: Fonts.semiBold,
    fontWeight: "700",
    fontSize: 13,
    color: MUTED,
    textDecorationLine: "underline",
  },
});

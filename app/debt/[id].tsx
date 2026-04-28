import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Platform,
  Modal,
  Alert,
  Dimensions,
  ActivityIndicator,
  Animated as RNAnimated,
} from "react-native";
import Slider from "@react-native-community/slider";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useIsDark } from "@/context/ThemeContext";
import { soundManager } from "@/utils/SoundManager";
import { Fonts } from "@/constants/fonts";
import { useDebts } from "@/context/DebtContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useGame } from "@/context/GameContext";
import { useStreakReminder } from "@/context/StreakReminderContext";
import { useGoal } from "@/context/GoalContext";
import { useNotifications } from "@/context/NotificationContext";
import {
  Debt,
  DebtType,
  debtTypeLabel,
  debtTypeIcon,
  monthsToText,
  runStrategy,
  MonthlySnapshot,
} from "@/lib/calculations";
import { ProgressRing } from "@/components/ProgressRing";
import { DebtForm } from "@/components/DebtForm";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import {
  usePaymentEffects,
  PaymentEffectsOverlay,
} from "@/components/PaymentSuccessEffects";
import {
  shouldOfferAutoRouteToDayComplete,
  markDayCompleteAutoRoutedToday,
} from "@/lib/dayCompleteGate";

const { width: SCREEN_W } = Dimensions.get("window");
// Chart fits inside card: scroll 32 + card 32 + Y label ~48 + gap 4 = 116
const CHART_W = Math.max(180, SCREEN_W - 116);
const CHART_H = 180;
const INTEREST_LINE_COLOR = "#9A5800";

const DEBT_TYPE_COLORS: Record<DebtType, string> = {
  creditCard: "#3498DB",
  personalLoan: "#9B59B6",
  studentLoan: "#E67E22",
  medical: "#E74C3C",
  auto: "#C07820",
  taxDebt: "#F39C12",
  collectionAccount: "#8E44AD",
  repossessedVehicle: "#7F8C8D",
  businessDebt: "#34495E",
  businessCreditCard: "#2980B9",
  securedBusinessDebt: "#16A085",
  other: "#95A5A6",
};

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

type TabKey = "progress" | "transactions" | "details";

function formatDate(d: Date) {
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function ordinal(n: number): string {
  const s = ["th","st","nd","rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function buildAreaPath(pts: { x: number; y: number }[], width: number, height: number): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const cpX = (prev.x + curr.x) / 2;
    d += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  d += ` L ${pts[pts.length - 1].x} ${height} L ${pts[0].x} ${height} Z`;
  return d;
}

function buildLinePath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const cpX = (prev.x + curr.x) / 2;
    d += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return d;
}

function AmortizationChart({
  snapshots,
  extraSnapshots,
  initialBalance,
  color,
}: {
  snapshots: MonthlySnapshot[];
  extraSnapshots?: MonthlySnapshot[];
  initialBalance: number;
  color: string;
}) {
  if (snapshots.length < 2) return null;

  const padTop = 16;
  const padBottom = 26;
  const usableH = CHART_H - padTop - padBottom;
  const floor = padTop + usableH;
  const n = snapshots.length;

  const allX = [0, ...snapshots.map((_, i) => ((i + 1) / n) * CHART_W)];
  const allBal = [initialBalance, ...snapshots.map((s) => Math.max(0, s.totalBalance))];
  const allInt = [0, ...snapshots.map((s) => Math.max(0, s.totalInterestPaid))];

  const maxY = Math.max(initialBalance, ...allBal.map((b, i) => b + allInt[i]), 1);

  const balTopY = allBal.map((b) => padTop + (1 - b / maxY) * usableH);
  const stackTopY = allBal.map((b, i) => padTop + (1 - (b + allInt[i]) / maxY) * usableH);

  function bezierCurve(xs: number[], ys: number[]): string {
    if (xs.length < 2) return "";
    let d = `M ${xs[0]} ${ys[0]}`;
    for (let i = 1; i < xs.length; i++) {
      const cpX = (xs[i - 1] + xs[i]) / 2;
      d += ` C ${cpX} ${ys[i - 1]}, ${cpX} ${ys[i]}, ${xs[i]} ${ys[i]}`;
    }
    return d;
  }

  const balanceAreaPath = bezierCurve(allX, balTopY) + ` L ${allX[allX.length - 1]} ${floor} L ${allX[0]} ${floor} Z`;

  let interestPath = bezierCurve(allX, stackTopY);
  for (let i = allX.length - 1; i >= 0; i--) {
    if (i === allX.length - 1) {
      interestPath += ` L ${allX[i]} ${balTopY[i]}`;
    } else {
      const cpX = (allX[i + 1] + allX[i]) / 2;
      interestPath += ` C ${cpX} ${balTopY[i + 1]}, ${cpX} ${balTopY[i]}, ${allX[i]} ${balTopY[i]}`;
    }
  }
  interestPath += " Z";

  const balanceLine = bezierCurve(allX, balTopY);

  let extraLine: string | null = null;
  if (extraSnapshots && extraSnapshots.length > 1) {
    const en = extraSnapshots.length;
    const eX = [0, ...extraSnapshots.map((_, i) => ((i + 1) / en) * CHART_W)];
    const eBal = [initialBalance, ...extraSnapshots.map((s) => Math.max(0, s.totalBalance))];
    const eTopY = eBal.map((b) => padTop + (1 - b / maxY) * usableH);
    extraLine = bezierCurve(eX, eTopY);
  }

  const labelStep = Math.max(1, Math.floor(n / 4));
  const labels = snapshots
    .filter((_, i) => i % labelStep === 0 || i === n - 1)
    .map((s) => ({
      x: ((snapshots.indexOf(s) + 1) / n) * CHART_W,
      label: `${MONTH_NAMES[s.date.getMonth()]} '${String(s.date.getFullYear()).slice(2)}`,
    }));

  return (
    <Svg width={CHART_W} height={CHART_H}>
      <Defs>
        <SvgLinearGradient id={`grad_bal_${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.65" />
          <Stop offset="1" stopColor={color} stopOpacity="0.3" />
        </SvgLinearGradient>
        <SvgLinearGradient id="grad_int_amber" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={INTEREST_LINE_COLOR} stopOpacity="0.72" />
          <Stop offset="1" stopColor={INTEREST_LINE_COLOR} stopOpacity="0.38" />
        </SvgLinearGradient>
      </Defs>
      <Path d={interestPath} fill="url(#grad_int_amber)" />
      <Path d={balanceAreaPath} fill={`url(#grad_bal_${color.replace("#", "")})`} />
      <Path d={balanceLine} stroke={color} strokeWidth={2.5} fill="none" />
      {extraLine && (
        <Path d={extraLine} stroke="#fff" strokeWidth={4} fill="none" opacity={0.5} />
      )}
      {extraLine && (
        <Path d={extraLine} stroke={color} strokeWidth={2.5} fill="none" strokeDasharray="6,3" />
      )}
      {labels.map((l, i) => (
        <SvgText
          key={i}
          x={Math.min(Math.max(l.x, 16), CHART_W - 16)}
          y={CHART_H - 6}
          fontSize={9}
          fill="rgba(120,140,130,0.8)"
          textAnchor="middle"
        >
          {l.label}
        </SvgText>
      ))}
    </Svg>
  );
}

export default function DebtDetailScreen() {
  const { id, tab: tabParam, openMarkPaid, openEdit } = useLocalSearchParams<{
    id: string;
    tab?: TabKey;
    openMarkPaid?: string;
    openEdit?: string;
  }>();
  const isDark = useIsDark();
  const C = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { debts, payments, extraPayment, updateDebt, deleteDebt, logPayment } = useDebts();
  const { fmt, fmtFull } = useCurrency();
  const { awardXp, recordPaymentForStreak, triggerDex, triggerFlamePulse, grantBonusXp, triggerMiniCelebration } = useGame();
  const {
    btnState, btnScale, xpFloatActive, xpAmount, xpY, xpOpacity, xpScale, bonusActive, runPayment,
  } = usePaymentEffects();
  const { cancelTonightsReminder } = useStreakReminder();
  const { dismiss } = useNotifications();
  const { addGoalProgress } = useGoal();

  const debt = useMemo(() => debts.find((d) => d.id === id), [debts, id]);

  const shouldOpenMarkPaid = openMarkPaid === "1";
  const shouldOpenEdit = String(openEdit ?? "") === "1" && !shouldOpenMarkPaid;
  const initialTab: TabKey =
    shouldOpenMarkPaid
      ? "transactions"
      : shouldOpenEdit
        ? "details"
        : tabParam === "progress" || tabParam === "transactions" || tabParam === "details"
          ? tabParam
          : "progress";

  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [editVisible, setEditVisible] = useState(shouldOpenEdit);
  const [markPaidVisible, setMarkPaidVisible] = useState(shouldOpenMarkPaid);
  const [markPaidAmount, setMarkPaidAmount] = useState("");
  const [whatIfExtra, setWhatIfExtra] = useState(0);
  const [whatIfInput, setWhatIfInput] = useState("");
  const whatIfPrefillDebtIdRef = useRef<string | null>(null);

  const typeColor = debt ? (DEBT_TYPE_COLORS[debt.debtType] ?? Colors.primary) : Colors.primary;

  const debtPayments = useMemo(
    () => payments.filter((p) => p.debtId === id && !p.isMissed),
    [payments, id]
  );

  const totalPaid = useMemo(
    () => debtPayments.reduce((s, p) => s + p.amount, 0),
    [debtPayments]
  );

  const originalBalance = useMemo(
    () => (debt ? debt.balance + totalPaid : 0),
    [debt, totalPaid]
  );

  const progress = originalBalance > 0 ? totalPaid / originalBalance : 0;

  const singleResult = useMemo(
    () => (debt ? runStrategy([debt], 0, "avalanche") : null),
    [debt]
  );

  const whatIfResult = useMemo(
    () =>
      debt && whatIfExtra > 0
        ? runStrategy([debt], whatIfExtra, "avalanche")
        : null,
    [debt, whatIfExtra]
  );

  // Prefill What-If extra with the user's committed global extra payment once per debt detail view.
  useEffect(() => {
    if (!debt) return;
    if (whatIfPrefillDebtIdRef.current === debt.id) return;
    whatIfPrefillDebtIdRef.current = debt.id;
    const pref = Number.isFinite(extraPayment) ? Math.max(0, Math.round(extraPayment)) : 0;
    setWhatIfExtra(pref);
    setWhatIfInput(pref > 0 ? String(pref) : "");
  }, [debt, extraPayment]);

  const upcomingPayments = useMemo(() => {
    if (!debt) return [];
    let balance = debt.balance;
    const monthlyRate = debt.apr / 100 / 12;
    const result: {
      date: Date;
      amount: number;
      interest: number;
      principal: number;
      balanceAfter: number;
    }[] = [];
    const now = new Date();

    for (let i = 0; i < 12 && balance > 0.01; i++) {
      const d = new Date(now);
      d.setMonth(d.getMonth() + i + 1);
      d.setDate(Math.min(debt.dueDate, 28));
      const interest = balance * monthlyRate;
      const payment = Math.min(debt.minimumPayment, balance + interest);
      const principal = Math.max(0, payment - interest);
      balance = Math.max(0, balance - principal);
      result.push({ date: d, amount: payment, interest, principal, balanceAfter: balance });
    }
    return result;
  }, [debt]);

  const payoffDate = singleResult?.payoffDate ?? new Date();
  const totalMonths = singleResult?.totalMonths ?? 0;
  const totalInterest = singleResult?.totalInterestPaid ?? 0;
  const snapshots = singleResult?.snapshots ?? [];

  const effectiveApr = useMemo(() => {
    if (!debt) return 0;
    if (!debt.taxRate || debt.taxRate <= 0) return debt.apr;
    return debt.apr * (1 - debt.taxRate / 100);
  }, [debt]);

  // If the user navigated here specifically to log a payment, ensure
  // the transactions tab is active (so the "Mark as Paid" flow makes sense).
  useEffect(() => {
    if (!shouldOpenMarkPaid) return;
    setActiveTab("transactions");
    // Small delay to let tab header layout settle before modal animates.
    const t = setTimeout(() => setMarkPaidVisible(true), 60);
    return () => clearTimeout(t);
  }, [shouldOpenMarkPaid]);

  const taxAdjustedResult = useMemo(() => {
    if (!debt) return null;
    if (!debt.taxRate || debt.taxRate <= 0) return null;
    const adjusted = { ...debt, apr: effectiveApr };
    return runStrategy([adjusted], 0, "avalanche");
  }, [debt, effectiveApr]);

  const interestSavingFromTax = useMemo(() => {
    if (!taxAdjustedResult) return 0;
    return Math.max(0, totalInterest - taxAdjustedResult.totalInterestPaid);
  }, [totalInterest, taxAdjustedResult]);

  // While the debts context is still hydrating, avoid flashing "Debt not found" —
  // show a lightweight loader instead so the screen doesn't appear broken.
  if (!debt) {
    if (!debts || debts.length === 0) {
      return (
        <View style={[styles.root, { backgroundColor: C.background, alignItems: "center", justifyContent: "center" }]}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={[styles.notFound, { color: C.textSecondary, marginTop: 8 }]}>
            Loading your debt details...
          </Text>
        </View>
      );
    }

    return (
      <View style={[styles.root, { backgroundColor: C.background }]}>
        <Text style={[styles.notFound, { color: C.textSecondary }]}>Debt not found</Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      "Delete Debt",
      `Remove "${debt.name}" permanently? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteDebt(debt.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.back();
          },
        },
      ]
    );
  };

  // ─── Mini-celebration milestone data ────────────────────────────────────────
  type PctMilestoneInfo = { tier: 1 | 2; icon: string; xp: number; label: string; slam?: string; sub?: string };
  const PCT_MILESTONE_DATA: Record<number, PctMilestoneInfo> = {
    1:  { tier: 1, icon: "🌱", xp: 50,  label: "First 1% paid off!" },
    5:  { tier: 1, icon: "⚡", xp: 50,  label: "5% debt cleared!" },
    10: { tier: 2, icon: "🔟", xp: 100, label: "10% paid off",   slam: "TEN PERCENT.", sub: "Real momentum building!" },
    25: { tier: 2, icon: "💪", xp: 150, label: "Quarter done!",  slam: "ONE QUARTER.",  sub: "You're doing it!" },
    35: { tier: 2, icon: "🏃", xp: 150, label: "35% paid off",   slam: "OVER A THIRD.", sub: "Keep the pressure on!" },
    50: { tier: 2, icon: "🎯", xp: 200, label: "Halfway there!", slam: "HALFWAY.",       sub: "The finish line is in sight!" },
    75: { tier: 2, icon: "🔥", xp: 250, label: "75% done!",      slam: "THREE QUARTERS.", sub: "Final stretch — push through!" },
    85: { tier: 2, icon: "🚀", xp: 250, label: "85% paid off!",  slam: "ALMOST THERE.", sub: "You can see the end!" },
    90: { tier: 2, icon: "⭐", xp: 250, label: "90% cleared!",   slam: "FINAL PUSH.",   sub: "Victory is within reach!" },
  };
  const PCT_THRESHOLDS = [1, 5, 10, 25, 35, 50, 75, 85, 90];

  const handleMarkPaid = async () => {
    const amount = parseFloat(markPaidAmount) || debt.minimumPayment;
    const isPayingOff = amount >= debt.balance;
    const debtName = debt.name;
    const paymentDate = new Date();
    const paymentIso = paymentDate.toISOString();

    // Compute milestone checks before the payment modifies state
    const debtPmts = payments.filter(p => p.debtId === debt.id && !p.isMissed);
    const totalPaid = debtPmts.reduce((s, p) => s + p.amount, 0);
    const origBalance = debt.balance + totalPaid;
    const prevPct = origBalance > 0 ? (totalPaid / origBalance) * 100 : 0;
    const newPct  = origBalance > 0 ? Math.min(100, ((totalPaid + amount) / origBalance) * 100) : 0;
    const crossedPct = !isPayingOff
      ? PCT_THRESHOLDS.find(m => prevPct < m && newPct >= m) ?? null
      : null;

    const allPaidCount = payments.filter(p => !p.isMissed).length + 1;
    const crossedCount =
      !isPayingOff && (allPaidCount === 10 || allPaidCount === 25) ? allPaidCount : null;

    // Notification reminders are keyed by the due-month (current month if due hasn't happened yet; otherwise next month).
    let dueDateForReminder = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), debt.dueDate);
    if (dueDateForReminder < paymentDate) {
      dueDateForReminder = new Date(paymentDate.getFullYear(), paymentDate.getMonth() + 1, debt.dueDate);
    }
    const reminderId = `${debt.id}-${dueDateForReminder.getFullYear()}-${dueDateForReminder.getMonth() + 1}`;

    await runPayment(
      async () => {
        await logPayment({ debtId: debt.id, amount, date: paymentIso, isMissed: false });
        // Stop the specific due-month payment reminder once the user logs payment.
        try {
          await dismiss(reminderId);
        } catch (_) {}
        awardXp("LOG_PAYMENT");
        if (isPayingOff) awardXp("PAY_OFF_DEBT", { debtName });
        recordPaymentForStreak();
        // Matches `day-complete` breakdown: "+10 XP — Showed up today"
        grantBonusXp(10);
        cancelTonightsReminder();
        const milestoneHit = await addGoalProgress(amount);
        if (milestoneHit !== null) awardXp("HIT_MILESTONE");
        return { milestoneHit: milestoneHit ?? null };
      },
      {
        onBonus: () => grantBonusXp(50),
        onFlamePulse: () => triggerFlamePulse(),
        onDex: (isBonus) => {
          if (isPayingOff) {
            triggerDex("celebrating", 5000);
          } else if (isBonus) {
            triggerDex("surprised", 450);
            setTimeout(() => triggerDex("celebrating", 3000), 450);
          } else {
            triggerDex("happy");
          }
        },
        onClose: () => {
          setMarkPaidVisible(false);
          setMarkPaidAmount("");
        },
        onSuccessAfterSheetClosed: async (_isBonus, milestoneHit) => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          soundManager.play("payment_logged");
          if (milestoneHit !== null) setTimeout(() => soundManager.play("milestone"), 200);

          // Mini celebration toast for % milestones and payment-count milestones
          // Delay slightly so it appears after the XpFloat settles and before any route change
          const miniDelay = 600;
          if (crossedPct != null && PCT_MILESTONE_DATA[crossedPct]) {
            setTimeout(() => triggerMiniCelebration(PCT_MILESTONE_DATA[crossedPct]), miniDelay);
          } else if (crossedCount === 10) {
            setTimeout(() => triggerMiniCelebration({
              tier: 1, icon: "🏅", xp: 75, label: "10th payment milestone!",
            }), miniDelay);
          } else if (crossedCount === 25) {
            setTimeout(() => triggerMiniCelebration({
              tier: 2, icon: "🏆", xp: 100, label: "25 payments made!", slam: "SILVER CLUB.", sub: "Consistency is your superpower!",
            }), miniDelay);
          }

          // Immediately show the celebration moment for "today is complete"
          const paidToday =
            paymentIso.split("T")[0] === new Date().toISOString().split("T")[0];
          if (paidToday && await shouldOfferAutoRouteToDayComplete()) {
            await markDayCompleteAutoRoutedToday();
            router.replace(`/(tabs)/day-complete?closeTo=debt&debtId=${debt.id}` as any);
          }
        },
      }
    );
  };

  const webTop = Platform.OS === "web" ? 67 : 0;

  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      <LinearGradient
        colors={isDark ? [typeColor + "44", C.background] : [typeColor + "18", C.background]}
        style={[
          styles.headerGrad,
          { paddingTop: insets.top + webTop + 8 },
        ]}
      >
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: C.surface + "CC" }]}
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={22} color={C.text} />
          </Pressable>
          <View style={styles.headerMeta}>
            <View style={[styles.headerTypeIcon, { backgroundColor: typeColor + "25" }]}>
              <Ionicons name={debtTypeIcon(debt.debtType) as any} size={18} color={typeColor} />
            </View>
            <View>
              <Text style={[styles.headerName, { color: C.text }]} numberOfLines={1}>
                {debt.name}
              </Text>
              <Text style={[styles.headerType, { color: C.textSecondary }]}>
                {debtTypeLabel(debt.debtType)}{debt.isSecured ? " • Secured" : ""}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => setEditVisible(true)}
            style={[styles.editBtn, { backgroundColor: C.surface + "CC" }]}
            hitSlop={8}
          >
            <Ionicons
              name="create-outline"
              size={20}
              color={isDark ? "#FFFFFF" : "#05130A"}
            />
          </Pressable>
        </View>

        <View style={styles.segmentedWrap}>
          {(["progress", "transactions", "details"] as TabKey[]).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => { setActiveTab(tab); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              style={[
                styles.segTab,
                activeTab === tab && { backgroundColor: typeColor },
              ]}
            >
              <Text
                style={[
                  styles.segTabText,
                  { color: activeTab === tab ? "#fff" : C.textSecondary },
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </LinearGradient>

      <KeyboardAwareScrollViewCompat
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          Platform.OS === "web" && { paddingBottom: 34 },
        ]}
        showsVerticalScrollIndicator={false}
        bottomOffset={24}
      >
        {activeTab === "progress" && (
          <ProgressTab
            debt={debt}
            C={C}
            isDark={isDark}
            typeColor={typeColor}
            progress={progress}
            totalPaid={totalPaid}
            originalBalance={originalBalance}
            payoffDate={payoffDate}
            totalMonths={totalMonths}
            totalInterest={totalInterest}
            snapshots={snapshots}
            whatIfExtra={whatIfExtra}
            setWhatIfExtra={setWhatIfExtra}
            whatIfInput={whatIfInput}
            setWhatIfInput={setWhatIfInput}
            whatIfResult={whatIfResult}
            singleResult={singleResult}
            effectiveApr={effectiveApr}
            taxAdjustedResult={taxAdjustedResult}
            interestSavingFromTax={interestSavingFromTax}
            paymentHistory={debtPayments}
          />
        )}

        {activeTab === "transactions" && (
          <TransactionsTab
            debt={debt}
            C={C}
            isDark={isDark}
            typeColor={typeColor}
            upcomingPayments={upcomingPayments}
            pastPayments={debtPayments}
            onMarkPaid={() => {
              setMarkPaidAmount(debt.minimumPayment.toFixed(2));
              setMarkPaidVisible(true);
            }}
            allPayments={payments}
          />
        )}

        {activeTab === "details" && (
          <DetailsTab
            debt={debt}
            C={C}
            isDark={isDark}
            typeColor={typeColor}
            totalInterest={totalInterest}
            totalMonths={totalMonths}
            onEdit={() => setEditVisible(true)}
            onDelete={handleDelete}
          />
        )}
      </KeyboardAwareScrollViewCompat>

      <Modal
        visible={editVisible}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setEditVisible(false)}
      >
        <DebtForm
          initial={debt}
          onSave={async (data) => {
            await updateDebt(debt.id, data);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setEditVisible(false);
          }}
          onCancel={() => setEditVisible(false)}
        />
      </Modal>

      <Modal
        visible={markPaidVisible}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setMarkPaidVisible(false)}
      >
        <View style={[styles.paidModal, { backgroundColor: C.surface }]}>
          <View style={[styles.paidModalHeader, { borderBottomColor: C.border }]}>
            <Pressable onPress={() => setMarkPaidVisible(false)} hitSlop={12} style={styles.paidModalHeaderBtn}>
              <Ionicons name="close" size={24} color={C.textSecondary} />
            </Pressable>
            <Text style={[styles.paidModalTitle, { color: C.text }]}>Log Payment</Text>
            <Pressable onPress={handleMarkPaid} style={styles.paidModalHeaderBtn}>
              <Text style={[styles.paidModalSave, { color: Colors.primary }]}>Confirm</Text>
            </Pressable>
          </View>
          <View style={styles.paidModalBody}>
            <View style={[styles.paidModalIconWrap, { backgroundColor: Colors.primary + "18" }]}>
              <Ionicons name="checkmark-circle" size={40} color={Colors.primary} />
            </View>
            <Text style={[styles.paidModalDebtName, { color: C.text }]}>{debt.name}</Text>
            <Text style={[styles.paidModalSub, { color: C.textSecondary }]}>
              How much did you pay?
            </Text>
            <View style={[styles.paidInputCard, { backgroundColor: C.surfaceSecondary, borderColor: C.border }]}>
              <Text style={[styles.paidInputPrefix, { color: C.textSecondary }]}>$</Text>
              <TextInput
                style={[styles.paidInput, { color: C.text }]}
                value={markPaidAmount}
                onChangeText={setMarkPaidAmount}
                keyboardType="decimal-pad"
                placeholder={debt.minimumPayment.toFixed(2)}
                placeholderTextColor={C.textSecondary}
                autoFocus
              />
            </View>
            <Pressable
              onPress={handleMarkPaid}
              disabled={btnState !== "idle"}
              style={({ pressed }) => [styles.paidConfirmBtnWrap, { opacity: pressed ? 0.9 : 1 }]}
            >
              <LinearGradient
                colors={btnState === "success" ? [Colors.amber, Colors.amberDark] : [Colors.buttonGreen, Colors.buttonGreenDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.paidConfirmBtn}
              >
                <RNAnimated.View
                  style={[
                    styles.paidConfirmBtnContent,
                    btnState === "success" ? { transform: [{ scale: btnScale }] } : undefined,
                  ]}
                >
                  {btnState === "loading" ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : btnState === "success" ? (
                    <Ionicons name="checkmark-circle" size={22} color="#fff" />
                  ) : (
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  )}
                  <Text style={styles.paidConfirmText}>
                    {btnState === "loading" ? "Saving..." : btnState === "success" ? "Saved!" : "Mark as Paid"}
                  </Text>
                </RNAnimated.View>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Modal>

      <PaymentEffectsOverlay
        xpFloatActive={xpFloatActive}
        xpAmount={xpAmount}
        xpY={xpY}
        xpOpacity={xpOpacity}
        xpScale={xpScale}
        bonusActive={bonusActive}
      />
    </View>
  );
}

function ProgressTab({
  debt, C, isDark, typeColor, progress, totalPaid, originalBalance,
  payoffDate, totalMonths, totalInterest, snapshots,
  whatIfExtra, setWhatIfExtra, whatIfInput, setWhatIfInput,
  whatIfResult, singleResult,
  effectiveApr, taxAdjustedResult, interestSavingFromTax,
  paymentHistory,
}: any) {
  const { fmt } = useCurrency();
  const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const interestSaved = whatIfResult
    ? Math.max(0, (singleResult?.totalInterestPaid ?? 0) - whatIfResult.totalInterestPaid)
    : 0;
  const monthsSaved = whatIfResult
    ? Math.max(0, (singleResult?.totalMonths ?? 0) - whatIfResult.totalMonths)
    : 0;

  const displayDate = whatIfResult && whatIfExtra > 0 ? whatIfResult.payoffDate : payoffDate;
  const displayMonths = whatIfResult && whatIfExtra > 0 ? whatIfResult.totalMonths : totalMonths;
  const whatIfSliderMax = Math.max(500, Math.ceil((debt.minimumPayment * 6) / 50) * 50);
  const recentPayments = useMemo(
    () =>
      [...(paymentHistory ?? [])]
        .filter((p: any) => !p.isMissed)
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 8),
    [paymentHistory]
  );

  const dateOpacity = useSharedValue(1);
  const dateAnimStyle = useAnimatedStyle(() => ({ opacity: dateOpacity.value }));
  useEffect(() => {
    dateOpacity.value = 0;
    dateOpacity.value = withTiming(1, { duration: 300 });
  }, [whatIfExtra]);

  const RING_SIZE = 160;
  const RING_SW = 16;
  const ringR = (RING_SIZE - RING_SW) / 2;
  const ringCX = RING_SIZE / 2;
  const ringCY = RING_SIZE / 2;
  const ringCirc = 2 * Math.PI * ringR;
  const ringTotal = totalPaid + debt.balance + totalInterest;
  const paidFrac = ringTotal > 0 ? totalPaid / ringTotal : 0;
  const remainFrac = ringTotal > 0 ? debt.balance / ringTotal : 1;
  const interestFrac = ringTotal > 0 ? totalInterest / ringTotal : 0;
  const paidDash = paidFrac * ringCirc;
  const remainDash = remainFrac * ringCirc;
  const interestDash = interestFrac * ringCirc;

  return (
    <View style={styles.tabContent}>
      <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
        <Text style={[styles.cardLabel, { color: C.text }]}>Debt-Free Date</Text>
        <Animated.View style={dateAnimStyle}>
          <Text style={[styles.payoffDateLarge, { color: C.text }]}>
            {MONTH_NAMES[displayDate.getMonth()]} {displayDate.getFullYear()}
          </Text>
          <Text style={[styles.payoffSub, { color: typeColor }]}>
            {monthsToText(displayMonths)} from today
          </Text>
        </Animated.View>
      </View>

      <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
        <View style={styles.ringAndStats}>
          <View style={styles.ringWrap}>
            <View style={{ width: RING_SIZE, height: RING_SIZE }}>
              <Svg width={RING_SIZE} height={RING_SIZE} style={StyleSheet.absoluteFill}>
                <Circle cx={ringCX} cy={ringCY} r={ringR} stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} strokeWidth={RING_SW} fill="none" />
                <Circle
                  cx={ringCX} cy={ringCY} r={ringR}
                  stroke={isDark ? "rgba(255,255,255,0.18)" : "#D1D5DB"}
                  strokeWidth={RING_SW}
                  fill="none"
                  strokeDasharray={`${interestDash} ${ringCirc}`}
                  strokeDashoffset={-(paidDash + remainDash)}
                  rotation="-90"
                  origin={`${ringCX}, ${ringCY}`}
                />
                <Circle
                  cx={ringCX} cy={ringCY} r={ringR}
                  stroke={isDark ? "rgba(255,255,255,0.18)" : "#D1D5DB"}
                  strokeWidth={RING_SW}
                  fill="none"
                  strokeDasharray={`${remainDash} ${ringCirc}`}
                  strokeDashoffset={-paidDash}
                  rotation="-90"
                  origin={`${ringCX}, ${ringCY}`}
                />
                <Circle
                  cx={ringCX} cy={ringCY} r={ringR}
                  stroke={Colors.progressGreen}
                  strokeWidth={RING_SW}
                  fill="none"
                  strokeDasharray={`${paidDash} ${ringCirc}`}
                  strokeDashoffset={0}
                  rotation="-90"
                  origin={`${ringCX}, ${ringCY}`}
                  strokeLinecap="round"
                />
              </Svg>
            </View>
            <View style={styles.ringCenter}>
              <Text
                style={[styles.ringPct, { color: Colors.progressGreen }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.5}
              >
                {Math.round(progress * 100)}%
              </Text>
              <Text style={[styles.ringLabel, { color: C.text }]}>paid</Text>
            </View>
          </View>

          <View style={styles.ringStats}>
            <View style={styles.ringStat}>
              <Text style={[styles.ringStatLabel, { color: C.text }]}>Principal Paid (Since Added)</Text>
              <Text style={[styles.ringStatValue, { color: Colors.progressGreen }]}>
                {fmt(totalPaid)}
              </Text>
            </View>
            <View style={[styles.ringStatDivider, { backgroundColor: C.border }]} />
            <View style={styles.ringStat}>
              <Text style={[styles.ringStatLabel, { color: C.text }]}>Remaining</Text>
              <Text style={[styles.ringStatValue, { color: "#333333" }]}>
                {fmt(debt.balance)}
              </Text>
            </View>
            <View style={[styles.ringStatDivider, { backgroundColor: C.border }]} />
            <View style={styles.ringStat}>
              <Text style={[styles.ringStatLabel, { color: C.text }]}>Projected Interest</Text>
              <Text style={[styles.ringStatValue, { color: "#8DA9C4" }]}>
                {fmt(totalInterest)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {snapshots.length > 2 && (
        <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={styles.cardTitleRow}>
            <Text style={[styles.cardTitle, { color: C.text }]}>Principal vs. Interest</Text>
          </View>
          <View style={styles.chartLegend}>
            <View style={styles.chartLegendItem}>
              <View style={[styles.chartLegendSwatch, { backgroundColor: typeColor + "99" }]} />
              <Text style={[styles.chartLegendLabel, { color: C.text }]}>Principal Remaining</Text>
            </View>
            <View style={styles.chartLegendItem}>
              <View style={[styles.chartLegendSwatch, { backgroundColor: INTEREST_LINE_COLOR + "99" }]} />
              <Text style={[styles.chartLegendLabel, { color: C.text }]}>Interest Accrued</Text>
            </View>
          </View>
          <View style={styles.chartWrap}>
            <View style={styles.chartYLabel}>
              <Text style={[styles.chartAxisText, { color: C.text }]}>
                {fmt(Math.max(debt.balance, totalInterest))}
              </Text>
              <Text style={[styles.chartAxisText, { color: C.text }]}>$0</Text>
            </View>
            <AmortizationChart
              snapshots={snapshots}
              extraSnapshots={whatIfResult && whatIfExtra > 0 ? whatIfResult.snapshots : undefined}
              initialBalance={debt.balance}
              color={typeColor}
            />
          </View>
          <View style={[styles.chartSummaryRow, { borderTopColor: C.border }]}>
            <View style={styles.chartSummaryItem}>
              <Text style={[styles.chartSummaryLabel, { color: C.text }]}>Total Interest Cost</Text>
              <Text style={[styles.chartSummaryValue, { color: INTEREST_LINE_COLOR }]}>
                {fmt(totalInterest)}
              </Text>
            </View>
            <View style={[styles.chartSummaryDivider, { backgroundColor: C.border }]} />
            <View style={styles.chartSummaryItem}>
              <Text style={[styles.chartSummaryLabel, { color: C.text }]}>Interest Saved</Text>
              {whatIfExtra > 0 && interestSaved > 0 ? (
                <Text style={[styles.chartSummaryValue, { color: typeColor }]}>
                  {fmt(interestSaved)}
                </Text>
              ) : (
                <Text style={[styles.chartSummaryHint, { color: C.text }]}>
                  Add extra below
                </Text>
              )}
            </View>
          </View>
          <View style={[styles.progressTimelineWrap, { borderTopColor: C.border }]}>
            <Text style={[styles.progressTimelineTitle, { color: C.text }]}>Payment History</Text>
            {recentPayments.length === 0 ? (
              <Text style={[styles.progressTimelineEmpty, { color: C.textSecondary }]}>
                No payments logged yet.
              </Text>
            ) : (
              recentPayments.map((p: any, i: number) => (
                <View key={p.id ?? `${p.date}-${i}`} style={styles.progressTimelineItem}>
                  <View style={styles.progressTimelineRail}>
                    <View style={[styles.progressTimelineDot, { backgroundColor: Colors.progressGreen, borderColor: Colors.progressGreen }]} />
                    {i < recentPayments.length - 1 && (
                      <View style={[styles.progressTimelineLine, { backgroundColor: Colors.progressGreen + "44" }]} />
                    )}
                  </View>
                  <View style={[styles.progressTimelineCard, { backgroundColor: C.surfaceSecondary, borderColor: C.border }]}>
                    <View style={styles.timelineRow}>
                      <Text style={[styles.timelineDate, { color: C.text }]}>
                        {new Date(p.date).toLocaleDateString()}
                      </Text>
                      <Text style={[styles.timelineAmount, { color: Colors.progressGreen }]}>
                        {fmt(p.amount)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      )}

      <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
        <View style={styles.cardTitleRow}>
          <Ionicons name="bulb" size={16} color={Colors.warning} />
          <Text style={[styles.cardTitle, { color: C.text }]}>What If I Pay Extra?</Text>
        </View>
        <Text style={[styles.whatIfSub, { color: C.textSecondary }]}>
          Enter an extra monthly amount to see the impact
        </Text>
        <View style={styles.whatIfInputRow}>
          <Text style={[styles.whatIfPrefix, { color: C.textSecondary }]}>+$</Text>
          <TextInput
            style={[styles.whatIfInput, { backgroundColor: C.surfaceSecondary, color: C.text, borderColor: typeColor }]}
            value={whatIfInput}
            onChangeText={(v) => {
              setWhatIfInput(v.replace(/[^0-9]/g, ""));
              setWhatIfExtra(parseInt(v.replace(/[^0-9]/g, "")) || 0);
            }}
            placeholder="0"
            placeholderTextColor={C.textSecondary}
            keyboardType="number-pad"
          />
          <Text style={[styles.whatIfSuffix, { color: C.textSecondary }]}>/month</Text>
        </View>
        <View style={styles.whatIfSliderRow}>
          <Text style={[styles.whatIfSliderEdge, { color: C.textSecondary }]}>$0</Text>
          <Slider
            style={styles.whatIfSlider}
            minimumValue={0}
            maximumValue={whatIfSliderMax}
            step={25}
            minimumTrackTintColor={typeColor}
            maximumTrackTintColor={C.border}
            thumbTintColor={typeColor}
            value={whatIfExtra}
            onValueChange={(v) => {
              const next = Math.round(v);
              setWhatIfExtra(next);
              setWhatIfInput(next === 0 ? "" : String(next));
            }}
            onSlidingComplete={() => {
              Haptics.selectionAsync();
            }}
          />
          <Text style={[styles.whatIfSliderEdge, { color: C.textSecondary }]}>{`$${whatIfSliderMax}`}</Text>
        </View>
        <View style={styles.whatIfQuickRow}>
          {[50, 100, 200, 500].map((v) => (
            <Pressable
              key={v}
              onPress={() => { setWhatIfExtra(v); setWhatIfInput(String(v)); }}
              style={[
                styles.whatIfQuickBtn,
                { backgroundColor: whatIfExtra === v ? typeColor + "20" : C.surfaceSecondary, borderColor: whatIfExtra === v ? typeColor : C.border },
              ]}
            >
              <Text style={[styles.whatIfQuickText, { color: whatIfExtra === v ? typeColor : C.textSecondary }]}>
                +${v}
              </Text>
            </Pressable>
          ))}
        </View>
        {whatIfResult && whatIfExtra > 0 && (
          <View style={[styles.whatIfResult, { backgroundColor: typeColor + "10", borderColor: typeColor + "30" }]}>
            <View style={styles.whatIfResultStat}>
              <Text style={[styles.whatIfResultLabel, { color: C.text }]}>New Payoff</Text>
              <Text style={[styles.whatIfResultValue, { color: typeColor }]}>
                {MONTH_NAMES[whatIfResult.payoffDate.getMonth()]} {whatIfResult.payoffDate.getFullYear()}
              </Text>
            </View>
            <View style={[styles.whatIfResultDivider, { backgroundColor: typeColor + "30" }]} />
            <View style={styles.whatIfResultStat}>
              <Text style={[styles.whatIfResultLabel, { color: C.text }]}>Saves</Text>
              <Text style={[styles.whatIfResultValue, { color: typeColor }]}>
                {fmt(interestSaved)}
              </Text>
            </View>
            <View style={[styles.whatIfResultDivider, { backgroundColor: typeColor + "30" }]} />
            <View style={styles.whatIfResultStat}>
              <Text style={[styles.whatIfResultLabel, { color: C.text }]}>Sooner</Text>
              <Text style={[styles.whatIfResultValue, { color: typeColor }]}>
                {monthsToText(monthsSaved)}
              </Text>
            </View>
          </View>
        )}
      </View>

      {debt.taxRate && debt.taxRate > 0 && taxAdjustedResult && (
        <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="receipt-outline" size={16} color="#1A7A45" />
            <Text style={[styles.cardTitle, { color: C.text }]}>Tax Benefit Impact</Text>
          </View>
          <Text style={[styles.taxImpactSubtitle, { color: C.textSecondary }]}>
            At a {debt.taxRate}% tax rate, your effective cost of this debt is lower because interest may be deductible.
          </Text>
          <View style={[styles.taxImpactGrid, { borderTopColor: C.border }]}>
            <View style={styles.taxImpactStat}>
              <Text style={[styles.taxImpactLabel, { color: C.text }]}>Stated APR</Text>
              <Text style={[styles.taxImpactValue, { color: C.text }]}>{debt.apr}%</Text>
            </View>
            <View style={[styles.taxImpactDivider, { backgroundColor: C.border }]} />
            <View style={styles.taxImpactStat}>
              <Text style={[styles.taxImpactLabel, { color: C.text }]}>Effective APR</Text>
              <Text style={[styles.taxImpactValue, { color: "#1A7A45" }]}>{effectiveApr.toFixed(2)}%</Text>
            </View>
            <View style={[styles.taxImpactDivider, { backgroundColor: C.border }]} />
            <View style={styles.taxImpactStat}>
              <Text style={[styles.taxImpactLabel, { color: C.text }]}>Interest Saving</Text>
              <Text style={[styles.taxImpactValue, { color: "#1A7A45" }]}>{fmt(interestSavingFromTax)}</Text>
            </View>
          </View>
        </View>
      )}

      {debt.debtType === "taxDebt" ? (
        <View style={[styles.taxNoticeBanner, { backgroundColor: "#F39C1215", borderColor: "#F39C1240" }]}>
          <View style={styles.taxNoticeBannerRow}>
            <Text style={styles.taxNoticeBannerIcon}>🏛️</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.taxNoticeBannerTitle, { color: "#7C5A00" }]}>IRS / Tax Debt Account</Text>
              <Text style={[styles.taxNoticeBannerBody, { color: "#7C5A00" }]}>
                Unlike a car loan or mortgage, an IRS installment agreement does not lock in one interest rate for the life of the plan. The IRS sets the underpayment interest rate by law (federal short-term rate + 3 percentage points) and publishes updates each calendar quarter—about 30 days before Jan 1, Apr 1, Jul 1, and Oct 1. You do not negotiate that rate; use the percentage on your current IRS or state notice for projections in this app, and update it when a new quarter applies.
              </Text>
              <Text style={[styles.taxNoticeBannerBody, { color: "#7C5A00", marginTop: 8 }]}>
                The failure-to-pay penalty is also set by statute (not negotiated): often 0.5% per month, commonly 0.25% per month on an approved payment plan, and it can increase—for example after certain levy notices. Penalties are separate from interest; confirm amounts on your notices or IRS.gov.
              </Text>
              <Text style={[styles.taxNoticeBannerBody, { color: "#7C5A00", marginTop: 8, fontFamily: Fonts.semiBold, fontWeight: "600" }]}>
                Installment plans and Fresh Start options may be available; consolidation loans usually do not replace IRS balances. Verify all figures with the IRS or a tax professional.
              </Text>
            </View>
          </View>
        </View>
      ) : debt.apr > 15 ? (
        <View style={styles.affiliateBanner}>
          {/* Phase 2: wire onPress to consolidation loan affiliate URL */}
          <Text style={styles.affiliateBannerText}>
            {"💡 Paying " + debt.apr + "% APR? Tap here to see if you can lower it."}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function TransactionsTab({
  debt, C, isDark, typeColor, upcomingPayments, pastPayments, onMarkPaid, allPayments,
}: any) {
  const { fmt, fmtFull } = useCurrency();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const paidByKey = useMemo(() => {
    const set = new Set<string>();
    const list = Array.isArray(allPayments) ? allPayments : [];
    for (const p of list) {
      if (!p || p.debtId !== debt.id || p.isMissed) continue;
      const d = new Date(p.date);
      if (Number.isNaN(d.getTime())) continue;
      set.add(`${p.debtId}-${d.getFullYear()}-${d.getMonth() + 1}`);
    }
    return set;
  }, [allPayments, debt.id]);

  const upcomingPaymentsToShow = useMemo(() => {
    const list = Array.isArray(upcomingPayments) ? upcomingPayments : [];
    return list.filter((p: any) => {
      const d = new Date(p.date);
      if (Number.isNaN(d.getTime())) return false;
      const key = `${debt.id}-${d.getFullYear()}-${d.getMonth() + 1}`;
      return !paidByKey.has(key);
    });
  }, [upcomingPayments, paidByKey, debt.id]);

  return (
    <View style={styles.tabContent}>
      <View style={[styles.subSegmented, { backgroundColor: C.surfaceSecondary, borderColor: C.border }]}>
        {(["upcoming", "past"] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={[
              styles.subSegTab,
              tab === t && { backgroundColor: typeColor },
            ]}
          >
            <Text style={[styles.subSegText, { color: tab === t ? "#fff" : C.textSecondary }]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === "upcoming" && (
        <View>
          <Pressable
            onPress={onMarkPaid}
            style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
          >
            <LinearGradient
              colors={[typeColor, typeColor + "CC"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.markPaidBtn}
            >
              <Ionicons name="checkmark-circle" size={18} color="#ffffff" />
              <Text style={styles.markPaidText}>Mark Payment as Paid</Text>
            </LinearGradient>
          </Pressable>

          <View style={styles.timelineContainer}>
            {upcomingPaymentsToShow.map((p: any, i: number) => (
              <View key={i} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineDot, { borderColor: typeColor, backgroundColor: i === 0 ? typeColor : "transparent" }]} />
                  {i < upcomingPaymentsToShow.length - 1 && (
                    <View style={[styles.timelineLine, { backgroundColor: typeColor + "30" }]} />
                  )}
                </View>
                <View style={[styles.timelineContent, { backgroundColor: C.surface, borderColor: C.border }]}>
                  <View style={styles.timelineRow}>
                    <Text style={[styles.timelineDate, { color: C.text }]}>
                      {formatDate(p.date)}
                    </Text>
                    <Text style={[styles.timelineAmount, { color: i === 0 ? typeColor : C.text }]}>
                      {fmtFull(p.amount)}
                    </Text>
                  </View>
                  <View style={styles.timelineRow}>
                    <View style={[styles.timelineBadge, { backgroundColor: typeColor + "18" }]}>
                      <Text style={[styles.timelineBadgeText, { color: C.text }]}>Minimum</Text>
                    </View>
                    <Text style={[styles.timelineBalAfter, { color: C.text }]}>
                      Balance: {fmt(p.balanceAfter)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
            {upcomingPaymentsToShow.length === 0 && (
              <View style={styles.emptyTransactions}>
                <Ionicons name="checkmark-done-circle" size={40} color={Colors.progressGreen} />
                <Text style={[styles.emptyTransText, { color: C.textSecondary }]}>
                  This debt is fully paid off!
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {tab === "past" && (
        <View style={styles.timelineContainer}>
          {pastPayments.length === 0 ? (
            <View style={styles.emptyTransactions}>
              <Ionicons name="receipt-outline" size={40} color={C.textSecondary} />
              <Text style={[styles.emptyTransText, { color: C.textSecondary }]}>
                No payments logged yet.{"\n"}Use "Mark as Paid" to track payments.
              </Text>
            </View>
          ) : (
            [...pastPayments].reverse().map((p: any, i: number) => (
              <View key={p.id} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineDot, { borderColor: Colors.progressGreen, backgroundColor: Colors.progressGreen }]}>
                    <Ionicons name="checkmark" size={8} color="#fff" />
                  </View>
                  {i < pastPayments.length - 1 && (
                    <View style={[styles.timelineLine, { backgroundColor: Colors.progressGreen + "30" }]} />
                  )}
                </View>
                <View style={[styles.timelineContent, { backgroundColor: C.surface, borderColor: C.border }]}>
                  <View style={styles.timelineRow}>
                    <Text style={[styles.timelineDate, { color: C.text }]}>
                      {new Date(p.date).toLocaleDateString()}
                    </Text>
                    <Text style={[styles.timelineAmount, { color: Colors.progressGreen }]}>
                      {fmtFull(p.amount)}
                    </Text>
                  </View>
                  <View style={[styles.timelineBadge, { backgroundColor: Colors.progressGreen + "15" }]}>
                    <Text style={[styles.timelineBadgeText, { color: Colors.progressGreen }]}>Paid</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
}

function DetailsTab({
  debt, C, isDark, typeColor, totalInterest, totalMonths, onEdit, onDelete,
}: any) {
  const { fmt, fmtFull } = useCurrency();
  const sections = [
    {
      title: "Loan Info",
      icon: "information-circle-outline",
      rows: [
        { label: "Nickname", value: debt.name },
        { label: "Category", value: debtTypeLabel(debt.debtType) },
        { label: "Collateral", value: debt.isSecured ? "Secured" : "Unsecured" },
        { label: "Date Added", value: new Date(debt.dateAdded).toLocaleDateString() },
      ],
    },
    {
      title: "Balance & Rate",
      icon: "wallet-outline",
      rows: [
        { label: "Current Balance", value: fmtFull(debt.balance) },
        { label: "Annual Percentage Rate", value: `${debt.apr}%` },
        ...(debt.taxRate && debt.taxRate > 0 ? [
          { label: "Tax Rate", value: `${debt.taxRate}%` },
          { label: "Effective APR (after tax)", value: `${(debt.apr * (1 - debt.taxRate / 100)).toFixed(2)}%` },
        ] : []),
        { label: "Monthly Interest", value: fmtFull(debt.balance * (debt.apr / 100 / 12)) },
        { label: "Projected Interest", value: fmtFull(totalInterest) },
      ],
    },
    {
      title: "Payment Terms",
      icon: "repeat-outline",
      rows: [
        { label: "Minimum Payment", value: fmtFull(debt.minimumPayment) },
        { label: "Payment Frequency", value: "Once per month" },
        { label: "Due Day", value: ordinal(debt.dueDate) + " of the month" },
        { label: "Payoff in", value: monthsToText(totalMonths) },
      ],
    },
  ];

  return (
    <View style={styles.tabContent}>
      {sections.map((s) => (
        <View key={s.title} style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={styles.cardTitleRow}>
            <Ionicons name={s.icon as any} size={16} color={typeColor} />
            <Text style={[styles.cardTitle, { color: C.text }]}>{s.title}</Text>
          </View>
          {s.rows.map((r, i) => (
            <View
              key={r.label}
              style={[
                styles.detailsRow,
                i < s.rows.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border },
              ]}
            >
              <Text style={[styles.detailsLabel, { color: C.text }]}>{r.label}</Text>
              <Text style={[styles.detailsValue, { color: C.text }]} numberOfLines={1}>
                {r.value}
              </Text>
            </View>
          ))}
        </View>
      ))}

      <Pressable
        onPress={onEdit}
        style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
      >
        <LinearGradient
          colors={[typeColor, typeColor + "CC"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.editAllBtn}
        >
          <Ionicons name="create" size={18} color="#fff" />
          <Text style={styles.editAllText}>Edit All Details</Text>
        </LinearGradient>
      </Pressable>

      <Pressable
        onPress={onDelete}
        style={({ pressed }) => [
          styles.deleteBtn,
          { backgroundColor: Colors.danger + "10", borderColor: Colors.danger + "30", opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <Ionicons name="trash-outline" size={18} color={Colors.danger} />
        <Text style={[styles.deleteBtnText, { color: Colors.danger }]}>Delete Debt</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  notFound: { flex: 1, textAlign: "center", marginTop: 100 },
  headerGrad: {
    paddingHorizontal: 16,
    paddingBottom: 0,
    gap: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  headerMeta: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTypeIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerName: {
    fontSize: 19,
    fontFamily: Fonts.bold, fontWeight: "700",
  },
  headerType: {
    fontSize: 14,
    fontFamily: Fonts.semiBold, fontWeight: "600",
    marginTop: 1,
  },
  editBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentedWrap: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 3,
    marginBottom: 12,
  },
  segTab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  segTabText: {
    fontSize: 15,
    fontFamily: Fonts.semiBold, fontWeight: "600",
  },
  scrollContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 40,
  },
  tabContent: { gap: 14 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardLabel: {
    fontSize: 15,
    fontFamily: Fonts.semiBold, fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 17,
    fontFamily: Fonts.bold, fontWeight: "700",
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  payoffDateLarge: {
    fontSize: 34,
    fontFamily: Fonts.extraBold, fontWeight: "800",
    letterSpacing: -1,
    marginTop: 4,
  },
  payoffSub: {
    fontSize: 15,
    fontFamily: Fonts.semiBold, fontWeight: "600",
    marginTop: -4,
  },
  ringAndStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  ringWrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  ringCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    maxWidth: "75%",
  },
  ringPct: {
    fontSize: 26,
    fontFamily: Fonts.extraBold, fontWeight: "800",
    letterSpacing: -1,
  },
  ringLabel: {
    fontSize: 15,
    fontFamily: Fonts.semiBold, fontWeight: "600",
    marginTop: -2,
  },
  ringStats: {
    flex: 1,
    gap: 10,
  },
  ringStat: { gap: 2 },
  ringStatLabel: {
    fontSize: 14,
    fontFamily: Fonts.semiBold, fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  ringStatValue: {
    fontSize: 16,
    fontFamily: Fonts.bold, fontWeight: "700",
  },
  ringStatDivider: {
    height: StyleSheet.hairlineWidth,
  },
  chartWrap: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 4,
    overflow: "hidden",
  },
  chartYLabel: {
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  chartAxisText: {
    fontSize: 12,
    fontFamily: Fonts.semiBold, fontWeight: "600",
  },
  chartLegend: {
    flexDirection: "row",
    gap: 16,
    marginTop: -4,
  },
  chartLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  chartLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chartLegendSwatch: {
    width: 14,
    height: 10,
    borderRadius: 3,
  },
  chartLegendLabel: {
    fontSize: 14,
    fontFamily: Fonts.semiBold, fontWeight: "600",
  },
  chartSummaryRow: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    marginTop: 2,
  },
  chartSummaryItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  chartSummaryDivider: {
    width: StyleSheet.hairlineWidth,
  },
  chartSummaryLabel: {
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    fontFamily: Fonts.semiBold, fontWeight: "600",
  },
  chartSummaryValue: {
    fontSize: 15,
    fontFamily: Fonts.bold, fontWeight: "700",
  },
  chartSummaryHint: {
    fontSize: 14,
    fontFamily: Fonts.semiBold, fontWeight: "600",
    fontStyle: "italic",
  },
  progressTimelineWrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 8,
    paddingTop: 10,
    gap: 8,
  },
  progressTimelineTitle: {
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    fontFamily: Fonts.semiBold, fontWeight: "600",
  },
  progressTimelineEmpty: {
    fontSize: 13,
    fontFamily: Fonts.semiBold, fontWeight: "600",
  },
  progressTimelineItem: {
    flexDirection: "row",
    gap: 10,
    minHeight: 42,
  },
  progressTimelineRail: {
    width: 12,
    alignItems: "center",
    paddingTop: 2,
  },
  progressTimelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  progressTimelineLine: {
    marginTop: 3,
    width: 2,
    flex: 1,
    borderRadius: 2,
  },
  progressTimelineCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  whatIfSub: { fontSize: 13, marginTop: -4 },
  whatIfInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  whatIfPrefix: {
    fontSize: 16,
    fontFamily: Fonts.semiBold, fontWeight: "600",
  },
  whatIfInput: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 11 : 9,
    fontSize: 18,
    fontFamily: Fonts.bold, fontWeight: "700",
  },
  whatIfSuffix: { fontSize: 13 },
  whatIfSliderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: -2,
  },
  whatIfSlider: {
    flex: 1,
    height: 32,
  },
  whatIfSliderEdge: {
    fontSize: 12,
    fontFamily: Fonts.semiBold, fontWeight: "600",
    width: 34,
    textAlign: "center",
  },
  whatIfQuickRow: {
    flexDirection: "row",
    gap: 8,
  },
  whatIfQuickBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  whatIfQuickText: {
    fontSize: 13,
    fontFamily: Fonts.semiBold, fontWeight: "600",
  },
  whatIfResult: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  whatIfResultStat: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  whatIfResultLabel: {
    fontSize: 13,
    fontFamily: Fonts.semiBold, fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  whatIfResultValue: {
    fontSize: 15,
    fontFamily: Fonts.bold, fontWeight: "700",
  },
  whatIfResultDivider: {
    width: StyleSheet.hairlineWidth,
  },
  affiliateBanner: {
    backgroundColor: "#F0F7FF",
    borderRadius: 8,
    padding: 12,
  },
  affiliateBannerText: {
    fontSize: 13,
    color: "#1A4A7A",
    lineHeight: 18,
  },
  taxImpactSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  taxImpactGrid: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
  },
  taxImpactStat: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  taxImpactDivider: {
    width: StyleSheet.hairlineWidth,
  },
  taxImpactLabel: {
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    fontFamily: Fonts.semiBold, fontWeight: "600",
    textAlign: "center",
  },
  taxImpactValue: {
    fontSize: 15,
    fontFamily: Fonts.bold, fontWeight: "700",
  },
  taxNoticeBanner: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  taxNoticeBannerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  taxNoticeBannerIcon: {
    fontSize: 20,
    lineHeight: 24,
  },
  taxNoticeBannerTitle: {
    fontSize: 13,
    fontFamily: Fonts.bold, fontWeight: "700",
    marginBottom: 2,
  },
  taxNoticeBannerBody: {
    fontSize: 13,
    lineHeight: 18,
  },
  subSegmented: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
    gap: 3,
  },
  subSegTab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 9,
  },
  subSegText: {
    fontSize: 13,
    fontFamily: Fonts.semiBold, fontWeight: "600",
  },
  markPaidBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 16,
  },
  markPaidText: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: Fonts.bold, fontWeight: "700",
  },
  timelineContainer: {
    gap: 0,
  },
  timelineItem: {
    flexDirection: "row",
    gap: 12,
    minHeight: 72,
  },
  timelineLeft: {
    alignItems: "center",
    width: 20,
    paddingTop: 4,
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  timelineLine: {
    flex: 1,
    width: 2,
    marginTop: 4,
    marginBottom: -4,
  },
  timelineContent: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 6,
    marginBottom: 8,
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timelineDate: {
    fontSize: 14,
    fontFamily: Fonts.semiBold, fontWeight: "600",
  },
  timelineAmount: {
    fontSize: 15,
    fontFamily: Fonts.bold, fontWeight: "700",
  },
  timelineBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  timelineBadgeText: {
    fontSize: 14,
    fontFamily: Fonts.bold, fontWeight: "700",
  },
  timelineBalAfter: {
    fontSize: 14,
    fontFamily: Fonts.semiBold, fontWeight: "600",
  },
  emptyTransactions: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 32,
  },
  emptyTransText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 11,
  },
  detailsLabel: {
    fontSize: 15,
    fontFamily: Fonts.semiBold, fontWeight: "600",
  },
  detailsValue: {
    fontSize: 14,
    fontFamily: Fonts.semiBold, fontWeight: "600",
    maxWidth: "55%",
    textAlign: "right",
  },
  editAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 15,
  },
  editAllText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: Fonts.bold, fontWeight: "700",
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 15,
    borderWidth: 1,
  },
  deleteBtnText: {
    fontSize: 16,
    fontFamily: Fonts.bold, fontWeight: "700",
  },
  paidModal: {
    flex: 1,
  },
  paidModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  paidModalHeaderBtn: {
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  paidModalTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: Fonts.bold, fontWeight: "700",
    textAlign: "center",
  },
  paidModalSave: {
    fontSize: 16,
    fontFamily: Fonts.semiBold, fontWeight: "600",
  },
  paidModalBody: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: "center",
  },
  paidModalIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  paidModalDebtName: {
    fontSize: 20,
    fontFamily: Fonts.bold, fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  paidModalSub: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 20,
  },
  paidInputCard: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  paidInputPrefix: {
    fontSize: 24,
    fontFamily: Fonts.semiBold, fontWeight: "600",
    marginRight: 4,
  },
  paidInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 26,
    fontFamily: Fonts.bold, fontWeight: "700",
    textAlign: "center",
  },
  paidConfirmBtnWrap: {
    width: "100%",
  },
  paidConfirmBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    width: "100%",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  paidConfirmBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  paidConfirmText: {
    color: "#fff",
    fontSize: 17,
    fontFamily: Fonts.bold, fontWeight: "700",
    textAlign: "center",
  },
});

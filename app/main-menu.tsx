import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Platform,
  ScrollView as RNScrollView,
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useGame } from "@/context/GameContext";
import { useGoal } from "@/context/GoalContext";
import { useDebts } from "@/context/DebtContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useNotifications } from "@/context/NotificationContext";
import { Fonts } from "@/constants/fonts";
import { getLevelDef, LEVELS_DATA } from "@/constants/levelsData";
import { getDailyQuote } from "@/constants/dailyQuotes";
import { WelcomeSetupBanner } from "@/components/WelcomeSetupBanner";
import { DexDayComplete } from "@/components/DexDayComplete";
import {
  hasCompletedDayFlowToday,
  consumeHomeWrappedFeedback,
  markDayCompleteAcknowledgedToday,
} from "@/lib/dayCompleteGate";
import {
  getDevPreviewActivityDay,
  getDevPreviewHomeState,
  getDevPreviewStreakDays,
  isDevHomePreviewAvailable,
} from "@/lib/devHomePreview";
import { getRecommendations, RECOMMENDATION_MIN_BALANCE } from "@/lib/MonetizationRules";
import {
  MAX_SIM_MONTHS,
  debtsEligibleForStrategy,
  debtsForMinimumPaymentComparison,
  projectedInterestSavedVsMinimumPayments,
  runStrategy,
} from "@/lib/calculations";
import { AFFILIATE_URLS } from "@/lib/affiliateUrls";
import { withAppUtmParams } from "@/lib/utm";
import * as Haptics from "expo-haptics";
import { SatisfactionFeedbackModal } from "@/components/SatisfactionFeedbackModal";
import { hasTriggerFired } from "@/lib/satisfactionFeedbackGate";

// ─── Colors ───────────────────────────────────────────────────────────────────
const BG        = "#1B1850";
const WHITE     = "#FFFFFF";
const PURPLE_LT = "#C0A8FF";
const AMBER     = "#F5C842";
const GREEN_XP  = "#80EEC0";
const CARD_BG   = "rgba(255,255,255,0.07)";
const CARD_BD   = "rgba(255,255,255,0.10)";
/** High-contrast body / label text on dark purple (accessibility). */
const BODY_WHITE = "rgba(255,255,255,0.96)";
const LABEL_WHITE = "rgba(255,255,255,0.92)";
const MUTED55   = BODY_WHITE;
const MUTED45   = LABEL_WHITE;

const ONBOARDING_DREAM_GOAL_NAME_KEY = "@debtpath_dream_goal_name";
const ONBOARDING_DREAM_GOAL_COST_KEY = "@debtpath_dream_goal_cost";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getDayOfYear(): number {
  const now = new Date();
  return Math.floor(
    (Date.now() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  );
}

/** Deterministic daily pick so content stays stable for the calendar day. */
function stableDayPick<T>(arr: T[], seed: string): T {
  if (arr.length === 0) throw new Error("stableDayPick: empty array");
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return arr[Math.abs(h) % arr.length];
}

// ─── Daily home messages ──────────────────────────────────────────────────────
interface HomeMsg { plain: string; em: string }
const HOME_MSGS: HomeMsg[] = [
  { plain: "You showed up today.",       em: "That's how debt disappears."  },
  { plain: "Every payment is a vote",    em: "for your future self."        },
  { plain: "Consistency beats",          em: "intensity every time."        },
  { plain: "Small steps taken daily",    em: "become giant leaps."          },
  { plain: "You came back today.",       em: "That's real progress."        },
  { plain: "Progress is happening,",     em: "even when it's invisible."    },
  { plain: "Every dollar paid is",       em: "freedom purchased."           },
];

function recHomePalette(id: string): { bg: string; border: string; btn: string } {
  switch (id) {
    case "tax":     return { bg: "#E8EEF8", border: "#0A3580", btn: "#0A3580" };
    case "relief":  return { bg: "#FFE0DC", border: "#991C1C", btn: "#991C1C" };
    case "business":return { bg: "#E6F5EC", border: "#135228", btn: "#135228" };
    case "rate":    return { bg: "#D4E3FF", border: "#0A3580", btn: "#0A3580" };
    case "means_test": return { bg: "#F3E8FF", border: "#5B2C91", btn: "#5B2C91" };
    default:        return { bg: "#FFFFFF", border: "#A8967A", btn: "#C07200" };
  }
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function MainMenuScreen({
  showClose = true,
  showWelcomeBackBanner = false,
  onContinueFromWelcomeBack,
}: {
  showClose?: boolean;
  showWelcomeBackBanner?: boolean;
  onContinueFromWelcomeBack?: () => void;
}) {
  const insets   = useSafeAreaInsets();
  const {
    streakCount,
    totalXp,
    level,
    currentLevelXp,
    nextLevelXp,
    longestStreak,
    recordPaymentForStreak,
  } = useGame();
  const welcomeBackStreakRecordedRef = useRef(false);
  const { goalName, hasGoal, daysToGoal } = useGoal();
  const { activeResult, extraPayment, welcomeSkipped, debts, selectedStrategy, customOrder, payments } = useDebts();
  const { fmt } = useCurrency();
  const { setDebts } = useNotifications();

  const [onboardingDreamName, setOnboardingDreamName] = useState("");
  const [onboardingDreamCost, setOnboardingDreamCost] = useState(0);
  const [dayDoneBanner, setDayDoneBanner]     = useState(false);
  const [dayGateReady, setDayGateReady]       = useState(false);
  const [satisfactionVisible, setSatisfactionVisible] = useState(false);
  const [devPreviewActivityDay, setDevPreviewActivityDay] = useState<number | null>(null);
  const [devPreviewStreakOverride, setDevPreviewStreakOverride] = useState<number | null>(null);
  const [dayWrappedFeedback, setDayWrappedFeedback] = useState<"success" | "error" | null>(null);

  const currentLevelDef = getLevelDef(level);
  const nextLevelDef    = level < LEVELS_DATA.length ? getLevelDef(level + 1) : null;
  const xpToNext        = nextLevelXp - currentLevelXp;
  const xpIntoLevel     = totalXp - currentLevelDef.minXp;
  const levelSpan       = (currentLevelDef.maxXp ?? (currentLevelDef.minXp + 9999)) - currentLevelDef.minXp;

  const effectiveGoalName = (hasGoal ? goalName : onboardingDreamName).trim();
  const debtMonths        = Math.max(0, Math.round(activeResult?.totalMonths ?? 0));
  const dreamMonthsFromGoal = hasGoal && daysToGoal > 0 ? Math.ceil(daysToGoal / 30) : 0;
  const dreamMonthsFromOnboarding =
    !hasGoal && onboardingDreamCost > 0 && extraPayment > 0
      ? Math.ceil(onboardingDreamCost / Math.max(1, extraPayment))
      : 0;
  const dreamMonths = dreamMonthsFromGoal || dreamMonthsFromOnboarding;

  const monthsText = (n: number) => `${n} month${n === 1 ? "" : "s"}`;

  const dreamIcon = (() => {
    const v = effectiveGoalName.toLowerCase();
    if (v.includes("car"))   return "🚗";
    if (v.includes("home") || v.includes("house")) return "🏠";
    if (v.includes("trip") || v.includes("travel") || v.includes("vacation")) return "✈️";
    if (v.includes("wedding")) return "💍";
    return "🌟";
  })();

  const displayStreakCount =
    typeof devPreviewStreakOverride === "number" ? devPreviewStreakOverride : streakCount;

  // ── Daily picks ──
  const calendarDay = new Date().toISOString().slice(0, 10);
  const homeMsg  = stableDayPick(HOME_MSGS, `${calendarDay}-home-msg`);
  const dayOfYear = getDayOfYear();
  const dailyQuote = getDailyQuote(dayOfYear).text;

  // ── Financial stats ──
  const totalPaidTowardDebt = useMemo(
    () => payments.filter((p) => !p.isMissed).reduce((sum, p) => sum + p.amount, 0),
    [payments]
  );
  const interestSavedVsMinimums = useMemo(
    () =>
      projectedInterestSavedVsMinimumPayments(
        debts,
        activeResult.totalInterestPaid,
        selectedStrategy,
        customOrder
      ),
    [debts, activeResult.totalInterestPaid, selectedStrategy, customOrder]
  );
  const minimumsComparison = useMemo(() => {
    if (!activeResult || !Number.isFinite(activeResult.totalMonths)) {
      return {
        monthsSaved: 0,
        minimumsLikelyNotEnough: false,
      };
    }
    const eligible = debtsForMinimumPaymentComparison(debts);
    if (!eligible.length) {
      return {
        monthsSaved: 0,
        minimumsLikelyNotEnough: false,
      };
    }
    const neutralOrder = debtsEligibleForStrategy(eligible).map((d) => d.id);
    const minOnly = runStrategy(eligible, 0, "custom", neutralOrder);
    const stillHasBalance = (minOnly.snapshots[minOnly.snapshots.length - 1]?.totalBalance ?? 0) > 0.01;
    return {
      monthsSaved: Math.max(0, Math.round(minOnly.totalMonths - activeResult.totalMonths)),
      minimumsLikelyNotEnough: minOnly.totalMonths >= MAX_SIM_MONTHS && stillHasBalance,
    };
  }, [debts, activeResult]);
  const monthsSavedVsMinimums = minimumsComparison.monthsSaved;
  const minimumsLikelyNotEnough = minimumsComparison.minimumsLikelyNotEnough;
  const displayInterestSavedVsMinimums = minimumsLikelyNotEnough
    ? "Payoff path unlocked"
    : interestSavedVsMinimums >= 10_000_000
      ? "Huge interest avoided"
      : fmt(interestSavedVsMinimums);
  const weeklySummary = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const paidThisWeek = payments.filter((p) => {
      if (p.isMissed) return false;
      const when = new Date(p.date);
      return Number.isFinite(when.getTime()) && when >= weekAgo;
    });

    const totalPaid = paidThisWeek.reduce((sum, p) => sum + p.amount, 0);
    return {
      paymentCount: paidThisWeek.length,
      totalPaid,
    };
  }, [payments]);

  const homeRecommendations = useMemo(() => {
    const recDebts = (debts || []).map((d) => ({
      id: d.id, name: d.name, balance: d.balance, apr: d.apr,
      category: d.debtType, debtType: d.debtType, isSecured: d.isSecured,
    }));
    return getRecommendations(recDebts, "dashboard");
  }, [debts]);

  const resolvedActivityDayForCta =
    devPreviewActivityDay ?? (displayStreakCount >= 1 ? displayStreakCount + 1 : null);
  const completeTodayCtaLabel =
    resolvedActivityDayForCta != null && resolvedActivityDayForCta >= 2
      ? `Complete Day ${resolvedActivityDayForCta} activities`
      : resolvedActivityDayForCta === 1
        ? "Complete Day 1 activities"
        : "Complete today's activities";

  // ── Effects ──
  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(ONBOARDING_DREAM_GOAL_NAME_KEY),
      AsyncStorage.getItem(ONBOARDING_DREAM_GOAL_COST_KEY),
    ])
      .then(([name, cost]) => {
        setOnboardingDreamName((name ?? "").trim());
        setOnboardingDreamCost(parseFloat(cost ?? "0") || 0);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!dayWrappedFeedback) return;
    const t = setTimeout(() => setDayWrappedFeedback(null), 5000);
    return () => clearTimeout(t);
  }, [dayWrappedFeedback]);

  useEffect(() => {
    setDebts(
      (debts || []).map((d) => ({
        id: d.id, name: d.name,
        minimumPayment: d.minimumPayment, dueDate: d.dueDate,
      }))
    );
  }, [debts, setDebts]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        const wrappedFb = await consumeHomeWrappedFeedback();
        if (!alive) return;
        if (wrappedFb) setDayWrappedFeedback(wrappedFb);
        if (wrappedFb === "success") {
          await markDayCompleteAcknowledgedToday();
        }
        if (!alive) return;

        const doneToday = await hasCompletedDayFlowToday();
        if (isDevHomePreviewAvailable()) {
          const [d, st, previewState] = await Promise.all([
            getDevPreviewActivityDay(),
            getDevPreviewStreakDays(),
            getDevPreviewHomeState(),
          ]);
          if (!alive) return;
          setDevPreviewActivityDay(d);
          setDevPreviewStreakOverride(st);
          if (previewState === "completed_today") { setDayDoneBanner(true); setDayGateReady(true); return; }
          if (previewState === "skipped_wrap")    { setDayDoneBanner(false); setDayGateReady(true); return; }
          if (previewState === "needs_wrap")      { setDayDoneBanner(false); setDayGateReady(true); return; }
        } else if (alive) {
          setDevPreviewActivityDay(null);
          setDevPreviewStreakOverride(null);
        }
        if (!alive) return;
        setDayDoneBanner(doneToday || wrappedFb === "success");
        setDayGateReady(true);
      })();
      return () => { alive = false; };
    }, [streakCount]),
  );

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    void (async () => {
      if (displayStreakCount !== 1) return;
      const done = await hasTriggerFired("day1_complete");
      if (cancelled || done) return;
      timer = setTimeout(() => { if (!cancelled) setSatisfactionVisible(true); }, 900);
    })();
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  }, [displayStreakCount]);

  const bottomPad = Math.max(insets.bottom, Platform.OS === "web" ? 34 : 12) + 96;

  const handleWelcomeBackContinue = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!welcomeBackStreakRecordedRef.current) {
      recordPaymentForStreak();
      welcomeBackStreakRecordedRef.current = true;
    }
    onContinueFromWelcomeBack?.();
  }, [recordPaymentForStreak, onContinueFromWelcomeBack]);

  return (
    <View style={[styles.screen, { paddingTop: Platform.OS !== "web" ? insets.top : 0 }]}>
      {/* Radial glow — matches HTML: radial-gradient(ellipse at 50% 30%, rgba(100,80,230,0.40) 0%, transparent 65%) */}
      <LinearGradient
        colors={["rgba(100,80,230,0.40)", "rgba(100,80,230,0.10)", "transparent"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
        style={styles.bgGlow}
      />

      <RNScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces
        overScrollMode="always"
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior="never"
      >
        {/* ── Top row ── */}
        <View style={styles.topRow}>
          <View style={styles.topLeft}>
            <Text style={styles.greetingSup}>Great work, keep it up!</Text>
            <Text style={styles.greetingTitle}>
              {currentLevelDef.name}
            </Text>
          </View>
          <View style={styles.topRight}>
            {displayStreakCount > 0 && (
              <View style={styles.streakBadge}>
                <Text style={styles.streakText}>🔥 {displayStreakCount}d</Text>
              </View>
            )}
            {showClose && (
              <Pressable
                onPress={() => router.replace("/(tabs)/dashboard")}
                style={({ pressed }) => [styles.closeBtn, { opacity: pressed ? 0.85 : 1 }]}
                accessibilityRole="button"
                accessibilityLabel="Back to Home"
              >
                <Ionicons name="chevron-back" size={20} color={WHITE} />
              </Pressable>
            )}
          </View>
        </View>

        {showWelcomeBackBanner && (
          <>
            <View
              style={styles.welcomeBackBanner}
              accessibilityRole="summary"
              accessibilityLabel="Welcome back"
            >
              <Text style={styles.welcomeBackTitle}>Welcome back — glad you{"'"}re here</Text>
              <Text style={styles.welcomeBackSub}>
                Showing up again is what winners do. There{"'"}s nothing to catch up on this screen —
                when you{"'"}re ready, your usual today flow is right below.
              </Text>
              <Pressable
                onPress={handleWelcomeBackContinue}
                style={({ pressed }) => [
                  styles.welcomeBackBtn,
                  { opacity: pressed ? 0.92 : 1 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Let's get back on track"
              >
                <Text style={styles.welcomeBackBtnText}>Let{"'"}s get back on track</Text>
              </Pressable>
            </View>
            <View style={styles.weeklySummaryCard} accessibilityRole="summary" accessibilityLabel="Weekly summary">
              <Text style={styles.weeklySummaryEyebrow}>Weekly Summary</Text>
              <Text style={styles.weeklySummaryTitle}>Your last 7 days</Text>
              <View style={styles.weeklySummaryStatsRow}>
                <View style={[styles.weeklySummaryStatPill, styles.weeklySummaryStatPillGold]}>
                  <Text style={styles.weeklySummaryStatValue}>{weeklySummary.paymentCount}</Text>
                  <Text style={styles.weeklySummaryStatLabel}>Payments</Text>
                </View>
                <View style={[styles.weeklySummaryStatPill, styles.weeklySummaryStatPillGreen]}>
                  <Text style={styles.weeklySummaryStatValue}>{fmt(weeklySummary.totalPaid)}</Text>
                  <Text style={styles.weeklySummaryStatLabel}>Paid</Text>
                </View>
              </View>
              <Text style={styles.weeklySummarySub}>
                Keep this streak alive - showing up each day keeps momentum on your side.
              </Text>
            </View>
          </>
        )}

        {welcomeSkipped && debts.length === 0 && <WelcomeSetupBanner />}

        {/* ── Feedback banners ── */}
        {dayWrappedFeedback === "success" && (
          <View style={styles.feedbackBannerOk} accessibilityRole="alert">
            <Text style={styles.feedbackBannerOkText}>
              You're all set for today - your wrap-up was saved.
            </Text>
          </View>
        )}
        {dayWrappedFeedback === "error" && (
          <View style={styles.feedbackBannerErr} accessibilityRole="alert">
            <Text style={styles.feedbackBannerErrText}>
              We couldn't save today's wrap-up. Tap today's wrap-up on Home to try again.
            </Text>
          </View>
        )}

        {/* ── Day done banner ── */}
        {dayGateReady && dayDoneBanner && !dayWrappedFeedback && (
          <View style={styles.dayDoneBanner} accessibilityRole="summary">
            <Text style={styles.dayDoneBannerEmoji}>🎉</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.dayDoneBannerTitle}>Well done - you completed today's activities</Text>
              <Text style={styles.dayDoneBannerSub}>
                You wrapped up what matters for today. Come back tomorrow to keep your streak going.
              </Text>
            </View>
          </View>
        )}

        {/* ── Complete today CTA ── */}
        {dayGateReady && !dayDoneBanner && (
          <Pressable
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
              // Open an actionable daily task (log a payment) instead of the wrap-up screen.
              router.push("/(tabs)/dashboard?openLog=1");
            }}
            style={({ pressed }) => [
              styles.completeTodayCta,
              pressed && { opacity: 0.92 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={completeTodayCtaLabel}
            accessibilityHint="Opens today's payment task flow"
          >
            <Text style={styles.completeTodayCtaText}>{completeTodayCtaLabel}</Text>
            <Text style={styles.completeTodayCtaChev}>→</Text>
          </Pressable>
        )}

        {/* ── Dream goal (above Dex so title/subtext never sit under the mascot) ── */}
        <View style={styles.dreamCard}>
          <View style={styles.dreamIconBox}>
            <Text style={{ fontSize: 26 }}>{dreamIcon}</Text>
          </View>
          <View style={styles.dreamTextCol}>
            <Text style={styles.dreamEyebrow}>Your Dream Goal</Text>
            <Text style={styles.dreamTitle} numberOfLines={3}>
              {effectiveGoalName || "Debt-Free Life"}
            </Text>
            <Text style={styles.dreamSub}>
              {effectiveGoalName
                ? dreamMonths > 0
                  ? `Stay on track - debt-free first, then ${effectiveGoalName} is next.`
                  : debtMonths > 0
                    ? `Stay on track - ${effectiveGoalName} is waiting after debt-free.`
                    : `Stay consistent - ${effectiveGoalName} is getting closer.`
                : debtMonths > 0
                  ? `Stay on track - you'll be debt-free in ${monthsText(debtMonths)}.`
                  : "Each payment brings your goals closer."}
            </Text>
          </View>
        </View>

        {/* ── Dex mascot (decorative only — must not intercept taps above/beside it) ── */}
        <View style={styles.dexWrap} pointerEvents="none">
          <DexDayComplete state="congratulating" />
        </View>

        {/* ── Interest vs minimums (second wide card) ── */}
        <View style={[styles.statCard, styles.statGreen, styles.statCardFull]}>
          <Text style={styles.statIcon}>📉</Text>
          <Text style={[styles.statVal, { color: GREEN_XP }]}>{displayInterestSavedVsMinimums}</Text>
          <Text style={styles.interestSavedCaption}>
            {minimumsLikelyNotEnough
              ? `Minimum payments alone may never fully pay these balances down. Your current plan puts you on a payoff path in ${Math.max(0, Math.round(activeResult.totalMonths))} month${Math.max(0, Math.round(activeResult.totalMonths)) === 1 ? "" : "s"}.`
              : `On track to save ${fmt(interestSavedVsMinimums)} in interest and ${monthsSavedVsMinimums} month${monthsSavedVsMinimums === 1 ? "" : "s"} versus minimum payments.`}
          </Text>
        </View>

        {/* ── Motivational message ── */}
        <View style={styles.msgCard}>
          <Text style={styles.msgText}>
            {homeMsg.plain}
            {"\n"}
            <Text style={styles.msgEm}>{homeMsg.em}</Text>
          </Text>
        </View>

        {/* ── XP and streak (streak only if active) ── */}
        <View style={styles.statsGrid}>
          {displayStreakCount > 0 ? (
            <>
              <View style={[styles.statCard, styles.statGold]}>
                <Text style={styles.statIcon}>⚡</Text>
                <Text style={[styles.statVal, { color: AMBER }]}>{totalXp.toLocaleString()}</Text>
                <Text style={styles.statLbl}>Total XP</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>🔥</Text>
                <Text style={[styles.statVal, { color: AMBER }]}>{displayStreakCount}d</Text>
                <Text style={styles.statLbl}>Day streak</Text>
              </View>
            </>
          ) : (
            <View style={[styles.statCard, styles.statGold, styles.statCardFull]}>
              <Text style={styles.statIcon}>⚡</Text>
              <Text style={[styles.statVal, { color: AMBER }]}>{totalXp.toLocaleString()}</Text>
              <Text style={styles.statLbl}>Total XP</Text>
            </View>
          )}
        </View>

        {/* ── Recommendations ── */}
        {homeRecommendations.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Explore your options</Text>
            <Text style={styles.sectionSub}>
              Personalized picks when a debt type is over{" "}
              {`$${RECOMMENDATION_MIN_BALANCE.toLocaleString("en-US")}`} - swipe for debt relief, tax help, lower rates, and more.
            </Text>
            <RNScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.consultScroll}
            >
              {homeRecommendations.map((r) => {
                const pal = recHomePalette(r.id);
                const url = AFFILIATE_URLS[r.affiliateKey] ?? AFFILIATE_URLS.DEBT_RELIEF;
                const btnLabel = r.linkText.trim().replace(/\.*$/, "");
                return (
                  <View
                    key={r.id}
                    style={[styles.consultCard, { backgroundColor: pal.bg, borderColor: pal.border }]}
                  >
                    <Text style={styles.consultIcon}>{r.icon}</Text>
                    <Text style={styles.consultQ}>{r.header}</Text>
                    <Text style={styles.consultD}>{r.body}</Text>
                    <Pressable
                      style={[styles.consultBtn, { backgroundColor: pal.btn }]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        Linking.openURL(withAppUtmParams(url)).catch(() => {});
                      }}
                    >
                      <Text style={styles.consultBtnText}>
                        {btnLabel.includes("→") ? btnLabel : `${btnLabel} →`}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </RNScrollView>
          </>
        )}

        {/* ── Daily quote card ── */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteOpenQuote}>{"\u201C"}</Text>
          <Text style={styles.quoteText}>{dailyQuote}</Text>
        </View>
      </RNScrollView>

      <SatisfactionFeedbackModal
        visible={satisfactionVisible}
        trigger="day1_complete"
        onClosed={() => setSatisfactionVisible(false)}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },

  bgGlow: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: "65%",
    zIndex: 0,
  },

  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 24,
    alignItems: "center",
  },

  // ── Top row ──
  topRow: {
    width: "100%", flexDirection: "row",
    justifyContent: "space-between", alignItems: "flex-start",
    marginBottom: 20,
  },
  topLeft: { flexDirection: "column" },
  topRight: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  greetingSup: {
    fontSize: 16, fontFamily: Fonts.semiBold,
    color: BODY_WHITE, marginBottom: 3,
  },
  greetingTitle: {
    fontSize: 28, fontFamily: Fonts.serif,
    color: WHITE, lineHeight: 34,
  },
  streakBadge: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1.5, borderColor: "rgba(255,200,80,0.40)",
    borderRadius: 100, paddingVertical: 9, paddingHorizontal: 16,
  },
  streakText: {
    fontSize: 15, fontFamily: Fonts.bold,
    fontWeight: "800", color: "#FFD080",
  },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center",
  },

  // ── Dex ──
  dexWrap: {
    width: 165, height: 182,
    alignItems: "center", justifyContent: "center",
    marginTop: 8, marginBottom: 8,
  },

  // ── Message card ──
  msgCard: {
    width: "100%",
    backgroundColor: CARD_BG,
    borderWidth: 1.5, borderColor: CARD_BD,
    borderRadius: 18, padding: 18, paddingHorizontal: 20,
    marginBottom: 14, alignItems: "center",
  },
  msgText: {
    fontFamily: Fonts.serif, fontSize: 21,
    color: WHITE, textAlign: "center", lineHeight: 32,
  },
  msgEm: { fontStyle: "italic", color: "rgba(232,220,255,0.98)" },

  // ── Stats grid ──
  statsGrid: {
    width: "100%", flexDirection: "row",
    flexWrap: "wrap", gap: 10, marginBottom: 14,
  },
  statCard: {
    width: "48.5%",
    backgroundColor: CARD_BG,
    borderWidth: 1.5, borderColor: CARD_BD,
    borderRadius: 18, padding: 16, paddingHorizontal: 14,
  },
  statCardFull: {
    width: "100%",
  },
  statGreen: {
    borderColor: "rgba(80,220,130,0.25)",
    backgroundColor: "rgba(80,220,130,0.08)",
    marginBottom: 14,
  },
  statGold: {
    borderColor: "rgba(245,200,66,0.25)",
    backgroundColor: "rgba(245,200,66,0.08)",
  },
  statIcon: { fontSize: 22, marginBottom: 8 },
  statVal: {
    fontFamily: Fonts.serif, fontSize: 30,
    color: WHITE, lineHeight: 32, marginBottom: 4,
  },
  statLbl: {
    fontFamily: Fonts.bold, fontSize: 14,
    fontWeight: "700", letterSpacing: 1.5,
    textTransform: "uppercase", color: LABEL_WHITE,
  },
  interestSavedCaption: {
    fontFamily: Fonts.semiBold, fontSize: 15,
    fontWeight: "600", color: BODY_WHITE, marginTop: 6, lineHeight: 22,
  },

  // ── Dream goal card ──
  dreamCard: {
    width: "100%",
    backgroundColor: CARD_BG,
    borderWidth: 1.5, borderColor: "rgba(192,168,255,0.25)",
    borderRadius: 18, padding: 18, paddingHorizontal: 18,
    flexDirection: "row", alignItems: "flex-start", gap: 14,
    marginTop: 4,
    marginBottom: 14,
    zIndex: 2,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
  },
  dreamIconBox: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: "rgba(192,168,255,0.15)",
    alignItems: "center", justifyContent: "center", flexShrink: 0,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  dreamTextCol: {
    flex: 1,
    minWidth: 0,
  },
  dreamEyebrow: {
    fontFamily: Fonts.bold, fontSize: 14, fontWeight: "700",
    letterSpacing: 1.5, textTransform: "uppercase",
    color: "rgba(220,200,255,0.95)", marginBottom: 3,
  },
  dreamTitle: {
    fontFamily: Fonts.bold, fontSize: 20, fontWeight: "800",
    color: WHITE, marginBottom: 6,
    lineHeight: 26,
  },
  dreamSub: {
    fontFamily: Fonts.semiBold, fontSize: 15,
    color: BODY_WHITE, lineHeight: 23,
  },

  // ── Quote card ──
  quoteCard: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 16, padding: 16, paddingHorizontal: 20,
    marginBottom: 8, position: "relative", overflow: "hidden",
  },
  quoteOpenQuote: {
    position: "absolute", top: -8, left: 14,
    fontFamily: Fonts.serif, fontSize: 60,
    color: "rgba(192,168,255,0.20)", lineHeight: 68,
  },
  quoteText: {
    fontFamily: Fonts.semiBold, fontSize: 17, fontWeight: "500",
    color: BODY_WHITE, textAlign: "center", lineHeight: 27,
    paddingHorizontal: 4, marginTop: 10,
  },

  // ── Feedback banners ──
  feedbackBannerOk: {
    width: "100%", paddingVertical: 12, paddingHorizontal: 14,
    marginBottom: 12, borderRadius: 14,
    backgroundColor: "rgba(80,220,130,0.12)",
    borderWidth: 1.5, borderColor: "rgba(80,220,130,0.30)",
  },
  feedbackBannerOkText: {
    fontSize: 16, fontFamily: Fonts.semiBold,
    color: GREEN_XP, lineHeight: 22, textAlign: "center",
  },
  feedbackBannerErr: {
    width: "100%", paddingVertical: 12, paddingHorizontal: 14,
    marginBottom: 12, borderRadius: 14,
    backgroundColor: "rgba(180,40,40,0.12)",
    borderWidth: 1.5, borderColor: "rgba(180,40,40,0.30)",
  },
  feedbackBannerErrText: {
    fontSize: 16, fontFamily: Fonts.semiBold,
    color: "#FF9999", lineHeight: 22, textAlign: "center",
  },

  welcomeBackBanner: {
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderRadius: 18,
    backgroundColor: "rgba(245, 200, 66, 0.14)",
    borderWidth: 1.5,
    borderColor: "rgba(245, 200, 66, 0.38)",
  },
  welcomeBackTitle: {
    fontSize: 17,
    fontFamily: Fonts.bold,
    fontWeight: "800",
    color: WHITE,
    marginBottom: 6,
    lineHeight: 22,
  },
  welcomeBackSub: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    fontWeight: "600",
    color: BODY_WHITE,
    lineHeight: 22,
    marginBottom: 14,
  },
  welcomeBackBtn: {
    backgroundColor: AMBER,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  welcomeBackBtnText: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    fontWeight: "800",
    color: BG,
  },
  weeklySummaryCard: {
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderRadius: 18,
    backgroundColor: "rgba(192, 168, 255, 0.12)",
    borderWidth: 1.5,
    borderColor: "rgba(192, 168, 255, 0.34)",
  },
  weeklySummaryEyebrow: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: LABEL_WHITE,
    marginBottom: 4,
  },
  weeklySummaryTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    fontWeight: "800",
    color: WHITE,
    marginBottom: 10,
  },
  weeklySummaryStatsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  weeklySummaryStatPill: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1.2,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  weeklySummaryStatPillGold: {
    backgroundColor: "rgba(245,200,66,0.10)",
    borderColor: "rgba(245,200,66,0.34)",
  },
  weeklySummaryStatPillGreen: {
    backgroundColor: "rgba(80,220,130,0.10)",
    borderColor: "rgba(80,220,130,0.34)",
  },
  weeklySummaryStatValue: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    fontWeight: "800",
    color: WHITE,
    marginBottom: 2,
  },
  weeklySummaryStatLabel: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: LABEL_WHITE,
  },
  weeklySummarySub: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    fontWeight: "600",
    color: BODY_WHITE,
    lineHeight: 20,
  },

  // ── Day done banner ──
  dayDoneBanner: {
    width: "100%", flexDirection: "row", alignItems: "center",
    gap: 12, paddingVertical: 14, paddingHorizontal: 16,
    marginBottom: 14, borderRadius: 18,
    backgroundColor: "rgba(80,220,130,0.14)",
    borderWidth: 1.5, borderColor: "rgba(80,220,130,0.30)",
  },
  dayDoneBannerEmoji: { fontSize: 26 },
  dayDoneBannerTitle: {
    fontSize: 16, fontFamily: Fonts.bold, fontWeight: "800",
    color: WHITE, marginBottom: 3,
  },
  dayDoneBannerSub: {
    fontSize: 15, fontFamily: Fonts.semiBold, fontWeight: "600",
    color: BODY_WHITE, lineHeight: 22,
  },

  // ── Complete today CTA ──
  completeTodayCta: {
    width: "100%", minHeight: 56,
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 10,
    paddingVertical: 16, paddingHorizontal: 22,
    marginBottom: 14, borderRadius: 18,
    zIndex: 2,
    elevation: 4,
    backgroundColor: "rgba(192,168,255,0.28)",
    borderWidth: 2, borderColor: "rgba(255,255,255,0.45)",
  },
  completeTodayCtaText: {
    fontSize: 18, fontFamily: Fonts.bold, fontWeight: "800",
    color: WHITE, textAlign: "center", flexShrink: 1,
  },
  completeTodayCtaChev: {
    fontSize: 20, fontFamily: Fonts.bold, color: WHITE,
  },

  // ── Recommendations ──
  sectionLabel: {
    width: "100%", fontSize: 13, fontFamily: Fonts.bold,
    fontWeight: "700", letterSpacing: 2, textTransform: "uppercase",
    color: LABEL_WHITE, marginBottom: 5, marginTop: 6,
  },
  sectionSub: {
    width: "100%", fontSize: 15, fontFamily: Fonts.semiBold,
    color: BODY_WHITE, lineHeight: 22, marginBottom: 10,
  },
  consultScroll: { paddingBottom: 8, gap: 12, paddingRight: 8 },
  consultCard: {
    width: 218, borderRadius: 20, borderWidth: 2.5,
    padding: 16, backgroundColor: "#FFFFFF",
  },
  consultIcon: { fontSize: 28, marginBottom: 8 },
  consultQ: { fontSize: 16, fontFamily: Fonts.bold, color: "#000000", lineHeight: 22, marginBottom: 6 },
  consultD: { fontSize: 13, fontFamily: Fonts.semiBold, color: "#382808", lineHeight: 18, marginBottom: 12 },
  consultBtn: { borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16, alignItems: "flex-start" },
  consultBtnText: { color: "#FFFFFF", fontSize: 14, fontFamily: Fonts.bold },
});

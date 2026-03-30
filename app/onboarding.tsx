// ─── Onboarding — Duolingo-style, 9 screens, shows ONCE ──────────────────────
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useIsDark } from "@/context/ThemeContext";
import {
  KeyboardAvoidingView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  ScrollView,
  Animated,
  Easing,
  Platform,
  Image,
  Modal,
  TextInput,
  useWindowDimensions,
  Switch,
  Linking,
  Alert,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import Svg, { Circle, Ellipse, Path, Text as SvgText, Defs, RadialGradient, Stop, Rect } from "react-native-svg";
import {
  NestableScrollContainer,
  NestableDraggableFlatList,
  type RenderItemParams,
} from "react-native-draggable-flatlist";

import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { KeyboardStickyView, KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Audio } from "expo-av";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useDebts } from "@/context/DebtContext";
import { useGame } from "@/context/GameContext";
import { MonthYearField } from "@/components/MonthYearField";
import { DueDayPickerField } from "@/components/DueDayPickerField";
import { DexCoin } from "../components/DexCoin";
import { IntroDexSvg } from "../components/IntroDexSvg";
import { parseMonthYearString, validateIntroPromoMonthYear } from "@/lib/monthYear";
import {
  simulateDebtPayoffMonths,
  firstMonthInterestTotal as dreamFirstMonthInterest,
  monthsToSavingsGoal,
} from "@/lib/dreamGoalPayoffSim";
import { getRecommendations } from "@/lib/MonetizationRules";
import { AFFILIATE_URLS } from "@/lib/affiliateUrls";
import { withAppUtmParams } from "@/lib/utm";

// Local alias so this file can use warm contrast tokens.
// (Some tooling only recognizes WarmContrast on the default export.)
const WarmContrast = (Colors as any).WarmContrast as typeof Colors.WarmContrast;

const ONBOARDING_DEX = {
  introHero: { mood: "happyClassic", motion: "float" },
  howItWorks: { mood: "pathGuide", motion: "float" },
  step1Debts: { mood: "gotThis", motion: "float" },
  step3Method: { mood: "proud", motion: "nod" },
  step4Dream: { mood: "happyClassic", motion: "float" },
  commitIdle: { mood: "cheering", motion: "bounce" },
  commitReady: { mood: "congratulating", motion: "pulse" },
  completeCelebration: { mood: "celebrating", motion: "pulse" },
  completeCoach: { mood: "encouraging", motion: "float" },
  dailyFlow: { mood: "keepGoing", motion: "nod" },
  streakStart: { mood: "happy", motion: "bounce" },
} as const;


function BearIcon({ size = 46 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Circle cx={40} cy={40} r={30} fill="#EAA835" />
      <Circle cx={15} cy={24} r={9} fill="#D09828" />
      <Circle cx={65} cy={24} r={9} fill="#D09828" />
      <Ellipse cx={28} cy={36} rx={10} ry={11} fill="white" />
      <Ellipse cx={52} cy={36} rx={10} ry={11} fill="white" />
      <Circle cx={30} cy={37} r={6.5} fill="#1A0800" />
      <Circle cx={54} cy={37} r={6.5} fill="#1A0800" />
      <Circle cx={27} cy={34} r={2.5} fill="white" />
      <Circle cx={51} cy={34} r={2.5} fill="white" />
      <Path d="M33 52 Q40 60 47 52" stroke="#A86010" strokeWidth={2.2} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

function DexExcited({ size = 110 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 90 90">
      {/* feet */}
      <Ellipse cx={28} cy={82} rx={14} ry={7} fill="#7A3A0C" />
      <Ellipse cx={62} cy={82} rx={14} ry={7} fill="#7A3A0C" />
      {/* arms */}
      <Ellipse cx={16} cy={46} rx={9} ry={16} fill="#EAA835" transform="rotate(18,16,46)" />
      <Ellipse cx={74} cy={46} rx={9} ry={16} fill="#EAA835" transform="rotate(-18,74,46)" />
      {/* body */}
      <Circle cx={45} cy={44} r={33} fill="#EAA835" />
      {/* ears */}
      <Circle cx={20} cy={22} r={10} fill="#D09828" />
      <Circle cx={70} cy={22} r={10} fill="#D09828" />
      {/* white eye areas */}
      <Ellipse cx={33} cy={37} rx={13} ry={14} fill="white" />
      <Ellipse cx={57} cy={37} rx={13} ry={14} fill="white" />
      {/* pupils */}
      <Circle cx={35} cy={39} r={9} fill="#1A0800" />
      <Circle cx={59} cy={39} r={9} fill="#1A0800" />
      {/* highlights */}
      <Circle cx={31} cy={35} r={3.5} fill="white" />
      <Circle cx={55} cy={35} r={3.5} fill="white" />
      {/* smile */}
      <Path d="M27 62 Q45 76 63 62" stroke="#A86010" strokeWidth={2.8} fill="none" strokeLinecap="round" />
      {/* sparkles */}
      <SvgText x={8} y={16} fontSize={13} fill="#E8A020">✨</SvgText>
      <SvgText x={66} y={14} fontSize={11} fill="#E8A020">✨</SvgText>
      <SvgText x={60} y={26} fontSize={9} fill="#C07820">★</SvgText>
    </Svg>
  );
}

import { WelcomeMascot } from "@/components/WelcomeMascot";
import { FlameIcon } from "@/components/FlameIcon";
import { DebtForm } from "@/components/DebtForm";
import { NavyBackground } from "@/components/NavyBackground";
import {
  runStrategy,
  calendarDaysUntilPaymentDue,
  debtEligibleForPaymentReminder,
  getNextPaymentDueDate,
} from "@/lib/calculations";
import type { Debt, DebtType } from "@/lib/calculations";

/** US-style $ for summaries (ignore device locale so we never show $92.000). */
function fmtUsd0(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

const { width: SW, height: SH } = Dimensions.get("window");
// true on iOS/Android (runs off JS thread), false on web (react-native-web requirement)
const ND = Platform.OS !== "web";

// ─── AsyncStorage keys ────────────────────────────────────────────────────────
const AKEY_GOAL       = "@debtpath_onboarding_goal";
const AKEY_DEBT_RANGE = "@debtpath_onboarding_debt_range";
const AKEY_MOTIVATION = "@debtpath_onboarding_motivation";
const AKEY_STREAK     = "@debtpath_streak_goal_days";
const AKEY_STARTED    = "@debtpath_onboarding_started";

type Step = 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
const DAILY_SAVINGS_GOAL_KEY = "@debtpath_daily_savings_goal";

// ─── Color tokens ─────────────────────────────────────────────────────────────
const P = {
  text:      "#1A1A1A",
  sub:       "#6B4E30",
  green:     Colors.buttonGreen,
  greenDk:   Colors.buttonGreenDark,
  orange:    "#E8600A",
  orangeLight:"#FFF3E0",
  blue:      "#C07820",
  blueDk:    "#8A5010",
  gold:      "#D4A017",
  goldLight: "#FFFBE6",
  disabled:  "#B8BCC4",
};

// ─── Confetti ─────────────────────────────────────────────────────────────────
const CONFETTI_COLORS = ["#FF6B6B","#FFD93D","#6BCB77","#4D96FF","#FF6BFF","#E8850A","#00C9A7"];

function Confetti() {
  const particles = useRef(
    Array.from({ length: 30 }, (_, i) => ({
      x: (i / 30) * SW + Math.random() * (SW / 30),
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      anim: new Animated.Value(0),
      delay: Math.random() * 1300,
      size: 7 + Math.random() * 10,
      isRect: i % 3 === 0,
    }))
  ).current;

  useEffect(() => {
    particles.forEach((p) => {
      Animated.loop(
        Animated.timing(p.anim, {
          toValue: 1,
          duration: 1900 + Math.random() * 1400,
          delay: p.delay,
          useNativeDriver: ND,
        })
      ).start();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            left: p.x,
            width: p.size,
            height: p.size * (p.isRect ? 1.7 : 1),
            borderRadius: p.isRect ? 2 : p.size / 2,
            backgroundColor: p.color,
            opacity: p.anim.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 0.8, 0] }),
            transform: [
              { translateY: p.anim.interpolate({ inputRange: [0, 1], outputRange: [-16, SH + 20] }) },
              { rotate: p.anim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "540deg"] }) },
            ],
          }}
        />
      ))}
    </View>
  );
}

// ─── Typewriter hook ──────────────────────────────────────────────────────────
function useTypewriter(text: string, speed = 40) {
  const [display, setDisplay] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplay("");
    setDone(false);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplay(text.slice(0, i));
      if (i >= text.length) { clearInterval(iv); setDone(true); }
    }, speed);
    return () => clearInterval(iv);
  }, [text]);
  return { display, done };
}

// ─── Speech bubble (above Dex, tail points down) ─────────────────────────────
function SpeechBubble({ text, isDark }: { text: string; isDark: boolean }) {
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 280, useNativeDriver: ND }).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], alignSelf: "center" }}>
      <View style={[sb.bubble, { backgroundColor: isDark ? "#1A2535" : "#FFFFFF", borderColor: isDark ? "#2A3D55" : P.orange }]}>
        <Text style={[sb.text, { color: isDark ? "#FFFFFF" : P.text }]}>{text}</Text>
        <View style={[sb.tail, { borderTopColor: isDark ? "#1A2535" : "#FFFFFF" }]} />
        <View style={[sb.tailBorder, { borderTopColor: isDark ? "#2A3D55" : P.orange }]} />
      </View>
    </Animated.View>
  );
}
const sb = StyleSheet.create({
  bubble: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 14,
    maxWidth: SW - 60,
    position: "relative",
  },
  text: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 27,
  },
  tail: {
    position: "absolute",
    bottom: -12,
    alignSelf: "center",
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 13,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    zIndex: 2,
  },
  tailBorder: {
    position: "absolute",
    bottom: -14,
    alignSelf: "center",
    width: 0,
    height: 0,
    borderLeftWidth: 11,
    borderRightWidth: 11,
    borderTopWidth: 14,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    zIndex: 1,
  },
});

// ─── Orange progress bar ──────────────────────────────────────────────────────
function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = current / total;
  const widthAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(widthAnim, { toValue: pct, duration: 380, useNativeDriver: false }).start();
  }, [pct]);

  return (
    <View style={pb.track}>
      <Animated.View style={[pb.fill, { width: widthAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) }]} />
    </View>
  );
}
const pb = StyleSheet.create({
  track: { height: 10, backgroundColor: "#FFE0B2", borderRadius: 5, overflow: "hidden", marginHorizontal: 20, marginBottom: 4 },
  fill:  { height: "100%", backgroundColor: P.orange, borderRadius: 5 },
});

// ─── Option card — orange when selected ──────────────────────────────────────
function OptionCard({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        oc.card,
        {
          backgroundColor: selected ? P.orange : "#FFFFFF",
          borderColor: selected ? P.orange : "#E8E8E8",
          borderWidth: selected ? 2 : 1.5,
        },
      ]}
    >
      <Text style={[oc.label, { color: selected ? "#FFFFFF" : P.text }]}>
        {label}
      </Text>
      {selected && <Ionicons name="checkmark-circle" size={22} color="rgba(255,255,255,0.9)" />}
    </Pressable>
  );
}
const oc = StyleSheet.create({
  card:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: 14, paddingHorizontal: 18, paddingVertical: 16, marginBottom: 10 },
  label: { fontSize: 16, fontFamily: Fonts.semiBold, fontWeight: "600", flex: 1, lineHeight: 22 },
});

// ─── Green button ─────────────────────────────────────────────────────────────
function GreenBtn({ label, onPress, disabled, icon }: { label: string; onPress: () => void; disabled?: boolean; icon?: string }) {
  return (
    <Pressable onPress={disabled ? undefined : onPress} style={({ pressed }) => [{ opacity: disabled ? 0.42 : pressed ? 0.88 : 1 }]}>
      <LinearGradient
        colors={disabled ? ["#B8BCC4","#A0A5AD"] : [P.green, P.greenDk]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={btn.base}
      >
        <Text style={btn.label}>{label}</Text>
        {icon && <Ionicons name={icon as any} size={18} color="#fff" />}
      </LinearGradient>
    </Pressable>
  );
}

// ─── Blue button ──────────────────────────────────────────────────────────────
function BlueBtn({ label, onPress, disabled, icon }: { label: string; onPress: () => void; disabled?: boolean; icon?: string }) {
  return (
    <Pressable onPress={disabled ? undefined : onPress} style={({ pressed }) => [{ opacity: disabled ? 0.42 : pressed ? 0.88 : 1 }]}>
      <LinearGradient
        colors={disabled ? ["#B8BCC4","#A0A5AD"] : [P.blue, P.blueDk]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={btn.base}
      >
        <Text style={btn.label}>{label}</Text>
        {icon && <Ionicons name={icon as any} size={18} color="#fff" />}
      </LinearGradient>
    </Pressable>
  );
}

// ─── Orange button ────────────────────────────────────────────────────────────
function OrangeBtn({ label, onPress, disabled, icon }: { label: string; onPress: () => void; disabled?: boolean; icon?: string }) {
  return (
    <Pressable onPress={disabled ? undefined : onPress} style={({ pressed }) => [{ opacity: disabled ? 0.42 : pressed ? 0.88 : 1 }]}>
      <LinearGradient
        colors={disabled ? ["#B8BCC4","#A0A5AD"] : [P.orange, "#C46A04"]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={btn.base}
      >
        <Text style={btn.label}>{label}</Text>
        {icon && <Ionicons name={icon as any} size={18} color="#fff" />}
      </LinearGradient>
    </Pressable>
  );
}

const btn = StyleSheet.create({
  base:  { borderRadius: 16, paddingVertical: 16, paddingHorizontal: 24, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 56 },
  label: { color: "#fff", fontSize: 17, fontFamily: Fonts.extraBold, fontWeight: "800", letterSpacing: 0.3 },
});

// ─── Back button ──────────────────────────────────────────────────────────────
function BackBtn({ onPress, isDark, topPad = 0 }: { onPress: () => void; isDark: boolean; topPad?: number }) {
  const iconColor = isDark ? "rgba(255,255,255,0.8)" : "#0D3B66";
  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      style={{
        position: "absolute",
        top: topPad + 10,
        left: 12,
        zIndex: 50,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.07)",
        borderRadius: 20,
        paddingLeft: 6,
        paddingRight: 12,
        paddingVertical: 7,
      }}
    >
      <Ionicons name="chevron-back" size={22} color={iconColor} />
      <Text style={{ fontSize: 15, fontFamily: Fonts.semiBold, fontWeight: "600", color: iconColor }}>
        Back
      </Text>
    </Pressable>
  );
}

// ─── Main onboarding component ────────────────────────────────────────────────
export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { debts, addDebt, setExtraPayment, setOnboardingDone, setWelcomeSkipped } = useDebts();
  const params = useLocalSearchParams<{ restart?: string }>();

  useEffect(() => {
    if (params.restart === "1") {
      setShowSplash(false);
      setStep(1);
    }
  }, [params.restart]);
  const { triggerDex, recordPaymentForStreak } = useGame();
  const isDark = useIsDark();

  const [showSplash, setShowSplash] = useState(true);
  const [step, setStep] = useState<Step>(1);
  const [streakDays, setStreakDays] = useState<number | null>(null);
  const [dailyGoal, setDailyGoal] = useState(0.5);
  // Debt entered during onboarding — passed directly to strategy screen
  // so live numbers never depend on async context timing
  const [onboardingDebts, setOnboardingDebts] = useState<{
    name: string;
    balance: number;
    rate: number;
    minPay: number;
    debtType: DebtType;
    taxPaymentPlan?: boolean;
  }[]>([]);
  // Keep step-2 debt drafts when user navigates back/forward.
  const [onboardingDebtDrafts, setOnboardingDebtDrafts] = useState<any[]>([]);


  const slideAnim = useRef(new Animated.Value(0)).current;
  const bg = isDark ? "#080E14" : "#FFFFFF";
  const topPad = insets.top;
  const botPad = Math.max(insets.bottom, 16);

  const goTo = useCallback((next: Step, dir: "fwd" | "back" = "fwd") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const outTo  = dir === "fwd" ? -SW : SW;
    const inFrom = dir === "fwd" ?  SW : -SW;
    Animated.timing(slideAnim, { toValue: outTo, duration: 210, useNativeDriver: ND }).start(() => {
      slideAnim.setValue(inFrom);
      setStep(next);
      Animated.timing(slideAnim, { toValue: 0, duration: 210, useNativeDriver: ND }).start();
    });
  }, [slideAnim]);

  const ensurePushPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === "web") return false;
    try {
      const existing = await Notifications.getPermissionsAsync();
      if (existing.status === "granted") return true;
      if (!existing.canAskAgain) return false;
      const requested = await Notifications.requestPermissionsAsync();
      return requested.status === "granted";
    } catch {
      return false;
    }
  }, []);

  const handleSkipAll = async () => {
    await setWelcomeSkipped(true);
    await setOnboardingDone();
    router.replace("/(tabs)/dashboard");
  };

  const handleSaveDebt = useCallback(async (debt: Omit<Debt, "id" | "dateAdded">) => {
    await addDebt(debt);
    setOnboardingDebts((prev) => [
      ...prev,
      {
        name: debt.name,
        balance: debt.balance,
        rate: debt.apr,
        minPay: debt.minimumPayment,
        debtType: debt.debtType,
        taxPaymentPlan: debt.taxPaymentPlan,
      },
    ]);
  }, [addDebt]);

  const handleActivateDailyGoal = useCallback(async () => {
    const monthly = dailyGoal * 30;
    await setExtraPayment(monthly);
    await AsyncStorage.setItem(DAILY_SAVINGS_GOAL_KEY, String(dailyGoal));
    goTo(6);
  }, [dailyGoal, setExtraPayment, goTo]);

  const handleDay1Complete = async () => {
    // Completing Day 1 should count as a streak day (XP comes from streak logic, not a flat onboarding bonus).
    recordPaymentForStreak();
    await setWelcomeSkipped(false);
    await setOnboardingDone();
    triggerDex("celebrating");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace("/day-complete");
  };

  const handleCommitStreak = async () => {
    if (!streakDays) return;
    await AsyncStorage.setItem(AKEY_STREAK, String(streakDays));
    await setWelcomeSkipped(false);
    await setOnboardingDone();
    triggerDex("celebrating");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace("/day-complete");
  };

  const sp = { isDark, bg, topPad, botPad, goTo, handleSkipAll };

  if (showSplash) return <TrueSplashScreen onDone={() => setShowSplash(false)} />;

  return (
    <View style={{ flex: 1, backgroundColor: bg, overflow: "hidden" }}>
      <Animated.View style={{ flex: 1, transform: [{ translateX: slideAnim }] }}>

        {step === 1 && <SplashScreen {...sp} />}

        {step === 1.5 && (
          <HowItWorksScreen
            {...sp}
            onNext={() => goTo(2)}
            onBack={() => goTo(1, "back")}
          />
        )}

        {step === 2 && (
          <DebtEntryScreen
            {...sp}
            debts={debts}
            onSave={handleSaveDebt}
            onContinue={() => goTo(3)}
            onBack={() => goTo(1.5, "back")}
            initialDrafts={onboardingDebtDrafts}
            onDraftsChange={setOnboardingDebtDrafts}
          />
        )}

        {step === 3 && (
          <PayoffStrategyScreen
            {...sp}
            onboardingDebts={onboardingDebts}
            onSelect={(_strategy) => { goTo(4); }}
            onBack={() => goTo(2, "back")}
          />
        )}

        {step === 4 && (
          <DreamGoalScreen
            {...sp}
            debts={debts}
            onComplete={async (goalName, goalCost, extraPerDaySelected) => {
              try {
                await AsyncStorage.setItem("@debtpath_dream_goal_name", goalName);
                await AsyncStorage.setItem("@debtpath_dream_goal_cost", goalCost);
                if (typeof extraPerDaySelected === "number" && Number.isFinite(extraPerDaySelected)) {
                  const monthlyExtra = Math.round(extraPerDaySelected * 30.44);
                  await setExtraPayment(monthlyExtra);
                  await AsyncStorage.setItem(DAILY_SAVINGS_GOAL_KEY, String(extraPerDaySelected));
                }
                goTo(5);
              } catch (e) {
                console.log("Error saving dream goal", e);
                goTo(5);
              }
            }}
            onBack={() => goTo(3, "back")}
          />
        )}

        {step === 5 && (
          <CommitScreen
            {...sp}
            debts={debts}
            onCommit={handleDay1Complete}
            onBack={() => goTo(4, "back")}
          />
        )}

        {step === 6 && (
          <CoachSettingsScreen {...sp}
            onNext={async (email, push, sound) => {
              try {
                let pushEnabled = push;
                if (push) {
                  const existing = await Notifications.getPermissionsAsync().catch(() => null);
                  const granted = await ensurePushPermission();
                  if (!granted) {
                    pushEnabled = false;
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
                    if (Platform.OS !== "web") {
                      Alert.alert(
                        "Notifications are off",
                        existing && existing.canAskAgain === false
                          ? "Notifications are blocked for this app. Enable them in device Settings to get reminders."
                          : "Notifications were not enabled. You can turn them on later in Settings.",
                        [
                          { text: "Not now", style: "cancel" },
                          {
                            text: "Open Settings",
                            onPress: () => {
                              if (Platform.OS !== "web") {
                                Notifications.getPermissionsAsync().then(() => {}).catch(() => {});
                                Linking.openSettings().catch(() => {});
                              }
                            },
                          },
                        ]
                      );
                    }
                  }
                }
                await AsyncStorage.setItem("@debtpath_coach_email", email.toString());
                await AsyncStorage.setItem("@debtpath_coach_push", pushEnabled.toString());
                await AsyncStorage.setItem("@debtpath_coach_sound", sound.toString());
                // Keep onboarding sound preference aligned with SoundManager usage across app screens.
                await AsyncStorage.setItem("@debtpath_sound_enabled", sound.toString());
                goTo(7);
              } catch (e) {
                console.log("Error saving coach settings", e);
                goTo(7);
              }
            }}
            onBack={() => goTo(5, "back")}
          />
        )}

        {step === 7 && (
          <StreakBornScreen {...sp}
            onNext={() => goTo(8)}
            onBack={() => goTo(6, "back")}
          />
        )}

        {step === 8 && (
          <StreakGoalScreen {...sp}
            streakDays={streakDays}
            onSelect={setStreakDays}
            onCommit={handleCommitStreak}
            onBack={() => goTo(7, "back")}
          />
        )}

      </Animated.View>

    </View>
  );
}

// ─── Screen 1: Splash ─────────────────────────────────────────────────────────
function DexWelcome({ size = 188 }: { size?: number }) {
  const scale = size / 188;
  const h = Math.round(200 * scale);
  return (
    <Svg width={size} height={h} viewBox="0 0 200 212">
      {/* feet */}
      <Ellipse cx={73}  cy={199} rx={31} ry={14} fill="#7A3A0C" />
      <Ellipse cx={127} cy={199} rx={31} ry={14} fill="#7A3A0C" />
      {/* arms */}
      <Ellipse cx={16}  cy={134} rx={17} ry={26} fill="#C88A20" transform="rotate(9,16,134)" />
      <Ellipse cx={184} cy={134} rx={17} ry={26} fill="#C88A20" transform="rotate(-9,184,134)" />
      {/* body */}
      <Circle cx={100} cy={112} r={75} fill="#EAA835" />
      {/* body shading */}
      <Ellipse cx={100} cy={155} rx={56} ry={32} fill="#C07820" opacity={0.27} />
      {/* ears */}
      <Circle cx={37}  cy={67}  r={22} fill="#D09828" />
      <Circle cx={163} cy={67}  r={22} fill="#D09828" />
      {/* eye whites */}
      <Ellipse cx={77}  cy={100} rx={22} ry={25} fill="white" />
      <Ellipse cx={123} cy={100} rx={22} ry={25} fill="white" />
      {/* pupils */}
      <Circle cx={80}  cy={102} r={14} fill="#1A0800" />
      <Circle cx={126} cy={102} r={14} fill="#1A0800" />
      {/* highlights */}
      <Circle cx={74}  cy={96}  r={5.5} fill="white" />
      <Circle cx={120} cy={96}  r={5.5} fill="white" />
      {/* nose */}
      <Circle cx={100} cy={123} r={3.5} fill="#A86010" />
      {/* smile */}
      <Path d="M85 134 Q100 151 115 134" stroke="#A86010" strokeWidth={3.2} fill="none" strokeLinecap="round" />
      {/* cheek blush */}
      <Ellipse cx={61}  cy={115} rx={11} ry={7} fill="#E87040" opacity={0.22} />
      <Ellipse cx={139} cy={115} rx={11} ry={7} fill="#E87040" opacity={0.22} />
    </Svg>
  );
}


function DexCoach({ size = 200 }: { size?: number }) {
  return (
    <Svg viewBox="0 0 140 140" width={size} height={size}>
      {/* feet shadows */}
      <Ellipse cx={52}  cy={128} rx={18} ry={7}  fill="#9A6010" opacity={0.35} />
      <Ellipse cx={90}  cy={128} rx={18} ry={7}  fill="#9A6010" opacity={0.35} />
      {/* arms */}
      <Ellipse cx={22}  cy={72}  rx={13} ry={22} fill="#C8880E" transform="rotate(20,22,72)" />
      <Ellipse cx={118} cy={68}  rx={13} ry={22} fill="#C8880E" transform="rotate(-20,118,68)" />
      {/* waving hand raised (right side) */}
      <Ellipse cx={118} cy={44}  rx={11} ry={14} fill="#C8880E" transform="rotate(-30,118,44)" />
      {/* body */}
      <Circle cx={70} cy={70} r={50} fill="#D4900A" />
      {/* belly shading */}
      <Ellipse cx={70} cy={90} rx={34} ry={18} fill="#B87010" opacity={0.2} />
      {/* ears */}
      <Circle cx={30}  cy={30} r={15} fill="#C07820" />
      <Circle cx={110} cy={30} r={15} fill="#C07820" />
      {/* eye whites */}
      <Ellipse cx={52} cy={60} rx={20} ry={22} fill="white" />
      <Ellipse cx={88} cy={60} rx={20} ry={22} fill="white" />
      {/* pupils */}
      <Circle cx={54} cy={63} r={14} fill="#1A0800" />
      <Circle cx={90} cy={63} r={14} fill="#1A0800" />
      {/* eye shine */}
      <Circle cx={49} cy={56} r={5} fill="white" />
      <Circle cx={85} cy={56} r={5} fill="white" />
      {/* blush */}
      <Ellipse cx={34}  cy={80} rx={10} ry={6} fill="#E8823A" opacity={0.28} />
      <Ellipse cx={106} cy={80} rx={10} ry={6} fill="#E8823A" opacity={0.28} />
      {/* smile */}
      <Path d="M46 88 Q70 112 94 88" stroke="#8A5010" strokeWidth={5} fill="none" strokeLinecap="round" />
      {/* coin on left arm */}
      <Circle cx={22} cy={88} r={15} fill="#F0C030" stroke="#C09020" strokeWidth={2} />
      <SvgText x={16} y={94} fontSize={14} fill="#111111" fontFamily="sans-serif" fontWeight="bold">$</SvgText>
    </Svg>
  );
}

// ─── True Splash Screen (navy/gold brand splash, auto-advances) ───────────────
function TrueSplashScreen({ onDone }: { onDone: () => void }) {
  const insets = useSafeAreaInsets();

  const iconAnim  = useRef(new Animated.Value(0)).current;
  const nameAnim  = useRef(new Animated.Value(0)).current;
  const subAnim   = useRef(new Animated.Value(0)).current;
  const badgeAnim = useRef(new Animated.Value(0)).current;
  const dotsAnim  = useRef(new Animated.Value(0)).current;
  const byAnim    = useRef(new Animated.Value(0)).current;
  const dot1      = useRef(new Animated.Value(0)).current;
  const dot2      = useRef(new Animated.Value(0)).current;
  const dot3      = useRef(new Animated.Value(0)).current;
  const bobAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // icon pop — spring like CSS cubic-bezier(.34,1.56,.64,1) with delay 100ms
    Animated.spring(iconAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 7, delay: 100 }).start();
    // name fadeUp — 550ms delay 500ms
    Animated.timing(nameAnim,  { toValue: 1, duration: 550, delay: 500,  useNativeDriver: true, easing: Easing.out(Easing.quad) }).start();
    // sub fadeUp — delay 650ms
    Animated.timing(subAnim,   { toValue: 1, duration: 500, delay: 650,  useNativeDriver: true, easing: Easing.out(Easing.quad) }).start();
    // badge fadeUp — delay 800ms
    Animated.timing(badgeAnim, { toValue: 1, duration: 500, delay: 800,  useNativeDriver: true, easing: Easing.out(Easing.quad) }).start();
    // dots fadeUp — delay 1100ms
    Animated.timing(dotsAnim,  { toValue: 1, duration: 400, delay: 1100, useNativeDriver: true, easing: Easing.out(Easing.quad) }).start();
    // by line fadeUp — delay 1300ms
    Animated.timing(byAnim,    { toValue: 1, duration: 400, delay: 1300, useNativeDriver: true, easing: Easing.out(Easing.quad) }).start();
    // dex bob — 2.6s loop, starts at 900ms
    setTimeout(() => {
      Animated.loop(Animated.sequence([
        Animated.timing(bobAnim, { toValue: 1, duration: 1170, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(bobAnim, { toValue: 0, duration: 1430, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])).start();
    }, 900);
    // dot pulse
    const pulseDot = (a: Animated.Value, delay: number) =>
      Animated.loop(Animated.sequence([
        Animated.delay(delay),
        Animated.timing(a, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(a, { toValue: 0, duration: 750, useNativeDriver: true }),
      ])).start();
    pulseDot(dot1, 0);
    pulseDot(dot2, 250);
    pulseDot(dot3, 500);
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, []);

  const iconScale  = iconAnim.interpolate({ inputRange: [0,1], outputRange: [0.5, 1] });
  const iconRotate = iconAnim.interpolate({ inputRange: [0,1], outputRange: ["-10deg","0deg"] });
  const nameTY     = nameAnim.interpolate({ inputRange: [0,1], outputRange: [10, 0] });
  const subTY      = subAnim.interpolate({ inputRange: [0,1], outputRange: [10, 0] });
  const badgeTY    = badgeAnim.interpolate({ inputRange: [0,1], outputRange: [10, 0] });
  const dotsTY     = dotsAnim.interpolate({ inputRange: [0,1], outputRange: [10, 0] });
  const byTY       = byAnim.interpolate({ inputRange: [0,1], outputRange: [10, 0] });
  const bobY       = bobAnim.interpolate({ inputRange: [0,1], outputRange: [0, -6] });
  const dotStyle   = (a: Animated.Value) => ({
    opacity:   a.interpolate({ inputRange: [0,1], outputRange: [0.35, 1] }),
    transform: [{ scale: a.interpolate({ inputRange: [0,1], outputRange: [1, 1.5] }) }],
  });

  return (
    // NavyBackground handles: gradient + 28px grid texture + 3 fixed orbs
    // Content is rendered inside NavyBackground's content layer (z-index:1 equiv.)
    <NavyBackground>
      {/* ── Main content ── */}
      <View style={{
        flex:1, alignItems:"center", justifyContent:"center",
        paddingHorizontal:24, paddingTop:insets.top + 20,
        paddingBottom:Math.max(insets.bottom, 16) + 60,
      }}>
        {/* Icon tile */}
        <Animated.View style={{
          width:144, height:144, borderRadius:36,
          alignItems:"center", justifyContent:"center",
          marginBottom:30,
          shadowColor:"#B86A00", shadowOpacity:0.5, shadowRadius:28, shadowOffset:{width:0,height:12},
          elevation:16,
          transform:[{ scale: iconScale }, { rotate: iconRotate }],
        }}>
          <LinearGradient
            colors={["#F5C842","#E8A020","#B86A00"]}
            start={{ x:0.15, y:0 }} end={{ x:0.85, y:1 }}
            style={{ width:144, height:144, borderRadius:36, alignItems:"center", justifyContent:"center" }}
          >
            {/* inset highlight */}
            <View style={{
              position:"absolute", inset:0, borderRadius:36,
              borderTopWidth:2, borderTopColor:"rgba(255,255,255,0.35)",
              borderBottomWidth:2, borderBottomColor:"rgba(0,0,0,0.15)",
            }} />
            <Animated.View style={{ transform:[{ translateY: bobY }] }}>
              <Svg viewBox="0 0 90 90" width={98} height={98}>
                <Ellipse cx={28} cy={82} rx={13} ry={6} fill="#7A3A0C" opacity={0.6} />
                <Ellipse cx={62} cy={82} rx={13} ry={6} fill="#7A3A0C" opacity={0.6} />
                <Ellipse cx={16} cy={46} rx={9} ry={17} fill="#D4900A" rotation={20} originX={16} originY={46} />
                <Ellipse cx={74} cy={46} rx={9} ry={17} fill="#D4900A" rotation={-20} originX={74} originY={46} />
                <Circle cx={45} cy={44} r={32} fill="#EAA835" />
                <Ellipse cx={45} cy={62} rx={24} ry={13} fill="#C07820" opacity={0.2} />
                <Circle cx={20} cy={22} r={10} fill="#D09828" />
                <Circle cx={70} cy={22} r={10} fill="#D09828" />
                <Ellipse cx={33} cy={37} rx={13} ry={14} fill="white" />
                <Ellipse cx={57} cy={37} rx={13} ry={14} fill="white" />
                <Circle cx={35} cy={39} r={9} fill="#1A0800" />
                <Circle cx={59} cy={39} r={9} fill="#1A0800" />
                <Circle cx={31} cy={34} r={3.5} fill="white" />
                <Circle cx={55} cy={34} r={3.5} fill="white" />
                <Path d="M22 58 Q45 80 68 58" stroke="#A86010" strokeWidth={4} fill="none" strokeLinecap="round" />
                <Ellipse cx={22} cy={52} rx={7} ry={4} fill="#E8823A" opacity={0.3} />
                <Ellipse cx={68} cy={52} rx={7} ry={4} fill="#E8823A" opacity={0.3} />
                <Circle cx={71} cy={63} r={10} fill="#F0C030" stroke="#C09020" strokeWidth={1.5} />
                <SvgText x={67} y={68} fontSize={10} fill="#111111" fontWeight="900">$</SvgText>
                <SvgText x={3}  y={14} fontSize={11}>⭐</SvgText>
                <SvgText x={62} y={12} fontSize={9}>✨</SvgText>
              </Svg>
            </Animated.View>
          </LinearGradient>
        </Animated.View>

        {/* App name — "Debt" white + "Path" gold, 48px Nunito Black */}
        <Animated.View style={{ flexDirection:"row", alignItems:"baseline", opacity: nameAnim, transform:[{ translateY: nameTY }] }}>
          <Text style={{ fontFamily: Fonts.black, fontSize: 48, color:"#ffffff", letterSpacing:-1.92, lineHeight:52 }}>Debt</Text>
          <Text style={{ fontFamily: Fonts.black, fontSize: 48, color:"#F5C030", letterSpacing:-1.92, lineHeight:52 }}>Path</Text>
        </Animated.View>

        {/* Subtitle */}
        <Animated.Text style={{
          fontFamily: Fonts.bold, fontSize: 13,
          color: "rgba(255,255,255,0.5)", letterSpacing: 1.5,
          textTransform: "uppercase", marginTop: 8, textAlign: "center",
          opacity: subAnim, transform:[{ translateY: subTY }],
        }}>
          Debt Payoff Planner &amp; Tracker
        </Animated.Text>

        {/* XP badge */}
        <Animated.View style={{
          flexDirection:"row", alignItems:"center",
          backgroundColor:"rgba(58,122,16,0.25)",
          borderWidth:1.5, borderColor:"rgba(58,122,16,0.5)",
          borderRadius:20, paddingVertical:5, paddingHorizontal:14, marginTop:16,
          opacity: badgeAnim, transform:[{ translateY: badgeTY }],
        }}>
          <Text style={{ fontFamily: Fonts.extraBold, fontSize:11.5, color:"#7FCC30", letterSpacing:1, textTransform:"uppercase" }}>
            ⚡ Level Up Your Finances
          </Text>
        </Animated.View>
      </View>

      {/* ── Loading dots ── */}
      <Animated.View style={{
        position:"absolute", bottom: Math.max(insets.bottom,16)+26,
        left:0, right:0, flexDirection:"row", justifyContent:"center", gap:7,
        opacity: dotsAnim, transform:[{ translateY: dotsTY }],
      }}>
        {[dot1,dot2,dot3].map((a,i) => (
          <Animated.View key={i} style={[
            { width:7, height:7, borderRadius:3.5, backgroundColor:"rgba(245,192,48,0.4)" },
            dotStyle(a),
          ]} />
        ))}
      </Animated.View>

      {/* ── By CuraDebt ── */}
      <Animated.Text style={{
        position:"absolute", bottom: Math.max(insets.bottom,8)+4, left:0, right:0,
        textAlign:"center", fontFamily: Fonts.bold, fontSize:9,
        color:"rgba(255,255,255,0.22)", letterSpacing:2.2, textTransform:"uppercase",
        opacity: byAnim, transform:[{ translateY: byTY }],
      }}>
        by CuraDebt · Since 2001
      </Animated.Text>
    </NavyBackground>
  );
}


/** Falling confetti — matches intro HTML (`48` particles, multi-color). */
function IntroPhoneConfetti({ width, height }: { width: number; height: number }) {
  const colors = ["#D08A10", "#F2C040", "#C03040", "#4A2BA0", "#1D9E6A", "#2D5BE3"];
  const particles = useRef(
    Array.from({ length: 48 }, (_, i) => ({
      x: Math.random() * width,
      color: colors[i % colors.length],
      anim: new Animated.Value(0),
      delay: Math.random() * 4000,
      w: 5 + Math.random() * 6,
      h: 7 + Math.random() * 8,
      rnd: Math.random(),
    }))
  ).current;
  useEffect(() => {
    particles.forEach((p) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(p.delay),
          Animated.timing(p.anim, {
            toValue: 1,
            duration: 2000 + Math.random() * 2500,
            useNativeDriver: true,
            easing: Easing.linear,
          }),
          Animated.timing(p.anim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    });
  }, [particles]);
  return (
    <View style={{ position: "absolute", top: 0, left: 0, width, height, overflow: "hidden" }} pointerEvents="none">
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            left: p.x,
            top: -12,
            width: p.w,
            height: p.h,
            borderRadius: p.rnd > 0.5 ? 999 : 2,
            backgroundColor: p.color,
            opacity: p.anim.interpolate({ inputRange: [0, 0.1, 0.85, 1], outputRange: [0, 1, 0.8, 0] }),
            transform: [
              { translateY: p.anim.interpolate({ inputRange: [0, 1], outputRange: [0, height + 24] }) },
              { rotate: p.anim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "720deg"] }) },
            ],
          }}
        />
      ))}
    </View>
  );
}

function SplashScreen({ isDark: _isDark, bg: _bg, topPad: _topPad, botPad, goTo, handleSkipAll }: any) {
  useEffect(() => {
    AsyncStorage.setItem(AKEY_STARTED, "true").catch(() => {});
  }, []);

  const insets = useSafeAreaInsets();
  const { width: W, height: H } = useWindowDimensions();
  const listRef = useRef<FlatList>(null);
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /** Full device width — the old `Math.min(280, …)` was for desktop mockups only (“phone in phone” on real devices). */
  const pad = 0;
  const frameW = W;
  const innerW = frameW - pad * 2;
  /** Full window height — intro draws edge-to-edge under the status bar (no top inset strip). */
  const innerH = H;

  const chipFloatA = useRef(new Animated.Value(0)).current;
  const chipFloatB = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const mk = (v: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(v, { toValue: 1, duration: 1500, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
          Animated.timing(v, { toValue: 0, duration: 1500, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        ])
      );
    const a = mk(chipFloatA, 0);
    const b = mk(chipFloatB, 400);
    a.start();
    b.start();
    return () => {
      a.stop();
      b.stop();
    };
  }, [chipFloatA, chipFloatB]);
  const chipTy = (v: Animated.Value) =>
    v.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });

  /** Responsive headline/body — bumped for readability on Get Started slides. */
  const headlinePx = Math.round(Math.min(58, Math.max(38, innerW * 0.058)));
  const bodyPx = Math.round(Math.min(19, Math.max(17, innerW * 0.022 + 14)));
  const ctaWidth = Math.min(380, innerW * 0.88);
  const ctaLeft = (innerW - ctaWidth) / 2;
  /** Space for persistent dots + CTA + sign-in so centered column doesn’t sit under them. */
  const centerBottomPad = 138 + botPad;

  /** Top offset for slide 1 chips & slide 2 badges (same vertical inset below status bar). */
  const slide1ChipTop = insets.top + 36;
  const slide2BadgeTop = slide1ChipTop;
  const slide3RewardTop = insets.top + 40;

  const restartAutoAdvance = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive((i) => {
        const next = (i + 1) % 3;
        listRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4000);
  }, []);

  useEffect(() => {
    restartAutoAdvance();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [restartAutoAdvance]);

  const onScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      const i = Math.round(x / innerW);
      setActive(Math.min(2, Math.max(0, i)));
      restartAutoAdvance();
    },
    [innerW, restartAutoAdvance]
  );

  const goToSlide = useCallback(
    (i: number) => {
      setActive(i);
      listRef.current?.scrollToIndex({ index: i, animated: true });
      restartAutoAdvance();
    },
    [restartAutoAdvance]
  );

  const slides = useMemo(
    () =>
      [
        {
          key: "hook",
          bg: ["#1A1430", "#2D1A60", "#1A0830"] as const,
          loc: [0, 0.55, 1] as const,
          kicker: "Your debt. Your game.",
          line1: "Pay off debt",
          line2Before: "like a ",
          line2Em: "pro",
          body: "Every payment earns XP. Build streaks. Level up. Watch your debt disappear.",
          dex: "pump" as const,
        },
        {
          key: "celebrate",
          bg: ["#3A1A08", "#8A4010", "#2A0C00"] as const,
          loc: [0, 0.45, 1] as const,
          kicker: "Every milestone counts.",
          line1: "Celebrate every",
          line2Before: "",
          line2Em: "win",
          body: "Hit a 7-day streak? Full celebration. Pay off a debt? Big moment. You'll feel it.",
          dex: "party" as const,
        },
        {
          key: "rewards",
          bg: ["#0A1830", "#1A3060", "#080C18"] as const,
          loc: [0, 0.52, 1] as const,
          kicker: "Always something ahead.",
          line1: "See your rewards",
          line2Before: "",
          line2Em: "coming",
          body: "Your next milestone is always visible. Unlock bigger rewards the longer you stay consistent.",
          dex: "proud" as const,
        },
      ] as const,
    []
  );

  const renderSlide = useCallback(
    ({ item, index }: { item: (typeof slides)[number]; index: number }) => {
      const isP2 = item.dex === "party";
      const isP3 = item.dex === "proud";
      const dexSize = Math.min(160, innerW * 0.42);
      const rewardW = Math.min(420, innerW * 0.88);
      const rewardLeft = (innerW - rewardW) / 2;

      return (
        <View style={{ width: innerW, height: innerH }}>
          <LinearGradient
            colors={[...item.bg]}
            locations={[...item.loc]}
            start={{ x: 0.15, y: 0 }}
            end={{ x: 0.85, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Slide 1 chips — just below status bar / left&right 8%, floatUD 8px */}
          {index === 0 && (
            <>
              <Animated.View
                style={[
                  {
                    position: "absolute",
                    top: slide1ChipTop,
                    left: innerW * 0.08,
                    zIndex: 10,
                    backgroundColor: "#FFF5E0",
                    paddingHorizontal: 18,
                    paddingVertical: 8,
                    borderRadius: 30,
                  },
                  { transform: [{ translateY: chipTy(chipFloatA) }] },
                ]}
              >
                <Text style={{ fontFamily: Fonts.bold, fontSize: 15, color: "#9A5800" }}>🔥 12 Day Streak</Text>
              </Animated.View>
              <Animated.View
                style={[
                  {
                    position: "absolute",
                    top: slide1ChipTop,
                    right: innerW * 0.08,
                    zIndex: 10,
                    backgroundColor: "#EDE7F6",
                    paddingHorizontal: 18,
                    paddingVertical: 8,
                    borderRadius: 30,
                  },
                  { transform: [{ translateY: chipTy(chipFloatB) }] },
                ]}
              >
                <Text style={{ fontFamily: Fonts.bold, fontSize: 15, color: "#4A2BA0" }}>⚡ +50 XP</Text>
              </Animated.View>
            </>
          )}

          {isP2 && <IntroPhoneConfetti width={innerW} height={innerH} />}
          {/* Slide 2 badges — same tight top / left&right 7% */}
          {isP2 && (
            <>
              <Animated.View
                style={[
                  { position: "absolute", top: slide2BadgeTop, left: innerW * 0.07, zIndex: 10 },
                  { transform: [{ translateY: chipTy(chipFloatA) }] },
                ]}
              >
                <View
                  style={{
                    backgroundColor: "rgba(242,192,64,0.2)",
                    borderWidth: 1,
                    borderColor: "rgba(242,192,64,0.35)",
                    borderRadius: 14,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                  }}
                >
                  <Text style={{ fontFamily: Fonts.bold, fontSize: 14, color: "#F2C040", textAlign: "center" }}>
                    🔥 7 Days!
                  </Text>
                  <Text style={{ fontFamily: Fonts.bold, fontSize: 12, color: "rgba(242,192,64,0.7)", marginTop: 2, textAlign: "center" }}>
                    +175 XP
                  </Text>
                </View>
              </Animated.View>
              <Animated.View
                style={[
                  { position: "absolute", top: slide2BadgeTop, right: innerW * 0.07, zIndex: 10 },
                  { transform: [{ translateY: chipTy(chipFloatB) }] },
                ]}
              >
                <View
                  style={{
                    backgroundColor: "rgba(32,160,96,0.18)",
                    borderWidth: 1,
                    borderColor: "rgba(40,200,100,0.3)",
                    borderRadius: 14,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                  }}
                >
                  <Text style={{ fontFamily: Fonts.bold, fontSize: 14, color: "#40E090", textAlign: "center" }}>
                    ✓ Debt Gone!
                  </Text>
                  <Text style={{ fontFamily: Fonts.bold, fontSize: 12, color: "rgba(40,200,100,0.7)", marginTop: 2, textAlign: "center" }}>
                    +500 XP
                  </Text>
                </View>
              </Animated.View>
            </>
          )}

          {/* Slide 3 reward list — top 10%, width min(420, 88%) */}
          {isP3 && (
            <View
              style={{
                position: "absolute",
                top: slide3RewardTop,
                left: rewardLeft,
                width: rewardW,
                zIndex: 10,
                gap: 8,
              }}
            >
              {[
                { mark: "✓", t: "First Payment", xp: "+150 XP", done: true },
                { mark: "✓", t: "3-Day Streak", xp: "+100 XP", done: true },
                { mark: "→", t: "7-Day Streak", xp: "+175 XP", next: true },
                { mark: " ", t: "30-Day Streak", xp: "+525 XP", dim: true },
                { mark: " ", t: "Debt Free 🏆", xp: "+500 XP", dim: true },
              ].map((row, ri) => (
                <View
                  key={ri}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 12,
                    backgroundColor: row.done
                      ? "rgba(40,200,100,0.14)"
                      : row.next
                        ? "rgba(242,192,64,0.18)"
                        : "rgba(255,255,255,0.05)",
                    borderWidth: row.next ? 1 : 0,
                    borderColor: "rgba(242,192,64,0.3)",
                  }}
                >
                  <Text style={{ fontFamily: Fonts.bold, fontSize: 15, color: row.dim ? "rgba(255,255,255,0.35)" : "#fff", width: 20 }}>
                    {row.mark}
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      fontFamily: Fonts.bold,
                      fontSize: 15,
                      color: row.dim ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.92)",
                    }}
                  >
                    {row.t}
                  </Text>
                  <Text
                    style={{
                      fontFamily: Fonts.bold,
                      fontSize: 13,
                      overflow: "hidden",
                      color: row.done ? "#40E090" : row.next ? "#F2C040" : "rgba(255,255,255,0.25)",
                      backgroundColor: row.done
                        ? "rgba(40,200,100,0.2)"
                        : row.next
                          ? "rgba(242,192,64,0.25)"
                          : "rgba(255,255,255,0.07)",
                      paddingHorizontal: 10,
                      paddingVertical: 3,
                      borderRadius: 8,
                    }}
                  >
                    {row.xp}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Centered dex + text (HTML `.slide`: flex center; `.dex-wrap` margin-bottom 16; s3 dex +40 margin-top) */}
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingBottom: centerBottomPad,
              paddingTop: 8,
            }}
          >
            <View style={{ marginBottom: 16, marginTop: isP3 ? 96 : 0, alignItems: "center" }}>
              <IntroDexSvg variant={(index + 1) as 1 | 2 | 3} size={dexSize} />
            </View>

            <View style={{ maxWidth: 480, width: "100%", paddingHorizontal: 24 }}>
              <Text
                style={{
                  fontFamily: Fonts.bold,
                  fontSize: 13,
                  letterSpacing: 2.5,
                  textTransform: "uppercase",
                  color: "rgba(242,192,64,0.7)",
                  marginBottom: 10,
                  textAlign: "center",
                }}
              >
                {item.kicker}
              </Text>
              <Text style={{ textAlign: "center", marginBottom: 16 }}>
                <Text
                  style={{
                    fontFamily: Fonts.serif,
                    fontSize: headlinePx,
                    color: "#FFFFFF",
                    lineHeight: headlinePx * 1.2,
                  }}
                >
                  {item.line1}
                  {"\n"}
                  {item.line2Before}
                  <Text style={{ fontFamily: Fonts.serif, fontSize: headlinePx, fontStyle: "italic", color: "#F2C040" }}>
                    {item.line2Em}
                  </Text>
                </Text>
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.semiBold,
                  fontSize: bodyPx,
                  lineHeight: bodyPx * 1.7,
                  color: "rgba(255,255,255,0.55)",
                  textAlign: "center",
                }}
              >
                {item.body}
              </Text>
            </View>
          </View>
        </View>
      );
    },
    [innerW, innerH, centerBottomPad, headlinePx, bodyPx, slide1ChipTop, slide2BadgeTop, slide3RewardTop, chipFloatA, chipFloatB, chipTy]
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#1A1430" }}>
      <View style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            width: "100%",
            backgroundColor: "#1C1F2E",
            padding: pad,
          }}
        >
        <View
          style={{
            flex: 1,
            width: innerW,
            height: innerH,
            borderRadius: 0,
            overflow: "hidden",
            backgroundColor: "transparent",
          }}
        >
          <FlatList
            ref={listRef}
            style={{ height: innerH }}
            data={slides}
            keyExtractor={(s) => s.key}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={renderSlide}
            onMomentumScrollEnd={onScrollEnd}
            getItemLayout={(_, index) => ({ length: innerW, offset: innerW * index, index })}
            initialNumToRender={3}
            windowSize={3}
            onScrollToIndexFailed={({ index }) => {
              setTimeout(() => listRef.current?.scrollToIndex({ index, animated: false }), 120);
            }}
          />

          <View
            pointerEvents="box-none"
            style={{
              position: "absolute",
              bottom: 108 + botPad,
              left: 0,
              right: 0,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 10,
              zIndex: 20,
            }}
          >
            {[0, 1, 2].map((i) => (
              <Pressable key={i} onPress={() => goToSlide(i)} hitSlop={8}>
                <View
                  style={{
                    width: active === i ? 26 : 8,
                    height: 8,
                    borderRadius: active === i ? 5 : 4,
                    backgroundColor: active === i ? "#F2C040" : "rgba(255,255,255,0.25)",
                  }}
                />
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              goTo(1.5);
            }}
            style={({ pressed }) => ({
              position: "absolute",
              bottom: 32 + botPad,
              left: ctaLeft,
              width: ctaWidth,
              zIndex: 20,
              opacity: pressed ? 0.95 : 1,
              transform: [{ translateY: pressed ? 3 : 0 }],
            })}
          >
            <View
              style={{
                backgroundColor: "#D08A10",
                borderRadius: 18,
                padding: 20,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#8A5000",
                shadowOffset: { width: 0, height: 5 },
                shadowOpacity: 0.45,
                shadowRadius: 14,
                elevation: 8,
              }}
            >
              <Text style={{ fontFamily: Fonts.extraBold, fontSize: 18, color: "#FFFFFF" }}>Get Started</Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              void handleSkipAll().catch(() => {});
            }}
            hitSlop={12}
            style={{
              position: "absolute",
              bottom: 12 + botPad,
              left: 0,
              right: 0,
              alignItems: "center",
              zIndex: 20,
            }}
          >
            <Text style={{ fontFamily: Fonts.semiBold, fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
              Already have an account?{" "}
              <Text style={{ color: "rgba(255,255,255,0.5)", textDecorationLine: "underline" }}>Skip</Text>
            </Text>
          </Pressable>
        </View>
        </View>
      </View>
    </View>
  );
}

// ─── Screen 1.5: How It Works ─────────────────────────────────────────────────
function HowItWorksScreen({ topPad, botPad, onNext, onBack }: any) {

  // Floating Dex animation
  const dexBob = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(dexBob, { toValue: -7, duration: 1500, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      Animated.timing(dexBob, { toValue:  0, duration: 1500, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
    ])).start();
  }, []);

  // Staggered fade-up for each step row
  const rowAnims = useRef([0,1,2,3,4].map(() => new Animated.Value(0))).current;
  const rowSlide = useRef([0,1,2,3,4].map(() => new Animated.Value(14))).current;
  useEffect(() => {
    const anims = rowAnims.map((a, i) =>
      Animated.parallel([
        Animated.timing(a, { toValue: 1, duration: 380, delay: 50 + i * 70, useNativeDriver: true }),
        Animated.timing(rowSlide[i], { toValue: 0, duration: 380, delay: 50 + i * 70, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
      ])
    );
    Animated.parallel(anims).start();
  }, []);

  const BG   = "#F2EEE5";
  const DARK  = "#111111";
  const ACCENT_TIME = "#2E7D32"; // same green accent as intro headline
  const GOLD  = "#C88A24";
  const LABEL = "#111111";
  const SUB   = "#111111";
  const STEP_SUB = "#111111";
  const BLOB  = "#D4C9A8";

  const STEPS = [
    { emoji: "💳", title: "Add your debts",         sub: "Credit cards, personal loans, medical, tax debt, and more" },
    { emoji: "🎯", title: "Pick your payoff method", sub: "Snowball, Avalanche, or we'll suggest one"     },
    { emoji: "🏆", title: "Set your freedom goal",  sub: "What are you working toward? Let's make it real" },
    { emoji: "📅", title: "See your debt-free date", sub: "Watch it count down as you crush each balance" },
    { emoji: "🔔", title: "Get daily reminders",     sub: "Dex checks in to keep you motivated in the process."    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>

      {/* Corner blob — top right */}
      <View pointerEvents="none" style={{
        position: "absolute", top: -30, right: -30,
        width: 160, height: 160, borderRadius: 80,
        backgroundColor: BLOB, opacity: 0.45,
      }} />
      {/* Corner blob — bottom left */}
      <View pointerEvents="none" style={{
        position: "absolute", bottom: -40, left: -40,
        width: 160, height: 160, borderRadius: 80,
        backgroundColor: BLOB, opacity: 0.40,
      }} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: topPad + 52,
          paddingBottom: botPad + 40,
          paddingHorizontal: 28,
          alignItems: "center",
        }}
        showsVerticalScrollIndicator={false}
      >

        {/* Label */}
        <Text style={{
          fontFamily: Fonts.semiBold, fontSize: 13, color: LABEL,
          letterSpacing: 2.5, textTransform: "uppercase", textAlign: "center",
          marginBottom: 20,
        }}>
          DEBT-FREE APP
        </Text>

        {/* Dex (how-it-works context) */}
        <Animated.View style={{ marginBottom: 22, transform: [{ translateY: dexBob }] }}>
          <DexCoin size={110} mood={ONBOARDING_DEX.howItWorks.mood} motion={ONBOARDING_DEX.howItWorks.motion} />
        </Animated.View>

        {/* Heading — Playfair-style serif, "2-3 minutes" in green italic (matches intro) */}
        <Text style={{
          fontFamily: Fonts.serif, fontSize: 32, fontWeight: "800",
          color: DARK, lineHeight: 40, textAlign: "center", marginBottom: 12,
        }}>
          {"You're "}
          <Text style={{ color: ACCENT_TIME, fontStyle: "italic" }}>2-3 minutes</Text>
          {" away from your plan."}
        </Text>

        {/* Subtitle */}
        <Text style={{
          fontFamily: Fonts.regular, fontWeight: "400", fontSize: 18, color: "#111111",
          textAlign: "center", lineHeight: 26, marginBottom: 22,
        }}>
          {"Here's what we'll set up together - simple, fast, and actually motivating."}
        </Text>

        {/* Steps card */}
        <View style={{
          backgroundColor: "#FFFFFF", borderRadius: 20,
          paddingHorizontal: 18, paddingVertical: 8,
          width: "100%",
          shadowColor: "#643C0A", shadowOpacity: 0.10,
          shadowOffset: { width: 0, height: 2 }, shadowRadius: 16,
          elevation: 3, marginBottom: 20,
        }}>
          {STEPS.map((s, i) => (
            <Animated.View
              key={i}
              style={{
                flexDirection: "row", alignItems: "center", gap: 14,
                paddingVertical: 14,
                borderBottomWidth: i < STEPS.length - 1 ? 1 : 0,
                borderBottomColor: "rgba(180,140,90,0.15)",
                opacity: rowAnims[i],
                transform: [{ translateY: rowSlide[i] }],
              }}
            >
              {/* Emoji badge — rounded square, cream bg */}
              <View style={{
                width: 48, height: 48, borderRadius: 13,
                backgroundColor: "#FDF6EC",
                borderWidth: 1.5, borderColor: "rgba(180,140,80,0.25)",
                alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <Text style={{ fontSize: 24 }}>{s.emoji}</Text>
              </View>

              {/* Step text */}
              <View style={{ flex: 1, paddingTop: 2 }}>
                <Text style={{
                  fontFamily: Fonts.bold, fontSize: 17, color: DARK,
                  lineHeight: 22, marginBottom: 3,
                }}>
                  {s.title}
                </Text>
                <Text style={{
                  fontFamily: Fonts.regular, fontWeight: "400", fontSize: 15, color: STEP_SUB,
                  lineHeight: 21,
                }}>
                  {s.sub}
                </Text>
              </View>

              {/* Step number — gold circle on RIGHT */}
              <View style={{
                width: 28, height: 28, borderRadius: 14,
                backgroundColor: GOLD,
                alignItems: "center", justifyContent: "center",
                flexShrink: 0, marginTop: 2,
              }}>
                <Text style={{ fontFamily: Fonts.bold, fontSize: 14, color: "#111111" }}>
                  {i + 1}
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* Tagline — plain text, no box */}
        <Text style={{
          fontFamily: Fonts.regular, fontSize: 16, color: LABEL,
          textAlign: "center", lineHeight: 24, marginBottom: 22,
        }}>
          {"🎉 People who write down specific goals are "}
          <Text style={{ fontFamily: Fonts.bold, color: DARK }}>42% more likely</Text>
          {" to achieve them."}
        </Text>

        {/* Pushes CTA + trust + source to bottom on short content; scrolls when tall */}
        <View style={{ flexGrow: 1, minHeight: 20, width: "100%" }} />

        {/* CTA — same blue as intro hero */}
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onNext(); }}
          style={({ pressed }) => ({
            width: "100%",
            marginBottom: 14,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          {({ pressed }) => (
            <View style={{
              backgroundColor: pressed ? "#1d4ed8" : "#2563EB",
              borderRadius: 50,
              paddingVertical: 18,
              paddingHorizontal: 24,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 8,
              shadowColor: "#2563EB",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.35,
              shadowRadius: 24,
              elevation: 8,
            }}>
              <Text style={{
                fontFamily: Fonts.extraBold,
                fontSize: 18,
                color: "white",
                letterSpacing: 0.1,
              }}>
                Let's Do This!
              </Text>
              <Text style={{ fontFamily: Fonts.extraBold, fontSize: 20, color: "white" }}>→</Text>
            </View>
          )}
        </Pressable>

        {/* Trust — match intro hero secure row */}
        <View style={{ alignItems: "center", width: "100%" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Svg width={17} height={17} viewBox="0 0 24 24">
              <Rect x={3} y={11} width={18} height={11} rx={2} fill="none" stroke="#2563EB" strokeWidth={2} />
              <Path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#2563EB" strokeWidth={2} strokeLinecap="round" fill="none" />
            </Svg>
            <Text style={{ fontFamily: Fonts.bold, fontSize: 14, color: "#111111", lineHeight: 20 }}>
              Secure & no account needed to start.
            </Text>
          </View>
        </View>

        <Text style={{
          fontFamily: Fonts.regular,
          fontSize: 11,
          color: "#111111",
          textAlign: "center",
          lineHeight: 16,
          marginTop: 16,
          paddingHorizontal: 16,
        }}>
          Source: Matthews, G. (2015), Dominican University of California - goal-setting study.
        </Text>

      </ScrollView>
    </View>
  );
}

// ─── Screen 2: Enter Your Debts ───────────────────────────────────────────────
// ── local debt shape used inside this screen ─────────────────────────────────
interface LocalDebt {
  id: string;
  typeKey: DebtType;
  name: string;
  balance: string;
  minPayment: string;
  apr: string;
  dueDate?: string;
  introApr: string;
  introEnds: string;
  hasIntro: boolean;
  onPlan: boolean;       // IRS payment plan (tax debt only)
  _saved: boolean;
  _expanded: boolean;
  _aprError: boolean;
  /** Empty = no error; otherwise validation message for intro end MM/YYYY */
  _introEndsError: string;
}

const TYPE_PILLS: { key: DebtType; label: string }[] = [
  { key: "creditCard",   label: "Credit Card"   },
  { key: "studentLoan",  label: "Student Loan"  },
  { key: "auto",         label: "Auto Loan"     },
  { key: "medical",      label: "Medical"       },
  { key: "personalLoan", label: "Personal Loan" },
  { key: "taxDebt",      label: "Tax Debt"      },
  { key: "other",        label: "Other"         },
];

const REACTIONS_DATA = [
  { bubble: "YES! That took courage. You are already ahead of 90% of people! 💪" },
  { bubble: "INCREDIBLE! You are staring debt in the face. That is power! 💪" },
  { bubble: "I am SO proud of you right now! Champions do exactly this! 🎉" },
  { bubble: "WOW - you are SERIOUS about this! Look at you go! 🌟" },
  { bubble: "Every single debt you add gets you closer to ZERO. Keep going! 🏅" },
  { bubble: "This takes guts. You have it. I believe in you! 🦁" },
];

function makeLocalDebt(): LocalDebt {
  return {
    id: "d" + Date.now() + Math.random(),
    typeKey: "creditCard",
    name: "", balance: "", minPayment: "", apr: "", dueDate: "1",
    introApr: "", introEnds: "", hasIntro: false, onPlan: false,
    _saved: false, _expanded: false, _aprError: false, _introEndsError: "",
  };
}

function fmtMoney(v: number) {
  return "$" + v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function DebtEntryScreen({
  topPad,
  botPad,
  onSave,
  onContinue,
  initialDrafts,
  onDraftsChange,
}: {
  isDark: boolean;
  topPad: number;
  botPad: number;
  debts: Debt[];
  onSave: (debt: Omit<Debt, "id" | "dateAdded">) => Promise<void> | void;
  onContinue: () => void;
  onBack: () => void;
  initialDrafts?: LocalDebt[];
  onDraftsChange?: (drafts: LocalDebt[]) => void;
}) {
  // ── colour tokens (always warm cream, matching HTML) ──────────────────────
  const BG          = "#F7F2EA";
  const CARD        = "#ffffff";
  const BLUE        = "#1A6FC4";
  const BLUE_LIGHT  = "#EFF6FF";
  const GREEN       = "#2C7A43";
  const DARK        = "#1A0A00";
  const PLACEHOLDER_TINT = "#9A948C";
  const LABEL_MUTED      = "#6E6962";
  const SECONDARY_CHROME = "#7E7972";
  const INP_ADORN        = "#8E8983";
  const INP_BG      = "#F7F2EA";
  const INP_BORDER  = "#D4C8B8";
  const TEXT_INPUT  = "#363330";

  // ── local multi-debt state ────────────────────────────────────────────────
  const [localDebts, setLocalDebts] = useState<LocalDebt[]>(
    initialDrafts && initialDrafts.length > 0 ? initialDrafts : [makeLocalDebt()]
  );
  const [celebCount, setCelebCount] = useState(0);
  const [bubbleMsg, setBubbleMsg] = useState("Add each debt and I'll build your payoff plan! 💪");
  const [bubbleCelebrate, setBubbleCelebrate] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    onDraftsChange?.(localDebts);
  }, [localDebts, onDraftsChange]);

  // Dex idle bob
  const dexBob = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dexBob, { toValue: 1, duration: 1350, useNativeDriver: ND, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(dexBob, { toValue: 0, duration: 1350, useNativeDriver: ND, easing: Easing.inOut(Easing.sin) }),
      ])
    ).start();
  }, []);

  // Shimmer for continue button
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmer, { toValue: 1, duration: 2400, useNativeDriver: true, easing: Easing.linear })
    ).start();
  }, []);
  const shimmerX = shimmer.interpolate({ inputRange: [0, 1], outputRange: [-SW * 0.55, SW * 1.3] });

  // progress percent: 25% + 8% per saved debt (max 48%)
  const savedCount = localDebts.filter(d => d._saved).length;
  const progressPct = Math.min(25 + savedCount * 8, 48);

  const updateDebt = (id: string, patch: Partial<LocalDebt>) => {
    setLocalDebts(prev => prev.map(d => d.id === id ? { ...d, ...patch } : d));
  };

  const celebrateDebtSaved = () => {
    const r = REACTIONS_DATA[celebCount % REACTIONS_DATA.length];
    setCelebCount(c => c + 1);
    setBubbleMsg(r.bubble);
    setBubbleCelebrate(true);
    setTimeout(() => setBubbleCelebrate(false), 3500);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const saveDebt = async (id: string) => {
    const d = localDebts.find(x => x.id === id);
    if (!d) return;
    const isTax = d.typeKey === "taxDebt";
    const bal = parseFloat(d.balance) || 0;
    if (bal <= 0) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); return; }

    if (!isTax && d.hasIntro) {
      const raw = d.introEnds.trim();
      if (!raw) {
        updateDebt(id, { _introEndsError: "Enter when your intro rate ends (MM/YYYY)." });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }
      const parsed = parseMonthYearString(raw);
      if (!parsed) {
        updateDebt(id, { _introEndsError: "Use MM/YYYY (e.g. 04/2026)." });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }
      const vr = validateIntroPromoMonthYear(parsed.month, parsed.year);
      if (!vr.valid) {
        updateDebt(id, { _introEndsError: vr.message ?? "Check month and year." });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }
      updateDebt(id, { _introEndsError: "" });
      const introAprN = parseFloat(d.introApr);
      if (!d.introApr.trim() || isNaN(introAprN) || introAprN < 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }
    }

    // Tax debt not on a formal plan can age without APR input.
    // Keep APR required for all non-tax debts and tax debts on-plan.
    const requireApr = !isTax || d.onPlan;
    const aprVal = parseFloat(d.apr);
    if (requireApr && (!d.apr.trim() || isNaN(aprVal) || aprVal < 0)) {
      updateDebt(id, { _aprError: true });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    updateDebt(id, { _aprError: false });
    const taxNoPlan = isTax && !d.onPlan;
    const dueDayVal = taxNoPlan ? 1 : parseInt((d.dueDate || "1").trim(), 10);
    if (!taxNoPlan && (!Number.isFinite(dueDayVal) || dueDayVal < 1 || dueDayVal > 31)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    const nameStr = d.name.trim() || d.typeKey;
    setSaving(true);
    try {
      await onSave({
        name: nameStr,
        balance: bal,
        apr: requireApr ? parseFloat(d.apr || "0") : 0,
        minimumPayment: parseFloat(d.minPayment || "0"),
        debtType: d.typeKey,
        isSecured: d.typeKey === "auto",
        dueDate: dueDayVal,
        taxPaymentPlan: d.typeKey === "taxDebt" ? d.onPlan : undefined,
      });
      updateDebt(id, { _saved: true, _expanded: false, name: nameStr });
      setTimeout(celebrateDebtSaved, 200);
    } finally {
      setSaving(false);
    }
  };

  const addAnotherDebt = () => {
    // auto-collapse any open unsaved card that has a balance
    setLocalDebts(prev => {
      const updated = prev.map(d => {
        if (!d._saved && !d._expanded && parseFloat(d.balance) > 0) {
          return { ...d, _saved: true, name: d.name.trim() || d.typeKey };
        }
        return d;
      });
      return [makeLocalDebt(), ...updated];
    });
  };

  const removeDebt = (id: string) => {
    setLocalDebts(prev => {
      const next = prev.filter(d => d.id !== id);
      if (next.length === 0) return [makeLocalDebt()];
      return next;
    });
  };

  const toggleExpand = (id: string) => {
    setLocalDebts(prev => prev.map(d =>
      d.id === id ? { ...d, _expanded: !d._expanded, _saved: d._expanded ? true : false } : d
    ));
  };

  const handleContinue = () => {
    if (localDebts.every(d => !d._saved) && localDebts.length === 1 && !parseFloat(localDebts[0].balance)) {
      setBubbleMsg("Add at least one debt first so I can build your plan! 💪");
      setBubbleCelebrate(true);
      setTimeout(() => setBubbleCelebrate(false), 2500);
      return;
    }
    onContinue();
  };

  // ── input style ──────────────────────────────────────────────────────────
  const inpStyle: any = {
    backgroundColor: INP_BG, borderWidth: 2, borderColor: INP_BORDER,
    borderRadius: 10, paddingVertical: 11, paddingHorizontal: 14,
    fontFamily: Fonts.bold, fontSize: 15, color: TEXT_INPUT,
  };
  const inpLabel = (t: string) => (
    <Text style={{ fontFamily: Fonts.extraBold, fontSize: 10, fontWeight: "800", color: LABEL_MUTED, letterSpacing: 1.6, textTransform: "uppercase", marginBottom: 5 }}>{t}</Text>
  );
  const fieldLabel = (t: string) => (
    <Text style={{ fontFamily: Fonts.extraBold, fontSize: 10, fontWeight: "800", color: LABEL_MUTED, letterSpacing: 1.9, textTransform: "uppercase", marginBottom: 8 }}>{t}</Text>
  );

  // ── render one open (active) debt card ──────────────────────────────────
  const renderActiveCard = (d: LocalDebt) => {
    const isTax = d.typeKey === "taxDebt";
    return (
      <View key={d.id} style={{ backgroundColor: CARD, borderWidth: 2, borderColor: INP_BORDER, borderRadius: 18, padding: 16, marginBottom: 10,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 }}>
        {/* remove × */}
        <Pressable onPress={() => removeDebt(d.id)} hitSlop={6} style={{
          position: "absolute", top: 12, right: 12, width: 24, height: 24, borderRadius: 12,
          backgroundColor: INP_BG, borderWidth: 1.5, borderColor: INP_BORDER, alignItems: "center", justifyContent: "center", zIndex: 2 }}>
          <Text style={{ fontFamily: Fonts.extraBold, fontSize: 12, color: SECONDARY_CHROME }}>✕</Text>
        </Pressable>

        {/* type pills */}
        {fieldLabel("Type")}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
          {TYPE_PILLS.map(p => {
            const active = d.typeKey === p.key;
            return (
              <Pressable key={p.key} onPress={() => updateDebt(d.id, { typeKey: p.key, hasIntro: false, onPlan: false })}
                style={{ paddingVertical: 7, paddingHorizontal: 14, borderRadius: 20, borderWidth: 2,
                  borderColor: active ? BLUE : INP_BORDER,
                  backgroundColor: active ? BLUE : INP_BG,
                  ...(active ? { shadowColor: BLUE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 3 } : {}) }}>
                <Text style={{ fontFamily: Fonts.extraBold, fontSize: 12.5, color: active ? "white" : Colors.light.textSecondary }}>{p.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* debt name */}
        <View style={{ marginBottom: 10 }}>
          {inpLabel("Debt Name")}
          <TextInput
            style={inpStyle}
            placeholder={isTax ? "e.g. IRS Balance 2023" : "e.g. Chase Sapphire Card"}
            placeholderTextColor={PLACEHOLDER_TINT}
            value={d.name}
            onChangeText={t => updateDebt(d.id, { name: t })}
          />
        </View>

        {/* balance */}
        <View style={{ marginBottom: 10 }}>
          {inpLabel("Balance Owed")}
          <View style={{ position: "relative" }}>
            <Text style={{ position: "absolute", left: 12, top: 0, bottom: 0, textAlignVertical: "center", lineHeight: 46,
                           fontFamily: Fonts.extraBold, fontSize: 15, color: INP_ADORN, zIndex: 1 }}>$</Text>
            <TextInput
              style={[inpStyle, { paddingLeft: 26 }]}
              placeholder="0.00" placeholderTextColor={PLACEHOLDER_TINT}
              keyboardType="decimal-pad"
              value={d.balance}
              onChangeText={t => updateDebt(d.id, { balance: t.replace(/[^0-9.]/g, "") })}
            />
          </View>
        </View>

        {/* ── Tax Debt branch ── */}
        {isTax ? (
          <>
            {/* IRS plan toggle */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <Pressable onPress={() => updateDebt(d.id, { onPlan: !d.onPlan })}
                style={{ width: 44, height: 24, borderRadius: 12, backgroundColor: d.onPlan ? BLUE : INP_BORDER, justifyContent: "center", paddingHorizontal: 3 }}>
                <Animated.View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: "white",
                  transform: [{ translateX: d.onPlan ? 20 : 0 }],
                  shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 1 }} />
              </Pressable>
              <Text style={{ fontFamily: Fonts.semiBold, fontSize: 12.5, color: SECONDARY_CHROME }}>On an IRS/state payment plan</Text>
            </View>
            {d.onPlan ? (
              <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
                <View style={{ flex: 1 }}>
                  {inpLabel("Monthly Payment")}
                  <View style={{ position: "relative" }}>
                    <Text style={{ position: "absolute", left: 12, top: 0, bottom: 0, textAlignVertical: "center", lineHeight: 46, fontFamily: Fonts.extraBold, fontSize: 15, color: INP_ADORN, zIndex: 1 }}>$</Text>
                    <TextInput style={[inpStyle, { paddingLeft: 26 }]} placeholder="0.00" placeholderTextColor={PLACEHOLDER_TINT}
                      keyboardType="decimal-pad" value={d.minPayment}
                      onChangeText={t => updateDebt(d.id, { minPayment: t.replace(/[^0-9.]/g, "") })} />
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  {inpLabel("Penalty Rate (APR)")}
                  <View style={{ position: "relative" }}>
                    <TextInput style={[inpStyle, { paddingRight: 26, borderColor: d._aprError ? "#DC2626" : INP_BORDER }]} placeholder="e.g. 8" placeholderTextColor={PLACEHOLDER_TINT}
                      keyboardType="decimal-pad" value={d.apr}
                      onChangeText={t => updateDebt(d.id, { apr: t.replace(/[^0-9.]/g, ""), _aprError: false })} />
                    <Text style={{ position: "absolute", right: 12, top: 0, bottom: 0, textAlignVertical: "center", lineHeight: 46, fontFamily: Fonts.extraBold, fontSize: 15, color: INP_ADORN }}>%</Text>
                  </View>
                  {d._aprError && <Text style={{ fontFamily: Fonts.semiBold, fontSize: 11.5, color: "#DC2626", marginTop: 3 }}>Enter APR (0% allowed)</Text>}
                </View>
              </View>
            ) : (
              <View style={{ backgroundColor: "#FFF8EE", borderWidth: 1.5, borderColor: "#E8D8B8", borderRadius: 8, padding: 10, marginBottom: 10 }}>
                <Text style={{ fontFamily: Fonts.semiBold, fontSize: 11.5, color: "#756A60", lineHeight: 18 }}>
                  Not on a formal IRS/state plan yet. Payment and APR details are optional now, and you can add them later.
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            {/* min payment + APR row */}
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
              <View style={{ flex: 1 }}>
                {inpLabel("Min. Payment")}
                <View style={{ position: "relative" }}>
                  <Text style={{ position: "absolute", left: 12, top: 0, bottom: 0, textAlignVertical: "center", lineHeight: 46, fontFamily: Fonts.extraBold, fontSize: 15, color: INP_ADORN, zIndex: 1 }}>$</Text>
                  <TextInput style={[inpStyle, { paddingLeft: 26 }]} placeholder="0.00" placeholderTextColor={PLACEHOLDER_TINT}
                    keyboardType="decimal-pad" value={d.minPayment}
                    onChangeText={t => updateDebt(d.id, { minPayment: t.replace(/[^0-9.]/g, "") })} />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                {inpLabel("Interest Rate (APR)")}
                <View style={{ position: "relative" }}>
                  <TextInput style={[inpStyle, { paddingRight: 26, borderColor: d._aprError ? "#DC2626" : INP_BORDER }]} placeholder="e.g. 22.99" placeholderTextColor={PLACEHOLDER_TINT}
                    keyboardType="decimal-pad" value={d.apr}
                    onChangeText={t => updateDebt(d.id, { apr: t.replace(/[^0-9.]/g, ""), _aprError: false })} />
                  <Text style={{ position: "absolute", right: 12, top: 0, bottom: 0, textAlignVertical: "center", lineHeight: 46, fontFamily: Fonts.extraBold, fontSize: 15, color: INP_ADORN }}>%</Text>
                </View>
                {d._aprError && <Text style={{ fontFamily: Fonts.semiBold, fontSize: 11.5, color: "#DC2626", marginTop: 3 }}>Enter APR (0% allowed)</Text>}
              </View>
            </View>

            {/* intro rate toggle */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <Pressable
                onPress={() => {
                  const nextHasIntro = !d.hasIntro;
                  updateDebt(d.id, {
                    hasIntro: nextHasIntro,
                    introApr: nextHasIntro ? (d.introApr.trim() || "0") : d.introApr,
                    _introEndsError: "",
                  });
                }}
                style={{ width: 44, height: 24, borderRadius: 12, backgroundColor: d.hasIntro ? BLUE : INP_BORDER, justifyContent: "center", paddingHorizontal: 3 }}>
                <Animated.View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: "white",
                  transform: [{ translateX: d.hasIntro ? 20 : 0 }],
                  shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 1 }} />
              </Pressable>
              <Text style={{ fontFamily: Fonts.semiBold, fontSize: 12.5, color: SECONDARY_CHROME, flex: 1 }}>Has a temporary intro / promotional rate</Text>
            </View>

            {d.hasIntro && (
              <>
                <View style={{ flexDirection: "row", gap: 10, marginBottom: 4 }}>
                  <View style={{ flex: 1 }}>
                    {inpLabel("Intro Rate")}
                    <View style={{ position: "relative" }}>
                      <TextInput style={[inpStyle, { paddingRight: 26 }]} placeholder="e.g. 0" placeholderTextColor={PLACEHOLDER_TINT}
                        keyboardType="decimal-pad" value={d.introApr}
                        onChangeText={t => updateDebt(d.id, { introApr: t.replace(/[^0-9.]/g, "") })} />
                      <Text style={{ position: "absolute", right: 12, top: 0, bottom: 0, textAlignVertical: "center", lineHeight: 46, fontFamily: Fonts.extraBold, fontSize: 15, color: INP_ADORN }}>%</Text>
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    {inpLabel("Intro Ends")}
                    <MonthYearField
                      value={d.introEnds}
                      onChangeText={(t) => updateDebt(d.id, { introEnds: t, _introEndsError: "" })}
                      placeholder="MM/YYYY"
                      placeholderTextColor={PLACEHOLDER_TINT}
                      inputStyle={inpStyle}
                    />
                    {!!d._introEndsError && (
                      <Text style={{ fontFamily: Fonts.semiBold, fontSize: 11.5, color: "#DC2626", marginTop: 3 }}>
                        {d._introEndsError}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={{ backgroundColor: "#FFF8EE", borderWidth: 1.5, borderColor: "#E8D8B8", borderRadius: 8, padding: 10, marginBottom: 10 }}>
                  <Text style={{ fontFamily: Fonts.semiBold, fontSize: 11.5, color: "#756A60", lineHeight: 18 }}>
                    Intro rate applies until this date, then switches to standard APR.
                  </Text>
                </View>
              </>
            )}
          </>
        )}

        {/* Tax debt off-plan has no monthly due day; on-plan uses same as other debts */}
        {(!isTax || d.onPlan) && (
          <View style={{ marginBottom: 10 }}>
            <Text style={{ fontFamily: Fonts.semiBold, fontSize: 12, color: LABEL_MUTED, marginBottom: 6 }}>
              Payment due date
            </Text>
            <DueDayPickerField
              value={d.dueDate || "1"}
              onChangeText={(t) => updateDebt(d.id, { dueDate: t })}
              placeholder="1"
              placeholderTextColor={PLACEHOLDER_TINT}
              inputStyle={inpStyle}
              calendarIconColor={BLUE}
            />
          </View>
        )}

        {/* ── Save This Debt ── */}
        <Pressable onPress={() => saveDebt(d.id)} disabled={saving}
          style={({ pressed }) => ({
            width: "100%", borderRadius: 12, overflow: "hidden", marginTop: 8,
            opacity: saving ? 0.5 : pressed ? 0.88 : 1,
            shadowColor: GREEN, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 18, elevation: 4,
          })}>
          <LinearGradient colors={["#3A9A20", "#2A8010"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ paddingVertical: 12, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 }}>
            <Svg width={15} height={15} viewBox="0 0 24 24">
              <Path d="M20 6L9 17l-5-5" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </Svg>
            <Text style={{ fontFamily: Fonts.extraBold, fontSize: 15, color: "white" }}>Save This Debt</Text>
          </LinearGradient>
        </Pressable>
      </View>
    );
  };

  // ── render a saved (collapsed) debt pill ─────────────────────────────────
  const renderSavedPill = (d: LocalDebt) => {
    const bal = parseFloat(d.balance) || 0;
    const apr = parseFloat(d.apr) || 0;
    const dueDay = parseInt(d.dueDate || "1", 10);
    let meta = fmtMoney(bal);
    if (apr > 0) meta += " · " + apr + "% APR";
    if (Number.isFinite(dueDay) && !(d.typeKey === "taxDebt" && !d.onPlan)) meta += " · due " + dueDay;
    if (d.typeKey === "taxDebt" && !d.onPlan) meta += " · No plan";
    return (
      <Pressable key={d.id} onPress={() => toggleExpand(d.id)}
        style={{ backgroundColor: CARD, borderWidth: 2, borderColor: GREEN, borderRadius: 14, padding: 11,
          paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8,
          shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 1 }}>
        <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: GREEN, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "white", fontSize: 11, fontFamily: Fonts.extraBold }}>✓</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontFamily: Fonts.extraBold, fontSize: 14.5, color: TEXT_INPUT }} numberOfLines={1}>{d.name || d.typeKey}</Text>
          <Text style={{ fontFamily: Fonts.bold, fontSize: 11, color: "#6D8871", marginTop: 1 }}>
            {TYPE_PILLS.find(p => p.key === d.typeKey)?.label ?? d.typeKey} · {meta}
          </Text>
        </View>
        <View style={{ paddingVertical: 4, paddingHorizontal: 10, borderWidth: 1.5, borderColor: "rgba(26,111,196,0.3)", borderRadius: 10, backgroundColor: BLUE_LIGHT }}>
          <Text style={{ fontFamily: Fonts.extraBold, fontSize: 11, color: BLUE }}>Edit</Text>
        </View>
      </Pressable>
    );
  };

  const activeDebt = localDebts.find(d => !d._saved || d._expanded);
  const savedDebts = localDebts.filter(d => d._saved && !d._expanded);
  const totalBalance = localDebts.reduce((s, d) => s + (parseFloat(d.balance) || 0), 0);

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>

      {/* ── Progress bar ──────────────────────────────────────────────────── */}
      <View style={{ marginTop: topPad + 6 }}>
        <View style={{ height: 6, backgroundColor: "#E8DDD0", width: "100%" }}>
          <View style={{ height: "100%", width: `${progressPct}%`, backgroundColor: BLUE, borderRadius: 3 }} />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 18, paddingTop: 5 }}>
          <Text style={{ fontFamily: Fonts.bold, fontSize: 10, color: SECONDARY_CHROME, textTransform: "uppercase", letterSpacing: 1 }}>Step 1 of 4</Text>
          <Text style={{ fontFamily: Fonts.bold, fontSize: 10, color: SECONDARY_CHROME, textTransform: "uppercase", letterSpacing: 1 }}>{Math.round(progressPct)}%</Text>
        </View>
      </View>

      {/* ── Header: small Dex + title ─────────────────────────────────────── */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 18, paddingTop: 10 }}>
        <Animated.View style={{
          transform: [
            { translateY: dexBob.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) },
            { rotate:    dexBob.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "0.7deg"] }) },
          ],
        }}>
          <DexCoin size={56} mood={ONBOARDING_DEX.step1Debts.mood} motion={ONBOARDING_DEX.step1Debts.motion} />
        </Animated.View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: Fonts.extraBold, fontSize: 10, color: BLUE, textTransform: "uppercase", letterSpacing: 1.9, marginBottom: 2 }}>Step 1</Text>
          <Text style={{ fontFamily: Fonts.black, fontSize: 20, color: DARK, lineHeight: 22 }}>
            Enter your{" "}
            <Text style={{ color: BLUE }}>debts</Text>
          </Text>
        </View>
      </View>

      {/* ── Speech bubble ─────────────────────────────────────────────────── */}
      <View style={{ marginHorizontal: 18, marginTop: 8,
        backgroundColor: bubbleCelebrate ? "#F0FFF4" : CARD,
        borderWidth: 2, borderColor: bubbleCelebrate ? GREEN : INP_BORDER,
        borderRadius: 14, padding: 9, paddingHorizontal: 14,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 1,
        minHeight: 38 }}>
        {/* triangle tip */}
        <View style={{ position: "absolute", top: -10, left: 22,
          borderLeftWidth: 8, borderRightWidth: 8, borderBottomWidth: 10,
          borderLeftColor: "transparent", borderRightColor: "transparent",
          borderBottomColor: bubbleCelebrate ? GREEN : INP_BORDER }} />
        <View style={{ position: "absolute", top: -7, left: 24,
          borderLeftWidth: 6, borderRightWidth: 6, borderBottomWidth: 8,
          borderLeftColor: "transparent", borderRightColor: "transparent",
          borderBottomColor: bubbleCelebrate ? "#F0FFF4" : CARD }} />
        <Text style={{ fontFamily: Fonts.bold, fontSize: 13, color: "#3D3832", lineHeight: 19 }}>{bubbleMsg}</Text>
      </View>

      {/* ── Scroll area ───────────────────────────────────────────────────── */}
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 10, paddingHorizontal: 14, paddingBottom: Math.max(botPad, 24) + 20 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bottomOffset={80}
      >
        {/* active (open) card */}
        {activeDebt && renderActiveCard(activeDebt)}

        {/* total strip (shown when ≥1 debt has a balance) */}
        {totalBalance > 0 && (
          <View style={{ backgroundColor: DARK, borderRadius: 14, padding: 12, paddingHorizontal: 16, marginBottom: 10,
            flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View>
              <Text style={{ fontFamily: Fonts.extraBold, fontSize: 11, color: "rgba(255,255,255,0.78)", textTransform: "uppercase", letterSpacing: 1.6 }}>Total Debt</Text>
              <Text style={{ fontFamily: Fonts.black, fontSize: 23, color: "#FFFFFF" }}>{fmtMoney(totalBalance)}</Text>
            </View>
            <View style={{ backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 10, paddingVertical: 4, paddingHorizontal: 10 }}>
              <Text style={{ fontFamily: Fonts.extraBold, fontSize: 13, color: "#FFFFFF" }}>
                {localDebts.length} {localDebts.length === 1 ? "debt" : "debts"}
              </Text>
            </View>
          </View>
        )}

        {/* + Add another — only after at least one debt is saved (Save This Debt) */}
        {savedCount > 0 && (
          <Pressable onPress={addAnotherDebt}
            style={({ pressed }) => ({
              width: "100%", borderRadius: 14, paddingVertical: 13,
              backgroundColor: pressed ? BLUE_LIGHT : CARD,
              borderWidth: 2, borderStyle: "dashed", borderColor: BLUE,
              alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 7,
              marginBottom: 10,
            })}>
            <Svg width={16} height={16} viewBox="0 0 24 24">
              <Path d="M12 5v14M5 12h14" stroke={BLUE} strokeWidth={2.8} strokeLinecap="round" fill="none" />
            </Svg>
            <Text style={{ fontFamily: Fonts.extraBold, fontSize: 15, color: BLUE }}>Add another debt</Text>
          </Pressable>
        )}

        {/* Continue CTA with shimmer */}
        <Pressable
          onPress={savedCount > 0 ? handleContinue : undefined}
          style={({ pressed }) => ({
            width: "100%",
            borderRadius: 22,
            overflow: "hidden",
            marginBottom: 10,
            opacity: savedCount > 0 ? (pressed ? 0.9 : 1) : 0.42,
            shadowColor: BLUE,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: savedCount > 0 ? 0.4 : 0.0,
            shadowRadius: 28,
            elevation: savedCount > 0 ? 6 : 0,
          })}
        >
          <LinearGradient
            colors={savedCount > 0 ? ["#1A6FC4", "#0D5BAE"] : ["#B8BCC4", "#A0A5AD"]}
            start={{ x: 0.13, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingVertical: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 }}>
            <Text style={{ fontFamily: Fonts.extraBold, fontSize: 16, color: "white" }}>Done Adding Debts, Choose Payoff Method</Text>
            {/* shimmer sweep */}
            {!!(savedCount > 0) && (
              <Animated.View pointerEvents="none" style={{
                position: "absolute", top: 0, bottom: 0, width: "55%",
                transform: [{ translateX: shimmerX }] }}>
                <LinearGradient
                  colors={["transparent", "rgba(255,255,255,0.2)", "transparent"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            )}
          </LinearGradient>
        </Pressable>

        {/* ── Saved debts section ── */}
        {savedDebts.length > 0 && (
          <>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between",
              paddingVertical: 10, paddingHorizontal: 4,
              borderTopWidth: 2, borderTopColor: "#E0D8CE", marginTop: 8, marginBottom: 6 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Svg width={13} height={13} viewBox="0 0 24 24">
                  <Path d="M20 6L9 17l-5-5" stroke={GREEN} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </Svg>
                <Text style={{ fontFamily: Fonts.extraBold, fontSize: 12.5, color: GREEN, textTransform: "uppercase", letterSpacing: 1.6 }}>
                  {savedDebts.length} {savedDebts.length === 1 ? "debt saved" : "debts saved"}
                </Text>
              </View>
              {totalBalance > 0 && (
                <Text style={{ fontFamily: Fonts.black, fontSize: 14, color: "#F5A020" }}>{fmtMoney(totalBalance)}</Text>
              )}
            </View>
            {savedDebts.map(d => renderSavedPill(d))}
          </>
        )}
      </KeyboardAwareScrollView>

    </View>
  );
}


// ─── Onboarding Debt Bottom Sheet Form (Page 2) ────────────────────────────────
function OnboardingDebtSheet({
  visible,
  onClose,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (debt: Omit<Debt, "id" | "dateAdded">) => Promise<void> | void;
}) {
  const [name, setName] = useState("");
  const [debtType, setDebtType] = useState<DebtType>("creditCard");
  const [balance, setBalance] = useState("");
  const [aprModeFixed, setAprModeFixed] = useState(true);
  const [apr, setApr] = useState("");
  const [aprCurrent, setAprCurrent] = useState("");
  const [aprExpected, setAprExpected] = useState("");
  const [minPayment, setMinPayment] = useState("");
  const [dueDay, setDueDay] = useState<number | null>(null);
  const [taxPlan, setTaxPlan] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const isTaxDebt = debtType === "taxDebt";

  const reset = () => {
    setName("");
    setDebtType("creditCard");
    setBalance("");
    setAprModeFixed(true);
    setApr("");
    setAprCurrent("");
    setAprExpected("");
    setMinPayment("");
    setDueDay(null);
    setTaxPlan(false);
    setErrors({});
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Required";
    const b = parseFloat(balance);
    if (isNaN(b) || b <= 0) e.balance = "Balance must be greater than 0";
    const rateVal = aprModeFixed ? parseFloat(apr || "0") : parseFloat(aprExpected || aprCurrent || "0");
    if (isNaN(rateVal) || rateVal <= 0 || rateVal > 100) e.apr = "Interest rate is required (e.g. 22.99)";
    const m = parseFloat(minPayment || "0");
    if (isNaN(m) || m <= 0) e.minPayment = "Minimum payment must be greater than 0";
    if (!dueDay) e.dueDay = "Pick a date";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setSaving(true);
    try {
      const rateVal = aprModeFixed ? parseFloat(apr || "0") : parseFloat(aprExpected || aprCurrent || "0");
      const m = parseFloat(minPayment || "0");
      await onSave({
        name: name.trim(),
        balance: parseFloat(balance),
        apr: rateVal,
        minimumPayment: m,
        debtType,
        isSecured: debtType === "auto" || debtType === "securedBusinessDebt",
        dueDate: dueDay ?? 1,
        taxRate: undefined,
        taxPaymentPlan: isTaxDebt ? taxPlan : undefined,
      });
      reset();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const dayLabels = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View
          style={{
            backgroundColor: "#F9FAFB",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: "90%",
            paddingBottom: 20,
          }}
        >
          <View style={{ alignItems: "center", paddingTop: 8, paddingBottom: 4 }}>
            <View style={{ width: 40, height: 4, borderRadius: 999, backgroundColor: "#D1D5DB" }} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 6 }}>
            <Text style={{ fontFamily: Fonts.extraBold, fontWeight: "800", fontSize: 16, color: "#111827" }}>
              Add Debt
            </Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color="#4B5563" />
            </Pressable>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* 1. Debt name */}
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 13, color: "#374151", marginBottom: 4 }}>Debt name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Credit Card 1"
                placeholderTextColor="#4B5563"
                style={{
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: errors.name ? "#DC2626" : "#D1D5DB",
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  backgroundColor: "#FFFFFF",
                  fontFamily: Fonts.regular,
                }}
              />
            </View>

            {/* 2. Debt type */}
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 13, color: "#374151", marginBottom: 4 }}>Debt type</Text>
              <View
                style={{
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: "#D1D5DB",
                  backgroundColor: "#FFFFFF",
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                }}
              >
                {[
                  ["creditCard", "Credit Card"],
                  ["auto", "Car Loan"],
                  ["studentLoan", "Student Loan"],
                  ["taxDebt", "IRS/Tax"],
                  ["medical", "Medical"],
                  ["businessDebt", "Business"],
                  ["other", "Other"],
                ].map(([value, label]) => {
                  const v = value as DebtType;
                  const selected = debtType === v;
                  return (
                    <Pressable
                      key={v}
                      onPress={() => {
                        setDebtType(v);
                        if (v !== "taxDebt") setTaxPlan(false);
                        Haptics.selectionAsync();
                      }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingVertical: 6,
                      }}
                    >
                      <Text
                        style={{
                          color: selected ? "#111827" : "#4B5563",
                          fontFamily: Fonts.regular,
                        }}
                      >
                        {label}
                      </Text>
                      {selected && <Ionicons name="checkmark" size={16} color="#C07820" />}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* 3. Balance */}
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 13, color: "#374151", marginBottom: 4 }}>Balance ($)</Text>
              <TextInput
                value={balance}
                onChangeText={setBalance}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#4B5563"
                style={{
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: errors.balance ? "#DC2626" : "#D1D5DB",
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  backgroundColor: "#FFFFFF",
                  fontFamily: Fonts.regular,
                }}
              />
            </View>

            {/* 4. Interest rate with Fixed / Variable toggle */}
            <View style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <Text style={{ fontSize: 13, color: "#374151" }}>Interest rate (%)</Text>
                <View style={{ flexDirection: "row", borderRadius: 999, borderWidth: 1, borderColor: "#D1D5DB", overflow: "hidden" }}>
                  <Pressable
                    onPress={() => setAprModeFixed(true)}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      backgroundColor: aprModeFixed ? "#C07820" : "transparent",
                    }}
                  >
                    <Text style={{ fontSize: 11, color: aprModeFixed ? "#FFFFFF" : "#4B5563" }}>Fixed</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setAprModeFixed(false)}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      backgroundColor: !aprModeFixed ? "#C07820" : "transparent",
                    }}
                  >
                    <Text style={{ fontSize: 11, color: !aprModeFixed ? "#FFFFFF" : "#4B5563" }}>Variable</Text>
                  </Pressable>
                </View>
              </View>
              {aprModeFixed ? (
                <TextInput
                  value={apr}
                  onChangeText={setApr}
                  keyboardType="decimal-pad"
                  placeholder="18.99"
                  placeholderTextColor="#4B5563"
                  style={{
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: errors.apr ? "#DC2626" : "#D1D5DB",
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    backgroundColor: "#FFFFFF",
                    fontFamily: Fonts.regular,
                  }}
                />
              ) : (
                <>
                  <TextInput
                    value={aprCurrent}
                    onChangeText={setAprCurrent}
                    keyboardType="decimal-pad"
                    placeholder="Current rate %"
                    placeholderTextColor="#4B5563"
                    style={{
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: errors.apr ? "#DC2626" : "#D1D5DB",
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      backgroundColor: "#FFFFFF",
                      fontFamily: Fonts.regular,
                      marginBottom: 6,
                    }}
                  />
                  <TextInput
                    value={aprExpected}
                    onChangeText={setAprExpected}
                    keyboardType="decimal-pad"
                    placeholder="Expected rate %"
                    placeholderTextColor="#4B5563"
                    style={{
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: errors.apr ? "#DC2626" : "#D1D5DB",
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      backgroundColor: "#FFFFFF",
                      fontFamily: Fonts.regular,
                    }}
                  />
                  <View style={{ flexDirection: "row", alignItems: "flex-start", marginTop: 4 }}>
                    <Ionicons name="information-circle-outline" size={14} color="#4B5563" style={{ marginTop: 1, marginRight: 4 }} />
                    <Text style={{ flex: 1, fontSize: 11, color: "#4B5563" }}>
                      Variable rates change. Enter your best estimate.
                    </Text>
                  </View>
                </>
              )}
              {errors.apr && (
                <Text style={{ fontFamily: Fonts.semiBold, fontSize: 11.5, color: "#DC2626", marginTop: 4 }}>
                  {errors.apr}
                </Text>
              )}
            </View>

            {/* 5. Minimum payment */}
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 13, color: "#374151", marginBottom: 4 }}>Minimum payment ($)</Text>
              <TextInput
                value={minPayment}
                onChangeText={setMinPayment}
                keyboardType="decimal-pad"
                placeholder="150"
                placeholderTextColor="#4B5563"
                style={{
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: errors.minPayment ? "#DC2626" : "#D1D5DB",
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  backgroundColor: "#FFFFFF",
                  fontFamily: Fonts.regular,
                }}
              />
            </View>

            {/* 6. Due date – visual calendar */}
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 13, color: "#374151", marginBottom: 4 }}>Due date</Text>
              <View
                style={{
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: errors.dueDay ? "#DC2626" : "#D1D5DB",
                  backgroundColor: "#FFFFFF",
                  padding: 8,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6, paddingHorizontal: 4 }}>
                  <Ionicons name="calendar-outline" size={16} color="#4B5563" />
                  <Text style={{ marginLeft: 6, fontSize: 12, color: "#4B5563" }}>
                    Tap a date for this bill. Estimate is fine!
                  </Text>
                </View>
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {dayLabels.map((d) => {
                    const selected = dueDay === d;
                    return (
                      <Pressable
                        key={d}
                        onPress={() => {
                          setDueDay(d);
                          Haptics.selectionAsync();
                        }}
                        style={{
                          width: "14.28%",
                          aspectRatio: 1,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <View
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 13,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: selected ? "#C07820" : "transparent",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              color: selected ? "#FFFFFF" : "#111827",
                              fontFamily: Fonts.regular,
                            }}
                          >
                            {d}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* 7. On payment plan toggle (IRS) */}
            {isTaxDebt && (
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8 }}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={{ fontSize: 13, color: "#374151", marginBottom: 2 }}>
                    On payment plan?
                  </Text>
                  <Text style={{ fontSize: 11, color: "#4B5563" }}>
                    Only applies to IRS/state debts.
                  </Text>
                </View>
                <Switch
                  value={taxPlan}
                  onValueChange={(v) => {
                    setTaxPlan(v);
                    Haptics.selectionAsync();
                  }}
                  trackColor={{ false: "#D1D5DB", true: "#C07820" }}
                  thumbColor="#FFFFFF"
                />
              </View>
            )}
          </ScrollView>

          <View style={{ paddingHorizontal: 20 }}>
            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={({ pressed }) => [
                {
                  borderRadius: 16,
                  backgroundColor: "#C07820",
                  paddingVertical: 14,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed || saving ? 0.85 : 1,
                },
              ]}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontFamily: Fonts.extraBold,
                  fontWeight: "800",
                  fontSize: 16,
                }}
              >
                {saving ? "Saving…" : "Save Debt"}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function NavItem({
  label,
  slot,
  active,
}: {
  label: string;
  slot: "home" | "snap" | "vault" | "blaze" | "settings";
  active: boolean;
}) {
  const color = active ? "#FFFFFF" : "rgba(255,255,255,0.70)";
  const bg = active ? "rgba(255,255,255,0.20)" : "transparent";
  const size = 22;

  let iconNode: React.ReactNode;
  if (slot === "home") {
    iconNode = <BearIcon size={size} />;
  } else if (slot === "snap") {
    iconNode = (
      <Image
        source={require("@/assets/images/mascot_squirrel.png")}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    );
  } else if (slot === "vault") {
    iconNode = (
      <Image
        source={require("@/assets/images/mascot_safe.png")}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    );
  } else if (slot === "blaze") {
    iconNode = (
      <Image
        source={require("@/assets/images/mascot_dragon.png")}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    );
  } else {
    iconNode = <Ionicons name="settings-outline" size={18} color={color} />;
  }

  return (
    <View
      style={{
        width: 72,
        alignItems: "center",
        gap: 4,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: bg,
      }}
    >
      {iconNode}
      <Text
        style={{
          color,
          fontFamily: Fonts.semiBold,
          fontWeight: active ? "800" : "600",
          fontSize: 11,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function NetworkPattern() {
  const dots = Array.from({ length: 16 }, (_, i) => ({
    x: (i % 4) * (SW / 4) + 20 + (i % 2 ? 14 : 0),
    y: Math.floor(i / 4) * 110 + 80 + (i % 3) * 10,
  }));
  return (
    <View style={{ flex: 1 }}>
      {dots.map((d, i) => {
        const right = i % 4 !== 3 ? dots[i + 1] : null;
        const down = i + 4 < dots.length ? dots[i + 4] : null;
        return (
          <React.Fragment key={i}>
            {right && (
              <View style={{ position: "absolute", left: d.x, top: d.y, width: right.x - d.x, height: 2, backgroundColor: "rgba(255,255,255,0.35)" }} />
            )}
            {down && (
              <View style={{ position: "absolute", left: d.x, top: d.y, width: 2, height: down.y - d.y, backgroundColor: "rgba(255,255,255,0.22)" }} />
            )}
          </React.Fragment>
        );
      })}
      {dots.map((d, i) => (
        <View key={`dot-${i}`} style={{ position: "absolute", left: d.x - 4, top: d.y - 4, width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.60)" }} />
      ))}
    </View>
  );
}

// ─── Screen: Add Debts (onboarding step 3) ──────────────────────────────────────
function AddDebtOnboardingScreen({
  isDark,
  bg,
  topPad,
  botPad,
  goTo,
  debts,
  onAddDebt,
  onDone,
  onBack,
}: {
  isDark: boolean;
  bg: string;
  topPad: number;
  botPad: number;
  goTo: (s: Step, dir?: "fwd" | "back") => void;
  debts: Debt[];
  onAddDebt: () => void;
  onDone: () => void;
  onBack: () => void;
}) {
  const C = isDark ? { text: "#FFFFFF", textSecondary: "rgba(255,255,255,0.6)" } : { text: P.text, textSecondary: "#335547" };
  return (
    <View style={[s.screen, { backgroundColor: bg, paddingTop: topPad, paddingBottom: botPad }]}>
      <LinearGradient colors={isDark ? ["#0A1628","#080E14"] : ["#FFFFFF","#FFFFFF"]} style={StyleSheet.absoluteFill} />
      <BackBtn onPress={onBack} isDark={isDark} topPad={topPad} />

      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 48 }}>
        <Text style={[s.splashName, { fontSize: 28, color: C.text, marginBottom: 8 }]}>Enter your debts</Text>
        <Text style={[s.splashTagline, { color: C.textSecondary, marginBottom: 20, textAlign: "left" }]}>
          Enter each debt so we can show your real payoff date and how much you save with a little extra each day.
        </Text>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
          {debts.map((d) => (
            <View key={d.id} style={[oc.card, { backgroundColor: isDark ? "#2C2014" : "#FFFFFF", borderColor: isDark ? "rgba(232,160,48,0.22)" : "rgba(192,120,32,0.22)" }]}>
              <Text style={[oc.label, { color: C.text, flex: 1 }]} numberOfLines={1}>{d.name}</Text>
              <Text style={[oc.label, { color: P.orange, fontSize: 15 }]}>${d.balance.toLocaleString()}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={[s.splashBtns, { paddingBottom: botPad + 8, gap: 12 }]}>
        <Pressable onPress={onAddDebt} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
          <LinearGradient colors={[P.orange, "#C44D00"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={btn.base}>
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={btn.label}>{debts.length === 0 ? "Add your first debt" : "Add another debt"}</Text>
          </LinearGradient>
        </Pressable>
        <GreenBtn label="ALL DEBTS ARE ADDED" onPress={onDone} icon="arrow-forward" disabled={debts.length === 0} />
      </View>
    </View>
  );
}

// ─── Screen: $0.50/day goal (onboarding step 4) ─────────────────────────────────
function FiftyCentsGoalScreen({
  isDark,
  bg,
  topPad,
  botPad,
  goTo,
  debts,
  dailyGoal,
  onDailyGoalChange,
  onActivate,
  onBack,
}: {
  isDark: boolean;
  bg: string;
  topPad: number;
  botPad: number;
  goTo: (s: Step, dir?: "fwd" | "back") => void;
  debts: Debt[];
  dailyGoal: number;
  onDailyGoalChange: (v: number) => void;
  onActivate: () => void;
  onBack: () => void;
}) {
  const baseline = runStrategy(debts, 0, "avalanche");
  const monthlyExtra = dailyGoal * 30;
  const withExtra = runStrategy(debts, monthlyExtra, "avalanche");
  const payoffBefore = baseline.payoffDate;
  const payoffAfter = withExtra.payoffDate;
  const interestSaved = baseline.totalInterestPaid - withExtra.totalInterestPaid;
  const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const fmtDate = (d: Date) => `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
  const C = isDark ? { text: "#FFFFFF", textSecondary: "rgba(255,255,255,0.65)" } : { text: P.text, textSecondary: "#335547" };

  return (
    <View style={[s.screen, { backgroundColor: bg, paddingTop: topPad, paddingBottom: botPad }]}>
      <LinearGradient colors={isDark ? ["#0A1628","#080E14"] : ["#FFFFFF","#FFFFFF"]} style={StyleSheet.absoluteFill} />
      <BackBtn onPress={onBack} isDark={isDark} topPad={topPad} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 48, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <Text style={[s.splashName, { fontSize: 26, color: C.text, marginBottom: 8 }]}>What if you saved ${dailyGoal.toFixed(2)} a day?</Text>
        <Text style={[s.splashTagline, { color: C.textSecondary, marginBottom: 20, textAlign: "left" }]}>
          Assuming you keep depositing extra into your account, it would be a bit of a wait to have what you want. Wow, that’s cool!
          {"\n\n"}(Optional) But by adding just $.50 or more per day (e.g. skipping the daily coffee), you could get it much faster.
        </Text>

        <View style={[s.streakBubble, { backgroundColor: isDark ? "#2A2018" : "#FFFFFF", borderColor: Colors.primary, marginBottom: 16 }]}>
          <Text style={[s.streakBubbleText, { color: C.text }]}>
            Your debt-free date moves from {"\n"}
            <Text style={{ fontFamily: Fonts.extraBold, textDecorationLine: "line-through" }}>{fmtDate(payoffBefore)}</Text>
            {"\n"}to {"\n"}
            <Text style={{ fontFamily: Fonts.extraBold, color: Colors.primary }}>{fmtDate(payoffAfter)}</Text>
          </Text>
        </View>
        <View style={[s.streakBubble, { backgroundColor: isDark ? "#2A2018" : "#FFF3E0", borderColor: P.orange, marginBottom: 20 }]}>
          <Text style={[s.streakBubbleText, { color: C.text }]}>
            You save <Text style={{ fontFamily: Fonts.extraBold, color: P.orange }}>${Math.round(interestSaved).toLocaleString()}</Text> in interest.
          </Text>
        </View>

        <Text style={[s.splashTagline, { color: C.text, fontFamily: Fonts.semiBold, marginBottom: 12 }]}>Daily amount: ${dailyGoal.toFixed(2)}</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
          {[0.5, 1, 1.5, 2, 2.5, 3, 4, 5].map((v) => {
            const label = v === Math.floor(v) ? `$${v}.00` : `$${v.toFixed(2)}`;
            return (
              <Pressable
                key={v}
                onPress={() => { onDailyGoalChange(v); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                style={[
                  s.dailyAmountBox,
                  {
                    backgroundColor: dailyGoal === v ? P.orange : (isDark ? "#2C2014" : "#FFFFFF"),
                    borderColor: dailyGoal === v ? P.orange : (isDark ? "rgba(232,160,48,0.22)" : "rgba(192,120,32,0.22)"),
                  },
                ]}
              >
                <Text style={[s.dailyAmountText, { color: dailyGoal === v ? "#FFFFFF" : C.text }]} numberOfLines={1}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={[s.footer, { paddingBottom: botPad + 8 }]}>
        <GreenBtn label="Activate this goal" onPress={onActivate} icon="arrow-forward" />
      </View>
    </View>
  );
}

// ─── Screen: Payoff Strategy ─────────────────────────────────────────────────
const STRAT_SAMPLE_DEBTS: {
  name: string;
  balance: number;
  rate: number;
  minPay: number;
  debtType: DebtType;
}[] = [
  { name: "Chase Sapphire", balance: 4800, rate: 24.99, minPay: 96, debtType: "creditCard" },
  { name: "Student Loan",   balance: 12000, rate: 6.8,  minPay: 130, debtType: "studentLoan" },
  { name: "Car Loan",       balance: 7200,  rate: 8.5,  minPay: 220, debtType: "auto" },
  { name: "Medical Bill",   balance: 1400,  rate: 0,    minPay: 50, debtType: "medical" },
];

const STRAT_MAX_MONTHS = 600;

function stratCalcInterest(
  debts: { balance: number; rate: number; minPay: number }[],
  order: number[],
  extraMo: number
): { interest: number; months: number } {
  const ds = order.map((i) => ({
    bal: debts[i].balance,
    rate: debts[i].rate / 100 / 12,
    min: debts[i].minPay,
  }));
  let totalInt = 0, months = 0;
  while (ds.some((d) => d.bal > 0.01) && months < STRAT_MAX_MONTHS) {
    months++;
    let freed = 0;
    for (let i = 0; i < ds.length; i++) {
      if (ds[i].bal <= 0) continue;
      const interest = ds[i].bal * ds[i].rate;
      totalInt += interest;
      ds[i].bal += interest;
    }
    for (let i = 0; i < ds.length; i++) {
      if (ds[i].bal <= 0) continue;
      const pay = Math.min(ds[i].min, ds[i].bal);
      ds[i].bal -= pay;
      if (ds[i].bal <= 0) { freed += ds[i].min - pay; ds[i].bal = 0; }
    }
    let leftover = extraMo + freed;
    for (let i = 0; i < ds.length; i++) {
      if (ds[i].bal <= 0 || leftover <= 0) continue;
      const pay = Math.min(leftover, ds[i].bal);
      ds[i].bal -= pay; leftover -= pay;
    }
  }
  return { interest: Math.round(totalInt), months };
}

/** Payoff duration for strategy cards; capped label avoids raw "600 mo." */
function fmtPayoffMonthsCap(months: number): string {
  if (months <= 0) return "-";
  if (months >= STRAT_MAX_MONTHS) return "50+ yrs (est.)";
  if (months < 12) return `${months} mo`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m ? `${y} yr ${m} mo` : `${y} yr`;
}

/** Same rules as debtsEligibleForStrategy (preview uses lightweight snapshots). */
function debtSnapIncludedInStrategy(d: {
  minPay: number;
  debtType?: DebtType;
  taxPaymentPlan?: boolean;
}): boolean {
  if (d.debtType === "taxDebt") {
    return d.taxPaymentPlan === true && d.minPay > 0;
  }
  return d.minPay > 0;
}

// ─── Screen: Payoff Strategy ──────────────────────────────────────────────────
function PayoffStrategyScreen({
  isDark,
  topPad,
  botPad,
  onboardingDebts,
  onSelect,
  onBack,
}: {
  isDark: boolean;
  bg: string;
  topPad: number;
  botPad: number;
  goTo: (s: Step, dir?: "fwd" | "back") => void;
  onboardingDebts: {
    name: string;
    balance: number;
    rate: number;
    minPay: number;
    debtType: DebtType;
    taxPaymentPlan?: boolean;
  }[];
  onSelect: (strategy: "avalanche" | "snowball" | "custom") => void;
  onBack: () => void;
}) {
  type StratKey = "avalanche" | "snowball" | "custom";
  type StratSnap = {
    name: string;
    balance: number;
    rate: number;
    minPay: number;
    debtType?: DebtType;
    taxPaymentPlan?: boolean;
  };
  const [sel, setSel] = useState<StratKey | null>(null);
  const [customOrder, setCustomOrder] = useState<number[]>([]);
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  const allDebts: StratSnap[] = onboardingDebts.length > 0 ? onboardingDebts : STRAT_SAMPLE_DEBTS;
  const stratDebts = onboardingDebts.length > 0
    ? allDebts.filter(debtSnapIncludedInStrategy)
    : allDebts;
  const excludedFromStrat = onboardingDebts.length > 0 && stratDebts.length < allDebts.length;

  const indices = stratDebts.map((_, i) => i);
  const avOrder = indices.length ? [...indices].sort((a, b) => stratDebts[b].rate - stratDebts[a].rate) : [];
  const sbOrder = indices.length ? [...indices].sort((a, b) => stratDebts[a].balance - stratDebts[b].balance) : [];
  const avRes = indices.length ? stratCalcInterest(stratDebts, avOrder, 0) : { interest: 0, months: 0 };
  const sbRes = indices.length ? stratCalcInterest(stratDebts, sbOrder, 0) : { interest: 0, months: 0 };
  const totalBal = allDebts.reduce((s, d) => s + d.balance, 0);

  // Compute "true" min-payments-only baseline (no payment reallocation), same debts as strategy
  const baselineInt = stratDebts.reduce((total, d) => {
    let bal = d.balance, months = 0;
    const r = d.rate / 100 / 12;
    while (bal > 0.01 && months < STRAT_MAX_MONTHS) {
      months++;
      const interest = bal * r;
      total += interest;
      bal += interest;
      bal -= Math.min(d.minPay, bal);
    }
    return total;
  }, 0);
  const avSaved = indices.length ? Math.max(0, Math.round(baselineInt - avRes.interest)) : 0;
  const sbSaved = indices.length ? Math.max(0, Math.round(baselineInt - sbRes.interest)) : 0;

  const customOrderValid =
    indices.length > 0 &&
    customOrder.length === stratDebts.length &&
    customOrder.every((i) => i >= 0 && i < stratDebts.length) &&
    new Set(customOrder).size === stratDebts.length;
  const cuOrderForCalc = customOrderValid ? customOrder : indices;
  const cuRes = indices.length ? stratCalcInterest(stratDebts, cuOrderForCalc, 0) : { interest: 0, months: 0 };
  const cuSaved = indices.length ? Math.max(0, Math.round(baselineInt - cuRes.interest)) : 0;

  const shimmerX = shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [-SW * 0.55, SW * 1.3] });

  const bestSavingsKey: StratKey = avSaved >= sbSaved ? "avalanche" : "snowball";

  // Pre-select the best savings method so users don't have to guess.
  // If the user later taps a different method, their selection stays.
  useEffect(() => {
    setSel((prev) => prev ?? bestSavingsKey);
  }, [bestSavingsKey]);

  useEffect(() => {
    setCustomOrder(stratDebts.map((_, i) => i));
  }, [stratDebts.length]);

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, { toValue: 1, duration: 2400, useNativeDriver: true, easing: Easing.linear })
    ).start();
  }, []);

  function selectCard(strat: StratKey) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSel(strat);
  }

  function moveUp(idx: number) {
    if (idx === 0) return;
    const next = [...customOrder];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    setCustomOrder(next);
  }
  function moveDown(idx: number) {
    if (idx === customOrder.length - 1) return;
    const next = [...customOrder];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    setCustomOrder(next);
  }

  const customDragData = useMemo(
    () => customOrder.map((debtIdx) => ({ debtIdx })),
    [customOrder]
  );

  const MainScroll = Platform.OS === "web" ? ScrollView : NestableScrollContainer;

  const BLUE = "#1A6FC4";
  const DARK = "#1A0A00";
  // Contrast rule: avoid colored/brown text on shaded surfaces.
  const MUTED = "#111111";
  const CARD = "#ffffff";
  const CARD_SEL = "#EFF6FF";
  const BG = "#F7F2EA";
  const BORDER = "#E0D8CE";
  const BORDER_SEL = "#1A6FC4";

  type CardMeta = {
    emoji: string;
    // LinearGradient's `colors` prop expects a tuple with at least 2 entries.
    iconBg: [string, string, ...string[]];
    name: string;
    sub: string;
    desc: string;
    popular?: boolean;
    statVal1: string; statLbl1: string; statNote1: string; statColor1: string;
    statVal2: string; statLbl2: string; statNote2: string; statColor2: string;
    tags: { label: string; bg: string; color: string }[];
  };

  const cards: Record<StratKey, CardMeta> = {
    avalanche: {
      emoji: "🔥",
      iconBg: ["#FF6B35", "#E84010"],
      name: "Avalanche",
      sub: "Highest interest rate first",
      desc: "Attack the debt charging you the most interest. Mathematically optimal - you pay the least total money. Cold, calculated, and powerful.",
      statVal1: indices.length ? fmtUsd0(avSaved) : "-", statLbl1: "Est. interest saved", statNote1: "vs. min. payments only", statColor1: "#166534",
      statVal2: indices.length ? fmtPayoffMonthsCap(avRes.months) : "-", statLbl2: "Est. payoff time", statNote2: "at current payments", statColor2: "#1E40AF",
      tags: [
        { label: "💰 Saves most money", bg: "#DCFCE7", color: "#111111" },
        { label: "⏳ Longer to first win", bg: "#FEF3C7", color: "#111111" },
        { label: "📐 Optimal strategy", bg: "#DBEAFE", color: "#111111" },
      ],
    },
    snowball: {
      emoji: "❄️",
      iconBg: ["#4AB8F0", "#1A88D0"],
      name: "Snowball",
      sub: "Smallest balance first",
      desc: "Knock out your smallest debt first. Fast wins build momentum and keep you motivated. Backed by behavioral science - progress is real fuel.",
      popular: true,
      statVal1: indices.length ? fmtUsd0(sbSaved) : "-", statLbl1: "Est. interest saved", statNote1: "vs. min. payments only", statColor1: "#166534",
      statVal2: indices.length ? fmtPayoffMonthsCap(sbRes.months) : "-", statLbl2: "Est. payoff time", statNote2: "first debt in ~4 mo.", statColor2: "#1E40AF",
      tags: [
        { label: "🏆 Fastest first win", bg: "#DCFCE7", color: "#111111" },
        { label: "🧠 Best for motivation", bg: "#DBEAFE", color: "#111111" },
        { label: "💸 Costs a bit more", bg: "#FEF3C7", color: "#111111" },
      ],
    },
    custom: {
      emoji: "🎯",
      iconBg: ["#9B59B6", "#7B3FA6"],
      name: "Custom Order",
      sub: "You choose the priority",
      desc: "Put your debts in whatever order makes sense for your life. Drag rows to reorder; numbers update to match your order.",
      statVal1: indices.length ? fmtUsd0(cuSaved) : "-", statLbl1: "Est. interest saved", statNote1: "vs. min. payments only", statColor1: "#166534",
      statVal2: indices.length ? fmtPayoffMonthsCap(cuRes.months) : "-", statLbl2: "Est. payoff time", statNote2: "at current payments", statColor2: "#1E40AF",
      tags: [
        { label: "🎨 Full control", bg: "#F3E8FF", color: "#111111" },
        { label: "💡 Personalized", bg: "#DBEAFE", color: "#111111" },
      ],
    },
  };

  const continueWithSelection = () => {
    if (!sel) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelect(sel);
  };


  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* Progress bar */}
      <View style={{ height: 6, backgroundColor: BORDER, marginTop: topPad + 8 }}>
        <View style={{ height: 6, width: "62%", backgroundColor: BLUE, borderTopRightRadius: 3, borderBottomRightRadius: 3 }} />
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 5 }}>
        <Pressable onPress={onBack} hitSlop={8} style={{ flexDirection: "row", alignItems: "center", marginRight: 10 }}>
          <Ionicons name="chevron-back" size={16} color="#0D3B66" />
          <Text style={{ fontFamily: Fonts.bold, fontSize: 12, color: "#0D3B66" }}>Back</Text>
        </Pressable>
        <Text style={{ fontFamily: Fonts.bold, fontSize: 12, color: MUTED, textTransform: "uppercase", letterSpacing: 1, flex: 1 }}>Step 3 of 4</Text>
        <Text style={{ fontFamily: Fonts.bold, fontSize: 12, color: MUTED, textTransform: "uppercase", letterSpacing: 1 }}>62%</Text>
      </View>

      {/* Header: Dex + title */}
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, paddingHorizontal: 16, paddingTop: 6 }}>
        <DexCoin size={54} mood={ONBOARDING_DEX.step3Method.mood} motion={ONBOARDING_DEX.step3Method.motion} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: Fonts.extraBold, fontSize: 12, color: BLUE, textTransform: "uppercase", letterSpacing: 1.9, marginBottom: 2 }}>Step 3</Text>
          <Text style={{ fontFamily: Fonts.black, fontSize: 22, color: DARK, lineHeight: 26 }}>
            Choose Your <Text style={{ color: BLUE }}>Payoff Method</Text>
          </Text>
        </View>
      </View>

      {/* Speech bubble */}
      <View style={{ marginHorizontal: 16, marginTop: 8, marginBottom: 4, backgroundColor: "#fff", borderWidth: 2, borderColor: "#D4C8B8", borderRadius: 16, paddingVertical: 14, paddingHorizontal: 18, shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8 }}>
        <View style={{ position: "absolute", top: -10, left: 22, width: 0, height: 0, borderLeftWidth: 8, borderRightWidth: 8, borderBottomWidth: 10, borderLeftColor: "transparent", borderRightColor: "transparent", borderBottomColor: "#D4C8B8" }} />
        <View style={{ position: "absolute", top: -7, left: 24, width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderBottomWidth: 8, borderLeftColor: "transparent", borderRightColor: "transparent", borderBottomColor: "#fff" }} />
        <Text style={{ fontFamily: Fonts.bold, fontSize: 16, color: DARK, lineHeight: 24 }}>
          We chose the one with best savings. If you want to change it, click on it and continue at bottom of screen.
        </Text>
      </View>

      {/* Top CTA so users do not need to scroll */}
      <Pressable
        onPress={continueWithSelection}
        style={{
          marginHorizontal: 16,
          marginTop: 8,
          marginBottom: 6,
          borderRadius: 14,
          overflow: "hidden",
          opacity: sel ? 1 : 0.42,
        }}
      >
        <LinearGradient colors={["#1A6FC4", "#0D5BAE"]} start={{ x: 0.13, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ paddingVertical: 13, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontFamily: Fonts.extraBold, fontSize: 15, color: "white", textAlign: "center", paddingHorizontal: 12 }}>
            Go with your choice, continue to my dream
          </Text>
        </LinearGradient>
      </Pressable>

      {/* Debt summary chip */}
      <View style={{ marginHorizontal: 16, marginTop: 8, marginBottom: 4, backgroundColor: "#1A0A00", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View>
          <Text style={{ fontFamily: Fonts.extraBold, fontSize: 12, color: "#FFFFFF", textTransform: "uppercase", letterSpacing: 1.5 }}>Your Total Debt</Text>
          <Text style={{ fontFamily: Fonts.black, fontSize: 22, color: "#FFFFFF" }}>{fmtUsd0(totalBal)}</Text>
        </View>
        <View style={{ backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
          <Text style={{ fontFamily: Fonts.extraBold, fontSize: 13, color: "#FFFFFF" }}>{allDebts.length} account{allDebts.length !== 1 ? "s" : ""}</Text>
        </View>
      </View>

      {/* NestableScrollContainer on native so drag-reorder works inside the page */}
      <MainScroll style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 8, paddingBottom: Math.max(botPad, 20) + 32 }} showsVerticalScrollIndicator={false}>

        {onboardingDebts.length > 0 && stratDebts.length === 0 && (
          <View style={{ backgroundColor: "#FEF2F2", borderWidth: 1.5, borderColor: "#FECACA", borderRadius: 14, padding: 14, marginBottom: 12 }}>
            <Text style={{ fontFamily: Fonts.extraBold, fontSize: 14, color: "#991B1B", marginBottom: 6 }}>
              No debts qualify for payoff estimates yet
            </Text>
            <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: "#7F1D1D", lineHeight: 19, marginBottom: 10 }}>
              Strategy math needs at least one debt with a minimum payment. Tax debt only counts if you turn on “payment plan” and enter a monthly payment. Your total balance above still includes every debt you added.
            </Text>
            <Pressable onPress={onBack} style={{ flexDirection: "row", alignItems: "center", alignSelf: "flex-start", backgroundColor: "#DC2626", borderRadius: 8, paddingVertical: 7, paddingHorizontal: 12, gap: 4 }}>
              <Ionicons name="chevron-back" size={14} color="white" />
              <Text style={{ fontFamily: Fonts.bold, fontSize: 13, color: "white" }}>Update debts</Text>
            </Pressable>
          </View>
        )}

        {excludedFromStrat && stratDebts.length > 0 && (
          <View style={{ backgroundColor: "#EFF6FF", borderWidth: 1.5, borderColor: "#BFDBFE", borderRadius: 14, padding: 14, marginBottom: 12, flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
            <Text style={{ fontSize: 18, lineHeight: 22 }}>ℹ️</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: Fonts.extraBold, fontSize: 14, color: "#1E3A5F", marginBottom: 4 }}>
                Some balances are outside this estimate
              </Text>
              <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: "#1E40AF", lineHeight: 19 }}>
                Payoff times and interest saved below include only debts with a payment plan (for tax) or a minimum payment. Your total debt figure still includes every account.
              </Text>
            </View>
          </View>
        )}

        {/* Error: all debts have 0% APR — planner cannot calculate interest savings */}
        {onboardingDebts.length > 0 && stratDebts.length > 0 && stratDebts.every(d => d.rate === 0) && (
          <View style={{ backgroundColor: "#FFF7ED", borderWidth: 1.5, borderColor: "#F59E0B", borderRadius: 14, padding: 14, marginBottom: 12, flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
            <Text style={{ fontSize: 20, lineHeight: 24 }}>⚠️</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: Fonts.extraBold, fontSize: 14, color: WarmContrast.textOnYellowBold, marginBottom: 4 }}>
                Interest rates are set to 0%
              </Text>
              <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: "#78350F", lineHeight: 19, marginBottom: 10 }}>
                Your debts show no interest, so the planner can't calculate savings. Go back and add APR rates to get real payoff projections.
              </Text>
              <Pressable onPress={onBack} style={{ flexDirection: "row", alignItems: "center", alignSelf: "flex-start", backgroundColor: "#F59E0B", borderRadius: 8, paddingVertical: 7, paddingHorizontal: 12, gap: 4 }}>
                <Ionicons name="chevron-back" size={14} color="white" />
                <Text style={{ fontFamily: Fonts.bold, fontSize: 13, color: "white" }}>Fix Interest Rates</Text>
              </Pressable>
            </View>
          </View>
        )}

        {(["avalanche", "snowball", "custom"] as StratKey[]).map((key) => {
          const meta = cards[key];
          const isSel = sel === key;
          return (
            <View
              key={key}
              style={{
                backgroundColor: isSel ? CARD_SEL : CARD,
                borderWidth: 2.5,
                borderColor: isSel ? BORDER_SEL : BORDER,
                borderRadius: 18,
                paddingHorizontal: 18,
                paddingTop: 22,
                paddingBottom: 22,
                marginBottom: 12,
                shadowColor: BLUE,
                shadowOpacity: isSel ? 0.2 : 0,
                shadowOffset: { width: 0, height: 6 },
                shadowRadius: 20,
                elevation: isSel ? 6 : 0,
              }}
            >
            <Pressable onPress={() => selectCard(key)} accessibilityRole="button" accessibilityState={{ selected: isSel }}>
              {/* Selected ring */}
              <View style={{
                position: "absolute", top: 12, right: 12,
                width: 22, height: 22, borderRadius: 11,
                backgroundColor: isSel ? BLUE : "#F7F2EA",
                borderWidth: 2.5, borderColor: isSel ? BLUE : "#D4C8B8",
                alignItems: "center", justifyContent: "center",
              }}>
                {isSel && <Text style={{ color: "white", fontSize: 13, fontFamily: Fonts.extraBold }}>✓</Text>}
              </View>

              {/* Popular badge */}
              {meta.popular && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: undefined, marginBottom: 8, alignSelf: "flex-start" }}>
                  <LinearGradient colors={["#F5C030", "#D4900A"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 3 }}>
                    <Text style={{ fontFamily: Fonts.extraBold, fontSize: 12, color: "white", textTransform: "uppercase", letterSpacing: 1 }}>⭐ Most Popular</Text>
                  </LinearGradient>
                </View>
              )}

              {/* Top row: icon + name */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <LinearGradient colors={meta.iconBg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontSize: 26 }}>{meta.emoji}</Text>
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: Fonts.black, fontSize: 20, color: isSel ? "#1A5FAE" : DARK, lineHeight: 22 }}>{meta.name}</Text>
                  <Text style={{ fontFamily: Fonts.extraBold, fontSize: 12, color: MUTED, textTransform: "uppercase", letterSpacing: 1.5, marginTop: 2 }}>{meta.sub}</Text>
                </View>
              </View>

              {/* Description */}
              <Text style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: "#2A1808", lineHeight: 22, marginBottom: 14 }}>{meta.desc}</Text>

              {/* Stats grid */}
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
                {[
                  { val: meta.statVal1, lbl: meta.statLbl1, note: meta.statNote1, color: meta.statColor1 },
                  { val: meta.statVal2, lbl: meta.statLbl2, note: meta.statNote2, color: meta.statColor2 },
                ].map((st, idx) => (
                  <View key={idx} style={{ flex: 1, backgroundColor: isSel ? "#EFF6FF" : "#F7F2EA", borderWidth: 1.5, borderColor: isSel ? "rgba(26,111,196,0.2)" : BORDER, borderRadius: 12, paddingVertical: 26, paddingHorizontal: 10, alignItems: "center", justifyContent: "center", minHeight: 150 }}>
                    <Text
                      style={{ fontFamily: Fonts.black, fontSize: 30, color: isSel ? st.color : "#111111", lineHeight: 34, textAlign: "center" }}
                      numberOfLines={2}
                      adjustsFontSizeToFit
                      minimumFontScale={0.45}
                    >
                      {st.val}
                    </Text>
                    <Text style={{ fontFamily: Fonts.extraBold, fontSize: 13, color: MUTED, textTransform: "uppercase", letterSpacing: 0.8, marginTop: 6, textAlign: "center" }}>{st.lbl}</Text>
                    <Text style={{ fontFamily: Fonts.semiBold, fontSize: 12, color: "#111111", marginTop: 3, textAlign: "center" }}>{st.note}</Text>
                  </View>
                ))}
              </View>

              {/* Tags */}
              <View style={{ flexDirection: "column", gap: 6 }}>
                {meta.tags.map((tag) => (
                  <View key={tag.label} style={{ backgroundColor: tag.bg, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, alignSelf: "flex-start" }}>
                    <Text style={{ fontFamily: Fonts.extraBold, fontSize: 13, color: tag.color }}>{tag.label}</Text>
                  </View>
                ))}
              </View>
            </Pressable>

              {/* Outside card Pressable so drag gestures are not stolen (native) */}
              {/* Custom accordion — drag-and-drop on iOS/Android; large arrows on web */}
              {key === "custom" && isSel && (
                <View style={{ marginTop: 12, borderTopWidth: 2, borderTopColor: BORDER, paddingTop: 12 }}>
                  <Text style={{ fontFamily: Fonts.semiBold, fontSize: 14, color: MUTED, lineHeight: 20, marginBottom: 10 }}>
                    {Platform.OS === "web"
                      ? "Use the up and down buttons to set payoff order. #1 is paid first."
                      : "Press and hold a row, then drag to reorder. #1 is paid first. You can also use the grip on the right."}
                  </Text>
                  {Platform.OS === "web" ? (
                    customOrder.map((debtIdx, pos) => {
                      const d = stratDebts[debtIdx];
                      return (
                        <View key={debtIdx} style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#F7F2EA", borderWidth: 2, borderColor: BORDER, borderRadius: 11, paddingVertical: 8, paddingHorizontal: 10, marginBottom: 7 }}>
                          <View style={{ flexDirection: "column", gap: 6 }}>
                            <Pressable
                              onPress={() => moveUp(pos)}
                              disabled={pos === 0}
                              accessibilityLabel="Move up"
                              style={{ width: 48, height: 44, borderRadius: 10, backgroundColor: pos === 0 ? "#E8E4DE" : "#DBEAFE", alignItems: "center", justifyContent: "center" }}
                            >
                              <Ionicons name="chevron-up" size={28} color={pos === 0 ? "#B0AAA2" : BLUE} />
                            </Pressable>
                            <Pressable
                              onPress={() => moveDown(pos)}
                              disabled={pos === customOrder.length - 1}
                              accessibilityLabel="Move down"
                              style={{ width: 48, height: 44, borderRadius: 10, backgroundColor: pos === customOrder.length - 1 ? "#E8E4DE" : "#DBEAFE", alignItems: "center", justifyContent: "center" }}
                            >
                              <Ionicons name="chevron-down" size={28} color={pos === customOrder.length - 1 ? "#B0AAA2" : BLUE} />
                            </Pressable>
                          </View>
                          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: BLUE, alignItems: "center", justifyContent: "center" }}>
                            <Text style={{ fontFamily: Fonts.black, fontSize: 14, color: "white" }}>{pos + 1}</Text>
                          </View>
                          <View style={{ flex: 1, minWidth: 0 }}>
                            <Text style={{ fontFamily: Fonts.extraBold, fontSize: 16, color: DARK }} numberOfLines={1}>{d.name}</Text>
                            <Text style={{ fontFamily: Fonts.bold, fontSize: 12, color: MUTED }}>{d.rate}% APR</Text>
                          </View>
                          <Text style={{ fontFamily: Fonts.black, fontSize: 16, color: BLUE }}>{fmtUsd0(d.balance)}</Text>
                        </View>
                      );
                    })
                  ) : (
                    <NestableDraggableFlatList
                      data={customDragData}
                      keyExtractor={(item) => `order-${item.debtIdx}`}
                      scrollEnabled={false}
                      activationDistance={14}
                      onDragEnd={({ data }) => {
                        setCustomOrder(data.map((x) => x.debtIdx));
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      }}
                      renderItem={({ item, getIndex, drag, isActive }: RenderItemParams<{ debtIdx: number }>) => {
                        const d = stratDebts[item.debtIdx];
                        if (!d) return null;
                        const pos = (getIndex() ?? 0) + 1;
                        return (
                          <Pressable
                            onLongPress={drag}
                            delayLongPress={220}
                            disabled={isActive}
                            accessibilityRole="button"
                            accessibilityLabel={`${d.name}, position ${pos} in payoff order`}
                            accessibilityHint="Long press, then drag to change order"
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 10,
                              backgroundColor: "#F7F2EA",
                              borderWidth: 2,
                              borderColor: isActive ? BLUE : BORDER,
                              borderRadius: 11,
                              paddingVertical: 12,
                              paddingHorizontal: 12,
                              marginBottom: 7,
                              opacity: isActive ? 0.95 : 1,
                            }}
                          >
                            <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: BLUE, alignItems: "center", justifyContent: "center" }}>
                              <Text style={{ fontFamily: Fonts.black, fontSize: 15, color: "white" }}>{pos}</Text>
                            </View>
                            <View style={{ flex: 1, minWidth: 0 }}>
                              <Text style={{ fontFamily: Fonts.extraBold, fontSize: 16, color: DARK }} numberOfLines={1}>{d.name}</Text>
                              <Text style={{ fontFamily: Fonts.bold, fontSize: 12, color: MUTED }}>{d.rate}% APR</Text>
                            </View>
                            <Text style={{ fontFamily: Fonts.black, fontSize: 16, color: BLUE }}>{fmtUsd0(d.balance)}</Text>
                            <View style={{ paddingLeft: 4, paddingVertical: 4 }} accessibilityElementsHidden>
                              <Ionicons name="reorder-three" size={32} color={MUTED} />
                            </View>
                          </Pressable>
                        );
                      }}
                    />
                  )}
                </View>
              )}
            </View>
          );
        })}

        {/* CTA */}
        <Pressable
          onPress={continueWithSelection}
          style={{
            width: "100%", borderRadius: 22, overflow: "hidden", marginTop: 2,
            opacity: sel ? 1 : 0.42,
            shadowColor: "#1A6FC4", shadowOffset: { width: 0, height: 10 },
            shadowOpacity: sel ? 0.4 : 0, shadowRadius: 28, elevation: sel ? 6 : 0,
          }}
        >
          <LinearGradient colors={["#1A6FC4", "#0D5BAE"]} start={{ x: 0.13, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ paddingVertical: 15, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontFamily: Fonts.extraBold, fontSize: 17, color: "white" }}>
              Continue to Dream Goal →
            </Text>
            <Animated.View pointerEvents="none" style={{
              position: "absolute", top: 0, bottom: 0, width: "55%",
              transform: [{ translateX: shimmerX }],
            }}>
              <LinearGradient colors={["transparent", "rgba(255,255,255,0.2)", "transparent"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
            </Animated.View>
          </LinearGradient>
        </Pressable>
        <Text style={{ fontFamily: Fonts.bold, fontSize: 13, color: MUTED, textAlign: "center", marginTop: 6 }}>
          {sel ? "" : "Select a method above to continue"}
        </Text>

        <Text style={{ fontFamily: Fonts.semiBold, fontSize: 11, color: WarmContrast.textMuted, textAlign: "center", marginTop: 10, marginBottom: 8, lineHeight: 16, paddingHorizontal: 4 }}>
          Estimates use dollar amounts in standard US format. Payoff math only includes debts that have a minimum payment. Tax debt without a formal payment plan is left out of the strategy math, but your total balance still includes every debt. Payoff time is capped at about 50 years in the calculator. If you see that long a horizon, minimums may not be covering interest on every debt. You can edit amounts or add extra payment later. Assumes no new charges. Real results will vary.
        </Text>
      </MainScroll>
    </View>
  );
}

// ─── Screen: Dream Goal Selection (onboarding step 5) ──────────────────────
function DexSmall({ size = 52 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 90 90">
      <Ellipse cx={28} cy={82} rx={14} ry={7} fill="#7A3A0C" />
      <Ellipse cx={62} cy={82} rx={14} ry={7} fill="#7A3A0C" />
      <Ellipse cx={16} cy={46} rx={9} ry={16} fill="#EAA835" transform="rotate(18,16,46)" />
      <Ellipse cx={74} cy={46} rx={9} ry={16} fill="#EAA835" transform="rotate(-18,74,46)" />
      <Circle cx={45} cy={44} r={33} fill="#EAA835" />
      <Circle cx={20} cy={22} r={10} fill="#D09828" />
      <Circle cx={70} cy={22} r={10} fill="#D09828" />
      <Ellipse cx={33} cy={37} rx={13} ry={14} fill="white" />
      <Ellipse cx={57} cy={37} rx={13} ry={14} fill="white" />
      <Circle cx={35} cy={39} r={9} fill="#1A0800" />
      <Circle cx={59} cy={39} r={9} fill="#1A0800" />
      <Circle cx={31} cy={35} r={3.5} fill="white" />
      <Circle cx={55} cy={35} r={3.5} fill="white" />
      <Path d="M27 62 Q45 76 63 62" stroke="#A86010" strokeWidth={2.8} fill="none" strokeLinecap="round" />
      <SvgText x={8}  y={16} fontSize={13} fill="#E8A020">✨</SvgText>
      <SvgText x={63} y={15} fontSize={12} fill="#E8A020">✨</SvgText>
      <SvgText x={57} y={27} fontSize={9}  fill="#C07820">★</SvgText>
    </Svg>
  );
}


export function DreamGoalScreen({
  isDark,
  bg,
  topPad,
  botPad,
  goTo,
  debts,
  onComplete,
  onBack,
  initialDreamName,
  initialDreamCost,
  showStepProgress = true,
}: {
  isDark: boolean;
  bg: string;
  topPad: number;
  botPad: number;
  goTo: (s: Step, dir?: "fwd" | "back") => void;
  debts: Debt[];
  onComplete: (name: string, cost: string, extraPerDaySelected?: number) => void;
  onBack: () => void;
  initialDreamName?: string;
  initialDreamCost?: string | number;
  showStepProgress?: boolean;
}) {
  const BG     = "#F7F2EA";
  const BLUE   = "#1A6FC4";
  const GOLD   = "#F5C030";
  const DARK   = "#1A0A00";
  const MUTED  = "#8A7060";
  const BORDER = "#E0D8CE";

  const SW = Dimensions.get("window").width;

  const DREAM_TILES = [
    { emoji: "✈️",  name: "Trip" },
    { emoji: "🚗",  name: "New Car" },
    { emoji: "🎓",  name: "College" },
    { emoji: "🏡",  name: "Home" },
    { emoji: "🎟️",  name: "Special Activity" },
    { emoji: "🏖️", name: "Retire" },
    { emoji: "🛡️", name: "Safety Net" },
    { emoji: "👗",  name: "Wardrobe" },
    { emoji: "🌟",  name: "Other" },
  ];

  const initialNameTrim = (initialDreamName ?? "").trim();
  const initialCostStr = initialDreamCost === undefined || initialDreamCost === null
    ? ""
    : String(initialDreamCost).replace(/[^0-9]/g, "");
  const matchedTile = initialNameTrim
    ? DREAM_TILES.find((t) => t.name.toLowerCase() === initialNameTrim.toLowerCase())
    : undefined;

  const [dreamName,   setDreamName]   = useState(initialNameTrim);
  const [dreamCost,   setDreamCost]   = useState(initialCostStr);
  const [customDream, setCustomDream] = useState(matchedTile ? "" : initialNameTrim);
  const [selTile,     setSelTile]     = useState(matchedTile ? matchedTile.name : "");
  const [extraPerDay, setExtraPerDay] = useState(0.5);
  const [extraMonthlyInput, setExtraMonthlyInput] = useState("");
  const [bubbleText,  setBubbleText]  = useState(
    "Choose a dream that motivates you to stay consistent - it can be anything. Estimate the cost, tap your pick, then continue. You've got this. 🌟"
  );
  const [bubbleLit,   setBubbleLit]   = useState(false);
  const parseWholeMoney = (v: string): number => {
    const digits = (v || "").replace(/[^0-9]/g, "");
    return digits ? parseInt(digits, 10) : 0;
  };
  const formatWholeMoney = (n: number): string =>
    Math.max(0, Math.round(n)).toLocaleString("en-US");

  // Cache payoff estimates keyed by integer extraMonthly.
  // Without this, the simulation can get expensive during slider drags.
  const payoffCacheRef = useRef<Map<number, number>>(new Map());

  const shimmerAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, { toValue: 1, duration: 2200, useNativeDriver: true, easing: Easing.linear })
    ).start();
  }, []);

  useEffect(() => {
    // Debts changed (or were rehydrated) — clear cached simulations.
    payoffCacheRef.current.clear();
  }, [debts]);

  // Prefill dream name + cost when opening from Settings.
  useEffect(() => {
    const nameTrim = (initialDreamName ?? "").trim();
    const costStr = initialDreamCost === undefined || initialDreamCost === null
      ? ""
      : String(initialDreamCost).replace(/[^0-9]/g, "");
    const tile = nameTrim
      ? DREAM_TILES.find((t) => t.name.toLowerCase() === nameTrim.toLowerCase())
      : undefined;
    setDreamName(nameTrim);
    setDreamCost(costStr);
    setSelTile(tile ? tile.name : "");
    setCustomDream(tile ? "" : nameTrim);
  }, [initialDreamName, initialDreamCost]);

  const shimmerX = shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [-SW * 0.55, SW * 1.3] });

  // Normalize to a local simulation shape so we always have `rate`.
  type SimDebt = { id: string; name: string; balance: number; rate: number; minimumPayment: number };
  const excludedTaxDebtCount = debts.filter(
    (d) => d.debtType === "taxDebt" && d.taxPaymentPlan !== true && (d.balance ?? 0) > 0
  ).length;

  const eff: SimDebt[] = debts.length > 0
    ? debts
        .filter((d) => !(d.debtType === "taxDebt" && d.taxPaymentPlan !== true))
        .map((d) => ({
          id: d.id,
          name: d.name,
          balance: Math.max(0, Number(d.balance) || 0),
          rate: Math.max(0, Number(d.apr) || 0),
          minimumPayment: Math.max(0, Number(d.minimumPayment) || 0),
        }))
    : [
        { id: "s1", name: "Card A", balance: 12400, rate: 24.99, minimumPayment: 248 },
        { id: "s2", name: "Card B", balance: 8200,  rate: 22.49, minimumPayment: 164 },
        { id: "s3", name: "Card C", balance: 5800,  rate: 18.0,  minimumPayment: 116 },
      ];
  const totalMin = eff.reduce((s, d) => s + (d.minimumPayment || 0), 0);

  function calcDebtPayoff(extraMonthly: number): number {
    const cached = payoffCacheRef.current.get(extraMonthly);
    if (cached !== undefined) return cached;
    const simDebts = eff.map((d) => ({
      balance: d.balance,
      rate: d.rate,
      minimumPayment: d.minimumPayment,
    }));
    const result = simulateDebtPayoffMonths(simDebts, extraMonthly, 720);
    payoffCacheRef.current.set(extraMonthly, result);
    return result;
  }

  function fmt(months: number): string {
    if (!Number.isFinite(months) || months < 0) return "-";
    if (months === Number.POSITIVE_INFINITY) return "Over 60 yrs";
    if (months <= 1) return "1 mo.";
    if (months < 24) return `${months} mo.`;
    const y = Math.floor(months / 12), m = months % 12;
    return `${y.toLocaleString("en-US")} yr${y > 1 ? "s" : ""}${m > 0 ? ` ${m} mo.` : ""}`;
  }

  const firstMonthInterestTotal = dreamFirstMonthInterest(
    eff.map((d) => ({ balance: d.balance, rate: d.rate, minimumPayment: d.minimumPayment }))
  );

  function getTargetDate(months: number): string {
    if (months >= 999) return "Unknown";
    const d = new Date();
    d.setMonth(d.getMonth() + Math.round(months));
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }

  const sliderMonthly = Math.max(0, Math.round(extraPerDay * 30.44));
  const customExtraMonthly = parseWholeMoney(extraMonthlyInput);
  const usingCustomExtra = customExtraMonthly > 0;
  const extraMonthly  = usingCustomExtra ? customExtraMonthly : sliderMonthly;
  const effectivePerDay = extraMonthly / 30.44;
  const debtMonths    = calcDebtPayoff(extraMonthly);
  const baseDebt      = calcDebtPayoff(0);
  /** When minimums don't cover interest, base is ∞ but extra can yield a finite payoff — don't show "0 months saved". */
  const extraUnlocksPayoff =
    extraMonthly > 0 && !Number.isFinite(baseDebt) && Number.isFinite(debtMonths);
  const monthsSaved =
    Number.isFinite(baseDebt) && Number.isFinite(debtMonths)
      ? Math.max(0, baseDebt - debtMonths)
      : 0;
  const savingsMo     = totalMin + extraMonthly;
  const paymentCoversInterest = savingsMo > firstMonthInterestTotal;

  function fmtDebtPayoff(months: number): string {
    if (eff.length === 0) return "-";
    // Infinity is not finite — handle before any Number.isFinite check (otherwise shows bare "-").
    if (months === Number.POSITIVE_INFINITY) {
      return paymentCoversInterest ? "Over 60 yrs" : "Not covering interest yet";
    }
    if (Number.isNaN(months) || months < 0) return "-";
    if (months === 0) return "Now";
    return fmt(months);
  }
  const cost          = parseWholeMoney(dreamCost);
  const dreamMonthsN  = dreamName && cost > 0 ? monthsToSavingsGoal(savingsMo, cost, 0.04) : null;
  const totalMonthsN =
    dreamMonthsN !== null && Number.isFinite(debtMonths)
      ? debtMonths + dreamMonthsN
      : null;
  const showVision    = !!(dreamName && cost > 0 && dreamMonthsN !== null);

  function pickDream(tile: { emoji: string; name: string }) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelTile(tile.name);
    setDreamName(tile.name);
    setCustomDream("");
    const lines = [
      `I LOVE that dream - ${tile.name}! Let's make it real. 🌟`,
      `YES! You deserve this! 🎉`,
      `Amazing! Picture yourself there, debt-free with money to spare. 💪`,
      `That's a GREAT dream. You'll get there fast! 🚀`,
    ];
    setBubbleText(lines[Math.floor(Math.random() * lines.length)]);
    setBubbleLit(true);
    setTimeout(() => setBubbleLit(false), 2800);
  }

  // When opened from Settings (no step bar), the first row must clear the status bar — otherwise "< Back" sits under the clock.
  const topBarPaddingTop = showStepProgress ? 5 : topPad + 14;

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* Progress bar (onboarding flow only) */}
      {showStepProgress && (
        <View style={{ height: 6, backgroundColor: BORDER, marginTop: topPad + 8 }}>
          <View style={{ height: 6, width: "88%", backgroundColor: BLUE, borderTopRightRadius: 3, borderBottomRightRadius: 3 }} />
        </View>
      )}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 18,
          paddingTop: topBarPaddingTop,
          paddingBottom: 8,
        }}
      >
        <Pressable onPress={onBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Go back" style={{ flexDirection: "row", alignItems: "center", marginRight: 10, minHeight: 44, justifyContent: "center" }}>
          <Text style={{ fontFamily: Fonts.bold, fontSize: 15, color: BLUE }}>{"< Back"}</Text>
        </Pressable>
        {showStepProgress && (
          <>
            <Text style={{ fontFamily: Fonts.bold, fontSize: 14, color: MUTED, textTransform: "uppercase", letterSpacing: 1, flex: 1 }}>Step 4 of 4</Text>
            <Text style={{ fontFamily: Fonts.bold, fontSize: 14, color: MUTED, textTransform: "uppercase", letterSpacing: 1 }}>88%</Text>
          </>
        )}
      </View>

      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: showStepProgress ? 8 : 14 }}>
        {showStepProgress && (
          <Text style={{ fontFamily: Fonts.extraBold, fontSize: 14, color: BLUE, textTransform: "uppercase", letterSpacing: 1.9, marginBottom: 8 }}>Step 4 - Almost There</Text>
        )}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <DexCoin size={72} mood={ONBOARDING_DEX.step4Dream.mood} motion={ONBOARDING_DEX.step4Dream.motion} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: Fonts.black, fontSize: 24, color: DARK, lineHeight: 30 }}>
              Pick a <Text style={{ color: BLUE, fontStyle: "italic" }}>dream</Text> that keeps you consistent.
            </Text>
            <Text style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: MUTED, lineHeight: 22, marginTop: 8 }}>
              It can be anything - estimate the amount, select it below, then continue when you're ready.
            </Text>
          </View>
        </View>
      </View>

      {/* Speech bubble */}
      <View style={{ marginHorizontal: 16, marginTop: 4, marginBottom: 0, backgroundColor: bubbleLit ? "#FFF8EE" : "#fff", borderWidth: 2, borderColor: bubbleLit ? "#D4900A" : "#D4C8B8", borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14 }}>
        <View style={{ position: "absolute", top: -10, left: 22, width: 0, height: 0, borderLeftWidth: 8, borderRightWidth: 8, borderBottomWidth: 10, borderLeftColor: "transparent", borderRightColor: "transparent", borderBottomColor: bubbleLit ? "#D4900A" : "#D4C8B8" }} />
        <View style={{ position: "absolute", top: -7, left: 24, width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderBottomWidth: 8, borderLeftColor: "transparent", borderRightColor: "transparent", borderBottomColor: bubbleLit ? "#FFF8EE" : "#fff" }} />
        <Text style={{ fontFamily: Fonts.bold, fontSize: 16, color: DARK, lineHeight: 24 }}>{bubbleText}</Text>
      </View>

      {/* Scrollable content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 10, paddingBottom: 32 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ── Dream picker card ── */}
        <View style={{ backgroundColor: "#fff", borderWidth: 2, borderColor: BORDER, borderRadius: 18, padding: 16, marginBottom: 10 }}>
          <Text style={{ fontFamily: Fonts.extraBold, fontSize: 12, color: MUTED, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
            What are you saving for?
          </Text>

          {/* 3×3 tile grid — 3 rows of 3 */}
          {[DREAM_TILES.slice(0,3), DREAM_TILES.slice(3,6), DREAM_TILES.slice(6,9)].map((row, ri) => (
            <View key={ri} style={{ flexDirection: "row", gap: 8, marginBottom: ri < 2 ? 8 : 12 }}>
              {row.map(tile => {
                const isSel = selTile === tile.name;
                return (
                  <Pressable
                    key={tile.name}
                    onPress={() => pickDream(tile)}
                    style={{
                      flex: 1,
                      backgroundColor: isSel ? "#FFF8EE" : "#F7F2EA",
                      borderWidth: 2, borderColor: isSel ? GOLD : BORDER,
                      borderRadius: 14, paddingVertical: 16, paddingHorizontal: 4,
                      alignItems: "center",
                      shadowColor: GOLD, shadowOpacity: isSel ? 0.3 : 0,
                      shadowOffset: { width: 0, height: 4 }, shadowRadius: 14, elevation: isSel ? 4 : 0,
                    }}
                  >
                    <Text style={{ fontSize: 30, lineHeight: 36 }}>{tile.emoji}</Text>
                    <Text style={{ fontFamily: Fonts.extraBold, fontSize: 13, color: isSel ? "#8A5C00" : "#2A1808", textAlign: "center", marginTop: 4 }}>{tile.name}</Text>
                  </Pressable>
                );
              })}
            </View>
          ))}

          {/* Custom dream text input */}
          <TextInput
            style={{ backgroundColor: "#F7F2EA", borderWidth: 2, borderColor: BORDER, borderRadius: 11, paddingHorizontal: 14, paddingVertical: 13, fontFamily: Fonts.bold, fontSize: 16, color: DARK, marginBottom: 14 }}
            value={customDream}
            onChangeText={v => { setCustomDream(v); if (v.trim()) { setDreamName(v.trim()); setSelTile(""); } else if (!selTile) setDreamName(""); }}
            placeholder="Or type any goal you want..."
            placeholderTextColor={WarmContrast.textPlaceholder}
          />

          {/* Cost input */}
          <Text style={{ fontFamily: Fonts.extraBold, fontSize: 12, color: MUTED, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8, marginTop: 4 }}>
            Rough cost (estimate is fine)
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#F7F2EA", borderWidth: 2, borderColor: BORDER, borderRadius: 11, paddingHorizontal: 14, paddingVertical: 13 }}>
            <Text style={{ fontFamily: Fonts.extraBold, fontSize: 16, color: MUTED, marginRight: 4 }}>$</Text>
            <TextInput
              style={{ flex: 1, fontFamily: Fonts.bold, fontSize: 16, color: DARK }}
              value={dreamCost}
              onChangeText={(t) => {
                const n = parseWholeMoney(t);
                setDreamCost(n ? formatWholeMoney(n) : "");
              }}
              placeholder="e.g. 10,000"
              placeholderTextColor={WarmContrast.textPlaceholder}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* ── Vision card (dark) — shows as soon as a dream is selected ── */}
        {!!dreamName && (
          <View style={{ backgroundColor: "#1A0A00", borderRadius: 18, padding: 18, marginBottom: 10 }}>
            <Text style={{ fontFamily: Fonts.black, fontSize: 22, color: "#ffffff", lineHeight: 29, marginBottom: 12 }}>
              {!cost
                ? `${dreamName}: enter a cost to see your timeline 👆`
                : showVision && totalMonthsN !== null
                  ? `${dreamName} in ${fmt(totalMonthsN)} 💪`
                  : `${dreamName} - once debt can be paid down, your timeline opens up 💪`}
            </Text>
            <Text style={{ fontFamily: Fonts.bold, fontSize: 16, color: "rgba(255,255,255,0.75)", lineHeight: 26 }}>
              {"Debt gone in "}
              <Text style={{ color: GOLD, fontFamily: Fonts.extraBold }}>{fmtDebtPayoff(debtMonths)}</Text>
              {"\n"}
              {"Keep saving for "}<Text style={{ color: GOLD, fontFamily: Fonts.extraBold }}>{showVision && dreamMonthsN !== null ? fmt(dreamMonthsN) : "..."}</Text>{" to get "}<Text style={{ color: GOLD, fontFamily: Fonts.extraBold }}>{dreamName}</Text>{".\n"}
              <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
                Saving ${Math.round(savingsMo).toLocaleString("en-US")}/mo at 4% APY after debt
              </Text>
            </Text>
            {!!excludedTaxDebtCount && (
              <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 6 }}>
                (Excluding tax debt since not in a resolution yet).
              </Text>
            )}
          </View>
        )}

        {/* ── Extra per day + optional custom /mo (beyond $10/day slider) ── */}
        <View style={{ backgroundColor: "#fff", borderWidth: 2, borderColor: BORDER, borderRadius: 18, padding: 16, marginBottom: 10 }}>
          <Text style={{ fontFamily: Fonts.extraBold, fontSize: 12, color: MUTED, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
            Can you commit a little extra per day?
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={{ fontFamily: Fonts.black, fontSize: 24, color: BLUE }}>
              ${usingCustomExtra ? effectivePerDay.toFixed(2) : extraPerDay.toFixed(2)}/day
            </Text>
            <View style={{ backgroundColor: "#DCFCE7", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, flexShrink: 1, marginLeft: 8, maxWidth: "58%", borderWidth: 1, borderColor: "rgba(17,17,17,0.08)" }}>
              <Text style={{ fontFamily: Fonts.extraBold, fontSize: 12, color: "#111111", lineHeight: 18 }}>
                {extraMonthly === 0
                  ? "Even $0.50/day = $15/mo less interest and a sooner dream!"
                  : extraUnlocksPayoff
                    ? `+$${extraMonthly.toLocaleString("en-US")}/mo puts debt on a real payoff path — at minimums alone, balances weren't shrinking.${dreamName ? ` That also moves ${dreamName} closer.` : ""}`
                    : `+$${extraMonthly.toLocaleString("en-US")}/mo saves ${monthsSaved.toLocaleString("en-US")} month${monthsSaved !== 1 ? "s" : ""} of debt${dreamName ? ` & gets your ${dreamName} sooner` : ""}.`}
              </Text>
            </View>
          </View>
          {usingCustomExtra ? (
            <Text style={{ fontFamily: Fonts.semiBold, fontSize: 13, color: MUTED, lineHeight: 19, marginBottom: 6 }}>
              Using your custom ${extraMonthly.toLocaleString("en-US")}/mo — clear the field below to use the daily slider.
            </Text>
          ) : (
            <>
              <Slider
                style={{ width: "100%", height: 36 }}
                minimumValue={0}
                maximumValue={10}
                step={0.5}
                value={extraPerDay}
                onValueChange={(v) => setExtraPerDay(typeof v === "number" && Number.isFinite(v) ? v : 0)}
                minimumTrackTintColor={BLUE}
                maximumTrackTintColor={BORDER}
                thumbTintColor={BLUE}
              />
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
                <Text style={{ fontFamily: Fonts.bold, fontSize: 12, color: MUTED }}>$0/day</Text>
                <Text style={{ fontFamily: Fonts.bold, fontSize: 12, color: MUTED }}>$2.50</Text>
                <Text style={{ fontFamily: Fonts.bold, fontSize: 12, color: MUTED }}>$5</Text>
                <Text style={{ fontFamily: Fonts.bold, fontSize: 12, color: MUTED }}>$10/day</Text>
              </View>
            </>
          )}

          <Text style={{ fontFamily: Fonts.extraBold, fontSize: 12, color: MUTED, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8, marginTop: 14 }}>
            Or set a custom extra / month (optional)
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#F7F2EA", borderWidth: 2, borderColor: BORDER, borderRadius: 11, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 4 }}>
            <Text style={{ fontFamily: Fonts.extraBold, fontSize: 16, color: MUTED, marginRight: 4 }}>$</Text>
            <TextInput
              style={{ flex: 1, fontFamily: Fonts.bold, fontSize: 16, color: DARK }}
              value={extraMonthlyInput}
              onChangeText={(t) => {
                const n = parseWholeMoney(t);
                setExtraMonthlyInput(n ? formatWholeMoney(n) : "");
              }}
              placeholder="0"
              placeholderTextColor={WarmContrast.textPlaceholder}
              keyboardType="number-pad"
            />
            <Text style={{ fontFamily: Fonts.extraBold, fontSize: 14, color: MUTED }}>/mo</Text>
          </View>
        </View>

        {/* ── CTA — Gold gradient ── */}
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onComplete(dreamName || "", cost > 0 ? dreamCost : "", effectivePerDay); }}
          style={{
            width: "100%",
            borderRadius: 22,
            overflow: "hidden",
            marginBottom: 24,
            opacity: cost > 0 ? 1 : 0.55,
            shadowColor: GOLD,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: cost > 0 ? 0.45 : 0,
            shadowRadius: 28,
            elevation: cost > 0 ? 8 : 0,
          }}
          disabled={cost <= 0}
        >
          <LinearGradient colors={["#F5C030", "#D4900A"]} start={{ x: 0.13, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ paddingVertical: 22, paddingHorizontal: 12, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontFamily: Fonts.black, fontSize: 20, color: "#111111", letterSpacing: 0.2, textAlign: "center" }}>See My Complete Debt-Free Plan</Text>
            <Text style={{ fontSize: 20, textAlign: "center", marginTop: 4 }}>✨</Text>
            <Animated.View pointerEvents="none" style={{ position: "absolute", top: 0, bottom: 0, width: "55%", transform: [{ translateX: shimmerX }] }}>
              <LinearGradient colors={["transparent", "rgba(255,255,255,0.35)", "transparent"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
            </Animated.View>
          </LinearGradient>
        </Pressable>

      </ScrollView>
    </View>
  );
}
// ─── DexLoving SVG ────────────────────────────────────────────────
function DexLoving({ size = 118 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 90 90">
      <Ellipse cx={28} cy={82} rx={14} ry={7} fill="#7A3A0C" />
      <Ellipse cx={62} cy={82} rx={14} ry={7} fill="#7A3A0C" />
      <Ellipse cx={16} cy={46} rx={9} ry={16} fill="#EAA835" transform="rotate(18,16,46)" />
      <Ellipse cx={74} cy={46} rx={9} ry={16} fill="#EAA835" transform="rotate(-18,74,46)" />
      <Circle cx={45} cy={44} r={33} fill="#EAA835" />
      <Ellipse cx={45} cy={64} rx={26} ry={15} fill="#C07820" opacity={0.22} />
      <Circle cx={20} cy={22} r={10} fill="#D09828" />
      <Circle cx={70} cy={22} r={10} fill="#D09828" />
      <Ellipse cx={33} cy={37} rx={13} ry={14} fill="white" />
      <Ellipse cx={57} cy={37} rx={13} ry={14} fill="white" />
      <Circle cx={35} cy={39} r={9} fill="#1A0800" />
      <Circle cx={59} cy={39} r={9} fill="#1A0800" />
      <Circle cx={31} cy={35} r={3.5} fill="white" />
      <Circle cx={55} cy={35} r={3.5} fill="white" />
      <Path d="M27 32 Q33 28 39 32" stroke="#1A0800" strokeWidth={1.5} fill="none" strokeLinecap="round" />
      <Path d="M51 32 Q57 28 63 32" stroke="#1A0800" strokeWidth={1.5} fill="none" strokeLinecap="round" />
      <Ellipse cx={24} cy={48} rx={10} ry={6} fill="#E87040" opacity={0.2} />
      <Ellipse cx={66} cy={48} rx={10} ry={6} fill="#E87040" opacity={0.2} />
      <Path d="M27 58 Q45 76 63 58" stroke="#A86010" strokeWidth={3} fill="none" strokeLinecap="round" />
      <SvgText x={5}  y={20} fontSize={12} fill="#E87080">{"❤"}</SvgText>
      <SvgText x={66} y={18} fontSize={11} fill="#E87080">{"❤"}</SvgText>
      <SvgText x={60} y={29} fontSize={8}  fill="#E87080">{"❤"}</SvgText>
    </Svg>
  );
}

function DexLaunch({ size = 120 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 90 90">
      <Ellipse cx={28} cy={82} rx={14} ry={7} fill="#7A3A0C" />
      <Ellipse cx={62} cy={82} rx={14} ry={7} fill="#7A3A0C" />
      <Ellipse cx={16} cy={44} rx={9} ry={18} fill="#EAA835" transform="rotate(22,16,44)" />
      <Ellipse cx={74} cy={44} rx={9} ry={18} fill="#EAA835" transform="rotate(-22,74,44)" />
      <Circle cx={45} cy={44} r={33} fill="#EAA835" />
      <Ellipse cx={45} cy={64} rx={26} ry={15} fill="#C07820" opacity={0.22} />
      <Circle cx={20} cy={22} r={10} fill="#D09828" />
      <Circle cx={70} cy={22} r={10} fill="#D09828" />
      <Ellipse cx={33} cy={37} rx={13} ry={14} fill="white" />
      <Ellipse cx={57} cy={37} rx={13} ry={14} fill="white" />
      <Circle cx={35} cy={39} r={9} fill="#1A0800" />
      <Circle cx={59} cy={39} r={9} fill="#1A0800" />
      <Circle cx={31} cy={35} r={3.5} fill="white" />
      <Circle cx={55} cy={35} r={3.5} fill="white" />
      <Path d="M27 60 Q45 78 63 60" stroke="#A86010" strokeWidth={3} fill="none" strokeLinecap="round" />
      <SvgText x={5}  y={18} fontSize={14} fill="#E8A020">{"✨"}</SvgText>
      <SvgText x={63} y={14} fontSize={12} fill="#E8A020">{"✨"}</SvgText>
      <SvgText x={57} y={26} fontSize={10} fill="#F5C842">{"★"}</SvgText>
      <SvgText x={10} y={12} fontSize={10} fill="#F5C842">{"★"}</SvgText>
    </Svg>
  );
}

// ─── Screen: Coach / Well Done (step 6) ──────────────────────────────────────
function CommitScreen({
  isDark,
  bg,
  topPad,
  botPad,
  debts,
  onCommit,
  onBack,
}: {
  isDark: boolean;
  bg: string;
  topPad: number;
  botPad: number;
  debts: Debt[];
  onCommit: () => void | Promise<void>;
  onBack: () => void;
}) {
  const BG     = "#F7F2EA";
  const BLUE   = "#1A6FC4";
  const GREEN  = "#2C7A43";
  const GOLD   = "#F5C030";
  const DARK   = "#1A0A00";
  const MUTED  = Colors.light.textSecondary;
  const BORDER = "#E0D8CE";

  const [phase, setPhase]         = useState<"commit"|"day1">("commit");
  const [committed, setCommitted] = useState(false);
  const [strategy, setStrategy]   = useState("Snowball");
  const [payoffStr, setPayoffStr] = useState("-");
  const [dreamStr, setDreamStr]   = useState("-");
  const [totalDebt, setTotalDebt] = useState(0);
  const [tasks, setTasks]         = useState([false, false, false]);
  const [tasksDone, setTasksDone]             = useState([false, false, false, false]);
  const [paymentExpanded, setPaymentExpanded] = useState(true);
  const [day1PaidDebtIds, setDay1PaidDebtIds] = useState<string[]>([]);
  const [payModalDebtId, setPayModalDebtId] = useState<string | null>(null);
  const [payModalAmount, setPayModalAmount] = useState("");
  const [showBanner, setShowBanner]           = useState(false);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);
  const [localXp, setLocalXp]                 = useState(0);
  const [dexStatusText, setDexStatusText]     = useState("Tap your tasks to stay on track!");
  const [inviteHidden, setInviteHidden]       = useState(false);
  const [tapDexIdx, setTapDexIdx]             = useState(0);
  const commitInFlight = useRef(false);

  // Day 1 notification to-do state (no permission popups after commit).
  const [notifPermissionStatus, setNotifPermissionStatus] = useState<string | null>(null);
  const [notifCanAskAgain, setNotifCanAskAgain] = useState<boolean | null>(null);

  const { streakCount, level, currentLevelXp, nextLevelXp, progress, grantBonusXp } = useGame();
  const { extraPayment, logPayment, setLeadSubmitted } = useDebts();

  const bounceAnim  = useRef(new Animated.Value(0)).current;
  const shimmer     = useRef(new Animated.Value(0)).current;
  const momentumBar = useRef(new Animated.Value(0)).current;
  const xpFillAnim  = useRef(new Animated.Value(progress)).current;
  const pulseAnim   = useRef(new Animated.Value(0)).current;
  const SW = Dimensions.get("window").width;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(bounceAnim, { toValue: -6, duration: 700, useNativeDriver: true }),
      Animated.timing(bounceAnim, { toValue: 0,  duration: 640, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.timing(shimmer, { toValue: 1, duration: 2200, useNativeDriver: true })).start();
    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
    ])).start();
  }, []);

  // animate momentum bar when day1 phase starts
  useEffect(() => {
    if (phase === "day1") {
      Animated.timing(momentumBar, { toValue: 1, duration: 1200, useNativeDriver: false, delay: 300 }).start();
    }
  }, [phase]);

  const shimmerX   = shimmer.interpolate({ inputRange: [0, 1], outputRange: [-SW * 0.55, SW * 1.3] });
  const barWidth   = momentumBar.interpolate({ inputRange: [0, 1], outputRange: ["0%", "95%"] });

  useEffect(() => {
    const pct = Math.min((currentLevelXp + localXp) / Math.max(nextLevelXp, 1), 1);
    Animated.timing(xpFillAnim, { toValue: pct, duration: 500, useNativeDriver: false }).start();
  }, [localXp]);

  const LEVEL_NAMES = ["","Seedling","Bronze Starter","Momentum Builder","Gold Saver","Diamond Warrior","Freedom Champion","Debt-Free Legend"];
  const levelName   = LEVEL_NAMES[Math.min(level, 7)] || "Seedling";
  const todayDateStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });

  /** Calendar days ahead to show on Day 1 (real due dates, not day-of-month math). */
  const DAY1_PAYMENT_DUE_WINDOW = 5;
  const [dailyCommitment, setDailyCommitment] = useState<number | null>(null);

  function computeDay1DuePayments(debtList: Debt[], from: Date = new Date()) {
    return debtList
      .filter((d) => debtEligibleForPaymentReminder(d))
      .map((d) => ({
        ...d,
        daysUntil: calendarDaysUntilPaymentDue(d.dueDate, from),
      }))
      .filter((d) => d.daysUntil >= 0 && d.daysUntil <= DAY1_PAYMENT_DUE_WINDOW);
  }

  useEffect(() => {
    AsyncStorage.getItem(DAILY_SAVINGS_GOAL_KEY)
      .then((raw) => {
        if (!raw) return;
        const parsed = parseFloat(raw);
        if (Number.isFinite(parsed) && parsed > 0) setDailyCommitment(parsed);
      })
      .catch(() => {});
  }, []);

  // Snapshot the due-soon list when Day 1 starts (stable IDs); amounts refresh from context.
  const [day1UpcomingPayments, setDay1UpcomingPayments] = useState<any[]>([]);
  const [day1HasUpcomingSnapshot, setDay1HasUpcomingSnapshot] = useState(false);

  useEffect(() => {
    if (phase === "day1" && !day1HasUpcomingSnapshot) {
      setDay1UpcomingPayments(computeDay1DuePayments(debts || [], new Date()) as any[]);
      setDay1HasUpcomingSnapshot(true);
    }
    if (phase !== "day1") {
      setDay1HasUpcomingSnapshot(false);
      setDay1UpcomingPayments([]);
      setDay1PaidDebtIds([]);
      setPayModalDebtId(null);
      setPayModalAmount("");
    }
  }, [phase, day1HasUpcomingSnapshot, debts]);

  const upcomingPayments =
    phase === "day1" && day1HasUpcomingSnapshot && day1UpcomingPayments.length > 0
      ? (day1UpcomingPayments
          .map((snap) => {
            const live = (debts || []).find((d) => d.id === snap.id);
            if (!live || !debtEligibleForPaymentReminder(live)) return null;
            const daysUntil = calendarDaysUntilPaymentDue(live.dueDate, new Date());
            if (daysUntil < 0 || daysUntil > DAY1_PAYMENT_DUE_WINDOW) return null;
            return { ...snap, ...live, daysUntil };
          })
          .filter(Boolean) as (Debt & { daysUntil: number })[])
      : computeDay1DuePayments(debts || [], new Date());

  const day1SnapshotDebtIds = useMemo(
    () => day1UpcomingPayments.map((p) => p.id as string),
    [day1UpcomingPayments]
  );

  const requiredDay1TaskIdxs = useMemo(
    () => (day1SnapshotDebtIds.length > 0 ? [0, 1, 2] : [0, 1]),
    [day1SnapshotDebtIds]
  );
  const allDone     = requiredDay1TaskIdxs.every((i) => tasksDone[i]);
  const day1DexMood: "keepGoing" | "overjoyed" = allDone ? "overjoyed" : "keepGoing";
  const day1DexMotion: "nod" | "pump" = allDone ? "pump" : "nod";
  const fallbackDailyFromMonthly = Math.max((extraPayment || 0) / 30.44, 0.5);
  const fallbackDailySnapped = Math.round(fallbackDailyFromMonthly * 2) / 2;
  const effectiveDailyCommitment = dailyCommitment ?? fallbackDailySnapped;
  const dailyAmt          = "$" + effectiveDailyCommitment.toFixed(2);
  const ccDebts           = (debts || []).filter(d => d.debtType.toLowerCase().includes("credit"));
  const avgApr            = ccDebts.length > 0 ? Math.round(ccDebts.reduce((s, d) => s + d.apr, 0) / ccDebts.length) : 20;

  const day1EvalOffer = useMemo(() => {
    const recDebts = (debts || []).map((d) => ({
      id: d.id,
      name: d.name,
      balance: d.balance,
      apr: d.apr,
      category: d.debtType,
      debtType: d.debtType,
      isSecured: d.isSecured,
    }));
    const recs = getRecommendations(recDebts, "dashboard");
    const first = recs[0];
    const key = first?.affiliateKey ?? "DEBT_RELIEF";
    const url = AFFILIATE_URLS[key] ?? AFFILIATE_URLS.DEBT_RELIEF;
    return {
      url,
      title: first?.header ?? "Explore relief options",
      desc:
        first?.body ??
        (ccDebts.length > 0
          ? `Your credit card APRs average ${avgApr}%. A specialist can explain programs that may fit your situation - no obligation.`
          : "A specialist can walk you through relief and consolidation options - no obligation."),
      icon: first?.icon ?? "🔎",
    };
  }, [debts, ccDebts.length, avgApr]);
  const upcomingPaymentsUnpaid = upcomingPayments.filter((d) => !day1PaidDebtIds.includes(d.id));
  const totalUpcomingAmt = upcomingPaymentsUnpaid.reduce((s, d) => s + (d.minimumPayment || 0), 0);
  const day1UnpaidPaymentCount = upcomingPaymentsUnpaid.length;
  const payDueDateStr = (() => {
    if (upcomingPaymentsUnpaid.length === 0) return "";
    let best: Date | null = null;
    for (const p of upcomingPaymentsUnpaid) {
      const nd = getNextPaymentDueDate(p.dueDate);
      if (!best || nd.getTime() < best.getTime()) best = nd;
    }
    return best ? best.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
  })();
  const minDaysUntil =
    upcomingPaymentsUnpaid.length > 0 ? Math.min(...upcomingPaymentsUnpaid.map((p) => p.daysUntil)) : 0;

  const mergedPaymentIds = new Set(upcomingPayments.map((p) => p.id));
  const day1PaymentBlockSatisfied =
    day1SnapshotDebtIds.length === 0 ||
    day1SnapshotDebtIds.every((id) => !mergedPaymentIds.has(id) || day1PaidDebtIds.includes(id));

  const DAY1_PER_PAYMENT_XP = 10;
  /** Task index 2 awards XP per logged payment only (see DAY1_PER_PAYMENT_XP), not a lump sum. */
  const TASK_XP_D1 = [25, 25, 0, 0];

  const DEX_REACTIONS = [
    { status: "YES! One down! Keep going! 💪" },
    { status: "Amazing! Halfway there! 🌟" },
    { status: "THREE! You are on fire! 🔥" },
    { status: "ALL DONE! Day complete! You champion! 🏆" },
  ];

  const TAP_DEX_MSGS = [
    "I believe in you! Keep it up! 💪",
    "You are doing great! Every day counts!",
    "Stay consistent and your dream gets closer! 🌟",
    "Look at that streak! You are a machine! 🔥",
  ];

  const handleTaskPress = (idx: number) => {
    if (tasksDone[idx]) return;
    // Payment task (2) completes only after each due debt is logged (+XP per payment).
    if (idx === 2) return;
    // Relief options (3): optional; use the in-card CTA or the completion-day prompt.
    if (idx === 3) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const gained    = TASK_XP_D1[idx];
    const nextState = [...tasksDone]; nextState[idx] = true;
    setTasksDone(nextState);
    setLocalXp(prev => prev + gained);
    grantBonusXp(gained);
    const vIdxs        = requiredDay1TaskIdxs;
    const newDoneCount = vIdxs.filter(i => nextState[i]).length;
    const reaction     = DEX_REACTIONS[Math.min(newDoneCount - 1, DEX_REACTIONS.length - 1)];
    if (reaction) {
      setDexStatusText(reaction.status);
    }
    if (vIdxs.every(i => nextState[i])) {
      setTimeout(() => setShowBanner(true), 500);
    }
  };

  const submitDay1PaymentLog = async () => {
    const debtId = payModalDebtId;
    if (!debtId) return;
    const row = upcomingPayments.find((p) => p.id === debtId);
    if (!row || tasksDone[2]) return;
    const digits = (payModalAmount || "").replace(/\D/g, "");
    const parsed = digits ? parseInt(digits, 10) : 0;
    const maxPay = Math.max(0, Math.round(row.balance || 0));
    const amt = Math.min(Math.max(0, parsed), maxPay);
    if (amt <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    try {
      await logPayment({
        debtId,
        amount: amt,
        date: new Date().toISOString().slice(0, 10),
        isMissed: false,
        note: "Day 1 - logged from tasks",
      });
    } catch {
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    grantBonusXp(DAY1_PER_PAYMENT_XP);
    setLocalXp((x) => x + DAY1_PER_PAYMENT_XP);
    const nextPaid = day1PaidDebtIds.includes(debtId)
      ? day1PaidDebtIds
      : [...day1PaidDebtIds, debtId];
    setDay1PaidDebtIds(nextPaid);
    setPayModalDebtId(null);
    setPayModalAmount("");
    const mergedIds = new Set(upcomingPayments.map((p) => p.id));
    const blockDone = day1SnapshotDebtIds.every(
      (id) => !mergedIds.has(id) || nextPaid.includes(id)
    );
    if (blockDone) {
      setTasksDone((prev) => {
        if (prev[2]) return prev;
        const n = [...prev];
        n[2] = true;
        const vis = requiredDay1TaskIdxs;
        const newDoneCount = vis.filter((i) => n[i]).length;
        const reaction = DEX_REACTIONS[Math.min(newDoneCount - 1, DEX_REACTIONS.length - 1)];
        if (reaction) setTimeout(() => setDexStatusText(reaction.status), 0);
        if (vis.every((i) => n[i])) setTimeout(() => setShowBanner(true), 500);
        return n;
      });
    } else {
      setDexStatusText(`Nice! +${DAY1_PER_PAYMENT_XP} XP - log the rest when you pay them. 💪`);
    }
  };

  // Auto-check payment task if every snapshot debt is logged or no longer in the 5-day window / eligible set.
  useEffect(() => {
    if (phase !== "day1" || tasksDone[2] || day1SnapshotDebtIds.length === 0 || !day1PaymentBlockSatisfied) return;
    setTasksDone((prev) => {
      if (prev[2]) return prev;
      const n = [...prev];
      n[2] = true;
      const vis = requiredDay1TaskIdxs;
      const newDoneCount = vis.filter((i) => n[i]).length;
      const reaction = DEX_REACTIONS[Math.min(newDoneCount - 1, DEX_REACTIONS.length - 1)];
      if (reaction) setTimeout(() => setDexStatusText(reaction.status), 0);
      if (vis.every((i) => n[i])) setTimeout(() => setShowBanner(true), 500);
      return n;
    });
  }, [phase, tasksDone[2], day1SnapshotDebtIds, day1PaymentBlockSatisfied, requiredDay1TaskIdxs]);

  useEffect(() => {
    if (phase !== "day1" || !allDone || isAutoAdvancing) return;
    // Optional relief task (3) is not required; only auto-advance when they already opened it.
    if (!tasksDone[3]) return;
    setIsAutoAdvancing(true);
    setDexStatusText("Amazing work. Taking you to your Day 1 congratulations...");
    const t = setTimeout(() => {
      // If navigation ever stalls, don't leave the CTA permanently disabled.
      void handleDay1Commit();
    }, 900);
    return () => clearTimeout(t);
  }, [phase, allDone, isAutoAdvancing, tasksDone]);

  const handleDay1Commit = async () => {
    if (commitInFlight.current) return;
    commitInFlight.current = true;
    try {
      await onCommit();
    } finally {
      commitInFlight.current = false;
      setIsAutoAdvancing(false);
    }
  };

  const openDay1EvalOffer = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL(withAppUtmParams(day1EvalOffer.url)).catch(() => {});
    void setLeadSubmitted().catch(() => {});
    setTasksDone((prev) => {
      if (prev[3]) return prev;
      const next = [...prev];
      next[3] = true;
      return next;
    });
    setDexStatusText("Thanks for exploring your options.");
  }, [day1EvalOffer.url, setLeadSubmitted]);

  const handleDexTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTapDexIdx(prev => {
      const next = (prev + 1) % TAP_DEX_MSGS.length;
      setDexStatusText(TAP_DEX_MSGS[next]);
      return next;
    });
  };

  const handleShareWhatsApp = () => {
    const text = "I'm using DebtPath to pay off my debt and get to my dream faster. Free app!";
    Linking.openURL(`https://wa.me/?text=${encodeURIComponent(text)}`).catch(() => {});
  };

  const handleShareFacebook = () => {
    const url = "https://debtpath.app";
    Linking.openURL(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`).catch(() => {});
  };

  const handleCommitPress = async () => {
    if (!committed) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // No notification permission popups here.
    // If notifications are enabled on device already, we just go to Day 1.
    // If they're off, Day 1 shows a to-do to turn them on.
    if (Platform.OS === "web") {
      setNotifPermissionStatus("granted");
      setNotifCanAskAgain(true);
    } else {
      try {
        const existing = await Notifications.getPermissionsAsync().catch(() => null);
        setNotifPermissionStatus(existing?.status ?? null);
        setNotifCanAskAgain(existing?.canAskAgain ?? null);
      } catch {
        // If we can't read permission state, allow Day 1 to show the to-do.
        setNotifPermissionStatus(null);
        setNotifCanAskAgain(null);
      }
    }

    setPhase("day1");
  };

  const handleDay1ToggleNotifications = async () => {
    if (Platform.OS === "web") {
      setNotifPermissionStatus("granted");
      setNotifCanAskAgain(true);
      return;
    }
    try {
      // If we can ask again, trigger the permission prompt.
      if (notifCanAskAgain === true || notifCanAskAgain === null) {
        const requested = await Notifications.requestPermissionsAsync().catch(() => null);
        if (!requested) return;
        setNotifPermissionStatus(requested.status ?? null);
        setNotifCanAskAgain(requested.canAskAgain ?? null);
      } else {
        // Otherwise, send them to settings (no Alert popups).
        Linking.openSettings().catch(() => {});
      }
    } catch {
      // Keep UI stable — to-do will remain until permission is granted.
    }
  };

  useEffect(() => {
    (async () => {
      try {
        let payoffDate: Date | null = null;
        const strat = await AsyncStorage.getItem("@debtpath_payoff_strategy") || "snowball";
        setStrategy(strat === "avalanche" ? "Avalanche" : strat === "custom" ? "Custom" : "Snowball");
        const activDebts = (debts || []).filter(d => d.balance > 0);
        const total = activDebts.reduce((s, d) => s + d.balance, 0);
        setTotalDebt(total);
        if (activDebts.length > 0) {
          const { runStrategy } = await import("../lib/calculations");
          const result = runStrategy(activDebts, extraPayment || 0, strat as any);
          if (result.payoffDate) {
            const MN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
            payoffDate = result.payoffDate;
            setPayoffStr(MN[result.payoffDate.getMonth()] + " " + result.payoffDate.getFullYear());
          }
        }
        const gName = await AsyncStorage.getItem("@debtpath_dream_goal_name");
        const gCost = await AsyncStorage.getItem("@debtpath_dream_goal_cost");
        if (gName) {
          const MN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
          const costNum = parseFloat(gCost || "0");

          // Dream should be AFTER debt is cleared.
          // We reuse the same "save at 4% APY" math that the dream screen uses,
          // but we anchor it to the computed payoffDate.
          const eff = activDebts.filter(
            (d) => !(d.debtType === "taxDebt" && d.taxPaymentPlan !== true)
          );
          const totalMin = eff.reduce((s, d) => s + (d.minimumPayment || 0), 0);
          const savingsMonthly = totalMin + (extraPayment || 0);
          const r = 0.04 / 12;
          const dreamMonths =
            costNum > 0 && savingsMonthly > 0
              ? Math.ceil(Math.log(1 + (costNum * r) / savingsMonthly) / Math.log(1 + r))
              : 30; // fallback months after payoff

          const baseDate = payoffDate ?? new Date();
          const future = new Date(baseDate);
          future.setMonth(future.getMonth() + dreamMonths);
          setDreamStr(gName + " - " + MN[future.getMonth()] + " " + future.getFullYear());
        }
      } catch (_) {}
    })();
  }, [debts, extraPayment]);

  const fmtTotal = totalDebt >= 10000
    ? "$" + (totalDebt / 1000).toFixed(1) + "K"
    : "$" + Math.round(totalDebt).toLocaleString();

  const TASK_DATA = [
    { icon: "📸", name: "Screenshot your debt total",       desc: "Save " + fmtTotal + " as your starting point. Your future self will love this.", xp: "+20 XP" },
    { icon: "📅", name: "Set your first payment reminder",  desc: "Pick a date and set a phone reminder. Make it automatic.",                       xp: "+30 XP" },
    { icon: "🏆", name: "Tell someone about your plan",     desc: "Accountability doubles your success rate. One person is enough.",                 xp: "+50 XP" },
  ];

  if (phase === "day1") {
    const TD = tasksDone;
    const T = (i: number) => TD[i];
    const taskCard = (done: boolean) => ({
      // Same white surface for both states — completion is shown by border + ring only.
      backgroundColor: "#FFFFFF",
      borderWidth: 2,
      borderColor: done ? "#2C7A43" : BORDER,
      borderRadius: 16,
      paddingVertical: 22,
      paddingHorizontal: 14,
      marginBottom: 12,
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: 12,
    });
    const ring = (done: boolean, bg?: string, bc?: string) => ({
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 2.5,
      borderColor: done ? "#2C7A43" : (bc || "#D4C8B8"),
      backgroundColor: done ? "#2C7A43" : (bg || "#F7F2EA"),
      alignItems: "center" as const,
      justifyContent: "center" as const,
      flexShrink: 0 as const,
    });
    const taskName = (done: boolean, clr?: string) => ({
      fontFamily: Fonts.black,
      fontSize: 16,
      color: done ? MUTED : (clr || DARK),
      textDecorationLine: (done ? "line-through" : "none") as "line-through" | "none",
      lineHeight: 20,
    });
    const taskDesc = (done: boolean) => ({
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: done ? MUTED : DARK,
      marginTop: 4,
      lineHeight: 22,
    });
    const xpBadge = (_done: boolean, bg?: string, _clr?: string) => ({
      backgroundColor: bg || "#EFF6FF",
      borderWidth: 0,
      borderColor: "transparent",
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
      flexShrink: 0 as const,
    });
    const xpText = (_done: boolean, clr?: string) => ({
      fontFamily: Fonts.black,
      fontSize: 11,
      color: clr || BLUE,
    });

    return (
      <View style={{ flex: 1, backgroundColor: BG }}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* ── TOP BAR ─── padding: 32px 16px 8px in HTML (our topPad replaces 32px) */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: topPad + 10, paddingBottom: 8 }}>
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={{ fontFamily: Fonts.black, fontSize: 19, color: DARK }}>Day 1 🚀</Text>
              <View style={{ backgroundColor: "#DCFCE7", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
                <Text style={{ fontFamily: Fonts.bold, fontSize: 11, color: GREEN }}>+1 day</Text>
              </View>
            </View>
            <Text style={{ fontFamily: Fonts.semiBold, fontSize: 11, color: MUTED, marginTop: 2 }}>{todayDateStr}</Text>
          </View>
          <View style={{ backgroundColor: DARK, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, flexDirection: "row", alignItems: "center", gap: 5 }}>
            <Text style={{ fontSize: 14 }}>🔥</Text>
            <Text style={{ fontFamily: Fonts.black, fontSize: 13, color: "#FFFFFF" }}>{streakCount} day streak</Text>
          </View>
        </View>

        {/* ── XP BAR ── padding: 4px 16px 10px */}
        <View style={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 10 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
            <Text style={{ fontFamily: Fonts.bold, fontSize: 13, color: DARK }}>Level {level} - {levelName}</Text>
            <Text style={{ fontFamily: Fonts.bold, fontSize: 13, color: "#D4900A" }}>{currentLevelXp + localXp} / {nextLevelXp} XP</Text>
          </View>
          <View style={{ height: 10, backgroundColor: "#E0D8CE", borderRadius: 5, overflow: "hidden" }}>
            <Animated.View style={{ height: "100%", borderRadius: 5, overflow: "hidden", width: xpFillAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) }}>
              <LinearGradient colors={["#D4900A", "#F5C030"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
            </Animated.View>
          </View>
        </View>

        {/* ── DEX AREA ── padding: 6px 16px 8px */}
        <View style={{ alignItems: "center", paddingHorizontal: 16, paddingTop: 6, paddingBottom: 8 }}>
          <Pressable onPress={handleDexTap}>
            <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
              <DexCoin size={120} mood={day1DexMood} motion={day1DexMotion} />
            </Animated.View>
          </Pressable>
          {/* Status pill — white bg, 2px border #E0D8CE, border-radius 20px, padding 6px 14px */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "white", borderWidth: 2, borderColor: "#E0D8CE", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginTop: 6, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}>
            <Animated.View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: allDone ? GOLD : GREEN, opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] }), transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] }) }] }} />
            <Text style={{ fontFamily: Fonts.extraBold, fontSize: 12, color: DARK }}>{dexStatusText}</Text>
          </View>
        </View>

        {/* ── TASKS SECTION — tasks-wrap: padding: 0 14px 16px ── */}
        <View style={{ paddingHorizontal: 14, paddingTop: 8, paddingBottom: 32 }}>

          {/* ── ALL DONE BANNER — shows when every task is complete ── */}
          {allDone && (
            <LinearGradient
              colors={["#1A6FC4", "#0D5BAE"]}
              start={{ x: 0.1, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ flexDirection: "row", alignItems: "center", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, marginBottom: 14, gap: 14, shadowColor: "#1A6FC4", shadowOpacity: 0.35, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 6 }}>
              {/* Trophy icon */}
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Text style={{ fontSize: 22 }}>🏆</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: Fonts.black, fontSize: 17, color: "white", lineHeight: 22 }}>All done! Day complete!</Text>
                <Text style={{ fontFamily: Fonts.semiBold, fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 2, lineHeight: 17 }}>Streak locked in. See you tomorrow!</Text>
              </View>
            </LinearGradient>
          )}

          {/* ── TASKS LABEL ── font-size:.65rem=10px; font-weight:800; #8A7060; uppercase; letter-spacing:.12em; margin-bottom:8px */}
          <Text style={{ fontFamily: Fonts.extraBold, fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: 1.9, marginBottom: 8 }}>Today's tasks</Text>

          {/* Notifications to-do (no popup flow). */}
          {notifPermissionStatus !== "granted" && (
            <Pressable onPress={handleDay1ToggleNotifications} style={taskCard(false)}>
              <View style={ring(false, "#EFF6FF", "#1A6FC4")}>
                <Text style={{ color: "white", fontSize: 12, fontFamily: Fonts.black }}>!</Text>
              </View>
              <Text style={{ fontSize: 21, flexShrink: 0 }}>🔔</Text>
              <View style={{ flex: 1 }}>
                <Text style={taskName(false)} numberOfLines={1}>Turn on notifications</Text>
                <Text style={taskDesc(false)}>
                  So DebtPath can send check-ins and payment reminders.
                </Text>
              </View>
              <View style={xpBadge(false, "#EFF6FF", "#1A6FC4")}>
                <Text style={xpText(false, "#1A6FC4")}>+10 XP</Text>
              </View>
            </Pressable>
          )}

          {/* ── TASK 1: No new debt ── */}
          <Pressable onPress={() => handleTaskPress(0)} style={taskCard(T(0))}>
            <View style={ring(T(0))}>
              {T(0) && <Text style={{ color: "white", fontSize: 12, fontFamily: Fonts.black }}>✓</Text>}
            </View>
            <Text style={{ fontSize: 21, flexShrink: 0 }}>🚫</Text>
            <View style={{ flex: 1 }}>
              <Text style={taskName(T(0))}>No new debt added</Text>
              <Text style={taskDesc(T(0))}>Confirm you did not charge new purchases to your enrolled cards today.</Text>
            </View>
            <View style={xpBadge(T(0))}>
              <Text style={xpText(T(0))}>+25 XP</Text>
            </View>
          </Pressable>

          {/* ── TASK 2: Saved today's amount ── */}
          <Pressable onPress={() => handleTaskPress(1)} style={taskCard(T(1))}>
            <View style={ring(T(1))}>
              {T(1) && <Text style={{ color: "white", fontSize: 12, fontFamily: Fonts.black }}>✓</Text>}
            </View>
            <Text style={{ fontSize: 21, flexShrink: 0 }}>💰</Text>
            <View style={{ flex: 1 }}>
              <Text style={taskName(T(1))}>Saved today's amount</Text>
              <Text style={taskDesc(T(1))}>
                Set aside <Text style={{ color: GREEN, fontFamily: Fonts.bold }}>{dailyAmt}</Text> (your daily commitment). Every dollar moves the needle.
              </Text>
            </View>
            <View style={xpBadge(T(1))}>
              <Text style={xpText(T(1))}>+25 XP</Text>
            </View>
          </Pressable>

          {/* ── TASK 3: Payment due soon — snapshot at Day 1 start; IRS/tax only if on a payment plan ── */}
          {day1SnapshotDebtIds.length > 0 && (
          <View style={{ backgroundColor: "#FFFFFF", borderWidth: 2, borderColor: T(2) ? "#2C7A43" : "#F5C030", borderRadius: 16, marginBottom: 12, overflow: "hidden" }}>
            {/* Header row — padding: 12px 13px */}
            <Pressable onPress={() => { if (!T(2)) setPaymentExpanded(p => !p); }}
              style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 22, paddingHorizontal: 14 }}>
              {/* Ring: gold bg with "!" when pending */}
              <View style={ring(T(2), "#F5C030", "#D4900A")}>
                <Text style={{ color: T(2) ? "white" : DARK, fontSize: 12, fontFamily: Fonts.black }}>{T(2) ? "✓" : "!"}</Text>
              </View>
              <Text style={{ fontSize: 21, flexShrink: 0 }}>📅</Text>
              <View style={{ flex: 1 }}>
                <Text style={taskName(T(2))}>Payment due soon</Text>
                <Text style={taskDesc(T(2))}>
                  {T(2)
                    ? "All set - you logged a payment for each debt due in this window."
                    : `${day1UnpaidPaymentCount} payment${day1UnpaidPaymentCount !== 1 ? "s" : ""} with a due date in the next ${DAY1_PAYMENT_DUE_WINDOW} calendar days (real dates, not estimates). Tap to log what you paid (+${DAY1_PER_PAYMENT_XP} XP each).${
                        totalUpcomingAmt > 0
                          ? ` Min. still to log: $${totalUpcomingAmt.toLocaleString("en-US")}.`
                          : ""
                      }${payDueDateStr ? ` Next due: ${payDueDateStr}.` : ""}`}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                <View style={xpBadge(T(2), "#FEF3C7", WarmContrast.textOnYellowBold)}>
                  <Text style={xpText(T(2), WarmContrast.textOnYellowBold)}>+{DAY1_PER_PAYMENT_XP} XP / pay</Text>
                </View>
                {!T(2) && day1UnpaidPaymentCount > 0 && (
                  <View style={{ backgroundColor: "#FEF3C7", borderWidth: 1.5, borderColor: "#F5C030", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
                    <Text style={{ fontFamily: Fonts.black, fontSize: 12, color: WarmContrast.textOnYellowBold }}>
                      {minDaysUntil === 0 ? "Due today" : `${minDaysUntil} day${minDaysUntil !== 1 ? "s" : ""} until due`}
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>

            {paymentExpanded && (
              <View style={{ borderTopWidth: 1.5, borderTopColor: "#E0D8CE", paddingHorizontal: 13, paddingBottom: 12 }}>
                <Text style={{ fontFamily: Fonts.extraBold, fontSize: 11, color: DARK, textTransform: "uppercase", letterSpacing: 1.6, paddingTop: 8, paddingBottom: 6 }}>
                  What to pay now
                </Text>
                {upcomingPaymentsUnpaid.length === 0 ? (
                  <Text style={{ fontFamily: Fonts.semiBold, fontSize: 14, color: DARK, textAlign: "center", paddingVertical: 14, lineHeight: 20 }}>
                    {T(2)
                      ? "You're caught up for this window."
                      : "Nothing left to show here - payments you logged are removed, or due dates moved outside this window."}
                  </Text>
                ) : (
                  upcomingPaymentsUnpaid.map((p) => (
                    <Pressable
                      key={p.id}
                      disabled={T(2)}
                      onPress={() => {
                        if (T(2)) return;
                        setPayModalDebtId(p.id);
                        setPayModalAmount(String(Math.max(0, Math.round(p.minimumPayment || 0))));
                      }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingVertical: 10,
                        paddingHorizontal: 11,
                        backgroundColor: "white",
                        borderRadius: 10,
                        marginBottom: 5,
                        borderWidth: 1.5,
                        borderColor: BORDER,
                      }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 9, flex: 1 }}>
                        <View style={{ width: 32, height: 24, borderRadius: 5, backgroundColor: "#E8E8E8", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Text style={{ fontSize: 13 }}>💳</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontFamily: Fonts.extraBold, fontSize: 14, color: DARK, lineHeight: 18 }}>{p.name}</Text>
                          <Text style={{ fontFamily: Fonts.semiBold, fontSize: 13, color: DARK, marginTop: 2, lineHeight: 18 }}>
                            {p.daysUntil === 0
                              ? "Due today"
                              : p.daysUntil === 1
                                ? "Due tomorrow"
                                : `Due in ${p.daysUntil} days`}
                            {typeof p.apr === "number" && p.apr > 0 ? ` · ${p.apr}% APR` : ""}
                            {` · due ${getNextPaymentDueDate(p.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                          </Text>
                        </View>
                      </View>
                      <View style={{ alignItems: "flex-end", flexShrink: 0, marginLeft: 8 }}>
                        <Text style={{ fontFamily: Fonts.black, fontSize: 17, color: DARK }}>
                          ${Math.round(p.minimumPayment || 0).toLocaleString("en-US")}
                        </Text>
                        <Text style={{ fontFamily: Fonts.semiBold, fontSize: 12, color: DARK }}>Min due · tap to log</Text>
                      </View>
                    </Pressable>
                  ))
                )}
                {upcomingPaymentsUnpaid.length > 0 && (
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#2E1408", borderRadius: 9, paddingHorizontal: 11, paddingVertical: 9, marginTop: 6, borderWidth: 1.5, borderColor: "#1A0A00" }}>
                    <Text style={{ fontFamily: Fonts.black, fontSize: 13, color: "#FFF5E4" }}>Minimum still to log</Text>
                    <Text style={{ fontFamily: Fonts.black, fontSize: 16, color: "#F5C030" }}>${totalUpcomingAmt.toLocaleString("en-US")}</Text>
                  </View>
                )}
                <Text style={{ fontFamily: Fonts.semiBold, fontSize: 12, color: MUTED, textAlign: "center", marginTop: 8, lineHeight: 17 }}>
                  Enter the amount you actually paid (can be more than the minimum). Tax/IRS debts only show here when you marked them on a payment plan. Each log updates your balances and earns +{DAY1_PER_PAYMENT_XP} XP; logged items drop off this list.
                </Text>
              </View>
            )}
          </View>
          )}

          {/* ── TASK 4: Relief consult — optional, no XP; CTA opens partner LP */}
          <View
            style={{
              ...taskCard(T(3)),
              borderColor: T(3) ? "#2C7A43" : "#9B59B6",
              alignItems: "flex-start",
            }}
          >
            <View style={[ring(T(3), "#9B59B6", "#7B3FA6"), { marginTop: 2 }]}>
              <Text style={{ color: "white", fontSize: 12, fontFamily: Fonts.black }}>{T(3) ? "✓" : "→"}</Text>
            </View>
            <Text style={{ fontSize: 21, flexShrink: 0, marginTop: 2 }}>{day1EvalOffer.icon}</Text>
            <View style={{ flex: 1, gap: 10 }}>
              <View>
                <Text style={taskName(T(3))}>{day1EvalOffer.title}</Text>
                <Text style={taskDesc(T(3))}>{day1EvalOffer.desc}</Text>
              </View>
              <Pressable
                onPress={openDay1EvalOffer}
                disabled={T(3)}
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: T(3) ? BORDER : "#7B3FA6",
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 12,
                  opacity: T(3) ? 0.85 : 1,
                }}
              >
                <Text style={{ fontFamily: Fonts.black, fontSize: 14, color: T(3) ? MUTED : "#FFFFFF" }}>
                  {T(3) ? "Link opened" : "See if you qualify"}
                </Text>
              </Pressable>
            </View>
            <View style={{ alignItems: "flex-end", flexShrink: 0, marginTop: 2, maxWidth: 88 }}>
              <Text style={{ fontFamily: Fonts.semiBold, fontSize: 10, color: MUTED, textAlign: "right", lineHeight: 14 }}>
                Optional · no XP
              </Text>
            </View>
          </View>

          {/* ── CTA BUTTON ── */}
          <Pressable
            onPress={() => {
              if (!day1HasUpcomingSnapshot) {
                setDexStatusText("Starting today's tasks...");
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                return;
              }
              if (!allDone) {
                setDexStatusText("Finish today's tasks first to complete Day 1.");
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                return;
              }
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              if (!tasksDone[3]) {
                Alert.alert(
                  "Skip relief options for now?",
                  "A short consult can help you compare programs. You can open this anytime from your dashboard.",
                  [
                    { text: "See options", onPress: () => openDay1EvalOffer() },
                    { text: "Complete day", onPress: () => { void handleDay1Commit(); } },
                  ]
                );
                return;
              }
              void handleDay1Commit();
            }}
            style={{
              width: "100%",
              borderRadius: 22,
              overflow: "hidden",
              marginTop: 6,
              opacity: allDone ? 1 : 0.6,
              shadowColor: GREEN,
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: allDone ? 0.4 : 0,
              shadowRadius: 28,
              elevation: allDone ? 8 : 0,
            }}>
            <LinearGradient colors={["#3A9A20", "#2A8010"]} start={{ x: 0.13, y: 0 }} end={{ x: 1, y: 1 }}
              style={{ paddingVertical: 22, paddingHorizontal: 16, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontFamily: Fonts.black, fontSize: 19, color: "white", textAlign: "center", lineHeight: 26 }}>Day 1 Complete - See My Dashboard 🎯</Text>
              <Animated.View pointerEvents="none" style={{ position: "absolute", top: 0, bottom: 0, width: "55%", transform: [{ translateX: shimmerX }] }}>
                <LinearGradient colors={["transparent", "rgba(255,255,255,0.22)", "transparent"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
              </Animated.View>
            </LinearGradient>
          </Pressable>

        </View>
        </ScrollView>

        <Modal
          visible={payModalDebtId !== null}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setPayModalDebtId(null);
            setPayModalAmount("");
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)", padding: 20 }}
          >
            {(() => {
              const md = payModalDebtId ? upcomingPayments.find((x) => x.id === payModalDebtId) : undefined;
              if (!md) return null;
              return (
                <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 20, borderWidth: 2, borderColor: BORDER }}>
                  <Text style={{ fontFamily: Fonts.black, fontSize: 18, color: DARK, marginBottom: 6 }}>Log payment</Text>
                  <Text style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: DARK, marginBottom: 14 }}>{md.name}</Text>
                  <Text style={{ fontFamily: Fonts.extraBold, fontSize: 11, color: MUTED, marginBottom: 4 }}>AMOUNT YOU PAID</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 2, borderColor: BORDER, borderRadius: 10, paddingHorizontal: 12, marginBottom: 12 }}>
                    <Text style={{ fontFamily: Fonts.black, fontSize: 18, color: DARK }}>$</Text>
                    <TextInput
                      value={payModalAmount}
                      onChangeText={setPayModalAmount}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor={WarmContrast.textPlaceholder}
                      style={{ flex: 1, fontFamily: Fonts.bold, fontSize: 18, color: DARK, paddingVertical: 12 }}
                    />
                  </View>
                  <Text style={{ fontFamily: Fonts.semiBold, fontSize: 13, color: DARK, marginBottom: 16, lineHeight: 18 }}>
                    Current balance: ${Math.round(md.balance || 0).toLocaleString("en-US")}. You will earn +{DAY1_PER_PAYMENT_XP} XP. Amount cannot exceed balance.
                  </Text>
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <Pressable
                      onPress={() => {
                        setPayModalDebtId(null);
                        setPayModalAmount("");
                      }}
                      style={{ flex: 1, paddingVertical: 14, alignItems: "center", borderRadius: 12, borderWidth: 2, borderColor: BORDER }}
                    >
                      <Text style={{ fontFamily: Fonts.bold, color: DARK }}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => void submitDay1PaymentLog()}
                      style={{ flex: 1, paddingVertical: 14, alignItems: "center", borderRadius: 12, backgroundColor: BLUE }}
                    >
                      <Text style={{ fontFamily: Fonts.black, color: "#fff" }}>Save (+{DAY1_PER_PAYMENT_XP} XP)</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })()}
          </KeyboardAvoidingView>
        </Modal>
      </View>
    );
  }

  // ── COMMIT PHASE ──────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <View style={{ height: 6, backgroundColor: BORDER, marginTop: topPad + 8 }}>
        <View style={{ width: "94%", height: 6, backgroundColor: BLUE, borderRadius: 3 }} />
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 6 }}>
        <Pressable onPress={onBack} hitSlop={8} style={{ flexDirection: "row", alignItems: "center", marginRight: 10 }}>
          <Ionicons name="chevron-back" size={16} color="#0D3B66" />
          <Text style={{ fontFamily: Fonts.semiBold, fontSize: 12, color: "#0D3B66" }}>Back</Text>
        </Pressable>
        <Text style={{ fontFamily: Fonts.semiBold, fontSize: 12, color: MUTED, letterSpacing: 0.8, textTransform: "uppercase", flex: 1 }}>Almost done</Text>
        <Text style={{ fontFamily: Fonts.semiBold, fontSize: 12, color: MUTED, letterSpacing: 0.8, textTransform: "uppercase" }}>94%</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>

        <View style={{ alignItems: "center", marginBottom: 16 }}>
          <Text style={{ fontFamily: Fonts.semiBold, fontSize: 12, color: BLUE, letterSpacing: 2.2, textTransform: "uppercase", marginBottom: 8 }}>One Last Step</Text>
          <Text style={{ fontFamily: Fonts.black, fontSize: 30, color: DARK, lineHeight: 36, textAlign: "center" }}>
            Make it <Text style={{ color: BLUE }}>official.</Text>
          </Text>
        </View>

        <Animated.View style={{ alignItems: "center", marginBottom: 14, transform: [{ translateY: bounceAnim }] }}>
          {committed ? (
            <DexCoin size={104} mood={ONBOARDING_DEX.commitReady.mood} motion={ONBOARDING_DEX.commitReady.motion} />
          ) : (
            <DexCoin size={104} mood={ONBOARDING_DEX.commitIdle.mood} motion={ONBOARDING_DEX.commitIdle.motion} />
          )}
        </Animated.View>

        <View style={{ backgroundColor: "white", borderWidth: 2, borderColor: "#D4C8B8", borderRadius: 16, padding: 18, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}>
          <Text style={{ fontFamily: Fonts.semiBold, fontSize: 16, color: DARK, lineHeight: 24, textAlign: "center" }}>
            You've done something most people never do. You built a real plan. Now seal it with a commitment. 🤝
          </Text>
        </View>

        <View style={{ backgroundColor: DARK, borderRadius: 18, padding: 20, marginBottom: 16 }}>
          {[
            { label: "Total Debt",    val: fmtTotal },
            { label: "Payoff Method", val: strategy },
            { label: "Debt-Free By",  val: payoffStr },
            { label: "Dream Goal",    val: dreamStr },
          ].map((row, i, arr) => (
            <View key={row.label} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 11, borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: "rgba(255,255,255,0.2)" }}>
              <Text style={{ fontFamily: Fonts.semiBold, fontSize: 13, color: "#FFFFFF" }}>{row.label}</Text>
              <Text style={{ fontFamily: Fonts.extraBold, fontSize: 16, color: "#FFFFFF", flexShrink: 1, maxWidth: "60%", textAlign: "right" }}>{row.val}</Text>
            </View>
          ))}
        </View>

        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCommitted(v => !v); }}
          style={{ backgroundColor: committed ? "#EFF6FF" : "white", borderWidth: 2.5, borderColor: committed ? BLUE : BORDER, borderRadius: 18, padding: 20, marginBottom: 16, flexDirection: "row", alignItems: "flex-start", gap: 14 }}
        >
          <View style={{ width: 30, height: 30, borderRadius: 9, borderWidth: 2.5, borderColor: committed ? BLUE : "#D4C8B8", backgroundColor: committed ? BLUE : "#F7F2EA", alignItems: "center", justifyContent: "center", marginTop: 1, flexShrink: 0 }}>
            {committed && <Text style={{ color: "white", fontSize: 15, fontWeight: "900" }}>✓</Text>}
          </View>
          <Text style={{ fontFamily: Fonts.extraBold, fontSize: 17, color: DARK, lineHeight: 25, flex: 1 }}>
            I am committed to this plan. I will make my payments, not add new debt, and check in with DebtPath to stay on track.{" "}
            <Text style={{ color: BLUE }}>My future self is counting on me.</Text>
          </Text>
        </Pressable>

        <Pressable
          onPress={handleCommitPress}
          style={{ width: "100%", borderRadius: 22, overflow: "hidden", marginBottom: 6, opacity: committed ? 1 : 0.4, shadowColor: BLUE, shadowOffset: { width: 0, height: 10 }, shadowOpacity: committed ? 0.4 : 0, shadowRadius: 28, elevation: committed ? 8 : 0 }}
        >
          <LinearGradient colors={["#1A6FC4", "#0D5BAE"]} start={{ x: 0.13, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ paddingVertical: 22, paddingHorizontal: 16, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontFamily: Fonts.black, fontSize: 20, color: "white", textAlign: "center" }}>✊ I Commit - Let's Do This!</Text>
            {committed && (
              <Animated.View pointerEvents="none" style={{ position: "absolute", top: 0, bottom: 0, width: "55%", transform: [{ translateX: shimmerX }] }}>
                <LinearGradient colors={["transparent", "rgba(255,255,255,0.22)", "transparent"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
              </Animated.View>
            )}
          </LinearGradient>
        </Pressable>

      </ScrollView>
    </View>
  );
}

function CoachSettingsScreen({
  isDark,
  bg,
  topPad,
  botPad,
  onNext,
  onBack,
}: {
  isDark: boolean;
  bg: string;
  topPad: number;
  botPad: number;
  onNext: (email: boolean, push: boolean, sound: boolean) => void | Promise<void>;
  onBack: () => void;
}) {
  const BG       = isDark ? "#1C1610" : "#F8F6F2";
  const AMBER    = isDark ? "#E8A030" : "#C07820";
  const DARK     = isDark ? "#F0E8D0" : "#1A0E04";
  const MUTED    = isDark ? "#C09050" : Colors.light.textSecondary;
  const CARD_BG  = isDark ? "#2C2014" : "#FFFFFF";
  const CARD_BDR = isDark ? "rgba(232,160,48,0.2)" : "rgba(192,120,32,0.20)";

  const [emailOn,   setEmailOn]   = useState(true);
  const [notifOn,   setNotifOn]   = useState(true);
  const [soundOn,   setSoundOn]   = useState(true);
  const [phase,     setPhase]     = useState("coach");
  const [dreamName, setDreamName] = useState("");

  useEffect(() => {
    AsyncStorage.getItem("@debtpath_dream_goal_name").then(v => { if (v) setDreamName(v); }).catch(() => {});
  }, []);

  const bounceAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -14, duration: 420, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0,   duration: 380, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (phase !== "launch") return;
    let sound: Audio.Sound | null = null;
    (async () => {
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const { sound: s } = await Audio.Sound.createAsync(
          require("../assets/sounds/Sucess.wav"),
          { shouldPlay: true, volume: 1.0 }
        );
        sound = s;
        s.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) s.unloadAsync();
        });
      } catch (_) {}
    })();
    return () => { sound?.unloadAsync(); };
  }, [phase]);

  const pulseAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const today    = new Date();
  const DAYS_S   = ["Su","Mo","Tu","We","Th","Fr","Sa"];
  const DAY_N    = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const MON_N    = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const todayIdx = today.getDay();
  const dateStr  = DAY_N[todayIdx] + ", " + MON_N[today.getMonth()] + " " + today.getDate() + ", " + today.getFullYear();
  const streakDays = Array.from({ length: 7 }, (_, i) => ({ label: DAYS_S[(todayIdx + i) % 7], active: i === 0 }));

  const CustomToggle = ({ value, onToggle }: { value: boolean; onToggle: () => void }) => {
    const anim = useRef(new Animated.Value(value ? 1 : 0)).current;
    useEffect(() => { Animated.timing(anim, { toValue: value ? 1 : 0, duration: 200, useNativeDriver: false }).start(); }, [value]);
    const tx  = anim.interpolate({ inputRange: [0, 1], outputRange: [2, 21] });
    const bgC = anim.interpolate({ inputRange: [0, 1], outputRange: ["rgba(160,104,48,0.25)", AMBER] });
    return (
      <Pressable onPress={onToggle} style={{ width: 44, height: 25, borderRadius: 13 }}>
        <Animated.View style={{ width: 44, height: 25, borderRadius: 13, backgroundColor: bgC, justifyContent: "center" }}>
          <Animated.View style={{ width: 19, height: 19, borderRadius: 10, backgroundColor: "white", position: "absolute", top: 3, transform: [{ translateX: tx }], shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } }} />
        </Animated.View>
      </Pressable>
    );
  };

  type EnabledPref = { icon: string; label: string };
  const enabledPrefs: EnabledPref[] = [
    emailOn ? { icon: "📧", label: "Email coaching enabled" } : null,
    notifOn ? { icon: "🔔", label: "App notifications enabled" } : null,
    soundOn ? { icon: "🔊", label: "Sound alerts enabled" } : null,
  ].filter((p): p is EnabledPref => Boolean(p));
  if (enabledPrefs.length === 0) enabledPrefs.push({ icon: "👤", label: "Solo mode - you’ve got this!" });

  if (phase === "launch") {
    return (
      <View style={{ flex: 1, backgroundColor: "#2A1808", alignItems: "center", justifyContent: "center", paddingHorizontal: 28, paddingTop: topPad, paddingBottom: Math.max(botPad, 20) + 16 }}>
        <Confetti key="launch-conf" />
        <Animated.View style={{ transform: [{ translateY: bounceAnim }], marginBottom: 28 }}>
          <DexCoin size={120} mood={ONBOARDING_DEX.completeCelebration.mood} motion={ONBOARDING_DEX.completeCelebration.motion} />
        </Animated.View>
        <Text style={{ fontFamily: Fonts.bold, fontSize: 15, letterSpacing: 3.5, color: "rgba(234,168,53,0.8)", textTransform: "uppercase", marginBottom: 8, textAlign: "center" }}>Your journey starts now</Text>
        <Text style={{ fontFamily: Fonts.serif, fontSize: 31, color: "#EDE8D5", textAlign: "center", lineHeight: 40, marginBottom: 8 }}>
          {"You’re officially "}
          <Text style={{ color: "#E8960A", fontStyle: "italic" }}>{"doing\nthis."}</Text>
        </Text>
        <Text style={{ fontFamily: Fonts.regular, fontSize: 16, color: "rgba(237,232,213,0.6)", textAlign: "center", lineHeight: 26, marginBottom: 24 }}>
          Dex will be right here with you - every payment, every milestone, every win. Let’s go build your debt-free life.
        </Text>
        <View style={{ width: "100%", gap: 10, marginBottom: 26 }}>
          {enabledPrefs.map((p, i) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 18, paddingVertical: 16, paddingHorizontal: 16 }}>
              <Text style={{ fontSize: 22 }}>{p.icon}</Text>
              <Text style={{ fontFamily: Fonts.semiBold, fontSize: 17, color: "rgba(237,232,213,0.8)", flex: 1 }}>{p.label}</Text>
              <View style={{ width: 26, height: 26, borderRadius: 9, backgroundColor: AMBER, alignItems: "center", justifyContent: "center" }}>
                <Svg width={11} height={9} viewBox="0 0 11 9">
                  <Path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
            </View>
          ))}
        </View>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); onNext(emailOn, notifOn, soundOn); }}
          style={({ pressed }) => ({ width: "100%", backgroundColor: AMBER, borderRadius: 28, paddingVertical: 16, alignItems: "center", opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] })}
        >
          <Text style={{ fontFamily: Fonts.bold, fontSize: 19, color: "white", letterSpacing: 0.3 }}>Open Day 1 Dashboard ›</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: topPad + 14, paddingHorizontal: 20, paddingBottom: Math.max(botPad, 20) + 80 }} showsVerticalScrollIndicator={false}>
        {/* Back nav */}
        <Pressable onPress={onBack} hitSlop={8} style={{ flexDirection: "row", alignItems: "center", marginBottom: 10, alignSelf: "flex-start" }}>
          <Ionicons name="chevron-back" size={16} color="#0D3B66" />
          <Text style={{ fontFamily: Fonts.bold, fontSize: 13, color: "#0D3B66" }}>Back</Text>
        </Pressable>

        {/* step bar */}
        <View style={{ flexDirection: "row", gap: 5, marginBottom: 16 }}>
          {[1,2,3,4].map(i => (
            <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: AMBER, opacity: i < 4 ? 0.55 : 1 }} />
          ))}
        </View>

        {/* Dex with pulsing ring */}
        <View style={{ alignItems: "center", marginBottom: 20, height: 130 }}>
          <Animated.View style={{
            position: "absolute", width: 100, height: 100, borderRadius: 50,
            borderWidth: 3, borderColor: "rgba(192,120,32,0.35)",
            top: 14,
            opacity: pulseAnim.interpolate({ inputRange: [0,1], outputRange: [1, 0.2] }),
            transform: [{ scale: pulseAnim.interpolate({ inputRange: [0,1], outputRange: [1, 1.25] }) }],
          }} />
          <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
            <DexCoin size={118} mood={ONBOARDING_DEX.completeCoach.mood} motion={ONBOARDING_DEX.completeCoach.motion} />
          </Animated.View>
        </View>

        <Text style={{ fontFamily: Fonts.bold, fontSize: 13, letterSpacing: 3, color: AMBER, textTransform: "uppercase", textAlign: "center", marginBottom: 6 }}>Well done!</Text>
        <Text style={{ fontFamily: Fonts.serif, fontSize: 26, color: DARK, textAlign: "center", lineHeight: 34, marginBottom: 8 }}>
          {`“You’ve done what `}
          <Text style={{ color: AMBER, fontStyle: "italic" }}>most people</Text>
          {`
won’t do. I’m proud of you.”`}

        </Text>
        <Text style={{ fontFamily: Fonts.regular, fontSize: 14, color: MUTED, textAlign: "center", lineHeight: 22, marginBottom: 16 }}>
          {"Now let’s keep you winning. How would you like me to coach you to stay consistent?"}
        </Text>

        {/* summary strip */}
        <View style={{ flexDirection: "row", gap: 7, marginBottom: 14 }}>
          {[
            { val: "Your plan",             lbl: "Saving/mo" },
            { val: "On track",              lbl: "Debt-free" },
            { val: dreamName || "Dream 🌟", lbl: "Dream goal" },
          ].map(({ val, lbl }) => (
            <View key={lbl} style={{ flex: 1, backgroundColor: CARD_BG, borderWidth: 1.5, borderColor: CARD_BDR, borderRadius: 14, padding: 9, alignItems: "center" }}>
              <Text style={{ fontFamily: Fonts.serif, fontSize: 15, color: DARK, lineHeight: 20 }} numberOfLines={1}>{val}</Text>
              <Text style={{ fontFamily: Fonts.bold, fontSize: 11, color: MUTED, letterSpacing: 0.9, textTransform: "uppercase" }}>{lbl}</Text>
            </View>
          ))}
        </View>

        {/* coach card with toggles */}
        <View style={{ backgroundColor: CARD_BG, borderRadius: 20, borderWidth: 1.5, borderColor: CARD_BDR, padding: 15, marginBottom: 11 }}>
          <Text style={{ fontFamily: Fonts.serif, fontSize: 17, color: DARK, lineHeight: 25, marginBottom: 6 }}>
            {"How would you like me to coach you to stay consistent so you be debt-free and then get "}
            <Text style={{ color: AMBER, fontStyle: "italic" }}>{dreamName ? ('"' + dreamName + '"') : "your dream"}</Text>
            {"?"}
          </Text>
          <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: MUTED, marginBottom: 10, lineHeight: 19 }}>
            Turn on the reminders that work best for you. Most people choose all three.
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(192,120,32,0.08)", borderRadius: 10, padding: 7, paddingHorizontal: 11, marginBottom: 11 }}>
            <Text style={{ fontSize: 15 }}>{"🏆"}</Text>
            <Text style={{ fontFamily: Fonts.regular, fontStyle: "italic", fontSize: 13, color: MUTED, flex: 1 }}>
              <Text style={{ fontFamily: Fonts.bold, color: AMBER, fontStyle: "normal" }}>87% of users</Text>
              {" who keep all 3 on reach their debt-free date."}
            </Text>
          </View>
          {[
            { icon: "📧", bg: "rgba(59,109,17,0.12)",  name: "Email coaching",    sub: "Weekly wins, tips, and milestone alerts",       val: emailOn, set: () => { setEmailOn(v => !v); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } },
            { icon: "🔔", bg: "rgba(24,95,165,0.11)",  name: "App notifications", sub: "Daily check-in nudges and streak reminders",    val: notifOn, set: () => { setNotifOn(v => !v); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } },
            { icon: "🔊", bg: "rgba(192,120,32,0.13)", name: "Sound alerts",       sub: "Celebration sounds when you hit milestones",   val: soundOn, set: () => { setSoundOn(v => !v); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } },
          ].map((row, i, arr) => (
            <View key={row.name} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: "rgba(192,120,32,0.10)" }}>
              <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: row.bg, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 18 }}>{row.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: Fonts.bold, fontSize: 15, color: DARK }}>{row.name}</Text>
                <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: MUTED }}>{row.sub}</Text>
              </View>
              <CustomToggle value={row.val} onToggle={row.set} />
            </View>
          ))}
        </View>

        {/* Day 1 card */}
        <View style={{ backgroundColor: CARD_BG, borderRadius: 20, borderWidth: 1.5, borderColor: CARD_BDR, padding: 15, marginBottom: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: AMBER, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 20 }}>{"🚀"}</Text>
            </View>
            <View>
              <Text style={{ fontFamily: Fonts.serif, fontSize: 18, color: DARK }}>Day 1 starts today</Text>
              <Text style={{ fontFamily: Fonts.bold, fontSize: 13, color: AMBER, letterSpacing: 0.5 }}>{dateStr}</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 9 }}>
            <View style={{ flex: 1, height: 8, backgroundColor: "rgba(192,120,32,0.14)", borderRadius: 4, overflow: "hidden" }}>
              <View style={{ height: "100%", width: "4%", backgroundColor: AMBER, borderRadius: 4 }} />
            </View>
            <Text style={{ fontFamily: Fonts.bold, fontSize: 13, color: MUTED }}>Day 1</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 6 }}>
            {streakDays.map((d, i) => (
              <View key={i} style={{ flex: 1, alignItems: "center", backgroundColor: d.active ? AMBER : "rgba(192,120,32,0.07)", borderRadius: 10, paddingVertical: 7, borderWidth: 1.5, borderColor: d.active ? AMBER : "transparent" }}>
                <Text style={{ fontFamily: Fonts.bold, fontSize: 11, color: d.active ? "rgba(255,255,255,0.75)" : MUTED, textTransform: "uppercase", letterSpacing: 0.5 }}>{d.label}</Text>
                <Text style={{ fontSize: 14, marginVertical: 2 }}>{d.active ? "🔥" : "⬜"}</Text>
                <Text style={{ fontFamily: Fonts.serif, fontSize: 15, color: d.active ? "white" : DARK }}>{d.active ? "1" : " "}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTA */}
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); setPhase("launch"); }}
          style={({ pressed }) => ({ width: "100%", backgroundColor: AMBER, borderRadius: 30, paddingVertical: 17, alignItems: "center", marginBottom: 7, opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] })}
        >
          <Text style={{ fontFamily: Fonts.bold, fontSize: 17, color: "white", letterSpacing: 0.3 }}>Get started - Day 1 ›</Text>
        </Pressable>

        {notifOn && (
          <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: MUTED, textAlign: "center", marginBottom: 8 }}>
            We'll ask your device for notification permission on the next step.
          </Text>
        )}

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 }}>
          <Svg width={12} height={14} viewBox="0 0 12 14">
            <Path d="M1 6h10v6a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V6z" fill={MUTED} />
            <Path d="M3 6V4A3 3 0 0 1 9 4V6" stroke={MUTED} strokeWidth={1.5} strokeLinecap="round" fill="none" />
            <Circle cx={6} cy={10} r={1.2} fill="#EDE8D5" />
          </Svg>
          <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: MUTED }}>Your data stays private. No credit card ever needed.</Text>
        </View>
      </ScrollView>
    </View>
  );
}


function StreakBornScreen({ isDark, bg, topPad, botPad, onNext, onBack }: any) {
  const DAYS_S = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const MON_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const LEVELS = ["Rookie","Hustler","Fighter","Warrior","Champion","Legend"];
  const today = new Date();
  const todayIdx = today.getDay();
  const dateStr = DAY_NAMES[todayIdx] + ", " + MON_NAMES[today.getMonth()] + " " + today.getDate() + ", " + today.getFullYear();

  const BG      = isDark ? "#1C1610" : "#F8F6F2";
  const AMBER   = isDark ? "#E8A030" : "#C07820";
  const DARK    = isDark ? "#F0E8D0" : "#1A0E04";
  const MUTED   = isDark ? "#C09050" : Colors.light.textSecondary;
  const CARD_BG = isDark ? "#2C2014" : "#FFFFFF";
  const CARD_BDR = isDark ? "rgba(232,160,48,0.2)" : "rgba(192,120,32,0.18)";
  const BTN_DARK = isDark ? "#3A2C1A" : "#2A1808";

  type Task = { id: string; icon: string; name: string; sub: string; pts: number; done: boolean; speech: string; dexAnim: "bounce"|"pop"|"shake"|"spin" };
  const TASKS_INIT: Task[] = [
    { id:"review",  icon:"📋", name:"Review your debt list",   sub:"Check your debts in the app",                 pts:10, done:false, speech:"Knowledge is power. You've got this! 📋",   dexAnim:"bounce" },
    { id:"payment", icon:"💸", name:"Log a payment",           sub:"Even the minimum counts - every dollar wins", pts:10, done:false, speech:"That payment just got you closer! 🎯",       dexAnim:"pop"    },
    { id:"budget",  icon:"📊", name:"Check your budget",       sub:"5 minutes to review this week's spending",    pts:10, done:false, speech:"You looked at the numbers. That's rare! 💡", dexAnim:"shake"  },
    { id:"boost",   icon:"☕", name:"Skip one daily coffee",   sub:"Save $0.50-$5 toward your dream goal",        pts:15, done:false, speech:"One skip today = one day sooner! ☕",         dexAnim:"spin"   },
    { id:"learn",   icon:"📖", name:"Read one tip from Dex",   sub:"30 seconds of financial wisdom",              pts: 5, done:false, speech:"Smart move. Knowledge compounds too! 🧠",    dexAnim:"bounce" },
  ];

  type Toast = { id: number; icon: string; msg: string };
  type Conf  = { id: number; x: number; color: string; size: number; round: boolean };

  const [tasks,        setTasks]        = useState<Task[]>(TASKS_INIT);
  const [xp,           setXp]           = useState(0);
  const [level,        setLevel]        = useState(1);
  const [bubble,       setBubble]       = useState("");
  const [bubbleVis,    setBubbleVis]    = useState(false);
  const [allDone,      setAllDone]      = useState(false);
  const [toasts,       setToasts]       = useState<Toast[]>([]);
  const [confetti,     setConfetti]     = useState<Conf[]>([]);
  const [xpFloats,     setXpFloats]     = useState<{id:number;pts:number}[]>([]);
  const [rippleTask,   setRippleTask]   = useState<string|null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("@debtpath_coach_sound").then(v => {
      if (v !== null) setSoundEnabled(v === "true");
    }).catch(() => {});
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true }).catch(() => {});
  }, []);

  const playChime = (big: boolean) => {
    if (!soundEnabled) return;
    if (Platform.OS === "web") {
      try {
        const ac = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
        const notes: [number, number][] = big
          ? [[523,0],[659,0.07],[784,0.14],[1047,0.22],[1319,0.32]]
          : [[659,0],[784,0.07],[1047,0.16]];
        notes.forEach(([freq, t]) => {
          const o = ac.createOscillator(), g = ac.createGain();
          o.connect(g); g.connect(ac.destination);
          o.frequency.value = freq; o.type = "sine";
          g.gain.setValueAtTime(0.1, ac.currentTime + t);
          g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + t + 0.4);
          o.start(ac.currentTime + t); o.stop(ac.currentTime + t + 0.45);
        });
      } catch (_) {}
    } else {
      const file = big
        ? require("../assets/sounds/milestone.wav")
        : require("../assets/sounds/xp_earned.wav");
      Audio.Sound.createAsync(file, { volume: 0.85 }).then(({ sound }) => {
        sound.playAsync();
        sound.setOnPlaybackStatusUpdate((s: any) => { if (s.didJustFinish) sound.unloadAsync().catch(() => {}); });
      }).catch(() => {});
    }
  };

  const playTick = () => {
    if (!soundEnabled) return;
    if (Platform.OS === "web") {
      try {
        const ac = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
        const notes: [number, number][] = [[880, 0], [1100, 0.06]];
        notes.forEach(([freq, t]) => {
          const o = ac.createOscillator(), g = ac.createGain();
          o.connect(g); g.connect(ac.destination);
          o.frequency.value = freq; o.type = "sine";
          g.gain.setValueAtTime(0.06, ac.currentTime + t);
          g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + t + 0.15);
          o.start(ac.currentTime + t); o.stop(ac.currentTime + t + 0.15);
        });
      } catch (_) {}
    }
  };

  const playFanfare = () => {
    if (!soundEnabled) return;
    if (Platform.OS === "web") {
      try {
        const ac = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
        const notes: [number, number][] = [[392,0],[494,0.09],[587,0.18],[784,0.28],[1047,0.4],[1319,0.54]];
        notes.forEach(([freq, t], i) => {
          const o = ac.createOscillator(), g = ac.createGain();
          o.connect(g); g.connect(ac.destination);
          o.frequency.value = freq; o.type = i < 3 ? "triangle" : "sine";
          g.gain.setValueAtTime(0.09, ac.currentTime + t);
          g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + t + 0.5);
          o.start(ac.currentTime + t); o.stop(ac.currentTime + t + 0.55);
        });
      } catch (_) {}
    } else {
      Audio.Sound.createAsync(require("../assets/sounds/Sucess.wav"), { volume: 0.9 }).then(({ sound }) => {
        sound.playAsync();
        sound.setOnPlaybackStatusUpdate((s: any) => { if (s.didJustFinish) sound.unloadAsync().catch(() => {}); });
      }).catch(() => {});
    }
  };

  const dexY          = useRef(new Animated.Value(0)).current;
  const dexScale      = useRef(new Animated.Value(1)).current;
  const dexRotate     = useRef(new Animated.Value(0)).current;
  const bubbleOpacity = useRef(new Animated.Value(0)).current;
  const bubbleScale   = useRef(new Animated.Value(0.8)).current;
  const ringScale     = useRef(new Animated.Value(0.5)).current;
  const ringOpacity   = useRef(new Animated.Value(0)).current;
  const xpBarAnim     = useRef(new Animated.Value(0)).current;
  const allDoneScale  = useRef(new Animated.Value(0.88)).current;
  const allDoneOp     = useRef(new Animated.Value(0)).current;
  const idRef         = useRef(0);
  const idleLoop      = useRef<Animated.CompositeAnimation|null>(null);
  const scrollRef     = useRef<any>(null);

  const startIdle = () => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(dexY, { toValue: -6, duration: 1300, useNativeDriver: true }),
      Animated.timing(dexY, { toValue:  0, duration: 1300, useNativeDriver: true }),
    ]));
    idleLoop.current = loop;
    loop.start();
  };

  useEffect(() => { startIdle(); }, []);

  const pulseRing = () => {
    ringScale.setValue(0.5);
    ringOpacity.setValue(1);
    Animated.parallel([
      Animated.timing(ringScale,   { toValue: 2,   duration: 900, useNativeDriver: true }),
      Animated.timing(ringOpacity, { toValue: 0,   duration: 900, useNativeDriver: true }),
    ]).start();
  };

  const runDexAnim = (anim: string) => {
    if (idleLoop.current) idleLoop.current.stop();
    dexY.stopAnimation();
    dexScale.stopAnimation();
    dexRotate.stopAnimation();

    let seq: Animated.CompositeAnimation;
    if (anim === "bounce") {
      seq = Animated.sequence([
        Animated.timing(dexY, { toValue: -22, duration: 200, useNativeDriver: true }),
        Animated.timing(dexY, { toValue: -10, duration: 140, useNativeDriver: true }),
        Animated.timing(dexY, { toValue: -16, duration: 120, useNativeDriver: true }),
        Animated.timing(dexY, { toValue:  -5, duration: 100, useNativeDriver: true }),
        Animated.timing(dexY, { toValue:   0, duration: 100, useNativeDriver: true }),
      ]);
    } else if (anim === "pop") {
      seq = Animated.sequence([
        Animated.timing(dexScale, { toValue: 1.22, duration: 190, useNativeDriver: true }),
        Animated.timing(dexScale, { toValue: 0.94, duration: 130, useNativeDriver: true }),
        Animated.timing(dexScale, { toValue: 1.00, duration: 130, useNativeDriver: true }),
      ]);
    } else if (anim === "shake") {
      seq = Animated.sequence([
        Animated.timing(dexRotate, { toValue: -9, duration: 80,  useNativeDriver: true }),
        Animated.timing(dexRotate, { toValue:  9, duration: 80,  useNativeDriver: true }),
        Animated.timing(dexRotate, { toValue: -6, duration: 70,  useNativeDriver: true }),
        Animated.timing(dexRotate, { toValue:  6, duration: 70,  useNativeDriver: true }),
        Animated.timing(dexRotate, { toValue:  0, duration: 60,  useNativeDriver: true }),
      ]);
    } else { // spin
      seq = Animated.sequence([
        Animated.timing(dexRotate, { toValue: 180, duration: 400, useNativeDriver: true }),
        Animated.timing(dexRotate, { toValue: 360, duration: 400, useNativeDriver: true }),
      ]);
    }

    seq.start(() => {
      dexScale.setValue(1);
      dexRotate.setValue(0);
      startIdle();
    });
  };

  const showBubble = (speech: string) => {
    setBubble(speech);
    setBubbleVis(true);
    bubbleOpacity.setValue(0);
    bubbleScale.setValue(0.8);
    Animated.parallel([
      Animated.timing(bubbleOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(bubbleScale,   { toValue: 1, friction: 6, tension: 100, useNativeDriver: true }),
    ]).start();
    setTimeout(() => {
      Animated.timing(bubbleOpacity, { toValue: 0, duration: 260, useNativeDriver: true }).start(() => setBubbleVis(false));
    }, 2600);
  };

  const spawnToast = (icon: string, msg: string) => {
    const id = idRef.current++;
    setToasts(t => [...t, { id, icon, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2600);
  };

  const spawnConfetti = () => {
    const colors = ["#C07820","#E8960A","#EAA835","#7A3A0C","#D09828","#F5C842","#A86010"];
    const items: Conf[] = Array.from({ length: 14 }, (_, i) => ({
      id: idRef.current++,
      x: 20 + Math.random() * 280,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 5 + Math.random() * 7,
      round: Math.random() > 0.45,
    }));
    setConfetti(c => [...c, ...items]);
    setTimeout(() => {
      const ids = new Set(items.map(x => x.id));
      setConfetti(c => c.filter(x => !ids.has(x.id)));
    }, 1800);
  };

  const spawnXpFloat = (pts: number) => {
    const id = idRef.current++;
    setXpFloats(f => [...f, { id, pts }]);
    setTimeout(() => setXpFloats(f => f.filter(x => x.id !== id)), 1400);
  };

  const completeTask = (idx: number) => {
    const task = tasks[idx];
    if (task.done) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // ripple flash
    setRippleTask(task.id);
    setTimeout(() => setRippleTask(null), 500);

    const newTasks = tasks.map((t, i) => i === idx ? { ...t, done: true } : t);
    setTasks(newTasks);

    // XP + level
    const newXpRaw = xp + task.pts;
    const newLevel = newXpRaw >= 100 ? level + 1 : level;
    const newXp    = newXpRaw >= 100 ? newXpRaw - 100 : newXpRaw;
    setXp(newXp);
    setLevel(newLevel);
    Animated.timing(xpBarAnim, { toValue: Math.min(newXp / 100, 1), duration: 700, useNativeDriver: false }).start();

    // reward chain
    playTick();
    playChime(task.pts === 15);
    spawnXpFloat(task.pts);
    pulseRing();
    runDexAnim(task.dexAnim);
    showBubble(task.speech);
    spawnToast(task.icon, task.speech);
    spawnConfetti();

    const doneCnt = newTasks.filter(t => t.done).length;
    if (doneCnt === newTasks.length) {
      setTimeout(() => {
        setAllDone(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        playFanfare();
        Animated.parallel([
          Animated.spring(allDoneScale, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
          Animated.timing(allDoneOp,    { toValue: 1, duration: 400, useNativeDriver: true }),
        ]).start();
        // big confetti burst x3
        spawnConfetti();
        setTimeout(spawnConfetti, 260);
        setTimeout(spawnConfetti, 480);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
      }, 700);
    }
  };

  const completedCount = tasks.filter(t => t.done).length;
  const progressPct    = completedCount / tasks.length;
  const CIRC = 132;
  const strokeOffset = CIRC - CIRC * progressPct;

  const progressMsgs = ["Let's tackle today's actions!", "Great start - keep going!", "You're building momentum! 🔥", "More than halfway there!", "Almost done - one more! 💪", "All done! Day 1 complete! 🎉"];
  const progressSubs  = [
    "Complete all 5 to earn your Day 1 streak 🔥",
    completedCount + " of 5 done - Dex is watching!",
    completedCount + " of 5 done - you're on fire!",
    completedCount + " of 5 done - unstoppable!",
    completedCount + " of 5 done - finish strong!",
    "Your streak is locked in for today! 🏆",
  ];

  const streakDays7 = Array.from({ length: 7 }, (_, i) => DAYS_S[(todayIdx + i) % 7]);
  const totalXP     = tasks.reduce((s, t) => s + t.pts, 0);

  const dexTransform = [
    { translateY: dexY },
    { scale:      dexScale },
    { rotate:     dexRotate.interpolate({ inputRange: [-360, 360], outputRange: ["-360deg","360deg"] }) },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* Back button */}
      <BackBtn onPress={onBack} isDark={isDark} topPad={topPad} />

      {/* Confetti layer */}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 30, pointerEvents: "none" }} pointerEvents="none">
        {confetti.map(c => (
          <ConfettiPiece key={c.id} x={c.x} color={c.color} size={c.size} round={c.round} />
        ))}
      </View>

      {/* Toast layer */}
      <View style={{ position: "absolute", bottom: 80, left: 0, right: 0, zIndex: 50, alignItems: "center", gap: 8 }} pointerEvents="none">
        {toasts.map(t => (
          <ToastItem key={t.id} icon={t.icon} msg={t.msg} />
        ))}
      </View>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: topPad + 10, paddingHorizontal: 20, paddingBottom: Math.max(botPad, 24) + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <View>
            <Text style={{ fontFamily: Fonts.serif, fontSize: 26, color: DARK }}>{"Day 1 \uD83D\uDE80"}</Text>
            <Text style={{ fontFamily: Fonts.bold, fontSize: 13, color: MUTED }}>{dateStr}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: CARD_BG, borderWidth: 1.5, borderColor: CARD_BDR, borderRadius: 20, paddingVertical: 5, paddingHorizontal: 11 }}>
            <Text style={{ fontSize: 15 }}>{"\uD83D\uDD25"}</Text>
            <Text style={{ fontFamily: Fonts.serif, fontSize: 15, color: AMBER }}>{"1"}</Text>
            <Text style={{ fontFamily: Fonts.bold, fontSize: 12, color: MUTED }}>day streak</Text>
          </View>
        </View>

        {/* XP card */}
        <View style={{ backgroundColor: CARD_BG, borderRadius: 16, borderWidth: 1.5, borderColor: CARD_BDR, padding: 16, marginBottom: 12 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={{ fontFamily: Fonts.bold, fontSize: 13, color: DARK }}>{"Level " + level + " \u2014 " + (LEVELS[level - 1] || "Legend")}</Text>
            <Text style={{ fontFamily: Fonts.bold, fontSize: 13, color: AMBER }}>{xp + " / 100 XP"}</Text>
          </View>
          <View style={{ height: 11, backgroundColor: "rgba(192,120,32,0.14)", borderRadius: 6, overflow: "hidden" }}>
            <Animated.View style={{ height: "100%", borderRadius: 5, backgroundColor: AMBER, width: xpBarAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) }} />
          </View>
        </View>

        {/* Dex area */}
        <View style={{ alignItems: "center", height: 158, position: "relative", marginBottom: 8 }}>
          {/* Expanding ring */}
          <Animated.View style={{
            position: "absolute",
            width: 112, height: 112,
            borderRadius: 56,
            borderWidth: 3, borderColor: "rgba(192,120,32,0.4)",
            top: 23,
            opacity: ringOpacity,
            transform: [{ scale: ringScale }],
          }} />
          {/* Speech bubble */}
          {bubbleVis && (
            <Animated.View style={{
              position: "absolute", top: 0, zIndex: 10, maxWidth: 270,
              backgroundColor: BTN_DARK, borderRadius: 18, paddingVertical: 8, paddingHorizontal: 16,
              opacity: bubbleOpacity,
              transform: [{ scale: bubbleScale }],
              shadowColor: BTN_DARK, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
            }}>
              <Text style={{ fontFamily: Fonts.bold, fontSize: 13, color: "#EDE8D5", textAlign: "center" }}>{bubble}</Text>
              <View style={{ position: "absolute", bottom: -5, left: "50%", marginLeft: -5, width: 0, height: 0, borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 5, borderLeftColor: "transparent", borderRightColor: "transparent", borderTopColor: BTN_DARK }} />
            </Animated.View>
          )}
          {/* Dex */}
          <Animated.View style={{ position: "absolute", bottom: 0, transform: dexTransform }}>
            <DexCoin size={115} mood={ONBOARDING_DEX.dailyFlow.mood} motion={ONBOARDING_DEX.dailyFlow.motion} />
          </Animated.View>
          {/* XP floats */}
          {xpFloats.map(f => (
            <XpFloat key={f.id} pts={f.pts} color={AMBER} />
          ))}
        </View>

        {/* Progress row */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <View style={{ position: "relative", width: 60, height: 60 }}>
            <Svg width={60} height={60} viewBox="0 0 60 60" style={{ transform: [{ rotate: "-90deg" }] }}>
              <Circle cx={30} cy={30} r={24} fill="none" stroke="rgba(192,120,32,0.14)" strokeWidth={5.5} />
              <Circle cx={30} cy={30} r={24} fill="none" stroke={AMBER} strokeWidth={5.5}
                strokeDasharray={CIRC} strokeDashoffset={strokeOffset} strokeLinecap="round" />
            </Svg>
            <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontFamily: Fonts.serif, fontSize: 14, color: DARK }}>{Math.round(progressPct * 100) + "%"}</Text>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: Fonts.bold, fontSize: 14, color: DARK, marginBottom: 2 }}>
              {progressMsgs[Math.min(completedCount, 5)]}
            </Text>
            <Text style={{ fontFamily: Fonts.regular, fontSize: 12.5, color: MUTED }}>
              {progressSubs[Math.min(completedCount, 5)]}
            </Text>
          </View>
        </View>

        {/* Tasks */}
        <Text style={{ fontFamily: Fonts.bold, fontSize: 12, color: MUTED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 9 }}>
          {"Today's actions"}
        </Text>
        <View style={{ gap: 8, marginBottom: 12 }}>
          {tasks.map((task, i) => (
            <Pressable
              key={task.id}
              onPress={() => completeTask(i)}
              style={({ pressed }) => ({
                backgroundColor: task.done ? "#F2EFE8" : CARD_BG,
                borderRadius: 18, borderWidth: 1.5,
                borderColor: task.done ? "rgba(192,120,32,0.12)" : pressed ? AMBER : CARD_BDR,
                padding: 15, paddingHorizontal: 16,
                flexDirection: "row", alignItems: "center", gap: 13,
                opacity: task.done ? 0.82 : 1,
                overflow: "hidden",
                transform: [{ translateX: pressed && !task.done ? 3 : 0 }],
              })}
            >
              {/* Ripple */}
              {rippleTask === task.id && <RippleEffect />}

              {/* Checkmark circle */}
              <View style={{
                width: 32, height: 32, borderRadius: 16,
                backgroundColor: task.done ? AMBER : "transparent",
                borderWidth: 2, borderColor: task.done ? AMBER : "rgba(192,120,32,0.4)",
                alignItems: "center", justifyContent: "center",
              }}>
                {task.done && (
                  <Svg width={16} height={12} viewBox="0 0 14 11">
                    <Path d="M1.5 5.5L5.5 9.5L12.5 1.5" stroke="white" strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                )}
              </View>

              <Text style={{ fontSize: 23, lineHeight: 27 }}>{task.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: Fonts.bold, fontSize: 15, color: task.done ? MUTED : DARK, textDecorationLine: task.done ? "line-through" : "none" }}>
                  {task.name}
                </Text>
                <Text style={{ fontFamily: Fonts.semiBold, fontSize: 14, color: task.done ? MUTED : DARK, lineHeight: 20, marginTop: 2 }}>{task.sub}</Text>
              </View>
              <Text style={{ fontFamily: Fonts.serif, fontSize: 16, color: task.done ? MUTED : AMBER }}>
                {task.done ? "\u2713" : ("+" + task.pts + " XP")}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* All-done card */}
        {allDone && (
          <Animated.View style={{ opacity: allDoneOp, transform: [{ scale: allDoneScale }], marginBottom: 16 }}>
            <View style={{ backgroundColor: "#2A1808", borderRadius: 22, padding: 20, alignItems: "center" }}>
              <FlamePulse />
              <Text style={{ fontFamily: Fonts.serif, fontSize: 24, color: "#EDE8D5", marginBottom: 4, textAlign: "center" }}>
                {"Day 1 "}
                <Text style={{ color: "#E8960A", fontStyle: "italic" }}>{"complete!"}</Text>
              </Text>
              <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: "rgba(237,232,213,0.65)", lineHeight: 19, textAlign: "center", marginBottom: 14 }}>
                You did what most people won't. Every action today builds the foundation of your debt-free life. Dex is so proud.
              </Text>
              {/* Stats */}
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 14, width: "100%" }}>
                {[
                  { v: totalXP + " XP", l: "Earned today" },
                  { v: "5 / 5",         l: "Actions done" },
                  { v: "1 day",         l: "Streak \uD83D\uDD25" },
                ].map(({ v, l }) => (
                  <View key={l} style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 12, padding: 9, alignItems: "center" }}>
                    <Text style={{ fontFamily: Fonts.serif, fontSize: 15, color: "#EDE8D5" }}>{v}</Text>
                    <Text style={{ fontFamily: Fonts.bold, fontSize: 9, color: "rgba(237,232,213,0.5)", textTransform: "uppercase", letterSpacing: 0.9 }}>{l}</Text>
                  </View>
                ))}
              </View>
              {/* Streak chips */}
              <Text style={{ fontFamily: Fonts.bold, fontSize: 10, color: "rgba(237,232,213,0.5)", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 7 }}>
                Your streak
              </Text>
              <View style={{ flexDirection: "row", gap: 5, marginBottom: 14 }}>
                {streakDays7.map((d, i) => (
                  <View key={i} style={{ flex: 1, alignItems: "center", backgroundColor: i === 0 ? AMBER : "rgba(255,255,255,0.06)", borderRadius: 10, paddingVertical: 6 }}>
                    <Text style={{ fontFamily: Fonts.bold, fontSize: 10, color: i === 0 ? "rgba(255,255,255,0.85)" : "rgba(237,232,213,0.45)", textTransform: "uppercase" }}>{d}</Text>
                    <Text style={{ fontSize: 15, marginVertical: 2 }}>{i === 0 ? "\uD83D\uDD25" : "\u2B1C"}</Text>
                  </View>
                ))}
              </View>
              {/* CTA */}
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); onNext(); }}
                style={({ pressed }) => ({ width: "100%", backgroundColor: AMBER, borderRadius: 24, paddingVertical: 14, alignItems: "center", opacity: pressed ? 0.88 : 1, overflow: "hidden" })}
              >
                <Text style={{ fontFamily: Fonts.bold, fontSize: 16, color: "white" }}>{"Continue \u2192"}</Text>
              </Pressable>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

/* ── helper mini-components ──────────────────────────────────────────────── */
function ConfettiPiece({ x, color, size, round }: { x: number; color: string; size: number; round: boolean }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 1400 + Math.random() * 400, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={{
      position: "absolute",
      left: x, top: -10,
      width: size, height: size,
      borderRadius: round ? size / 2 : 2,
      backgroundColor: color,
      opacity: anim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] }),
      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 340] }) },
                  { rotate:    anim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "720deg"] }) }],
    }} />
  );
}

function XpFloat({ pts, color }: { pts: number; color: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 1400, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.Text style={{
      position: "absolute", bottom: 55,
      fontFamily: Fonts.serif, fontSize: 24, color,
      textShadowColor: "rgba(192,120,32,0.35)", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8,
      opacity: anim.interpolate({ inputRange: [0, 0.12, 0.7, 1], outputRange: [0, 1, 1, 0] }),
      transform: [{ scale:      anim.interpolate({ inputRange: [0, 0.12, 0.7, 1], outputRange: [0.5, 1.25, 1, 0.9] }) },
                  { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -90] }) }],
    }}>
      {"+" + pts + " XP"}
    </Animated.Text>
  );
}

function ToastItem({ icon, msg }: { icon: string; msg: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }).start();
    return () => {};
  }, []);
  return (
    <Animated.View style={{
      backgroundColor: "#2A1808", borderRadius: 24, paddingVertical: 10, paddingHorizontal: 20,
      flexDirection: "row", alignItems: "center", gap: 8,
      shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
      opacity: anim,
      transform: [{ scale:      anim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) },
                  { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0]  }) }],
    }}>
      <Text style={{ fontSize: 18 }}>{icon}</Text>
      <Text style={{ fontFamily: Fonts.bold, fontSize: 13, color: "#EDE8D5" }}>{msg}</Text>
    </Animated.View>
  );
}

function RippleEffect() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={{
      position: "absolute", width: 120, height: 120, borderRadius: 60,
      backgroundColor: "rgba(192,120,32,0.18)",
      top: "50%", left: 40,
      marginTop: -60, marginLeft: -60,
      opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
      transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 2] }) }],
    }} />
  );
}

function FlamePulse() {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(anim, { toValue: 1.18, duration: 700, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 1.00, duration: 700, useNativeDriver: true }),
    ])).start();
  }, []);
  return (
    <Animated.Text style={{ fontSize: 52, marginBottom: 4, transform: [{ scale: anim }] }}>
      {"\uD83D\uDD25"}
    </Animated.Text>
  );
}

// ─── Screen 9: Streak Goal Picker + Pledge ────────────────────────────────────
const COMMITS_DATA: Record<number, {
  icon: string; label: string; bonusXP: number; recommended?: boolean;
  desc: string; title: string; body: string; pledges: string[];
}> = {
  7:  { icon:"🌱", label:"7 Days",  bonusXP:25,  desc:"Build the first spark. Just one week to prove you can do it.", title:"I commit to 7 days of consistency.", body:"One week. That's all. 7 daily actions, 7 streaks, and the proof that you can do this. Dex will be there every step.", pledges:["Show up every day for 7 days","Complete at least 3 actions each day","Celebrate on Day 7 - you earned it"] },
  14: { icon:"🔥", label:"14 Days", bonusXP:60,  recommended:true, desc:"Two weeks locks in the habit. This is where real change begins.", title:"I commit to 14 days of consistency.", body:"Two weeks is where the magic happens. 14 daily actions will make this feel automatic. The habit starts here.", pledges:["Show up every day for 14 days","Complete all 5 actions when possible","Log every payment, no matter how small"] },
  30: { icon:"💪", label:"30 Days", bonusXP:150, desc:"A full month. Science says habits form around day 21.", title:"I commit to 30 days of consistency.", body:"A full month. Science says habits fully form around day 21. By day 30, you won't need motivation - this will just be who you are.", pledges:["Show up every day for 30 days","Review your debt progress weekly","Celebrate every 7-day milestone"] },
  60: { icon:"🏆", label:"60 Days", bonusXP:400, desc:"Two months of consistency. You'll be unstoppable.", title:"I commit to 60 days of consistency.", body:"Two months. By the time you hit day 60, your finances will look different and so will you. This is the champion tier.", pledges:["Show up every day for 60 days","Make at least one extra debt payment","Inspire someone else to start their journey"] },
};

function StreakGoalScreen({ isDark, bg, topPad, botPad, streakDays, onSelect, onCommit, onBack }: any) {
  const BG      = isDark ? "#1C1610" : "#F8F6F2";
  const AMBER   = isDark ? "#E8A030" : "#C07820";
  const DARK    = isDark ? "#F0E8D0" : "#1A0E04";
  const MUTED   = isDark ? "#C09050" : Colors.light.textTertiary;
  const SUB     = isDark ? "#B09070" : Colors.light.textSecondary;
  const CARD_BG = isDark ? "#2C2014" : "#FFFFFF";
  const CARD_BDR = isDark ? "rgba(232,160,48,0.2)" : "rgba(192,120,32,0.2)";
  const BTN_DARK = isDark ? "#3A2C1A" : "#2A1808";
  const DAYS_S  = ["Su","Mo","Tu","We","Th","Fr","Sa"];

  const [view,    setView]    = useState<"picker"|"pledge">("picker");
  const [sel,     setSel]     = useState<number|null>(streakDays || null);
  const [confetti,setConfetti]= useState<{id:number;x:number;color:string;size:number;round:boolean}[]>([]);
  const idRef   = useRef(0);
  const scrollRef = useRef<any>(null);
  const dexBounce = useRef(new Animated.Value(0)).current;
  const ringAnim  = useRef(new Animated.Value(0)).current;
  const pledgeOp  = useRef(new Animated.Value(0)).current;
  const pledgeSc  = useRef(new Animated.Value(0.9)).current;

  // idle ring pulse on picker
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(ringAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
      Animated.timing(ringAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
    ])).start();
  }, []);

  const playSelectSound = () => {
    if (Platform.OS === "web") {
      try {
        const ac = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
        const o = ac.createOscillator(), g = ac.createGain();
        o.connect(g); g.connect(ac.destination);
        o.frequency.value = 880; o.type = "sine";
        g.gain.setValueAtTime(0.08, ac.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.2);
        o.start(); o.stop(ac.currentTime + 0.22);
      } catch (_) {}
    }
  };

  const playPledgeFanfare = () => {
    if (Platform.OS === "web") {
      try {
        const ac = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
        [[523,0],[659,0.08],[784,0.16],[1047,0.26],[1319,0.38]].forEach(([freq, t]) => {
          const o = ac.createOscillator(), g = ac.createGain();
          o.connect(g); g.connect(ac.destination);
          o.frequency.value = freq; o.type = "sine";
          g.gain.setValueAtTime(0.09, ac.currentTime + t);
          g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + t + 0.45);
          o.start(ac.currentTime + t); o.stop(ac.currentTime + t + 0.5);
        });
      } catch (_) {}
    }
  };

  const spawnConfetti = () => {
    const colors = ["#C07820","#E8960A","#EAA835","#7A3A0C","#D09828","#F5C842","#A86010"];
    const items = Array.from({ length: 28 }, () => ({
      id: idRef.current++,
      x: 4 + Math.random() * 92,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 5 + Math.random() * 8,
      round: Math.random() > 0.45,
    }));
    setConfetti(c => [...c, ...items]);
    setTimeout(() => {
      const ids = new Set(items.map(x => x.id));
      setConfetti(c => c.filter(x => !ids.has(x.id)));
    }, 2800);
  };

  const handleCardSelect = (days: number) => {
    setSel(days);
    onSelect(days);
    playSelectSound();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleCommit = () => {
    if (!sel) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    playPledgeFanfare();
    spawnConfetti();
    setTimeout(spawnConfetti, 300);
    setView("pledge");
    pledgeOp.setValue(0);
    pledgeSc.setValue(0.9);
    Animated.parallel([
      Animated.timing(pledgeOp, { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.spring(pledgeSc, { toValue: 1, friction: 6, tension: 70, useNativeDriver: true }),
    ]).start();
    // Dex bounce
    Animated.sequence([
      Animated.timing(dexBounce, { toValue: -22, duration: 200, useNativeDriver: true }),
      Animated.timing(dexBounce, { toValue: -10, duration: 130, useNativeDriver: true }),
      Animated.timing(dexBounce, { toValue: -16, duration: 110, useNativeDriver: true }),
      Animated.timing(dexBounce, { toValue:  -5, duration: 100, useNativeDriver: true }),
      Animated.timing(dexBounce, { toValue:   0, duration:  90, useNativeDriver: true }),
    ]).start(() => {
      Animated.loop(Animated.sequence([
        Animated.timing(dexBounce, { toValue: -6, duration: 1200, useNativeDriver: true }),
        Animated.timing(dexBounce, { toValue:  0, duration: 1200, useNativeDriver: true }),
      ])).start();
    });
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      setTimeout(spawnConfetti, 400);
    }, 350);
  };

  const c = sel ? COMMITS_DATA[sel] : null;
  const today = new Date().getDay();
  const totalXP = 50;

  // Streak chips for pledge
  const chipCount = sel ? Math.min(sel, 7) : 7;
  const showMore  = sel && sel > 7;

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* Confetti layer */}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 30, pointerEvents: "none" }} pointerEvents="none">
        {confetti.map(cf => <ConfettiPiece key={cf.id} x={cf.x * 3.5} color={cf.color} size={cf.size} round={cf.round} />)}
      </View>

      {/* Back button — above confetti */}
      <BackBtn onPress={onBack} isDark={isDark} topPad={topPad} />

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: topPad + 8, paddingHorizontal: 20, paddingBottom: Math.max(botPad, 24) + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── PICKER ── */}
        {view === "picker" && (
          <>
            {/* Dark summary banner */}
            <View style={{ backgroundColor: BTN_DARK, borderRadius: 20, padding: 15, marginBottom: 14, flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: Fonts.serif, fontSize: 20, color: "#EDE8D5", lineHeight: 26, marginBottom: 2 }}>
                  {"Day 1 - "}
                  <Text style={{ color: "#E8960A", fontStyle: "italic" }}>{"all done!"}</Text>
                </Text>
                <Text style={{ fontFamily: Fonts.bold, fontSize: 13, color: "rgba(237,232,213,0.6)" }}>
                  {"5 / 5 actions complete · streak locked in 🔥"}
                </Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontFamily: Fonts.serif, fontSize: 26, color: "#E8960A" }}>{totalXP}</Text>
                <Text style={{ fontFamily: Fonts.bold, fontSize: 11, color: "rgba(237,232,213,0.5)", textTransform: "uppercase", letterSpacing: 0.8 }}>XP earned</Text>
              </View>
              <Text style={{ fontSize: 36 }}>{"🔥"}</Text>
            </View>

            {/* Dex with ring */}
            <View style={{ height: 118, alignItems: "center", justifyContent: "center", position: "relative", marginBottom: 22 }}>
              <Animated.View style={{
                position: "absolute", width: 100, height: 100, borderRadius: 50,
                borderWidth: 3, borderColor: "rgba(192,120,32,0.3)",
                opacity: ringAnim.interpolate({ inputRange: [0,1], outputRange: [0.7, 0] }),
                transform: [{ scale: ringAnim.interpolate({ inputRange: [0,1], outputRange: [0.85, 1.55] }) }],
              }} />
              <DexCoin size={108} mood={ONBOARDING_DEX.streakStart.mood} motion={ONBOARDING_DEX.streakStart.motion} />
            </View>

            {/* Ask title */}
            <Text style={{ fontFamily: Fonts.serif, fontSize: 26, color: DARK, textAlign: "center", lineHeight: 34, marginBottom: 4 }}>
              {"I commit to staying "}
              <Text style={{ color: AMBER, fontStyle: "italic" }}>{"consistent"}</Text>
              {" for…"}
            </Text>
            <Text style={{ fontFamily: Fonts.regular, fontSize: 14, color: MUTED, textAlign: "center", lineHeight: 22, marginBottom: 18 }}>
              Pick a streak goal. Dex will cheer you every single day you show up.
            </Text>

            {/* 2×2 grid */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
              {([7, 14, 30, 60] as number[]).map((days, idx) => {
                const d = COMMITS_DATA[days];
                const selected = sel === days;
                return (
                  <Pressable
                    key={days}
                    onPress={() => handleCardSelect(days)}
                    style={({ pressed }) => ({
                      width: "47.5%",
                      backgroundColor: CARD_BG,
                      borderRadius: 20,
                      borderWidth: selected ? 2 : 2,
                      borderColor: selected ? AMBER : d.recommended ? "rgba(192,120,32,0.45)" : CARD_BDR,
                      padding: 16,
                      paddingHorizontal: 12,
                      alignItems: "center",
                      position: "relative",
                      overflow: "hidden",
                      transform: [{ translateY: pressed && !selected ? -3 : 0 }],
                      shadowColor: selected ? AMBER : "transparent",
                      shadowOpacity: selected ? 0.25 : 0,
                      shadowRadius: 12,
                      shadowOffset: { width: 0, height: 4 },
                      elevation: selected ? 6 : 0,
                    })}
                  >
                    {/* Recommended badge */}
                    {d.recommended && (
                      <View style={{ position: "absolute", top: 0, left: "50%", transform: [{ translateX: -38 }], backgroundColor: AMBER, borderRadius: 9, borderTopLeftRadius: 0, borderTopRightRadius: 0, paddingHorizontal: 10, paddingVertical: 3 }}>
                        <Text style={{ fontFamily: Fonts.bold, fontSize: 11, color: "white", textTransform: "uppercase", letterSpacing: 0.7 }}>Most popular</Text>
                      </View>
                    )}
                    {/* Selected checkmark */}
                    {selected && (
                      <View style={{ position: "absolute", top: 10, right: 10, width: 20, height: 20, borderRadius: 10, backgroundColor: AMBER, alignItems: "center", justifyContent: "center" }}>
                        <Svg width={11} height={9} viewBox="0 0 11 9">
                          <Path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                      </View>
                    )}
                    <Text style={{ fontSize: 32, marginBottom: 6, marginTop: d.recommended ? 12 : 0 }}>{d.icon}</Text>
                    <Text style={{ fontFamily: Fonts.serif, fontSize: 40, color: selected ? AMBER : DARK, lineHeight: 42 }}>{days}</Text>
                    <Text style={{ fontFamily: Fonts.bold, fontSize: 13, color: selected ? AMBER : MUTED, textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 8 }}>days</Text>
                    <Text style={{ fontFamily: Fonts.regular, fontSize: 12.5, color: MUTED, textAlign: "center", lineHeight: 18 }}>{d.desc}</Text>
                    <Text style={{ fontFamily: Fonts.bold, fontSize: 12, color: AMBER, marginTop: 6 }}>{"+"+d.bonusXP+" bonus XP on day "+days}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Science note */}
            <View style={{ backgroundColor: "rgba(192,120,32,0.07)", borderRadius: 14, padding: 14, marginBottom: 14, flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
              <Text style={{ fontSize: 21 }}>{"🧠"}</Text>
              <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: SUB, lineHeight: 20, flex: 1 }}>
                <Text style={{ fontFamily: Fonts.bold, color: DARK }}>{"Why this works: "}</Text>
                People who make a specific commitment are 2-3x more likely to follow through. You're not just setting a goal - you're making a promise to yourself.
              </Text>
            </View>

            {/* CTA button */}
            <Pressable
              onPress={handleCommit}
              disabled={!sel}
              style={({ pressed }) => ({
                backgroundColor: sel ? AMBER : "rgba(192,120,32,0.3)",
                borderRadius: 30, paddingVertical: 18,
                alignItems: "center", marginBottom: 8,
                opacity: pressed && sel ? 0.88 : 1,
                transform: [{ scale: pressed && sel ? 0.98 : 1 }],
                overflow: "hidden",
              })}
            >
              <Text style={{ fontFamily: Fonts.bold, fontSize: 17, color: "white" }}>
                {sel ? ("Commit to " + COMMITS_DATA[sel].label + " \u203A") : "Make My Commitment \u203A"}
              </Text>
            </Pressable>
            <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: MUTED, textAlign: "center" }}>
              {sel ? ("+" + COMMITS_DATA[sel].bonusXP + " bonus XP waiting for you on day " + sel + "!") : "Choose your streak goal above"}
            </Text>
          </>
        )}

        {/* ── PLEDGE ── */}
        {view === "pledge" && c && (
          <Animated.View style={{ opacity: pledgeOp, transform: [{ scale: pledgeSc }] }}>
            {/* Dex bouncing */}
            <View style={{ alignItems: "center", marginBottom: 22 }}>
              <Animated.View style={{ transform: [{ translateY: dexBounce }] }}>
                <DexCoin size={115} mood={ONBOARDING_DEX.streakStart.mood} motion={ONBOARDING_DEX.streakStart.motion} />
              </Animated.View>
            </View>

            {/* Eyebrow */}
            <Text style={{ fontFamily: Fonts.bold, fontSize: 12, color: AMBER, textAlign: "center", letterSpacing: 2, textTransform: "uppercase", marginBottom: 5 }}>
              {c.label + " commitment locked in!"}
            </Text>

            {/* Pledge card */}
            <View style={{ backgroundColor: CARD_BG, borderRadius: 22, borderWidth: 2, borderColor: "rgba(192,120,32,0.3)", padding: 20, marginBottom: 12, position: "relative" }}>
              {/* Stamp */}
              <View style={{ position: "absolute", top: -14, right: 20, backgroundColor: AMBER, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 }}>
                <Text style={{ fontFamily: Fonts.bold, fontSize: 11, color: "white", textTransform: "uppercase", letterSpacing: 1 }}>Committed ✓</Text>
              </View>

              {/* Title */}
              <Text style={{ fontFamily: Fonts.serif, fontSize: 24, color: DARK, textAlign: "center", lineHeight: 32, marginBottom: 10 }}>
                {"\u201C"}
                <Text style={{ color: AMBER, fontStyle: "italic" }}>{c.title.replace(/"/g, "")}</Text>
                {"\u201D"}
              </Text>

              {/* Body */}
              <Text style={{ fontFamily: Fonts.regular, fontSize: 14.5, color: SUB, lineHeight: 23, textAlign: "center", marginBottom: 14 }}>
                {c.body}
              </Text>

              {/* Streak chips */}
              <View style={{ flexDirection: "row", justifyContent: "center", gap: 5, marginBottom: 14, alignItems: "center" }}>
                {Array.from({ length: chipCount }, (_, i) => {
                  const dayIdx = (today + i) % 7;
                  const isToday  = i === 0;
                  const isGoal   = sel !== null && i === sel - 1 && sel <= 7;
                  const chipStyle = isToday ? { backgroundColor: AMBER } : isGoal ? { backgroundColor: "rgba(192,120,32,0.06)", borderWidth: 1.5, borderColor: "rgba(192,120,32,0.3)", borderStyle: "dashed" as const } : { backgroundColor: "rgba(192,120,32,0.1)" };
                  return (
                    <View key={i} style={[{ alignItems: "center", paddingVertical: 7, paddingHorizontal: 5, borderRadius: 10, minWidth: 34 }, chipStyle]}>
                      <Text style={{ fontFamily: Fonts.bold, fontSize: 10, color: isToday ? "rgba(255,255,255,0.7)" : "rgba(42,24,8,0.3)", textTransform: "uppercase" }}>{DAYS_S[dayIdx]}</Text>
                      <Text style={{ fontSize: 15 }}>{isToday ? "🔥" : isGoal ? "🎯" : "⬜"}</Text>
                      <Text style={{ fontFamily: Fonts.serif, fontSize: 13, color: isToday ? "white" : isGoal ? AMBER : "rgba(42,24,8,0.25)" }}>{isToday ? "1" : isGoal ? "✓" : ""}</Text>
                    </View>
                  );
                })}
                {showMore && (
                  <>
                    <Text style={{ fontFamily: Fonts.bold, fontSize: 13, color: MUTED, paddingHorizontal: 4 }}>···</Text>
                    <View style={{ alignItems: "center", paddingVertical: 7, paddingHorizontal: 5, borderRadius: 10, minWidth: 34, backgroundColor: "rgba(192,120,32,0.06)", borderWidth: 1.5, borderColor: "rgba(192,120,32,0.3)" }}>
                      <Text style={{ fontFamily: Fonts.bold, fontSize: 10, color: MUTED, textTransform: "uppercase" }}>Day</Text>
                      <Text style={{ fontSize: 15 }}>{"🎯"}</Text>
                      <Text style={{ fontFamily: Fonts.serif, fontSize: 12, color: AMBER }}>{String(sel)}</Text>
                    </View>
                  </>
                )}
              </View>

              {/* Pledge items */}
              <View style={{ gap: 10 }}>
                {c.pledges.map((p, i) => (
                  <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
                    <View style={{ width: 22, height: 22, borderRadius: 7, backgroundColor: AMBER, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      <Svg width={12} height={10} viewBox="0 0 11 9">
                        <Path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                    </View>
                    <Text style={{ fontFamily: Fonts.regular, fontSize: 14, color: SUB, lineHeight: 21, flex: 1 }}>{p}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Stats row */}
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
              {[
                { v: String(sel),                    l: "Day goal"     },
                { v: "+" + c.bonusXP,                l: "Bonus XP"     },
                { v: "$" + Math.round(496 * ((sel || 14) / 30)).toLocaleString(), l: "Est. debt paid" },
              ].map(({ v, l }) => (
                <View key={l} style={{ flex: 1, backgroundColor: CARD_BG, borderRadius: 14, borderWidth: 1.5, borderColor: "rgba(192,120,32,0.18)", padding: 11, alignItems: "center" }}>
                  <Text style={{ fontFamily: Fonts.serif, fontSize: 22, color: DARK }}>{v}</Text>
                  <Text style={{ fontFamily: Fonts.bold, fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: 0.7 }}>{l}</Text>
                </View>
              ))}
            </View>

            {/* Go button */}
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); spawnConfetti(); onCommit(); }}
              style={({ pressed }) => ({
                backgroundColor: BTN_DARK,
                borderRadius: 30, paddingVertical: 18,
                alignItems: "center", marginBottom: 8,
                opacity: pressed ? 0.88 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
                overflow: "hidden",
              })}
            >
              <Text style={{ fontFamily: Fonts.bold, fontSize: 17, color: "#EDE8D5", letterSpacing: 0.3 }}>
                {"Start Day 2 - keep the streak alive 🔥"}
              </Text>
            </Pressable>
            <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: MUTED, textAlign: "center" }}>
              Dex will check in with you every day
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1 },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 10,
    position: "relative",
  },

  // Splash
  splashCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingHorizontal: 32,
  },
  splashLogo: {
    width: 110,
    height: 110,
    borderRadius: 28,
    marginBottom: 4,
    // Soft drop shadow so the icon floats on light background (keeps native-like look)
    shadowColor: "#000000",
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  splashName: {
    fontSize: 44,
    fontFamily: Fonts.serif,
    letterSpacing: -0.5,
  },
  splashTagline: {
    fontSize: 17,
    fontFamily: Fonts.semiBold,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 26,
  },
  splashBtns: {
    paddingHorizontal: 20,
    gap: 16,
    paddingTop: 8,
  },
  dailyAmountBox: {
    width: "30%",
    minWidth: 72,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dailyAmountText: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    fontWeight: "600",
  },
  alreadyHave: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    fontWeight: "700",
    letterSpacing: 0.5,
    textAlign: "center",
  },

  // Question bubble
  qBubble: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    position: "relative",
  },
  qBubbleText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    fontWeight: "700",
    lineHeight: 23,
  },
  qBubbleTail: {
    position: "absolute",
    left: -11,
    top: 14,
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderRightWidth: 11,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    zIndex: 2,
  },
  qBubbleTailBorder: {
    position: "absolute",
    left: -13,
    top: 13,
    width: 0,
    height: 0,
    borderTopWidth: 9,
    borderBottomWidth: 9,
    borderRightWidth: 13,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    zIndex: 1,
  },

  // Celebration
  celebTitle: {
    fontSize: 30,
    fontFamily: Fonts.black,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  celebSub: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    fontWeight: "600",
    textAlign: "center",
    marginTop: -6,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  badge: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  badgeLabel: {
    fontSize: 10,
    fontFamily: Fonts.extraBold,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  badgeValue: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 18,
  },

  // Streak Born
  streakBubble: {
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignSelf: "center",
    maxWidth: SW - 48,
    position: "relative",
  },
  streakBubbleText: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 24,
  },
  streakBubbleTail: {
    position: "absolute",
    bottom: -14,
    alignSelf: "center",
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 14,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  streakNum: {
    fontSize: 88,
    fontFamily: Fonts.black,
    fontWeight: "900",
    lineHeight: 96,
  },
  streakDayLabel: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    fontWeight: "700",
    marginTop: -4,
  },
  calRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 28,
    paddingHorizontal: 8,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  calDayName: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    fontWeight: "600",
  },
  calDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  goalEmojiWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  goalText: { fontSize: 16, color: '#fff' },
  goalXpDaily: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  input: {
    fontFamily: Fonts.regular,
  },

  // Streak goal
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 4,
  },
  goalDays: {
    fontSize: 18,
    fontFamily: Fonts.extraBold,
    fontWeight: "800",
    flex: 1,
  },
  goalXp: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    fontWeight: "600",
  },
});

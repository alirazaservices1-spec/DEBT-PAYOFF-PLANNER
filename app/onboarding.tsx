// ─── Onboarding — Duolingo-style, 9 screens, shows ONCE ──────────────────────
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  ScrollView,
  Animated,
  Easing,
  Platform,
  useColorScheme,
  Image,
  Modal,
  TextInput,
  useWindowDimensions,
  Switch,
} from "react-native";

import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useDebts } from "@/context/DebtContext";
import { useGame } from "@/context/GameContext";
import { DexMascot } from "@/components/DexMascot";
import { WelcomeMascot } from "@/components/WelcomeMascot";
import { FlameIcon } from "@/components/FlameIcon";
import { DebtForm } from "@/components/DebtForm";
import { runStrategy } from "@/lib/calculations";
import type { Debt, DebtType } from "@/lib/calculations";

const { width: SW, height: SH } = Dimensions.get("window");
// true on iOS/Android (runs off JS thread), false on web (react-native-web requirement)
const ND = Platform.OS !== "web";

// ─── AsyncStorage keys ────────────────────────────────────────────────────────
const AKEY_GOAL       = "@debtpath_onboarding_goal";
const AKEY_DEBT_RANGE = "@debtpath_onboarding_debt_range";
const AKEY_MOTIVATION = "@debtpath_onboarding_motivation";
const AKEY_STREAK     = "@debtpath_streak_goal_days";
const AKEY_STARTED    = "@debtpath_onboarding_started";

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
const DAILY_SAVINGS_GOAL_KEY = "@debtpath_daily_savings_goal";

// ─── Color tokens ─────────────────────────────────────────────────────────────
const P = {
  text:      "#1A1A1A",
  sub:       "#335547",
  green:     Colors.buttonGreen,
  greenDk:   Colors.buttonGreenDark,
  orange:    "#E8600A",
  orangeLight:"#FFF3E0",
  blue:      "#1F4E8C",
  blueDk:    "#163A6B",
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
  const iconColor = isDark ? "rgba(255,255,255,0.8)" : "#4A5568";
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
  const { debts, addDebt, setExtraPayment, setOnboardingDone } = useDebts();
  const { grantBonusXp, triggerDex, triggerCelebration, level } = useGame();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [step, setStep] = useState<Step>(1);
  const [streakDays, setStreakDays] = useState<number | null>(null);
  const [dailyGoal, setDailyGoal] = useState(0.5);
  const [addDebtVisible, setAddDebtVisible] = useState(false);

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

  const handleSkipAll = async () => {
    await setOnboardingDone();
    router.replace("/(tabs)");
  };

  const handleSaveDebt = useCallback(async (debt: Omit<Debt, "id" | "dateAdded">) => {
    await addDebt(debt);
    setAddDebtVisible(false);
  }, [addDebt]);

  const handleActivateDailyGoal = useCallback(async () => {
    const monthly = dailyGoal * 30;
    await setExtraPayment(monthly);
    await AsyncStorage.setItem(DAILY_SAVINGS_GOAL_KEY, String(dailyGoal));
    goTo(6);
  }, [dailyGoal, setExtraPayment, goTo]);

  const handleCommitStreak = async () => {
    if (!streakDays) return;
    const xpMap: Record<number, number> = { 7: 150, 14: 300, 30: 500, 60: 750 };
    const bonus = xpMap[streakDays] ?? 150;
    grantBonusXp(bonus);
    await AsyncStorage.setItem(AKEY_STREAK, String(streakDays));
    await setOnboardingDone();
    triggerDex("celebrating");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace("/(tabs)");
    setTimeout(() => {
      triggerCelebration({ type: "level_up", level: level > 1 ? level : 2 }, 8000);
    }, 450);
  };

  const sp = { isDark, bg, topPad, botPad, goTo, handleSkipAll };

  return (
    <View style={{ flex: 1, backgroundColor: bg, overflow: "hidden" }}>
      <Animated.View style={{ flex: 1, transform: [{ translateX: slideAnim }] }}>

        {step === 1 && <SplashScreen {...sp} />}

        {step === 2 && (
          <DebtEntryScreen
            {...sp}
            debts={debts}
            onAddDebt={() => setAddDebtVisible(true)}
            onContinue={() => goTo(3)}
            onBack={() => goTo(1, "back")}
            grantBonusXp={grantBonusXp}
          />
        )}

        {step === 3 && (
          <PayoffStrategyScreen
            {...sp}
            debts={debts}
            onSelect={(strategy) => {
              // We'll hook up actual strategy selection later, keep it visual for now
              goTo(4);
            }}
            onBack={() => goTo(2, "back")}
          />
        )}

        {step === 4 && (
          <DreamGoalScreen
            {...sp}
            debts={debts}
            onComplete={async (goalName, goalCost) => {
              try {
                await AsyncStorage.setItem("@debtpath_dream_goal_name", goalName);
                await AsyncStorage.setItem("@debtpath_dream_goal_cost", goalCost);
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
          <FiftyCentsGoalScreen
            {...sp}
            debts={debts}
            dailyGoal={dailyGoal}
            onDailyGoalChange={setDailyGoal}
            onActivate={handleActivateDailyGoal}
            onBack={() => goTo(4, "back")}
          />
        )}

        {step === 6 && (
          <CoachSettingsScreen {...sp}
            onNext={async (email, push, sound) => {
              try {
                await AsyncStorage.setItem("@debtpath_coach_email", email.toString());
                await AsyncStorage.setItem("@debtpath_coach_push", push.toString());
                await AsyncStorage.setItem("@debtpath_coach_sound", sound.toString());
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

      <OnboardingDebtSheet
        visible={addDebtVisible}
        onClose={() => setAddDebtVisible(false)}
        onSave={handleSaveDebt}
      />
    </View>
  );
}

// ─── Screen 1: Splash ─────────────────────────────────────────────────────────
function SplashScreen({ isDark, bg, topPad, botPad, goTo, handleSkipAll }: any) {
  useEffect(() => {
    // mark started as soon as user lands on onboarding
    AsyncStorage.setItem(AKEY_STARTED, "true").catch(() => {});
  }, []);
  const W = {
    bg: "#F4EBD9",
    circle: "rgba(208, 195, 164, 0.32)",
    smallText: "#7A5B34",
    headline: "#2A1B0F",
    accent: "#C07A1A",
    btn: "#C07A1A",
    btnDk: "#A86414",
    lock: "#8A6B43",
  };
  return (
    <View style={[s.screen, { backgroundColor: W.bg, paddingTop: topPad, paddingBottom: botPad }]}>
      {/* background circles */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={{ position: "absolute", width: 220, height: 220, borderRadius: 110, backgroundColor: W.circle, top: -70, right: -70 }} />
        <View style={{ position: "absolute", width: 180, height: 180, borderRadius: 90, backgroundColor: W.circle, bottom: -70, left: -70 }} />
        <View style={{ position: "absolute", width: 120, height: 120, borderRadius: 60, backgroundColor: W.circle, top: 120, left: -40 }} />
      </View>

      {/* top notch bar */}
      <View style={{ alignItems: "center", paddingTop: 10 }}>
        <View style={{ width: 110, height: 6, borderRadius: 999, backgroundColor: "rgba(122, 91, 52, 0.18)" }} />
      </View>

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
        <Text style={{ fontFamily: Fonts.bold, fontSize: 12, letterSpacing: 2.2, color: W.smallText, marginBottom: 18 }}>
          DEBT-FREE APP
        </Text>

        <WelcomeMascot size={170} />

        <View style={{ marginTop: 10, alignItems: "center" }}>
          <Text style={{ fontFamily: Fonts.black, fontWeight: "900", fontSize: 30, lineHeight: 38, color: W.headline, textAlign: "center" }}>
            Make paying off debt{"\n"}
            <Text style={{ color: W.accent }}>(and saving for your{"\n"}dreams)</Text>
            {"\n"}like a game.
          </Text>

          <Text style={{ marginTop: 18, fontFamily: Fonts.semiBold, fontWeight: "600", fontSize: 15, lineHeight: 22, color: "#6E5434", textAlign: "center" }}>
            Let's get started adding your{"\n"}debts to pay off
          </Text>

          <View style={{ width: "100%", maxWidth: 360, marginTop: 22 }}>
            <Pressable onPress={() => goTo(2)} style={({ pressed }) => [{ opacity: 1 }]}>
              {({ pressed }) => (
                <LinearGradient
                  colors={pressed ? ["#1E160E", "#0E0A06"] : [W.btn, W.btnDk]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: 999,
                  paddingVertical: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#000",
                  shadowOpacity: 0.12,
                  shadowRadius: 16,
                  shadowOffset: { width: 0, height: 10 },
                  elevation: 10,
                }}
              >
                <Text style={{ color: "#FFFFFF", fontFamily: Fonts.extraBold, fontWeight: "800", fontSize: 18 }}>
                  Get Started →
                </Text>
              </LinearGradient>
              )}
            </Pressable>

            <View style={{ alignItems: "center", marginTop: 14 }}>
              <Text style={{ fontFamily: Fonts.semiBold, fontWeight: "600", fontSize: 13, color: W.lock }}>
                <Ionicons name="lock-closed" size={14} color={W.lock} /> No account needed to start
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, paddingBottom: Math.max(botPad, 12) }}>
        <Pressable onPress={handleSkipAll} hitSlop={12}>
          <Text style={[s.alreadyHave, { marginTop: 14, color: "rgba(110, 84, 52, 0.55)", textAlign: "center" }]}>
            I ALREADY HAVE THE APP
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Screen 2: DebtPath Onboarding Page 2 ─────────────────────────────────────
function DebtEntryScreen({
  topPad,
  botPad,
  debts,
  onAddDebt,
  onContinue,
  onBack,
  grantBonusXp,
}: {
  topPad: number;
  botPad: number;
  debts: Debt[];
  onAddDebt: () => void;
  onContinue: () => void;
  onBack: () => void;
  grantBonusXp: (amount: number) => void;
}) {
  const bgGreen = "#1E7A45";
  const panelGreen = "#155533";

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [helpOpen, setHelpOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const netPulse = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const tailWag = useRef(new Animated.Value(0)).current;
  const pointLoop = useRef(new Animated.Value(0)).current;
  const blazeBreath = useRef(new Animated.Value(0)).current;
  const vaultBlink = useRef(new Animated.Value(0)).current;
  const rowIn = useRef(new Animated.Value(0)).current;
  const xpFloat = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(netPulse, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: ND }),
        Animated.timing(netPulse, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: ND }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: ND }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: ND }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(tailWag, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: ND }),
        Animated.timing(tailWag, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: ND }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pointLoop, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: ND }),
        Animated.timing(pointLoop, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: ND }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(blazeBreath, { toValue: 1, duration: 700, easing: Easing.out(Easing.quad), useNativeDriver: ND }),
        Animated.timing(blazeBreath, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: ND }),
        Animated.delay(700),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(vaultBlink, { toValue: 1, duration: 140, easing: Easing.linear, useNativeDriver: ND }),
        Animated.timing(vaultBlink, { toValue: 0, duration: 160, easing: Easing.linear, useNativeDriver: ND }),
        Animated.delay(2400),
      ])
    ).start();
  }, []);

  useEffect(() => {
    Animated.spring(rowIn, { toValue: 1, friction: 7, tension: 110, useNativeDriver: ND }).start();
  }, [debts.length]);

  const prevCount = useRef(debts.length);
  useEffect(() => {
    if (debts.length > prevCount.current) {
      grantBonusXp(10);
      setToast("Great! Add all your debts");
      xpFloat.setValue(0);
      Animated.timing(xpFloat, { toValue: 1, duration: 1200, easing: Easing.out(Easing.quad), useNativeDriver: ND }).start();
      setTimeout(() => setToast(null), 2200);
    }
    prevCount.current = debts.length;
  }, [debts.length, grantBonusXp]);

  const allChecked = debts.length > 0 && debts.every((d) => checked[d.id]);

  const netOpacity = netPulse.interpolate({ inputRange: [0, 1], outputRange: [0.14, 0.26] });
  const netScale = netPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
  const floatY = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -18] });
  const pointX = pointLoop.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const pctOpacity = blazeBreath.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const pctX = blazeBreath.interpolate({ inputRange: [0, 1], outputRange: [0, 56] });
  const pctY = blazeBreath.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const blinkOpacity = vaultBlink.interpolate({ inputRange: [0, 1], outputRange: [1, 0.15] });
  const rowsTranslate = rowIn.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });
  const rowsOpacity = rowIn.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const xpY = xpFloat.interpolate({ inputRange: [0, 1], outputRange: [0, -36] });
  const xpO = xpFloat.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0, 1, 0] });

  const headerCols = [
    "START THE ADVENTURE!\nADD YOUR DEBTS HERE.",
    "TARGET THE VARIABLE\nRATES. WE'LL ENGAGE.",
    "EVERY ENTRY\nSTRENGTHENS\nYOUR SHIELD.",
  ];

  const inventoryRows = debts.length
    ? debts.map((d) => ({ id: d.id, name: d.name }))
    : [
        { id: "ex1", name: "Credit Card 1" },
        { id: "ex2", name: "Car Loan" },
        { id: "ex3", name: "Student Loan 1" },
      ];

  return (
    <View style={{ flex: 1, backgroundColor: bgGreen, paddingTop: topPad, paddingBottom: botPad, overflow: "hidden" }}>
      {/* green network dot pattern */}
      <Animated.View style={{ ...StyleSheet.absoluteFillObject, opacity: netOpacity, transform: [{ scale: netScale }] }} pointerEvents="none">
        <NetworkPattern />
      </Animated.View>

      {/* floating checkmarks */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {[0, 1, 2, 3].map((i) => (
          <Animated.View
            key={i}
            style={{
              position: "absolute",
              left: 18 + i * 86,
              top: 110 + (i % 2) * 34,
              transform: [{ translateY: floatY }],
              opacity: 0.9,
            }}
          >
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#2ECC71", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="checkmark" size={18} color="#fff" />
            </View>
          </Animated.View>
        ))}
      </View>

      {/* back */}
      <BackBtn onPress={onBack} isDark={true} topPad={topPad} />

      {/* 3-column header */}
      <View style={{ paddingTop: 52, paddingHorizontal: 14 }}>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {headerCols.map((t, idx) => (
            <View key={idx} style={{ flex: 1, alignItems: "center" }}>
              <Text style={{ color: "#fff", fontFamily: Fonts.extraBold, fontWeight: "800", fontSize: 12, lineHeight: 16, textAlign: "center" }}>
                {t}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* main body */}
      <View style={{ flex: 1, flexDirection: "row", paddingHorizontal: 12, paddingTop: 6 }}>
        {/* debt inventory card */}
        <View style={{ width: SW * 0.45, paddingRight: 6 }}>
          <View style={{ backgroundColor: "#fff", borderRadius: 18, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 12 }}>
            <View style={{ backgroundColor: panelGreen, paddingVertical: 10, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ color: "#fff", fontFamily: Fonts.extraBold, fontWeight: "800", fontSize: 13, letterSpacing: 0.6 }}>
                DEBT INVENTORY
              </Text>
              <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="search" size={14} color="#fff" />
              </View>
            </View>

            <Animated.View style={{ padding: 12, gap: 10, opacity: rowsOpacity, transform: [{ translateY: rowsTranslate }] }}>
              {inventoryRows.map((r) => {
                const isExample = r.id.startsWith("ex");
                const isChecked = !!checked[r.id];
                return (
                  <Pressable
                    key={r.id}
                    onPress={isExample ? undefined : () => {
                      setChecked((prev) => ({ ...prev, [r.id]: !prev[r.id] }));
                      Haptics.selectionAsync();
                    }}
                    style={({ pressed }) => [{ opacity: isExample ? 0.65 : pressed ? 0.9 : 1 }]}
                  >
                    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 6,
                          borderWidth: 2,
                          borderColor: isExample ? "#D7D7D7" : (isChecked ? "#2ECC71" : "#BFC7C2"),
                          backgroundColor: isChecked ? "#2ECC71" : "transparent",
                          alignItems: "center",
                          justifyContent: "center",
                          marginTop: 2,
                        }}
                      >
                        {isChecked && <Ionicons name="checkmark" size={14} color="#fff" />}
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={{ color: "#1A1A1A", fontFamily: Fonts.extraBold, fontWeight: "800", fontSize: 13 }}>
                          {r.name}
                        </Text>

                        <View style={{ marginTop: 6 }}>
                          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                            <Text style={{ color: "#8D8D8D", fontFamily: Fonts.regular, fontSize: 11 }}>
                              Variable Interest Rate
                            </Text>
                            <Pressable onPress={() => setHelpOpen(true)} hitSlop={10} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
                              <Ionicons name="help-circle" size={16} color="#1F4E8C" />
                            </Pressable>
                          </View>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 }}>
                            <View style={{ width: 42, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: "#D7D7D7", backgroundColor: "#fff" }} />
                            <Text style={{ color: "#B3B3B3", fontSize: 11, fontFamily: Fonts.regular }}>
                              Estimate is fine!
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </Animated.View>

            {/* magnifying glass icon floating + blaze peeking */}
            <View pointerEvents="none" style={{ position: "absolute", right: -10, top: 52 }}>
              <Image source={require("@/assets/images/mascot_dragon.png")} style={{ width: 70, height: 70, opacity: 0.92 }} resizeMode="contain" />
            </View>
          </View>
        </View>

        {/* characters */}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "flex-end", paddingBottom: 10 }}>
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-end",
              paddingRight: 4,
            }}
          >
            {/* Snap (squirrel) left */}
            <Animated.View
              style={{
                width: 140,
                height: 200,
                alignItems: "center",
                transform: [
                  {
                    rotate: tailWag.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["-4deg", "2deg"],
                    }),
                  },
                ],
              }}
            >
              <Image
                source={require("@/assets/images/mascot_squirrel.png")}
                style={{ width: 140, height: 140, transform: [{ scaleX: -1 }] }}
                resizeMode="contain"
              />
              {/* pointing arm overlay toward card */}
              <Animated.View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  right: 6,
                  top: 78,
                  width: 54,
                  height: 14,
                  borderRadius: 7,
                  backgroundColor: "rgba(255,255,255,0.85)",
                  transform: [{ translateX: pointX }],
                  shadowColor: "#000",
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  shadowOffset: { width: 0, height: 2 },
                }}
              />
              <Animated.View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  right: -2,
                  top: 70,
                  width: 18,
                  height: 18,
                  borderRadius: 8,
                  backgroundColor: "rgba(255,255,255,0.18)",
                  transform: [{ translateX: pointX }],
                }}
              />
            </Animated.View>

            {/* Vault (safe robot) right */}
            <View
              style={{
                width: 135,
                height: 200,
                alignItems: "center",
                justifyContent: "flex-end",
                marginRight: 0,
                transform: [{ translateX: -6 }],
              }}
            >
              <Image
                source={require("@/assets/images/mascot_safe.png")}
                style={{ width: 135, height: 135 }}
                resizeMode="contain"
              />
              <View
                style={{
                  position: "absolute",
                  top: 86,
                  width: 56,
                  height: 24,
                  borderRadius: 10,
                  backgroundColor: "rgba(31,78,140,0.28)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.35)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#EAF4FF", fontFamily: Fonts.extraBold, fontWeight: "800", fontSize: 14 }}>0%</Text>
              </View>
              <Animated.View
                style={{
                  position: "absolute",
                  top: 54,
                  left: 60,
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: "#4D96FF",
                  opacity: blinkOpacity,
                }}
              />
            </View>
          </View>

          {/* Blaze (dragon) center smaller with % breath + coins */}
          <View style={{ position: "absolute", bottom: 4, left: "50%", marginLeft: -60, width: 120, height: 130, alignItems: "center", justifyContent: "flex-end" }}>
            {/* gold coin stacks under feet */}
            <View style={{ position: "absolute", bottom: 8, flexDirection: "row", alignItems: "flex-end", gap: 4 }}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={{ alignItems: "center", justifyContent: "flex-end" }}>
                  {[0, 1, 2 + (i === 2 ? 1 : 0)].map((_, j) => (
                    <View
                      key={j}
                      style={{
                        width: 18,
                        height: 6,
                        borderRadius: 4,
                        backgroundColor: "#F7C948",
                        borderWidth: 1,
                        borderColor: "#D4A017",
                        marginTop: -1,
                      }}
                    />
                  ))}
                </View>
              ))}
            </View>
            <Image source={require("@/assets/images/mascot_dragon.png")} style={{ width: 110, height: 110 }} resizeMode="contain" />
            <View style={{ position: "absolute", right: 6, bottom: 18, width: 18, height: 18, borderRadius: 9, backgroundColor: "#F7C948", borderWidth: 2, borderColor: "#D4A017" }} />
            <Animated.View pointerEvents="none" style={{ position: "absolute", left: 54, top: 40, opacity: pctOpacity, transform: [{ translateX: pctX }, { translateY: pctY }] }}>
              <View style={{ width: 34, height: 22, borderRadius: 12, backgroundColor: "rgba(160, 207, 255, 0.85)", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.6)", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#163A6B", fontFamily: Fonts.extraBold, fontWeight: "800", fontSize: 14 }}>%</Text>
              </View>
            </Animated.View>
          </View>

          {/* after adding debt toast + xp */}
          {toast && (
            <View style={{ position: "absolute", top: 18, left: 0, right: 0, alignItems: "center" }}>
              <View style={{ backgroundColor: "rgba(0,0,0,0.20)", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 }}>
                <Text style={{ color: "#fff", fontFamily: Fonts.semiBold, fontWeight: "600", fontSize: 13 }}>
                  {toast}
                </Text>
              </View>
              <Animated.View style={{ marginTop: 8, opacity: xpO, transform: [{ translateY: xpY }] }}>
                <Text style={{ color: "#FFD93D", fontFamily: Fonts.extraBold, fontWeight: "800", fontSize: 14 }}>
                  +10 XP
                </Text>
              </Animated.View>
            </View>
          )}
        </View>
      </View>

      {/* bottom section */}
      <View style={{ paddingHorizontal: 16, paddingTop: 0, paddingBottom: 8 }}>
        <Text style={{ color: "#fff", fontFamily: Fonts.extraBold, fontWeight: "800", fontSize: 22, textAlign: "center", letterSpacing: 0.3 }}>
          SQUAD, PREPARE FOR DEBT ENTRY!
        </Text>

        <View style={{ marginTop: 12, gap: 10 }}>
          <Pressable onPress={onAddDebt} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
            <View style={{ backgroundColor: "#2ECC71", borderRadius: 16, paddingVertical: 16, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 8 }}>
              <Text style={{ color: "#fff", fontFamily: Fonts.extraBold, fontWeight: "800", fontSize: 16 }}>
                + ADD YOUR FIRST DEBT
              </Text>
            </View>
          </Pressable>

          {debts.length > 0 && !allChecked && (
            <Pressable onPress={onAddDebt} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
              <View style={{ borderWidth: 2, borderColor: "#2ECC71", borderRadius: 16, paddingVertical: 14, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontFamily: Fonts.extraBold, fontWeight: "800", fontSize: 15 }}>
                  + Add Another Debt
                </Text>
              </View>
            </Pressable>
          )}

          {allChecked && (
            <Pressable onPress={onContinue} style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}>
              <View style={{ backgroundColor: "#2ECC71", borderRadius: 16, paddingVertical: 16, alignItems: "center", justifyContent: "center", shadowColor: "#2ECC71", shadowOpacity: 0.35, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 10 }}>
                <Text style={{ color: "#fff", fontFamily: Fonts.extraBold, fontWeight: "800", fontSize: 15, textAlign: "center" }}>
                  ✓ ALL DEBTS ADDED -{"\n"}Continue to Next Step
                </Text>
              </View>
            </Pressable>
          )}
        </View>
      </View>

      {/* bottom nav bar */}
      <View style={{ paddingBottom: Math.max(botPad, 10), paddingHorizontal: 14 }}>
        <View style={{ backgroundColor: "rgba(0,0,0,0.18)", borderRadius: 24, paddingVertical: 8, paddingHorizontal: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <NavItem label="Home" slot="home" active={false} />
          <NavItem label="Snap" slot="snap" active={true} />
          <NavItem label="Vault" slot="vault" active={false} />
          <NavItem label="Blaze" slot="blaze" active={false} />
          <NavItem label="Settings" slot="settings" active={false} />
        </View>
      </View>

      {/* tooltip */}
      <Modal visible={helpOpen} transparent animationType="fade" onRequestClose={() => setHelpOpen(false)}>
        <Pressable onPress={() => setHelpOpen(false)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center", padding: 22 }}>
          <View style={{ width: "100%", maxWidth: 360, backgroundColor: "#fff", borderRadius: 18, padding: 16 }}>
            <Text style={{ fontFamily: Fonts.extraBold, fontWeight: "800", color: "#1A1A1A", fontSize: 15, marginBottom: 6 }}>
              Variable rates change.
            </Text>
            <Text style={{ fontFamily: Fonts.regular, color: "#4A4A4A", fontSize: 13, lineHeight: 18 }}>
              Enter your best estimate
            </Text>
          </View>
        </Pressable>
      </Modal>
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
    if (isNaN(rateVal) || rateVal < 0 || rateVal > 100) e.apr = "APR must be 0–100%. Estimate is fine!";
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
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}>
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
              <Ionicons name="close" size={22} color="#6B7280" />
            </Pressable>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
          >
            {/* 1. Debt name */}
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 13, color: "#374151", marginBottom: 4 }}>Debt name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Credit Card 1"
                placeholderTextColor="#9CA3AF"
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
                      {selected && <Ionicons name="checkmark" size={16} color="#10B981" />}
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
                placeholderTextColor="#9CA3AF"
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
                      backgroundColor: aprModeFixed ? "#10B981" : "transparent",
                    }}
                  >
                    <Text style={{ fontSize: 11, color: aprModeFixed ? "#FFFFFF" : "#4B5563" }}>Fixed</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setAprModeFixed(false)}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      backgroundColor: !aprModeFixed ? "#10B981" : "transparent",
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
                  placeholderTextColor="#9CA3AF"
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
                    placeholderTextColor="#9CA3AF"
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
                    placeholderTextColor="#9CA3AF"
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
                    <Ionicons name="information-circle-outline" size={14} color="#6B7280" style={{ marginTop: 1, marginRight: 4 }} />
                    <Text style={{ flex: 1, fontSize: 11, color: "#6B7280" }}>
                      Variable rates change. Enter your best estimate.
                    </Text>
                  </View>
                </>
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
                placeholderTextColor="#9CA3AF"
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
                  <Text style={{ marginLeft: 6, fontSize: 12, color: "#6B7280" }}>
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
                            backgroundColor: selected ? "#10B981" : "transparent",
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
                  <Text style={{ fontSize: 11, color: "#6B7280" }}>
                    Only applies to IRS/state debts.
                  </Text>
                </View>
                <Switch
                  value={taxPlan}
                  onValueChange={(v) => {
                    setTaxPlan(v);
                    Haptics.selectionAsync();
                  }}
                  trackColor={{ false: "#D1D5DB", true: "#10B981" }}
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
                  backgroundColor: "#10B981",
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
      </View>
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
    iconNode = <DexMascot state="idle" size={size} />;
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
            <View key={d.id} style={[oc.card, { backgroundColor: isDark ? "#0D1520" : "#F5F8FF", borderColor: isDark ? "#2A3D55" : "#E8E8E8" }]}>
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

        <View style={[s.streakBubble, { backgroundColor: isDark ? "#0D1520" : "#EBF7F0", borderColor: Colors.primary, marginBottom: 16 }]}>
          <Text style={[s.streakBubbleText, { color: C.text }]}>
            Your debt-free date moves from {"\n"}
            <Text style={{ fontFamily: Fonts.extraBold, textDecorationLine: "line-through" }}>{fmtDate(payoffBefore)}</Text>
            {"\n"}to {"\n"}
            <Text style={{ fontFamily: Fonts.extraBold, color: Colors.primary }}>{fmtDate(payoffAfter)}</Text>
          </Text>
        </View>
        <View style={[s.streakBubble, { backgroundColor: isDark ? "#0D1520" : "#FFF3E0", borderColor: P.orange, marginBottom: 20 }]}>
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
                    backgroundColor: dailyGoal === v ? P.orange : (isDark ? "#0D1520" : "#F5F8FF"),
                    borderColor: dailyGoal === v ? P.orange : (isDark ? "#2A3D55" : "#E8E8E8"),
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

// ─── Screen: Payoff Strategy Selection (onboarding step 4) ──────────────────────
function PayoffStrategyScreen({
  isDark,
  bg,
  topPad,
  botPad,
  goTo,
  debts,
  onSelect,
  onBack,
}: {
  isDark: boolean;
  bg: string;
  topPad: number;
  botPad: number;
  goTo: (s: Step, dir?: "fwd" | "back") => void;
  debts: Debt[];
  onSelect: (strategy: "avalanche" | "snowball" | "custom") => void;
  onBack: () => void;
}) {
  const C = isDark ? { text: "#FFFFFF", textSecondary: "rgba(255,255,255,0.65)", surface: "#0D1520", border: "#2A3D55" } : { text: P.text, textSecondary: "#335547", surface: "#F5F8FF", border: "#E8E8E8" };

  return (
    <View style={[s.screen, { backgroundColor: bg, paddingTop: topPad, paddingBottom: botPad }]}>
      <LinearGradient colors={isDark ? ["#0A1628","#080E14"] : ["#FFFFFF","#FFFFFF"]} style={StyleSheet.absoluteFill} />
      <BackBtn onPress={onBack} isDark={isDark} topPad={topPad} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 48, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <Text style={[s.splashName, { fontSize: 26, color: C.text, marginBottom: 8, textAlign: "center" }]}>Choose the payoff method</Text>

        {/* Snowball Card */}
        <Pressable
          onPress={() => onSelect("snowball")}
          style={[oc.card, { flexDirection: "column", alignItems: "flex-start", backgroundColor: C.surface, borderColor: C.border, borderWidth: 2, padding: 20, marginBottom: 16 }]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <DexMascot state="happy" size={60} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontSize: 18, fontFamily: Fonts.extraBold, color: C.text }}>DEBT SNOWBALL METHOD</Text>
              <View style={{ backgroundColor: P.green + "20", alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginTop: 4 }}>
                <Text style={{ fontSize: 12, color: P.greenDk, fontFamily: Fonts.bold }}>BUILD SPEED</Text>
              </View>
            </View>
          </View>
          <Text style={{ fontSize: 14, color: C.textSecondary, fontFamily: Fonts.semiBold, marginBottom: 8 }}>(Behavior)</Text>
          <Text style={{ fontSize: 14, color: C.text, lineHeight: 20 }}>
            START SMALL. KNOCK OUT BALANCES FAST FOR MENTAL WINS & CONSISTENT MOMENTUM.
          </Text>
        </Pressable>

        {/* Avalanche Card */}
        <Pressable
          onPress={() => onSelect("avalanche")}
          style={[oc.card, { flexDirection: "column", alignItems: "flex-start", backgroundColor: C.surface, borderColor: C.border, borderWidth: 2, padding: 20, marginBottom: 16 }]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <DexMascot state="surprised" size={60} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontSize: 18, fontFamily: Fonts.extraBold, color: C.text }}>DEBT AVALANCHE METHOD</Text>
              <View style={{ backgroundColor: P.orange + "20", alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginTop: 4 }}>
                <Text style={{ fontSize: 12, color: P.orange, fontFamily: Fonts.bold }}>HIGH-INTEREST TARGET</Text>
              </View>
            </View>
          </View>
          <Text style={{ fontSize: 14, color: C.textSecondary, fontFamily: Fonts.semiBold, marginBottom: 8 }}>(Math)</Text>
          <Text style={{ fontSize: 14, color: C.text, lineHeight: 20 }}>
            SMASH INTEREST FIRST. SAVE THE MOST MONEY. ENGAGE HIGH-INTEREST BALANCES.
          </Text>
        </Pressable>
        
        {/* Custom Plan Card */}
        <Pressable
          onPress={() => onSelect("custom")}
          style={[oc.card, { flexDirection: "column", alignItems: "flex-start", backgroundColor: C.surface, borderColor: C.border, borderWidth: 2, padding: 20, marginBottom: 16 }]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <DexMascot state="encouraging" size={60} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontSize: 18, fontFamily: Fonts.extraBold, color: C.text }}>CUSTOM PLAN BUILDER</Text>
            </View>
          </View>
          <Text style={{ fontSize: 14, color: C.text, lineHeight: 20 }}>
            YOU CHOOSE WHICH DEBTS TO PRIORITIZE & ORDER. BUILD YOUR OWN ATTACK PLAN.
          </Text>
        </Pressable>
        
      </ScrollView>

      <View style={[s.footer, { paddingBottom: botPad + 8 }]}>
        <GreenBtn label="CONTINUE - LET'S CHOOSE THE MOTIVATION" onPress={() => onSelect("avalanche")} />
      </View>
    </View>
  );
}

// ─── Screen: Dream Goal Selection (onboarding step 5) ──────────────────────
function DreamGoalScreen({
  isDark,
  bg,
  topPad,
  botPad,
  goTo,
  debts,
  onComplete,
  onBack,
}: {
  isDark: boolean;
  bg: string;
  topPad: number;
  botPad: number;
  goTo: (s: Step, dir?: "fwd" | "back") => void;
  debts: Debt[];
  onComplete: (name: string, cost: string) => void;
  onBack: () => void;
}) {
  const [goalName, setGoalName] = useState("");
  const [goalCost, setGoalCost] = useState("");
  
  const C = isDark ? { text: "#FFFFFF", textSecondary: "rgba(255,255,255,0.65)", surface: "#0D1520", border: "#2A3D55" } : { text: P.text, textSecondary: "#335547", surface: "#F5F8FF", border: "#E8E8E8" };

  return (
    <View style={[s.screen, { backgroundColor: bg, paddingTop: topPad, paddingBottom: botPad }]}>
      <LinearGradient colors={isDark ? ["#0A1628","#080E14"] : ["#FFFFFF","#FFFFFF"]} style={StyleSheet.absoluteFill} />
      <BackBtn onPress={onBack} isDark={isDark} topPad={topPad} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 48, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <Text style={[s.splashName, { fontSize: 26, color: C.text, marginBottom: 8, textAlign: "left" }]}>What is one thing you really want?</Text>
        <Text style={{ fontSize: 16, color: C.textSecondary, marginBottom: 24, lineHeight: 22 }}>
          Getting debt free is big! But how about after you’re done to get something that really excites you - that’s cool! (Some say a trip, car, clothing, college education)
        </Text>

        <TextInput
          style={[s.input, { backgroundColor: C.surface, borderColor: C.border, color: C.text, padding: 16, borderRadius: 12, borderWidth: 1, fontSize: 18, marginBottom: 20 }]}
          placeholder="e.g. Disney World Trip"
          placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
          value={goalName}
          onChangeText={setGoalName}
        />

        <Text style={[s.splashName, { fontSize: 20, color: C.text, marginBottom: 8, textAlign: "left" }]}>And how much might it cost?</Text>
        <Text style={{ fontSize: 14, color: C.textSecondary, marginBottom: 12 }}>(Estimate is fine)</Text>
        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: C.surface, borderColor: C.border, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 20, color: C.textSecondary, marginRight: 8 }}>$</Text>
          <TextInput
            style={[s.input, { color: C.text, paddingVertical: 16, flex: 1, fontSize: 20 }]}
            placeholder="5000"
            keyboardType="decimal-pad"
            placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
            value={goalCost}
            onChangeText={setGoalCost}
          />
        </View>

      </ScrollView>

      <View style={[s.footer, { paddingBottom: botPad + 8 }]}>
        <GreenBtn label="Continue" disabled={!goalName || !goalCost} onPress={() => onComplete(goalName, goalCost)} />
      </View>
    </View>
  );
}

// ─── Screen: Coach Settings Selection (onboarding step 7) ──────────────────────
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
  onNext: (email: boolean, push: boolean, sound: boolean) => void;
  onBack: () => void;
}) {
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const C = isDark ? { text: "#FFFFFF", textSecondary: "rgba(255,255,255,0.65)", surface: "#0D1520", border: "#2A3D55" } : { text: P.text, textSecondary: "#335547", surface: "#F5F8FF", border: "#E8E8E8" };

  return (
    <View style={[s.screen, { backgroundColor: bg, paddingTop: topPad, paddingBottom: botPad }]}>
      <LinearGradient colors={isDark ? ["#0A1628","#080E14"] : ["#FFFFFF","#FFFFFF"]} style={StyleSheet.absoluteFill} />
      <BackBtn onPress={onBack} isDark={isDark} topPad={topPad} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 48, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <DexMascot state="encouraging" size={100} />
        </View>
        <Text style={[s.splashName, { fontSize: 26, color: C.text, marginBottom: 8, textAlign: "center" }]}>Well done!</Text>
        <Text style={{ fontSize: 16, color: C.textSecondary, marginBottom: 32, textAlign: "center", lineHeight: 24 }}>
          You’ve gotten here, what most people won’t do. I’m proud of you. How would you like me to coach you to stay consistent so you save money, time, and then get your dream goal?
        </Text>

        <Pressable onPress={() => setEmailEnabled(!emailEnabled)} style={[oc.card, { backgroundColor: C.surface, borderColor: C.border, padding: 20, marginBottom: 12 }]}>
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="mail" size={24} color={P.blue} style={{ marginRight: 16 }} />
            <Text style={{ fontSize: 18, color: C.text, fontFamily: Fonts.semiBold }}>Email updates</Text>
          </View>
          <Ionicons name={emailEnabled ? "toggle" : "toggle-outline"} size={32} color={emailEnabled ? P.green : C.textSecondary} />
        </Pressable>

        <Pressable onPress={() => setPushEnabled(!pushEnabled)} style={[oc.card, { backgroundColor: C.surface, borderColor: C.border, padding: 20, marginBottom: 12 }]}>
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="notifications" size={24} color={P.orange} style={{ marginRight: 16 }} />
            <View>
              <Text style={{ fontSize: 18, color: C.text, fontFamily: Fonts.semiBold }}>App notifications</Text>
              <Text style={{ fontSize: 13, color: C.textSecondary, marginTop: 4 }}>Daily reminders to stay on track</Text>
            </View>
          </View>
          <Ionicons name={pushEnabled ? "toggle" : "toggle-outline"} size={32} color={pushEnabled ? P.green : C.textSecondary} />
        </Pressable>

        <Pressable onPress={() => setSoundEnabled(!soundEnabled)} style={[oc.card, { backgroundColor: C.surface, borderColor: C.border, padding: 20, marginBottom: 12 }]}>
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="volume-high" size={24} color={Colors.warning} style={{ marginRight: 16 }} />
            <Text style={{ fontSize: 18, color: C.text, fontFamily: Fonts.semiBold }}>Sound alerts</Text>
          </View>
          <Ionicons name={soundEnabled ? "toggle" : "toggle-outline"} size={32} color={soundEnabled ? P.green : C.textSecondary} />
        </Pressable>

        <Text style={{ fontSize: 13, color: C.textSecondary, textAlign: "center", marginTop: 12 }}>Most people chose all-</Text>
      </ScrollView>

      <View style={[s.footer, { paddingBottom: botPad + 8 }]}>
        <GreenBtn label={`Get started with day 1 (${new Date().toLocaleDateString()})`} onPress={() => onNext(emailEnabled, pushEnabled, soundEnabled)} />
      </View>
    </View>
  );
}

// ─── Screens 2: Dex intro ──────────────────────────────────────────────────────
function DexIntroScreen({ isDark, bg, topPad, botPad, goTo, text, dexState, nextStep, backStep }: any) {
  const { display, done } = useTypewriter(text, 40);
  const bobAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bob = Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim, {
          toValue: -10,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: ND,
        }),
        Animated.timing(bobAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: ND,
        }),
      ])
    );
    bob.start();
    return () => bob.stop();
  }, []);

  return (
    <View style={[s.screen, { backgroundColor: bg, paddingTop: topPad, paddingBottom: botPad }]}>
      <LinearGradient colors={isDark ? ["#0A1628","#080E14"] : ["#FFFFFF","#FFFFFF"]} style={StyleSheet.absoluteFill} />
      <BackBtn onPress={() => goTo(backStep, "back")} isDark={isDark} topPad={topPad} />

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 28 }}>
        <SpeechBubble text={display + (done ? "" : "▌")} isDark={isDark} />
        <Animated.View style={{ transform: [{ translateY: bobAnim }] }}>
          <DexMascot state={dexState} size={180} />
        </Animated.View>
      </View>

      <View style={[s.footer, { paddingBottom: botPad + 8 }]}>
        <OrangeBtn label="CONTINUE" onPress={() => goTo(nextStep)} icon="arrow-forward" />
      </View>
    </View>
  );
}

// ─── Screens 4–6: Question screens ────────────────────────────────────────────
function QuestionScreen({ isDark, bg, topPad, botPad, progress, total, question, options, selected, onSelect, onNext, onBack }: any) {
  return (
    <View style={[s.screen, { backgroundColor: bg, paddingTop: topPad + 8 }]}>
      <LinearGradient colors={isDark ? ["#0A1628","#080E14"] : ["#FFFFFF","#FFFFFF"]} style={StyleSheet.absoluteFill} />
      <BackBtn onPress={onBack} isDark={isDark} topPad={topPad} />

      {/* Orange progress bar — sits below the back button */}
      <View style={{ marginTop: 50 }}>
        <ProgressBar current={progress} total={total} />
      </View>

      {/* Dex + speech bubble */}
      <View style={{ paddingHorizontal: 16, paddingTop: 10, flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 20 }}>
        <DexMascot state="onboarding_clipboard" size={72} />
        <View style={[s.qBubble, {
          backgroundColor: isDark ? "#1A2535" : "#FFFFFF",
          borderColor: isDark ? "#2A3D55" : P.orange,
          flex: 1,
        }]}>
          <Text style={[s.qBubbleText, { color: isDark ? "#FFFFFF" : P.text }]}>{question}</Text>
          <View style={[s.qBubbleTail, { borderRightColor: isDark ? "#1A2535" : "#FFFFFF" }]} />
          <View style={[s.qBubbleTailBorder, { borderRightColor: isDark ? "#2A3D55" : P.orange }]} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {options.map((opt: string) => (
          <OptionCard
            key={opt}
            label={opt}
            selected={selected === opt}
            onPress={() => {
              onSelect(opt);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          />
        ))}
      </ScrollView>

      <View style={[s.footer, { paddingBottom: botPad + 8 }]}>
        <OrangeBtn label="CONTINUE" onPress={onNext} disabled={!selected} icon="arrow-forward" />
      </View>
    </View>
  );
}

// ─── Screen 7: Celebration ────────────────────────────────────────────────────
function CelebrationScreen({ isDark, bg, topPad, botPad, q1, q2, xpClaimed, onClaim, onBack }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: ND }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 80, useNativeDriver: ND }),
    ]).start();
  }, []);

  // Extract short label from Q1 answer (strip leading emoji + spaces)
  const shortGoal = (q1 as string | null)
    ? (q1 as string).replace(/^[\S]+\s{2}/, "").split(" ").slice(0, 4).join(" ")
    : "Debt Free";
  const shortDebt = (q2 as string | null) ?? "N/A";

  const badges = [
    { label: "GOAL",  value: shortGoal,     bg: "#FFF3E0", textColor: P.orange,  labelColor: "#B8700A" },
    { label: "DEBT",  value: shortDebt,     bg: "#EFF6FF", textColor: P.blue,    labelColor: "#3B5F8C" },
    { label: "LEVEL", value: "Debt Rookie", bg: "#FFFBE6", textColor: P.gold,    labelColor: "#8B6914" },
  ];

  return (
    <View style={[s.screen, { backgroundColor: isDark ? "#080E14" : "#FFFFFF", paddingTop: topPad }]}>
      <Confetti />
      <BackBtn onPress={onBack} isDark={isDark} topPad={topPad} />

      <Animated.View style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
        paddingHorizontal: 24,
        gap: 18,
      }}>
        <DexMascot state="celebrating" size={130} />

        <Text style={[s.celebTitle, { color: isDark ? "#FFFFFF" : P.text }]}>
          You're ready to crush{"\n"}your debt!
        </Text>
        <Text style={[s.celebSub, { color: isDark ? "rgba(255,255,255,0.65)" : "#335547" }]}>
          Your personalized plan is ready.
        </Text>

        {/* 3 stat badges */}
        <View style={s.badgeRow}>
          {badges.map((b) => (
            <View
              key={b.label}
              style={[
                s.badge,
                {
                  backgroundColor: isDark ? "#0D1520" : b.bg,
                  borderColor: isDark ? "#1F2E44" : b.textColor + "44",
                },
              ]}
            >
              <Text style={[s.badgeLabel, { color: isDark ? "rgba(255,255,255,0.45)" : b.labelColor }]}>
                {b.label}
              </Text>
              <Text style={[s.badgeValue, { color: isDark ? "#FFFFFF" : b.textColor }]} numberOfLines={2}>
                {b.value}
              </Text>
            </View>
          ))}
        </View>
      </Animated.View>

      <View style={[s.footer, { paddingBottom: botPad + 8 }]}>
        <BlueBtn
          label={xpClaimed ? "Claimed! Continuing…" : "CLAIM +100 XP 🎉"}
          onPress={onClaim}
          disabled={xpClaimed}
          icon={xpClaimed ? "checkmark" : "gift"}
        />
      </View>
    </View>
  );
}

// ─── Screen 8: Streak Born ────────────────────────────────────────────────────
const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function StreakBornScreen({ isDark, bg, topPad, botPad, onNext, onBack }: any) {
  const today = new Date().getDay();
  const dayOrder = Array.from({ length: 7 }, (_, i) => DAYS[(today + i) % 7]);

  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const numAnim   = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: ND }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 70, useNativeDriver: ND }),
      Animated.spring(numAnim,  { toValue: 1, friction: 4, tension: 60, delay: 200, useNativeDriver: ND }),
    ]).start();
  }, []);

  return (
    <View style={[s.screen, { backgroundColor: isDark ? "#080E14" : "#FFFFFF", paddingTop: topPad }]}>
      <LinearGradient
        colors={isDark ? ["#120A00","#080E14"] : ["#FFFFFF","#FFFFFF"]}
        style={StyleSheet.absoluteFill}
      />
      <BackBtn onPress={onBack} isDark={isDark} topPad={topPad} />

      <Animated.View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 0, opacity: fadeAnim }}>

        {/* Speech bubble */}
        <View style={[s.streakBubble, {
          backgroundColor: isDark ? "#1E1200" : "#FFFFFF",
          borderColor: isDark ? "#3D2800" : P.orange,
          marginBottom: 28,
        }]}>
          <Text style={[s.streakBubbleText, { color: isDark ? "#FFD09B" : P.text }]}>
            {"Your streak is for your daily savings habit — not daily payments! 🎉\nSkipped a coffee? Packed lunch? Log it and keep your streak growing."}
          </Text>
          <View style={[s.streakBubbleTail, { borderTopColor: isDark ? "#1E1200" : "#FFFFFF" }]} />
        </View>

        {/* Dex + flame + number */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }], alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 4, marginBottom: 0 }}>
            <DexMascot state="happy" size={88} />
            <View style={{ marginBottom: 8 }}>
              <FlameIcon streakDays={1} size={72} />
            </View>
          </View>
          <Animated.Text style={[s.streakNum, { color: P.orange, transform: [{ scale: numAnim }] }]}>
            1
          </Animated.Text>
          <Text style={[s.streakDayLabel, { color: P.orange }]}>day streak</Text>
        </Animated.View>

        {/* 7-day calendar */}
        <View style={s.calRow}>
          {dayOrder.map((d, i) => (
            <View key={i} style={{ alignItems: "center", gap: 5 }}>
              <Text style={[s.calDayName, { color: isDark ? "rgba(255,255,255,0.45)" : "#8FA89A" }]}>{d}</Text>
              <View style={[
                s.calDot,
                i === 0
                  ? { backgroundColor: P.orange, borderColor: P.orange }
                  : { backgroundColor: "transparent", borderColor: isDark ? "#2A2000" : "#E8E8E8" },
              ]}>
                {i === 0 && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
            </View>
          ))}
        </View>
      </Animated.View>

      <View style={[s.footer, { paddingBottom: botPad + 8 }]}>
        <BlueBtn label="Continue to the motivation (last step)" onPress={onNext} icon="arrow-forward" />
      </View>
    </View>
  );
}

// ─── Screen 9: Streak Goal Picker ─────────────────────────────────────────────
const STREAK_GOALS = [
  { days: 7,  xp: 150 },
  { days: 14, xp: 300 },
  { days: 30, xp: 500 },
  { days: 60, xp: 750 },
];

function StreakGoalScreen({ isDark, bg, topPad, botPad, streakDays, onSelect, onCommit, onBack }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 380, useNativeDriver: ND }).start();
  }, []);

  return (
    <View style={[s.screen, { backgroundColor: isDark ? "#080E14" : "#FFFFFF", paddingTop: topPad }]}>
      <LinearGradient colors={isDark ? ["#0A1628","#080E14"] : ["#FFFFFF","#FFFFFF"]} style={StyleSheet.absoluteFill} />
      <BackBtn onPress={onBack} isDark={isDark} topPad={topPad} />

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {/* Dex + speech bubble header */}
        <View style={{ alignItems: "center", paddingTop: 24, paddingBottom: 20, gap: 16, paddingHorizontal: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 6 }}>
            <DexMascot state="encouraging" size={80} />
            <View style={{ marginBottom: 6 }}>
              <FlameIcon streakDays={1} size={52} />
            </View>
          </View>
          <View style={[s.streakBubble, {
            backgroundColor: isDark ? "#1A2535" : "#FFFFFF",
            borderColor: isDark ? "#2A3D55" : P.orange,
          }]}>
            <Text style={[s.streakBubbleText, { color: isDark ? "#FFFFFF" : P.text }]}>
              {"I commit to staying consistent for"}
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
          showsVerticalScrollIndicator={false}
        >
          {STREAK_GOALS.map((g) => {
            const sel = streakDays === g.days;
            return (
              <Pressable
                key={g.days}
                onPress={() => { onSelect(g.days); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                style={[
                  s.goalRow,
                  {
                    backgroundColor: sel ? P.orange : (isDark ? "#0D1520" : "#FFFFFF"),
                    borderColor: sel ? P.orange : (isDark ? "#2A3D55" : "#E8E8E8"),
                    borderWidth: sel ? 2 : 1.5,
                  },
                ]}
              >
                <Text style={[s.goalDays, { color: sel ? "#FFFFFF" : (isDark ? "#FFFFFF" : P.text) }]}>
                  {g.days} days
                </Text>
                <Text style={[s.goalXp, { color: sel ? "rgba(255,255,255,0.85)" : (isDark ? "rgba(255,255,255,0.4)" : "#8FA89A") }]}>
                  Earn +{g.xp} XP
                </Text>
                {sel && <Ionicons name="checkmark-circle" size={22} color="rgba(255,255,255,0.9)" style={{ marginLeft: 8 }} />}
              </Pressable>
            );
          })}
        </ScrollView>
      </Animated.View>

      <View style={[s.footer, { paddingBottom: botPad + 8 }]}>
        <OrangeBtn label="COMMIT TO MY GOAL 🎯" onPress={onCommit} disabled={!streakDays} />
      </View>
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
    fontFamily: Fonts.black,
    fontWeight: "900",
    letterSpacing: -1.5,
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

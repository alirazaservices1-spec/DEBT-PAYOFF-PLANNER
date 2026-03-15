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
import { FlameIcon } from "@/components/FlameIcon";

const { width: SW, height: SH } = Dimensions.get("window");
// true on iOS/Android (runs off JS thread), false on web (react-native-web requirement)
const ND = Platform.OS !== "web";

// ─── AsyncStorage keys ────────────────────────────────────────────────────────
const AKEY_GOAL       = "@debtpath_onboarding_goal";
const AKEY_DEBT_RANGE = "@debtpath_onboarding_debt_range";
const AKEY_MOTIVATION = "@debtpath_onboarding_motivation";
const AKEY_STREAK     = "@debtpath_streak_goal_days";

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

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
  const { setOnboardingDone } = useDebts();
  const { awardXp, grantBonusXp, triggerDex, triggerCelebration, level } = useGame();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [step, setStep] = useState<Step>(1);
  const [q1, setQ1] = useState<string | null>(null);
  const [q2, setQ2] = useState<string | null>(null);
  const [q3, setQ3] = useState<string | null>(null);
  const [streakDays, setStreakDays] = useState<number | null>(null);
  const [xpClaimed, setXpClaimed] = useState(false);

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

  // Skip entire onboarding (already have app)
  const handleSkipAll = async () => {
    await setOnboardingDone();
    router.replace("/(tabs)");
  };

  // Claim the 100 XP on celebration screen, then go to streak born
  const handleClaimXp = () => {
    if (xpClaimed) return;
    setXpClaimed(true);
    awardXp("COMPLETE_ONBOARDING");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    AsyncStorage.multiSet([
      [AKEY_GOAL,       q1 ?? ""],
      [AKEY_DEBT_RANGE, q2 ?? ""],
      [AKEY_MOTIVATION, q3 ?? ""],
    ]);
    setTimeout(() => goTo(8), 700);
  };

  // Commit to streak goal → finish onboarding, go to dashboard
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
    // Show level-up popup centered on the dashboard once navigation settles
    setTimeout(() => {
      triggerCelebration({ type: "level_up", level: level > 1 ? level : 2 }, 8000);
    }, 450);
  };

  const sp = { isDark, bg, topPad, botPad, goTo, handleSkipAll };

  return (
    <View style={{ flex: 1, backgroundColor: bg, overflow: "hidden" }}>
      <Animated.View style={{ flex: 1, transform: [{ translateX: slideAnim }] }}>

        {/* Screen 1 — Splash */}
        {step === 1 && <SplashScreen {...sp} />}

        {/* Screen 2 — Dex intro "Hi there!" */}
        {step === 2 && (
          <DexIntroScreen {...sp}
            text={"Hi there! I'm Dex! 👋"}
            dexState="happy"
            nextStep={3}
            backStep={1}
          />
        )}

        {/* Screen 3 — Question intro */}
        {step === 3 && (
          <DexIntroScreen {...sp}
            text={"Just 3 quick questions to build\nyour personalized debt payoff plan!"}
            dexState="celebrating"
            nextStep={4}
            backStep={2}
          />
        )}

        {/* Screen 4 — Q1: Debt goal */}
        {step === 4 && (
          <QuestionScreen {...sp} progress={1} total={3}
            question="What is your main debt goal?"
            options={[
              "💳  Pay off credit cards",
              "🏠  Pay off my mortgage faster",
              "📋  Pay off student loans",
              "🏢  Pay off business debt",
              "🗂️  Get completely debt-free",
            ]}
            selected={q1} onSelect={setQ1}
            onNext={() => goTo(5)} onBack={() => goTo(3, "back")}
          />
        )}

        {/* Screen 5 — Q2: Debt range */}
        {step === 5 && (
          <QuestionScreen {...sp} progress={2} total={3}
            question="How much total debt do you have?"
            options={["Under $5,000","$5,000 – $15,000","$15,000 – $50,000","Over $50,000"]}
            selected={q2} onSelect={setQ2}
            onNext={() => goTo(6)} onBack={() => goTo(4, "back")}
          />
        )}

        {/* Screen 6 — Q3: Motivation */}
        {step === 6 && (
          <QuestionScreen {...sp} progress={3} total={3}
            question="How motivated are you to become debt-free?"
            options={[
              "🔥  Super motivated – let's crush it!",
              "💪  Pretty motivated",
              "😐  Just getting started",
              "😟  Feeling a bit overwhelmed",
            ]}
            selected={q3} onSelect={setQ3}
            onNext={() => goTo(7)} onBack={() => goTo(5, "back")}
          />
        )}

        {/* Screen 7 — Celebration */}
        {step === 7 && (
          <CelebrationScreen {...sp}
            q1={q1} q2={q2}
            xpClaimed={xpClaimed}
            onClaim={handleClaimXp}
            onBack={() => goTo(6, "back")}
          />
        )}

        {/* Screen 8 — Streak Born */}
        {step === 8 && (
          <StreakBornScreen {...sp}
            onNext={() => goTo(9)}
            onBack={() => goTo(7, "back")}
          />
        )}

        {/* Screen 9 — Streak Goal Picker */}
        {step === 9 && (
          <StreakGoalScreen {...sp}
            streakDays={streakDays}
            onSelect={setStreakDays}
            onCommit={handleCommitStreak}
            onBack={() => goTo(8, "back")}
          />
        )}

      </Animated.View>
    </View>
  );
}

// ─── Screen 1: Splash ─────────────────────────────────────────────────────────
function SplashScreen({ isDark, bg, topPad, botPad, goTo, handleSkipAll }: any) {
  return (
    <View style={[s.screen, { backgroundColor: bg, paddingTop: topPad, paddingBottom: botPad }]}>
      <LinearGradient
        colors={isDark ? ["#0A1628","#080E14"] : ["#FFFFFF","#FFFFFF"]}
        style={StyleSheet.absoluteFill}
      />
      <View style={s.splashCenter}>
        <Image
          source={require("@/assets/images/iconApp.png")}
          defaultSource={require("@/assets/images/iconApp.png")}
          style={s.splashLogo}
          resizeMode="contain"
          // Remove any platform fade so the icon appears instantly once the view mounts.
          // (fadeDuration is Android-only; iOS shows it immediately by default.)
          fadeDuration={0}
        />
        <Text style={[s.splashName, { color: isDark ? "#FFFFFF" : "#05130A" }]}>DebtPath</Text>
        <Text style={[s.splashTagline, { color: isDark ? "rgba(255,255,255,0.68)" : "#335547" }]}>
          Your path to debt freedom.{"\n"}Free. Forever.
        </Text>
      </View>

      <View style={[s.splashBtns, { paddingBottom: botPad + 8 }]}>
        <GreenBtn label="GET STARTED" onPress={() => goTo(2)} icon="arrow-forward" />
        <Pressable onPress={handleSkipAll} hitSlop={12}>
          <Text style={[s.alreadyHave, { color: isDark ? "rgba(255,255,255,0.4)" : "#8FA89A" }]}>
            I ALREADY HAVE THE APP
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Screens 2 & 3: Dex intro / Question intro ────────────────────────────────
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
            {"A debt-free journey is born! 🎉\nLog payments every day to keep\nyour streak growing."}
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
        <BlueBtn label="I'M COMMITTED 💪" onPress={onNext} icon="arrow-forward" />
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
              {"Let's commit to your\ndebt payoff streak!"}
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

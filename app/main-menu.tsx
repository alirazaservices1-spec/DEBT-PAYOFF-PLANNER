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
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withRepeat,
  withSequence,
  withTiming,
  Easing as REasing,
} from "react-native-reanimated";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Ellipse, Path, Text as SvgText, G, Defs, RadialGradient, Stop } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { useGame } from "@/context/GameContext";
import { useGoal } from "@/context/GoalContext";
import { useDebts } from "@/context/DebtContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useNotifications } from "@/context/NotificationContext";
import { Fonts } from "@/constants/fonts";
import {
  LEVELS_DATA,
  getLevelDef,
} from "@/constants/levelsData";
import { getHomeDexMessages } from "@/constants/dexPhrases";
import { WelcomeSetupBanner } from "@/components/WelcomeSetupBanner";
import { DexCoin } from "@/components/DexCoin";
import { DEX_SCREEN_MAP } from "@/constants/dexScreenMap";
import { shouldShowDayCompleteStreakBanner, hasCompletedDayFlowToday } from "@/lib/dayCompleteGate";
import {
  getDevPreviewActivityDay,
  getDevPreviewHomeState,
  getDevPreviewStreakDays,
  isDevHomePreviewAvailable,
} from "@/lib/devHomePreview";
import { getRecommendations, RECOMMENDATION_MIN_BALANCE } from "@/lib/MonetizationRules";
import { debtsEligibleForStrategy, runStrategy } from "@/lib/calculations";
import { AFFILIATE_URLS } from "@/lib/affiliateUrls";
import { withAppUtmParams } from "@/lib/utm";
import * as Haptics from "expo-haptics";
import { SatisfactionFeedbackModal } from "@/components/SatisfactionFeedbackModal";
import { hasTriggerFired } from "@/lib/satisfactionFeedbackGate";

const BG    = "#EDE8DC";
const DARK  = "#1C0F00";
const DARK2 = "#3D2200";
const GOLD  = "#D9A045";
const GOLD2 = "#C8882A";
// Per design request: any brown text on beige -> black.
const AMBER = "#111111";
const MUTED = "#111111";
const ONBOARDING_DREAM_GOAL_NAME_KEY = "@debtpath_dream_goal_name";
const ONBOARDING_DREAM_GOAL_COST_KEY = "@debtpath_dream_goal_cost";

/** Deterministic daily pick so Dex / banner lines stay stable for the calendar day. */
function stableDayPick<T>(arr: T[], seed: string): T {
  if (arr.length === 0) {
    throw new Error("stableDayPick: empty array");
  }
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return arr[Math.abs(h) % arr.length];
}

type DexExpression = "default" | "happy" | "excited" | "celebrating";

function recHomePalette(id: string): { bg: string; border: string; btn: string } {
  switch (id) {
    case "tax":
      return { bg: "#E8EEF8", border: "#0A3580", btn: "#0A3580" };
    case "relief":
      return { bg: "#FFE0DC", border: "#991C1C", btn: "#991C1C" };
    case "business":
      return { bg: "#E6F5EC", border: "#135228", btn: "#135228" };
    case "rate":
      return { bg: "#D4E3FF", border: "#0A3580", btn: "#0A3580" };
    case "means_test":
      return { bg: "#F3E8FF", border: "#5B2C91", btn: "#5B2C91" };
    default:
      return { bg: "#FFFFFF", border: "#A8967A", btn: "#C07200" };
  }
}

function HtmlDexCoin({ mode, size = 170 }: { mode: "well" | "back"; size?: number }) {
  const motion = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    motion.setValue(0);
    const anim =
      mode === "well"
        ? Animated.loop(
            Animated.sequence([
              Animated.timing(motion, { toValue: 1, duration: 560, useNativeDriver: true }),
              Animated.timing(motion, { toValue: 0, duration: 560, useNativeDriver: true }),
            ])
          )
        : Animated.loop(
            Animated.sequence([
              Animated.timing(motion, { toValue: 1, duration: 540, useNativeDriver: true }),
              Animated.timing(motion, { toValue: -1, duration: 540, useNativeDriver: true }),
              Animated.timing(motion, { toValue: 0, duration: 540, useNativeDriver: true }),
            ])
          );
    anim.start();
    return () => anim.stop();
  }, [mode, motion]);

  const translateY =
    mode === "well"
      ? motion.interpolate({ inputRange: [0, 1], outputRange: [0, -14] })
      : motion.interpolate({ inputRange: [-1, 0, 1], outputRange: [2, 0, -2] });
  const rotate =
    mode === "well"
      ? motion.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-3deg"] })
      : motion.interpolate({ inputRange: [-1, 0, 1], outputRange: ["2deg", "0deg", "-2deg"] });

  const browL = mode === "well" ? "M 48 74 Q 65 64 82 74" : "M 48 76 Q 65 86 82 76";
  const browR = mode === "well" ? "M 88 74 Q 105 64 122 74" : "M 88 76 Q 105 86 122 76";
  const mouth = mode === "well" ? "M 64 130 Q 85 150 106 130" : "M 64 140 Q 85 130 106 140";
  const blush = mode === "well" ? "rgba(230,140,60,.20)" : "rgba(230,140,60,.07)";
  const starsOpacity = mode === "well" ? 1 : 0;

  return (
    <Animated.View style={{ width: size, height: size * 1.06, transform: [{ translateY }, { rotate }] }}>
      <Svg viewBox="0 0 170 180" width={size} height={size * 1.06}>
        <SvgText x={10} y={44} fontSize={16} fill="#FFD700" opacity={starsOpacity}>★</SvgText>
        <SvgText x={136} y={38} fontSize={14} fill="#FFD700" opacity={starsOpacity}>★</SvgText>
        <SvgText x={72} y={14} fontSize={12} fill="#FF6B35" opacity={starsOpacity}>✦</SvgText>

        <Circle cx={85} cy={100} r={78} fill="rgba(232,152,10,.08)" />
        <Circle cx={85} cy={100} r={72} fill="url(#coinGrad)" />
        <Circle cx={85} cy={100} r={72} fill="none" stroke="#9A6800" strokeWidth={3.5} />
        <Circle cx={85} cy={100} r={63} fill="none" stroke="#9A6800" strokeWidth={1.4} opacity={0.35} />
        <Ellipse cx={66} cy={72} rx={24} ry={13} fill="rgba(255,255,255,.28)" rotation={-20} originX={66} originY={72} />
        <Ellipse cx={64} cy={95} rx={16} ry={14} fill="rgba(80,40,0,.08)" />
        <Ellipse cx={106} cy={95} rx={16} ry={14} fill="rgba(80,40,0,.08)" />

        <Ellipse cx={64} cy={93} rx={14} ry={14} fill="white" />
        <Ellipse cx={106} cy={93} rx={14} ry={14} fill="white" />
        <Ellipse cx={65} cy={93} rx={9} ry={9.5} fill="#160800" />
        <Ellipse cx={107} cy={93} rx={9} ry={9.5} fill="#160800" />
        <Circle cx={70} cy={88} r={3.8} fill="white" />
        <Circle cx={112} cy={88} r={3.8} fill="white" />
        <Circle cx={60} cy={97} r={1.6} fill="rgba(255,255,255,.55)" />
        <Circle cx={102} cy={97} r={1.6} fill="rgba(255,255,255,.55)" />

        <Path d={browL} stroke="#7A4800" strokeWidth={4} fill="none" strokeLinecap="round" />
        <Path d={browR} stroke="#7A4800" strokeWidth={4} fill="none" strokeLinecap="round" />

        <Ellipse cx={85} cy={116} rx={19} ry={13} fill="#C88000" />
        <Ellipse cx={85} cy={115} rx={14} ry={9.5} fill="#9A5C00" />
        <Ellipse cx={82} cy={112} rx={4.5} ry={2.8} fill="rgba(255,255,255,.34)" />
        <Path d="M85 106 L85 110" stroke="#7A4800" strokeWidth={2.4} strokeLinecap="round" />

        <Path d={mouth} stroke="#7A4800" strokeWidth={3.5} fill="none" strokeLinecap="round" />
        {mode === "well" && (
          <>
            <Path d="M 66 130 Q 85 148 104 130" fill="white" />
            <Path d="M85 130 L85 147" stroke="#7A4800" strokeWidth={2} />
          </>
        )}

        <Ellipse cx={48} cy={113} rx={11} ry={6.5} fill={blush} />
        <Ellipse cx={122} cy={113} rx={11} ry={6.5} fill={blush} />

        <SvgText x={85} y={65} textAnchor="middle" fontSize={14} fontWeight="900" fill="rgba(110,55,0,.26)">$</SvgText>
        <Defs>
          <RadialGradient id="coinGrad" cx="37%" cy="28%" r="67%">
            <Stop offset="0%" stopColor="#FFEC90" />
            <Stop offset="50%" stopColor="#FFB820" />
            <Stop offset="100%" stopColor="#B57800" />
          </RadialGradient>
        </Defs>
      </Svg>
    </Animated.View>
  );
}

// ── Expressive Dex SVG ────────────────────────────────────────────────────────
function DexSvg({ expression = "default" }: { expression?: DexExpression }) {
  // Eyes vary by expression
  const renderEyes = () => {
    if (expression === "celebrating") {
      // Star eyes
      return (
        <>
          <Circle cx="41" cy="52" r="10" fill="#1C0F00" />
          <Circle cx="69" cy="52" r="10" fill="#1C0F00" />
          <SvgText x="32" y="57" fontSize="12">⭐</SvgText>
          <SvgText x="60" y="57" fontSize="12">⭐</SvgText>
        </>
      );
    }
    if (expression === "excited") {
      // Wide open bright eyes
      return (
        <>
          <Circle cx="41" cy="50" r="11" fill="#1C0F00" />
          <Circle cx="69" cy="50" r="11" fill="#1C0F00" />
          <Circle cx="44" cy="46" r="5" fill="white" />
          <Circle cx="72" cy="46" r="5" fill="white" />
          <Circle cx="46" cy="48" r="2" fill="white" opacity={0.7} />
          <Circle cx="74" cy="48" r="2" fill="white" opacity={0.7} />
        </>
      );
    }
    if (expression === "happy") {
      // Slightly squinted happy eyes
      return (
        <>
          <Ellipse cx="41" cy="53" rx="10" ry="8" fill="#1C0F00" />
          <Ellipse cx="69" cy="53" rx="10" ry="8" fill="#1C0F00" />
          <Circle cx="44" cy="49" r="4" fill="white" />
          <Circle cx="72" cy="49" r="4" fill="white" />
          <Circle cx="46" cy="51" r="1.5" fill="white" opacity={0.6} />
          <Circle cx="74" cy="51" r="1.5" fill="white" opacity={0.6} />
        </>
      );
    }
    // default
    return (
      <>
        <Circle cx="41" cy="52" r="10" fill="#1C0F00" />
        <Circle cx="69" cy="52" r="10" fill="#1C0F00" />
        <Circle cx="44" cy="48" r="4" fill="white" />
        <Circle cx="72" cy="48" r="4" fill="white" />
        <Circle cx="46" cy="50" r="1.5" fill="white" opacity={0.6} />
        <Circle cx="74" cy="50" r="1.5" fill="white" opacity={0.6} />
      </>
    );
  };

  // Mouth varies by expression
  const renderMouth = () => {
    if (expression === "celebrating" || expression === "excited") {
      // Big open happy mouth
      return (
        <>
          <Path
            d="M38,72 Q55,90 72,72"
            stroke="#8B5E20" strokeWidth="3.5"
            strokeLinecap="round" fill="none" opacity={0.9}
          />
          <Ellipse cx="55" cy="75" rx="6" ry="4" fill="#8B5E20" opacity={0.7} />
        </>
      );
    }
    if (expression === "happy") {
      // Nice wide smile
      return (
        <>
          <Path
            d="M40,73 Q55,86 70,73"
            stroke="#8B5E20" strokeWidth="3.2"
            strokeLinecap="round" fill="none" opacity={0.9}
          />
          <Ellipse cx="55" cy="68" rx="5" ry="3.5" fill="#8B5E20" opacity={0.7} />
        </>
      );
    }
    // default
    return (
      <>
        <Path
          d="M42,73 Q55,83 68,73"
          stroke="#8B5E20" strokeWidth="3"
          strokeLinecap="round" fill="none" opacity={0.85}
        />
        <Ellipse cx="55" cy="67" rx="4.5" ry="3" fill="#8B5E20" opacity={0.75} />
      </>
    );
  };

  // Cheek blush — stronger for happy/celebrating
  const cheekOpacity = expression === "celebrating" ? 0.55
    : expression === "excited" ? 0.5
    : expression === "happy" ? 0.42
    : 0.35;

  // Sparkle decoration — only for celebrating/excited
  const showSparkles = expression === "celebrating" || expression === "excited";

  return (
    <Svg width={96} height={100} viewBox="0 0 110 115" fill="none">
      {/* Ears */}
      <Circle cx="22" cy="32" r="17" fill="#C8882A" />
      <Circle cx="88" cy="32" r="17" fill="#C8882A" />
      <Circle cx="22" cy="32" r="10" fill="#D9A045" opacity="0.7" />
      <Circle cx="88" cy="32" r="10" fill="#D9A045" opacity="0.7" />

      {/* Head */}
      <Circle cx="55" cy="57" r="36" fill="#D9A045" />
      <Ellipse cx="43" cy="42" rx="10" ry="7" fill="white" opacity="0.18"
        rotation="-25" originX="43" originY="42" />
      <Ellipse cx="55" cy="71" rx="16" ry="11" fill="#C8882A" opacity="0.5" />

      {/* Eyes */}
      {renderEyes()}

      {/* Cheeks */}
      <Ellipse cx="30" cy="63" rx="8" ry="5" fill="#E8955A" opacity={cheekOpacity} />
      <Ellipse cx="80" cy="63" rx="8" ry="5" fill="#E8955A" opacity={cheekOpacity} />

      {/* Mouth */}
      {renderMouth()}

      {/* Sparkles */}
      {showSparkles ? (
        <>
          <SvgText x="0"  y="26" fontSize="14">✨</SvgText>
          <SvgText x="85" y="20" fontSize="12">🌟</SvgText>
          <SvgText x="88" y="50" fontSize="10">✨</SvgText>
        </>
      ) : (
        <>
          <SvgText x="4"  y="26" fontSize="13">✨</SvgText>
          <SvgText x="88" y="22" fontSize="11">⭐</SvgText>
        </>
      )}

      {/* Body */}
      <Ellipse cx="55" cy="103" rx="22" ry="14" fill="#C8882A" />
      <Circle cx="55" cy="100" r="7" fill="#D9A045" opacity="0.5" />
      <SvgText x="55" y="103.5" textAnchor="middle"
        fontSize="8" fill="#8B5E20" fontWeight="bold" opacity="0.9">
        $
      </SvgText>
    </Svg>
  );
}

const AnimatedG = Reanimated.createAnimatedComponent(G);

function DexCheering({ size = 112, cheerLevel = 1 }: { size?: number; cheerLevel?: number }) {
  // Matches the client HTML/CSS behavior:
  // - dex-float  : 2.8s ease-in-out, translateY(0 -> -8px -> 0)
  // - dex-wave   : 1.1s ease-in-out, rotate(0 -> 24deg -> -6deg -> 0) around (82,68)
  // Also, treat `size` as displayed height to make it visually taller (like the old Dex).
  const floatY = useSharedValue(0); // pixels
  const armRot = useSharedValue(0); // degrees
  const cheer = useSharedValue(cheerLevel);

  useEffect(() => {
    cheer.value = cheerLevel;
  }, [cheerLevel, cheer]);

  useEffect(() => {
    const floatEasing = REasing.inOut(REasing.cubic);
    const waveEasing = REasing.inOut(REasing.cubic);

    // 2.8s total: 0% -> 50% (1.4s), 50% -> 100% (1.4s)
    floatY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1400, easing: floatEasing }),
        withTiming(0, { duration: 1400, easing: floatEasing }),
      ),
      -1,
      true
    );

    // 1.1s total keyframes (client CSS-like):
    // 0%   rotate(-30deg)
    // 25%  rotate( 20deg)
    // 50%  rotate(-25deg)
    // 75%  rotate( 15deg)
    // 100% rotate(-30deg)
    armRot.value = withRepeat(
      withSequence(
        withTiming(-30, { duration: 200, easing: waveEasing }),  // arm up
        withTiming(20, { duration: 300, easing: waveEasing }),   // swing down
        withTiming(-25, { duration: 280, easing: waveEasing }),  // back up
        withTiming(15, { duration: 280, easing: waveEasing }),   // down again
        withTiming(-30, { duration: 240, easing: waveEasing }),  // rest up
      ),
      -1,
      false
    );
  }, [floatY, armRot]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value * cheer.value }],
  }));

  const armAnimProps = useAnimatedProps(() => ({
    transform: `rotate(${armRot.value * cheer.value} 82 68)`,
  }));

  const height = size;
  const width = (size * 120) / 108;

  return (
    <Reanimated.View style={floatStyle}>
      <Svg width={width} height={height} viewBox="0 0 120 108" fill="none">
        {/* waving arm group */}
        <AnimatedG animatedProps={armAnimProps}>
          <Path d="M82,68 C90,56 98,44 96,30" stroke="#C8882A" strokeWidth={10} strokeLinecap="round" fill="none" />
          <Circle cx={95} cy={26} r={9} fill="#E8A835" />
          <Circle cx={89} cy={19} r={4} fill="#E8A835" />
          <Circle cx={96} cy={17} r={4} fill="#E8A835" />
          <Circle cx={103} cy={19} r={4} fill="#E8A835" />
        </AnimatedG>

        {/* ears */}
        <Circle cx={30} cy={34} r={16} fill="#C8882A" />
        <Circle cx={78} cy={34} r={16} fill="#C8882A" />
        <Circle cx={30} cy={34} r={10} fill="#E8A835" />
        <Circle cx={78} cy={34} r={10} fill="#E8A835" />

        {/* head */}
        <Circle cx={54} cy={62} r={38} fill="#E8A835" />
        <Circle cx={54} cy={64} r={30} fill="#F0BC50" opacity={0.45} />

        {/* cheeks */}
        <Ellipse cx={32} cy={72} rx={9} ry={6} fill="#D4822A" opacity={0.5} />
        <Ellipse cx={76} cy={72} rx={9} ry={6} fill="#D4822A" opacity={0.5} />

        {/* eyes */}
        <Circle cx={42} cy={58} r={12} fill="#1C0E00" />
        <Circle cx={66} cy={58} r={12} fill="#1C0E00" />
        <Circle cx={45} cy={53} r={5.5} fill="white" />
        <Circle cx={69} cy={53} r={5.5} fill="white" />
        <Circle cx={47} cy={55} r={2} fill="white" opacity={0.55} />
        <Circle cx={71} cy={55} r={2} fill="white" opacity={0.55} />

        {/* nose */}
        <Ellipse cx={54} cy={70} rx={5} ry={3.5} fill="#B06820" opacity={0.7} />

        {/* smile */}
        <Path
          d="M41,77 Q54,90 67,77"
          stroke="#9B5A18"
          strokeWidth={3}
          strokeLinecap="round"
          fill="#C8882A"
          opacity={0.6}
        />

        {/* brows raised */}
        <Path d="M33,46 Q42,40 49,45" stroke="#9B5A18" strokeWidth={2.5} strokeLinecap="round" fill="none" />
        <Path d="M59,45 Q66,40 75,46" stroke="#9B5A18" strokeWidth={2.5} strokeLinecap="round" fill="none" />
      </Svg>
    </Reanimated.View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function MainMenuScreen({ showClose = true }: { showClose?: boolean }) {
  const insets = useSafeAreaInsets();
  const { streakCount, longestStreak, totalXp, level, currentLevelXp, nextLevelXp, progress, prevLastOpenedAt } = useGame();
  const { goalName, hasGoal, daysToGoal } = useGoal();
  const { activeResult, extraPayment, welcomeSkipped, debts, selectedStrategy } = useDebts();
  const { fmt } = useCurrency();
  const { setDebts } = useNotifications();
  const [onboardingDreamName, setOnboardingDreamName] = useState("");
  const [onboardingDreamCost, setOnboardingDreamCost] = useState(0);
  const [streakDayBanner, setStreakDayBanner] = useState(false);
  const [dayDoneBanner, setDayDoneBanner] = useState(false);
  const [satisfactionVisible, setSatisfactionVisible] = useState(false);
  const [devPreviewActivityDay, setDevPreviewActivityDay] = useState<number | null>(null);
  /** `null` = use real streak; `number` includes 0 for dev preview pill. */
  const [devPreviewStreakOverride, setDevPreviewStreakOverride] = useState<number | null>(null);

  const currentLevelDef = getLevelDef(level);
  const nextLevelDef = level < LEVELS_DATA.length ? getLevelDef(level + 1) : null;
  const xpToNext = nextLevelXp - currentLevelXp;
  const xpIntoLevel = totalXp - currentLevelDef.minXp;
  const levelSpan = (currentLevelDef.maxXp ?? (currentLevelDef.minXp + 9999)) - currentLevelDef.minXp;
  const barPct = Math.min(100, Math.max(0, (xpIntoLevel / levelSpan) * 100));

  const barAnim   = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  const effectiveGoalName = (hasGoal ? goalName : onboardingDreamName).trim();
  const debtMonths = Math.max(0, Math.round(activeResult?.totalMonths ?? 0));
  const dreamMonthsFromGoal = hasGoal && daysToGoal > 0 ? Math.ceil(daysToGoal / 30) : 0;
  const dreamMonthsFromOnboarding =
    !hasGoal && onboardingDreamCost > 0 && extraPayment > 0
      ? Math.ceil(onboardingDreamCost / Math.max(1, extraPayment))
      : 0;
  const dreamMonths = dreamMonthsFromGoal || dreamMonthsFromOnboarding;
  const daysSinceLastOpen = (() => {
    if (!prevLastOpenedAt) return null;
    const prev = new Date(prevLastOpenedAt);
    const now = new Date();
    if (Number.isNaN(prev.getTime()) || Number.isNaN(now.getTime())) return null;
    const msPerDay = 24 * 60 * 60 * 1000;
    const utcPrev = Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth(), prev.getUTCDate());
    const utcNow = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const days = Math.round((utcNow - utcPrev) / msPerDay);
    return days >= 0 ? days : null;
  })();

  const monthsText = (n: number) => `${n} month${n === 1 ? "" : "s"}`;
  const dreamIcon = (() => {
    const v = effectiveGoalName.toLowerCase();
    if (v.includes("car")) return "🚗";
    if (v.includes("home") || v.includes("house")) return "🏠";
    if (v.includes("trip") || v.includes("travel") || v.includes("vacation")) return "✈️";
    if (v.includes("wedding")) return "💍";
    return "🌟";
  })();
  const displayStreakCount =
    typeof devPreviewStreakOverride === "number" ? devPreviewStreakOverride : streakCount;

  const messages = getHomeDexMessages({
    goalName: effectiveGoalName,
    streakCount: displayStreakCount,
    xpToNext,
    nextLevelName: nextLevelDef?.name ?? "",
    daysSinceLastOpen,
  });
  const congratsMessages = [
    `${displayStreakCount} day${displayStreakCount === 1 ? "" : "s"} streak! You're building momentum!`,
    `${Math.round(barPct)}% through this level - nice work, keep going!`,
    `${totalXp.toLocaleString()} XP total. Every task adds up.`,
  ];

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

  const homeRecommendations = useMemo(() => {
    const recDebts = (debts || []).map((d) => ({
      id: d.id,
      name: d.name,
      balance: d.balance,
      apr: d.apr,
      category: d.debtType,
      debtType: d.debtType,
      isSecured: d.isSecured,
    }));
    return getRecommendations(recDebts, "dashboard");
  }, [debts]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        const [skipPending, doneToday] = await Promise.all([
          shouldShowDayCompleteStreakBanner(),
          hasCompletedDayFlowToday(),
        ]);
        let previewDay: number | null = null;
        let previewStreak: number | null = null;
        if (isDevHomePreviewAvailable()) {
          const [d, st, previewState] = await Promise.all([
            getDevPreviewActivityDay(),
            getDevPreviewStreakDays(),
            getDevPreviewHomeState(),
          ]);
          previewDay = d;
          previewStreak = st;
          if (!alive) return;
          setDevPreviewActivityDay(previewDay);
          setDevPreviewStreakOverride(previewStreak);
          if (previewState === "completed_today") {
            setStreakDayBanner(false);
            setDayDoneBanner(true);
            return;
          }
          if (previewState === "skipped_wrap") {
            setStreakDayBanner(true);
            setDayDoneBanner(false);
            return;
          }
          if (previewState === "needs_wrap") {
            setStreakDayBanner(false);
            setDayDoneBanner(false);
            return;
          }
        } else if (alive) {
          setDevPreviewActivityDay(null);
          setDevPreviewStreakOverride(null);
        }
        if (!alive) return;
        setStreakDayBanner(skipPending);
        setDayDoneBanner(doneToday && !skipPending);
      })();
      return () => {
        alive = false;
      };
    }, []),
  );

  useEffect(() => {
    setDebts(
      (debts || []).map((d) => ({
        id: d.id,
        name: d.name,
        minimumPayment: d.minimumPayment,
        dueDate: d.dueDate,
      }))
    );
  }, [debts, setDebts]);

  // Animate XP bar
  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: barPct,
      duration: 1200,
      delay: 400,
      useNativeDriver: false,
    }).start();
  }, [barPct]);

  // Shimmer sweep across progress fill (HTML-like effect).
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2200,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [shimmerAnim]);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    void (async () => {
      if (displayStreakCount !== 1) return;
      const done = await hasTriggerFired("day1_complete");
      if (cancelled || done) return;
      timer = setTimeout(() => {
        if (!cancelled) setSatisfactionVisible(true);
      }, 900);
    })();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [displayStreakCount]);

  const calendarDay = new Date().toISOString().slice(0, 10);
  const msg = stableDayPick(messages, `${calendarDay}-dex`);
  const congratsMsg = stableDayPick(congratsMessages, `${calendarDay}-banner`);
  /** Projected total interest avoided vs. paying only minimums (same strategy), matching Plan + weekly “interest saved” messaging. */
  const interestSavedVsMinimums = useMemo(() => {
    const eligible = debtsEligibleForStrategy(debts);
    if (eligible.length === 0) return 0;
    const strat = selectedStrategy === "custom" ? "snowball" : selectedStrategy;
    const minOnly = runStrategy(eligible, 0, strat);
    return Math.max(0, Math.round(minOnly.totalInterestPaid - activeResult.totalInterestPaid));
  }, [debts, selectedStrategy, activeResult]);
  const barWidth = barAnim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] });
  const shimmerX = shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [-120, 220] });

  const resolvedActivityDayForCta =
    devPreviewActivityDay ?? (displayStreakCount >= 1 ? displayStreakCount + 1 : null);
  const completeTodayCtaLabel =
    resolvedActivityDayForCta != null && resolvedActivityDayForCta >= 2
      ? `Complete Day ${resolvedActivityDayForCta} activities`
      : resolvedActivityDayForCta === 1
        ? "Complete Day 1 activities"
        : "Complete today's activities";

  // Extra space above the floating / native tab bar so the last cards can scroll fully into view.
  const bottomPad = Math.max(insets.bottom, Platform.OS === "web" ? 34 : 12) + 96;

  return (
    <View style={[styles.screen, { paddingTop: Platform.OS !== "web" ? insets.top : 52 }]}>
      <View pointerEvents="none" style={styles.blobTR} />
      <View pointerEvents="none" style={styles.blobBL} />

      <RNScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces
        overScrollMode="always"
      >
        {/* ── Header ── */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greetingText}>Great work, keep it up!</Text>
            <Text style={styles.userNameText}>Champion 🎉</Text>
          </View>
          <View style={styles.topBarRight}>
            <View style={styles.streakPill}>
              <Text style={styles.streakText}>🔥 {displayStreakCount}d</Text>
            </View>
            {showClose && (
              <Pressable
                // Home tab is "(tabs)/dashboard" — first tab, welcome banner + Dex live here
                onPress={() => router.replace("/(tabs)/dashboard")}
                style={({ pressed }) => [styles.closeBtn, { opacity: pressed ? 0.85 : 1 }]}
                accessibilityRole="button"
                accessibilityLabel="Back to Home"
              >
                <Ionicons name="chevron-back" size={20} color={DARK} />
              </Pressable>
            )}
          </View>
        </View>

        {welcomeSkipped && debts.length === 0 && <WelcomeSetupBanner />}

        {streakDayBanner && (
          <Pressable
            onPress={() => router.push("/day-complete")}
            style={({ pressed }) => [styles.streakDayBanner, pressed && { opacity: 0.94 }]}
            accessibilityRole="button"
            accessibilityLabel="Complete your day for your streak"
          >
            <Text style={styles.streakDayBannerEmoji}>🔥</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.streakDayBannerTitle}>Complete your day</Text>
              <Text style={styles.streakDayBannerSub}>
                Tap here to wrap up today and keep your streak going. It only takes a moment.
              </Text>
            </View>
            <Text style={styles.streakDayBannerChev}>→</Text>
          </Pressable>
        )}

        {dayDoneBanner && (
          <View style={styles.dayDoneBanner} accessibilityRole="summary">
            <Text style={styles.dayDoneBannerEmoji}>🎉</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.dayDoneBannerTitle}>Well done - you completed today’s activities</Text>
              <Text style={styles.dayDoneBannerSub}>
                You wrapped up what matters for today. Come back tomorrow to keep your streak going.
              </Text>
            </View>
          </View>
        )}

        {!dayDoneBanner && !streakDayBanner && (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/day-complete");
            }}
            style={({ pressed }) => [styles.completeTodayCta, pressed && { opacity: 0.92 }]}
            accessibilityRole="button"
            accessibilityHint="Opens today’s wrap-up and streak check-in"
          >
            <Text style={styles.completeTodayCtaText}>{completeTodayCtaLabel}</Text>
            <Text style={styles.completeTodayCtaChev}>→</Text>
          </Pressable>
        )}

        {/* ── Dex + speech bubble ── */}
        <View style={styles.dexSection}>
          <View style={[styles.congratsBanner, styles.congratsBannerWell]}>
            <Text style={styles.congratsIcon}>🏅</Text>
            <Text style={[styles.congratsText, styles.congratsTextWell]}>{congratsMsg}</Text>
          </View>
          <View style={styles.speechBubble}>
            <Text style={styles.bubbleText}>{msg}</Text>
          </View>
          <View style={styles.dexWrap}>
            <View style={styles.dexShadow} />
            <DexCoin
              size={170}
              mood={DEX_SCREEN_MAP.homeOnTrack.mood}
              motion={DEX_SCREEN_MAP.homeOnTrack.motion}
            />
          </View>
        </View>

        {/* ── XP card (HTML-style) ── */}
        <View style={styles.xpCard}>
          <View style={styles.xpTop}>
            <View style={styles.lvlBadge}>
              <Text style={styles.lvlLbl}>LV</Text>
              <Text style={styles.lvlNum}>{level}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.xpTier}>{currentLevelDef.name}</Text>
              <Text style={styles.xpNext}>
                <Text style={{ color: "#7A4E00", fontFamily: Fonts.black }}>{Math.max(0, xpToNext).toLocaleString()} XP</Text>
                {" "}to next level
              </Text>
            </View>
          </View>
          <View style={styles.barWrap}>
            <Animated.View style={[styles.barFill, { width: barWidth }]}>
              <Animated.View
                pointerEvents="none"
                style={[styles.barShimmer, { transform: [{ translateX: shimmerX }] }]}
              >
                <LinearGradient
                  colors={["transparent", "rgba(255,255,255,0.50)", "transparent"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            </Animated.View>
          </View>
          <View style={styles.barLabels}>
            <Text style={styles.barLabelText}>{currentLevelDef.minXp.toLocaleString()} XP</Text>
            <Text style={styles.barLabelMid}>{Math.round(barPct)}% there 🏆</Text>
            <Text style={styles.barLabelText}>
              {currentLevelDef.maxXp != null ? `${currentLevelDef.maxXp.toLocaleString()} XP` : "MAX"}
            </Text>
          </View>
        </View>

        {/* ── Stats (2x2) ── */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statFire]}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statVal}>{displayStreakCount}d</Text>
            <Text style={[styles.statLbl, { color: "#991C1C" }]}>Current Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🏆</Text>
            <Text style={styles.statVal}>{longestStreak}d</Text>
            <Text style={styles.statLbl}>Best Streak</Text>
          </View>
          <View style={[styles.statCard, styles.statGold]}>
            <Text style={styles.statIcon}>⚡</Text>
            <Text style={styles.statVal}>{totalXp.toLocaleString()}</Text>
            <Text style={[styles.statLbl, { color: "#7A4E00" }]}>Total XP</Text>
          </View>
          <View style={[styles.statCard, styles.statGreen]}>
            <Text style={styles.statIcon}>💸</Text>
            <Text style={styles.statVal}>{fmt(interestSavedVsMinimums)}</Text>
            <Text style={[styles.statLbl, { color: "#135228" }]}>Projected interest saved</Text>
            <Text style={styles.statSub}>vs minimum payments</Text>
          </View>
        </View>

        {/* ── Dream goal ── */}
        <View style={styles.dreamCard}>
          <View style={styles.dreamIcon}>
            <Text style={{ fontSize: 24 }}>{dreamIcon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.dreamEyebrow}>Your Dream Goal</Text>
            <Text style={styles.dreamTitle} numberOfLines={2}>
              {effectiveGoalName || "Debt-free momentum"}
            </Text>
            <Text style={styles.dreamSub}>
              {effectiveGoalName
                ? dreamMonths > 0
                  ? `Keep saving to be debt-free in ${monthsText(debtMonths)} and ${effectiveGoalName} in ${monthsText(dreamMonths)}.`
                  : debtMonths > 0
                    ? `Keep saving to be debt-free in ${monthsText(debtMonths)} - then ${effectiveGoalName} is next.`
                    : `Keep saving and stay consistent - ${effectiveGoalName} is getting closer.`
                : debtMonths > 0
                  ? `Keep saving to get rid of debt in ${monthsText(debtMonths)}.`
                  : "Keep going - each payment brings your goals closer."}
            </Text>
          </View>
        </View>

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
              showsVerticalScrollIndicator={false}
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
      </RNScrollView>

      <SatisfactionFeedbackModal
        visible={satisfactionVisible}
        trigger="day1_complete"
        onClosed={() => setSatisfactionVisible(false)}
      />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },

  blobTR: {
    position: "absolute", top: -40, right: -40,
    width: 170, height: 170, borderRadius: 85,
    backgroundColor: "#D4C9A8", opacity: 0.45,
  },
  blobBL: {
    position: "absolute", bottom: 80, left: -50,
    width: 150, height: 150, borderRadius: 75,
    backgroundColor: "#D4C9A8", opacity: 0.35,
  },

  scrollContent: {
    paddingHorizontal: 22,
    alignItems: "center",
  },

  topBar: {
    width: "100%", flexDirection: "row",
    justifyContent: "space-between", alignItems: "center",
    marginBottom: 18, zIndex: 1,
  },
  topBarRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  appLabel: {
    fontSize: 12, fontFamily: Fonts.extraBold,
    fontWeight: "700", letterSpacing: 2.5,
    color: AMBER, textTransform: "uppercase",
  },
  greetingText: { fontSize: 15, fontFamily: Fonts.bold, color: MUTED },
  userNameText: { fontSize: 27, fontFamily: Fonts.black, color: DARK, lineHeight: 30 },
  streakPill: {
    backgroundColor: "#FFF3D0",
    borderColor: "#CC8000",
    borderWidth: 2,
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  streakText: {
    fontSize: 13, fontFamily: Fonts.bold, fontWeight: "700", color: "#7A4E00",
  },
  dexSection: { alignItems: "center", marginBottom: 18, zIndex: 1 },
  dexWrap: {
    position: "relative",
    width: 170,
    height: 182,
    alignItems: "center",
    justifyContent: "center",
  },
  dexShadow: {
    position: "absolute",
    bottom: 6,
    width: 110,
    height: 20,
    borderRadius: 20,
    backgroundColor: "rgba(170,100,0,.18)",
  },
  congratsBanner: {
    width: "100%",
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  /** White on deep brown for contrast (replaces gold-on-cream). */
  congratsBannerWell: {
    backgroundColor: "#5C3D24",
    borderColor: "#3D2718",
  },
  congratsIcon: { fontSize: 22 },
  congratsText: { flex: 1, fontSize: 13, fontFamily: Fonts.extraBold, lineHeight: 18 },
  congratsTextWell: { color: "#FFFFFF" },
  speechBubble: {
    backgroundColor: "#fff", borderRadius: 18,
    borderBottomLeftRadius: 4, paddingHorizontal: 16,
    paddingVertical: 13, maxWidth: 286, marginBottom: 12,
    shadowColor: "#643C0A", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1, shadowRadius: 14, elevation: 4,
  },
  bubbleText: {
    fontSize: 15, fontFamily: Fonts.semiBold,
    fontWeight: "600", color: "#111111",
    lineHeight: 22, textAlign: "center",
  },

  heroCard: {
    width: "100%", backgroundColor: DARK2, borderRadius: 24,
    padding: 20, paddingBottom: 18, marginBottom: 16,
    flexDirection: "row", alignItems: "center", gap: 16,
    overflow: "hidden", shadowColor: "#281400",
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2,
    shadowRadius: 28, elevation: 10, zIndex: 1,
  },
  heroCardGlow: {
    position: "absolute", top: -40, right: -40,
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: "rgba(217,160,69,0.12)",
  },
  levelBadge: {
    width: 66, height: 66, borderRadius: 18,
    backgroundColor: "rgba(217,160,69,0.18)",
    borderWidth: 1.5, borderColor: "rgba(217,160,69,0.4)",
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  lvIcon: { fontSize: 26, lineHeight: 30 },
  lvTag: {
    fontSize: 9, fontFamily: Fonts.extraBold, fontWeight: "700",
    letterSpacing: 1, color: "rgba(217,160,69,0.9)",
    textTransform: "uppercase", marginTop: 3,
  },
  heroLevelName: {
    fontFamily: Fonts.serif ?? Fonts.bold, fontSize: 22,
    fontWeight: "800", color: "#F5EFE0",
    lineHeight: 25, marginBottom: 2,
  },
  heroXpLabel: {
    fontSize: 13, fontFamily: Fonts.semiBold, fontWeight: "600",
    color: "rgba(255,255,255,0.88)", marginBottom: 9,
  },
  progressTrack: {
    backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 50,
    height: 8, width: "100%", overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: GOLD, borderRadius: 50 },
  progressMeta: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  metaText: {
    fontSize: 12, fontFamily: Fonts.semiBold, fontWeight: "600",
    color: "rgba(255,255,255,0.84)",
  },

  dreamCard: {
    width: "100%", backgroundColor: "#fff", borderRadius: 18,
    padding: 15, paddingHorizontal: 16, marginTop: 12, marginBottom: 16,
    flexDirection: "row", alignItems: "center", gap: 13,
    shadowColor: "#643C0A", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
    borderLeftWidth: 4, borderLeftColor: "#B87320", zIndex: 1,
  },
  dreamIcon: {
    width: 44, height: 44, borderRadius: 13, backgroundColor: "#F5F0E6",
    alignItems: "center", justifyContent: "center", flexShrink: 0,
    borderWidth: 1.5, borderColor: "rgba(180,140,80,0.2)",
  },
  dreamEyebrow: {
    fontSize: 11, fontFamily: Fonts.extraBold, fontWeight: "700",
    letterSpacing: 1.5, textTransform: "uppercase", color: AMBER, marginBottom: 2,
  },
  dreamTitle: {
    fontSize: 16, fontFamily: Fonts.bold, fontWeight: "700",
    color: DARK, lineHeight: 21,
  },
  dreamSub: { fontSize: 13, fontFamily: Fonts.semiBold, color: MUTED, marginTop: 2, lineHeight: 18 },

  xpCard: {
    width: "100%",
    marginTop: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 2.5,
    borderColor: "#A8967A",
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.13,
    shadowRadius: 22,
    elevation: 5,
  },
  xpTop: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 14 },
  lvlBadge: {
    width: 62,
    height: 62,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: "#CC8000",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFB820",
  },
  lvlLbl: { fontSize: 9, fontFamily: Fonts.extraBold, color: "#4A2800", letterSpacing: 1 },
  lvlNum: { fontSize: 28, fontFamily: Fonts.black, color: "#200E00", lineHeight: 30 },
  xpTier: { fontSize: 21, fontFamily: Fonts.black, color: "#18120A" },
  xpNext: { fontSize: 15, fontFamily: Fonts.bold, color: "#5C4620", marginTop: 1 },
  barWrap: {
    backgroundColor: "#EDE6D6",
    borderWidth: 2,
    borderColor: "#C8BBAA",
    borderRadius: 12,
    height: 16,
    overflow: "hidden",
    marginBottom: 9,
  },
  barFill: { height: "100%", backgroundColor: "#C07200", borderRadius: 12, overflow: "hidden" },
  barShimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "42%",
  },
  barLabels: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  barLabelText: { fontSize: 13, fontFamily: Fonts.bold, color: "#5C4620" },
  barLabelMid: { fontSize: 14, fontFamily: Fonts.black, color: "#7A4E00" },

  statsGrid: {
    width: "100%",
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    width: "48.5%",
    backgroundColor: "#FFFFFF",
    borderWidth: 2.5,
    borderColor: "#C8BBAA",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  statFire: { borderColor: "#991C1C", backgroundColor: "#FFE0DC" },
  statGold: { borderColor: "#CC8000", backgroundColor: "#FFF3D0" },
  statGreen: { borderColor: "#135228", backgroundColor: "#CCF0DA" },
  statIcon: { fontSize: 20, marginBottom: 3 },
  statVal: { fontSize: 27, fontFamily: Fonts.black, color: "#18120A", lineHeight: 30 },
  statLbl: { fontSize: 12, fontFamily: Fonts.extraBold, color: "#382808", marginTop: 4, textTransform: "uppercase" },
  statSub: { fontSize: 10, fontFamily: Fonts.semiBold, color: "#135228", marginTop: 2, textAlign: "center" },

  consultScroll: { paddingBottom: 8, gap: 12, paddingRight: 8 },
  consultCard: {
    width: 218,
    borderRadius: 20,
    borderWidth: 2.5,
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  consultIcon: { fontSize: 30, marginBottom: 8 },
  consultQ: { fontSize: 16, fontFamily: Fonts.black, color: "#18120A", lineHeight: 22, marginBottom: 6 },
  consultD: { fontSize: 13, fontFamily: Fonts.semiBold, color: "#382808", lineHeight: 18, marginBottom: 12 },
  consultBtn: { borderRadius: 12, paddingVertical: 10, alignItems: "center" },
  consultBtnText: { color: "#FFFFFF", fontSize: 14, fontFamily: Fonts.extraBold },

  // ── Progress card ────────────────────────────────────────────────
  progressCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "rgba(180,140,80,0.20)",
    shadowColor: "#643C0A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  progressGridRow: { flexDirection: "row", justifyContent: "space-between", gap: 10, marginBottom: 10 },
  progressStat: { flex: 1, alignItems: "flex-start" },
  progressStatVal: { fontSize: 16, fontFamily: Fonts.black, fontWeight: "900", color: DARK },
  progressStatLbl: { fontSize: 12, fontFamily: Fonts.semiBold, fontWeight: "700", color: MUTED, marginTop: 2 },

  streakDayBanner: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderRadius: 18,
    backgroundColor: "#3D0F00",
    borderWidth: 2,
    borderColor: "#FF8A3D",
    shadowColor: "#FF6B00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  streakDayBannerEmoji: { fontSize: 28 },
  streakDayBannerTitle: {
    fontSize: 17,
    fontFamily: Fonts.black,
    fontWeight: "900",
    color: "#FFF8F0",
    marginBottom: 4,
  },
  streakDayBannerSub: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    fontWeight: "600",
    color: "rgba(255,248,240,0.88)",
    lineHeight: 19,
  },
  streakDayBannerChev: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: "#FFB86C",
  },

  dayDoneBanner: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderRadius: 18,
    backgroundColor: "#135228",
    borderWidth: 2,
    borderColor: "#0D3D1C",
    shadowColor: "#135228",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  dayDoneBannerEmoji: { fontSize: 28 },
  dayDoneBannerTitle: {
    fontSize: 17,
    fontFamily: Fonts.black,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  dayDoneBannerSub: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    fontWeight: "600",
    color: "rgba(255,255,255,0.92)",
    lineHeight: 19,
  },

  completeTodayCta: {
    width: "100%",
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    paddingHorizontal: 22,
    marginBottom: 14,
    borderRadius: 18,
    backgroundColor: "#2C7A43",
    borderWidth: 2,
    borderColor: "#1F5A30",
    shadowColor: "#135228",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
  },
  completeTodayCtaText: {
    fontSize: 18,
    fontFamily: Fonts.black,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    flexShrink: 1,
  },
  completeTodayCtaChev: {
    fontSize: 20,
    fontFamily: Fonts.black,
    color: "#FFFFFF",
  },

  sectionLabel: {
    width: "100%", fontSize: 12, fontFamily: Fonts.extraBold,
    fontWeight: "700", letterSpacing: 2, textTransform: "uppercase",
    color: AMBER, marginBottom: 6, zIndex: 1,
  },
  sectionSub: {
    width: "100%",
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    fontWeight: "600",
    color: "#382808",
    lineHeight: 19,
    marginBottom: 10,
    zIndex: 1,
  },
  levelsList: { width: "100%", gap: 9, marginBottom: 24, zIndex: 1 },
  levelRow: {
    backgroundColor: "#fff", borderRadius: 15, padding: 12,
    paddingHorizontal: 14, flexDirection: "row", alignItems: "center",
    gap: 13, shadowColor: "#643C0A", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2, position: "relative",
  },
  levelRowCurrent: {
    borderWidth: 2, borderColor: GOLD,
    shadowColor: "#B47820", shadowOpacity: 0.14, shadowRadius: 16, elevation: 6,
  },
  levelRowLocked: { opacity: 0.5 },

  currentTag: {
    position: "absolute", top: -9, left: 14,
    backgroundColor: DARK2, borderRadius: 50,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  currentTagText: {
    fontSize: 9, fontFamily: Fonts.extraBold, fontWeight: "700",
    letterSpacing: 1.5, textTransform: "uppercase", color: "#F5EFE0",
  },
  lvIconWrap: {
    width: 44, height: 44, borderRadius: 13, backgroundColor: "#F5F0E6",
    alignItems: "center", justifyContent: "center", flexShrink: 0,
    borderWidth: 1.5, borderColor: "rgba(180,140,80,0.15)",
  },
  lvIconWrapCurrent: { backgroundColor: GOLD2, borderWidth: 0 },
  lvName: {
    fontSize: 15, fontFamily: Fonts.bold, fontWeight: "700",
    color: DARK, lineHeight: 19,
  },
  lvRange: {
    fontSize: 13, fontFamily: Fonts.semiBold, fontWeight: "500",
    color: MUTED, marginTop: 1,
  },
  lvRight: { flexShrink: 0, alignItems: "flex-end" },
  badgeCurrent: { backgroundColor: GOLD, borderRadius: 50, paddingHorizontal: 10, paddingVertical: 4 },
  badgeCurrentText: {
    fontSize: 10, fontFamily: Fonts.extraBold, fontWeight: "700",
    letterSpacing: 1, textTransform: "uppercase", color: "#fff",
  },

});


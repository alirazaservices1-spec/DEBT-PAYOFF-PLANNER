import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  Dimensions,
  BackHandler,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useGame } from "@/context/GameContext";
import { useDebts } from "@/context/DebtContext";
import { Fonts } from "@/constants/fonts";
import { XP_REWARDS } from "@/context/GameContext";
import { DexCoin } from "@/components/DexCoin";
import { DEX_SCREEN_MAP } from "@/constants/dexScreenMap";
import {
  markDayCompleteAcknowledgedToday,
  setHomeWrappedFeedbackPending,
} from "@/lib/dayCompleteGate";
import { scheduleNextDayActivitiesReminderAfterAck } from "@/lib/dayActivitiesReminder";
import { useStreakReminder } from "@/context/StreakReminderContext";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_W } = Dimensions.get("window");

/** Match onboarding intro / strategy CTAs: warm cream + blue primary + purple accent (custom-order chip in flow). */
const BG = "#F7F2EA";
const BLUE_DEEP = "#0D5BAE";
/** Brighter blue from primary onboarding buttons — reads more “win / celebration”. */
const BLUE_BRIGHT = "#1F7AE0";
const BLUE_VIVID = "#2563EB";
const PURPLE = "#7C3AED";
const PURPLE_SOFT = "#8B5CF6";
const DARK = "#1A0A00";
const MUTED = "#3D2200";
const CARD_BORDER = "#E0D8CE";
const LABEL_ACCENT = "#1F7AE0";

// Note: we intentionally use the shared `DexMascot` icon everywhere now
// so the bear stays visually consistent across screens.


const CONFETTI = [
  { leftPct: 0.12, topPx: 30, color: BLUE_VIVID, w: 9, h: 9, dur: 1400, delay: 300 },
  { leftPct: 0.25, topPx: 12, color: BLUE_BRIGHT, w: 7, h: 12, dur: 1600, delay: 500 },
  { leftPct: 0.45, topPx: 0, color: "#60A5FA", w: 9, h: 9, dur: 1300, delay: 200 },
  { leftPct: 0.62, topPx: 18, color: PURPLE, w: 9, h: 9, dur: 1700, delay: 600 },
  { leftPct: 0.78, topPx: 6, color: "#3B82F6", w: 6, h: 11, dur: 1500, delay: 400 },
  { leftPct: 0.88, topPx: 24, color: PURPLE_SOFT, w: 9, h: 9, dur: 1200, delay: 700 },
  { leftPct: 0.35, topPx: 36, color: "#93C5FD", w: 8, h: 8, dur: 1800, delay: 350 },
  { leftPct: 0.55, topPx: 12, color: "#A78BFA", w: 5, h: 10, dur: 1400, delay: 550 },
];

function ConfettiPiece({ leftPct, topPx, color, w, h, dur, delay }: typeof CONFETTI[0]) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: dur,
      delay,
      useNativeDriver: true,
      easing: Easing.linear,
    }).start();
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 120] });
  const rotate     = anim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "720deg"] });
  const opacity    = anim.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 1, 0] });

  return (
    <View
      pointerEvents="none"
      style={{ position: "absolute", left: SCREEN_W * leftPct, top: topPx, width: w, height: h }}
    >
      <Animated.View
        style={{
          width: w, height: h,
          borderRadius: 2,
          backgroundColor: color,
          transform: [{ translateY }, { rotate }],
          opacity,
        }}
      />
    </View>
  );
}

export default function DayCompleteScreen() {
  const insets = useSafeAreaInsets();
  const { totalXp, streakCount } = useGame();
  const { streakReminderEnabled } = useStreakReminder();
  const { extraPayment } = useDebts();

  // Onboarding picks an "extra per day" value; we store it as monthly extraPayment.
  // Convert back so the Day Complete screen can confirm the expectation clearly.
  const extraPerDay = extraPayment > 0 ? extraPayment / 30.44 : 0;
  // Snap to slider steps (0.50 increments) when deriving display from stored monthly extra.
  const extraPerDaySnapped = extraPerDay > 0 ? Math.round(extraPerDay * 2) / 2 : 0;
  const extraPerDayDisplay = extraPerDaySnapped > 0 ? extraPerDaySnapped.toFixed(2) : null;

  const { closeTo, debtId } = useLocalSearchParams<{
    closeTo?: string;
    debtId?: string;
  }>();

  const handleSeeTomorrow = async () => {
    try {
      await markDayCompleteAcknowledgedToday();
      await scheduleNextDayActivitiesReminderAfterAck(
        streakCount,
        streakReminderEnabled
      );
      // Client request: force quit the app when they tap.
      // Note: web can't truly "exit app", so we fall back to the home tab.
      if (Platform.OS !== "web") {
        BackHandler.exitApp();
        return;
      }

      await setHomeWrappedFeedbackPending("success");
      router.replace("/(tabs)/dashboard");
    } catch {
      await setHomeWrappedFeedbackPending("error");
      router.replace("/(tabs)/dashboard");
    }
  };

  const badgeAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const cardAnim  = useRef(new Animated.Value(0)).current;
  const xpAnim    = useRef(new Animated.Value(0)).current;
  const star1Anim = useRef(new Animated.Value(0)).current;
  const star2Anim = useRef(new Animated.Value(0)).current;
  const star3Anim = useRef(new Animated.Value(0)).current;
  const ctaAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fadeUp = (anim: Animated.Value, delay: number) =>
      Animated.timing(anim, { toValue: 1, duration: 400, delay, useNativeDriver: true, easing: Easing.out(Easing.cubic) });

    const popIn = (anim: Animated.Value, delay: number) =>
      Animated.spring(anim, { toValue: 1, delay, useNativeDriver: true, damping: 10, stiffness: 200 });

    Animated.parallel([
      fadeUp(badgeAnim, 350),
      fadeUp(titleAnim, 450),
      popIn(cardAnim, 600),
      popIn(xpAnim, 700),
      popIn(star1Anim, 750),
      popIn(star2Anim, 900),
      popIn(star3Anim, 1050),
      fadeUp(ctaAnim, 1100),
    ]).start();
  }, []);

  const xpEarned = XP_REWARDS.LOG_PAYMENT + XP_REWARDS.DAILY_STREAK;
  const streakForDisplay = Math.max(streakCount, 1);

  return (
    <View style={styles.screen}>
      <View style={styles.blobTR} />
      <View style={styles.blobBL} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled"
        bounces
      >
      <Text style={styles.label}>DEBT-FREE APP</Text>

      <View style={styles.dexWrap}>
        <DexCoin size={120} mood={DEX_SCREEN_MAP.dayComplete.mood} motion={DEX_SCREEN_MAP.dayComplete.motion} />
      </View>

      <Animated.View style={[styles.congratsBadgeWrap, { opacity: badgeAnim, transform: [{ scale: badgeAnim }] }]}>
        <LinearGradient colors={[BLUE_BRIGHT, BLUE_DEEP, PURPLE]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.congratsBadge}>
          <Text style={styles.congratsText}>🎉 Day complete!</Text>
        </LinearGradient>
      </Animated.View>

      <Animated.Text style={[styles.heading, { opacity: titleAnim, transform: [{ translateY: titleAnim.interpolate({ inputRange: [0,1], outputRange: [18, 0] }) }] }]}>
        You crushed it{" "}
        <Text style={styles.headingEm}>today!</Text>
      </Animated.Text>

      <Animated.Text style={[styles.subtitle, { opacity: titleAnim, transform: [{ translateY: titleAnim.interpolate({ inputRange: [0,1], outputRange: [18, 0] }) }] }]}>
        Every day you show up, your debt-free date gets closer. Keep it going.
      </Animated.Text>

      <Animated.View style={[styles.stars, { opacity: star1Anim }]}>
        <Animated.View style={[styles.starWrap, { transform: [{ scale: star1Anim }] }]}>
          <Ionicons name="star" size={30} color={BLUE_VIVID} />
        </Animated.View>
        <Animated.View style={[styles.starWrap, { transform: [{ scale: star2Anim }] }]}>
          <Ionicons name="star" size={30} color={PURPLE} />
        </Animated.View>
        <Animated.View style={[styles.starWrap, { transform: [{ scale: star3Anim }] }]}>
          <Ionicons name="star" size={30} color={BLUE_BRIGHT} />
        </Animated.View>
      </Animated.View>

      <Animated.View style={[styles.pointsCard, { opacity: cardAnim, transform: [{ scale: cardAnim }] }]}>
        <View style={styles.pointsRow}>
          <View style={styles.pointsLabel}>
            <View style={styles.pointsIcon}><Text style={{ fontSize: 17 }}>✅</Text></View>
            <Text style={styles.pointsLabelText}>Payment logged</Text>
          </View>
          <Text style={styles.pointsVal}>+{XP_REWARDS.LOG_PAYMENT} XP</Text>
        </View>

        {!!extraPerDayDisplay && (
          <View style={styles.pointsRow}>
            <View style={styles.pointsLabel}>
              <View style={styles.pointsIcon}><Text style={{ fontSize: 17 }}>➕</Text></View>
              <Text style={styles.pointsLabelText}>Extra per day</Text>
            </View>
            <Text style={styles.extraPerDayVal}>+${extraPerDayDisplay}/day</Text>
          </View>
        )}

        <View style={styles.pointsRow}>
          <View style={styles.pointsLabel}>
            <View style={styles.pointsIcon}><Text style={{ fontSize: 17 }}>🔥</Text></View>
            <Text style={styles.pointsLabelText}>Streak bonus</Text>
          </View>
          <Text style={styles.pointsVal}>+{XP_REWARDS.DAILY_STREAK} XP</Text>
        </View>
        <View style={[styles.pointsRow, { borderBottomWidth: 0 }]}>
          <View style={styles.pointsLabel}>
            <View style={styles.pointsIcon}><Text style={{ fontSize: 17 }}>📅</Text></View>
            <Text style={styles.pointsLabelText}>Showed up today</Text>
          </View>
          <Text style={styles.pointsVal}>+10 XP</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.xpTotalWrap, { opacity: xpAnim, transform: [{ scale: xpAnim }] }]}>
        <View style={styles.xpTotalOuter}>
          <LinearGradient
            colors={["#E8F1FF", "#DBEAFE", "#EDE9FE"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.xpTotal}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.xpLabel}>Total XP earned</Text>
              <Text style={styles.xpNumber}>
                {totalXp.toLocaleString()}{" "}
                <Text style={styles.xpNumberUnit}>XP</Text>
              </Text>
            </View>
            <View style={styles.xpStreak}>
              <Text style={styles.xpStreakNum}>🔥 {streakForDisplay}</Text>
              <Text style={styles.xpStreakLabel}>Day streak</Text>
            </View>
          </LinearGradient>
        </View>
      </Animated.View>

      <Animated.View style={[{ width: "100%", opacity: ctaAnim, transform: [{ translateY: ctaAnim.interpolate({ inputRange: [0,1], outputRange: [18, 0] }) }] }]}>
        <Pressable onPress={handleSeeTomorrow} accessibilityRole="button" style={styles.ctaPressable}>
          <LinearGradient colors={[BLUE_BRIGHT, BLUE_DEEP, PURPLE]} start={{ x: 0.13, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cta}>
            <Text style={styles.ctaText}>See you tomorrow 👋</Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          style={styles.secondaryLink}
          onPress={async () => {
            try {
              await markDayCompleteAcknowledgedToday();
              await scheduleNextDayActivitiesReminderAfterAck(
                streakCount,
                streakReminderEnabled
              );
              await setHomeWrappedFeedbackPending("success");
              router.replace("/(tabs)/dashboard");
            } catch {
              await setHomeWrappedFeedbackPending("error");
              router.replace("/(tabs)/dashboard");
            }
          }}
          accessibilityRole="button"
        >
          <Text style={styles.secondaryLinkText}>Go to main menu</Text>
        </Pressable>

      </Animated.View>
      </ScrollView>

      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {CONFETTI.map((c, i) => (
          <ConfettiPiece key={i} {...c} />
        ))}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
    overflow: "hidden",
  },
  scroll: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  blobTR: {
    position: "absolute", top: -40, right: -40,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: "rgba(37, 99, 235, 0.18)",
    pointerEvents: "none",
  },
  blobBL: {
    position: "absolute", bottom: -50, left: -50,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: "rgba(124, 58, 237, 0.14)",
    pointerEvents: "none",
  },
  label: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    letterSpacing: 2.5,
    color: LABEL_ACCENT,
    textTransform: "uppercase",
    marginBottom: 18,
    textAlign: "center",
  },
  dexWrap: { marginBottom: 18 },
  congratsBadgeWrap: {
    marginBottom: 14,
    borderRadius: 50,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 16,
    elevation: 6,
  },
  congratsBadge: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 50,
  },
  congratsText: {
    fontSize: 12,
    fontFamily: Fonts.extraBold,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: "#FFFFFF",
    textAlign: "center",
  },
  heading: {
    fontFamily: Fonts.serif,
    fontSize: 30,
    color: DARK,
    lineHeight: 36,
    textAlign: "center",
    marginBottom: 8,
  },
  headingEm: { color: BLUE_VIVID, fontStyle: "italic" as const },
  subtitle: {
    fontSize: 14.5, fontFamily: Fonts.semiBold,
    color: MUTED, textAlign: "center",
    lineHeight: 23, marginBottom: 22,
  },
  stars: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 22,
  },
  starWrap: {
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  pointsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 2,
    borderColor: CARD_BORDER,
    paddingVertical: 6,
    paddingHorizontal: 20,
    width: "100%",
    shadowColor: "#1A6FC4",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 18,
  },
  pointsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(224,216,206,0.9)",
  },
  pointsLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pointsIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(26,111,196,0.2)",
  },
  pointsLabelText: {
    fontSize: 14, fontFamily: Fonts.semiBold,
    color: MUTED,
  },
  pointsVal: {
    fontSize: 16,
    fontFamily: Fonts.extraBold,
    color: BLUE_VIVID,
  },
  extraPerDayVal: {
    fontSize: 16,
    fontFamily: Fonts.extraBold,
    color: PURPLE,
  },
  xpTotalWrap: { width: "100%", marginBottom: 24 },
  xpTotalOuter: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(37, 99, 235, 0.45)",
    shadowColor: PURPLE,
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 22,
    elevation: 8,
  },
  xpTotal: {
    borderRadius: 18,
    padding: 18,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  xpLabel: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: "#4338CA",
    marginBottom: 4,
  },
  xpNumber: {
    fontFamily: Fonts.serif,
    fontSize: 38,
    color: "#1E3A5F",
    lineHeight: 42,
  },
  xpNumberUnit: {
    fontSize: 18,
    fontFamily: Fonts.extraBold,
    color: PURPLE,
  },
  xpStreak: { alignItems: "flex-end" },
  xpStreakNum: {
    fontFamily: Fonts.serif,
    fontSize: 30,
    color: "#1E3A5F",
    lineHeight: 34,
  },
  xpStreakLabel: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: "#5B21B6",
    marginTop: 3,
  },
  ctaPressable: {
    width: "100%",
    borderRadius: 50,
    overflow: "hidden",
    shadowColor: PURPLE,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 24,
    elevation: 8,
  },
  cta: {
    width: "100%",
    borderRadius: 50,
    paddingVertical: 18,
    alignItems: "center",
  },
  ctaText: {
    fontSize: 17,
    fontFamily: Fonts.extraBold,
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  secondaryLink: {
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 2,
  },
  secondaryLinkText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: PURPLE,
    textDecorationLine: "underline",
  },
});

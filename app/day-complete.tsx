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
} from "@/lib/dayCompleteGate";
import { scheduleNextDayActivitiesReminderAfterAck } from "@/lib/dayActivitiesReminder";
import { useStreakReminder } from "@/context/StreakReminderContext";

const { width: SCREEN_W } = Dimensions.get("window");

const BG    = "#EDE8DC";
const DARK  = "#1C0F00";
const DARK2 = "#3D2200";
const GOLD  = "#D9A045";
const GOLD2 = "#C8882A";
// Per design request: any brown text on beige -> black.
const AMBER = "#111111";
const MUTED = "#111111";

// Note: we intentionally use the shared `DexMascot` icon everywhere now
// so the bear stays visually consistent across screens.


const CONFETTI = [
  { leftPct: 0.12, topPx: 30,  color: GOLD,      w: 9,  h: 9,  dur: 1400, delay: 300  },
  { leftPct: 0.25, topPx: 12,  color: GOLD2,     w: 7,  h: 12, dur: 1600, delay: 500  },
  { leftPct: 0.45, topPx: 0,   color: "#B87320", w: 9,  h: 9,  dur: 1300, delay: 200  },
  { leftPct: 0.62, topPx: 18,  color: "#E8C270", w: 9,  h: 9,  dur: 1700, delay: 600  },
  { leftPct: 0.78, topPx: 6,   color: GOLD2,     w: 6,  h: 11, dur: 1500, delay: 400  },
  { leftPct: 0.88, topPx: 24,  color: GOLD,      w: 9,  h: 9,  dur: 1200, delay: 700  },
  { leftPct: 0.35, topPx: 36,  color: "#8B5E20", w: 8,  h: 8,  dur: 1800, delay: 350  },
  { leftPct: 0.55, topPx: 12,  color: "#E8C270", w: 5,  h: 10, dur: 1400, delay: 550  },
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
  // Snap back to the onboarding step (0.50) to avoid round-trip drift.
  const extraPerDaySnapped = extraPerDay > 0 ? Math.round(extraPerDay * 2) / 2 : 0;
  const extraPerDayDisplay = extraPerDaySnapped > 0 ? extraPerDaySnapped.toFixed(2) : null;

  const { closeTo, debtId } = useLocalSearchParams<{
    closeTo?: string;
    debtId?: string;
  }>();

  const handleSeeTomorrow = async () => {
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

    // Web fallback: keep behavior predictable.
    router.replace("/(tabs)/dashboard");
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

      <Animated.View style={[styles.congratsBadge, { opacity: badgeAnim, transform: [{ scale: badgeAnim }] }]}>
        <Text style={styles.congratsText}>🎉 Day Complete!</Text>
      </Animated.View>

      <Animated.Text style={[styles.heading, { opacity: titleAnim, transform: [{ translateY: titleAnim.interpolate({ inputRange: [0,1], outputRange: [18, 0] }) }] }]}>
        You crushed it{" "}
        <Text style={styles.headingEm}>today!</Text>
      </Animated.Text>

      <Animated.Text style={[styles.subtitle, { opacity: titleAnim, transform: [{ translateY: titleAnim.interpolate({ inputRange: [0,1], outputRange: [18, 0] }) }] }]}>
        Every day you show up, your debt-free date gets closer. Keep it going.
      </Animated.Text>

      <Animated.View style={[styles.stars, { opacity: star1Anim }]}>
        <Animated.Text style={[styles.star, { transform: [{ scale: star1Anim }] }]}>⭐</Animated.Text>
        <Animated.Text style={[styles.star, { transform: [{ scale: star2Anim }] }]}>⭐</Animated.Text>
        <Animated.Text style={[styles.star, { transform: [{ scale: star3Anim }] }]}>⭐</Animated.Text>
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
        <LinearGradient
          colors={["#C8882A", "#D9A045", "#B87320"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.xpTotal}
        >
          <View>
            <Text style={styles.xpLabel}>Total XP Earned</Text>
            <Text style={styles.xpNumber}>
              {totalXp.toLocaleString()}{" "}
              <Text style={styles.xpNumberUnit}>XP</Text>
            </Text>
          </View>
          <View style={styles.xpStreak}>
            <Text style={styles.xpStreakNum}>🔥 {streakForDisplay}</Text>
            <Text style={styles.xpStreakLabel}>Day Streak</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      <View style={styles.previewCard}>
        <Text style={styles.previewTitle}>What Day 2, 3, 4 look like</Text>
        <View style={styles.previewRow}>
          <View style={styles.previewPill}><Text style={styles.previewPillText}>Day 2</Text></View>
          <Text style={styles.previewCopy}>🔥 Streak: {streakForDisplay + 1} days</Text>
        </View>
        <View style={styles.previewRow}>
          <View style={styles.previewPill}><Text style={styles.previewPillText}>Day 3</Text></View>
          <Text style={styles.previewCopy}>🔥 Streak: {streakForDisplay + 2} days</Text>
        </View>
        <View style={[styles.previewRow, { marginBottom: 0 }]}>
          <View style={styles.previewPill}><Text style={styles.previewPillText}>Day 4</Text></View>
          <Text style={styles.previewCopy}>🔥 Streak: {streakForDisplay + 3} days</Text>
        </View>
      </View>

      <Animated.View style={[{ width: "100%", opacity: ctaAnim, transform: [{ translateY: ctaAnim.interpolate({ inputRange: [0,1], outputRange: [18, 0] }) }] }]}>
        <Pressable
          style={styles.cta}
          onPress={handleSeeTomorrow}
          accessibilityRole="button"
        >
          <Text style={styles.ctaText}>See you tomorrow 👋</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryLink}
          onPress={async () => {
            await markDayCompleteAcknowledgedToday();
            await scheduleNextDayActivitiesReminderAfterAck(
              streakCount,
              streakReminderEnabled
            );
            router.replace("/(tabs)/dashboard");
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
    backgroundColor: "#D4C9A8", opacity: 0.45,
    pointerEvents: "none",
  },
  blobBL: {
    position: "absolute", bottom: -50, left: -50,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: "#D4C9A8", opacity: 0.4,
    pointerEvents: "none",
  },
  label: {
    fontSize: 11, fontFamily: Fonts.bold,
    letterSpacing: 2.5, color: AMBER,
    textTransform: "uppercase", marginBottom: 18,
    textAlign: "center",
  },
  dexWrap: { marginBottom: 18 },
  congratsBadge: {
    backgroundColor: DARK2,
    paddingVertical: 6, paddingHorizontal: 16,
    borderRadius: 50, marginBottom: 14,
  },
  congratsText: {
    fontSize: 12, fontFamily: Fonts.bold,
    letterSpacing: 1.5, textTransform: "uppercase",
    color: "#F5EFE0",
  },
  heading: {
    fontFamily: Fonts.serif,
    fontSize: 30,
    color: DARK,
    lineHeight: 36,
    textAlign: "center",
    marginBottom: 8,
  },
  headingEm: { color: "#B87320" },
  subtitle: {
    fontSize: 14.5, fontFamily: Fonts.semiBold,
    color: MUTED, textAlign: "center",
    lineHeight: 23, marginBottom: 22,
  },
  stars: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginBottom: 22,
  },
  star: { fontSize: 32 },
  pointsCard: {
    backgroundColor: "#F5F0E6",
    borderRadius: 22,
    paddingVertical: 6,
    paddingHorizontal: 24,
    width: "100%",
    shadowColor: "#64330A",
    shadowOpacity: 0.09,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 18,
  },
  pointsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(180,140,90,0.15)",
  },
  pointsLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pointsIcon: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: BG,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(180,140,80,0.2)",
  },
  pointsLabelText: {
    fontSize: 14, fontFamily: Fonts.semiBold,
    color: MUTED,
  },
  pointsVal: {
    fontSize: 16, fontFamily: Fonts.bold,
    color: "#B87320",
  },
  extraPerDayVal: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: "#1A6FC4",
  },
  xpTotalWrap: { width: "100%", marginBottom: 24 },
  xpTotal: {
    borderRadius: 18,
    padding: 18,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#B4781E",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 8,
  },
  xpLabel: {
    fontSize: 11, fontFamily: Fonts.bold,
    letterSpacing: 1.8, textTransform: "uppercase",
    color: "#FFFFFF", marginBottom: 4,
    textShadowColor: "rgba(0,0,0,0.18)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  xpNumber: {
    fontFamily: Fonts.serif,
    fontSize: 38, color: "#FFFFFF", lineHeight: 42,
  },
  xpNumberUnit: {
    fontSize: 18, fontFamily: Fonts.bold, opacity: 1,
  },
  xpStreak: { alignItems: "flex-end" },
  xpStreakNum: {
    fontFamily: Fonts.serif,
    fontSize: 30, color: "#FFFFFF", lineHeight: 34,
  },
  xpStreakLabel: {
    fontSize: 11, fontFamily: Fonts.bold,
    letterSpacing: 1.5, textTransform: "uppercase",
    color: "#FFFFFF", marginTop: 3,
    textShadowColor: "rgba(0,0,0,0.18)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  previewCard: {
    width: "100%",
    backgroundColor: "#F5F0E6",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(180,140,90,0.2)",
    padding: 14,
    marginBottom: 18,
  },
  previewTitle: {
    fontSize: 12,
    fontFamily: Fonts.extraBold,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: "#111111",
    marginBottom: 10,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  previewPill: {
    minWidth: 56,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: "rgba(26,111,196,0.12)",
    alignItems: "center",
  },
  previewPillText: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: "#1A6FC4",
  },
  previewCopy: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: "#111111",
  },
  cta: {
    width: "100%",
    backgroundColor: DARK2,
    borderRadius: 50,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: DARK2,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  ctaText: {
    fontSize: 17, fontFamily: Fonts.bold,
    color: "#F5EFE0", letterSpacing: 0.2,
  },
  secondaryLink: {
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 2,
  },
  secondaryLinkText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: MUTED,
    textDecorationLine: "underline",
  },
});

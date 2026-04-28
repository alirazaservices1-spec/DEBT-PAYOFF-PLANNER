import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Easing,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useGame } from "@/context/GameContext";
import { useGoal } from "@/context/GoalContext";
import { Fonts } from "@/constants/fonts";
import { LEVELS_DATA, getLevelDef, formatXpRange } from "@/constants/levelsData";
import { DexCoin } from "@/components/DexCoin";
import { DEX_SCREEN_MAP } from "@/constants/dexScreenMap";

const BG      = "#EDE8DC";
const DARK    = "#1C0F00";
const DARK2   = "#000000";
const GOLD    = "#D9A045";
const GOLD2   = "#C8882A";
const MUTED   = "#000000";
const WHITE   = "#FFFFFF";
const AMBER   = "#000000";


export default function LevelsScreen() {
  const insets = useSafeAreaInsets();
  const { level, totalXp, currentLevelXp, nextLevelXp, progress, streakCount } = useGame();
  const { goalName, hasGoal } = useGoal();

  const currentDef = getLevelDef(level);
  const nextDef = LEVELS_DATA[Math.min(level, LEVELS_DATA.length - 1)];
  const xpToNext = nextLevelXp - currentLevelXp;
  const fillPct = Math.max(0, Math.min(1, progress));

  const dexFloatAnim = useRef(new Animated.Value(0)).current;
  const barWidthAnim = useRef(new Animated.Value(0)).current;
  const heroScaleAnim = useRef(new Animated.Value(0.85)).current;
  const heroOpacAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dexFloatAnim, { toValue: -6, duration: 1500, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(dexFloatAnim, { toValue: 0, duration: 1500, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    ).start();

    Animated.parallel([
      Animated.timing(heroScaleAnim, { toValue: 1, duration: 550, delay: 100, useNativeDriver: true, easing: Easing.out(Easing.back(1.5)) }),
      Animated.timing(heroOpacAnim, { toValue: 1, duration: 400, delay: 100, useNativeDriver: true }),
      Animated.timing(barWidthAnim, { toValue: fillPct, duration: 1200, delay: 800, useNativeDriver: false, easing: Easing.out(Easing.cubic) }),
    ]).start();
  }, [fillPct]);

  const barWidthPct = barWidthAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.blobTR} />
      <View style={styles.blobBL} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageLabel}>YOUR PROGRESS</Text>

        <Animated.View style={{ transform: [{ translateY: dexFloatAnim }], marginBottom: 14 }}>
          <DexCoin size={90} mood={DEX_SCREEN_MAP.levelsHero.mood} motion={DEX_SCREEN_MAP.levelsHero.motion} />
        </Animated.View>

        <Animated.View style={[styles.heroCardWrap, { transform: [{ scale: heroScaleAnim }], opacity: heroOpacAnim }]}>
          <LinearGradient
            colors={["#C8882A", "#D9A045", "#B87320"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroCardInner}>
              <View style={styles.levelBadgeBig}>
                <Text style={styles.lvBadgeIcon}>{currentDef.icon}</Text>
                <Text style={styles.lvBadgeTag}>Lv {level}</Text>
              </View>
              <View style={styles.heroRight}>
                <Text style={styles.heroLevelName}>{currentDef.name}</Text>
                <Text style={styles.heroXpLabel}>
                  {totalXp.toLocaleString()} XP · {xpToNext.toLocaleString()} to next level
                </Text>
                <View style={styles.progressTrack}>
                  <Animated.View style={[styles.progressFill, { width: barWidthPct }]} />
                </View>
                <View style={styles.progressMeta}>
                  <Text style={styles.progressMetaText}>{currentDef.minXp.toLocaleString()} XP</Text>
                  <Text style={styles.progressMetaText}>{Math.round(fillPct * 100)}%</Text>
                  <Text style={styles.progressMetaText}>
                    {nextDef?.minXp != null ? nextDef.minXp.toLocaleString() : "MAX"} XP
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {hasGoal && (
          <View style={styles.dreamBanner}>
            <View style={styles.dreamIconWrap}>
              <Text style={{ fontSize: 26 }}>🎯</Text>
            </View>
            <View style={styles.dreamTextWrap}>
              <Text style={styles.dreamEyebrow}>Your Dream Goal</Text>
              <Text style={styles.dreamTitle}>{goalName}</Text>
              <Text style={styles.dreamSub}>Stay consistent - you're on track to unlock it!</Text>
            </View>
          </View>
        )}

        <Text style={styles.sectionLabel}>All Levels</Text>

        <View style={styles.levelsList}>
          {LEVELS_DATA.map((def, idx) => {
            const isDone    = level > def.level;
            const isCurrent = level === def.level;
            const isLocked  = level < def.level;

            return (
              <View
                key={def.level}
                style={[
                  styles.levelRow,
                  isCurrent && styles.levelRowCurrent,
                  isLocked  && styles.levelRowLocked,
                ]}
              >
                {isCurrent && (
                  <View style={styles.currentTag}>
                    <Text style={styles.currentTagText}>YOU ARE HERE</Text>
                  </View>
                )}
                <View style={[styles.lvIconWrap, isCurrent && styles.lvIconWrapCurrent]}>
                  <Text style={{ fontSize: 22 }}>{def.icon}</Text>
                </View>
                <View style={styles.lvInfo}>
                  <Text style={styles.lvName}>{def.name}</Text>
                  <Text style={styles.lvRange}>{formatXpRange(def)}</Text>
                </View>
                <View style={styles.lvRight}>
                  {isDone    && <Text style={{ fontSize: 18 }}>✅</Text>}
                  {isCurrent && (
                    <View style={styles.inProgressBadge}>
                      <Text style={styles.inProgressText}>IN PROGRESS</Text>
                    </View>
                  )}
                  {isLocked  && <Text style={{ fontSize: 18, opacity: 0.45 }}>🔒</Text>}
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.nudgeCard}>
          <Animated.View style={[styles.nudgeDex, { transform: [{ translateY: dexFloatAnim }] }]}>
            <DexCoin size={52} mood={DEX_SCREEN_MAP.levelsNudge.mood} motion={DEX_SCREEN_MAP.levelsNudge.motion} />
          </Animated.View>
          <View style={styles.nudgeText}>
            <Text style={styles.nudgeHead}>
              Just{" "}
              <Text style={styles.nudgeHeadEm}>
                {xpToNext > 0 ? `${xpToNext.toLocaleString()} more XP` : "one more payment"}
              </Text>{" "}
              to {nextDef?.name ?? "Debt-Free Legend"}!
            </Text>
            <Text style={styles.nudgeBody}>
              Log a payment every day this week and you'll unlock it before the weekend.
              {hasGoal ? ` Your ${goalName} dream is counting on you! 🎯` : " Keep pushing forward! 💪"}
            </Text>
          </View>
        </View>

        <Pressable style={styles.cta} onPress={() => router.back()} accessibilityRole="button">
          <Text style={styles.ctaText}>🔥 Keep My Streak Going</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
  },
  blobTR: {
    position: "absolute", top: -40, right: -40,
    width: 170, height: 170, borderRadius: 85,
    backgroundColor: "#D4C9A8", opacity: 0.45,
    pointerEvents: "none",
  },
  blobBL: {
    position: "absolute", bottom: -50, left: -50,
    width: 170, height: 170, borderRadius: 85,
    backgroundColor: "#D4C9A8", opacity: 0.4,
    pointerEvents: "none",
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: "center",
  },
  pageLabel: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    letterSpacing: 2.5,
    color: AMBER,
    textTransform: "uppercase",
    marginBottom: 20,
    textAlign: "center",
  },
  heroCardWrap: { width: "100%", marginBottom: 20 },
  heroCard: {
    borderRadius: 24,
    padding: 22,
    shadowColor: "#B87320",
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 10,
  },
  heroCardInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  levelBadgeBig: {
    width: 70, height: 70,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  lvBadgeIcon: { fontSize: 28, lineHeight: 32 },
  lvBadgeTag: {
    fontSize: 9, fontFamily: Fonts.bold,
    letterSpacing: 1, color: "rgba(255,255,255,0.8)",
    textTransform: "uppercase", marginTop: 2,
  },
  heroRight: { flex: 1 },
  heroLevelName: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    color: WHITE,
    lineHeight: 26,
    marginBottom: 3,
  },
  heroXpLabel: {
    fontSize: 12, fontFamily: Fonts.semiBold,
    color: "rgba(255,240,200,0.8)",
    marginBottom: 8,
  },
  progressTrack: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 50, height: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: WHITE,
    borderRadius: 50,
  },
  progressMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  progressMetaText: {
    fontSize: 11, fontFamily: Fonts.bold,
    color: "rgba(255,240,200,0.75)",
  },
  dreamBanner: {
    width: "100%",
    backgroundColor: WHITE,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: "#64330A",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#B87320",
  },
  dreamIconWrap: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: "#F5F0E6",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(180,140,80,0.2)",
    flexShrink: 0,
  },
  dreamTextWrap: { flex: 1 },
  dreamEyebrow: {
    fontSize: 10, fontFamily: Fonts.bold,
    letterSpacing: 1.5, textTransform: "uppercase",
    color: AMBER, marginBottom: 2,
  },
  dreamTitle: {
    fontSize: 14, fontFamily: Fonts.bold,
    color: DARK, lineHeight: 19,
  },
  dreamSub: {
    fontSize: 12, fontFamily: Fonts.semiBold,
    color: MUTED, lineHeight: 17,
  },
  sectionLabel: {
    width: "100%",
    fontSize: 11, fontFamily: Fonts.bold,
    letterSpacing: 2, textTransform: "uppercase",
    color: AMBER, marginBottom: 12,
  },
  levelsList: {
    width: "100%",
    gap: 10,
    marginBottom: 24,
  },
  levelRow: {
    backgroundColor: WHITE,
    borderRadius: 16,
    paddingVertical: 13, paddingHorizontal: 16,
    flexDirection: "row", alignItems: "center", gap: 14,
    shadowColor: "#64330A",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
    position: "relative",
  },
  levelRowCurrent: {
    borderWidth: 2,
    borderColor: GOLD,
    shadowColor: "#B4781E",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  levelRowLocked: { opacity: 0.5 },
  currentTag: {
    position: "absolute", top: -9, left: 16,
    backgroundColor: DARK2,
    paddingVertical: 3, paddingHorizontal: 10,
    borderRadius: 50,
  },
  currentTagText: {
    fontSize: 9, fontFamily: Fonts.bold,
    letterSpacing: 1.5, textTransform: "uppercase",
    color: "#F5EFE0",
  },
  lvIconWrap: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: "#F5F0E6",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(180,140,80,0.15)",
    flexShrink: 0,
  },
  lvIconWrapCurrent: {
    backgroundColor: GOLD2,
    borderWidth: 0,
  },
  lvInfo: { flex: 1 },
  lvName: {
    fontSize: 14, fontFamily: Fonts.bold,
    color: DARK, lineHeight: 18,
  },
  lvRange: {
    fontSize: 12, fontFamily: Fonts.semiBold,
    color: MUTED, marginTop: 1,
  },
  lvRight: { flexShrink: 0, alignItems: "flex-end" },
  inProgressBadge: {
    backgroundColor: GOLD,
    paddingVertical: 4, paddingHorizontal: 10,
    borderRadius: 50,
  },
  inProgressText: {
    fontSize: 10, fontFamily: Fonts.bold,
    letterSpacing: 1, textTransform: "uppercase",
    color: WHITE,
  },
  nudgeCard: {
    width: "100%",
    backgroundColor: DARK2,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
  },
  nudgeDex: { flexShrink: 0, marginTop: 2 },
  nudgeText: { flex: 1 },
  nudgeHead: {
    fontFamily: Fonts.serif,
    fontSize: 16,
    color: "#F5EFE0",
    marginBottom: 5,
    lineHeight: 22,
  },
  nudgeHeadEm: { color: GOLD },
  nudgeBody: {
    fontSize: 13, fontFamily: Fonts.semiBold,
    color: "#F5EFE0",
    lineHeight: 20,
  },
  cta: {
    width: "100%",
    backgroundColor: DARK2,
    borderRadius: 50,
    paddingVertical: 18,
    alignItems: "center",
  },
  ctaText: {
    fontSize: 17, fontFamily: Fonts.bold,
    color: "#F5EFE0",
    letterSpacing: 0.2,
  },
});

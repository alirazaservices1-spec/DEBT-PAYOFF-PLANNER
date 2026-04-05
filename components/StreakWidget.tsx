// ─── StreakWidget — uses FlameIcon (5-tier SVG flame) ─────────────────────────
// Designer handoff: orange=#E8600A, monospaced streak count, proper tier labels

import React, { useRef, useEffect } from "react";
import { StyleSheet, Text, View, ViewStyle, Animated } from "react-native";
import Colors, { D } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useGame } from "@/context/GameContext";
import { useIsDark } from "@/context/ThemeContext";
import { FlameIcon } from "@/components/FlameIcon";

interface Props {
  style?: ViewStyle;
}

function getFlameLabel(streakCount: number): string {
  if (streakCount === 0)   return "Start your streak today!";
  if (streakCount >= 100)  return "Legendary streak";
  if (streakCount >= 30)   return "On fire!";
  if (streakCount >= 14)   return "Two weeks strong";
  if (streakCount >= 7)    return "One week streak";
  if (streakCount >= 3)    return "Building momentum";
  return "day streak";
}

export function StreakWidget({ style }: Props) {
  const { streakCount, gracePeriodActive, hasStreakShield, flamePulseSeq } = useGame();
  const isDark = useIsDark();
  const C = isDark ? Colors.dark : Colors.light;

  const flameScale = useRef(new Animated.Value(1)).current;
  const prevSeq = useRef(flamePulseSeq);

  useEffect(() => {
    if (flamePulseSeq === prevSeq.current) return;
    prevSeq.current = flamePulseSeq;
    flameScale.setValue(1);
    Animated.sequence([
      Animated.timing(flameScale, { toValue: 1.2, duration: 150, useNativeDriver: false }),
      Animated.timing(flameScale, { toValue: 1.0, duration: 300, useNativeDriver: false }),
    ]).start();
  }, [flamePulseSeq]);

  const atRisk = gracePeriodActive;
  const activeColor = atRisk ? D.red : D.orange;

  const borderColor =
    streakCount > 0
      ? activeColor + "50"
      : isDark ? C.border : "rgba(0,0,0,0.06)";

  const tier = streakCount >= 100 ? 5 : streakCount >= 30 ? 4 : streakCount >= 14 ? 3 : streakCount >= 7 ? 2 : 1;
  // Show flame icon only if streak is active
  const flameSize = [0, 32, 40, 50, 60, 72][tier] ?? 32;

  return (
    <View
      style={[
        styles.widget,
        {
          backgroundColor: C.surface,
          borderColor,
          shadowColor: streakCount > 0 ? activeColor : "#000",
        },
        style,
      ]}
    >
      {streakCount > 0 ? (
        <Animated.View style={{ transform: [{ scale: flameScale }] }}>
          <FlameIcon streakDays={streakCount} atRisk={atRisk} size={flameSize} />
        </Animated.View>
      ) : (
        <View style={styles.emptyFlame}>
          <Text style={styles.emptyFlameText}>🔥</Text>
        </View>
      )}

      <View style={styles.info}>
        {streakCount === 0 ? (
          <>
            <Text style={[styles.zeroLabel, { color: C.textSecondary }]} numberOfLines={2}>
              Log a payment to{"\n"}start your streak!
            </Text>
          </>
        ) : (
          <>
            <Text style={[styles.count, { color: atRisk ? D.red : D.orange }]}>
              {streakCount}
            </Text>
            <Text style={[styles.label, { color: atRisk ? D.red : D.orange }]}>
              {getFlameLabel(streakCount)}
            </Text>
          </>
        )}
      </View>

      {gracePeriodActive && (
        <View style={[styles.badge, { backgroundColor: D.red + "18", borderColor: D.red + "50" }]}>
          <Text style={[styles.badgeText, { color: D.red }]}>⚠️ At Risk</Text>
        </View>
      )}

      {hasStreakShield && !gracePeriodActive && (
        <View style={[styles.badge, { backgroundColor: D.gold + "22", borderColor: D.gold + "50" }]}>
          <Text style={[styles.badgeText, { color: D.gold }]}>🛡️ Shield</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  widget: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 0,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  info: {
    flex: 1,
  },
  count: {
    fontSize: 48,
    fontFamily: Fonts.black,
    fontWeight: "900",
    lineHeight: 52,
    fontVariant: ["tabular-nums"],
    letterSpacing: -1,
  },
  label: {
    fontSize: 12,
    fontFamily: Fonts.bold, fontWeight: "700",
    marginTop: 1,
  },
  zeroLabel: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    fontWeight: "600",
    lineHeight: 17,
  },
  badge: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: Fonts.bold, fontWeight: "700",
  },
  emptyFlame: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyFlameText: {
    fontSize: 30,
    opacity: 0.45,
  },
});

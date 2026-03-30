// ─── XPProgressBar — designer handoff spec ───────────────────────────────────
// Height 14px · border-radius 99px
// Amber gradient fill: #C07820 → #E8A030
// White particle dot at leading edge
// Smooth 1.4s cubic-bezier(.22,1,.36,1) transition

import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, View, ViewStyle, Animated } from "react-native";
import Animated2, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Colors, { D } from "@/constants/colors";
import { useIsDark } from "@/context/ThemeContext";
import { Fonts } from "@/constants/fonts";
import { useGame } from "@/context/GameContext";
import { getLevelName } from "@/constants/levelNames";
import { FloatingXPBadge } from "@/components/FloatingXPBadge";

interface Props {
  style?: ViewStyle;
}

export function XPProgressBar({ style }: Props) {
  const { level, currentLevelXp, nextLevelXp, progress, lastXpGain } = useGame();
  const isDark = useIsDark();
  const C = isDark ? Colors.dark : Colors.light;

  // Particle dot pulse (glow at leading edge)
  const dotPulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(dotPulse, { toValue: 1.6, duration: 750, useNativeDriver: false }),
        Animated.timing(dotPulse, { toValue: 1.0, duration: 750, useNativeDriver: false }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Bar fill — 1.4s with designer spec easing
  const barWidth = useSharedValue(0);
  useEffect(() => {
    barWidth.value = withTiming(Math.min(1, Math.max(0, progress)), {
      duration: 1400,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
  }, [progress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value * 100}%` as any,
  }));

  const trackBg = isDark ? D.bg4 : "#EDE0C8";
  const levelBadgeBg = "#C07820";

  return (
    <View style={[styles.container, { backgroundColor: C.surface, borderColor: isDark ? "rgba(232,160,48,0.22)" : "rgba(192,120,32,0.22)" }, style]}>
      <View style={styles.header}>
        {/* Level badge */}
        <View style={[styles.levelBadge, { backgroundColor: levelBadgeBg }]}>
          <Text style={styles.levelLabel}>LVL</Text>
          <Text style={styles.levelNumber}>{level}</Text>
        </View>

        <View style={styles.xpInfo}>
          <Text style={[styles.xpTitle, { color: C.text }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
            {getLevelName(level)}
          </Text>
          <Text style={[styles.xpSubtitle, { color: C.textSecondary }]} numberOfLines={1}>
            {currentLevelXp} / {nextLevelXp} XP
          </Text>
        </View>

        <FloatingXPBadge amount={lastXpGain.amount} seq={lastXpGain.seq} />
      </View>

      {/* Track */}
      <View style={styles.trackWrap}>
        <View style={[styles.track, { backgroundColor: trackBg }]}>
          {/* Gradient fill — simulated with two layers since RN doesn't support CSS gradient on View */}
          <Animated2.View style={[styles.fill, barStyle]}>
            {/* Left anchor color */}
            <View style={[StyleSheet.absoluteFillObject, styles.fillLeft]} />
            {/* Right color overlay, fading from center */}
            <View style={[StyleSheet.absoluteFillObject, styles.fillRight]} />
          </Animated2.View>
        </View>

        {/* White particle dot at leading edge */}
        <Animated2.View style={[styles.dotTrack, barStyle]}>
          <Animated.View
            style={[
              styles.dot,
              {
                transform: [{ scale: dotPulse }],
                shadowColor: "#FFFFFF",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.9,
                shadowRadius: 5,
              },
            ]}
          />
        </Animated2.View>
      </View>

      <Text style={[styles.pct, { color: C.textSecondary }]}>
        {Math.round(progress * 100)}% to {getLevelName(level + 1)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    padding: 12,
    marginBottom: 0,
    borderWidth: 1,
    shadowColor: D.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
    position: "relative",
  },
  levelBadge: {
    width: 40,
    height: 40,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: D.blue,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  levelLabel: {
    fontSize: 7,
    fontFamily: Fonts.bold, fontWeight: "700",
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 1,
  },
  levelNumber: {
    fontSize: 17,
    fontFamily: Fonts.mono,
    fontWeight: "500",
    color: "#FFFFFF",
    lineHeight: 20,
  },
  xpInfo: {
    flex: 1,
    minWidth: 0,
  },
  xpTitle: {
    fontSize: 14,
    fontFamily: Fonts.bold, fontWeight: "700",
    marginBottom: 2,
  },
  xpSubtitle: {
    fontSize: 11,
    fontWeight: "400",
  },
  trackWrap: {
    position: "relative",
    marginBottom: 6,
    height: 14,
  },
  track: {
    height: 14,
    borderRadius: 99,
    overflow: "hidden",
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
  },
  fill: {
    height: "100%",
    borderRadius: 99,
    overflow: "hidden",
    minWidth: 14,
    backgroundColor: "#C07820",
  },
  fillLeft: {
    backgroundColor: "#C07820",
    borderRadius: 99,
  },
  fillRight: {
    backgroundColor: "#E8A030",
    borderRadius: 99,
    opacity: 0.7,
  },
  // Dot track mirrors the fill width so dot sits at the right edge
  dotTrack: {
    position: "absolute",
    top: 0,
    left: 0,
    height: 14,
    borderRadius: 99,
    justifyContent: "center",
    alignItems: "flex-end",
    overflow: "visible",
    minWidth: 14,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
    marginRight: -2,
  },
  pct: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: "right",
  },
});

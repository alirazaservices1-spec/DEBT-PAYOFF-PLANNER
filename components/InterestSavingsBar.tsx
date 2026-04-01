import { Fonts } from "@/constants/fonts";
// ─── InterestSavingsBar — Section 7c of designer handoff ─────────────────────
// Progress bar showing cumulative interest saved.
// Freedom Green gradient, only ever grows.
// Milestone markers at $50, $100, $250, $500, $1000.
// On milestone: animated tick + copy "You just crossed $X saved..."

import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useIsDark } from "@/context/ThemeContext";

const MILESTONES = [50, 100, 250, 500, 1000];

function formatMilestone(n: number): string {
  return n >= 1000 ? `$${n / 1000}k` : `$${n}`;
}

function getMilestoneLabel(saved: number): string | null {
  if (saved >= 1000) return `You just crossed $1,000 saved! That's a vacation you kept.`;
  if (saved >= 500)  return `You just crossed $500 saved! That's a car payment you kept.`;
  if (saved >= 250)  return `You just crossed $250 saved! That's a dinner out every month.`;
  if (saved >= 100)  return `You just crossed $100 saved! That's a car payment you kept.`;
  if (saved >= 50)   return `You just crossed $50 saved! Every dollar counts. Keep going!`;
  return null;
}

interface Props {
  interestSaved: number;
  onMilestone?: (amount: number) => void;
}

export function InterestSavingsBar({ interestSaved, onMilestone }: Props) {
  const isDark = useIsDark();

  // Which milestone tier are we at?
  const maxMilestone = MILESTONES.find((m) => interestSaved < m) ?? 1000;
  const prevMilestone = MILESTONES[MILESTONES.indexOf(maxMilestone) - 1] ?? 0;
  const progress = maxMilestone === 1000 && interestSaved >= 1000
    ? 1
    : (interestSaved - prevMilestone) / (maxMilestone - prevMilestone);

  const barAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: Math.min(1, Math.max(0, progress)),
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const lastMilestoneRef = useRef<number>(0);
  useEffect(() => {
    const crossed = [...MILESTONES].filter((m) => interestSaved >= m).pop() ?? 0;
    if (crossed > lastMilestoneRef.current) {
      lastMilestoneRef.current = crossed;
      onMilestone?.(crossed);
    }
  }, [interestSaved]);

  const milestoneLabel = getMilestoneLabel(interestSaved);

  if (interestSaved <= 0) return null;

  const AMBER     = isDark ? "#E8A030" : "#C07820";
  const cardBg    = isDark ? "#2C2014" : "#FFFFFF";
  const borderCol = isDark ? "rgba(232,160,48,0.22)" : "rgba(192,120,32,0.22)";
  const trackBg   = isDark ? "rgba(232,160,48,0.12)" : "rgba(192,120,32,0.12)";

  return (
    <View style={[styles.container, { backgroundColor: cardBg, borderColor: borderCol }]}>
      <View style={styles.header}>
        <Ionicons name="trending-down" size={14} color={AMBER} />
        <Text style={[styles.title, { color: AMBER }]}>Interest you have kept in your pocket</Text>
      </View>

      <Text style={[styles.amount, { color: AMBER }]}>
        ${interestSaved.toFixed(2)}
      </Text>

      {/* Progress bar with milestone markers */}
      <View style={styles.barWrap}>
        <View style={[styles.track, { backgroundColor: trackBg }]}>
          <Animated.View
            style={[
              styles.fill,
              {
                width: barAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
                backgroundColor: AMBER,
              },
            ]}
          />
        </View>

        {/* Milestone tick marks */}
        {MILESTONES.map((m) => {
          const pos = (m - prevMilestone) / (maxMilestone - prevMilestone);
          if (pos <= 0 || pos > 1) return null;
          const reached = interestSaved >= m;
          return (
            <View
              key={m}
              style={[
                styles.tick,
                {
                  left: `${pos * 100}%` as any,
                  backgroundColor: reached ? AMBER : (isDark ? "rgba(232,160,48,0.30)" : "rgba(192,120,32,0.22)"),
                },
              ]}
            />
          );
        })}
      </View>

      {/* Milestone labels */}
      <View style={styles.labelsRow}>
        <Text style={[styles.milestoneLabel, { color: isDark ? "rgba(240,232,208,0.40)" : "#111111" }]}>
          {formatMilestone(prevMilestone === 0 ? 50 : prevMilestone)}
        </Text>
        <Text style={[styles.milestoneLabel, { color: isDark ? "rgba(240,232,208,0.40)" : "#111111" }]}>
          {formatMilestone(maxMilestone)}
        </Text>
      </View>

      {milestoneLabel && (
        <Text style={[styles.copy, { color: AMBER }]}>
          🎯 {milestoneLabel}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  title: {
    fontSize: 12,
    fontFamily: Fonts.bold, fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  amount: {
    fontSize: 32,
    fontFamily: Fonts.black, fontWeight: "900",
    letterSpacing: -0.5,
    lineHeight: 36,
    marginBottom: 10,
    fontVariant: ["tabular-nums"],
  },
  barWrap: {
    position: "relative",
    marginBottom: 4,
    height: 12,
  },
  track: {
    height: 12,
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
    minWidth: 8,
  },
  tick: {
    position: "absolute",
    top: 1,
    width: 2,
    height: 10,
    borderRadius: 1,
    transform: [{ translateX: -1 }],
  },
  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 8,
  },
  milestoneLabel: {
    fontSize: 10,
    fontFamily: Fonts.semiBold, fontWeight: "600",
  },
  copy: {
    fontSize: 12,
    fontFamily: Fonts.semiBold, fontWeight: "600",
    lineHeight: 18,
  },
});

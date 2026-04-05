import { Fonts } from "@/constants/fonts";
// ─── PayoffDateWidget — Section 7b of designer handoff ───────────────────────
// Shows payoff date before/after extra payment:
//   Before: muted red-gray with animated strikethrough (left→right, 0.4s)
//   After : Freedom Green, scales in from 0.8 with spring bounce
// Dex speech bubble shows days moved up.

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from "react-native";
import { D } from "@/constants/colors";
import { useIsDark } from "@/context/ThemeContext";

interface Props {
  currentDate: Date;
  baselineDate: Date;
  hasExtraPayment: boolean;
  paymentTrigger?: number;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function daysBetween(a: Date, b: Date): number {
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86_400_000));
}

export function PayoffDateWidget({ currentDate, baselineDate, hasExtraPayment, paymentTrigger = 0 }: Props) {
  const isDark = useIsDark();

  const daysSaved = daysBetween(currentDate, baselineDate);
  const monthsSaved = Math.round(daysSaved / 30);
  const showStrike = hasExtraPayment && daysSaved > 0;

  // Strike line animation — draws left to right over 0.4s
  const strikeWidth = useRef(new Animated.Value(0)).current;
  // New date spring scale
  const newDateScale = useRef(new Animated.Value(0.8)).current;
  const newDateOpacity = useRef(new Animated.Value(0)).current;

  const prevHasExtra = useRef(false);

  useEffect(() => {
    if (showStrike) {
      // Animate strike line
      strikeWidth.setValue(0);
      newDateScale.setValue(0.8);
      newDateOpacity.setValue(0);
      Animated.sequence([
        Animated.timing(strikeWidth, { toValue: 1, duration: 400, useNativeDriver: false }),
        Animated.parallel([
          Animated.spring(newDateScale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: false }),
          Animated.timing(newDateOpacity, { toValue: 1, duration: 200, useNativeDriver: false }),
        ]),
      ]).start();
    }
  }, [showStrike, baselineDate.toISOString(), currentDate.toISOString(), paymentTrigger]);

  if (!showStrike) {
    // No extra payment — just show the date cleanly
    return (
      <View style={styles.singleWrap}>
        <Text style={[styles.singleDate, { color: D.green }]}>
          {formatDate(currentDate)}
        </Text>
        <Text style={[styles.singleLabel, { color: isDark ? "rgba(255,255,255,0.45)" : "#7A9A80" }]}>
          debt-free date
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* BEFORE date with animated strikethrough */}
      <View style={styles.beforeWrap}>
        <Text style={styles.beforeDate}>{formatDate(baselineDate)}</Text>
        <Animated.View
          style={[
            styles.strikeLine,
            {
              width: strikeWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
        <Text style={styles.beforeLabel}>without extra payments</Text>
      </View>

      {/* Arrow */}
      <Text style={styles.arrow}>→</Text>

      {/* AFTER date: Freedom Green spring scale-in */}
      <Animated.View
        style={[
          styles.afterWrap,
          { transform: [{ scale: newDateScale }], opacity: newDateOpacity },
        ]}
      >
        <Text style={styles.afterDate}>{formatDate(currentDate)}</Text>
        {monthsSaved > 0 && (
          <View style={styles.savedBadge}>
            <Text style={styles.savedBadgeText}>
              {monthsSaved >= 1 ? `${monthsSaved}mo faster` : `${daysSaved}d faster`}
            </Text>
          </View>
        )}
        <Text style={styles.afterLabel}>your new date 🎉</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  beforeWrap: {
    alignItems: "flex-start",
    position: "relative",
  },
  beforeDate: {
    fontSize: 18,
    fontFamily: Fonts.bold, fontWeight: "700",
    color: "#9A7070",
    letterSpacing: -0.3,
  },
  strikeLine: {
    position: "absolute",
    top: "50%",
    left: 0,
    height: 2,
    backgroundColor: "#9A7070",
    borderRadius: 1,
  },
  beforeLabel: {
    fontSize: 9,
    color: "#9A7070",
    marginTop: 2,
    fontWeight: "500",
  },
  arrow: {
    fontSize: 20,
    color: D.green,
    fontFamily: Fonts.bold, fontWeight: "700",
  },
  afterWrap: {
    alignItems: "flex-start",
  },
  afterDate: {
    fontSize: 28,
    fontFamily: Fonts.black, fontWeight: "900",
    color: D.green,
    letterSpacing: -0.5,
  },
  savedBadge: {
    backgroundColor: D.green + "20",
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 2,
  },
  savedBadgeText: {
    fontSize: 10,
    fontFamily: Fonts.extraBold, fontWeight: "800",
    color: D.green,
    letterSpacing: 0.3,
  },
  afterLabel: {
    fontSize: 9,
    color: D.green,
    marginTop: 2,
    fontWeight: "500",
    opacity: 0.7,
  },
  singleWrap: {
    alignItems: "flex-start",
    paddingVertical: 4,
  },
  singleDate: {
    fontSize: 28,
    fontFamily: Fonts.black, fontWeight: "900",
    letterSpacing: -0.5,
  },
  singleLabel: {
    fontSize: 10,
    fontFamily: Fonts.semiBold, fontWeight: "600",
    marginTop: 2,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
});

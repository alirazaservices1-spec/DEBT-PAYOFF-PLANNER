import React, { useEffect, useMemo, useRef } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";
import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { STREAK_MILESTONE_MESSAGES, STREAK_MILESTONE_TIERS } from "@/context/GameContext";

interface Confetti {
  x: number;
  delay: number;
  color: string;
  size: number;
  rotation: number;
}

const CONFETTI_COLORS = [
  "#E67E22", "#F39C12", Colors.primary, Colors.accent, "#A78BFA", "#FF6B6B", "#FCD34D",
];

function makeConfetti(n: number): Confetti[] {
  return Array.from({ length: n }, (_, i) => ({
    x: Math.random() * 340 - 20,
    delay: Math.random() * 600,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 7 + Math.random() * 9,
    rotation: Math.random() * 360,
  }));
}

function ConfettiPiece({ piece }: { piece: Confetti }) {
  const y = useSharedValue(-20);
  const opacity = useSharedValue(0);
  const rot = useSharedValue(piece.rotation);

  useEffect(() => {
    opacity.value = withDelay(piece.delay, withTiming(1, { duration: 180 }));
    y.value = withDelay(piece.delay, withTiming(750, { duration: 2000, easing: Easing.out(Easing.quad) }));
    rot.value = withDelay(
      piece.delay,
      withRepeat(withTiming(piece.rotation + 360, { duration: 700 }), -1, false)
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: y.value }, { rotate: `${rot.value}deg` }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: piece.x,
          top: 0,
          width: piece.size,
          height: piece.size * 0.5,
          borderRadius: 2,
          backgroundColor: piece.color,
        },
        style,
      ]}
    />
  );
}

/** Spotlight emoji for well-known streak days; others use tier fallback (v5 tiers). */
const MILESTONE_EMOJI: Partial<Record<number, string>> = {
  1: "✓",
  7: "🔥",
  14: "💪",
  30: "⚡",
  60: "🏆",
  100: "👑",
  180: "🎖️",
  365: "📅",
  500: "🔥",
  730: "📅",
  1000: "∞",
  1825: "👑",
};

const TIER_EMOJI: Record<number, string> = {
  1: "✨",
  2: "🔥",
  3: "⚡",
  4: "👑",
  5: "🏆",
};

interface Props {
  visible: boolean;
  streakDays: number;
  bonusXp: number;
  onDismiss: () => void;
}

export function StreakMilestoneCelebration({ visible, streakDays, bonusXp, onDismiss }: Props) {
  const tier = STREAK_MILESTONE_TIERS[streakDays] ?? 2;
  const confettiCount =
    tier <= 1 ? 12 : tier === 2 ? 22 : tier === 3 ? 30 : tier === 4 ? 40 : 52;
  const confettiPieces = useMemo(() => makeConfetti(confettiCount), [confettiCount]);

  const backdrop = useSharedValue(0);
  const cardScale = useSharedValue(0.4);
  const cardOpacity = useSharedValue(0);
  const badgeBounce = useSharedValue(0);
  const numberPop = useSharedValue(0.5);

  useEffect(() => {
    if (visible) {
      backdrop.value = withTiming(1, { duration: 300 });
      cardOpacity.value = withTiming(1, { duration: 300 });
      cardScale.value = withSpring(1, { damping: 13, stiffness: 200 });
      badgeBounce.value = withDelay(
        200,
        withRepeat(
          withSequence(
            withTiming(1.1, { duration: 450 }),
            withTiming(1, { duration: 450 })
          ),
          -1,
          true
        )
      );
      numberPop.value = withDelay(150, withSpring(1, { damping: 8, stiffness: 180 }));
    } else {
      backdrop.value = withTiming(0, { duration: 200 });
      cardOpacity.value = withTiming(0, { duration: 200 });
      cardScale.value = withTiming(0.85, { duration: 200 });
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.value }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));
  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeBounce.value }],
  }));
  const numberStyle = useAnimatedStyle(() => ({
    transform: [{ scale: numberPop.value }],
  }));

  if (!visible) return null;

  const emoji = MILESTONE_EMOJI[streakDays] ?? TIER_EMOJI[tier] ?? "🔥";
  const message = STREAK_MILESTONE_MESSAGES[streakDays] ?? "Keep the streak alive!";

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onDismiss}>
      <Pressable style={styles.root} onPress={onDismiss}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]} />

        <View style={styles.confettiLayer} pointerEvents="none">
          {confettiPieces.map((p, i) => (
            <ConfettiPiece key={`${streakDays}-${i}`} piece={p} />
          ))}
        </View>

        <Pressable onPress={onDismiss}>
          <Animated.View style={[styles.card, cardStyle]}>
            <Animated.View style={[styles.badge, badgeStyle]}>
              <Text style={styles.emoji}>{emoji}</Text>
            </Animated.View>

            <Animated.Text style={[styles.days, numberStyle]}>
              {streakDays}
            </Animated.Text>
            <Text style={styles.dayLabel}>Day Streak!</Text>

            <Text style={styles.message}>{message}</Text>

            <View style={styles.xpRow}>
              <View style={styles.xpPill}>
                <Text style={styles.xpText}>+{bonusXp} Bonus XP</Text>
              </View>
            </View>

            <Text style={styles.hint}>Tap to continue</Text>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  backdrop: {
    backgroundColor: "rgba(0,0,0,0.78)",
  },
  confettiLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  card: {
    backgroundColor: "#0D1F12",
    borderRadius: 28,
    paddingVertical: 40,
    paddingHorizontal: 48,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E67E22",
    shadowColor: "#E67E22",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 28,
    elevation: 24,
    minWidth: 290,
  },
  badge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#E67E22",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    shadowColor: "#E67E22",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  emoji: {
    fontSize: 38,
  },
  days: {
    fontSize: 56,
    fontFamily: Fonts.black, fontWeight: "900",
    color: "#fff",
    lineHeight: 60,
  },
  dayLabel: {
    fontSize: 20,
    fontFamily: Fonts.bold, fontWeight: "700",
    color: "#E67E22",
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  xpRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  xpPill: {
    backgroundColor: Colors.primary + "22",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  xpText: {
    fontSize: 14,
    fontFamily: Fonts.bold, fontWeight: "700",
    color: Colors.primary,
  },
  hint: {
    fontSize: 12,
    color: "rgba(255,255,255,0.35)",
  },
});

import React, { useEffect, useRef } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  Easing,
} from "react-native-reanimated";
import Colors from "@/constants/colors";
import { useIsDark } from "@/context/ThemeContext";
import { Fonts } from "@/constants/fonts";
import { DexMascot } from "@/components/DexMascot";

interface Confetti {
  x: number;
  delay: number;
  color: string;
  size: number;
  rotation: number;
}

const CONFETTI_COLORS = [Colors.primary, Colors.accent, "#FFD700", "#FF6B6B", "#A78BFA", "#34D399"];

function makeConfetti(n: number): Confetti[] {
  return Array.from({ length: n }, (_, i) => ({
    x: Math.random() * 340 - 20,
    delay: Math.random() * 400,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 7 + Math.random() * 8,
    rotation: Math.random() * 360,
  }));
}

const PIECES = makeConfetti(22);

function ConfettiPiece({ piece }: { piece: Confetti }) {
  const y = useSharedValue(-20);
  const opacity = useSharedValue(0);
  const rot = useSharedValue(piece.rotation);

  useEffect(() => {
    opacity.value = withDelay(piece.delay, withTiming(1, { duration: 200 }));
    y.value = withDelay(piece.delay, withTiming(500, { duration: 1500, easing: Easing.out(Easing.quad) }));
    rot.value = withDelay(piece.delay, withRepeat(withTiming(piece.rotation + 360, { duration: 700 }), -1, false));
  }, []);

  const s = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: y.value }, { rotate: `${rot.value}deg` }],
  }));

  return (
    <Animated.View
      style={[
        { position: "absolute", top: 0, left: piece.x, width: piece.size, height: piece.size * 0.5, backgroundColor: piece.color, borderRadius: 2 },
        s,
      ]}
    />
  );
}

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

export function OnboardingCelebration({ visible, onDismiss }: Props) {
  const isDark = useIsDark();

  const backdropOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.5);
  const cardOpacity = useSharedValue(0);
  const pillScale = useSharedValue(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: 250 });
      cardOpacity.value = withTiming(1, { duration: 250 });
      cardScale.value = withSpring(1, { damping: 14, stiffness: 220 });
      pillScale.value = withDelay(350, withSpring(1, { damping: 12, stiffness: 180 }));
      timerRef.current = setTimeout(onDismiss, 3000);
    } else {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      cardScale.value = withTiming(0.8, { duration: 200 });
      cardOpacity.value = withTiming(0, { duration: 200 });
      pillScale.value = withTiming(0, { duration: 150 });
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropOpacity.value }));
  const cardStyle = useAnimatedStyle(() => ({ opacity: cardOpacity.value, transform: [{ scale: cardScale.value }] }));
  const pillStyle = useAnimatedStyle(() => ({ transform: [{ scale: pillScale.value }] }));

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onDismiss}>
      <Pressable style={styles.container} onPress={onDismiss}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]} />

        <View style={styles.confettiContainer} pointerEvents="none">
          {PIECES.map((p, i) => <ConfettiPiece key={i} piece={p} />)}
        </View>

        <Pressable onPress={onDismiss}>
          <Animated.View style={[styles.card, { backgroundColor: isDark ? "#0D1F12" : "#fff" }, cardStyle]}>
            <DexMascot state="celebrating" size={88} />

            <Text style={[styles.title, { color: isDark ? "#fff" : "#05130A" }]}>
              Journey Begins! 🚀
            </Text>
            <Text style={[styles.message, { color: isDark ? "rgba(255,255,255,0.72)" : "#3A5A42" }]}>
              You're on your way to debt freedom! Every journey starts with one step.
            </Text>

            <Animated.View style={[styles.xpPill, pillStyle]}>
              <Text style={styles.xpPillText}>+100 XP Welcome Bonus</Text>
            </Animated.View>

            <Text style={styles.hint}>Tap anywhere to continue</Text>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  backdrop: {
    backgroundColor: "rgba(0,0,0,0.80)",
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  card: {
    borderRadius: 28,
    paddingVertical: 36,
    paddingHorizontal: 32,
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 24,
    elevation: 24,
    minWidth: 300,
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontFamily: Fonts.extraBold, fontWeight: "800",
    letterSpacing: 0.3,
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 260,
  },
  xpPill: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginTop: 4,
  },
  xpPillText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: Fonts.extraBold, fontWeight: "800",
    letterSpacing: 0.4,
  },
  hint: {
    fontSize: 12,
    color: "rgba(255,255,255,0.35)",
    marginTop: 8,
  },
});

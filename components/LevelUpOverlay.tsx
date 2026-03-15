import { Fonts } from "@/constants/fonts";
// ─── LevelUpOverlay — designer handoff Section 6c ────────────────────────────
// Achievement Gold 10% tint behind card.
// Card slides from bottom with spring easing.
// Level name reveals character-by-character at 30ms/char.
// Badge: old fades out → new scales 0→1.15→1.0 with gold glow.

import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { getLevelName } from "@/constants/levelNames";
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
import { D } from "@/constants/colors";
import { useReduceMotion } from "@/hooks/useReduceMotion";

// ── Confetti with design system colors ────────────────────────────────────────
interface Confetti {
  x: number; delay: number; color: string; size: number; rotation: number;
}
const CONFETTI_COLORS = [D.orange, D.blue, D.gold, D.green, "#FFFFFF", "#F7921E"];
function generateConfetti(count: number): Confetti[] {
  return Array.from({ length: count }, (_, i) => ({
    x: Math.random() * 340 - 20,
    delay: Math.random() * 600,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 7 + Math.random() * 7,
    rotation: Math.random() * 360,
  }));
}
const CONFETTI_PIECES = generateConfetti(36);

function ConfettiPiece({ piece }: { piece: Confetti }) {
  const translateY = useSharedValue(-20);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(piece.rotation);
  useEffect(() => {
    opacity.value = withDelay(piece.delay, withTiming(1, { duration: 200 }));
    translateY.value = withDelay(piece.delay, withTiming(800, { duration: 1800, easing: Easing.out(Easing.quad) }));
    rotate.value = withDelay(piece.delay, withRepeat(withTiming(piece.rotation + 360, { duration: 800 }), -1, false));
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { rotate: `${rotate.value}deg` }],
  }));
  return (
    <Animated.View style={[styles.confettiPiece, { left: piece.x, width: piece.size, height: piece.size * 0.5, backgroundColor: piece.color }, style]} />
  );
}

// ── Char-by-char level name reveal ────────────────────────────────────────────
function TypewriterText({ text, delay = 500 }: { text: string; delay?: number }) {
  const [visible, setVisible] = useState(0);
  useEffect(() => {
    setVisible(0);
    const timer = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setVisible(i);
        if (i >= text.length) clearInterval(interval);
      }, 30);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [text, delay]);
  return (
    <Text style={styles.levelName}>
      {text.slice(0, visible)}
      {visible < text.length && <Text style={{ opacity: Math.sin(Date.now() / 200) > 0 ? 1 : 0 }}>|</Text>}
    </Text>
  );
}

// ── Main overlay ──────────────────────────────────────────────────────────────
interface Props {
  visible: boolean;
  level: number;
  onDismiss: () => void;
}

export function LevelUpOverlay({ visible, level, onDismiss }: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const reduceMotion = useReduceMotion();

  const backdropOpacity = useSharedValue(0);
  const cardY = useSharedValue(80);           // slides up into center
  const cardOpacity = useSharedValue(0);
  const badgeScale = useSharedValue(0);
  const badgeGlow = useSharedValue(0);
  const goldTint = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(0.82, { duration: 300 });
      goldTint.value = withTiming(1, { duration: 400 });
      cardOpacity.value = withTiming(1, { duration: 300 });
      cardY.value = reduceMotion
        ? withTiming(0, { duration: 350 })
        : withSpring(0, { damping: 16, stiffness: 180 });
      // Badge: scale 0 → 1.15 → 1.0 (or simple fade-in when reduce motion)
      badgeScale.value = withDelay(
        300,
        reduceMotion
          ? withTiming(1, { duration: 300 })
          : withSequence(
              withSpring(1.15, { damping: 8, stiffness: 200 }),
              withSpring(1.0, { damping: 14, stiffness: 220 }),
            )
      );
      badgeGlow.value = withDelay(350, withRepeat(
        withSequence(
          withTiming(1,   { duration: 600 }),
          withTiming(0.4, { duration: 600 }),
        ),
        -1, true
      ));
    } else {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      goldTint.value = withTiming(0, { duration: 200 });
      cardY.value = withTiming(80, { duration: 200 });
      cardOpacity.value = withTiming(0, { duration: 200 });
      badgeScale.value = 0;
    }
  }, [visible, reduceMotion]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropOpacity.value }));
  const goldTintStyle = useAnimatedStyle(() => ({ opacity: goldTint.value * 0.1 }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardY.value }],
  }));
  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
    shadowOpacity: badgeGlow.value * 0.8,
  }));

  if (!visible) return null;

  const levelName = getLevelName(level).toUpperCase();

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onDismiss}>
      <Pressable style={styles.container} onPress={onDismiss}>
        {/* Dark backdrop */}
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]} />

        {/* Achievement Gold 10% full-screen tint */}
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: D.gold }, goldTintStyle]} />

        {/* Confetti */}
        <View style={styles.confettiContainer} pointerEvents="none">
          {CONFETTI_PIECES.map((piece, i) => <ConfettiPiece key={i} piece={piece} />)}
        </View>

        {/* Card — slides from bottom */}
        <Pressable onPress={onDismiss}>
          <Animated.View style={[styles.card, { backgroundColor: isDark ? "#161719" : "#FFFFFF" }, cardStyle]}>
            {/* Badge */}
            <Animated.View style={[styles.badge, badgeStyle]}>
              <Text style={styles.badgeStar}>⭐</Text>
              <Text style={styles.badgeLevel}>{level}</Text>
            </Animated.View>

            <Text style={styles.title}>LEVEL UP!</Text>

            {/* Char-by-char level name */}
            <TypewriterText text={levelName} delay={600} />

            <Text style={[styles.sub, { color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)" }]}>
              Level {level} Unlocked
            </Text>

            <View style={styles.claimBtn}>
              <Text style={styles.claimText}>TAP TO CLAIM</Text>
            </View>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  backdrop: { backgroundColor: "rgba(0,0,0,0.82)" },
  confettiContainer: { ...StyleSheet.absoluteFillObject, overflow: "hidden" },
  confettiPiece: { position: "absolute", top: 0, borderRadius: 2 },
  card: {
    borderRadius: 28,
    paddingVertical: 44,
    paddingHorizontal: 48,
    alignItems: "center",
    borderWidth: 2,
    borderColor: D.gold,
    shadowColor: D.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 24,
    minWidth: 300,
  },
  badge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: D.gold,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: D.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 12,
  },
  badgeStar: { fontSize: 26, position: "absolute", top: 9 },
  badgeLevel: { fontSize: 32, fontFamily: Fonts.extraBold, fontWeight: "800", color: "#000", marginTop: 16 },
  title: { fontSize: 30, fontFamily: Fonts.black, fontWeight: "900", color: D.gold, marginBottom: 6, letterSpacing: 1.5 },
  levelName: { fontSize: 18, fontFamily: Fonts.extraBold, fontWeight: "800", color: D.gold, marginBottom: 4, letterSpacing: 2, textAlign: "center" },
  sub: { fontSize: 13, fontWeight: "500", marginBottom: 24 },
  claimBtn: {
    backgroundColor: D.gold,
    borderRadius: 99,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  claimText: { fontSize: 14, fontFamily: Fonts.black, fontWeight: "900", color: "#000", letterSpacing: 1.5 },
});

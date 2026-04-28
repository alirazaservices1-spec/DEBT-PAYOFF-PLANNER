/**
 * MiniCelebrationToast
 * Non-blocking, auto-dismissing celebration toasts for inline milestone moments.
 *
 * Tier 1 (Micro): Slides up from bottom. Icon pop + XP pill rises. 1.8s.
 * Tier 2 (Small): Slides down from top. Flash + icon + slam text + XP. 2.5s.
 */
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { Fonts } from "@/constants/fonts";

export interface MiniCelebration {
  id: string;
  tier: 1 | 2;
  icon: string;
  xp: number;
  label: string;
  slam?: string;
  sub?: string;
}

// ─── Shared colours ──────────────────────────────────────────────────────────
const AMBER   = "#F5C842";
const PURPLE  = "#C0A8FF";
const GREEN   = "#5FD68A";
const DARK_BG = "#1B1050";

// ─── Tier 1 — bottom toast ───────────────────────────────────────────────────
function Tier1Toast({ item, onDone }: { item: MiniCelebration; onDone: () => void }) {
  const slideY  = useRef(new Animated.Value(120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const xpOpacity = useRef(new Animated.Value(0)).current;
  const xpY     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideY,  { toValue: 0, useNativeDriver: true, damping: 14, stiffness: 200 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(iconScale, { toValue: 1, useNativeDriver: true, damping: 10, stiffness: 260, delay: 80 }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(xpOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(xpY, { toValue: -12, duration: 500, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      ]).start();
    }, 350);

    const DURATION = 1800;
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.timing(slideY,  { toValue: 100, duration: 280, useNativeDriver: true }),
      ]).start(onDone);
    }, DURATION - 280);
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.tier1Wrap, { transform: [{ translateY: slideY }], opacity }]}
    >
      <Animated.View style={[styles.tier1IconBox, { transform: [{ scale: iconScale }] }]}>
        <Text style={styles.tier1Icon}>{item.icon}</Text>
      </Animated.View>
      <View style={styles.tier1TextCol}>
        <Text style={styles.tier1Label}>{item.label}</Text>
      </View>
      <Animated.View style={[styles.xpPill, { opacity: xpOpacity, transform: [{ translateY: xpY }] }]}>
        <Text style={styles.xpPillText}>+{item.xp} XP ⚡</Text>
      </Animated.View>
    </Animated.View>
  );
}

// ─── Tier 2 — top banner ─────────────────────────────────────────────────────
function Tier2Banner({ item, onDone }: { item: MiniCelebration; onDone: () => void }) {
  const slideY    = useRef(new Animated.Value(-160)).current;
  const opacity   = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const slamOpacity = useRef(new Animated.Value(0)).current;
  const xpScale   = useRef(new Animated.Value(0)).current;
  const flash     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideY,  { toValue: 0, useNativeDriver: true, damping: 15, stiffness: 220 }),
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();

    // Flash
    Animated.sequence([
      Animated.timing(flash, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(flash, { toValue: 0, duration: 320, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      Animated.spring(iconScale, { toValue: 1, useNativeDriver: true, damping: 9, stiffness: 240 }).start();
    }, 200);

    setTimeout(() => {
      Animated.timing(slamOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }, 500);

    setTimeout(() => {
      Animated.spring(xpScale, { toValue: 1, useNativeDriver: true, damping: 10, stiffness: 200 }).start();
    }, 800);

    const DURATION = 2600;
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 320, useNativeDriver: true }),
        Animated.timing(slideY,  { toValue: -160, duration: 320, useNativeDriver: true }),
      ]).start(onDone);
    }, DURATION - 320);
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.tier2Wrap, { transform: [{ translateY: slideY }], opacity }]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, styles.tier2Flash, { opacity: flash }]} />

      <Animated.View style={[styles.tier2IconCircle, { transform: [{ scale: iconScale }] }]}>
        <Text style={styles.tier2Icon}>{item.icon}</Text>
      </Animated.View>

      <View style={styles.tier2Center}>
        <Animated.View style={{ opacity: slamOpacity }}>
          {item.slam ? (
            <Text style={styles.tier2Slam}>{item.slam}</Text>
          ) : null}
          <Text style={styles.tier2Label}>{item.label}</Text>
          {item.sub ? <Text style={styles.tier2Sub}>{item.sub}</Text> : null}
        </Animated.View>
      </View>

      <Animated.View style={[styles.xpPillAmber, { transform: [{ scale: xpScale }] }]}>
        <Text style={styles.xpPillAmberText}>+{item.xp} XP</Text>
      </Animated.View>
    </Animated.View>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────
interface Props {
  celebration: MiniCelebration | null;
  onDismiss: () => void;
}

export function MiniCelebrationToast({ celebration, onDismiss }: Props) {
  const [current, setCurrent] = useState<MiniCelebration | null>(null);

  useEffect(() => {
    if (celebration) setCurrent(celebration);
  }, [celebration?.id]);

  if (!current) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {current.tier === 1 ? (
        <Tier1Toast key={current.id} item={current} onDone={() => { setCurrent(null); onDismiss(); }} />
      ) : (
        <Tier2Banner key={current.id} item={current} onDone={() => { setCurrent(null); onDismiss(); }} />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Tier 1
  tier1Wrap: {
    position: "absolute",
    bottom: 100,
    left: 24,
    right: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: DARK_BG,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: "rgba(192,168,255,0.25)",
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 16,
    zIndex: 9000,
  },
  tier1IconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  tier1Icon: { fontSize: 20 },
  tier1TextCol: { flex: 1 },
  tier1Label: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: "#fff",
  },
  xpPill: {
    backgroundColor: "rgba(95,214,138,0.18)",
    borderRadius: 100,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  xpPillText: {
    fontFamily: Fonts.extraBold,
    fontSize: 13,
    color: GREEN,
  },

  // Tier 2
  tier2Wrap: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: DARK_BG,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: "rgba(245,200,66,0.35)",
    shadowColor: AMBER,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 18,
    zIndex: 9001,
    overflow: "hidden",
  },
  tier2Flash: {
    backgroundColor: "rgba(245,200,66,0.18)",
    borderRadius: 20,
  },
  tier2IconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(245,200,66,0.15)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  tier2Icon: { fontSize: 24 },
  tier2Center: { flex: 1 },
  tier2Slam: {
    fontFamily: Fonts.extraBold,
    fontSize: 13,
    color: AMBER,
    letterSpacing: 0.5,
  },
  tier2Label: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: "#fff",
  },
  tier2Sub: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: "rgba(255,255,255,0.55)",
    marginTop: 2,
  },
  xpPillAmber: {
    backgroundColor: "rgba(245,200,66,0.15)",
    borderRadius: 100,
    paddingVertical: 6,
    paddingHorizontal: 13,
  },
  xpPillAmberText: {
    fontFamily: Fonts.extraBold,
    fontSize: 13,
    color: AMBER,
  },
});

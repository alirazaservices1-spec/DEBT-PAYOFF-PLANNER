// ─── PaymentSuccessEffects ────────────────────────────────────────────────────
// Provides the full payment animation sequence:
//   0.0s  loading spinner on button
//   0.1s  green checkmark spring (0.9 → 1.05 → 1.0)
//   0.2s  "+XP" floats up 40px, Trust Blue, opacity 0→1→0
//   0.3s  Dex callback fires
//   0.4s  flame pulse callback fires
//   0.5s  XP bar increments (handled by awardXp → lastXpGain seq)
//   0.9s  modal closes / idle reset
//   On 15% of payments: full confetti + gold bonus banner

import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { Fonts } from "@/constants/fonts";
import { useReduceMotion } from "@/hooks/useReduceMotion";
import { soundManager } from "@/utils/SoundManager";

const { width: SW, height: SH } = Dimensions.get("window");

const CONFETTI_COLORS = [
  "#FF6B6B","#FFD93D","#6BCB77","#4D96FF","#FF6BFF",
  "#E8850A","#00C9A7","#F0A500","#A78BFA","#34D399",
];

const XP_BLUE = "#C07820";
const BONUS_GOLD = "#D4A017";

// ─── Types ────────────────────────────────────────────────────────────────────
export type BtnState = "idle" | "loading" | "success";

// ─── Confetti burst ───────────────────────────────────────────────────────────
function ConfettiBurst({ active }: { active: boolean }) {
  const particles = useRef(
    Array.from({ length: 38 }, (_, i) => ({
      x: (i / 38) * SW + Math.random() * (SW / 38),
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      anim: new Animated.Value(0),
      delay: Math.random() * 700,
      size: 7 + Math.random() * 10,
      isRect: i % 3 === 0,
    }))
  ).current;

  useEffect(() => {
    if (!active) {
      particles.forEach((p) => p.anim.setValue(0));
      return;
    }
    const anims = particles.map((p) =>
      Animated.timing(p.anim, {
        toValue: 1,
        duration: 2200 + Math.random() * 900,
        delay: p.delay,
        useNativeDriver: false,
      })
    );
    const all = Animated.parallel(anims);
    all.start();
    return () => all.stop();
  }, [active]);

  if (!active) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            left: p.x,
            width: p.size,
            height: p.size * (p.isRect ? 1.7 : 1),
            borderRadius: p.isRect ? 2 : p.size / 2,
            backgroundColor: p.color,
            opacity: p.anim.interpolate({
              inputRange: [0, 0.8, 1],
              outputRange: [1, 0.85, 0],
            }),
            transform: [
              {
                translateY: p.anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, SH + 20],
                }),
              },
              {
                rotate: p.anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "720deg"],
                }),
              },
            ],
          }}
        />
      ))}
    </View>
  );
}

// ─── Bonus banner ─────────────────────────────────────────────────────────────
function BonusBanner({ active }: { active: boolean }) {
  const slideY = useRef(new Animated.Value(-130)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active) {
      slideY.setValue(-130);
      opacity.setValue(0);
      Animated.parallel([
        Animated.spring(slideY, {
          toValue: 0,
          friction: 7,
          tension: 90,
          useNativeDriver: false,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideY, {
          toValue: -130,
          duration: 280,
          useNativeDriver: false,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 240,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [active]);

  return (
    <Animated.View
      style={[
        styles.bonusBanner,
        { transform: [{ translateY: slideY }], opacity },
      ]}
      pointerEvents="none"
    >
      <Text style={styles.bonusStar}>🌟</Text>
      <View>
        <Text style={styles.bonusTitle}>BONUS DAY!</Text>
        <Text style={styles.bonusSub}>2× XP earned  ·  100 XP!</Text>
      </View>
    </Animated.View>
  );
}

// ─── XP float ─────────────────────────────────────────────────────────────────
function XpFloat({
  active,
  amount,
  yAnim,
  opacityAnim,
  scaleAnim,
}: {
  active: boolean;
  amount: number;
  yAnim: Animated.Value;
  opacityAnim: Animated.Value;
  scaleAnim: Animated.Value;
}) {
  if (!active) return null;
  return (
    <Animated.View
      style={[
        styles.xpFloatWrap,
        {
          transform: [{ translateY: yAnim }, { scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
      pointerEvents="none"
    >
      <Text style={styles.xpFloatText}>+{amount} XP</Text>
    </Animated.View>
  );
}

// ─── Overlay (render at root of each screen) ──────────────────────────────────
export interface PaymentEffectsOverlayProps {
  xpFloatActive: boolean;
  xpAmount: number;
  xpY: Animated.Value;
  xpOpacity: Animated.Value;
  xpScale: Animated.Value;
  bonusActive: boolean;
}

export function PaymentEffectsOverlay({
  xpFloatActive,
  xpAmount,
  xpY,
  xpOpacity,
  xpScale,
  bonusActive,
}: PaymentEffectsOverlayProps) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <ConfettiBurst active={bonusActive} />
      <BonusBanner active={bonusActive} />
      <XpFloat
        active={xpFloatActive}
        amount={xpAmount}
        yAnim={xpY}
        opacityAnim={xpOpacity}
        scaleAnim={xpScale!}
      />
    </View>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export interface RunPaymentCallbacks {
  onBonus?: () => void;
  onFlamePulse?: () => void;
  onDex?: (isBonus: boolean) => void;
  onClose?: () => void;
  /** Called after sheet is closed — play sounds and trigger Dex/flame here. */
  onSuccessAfterSheetClosed?: (isBonus: boolean, milestoneHit: number | null) => void;
}

const DELAY_AFTER_SHEET_CLOSES_MS = 380;

export function usePaymentEffects() {
  const reduceMotion = useReduceMotion();
  const [btnState, setBtnState] = useState<BtnState>("idle");
  const [xpFloatActive, setXpFloatActive] = useState(false);
  const [xpAmount, setXpAmount] = useState(50);
  const [bonusActive, setBonusActive] = useState(false);

  const xpY = useRef(new Animated.Value(0)).current;
  const xpOpacity = useRef(new Animated.Value(0)).current;
  const xpScale = useRef(new Animated.Value(0.6)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  const runPayment = useCallback(
    async (
      paymentFn: () => Promise<void | { milestoneHit?: number | null }>,
      callbacks: RunPaymentCallbacks = {}
    ): Promise<boolean> => {
      const isBonus = Math.random() < 0.15;
      const xpAmt = isBonus ? 100 : 50;

      setBtnState("loading");

      const result = await paymentFn();
      const milestoneHit = (result && typeof result === "object" && "milestoneHit" in result)
        ? (result.milestoneHit ?? null)
        : null;

      // Close sheet first; then sound + popup happen on the main screen
      callbacks.onClose?.();
      setBtnState("idle");

      // After sheet has closed: XP rises from bottom with a pop, then fades
      setTimeout(() => {
        setXpAmount(xpAmt);
        setXpFloatActive(true);
        xpY.setValue(100);
        xpOpacity.setValue(0);
        xpScale.setValue(0.5);
        Animated.parallel([
          Animated.sequence([
            Animated.timing(xpOpacity, {
              toValue: 1,
              duration: 120,
              useNativeDriver: false,
            }),
            Animated.delay(400),
            Animated.timing(xpOpacity, {
              toValue: 0,
              duration: 280,
              useNativeDriver: false,
            }),
          ]),
          Animated.timing(xpY, {
            toValue: -90,
            duration: 750,
            useNativeDriver: false,
          }),
          Animated.sequence([
            Animated.timing(xpScale, {
              toValue: 1.2,
              duration: 180,
              useNativeDriver: false,
            }),
            Animated.timing(xpScale, {
              toValue: 1,
              duration: 120,
              useNativeDriver: false,
            }),
          ]),
        ]).start(() => {
          setXpFloatActive(false);
          xpScale.setValue(0.5);
        });

        callbacks.onSuccessAfterSheetClosed?.(isBonus, milestoneHit);
        callbacks.onDex?.(isBonus);
        callbacks.onFlamePulse?.();

        if (isBonus) {
          void soundManager.play("variable_bonus");
          setBonusActive(true);
          callbacks.onBonus?.();
          setTimeout(() => setBonusActive(false), 3300);
        }
      }, DELAY_AFTER_SHEET_CLOSES_MS);

      return isBonus;
    },
    [xpY, xpOpacity]
  );

  return {
    btnState,
    btnScale,
    xpFloatActive,
    xpAmount,
    xpY,
    xpOpacity,
    xpScale,
    bonusActive,
    runPayment,
  };
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  xpFloatWrap: {
    position: "absolute",
    bottom: 200,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 9999,
  },
  xpFloatText: {
    fontSize: 22,
    fontFamily: Fonts.extraBold,
    fontWeight: "800",
    color: XP_BLUE,
    shadowColor: XP_BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  bonusBanner: {
    position: "absolute",
    top: 110,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: BONUS_GOLD,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 16,
    shadowColor: BONUS_GOLD,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.65,
    shadowRadius: 22,
    elevation: 18,
    zIndex: 9999,
  },
  bonusStar: { fontSize: 30 },
  bonusTitle: {
    fontSize: 17,
    fontFamily: Fonts.black,
    fontWeight: "900",
    color: "#000",
    letterSpacing: 1.2,
  },
  bonusSub: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    fontWeight: "600",
    color: "rgba(0,0,0,0.72)",
    marginTop: 2,
  },
});

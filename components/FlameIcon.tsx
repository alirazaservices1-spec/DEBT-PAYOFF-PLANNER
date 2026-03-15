// ─── FlameComponent — 5-level animated flame system ───────────────────────────
// Level 1:  1-6 days   — 32×48,  gentle candle,   1.8-2.0s, glow blur 6px
// Level 2:  7-13 days  — 40×58,  established,     1.4-1.6s, glow blur 8px
// Level 3: 14-29 days  — 50×68,  strong + lick,   1.1-1.3s, glow blur 10px
// Level 4: 30-99 days  — 60×80,  multi-tongue,    0.8-1.0s, shield badge
// Level 5: 100+ days   — 72×96,  legendary sparks,0.6-0.8s, dramatic glow
// At-risk: opacity 0.3-0.5 heartbeat 0.4s, cooler blue tint overlay
// Born: scale 0→full in 0.8s, only on first mount when streakDays === 1
// Transform-origin: bottom-center via translateY pivot trick

import React, { useEffect, useRef } from "react";
import { View, Animated, Easing, StyleSheet } from "react-native";
import Svg, { Path, Ellipse } from "react-native-svg";
import { D } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

// ── Types ──────────────────────────────────────────────────────────────────────
interface FlameProps {
  streakDays: number;
  atRisk?: boolean;
  size?: number;
}

// ── Tier lookup ────────────────────────────────────────────────────────────────
function getTier(days: number): 1 | 2 | 3 | 4 | 5 {
  if (days >= 100) return 5;
  if (days >= 30)  return 4;
  if (days >= 14)  return 3;
  if (days >= 7)   return 2;
  return 1;
}

// ── Per-tier specs ─────────────────────────────────────────────────────────────
// speed: midpoint of the specified range (ms)
// glowBlur: shadowRadius per designer brief
// glowW/H: glow ellipse dimensions
const SPECS = {
  1: { w: 32, h: 48, speed: 1900, glowW: 22, glowH: 8,  glowBlur: 6,  glowOpacity: 0.55 },
  2: { w: 40, h: 58, speed: 1500, glowW: 28, glowH: 11, glowBlur: 8,  glowOpacity: 0.70 },
  3: { w: 50, h: 68, speed: 1200, glowW: 36, glowH: 14, glowBlur: 10, glowOpacity: 0.80 },
  4: { w: 60, h: 80, speed:  900, glowW: 46, glowH: 18, glowBlur: 14, glowOpacity: 0.90 },
  5: { w: 72, h: 96, speed:  700, glowW: 56, glowH: 22, glowBlur: 18, glowOpacity: 1.00 },
} as const;

// ── SVG flame shapes — all use 60×80 viewBox, scaled per tier ─────────────────
// Bottom-anchor: paths end at y≈77-79 to pin flame base to bottom edge

function FlameSVG({ tier, w, h }: { tier: 1|2|3|4|5; w: number; h: number }) {
  const vw = 60, vh = 80;

  if (tier === 1) {
    // Gentle candle — single teardrop
    return (
      <Svg width={w} height={h} viewBox={`0 0 ${vw} ${vh}`}>
        {/* Outer body */}
        <Path
          d="M30 77 C14 77 8 62 12 48 C16 36 23 29 30 14 C37 29 48 38 50 52 C52 66 44 77 30 77Z"
          fill={D.orange}
          opacity={0.97}
        />
        {/* Inner warm core */}
        <Path
          d="M30 73 C20 73 16 62 20 52 C24 44 28 40 30 28 C32 40 38 48 40 58 C40 66 36 73 30 73Z"
          fill="#F7921E"
          opacity={0.88}
        />
      </Svg>
    );
  }

  if (tier === 2) {
    // Established — body + yellow core tip
    return (
      <Svg width={w} height={h} viewBox={`0 0 ${vw} ${vh}`}>
        <Path
          d="M30 77 C12 77 6 60 10 46 C14 32 24 26 28 10 C34 18 46 32 50 50 C54 64 44 77 30 77Z"
          fill={D.orange}
        />
        <Path
          d="M30 73 C18 73 14 60 18 50 C22 40 28 36 30 24 C32 36 40 46 42 58 C42 67 37 73 30 73Z"
          fill="#F7921E"
        />
        <Path
          d="M30 67 C23 67 21 58 23 52 C25 46 28 44 30 36 C32 44 37 52 36 60 C34 64 32 67 30 67Z"
          fill={D.flameTier2Core}
          opacity={0.92}
        />
      </Svg>
    );
  }

  if (tier === 3) {
    // Strong + secondary lick on right
    return (
      <Svg width={w} height={h} viewBox={`0 0 ${vw} ${vh}`}>
        {/* Base — deep orange */}
        <Path
          d="M30 78 C10 78 4 58 8 44 C12 30 22 24 26 6 C32 16 48 30 52 52 C56 68 46 78 30 78Z"
          fill={D.flameTier3Base}
        />
        {/* Secondary lick — right side */}
        <Path
          d="M44 62 C50 48 48 34 40 26 C43 38 42 54 38 62 C40 60 46 50 44 62Z"
          fill={D.orange}
          opacity={0.88}
        />
        {/* Main body */}
        <Path
          d="M30 76 C16 76 12 62 16 50 C20 40 26 34 28 20 C30 32 42 46 44 60 C44 69 38 76 30 76Z"
          fill={D.orange}
        />
        <Path
          d="M30 71 C20 71 18 60 20 52 C22 44 26 40 28 30 C30 40 38 52 38 62 C37 68 34 71 30 71Z"
          fill="#F7921E"
        />
        {/* Yellow tip */}
        <Path
          d="M30 64 C24 64 22 56 24 50 C26 46 28 44 30 38 C32 44 37 54 36 60 C34 63 32 64 30 64Z"
          fill={D.flameTier2Core}
          opacity={0.90}
        />
      </Svg>
    );
  }

  if (tier === 4) {
    // Multi-tongue + very dynamic
    return (
      <Svg width={w} height={h} viewBox={`0 0 ${vw} ${vh}`}>
        {/* Base */}
        <Path
          d="M30 78 C8 78 2 56 6 42 C10 28 20 22 24 4 C30 14 48 28 54 52 C58 68 46 78 30 78Z"
          fill={D.flameTier3Base}
        />
        {/* Left tongue */}
        <Path
          d="M16 54 C10 40 14 28 22 22 C18 34 18 48 20 58 C17 56 12 44 16 54Z"
          fill={D.orange}
          opacity={0.85}
        />
        {/* Right tongue */}
        <Path
          d="M44 56 C50 40 48 28 40 20 C43 34 42 50 38 60 C42 58 47 44 44 56Z"
          fill={D.orange}
          opacity={0.85}
        />
        {/* Main body */}
        <Path
          d="M30 76 C14 76 10 62 14 48 C18 36 26 30 28 16 C30 28 44 44 46 60 C46 69 40 76 30 76Z"
          fill={D.orange}
        />
        <Path
          d="M30 71 C19 71 16 60 18 52 C20 44 26 40 28 28 C30 38 40 52 40 64 C39 69 35 71 30 71Z"
          fill="#F7921E"
        />
        {/* Yellow core */}
        <Path
          d="M30 64 C23 64 21 56 23 50 C25 46 28 44 29 36 C31 44 37 56 36 62 C34 64 32 64 30 64Z"
          fill={D.flameTier2Core}
          opacity={0.92}
        />
      </Svg>
    );
  }

  // Tier 5 — legendary, white-hot core
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${vw} ${vh}`}>
      {/* Deep base */}
      <Path
        d="M30 79 C6 79 0 55 4 40 C8 26 18 20 22 2 C28 12 50 28 56 54 C60 70 47 79 30 79Z"
        fill="#CC3300"
      />
      {/* Far left tongue */}
      <Path
        d="M14 50 C8 36 12 22 22 16 C17 30 18 46 20 58 C14 52 10 40 14 50Z"
        fill={D.flameTier3Base}
        opacity={0.88}
      />
      {/* Far right tongue */}
      <Path
        d="M46 52 C52 36 50 22 42 16 C45 30 44 48 40 60 C44 56 48 42 46 52Z"
        fill={D.flameTier3Base}
        opacity={0.88}
      />
      {/* Main body */}
      <Path
        d="M30 77 C12 77 8 62 12 46 C16 32 24 26 26 10 C28 22 46 40 48 60 C48 70 40 77 30 77Z"
        fill={D.orange}
      />
      <Path
        d="M30 72 C17 72 14 60 16 50 C18 42 24 38 26 26 C28 36 40 52 40 64 C39 69 35 72 30 72Z"
        fill="#F7921E"
      />
      {/* Yellow mid */}
      <Path
        d="M30 65 C22 65 20 56 22 50 C24 44 27 42 28 34 C30 42 37 54 36 62 C34 64 32 65 30 65Z"
        fill={D.flameTier2Core}
        opacity={0.95}
      />
      {/* White-hot core */}
      <Path
        d="M30 58 C25 58 24 52 25 48 C26 44 28 43 29 38 C31 44 35 52 33 57 C32 58 31 58 30 58Z"
        fill={D.flameTier5White}
        opacity={0.92}
      />
    </Svg>
  );
}

// ── Shield badge — Tier 4/5 ────────────────────────────────────────────────────
function ShieldBadge() {
  return (
    <View style={styles.shieldBadge}>
      <Svg width={16} height={18} viewBox="0 0 16 18">
        {/* Shield silhouette */}
        <Path
          d="M8 1 L14 3.5 L14 9 C14 13 11 16 8 17 C5 16 2 13 2 9 L2 3.5 Z"
          fill={D.gold}
          stroke="#A07800"
          strokeWidth={0.8}
        />
        {/* Inner highlight */}
        <Path
          d="M8 3 L12 5 L12 9 C12 12 10 14.5 8 15.5 C6 14.5 4 12 4 9 L4 5 Z"
          fill="#FFE066"
          opacity={0.6}
        />
      </Svg>
    </View>
  );
}

// ── Single spark particle ──────────────────────────────────────────────────────
function Spark({ xRatio, delay, driftX }: { xRatio: number; delay: number; driftX: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 850,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 6,
        left: `${xRatio * 100}%` as any,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: D.flameTier2Core,
        opacity: anim.interpolate({ inputRange: [0, 0.12, 0.8, 1], outputRange: [0, 1, 0.6, 0] }),
        transform: [
          { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -32] }) },
          { translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [0, driftX] }) },
          { scale: anim.interpolate({ inputRange: [0, 0.3, 0.8, 1], outputRange: [0.6, 1.2, 0.8, 0.2] }) },
        ],
      }}
    />
  );
}

// 4 sparks with staggered delays (2-4 visible at any time)
function Sparks() {
  const SPARKS = [
    { xRatio: 0.32, delay: 0,    driftX: -7 },
    { xRatio: 0.52, delay: 210,  driftX: 6  },
    { xRatio: 0.44, delay: 420,  driftX: -4 },
    { xRatio: 0.60, delay: 630,  driftX: 5  },
  ];
  return (
    <>
      {SPARKS.map((s, i) => (
        <Spark key={i} xRatio={s.xRatio} delay={s.delay} driftX={s.driftX} />
      ))}
    </>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function FlameIcon({ streakDays, atRisk = false, size }: FlameProps) {
  const tier = getTier(streakDays);
  const spec = SPECS[tier];

  // Respect optional `size` override (scales proportionally)
  const h = size ?? spec.h;
  const w = size ? Math.round(spec.w * (size / spec.h)) : spec.w;
  const halfH = h / 2;

  // ── Animation values ─────────────────────────────────────────────────────────
  const flickerScaleY = useRef(new Animated.Value(1)).current;
  const flickerScaleX = useRef(new Animated.Value(1)).current;
  const glowOpacity   = useRef(new Animated.Value(0.6)).current;
  const atRiskOpacity = useRef(new Animated.Value(1)).current;
  const bornScale     = useRef(new Animated.Value(streakDays === 1 ? 0 : 1)).current;
  const hasBorn       = useRef(false);

  // ── Flame Born: scale from 0 → 1 in 0.8s when streakDays === 1 ─────────────
  useEffect(() => {
    if (streakDays === 1 && !hasBorn.current) {
      hasBorn.current = true;
      Animated.timing(bornScale, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    } else if (streakDays > 1) {
      bornScale.setValue(1);
    }
  }, [streakDays]);

  // ── Flicker / glow loop ──────────────────────────────────────────────────────
  useEffect(() => {
    if (atRisk) {
      // Stop flicker when at-risk
      flickerScaleY.setValue(1);
      flickerScaleX.setValue(1);
      return;
    }

    const spd = spec.speed;

    // scaleY flicker — grows/shrinks flame (bottom-anchored via translateY trick below)
    const flicker = Animated.loop(
      Animated.sequence([
        Animated.timing(flickerScaleY, { toValue: 1.10, duration: spd * 0.22, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(flickerScaleY, { toValue: 0.92, duration: spd * 0.28, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(flickerScaleY, { toValue: 1.07, duration: spd * 0.22, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(flickerScaleY, { toValue: 1.00, duration: spd * 0.28, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ])
    );

    // scaleX subtle sway
    const sway = Animated.loop(
      Animated.sequence([
        Animated.timing(flickerScaleX, { toValue: 0.94, duration: spd * 0.5, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(flickerScaleX, { toValue: 1.04, duration: spd * 0.5, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ])
    );

    // Glow pulse — synced to flicker
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, { toValue: spec.glowOpacity, duration: spd * 0.5, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(glowOpacity, { toValue: spec.glowOpacity * 0.45, duration: spd * 0.5, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ])
    );

    flicker.start();
    sway.start();
    glow.start();
    return () => { flicker.stop(); sway.stop(); glow.stop(); };
  }, [tier, atRisk, spec.speed]);

  // ── At-risk heartbeat ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!atRisk) {
      atRiskOpacity.setValue(1);
      return;
    }
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(atRiskOpacity, { toValue: 0.30, duration: 200, useNativeDriver: false }),
        Animated.timing(atRiskOpacity, { toValue: 0.50, duration: 200, useNativeDriver: false }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [atRisk]);

  // ── Transform — bottom-center anchor via translateY pivot trick ───────────────
  // Translate pivot to bottom → scale → translate back.
  // This ensures the flame always grows upward from its base.
  const flameTransform = [
    { translateY: halfH },
    { scaleY: atRisk ? 1 : flickerScaleY },
    { scaleX: atRisk ? 1 : flickerScaleX },
    { translateY: -halfH },
  ];

  return (
    // Outer born-scale wraps everything so the initial ignition scales from bottom
    <Animated.View
      style={{
        width: w,
        height: h,
        alignItems: "center",
        transform: [
          { translateY: halfH },
          { scaleY: bornScale },
          { translateY: -halfH },
        ],
        opacity: atRisk ? atRiskOpacity : 1,
      }}
    >
      {/* Glow ellipse — bottom of flame */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: -3,
          alignSelf: "center",
          width: spec.glowW,
          height: spec.glowH,
          borderRadius: spec.glowH / 2,
          backgroundColor: D.orange,
          opacity: atRisk ? 0.18 : glowOpacity,
          shadowColor: D.orange,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.95,
          shadowRadius: spec.glowBlur,
        }}
      />

      {/* Flame body — flickers from bottom-center */}
      <Animated.View style={{ transform: flameTransform }}>
        <FlameSVG tier={tier} w={w} h={h} />
      </Animated.View>

      {/* At-risk cooler tint overlay — shifts flame to bluish-grey */}
      {atRisk && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: w,
            height: h,
            borderRadius: 4,
            backgroundColor: "#3B6EA0",
            opacity: 0.38,
          }}
          pointerEvents="none"
        />
      )}

      {/* Tier 5 spark particles */}
      {tier === 5 && !atRisk && <Sparks />}

      {/* Tier 4/5 shield badge — top-right corner */}
      {tier >= 4 && !atRisk && <ShieldBadge />}
    </Animated.View>
  );
}

// Named alias — FlameComponent is the canonical export per designer spec
export const FlameComponent = FlameIcon;

// Default export for convenience
export default FlameIcon;

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  shieldBadge: {
    position: "absolute",
    top: -10,
    right: -12,
    width: 18,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: D.gold,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
  },
});

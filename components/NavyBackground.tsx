/**
 * NavyBackground — reusable dark navy/gold background layer.
 *
 * Exact replica of the HTML .sbg + .sgrid + .orb layers:
 *
 *  Layer 1 — LinearGradient base
 *             linear-gradient(160deg, #0f172a 0%, #1e2a45 55%, #0d1f38 100%)
 *
 *  Layer 2 — .sbg embedded radial gradients (LARGE, full-screen ambient glows)
 *             radial-gradient(ellipse at 30% 20%, rgba(245,200,66,.18) 0%, transparent 55%)
 *             radial-gradient(ellipse at 75% 80%, rgba(58,122,16,.12)  0%, transparent 50%)
 *
 *  Layer 3 — .orb elements (smaller focused orbs with blur→transparent edge)
 *             o1: 320×320 amber,  top:-80, right:-60
 *             o2: 260×260 green,  bottom:80, left:-60
 *             o3: 180×180 blue,   top:40%, left:-40
 *
 *  Layer 4 — .sgrid texture (28px semi-transparent grid lines, 3% white)
 *
 *  Layer 5 — children (z-index: 2 equivalent, rendered last)
 *
 * Usage:
 *   <NavyBackground>
 *     <ScrollView>…</ScrollView>
 *   </NavyBackground>
 */

import React from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Defs,
  RadialGradient,
  Pattern,
  Rect,
  Line,
  Stop,
} from "react-native-svg";

interface Props {
  children?: React.ReactNode;
  style?: object;
}

export function NavyBackground({ children, style }: Props) {
  const { width: W, height: H } = useWindowDimensions();

  // ── Ambient glow radii (CSS "ellipse farthest-corner" approximation) ──
  // Amber ambient: center at 30%W, 20%H — "transparent 55%" means gradient
  // fades out over 55% of the farthest-corner distance.
  // For a typical phone ~390×844: farthest corner ≈ 728px → 55% ≈ 400px
  // We use Math.hypot for accuracy at any screen size.
  const ambAmbientCx = W * 0.30;
  const ambAmbientCy = H * 0.20;
  const ambAmbientR  = Math.hypot(
    Math.max(ambAmbientCx, W - ambAmbientCx),
    Math.max(ambAmbientCy, H - ambAmbientCy)
  ) * 0.55;

  // Green ambient: center at 75%W, 80%H — "transparent 50%"
  const grnAmbientCx = W * 0.75;
  const grnAmbientCy = H * 0.80;
  const grnAmbientR  = Math.hypot(
    Math.max(grnAmbientCx, W - grnAmbientCx),
    Math.max(grnAmbientCy, H - grnAmbientCy)
  ) * 0.50;

  // ── Orb positions (position:absolute equivalent) ──
  // o1: 320×320 amber, top:-80, right:-60
  //   CSS right:-60 means right EDGE is 60px past the screen's right edge
  //   → right_edge = W + 60  → center_x = W + 60 - half_width = W + 60 - 160 = W - 100
  //   → top:-80 means top_edge = -80  → center_y = -80 + 160 = 80
  const ambCx = W + 60 - 160;   // = W - 100
  const ambCy = -80 + 160;      // = 80
  const ambR  = 160;

  // o2: 260×260 green, bottom:80, left:-60  → centre at (-60+130, H-80-130)
  const grnCx = -60 + 130;
  const grnCy = H - 80 - 130;
  const grnR  = 130;

  // o3: 180×180 blue, top:40%, left:-40  → centre at (-40+90, H*0.4+90)
  const bluCx = -40 + 90;
  const bluCy = H * 0.4 + 90;
  const bluR  = 90;

  return (
    <View style={[styles.root, style]}>

      {/* ── Layer 1: base linear gradient ── */}
      <LinearGradient
        colors={["#0f172a", "#1e2a45", "#0d1f38"]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Layers 2 + 3 + 4: all rendered in one SVG for performance ── */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
          <Defs>

            {/* === LAYER 2: .sbg ambient radial gradients === */}

            {/* Amber ambient — radial-gradient(ellipse at 30% 20%, rgba(245,200,66,.18) → transparent 55%) */}
            <RadialGradient
              id="bgAmber"
              cx={ambAmbientCx} cy={ambAmbientCy} r={ambAmbientR}
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0%"   stopColor="rgb(245,200,66)" stopOpacity={0.18} />
              <Stop offset="70%"  stopColor="rgb(245,200,66)" stopOpacity={0.04} />
              <Stop offset="100%" stopColor="rgb(245,200,66)" stopOpacity={0}    />
            </RadialGradient>

            {/* Green ambient — radial-gradient(ellipse at 75% 80%, rgba(58,122,16,.12) → transparent 50%) */}
            <RadialGradient
              id="bgGreen"
              cx={grnAmbientCx} cy={grnAmbientCy} r={grnAmbientR}
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0%"   stopColor="rgb(58,122,16)" stopOpacity={0.12} />
              <Stop offset="70%"  stopColor="rgb(58,122,16)" stopOpacity={0.03} />
              <Stop offset="100%" stopColor="rgb(58,122,16)" stopOpacity={0}    />
            </RadialGradient>

            {/* === LAYER 3: .orb focused glow orbs === */}

            {/* Amber orb — rgba(184,106,0,.22), 320×320 */}
            <RadialGradient id="orbAmber" cx="50%" cy="50%" r="50%">
              <Stop offset="0%"   stopColor="rgb(184,106,0)" stopOpacity={0.22} />
              <Stop offset="60%"  stopColor="rgb(184,106,0)" stopOpacity={0.07} />
              <Stop offset="100%" stopColor="rgb(184,106,0)" stopOpacity={0}    />
            </RadialGradient>

            {/* Green orb — rgba(58,122,16,.15), 260×260 */}
            <RadialGradient id="orbGreen" cx="50%" cy="50%" r="50%">
              <Stop offset="0%"   stopColor="rgb(58,122,16)" stopOpacity={0.15} />
              <Stop offset="60%"  stopColor="rgb(58,122,16)" stopOpacity={0.04} />
              <Stop offset="100%" stopColor="rgb(58,122,16)" stopOpacity={0}    />
            </RadialGradient>

            {/* Blue orb — rgba(26,111,196,.18), 180×180 */}
            <RadialGradient id="orbBlue" cx="50%" cy="50%" r="50%">
              <Stop offset="0%"   stopColor="rgb(26,111,196)" stopOpacity={0.18} />
              <Stop offset="60%"  stopColor="rgb(26,111,196)" stopOpacity={0.05} />
              <Stop offset="100%" stopColor="rgb(26,111,196)" stopOpacity={0}    />
            </RadialGradient>

            {/* === LAYER 4: .sgrid 28px grid pattern === */}
            <Pattern id="navyGrid" x={0} y={0} width={28} height={28} patternUnits="userSpaceOnUse">
              <Line x1={0} y1={0} x2={0}  y2={28} stroke="rgba(255,255,255,0.03)" strokeWidth={1} />
              <Line x1={0} y1={0} x2={28} y2={0}  stroke="rgba(255,255,255,0.03)" strokeWidth={1} />
            </Pattern>

          </Defs>

          {/* LAYER 2: ambient glows — full screen rects so gradient fills whole screen */}
          <Rect x={0} y={0} width={W} height={H} fill="url(#bgAmber)" />
          <Rect x={0} y={0} width={W} height={H} fill="url(#bgGreen)" />

          {/* LAYER 3: focused orbs */}
          {/* Orb 1 — amber, top-right */}
          <Rect
            x={ambCx - ambR} y={ambCy - ambR}
            width={ambR * 2}  height={ambR * 2}
            fill="url(#orbAmber)"
          />
          {/* Orb 2 — green, bottom-left */}
          <Rect
            x={grnCx - grnR} y={grnCy - grnR}
            width={grnR * 2}  height={grnR * 2}
            fill="url(#orbGreen)"
          />
          {/* Orb 3 — blue, mid-left */}
          <Rect
            x={bluCx - bluR} y={bluCy - bluR}
            width={bluR * 2}  height={bluR * 2}
            fill="url(#orbBlue)"
          />

          {/* LAYER 4: grid overlay */}
          <Rect x={0} y={0} width={W} height={H} fill="url(#navyGrid)" />

        </Svg>
      </View>

      {/* ── Layer 5: content (z-index: 2) ── */}
      <View style={styles.content}>
        {children}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

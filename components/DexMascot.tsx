// ─── DexMascot — Compact orange fox/woodland creature ─────────────────────────
// Design: warm orange-amber #E8850A body, cream belly/inner ears #FFF0D0
// Head = 45% of total height | Eyes = 35% of face width
// Bold 2D vector style, readable at 40×40px
// 8 animation states using react-native-reanimated + react-native Animated

import React, { useEffect, useRef, useState } from "react";
import { View, Animated, Easing } from "react-native";
import Svg, { Circle, Ellipse, Path, Rect, G } from "react-native-svg";
import ReAnimated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  cancelAnimation,
  Easing as REasing,
} from "react-native-reanimated";
import { DexState } from "@/context/GameContext";

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  body:     "#E8850A",   // warm orange-amber
  bodyDk:   "#C46A04",   // darker orange for arms/outlines
  cream:    "#FFF5E6",   // belly + tail tip
  earInner: "#F5C4A0",   // inner ears (light pink/peach)
  outline:  "#3D1A00",   // dark brown outline
  eye:      "#1A0A00",   // near-black pupil
  iris:     "#C87800",   // warm amber iris
  nose:     "#8B4513",   // warm brown nose
  cheek:    "#FF7733",   // warm cheek blush
  muzzle:   "#FFE4B0",   // muzzle area slightly lighter than cream
  gold:     "#FFD700",   // sparkle/star
  blue:     "#A0CFFF",   // zzz text
  tail:     "#E8850A",   // tail (same as body)
  tailTip:  "#FFF5E6",   // fluffy tail tip
};

// ─── Eyes per state ───────────────────────────────────────────────────────────
function Eyes({ state }: { state: DexState }) {
  if (state === "sleeping") {
    return (
      <>
        <Path d="M26 40 Q33 35 40 40" stroke={C.eye} strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <Path d="M48 40 Q55 35 62 40" stroke={C.eye} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      </>
    );
  }
  if (state === "celebrating") {
    return (
      <>
        {/* Star eyes */}
        <Circle cx={33} cy={40} r={8} fill={C.gold} />
        <Path d="M33 31 L34.5 37 L40 38 L35.5 42 L37 48 L33 44.5 L29 48 L30.5 42 L26 38 L31.5 37 Z"
          fill="#FF6600" opacity={0.9} />
        <Circle cx={55} cy={40} r={8} fill={C.gold} />
        <Path d="M55 31 L56.5 37 L62 38 L57.5 42 L59 48 L55 44.5 L51 48 L52.5 42 L48 38 L53.5 37 Z"
          fill="#FF6600" opacity={0.9} />
      </>
    );
  }
  if (state === "worried") {
    return (
      <>
        {/* Angled/concerned brows + narrowed eyes */}
        <Path d="M26 35 L40 38" stroke={C.eye} strokeWidth={2} strokeLinecap="round" />
        <Path d="M48 38 L62 35" stroke={C.eye} strokeWidth={2} strokeLinecap="round" />
        <Circle cx={33} cy={42} r={6} fill="white" />
        <Circle cx={33} cy={43} r={4.5} fill={C.iris} />
        <Circle cx={33} cy={43} r={3.5} fill={C.eye} />
        <Circle cx={35} cy={41} r={1.2} fill="white" />
        <Circle cx={55} cy={42} r={6} fill="white" />
        <Circle cx={55} cy={43} r={4.5} fill={C.iris} />
        <Circle cx={55} cy={43} r={3.5} fill={C.eye} />
        <Circle cx={57} cy={41} r={1.2} fill="white" />
      </>
    );
  }
  if (state === "surprised") {
    return (
      <>
        {/* Wide eyes at 150% */}
        <Circle cx={33} cy={40} r={9.5} fill="white" />
        <Circle cx={33} cy={41} r={7} fill={C.iris} />
        <Circle cx={33} cy={41} r={5.5} fill={C.eye} />
        <Circle cx={35.5} cy={38} r={2} fill="white" />
        <Circle cx={55} cy={40} r={9.5} fill="white" />
        <Circle cx={55} cy={41} r={7} fill={C.iris} />
        <Circle cx={55} cy={41} r={5.5} fill={C.eye} />
        <Circle cx={57.5} cy={38} r={2} fill="white" />
      </>
    );
  }
  if (state === "encouraging") {
    return (
      <>
        {/* Warm squint - happy half-closed */}
        <Path d="M25 38 Q33 44 41 38" stroke={C.eye} strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <Circle cx={33} cy={42} r={5} fill="white" opacity={0.3} />
        <Path d="M47 38 Q55 44 63 38" stroke={C.eye} strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <Circle cx={55} cy={42} r={5} fill="white" opacity={0.3} />
      </>
    );
  }
  if (state === "happy") {
    return (
      <>
        {/* Happy wide eyes */}
        <Circle cx={33} cy={39} r={8} fill="white" />
        <Circle cx={33} cy={40} r={5.5} fill={C.iris} />
        <Circle cx={33} cy={40} r={4.5} fill={C.eye} />
        <Circle cx={35} cy={37} r={1.8} fill="white" />
        <Circle cx={55} cy={39} r={8} fill="white" />
        <Circle cx={55} cy={40} r={5.5} fill={C.iris} />
        <Circle cx={55} cy={40} r={4.5} fill={C.eye} />
        <Circle cx={57} cy={37} r={1.8} fill="white" />
      </>
    );
  }
  // idle, onboarding_clipboard — normal eyes
  return (
    <>
      <Circle cx={33} cy={41} r={7} fill="white" />
      <Circle cx={33} cy={42} r={5} fill={C.iris} />
      <Circle cx={33} cy={42} r={4} fill={C.eye} />
      <Circle cx={35} cy={39} r={1.5} fill="white" />
      <Circle cx={55} cy={41} r={7} fill="white" />
      <Circle cx={55} cy={42} r={5} fill={C.iris} />
      <Circle cx={55} cy={42} r={4} fill={C.eye} />
      <Circle cx={57} cy={39} r={1.5} fill="white" />
    </>
  );
}

// ─── Mouth per state ──────────────────────────────────────────────────────────
function Mouth({ state }: { state: DexState }) {
  if (state === "sleeping") {
    return <Path d="M38 59 Q44 62 50 59" stroke={C.eye} strokeWidth={2} fill="none" strokeLinecap="round" />;
  }
  if (state === "happy" || state === "celebrating" || state === "encouraging") {
    return (
      <>
        <Path d="M32 57 Q44 67 56 57" stroke={C.eye} strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <Path d="M32 57 Q44 69 56 57" fill="rgba(26,10,0,0.12)" />
      </>
    );
  }
  if (state === "worried") {
    return <Path d="M36 59 Q44 55 52 59" stroke={C.eye} strokeWidth={2.5} fill="none" strokeLinecap="round" />;
  }
  if (state === "surprised") {
    return <Ellipse cx={44} cy={59} rx={5.5} ry={4} fill={C.eye} />;
  }
  return <Path d="M36 58 Q44 63 52 58" stroke={C.eye} strokeWidth={2} fill="none" strokeLinecap="round" />;
}

// ─── Arms per state ───────────────────────────────────────────────────────────
// Left shoulder at (22, 80), arm extends left (negative x direction)
// Right shoulder at (66, 80), arm extends right (positive x direction)
// Rotation: negative = up, positive = down (for left arm)
function Arms({ state }: { state: DexState }) {
  const ARM_ANGLES: Record<DexState, [number, number]> = {
    idle:                 [15,  -15],
    happy:               [-55,   55],
    celebrating:         [-82,   82],
    worried:             [ 30,  -30],
    sleeping:            [ 30,  -30],
    encouraging:         [ 15,  -82],
    surprised:           [  2,   -2],
    onboarding_clipboard:[-20,   20],
  };
  const [la, ra] = ARM_ANGLES[state] ?? [15, -15];

  return (
    <>
      {/* Left arm — rotates around left shoulder (22,80) */}
      <G transform={`translate(22,80) rotate(${la})`}>
        <Rect x={-20} y={-4} width={22} height={8} rx={4} fill={C.bodyDk} />
        <Circle cx={-20} cy={0} r={5.5} fill={C.bodyDk} />
      </G>
      {/* Right arm — rotates around right shoulder (66,80) */}
      <G transform={`translate(66,80) rotate(${ra})`}>
        <Rect x={-2} y={-4} width={22} height={8} rx={4} fill={C.bodyDk} />
        <Circle cx={20} cy={0} r={5.5} fill={C.bodyDk} />
      </G>
    </>
  );
}

// ─── Clipboard (onboarding_clipboard only) ────────────────────────────────────
function Clipboard() {
  return (
    <G transform="translate(30, 88)">
      <Rect x={0} y={0} width={28} height={22} rx={3} fill="white" stroke="#C0A060" strokeWidth={1.2} />
      <Rect x={10} y={-4} width={8} height={7} rx={2} fill="#C0A060" />
      <Path d="M4 8 L24 8" stroke="#CCC" strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M4 13 L24 13" stroke="#CCC" strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M4 18 L16 18" stroke="#CCC" strokeWidth={1.5} strokeLinecap="round" />
    </G>
  );
}

// ─── Tail ─────────────────────────────────────────────────────────────────────
// Raised tail for onboarding_clipboard, normal for others
function Tail({ raised = false }: { raised?: boolean }) {
  if (raised) {
    return (
      <G>
        <Path d="M64 78 C80 60 90 70 86 84 C82 96 72 100 66 94 C70 88 72 76 64 78Z"
          fill={C.tail} />
        <Path d="M72 90 C76 84 84 88 80 96 C76 100 68 96 72 90Z"
          fill={C.cream} />
      </G>
    );
  }
  return (
    <G>
      <Path d="M64 88 C80 80 90 92 86 104 C82 114 70 116 64 110 C68 104 72 92 64 88Z"
        fill={C.tail} />
      <Path d="M72 106 C76 100 84 106 80 112 C76 116 66 112 72 106Z"
        fill={C.cream} />
    </G>
  );
}

// ─── Static fox SVG — all parts together ─────────────────────────────────────
function FoxSVG({ state, blinkAlpha }: { state: DexState; blinkAlpha?: number }) {
  const cheekAlpha = (state === "happy" || state === "celebrating") ? 0.38 : 0.18;
  const isClipboard = state === "onboarding_clipboard";
  const isSleeping = state === "sleeping";

  return (
    <Svg width={88} height={120} viewBox="0 0 88 120">

      {/* Drop shadow */}
      <Ellipse cx={44} cy={117} rx={22} ry={5} fill="rgba(0,0,0,0.15)" />

      {/* Tail behind body */}
      <Tail raised={isClipboard} />

      {/* Body */}
      <Rect x={20} y={66} width={48} height={48} rx={22} fill={C.body} />

      {/* Belly */}
      <Ellipse cx={44} cy={92} rx={14} ry={18} fill={C.cream} />

      {/* Arms — rendered on top of body sides */}
      <Arms state={state} />

      {/* Clipboard item */}
      {isClipboard && <Clipboard />}

      {/* Neck connector (body → head) */}
      <Rect x={34} y={62} width={20} height={10} rx={0} fill={C.body} />

      {/* Left ear (outer) */}
      <Path d="M16 36 L25 8 L36 36Z" fill={C.body} />
      {/* Left ear (inner) */}
      <Path d="M19 34 L25 13 L33 34Z" fill={C.earInner} />

      {/* Right ear (outer) */}
      <Path d="M52 36 L63 8 L72 36Z" fill={C.body} />
      {/* Right ear (inner) */}
      <Path d="M55 34 L63 13 L69 34Z" fill={C.earInner} />

      {/* Head circle — 45% of 120 = 54px tall → radius 27, cy=41 → y:14–68 */}
      <Circle cx={44} cy={42} r={27} fill={C.body} />

      {/* Muzzle area */}
      <Ellipse cx={44} cy={55} rx={11} ry={8} fill={C.muzzle} />

      {/* Nose */}
      <Ellipse cx={44} cy={50} rx={4} ry={3} fill={C.nose} />

      {/* Cheek blush */}
      <Circle cx={21} cy={51} r={7} fill={C.cheek} opacity={cheekAlpha} />
      <Circle cx={67} cy={51} r={7} fill={C.cheek} opacity={cheekAlpha} />

      {/* Eyes — state-driven */}
      <Eyes state={state} />

      {/* Eye blink overlay: thin rect that collapses scaleY via parent */}
      {blinkAlpha !== undefined && blinkAlpha > 0 && (
        <>
          <Rect x={25} y={36} width={18} height={12} rx={6} fill={C.body} opacity={blinkAlpha} />
          <Rect x={47} y={36} width={18} height={12} rx={6} fill={C.body} opacity={blinkAlpha} />
        </>
      )}

      {/* Mouth — state-driven */}
      <Mouth state={state} />

      {/* Sleeping Zzz (static, animated in parent) */}
      {isSleeping && (
        <>
          <Path d="M70 30 L76 30 L70 24 L76 24" stroke={C.blue} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
          <Path d="M77 22 L84 22 L77 15 L84 15" stroke={C.blue} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.7} />
        </>
      )}
    </Svg>
  );
}

// ─── Floating Zzz overlay (sleeping state) ───────────────────────────────────
function ZzzFloat({ visible }: { visible: boolean }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) { anim.setValue(0); return; }
    const loop = Animated.loop(
      Animated.timing(anim, { toValue: 1, duration: 1500, easing: Easing.linear, useNativeDriver: false })
    );
    loop.start();
    return () => loop.stop();
  }, [visible]);

  if (!visible) return null;

  const floatY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -18] });
  const opacity = anim.interpolate({ inputRange: [0, 0.15, 0.8, 1], outputRange: [0, 1, 0.7, 0] });

  return (
    <Animated.Text
      style={{
        position: "absolute",
        top: 4,
        right: 4,
        fontSize: 16,
        fontWeight: "900",
        color: "#A0C4FF",
        opacity,
        transform: [{ translateY: floatY }],
      }}
    >
      z
    </Animated.Text>
  );
}

// ─── Main DexMascot component ─────────────────────────────────────────────────
interface Props {
  state: DexState;
  size?: number;
}

export function DexMascot({ state, size = 88 }: Props) {
  // Blink state: 0 = eyes open, 1 = eyes closed (used as blinkAlpha in FoxSVG)
  const [blinkAlpha, setBlinkAlpha] = useState(0);
  const blinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── react-native-reanimated values for main body transform ─────────────────
  const translateY = useSharedValue(0);
  const scaleX     = useSharedValue(1);
  const scaleY     = useSharedValue(1);
  const rotate     = useSharedValue(0);

  // ── Idle eye blink ────────────────────────────────────────────────────────
  useEffect(() => {
    if (state !== "idle") { setBlinkAlpha(0); return; }

    function scheduleBlink() {
      const wait = 3500 + Math.random() * 2000;
      blinkTimer.current = setTimeout(() => {
        setBlinkAlpha(1);
        setTimeout(() => {
          setBlinkAlpha(0);
          scheduleBlink();
        }, 140);
      }, wait);
    }
    scheduleBlink();
    return () => { if (blinkTimer.current) clearTimeout(blinkTimer.current); };
  }, [state]);

  // ── Main body animations ──────────────────────────────────────────────────
  useEffect(() => {
    cancelAnimation(translateY);
    cancelAnimation(scaleX);
    cancelAnimation(scaleY);
    cancelAnimation(rotate);
    translateY.value = 0;
    scaleX.value = 1;
    scaleY.value = 1;
    rotate.value = 0;

    switch (state) {
      case "idle":
        // Gentle vertical bob 6px, 3.0s loop
        translateY.value = withRepeat(
          withSequence(
            withTiming(-6, { duration: 1500, easing: REasing.inOut(REasing.sin) }),
            withTiming(0,  { duration: 1500, easing: REasing.inOut(REasing.sin) })
          ), -1, false
        );
        break;

      case "happy":
        // Compress then launch 12px, 0.5s per cycle
        scaleY.value = withRepeat(
          withSequence(
            withTiming(0.82, { duration: 100, easing: REasing.out(REasing.cubic) }),
            withTiming(1.08, { duration: 120 }),
            withTiming(1,    { duration: 100 })
          ), -1, false
        );
        translateY.value = withRepeat(
          withSequence(
            withTiming(-12, { duration: 220, easing: REasing.out(REasing.cubic) }),
            withTiming(0,   { duration: 280, easing: REasing.in(REasing.bounce) })
          ), -1, false
        );
        break;

      case "celebrating":
        // Jump + 180° spin loops
        translateY.value = withRepeat(
          withSequence(
            withSpring(-18, { damping: 5, stiffness: 400 }),
            withSpring(0,   { damping: 7, stiffness: 200 })
          ), -1, false
        );
        rotate.value = withRepeat(
          withTiming(360, { duration: 900, easing: REasing.inOut(REasing.cubic) }),
          3, false
        );
        scaleX.value = withRepeat(
          withSequence(
            withTiming(1.08, { duration: 200 }),
            withTiming(0.95, { duration: 200 }),
            withTiming(1,    { duration: 200 })
          ), -1, false
        );
        break;

      case "worried":
        // Brief: bob 2.5s ease-in-out loop (faster than idle 3s, shows anxiety)
        translateY.value = withRepeat(
          withSequence(
            withTiming(-8, { duration: 1250, easing: REasing.inOut(REasing.sin) }),
            withTiming( 0, { duration: 1250, easing: REasing.inOut(REasing.sin) })
          ), -1, false
        );
        break;

      case "sleeping":
        // Brief: bob 5s ease-in-out loop — slow, minimal breathing rhythm
        translateY.value = withRepeat(
          withSequence(
            withTiming(-3, { duration: 2500, easing: REasing.inOut(REasing.sin) }),
            withTiming( 0, { duration: 2500, easing: REasing.inOut(REasing.sin) })
          ), -1, false
        );
        scaleX.value = withRepeat(
          withSequence(
            withTiming(1.03, { duration: 2500, easing: REasing.inOut(REasing.sin) }),
            withTiming(1,    { duration: 2500, easing: REasing.inOut(REasing.sin) })
          ), -1, false
        );
        break;

      case "encouraging":
        // Head nod 1.0s + slight rise
        translateY.value = withRepeat(
          withSequence(
            withTiming(-5, { duration: 400, easing: REasing.inOut(REasing.quad) }),
            withTiming( 2, { duration: 300, easing: REasing.inOut(REasing.quad) }),
            withTiming( 0, { duration: 300 })
          ), -1, false
        );
        rotate.value = withRepeat(
          withSequence(
            withTiming(-4, { duration: 500, easing: REasing.inOut(REasing.sin) }),
            withTiming( 4, { duration: 500, easing: REasing.inOut(REasing.sin) }),
            withTiming( 0, { duration: 300 })
          ), -1, false
        );
        break;

      case "onboarding_clipboard":
        // Finger-tap clipboard rhythm: slight forward tilt + bob
        translateY.value = withRepeat(
          withSequence(
            withTiming(-4, { duration: 300, easing: REasing.out(REasing.cubic) }),
            withTiming( 0, { duration: 300, easing: REasing.in(REasing.cubic) })
          ), -1, false
        );
        rotate.value = withRepeat(
          withSequence(
            withTiming(-3, { duration: 400 }),
            withTiming( 3, { duration: 400 }),
            withTiming( 0, { duration: 200 })
          ), -1, false
        );
        break;

      case "surprised":
        // Quick scale-up pop then settle
        scaleY.value = withSequence(
          withTiming(1.20, { duration: 80, easing: REasing.out(REasing.cubic) }),
          withTiming(0.90, { duration: 80 }),
          withSpring(1.0, { damping: 8, stiffness: 300 })
        );
        scaleX.value = withSequence(
          withTiming(1.15, { duration: 80, easing: REasing.out(REasing.cubic) }),
          withTiming(0.90, { duration: 80 }),
          withSpring(1.0, { damping: 8, stiffness: 300 })
        );
        translateY.value = withSequence(
          withTiming(-10, { duration: 150, easing: REasing.out(REasing.cubic) }),
          withSpring(0, { damping: 6, stiffness: 250 })
        );
        break;
    }
  }, [state]);

  const motionStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scaleX:     scaleX.value    },
      { scaleY:     scaleY.value    },
      { rotate:     `${rotate.value}deg` },
    ],
    opacity: state === "sleeping" ? 0.75 : 1,
  }));

  const scale = size / 88;

  return (
    <ReAnimated.View style={[{ width: size, height: size * 1.36, alignItems: "center", justifyContent: "center" }, motionStyle]}>
      <View style={{ transform: [{ scale }], width: 88, height: 120 }}>
        <FoxSVG state={state} blinkAlpha={blinkAlpha} />
        <ZzzFloat visible={state === "sleeping"} />
      </View>
    </ReAnimated.View>
  );
}

export default DexMascot;

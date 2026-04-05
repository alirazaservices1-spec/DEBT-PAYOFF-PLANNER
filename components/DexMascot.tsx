// ─── DexMascot — Compact orange fox/woodland creature ─────────────────────────
// Design: warm orange-amber #E8850A body, cream belly/inner ears #FFF0D0
// Head = 45% of total height | Eyes = 35% of face width
// Bold 2D vector style, readable at 40×40px
// 8 animation states using react-native-reanimated + react-native Animated

import React, { useEffect, useRef, useState, useCallback } from "react";
import { View, Animated, Easing } from "react-native";
import Svg, { Circle, Ellipse, Path, Rect, G, Text as SvgText } from "react-native-svg";
import ReAnimated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  cancelAnimation,
  runOnJS,
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
  eye:      "#2A1808",   // deep warm brown pupil
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

// ─── Static bear SVG (older icon) ───────────────────────────────────────────
// Client request: remove the current "dex character" and use the older bear icon.
function FoxSVG({ state, blinkAlpha }: { state: DexState; blinkAlpha?: number }) {
  // Expression rendering driven by the HTML expression-sheet you shared.
  // We map our app's DexState -> expression "style" (happy / celebrate / nervous / sleepy / surprised / focused).
  const expr = (() => {
    switch (state) {
      case "happy":
        return {
          eyeCxL: 41,
          eyeCxR: 69,
          eyeCy: 52,
          eyeR: 10,
          blush: 0.4,
          mouth: "M42,73 Q55,83 68,73",
          browL: "M32,40 Q41,36 48,40",
          browR: "M62,40 Q69,36 78,40",
          flairL: "✨",
          flairR: "⭐",
          flairLY: 26,
          flairRY: 22,
          halfEyes: false,
          sweat: false,
        };
      case "celebrating":
        return {
          eyeCxL: 41,
          eyeCxR: 69,
          eyeCy: 50,
          eyeR: 11,
          blush: 0.8,
          mouth: "M40,71 Q55,87 70,71",
          browL: "M31,35 Q41,28 49,34",
          browR: "M61,34 Q69,28 79,35",
          flairL: "🎉",
          flairR: "🎊",
          flairLY: 18,
          flairRY: 18,
          halfEyes: false,
          sweat: false,
        };
      case "encouraging":
        return {
          eyeCxL: 41,
          eyeCxR: 69,
          eyeCy: 53,
          eyeR: 10,
          blush: 0.0,
          mouth: "M43,75 Q55,79 67,75",
          browL: "M32,41 Q41,37 49,42",
          browR: "M61,42 Q69,37 78,41",
          flairL: "💪",
          flairR: "",
          flairLY: 24,
          flairRY: 24,
          halfEyes: false,
          sweat: false,
        };
      case "worried":
        return {
          eyeCxL: 41,
          eyeCxR: 69,
          eyeCy: 53,
          eyeR: 9,
          blush: 0.2,
          mouth: "M43,74 Q55,70 67,74",
          browL: "M33,42 Q41,39 48,43",
          browR: "M62,43 Q69,39 77,42",
          flairL: "😅",
          flairR: "",
          flairLY: 20,
          flairRY: 20,
          halfEyes: false,
          sweat: true,
        };
      case "sleeping":
        return {
          eyeCxL: 41,
          eyeCxR: 69,
          eyeCy: 54,
          eyeR: 10,
          blush: 0.1,
          mouth: "M44,74 Q55,78 66,74",
          browL: "M33,42 Q41,40 48,42",
          browR: "M62,42 Q69,40 77,42",
          flairL: "💤",
          flairR: "",
          flairLY: 18,
          flairRY: 18,
          halfEyes: true,
          sweat: false,
        };
      case "surprised":
        return {
          eyeCxL: 41,
          eyeCxR: 69,
          eyeCy: 51,
          eyeR: 12,
          blush: 0.15,
          mouth: "M46,72 Q55,82 64,72",
          browL: "M32,35 Q41,28 48,35",
          browR: "M62,35 Q69,28 78,35",
          flairL: "😲",
          flairR: "⚡",
          flairLY: 20,
          flairRY: 22,
          halfEyes: false,
          sweat: false,
        };
      case "onboarding_clipboard":
      case "idle":
      default:
        // "focused" from your sheet
        return {
          eyeCxL: 41,
          eyeCxR: 69,
          eyeCy: 53,
          eyeR: 9,
          blush: 0.0,
          mouth: "M44,74 Q55,78 66,74",
          browL: "M33,40 Q41,37 48,40",
          browR: "M62,40 Q69,37 77,40",
          flairL: "",
          flairR: "",
          flairLY: 26,
          flairRY: 26,
          halfEyes: false,
          sweat: false,
          // Client request: do not show the 📋 flair.
          // (We keep the rest of the "focused" facial expression.)
        };
    }
  })();

  const eyeFill = "#2A1808";
  const browStroke = "#8B5E20";
  const mouthStroke = "#8B5E20";

  const shineR = expr.halfEyes ? 0 : 4;
  const smallHighlightOpacity = expr.halfEyes ? 0.0 : 0.6;

  const sleepyClipL = expr.halfEyes ? (
    <Rect x={31} y={50} width={20} height={14} fill="#FFFDF7" />
  ) : null;
  const sleepyClipR = expr.halfEyes ? (
    <Rect x={59} y={50} width={20} height={14} fill="#FFFDF7" />
  ) : null;

  const blinkEyes = blinkAlpha !== undefined && blinkAlpha > 0 && state === "idle" ? (
    <>
      <Rect x={31} y={50} width={20} height={14} fill="#D9A045" opacity={blinkAlpha} />
      <Rect x={59} y={50} width={20} height={14} fill="#D9A045" opacity={blinkAlpha} />
    </>
  ) : null;

  return (
    <Svg width={88} height={120} viewBox="0 0 110 118" preserveAspectRatio="xMidYMid meet">
      {/* Ears */}
      <Circle cx="22" cy="32" r="17" fill="#C8882A" />
      <Circle cx="88" cy="32" r="17" fill="#C8882A" />
      <Circle cx="22" cy="32" r="10" fill="#D9A045" opacity="0.7" />
      <Circle cx="88" cy="32" r="10" fill="#D9A045" opacity="0.7" />

      {/* Head */}
      <Circle cx="55" cy="57" r="36" fill="#D9A045" />
      <Ellipse
        cx="43"
        cy="42"
        rx="10"
        ry="7"
        fill="white"
        opacity="0.18"
        rotation="-25"
        originX={43}
        originY={42}
      />
      <Ellipse cx="55" cy="71" rx="16" ry="11" fill="#C8882A" opacity="0.5" />

      {/* Cheeks */}
      <Ellipse cx="30" cy="65" rx="9" ry="6" fill="#E8955A" opacity={expr.blush} />
      <Ellipse cx="80" cy="65" rx="9" ry="6" fill="#E8955A" opacity={expr.blush} />

      {/* Eyes */}
      <Circle cx={expr.eyeCxL} cy={expr.eyeCy} r={expr.eyeR} fill={eyeFill} />
      <Circle cx={expr.eyeCxR} cy={expr.eyeCy} r={expr.eyeR} fill={eyeFill} />

      {/* Highlights */}
      {expr.halfEyes ? null : (
        <>
          <Circle cx={expr.eyeCxL + 3} cy={expr.eyeCy - 4} r={shineR} fill="white" />
          <Circle cx={expr.eyeCxR + 3} cy={expr.eyeCy - 4} r={shineR} fill="white" />
          <Circle
            cx={expr.eyeCxL + 5}
            cy={expr.eyeCy - 2}
            r={1.5}
            fill="white"
            opacity={smallHighlightOpacity}
          />
          <Circle
            cx={expr.eyeCxR + 5}
            cy={expr.eyeCy - 2}
            r={1.5}
            fill="white"
            opacity={smallHighlightOpacity}
          />
        </>
      )}

      {/* Half-closed eyes (sleepy) */}
      {sleepyClipL}
      {sleepyClipR}

      {/* Blink overlay (idle only) */}
      {blinkEyes}

      {/* Brows */}
      <Path d={expr.browL} stroke={browStroke} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      <Path d={expr.browR} stroke={browStroke} strokeWidth={2.5} fill="none" strokeLinecap="round" />

      {/* Mouth */}
      <Path d={expr.mouth} stroke={mouthStroke} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.85} />

      {/* Sweat (nervous) */}
      {expr.sweat ? (
        <>
          <Ellipse cx="74" cy="38" rx="3" ry="5" fill="#A8D4F0" opacity="0.85" />
          <Path d="M74,33 Q77,38 74,43 Q71,38 74,33" fill="#A8D4F0" opacity="0.7" />
        </>
      ) : null}

      {/* Flair emojis */}
      {expr.flairL ? (
        <SvgText x={4} y={expr.flairLY} fontSize={11} fill="#8B5E20">
          {expr.flairL}
        </SvgText>
      ) : null}
      {expr.flairR ? (
        <SvgText x={88} y={expr.flairRY} fontSize={11} fill="#8B5E20">
          {expr.flairR}
        </SvgText>
      ) : null}

      {/* Body */}
      <Ellipse cx="55" cy="103" rx="22" ry="14" fill="#C8882A" />
      <Circle cx="55" cy="100" r="7" fill="#D9A045" opacity="0.5" />
      <SvgText
        x={55}
        y={103.5}
        textAnchor="middle"
        fontSize={8}
        fill="#8B5E20"
        fontWeight="bold"
        opacity={0.9}
      >
        $
      </SvgText>
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

const CROSSFADE_MS = 200;

function DexMascotInner({ state, size = 88 }: Props) {
  const [blinkAlpha, setBlinkAlpha] = useState(0);
  const blinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const translateY = useSharedValue(0);
  const scaleX     = useSharedValue(1);
  const scaleY     = useSharedValue(1);
  const rotate     = useSharedValue(0);

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

export function DexMascot({ state, size = 88 }: Props) {
  const [displayState, setDisplayState] = useState<DexState>(state);
  const opacity = useSharedValue(1);

  const setDisplayStateJS = useCallback((s: DexState) => setDisplayState(s), []);

  useEffect(() => {
    if (state === displayState) return;
    opacity.value = withTiming(0, { duration: CROSSFADE_MS }, (finished) => {
      if (finished) runOnJS(setDisplayStateJS)(state);
    });
  }, [state, displayState, setDisplayStateJS]);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: CROSSFADE_MS });
  }, [displayState]);

  const wrapperStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <ReAnimated.View style={[{ width: size, height: size * 1.36, alignItems: "center", justifyContent: "center" }, wrapperStyle]}>
      <DexMascotInner state={displayState} size={size} />
    </ReAnimated.View>
  );
}

export default React.memo(DexMascot);

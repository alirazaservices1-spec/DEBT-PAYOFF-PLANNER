import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import Svg, {
  Circle,
  Ellipse,
  Path,
  Rect,
  Text as SvgText,
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Line,
  Polyline,
  Polygon,
} from "react-native-svg";

const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);
const AnimatedPath = Animated.createAnimatedComponent(Path);

export type DexCoinMood =
  | "happy"
  | "happyClassic"
  | "cheering"
  | "congratulating"
  | "keepGoing"
  | "overjoyed"
  | "serious"
  | "thinking"
  | "celebrating"
  | "encouraging"
  | "proud"
  | "gotThis"
  | "pathGuide"
  | "smartAnalyst";
export type DexCoinMotion = "float" | "bounce" | "pulse" | "wobble" | "nod" | "pump";

export function DexCoin({
  mood = "happy",
  motion = "float",
  size = 120,
}: {
  mood?: DexCoinMood;
  motion?: DexCoinMotion;
  size?: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  const confetti = useRef(Array.from({ length: 5 }, () => new Animated.Value(0))).current;
  const pathGuideAura = useRef(new Animated.Value(0)).current;
  const pathGuideFlame = useRef(new Animated.Value(0)).current;
  const smartAnalystAura = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    anim.setValue(0);
    const loop =
      motion === "bounce"
        ? Animated.loop(
            Animated.sequence([
              Animated.timing(anim, { toValue: 1, duration: 500, useNativeDriver: true }),
              Animated.timing(anim, { toValue: 0, duration: 500, useNativeDriver: true }),
            ])
          )
        : motion === "pulse"
          ? Animated.loop(
              Animated.sequence([
                Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }),
                Animated.timing(anim, { toValue: 0, duration: 700, useNativeDriver: true }),
              ])
            )
          : motion === "wobble"
            ? Animated.loop(
                Animated.sequence([
                  Animated.timing(anim, { toValue: 1, duration: 450, useNativeDriver: true }),
                  Animated.timing(anim, { toValue: -1, duration: 450, useNativeDriver: true }),
                  Animated.timing(anim, { toValue: 0, duration: 450, useNativeDriver: true }),
                ])
              )
            : motion === "pump"
              ? Animated.loop(
                  Animated.sequence([
                    Animated.timing(anim, { toValue: 1, duration: 520, useNativeDriver: true }),
                    Animated.timing(anim, { toValue: 0, duration: 520, useNativeDriver: true }),
                  ])
                )
            : motion === "nod"
              ? Animated.loop(
                  Animated.sequence([
                    Animated.timing(anim, { toValue: -1, duration: 420, useNativeDriver: true }),
                    Animated.timing(anim, { toValue: 1, duration: 420, useNativeDriver: true }),
                    Animated.timing(anim, { toValue: 0, duration: 420, useNativeDriver: true }),
                  ])
                )
            : Animated.loop(
                Animated.sequence([
                  Animated.timing(anim, { toValue: 1, duration: 620, useNativeDriver: true }),
                  Animated.timing(anim, { toValue: 0, duration: 620, useNativeDriver: true }),
                ])
              );
    loop.start();
    return () => loop.stop();
  }, [anim, motion]);

  useEffect(() => {
    if (mood !== "congratulating") {
      confetti.forEach((v) => v.setValue(0));
      return;
    }

    const loops = confetti.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 350),
          Animated.timing(v, { toValue: 1, duration: 1600, useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      )
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [mood, confetti]);

  useEffect(() => {
    if (mood !== "pathGuide") {
      pathGuideAura.setValue(0);
      pathGuideFlame.setValue(0);
      return;
    }
    const auraLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pathGuideAura, { toValue: 1, duration: 2000, useNativeDriver: false }),
        Animated.timing(pathGuideAura, { toValue: 0, duration: 2000, useNativeDriver: false }),
      ])
    );
    const flameLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pathGuideFlame, { toValue: 1, duration: 450, useNativeDriver: false }),
        Animated.timing(pathGuideFlame, { toValue: 0, duration: 450, useNativeDriver: false }),
      ])
    );
    auraLoop.start();
    flameLoop.start();
    return () => {
      auraLoop.stop();
      flameLoop.stop();
    };
  }, [mood, pathGuideAura, pathGuideFlame]);

  useEffect(() => {
    if (mood !== "smartAnalyst") {
      smartAnalystAura.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(smartAnalystAura, { toValue: 1, duration: 2000, useNativeDriver: false }),
        Animated.timing(smartAnalystAura, { toValue: 0, duration: 2000, useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [mood, smartAnalystAura]);

  const translateY =
    motion === "bounce"
      ? anim.interpolate({ inputRange: [0, 1], outputRange: [0, -12] })
      : motion === "pump"
        ? anim.interpolate({ inputRange: [0, 1], outputRange: [0, -8] })
      : motion === "float"
        ? anim.interpolate({ inputRange: [0, 1], outputRange: [0, -6] })
        : 0;
  const scale = motion === "pulse" ? anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) : 1;
  const rotate =
    motion === "wobble"
      ? anim.interpolate({ inputRange: [-1, 0, 1], outputRange: ["2deg", "0deg", "-2deg"] })
      : motion === "pump"
        ? anim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-5deg"] })
      : motion === "nod"
        ? anim.interpolate({ inputRange: [-1, 0, 1], outputRange: ["-3deg", "0deg", "3deg"] })
        : "0deg";

  const brows =
    mood === "serious"
      ? { l: "M 48 76 Q 65 86 82 76", r: "M 88 76 Q 105 86 122 76" }
      : mood === "thinking"
        ? { l: "M 48 72 Q 65 62 82 72", r: "M 88 76 Q 105 84 122 76" }
        : mood === "proud"
          ? { l: "M 48 75 Q 65 67 82 74", r: "M 88 74 Q 105 67 122 75" }
        : { l: "M 48 74 Q 65 64 82 74", r: "M 88 74 Q 105 64 122 74" };

  const mouth =
    mood === "serious"
      ? "M 64 140 Q 85 130 106 140"
      : mood === "thinking"
        ? "M 64 136 Q 84 144 102 134"
        : mood === "proud"
          ? "M 66 136 Q 85 145 104 136"
        : mood === "encouraging"
          ? "M 64 132 Q 85 144 106 132"
          : "M 64 130 Q 85 150 106 130";

  const starOpacity = mood === "celebrating" || mood === "happy" ? 1 : 0.45;

  if (mood === "pathGuide") {
    const h = (size * 160) / 120;
    const lanternGlowOpacity = pathGuideAura.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] });
    const flameSX = pathGuideFlame.interpolate({
      inputRange: [0, 0.25, 0.5, 0.75, 1],
      outputRange: [1, 0.85, 1.1, 0.9, 1],
    });
    const flameSY = pathGuideFlame.interpolate({
      inputRange: [0, 0.25, 0.5, 0.75, 1],
      outputRange: [1, 1.1, 0.95, 1.08, 1],
    });
    const flameTY = pathGuideFlame.interpolate({
      inputRange: [0, 0.25, 0.5, 0.75, 1],
      outputRange: [0, -1, 1, -1, 0],
    });
    return (
      <Animated.View style={{ width: size, height: h, transform: [{ translateY }, { scale }, { rotate }] }}>
        <Svg width={size} height={h} viewBox="0 0 120 160">
          <Defs>
            <RadialGradient id="pgBodyGrad" cx="38%" cy="30%" r="65%">
              <Stop offset="0%" stopColor="#F8D870" />
              <Stop offset="50%" stopColor="#C88A10" />
              <Stop offset="100%" stopColor="#8A5C00" />
            </RadialGradient>
            <RadialGradient id="pgEarGrad" cx="40%" cy="38%" r="60%">
              <Stop offset="0%" stopColor="#B87010" />
              <Stop offset="100%" stopColor="#6A3800" />
            </RadialGradient>
            <RadialGradient id="pgCoinGrad" cx="38%" cy="35%" r="62%">
              <Stop offset="0%" stopColor="#FFDF60" />
              <Stop offset="100%" stopColor="#C89010" />
            </RadialGradient>
            <RadialGradient id="pgAuraGrad" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFE88A" stopOpacity={0.28} />
              <Stop offset="60%" stopColor="#FFD050" stopOpacity={0.1} />
              <Stop offset="100%" stopColor="#FFD050" stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="pgLanternGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFF0A0" stopOpacity={0.9} />
              <Stop offset="100%" stopColor="#FFA000" stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="pgFlameGrad" cx="50%" cy="80%" r="60%">
              <Stop offset="0%" stopColor="#FFFDE0" />
              <Stop offset="40%" stopColor="#FFB800" />
              <Stop offset="100%" stopColor="#E05000" />
            </RadialGradient>
            <RadialGradient id="pgScrollGrad" cx="40%" cy="30%" r="65%">
              <Stop offset="0%" stopColor="#FFFAE8" />
              <Stop offset="100%" stopColor="#E8D8A0" />
            </RadialGradient>
          </Defs>

          <AnimatedEllipse
            cx={60}
            cy={82}
            rx={68}
            ry={58}
            fill="url(#pgAuraGrad)"
            opacity={pathGuideAura.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] })}
          />

          <Ellipse cx={60} cy={150} rx={28} ry={5} fill="rgba(0,0,0,0.07)" />

          <Rect x={6} y={82} width={26} height={22} rx={4} fill="url(#pgScrollGrad)" stroke="#C8A860" strokeWidth={1.4} />
          <Rect x={4} y={80} width={30} height={5} rx={2.5} fill="#DFC890" stroke="#C0A050" strokeWidth={1} />
          <Rect x={4} y={99} width={30} height={5} rx={2.5} fill="#DFC890" stroke="#C0A050" strokeWidth={1} />
          <Line x1={10} y1={88} x2={28} y2={88} stroke="#C0A060" strokeWidth={1.1} />
          <Line x1={10} y1={92} x2={28} y2={92} stroke="#C0A060" strokeWidth={1.1} />
          <Line x1={10} y1={96} x2={22} y2={96} stroke="#C0A060" strokeWidth={1.1} />
          <SvgText x={19} y={91} textAnchor="middle" fontSize={5.5} fontWeight="700" fill="#8A6820" opacity={0.5}>
            PATH
          </SvgText>

          <AnimatedEllipse cx={103} cy={84} rx={18} ry={18} fill="url(#pgLanternGlow)" opacity={lanternGlowOpacity} />
          <Path d="M103 70 Q103 64 103 62" stroke="#9A7020" strokeWidth={2} strokeLinecap="round" fill="none" />
          <Ellipse cx={103} cy={61} rx={5} ry={2} fill="none" stroke="#9A7020" strokeWidth={1.8} />
          <Rect x={95} y={70} width={16} height={20} rx={3} fill="#2A2010" stroke="#9A7020" strokeWidth={1.4} />
          <Rect x={97} y={72} width={5.5} height={16} rx={1.5} fill="#FFF0A0" opacity={0.35} />
          <Rect x={103.5} y={72} width={5.5} height={16} rx={1.5} fill="#FFF0A0" opacity={0.25} />
          <Path d="M94 70 L106 70 L108 68 L92 68 Z" fill="#9A7020" />
          <Path d="M94 90 L106 90 L108 92 L92 92 Z" fill="#9A7020" />
          <AnimatedPath
            d="M103 88 Q99 82 101 76 Q103 72 103 72 Q103 72 105 76 Q107 82 103 88 Z"
            fill="url(#pgFlameGrad)"
            originX={103}
            originY={88}
            transform={[{ translateY: flameTY }, { scaleX: flameSX }, { scaleY: flameSY }]}
          />
          <Line x1={95} y1={68} x2={95} y2={92} stroke="#9A7020" strokeWidth={1.2} />
          <Line x1={111} y1={68} x2={111} y2={92} stroke="#9A7020" strokeWidth={1.2} />

          <Circle cx={26} cy={38} r={13} fill="url(#pgEarGrad)" />
          <Circle cx={94} cy={38} r={13} fill="url(#pgEarGrad)" />
          <Circle cx={26} cy={38} r={7} fill="#5A3400" opacity={0.5} />
          <Circle cx={94} cy={38} r={7} fill="#5A3400" opacity={0.5} />
          <Circle cx={24} cy={36} r={3} fill="#C07010" opacity={0.3} />
          <Circle cx={92} cy={36} r={3} fill="#C07010" opacity={0.3} />

          <Circle cx={60} cy={74} r={48} fill="#7A4C00" opacity={0.18} />
          <Circle cx={60} cy={72} r={48} fill="url(#pgBodyGrad)" />
          <Ellipse cx={48} cy={54} rx={18} ry={12} fill="white" opacity={0.07} rotation={-20} originX={48} originY={54} />

          <Path d="M18 76 Q10 84 13 96" stroke="#9A6200" strokeWidth={9} strokeLinecap="round" fill="none" />
          <Ellipse cx={13} cy={97} rx={9} ry={6.5} fill="url(#pgBodyGrad)" stroke="#9A6200" strokeWidth={1.2} rotation={-10} originX={13} originY={97} />
          <Path d="M102 76 Q110 80 108 92" stroke="#9A6200" strokeWidth={9} strokeLinecap="round" fill="none" />
          <Ellipse cx={108} cy={93} rx={9} ry={6.5} fill="url(#pgBodyGrad)" stroke="#9A6200" strokeWidth={1.2} rotation={10} originX={108} originY={93} />

          <Ellipse cx={40} cy={67} rx={18} ry={19} fill="white" />
          <Ellipse cx={80} cy={67} rx={18} ry={19} fill="white" />
          <Circle cx={40} cy={69} r={12.5} fill="#1C1A2E" />
          <Circle cx={80} cy={69} r={12.5} fill="#1C1A2E" />
          <Circle cx={40} cy={69} r={8} fill="none" stroke="#C87010" strokeWidth={1.2} opacity={0.3} />
          <Circle cx={80} cy={69} r={8} fill="none" stroke="#C87010" strokeWidth={1.2} opacity={0.3} />
          <Circle cx={45} cy={63} r={4.5} fill="white" opacity={0.92} />
          <Circle cx={85} cy={63} r={4.5} fill="white" opacity={0.92} />
          <Circle cx={36} cy={72} r={2} fill="white" opacity={0.35} />
          <Circle cx={76} cy={72} r={2} fill="white" opacity={0.35} />

          <Path d="M22 61 Q40 55 58 61" fill="url(#pgBodyGrad)" opacity={0.55} />
          <Path d="M62 61 Q80 55 98 61" fill="url(#pgBodyGrad)" opacity={0.55} />

          <Path d="M24 50 Q40 45 56 50" fill="none" stroke="#7A4800" strokeWidth={2.4} strokeLinecap="round" />
          <Path d="M64 50 Q80 45 96 50" fill="none" stroke="#7A4800" strokeWidth={2.4} strokeLinecap="round" />

          <Ellipse cx={26} cy={80} rx={10} ry={6.5} fill="#E87070" opacity={0.18} />
          <Ellipse cx={94} cy={80} rx={10} ry={6.5} fill="#E87070" opacity={0.18} />

          <Path d="M40 90 Q60 103 80 90" fill="none" stroke="#7A4800" strokeWidth={3.2} strokeLinecap="round" />
          <Circle cx={40} cy={91} r={1.8} fill="#8A5400" opacity={0.25} />
          <Circle cx={80} cy={91} r={1.8} fill="#8A5400" opacity={0.25} />

          <Rect x={30} y={116} width={22} height={12} rx={6} fill="#C4A878" />
          <Rect x={68} y={116} width={22} height={12} rx={6} fill="#C4A878" />

          <Circle cx={14} cy={90} r={13} fill="url(#pgCoinGrad)" stroke="#A07010" strokeWidth={1.8} />
          <SvgText x={14} y={95} textAnchor="middle" fontSize={13} fontWeight="700" fill="#7A5000">
            $
          </SvgText>

          <SvgText x={4} y={24} fontSize={12} opacity={0.7}>
            ✦
          </SvgText>
          <SvgText x={98} y={22} fontSize={12} opacity={0.7}>
            ✦
          </SvgText>
          <SvgText x={50} y={10} fontSize={10} opacity={0.6}>
            ✦
          </SvgText>
        </Svg>
      </Animated.View>
    );
  }

  if (mood === "smartAnalyst") {
    const h = (size * 170) / 140;
    return (
      <Animated.View style={{ width: size, height: h, transform: [{ translateY }, { scale }, { rotate }] }}>
        <Svg width={size} height={h} viewBox="0 0 140 170">
          <Defs>
            <RadialGradient id="saBodyA" cx="36%" cy="28%" r="68%">
              <Stop offset="0%" stopColor="#FFF0A0" />
              <Stop offset="40%" stopColor="#F0C030" />
              <Stop offset="75%" stopColor="#C88010" />
              <Stop offset="100%" stopColor="#8A5600" />
            </RadialGradient>
            <RadialGradient id="saEarA" cx="40%" cy="38%" r="60%">
              <Stop offset="0%" stopColor="#C07010" />
              <Stop offset="100%" stopColor="#7A4800" />
            </RadialGradient>
            <RadialGradient id="saCoinA" cx="38%" cy="35%" r="62%">
              <Stop offset="0%" stopColor="#FFDF60" />
              <Stop offset="100%" stopColor="#C89010" />
            </RadialGradient>
            <LinearGradient id="saGlassFrame" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#2C2C3A" />
              <Stop offset="100%" stopColor="#1A1A28" />
            </LinearGradient>
            <LinearGradient id="saLensLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#4060D0" stopOpacity={0.18} />
              <Stop offset="100%" stopColor="#2040A0" stopOpacity={0.08} />
            </LinearGradient>
            <LinearGradient id="saLensRight" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#4060D0" stopOpacity={0.18} />
              <Stop offset="100%" stopColor="#2040A0" stopOpacity={0.08} />
            </LinearGradient>
            <LinearGradient id="saTabletBg" x1="0%" y1="0%" x2="10%" y2="100%">
              <Stop offset="0%" stopColor="#0A0E28" />
              <Stop offset="100%" stopColor="#060A1A" />
            </LinearGradient>
            <LinearGradient id="saTabletFrame" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#2C2C3A" />
              <Stop offset="100%" stopColor="#18182A" />
            </LinearGradient>
            <LinearGradient id="saBar1" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#4A8FFF" />
              <Stop offset="100%" stopColor="#2D5BE3" />
            </LinearGradient>
            <LinearGradient id="saBar2" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#30D080" />
              <Stop offset="100%" stopColor="#1D9E6A" />
            </LinearGradient>
            <LinearGradient id="saBar3" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FFB040" />
              <Stop offset="100%" stopColor="#E08010" />
            </LinearGradient>
            <LinearGradient id="saBar4" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FF6080" />
              <Stop offset="100%" stopColor="#D03050" />
            </LinearGradient>
            <RadialGradient id="saThoughtBg" cx="50%" cy="40%" r="55%">
              <Stop offset="0%" stopColor="#FFFFFF" />
              <Stop offset="100%" stopColor="#EEF2FF" />
            </RadialGradient>
            <RadialGradient id="saAuraA" cx="50%" cy="45%" r="55%">
              <Stop offset="0%" stopColor="#C8D8FF" stopOpacity={0.25} />
              <Stop offset="60%" stopColor="#8098E8" stopOpacity={0.1} />
              <Stop offset="100%" stopColor="#8098E8" stopOpacity={0} />
            </RadialGradient>
            <LinearGradient id="saShirtGrad" x1="0%" y1="0%" x2="20%" y2="100%">
              <Stop offset="0%" stopColor="#FFFFFF" />
              <Stop offset="100%" stopColor="#D8DCF0" />
            </LinearGradient>
            <LinearGradient id="saTieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#2D5BE3" />
              <Stop offset="100%" stopColor="#1030B0" />
            </LinearGradient>
          </Defs>

          <AnimatedEllipse
            cx={70}
            cy={90}
            rx={76}
            ry={62}
            fill="url(#saAuraA)"
            opacity={smartAnalystAura.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] })}
          />
          <Ellipse cx={70} cy={160} rx={30} ry={5.5} fill="rgba(0,0,0,0.08)" />

          <Circle cx={92} cy={46} r={2} fill="white" stroke="#C8D0F0" strokeWidth={0.8} />
          <Circle cx={98} cy={38} r={2.8} fill="white" stroke="#C8D0F0" strokeWidth={0.8} />
          <Circle cx={104} cy={30} r={3.5} fill="white" stroke="#C8D0F0" strokeWidth={0.8} />
          <Ellipse cx={120} cy={20} rx={18} ry={13} fill="url(#saThoughtBg)" stroke="#C8D0F0" strokeWidth={1} />
          <Ellipse cx={108} cy={22} rx={8} ry={7} fill="url(#saThoughtBg)" stroke="#C8D0F0" strokeWidth={0.8} />
          <Ellipse cx={128} cy={23} rx={8} ry={7} fill="url(#saThoughtBg)" stroke="#C8D0F0" strokeWidth={0.8} />
          <Ellipse cx={118} cy={13} rx={7} ry={6} fill="url(#saThoughtBg)" stroke="#C8D0F0" strokeWidth={0.8} />
          <Polyline
            points="108,22 113,18 118,21 123,16 128,19"
            fill="none"
            stroke="#2D5BE3"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle cx={123} cy={16} r={2} fill="#E83040" />

          <Path
            d="M36 76 Q30 94 30 126 Q44 134 70 136 Q96 134 110 126 Q110 94 104 76"
            fill="url(#saShirtGrad)"
          />
          <Path d="M58 76 L70 90 L82 76" fill="white" stroke="#D0D4E8" strokeWidth={1} />
          <Path d="M44 76 Q52 80 58 76" fill="white" stroke="#D0D4E8" strokeWidth={1} />
          <Path d="M82 76 Q88 80 96 76" fill="white" stroke="#D0D4E8" strokeWidth={1} />
          <Circle cx={70} cy={96} r={1.8} fill="#C8CCDC" />
          <Circle cx={70} cy={104} r={1.8} fill="#C8CCDC" />
          <Circle cx={70} cy={112} r={1.8} fill="#C8CCDC" />
          <Circle cx={70} cy={120} r={1.8} fill="#C8CCDC" />
          <Path d="M66 78 L70 90 L74 78 L72 76 L70 78 L68 76 Z" fill="url(#saTieGrad)" />
          <Path d="M67 84 L70 96 L73 84 L70 82 Z" fill="url(#saTieGrad)" opacity={0.8} />
          <Line x1={68.5} y1={80} x2={71.5} y2={80} stroke="white" strokeWidth={0.8} opacity={0.4} />
          <Line x1={68} y1={83} x2={72} y2={83} stroke="white" strokeWidth={0.8} opacity={0.4} />
          <Rect x={86} y={84} width={14} height={10} rx={2} fill="none" stroke="#C0C4D8" strokeWidth={0.8} />
          <Rect x={89} y={80} width={2.5} height={12} rx={1.2} fill="#2D5BE3" />
          <Rect x={93} y={80} width={2.5} height={12} rx={1.2} fill="#E83040" />

          <Circle cx={28} cy={44} r={13} fill="url(#saEarA)" />
          <Circle cx={112} cy={44} r={13} fill="url(#saEarA)" />
          <Circle cx={28} cy={44} r={7} fill="#5A3400" opacity={0.5} />
          <Circle cx={112} cy={44} r={7} fill="#5A3400" opacity={0.5} />

          <Circle cx={70} cy={80} r={49} fill="#7A4C00" opacity={0.18} />
          <Circle cx={70} cy={78} r={49} fill="url(#saBodyA)" />
          <Ellipse cx={56} cy={60} rx={20} ry={14} fill="white" opacity={0.07} rotation={-20} originX={56} originY={60} />

          <Line x1={58} y1={70} x2={82} y2={70} stroke="url(#saGlassFrame)" strokeWidth={2.2} />
          <Rect x={34} y={62} width={24} height={16} rx={5} fill="url(#saLensLeft)" stroke="url(#saGlassFrame)" strokeWidth={2} />
          <Ellipse cx={40} cy={66} rx={5} ry={3.5} fill="white" opacity={0.25} rotation={-20} originX={40} originY={66} />
          <Rect x={82} y={62} width={24} height={16} rx={5} fill="url(#saLensRight)" stroke="url(#saGlassFrame)" strokeWidth={2} />
          <Ellipse cx={88} cy={66} rx={5} ry={3.5} fill="white" opacity={0.25} rotation={-20} originX={88} originY={66} />
          <Line x1={34} y1={70} x2={22} y2={72} stroke="url(#saGlassFrame)" strokeWidth={2} strokeLinecap="round" />
          <Line x1={106} y1={70} x2={118} y2={72} stroke="url(#saGlassFrame)" strokeWidth={2} strokeLinecap="round" />
          <Circle cx={106} cy={63} r={2.2} fill="#4A8FFF" opacity={0.95} />

          <Ellipse cx={46} cy={70} rx={10} ry={11} fill="white" opacity={0.9} />
          <Ellipse cx={94} cy={70} rx={10} ry={11} fill="white" opacity={0.9} />
          <Circle cx={46} cy={71} r={7.5} fill="#1C1A2E" />
          <Circle cx={94} cy={71} r={7.5} fill="#1C1A2E" />
          <Circle cx={49} cy={68} r={3} fill="white" opacity={0.9} />
          <Circle cx={97} cy={68} r={3} fill="white" opacity={0.9} />
          <Path d="M34 60 Q46 56 58 60" fill="none" stroke="#7A4800" strokeWidth={2.6} strokeLinecap="round" />
          <Path d="M82 60 Q94 56 106 60" fill="none" stroke="#7A4800" strokeWidth={2.6} strokeLinecap="round" />
          <Path d="M66 58 L74 58" stroke="#8A5000" strokeWidth={1.4} strokeLinecap="round" opacity={0.4} />
          <Path d="M48 92 Q70 104 92 92" fill="none" stroke="#8A5000" strokeWidth={3} strokeLinecap="round" />
          <Ellipse cx={34} cy={82} rx={10} ry={6.5} fill="#E87070" opacity={0.15} />
          <Ellipse cx={106} cy={82} rx={10} ry={6.5} fill="#E87070" opacity={0.15} />

          <Path d="M34 78 Q22 86 20 100" stroke="#9A6200" strokeWidth={10} strokeLinecap="round" fill="none" />
          <Ellipse cx={20} cy={102} rx={10} ry={7.5} fill="url(#saBodyA)" stroke="#8A5800" strokeWidth={1.4} />

          <Rect x={4} y={82} width={32} height={42} rx={4} fill="url(#saTabletFrame)" stroke="#22222E" strokeWidth={1.2} />
          <Rect x={6} y={84} width={28} height={38} rx={3} fill="url(#saTabletBg)" />
          <Circle cx={20} cy={127} r={2} fill="#33334A" />
          <Line x1={9} y1={118} x2={9} y2={88} stroke="#3A3A60" strokeWidth={0.8} />
          <Line x1={9} y1={118} x2={31} y2={118} stroke="#3A3A60" strokeWidth={0.8} />
          <Rect x={10} y={108} width={4} height={10} rx={1} fill="url(#saBar1)" />
          <Rect x={15} y={104} width={4} height={14} rx={1} fill="url(#saBar2)" />
          <Rect x={20} y={100} width={4} height={18} rx={1} fill="url(#saBar3)" />
          <Rect x={25} y={106} width={4} height={12} rx={1} fill="url(#saBar4)" />
          <Polyline
            points="12,107 17,103 22,99 27,104"
            fill="none"
            stroke="white"
            strokeWidth={1}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.6}
          />
          <Circle cx={27} cy={104} r={2.5} fill="white" opacity={0.9} />
          <SvgText x={20} y={92} textAnchor="middle" fontSize={5} fill="#4A8FFF" opacity={0.9} fontWeight="700">
            PAYOFF
          </SvgText>

          <Path d="M106 78 Q116 88 114 100" stroke="#9A6200" strokeWidth={10} strokeLinecap="round" fill="none" />
          <Ellipse cx={114} cy={102} rx={10} ry={7.5} fill="url(#saBodyA)" stroke="#8A5800" strokeWidth={1.4} />
          <Rect x={110} y={82} width={6} height={24} rx={3} fill="#1C1A2E" stroke="#3A3A60" strokeWidth={0.8} />
          <Rect x={110} y={82} width={6} height={6} rx={3} fill="#4A8FFF" />
          <Polygon points="113,106 110.5,106 112,112" fill="#2C2C3A" />
          <Circle cx={112} cy={112} r={2.5} fill="#4A8FFF" opacity={0.5} />

          <Rect x={40} y={130} width={22} height={12} rx={6} fill="#C4A878" />
          <Rect x={78} y={130} width={22} height={12} rx={6} fill="#C4A878" />

          <Circle cx={16} cy={118} r={13} fill="url(#saCoinA)" stroke="#A07010" strokeWidth={1.8} />
          <SvgText x={16} y={123} textAnchor="middle" fontSize={13} fontWeight="700" fill="#7A5000">
            $
          </SvgText>
        </Svg>
      </Animated.View>
    );
  }

  if (mood === "proud") {
    return (
      <Animated.View style={{ width: size, height: size * 1.2, transform: [{ translateY }, { scale }, { rotate }] }}>
        <Svg viewBox="0 0 120 145" width={size} height={size * 1.2}>
          <Ellipse cx={60} cy={135} rx={26} ry={5} fill="rgba(0,0,0,0.07)" />
          <Circle cx={26} cy={36} r={13} fill="#9D6111" />
          <Circle cx={94} cy={36} r={13} fill="#9D6111" />
          <Circle cx={26} cy={36} r={7} fill="#5A3400" opacity={0.5} />
          <Circle cx={94} cy={36} r={7} fill="#5A3400" opacity={0.5} />
          <Circle cx={60} cy={72} r={49} fill="#8A5800" opacity={0.18} />
          <Circle cx={60} cy={69} r={49} fill="#D08A10" />
          <Ellipse cx={11} cy={78} rx={12} ry={7.5} fill="#D08A10" stroke="#9A6200" strokeWidth={1.2} rotation={-15} originX={11} originY={78} />
          <Ellipse cx={109} cy={78} rx={12} ry={7.5} fill="#D08A10" stroke="#9A6200" strokeWidth={1.2} rotation={15} originX={109} originY={78} />
          <Circle cx={60} cy={76} r={9} fill="#FFD030" stroke="#C89010" strokeWidth={1.2} opacity={0.8} />
          <SvgText x={60} y={80} textAnchor="middle" fontSize={10} fill="#9A6000">★</SvgText>
          <Ellipse cx={40} cy={62} rx={18} ry={19} fill="white" />
          <Ellipse cx={80} cy={62} rx={18} ry={19} fill="white" />
          <Circle cx={40} cy={64} r={12} fill="#1A1A2E" />
          <Circle cx={80} cy={64} r={12} fill="#1A1A2E" />
          <Circle cx={45} cy={59} r={4.5} fill="white" opacity={0.9} />
          <Circle cx={85} cy={59} r={4.5} fill="white" opacity={0.9} />
          <Path d="M42 86 Q60 96 78 86" fill="none" stroke="#7A4800" strokeWidth={3} strokeLinecap="round" />
          <Rect x={29} y={115} width={22} height={12} rx={6} fill="#C4A878" />
          <Rect x={69} y={115} width={22} height={12} rx={6} fill="#C4A878" />
          <Circle cx={14} cy={88} r={13} fill="#E1A91C" stroke="#A07010" strokeWidth={1.8} />
          <SvgText x={14} y={93} textAnchor="middle" fontSize={13} fill="#7A5000" fontWeight="600">$</SvgText>
        </Svg>
      </Animated.View>
    );
  }

  if (mood === "gotThis") {
    return (
      <Animated.View style={{ width: size, height: size * 1.2, transform: [{ translateY }, { scale }, { rotate }] }}>
        <Svg viewBox="0 0 120 145" width={size} height={size * 1.2}>
          <Ellipse cx={60} cy={135} rx={26} ry={5} fill="rgba(0,0,0,0.07)" />
          <Circle cx={26} cy={36} r={13} fill="#9D6111" />
          <Circle cx={94} cy={36} r={13} fill="#9D6111" />
          <Circle cx={26} cy={36} r={7} fill="#5A3400" opacity={0.5} />
          <Circle cx={94} cy={36} r={7} fill="#5A3400" opacity={0.5} />
          <Circle cx={60} cy={72} r={47} fill="#8A5800" opacity={0.2} />
          <Circle cx={60} cy={70} r={47} fill="#D08A10" />
          <Path d="M100 74 Q112 64 108 52" stroke="#9A6200" strokeWidth={10} strokeLinecap="round" fill="none" />
          <Ellipse cx={104} cy={50} rx={11} ry={8} fill="#D08A10" stroke="#9A6200" strokeWidth={1.2} />
          <Rect x={100} y={38} width={9} height={14} rx={4.5} fill="#D08A10" stroke="#9A6200" strokeWidth={1.2} />
          <Ellipse cx={13} cy={74} rx={11} ry={7} fill="#D08A10" stroke="#9A6200" strokeWidth={1.2} rotation={-10} originX={13} originY={74} />
          <Ellipse cx={40} cy={65} rx={19} ry={20} fill="white" />
          <Ellipse cx={80} cy={65} rx={19} ry={20} fill="white" />
          <Circle cx={40} cy={67} r={13} fill="#1A1A2E" />
          <Circle cx={80} cy={67} r={13} fill="#1A1A2E" />
          <Circle cx={46} cy={61} r={5} fill="white" opacity={0.9} />
          <Circle cx={86} cy={61} r={5} fill="white" opacity={0.9} />
          <Ellipse cx={26} cy={77} rx={8} ry={5} fill="#E87070" opacity={0.24} />
          <Ellipse cx={94} cy={77} rx={8} ry={5} fill="#E87070" opacity={0.24} />
          <Path d="M38 89 Q60 103 82 89" fill="none" stroke="#7A4800" strokeWidth={3.5} strokeLinecap="round" />
          <Rect x={29} y={113} width={22} height={12} rx={6} fill="#C4A878" />
          <Rect x={69} y={113} width={22} height={12} rx={6} fill="#C4A878" />
          <Circle cx={14} cy={88} r={13} fill="#E1A91C" stroke="#A07010" strokeWidth={1.8} />
          <SvgText x={14} y={93} textAnchor="middle" fontSize={13} fill="#7A5000" fontWeight="600">$</SvgText>
        </Svg>
      </Animated.View>
    );
  }

  if (mood === "happyClassic") {
    return (
      <Animated.View style={{ width: size, height: size * 1.2, transform: [{ translateY }, { scale }, { rotate }] }}>
        <Svg viewBox="0 0 120 145" width={size} height={size * 1.2}>
          <Defs>
            <RadialGradient id="b1" cx="38%" cy="32%" r="65%">
              <Stop offset="0%" stopColor="#F2C040" />
              <Stop offset="55%" stopColor="#D08A10" />
              <Stop offset="100%" stopColor="#A06008" />
            </RadialGradient>
            <RadialGradient id="ear1" cx="40%" cy="38%" r="60%">
              <Stop offset="0%" stopColor="#C07010" />
              <Stop offset="100%" stopColor="#7A4800" />
            </RadialGradient>
            <RadialGradient id="coin1" cx="38%" cy="35%" r="62%">
              <Stop offset="0%" stopColor="#FFDF60" />
              <Stop offset="100%" stopColor="#C89010" />
            </RadialGradient>
          </Defs>
          <Ellipse cx={60} cy={135} rx={26} ry={5} fill="rgba(0,0,0,0.07)" />
          <Circle cx={26} cy={36} r={13} fill="url(#ear1)" />
          <Circle cx={94} cy={36} r={13} fill="url(#ear1)" />
          <Circle cx={26} cy={36} r={7} fill="#5A3400" opacity={0.5} />
          <Circle cx={94} cy={36} r={7} fill="#5A3400" opacity={0.5} />
          <Circle cx={60} cy={72} r={47} fill="#8A5800" opacity={0.2} />
          <Circle cx={60} cy={70} r={47} fill="url(#b1)" />
          <Ellipse cx={40} cy={65} rx={18} ry={19} fill="white" />
          <Ellipse cx={80} cy={65} rx={18} ry={19} fill="white" />
          <Circle cx={40} cy={67} r={12} fill="#1A1A2E" />
          <Circle cx={80} cy={67} r={12} fill="#1A1A2E" />
          <Circle cx={45} cy={61} r={4.5} fill="white" opacity={0.9} />
          <Circle cx={85} cy={61} r={4.5} fill="white" opacity={0.9} />
          <Path d="M38 90 Q60 106 82 90" fill="none" stroke="#7A4800" strokeWidth={3.5} strokeLinecap="round" />
          <Rect x={29} y={113} width={22} height={12} rx={6} fill="#C4A878" />
          <Rect x={69} y={113} width={22} height={12} rx={6} fill="#C4A878" />
          <Circle cx={14} cy={88} r={13} fill="url(#coin1)" stroke="#A07010" strokeWidth={1.8} />
          <SvgText x={14} y={93} textAnchor="middle" fontSize={13} fill="#7A5000" fontWeight="600">
            $
          </SvgText>
        </Svg>
      </Animated.View>
    );
  }

  if (mood === "cheering") {
    return (
      <Animated.View style={{ width: size, height: size * 1.2, transform: [{ translateY }, { scale }, { rotate }] }}>
        <Svg viewBox="0 0 120 145" width={size} height={size * 1.2}>
          <Defs>
            <RadialGradient id="b7" cx="38%" cy="32%" r="65%">
              <Stop offset="0%" stopColor="#F2C040" />
              <Stop offset="55%" stopColor="#D08A10" />
              <Stop offset="100%" stopColor="#A06008" />
            </RadialGradient>
            <RadialGradient id="e7" cx="40%" cy="38%" r="60%">
              <Stop offset="0%" stopColor="#C07010" />
              <Stop offset="100%" stopColor="#7A4800" />
            </RadialGradient>
            <RadialGradient id="c7" cx="38%" cy="35%" r="62%">
              <Stop offset="0%" stopColor="#FFDF60" />
              <Stop offset="100%" stopColor="#C89010" />
            </RadialGradient>
          </Defs>
          <Ellipse cx={60} cy={135} rx={26} ry={5} fill="rgba(0,0,0,0.07)" />
          <Path d="M6 68 L6 80 L12 80 L20 88 L20 60 L12 68 Z" fill="url(#b7)" stroke="#9A6200" strokeWidth={1.2} />
          <Path d="M22 63 Q26 74 22 85" fill="none" stroke="#9A6200" strokeWidth={1.8} strokeLinecap="round" opacity={0.6} />
          <Path d="M25 58 Q32 74 25 90" fill="none" stroke="#9A6200" strokeWidth={1.5} strokeLinecap="round" opacity={0.35} />
          <Circle cx={26} cy={36} r={13} fill="url(#e7)" />
          <Circle cx={94} cy={36} r={13} fill="url(#e7)" />
          <Circle cx={26} cy={36} r={7} fill="#5A3400" opacity={0.5} />
          <Circle cx={94} cy={36} r={7} fill="#5A3400" opacity={0.5} />
          <Circle cx={60} cy={72} r={47} fill="#8A5800" opacity={0.2} />
          <Circle cx={60} cy={70} r={47} fill="url(#b7)" />
          <Path d="M17 66 Q8 50 12 36" stroke="#9A6200" strokeWidth={9} strokeLinecap="round" fill="none" />
          <Circle cx={12} cy={35} r={8} fill="url(#b7)" stroke="#9A6200" strokeWidth={1.2} />
          <Path d="M103 66 Q112 50 108 38" stroke="#9A6200" strokeWidth={9} strokeLinecap="round" fill="none" />
          <Circle cx={108} cy={37} r={8} fill="url(#b7)" stroke="#9A6200" strokeWidth={1.2} />
          <Ellipse cx={40} cy={65} rx={19} ry={20} fill="white" />
          <Ellipse cx={80} cy={65} rx={19} ry={20} fill="white" />
          <Circle cx={40} cy={67} r={13} fill="#1A1A2E" />
          <Circle cx={80} cy={67} r={13} fill="#1A1A2E" />
          <Circle cx={46} cy={61} r={5} fill="white" opacity={0.9} />
          <Circle cx={86} cy={61} r={5} fill="white" opacity={0.9} />
          <Ellipse cx={26} cy={77} rx={8} ry={5} fill="#E87070" opacity={0.22} />
          <Ellipse cx={94} cy={77} rx={8} ry={5} fill="#E87070" opacity={0.22} />
          <Ellipse cx={60} cy={91} rx={13} ry={8} fill="#8A5000" />
          <Ellipse cx={60} cy={93} rx={10} ry={6} fill="#C04040" opacity={0.8} />
          <Rect x={29} y={113} width={22} height={12} rx={6} fill="#C4A878" />
          <Rect x={69} y={113} width={22} height={12} rx={6} fill="#C4A878" />
          <Circle cx={14} cy={88} r={13} fill="url(#c7)" stroke="#A07010" strokeWidth={1.8} />
          <SvgText x={14} y={93} textAnchor="middle" fontSize={13} fill="#7A5000" fontWeight="600">
            $
          </SvgText>
        </Svg>
      </Animated.View>
    );
  }

  if (mood === "congratulating") {
    const height = size * 1.2;
    const confettiScaleX = size / 120;
    const confettiScaleY = height / 145;
    const rise = -30 * confettiScaleY;
    return (
      <Animated.View style={{ width: size, height: size * 1.2, transform: [{ translateY }, { scale }, { rotate }] }}>
        <View style={{ position: "absolute", width: size, height, left: 0, top: 0 }}>
          <Animated.View
            style={{
              position: "absolute",
              left: 14 * confettiScaleX,
              top: 20 * confettiScaleY,
              width: 6 * confettiScaleX,
              height: 6 * confettiScaleY,
              borderRadius: 1.5 * confettiScaleX,
              backgroundColor: "#2D5BE3",
              opacity: confetti[0].interpolate({ inputRange: [0, 0.25, 1], outputRange: [0, 1, 0] }),
              transform: [
                { translateY: confetti[0].interpolate({ inputRange: [0, 1], outputRange: [0, rise] }) },
                { rotate: confetti[0].interpolate({ inputRange: [0, 1], outputRange: ["25deg", "75deg"] }) },
              ],
            }}
          />
          <Animated.View
            style={{
              position: "absolute",
              left: 96 * confettiScaleX,
              top: 14 * confettiScaleY,
              width: 5 * confettiScaleX,
              height: 5 * confettiScaleY,
              borderRadius: 1.5 * confettiScaleX,
              backgroundColor: "#1D9E6A",
              opacity: confetti[1].interpolate({ inputRange: [0, 0.25, 1], outputRange: [0, 1, 0] }),
              transform: [
                { translateY: confetti[1].interpolate({ inputRange: [0, 1], outputRange: [0, rise] }) },
                { rotate: confetti[1].interpolate({ inputRange: [0, 1], outputRange: ["-15deg", "35deg"] }) },
              ],
            }}
          />
          <Animated.View
            style={{
              position: "absolute",
              left: 16.5 * confettiScaleX,
              top: 40.5 * confettiScaleY,
              width: 7 * confettiScaleX,
              height: 7 * confettiScaleY,
              borderRadius: 999,
              backgroundColor: "#F2C040",
              opacity: confetti[2].interpolate({ inputRange: [0, 0.25, 1], outputRange: [0, 1, 0] }),
              transform: [
                { translateY: confetti[2].interpolate({ inputRange: [0, 1], outputRange: [0, rise] }) },
                { rotate: confetti[2].interpolate({ inputRange: [0, 1], outputRange: ["0deg", "50deg"] }) },
              ],
            }}
          />
          <Animated.View
            style={{
              position: "absolute",
              left: 97 * confettiScaleX,
              top: 37 * confettiScaleY,
              width: 6 * confettiScaleX,
              height: 6 * confettiScaleY,
              borderRadius: 999,
              backgroundColor: "#2D5BE3",
              opacity: confetti[3].interpolate({ inputRange: [0, 0.25, 1], outputRange: [0, 1, 0] }),
              transform: [
                { translateY: confetti[3].interpolate({ inputRange: [0, 1], outputRange: [0, rise] }) },
                { rotate: confetti[3].interpolate({ inputRange: [0, 1], outputRange: ["0deg", "50deg"] }) },
              ],
            }}
          />
          <Animated.View
            style={{
              position: "absolute",
              left: 54 * confettiScaleX,
              top: 8 * confettiScaleY,
              width: 5 * confettiScaleX,
              height: 7 * confettiScaleY,
              borderRadius: 1.5 * confettiScaleX,
              backgroundColor: "#E07060",
              opacity: confetti[4].interpolate({ inputRange: [0, 0.25, 1], outputRange: [0, 1, 0] }),
              transform: [
                { translateY: confetti[4].interpolate({ inputRange: [0, 1], outputRange: [0, rise] }) },
                { rotate: confetti[4].interpolate({ inputRange: [0, 1], outputRange: ["12deg", "62deg"] }) },
              ],
            }}
          />
        </View>
        <Svg viewBox="0 0 120 145" width={size} height={size * 1.2}>
          <Defs>
            <RadialGradient id="b6" cx="38%" cy="32%" r="65%">
              <Stop offset="0%" stopColor="#FFF0A0" />
              <Stop offset="50%" stopColor="#F2C040" />
              <Stop offset="100%" stopColor="#C07808" />
            </RadialGradient>
            <RadialGradient id="e6" cx="40%" cy="38%" r="60%">
              <Stop offset="0%" stopColor="#C07010" />
              <Stop offset="100%" stopColor="#7A4800" />
            </RadialGradient>
            <RadialGradient id="c6" cx="38%" cy="35%" r="62%">
              <Stop offset="0%" stopColor="#FFDF60" />
              <Stop offset="100%" stopColor="#C89010" />
            </RadialGradient>
          </Defs>
          <Ellipse cx={60} cy={135} rx={26} ry={5} fill="rgba(0,0,0,0.07)" />
          <Circle cx={26} cy={36} r={13} fill="url(#e6)" />
          <Circle cx={94} cy={36} r={13} fill="url(#e6)" />
          <Circle cx={26} cy={36} r={7} fill="#5A3400" opacity={0.5} />
          <Circle cx={94} cy={36} r={7} fill="#5A3400" opacity={0.5} />
          <Circle cx={60} cy={72} r={47} fill="#8A5800" opacity={0.15} />
          <Circle cx={60} cy={70} r={47} fill="url(#b6)" />
          <Path d="M17 65 Q6 46 12 30" stroke="#A06008" strokeWidth={10} strokeLinecap="round" fill="none" />
          <Circle cx={12} cy={29} r={9} fill="url(#b6)" stroke="#A06008" strokeWidth={1.5} />
          <Path d="M103 65 Q114 46 108 30" stroke="#A06008" strokeWidth={10} strokeLinecap="round" fill="none" />
          <Circle cx={108} cy={29} r={9} fill="url(#b6)" stroke="#A06008" strokeWidth={1.5} />
          <Ellipse cx={40} cy={64} rx={19} ry={20} fill="white" />
          <Ellipse cx={80} cy={64} rx={19} ry={20} fill="white" />
          <Circle cx={40} cy={66} r={13} fill="#1A1A2E" />
          <Circle cx={80} cy={66} r={13} fill="#1A1A2E" />
          <Circle cx={46} cy={60} r={5} fill="white" opacity={0.9} />
          <Circle cx={86} cy={60} r={5} fill="white" opacity={0.9} />
          <Ellipse cx={26} cy={76} rx={9} ry={6} fill="#E87070" opacity={0.25} />
          <Ellipse cx={94} cy={76} rx={9} ry={6} fill="#E87070" opacity={0.25} />
          <Path d="M36 88 Q60 108 84 88" fill="#8A5000" />
          <Ellipse cx={60} cy={96} rx={16} ry={8} fill="#C04040" opacity={0.75} />
          <Path d="M36 88 Q60 108 84 88" fill="none" stroke="#6A3800" strokeWidth={2} />
          <Rect x={29} y={113} width={22} height={12} rx={6} fill="#C4A878" />
          <Rect x={69} y={113} width={22} height={12} rx={6} fill="#C4A878" />
          <Circle cx={14} cy={88} r={13} fill="url(#c6)" stroke="#A07010" strokeWidth={1.8} />
          <SvgText x={14} y={93} textAnchor="middle" fontSize={13} fill="#7A5000" fontWeight="600">
            $
          </SvgText>
        </Svg>
      </Animated.View>
    );
  }

  if (mood === "keepGoing") {
    return (
      <Animated.View style={{ width: size, height: size * 1.2, transform: [{ translateY }, { scale }, { rotate }] }}>
        <Svg viewBox="0 0 120 145" width={size} height={size * 1.2}>
          <Defs>
            <RadialGradient id="b18" cx="38%" cy="32%" r="65%">
              <Stop offset="0%" stopColor="#F2C040" />
              <Stop offset="55%" stopColor="#D08A10" />
              <Stop offset="100%" stopColor="#A06008" />
            </RadialGradient>
            <RadialGradient id="e18" cx="40%" cy="38%" r="60%">
              <Stop offset="0%" stopColor="#C07010" />
              <Stop offset="100%" stopColor="#7A4800" />
            </RadialGradient>
            <RadialGradient id="c18" cx="38%" cy="35%" r="62%">
              <Stop offset="0%" stopColor="#FFDF60" />
              <Stop offset="100%" stopColor="#C89010" />
            </RadialGradient>
          </Defs>
          <Ellipse cx={60} cy={135} rx={26} ry={5} fill="rgba(0,0,0,0.07)" />
          <Circle cx={26} cy={36} r={13} fill="url(#e18)" />
          <Circle cx={94} cy={36} r={13} fill="url(#e18)" />
          <Circle cx={26} cy={36} r={7} fill="#5A3400" opacity={0.5} />
          <Circle cx={94} cy={36} r={7} fill="#5A3400" opacity={0.5} />
          <Circle cx={60} cy={72} r={47} fill="#8A5800" opacity={0.2} />
          <Circle cx={60} cy={70} r={47} fill="url(#b18)" />
          <Path d="M18 72 Q6 62 8 50" stroke="#9A6200" strokeWidth={9} strokeLinecap="round" fill="none" />
          <Circle cx={8} cy={49} r={8} fill="url(#b18)" stroke="#9A6200" strokeWidth={1.2} />
          <Path d="M102 72 Q114 80 112 92" stroke="#9A6200" strokeWidth={9} strokeLinecap="round" fill="none" />
          <Circle cx={112} cy={93} r={8} fill="url(#b18)" stroke="#9A6200" strokeWidth={1.2} />
          <Path d="M2 54 L14 54" stroke="#D08A10" strokeWidth={1.8} opacity={0.4} strokeLinecap="round" />
          <Path d="M2 60 L12 60" stroke="#D08A10" strokeWidth={1.4} opacity={0.3} strokeLinecap="round" />
          <Path d="M2 66 L14 66" stroke="#D08A10" strokeWidth={1.8} opacity={0.4} strokeLinecap="round" />
          <Ellipse cx={40} cy={63} rx={18} ry={19} fill="white" />
          <Ellipse cx={80} cy={63} rx={18} ry={19} fill="white" />
          <Circle cx={42} cy={65} r={12} fill="#1A1A2E" />
          <Circle cx={82} cy={65} r={12} fill="#1A1A2E" />
          <Circle cx={47} cy={60} r={4.5} fill="white" opacity={0.9} />
          <Circle cx={87} cy={60} r={4.5} fill="white" opacity={0.9} />
          <Path d="M24 44 L42 48" stroke="#6A3800" strokeWidth={3} strokeLinecap="round" />
          <Path d="M78 48 L96 44" stroke="#6A3800" strokeWidth={3} strokeLinecap="round" />
          <Path d="M40 87 Q60 98 78 87" fill="none" stroke="#7A4800" strokeWidth={3} strokeLinecap="round" />
          <Ellipse cx={38} cy={112} rx={13} ry={8} fill="url(#b18)" stroke="#9A6200" strokeWidth={1.2} rotation={-18} originX={38} originY={112} />
          <Ellipse cx={76} cy={116} rx={13} ry={8} fill="url(#b18)" stroke="#9A6200" strokeWidth={1.2} rotation={14} originX={76} originY={116} />
          <Circle cx={14} cy={88} r={13} fill="url(#c18)" stroke="#A07010" strokeWidth={1.8} />
          <SvgText x={14} y={93} textAnchor="middle" fontSize={13} fill="#7A5000" fontWeight="600">
            $
          </SvgText>
        </Svg>
      </Animated.View>
    );
  }

  if (mood === "overjoyed") {
    return (
      <Animated.View style={{ width: size, height: size * 1.2, transform: [{ translateY }, { scale }, { rotate }] }}>
        <Svg viewBox="0 0 120 145" width={size} height={size * 1.2}>
          <Defs>
            <RadialGradient id="b9" cx="38%" cy="32%" r="65%">
              <Stop offset="0%" stopColor="#FFF8C0" />
              <Stop offset="45%" stopColor="#FFCF30" />
              <Stop offset="100%" stopColor="#B87008" />
            </RadialGradient>
            <RadialGradient id="e9" cx="40%" cy="38%" r="60%">
              <Stop offset="0%" stopColor="#C07010" />
              <Stop offset="100%" stopColor="#7A4800" />
            </RadialGradient>
            <RadialGradient id="c9" cx="38%" cy="35%" r="62%">
              <Stop offset="0%" stopColor="#FFDF60" />
              <Stop offset="100%" stopColor="#C89010" />
            </RadialGradient>
          </Defs>
          <SvgText x={4} y={24} fontSize={12} opacity={0.7}>✦</SvgText>
          <SvgText x={98} y={22} fontSize={12} opacity={0.7}>✦</SvgText>
          <SvgText x={50} y={10} fontSize={10} opacity={0.6}>✦</SvgText>
          <Ellipse cx={60} cy={135} rx={26} ry={5} fill="rgba(0,0,0,0.07)" />
          <Circle cx={26} cy={36} r={13} fill="url(#e9)" />
          <Circle cx={94} cy={36} r={13} fill="url(#e9)" />
          <Circle cx={26} cy={36} r={7} fill="#5A3400" opacity={0.5} />
          <Circle cx={94} cy={36} r={7} fill="#5A3400" opacity={0.5} />
          <Circle cx={60} cy={72} r={47} fill="#A07008" opacity={0.15} />
          <Circle cx={60} cy={70} r={47} fill="url(#b9)" />
          <Path d="M17 66 Q6 44 12 30" stroke="#A07008" strokeWidth={10} strokeLinecap="round" fill="none" />
          <Circle cx={12} cy={29} r={9} fill="url(#b9)" stroke="#A07008" strokeWidth={1.5} />
          <Path d="M103 66 Q114 44 108 30" stroke="#A07008" strokeWidth={10} strokeLinecap="round" fill="none" />
          <Circle cx={108} cy={29} r={9} fill="url(#b9)" stroke="#A07008" strokeWidth={1.5} />
          <Ellipse cx={40} cy={64} rx={19} ry={20} fill="white" />
          <Ellipse cx={80} cy={64} rx={19} ry={20} fill="white" />
          <SvgText x={31} y={71} fontSize={20} fill="#FFB800">★</SvgText>
          <SvgText x={71} y={71} fontSize={20} fill="#FFB800">★</SvgText>
          <Ellipse cx={26} cy={76} rx={9} ry={6} fill="#E87070" opacity={0.28} />
          <Ellipse cx={94} cy={76} rx={9} ry={6} fill="#E87070" opacity={0.28} />
          <Path d="M34 88 Q60 110 86 88" fill="#8A5000" />
          <Ellipse cx={60} cy={98} rx={18} ry={8.5} fill="#C04040" opacity={0.75} />
          <Path d="M34 88 Q60 110 86 88" fill="none" stroke="#6A3800" strokeWidth={2} />
          <Rect x={29} y={113} width={22} height={12} rx={6} fill="#C4A878" />
          <Rect x={69} y={113} width={22} height={12} rx={6} fill="#C4A878" />
          <Circle cx={14} cy={88} r={13} fill="url(#c9)" stroke="#A07010" strokeWidth={1.8} />
          <SvgText x={14} y={93} textAnchor="middle" fontSize={13} fill="#7A5000" fontWeight="600">
            $
          </SvgText>
        </Svg>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ width: size, height: size * 1.06, transform: [{ translateY }, { scale }, { rotate }] }}>
      <Svg viewBox="0 0 170 180" width={size} height={size * 1.06}>
        <SvgText x={10} y={44} fontSize={16} fill="#FFD700" opacity={starOpacity}>★</SvgText>
        <SvgText x={136} y={38} fontSize={14} fill="#FFD700" opacity={starOpacity}>★</SvgText>
        <SvgText x={72} y={14} fontSize={12} fill="#FF6B35" opacity={starOpacity}>✦</SvgText>

        <Circle cx={85} cy={100} r={78} fill="rgba(232,152,10,.08)" />
        <Circle cx={85} cy={100} r={72} fill="url(#coinGrad)" />
        <Circle cx={85} cy={100} r={72} fill="none" stroke="#9A6800" strokeWidth={3.5} />
        <Circle cx={85} cy={100} r={63} fill="none" stroke="#9A6800" strokeWidth={1.4} opacity={0.35} />
        <Ellipse cx={66} cy={72} rx={24} ry={13} fill="rgba(255,255,255,.28)" rotation={-20} originX={66} originY={72} />
        <Ellipse cx={64} cy={95} rx={16} ry={14} fill="rgba(80,40,0,.08)" />
        <Ellipse cx={106} cy={95} rx={16} ry={14} fill="rgba(80,40,0,.08)" />

        <Ellipse cx={64} cy={93} rx={14} ry={14} fill="white" />
        <Ellipse cx={106} cy={93} rx={14} ry={14} fill="white" />
        <Ellipse cx={65} cy={93} rx={9} ry={9.5} fill="#160800" />
        <Ellipse cx={107} cy={93} rx={9} ry={9.5} fill="#160800" />
        <Circle cx={70} cy={88} r={3.8} fill="white" />
        <Circle cx={112} cy={88} r={3.8} fill="white" />

        <Path d={brows.l} stroke="#7A4800" strokeWidth={4} fill="none" strokeLinecap="round" />
        <Path d={brows.r} stroke="#7A4800" strokeWidth={4} fill="none" strokeLinecap="round" />

        <Ellipse cx={85} cy={116} rx={19} ry={13} fill="#C88000" />
        <Ellipse cx={85} cy={115} rx={14} ry={9.5} fill="#9A5C00" />
        <Path d="M85 106 L85 110" stroke="#7A4800" strokeWidth={2.4} strokeLinecap="round" />
        <Path d={mouth} stroke="#7A4800" strokeWidth={3.5} fill="none" strokeLinecap="round" />
        {mood === "proud" && (
          <>
            <Circle cx={85} cy={78} r={8.5} fill="#FFD030" stroke="#C89010" strokeWidth={1.2} opacity={0.85} />
            <SvgText x={85} y={81} textAnchor="middle" fontSize={9} fill="#9A6000">★</SvgText>
          </>
        )}
        {mood === "celebrating" && (
          <>
            <Path d="M 66 130 Q 85 148 104 130" fill="white" />
            <Path d="M85 130 L85 147" stroke="#7A4800" strokeWidth={2} />
          </>
        )}

        <Defs>
          <RadialGradient id="coinGrad" cx="37%" cy="28%" r="67%">
            <Stop offset="0%" stopColor="#FFEC90" />
            <Stop offset="50%" stopColor="#FFB820" />
            <Stop offset="100%" stopColor="#B57800" />
          </RadialGradient>
        </Defs>
      </Svg>
    </Animated.View>
  );
}


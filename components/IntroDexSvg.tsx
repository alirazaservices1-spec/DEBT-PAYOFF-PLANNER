/**
 * Intro carousel Dex — pixel-aligned copies of `dex-intro-screens.html` SVGs
 * (160×194 display, viewBox 0 0 120 145).
 */
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Platform, View, StyleSheet } from "react-native";
import Svg, {
  Circle,
  Ellipse,
  G,
  Line,
  Path,
  Polygon,
  Rect,
  Text as SvgText,
  Defs,
  RadialGradient,
  Stop,
} from "react-native-svg";

const W = 160;
const H = 194;

/** Get Started carousel slide 1 — Dex card ① "Happy" from `dex_20_states` HTML (Core States). */
function SlideHappyGetStartedSvg() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 120 145" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <RadialGradient id="dexHappy_b1" cx="38%" cy="32%" r="65%">
          <Stop offset="0%" stopColor="#F2C040" />
          <Stop offset="55%" stopColor="#D08A10" />
          <Stop offset="100%" stopColor="#A06008" />
        </RadialGradient>
        <RadialGradient id="dexHappy_ear1" cx="40%" cy="38%" r="60%">
          <Stop offset="0%" stopColor="#C07010" />
          <Stop offset="100%" stopColor="#7A4800" />
        </RadialGradient>
        <RadialGradient id="dexHappy_coin1" cx="38%" cy="35%" r="62%">
          <Stop offset="0%" stopColor="#FFDF60" />
          <Stop offset="100%" stopColor="#C89010" />
        </RadialGradient>
      </Defs>
      <G>
        <Ellipse cx="60" cy="135" rx="26" ry="5" fill="rgba(0,0,0,0.07)" />
        <Circle cx="26" cy="36" r="13" fill="url(#dexHappy_ear1)" />
        <Circle cx="94" cy="36" r="13" fill="url(#dexHappy_ear1)" />
        <Circle cx="26" cy="36" r="7" fill="#5A3400" opacity={0.5} />
        <Circle cx="94" cy="36" r="7" fill="#5A3400" opacity={0.5} />
        <Circle cx="60" cy="72" r="47" fill="#8A5800" opacity={0.2} />
        <Circle cx="60" cy="70" r="47" fill="url(#dexHappy_b1)" />
        <Ellipse cx="40" cy="65" rx="18" ry="19" fill="white" />
        <Ellipse cx="80" cy="65" rx="18" ry="19" fill="white" />
        <Circle cx="40" cy="67" r="12" fill="#1A1A2E" />
        <Circle cx="80" cy="67" r="12" fill="#1A1A2E" />
        <Circle cx="45" cy="61" r="4.5" fill="white" opacity={0.9} />
        <Circle cx="85" cy="61" r="4.5" fill="white" opacity={0.9} />
        <Path d="M38 90 Q60 106 82 90" fill="none" stroke="#7A4800" strokeWidth={3.5} strokeLinecap="round" />
        <Rect x="29" y="113" width="22" height="12" rx={6} fill="#C4A878" />
        <Rect x="69" y="113" width="22" height="12" rx={6} fill="#C4A878" />
        <Circle cx="14" cy="88" r="13" fill="url(#dexHappy_coin1)" stroke="#A07010" strokeWidth={1.8} />
        <SvgText
          x="14"
          y="93"
          textAnchor="middle"
          fontFamily={Platform.select({ ios: "System", android: "sans-serif", default: "sans-serif" })}
          fontWeight="600"
          fontSize={13}
          fill="#7A5000"
        >
          $
        </SvgText>
      </G>
    </Svg>
  );
}

/** Matches HTML `.f-float`: 2.8s ease-in-out, ±6px vertical. */
const HAPPY_FLOAT_HALF_MS = 1400;

export function IntroDexHappySvg({ size = 160 }: { size?: number }) {
  const h = (size / W) * H;
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: HAPPY_FLOAT_HALF_MS,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: HAPPY_FLOAT_HALF_MS,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  const ty = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  return (
    <View style={[styles.wrap, { width: size, height: h }]}>
      <Animated.View style={[styles.svgBox, { transform: [{ translateY: ty }] }]}>
        <SlideHappyGetStartedSvg />
      </Animated.View>
    </View>
  );
}

function Slide1Svg() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 120 145" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <RadialGradient id="intro_s1b" cx="38%" cy="32%" r="65%">
          <Stop offset="0%" stopColor="#FFF0A0" />
          <Stop offset="45%" stopColor="#FFCF30" />
          <Stop offset="100%" stopColor="#B87008" />
        </RadialGradient>
        <RadialGradient id="intro_s1e" cx="40%" cy="38%" r="60%">
          <Stop offset="0%" stopColor="#C07010" />
          <Stop offset="100%" stopColor="#7A4800" />
        </RadialGradient>
        <RadialGradient id="intro_s1c" cx="38%" cy="35%" r="62%">
          <Stop offset="0%" stopColor="#FFDF60" />
          <Stop offset="100%" stopColor="#C89010" />
        </RadialGradient>
      </Defs>
      <G>
        <SvgText x="3" y="22" fontSize="11" opacity={0.7} fill="#FFB800">
          ✦
        </SvgText>
        <SvgText x="99" y="20" fontSize="11" opacity={0.65} fill="#FFB800">
          ✦
        </SvgText>
        <SvgText x="52" y="9" fontSize="9" opacity={0.6} fill="#FFD030">
          ★
        </SvgText>
        <Ellipse cx="60" cy="135" rx="26" ry="5" fill="rgba(0,0,0,0.07)" />
        <Circle cx="26" cy="36" r="13" fill="url(#intro_s1e)" />
        <Circle cx="94" cy="36" r="13" fill="url(#intro_s1e)" />
        <Circle cx="26" cy="36" r="7" fill="#5A3400" opacity={0.5} />
        <Circle cx="94" cy="36" r="7" fill="#5A3400" opacity={0.5} />
        <Circle cx="60" cy="72" r="47" fill="#A07008" opacity={0.14} />
        <Circle cx="60" cy="70" r="47" fill="url(#intro_s1b)" />
        <Path d="M17 66 Q5 44 10 28" stroke="#A07008" strokeWidth={10} strokeLinecap="round" fill="none" />
        <Ellipse
          cx="10"
          cy="27"
          rx="10"
          ry="8"
          fill="url(#intro_s1b)"
          stroke="#A07008"
          strokeWidth={1.4}
          transform="rotate(-20, 10, 27)"
        />
        <Path d="M103 66 Q115 44 110 28" stroke="#A07008" strokeWidth={10} strokeLinecap="round" fill="none" />
        <Ellipse
          cx="110"
          cy="27"
          rx="10"
          ry="8"
          fill="url(#intro_s1b)"
          stroke="#A07008"
          strokeWidth={1.4}
          transform="rotate(20, 110, 27)"
        />
        <Ellipse cx="40" cy="63" rx="19" ry="20" fill="white" />
        <Ellipse cx="80" cy="63" rx="19" ry="20" fill="white" />
        <Circle cx="40" cy="65" r="13" fill="#1A1A2E" />
        <Circle cx="80" cy="65" r="13" fill="#1A1A2E" />
        <Circle cx="46" cy="58" r="5" fill="white" opacity={0.92} />
        <Circle cx="86" cy="58" r="5" fill="white" opacity={0.92} />
        <Circle cx="36" cy="68" r="2" fill="white" opacity={0.5} />
        <Circle cx="76" cy="68" r="2" fill="white" opacity={0.5} />
        <Path d="M22 44 Q33 37 44 42" fill="none" stroke="#7A4800" strokeWidth={3} strokeLinecap="round" />
        <Path d="M76 42 Q87 37 98 44" fill="none" stroke="#7A4800" strokeWidth={3} strokeLinecap="round" />
        <Ellipse cx="25" cy="77" rx="10" ry="6" fill="#E87070" opacity={0.28} />
        <Ellipse cx="95" cy="77" rx="10" ry="6" fill="#E87070" opacity={0.28} />
        <Path d="M32 86 Q60 112 88 86" fill="#8A5000" />
        <Path d="M34 86 Q60 108 86 86" fill="white" opacity={0.7} />
        <Path d="M32 86 Q60 112 88 86" fill="none" stroke="#6A3800" strokeWidth={2.2} />
        <Rect x="29" y="113" width="22" height="12" rx="6" fill="#C4A878" />
        <Rect x="69" y="113" width="22" height="12" rx="6" fill="#C4A878" />
        <Circle cx="14" cy="88" r="13" fill="url(#intro_s1c)" stroke="#A07010" strokeWidth={1.8} />
        <SvgText
          x="14"
          y="93"
          textAnchor="middle"
          fontSize="13"
          fontWeight="600"
          fill="#7A5000"
        >
          $
        </SvgText>
      </G>
    </Svg>
  );
}

function Slide2Svg() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 120 145" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <RadialGradient id="intro_s2b" cx="38%" cy="32%" r="65%">
          <Stop offset="0%" stopColor="#FFFACC" />
          <Stop offset="40%" stopColor="#FFDB40" />
          <Stop offset="100%" stopColor="#C88008" />
        </RadialGradient>
        <RadialGradient id="intro_s2e" cx="40%" cy="38%" r="60%">
          <Stop offset="0%" stopColor="#C07010" />
          <Stop offset="100%" stopColor="#7A4800" />
        </RadialGradient>
        <RadialGradient id="intro_s2c" cx="38%" cy="35%" r="62%">
          <Stop offset="0%" stopColor="#FFDF60" />
          <Stop offset="100%" stopColor="#C89010" />
        </RadialGradient>
        <RadialGradient id="intro_s2g" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FFE566" stopOpacity={0.28} />
          <Stop offset="100%" stopColor="#FFE566" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <G>
        <Circle cx="60" cy="68" r="62" fill="url(#intro_s2g)" />
        <Polygon points="60,6 45,38 75,38" fill="#C03040" stroke="#8A2030" strokeWidth={1.2} />
        <Polygon points="52,38 68,38 63,26" fill="rgba(255,255,255,0.22)" />
        <Circle cx="60" cy="6" r="4" fill="#FFD030" stroke="#9A5000" strokeWidth={1} />
        <Line x1="60" y1="6" x2="73" y2="1" stroke="#C03040" strokeWidth={1.2} />
        <Circle cx="74" cy="0" r="3" fill="#4A2BA0" />
        <Rect x="5" y="28" width="5" height="8" rx="2" fill="#C03040" transform="rotate(20, 5, 28)" />
        <Rect x="101" y="20" width="5" height="8" rx="2" fill="#4A2BA0" transform="rotate(-15, 101, 20)" />
        <Rect x="3" y="68" width="4" height="7" rx="1" fill="#1D9E6A" transform="rotate(35, 3, 68)" />
        <Rect x="109" y="58" width="4" height="7" rx="1" fill="#2D5BE3" transform="rotate(-25, 109, 58)" />
        <Rect x="54" y="128" width="4" height="6" rx="1" fill="#D08A10" />
        <Ellipse cx="60" cy="135" rx="26" ry="5" fill="rgba(0,0,0,0.07)" />
        <Circle cx="26" cy="36" r="13" fill="url(#intro_s2e)" />
        <Circle cx="94" cy="36" r="13" fill="url(#intro_s2e)" />
        <Circle cx="26" cy="36" r="7" fill="#5A3400" opacity={0.5} />
        <Circle cx="94" cy="36" r="7" fill="#5A3400" opacity={0.5} />
        <Circle cx="60" cy="72" r="47" fill="#C08008" opacity={0.14} />
        <Circle cx="60" cy="70" r="47" fill="url(#intro_s2b)" />
        <Path d="M16 62 Q4 40 10 24" stroke="#C08008" strokeWidth={10} strokeLinecap="round" fill="none" />
        <Ellipse
          cx="10"
          cy="23"
          rx="10"
          ry="8"
          fill="url(#intro_s2b)"
          stroke="#C08008"
          strokeWidth={1.4}
          transform="rotate(-15, 10, 23)"
        />
        <Path d="M104 62 Q116 40 110 24" stroke="#C08008" strokeWidth={10} strokeLinecap="round" fill="none" />
        <Ellipse
          cx="110"
          cy="23"
          rx="10"
          ry="8"
          fill="url(#intro_s2b)"
          stroke="#C08008"
          strokeWidth={1.4}
          transform="rotate(15, 110, 23)"
        />
        <Ellipse cx="40" cy="63" rx="19" ry="20" fill="white" />
        <Ellipse cx="80" cy="63" rx="19" ry="20" fill="white" />
        <Circle cx="40" cy="65" r="12" fill="#1A1A2E" />
        <Circle cx="80" cy="65" r="12" fill="#1A1A2E" />
        <Circle cx="46" cy="59" r="4.5" fill="white" opacity={0.92} />
        <Circle cx="86" cy="59" r="4.5" fill="white" opacity={0.92} />
        <Circle cx="36" cy="68" r="2" fill="white" opacity={0.45} />
        <Circle cx="76" cy="68" r="2" fill="white" opacity={0.45} />
        <Path d="M21 46 Q33 38 45 43" fill="none" stroke="#7A4800" strokeWidth={3.5} strokeLinecap="round" />
        <Path d="M75 43 Q87 38 99 46" fill="none" stroke="#7A4800" strokeWidth={3.5} strokeLinecap="round" />
        <Ellipse cx="24" cy="77" rx="10" ry="6" fill="#E87070" opacity={0.3} />
        <Ellipse cx="96" cy="77" rx="10" ry="6" fill="#E87070" opacity={0.3} />
        <Path d="M30 85 Q60 114 90 85" fill="#8A5000" />
        <Path d="M32 85 Q60 110 88 85" fill="white" opacity={0.75} />
        <Path d="M30 85 Q60 114 90 85" fill="none" stroke="#6A3800" strokeWidth={2.2} />
        <Rect x="29" y="113" width="22" height="12" rx="6" fill="#C4A878" />
        <Rect x="69" y="113" width="22" height="12" rx="6" fill="#C4A878" />
        <Circle cx="14" cy="88" r="13" fill="url(#intro_s2c)" stroke="#A07010" strokeWidth={1.8} />
        <SvgText x="14" y="93" textAnchor="middle" fontSize="13" fontWeight="600" fill="#7A5000">
          $
        </SvgText>
      </G>
    </Svg>
  );
}

function Slide3Svg() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 120 145" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <RadialGradient id="intro_s3b" cx="38%" cy="32%" r="65%">
          <Stop offset="0%" stopColor="#F4C240" />
          <Stop offset="55%" stopColor="#D08A10" />
          <Stop offset="100%" stopColor="#A06008" />
        </RadialGradient>
        <RadialGradient id="intro_s3e" cx="40%" cy="38%" r="60%">
          <Stop offset="0%" stopColor="#C07010" />
          <Stop offset="100%" stopColor="#7A4800" />
        </RadialGradient>
        <RadialGradient id="intro_s3c" cx="38%" cy="35%" r="62%">
          <Stop offset="0%" stopColor="#FFDF60" />
          <Stop offset="100%" stopColor="#C89010" />
        </RadialGradient>
      </Defs>
      <G>
        <Ellipse cx="60" cy="135" rx="26" ry="5" fill="rgba(0,0,0,0.07)" />
        <Circle cx="26" cy="36" r="13" fill="url(#intro_s3e)" />
        <Circle cx="94" cy="36" r="13" fill="url(#intro_s3e)" />
        <Circle cx="26" cy="36" r="7" fill="#5A3400" opacity={0.5} />
        <Circle cx="94" cy="36" r="7" fill="#5A3400" opacity={0.5} />
        <Circle cx="60" cy="72" r="47" fill="#8A5800" opacity={0.18} />
        <Circle cx="60" cy="70" r="47" fill="url(#intro_s3b)" />
        <Path d="M18 72 Q6 58 10 44" stroke="#9A6200" strokeWidth={10} strokeLinecap="round" fill="none" />
        <Ellipse cx="10" cy="43" rx="10" ry="8" fill="url(#intro_s3b)" stroke="#9A6200" strokeWidth={1.2} />
        <Path d="M102 72 Q114 80 112 94" stroke="#9A6200" strokeWidth={10} strokeLinecap="round" fill="none" />
        <Ellipse
          cx="112"
          cy="95"
          rx="10"
          ry="8"
          fill="url(#intro_s3b)"
          stroke="#9A6200"
          strokeWidth={1.2}
          transform="rotate(15, 112, 95)"
        />
        <SvgText x="96" y="66" fontSize="11" fill="#E05060" opacity={0.8}>
          ♥
        </SvgText>
        <Ellipse cx="40" cy="63" rx="17" ry="18" fill="white" />
        <Ellipse cx="80" cy="63" rx="17" ry="18" fill="white" />
        <Circle cx="40" cy="65" r="11" fill="#1A1A2E" />
        <Circle cx="80" cy="65" r="11" fill="#1A1A2E" />
        <Circle cx="44" cy="60" r="4" fill="white" opacity={0.9} />
        <Circle cx="84" cy="60" r="4" fill="white" opacity={0.9} />
        <Path d="M25 47 Q33 43 43 46" fill="none" stroke="#7A4800" strokeWidth={2.8} strokeLinecap="round" />
        <Path d="M77 46 Q87 43 95 47" fill="none" stroke="#7A4800" strokeWidth={2.8} strokeLinecap="round" />
        <Ellipse cx="27" cy="76" rx="9" ry="5.5" fill="#E87070" opacity={0.2} />
        <Ellipse cx="93" cy="76" rx="9" ry="5.5" fill="#E87070" opacity={0.2} />
        <Path d="M35 86 Q60 106 85 86" fill="none" stroke="#7A4800" strokeWidth={3.2} strokeLinecap="round" />
        <Rect x="29" y="115" width="22" height="12" rx="6" fill="#C4A878" />
        <Rect x="69" y="115" width="22" height="12" rx="6" fill="#C4A878" />
        <Circle cx="14" cy="88" r="13" fill="url(#intro_s3c)" stroke="#A07010" strokeWidth={1.8} />
        <SvgText x="14" y="93" textAnchor="middle" fontSize="13" fontWeight="600" fill="#7A5000">
          $
        </SvgText>
      </G>
    </Svg>
  );
}

type Variant = 1 | 2 | 3;

export function IntroDexSvg({ variant, size = 160 }: { variant: Variant; size?: number }) {
  const h = (size / W) * H;
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const duration =
      variant === 1 ? 1200 : variant === 2 ? 1600 : 2200;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: duration / 2,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [variant, anim]);

  const ty = anim.interpolate({
    inputRange: [0, 1],
    outputRange: variant === 1 ? [0, -12] : [0, 0],
  });
  const rot = anim.interpolate({
    inputRange: [0, 1],
    outputRange:
      variant === 2
        ? ["-4deg", "4deg"]
        : variant === 3
          ? ["-3deg", "3deg"]
          : ["0deg", "0deg"],
  });

  const animatedStyle =
    variant === 1
      ? {
          transform: [
            { translateY: ty },
            {
              rotate: anim.interpolate({
                inputRange: [0, 0.4, 1],
                outputRange: ["0deg", "-5deg", "0deg"],
              }),
            },
          ],
        }
      : {
          transform: [{ rotate: rot }],
        };

  const inner =
    variant === 1 ? (
      <Slide1Svg />
    ) : variant === 2 ? (
      <Slide2Svg />
    ) : (
      <Slide3Svg />
    );

  return (
    <View style={[styles.wrap, { width: size, height: h }]}>
      <Animated.View style={[styles.svgBox, animatedStyle]}>
        {inner}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: "visible" as const },
  svgBox: { width: "100%", height: "100%" },
});

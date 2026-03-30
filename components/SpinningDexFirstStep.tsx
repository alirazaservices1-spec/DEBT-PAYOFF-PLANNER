import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, {
  Circle,
  Ellipse,
  Path,
  Text as SvgText,
  Defs,
  RadialGradient,
  Stop,
  G,
} from "react-native-svg";
import { Fonts } from "@/constants/fonts";

const VB_W = 120;
const VB_H = 145;

/**
 * Spinning Dex + dashed ring (matches provided HTML/SVG asset).
 * Rotation is driven by Reanimated (RN has no SVG CSS @keyframes).
 */
export function SpinningDexFirstStep({ size = 108 }: { size?: number }) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 3200, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const height = (size * VB_H) / VB_W;

  return (
    <View style={{ width: size, height, alignItems: "center", justifyContent: "center" }}>
      <Animated.View style={[{ width: size, height }, spinStyle]}>
        <Svg width="100%" height="100%" viewBox={`0 0 ${VB_W} ${VB_H}`}>
          <Defs>
            <RadialGradient id="sdfs-b10" cx="38%" cy="32%" r="65%">
              <Stop offset="0%" stopColor="#F2C040" />
              <Stop offset="55%" stopColor="#D08A10" />
              <Stop offset="100%" stopColor="#A06008" />
            </RadialGradient>
            <RadialGradient id="sdfs-e10" cx="40%" cy="38%" r="60%">
              <Stop offset="0%" stopColor="#C07010" />
              <Stop offset="100%" stopColor="#7A4800" />
            </RadialGradient>
            <RadialGradient id="sdfs-c10" cx="38%" cy="35%" r="62%">
              <Stop offset="0%" stopColor="#FFDF60" />
              <Stop offset="100%" stopColor="#C89010" />
            </RadialGradient>
          </Defs>

          <Circle
            cx="60"
            cy="70"
            r="54"
            fill="none"
            stroke="#F0A800"
            strokeWidth={1.5}
            strokeDasharray="5 9"
            opacity={0.2}
          />

          <G>
            <Ellipse cx="60" cy="126" rx="22" ry="4" fill="rgba(0,0,0,0.06)" />
            <Circle cx="26" cy="36" r="13" fill="url(#sdfs-e10)" />
            <Circle cx="94" cy="36" r="13" fill="url(#sdfs-e10)" />
            <Circle cx="26" cy="36" r="7" fill="#5A3400" opacity={0.5} />
            <Circle cx="94" cy="36" r="7" fill="#5A3400" opacity={0.5} />
            <Circle cx="60" cy="72" r="47" fill="#8A5800" opacity={0.2} />
            <Circle cx="60" cy="70" r="47" fill="url(#sdfs-b10)" />
            <Ellipse
              cx="8"
              cy="68"
              rx="14"
              ry="8"
              fill="url(#sdfs-b10)"
              stroke="#9A6200"
              strokeWidth={1.2}
              transform="rotate(-38 8 68)"
            />
            <Ellipse
              cx="112"
              cy="68"
              rx="14"
              ry="8"
              fill="url(#sdfs-b10)"
              stroke="#9A6200"
              strokeWidth={1.2}
              transform="rotate(38 112 68)"
            />
            <Ellipse cx="40" cy="65" rx="19" ry="20" fill="white" />
            <Ellipse cx="80" cy="65" rx="19" ry="20" fill="white" />
            <Path
              d="M25 65 Q30 58 38 65 Q46 72 53 65"
              fill="none"
              stroke="#1A1A2E"
              strokeWidth={2.5}
              strokeLinecap="round"
            />
            <Path
              d="M65 65 Q70 58 78 65 Q86 72 93 65"
              fill="none"
              stroke="#1A1A2E"
              strokeWidth={2.5}
              strokeLinecap="round"
            />
            <Ellipse cx="26" cy="77" rx="8" ry="5" fill="#E87070" opacity={0.22} />
            <Ellipse cx="94" cy="77" rx="8" ry="5" fill="#E87070" opacity={0.22} />
            <Ellipse cx="60" cy="91" rx="14" ry="9" fill="#8A5000" />
            <Ellipse cx="60" cy="93" rx="11" ry="7" fill="#C04040" opacity={0.8} />
            <Ellipse
              cx="36"
              cy="116"
              rx="14"
              ry="8"
              fill="url(#sdfs-b10)"
              stroke="#9A6200"
              strokeWidth={1.2}
              transform="rotate(-28 36 116)"
            />
            <Ellipse
              cx="84"
              cy="116"
              rx="14"
              ry="8"
              fill="url(#sdfs-b10)"
              stroke="#9A6200"
              strokeWidth={1.2}
              transform="rotate(28 84 116)"
            />
            <Circle
              cx="14"
              cy="88"
              r="13"
              fill="url(#sdfs-c10)"
              stroke="#A07010"
              strokeWidth={1.8}
            />
            <SvgText
              x="14"
              y="93"
              textAnchor="middle"
              fontFamily={Fonts.bold}
              fontSize="13"
              fill="#7A5000"
            >
              $
            </SvgText>
          </G>
        </Svg>
      </Animated.View>
    </View>
  );
}

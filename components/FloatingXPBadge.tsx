import React, { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

interface Props {
  amount: number;
  seq: number;
}

export function FloatingXPBadge({ amount, seq }: Props) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (seq === 0) return;
    translateY.value = 0;
    opacity.value = 0;
    opacity.value = withSequence(
      withTiming(1, { duration: 150, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 900 }),
      withTiming(0, { duration: 450, easing: Easing.in(Easing.quad) })
    );
    translateY.value = withTiming(-62, {
      duration: 1500,
      easing: Easing.out(Easing.cubic),
    });
  }, [seq]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.badge, animStyle]} pointerEvents="none">
      <Text style={styles.text}>+{amount} XP</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    right: 0,
    top: 0,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: Colors.primary + "22",
    borderWidth: 1,
    borderColor: Colors.primary + "60",
    zIndex: 999,
  },
  text: {
    fontSize: 13,
    fontFamily: Fonts.extraBold, fontWeight: "800",
    color: Colors.primary,
    letterSpacing: 0.3,
  },
});

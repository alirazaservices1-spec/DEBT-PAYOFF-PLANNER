import React, { useEffect } from "react";
import { StyleSheet, Text, View, Pressable, useColorScheme } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useGame } from "@/context/GameContext";

export function GraceWarningBanner() {
  const { gracePeriodActive, streakCount } = useGame();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const slideY = useSharedValue(-60);
  const opacity = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (gracePeriodActive) {
      slideY.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.back(1.5)) });
      opacity.value = withTiming(1, { duration: 300 });
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.04, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        true
      );
    } else {
      slideY.value = withTiming(-60, { duration: 250 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [gracePeriodActive]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideY.value }],
    opacity: opacity.value,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  if (!gracePeriodActive) return null;

  return (
    <Animated.View style={[styles.banner, containerStyle]}>
      <Animated.View style={[styles.iconWrap, pulseStyle]}>
        <Ionicons name="warning" size={20} color="#fff" />
      </Animated.View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>Don't lose your {streakCount}-day streak!</Text>
        <Text style={styles.sub}>
          Log a payment today to save your streak with your grace day.
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    backgroundColor: "#E67E22",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
    shadowColor: "#E67E22",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontFamily: Fonts.extraBold, fontWeight: "800",
    color: "#fff",
    marginBottom: 2,
  },
  sub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 16,
  },
});

import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { Fonts } from "@/constants/fonts";

/**
 * Shown when the user skipped the splash welcome ("Skip to home") so they can
 * open the full onboarding flow anytime.
 */
export function WelcomeSetupBanner() {
  const goSetup = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: "/onboarding", params: { restart: "1" } });
  };

  return (
    <View style={styles.wrap} accessibilityRole="summary">
      <View style={styles.iconRow}>
        <Ionicons name="sparkles" size={22} color="#1d4ed8" />
        <Text style={styles.kicker}>Finish your setup</Text>
      </View>
      <Text style={styles.title}>Welcome to your debt-free journey</Text>
      <Text style={styles.sub}>
        Run the guided setup to add debts, goals, and payoff dates - or keep exploring and come back here anytime.
      </Text>
      <Pressable onPress={goSetup} style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}>
        <LinearGradient
          colors={["#2563EB", "#1d4ed8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.btn}
        >
          <Text style={styles.btnText}>Start welcome setup</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#BFDBFE",
    padding: 16,
    marginBottom: 16,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  kicker: {
    fontFamily: Fonts.extraBold,
    fontSize: 12,
    color: "#1e40af",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: Fonts.extraBold,
    fontSize: 18,
    color: "#000000",
    marginBottom: 6,
  },
  sub: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
    marginBottom: 14,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  btnText: {
    fontFamily: Fonts.extraBold,
    fontSize: 17,
    color: "#fff",
  },
});

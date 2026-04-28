import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useGame, STREAK_MILESTONES, XP_REWARDS } from "@/context/GameContext";
import { setDevPreviewStreakDays } from "@/lib/devHomePreview";

type ThemeColors = typeof Colors.light;

export function DevRewardsPreviewSettings({ C }: { C: ThemeColors }) {
  const {
    triggerCelebration,
    triggerDexWithMessage,
    triggerMiniCelebration,
    grantBonusXp,
  } = useGame();

  const streakDays = [1, 3, 7, 14, 30, 60, 100];

  return (
    <>
      <Text style={[styles.sectionLabel, { color: C.textSecondary }]}>REWARDS PREVIEW (DEV ONLY)</Text>
      <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
        <Text style={[styles.explainer, { color: C.textSecondary }]}>
          Test Dex mood changes, XP toasts, streak milestones, freeze/missed-day behavior, and the award screen without
          waiting for real milestones.
        </Text>

        <Text style={[styles.subLabel, { color: C.text }]}>Streak milestone celebration</Text>
        <View style={styles.chipRow}>
          {streakDays.map((d) => (
            <Pressable
              key={d}
              onPress={async () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                await setDevPreviewStreakDays(d);
                triggerCelebration(
                  { type: "streak_milestone", streakDays: d, bonusXp: STREAK_MILESTONES[d] ?? 0 },
                  4200
                );
                triggerDexWithMessage("celebrating", `Preview: Day ${d} milestone (+${STREAK_MILESTONES[d] ?? 0} XP)`);
              }}
              style={[styles.chip, { borderColor: C.border, backgroundColor: C.background }]}
            >
              <Text style={[styles.chipText, { color: C.text }]}>Day {d}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.subLabel, { color: C.text }]}>Quick reward tests</Text>
        <View style={styles.row}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              triggerMiniCelebration({
                tier: 1,
                icon: "⚡",
                xp: XP_REWARDS.LOG_PAYMENT,
                label: "Payment logged",
              });
              triggerDexWithMessage("happy", "Preview: payment reward");
            }}
            style={[styles.actionBtn, { borderColor: C.border }]}
          >
            <Text style={[styles.actionText, { color: C.text }]}>+50 XP toast</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              triggerMiniCelebration({
                tier: 2,
                icon: "🛡️",
                xp: XP_REWARDS.STREAK_FREEZE,
                label: "Streak freeze saved your streak",
                slam: "SHIELD USED",
                sub: "Bonus XP applied",
              });
              triggerDexWithMessage("celebrating", "Preview: streak freeze save (+75 XP)");
              grantBonusXp(XP_REWARDS.STREAK_FREEZE);
            }}
            style={[styles.actionBtn, { borderColor: C.border }]}
          >
            <Text style={[styles.actionText, { color: C.text }]}>Freeze save +75 XP</Text>
          </Pressable>
        </View>

        <View style={styles.row}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              triggerDexWithMessage(
                "encouraging",
                "Preview: missed day support - no shame, just reset and continue."
              );
              router.replace({
                pathname: "/day-complete",
                params: { previewDex: "imWithYou", refreshKey: String(Date.now()) },
              } as any);
            }}
            style={[styles.actionBtn, { borderColor: C.border }]}
          >
            <Text style={[styles.actionText, { color: C.text }]}>Missed day Dex state</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.replace({
                pathname: "/day-complete",
                params: { refreshKey: String(Date.now()) },
              } as any);
            }}
            style={[styles.actionBtn, { borderColor: C.border }]}
          >
            <Text style={[styles.actionText, { color: C.text }]}>Open award screen</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            // Keep open until manually dismissed (Continue button).
            triggerCelebration({ type: "debt_cleared", debtName: "Chase Card" }, 0);
            triggerDexWithMessage("celebrating", "Preview: debt cleared celebration");
          }}
          style={[styles.rowAction, { borderTopColor: C.border }]}
        >
          <View style={[styles.rowIcon, { backgroundColor: "#D08A1018" }]}>
            <Ionicons name="trophy-outline" size={18} color="#D08A10" />
          </View>
          <Text style={[styles.rowLabel, { color: C.text }]}>Preview debt-cleared award overlay</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  explainer: {
    fontSize: 13,
    lineHeight: 19,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  subLabel: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    fontWeight: "700",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
  },
  row: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  actionBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    textAlign: "center",
  },
  rowAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  rowIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    flex: 1,
  },
});


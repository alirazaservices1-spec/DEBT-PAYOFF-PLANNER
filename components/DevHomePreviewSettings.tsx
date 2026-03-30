/**
 * Dev-only: preview Home tab banners + "Complete Day N" CTA. Shown from Settings (stack) and Settings tab.
 */
import React, { useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import {
  clearDevHomePreview,
  getDevPreviewActivityDay,
  getDevPreviewHomeState,
  getDevPreviewStreakDays,
  isDevHomePreviewAvailable,
  setDevPreviewActivityDay,
  setDevPreviewHomeState,
  setDevPreviewStreakDays,
  type DevHomePreviewState,
} from "@/lib/devHomePreview";

type ThemeColors = typeof Colors.light;

export function DevHomePreviewSettings({
  C,
  variant = "stack",
}: {
  C: ThemeColors;
  /** `tab` matches (tabs)/more.tsx section headers; `stack` matches app/settings.tsx */
  variant?: "stack" | "tab";
}) {
  const [devHomePreviewState, setDevHomePreviewState] = useState<DevHomePreviewState>("default");
  const [devActivityDayPick, setDevActivityDayPick] = useState<number | null>(null);
  const [devStreakPick, setDevStreakPick] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!isDevHomePreviewAvailable()) return;
      let ok = true;
      Promise.all([getDevPreviewHomeState(), getDevPreviewActivityDay(), getDevPreviewStreakDays()]).then(
        ([st, day, streak]) => {
          if (!ok) return;
          setDevHomePreviewState(st);
          setDevActivityDayPick(day);
          setDevStreakPick(streak);
        },
      );
      return () => {
        ok = false;
      };
    }, []),
  );

  if (!isDevHomePreviewAvailable()) return null;

  const sectionLabelStyle =
    variant === "tab"
      ? [styles.sectionLabelTab, { color: C.textSecondary }]
      : [styles.sectionLabelStack, { color: C.textSecondary }];

  return (
    <>
      <Text style={sectionLabelStyle}>HOME PREVIEW (DEV ONLY)</Text>
      <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
        <Text style={[styles.devPreviewExplainer, { color: C.textSecondary }]}>
          Open the Home tab to preview copy and layout. This does not change saved game data. By default the 🔥 streak
          pill still shows your real streak while you only change the &quot;Complete Day…&quot; label - use
          &quot;Streak pill&quot; below to match (e.g. Day 4 button + 3d streak).
        </Text>
        <Text style={[styles.devPreviewSubLabel, { color: C.text }]}>Wrap-up state</Text>
        <View style={styles.devChipRow}>
          {(
            [
              { key: "default" as const, label: "Live (real data)" },
              { key: "needs_wrap" as const, label: "Need wrap-up" },
              { key: "completed_today" as const, label: "Done today" },
              { key: "skipped_wrap" as const, label: "Skipped" },
            ] as const
          ).map(({ key, label }) => (
            <Pressable
              key={key}
              onPress={async () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                await setDevPreviewHomeState(key);
                setDevHomePreviewState(key);
              }}
              style={[
                styles.devChip,
                { borderColor: C.border, backgroundColor: devHomePreviewState === key ? Colors.primary + "22" : C.background },
              ]}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: Fonts.semiBold,
                  color: devHomePreviewState === key ? Colors.primary : C.text,
                }}
                numberOfLines={2}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={[styles.devPreviewSubLabel, { color: C.text, marginTop: 12 }]}>CTA day label</Text>
        <Text style={[styles.devPreviewHint, { color: C.textSecondary }]}>
          When the green button shows: pick Day 2, 3, 4… or leave App default (uses streak).
        </Text>
        <View style={styles.devChipRow}>
          <Pressable
            onPress={async () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              await setDevPreviewActivityDay(null);
              setDevActivityDayPick(null);
            }}
            style={[
              styles.devChip,
              { borderColor: C.border, backgroundColor: devActivityDayPick == null ? Colors.primary + "22" : C.background },
            ]}
          >
            <Text
              style={{
                fontSize: 12,
                fontFamily: Fonts.semiBold,
                color: devActivityDayPick == null ? Colors.primary : C.text,
              }}
            >
              App default
            </Text>
          </Pressable>
          {[1, 2, 3, 4, 5, 6, 7, 10].map((d) => (
            <Pressable
              key={d}
              onPress={async () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                await setDevPreviewActivityDay(d);
                setDevActivityDayPick(d);
              }}
              style={[
                styles.devChip,
                { borderColor: C.border, backgroundColor: devActivityDayPick === d ? Colors.primary + "22" : C.background },
              ]}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: Fonts.semiBold,
                  color: devActivityDayPick === d ? Colors.primary : C.text,
                }}
              >
                Day {d}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={[styles.devPreviewSubLabel, { color: C.text, marginTop: 12 }]}>Streak pill (🔥 Nd)</Text>
        <Text style={[styles.devPreviewHint, { color: C.textSecondary }]}>
          Optional. Home header and Current Streak card only - not your real streak in the database.
        </Text>
        <View style={styles.devChipRow}>
          <Pressable
            onPress={async () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              await setDevPreviewStreakDays(null);
              setDevStreakPick(null);
            }}
            style={[
              styles.devChip,
              { borderColor: C.border, backgroundColor: devStreakPick == null ? Colors.primary + "22" : C.background },
            ]}
          >
            <Text
              style={{
                fontSize: 12,
                fontFamily: Fonts.semiBold,
                color: devStreakPick == null ? Colors.primary : C.text,
              }}
            >
              App real
            </Text>
          </Pressable>
          {[0, 1, 2, 3, 5, 7, 14].map((d) => (
            <Pressable
              key={d}
              onPress={async () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                await setDevPreviewStreakDays(d);
                setDevStreakPick(d);
              }}
              style={[
                styles.devChip,
                { borderColor: C.border, backgroundColor: devStreakPick === d ? Colors.primary + "22" : C.background },
              ]}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: Fonts.semiBold,
                  color: devStreakPick === d ? Colors.primary : C.text,
                }}
              >
                {d}d
              </Text>
            </Pressable>
          ))}
        </View>
        <Pressable
          onPress={async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await clearDevHomePreview();
            setDevHomePreviewState("default");
            setDevActivityDayPick(null);
            setDevStreakPick(null);
          }}
          style={[styles.row, styles.rowLast, { marginTop: 8 }]}
        >
          <View style={[styles.rowIcon, { backgroundColor: C.textSecondary + "22" }]}>
            <Ionicons name="refresh-outline" size={20} color={C.textSecondary} />
          </View>
          <Text style={[styles.rowLabel, { color: C.text }]}>Reset home preview</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionLabelStack: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  sectionLabelTab: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingHorizontal: 4,
    paddingTop: 20,
    paddingBottom: 6,
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLast: { borderBottomWidth: 0 },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { flex: 1, fontSize: 17, fontWeight: "500" },
  devPreviewExplainer: {
    fontSize: 13,
    lineHeight: 19,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  devPreviewSubLabel: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    fontWeight: "700",
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  devPreviewHint: {
    fontSize: 12,
    lineHeight: 17,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  devChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  devChip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    maxWidth: "48%",
  },
});

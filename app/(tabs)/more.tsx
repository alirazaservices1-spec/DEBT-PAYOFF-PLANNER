import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
  Platform,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useGoal } from "@/context/GoalContext";
import { useStreakReminder } from "@/context/StreakReminderContext";
import { useDebts } from "@/context/DebtContext";
import { useCurrency } from "@/context/CurrencyContext";
import { monthsToText } from "@/lib/calculations";

function SectionCard({
  icon,
  iconBg,
  title,
  subtitle,
  chips,
  onPress,
  isDark,
  C,
}: {
  icon: string;
  iconBg: string;
  title: string;
  subtitle: string;
  chips?: { label: string; value: string }[];
  onPress: () => void;
  isDark: boolean;
  C: typeof Colors.light;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: C.surface,
          borderColor: C.border,
          opacity: pressed ? 0.88 : 1,
          shadowColor: isDark ? "#000" : Colors.primary,
        },
      ]}
    >
      <View style={styles.cardTop}>
        <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
          <Ionicons name={icon as any} size={26} color="#fff" />
        </View>
        <View style={styles.cardTextWrap}>
          <Text style={[styles.cardTitle, { color: C.text }]}>{title}</Text>
          <Text style={[styles.cardSub, { color: C.textSecondary }]}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={C.textSecondary} />
      </View>

      {chips && chips.length > 0 && (
        <View style={[styles.chipRow, { borderTopColor: C.border }]}>
          {chips.map((c) => (
            <View key={c.label} style={[styles.chip, { backgroundColor: Colors.primary + "14", borderColor: Colors.primary + "30" }]}>
              <Text style={[styles.chipLabel, { color: C.textSecondary }]}>{c.label}</Text>
              <Text style={[styles.chipValue, { color: Colors.primary }]}>{c.value}</Text>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
}


export default function MoreScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { fmt } = useCurrency();

  const { goalName, goalAmount, hasGoal, remindersEnabled } = useGoal();
  const { streakReminderEnabled, setStreakReminderEnabled } = useStreakReminder();
  const { debts, avalancheResult } = useDebts();

  const totalDebt = debts.reduce((s, d) => s + d.balance, 0);

  const goalChips = hasGoal
    ? [
        { label: "Goal", value: goalName },
        { label: "Amount", value: fmt(goalAmount) },
        { label: "Reminders", value: remindersEnabled ? "On" : "Off" },
      ]
    : [];

  const calcChips =
    totalDebt > 0
      ? [
          { label: "Total Debt", value: fmt(totalDebt) },
          { label: "Payoff", value: avalancheResult ? monthsToText(avalancheResult.totalMonths) : "—" },
        ]
      : [];

  const webTopPad = Platform.OS === "web" ? 67 : 0;
  const bottomPad = Math.max(insets.bottom, Platform.OS === "web" ? 100 : 90);

  return (
    <View style={[styles.wrapper, { backgroundColor: C.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: Platform.OS === "web" ? webTopPad : insets.top + 8,
            backgroundColor: C.background,
            borderBottomColor: C.border,
          },
        ]}
      >
        <View style={styles.headerBrand}>
          <ExpoImage
            source={require("@/assets/images/iconApp.png")}
            style={styles.headerBrandIcon}
            contentFit="contain"
            transition={0}
            cachePolicy="memory-disk"
          />
          <Text style={[styles.headerBrandName, { color: C.textSecondary }]}>
            DebtPath: Payoff Planner
          </Text>
        </View>
        <Text style={[styles.headerTitle, { color: C.text }]}>More</Text>
        <Text style={[styles.headerSub, { color: C.textSecondary }]}>
          Goal &amp; Calculator
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
      >

      <SectionCard
        icon="flag"
        iconBg={Colors.buttonGreen}
        title="Personal Goal"
        subtitle={hasGoal ? `Working toward: ${goalName}` : "Set a financial goal and track your path"}
        chips={goalChips}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push("/goal");
        }}
        isDark={isDark}
        C={C}
      />

      <SectionCard
        icon="calculator"
        iconBg="#8E44AD"
        title="Calculator"
        subtitle="Payoff, consolidation and savings calculators"
        chips={calcChips}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push("/calculators");
        }}
        isDark={isDark}
        C={C}
      />

      <View style={[styles.toggleCard, { backgroundColor: C.surface, borderColor: C.border }]}>
        <View style={[styles.toggleIconWrap, { backgroundColor: "#FF6B1A18" }]}>
          <Ionicons name="flame-outline" size={22} color="#FF6B1A" />
        </View>
        <View style={styles.toggleTextWrap}>
          <Text style={[styles.toggleTitle, { color: C.text }]}>Streak Reminders</Text>
          <Text style={[styles.toggleSub, { color: C.textSecondary }]}>
            {streakReminderEnabled ? "On — 8:00 PM daily" : "Off — tap to enable"}
          </Text>
        </View>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setStreakReminderEnabled(!streakReminderEnabled);
          }}
          style={[
            styles.toggle,
            { backgroundColor: streakReminderEnabled ? "#FF6B1A" : C.border },
          ]}
        >
          <View
            style={[
              styles.toggleThumb,
              { transform: [{ translateX: streakReminderEnabled ? 20 : 2 }] },
            ]}
          />
        </Pressable>
      </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 14, gap: 14 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBrand: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  headerBrandIcon: { width: 24, height: 24, borderRadius: 6 },
  headerBrandName: { fontSize: 12, fontFamily: Fonts.semiBold, fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase" },
  headerTitle: { fontSize: 28, fontFamily: Fonts.extraBold, fontWeight: "800", letterSpacing: -0.5 },
  headerSub: { fontSize: 16, marginTop: 2 },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    gap: 14,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTextWrap: { flex: 1 },
  cardTitle: {
    fontSize: 17,
    fontFamily: Fonts.extraBold, fontWeight: "800",
    marginBottom: 3,
  },
  cardSub: {
    fontSize: 13,
    lineHeight: 18,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
  },
  chip: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: "center",
  },
  chipLabel: {
    fontSize: 10,
    fontFamily: Fonts.semiBold, fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  chipValue: {
    fontSize: 14,
    fontFamily: Fonts.extraBold, fontWeight: "800",
  },
  toggleCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 14,
    shadowColor: "#FF6B1A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  toggleIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleTextWrap: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontFamily: Fonts.bold, fontWeight: "700",
    marginBottom: 2,
  },
  toggleSub: {
    fontSize: 12,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});

import React, { useState, useEffect } from "react";
import { router } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useIsDark } from "@/context/ThemeContext";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useGoal } from "@/context/GoalContext";
import { useCurrency } from "@/context/CurrencyContext";

function ResultCard({
  goalName,
  goalAmount,
  fmt,
  isDark,
  C,
}: {
  goalName: string;
  goalAmount: number;
  fmt: (n: number) => string;
  isDark: boolean;
  C: typeof Colors.light;
}) {
  const dailySaving = goalAmount > 0 ? Math.max(1, goalAmount / 365) : 0;
  const daysToGoal = goalAmount > 0 ? Math.ceil(goalAmount / dailySaving) : 0;

  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 14, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 300 });
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.resultCard,
        {
          backgroundColor: isDark ? Colors.dark.surface : "#EAF7EF",
          borderColor: Colors.primary + "60",
        },
        style,
      ]}
    >
      <View style={styles.resultIconRow}>
        <Text style={styles.resultEmoji}>🎯</Text>
        <Text style={[styles.resultTitle, { color: C.text }]}>Goal Breakdown</Text>
      </View>
      <Text style={[styles.resultBody, { color: C.text }]}>
        For your goal of{" "}
        <Text style={{ fontFamily: Fonts.extraBold, fontWeight: "800", color: Colors.primary }}>{goalName}</Text>
        {" "}and{" "}
        <Text style={{ fontFamily: Fonts.extraBold, fontWeight: "800", color: Colors.primary }}>{fmt(goalAmount)}</Text>
        , all you need to do is save{" "}
        <Text style={{ fontFamily: Fonts.extraBold, fontWeight: "800", color: Colors.primary }}>
          ${dailySaving.toFixed(2)}/day
        </Text>{" "}
        and apply it to debt payoff, and in{" "}
        <Text style={{ fontFamily: Fonts.extraBold, fontWeight: "800", color: Colors.primary }}>{daysToGoal} days</Text>{" "}
        you'll have the money.
      </Text>
      <View style={[styles.resultDivider, { backgroundColor: Colors.primary + "30" }]} />
      <View style={styles.resultStats}>
        <View style={styles.resultStat}>
          <Text style={[styles.resultStatValue, { color: Colors.primary }]}>
            ${dailySaving.toFixed(2)}
          </Text>
          <Text style={[styles.resultStatLabel, { color: C.textSecondary }]}>per day</Text>
        </View>
        <View style={[styles.resultStatDivider, { backgroundColor: C.border }]} />
        <View style={styles.resultStat}>
          <Text style={[styles.resultStatValue, { color: Colors.primary }]}>
            {daysToGoal}
          </Text>
          <Text style={[styles.resultStatLabel, { color: C.textSecondary }]}>days to goal</Text>
        </View>
        <View style={[styles.resultStatDivider, { backgroundColor: C.border }]} />
        <View style={styles.resultStat}>
          <Text style={[styles.resultStatValue, { color: Colors.primary }]}>
            {fmt(goalAmount)}
          </Text>
          <Text style={[styles.resultStatLabel, { color: C.textSecondary }]}>goal amount</Text>
        </View>
      </View>
    </Animated.View>
  );
}

function GoalProgressCard({
  goalProgress,
  goalAmount,
  fmt,
  isDark,
  C,
}: {
  goalProgress: number;
  goalAmount: number;
  fmt: (n: number) => string;
  isDark: boolean;
  C: typeof Colors.light;
}) {
  const pct = goalAmount > 0 ? Math.min(1, goalProgress / goalAmount) : 0;
  const remaining = Math.max(0, goalAmount - goalProgress);
  const isComplete = goalProgress >= goalAmount;

  const barAnim = useSharedValue(0);
  useEffect(() => {
    barAnim.value = withTiming(pct, { duration: 800 });
  }, [pct]);
  const barStyle = useAnimatedStyle(() => ({
    width: `${barAnim.value * 100}%`,
  }));

  return (
    <View
      style={[
        styles.progressCard,
        {
          backgroundColor: isComplete
            ? Colors.primary + "18"
            : isDark
            ? Colors.dark.surface
            : "#EAF7EF",
          borderColor: isComplete ? Colors.primary : Colors.primary + "40",
        },
      ]}
    >
      <View style={styles.progressCardHeader}>
        <Ionicons
          name={isComplete ? "checkmark-circle" : "trending-up"}
          size={18}
          color={Colors.primary}
        />
        <Text style={[styles.progressCardTitle, { color: C.text }]}>
          {isComplete ? "Goal Reached! 🎉" : "Goal Progress"}
        </Text>
        <Text style={[styles.progressCardPct, { color: Colors.primary }]}>
          {Math.round(pct * 100)}%
        </Text>
      </View>

      <View style={[styles.progressTrack, { backgroundColor: isDark ? "#1A2E1F" : "#C8EDD8" }]}>
        <Animated.View
          style={[
            styles.progressFill,
            barStyle,
            { backgroundColor: isComplete ? Colors.primary : Colors.progressGreen },
          ]}
        />
      </View>

      <View style={styles.progressAmounts}>
        <View style={styles.progressAmountItem}>
          <Text style={[styles.progressAmountValue, { color: Colors.primary }]}>
            {fmt(goalProgress)}
          </Text>
          <Text style={[styles.progressAmountLabel, { color: C.textSecondary }]}>contributed</Text>
        </View>
        {!isComplete && (
          <>
            <View style={[styles.progressAmountDivider, { backgroundColor: C.border }]} />
            <View style={styles.progressAmountItem}>
              <Text style={[styles.progressAmountValue, { color: C.text }]}>
                {fmt(remaining)}
              </Text>
              <Text style={[styles.progressAmountLabel, { color: C.textSecondary }]}>remaining</Text>
            </View>
          </>
        )}
        <View style={[styles.progressAmountDivider, { backgroundColor: C.border }]} />
        <View style={styles.progressAmountItem}>
          <Text style={[styles.progressAmountValue, { color: C.text }]}>
            {fmt(goalAmount)}
          </Text>
          <Text style={[styles.progressAmountLabel, { color: C.textSecondary }]}>target</Text>
        </View>
      </View>

      {!isComplete && (
        <Text style={[styles.progressTip, { color: C.textSecondary }]}>
          Every payment logged counts toward this goal.
        </Text>
      )}
    </View>
  );
}

export default function GoalScreen() {
  const isDark = useIsDark();
  const C = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { fmt } = useCurrency();

  const {
    goalName,
    goalAmount,
    goalProgress,
    remindersEnabled,
    hasGoal,
    loaded,
    saveGoal,
    deleteGoal,
    setRemindersEnabled,
  } = useGoal();

  const [editing, setEditing] = useState(!hasGoal);
  const [nameInput, setNameInput] = useState(goalName);
  const [amountInput, setAmountInput] = useState(goalAmount > 0 ? String(goalAmount) : "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loaded && !hasGoal) setEditing(true);
    if (loaded && hasGoal) {
      setNameInput(goalName);
      setAmountInput(String(goalAmount));
    }
  }, [loaded, hasGoal]);

  const handleSave = async () => {
    const name = nameInput.trim();
    const amount = parseFloat(amountInput.replace(/[^0-9.]/g, ""));
    if (!name) {
      Alert.alert("Goal name required", "Please enter what you're saving for.");
      return;
    }
    if (!amount || amount <= 0) {
      Alert.alert("Amount required", "Please enter how much you need.");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaving(true);
    await saveGoal(name, amount);
    setSaving(false);
    setEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Goal",
      "This will remove your goal and cancel daily reminders.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await deleteGoal();
            setNameInput("");
            setAmountInput("");
            setEditing(true);
          },
        },
      ]
    );
  };

  const handleToggleReminders = async (val: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await setRemindersEnabled(val);
  };

  const bottomPad = Math.max(insets.bottom, Platform.OS === "web" ? 100 : 90);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Fixed nav bar — always visible above scroll */}
      <View style={[styles.navBar, { paddingTop: insets.top, backgroundColor: C.background, borderBottomColor: C.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={16}>
          <Ionicons name="chevron-back" size={30} color={Colors.primary} />
          <Text style={[styles.backLabel, { color: Colors.primary }]}>Back</Text>
        </Pressable>
        <Text style={[styles.navTitle, { color: C.text }]}>Personal Goal</Text>
        <View style={{ width: 72 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.container, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Sub-header description */}
        <View style={styles.header}>
          <Text style={[styles.headerSub, { color: C.textSecondary }]}>
            Set a goal and let DebtPath calculate your path to it.
          </Text>
        </View>

        {/* Form or result */}
        {editing ? (
          <View style={[styles.formCard, { backgroundColor: C.surface, borderColor: C.border }]}>
            <Text style={[styles.formLabel, { color: C.text }]}>What is your goal?</Text>
            <TextInput
              style={[
                styles.input,
                { color: C.text, backgroundColor: C.surfaceSecondary, borderColor: C.border },
              ]}
              placeholder="e.g. Buy a car, Holiday, Emergency fund"
              placeholderTextColor={C.textTertiary}
              value={nameInput}
              onChangeText={setNameInput}
              returnKeyType="next"
              maxLength={60}
            />

            <Text style={[styles.formLabel, { color: C.text, marginTop: 16 }]}>
              How much do you need?
            </Text>
            <View
              style={[
                styles.amountInputRow,
                { backgroundColor: C.surfaceSecondary, borderColor: C.border },
              ]}
            >
              <Text style={[styles.currencySign, { color: C.textSecondary }]}>$</Text>
              <TextInput
                style={[styles.amountInput, { color: C.text }]}
                placeholder="5,000"
                placeholderTextColor={C.textTertiary}
                keyboardType="decimal-pad"
                value={amountInput}
                onChangeText={setAmountInput}
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
            </View>

            <Pressable
              onPress={handleSave}
              style={({ pressed }) => [
                styles.saveBtn,
                { backgroundColor: Colors.buttonGreen, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={styles.saveBtnText}>
                {saving ? "Saving…" : hasGoal ? "Update Goal" : "Save Goal"}
              </Text>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
            </Pressable>
          </View>
        ) : (
          <>
            <ResultCard
              goalName={goalName}
              goalAmount={goalAmount}
              fmt={fmt}
              isDark={isDark}
              C={C}
            />

            {/* Progress tracker — visible once any payment has been logged */}
            {goalProgress > 0 && (
              <GoalProgressCard
                goalProgress={goalProgress}
                goalAmount={goalAmount}
                fmt={fmt}
                isDark={isDark}
                C={C}
              />
            )}

            {/* Action buttons */}
            <View style={styles.actionRow}>
              <Pressable
                onPress={() => { setEditing(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                style={({ pressed }) => [
                  styles.editBtn,
                  { borderColor: C.border, backgroundColor: C.surface, opacity: pressed ? 0.75 : 1 },
                ]}
              >
                <Ionicons name="pencil-outline" size={16} color={C.text} />
                <Text style={[styles.editBtnText, { color: C.text }]}>Edit Goal</Text>
              </Pressable>
              <Pressable
                onPress={handleDelete}
                style={({ pressed }) => [
                  styles.deleteBtn,
                  { borderColor: Colors.danger + "50", opacity: pressed ? 0.75 : 1 },
                ]}
              >
                <Ionicons name="trash-outline" size={16} color={Colors.danger} />
                <Text style={[styles.deleteBtnText]}>Delete</Text>
              </Pressable>
            </View>
          </>
        )}

        {/* Reminder toggle — always visible */}
        <View style={[styles.reminderCard, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={styles.reminderRow}>
            <View style={styles.reminderLeft}>
              <Text style={[styles.reminderTitle, { color: C.text }]}>
                Daily Motivational Reminders
              </Text>
              <Text style={[styles.reminderSub, { color: C.textSecondary }]}>
                {hasGoal
                  ? `Sent daily at 9:00 AM - referencing your "${goalName}" goal`
                  : "A daily check-in at 9:00 AM to stay on track"}
              </Text>
              {Platform.OS === "web" && (
                <Text style={[styles.reminderSub, { color: Colors.warning, marginTop: 4 }]}>
                  Push notifications require the native app (iOS/Android).
                </Text>
              )}
            </View>
            <Pressable
              onPress={() => handleToggleReminders(!remindersEnabled)}
              style={[
                styles.toggle,
                {
                  backgroundColor: remindersEnabled ? Colors.primary : C.border,
                },
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  { transform: [{ translateX: remindersEnabled ? 20 : 2 }] },
                ]}
              />
            </Pressable>
          </View>

        </View>

        {/* Tip */}
        <View style={[styles.tipCard, { backgroundColor: Colors.primary + "10", borderColor: Colors.primary + "30" }]}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={[styles.tipText, { color: C.textSecondary }]}>
            Applying your daily savings amount directly toward debt payoff accelerates your
            debt-free date AND builds your goal fund simultaneously.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 14,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navTitle: {
    flex: 1,
    fontSize: 17,
    fontFamily: Fonts.bold, fontWeight: "700",
    textAlign: "center",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 8,
    minWidth: 72,
  },
  backLabel: {
    fontSize: 17,
    fontWeight: "400",
    marginLeft: -2,
  },
  header: {
    paddingBottom: 4,
    paddingTop: 8,
  },
  headerSub: {
    fontSize: 14,
    lineHeight: 20,
  },
  formCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  formLabel: {
    fontSize: 16,
    fontFamily: Fonts.bold, fontWeight: "700",
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    fontWeight: "500",
  },
  amountInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 2,
  },
  currencySign: {
    fontSize: 18,
    fontFamily: Fonts.bold, fontWeight: "700",
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: 22,
    fontFamily: Fonts.bold, fontWeight: "700",
    paddingVertical: 11,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 15,
    marginTop: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 17,
    fontFamily: Fonts.extraBold, fontWeight: "800",
    letterSpacing: 0.3,
  },
  resultCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  resultIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  resultEmoji: {
    fontSize: 28,
  },
  resultTitle: {
    fontSize: 18,
    fontFamily: Fonts.extraBold, fontWeight: "800",
  },
  resultBody: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 16,
  },
  resultDivider: {
    height: 1,
    marginBottom: 16,
  },
  resultStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  resultStat: {
    alignItems: "center",
    flex: 1,
  },
  resultStatValue: {
    fontSize: 20,
    fontFamily: Fonts.black, fontWeight: "900",
  },
  resultStatLabel: {
    fontSize: 11,
    fontFamily: Fonts.semiBold, fontWeight: "600",
    marginTop: 2,
    textAlign: "center",
  },
  resultStatDivider: {
    width: 1,
    height: 40,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  editBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
  },
  editBtnText: {
    fontSize: 14,
    fontFamily: Fonts.bold, fontWeight: "700",
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  deleteBtnText: {
    fontSize: 14,
    fontFamily: Fonts.bold, fontWeight: "700",
    color: Colors.danger,
  },
  progressCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    gap: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  progressCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressCardTitle: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.bold, fontWeight: "700",
  },
  progressCardPct: {
    fontSize: 16,
    fontFamily: Fonts.extraBold, fontWeight: "800",
  },
  progressTrack: {
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },
  progressAmounts: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressAmountItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  progressAmountValue: {
    fontSize: 16,
    fontFamily: Fonts.extraBold, fontWeight: "800",
  },
  progressAmountLabel: {
    fontSize: 11,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  progressAmountDivider: {
    width: StyleSheet.hairlineWidth,
    height: 36,
  },
  progressTip: {
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 17,
    textAlign: "center",
  },
  reminderCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  reminderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  reminderLeft: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 15,
    fontFamily: Fonts.bold, fontWeight: "700",
    marginBottom: 3,
  },
  reminderSub: {
    fontSize: 12,
    lineHeight: 17,
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
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  tipIcon: {
    fontSize: 18,
    marginTop: 1,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
});

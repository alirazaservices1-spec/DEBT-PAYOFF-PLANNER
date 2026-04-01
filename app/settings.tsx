import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Linking,
  Share,
  Platform,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { soundManager } from "@/utils/SoundManager";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useDebts } from "@/context/DebtContext";
import { useIsDark } from "@/context/ThemeContext";
import { useCurrency, SUPPORTED_CURRENCIES } from "@/context/CurrencyContext";
import { useGame } from "@/context/GameContext";
import { useGoal } from "@/context/GoalContext";
import { useStreakReminder } from "@/context/StreakReminderContext";
import { useWeeklySummary } from "@/context/WeeklySummaryContext";
import { getLevelName } from "@/constants/levelNames";
import { DEMO_DEBTS } from "@/constants/demoData";
import { DreamGoalScreen } from "@/app/onboarding";
import { DexCoin } from "@/components/DexCoin";
import { DEX_SCREEN_MAP } from "@/constants/dexScreenMap";
import { DevHomePreviewSettings } from "@/components/DevHomePreviewSettings";
import { SatisfactionFeedbackModal } from "@/components/SatisfactionFeedbackModal";

const APP_VERSION = "1.0.0";
// Replace with your App Store ID once the app is published (e.g. id1234567890)
const APP_STORE_REVIEW_URL = "https://apps.apple.com/app/id0000000000?action=write-review";
const APP_STORE_URL = "https://apps.apple.com/app/id0000000000";

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useIsDark();
  const C = isDark ? Colors.dark : Colors.light;
  const { clearAllData, addDebt, debts } = useDebts();
  const { currency, setCurrency } = useCurrency();
  const { streakCount, longestStreak, level, totalXp, resetGame } = useGame();
  const { goalName, goalAmount, hasGoal, remindersEnabled, setRemindersEnabled, resetGoal, saveGoal } = useGoal();
  const { streakReminderEnabled, setStreakReminderEnabled } = useStreakReminder();
  const { weeklySummaryEnabled, setWeeklySummaryEnabled } = useWeeklySummary();
  const [deleting, setDeleting] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [testFeedbackVisible, setTestFeedbackVisible] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [dexVocalEnabled, setDexVocalEnabled] = useState(true);
  const [dreamModalOpen, setDreamModalOpen] = useState(false);
  const [dreamName, setDreamName] = useState("");
  const [dreamAmount, setDreamAmount] = useState("");
  const [savedDreamName, setSavedDreamName] = useState("");
  const [savedDreamAmount, setSavedDreamAmount] = useState("");

  // Email notification preferences
  const [emailAddress, setEmailAddress] = useState("");
  const [emailWeekly, setEmailWeekly] = useState(true);
  const [emailStreakAtRisk, setEmailStreakAtRisk] = useState(true);
  const [emailMilestone, setEmailMilestone] = useState(true);

  useEffect(() => {
    soundManager.loadEnabled().then(setSoundEnabled);
    soundManager.loadDexVocalEnabled().then(setDexVocalEnabled);
  }, []);

  useEffect(() => {
    AsyncStorage.getItem("@debtpath_email_prefs").then((raw) => {
      if (!raw) return;
      try {
        const p = JSON.parse(raw);
        if (p.email !== undefined) setEmailAddress(p.email);
        if (p.weekly !== undefined) setEmailWeekly(p.weekly);
        if (p.streakAtRisk !== undefined) setEmailStreakAtRisk(p.streakAtRisk);
        if (p.milestone !== undefined) setEmailMilestone(p.milestone);
      } catch {}
    });
  }, []);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem("@debtpath_dream_goal_name"),
      AsyncStorage.getItem("@debtpath_dream_goal_cost"),
    ])
      .then(([name, cost]) => {
        setSavedDreamName((name ?? "").trim());
        setSavedDreamAmount(cost ?? "");
      })
      .catch(() => {});
  }, []);

  const saveEmailPrefs = (updates: { email?: string; weekly?: boolean; streakAtRisk?: boolean; milestone?: boolean }) => {
    const next = {
      email: updates.email ?? emailAddress,
      weekly: updates.weekly ?? emailWeekly,
      streakAtRisk: updates.streakAtRisk ?? emailStreakAtRisk,
      milestone: updates.milestone ?? emailMilestone,
    };
    AsyncStorage.setItem("@debtpath_email_prefs", JSON.stringify(next));
  };


  const handleRateApp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (Platform.OS === "ios") {
      Linking.openURL(APP_STORE_REVIEW_URL).catch(() => Linking.openURL(APP_STORE_URL));
    } else if (Platform.OS === "android") {
      Linking.openURL("market://details?id=com.debtfree.payoffplanner").catch(() => {});
    }
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        title: "DebtPath: Payoff Planner",
        message: "Track your debts and see payoff plans with DebtPath: Payoff Planner, including Snowball and Avalanche methods.",
        url: APP_STORE_URL,
      });
    } catch (_) {}
  };

  const handleLoadDemoData = () => {
    const warningMsg = debts.length > 0
      ? "This will add sample debts to your existing list. You can delete them anytime."
      : "This will add 4 sample debts including an IRS Payment Plan so you can explore the app.";
    Alert.alert(
      "Load Sample Data",
      warningMsg,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Load Samples",
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            for (const d of DEMO_DEBTS) {
              await addDebt(d);
            }
            Alert.alert("Sample data loaded", `Added ${DEMO_DEBTS.length} demo debts. Open Debts to review them.`);
          },
        },
      ]
    );
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      "Delete All Data",
      "This will permanently erase everything - debts, payment history, XP, level, streak, and your personal goal. You cannot undo this.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await Promise.all([clearAllData(), resetGame(), resetGoal()]);
            setDeleting(false);
            router.replace("/onboarding");
          },
        },
      ]
    );
  };

  const openDreamEditor = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDreamName(savedDreamName || goalName || "");
    setDreamAmount(savedDreamAmount || (goalAmount > 0 ? String(goalAmount) : ""));
    setDreamModalOpen(true);
  };

  const handleSaveDream = async (nameInput: string, costInput: string) => {
    const name = (nameInput ?? "").trim();
    const amt = parseFloat(costInput || "0");

    if (!name) {
      setDreamModalOpen(false);
      return;
    }

    const normalizedCost = Number.isFinite(amt) && amt > 0 ? String(amt) : "0";
    await AsyncStorage.setItem("@debtpath_dream_goal_name", name);
    await AsyncStorage.setItem("@debtpath_dream_goal_cost", normalizedCost);
    setSavedDreamName(name);
    setSavedDreamAmount(normalizedCost);

    // Keep GoalContext in sync when user provides a usable amount.
    if (Number.isFinite(amt) && amt > 0) {
      await saveGoal(name, amt);
    }

    setDreamModalOpen(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <View style={[styles.header, { borderBottomColor: C.border, paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={C.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: C.text }]}>Settings</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Pressable
            onPress={() => { setCurrencyDropdownOpen(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            style={[styles.row, styles.rowLast]}
          >
            <View style={[styles.rowIcon, { backgroundColor: C.textSecondary + "20" }]}>
              <Ionicons name="cash-outline" size={20} color={C.textSecondary} />
            </View>
            <Text style={[styles.rowLabel, { color: C.text }]}>Currency</Text>
            <Text style={[styles.rowValue, { color: C.textSecondary }]}>{currency.code} ({currency.symbol})</Text>
            <Ionicons name="chevron-down" size={18} color={C.textSecondary} />
          </Pressable>
        </View>

        <Modal
          visible={currencyDropdownOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setCurrencyDropdownOpen(false)}
        >
          <View style={styles.dropdownBackdrop}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setCurrencyDropdownOpen(false)} />
            <View style={[styles.currencySheet, { backgroundColor: C.surface }]}>
              <Text style={[styles.dropdownTitle, { color: C.textSecondary }]}>Select Currency</Text>
              <ScrollView bounces={false}>
                {SUPPORTED_CURRENCIES.map((c, i) => (
                  <Pressable
                    key={c.code}
                    onPress={async () => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      await setCurrency(c.code);
                      setCurrencyDropdownOpen(false);
                    }}
                    style={[
                      styles.dropdownOption,
                      { borderBottomColor: C.border },
                      i === SUPPORTED_CURRENCIES.length - 1 && styles.dropdownOptionLast,
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.dropdownOptionLabel, { color: C.text }]}>{c.code} - {c.name}</Text>
                      <Text style={[styles.currencySymbol, { color: C.textSecondary }]}>{c.symbol}</Text>
                    </View>
                    {currency.code === c.code && (
                      <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
                    )}
                  </Pressable>
                ))}
                <View style={{ paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: 1, borderTopColor: C.border }}>
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      const subject = encodeURIComponent("Currency Request");
                      const body = encodeURIComponent("Please add this currency:\nCode:\nCountry/Region:\nNotes:");
                      Linking.openURL(`mailto:support@debtpath.app?subject=${subject}&body=${body}`).catch(() => {
                        Alert.alert("Request currency", "Email support@debtpath.app with the currency code you need.");
                      });
                    }}
                    style={{
                      borderRadius: 10,
                      borderWidth: 1.5,
                      borderColor: Colors.primary + "66",
                      backgroundColor: Colors.primary + "12",
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                    }}
                  >
                    <Text style={{ fontSize: 15, fontFamily: Fonts.bold, color: Colors.primary }}>
                      Request my currency
                    </Text>
                  </Pressable>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>


        <Text style={[styles.sectionLabel, { color: C.textSecondary }]}>SOUND</Text>
        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={[styles.row, { borderBottomColor: C.border }]}>
            <View style={[styles.rowIcon, { backgroundColor: Colors.primary + "18" }]}>
              <Ionicons name="musical-notes-outline" size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: C.text }]}>Sound Effects</Text>
              <Text style={{ fontSize: 12, color: C.textSecondary, marginTop: 1 }}>
                Plays on payments, XP, level ups, and celebrations
              </Text>
            </View>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                const next = !soundEnabled;
                setSoundEnabled(next);
                soundManager.setEnabled(next);
              }}
              style={[
                styles.toggle,
                { backgroundColor: soundEnabled ? Colors.primary : C.border },
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  { transform: [{ translateX: soundEnabled ? 20 : 2 }] },
                ]}
              />
            </Pressable>
          </View>
          <View style={[styles.row, styles.rowLast]}>
            <View
              style={[
                styles.rowIcon,
                {
                  backgroundColor: "#E8600A18",
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  overflow: "hidden",
                },
              ]}
            >
              <DexCoin
                size={36}
                mood={DEX_SCREEN_MAP.settingsDexVocal.mood}
                motion={DEX_SCREEN_MAP.settingsDexVocal.motion}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: C.text }]}>Dex vocalization</Text>
              <Text style={{ fontSize: 12, color: C.textSecondary, marginTop: 1 }}>
                Short sounds when Dex reacts (happy, worried, surprised)
              </Text>
            </View>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                const next = !dexVocalEnabled;
                setDexVocalEnabled(next);
                soundManager.setDexVocalEnabled(next);
              }}
              style={[
                styles.toggle,
                { backgroundColor: dexVocalEnabled ? "#E8600A" : C.border },
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  { transform: [{ translateX: dexVocalEnabled ? 20 : 2 }] },
                ]}
              />
            </Pressable>
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: C.textSecondary }]}>DREAM GOAL</Text>
        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Pressable onPress={openDreamEditor} style={[styles.row, styles.rowLast]}>
            <View style={[styles.rowIcon, { backgroundColor: "#C0782018" }]}>
              <Ionicons name="sparkles-outline" size={20} color="#C07820" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: C.text }]}>Goal & Dream</Text>
              <Text style={[styles.rowSub, { color: C.textSecondary }]}>
                {savedDreamName
                  ? `${savedDreamName}${(parseFloat(savedDreamAmount || "0") || 0) > 0 ? ` • ${fmt(parseFloat(savedDreamAmount || "0"))}` : ""}`
                  : hasGoal
                    ? `${goalName}${(goalAmount ?? 0) > 0 ? ` • ${fmt(goalAmount)}` : ""}`
                    : "Add or update your dream"}
              </Text>
            </View>
            <Ionicons name="create-outline" size={18} color={C.textSecondary} />
          </Pressable>
        </View>

        <Text style={[styles.sectionLabel, { color: C.textSecondary }]}>DAILY REMINDERS</Text>
        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={[styles.row, { borderBottomColor: C.border }]}>
            <View style={[styles.rowIcon, { backgroundColor: Colors.primary + "18" }]}>
              <Ionicons name="notifications-outline" size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: C.text }]}>Motivational Reminders</Text>
              <Text style={{ fontSize: 12, color: C.textSecondary, marginTop: 1 }}>
                {hasGoal
                  ? `Daily at 9:00 AM - Goal: "${goalName}"`
                  : "Daily check-in at 9:00 AM"}
              </Text>
            </View>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setRemindersEnabled(!remindersEnabled);
              }}
              style={[
                styles.toggle,
                { backgroundColor: remindersEnabled ? Colors.primary : C.border },
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

          <View style={[styles.row, { borderBottomColor: C.border }]}>
            <View style={[styles.rowIcon, { backgroundColor: "#FF6B1A18" }]}>
              <Ionicons name="flame-outline" size={20} color="#FF6B1A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: C.text }]}>Streak Reminders</Text>
              <Text style={{ fontSize: 12, color: C.textSecondary, marginTop: 1 }}>
                Daily at 8:00 PM - if no payment logged yet
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

          <View style={[styles.row, styles.rowLast]}>
            <View style={[styles.rowIcon, { backgroundColor: Colors.primary + "18" }]}>
              <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: C.text }]}>Weekly Summary</Text>
              <Text style={{ fontSize: 12, color: C.textSecondary, marginTop: 1 }}>
                Every Sunday at 6:00 PM - your weekly progress recap
              </Text>
            </View>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setWeeklySummaryEnabled(!weeklySummaryEnabled);
              }}
              style={[
                styles.toggle,
                { backgroundColor: weeklySummaryEnabled ? Colors.primary : C.border },
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  { transform: [{ translateX: weeklySummaryEnabled ? 20 : 2 }] },
                ]}
              />
            </Pressable>
          </View>
        </View>

        {/* EMAIL NOTIFICATIONS */}
        <Text style={[styles.sectionLabel, { color: C.textSecondary }]}>EMAIL NOTIFICATIONS</Text>
        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          {/* Email address input */}
          <View style={[styles.row, { borderBottomColor: C.border }]}>
            <View style={[styles.rowIcon, { backgroundColor: "#C0782018" }]}>
              <Ionicons name="mail-outline" size={20} color="#C07820" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: C.text }]}>Your Email</Text>
              <TextInput
                style={[styles.emailInput, { color: C.text, borderColor: C.border, backgroundColor: isDark ? "#2A2018" : "#FFFFFF" }]}
                value={emailAddress}
                onChangeText={(val) => {
                  setEmailAddress(val);
                  saveEmailPrefs({ email: val });
                }}
                placeholder="yourname@example.com"
                placeholderTextColor={C.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Weekly summary toggle */}
          <View style={[styles.row, { borderBottomColor: C.border }]}>
            <View style={[styles.rowIcon, { backgroundColor: "#C0782018" }]}>
              <Ionicons name="bar-chart-outline" size={20} color="#C07820" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: C.text }]}>Weekly Summary</Text>
              <Text style={{ fontSize: 12, color: C.textSecondary, marginTop: 1 }}>
                Sunday recap - progress, XP, and days saved
              </Text>
            </View>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setEmailWeekly(!emailWeekly);
                saveEmailPrefs({ weekly: !emailWeekly });
              }}
              style={[styles.toggle, { backgroundColor: emailWeekly ? "#C07820" : C.border }]}
            >
              <View style={[styles.toggleThumb, { transform: [{ translateX: emailWeekly ? 20 : 2 }] }]} />
            </Pressable>
          </View>

          {/* Streak at risk toggle */}
          <View style={[styles.row, { borderBottomColor: C.border }]}>
            <View style={[styles.rowIcon, { backgroundColor: "#E8600A18" }]}>
              <Ionicons name="flame-outline" size={20} color="#E8600A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: C.text }]}>Streak at Risk</Text>
              <Text style={{ fontSize: 12, color: C.textSecondary, marginTop: 1 }}>
                Alert when your streak is about to end
              </Text>
            </View>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setEmailStreakAtRisk(!emailStreakAtRisk);
                saveEmailPrefs({ streakAtRisk: !emailStreakAtRisk });
              }}
              style={[styles.toggle, { backgroundColor: emailStreakAtRisk ? "#E8600A" : C.border }]}
            >
              <View style={[styles.toggleThumb, { transform: [{ translateX: emailStreakAtRisk ? 20 : 2 }] }]} />
            </Pressable>
          </View>

          {/* Milestone achievement toggle */}
          <View style={[styles.row, styles.rowLast]}>
            <View style={[styles.rowIcon, { backgroundColor: "#C0782018" }]}>
              <Ionicons name="trophy-outline" size={20} color="#C07820" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: C.text }]}>Milestone Achievements</Text>
              <Text style={{ fontSize: 12, color: C.textSecondary, marginTop: 1 }}>
                Celebrate when you cross $50, $100, $500+ saved
              </Text>
            </View>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setEmailMilestone(!emailMilestone);
                saveEmailPrefs({ milestone: !emailMilestone });
              }}
              style={[styles.toggle, { backgroundColor: emailMilestone ? "#C07820" : C.border }]}
            >
              <View style={[styles.toggleThumb, { transform: [{ translateX: emailMilestone ? 20 : 2 }] }]} />
            </Pressable>
          </View>
        </View>
        <Text style={[styles.emailHint, { color: C.textSecondary }]}>
          💡 On mobile, these use push notifications. Email delivery coming in a future update.
        </Text>

        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/privacy");
            }}
            style={[styles.row, { borderBottomColor: C.border }]}
          >
            <View style={[styles.rowIcon, { backgroundColor: Colors.primary + "18" }]}>
              <Ionicons name="shield-checkmark-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={[styles.rowLabel, { color: C.text }]}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={18} color={C.textSecondary} />
          </Pressable>

          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/terms");
            }}
            style={[styles.row, { borderBottomColor: C.border }]}
          >
            <View style={[styles.rowIcon, { backgroundColor: Colors.primary + "18" }]}>
              <Ionicons name="document-text-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={[styles.rowLabel, { color: C.text }]}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={18} color={C.textSecondary} />
          </Pressable>

          <View style={[styles.row, styles.rowLast]}>
            <View style={[styles.rowIcon, { backgroundColor: C.textSecondary + "25" }]}>
              <Ionicons name="information-circle-outline" size={20} color={C.textSecondary} />
            </View>
            <Text style={[styles.rowLabel, { color: C.text }]}>Version</Text>
            <Text style={[styles.rowValue, { color: C.textSecondary }]}>{APP_VERSION}</Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Pressable
            onPress={handleRateApp}
            style={[styles.row, { borderBottomColor: C.border }]}
          >
            <View style={[styles.rowIcon, { backgroundColor: Colors.warning + "22" }]}>
              <Ionicons name="star-outline" size={20} color={Colors.warning} />
            </View>
            <Text style={[styles.rowLabel, { color: C.text }]}>Rate the App</Text>
            <Ionicons name="chevron-forward" size={18} color={C.textSecondary} />
          </Pressable>

          <Pressable
            onPress={handleShare}
            style={[styles.row, styles.rowLast]}
          >
            <View style={[styles.rowIcon, { backgroundColor: Colors.accent + "22" }]}>
              <Ionicons name="share-outline" size={20} color={Colors.accent} />
            </View>
            <Text style={[styles.rowLabel, { color: C.text }]}>Share the App</Text>
            <Ionicons name="chevron-forward" size={18} color={C.textSecondary} />
          </Pressable>
        </View>

        <DevHomePreviewSettings C={C} />

        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Pressable
            onPress={handleLoadDemoData}
            style={[styles.row, styles.rowLast]}
          >
            <View style={[styles.rowIcon, { backgroundColor: Colors.primary + "18" }]}>
              <Ionicons name="flask-outline" size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: C.text, flex: 0 }]}>Load Sample Data</Text>
              <Text style={[styles.rowSub, { color: C.textSecondary }]}>Adds 4 demo debts including an IRS Payment Plan</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.textSecondary} />
          </Pressable>
        </View>

        {/* ── Test: Feedback Modal ── */}
        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setTestFeedbackVisible(true);
            }}
            style={[styles.row, styles.rowLast]}
          >
            <View style={[styles.rowIcon, { backgroundColor: "#D08A1018" }]}>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="#D08A10" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: C.text, flex: 0 }]}>Test Feedback Screen</Text>
              <Text style={[styles.rowSub, { color: C.textSecondary }]}>Preview all 3 screens of the in-app feedback flow</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.textSecondary} />
          </Pressable>
        </View>

        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Pressable
            onPress={handleDeleteAllData}
            disabled={deleting}
            style={[styles.row, styles.rowLast]}
          >
            <View style={[styles.rowIcon, { backgroundColor: Colors.danger + "18" }]}>
              <Ionicons name="trash-outline" size={20} color={Colors.danger} />
            </View>
            <Text style={[styles.rowLabel, { color: Colors.danger }]}>
              {deleting ? "Deleting…" : "Delete All My Data"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <SatisfactionFeedbackModal
        visible={testFeedbackVisible}
        onClosed={() => setTestFeedbackVisible(false)}
      />

      <Modal
        visible={dreamModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setDreamModalOpen(false)}
      >
        <View style={[styles.dropdownBackdrop, { padding: 0, alignItems: "stretch", justifyContent: "flex-start" }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setDreamModalOpen(false)} />
          <View style={[styles.dreamSheet, { backgroundColor: "#F7F2EA" }]}>
            <DreamGoalScreen
              isDark={isDark}
              bg={C.background}
              topPad={insets.top}
              botPad={insets.bottom}
              goTo={(s: any) => {}} // not used in this screen
              debts={debts}
              initialDreamName={dreamName}
              initialDreamCost={dreamAmount}
              showStepProgress={false}
              onBack={() => setDreamModalOpen(false)}
              onComplete={async (name, cost) => {
                await handleSaveDream(name, cost);
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: Fonts.semiBold, fontWeight: "600" },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 16 },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: Fonts.semiBold, fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
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
  rowSub: { fontSize: 14, marginTop: 1 },
  rowValue: { fontSize: 16 },
  dropdownBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  dropdownBox: {
    width: "100%",
    maxWidth: 320,
    borderRadius: 16,
    overflow: "hidden",
  },
  dropdownTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold, fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  dropdownOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dropdownOptionLast: { borderBottomWidth: 0 },
  dropdownOptionLabel: { fontSize: 17, fontWeight: "500" },
  currencySheet: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 20,
    overflow: "hidden",
    maxHeight: "80%",
  },
  dreamSheet: {
    flex: 1,
    width: "100%",
    borderRadius: 0,
    overflow: "hidden",
  },
  currencySymbol: { fontSize: 14, marginTop: 2 },
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
  emailInput: {
    marginTop: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 15,
    fontFamily: Fonts.regular,
    minHeight: 44,
  },
  emailHint: {
    fontSize: 12,
    fontWeight: "500",
    marginHorizontal: 16,
    marginTop: -4,
    marginBottom: 16,
    lineHeight: 17,
  },
});

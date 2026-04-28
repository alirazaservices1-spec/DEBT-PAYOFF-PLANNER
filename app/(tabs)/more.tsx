import React, { useState, useEffect } from "react";
import { useIsDark } from "@/context/ThemeContext";
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
import { Image as ExpoImage } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { soundManager } from "@/utils/SoundManager";
import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useDebts } from "@/context/DebtContext";
import { useCurrency, SUPPORTED_CURRENCIES } from "@/context/CurrencyContext";
import { useGame } from "@/context/GameContext";
import { useGoal } from "@/context/GoalContext";
import { useStreakReminder } from "@/context/StreakReminderContext";
import { useWeeklySummary } from "@/context/WeeklySummaryContext";
import { getLevelName } from "@/constants/levelNames";
import { DEMO_DEBTS } from "@/constants/demoData";
import { monthsToText } from "@/lib/calculations";
import { DreamGoalScreen } from "@/app/onboarding";
import { DexCoin } from "@/components/DexCoin";
import { DEX_SCREEN_MAP } from "@/constants/dexScreenMap";
import { DevHomePreviewSettings } from "@/components/DevHomePreviewSettings";
import { DevRewardsPreviewSettings } from "@/components/DevRewardsPreviewSettings";
import { SatisfactionFeedbackModal } from "@/components/SatisfactionFeedbackModal";

const APP_VERSION = "1.0.0";
const APP_STORE_REVIEW_URL = "https://apps.apple.com/app/id0000000000?action=write-review";
const APP_STORE_URL = "https://apps.apple.com/app/id0000000000";

export default function SettingsTabScreen() {
  const isDark = useIsDark();
  const C = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const { fmt, currency, setCurrency } = useCurrency();
  const { clearAllData, addDebt, debts, avalancheResult } = useDebts();
  const { streakCount, longestStreak, level, totalXp, resetGame } = useGame();
  const { goalName, goalAmount, hasGoal, remindersEnabled, setRemindersEnabled, resetGoal, saveGoal } = useGoal();
  const { streakReminderEnabled, setStreakReminderEnabled } = useStreakReminder();
  const { weeklySummaryEnabled, setWeeklySummaryEnabled } = useWeeklySummary();

  const [deleting, setDeleting] = useState(false);
  const [testFeedbackVisible, setTestFeedbackVisible] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [dexVocalEnabled, setDexVocalEnabled] = useState(true);
  const [dreamModalOpen, setDreamModalOpen] = useState(false);
  const [dreamName, setDreamName] = useState("");
  const [dreamAmount, setDreamAmount] = useState("");
  const [savedDreamName, setSavedDreamName] = useState("");
  const [savedDreamAmount, setSavedDreamAmount] = useState("");

  const [emailAddress, setEmailAddress] = useState("");
  const [emailWeekly, setEmailWeekly] = useState(true);
  const [emailStreakAtRisk, setEmailStreakAtRisk] = useState(true);
  const [emailMilestone, setEmailMilestone] = useState(true);

  const totalDebt = debts.reduce((s, d) => s + d.balance, 0);

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

  const saveEmailPrefs = (updates: {
    email?: string;
    weekly?: boolean;
    streakAtRisk?: boolean;
    milestone?: boolean;
  }) => {
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
        message:
          "Track your debts and see payoff plans with DebtPath: Payoff Planner, including Snowball and Avalanche methods.",
        url: APP_STORE_URL,
      });
    } catch (_) {}
  };

  const handleLoadDemoData = () => {
    const warningMsg =
      debts.length > 0
        ? "This will add sample debts to your existing list. You can delete them anytime."
        : "This will add 5 sample debts—two credit cards with intro/promo APRs—plus loan, student, and IRS payment plan examples.";
    Alert.alert("Load Sample Data", warningMsg, [
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
    ]);
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
            try {
              await Promise.allSettled([clearAllData(), resetGame(), resetGoal()]);
            } finally {
              setDeleting(false);
              router.replace("/onboarding");
            }
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

  const webTopPad = Platform.OS === "web" ? 67 : 0;
  const bottomPad = Math.max(insets.bottom, Platform.OS === "web" ? 100 : 90);
  const showDevTools = __DEV__;

  return (
    <View style={[styles.wrapper, { backgroundColor: C.background }]}>
      {/* ── HEADER ─────────────────────────────────────────────── */}
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
        <Text style={[styles.headerTitle, { color: C.text }]}>Settings</Text>
        <Text style={[styles.headerSub, { color: C.textSecondary }]}>
          Preferences &amp; account
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── TOOLS ──────────────────────────────────────────────── */}
        <Text style={[styles.sectionLabel, { color: C.textSecondary }]}>TOOLS</Text>
        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Pressable onPress={openDreamEditor} style={[styles.row, { borderBottomColor: C.border }]}>
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
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/calculators");
            }}
            style={[styles.row, styles.rowLast]}
          >
            <View style={[styles.rowIcon, { backgroundColor: "#8E44AD22" }]}>
              <Ionicons name="calculator-outline" size={20} color="#8E44AD" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: C.text }]}>Calculator</Text>
              <Text style={[styles.rowSub, { color: C.textSecondary }]}>
                {totalDebt > 0
                  ? `${fmt(totalDebt)} total · ${avalancheResult ? monthsToText(avalancheResult.totalMonths) : "-"} payoff`
                  : "Payoff, consolidation and savings calculators"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.textSecondary} />
          </Pressable>
        </View>

        {/* ── PREFERENCES ─────────────────────────────────────────── */}
        <Text style={[styles.sectionLabel, { color: C.textSecondary }]}>PREFERENCES</Text>
        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Pressable
            onPress={() => {
              setCurrencyDropdownOpen(true);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={[styles.row, styles.rowLast]}
          >
            <View style={[styles.rowIcon, { backgroundColor: C.textSecondary + "20" }]}>
              <Ionicons name="cash-outline" size={20} color={C.textSecondary} />
            </View>
            <Text style={[styles.rowLabel, { color: C.text }]}>Currency</Text>
            <Text style={[styles.rowValue, { color: C.textSecondary }]}>
              {currency.code} ({currency.symbol})
            </Text>
            <Ionicons name="chevron-down" size={18} color={C.textSecondary} />
          </Pressable>
        </View>

        {/* Currency modal */}
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
                      <Text style={[styles.dropdownOptionLabel, { color: C.text }]}>
                        {c.code} - {c.name}
                      </Text>
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

        <Modal
          visible={dreamModalOpen}
          transparent
          animationType="slide"
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
                goTo={(s: any) => {}}
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


        {/* ── SOUND ──────────────────────────────────────────────── */}
        <Text style={[styles.sectionLabel, { color: C.textSecondary }]}>SOUND</Text>
        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={[styles.row, { borderBottomColor: C.border }]}>
            <View style={[styles.rowIcon, { backgroundColor: Colors.primary + "18" }]}>
              <Ionicons name="musical-notes-outline" size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: C.text }]}>Sound Effects</Text>
              <Text style={[styles.rowSub, { color: C.textSecondary }]}>
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
              style={[styles.toggle, { backgroundColor: soundEnabled ? Colors.primary : C.border }]}
            >
              <View style={[styles.toggleThumb, { transform: [{ translateX: soundEnabled ? 20 : 2 }] }]} />
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
              <Text style={[styles.rowLabel, { color: C.text }]}>Dex Vocalization</Text>
              <Text style={[styles.rowSub, { color: C.textSecondary }]}>
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
              style={[styles.toggle, { backgroundColor: dexVocalEnabled ? "#E8600A" : C.border }]}
            >
              <View
                style={[styles.toggleThumb, { transform: [{ translateX: dexVocalEnabled ? 20 : 2 }] }]}
              />
            </Pressable>
          </View>
        </View>

        {/* ── DAILY REMINDERS ────────────────────────────────────── */}
        <Text style={[styles.sectionLabel, { color: C.textSecondary }]}>DAILY REMINDERS</Text>
        <Text
          style={{
            fontSize: 12,
            color: C.textSecondary,
            lineHeight: 17,
            marginBottom: 10,
            marginTop: -4,
            paddingHorizontal: 2,
          }}
        >
          These use your phone’s normal notifications (lock screen & notification center). Tap one to open DebtPath—there isn’t a separate inbox inside the app.
        </Text>
        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={[styles.row, { borderBottomColor: C.border }]}>
            <View style={[styles.rowIcon, { backgroundColor: Colors.primary + "18" }]}>
              <Ionicons name="notifications-outline" size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: C.text }]}>Motivational Reminders</Text>
              <Text style={[styles.rowSub, { color: C.textSecondary }]}>
                {hasGoal ? `Daily at 9:00 AM - Goal: "${goalName}"` : "Daily check-in at 9:00 AM"}
              </Text>
            </View>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setRemindersEnabled(!remindersEnabled);
              }}
              style={[styles.toggle, { backgroundColor: remindersEnabled ? Colors.primary : C.border }]}
            >
              <View
                style={[styles.toggleThumb, { transform: [{ translateX: remindersEnabled ? 20 : 2 }] }]}
              />
            </Pressable>
          </View>
          <View style={[styles.row, { borderBottomColor: C.border }]}>
            <View style={[styles.rowIcon, { backgroundColor: "#FF6B1A18" }]}>
              <Ionicons name="flame-outline" size={20} color="#FF6B1A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: C.text }]}>Streak Reminders</Text>
              <Text style={[styles.rowSub, { color: C.textSecondary }]}>
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
              <Text style={[styles.rowSub, { color: C.textSecondary }]}>
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

        {/* ── EMAIL NOTIFICATIONS ────────────────────────────────── */}
        <Text style={[styles.sectionLabel, { color: C.textSecondary }]}>EMAIL NOTIFICATIONS</Text>
        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={[styles.row, { borderBottomColor: C.border }]}>
            <View style={[styles.rowIcon, { backgroundColor: "#C0782018" }]}>
              <Ionicons name="mail-outline" size={20} color="#C07820" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: C.text }]}>Your Email</Text>
              <TextInput
                style={[
                  styles.emailInput,
                  {
                    color: C.text,
                    borderColor: C.border,
                    backgroundColor: isDark ? "#2A2018" : "#FFFFFF",
                  },
                ]}
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
          <View style={[styles.row, { borderBottomColor: C.border }]}>
            <View style={[styles.rowIcon, { backgroundColor: "#C0782018" }]}>
              <Ionicons name="bar-chart-outline" size={20} color="#C07820" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: C.text }]}>Weekly Summary</Text>
              <Text style={[styles.rowSub, { color: C.textSecondary }]}>
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
          <View style={[styles.row, { borderBottomColor: C.border }]}>
            <View style={[styles.rowIcon, { backgroundColor: "#E8600A18" }]}>
              <Ionicons name="flame-outline" size={20} color="#E8600A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: C.text }]}>Streak at Risk</Text>
              <Text style={[styles.rowSub, { color: C.textSecondary }]}>
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
              <View
                style={[styles.toggleThumb, { transform: [{ translateX: emailStreakAtRisk ? 20 : 2 }] }]}
              />
            </Pressable>
          </View>
          <View style={[styles.row, styles.rowLast]}>
            <View style={[styles.rowIcon, { backgroundColor: "#C0782018" }]}>
              <Ionicons name="trophy-outline" size={20} color="#C07820" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: C.text }]}>Milestone Achievements</Text>
              <Text style={[styles.rowSub, { color: C.textSecondary }]}>
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
              <View
                style={[styles.toggleThumb, { transform: [{ translateX: emailMilestone ? 20 : 2 }] }]}
              />
            </Pressable>
          </View>
        </View>
        <Text style={[styles.emailHint, { color: C.textSecondary }]}>
          💡 On mobile, these use push notifications. Email delivery coming in a future update.
        </Text>

        {/* ── ABOUT ──────────────────────────────────────────────── */}
        <Text style={[styles.sectionLabel, { color: C.textSecondary }]}>ABOUT</Text>
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
            style={[styles.row, { borderBottomColor: C.border }]}
          >
            <View style={[styles.rowIcon, { backgroundColor: Colors.accent + "22" }]}>
              <Ionicons name="share-outline" size={20} color={Colors.accent} />
            </View>
            <Text style={[styles.rowLabel, { color: C.text }]}>Share the App</Text>
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

        {showDevTools ? (
          <>
            <DevHomePreviewSettings C={C} variant="tab" />
            <DevRewardsPreviewSettings C={C} />

            {/* ── DEV ────────────────────────────────────────────────── */}
            <Text style={[styles.sectionLabel, { color: C.textSecondary }]}>DEV</Text>
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
                  <Text style={[styles.rowSub, { color: C.textSecondary }]}>Preview the in-app feedback flow</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={C.textSecondary} />
              </Pressable>
            </View>
          </>
        ) : null}

        {/* ── DATA ───────────────────────────────────────────────── */}
        <Text style={[styles.sectionLabel, { color: C.textSecondary }]}>DATA</Text>
        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Pressable
            onPress={handleLoadDemoData}
            style={[styles.row, { borderBottomColor: C.border }]}
          >
            <View style={[styles.rowIcon, { backgroundColor: Colors.primary + "18" }]}>
              <Ionicons name="flask-outline" size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: C.text, flex: 0 }]}>Load Sample Data</Text>
              <Text style={[styles.rowSub, { color: C.textSecondary }]}>
                Adds 5 demo debts (two cards with intro APRs) plus IRS plan
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.textSecondary} />
          </Pressable>
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 8, gap: 0 },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBrand: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  headerBrandIcon: { width: 24, height: 24, borderRadius: 6 },
  headerBrandName: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  headerTitle: {
    fontSize: 30,
    fontFamily: Fonts.extraBold,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  headerSub: { fontSize: 16, marginTop: 2 },

  sectionLabel: {
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
  rowLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    fontWeight: "600",
  },
  rowSub: { fontSize: 13, marginTop: 1 },
  rowValue: { fontSize: 15 },

  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    flexShrink: 0,
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
    marginHorizontal: 4,
    marginTop: 6,
    marginBottom: 4,
    lineHeight: 17,
  },

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
    fontFamily: Fonts.semiBold,
    fontWeight: "600",
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
});

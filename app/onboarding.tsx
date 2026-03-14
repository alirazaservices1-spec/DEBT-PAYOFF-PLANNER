import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  ScrollView,
  Platform,
  Animated,
  useColorScheme,
  Modal,
  Image,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useDebts } from "@/context/DebtContext";
import { DebtForm } from "@/components/DebtForm";
import { Debt } from "@/lib/calculations";
import { useCurrency } from "@/context/CurrencyContext";


const DARK = {
  // Bright, Duolingo-style onboarding palette (still called DARK for reuse)
  // WCAG AA Required: Contrast ratio must be 4.5:1 minimum. Verify with
  // https://webaim.org/resources/contrastchecker/
  bg: "#FFFFFF",
  card: "#FFFFFF",
  cardBorder: "#E0F0E6",
  text: "#05130A",
  textSub: "#335547",
  input: "#F4FBF7",
  inputBorder: "#C9DFD2",
  teal: "#2ECC71",
  tealDim: "rgba(46,204,113,0.15)",
};

type Step = 1 | 2 | 3;


const FREE_FEATURES = [
  "Choose a strategy: Snowball, Avalanche, Tsunami, or another.",
  "Discover the exact date you will be 100% debt-free.",
  "See how an extra $25+/mo shaves years off your timeline.",
  "Track your progress with simple, intuitive charts.",
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { addDebt, setOnboardingDone, debts } = useDebts();
  const { fmt } = useCurrency();
  const scheme = useColorScheme();
  const isDarkMode = scheme === "dark";
  const [step, setStep] = useState<Step>(1);
  const [incomingStep, setIncomingStep] = useState<Step | null>(null);
  const exitAnim = useRef(new Animated.Value(0)).current;
  const enterAnim = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get("window").width;
  const pendingAnim = useRef<{ outTo: number; next: Step } | null>(null);

  const [formVisible, setFormVisible] = useState(false);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const botPad = Math.max(insets.bottom, 20) + (Platform.OS === "web" ? 34 : 0);

  useEffect(() => {
    if (incomingStep === null || !pendingAnim.current) return;
    const { outTo, next } = pendingAnim.current;
    pendingAnim.current = null;
    Animated.parallel([
      Animated.timing(exitAnim, { toValue: outTo, duration: 220, useNativeDriver: true }),
      Animated.timing(enterAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => {
      setStep(next);
      setIncomingStep(null);
      exitAnim.setValue(0);
    });
  }, [incomingStep]);

  const animateToStep = (next: Step, direction: "forward" | "back" = "forward") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const outTo = direction === "forward" ? -screenWidth : screenWidth;
    const inFrom = direction === "forward" ? screenWidth : -screenWidth;
    exitAnim.setValue(0);
    enterAnim.setValue(inFrom);
    pendingAnim.current = { outTo, next };
    setIncomingStep(next);
  };

  const handleEnter = async () => {
    // AUTH GATE DISABLED FOR GUEST MODE — V1 REQUIREMENT
    // No login, account creation, or paywall between this button and the app.
    await setOnboardingDone();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace("/(tabs)");
  };

  const handleOnboardingDebtSave = async (data: Omit<Debt, "id" | "dateAdded">) => {
    await addDebt(data);
    setFormVisible(false);
    if (step !== 3) animateToStep(3);
  };

  return (
    <View style={[styles.root, { overflow: "hidden" }]}>
      {/* Exiting screen */}
      <Animated.View style={[styles.root, { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, transform: [{ translateX: exitAnim }] }]}>
        {step === 1 && <Screen1 onNext={() => animateToStep(2)} onSkip={handleEnter} onOpenForm={() => setFormVisible(true)} topPad={topPad} botPad={botPad} />}
        {step === 2 && <Screen2 onNext={() => setFormVisible(true)} onSkip={handleEnter} onBack={() => animateToStep(1, "back")} topPad={topPad} botPad={botPad} />}
        {step === 3 && (
          <InventoryScreen
            debts={debts}
            onAddAnother={() => setFormVisible(true)}
            onChooseStrategy={handleEnter}
            topPad={topPad}
            botPad={botPad}
            fmt={fmt}
          />
        )}
      </Animated.View>
      {/* Incoming screen (only rendered during transition) */}
      {incomingStep !== null && (
        <Animated.View style={[styles.root, { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, transform: [{ translateX: enterAnim }] }]}>
          {incomingStep === 1 && <Screen1 onNext={() => {}} onSkip={() => {}} onOpenForm={() => {}} topPad={topPad} botPad={botPad} />}
          {incomingStep === 2 && <Screen2 onNext={() => {}} onSkip={() => {}} onBack={() => {}} topPad={topPad} botPad={botPad} />}
          {incomingStep === 3 && (
            <InventoryScreen
              debts={debts}
              onAddAnother={() => {}}
              onChooseStrategy={() => {}}
              topPad={topPad}
              botPad={botPad}
              fmt={fmt}
            />
          )}
        </Animated.View>
      )}

      {step !== 3 && (
        <View style={[styles.dotsRow, { bottom: botPad - 8 }]}>
          {([1, 2] as Step[]).map((s) => (
          <View
            key={s}
            style={[
              styles.dot,
              {
                width: s === step ? 24 : 8,
                backgroundColor: s === step
                  ? DARK.teal
                  : isDarkMode
                  ? "rgba(255,255,255,0.28)"
                  : "#C9DFD2",
              },
            ]}
          />
          ))}
        </View>
      )}
      <Modal
        visible={formVisible}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setFormVisible(false)}
      >
        <DebtForm
          initial={undefined}
          onSave={handleOnboardingDebtSave}
          onCancel={() => setFormVisible(false)}
          title="Add A Debt"
        />
      </Modal>
    </View>
  );
}

const S1_TABS = ["Overview", "How It Works"];

function Screen1({ onNext, onSkip, onOpenForm, topPad, botPad }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const tabContentAnim = useRef(new Animated.Value(1)).current;
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const [activeTab, setActiveTab] = useState(0);

  const switchTab = (index: number) => {
    if (index === activeTab) return;
    Animated.sequence([
      Animated.timing(tabContentAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(tabContentAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setTimeout(() => setActiveTab(index), 150);
  };

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, []);

  const tabBarBg = isDark ? "rgba(8,14,20,0.95)" : "rgba(231,248,236,0.97)";

  return (
    <View style={[styles.root, { backgroundColor: isDark ? "#080E14" : DARK.bg }]}>
      <LinearGradient
        colors={isDark ? ["#0A1628", "#080E14", "#050A0E"] : ["#E7F8EC", "#FFFFFF"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Tab bar */}
      <View style={[styles.s1TabBar, { paddingTop: topPad + 8, backgroundColor: tabBarBg }]}>
        {S1_TABS.map((tab, i) => (
          <Pressable
            key={tab}
            onPress={() => switchTab(i)}
            style={[styles.s1Tab, activeTab === i && { borderBottomColor: DARK.teal, borderBottomWidth: 2 }]}
          >
            <Text style={[styles.s1TabText, { color: activeTab === i ? DARK.teal : (isDark ? "#FFFFFF" : "#7A9B83") }]}>
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Tab content — single screen, content swaps */}
      <Animated.View style={{ flex: 1, opacity: tabContentAnim }}>
        {activeTab === 0 ? (
          /* ── Overview tab ── */
          <View style={[styles.s1Content, { paddingTop: topPad + 68, paddingBottom: botPad + 56 }]}>
            <View style={styles.s1IconWrap}>
              <ExpoImage
                source={require("@/assets/images/iconApp.png")}
                style={styles.s1LogoImg}
                contentFit="contain"
                transition={0}
                cachePolicy="memory-disk"
              />
            </View>

            <Animated.View style={{ opacity: fadeAnim, gap: 10, alignItems: "center", width: "100%" }}>
              <Text style={[styles.s1Title, { color: isDark ? "#FFFFFF" : DARK.text }]}>
                Break Free{"\n"}From Debt.
              </Text>
              <Text style={[styles.s1Subtitle, { color: "#1F9E55" }]}>Finally.</Text>
              <Text style={[styles.s1Body, { color: isDark ? "rgba(255,255,255,0.92)" : DARK.textSub, fontWeight: "700" }]}>
                Free Features Included In The App:
              </Text>
              <View style={styles.s1List}>
                {FREE_FEATURES.map((t) => (
                  <View key={t} style={styles.s1ListRow}>
                    <View style={styles.s1CheckDot}>
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    </View>
                    <Text style={[styles.s1ListText, { color: isDark ? "rgba(255,255,255,0.88)" : DARK.textSub }]}>
                      {t}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>

            <View style={styles.s1Btns}>
              <Pressable onPress={onOpenForm} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
                <LinearGradient
                  colors={[Colors.buttonGreen, Colors.buttonGreenDark]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.primaryBtn}
                >
                  <Ionicons name="add-circle-outline" size={18} color="#fff" />
                  <Text style={styles.primaryBtnText}>Add A Debt</Text>
                </LinearGradient>
              </Pressable>
              <Pressable onPress={() => switchTab(1)} hitSlop={10} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
                <Text style={[styles.learnMoreLink, { color: isDark ? "#FFFFFF" : "#4A6B53" }]}>
                  How it works →
                </Text>
              </Pressable>
            </View>
            <Text style={[styles.privacyNote, { color: isDark ? "#FFFFFF" : "#9AB8A4" }]}>
              🔒 100% Private - No account needed to start
            </Text>
          </View>
        ) : (
          /* ── How It Works tab ── */
          <ScrollView
            contentContainerStyle={[styles.s1Section, { paddingTop: topPad + 68, paddingBottom: botPad + 56 }]}
            showsVerticalScrollIndicator={false}
          >
            <View style={{ gap: 4, width: "100%" }}>
              <Text style={[styles.s2Title, { color: isDark ? "#FFFFFF" : DARK.text }]}>How It{"\n"}Works.</Text>
              <Text style={[styles.s2Sub, { color: isDark ? "#FFFFFF" : DARK.textSub }]}>
                A simple, proven system to pay off your loans faster.
              </Text>
            </View>
            {FEATURE_CARDS.map((card) => (
              <View
                key={card.title}
                style={[styles.featureCard, {
                  backgroundColor: isDark ? "#0D1520" : DARK.card,
                  borderColor: isDark ? "#1A2535" : DARK.cardBorder,
                  borderLeftColor: card.color,
                }]}
              >
                <View style={[styles.featureStepBadge, { backgroundColor: card.color + "22" }]}>
                  <Text style={[styles.featureStepNum, { color: card.color }]}>{card.step}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.featureTitle, { color: isDark ? "#FFFFFF" : DARK.text }]}>{card.title}</Text>
                  <Text style={[styles.featureDesc, { color: isDark ? "#FFFFFF" : DARK.textSub }]}>{card.desc}</Text>
                </View>
              </View>
            ))}
            <View style={[styles.s1Btns, { width: "100%" }]}>
              <Pressable onPress={onOpenForm} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
                <LinearGradient
                  colors={[Colors.buttonGreen, Colors.buttonGreenDark]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.primaryBtn}
                >
                  <Ionicons name="add-circle-outline" size={18} color="#fff" />
                  <Text style={styles.primaryBtnText}>Add A Debt</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </ScrollView>
        )}
      </Animated.View>
    </View>
  );
}

const FEATURE_CARDS = [
  {
    step: 1,
    icon: "create",
    title: "Add Your Debts",
    desc: "Securely log your balances and interest rates. Your data stays private and stored locally.",
    color: "#3498DB",
  },
  {
    step: 2,
    icon: "swap-vertical",
    title: "Pick Your Strategy",
    desc: "Compare Snowball, Avalanche, or Highest Payment. Or, drag-and-drop to create a custom plan.",
    color: DARK.teal,
  },
  {
    step: 3,
    icon: "calendar",
    title: "See Your Debt-Free Date",
    desc: "Instantly see the exact month and year you'll be 100% debt-free based on your plan.",
    color: "#9B59B6",
  },
  {
    step: 4,
    icon: "calculator",
    title: "Fast-Track Your Progress",
    desc: "Run what-if scenarios to see how even small extra payments shave years off your timeline.",
    color: "#E67E22",
  },
];

function Screen2({ onNext, onSkip, onBack, topPad, botPad }: any) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const cardAnims = useRef(FEATURE_CARDS.map(() => new Animated.Value(60))).current;
  const fadeAnims = useRef(FEATURE_CARDS.map(() => new Animated.Value(0))).current;
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  useEffect(() => {
    Animated.stagger(100, FEATURE_CARDS.map((_, i) =>
      Animated.parallel([
        Animated.timing(cardAnims[i], { toValue: 0, duration: 350, useNativeDriver: true }),
        Animated.timing(fadeAnims[i], { toValue: 1, duration: 350, useNativeDriver: true }),
      ])
    )).start();
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: isDark ? "#080E14" : DARK.bg }]}>
      <LinearGradient
        colors={isDark ? ["#0A1628", "#080E14"] : ["#E7F8EC", "#FFFFFF"]}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        contentContainerStyle={[styles.s2Content, { paddingTop: topPad + 16, paddingBottom: botPad + 64 }]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={onBack} style={styles.backBtn} hitSlop={16}>
          <Ionicons
            name="chevron-back"
            size={28}
            color={isDark ? "rgba(255,255,255,0.5)" : "#5A7A62"}
          />
        </Pressable>

        <View style={{ gap: 8, marginBottom: 24 }}>
          <Text
            style={[
              styles.s2Title,
              { color: isDark ? "#FFFFFF" : DARK.text },
            ]}
          >
            Your Blueprint.
          </Text>
          <Text style={[styles.s2TitleGreen, { color: DARK.teal }]}>To Zero Debt.</Text>
          <Text
            style={[
              styles.s2Sub,
              {
                color: isDark
                  ? "rgba(255,255,255,0.92)"
                  : DARK.textSub,
              },
            ]}
          >
            A simple, proven system to pay off your loans faster and save thousands in interest.
          </Text>
        </View>

        {FEATURE_CARDS.map((card, i) => {
          const isExpanded = expandedIndex === i;
          return (
            <Animated.View
              key={card.title}
              style={[
                styles.featureCard,
                {
                  borderLeftColor: card.color,
                  opacity: fadeAnims[i],
                  transform: [{ translateX: cardAnims[i] }],
                  backgroundColor: isDark ? "#0D1520" : DARK.card,
                  borderColor: isDark ? "#1A2535" : DARK.cardBorder,
                },
              ]}
            >
              <Pressable
                onPress={() => setExpandedIndex(isExpanded ? null : i)}
                style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
              >
                <View style={[styles.featureStepBadge, { backgroundColor: card.color + "22", marginRight: 14 }]}>
                  <Text style={[styles.featureStepNum, { color: card.color }]}>{card.step}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.featureTitleRow}>
                    <Text
                      style={[
                        styles.featureTitle,
                        { color: isDark ? "#FFFFFF" : DARK.text },
                      ]}
                    >
                      {card.title}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.featureDesc,
                      {
                        color: isDark
                          ? "rgba(255,255,255,0.7)"
                          : DARK.textSub,
                      },
                    ]}
                    numberOfLines={isExpanded ? undefined : 2}
                  >
                    {card.desc}
                  </Text>
                  {isExpanded && (
                    <Text
                      style={[
                        styles.featureDesc,
                        {
                          marginTop: 6,
                          color: isDark
                            ? "rgba(255,255,255,0.8)"
                            : DARK.text,
                        },
                      ]}
                    >
                      Ready to see this in action? Continue to start your plan and use these tools on your own numbers.
                    </Text>
                  )}
                </View>
              </Pressable>
            </Animated.View>
          );
        })}

        <View style={styles.s2Btns}>
          <Pressable onPress={onNext} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
            <LinearGradient
              colors={[Colors.buttonGreen, Colors.buttonGreenDark]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>Build My Blueprint</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </Pressable>
          <Pressable onPress={onSkip} hitSlop={12}>
            <Text style={[styles.laterLink, { color: isDark ? "#FFFFFF" : "#4A6B53" }]}>
              I'll do this later
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}


function InventoryScreen({ debts, onAddAnother, onChooseStrategy, topPad, botPad, fmt }: any) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const checkAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(checkAnim, { toValue: 1, friction: 5, tension: 100, useNativeDriver: true }),
      Animated.timing(contentAnim, { toValue: 1, duration: 320, useNativeDriver: true }),
    ]).start();
  }, []);

  const totalBalance = debts.reduce((sum: number, d: any) => sum + (d.balance ?? 0), 0);
  const count = debts.length;
  const lastDebt = debts[debts.length - 1] ?? null;

  const cardBg = isDark ? "#0D1520" : "#FFFFFF";
  const cardBorder = isDark ? "#1A2535" : DARK.cardBorder;
  const labelColor = isDark ? "#FFFFFF" : DARK.textSub;
  const valueColor = isDark ? "#FFFFFF" : DARK.text;

  return (
    <View style={[styles.root, { backgroundColor: isDark ? "#080E14" : DARK.bg }]}>
      <LinearGradient
        colors={isDark ? ["#0A1628", "#080E14"] : ["#E7F8EC", "#FFFFFF"]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={{ paddingTop: topPad + 20, paddingBottom: botPad + 32, paddingHorizontal: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.s4Check, { transform: [{ scale: checkAnim }], opacity: checkAnim }]}>
          <LinearGradient colors={[DARK.teal + "30", DARK.teal + "08"]} style={styles.s4CheckBg}>
            <Ionicons name="checkmark-circle" size={64} color={DARK.teal} />
          </LinearGradient>
        </Animated.View>

        <Animated.View style={{ opacity: contentAnim }}>
          <Text style={{ fontSize: 23, fontWeight: "800", color: valueColor, textAlign: "center", marginBottom: 4 }}>
            Debt Added!
          </Text>
          <Text style={{ fontSize: 14, color: labelColor, textAlign: "center", marginBottom: 20 }}>
            Keep going — add all your debts for the full picture.
          </Text>

          <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
            <View style={{ flex: 1, alignItems: "center", backgroundColor: cardBg, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 12, borderWidth: 1, borderColor: cardBorder }}>
              <Text style={{ fontSize: 12, fontWeight: "600", color: labelColor, marginBottom: 6 }}>Total Debt Tracked</Text>
              <Text style={{ fontSize: 21, fontWeight: "800", color: DARK.teal }}>{fmt(totalBalance)}</Text>
            </View>
            <View style={{ flex: 1, alignItems: "center", backgroundColor: cardBg, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 12, borderWidth: 1, borderColor: cardBorder }}>
              <Text style={{ fontSize: 12, fontWeight: "600", color: labelColor, marginBottom: 6 }}>Accounts Added</Text>
              <Text style={{ fontSize: 21, fontWeight: "800", color: DARK.teal }}>{count}</Text>
            </View>
          </View>

          {lastDebt && (
            <View style={{ backgroundColor: cardBg, borderRadius: 16, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: cardBorder, borderLeftWidth: 4, borderLeftColor: DARK.teal }}>
              <Text style={{ fontSize: 11, fontWeight: "700", color: labelColor, letterSpacing: 0.9, textTransform: "uppercase", marginBottom: 10 }}>
                Just Added
              </Text>
              <Text style={{ fontSize: 17, fontWeight: "700", color: valueColor, marginBottom: 14 }} numberOfLines={1}>
                {lastDebt.name}
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: labelColor, marginBottom: 3 }}>Balance</Text>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: valueColor }}>{fmt(lastDebt.balance)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: labelColor, marginBottom: 3 }}>APR</Text>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: valueColor }}>{lastDebt.apr.toFixed(1)}%</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: labelColor, marginBottom: 3 }}>Min. Payment</Text>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: valueColor }}>{fmt(lastDebt.minimumPayment)}</Text>
                </View>
              </View>
            </View>
          )}

          <Pressable onPress={onAddAnother} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1, marginBottom: 12 }]}>
            <LinearGradient
              colors={[DARK.teal, Colors.primaryDark]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[styles.primaryBtn, styles.s4PrimaryBtn, { flexDirection: "row", gap: 8 }]}
            >
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>Add Another Debt</Text>
            </LinearGradient>
          </Pressable>

          <Pressable onPress={onChooseStrategy} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1, marginBottom: 22 }]}>
            <View style={{ borderWidth: 2, borderColor: DARK.teal, borderRadius: 14, paddingVertical: 15, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: DARK.teal }}>Choose My Payoff Strategy</Text>
              <Ionicons name="arrow-forward" size={18} color={DARK.teal} />
            </View>
          </Pressable>

          <View style={{ backgroundColor: DARK.teal + "14", borderRadius: 12, padding: 14, flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Text style={{ fontSize: 18 }}>💡</Text>
            <Text style={{ fontSize: 13, color: isDark ? "rgba(255,255,255,0.72)" : DARK.textSub, flex: 1, lineHeight: 19 }}>
              Add all your debts to unlock comparisons and other insights.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DARK.bg },
  dotsRow: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotsInline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  backBtn: {
    width: 56,
    height: 56,
    alignItems: "flex-start",
    justifyContent: "center",
    marginBottom: 8,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 16,
    paddingVertical: 17,
    paddingHorizontal: 24,
    shadowColor: DARK.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  s4PrimaryBtn: {
    alignSelf: "stretch",
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  skipText: {
    color: "#1A4530",
    fontSize: 14,
    textAlign: "center",
  },
  laterLink: {
    fontSize: 13,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  privacyNote: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 6,
  },

  // Screen 1
  s1Content: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
  },
  s1IconWrap: { alignItems: "center" },
  s1LogoImg: {
    width: 140,
    height: 140,
    borderRadius: 36,
  },
  s1Title: {
    color: DARK.text,
    fontSize: 44,
    fontWeight: "800",
    letterSpacing: -1.5,
    lineHeight: 50,
    textAlign: "center",
  },
  s1Subtitle: {
    fontSize: 36,
    fontStyle: "italic",
    fontWeight: "700",
    letterSpacing: -0.5,
    textAlign: "center",
    marginTop: -8,
  },
  privacyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  privacyBadgeText: {
    fontSize: 13,
    lineHeight: 18,
  },
  privacyBadgeLabel: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
  s1Body: {
    color: DARK.textSub,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  s1List: {
    width: "100%",
    gap: 10,
    marginTop: 6,
  },
  s1ListRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  s1CheckDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: DARK.teal,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  s1ListText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  s1TabBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  s1Tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  s1TabText: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  s1Section: {
    paddingHorizontal: 28,
    alignItems: "center",
    gap: 24,
    paddingBottom: 32,
  },
  learnMoreLink: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    textDecorationLine: "underline",
  },
  s1Btns: {
    width: "100%",
    gap: 14,
  },
  s1Trust: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  s1TrustText: {
    fontSize: 12,
    textAlign: "center",
  },

  // Screen 2
  s2Content: {
    paddingHorizontal: 20,
    gap: 14,
  },
  s2Title: {
    color: DARK.text,
    fontSize: 40,
    fontWeight: "800",
    letterSpacing: -1,
  },
  s2TitleGreen: {
    fontSize: 40,
    fontWeight: "800",
    letterSpacing: -1,
    marginTop: -8,
  },
  s2Sub: {
    color: DARK.textSub,
    fontSize: 16,
    lineHeight: 22,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: DARK.card,
    borderRadius: 14,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: DARK.cardBorder,
    padding: 14,
  },
  featureIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  featureStepBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  featureStepNum: {
    fontSize: 18,
    fontWeight: "800",
  },
  featureTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  featureTitle: {
    color: DARK.text,
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  freeBadge: {
    backgroundColor: Colors.primary + "25",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  freeBadgeText: {
    color: DARK.teal,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  featureDesc: {
    color: DARK.textSub,
    fontSize: 14,
    lineHeight: 20,
  },
  s2Btns: { gap: 14, marginTop: 8 },

  // Screen 3
  s3Content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  s3Title: {
    color: DARK.text,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  s3TitleGreen: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.8,
    marginTop: -6,
  },
  s3Sub: {
    color: DARK.textSub,
    fontSize: 15,
  },
  s3Label: {
    color: "#1A4530",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeGridItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 7,
    flex: 1,
    minWidth: "30%",
    maxWidth: "48%",
  },
  typeGridIcon: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  typeGridLabel: {
    fontSize: 13,
    flex: 1,
  },
  s3Fields: { gap: 10 },
  s3Field: {
    backgroundColor: DARK.card,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    gap: 8,
  },
  s3FieldTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  s3FieldLabel: {
    color: DARK.textSub,
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  s3FieldOptional: {
    fontSize: 12,
  },
  s3FieldInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  s3FieldAdornment: {
    color: "#1A4530",
    fontSize: 18,
    fontWeight: "600",
  },
  s3Input: {
    flex: 1,
    color: DARK.text,
    fontSize: 20,
    fontWeight: "600",
    paddingVertical: 2,
  },
  s3Btns: { gap: 14 },

  s3Info: {
    color: DARK.textSub,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  s3PrivacyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 4,
  },
  s3PrivacyText: {
    fontSize: 12,
    flex: 1,
  },

  // Screen 4
  s4Content: {
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 16,
  },
  s4Check: { alignSelf: "center" },
  s4CheckBg: {
    width: 110,
    height: 110,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  s4PreTitle: {
    color: DARK.textSub,
    fontSize: 18,
    textAlign: "center",
  },
  s4Date: {
    fontSize: 48,
    fontWeight: "800",
    letterSpacing: -1.5,
    textAlign: "center",
  },
  s4Sub: {
    color: DARK.textSub,
    fontSize: 16,
    textAlign: "center",
    marginTop: -8,
  },
  s4Cards: {
    width: "100%",
    gap: 10,
    marginVertical: 4,
  },
  s4Card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: DARK.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: DARK.cardBorder,
    borderLeftWidth: 3,
    padding: 14,
  },
  s4CardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  s4CardText: {
    color: DARK.textSub,
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
});

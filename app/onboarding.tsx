import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Dimensions,
  ScrollView,
  Platform,
  Animated,
  useColorScheme,
  Modal,
} from "react-native";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useDebts } from "@/context/DebtContext";
import { DebtForm } from "@/components/DebtForm";
import {
  Debt,
  DebtType,
  debtTypeLabel,
  isSecuredByType,
  monthsToText,
  runStrategy,
} from "@/lib/calculations";
import { useCurrency } from "@/context/CurrencyContext";

const { width: W, height: H } = Dimensions.get("window");

const DARK = {
  // Bright, Duolingo-style onboarding palette (still called DARK for reuse)
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

const DEBT_TYPES: { key: DebtType; icon: string; color: string }[] = [
  { key: "creditCard", icon: "card", color: "#3498DB" },
  { key: "personalLoan", icon: "cash", color: "#9B59B6" },
  { key: "studentLoan", icon: "school", color: "#E67E22" },
  { key: "medical", icon: "medkit", color: "#E74C3C" },
  { key: "auto", icon: "car", color: "#1ABC9C" },
  { key: "other", icon: "ellipsis-horizontal-circle", color: "#95A5A6" },
];

type Step = 1 | 2 | 3 | 4;

function Particle({ delay, color }: { delay: number; color: string }) {
  const y = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const x = useRef(Math.random() * W).current;
  const size = useRef(4 + Math.random() * 6).current;

  useEffect(() => {
    const startAnimation = () => {
      y.setValue(H * 0.8);
      opacity.setValue(0.8);
      Animated.parallel([
        Animated.timing(y, { toValue: H * 0.1, duration: 3000 + Math.random() * 2000, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 3000 + Math.random() * 2000, useNativeDriver: true }),
      ]).start(() => startAnimation());
    };
    const timer = setTimeout(startAnimation, delay);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: x,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity,
        transform: [{ translateY: y }],
      }}
    />
  );
}

const PARTICLE_COLORS = ["#2ECC71", "#3498DB", "#9B59B6", "#E67E22", "#E74C3C", "#F39C12", "#1ABC9C"];

const FREE_FEATURES = [
  "Debt payoff plan (Avalanche + Snowball)",
  "Debt-free date and payoff timeline",
  "What-if extra payment scenarios for $25, $50, $100, and more",
  "Charts and projections",
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { addDebt, setOnboardingDone } = useDebts();
  const { fmt } = useCurrency();
  const scheme = useColorScheme();
  const isDarkMode = scheme === "dark";
  const [step, setStep] = useState<Step>(1);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const [debtName, setDebtName] = useState("");
  const [debtType, setDebtType] = useState<DebtType>("creditCard");
  const [balance, setBalance] = useState("");
  const [apr, setApr] = useState("");
  const [minPayment, setMinPayment] = useState("");
  const [firstDebt, setFirstDebt] = useState<any>(null);
  const [payoffResult, setPayoffResult] = useState<any>(null);
  const [formVisible, setFormVisible] = useState(false);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const botPad = Math.max(insets.bottom, 20) + (Platform.OS === "web" ? 34 : 0);

  const animateToStep = (next: Step) => {
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 1, useNativeDriver: true }),
    ]).start(() => setStep(next));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleStep3Continue = async () => {
    const b = parseFloat(balance);
    const a = parseFloat(apr);
    const m = parseFloat(minPayment) || Math.max(25, b * 0.02);
    if (debtName.trim() && b > 0 && a >= 0) {
      const debtData = {
        name: debtName.trim(),
        balance: b,
        apr: a,
        minimumPayment: m,
        debtType,
        isSecured: isSecuredByType(debtType),
        dueDate: 1,
      };
      await addDebt(debtData);
      const result = runStrategy(
        [{ ...debtData, id: "preview", dateAdded: new Date().toISOString() }],
        0,
        "avalanche"
      );
      setFirstDebt(debtData);
      setPayoffResult(result);
    }
    animateToStep(4);
  };

  const handleEnter = async () => {
    await setOnboardingDone();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace("/(tabs)");
  };

  const step3Ready = balance.length > 0 && parseFloat(balance) > 0 && apr.length > 0;

  const handleOnboardingDebtSave = async (data: Omit<Debt, "id" | "dateAdded">) => {
    await addDebt(data);
    const previewDebt: Debt = {
      ...data,
      id: "preview",
      dateAdded: new Date().toISOString(),
    };
    const result = runStrategy([previewDebt], 0, "avalanche");
    setFirstDebt(data);
    setPayoffResult(result);
    setFormVisible(false);
    animateToStep(4);
  };

  return (
    <View style={styles.root}>
      <Animated.View
        style={[
          styles.root,
          {
            opacity: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
            transform: [{ translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -20] }) }],
          },
        ]}
      >
        {step === 1 && <Screen1 onNext={() => animateToStep(2)} onSkip={handleEnter} topPad={topPad} botPad={botPad} />}
        {step === 2 && <Screen2 onNext={() => animateToStep(3)} onSkip={() => animateToStep(3)} onBack={() => animateToStep(1)} topPad={topPad} botPad={botPad} />}
        {step === 3 && (
          <Screen3
            debtName={debtName} setDebtName={setDebtName}
            debtType={debtType} setDebtType={setDebtType}
            balance={balance} setBalance={setBalance}
            apr={apr} setApr={setApr}
            minPayment={minPayment} setMinPayment={setMinPayment}
            onNext={handleStep3Continue}
            onSkip={() => animateToStep(4)}
            onBack={() => animateToStep(2)}
            ready={step3Ready}
            topPad={topPad} botPad={botPad}
            onOpenDebtForm={() => setFormVisible(true)}
          />
        )}
        {step === 4 && (
          <Screen4
            firstDebt={firstDebt}
            payoffResult={payoffResult}
            onEnter={handleEnter}
            topPad={topPad}
            botPad={botPad}
            fmt={fmt}
          />
        )}
      </Animated.View>

      <View style={[styles.dotsRow, { bottom: botPad - 8 }]}>
        {([1, 2, 3, 4] as Step[]).map((s) => (
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
          title="Debt free date"
          headerExtra={
            <View style={styles.dotsInline}>
              {[1, 2, 3, 4].map((s) => (
                <View
                  key={s}
                  style={[
                    styles.dot,
                    {
                      width: s === 3 ? 24 : 8,
                      backgroundColor:
                        s === 3 ? Colors.primary : Colors.light.tabIconDefault + "50",
                    },
                  ]}
                />
              ))}
            </View>
          }
        />
      </Modal>
    </View>
  );
}

function Screen1({ onNext, onSkip, topPad, botPad }: any) {
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  useEffect(() => {
    Animated.stagger(120, [
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: isDark ? "#080E14" : DARK.bg }]}>
      <LinearGradient
        colors={
          isDark
            ? ["#0A1628", "#080E14", "#050A0E"]
            : ["#E7F8EC", "#FFFFFF"]
        }
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.s1Content, { paddingTop: topPad + 32, paddingBottom: botPad + 56 }]}>
        <Animated.View style={[styles.s1IconWrap, { transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient
            colors={[DARK.teal + "30", DARK.teal + "08"]}
            style={styles.s1IconGlow}
          >
            <LinearGradient
              colors={[Colors.buttonGreen, Colors.buttonGreenDark]}
              style={styles.s1Icon}
            >
              <Ionicons name="trending-up" size={52} color="#fff" />
            </LinearGradient>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, gap: 10, alignItems: "center", width: "100%" }}>
          <Text
            style={[
              styles.s1Title,
              { color: isDark ? "#FFFFFF" : DARK.text },
            ]}
          >
            Break Free{"\n"}From Debt.
          </Text>
          <Text style={[styles.s1Subtitle, { color: DARK.teal }]}>Finally.</Text>
          <Text
            style={[
              styles.s1Body,
              {
                color: isDark
                  ? "rgba(255,255,255,0.92)"
                  : DARK.textSub,
              },
            ]}
          >
            Free Features Included In The App:
          </Text>
          <View style={styles.s1List}>
            {FREE_FEATURES.map((t) => (
              <View key={t} style={styles.s1ListRow}>
                <View style={styles.s1CheckDot}>
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                </View>
                <Text
                  style={[
                    styles.s1ListText,
                    { color: isDark ? "rgba(255,255,255,0.88)" : DARK.textSub },
                  ]}
                >
                  {t}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <View style={styles.s1Btns}>
          <Pressable onPress={onNext} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
            <LinearGradient
              colors={[Colors.buttonGreen, Colors.buttonGreenDark]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>Start My Journey</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </Pressable>
          <Pressable onPress={onSkip} hitSlop={16}>
            <Text
              style={[
                styles.skipText,
                {
                  color: isDark
                    ? "rgba(255,255,255,0.6)"
                    : "#5A7A62",
                },
              ]}
            >
              I'll Explore On My Own
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const FEATURE_CARDS = [
  {
    icon: "create",
    title: "Add Your Debts",
    desc: "Enter balances, APR, and minimum payments for each debt.",
    color: "#3498DB",
  },
  {
    icon: "swap-vertical",
    title: "Choose A Strategy",
    desc: "Compare Avalanche and Snowball any time.",
    color: DARK.teal,
  },
  {
    icon: "calendar",
    title: "See Your Payoff Date",
    desc: "Get a debt-free date, timeline, and charts that update as you go.",
    color: "#9B59B6",
  },
  {
    icon: "calculator",
    title: "Run What-If Scenarios",
    desc: "See how extra $25, $50, $100, and more can move up your payoff date and interest savings.",
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
            How It Works.
          </Text>
          <Text style={[styles.s2TitleGreen, { color: DARK.teal }]}>In One Place.</Text>
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
            Add your debts, compare strategies, and see a debt-free date you can act on.
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
                <View
                  style={[
                    styles.featureIconWrap,
                    { backgroundColor: card.color + "22", marginRight: 14 },
                  ]}
                >
                  <Ionicons name={card.icon as any} size={22} color={card.color} />
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
              <Text style={styles.primaryBtnText}>See How It Works</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </Pressable>
          <Pressable onPress={onSkip} hitSlop={16}>
            <Text
              style={[
                styles.skipText,
                {
                  color: isDark
                    ? "rgba(255,255,255,0.6)"
                    : "#5A7A62",
                },
              ]}
            >
              Skip To App
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function Screen3({
  debtName, setDebtName, debtType, setDebtType,
  balance, setBalance, apr, setApr, minPayment, setMinPayment,
  onNext, onSkip, onBack, ready, topPad, botPad, onOpenDebtForm,
}: any) {
  const [focusedField, setFocusedField] = useState<string | null>(null);

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: useColorScheme() === "dark" ? "#080E14" : DARK.bg },
      ]}
    >
      <LinearGradient
        colors={useColorScheme() === "dark" ? ["#0A1628", "#080E14"] : ["#E7F8EC", "#FFFFFF"]}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[styles.s3Content, { paddingTop: topPad + 16, paddingBottom: botPad + 120 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bottomOffset={24}
      >
        <Pressable onPress={onBack} style={styles.backBtn} hitSlop={16}>
          <Ionicons name="chevron-back" size={28} color={useColorScheme() === "dark" ? "rgba(255,255,255,0.5)" : "#5A7A62"} />
        </Pressable>

        <View style={{ gap: 6, marginBottom: 24 }}>
          <Text
            style={[
              styles.s3Title,
              {
                // White in dark mode for maximum contrast, dark text in light mode
                color: useColorScheme() === "dark" ? "#FFFFFF" : DARK.text,
              },
            ]}
          >
            Let's See Your
          </Text>
          <Text style={[styles.s3TitleGreen, { color: DARK.teal }]}>
            debt-free date.
          </Text>
          <Text
            style={[
              styles.s3Sub,
              {
                // Make subtitle high-contrast in dark mode
                color:
                  useColorScheme() === "dark"
                    ? "rgba(255,255,255,0.9)"
                    : DARK.textSub,
              },
            ]}
          >
            Takes 30 seconds. No commitment.
          </Text>
        </View>

        <View style={styles.s3Fields}>
          <Text
            style={[
              styles.s3Info,
              {
                // Body copy also higher contrast in dark mode for readability
                color:
                  useColorScheme() === "dark"
                    ? "rgba(255,255,255,0.85)"
                    : DARK.textSub,
              },
            ]}
          >
            Add a debt using the same sheet you’ll use in the app. We’ll show your real debt‑free date, and you can edit or add more later.
          </Text>

          <Pressable
            onPress={onOpenDebtForm}
            style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
          >
            <LinearGradient
              colors={[Colors.buttonGreen, Colors.buttonGreenDark]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.primaryBtn}
            >
            <Text style={styles.primaryBtnText}>Add A Debt</Text>
            </LinearGradient>
          </Pressable>

          <Pressable onPress={onSkip} hitSlop={16}>
            <Text
              style={[
                styles.skipText,
                {
                  color:
                    useColorScheme() === "dark"
                      ? "rgba(255,255,255,0.7)"
                      : "#5A7A62",
                },
              ]}
            >
              Skip. I'll Add Debts Later
            </Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

function Screen4({ firstDebt, payoffResult, onEnter, topPad, botPad, fmt }: any) {
  const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const checkAnim = useRef(new Animated.Value(0)).current;
  const dateAnim = useRef(new Animated.Value(0.2)).current;
  const cardsAnim = useRef([0, 1, 2].map(() => new Animated.Value(40))).current;
  const cardsFade = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;

  const particles = useRef(
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
      delay: i * 200,
    }))
  ).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(checkAnim, { toValue: 1, friction: 5, tension: 100, useNativeDriver: true }),
      Animated.spring(dateAnim, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
      Animated.stagger(80, cardsAnim.map((a, i) =>
        Animated.parallel([
          Animated.timing(a, { toValue: 0, duration: 280, useNativeDriver: true }),
          Animated.timing(cardsFade[i], { toValue: 1, duration: 280, useNativeDriver: true }),
        ])
      )),
    ]).start();
  }, []);

  const payoffDate = payoffResult?.payoffDate;
  const months = payoffResult?.totalMonths ?? 0;
  const interest = payoffResult?.totalInterestPaid ?? 0;
  const extraScenarios = firstDebt
    ? [25, 50, 100].map((extra) => {
        const result = runStrategy(
          [
            {
              ...firstDebt,
              id: `extra-${extra}`,
              dateAdded: new Date().toISOString(),
              minimumPayment: firstDebt.minimumPayment + extra,
            },
          ],
          0,
          "avalanche"
        );
        return {
          extra,
          interestSaved: Math.max(0, interest - result.totalInterestPaid),
          monthsSaved: Math.max(0, months - result.totalMonths),
        };
      })
    : [];
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const formatExtraTiming = (savedMonths: number) => {
    if (savedMonths <= 0) return "Same payoff time";
    if (savedMonths === 1) return "Pay off about 1 month sooner";
    if (savedMonths < 12) return `Pay off about ${savedMonths} months sooner`;
    const years = Math.round(savedMonths / 12);
    return `Pay off about ${years} year${years === 1 ? "" : "s"} sooner`;
  };

  const revealCards = firstDebt
    ? [
        {
          icon: "trending-down",
          text: `Total interest at minimums: ${fmt(interest)}`,
          color: Colors.danger,
        },
        {
          icon: "flash",
          text:
            extraScenarios.length > 0
              ? [
                  "What extra payments could do:",
                  ...extraScenarios.map((s) => {
                    const timing =
                      s.monthsSaved > 0
                        ? `${monthsToText(s.monthsSaved)} sooner`
                        : "similar payoff time";
                    return `• +$${s.extra}/mo: ${timing}, save ${fmt(s.interestSaved)} interest`;
                  }),
                ].join("\n")
              : "See how different extra payments change your payoff date and interest savings.",
          color: DARK.teal,
        },
        {
          icon: "shield-checkmark",
          text: "Your plan updates as you add debts and adjust payments",
          color: "#9B59B6",
        },
      ]
    : [
        { icon: "card", text: "Add your debts from the Debts tab", color: DARK.teal },
        { icon: "bar-chart", text: "See your debt-free date instantly", color: "#3498DB" },
        { icon: "bulb", text: "Discover how much extra payments save you", color: "#F39C12" },
      ];

  return (
    <View style={[styles.root, { backgroundColor: isDark ? "#080E14" : DARK.bg }]}>
      <LinearGradient
        colors={isDark ? ["#0A1628", "#080E14"] : ["#E7F8EC", "#FFFFFF"]}
        style={StyleSheet.absoluteFill}
      />
      {particles.map((p) => (
        <Particle key={p.id} delay={p.delay} color={p.color} />
      ))}

      <ScrollView
        contentContainerStyle={[styles.s4Content, { paddingTop: topPad + 32, paddingBottom: botPad + 64 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.s4Check, { transform: [{ scale: checkAnim }], opacity: checkAnim }]}>
          <LinearGradient colors={[DARK.teal + "30", DARK.teal + "08"]} style={styles.s4CheckBg}>
            <Ionicons name="checkmark-circle" size={64} color={DARK.teal} />
          </LinearGradient>
        </Animated.View>

        {firstDebt && payoffDate ? (
          <>
            <Text
              style={[
                styles.s4PreTitle,
                {
                  color: isDark
                    ? "rgba(255,255,255,0.75)"
                    : DARK.textSub,
                },
              ]}
            >
              Your debt-free date:
            </Text>
            <Animated.Text
              style={[
                styles.s4Date,
                {
                  color: DARK.teal,
                  transform: [{ scale: dateAnim }],
                  opacity: dateAnim,
                },
              ]}
            >
              {MONTH_NAMES[payoffDate.getMonth()]} {payoffDate.getFullYear()}
            </Animated.Text>
            <Text
              style={[
                styles.s4Sub,
                {
                  color: isDark
                    ? "rgba(255,255,255,0.7)"
                    : DARK.textSub,
                },
              ]}
            >
              {monthsToText(months)} from today
            </Text>
          </>
        ) : (
          <>
            <Text
              style={[
                styles.s4PreTitle,
                {
                  color: isDark
                    ? "rgba(255,255,255,0.75)"
                    : DARK.textSub,
                },
              ]}
            >
              You're All Set!
            </Text>
            <Text
              style={[
                styles.s4Sub,
                {
                  color: isDark
                    ? "rgba(255,255,255,0.7)"
                    : DARK.textSub,
                },
              ]}
            >
              Start adding your debts to see your personalized payoff plan.
            </Text>
          </>
        )}

        <View style={styles.s4Cards}>
          {revealCards.map((card, i) => (
            <Animated.View
              key={i}
              style={[
                styles.s4Card,
                {
                  borderLeftColor: card.color,
                  opacity: cardsFade[i],
                  transform: [{ translateY: cardsAnim[i] }],
                  backgroundColor: isDark ? "#0D1520" : DARK.card,
                  borderColor: isDark ? "#1A2535" : DARK.cardBorder,
                },
              ]}
            >
              <View style={[styles.s4CardIcon, { backgroundColor: card.color + "20" }]}>
                <Ionicons name={card.icon as any} size={18} color={card.color} />
              </View>
              {i === 1 && extraScenarios.length > 0 ? (
                <View style={{ flex: 1, padding: 2 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: isDark ? "#FFFFFF" : DARK.text,
                      marginBottom: 8,
                    }}
                  >
                    What Extra Payments Could Do
                  </Text>
                  {extraScenarios.map((s, idx) => {
                    return (
                      <View
                        key={s.extra}
                        style={{ paddingVertical: idx === 0 ? 0 : 6, gap: 2 }}
                      >
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: "700",
                            color: DARK.teal,
                          }}
                        >
                          +${s.extra}/mo
                        </Text>
                        <Text
                          style={{
                            fontSize: 13,
                            color: isDark
                              ? "rgba(255,255,255,0.75)"
                              : DARK.textSub,
                          }}
                        >
                          {formatExtraTiming(s.monthsSaved)} · Save {fmt(s.interestSaved)} interest
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text
                  style={[
                    styles.s4CardText,
                    {
                      color: isDark
                        ? "rgba(255,255,255,0.75)"
                        : DARK.textSub,
                    },
                  ]}
                >
                  {card.text}
                </Text>
              )}
            </Animated.View>
          ))}
        </View>

        <Pressable onPress={onEnter} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
          <LinearGradient
            colors={[DARK.teal, Colors.primaryDark]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={[styles.primaryBtn, styles.s4PrimaryBtn]}
          >
            <Text style={styles.primaryBtnText}>
              {firstDebt ? "Get Started" : "Enter DebtFree"}
            </Text>
          </LinearGradient>
        </Pressable>
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

  // Screen 1
  s1Content: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
  },
  s1IconWrap: { alignItems: "center" },
  s1IconGlow: {
    width: 180,
    height: 180,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  s1Icon: {
    width: 120,
    height: 120,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
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
  s1Btns: {
    width: "100%",
    gap: 14,
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
    marginBottom: 12,
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

import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Modal, TextInput } from "react-native";
import { useIsDark } from "@/context/ThemeContext";
import { Image as ExpoImage } from "expo-image";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useDebts } from "@/context/DebtContext";
import { useCurrency } from "@/context/CurrencyContext";
import {
  Strategy,
  StrategyResult,
  monthsToText,
  Debt,
  runStrategy,
  debtsEligibleForStrategy,
  isTaxDebtExcludedFromStrategy,
} from "@/lib/calculations";
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist";
import { RecommendationBar } from "@/components/RecommendationBar";
import { DexCoin } from "@/components/DexCoin";
import { DEX_SCREEN_MAP } from "@/constants/dexScreenMap";

/** Body text on light cream / white cards (theme — avoids low-contrast brown) */
const LIGHT_BODY = Colors.light.textSecondary;

type StrategyTab = Strategy;

const STRATEGIES: { key: StrategyTab; label: string; icon: string; description: string; fullDescription: string[] }[] = [
  {
    key: "avalanche",
    label: "Avalanche",
    icon: "trending-down",
    description: "Highest APR first. Helps reduce interest costs over time.",
    fullDescription: [
      "The Avalanche method tackles your debt with the highest interest rate first, regardless of its balance.",
      "By targeting the most expensive debt first, you focus extra payments on the accounts that are costing you the most in interest. Once that debt is gone, you roll its payment into the next highest-rate debt.",
      "This method often reduces overall interest compared to other approaches, especially if you have high-rate credit cards or personal loans, but the exact savings will depend on your specific balances and rates.",
    ],
  },
  {
    key: "snowball",
    label: "Snowball",
    icon: "snow",
    description: "Smallest balance first. Build momentum quickly.",
    fullDescription: [
      "The Snowball method pays off your smallest balance first, no matter the interest rate.",
      "Each time a debt is cleared, you gain a sense of progress and momentum. The freed-up payment rolls into the next smallest debt, creating a 'snowball' effect.",
      "This approach works well if you need early wins to stay motivated. You may pay slightly more in total interest compared to Avalanche, but the psychological boost can keep you on track.",
    ],
  },
  {
    key: "custom",
    label: "Custom",
    icon: "reorder-three",
    description: "Drag debts below to set your own payoff order.",
    fullDescription: [
      "The Custom method puts you in control. You decide the exact order in which your debts get paid off.",
      "Use the drag handles below the strategy selector to reorder your debts however makes sense for your situation - whether that is a mix of balance, rate, or personal priority.",
      "Once you set an order, your payoff plan updates instantly to reflect your choices.",
    ],
  },
];

const FLAT_CARDS = [
  {
    key: "snowball",
    stratKey: "snowball" as Strategy,
    label: "Snowball",
    icon: "snow",
    subtext: "Pay smallest balance first.",
    benefitTag: "Fastest First Win",
  },
  {
    key: "avalanche",
    stratKey: "avalanche" as Strategy,
    label: "Avalanche",
    icon: "trending-down",
    subtext: "Pay the highest APR first.",
    benefitTag: "Lowest Total Interest",
  },
  {
    key: "highestPayment",
    stratKey: "custom" as Strategy,
    label: "Highest Payment First",
    icon: "trending-up-outline",
    subtext: "Free up monthly cash flow fastest.",
    benefitTag: "Fastest Cash Flow Relief",
  },
  {
    key: "tsunami",
    stratKey: "custom" as Strategy,
    label: "Custom (Drag & Drop)",
    icon: "reorder-three",
    subtext: "Drag debts into any order you choose.",
    benefitTag: "Your Custom Order",
  },
] as const;


function StrategyCard({
  label,
  icon,
  description,
  detailText,
  benefitTag,
  months,
  interest,
  isSelected,
  recommendedBadge,
  onPress,
  onLearnMore,
  onSeePlan,
  C,
}: {
  label: string;
  icon: string;
  description: string;
  detailText?: string;
  benefitTag?: string;
  months: number;
  interest: number;
  isSelected: boolean;
  recommendedBadge?: boolean;
  onPress: () => void;
  onLearnMore?: () => void;
  onSeePlan?: () => void;
  C: typeof Colors.light;
  isDark: boolean;
}) {
  const { fmt } = useCurrency();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.stratCard,
        {
          backgroundColor: isSelected ? Colors.primary + "15" : C.surface,
          borderColor: isSelected ? Colors.primary : C.border,
          shadowColor: isSelected ? Colors.primary : "#000",
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      {recommendedBadge && (
        <View style={styles.badgeRow}>
          <View style={[styles.bestBadge, { backgroundColor: Colors.buttonGreenDark }]}>
            <Text style={styles.bestBadgeText}>⭐ Recommended</Text>
          </View>
        </View>
      )}
      <View style={styles.stratCardHeader}>
        <View
          style={[
            styles.stratIcon,
            { backgroundColor: isSelected ? Colors.primary : Colors.primary + "20" },
          ]}
        >
          <Ionicons name={icon as any} size={20} color={isSelected ? "#FFF5E4" : Colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.stratLabelRow}>
            <Text style={[styles.stratLabel, { color: C.text }]}>{label}</Text>
            {benefitTag ? (
              <View style={[styles.benefitChip, { backgroundColor: Colors.primary + "18", borderColor: Colors.primary + "40" }]}>
                <Text style={[styles.benefitChipText, { color: Colors.primary }]}>{benefitTag}</Text>
              </View>
            ) : null}
          </View>
          <Text style={[styles.stratDesc, { color: C.textSecondary }]} numberOfLines={2}>
            {description}
          </Text>
          {detailText ? (
            <Text style={[styles.stratDetailText, { color: Colors.progressGreen }]}>
              {detailText}
            </Text>
          ) : null}
        </View>
        {isSelected ? (
          <View style={[styles.stratCheckWrap, { backgroundColor: Colors.primary }]}>
            <Ionicons name="checkmark" size={18} color="#FFF5E4" />
          </View>
        ) : (
          <Ionicons name="chevron-down" size={20} color={C.textSecondary} />
        )}
      </View>
      <View style={[styles.stratDivider, { backgroundColor: C.border }]} />
      <View style={styles.stratStats}>
        <View style={styles.stratStat}>
          <Text style={[styles.stratStatLabel, { color: C.textSecondary }]}>Payoff</Text>
          <Text style={[styles.stratStatValue, { color: C.text }]}>{monthsToText(months)}</Text>
        </View>
        <View style={[styles.stratStat, { alignItems: "flex-end" }]}>
          <Text style={[styles.stratStatLabel, { color: C.textSecondary }]}>Total Interest Paid</Text>
          <Text style={[styles.stratStatValue, { color: C.text }]}>
            {fmt(interest)}
          </Text>
        </View>
      </View>
      {(onSeePlan || onLearnMore) && (
        <View style={styles.learnMoreRow}>
          {onLearnMore && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation?.();
                onLearnMore();
              }}
              hitSlop={8}
              style={styles.learnMoreBtn}
            >
              <Text style={[styles.learnMoreText, { color: Colors.primary }]}>
                How it works →
              </Text>
            </Pressable>
          )}
          {onSeePlan && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation?.();
                onSeePlan();
              }}
              hitSlop={8}
              style={styles.learnMoreBtn}
            >
              <Text style={[styles.learnMoreText, { color: C.textSecondary }]}>
                See plan →
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </Pressable>
  );
}

export default function StrategyScreen() {
  const isDark = useIsDark();
  const C = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const {
    debts,
    selectedStrategy,
    setSelectedStrategy,
    extraPayment,
    setExtraPayment,
    avalancheResult,
    snowballResult,
    customResult,
    customOrder,
    setCustomOrder,
  } = useDebts();
  const { fmt } = useCurrency();

  const [sliderValue, setSliderValue] = useState(extraPayment);
  const [customExtraInput, setCustomExtraInput] = useState(String(extraPayment || ""));
  const [stratModal, setStratModal] = useState<"snowball" | "avalanche" | "tsunami" | "highestPayment" | null>(null);
  const [tsunamiExpanded, setTsunamiExpanded] = useState(false);
  const [customSubMode, setCustomSubMode] = useState<"tsunami" | "highestPayment">("highestPayment");
  const [saveBtnMode, setSaveBtnMode] = useState<"idle" | "saved">("idle");

  React.useEffect(() => {
    AsyncStorage.getItem("debtpath_custom_sub").then((val) => {
      if (val === "tsunami" || val === "highestPayment") setCustomSubMode(val);
    });
  }, []);

  const handleStrategySelect = (s: Strategy) => {
    setSelectedStrategy(s);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleExtraChange = (val: number) => {
    const rounded = Math.round(val / 25) * 25;
    setSliderValue(rounded);
  };

  const commitExtra = () => {
    setExtraPayment(sliderValue);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const applyCustomExtra = () => {
    const parsed = Math.max(0, Math.round(parseFloat(customExtraInput || "0") || 0));
    setSliderValue(parsed);
    setExtraPayment(parsed);
    setCustomExtraInput(String(parsed));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const avalancheSavings = Math.max(0, snowballResult.totalInterestPaid - avalancheResult.totalInterestPaid);

  const webTopPad = Platform.OS === "web" ? 67 : 0;

  const currentResult = selectedStrategy === "avalanche" ? avalancheResult : selectedStrategy === "snowball" ? snowballResult : customResult;

  const highestPaymentResult = useMemo(() => {
    if (debts.length === 0) return snowballResult;
    const order = [...debts]
      .sort((a, b) => b.minimumPayment - a.minimumPayment)
      .map((d) => d.id);
    return runStrategy(debts, extraPayment, "custom", order);
  }, [debts, extraPayment]);

  const resultByKey: Record<string, StrategyResult> = {
    snowball: snowballResult,
    avalanche: avalancheResult,
    highestPayment: highestPaymentResult,
    tsunami: customResult,
  };

  // When all strategies project the same interest/months, don't claim one is "better"
  const interests = [
    snowballResult.totalInterestPaid,
    avalancheResult.totalInterestPaid,
    highestPaymentResult.totalInterestPaid,
    customResult.totalInterestPaid,
  ];
  const monthsList = [
    snowballResult.totalMonths,
    avalancheResult.totalMonths,
    highestPaymentResult.totalMonths,
    customResult.totalMonths,
  ];
  // Round to dollars so tiny float diff doesn't hide a tie; same month count required
  const interestsRounded = interests.map((x) => Math.round(x));
  const interestRange =
    Math.max(...interestsRounded) - Math.min(...interestsRounded);
  const monthsTie = Math.max(...monthsList) === Math.min(...monthsList);
  const strategiesTie =
    debts.length > 1 && interestRange === 0 && monthsTie;

  // Only show "Recommended" when one strategy is clearly better (avoids every card looking "best")
  const RECOMMENDED_THRESHOLD = 50;
  const eligible = debtsEligibleForStrategy(debts);
  const badgeCandidates =
    eligible.length > 1
      ? [
          { key: "snowball", interest: snowballResult.totalInterestPaid },
          { key: "avalanche", interest: avalancheResult.totalInterestPaid },
        ]
      : [];
  const sortedCandidates = [...badgeCandidates].sort((a, b) => a.interest - b.interest);
  const bestInterest = sortedCandidates[0]?.interest ?? Infinity;
  const secondInterest = sortedCandidates[1]?.interest ?? Infinity;
  const interestSpread = secondInterest - bestInterest;
  const recommendedKey =
    !strategiesTie &&
    badgeCandidates.length >= 2 &&
    interestSpread >= RECOMMENDED_THRESHOLD &&
    sortedCandidates[0].key === "avalanche"
      ? "avalanche"
      : null;

  const snowballFirstPaidOff = useMemo(() => {
    if (debts.length === 0) return null;
    for (const snap of snowballResult.snapshots) {
      if (snap.paidOffDebts.length > 0) {
        const debtId = snap.paidOffDebts[0];
        const debt = debts.find((d) => d.id === debtId);
        return { name: debt?.name ?? "a debt", month: snap.month };
      }
    }
    return null;
  }, [snowballResult, debts]);

  const orderedDebts =
    customOrder.length > 0
      ? ([
          ...customOrder.map((id) => debts.find((d) => d.id === id)).filter(Boolean),
          ...debts.filter((d) => !customOrder.includes(d.id)),
        ] as Debt[])
      : debts;

  const selectedKey: "avalanche" | "snowball" | "custom" =
    selectedStrategy === "custom" ? "custom" : selectedStrategy;

  const baselineAvalancheResult = useMemo(() => {
    if (debts.length === 0) return avalancheResult;
    return runStrategy(debts, 0, "avalanche");
  }, [debts, avalancheResult]);

  const baselineSnowballResult = useMemo(() => {
    if (debts.length === 0) return snowballResult;
    return runStrategy(debts, 0, "snowball");
  }, [debts, snowballResult]);

  const baselineCustomResult = useMemo(() => {
    if (debts.length === 0) return customResult;
    return runStrategy(debts, 0, "custom", customOrder);
  }, [debts, customOrder, customResult]);

  const interestSavedByKey: Record<"avalanche" | "snowball" | "custom", number> = {
    avalanche: Math.max(0, Math.round(baselineAvalancheResult.totalInterestPaid - avalancheResult.totalInterestPaid)),
    snowball: Math.max(0, Math.round(baselineSnowballResult.totalInterestPaid - snowballResult.totalInterestPaid)),
    custom: Math.max(0, Math.round(baselineCustomResult.totalInterestPaid - customResult.totalInterestPaid)),
  };

  const interestSavedVsMinimums = interestSavedByKey[selectedKey];

  const heroStrategyLabel =
    selectedKey === "avalanche"
      ? "🔥 Avalanche"
      : selectedKey === "snowball"
        ? "❄️ Snowball"
        : "✏️ Custom";

  const heroStrategySub =
    selectedKey === "avalanche"
      ? "Highest interest first"
      : selectedKey === "snowball"
        ? "Smallest balance first"
        : "Your order - you set the payoff priority";

  const debtFreeDateText = currentResult.payoffDate.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  const heroDexState =
    selectedKey === "avalanche"
      ? "happy"
      : selectedKey === "snowball"
        ? "celebrating"
        : "encouraging";

  const applyCashflowOrder = () => {
    if (debts.length === 0) return;
    const ids = [...debts]
      .sort((a, b) => b.minimumPayment - a.minimumPayment)
      .map((d) => d.id);
    setCustomOrder(ids);
    setSelectedStrategy("custom");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <View style={[styles.container, { backgroundColor: "#f4efe5" }]}>
      <View
        style={[
          styles.htmlHeader,
          {
            paddingTop: Platform.OS === "web" ? webTopPad : insets.top + 8,
            backgroundColor: "#f4efe5",
            borderBottomColor: "#ede7da",
          },
        ]}
      >
        {/* Left spacer (back button removed) so title remains centered. */}
        <View style={styles.htmlBackSpacer} />

        <View style={styles.htmlHeaderCenter}>
          <Text style={styles.htmlHeaderTitle}>Payoff Strategy</Text>
        </View>

        <View style={styles.htmlHeaderDex}>
          <DexCoin size={36} mood={DEX_SCREEN_MAP.strategyHeader.mood} motion={DEX_SCREEN_MAP.strategyHeader.motion} />
        </View>
      </View>

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          styles.scroll,
          Platform.OS === "web" && { paddingBottom: 34 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Client layout: hero + savings strip (same dark brown gradient as Plan tab) */}
        <LinearGradient
          colors={["#1A0A00", "#2E1408", "#1A0A00"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.6, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroBearWrap}>
            <DexCoin size={60} mood={DEX_SCREEN_MAP.strategyHero.mood} motion={DEX_SCREEN_MAP.strategyHero.motion} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroLabel}>Current Strategy</Text>
            <Text style={styles.heroStrategy}>{heroStrategyLabel}</Text>
            <Text style={styles.heroSub}>{heroStrategySub}</Text>
          </View>
        </LinearGradient>

        <View style={styles.savingsStrip}>
          <View style={[styles.savBox, { backgroundColor: "#fff", borderColor: "#ede7da" }]}>
            <Text style={[styles.savVal, { color: "#16a34a" }]}>
              {interestSavedVsMinimums > 0 ? fmt(interestSavedVsMinimums) : fmt(0)}
        </Text>
            <Text style={[styles.savLbl, { color: LIGHT_BODY }]}>Interest saved</Text>
          </View>
          <View style={[styles.savBox, { backgroundColor: "#fff", borderColor: "#ede7da" }]}>
            <Text style={[styles.savVal, { color: "#2563eb" }]}>{currentResult.totalMonths} mo</Text>
            <Text style={[styles.savLbl, { color: LIGHT_BODY }]}>Payoff time</Text>
          </View>
          <View style={[styles.savBox, { backgroundColor: "#fff", borderColor: "#ede7da" }]}>
            <Text style={[styles.savVal, { color: "#e8a020" }]}>{debtFreeDateText}</Text>
            <Text style={[styles.savLbl, { color: LIGHT_BODY }]}>Debt-free date</Text>
          </View>
        </View>

        <Text style={styles.htmlSectionLbl}>Change Strategy</Text>

        <View style={styles.htmlStrategies}>
          {/* Omit current strategy here — hero + stats already show it; list is alternatives only. */}
          {selectedKey !== "avalanche" && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Switch to Avalanche payoff strategy"
              onPress={() => handleStrategySelect("avalanche")}
              style={styles.htmlStratCard}
            >
              <View style={styles.htmlStratMain}>
                <View style={[styles.htmlStratIcon, styles.htmlIconFire]}>
                  <Text style={styles.htmlStratIconEmoji}>🔥</Text>
                </View>
                <View style={styles.htmlStratInfo}>
                  <Text style={styles.htmlStratName}>Avalanche</Text>
                  <Text style={styles.htmlStratSub}>Highest interest first</Text>
                </View>
                <View style={styles.htmlStratRadio} />
              </View>
            </Pressable>
          )}

          {selectedKey !== "snowball" && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Switch to Snowball payoff strategy"
              onPress={() => handleStrategySelect("snowball")}
              style={styles.htmlStratCard}
            >
              <View style={styles.htmlStratMain}>
                <View style={[styles.htmlStratIcon, styles.htmlIconSnow]}>
                  <Text style={styles.htmlStratIconEmoji}>❄️</Text>
                </View>
                <View style={styles.htmlStratInfo}>
                  <Text style={styles.htmlStratName}>Snowball</Text>
                  <Text style={styles.htmlStratSub}>Smallest balance first</Text>
                </View>
                <View style={styles.htmlStratRadio} />
              </View>
            </Pressable>
          )}

          {selectedKey !== "custom" && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Switch to custom payoff order"
              onPress={() => {
                setSelectedStrategy("custom");
                setCustomSubMode("tsunami");
                AsyncStorage.setItem("debtpath_custom_sub", "tsunami").catch(() => {});
              }}
              style={styles.htmlStratCard}
            >
              <View style={styles.htmlStratMain}>
                <View style={[styles.htmlStratIcon, styles.htmlIconCustom]}>
                  <Text style={styles.htmlStratIconEmoji}>✏️</Text>
                </View>
                <View style={styles.htmlStratInfo}>
                  <Text style={styles.htmlStratName}>Custom Order</Text>
                  <Text style={styles.htmlStratSub}>You choose the order</Text>
                </View>
                <View style={styles.htmlStratRadio} />
              </View>
            </Pressable>
          )}

          {selectedKey === "custom" && debts.length > 0 && (
            <View style={[styles.htmlStratCard, styles.htmlStratCardSelPurple]}>
              <View style={styles.htmlCustomOrderWrap}>
                <Text style={styles.htmlCustomOrderTitle}>Drag to reorder your payoff order</Text>
                <Text style={[styles.htmlCustomOrderHint, { color: C.textSecondary }]}>
                  Hold down a debt until it turns blue, then drag it into the right order.
                </Text>
                <DraggableFlatList
                  data={orderedDebts}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  onDragEnd={({ data }) => {
                    const ids = data.map((d) => d.id);
                    setCustomOrder(ids);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }}
                  renderItem={({ item, drag, isActive }: RenderItemParams<Debt>) => {
                    const index = orderedDebts.findIndex((d) => d.id === item.id);
                    return (
                      <Pressable
                        onLongPress={drag}
                        disabled={isActive}
                        style={[
                          styles.orderRow,
                          {
                            backgroundColor: isActive ? Colors.blue + "14" : "transparent",
                            borderWidth: isActive ? 1.5 : 0,
                            borderColor: isActive ? Colors.blue : "transparent",
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.orderNum,
                            { backgroundColor: isActive ? Colors.blue : Colors.primary },
                          ]}
                        >
                          <Text style={styles.orderNumText}>{index + 1}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.orderName, { color: C.text }]} numberOfLines={1}>
                            {item.name}
                          </Text>
                          <Text style={[styles.orderBalance, { color: C.textSecondary }]}>
                            {fmt(item.balance)}
                          </Text>
                        </View>
                        <View style={styles.orderHandle}>
                          <Ionicons
                            name="reorder-three"
                            size={22}
                            color={isActive ? Colors.blue : C.textSecondary}
                          />
                        </View>
                      </Pressable>
                    );
                  }}
                />
              </View>
            </View>
          )}
        </View>

        <View style={styles.htmlExtraSection}>
          <View style={styles.htmlExtraHeader}>
            <Text style={styles.htmlExtraLbl}>Extra Monthly Payment</Text>
            <Text style={styles.htmlExtraVal}>{`+${fmt(sliderValue)}/mo`}</Text>
          </View>

          <View style={styles.htmlExtraPills}>
            {[0, 50, 100, 200, 500].map((v) => {
              const active = sliderValue === v;
              return (
                <Pressable
                  key={v}
                  onPress={() => {
                    setSliderValue(v);
                    setExtraPayment(v);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[
                    styles.htmlPill,
                    active && styles.htmlPillActive,
                  ]}
                >
                  <Text style={[styles.htmlPillText, active && styles.htmlPillTextActive]}>
                    {v === 0 ? "None" : `+$${v}`}
                  </Text>
                </Pressable>
              );
            })}
            <Pressable
              onPress={() => setCustomExtraInput(String(sliderValue))}
              style={[
                styles.htmlPill,
                ![0, 50, 100, 200, 500].includes(sliderValue) && styles.htmlPillActive,
              ]}
            >
              <Text
                style={[
                  styles.htmlPillText,
                  ![0, 50, 100, 200, 500].includes(sliderValue) && styles.htmlPillTextActive,
                ]}
              >
                Custom
              </Text>
            </Pressable>
          </View>
          <View style={styles.customExtraRow}>
            <View style={styles.customExtraInputWrap}>
              <Text style={styles.customDollar}>$</Text>
              <TextInput
                value={customExtraInput}
                onChangeText={(v) => setCustomExtraInput(v.replace(/[^0-9]/g, ""))}
                placeholder="Enter custom monthly amount"
                placeholderTextColor="#8F7A63"
                keyboardType="number-pad"
                style={styles.customExtraInput}
              />
            </View>
            <Pressable style={styles.customApplyBtn} onPress={applyCustomExtra}>
              <Text style={styles.customApplyText}>Apply</Text>
            </Pressable>
          </View>
          </View>

        <Pressable
          style={({ pressed }) => [
            styles.saveBtn,
            { opacity: pressed ? 0.9 : 1 },
            saveBtnMode === "saved" ? { backgroundColor: Colors.progressGreen } : null,
          ]}
          onPress={() => {
            setSaveBtnMode("saved");
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/(tabs)/plan");
            setTimeout(() => setSaveBtnMode("idle"), 2000);
          }}
          accessibilityRole="button"
          accessibilityLabel="Save Strategy"
        >
          <Ionicons name={saveBtnMode === "saved" ? "checkmark-circle" : "sparkles"} size={18} color="#FFF5E4" />
          <Text style={styles.saveBtnText}>
            {saveBtnMode === "saved" ? "✓ Strategy Saved!" : "Save Strategy →"}
                </Text>
        </Pressable>

      </ScrollView>

      {(["snowball", "avalanche"] as const).map((key) => {
        const s = STRATEGIES.find((st) => st.key === key)!;
        return (
          <StrategyExplainModal
            key={s.key}
            strategy={s}
            visible={stratModal === s.key}
            isSelected={selectedStrategy === s.key}
            onClose={() => setStratModal(null)}
            onUse={() => {
              handleStrategySelect(s.key);
              setStratModal(null);
            }}
            C={C}
          />
        );
      })}
      <MethodModal
        type="tsunami"
        visible={stratModal === "tsunami"}
        onClose={() => setStratModal(null)}
        onUse={() => {
          setTsunamiExpanded(true);
          handleStrategySelect("custom");
          setCustomSubMode("tsunami");
          AsyncStorage.setItem("debtpath_custom_sub", "tsunami");
          setStratModal(null);
        }}
        C={C}
      />
      <MethodModal
        type="cashflow"
        visible={stratModal === "highestPayment"}
        onClose={() => setStratModal(null)}
        onUse={() => {
          applyCashflowOrder();
          setCustomSubMode("highestPayment");
          AsyncStorage.setItem("debtpath_custom_sub", "highestPayment");
          setStratModal(null);
        }}
        C={C}
      />
    </View>
  );
}

function StrategyExplainModal({
  strategy,
  visible,
  isSelected,
  onClose,
  onUse,
  C,
}: {
  strategy: typeof STRATEGIES[number];
  visible: boolean;
  isSelected: boolean;
  onClose: () => void;
  onUse: () => void;
  C: typeof Colors.light;
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: C.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: C.border }]}>
          <Text style={[styles.modalTitle, { color: C.text }]}>{strategy.label} Method</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={C.textSecondary} />
          </Pressable>
        </View>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.modalContent, { paddingBottom: 24 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.stratExplainIcon, { backgroundColor: Colors.primary + "15" }]}>
            <Ionicons name={strategy.icon as any} size={36} color={Colors.primary} />
          </View>
          {strategy.fullDescription.map((para, i) => (
            <Text key={i} style={[styles.modalParagraph, { color: i === strategy.fullDescription.length - 1 ? C.textSecondary : C.text }]}>
              {para}
            </Text>
          ))}
        </ScrollView>
        <View style={[styles.modalFooter, { borderTopColor: C.border }]}>
          <Pressable
            onPress={onUse}
            style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
          >
            <LinearGradient
              colors={isSelected ? [Colors.buttonGreen + "80", Colors.buttonGreenDark + "80"] : [Colors.buttonGreen, Colors.buttonGreenDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.modalPrimaryBtn}
            >
              <Text style={styles.modalPrimaryText}>
                {isSelected ? `${strategy.label} is your current method` : `Use ${strategy.label}`}
              </Text>
              {!isSelected && <Ionicons name="checkmark" size={18} color="#FFF5E4" />}
            </LinearGradient>
          </Pressable>
          <Pressable onPress={onClose} style={styles.modalSecondaryBtn}>
            <Text style={[styles.modalSecondaryText, { color: C.textSecondary }]}>Back to strategies</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function MethodModal({
  type,
  visible,
  onClose,
  onUse,
  C,
}: {
  type: "tsunami" | "cashflow";
  visible: boolean;
  onClose: () => void;
  onUse: () => void;
  C: typeof Colors.light;
}) {
  const isTsunami = type === "tsunami";
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: C.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: C.border }]}>
          <Text style={[styles.modalTitle, { color: C.text }]}>
            {isTsunami ? "Debt Tsunami (Emotional Approach)" : "Highest Monthly Payment First (Cash-Flow)"}
          </Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={C.textSecondary} />
          </Pressable>
        </View>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.modalContent, { paddingBottom: 24 }]}
          showsVerticalScrollIndicator={false}
        >
          {isTsunami ? (
            <>
              <Text style={[styles.modalParagraph, { color: C.text }]}>
                Debt Tsunami focuses on the debts that cause you the most stress first - like money owed to family, collections, or anything that weighs on you emotionally.
              </Text>
              <Text style={[styles.modalParagraph, { color: C.text }]}>
                Instead of sorting by balance or interest rate, you put the most emotionally heavy debts at the top of your custom payoff list, then move on to the next most stressful once each one is cleared.
              </Text>
              <Text style={[styles.modalParagraph, { color: C.textSecondary }]}>
                This can be a good fit if anxiety, relationships, or constant calls are your main concern. You can switch to Snowball or Avalanche later once the most stressful debts are behind you.
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.modalParagraph, { color: C.text }]}>
                Highest Monthly Payment First is a cash-flow approach. You order your debts by whichever has the largest minimum payment.
              </Text>
              <Text style={[styles.modalParagraph, { color: C.text }]}>
                By knocking out the largest payments first, you free up monthly cash sooner so it is easier to keep up with other bills and avoid falling behind.
              </Text>
              <Text style={[styles.modalParagraph, { color: C.textSecondary }]}>
                Once a high-payment debt is gone, you can roll that amount into the next debt, or switch to Avalanche or Snowball for the rest of your plan.
              </Text>
            </>
          )}
        </ScrollView>
        <View style={[styles.modalFooter, { borderTopColor: C.border }]}>
          <Pressable
            onPress={onUse}
            style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
          >
            <LinearGradient
              colors={[Colors.buttonGreen, Colors.buttonGreenDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.modalPrimaryBtn}
            >
              <Text style={styles.modalPrimaryText}>
                {isTsunami ? "Use this with Custom Order" : "Apply Highest Payment First"}
              </Text>
            </LinearGradient>
          </Pressable>
          <Pressable onPress={onClose} style={styles.modalSecondaryBtn}>
            <Text style={[styles.modalSecondaryText, { color: C.textSecondary }]}>Maybe later</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBrand: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  headerBrandIcon: { width: 24, height: 24, borderRadius: 6 },
  headerBrandName: { fontSize: 13, fontFamily: Fonts.semiBold, fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase" },
  headerTitle: { fontSize: 30, fontFamily: Fonts.extraBold, fontWeight: "800", letterSpacing: -0.5 },
  headerSub: { fontSize: 17, marginTop: 2 },
  scroll: { padding: 16, gap: 12 },
  // Client hero + savings strip
  heroCard: {
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  heroBearWrap: { width: 74, alignItems: "center", justifyContent: "center" },
  heroLabel: { fontSize: 12, fontFamily: Fonts.semiBold, fontWeight: "800", color: "#FFF5E4", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 },
  heroStrategy: { fontSize: 24, fontFamily: Fonts.black, fontWeight: "900", letterSpacing: -0.3, color: "#FFF5E4" },
  heroSub: { fontSize: 14, lineHeight: 21, marginTop: 2, fontFamily: Fonts.semiBold, fontWeight: "700", color: "#FFF5E4" },
  savingsStrip: { flexDirection: "row", gap: 8 },
  savBox: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  savVal: { fontSize: 19, fontFamily: Fonts.black, fontWeight: "900" },
  savLbl: { fontSize: 11, fontFamily: Fonts.semiBold, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.6, marginTop: 4 },

  // ── Client "Change Strategy" (HTML-like) ────────────────────────────────
  htmlHeader: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  htmlBackBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#e8e1d4", alignItems: "center", justifyContent: "center" },
  htmlHeaderCenter: { flex: 1, alignItems: "center" },
  htmlHeaderTitle: { fontSize: 19, fontFamily: Fonts.extraBold, fontWeight: "900", color: "#1a1a1a" },
  htmlHeaderDex: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  htmlBackSpacer: { width: 34, height: 34, borderRadius: 17 },

  htmlSectionLbl: { paddingLeft: 4, paddingRight: 4, paddingBottom: 8, fontSize: 12, fontFamily: Fonts.extraBold, fontWeight: "900", color: LIGHT_BODY, letterSpacing: 1, textTransform: "uppercase" },
  htmlStrategies: { flexDirection: "column", gap: 10 },

  htmlStratCard: { backgroundColor: "#fff", borderRadius: 16, borderWidth: 2, borderColor: "#ede7da", overflow: "hidden" },
  htmlStratCardSelBlue: { borderColor: "#2563eb" },
  htmlStratCardSelAmber: { borderColor: "#e8a020" },
  htmlStratCardSelPurple: { borderColor: "#8b5cf6" },

  htmlStratMain: { paddingVertical: 14, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  htmlStratIcon: { width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  htmlIconFire: { backgroundColor: "#fed7aa" },
  htmlIconSnow: { backgroundColor: "#bfdbfe" },
  htmlIconCustom: { backgroundColor: "#ede9fe" },
  htmlStratIconEmoji: { fontSize: 26 },
  htmlStratInfo: { flex: 1 },
  htmlStratName: { fontSize: 17, fontFamily: Fonts.black, fontWeight: "900", color: "#1a1a1a" },
  htmlStratSub: { fontSize: 12, fontFamily: Fonts.semiBold, fontWeight: "700", color: LIGHT_BODY, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 1 },

  htmlStratRadio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: "#ddd6c8", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  htmlRadioSelBlue: { borderColor: "#2563eb" },
  htmlRadioSelAmber: { borderColor: "#e8a020" },
  htmlRadioSelPurple: { borderColor: "#8b5cf6" },
  htmlRadioDot: { width: 13, height: 13, borderRadius: 6 },

  htmlStratDetail: { paddingHorizontal: 16, paddingBottom: 14 },
  htmlStratDivider: { height: 1, backgroundColor: "#f4efe5", marginBottom: 12 },
  htmlStratDesc: { fontSize: 14, fontFamily: Fonts.semiBold, fontWeight: "600", color: LIGHT_BODY, lineHeight: 22, marginBottom: 10 },
  htmlDetailStats: { flexDirection: "row", gap: 8 },
  htmlDStat: { flex: 1, backgroundColor: "#f4efe5", borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12 },
  htmlDStatVal: { fontSize: 21, fontFamily: Fonts.black, fontWeight: "900" },
  htmlDStatLbl: { fontSize: 10, fontFamily: Fonts.extraBold, fontWeight: "900", color: LIGHT_BODY, textTransform: "uppercase", letterSpacing: 0.4, marginTop: 2, lineHeight: 14 },

  htmlBadgeRow: { flexDirection: "row", gap: 6, flexWrap: "wrap", marginTop: 10 },
  htmlBadge: { backgroundColor: "#fff", borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10 },
  htmlBadgeText: { fontSize: 12, fontFamily: Fonts.extraBold, fontWeight: "900" },
  htmlBadgeTextGreen: { color: "#155724" },
  htmlBadgeTextBlue: { color: "#1a56db" },
  htmlBadgeTextAmber: { color: "#856404" },
  htmlBadgeTextPurple: { color: "#6b21a8" },
  htmlBadgeGreen: { backgroundColor: "#d4edda" },
  htmlBadgeBlue: { backgroundColor: "#e8f0fe" },
  htmlBadgeAmber: { backgroundColor: "#fff3cd" },
  htmlBadgePurple: { backgroundColor: "#f3e8ff" },

  // Add left margin so the instruction line never crowds the first row.
  htmlCustomOrderWrap: { marginTop: 12 },
  htmlCustomOrderTitle: { fontSize: 13, fontFamily: Fonts.extraBold, fontWeight: "900", color: LIGHT_BODY, marginBottom: 4, letterSpacing: 0.3, marginLeft: 10 },
  htmlCustomOrderHint: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    fontWeight: "600",
    lineHeight: 17,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
  },

  htmlExtraSection: { marginTop: 14 },
  htmlExtraHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  htmlExtraLbl: { fontSize: 12, fontFamily: Fonts.extraBold, fontWeight: "900", color: LIGHT_BODY, letterSpacing: 1, textTransform: "uppercase" },
  htmlExtraVal: { fontSize: 17, fontFamily: Fonts.black, fontWeight: "900", color: "#e8a020" },
  htmlExtraPills: { flexDirection: "row", gap: 6, flexWrap: "wrap", marginBottom: 10 },

  htmlPill: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 10, borderWidth: 1.5, borderColor: "#ddd6c8", backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  htmlPillActive: { backgroundColor: "#e8a020", borderColor: "#e8a020" },
  htmlPillText: { fontSize: 14, fontFamily: Fonts.extraBold, fontWeight: "900", color: "#1a1a1a" },
  htmlPillTextActive: { color: "#FFF5E4" },
  customExtraRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  customExtraInputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#ddd6c8",
    borderRadius: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    minHeight: 42,
  },
  customDollar: { fontSize: 17, fontFamily: Fonts.extraBold, fontWeight: "900", color: LIGHT_BODY, marginRight: 4 },
  customExtraInput: { flex: 1, fontSize: 15, fontFamily: Fonts.semiBold, color: "#1a1a1a", paddingVertical: 8 },
  customApplyBtn: {
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  customApplyText: { color: "#FFF5E4", fontSize: 14, fontFamily: Fonts.extraBold, fontWeight: "900" },

  sectionTitle: {
    fontSize: 15,
    fontFamily: Fonts.semiBold, fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingHorizontal: 2,
    marginTop: 4,
  },
  strategyCards: { gap: 10 },
  singleDebtNotice: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
    gap: 6,
  },
  singleDebtNoticeText: {
    fontSize: 17,
    fontFamily: Fonts.bold, fontWeight: "700",
    textAlign: "center",
    lineHeight: 24,
  },
  singleDebtNoticeSubtext: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 21,
    marginTop: 2,
  },
  taxNoticeCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  taxNoticeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  taxNoticeIcon: {
    fontSize: 21,
    lineHeight: 25,
  },
  taxNoticeTitle: {
    fontSize: 15,
    fontFamily: Fonts.bold, fontWeight: "700",
    marginBottom: 3,
  },
  taxNoticeBody: {
    fontSize: 14,
    lineHeight: 19,
  },
  tieNoticeCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  tieNoticeText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 19,
  },
  stratCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    position: "relative",
  },
  badgeRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  bestBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  bestBadgeText: { color: "#FFF5E4", fontSize: 13, fontFamily: Fonts.extraBold, fontWeight: "800", letterSpacing: 0.5 },
  stratCardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  stratCheckWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  stratIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  stratLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  benefitChip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  benefitChipText: {
    fontSize: 12,
    fontFamily: Fonts.bold, fontWeight: "700",
    letterSpacing: 0.2,
  },
  stratLabel: { fontSize: 17, fontFamily: Fonts.bold, fontWeight: "700" },
  stratDesc: { fontSize: 16, marginTop: 2, lineHeight: 22 },
  stratDivider: { height: StyleSheet.hairlineWidth, marginVertical: 10 },
  stratStats: { flexDirection: "row", justifyContent: "space-between" },
  stratStat: {},
  stratStatLabel: { fontSize: 14, textTransform: "uppercase", letterSpacing: 0.4 },
  stratStatValue: { fontSize: 16, fontFamily: Fonts.bold, fontWeight: "700", marginTop: 2 },
  stratDetailText: { fontSize: 14, fontFamily: Fonts.semiBold, fontWeight: "600", marginTop: 3 },
  learnMoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 8,
  },
  learnMoreBtn: { paddingVertical: 2 },
  learnMoreText: { fontSize: 14, fontFamily: Fonts.semiBold, fontWeight: "600" },
  // Client extra-payment pills + CTA
  extraCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 16,
    gap: 12,
  },
  extraTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  extraLabel: { fontSize: 14, fontFamily: Fonts.semiBold, fontWeight: "700" },
  extraVal: { fontSize: 19, fontFamily: Fonts.mono, fontWeight: "500" },
  pillRow: { flexDirection: "row", gap: 10, paddingVertical: 2 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  pillText: { fontSize: 15, fontFamily: Fonts.extraBold, fontWeight: "800" },
  saveBtn: {
    marginTop: 14,
    marginBottom: 20,
    marginHorizontal: 0,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "#2563eb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 6,
  },
  saveBtnText: { fontSize: 17, fontFamily: Fonts.extraBold, fontWeight: "900", color: "#FFF5E4" },
  sliderCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  sliderTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sliderLabel: { fontSize: 17, fontFamily: Fonts.semiBold, fontWeight: "600" },
  sliderValue: { fontSize: 21, fontFamily: Fonts.mono, fontWeight: "500" },
  sliderTrackWrap: { gap: 10 },
  sliderTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  sliderFill: {
    height: "100%",
    borderRadius: 3,
  },
  sliderPips: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -4,
  },
  sliderBtns: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sliderPip: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  presetRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 2,
  },
  sliderQuickBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  sliderQuickBtnText: { fontSize: 15, fontWeight: "500" },
  impactRow: {
    flexDirection: "row",
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    gap: 12,
  },
  impactStat: { flex: 1, alignItems: "center" },
  impactLabel: { fontSize: 14, textTransform: "uppercase", letterSpacing: 0.5 },
  impactValue: { fontSize: 19, fontFamily: Fonts.bold, fontWeight: "700", marginTop: 2 },
  impactDivider: { width: StyleSheet.hairlineWidth },
  customOrderCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  orderRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12, borderRadius: 10 },
  orderNum: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  orderNumText: { color: "#FFF5E4", fontSize: 14, fontFamily: Fonts.bold, fontWeight: "700" },
  orderName: { fontSize: 16, fontFamily: Fonts.semiBold, fontWeight: "600" },
  orderBalance: { fontSize: 14 },
  orderHandle: { padding: 4 },
  orderArrows: { flexDirection: "column", gap: 0 },
  extraMethodCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  extraMethodIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary + "15",
  },
  extraMethodLabel: {
    fontSize: 16,
    fontFamily: Fonts.semiBold, fontWeight: "600",
  },
  extraMethodTagline: {
    fontSize: 14,
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: {
    fontSize: 19,
    fontFamily: Fonts.bold, fontWeight: "700",
    flex: 1,
    marginRight: 12,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 10,
  },
  modalParagraph: {
    fontSize: 16,
    lineHeight: 24,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  modalPrimaryBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  stratExplainIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 8,
  },
  modalPrimaryText: {
    color: "#FFF5E4",
    fontSize: 17,
    fontFamily: Fonts.bold, fontWeight: "700",
  },
  modalSecondaryBtn: {
    alignItems: "center",
    paddingVertical: 8,
  },
  modalSecondaryText: {
    fontSize: 15,
    fontWeight: "500",
  },
});

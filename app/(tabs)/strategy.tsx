import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, useColorScheme, Platform, Modal } from "react-native";
import { Image as ExpoImage } from "expo-image";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
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
      "Use the drag handles below the strategy selector to reorder your debts however makes sense for your situation — whether that is a mix of balance, rate, or personal priority.",
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
          <Ionicons name={icon as any} size={20} color={isSelected ? "#fff" : Colors.primary} />
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
            <Ionicons name="checkmark" size={18} color="#fff" />
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
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
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
  const [stratModal, setStratModal] = useState<"snowball" | "avalanche" | "tsunami" | "highestPayment" | null>(null);
  const [tsunamiExpanded, setTsunamiExpanded] = useState(false);
  const [customSubMode, setCustomSubMode] = useState<"tsunami" | "highestPayment">("highestPayment");

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
    <View style={[styles.container, { backgroundColor: C.background }]}>
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
        <Text style={[styles.headerTitle, { color: C.text }]}>Strategy</Text>
        <Text style={[styles.headerSub, { color: C.textSecondary }]}>
          Choose your debt payoff approach
        </Text>
      </View>

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          styles.scroll,
          Platform.OS === "web" && { paddingBottom: 34 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <RecommendationBar />
        <Text style={[styles.sectionTitle, { color: C.textSecondary }]}>
          DEBT PAYOFF STRATEGIES:
        </Text>
        {debts.length === 1 ? (
          <View style={[styles.singleDebtNotice, { backgroundColor: C.surface, borderColor: C.border }]}>
            <Ionicons name="layers-outline" size={28} color={C.textSecondary} style={{ marginBottom: 8 }} />
            <Text style={[styles.singleDebtNoticeText, { color: C.text }]}>
              Add another debt to see which strategy saves you the most money
            </Text>
            <Text style={[styles.singleDebtNoticeSubtext, { color: C.textSecondary }]}>
              Strategy comparison works when you have 2 or more debts with different interest rates or balances.
            </Text>
          </View>
        ) : (
        <View style={styles.strategyCards}>
          {strategiesTie && (
            <View style={[styles.tieNoticeCard, { backgroundColor: C.surfaceSecondary, borderColor: C.border }]}>
              <Ionicons name="information-circle-outline" size={18} color={C.textSecondary} style={{ marginTop: 2 }} />
              <Text style={[styles.tieNoticeText, { color: C.textSecondary }]}>
                With your current debts, these options show the same payoff time and interest. Pick the one you’ll stick with—Snowball for quick wins, Avalanche if you prefer targeting highest rate first.
              </Text>
            </View>
          )}
          {FLAT_CARDS.map((card) => {
            const result = resultByKey[card.key];
            const isSelected =
              card.key === "highestPayment"
                ? selectedStrategy === "custom" && customSubMode === "highestPayment"
                : card.key === "tsunami"
                ? selectedStrategy === "custom" && customSubMode === "tsunami"
                : selectedStrategy === card.stratKey;

            let detailText: string | undefined;
            if (!strategiesTie && card.key === "avalanche" && debts.length > 1 && avalancheSavings > 0) {
              detailText = `Save ${fmt(avalancheSavings)} vs. Snowball`;
            } else if (!strategiesTie && card.key === "snowball" && snowballFirstPaidOff) {
              detailText = `"${snowballFirstPaidOff.name}" paid off in ${snowballFirstPaidOff.month} mo`;
            }

            return (
              <React.Fragment key={card.key}>
                <StrategyCard
                  label={card.label}
                  icon={card.icon}
                  description={
                    strategiesTie
                      ? "Same payoff time and interest as the other options with your current debts."
                      : card.subtext
                  }
                  detailText={detailText}
                  benefitTag={strategiesTie ? undefined : card.benefitTag}
                  months={result.totalMonths}
                  interest={result.totalInterestPaid}
                  isSelected={isSelected}
                  recommendedBadge={!strategiesTie && card.key === recommendedKey}
                  onPress={() => {
                    if (card.key === "tsunami") {
                      setTsunamiExpanded((e) => !e);
                      handleStrategySelect("custom");
                      setCustomSubMode("tsunami");
                      AsyncStorage.setItem("debtpath_custom_sub", "tsunami");
                    } else if (card.key === "highestPayment") {
                      applyCashflowOrder();
                      setCustomSubMode("highestPayment");
                      AsyncStorage.setItem("debtpath_custom_sub", "highestPayment");
                    } else {
                      handleStrategySelect(card.stratKey);
                    }
                  }}
                  onLearnMore={() => setStratModal(card.key as any)}
                  onSeePlan={() => {
                    if (card.key === "tsunami") {
                      setTsunamiExpanded(true);
                      setCustomSubMode("tsunami");
                      AsyncStorage.setItem("debtpath_custom_sub", "tsunami");
                      setSelectedStrategy("custom");
                    } else if (card.key === "highestPayment") {
                      applyCashflowOrder();
                      setCustomSubMode("highestPayment");
                      AsyncStorage.setItem("debtpath_custom_sub", "highestPayment");
                      setSelectedStrategy("custom");
                    } else {
                      handleStrategySelect(card.stratKey);
                    }
                    router.push("/(tabs)/plan");
                  }}
                  C={C}
                  isDark={isDark}
                />
                {card.key === "tsunami" && tsunamiExpanded && debts.length > 0 && (
                  <View style={[styles.customOrderCard, { backgroundColor: C.surface, borderColor: C.border }]}>
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
                                borderBottomColor: C.border,
                                borderBottomWidth: index < orderedDebts.length - 1 ? StyleSheet.hairlineWidth : 0,
                                backgroundColor: isActive ? Colors.primary + "08" : "transparent",
                              },
                            ]}
                          >
                            <View style={[styles.orderNum, { backgroundColor: Colors.primary }]}>
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
                              <Ionicons name="reorder-three" size={22} color={C.textSecondary} />
                            </View>
                          </Pressable>
                        );
                      }}
                    />
                  </View>
                )}
              </React.Fragment>
            );
          })}
        </View>
        )}

        {debts.some(isTaxDebtExcludedFromStrategy) && (
          <View style={[styles.taxNoticeCard, { backgroundColor: "#F39C1212", borderColor: "#F39C1240" }]}>
            <View style={styles.taxNoticeRow}>
              <Text style={styles.taxNoticeIcon}>🏛️</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.taxNoticeTitle, { color: C.text }]}>Tax debt is separate for now</Text>
                <Text style={[styles.taxNoticeBody, { color: C.textSecondary }]}>
                  IRS/state tax debt stays out of Snowball/Avalanche until you’re on a payment plan. Edit the debt, turn on “On IRS/state payment plan,” and enter your monthly payment — then it joins the payoff order with your other debts.
                </Text>
              </View>
            </View>
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: C.textSecondary }]}>
          Extra Monthly Payment
        </Text>

        <View style={[styles.sliderCard, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={styles.sliderTop}>
            <Text style={[styles.sliderLabel, { color: C.text }]}>Extra Payment</Text>
            <Text style={[styles.sliderValue, { color: Colors.primary }]}>
              +{fmt(sliderValue)}/mo
            </Text>
          </View>

          <View style={styles.sliderTrackWrap}>
            <View style={[styles.sliderTrack, { backgroundColor: C.border }]}>
              <View
                style={[
                  styles.sliderFill,
                  {
                    width: `${Math.min(100, (sliderValue / 500) * 100)}%`,
                    backgroundColor: Colors.primary,
                  },
                ]}
              />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.presetRow}
            >
              {[0, 50, 100, 200, 500].map((v) => (
                <Pressable
                  key={v}
                  onPress={() => { setSliderValue(v); setExtraPayment(v); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                  style={[
                    styles.sliderQuickBtn,
                    {
                      backgroundColor: sliderValue === v ? Colors.primary : C.surfaceSecondary,
                      borderColor: sliderValue === v ? Colors.primary : C.border,
                    },
                  ]}
                >
                  <Text style={[styles.sliderQuickBtnText, { color: sliderValue === v ? "#05130A" : C.textSecondary }]}>
                    {v === 0 ? "None" : `+$${v}`}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {currentResult.totalMonths > 0 && (
            <View style={[styles.impactRow, { backgroundColor: Colors.primary + "10", borderColor: Colors.primary + "30" }]}>
              <View style={styles.impactStat}>
                <Text style={[styles.impactLabel, { color: C.textSecondary }]}>Debt-Free</Text>
                <Text style={[styles.impactValue, { color: Colors.primary }]}>
                  {currentResult.payoffDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </Text>
              </View>
              <View style={[styles.impactDivider, { backgroundColor: C.border }]} />
              <View style={styles.impactStat}>
                <Text style={[styles.impactLabel, { color: C.textSecondary }]}>Payoff</Text>
                <Text style={[styles.impactValue, { color: Colors.primary }]}>
                  {monthsToText(currentResult.totalMonths)}
                </Text>
              </View>
              <View style={[styles.impactDivider, { backgroundColor: C.border }]} />
              <View style={styles.impactStat}>
                <Text style={[styles.impactLabel, { color: C.textSecondary }]}>Interest</Text>
                <Text style={[styles.impactValue, { color: Colors.primary }]}>
                  {fmt(currentResult.totalInterestPaid)}
                </Text>
              </View>
            </View>
          )}
        </View>

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
              {!isSelected && <Ionicons name="checkmark" size={18} color="#fff" />}
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
                Debt Tsunami focuses on the debts that cause you the most stress first — like money owed to family, collections, or anything that weighs on you emotionally.
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
  headerBrandName: { fontSize: 12, fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase" },
  headerTitle: { fontSize: 28, fontWeight: "700", letterSpacing: -0.5 },
  headerSub: { fontSize: 16, marginTop: 2 },
  scroll: { padding: 16, gap: 12 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
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
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 22,
  },
  singleDebtNoticeSubtext: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
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
    fontSize: 20,
    lineHeight: 24,
  },
  taxNoticeTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 3,
  },
  taxNoticeBody: {
    fontSize: 13,
    lineHeight: 18,
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
    fontSize: 13,
    lineHeight: 18,
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
  bestBadgeText: { color: "#fff", fontSize: 12, fontWeight: "800", letterSpacing: 0.5 },
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
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  stratLabel: { fontSize: 16, fontWeight: "700" },
  stratDesc: { fontSize: 15, marginTop: 2, lineHeight: 20 },
  stratDivider: { height: StyleSheet.hairlineWidth, marginVertical: 10 },
  stratStats: { flexDirection: "row", justifyContent: "space-between" },
  stratStat: {},
  stratStatLabel: { fontSize: 13, textTransform: "uppercase", letterSpacing: 0.4 },
  stratStatValue: { fontSize: 15, fontWeight: "700", marginTop: 2 },
  stratDetailText: { fontSize: 13, fontWeight: "600", marginTop: 3 },
  learnMoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 8,
  },
  learnMoreBtn: { paddingVertical: 2 },
  learnMoreText: { fontSize: 13, fontWeight: "600" },
  sliderCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  sliderTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sliderLabel: { fontSize: 16, fontWeight: "600" },
  sliderValue: { fontSize: 20, fontWeight: "800" },
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
  sliderQuickBtnText: { fontSize: 14, fontWeight: "500" },
  impactRow: {
    flexDirection: "row",
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    gap: 12,
  },
  impactStat: { flex: 1, alignItems: "center" },
  impactLabel: { fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5 },
  impactValue: { fontSize: 18, fontWeight: "700", marginTop: 2 },
  impactDivider: { width: StyleSheet.hairlineWidth },
  customOrderCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  orderRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  orderNum: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  orderNumText: { color: "#05130A", fontSize: 13, fontWeight: "700" },
  orderName: { fontSize: 15, fontWeight: "600" },
  orderBalance: { fontSize: 13 },
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
    fontSize: 15,
    fontWeight: "600",
  },
  extraMethodTagline: {
    fontSize: 13,
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
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    marginRight: 12,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 10,
  },
  modalParagraph: {
    fontSize: 15,
    lineHeight: 22,
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
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  modalSecondaryBtn: {
    alignItems: "center",
    paddingVertical: 8,
  },
  modalSecondaryText: {
    fontSize: 14,
    fontWeight: "500",
  },
});

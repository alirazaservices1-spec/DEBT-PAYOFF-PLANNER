import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, useColorScheme, Platform, Modal } from "react-native";
import * as Linking from "expo-linking";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useDebts } from "@/context/DebtContext";
import { useCurrency } from "@/context/CurrencyContext";
import { Strategy, StrategyResult, monthsToText, Debt, runConsolidationScenario } from "@/lib/calculations";
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist";

type StrategyTab = Strategy;

const CONSOLIDATION_RATES = [
  { label: "6%", value: 6 },
  { label: "9%", value: 9 },
  { label: "12%", value: 12 },
  { label: "15%", value: 15 },
];

function ConsolidationScenario({
  debts,
  currentResult,
  C,
}: {
  debts: Debt[];
  currentResult: StrategyResult;
  C: typeof Colors.light;
}) {
  const [targetApr, setTargetApr] = useState(9);
  const { fmt } = useCurrency();
  const totalBalance = debts.reduce((sum, d) => sum + d.balance, 0);
  const totalMinimums = debts.reduce((sum, d) => sum + d.minimumPayment, 0);
  const scenario = runConsolidationScenario(totalBalance, targetApr, totalMinimums);
  const interestSaved = Math.max(0, currentResult.totalInterestPaid - scenario.totalInterestPaid);
  const monthsFaster = Math.max(0, currentResult.totalMonths - scenario.totalMonths);

  return (
    <View style={[styles.consolidationCard, { backgroundColor: C.surface, borderColor: C.border }]}>
      <View style={styles.consolidationHeader}>
        <View style={[styles.consolidationIcon, { backgroundColor: Colors.accent + "20" }]}>
          <Ionicons name="git-merge" size={20} color={Colors.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.consolidationTitle, { color: C.text }]}>Consolidation Scenario</Text>
          <Text style={[styles.consolidationSub, { color: C.textSecondary }]}>
            What if you merged all debts at a lower rate?
          </Text>
        </View>
      </View>

      <Text style={[styles.consolidationRateLabel, { color: C.textSecondary }]}>Target APR</Text>
      <View style={styles.rateChips}>
        {CONSOLIDATION_RATES.map((r) => (
          <Pressable
            key={r.value}
            onPress={() => { setTargetApr(r.value); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            style={[
              styles.rateChip,
              {
                backgroundColor: targetApr === r.value ? Colors.accent : C.surfaceSecondary,
                borderColor: targetApr === r.value ? Colors.accent : C.border,
              },
            ]}
          >
            <Text style={[styles.rateChipText, { color: targetApr === r.value ? "#05130A" : C.textSecondary }]}>
              {r.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={[styles.consolidationResults, { backgroundColor: Colors.accent + "0C", borderColor: Colors.accent + "30" }]}>
        <View style={styles.consolidationStat}>
          <Text style={[styles.consolidationStatLabel, { color: C.textSecondary }]}>Payoff Time</Text>
          <Text style={[styles.consolidationStatValue, { color: Colors.accent }]}>
            {monthsToText(scenario.totalMonths)}
          </Text>
          {monthsFaster > 0 && (
            <Text style={[styles.consolidationStatDelta, { color: Colors.progressGreen }]}>
              {monthsFaster}mo faster
            </Text>
          )}
        </View>
        <View style={[styles.consolidationDivider, { backgroundColor: C.border }]} />
        <View style={styles.consolidationStat}>
          <Text style={[styles.consolidationStatLabel, { color: C.textSecondary }]}>Total Interest Paid to Date</Text>
          <Text style={[styles.consolidationStatValue, { color: Colors.accent }]}>
            {fmt(scenario.totalInterestPaid)}
          </Text>
          {interestSaved > 0 && (
            <Text style={[styles.consolidationStatDelta, { color: Colors.progressGreen }]}>
              Save {fmt(interestSaved)}
            </Text>
          )}
        </View>
      </View>

      {interestSaved > 500 && (
        <Pressable
          onPress={() => Linking.openURL("https://www.curadebt.com/debtpps")}
          style={[styles.consolidationCTA, { backgroundColor: Colors.accent }]}
        >
          <Text style={[styles.consolidationCTAText, { color: "#05130A" }]}>Explore Consolidation Loans</Text>
          <Ionicons name="arrow-forward" size={15} color="#05130A" />
        </Pressable>
      )}

      <Text style={[styles.consolidationDisclaimer, { color: C.textSecondary }]}>
        Assumes all debts consolidated into one loan. Results are estimates.
      </Text>
    </View>
  );
}

const STRATEGIES: { key: StrategyTab; label: string; icon: string; description: string; fullDescription: string[] }[] = [
  {
    key: "avalanche",
    label: "Avalanche",
    icon: "trending-down",
    description: "Highest APR first. Minimize total interest paid.",
    fullDescription: [
      "The Avalanche method tackles your debt with the highest interest rate first, regardless of its balance.",
      "By targeting the most expensive debt first, you pay the least amount of interest over time. Once that debt is gone, you roll its payment into the next highest-rate debt.",
      "This method typically saves the most money overall and works especially well if you have high-rate credit cards or personal loans.",
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

const EXTRA_METHODS = [
  {
    id: "tsunami" as const,
    label: "Debt Tsunami (Emotional)",
    icon: "water-outline",
    tagline: "Tackle the debts that feel most stressful first.",
  },
  {
    id: "cashflow" as const,
    label: "Highest Payment First (Cash-Flow)",
    icon: "trending-up-outline",
    tagline: "Free up cash faster by clearing your largest payments first.",
  },
];

function StrategyCard({
  stratKey,
  label,
  icon,
  description,
  months,
  interest,
  isSelected,
  isBest,
  onSelect,
  onInfo,
  C,
  isDark,
}: {
  stratKey: StrategyTab;
  label: string;
  icon: string;
  description: string;
  months: number;
  interest: number;
  isSelected: boolean;
  isBest: boolean;
  onSelect: () => void;
  onInfo: () => void;
  C: typeof Colors.light;
  isDark: boolean;
}) {
  const { fmt } = useCurrency();
  return (
    <Pressable
      onPress={onInfo}
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
      {isBest && (
        <View style={styles.bestBadge}>
          <Text style={styles.bestBadgeText}>Min. Interest</Text>
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
          <Text style={[styles.stratLabel, { color: C.text }]}>{label}</Text>
          <Text style={[styles.stratDesc, { color: C.textSecondary }]} numberOfLines={2}>
            {description}
          </Text>
        </View>
        {isSelected ? (
          <View style={[styles.stratCheckWrap, { backgroundColor: Colors.primary }]}>
            <Ionicons name="checkmark" size={18} color="#fff" />
          </View>
        ) : (
          <Ionicons name="information-circle-outline" size={20} color={C.textSecondary} />
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
          <Text style={[styles.stratStatValue, { color: Colors.danger }]}>
            {fmt(interest)}
          </Text>
        </View>
      </View>
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
    totalBalance,
  } = useDebts();
  const { fmt } = useCurrency();

  const [sliderValue, setSliderValue] = useState(extraPayment);
  const [methodModal, setMethodModal] = useState<"tsunami" | "cashflow" | null>(null);
  const [stratModal, setStratModal] = useState<StrategyTab | null>(null);

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

  const savedVsMinimum = Math.max(
    0,
    avalancheResult.totalInterestPaid - (selectedStrategy === "snowball" ? snowballResult.totalInterestPaid : selectedStrategy === "custom" ? customResult.totalInterestPaid : avalancheResult.totalInterestPaid)
  );

  const avalancheSavings = Math.max(0, snowballResult.totalInterestPaid - avalancheResult.totalInterestPaid);

  const webTopPad = Platform.OS === "web" ? 67 : 0;

  const currentResult = selectedStrategy === "avalanche" ? avalancheResult : selectedStrategy === "snowball" ? snowballResult : customResult;

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
    setMethodModal(null);
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
        {avalancheResult.totalMonths > 0 && avalancheSavings > 0 && (
          <LinearGradient
            colors={[Colors.buttonGreen, Colors.buttonGreenDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ahaMoment}
          >
            <Ionicons name="bulb" size={22} color="rgba(255,255,255,0.9)" />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.ahaMomentTitle}>Avalanche saves you</Text>
              <Text style={styles.ahaMomentSaving} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>{fmt(avalancheSavings)}</Text>
              <Text style={styles.ahaMomentSub}>
                vs. Snowball in total interest
              </Text>
            </View>
          </LinearGradient>
        )}

        <Text style={[styles.sectionTitle, { color: C.textSecondary }]}>Strategy</Text>

        <View style={styles.strategyCards}>
          {STRATEGIES.map((s) => {
            const result =
              s.key === "avalanche"
                ? avalancheResult
                : s.key === "snowball"
                ? snowballResult
                : customResult;
            const isBest =
              s.key === "avalanche" &&
              avalancheResult.totalInterestPaid <= snowballResult.totalInterestPaid;
            return (
              <StrategyCard
                key={s.key}
                stratKey={s.key}
                label={s.label}
                icon={s.icon}
                description={s.description}
                months={result.totalMonths}
                interest={result.totalInterestPaid}
                isSelected={selectedStrategy === s.key}
                isBest={isBest}
                onSelect={() => handleStrategySelect(s.key)}
                onInfo={() => { setStratModal(s.key); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                C={C}
                isDark={isDark}
              />
            );
          })}
        </View>

        {debts.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: C.textSecondary }]}>Other Approaches</Text>
            <View style={styles.strategyCards}>
              {EXTRA_METHODS.map((m) => (
                <Pressable
                  key={m.id}
                  onPress={() => {
                    setMethodModal(m.id);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={({ pressed }) => [
                    styles.extraMethodCard,
                    { backgroundColor: C.surface, borderColor: C.border, opacity: pressed ? 0.92 : 1 },
                  ]}
                >
                  <View style={styles.extraMethodIcon}>
                    <Ionicons name={m.icon as any} size={18} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.extraMethodLabel, { color: C.text }]}>{m.label}</Text>
                    <Text style={[styles.extraMethodTagline, { color: C.textSecondary }]} numberOfLines={2}>
                      {m.tagline}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={C.textSecondary} />
                </Pressable>
              ))}
            </View>
          </>
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
                    width: `${Math.min(100, (sliderValue / 1000) * 100)}%`,
                    backgroundColor: Colors.primary,
                  },
                ]}
              />
            </View>
            <View style={styles.sliderBtns}>
              {[0, 50, 100, 200, 300, 500, 750, 1000].map((v) => (
                <Pressable
                  key={v}
                  onPress={() => { setSliderValue(v); setExtraPayment(v); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                  style={[
                    styles.sliderPip,
                    {
                      backgroundColor: sliderValue >= v ? Colors.primary : C.border,
                    },
                  ]}
                />
              ))}
            </View>
            <View style={styles.sliderQuickBtns}>
              {[0, 100, 250, 500, 1000].map((v) => (
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
            </View>
          </View>

          {sliderValue > 0 && currentResult.totalMonths > 0 && (
            <View style={[styles.impactRow, { backgroundColor: Colors.primary + "10", borderColor: Colors.primary + "30" }]}>
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

        {selectedStrategy === "custom" && debts.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: C.textSecondary }]}>
              Custom Order (hold and drag to reorder your debts)
            </Text>
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
          </>
        )}

        {debts.length > 0 && totalBalance > 5000 && (
          <>
            <Text style={[styles.sectionTitle, { color: C.textSecondary }]}>Consolidation Scenario</Text>
            <ConsolidationScenario
              debts={debts}
              currentResult={avalancheResult}
              C={C}
            />
          </>
        )}

        <Text style={[styles.sectionTitle, { color: C.textSecondary }]}>Comparison</Text>
        <View style={[styles.compTable, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={[styles.compHeader, { borderBottomColor: C.border }]}>
            <Text style={[styles.compHeaderCell, { color: C.textSecondary, flex: 1.5 }]}>Strategy</Text>
            <Text style={[styles.compHeaderCell, { color: C.textSecondary }]}>Months</Text>
            <Text style={[styles.compHeaderCell, { color: C.textSecondary }]}>Interest Paid to Date</Text>
          </View>
          {[
            { label: "Avalanche", result: avalancheResult, key: "avalanche" },
            { label: "Snowball", result: snowballResult, key: "snowball" },
            { label: "Custom", result: customResult, key: "custom" },
          ].map((row) => (
            <View
              key={row.key}
              style={[
                styles.compRow,
                { borderBottomColor: C.border },
                selectedStrategy === row.key && { backgroundColor: Colors.primary + "0A" },
              ]}
            >
              <View style={[styles.compRowLabel, { flex: 1.5 }]}>
                {selectedStrategy === row.key && (
                  <Ionicons name="radio-button-on" size={14} color={Colors.primary} />
                )}
                <Text style={[styles.compCell, { color: selectedStrategy === row.key ? Colors.primary : C.text, fontWeight: selectedStrategy === row.key ? "600" : "400" }]}>
                  {row.label}
                </Text>
              </View>
              <Text style={[styles.compCell, { color: C.text }]}>
                {monthsToText(row.result.totalMonths)}
              </Text>
              <Text style={[styles.compCell, { color: Colors.danger }]}>
                {fmt(row.result.totalInterestPaid)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <MethodModal
        type="tsunami"
        visible={methodModal === "tsunami"}
        onClose={() => setMethodModal(null)}
        onUse={() => {
          setSelectedStrategy("custom");
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setMethodModal(null);
        }}
        C={C}
      />
      <MethodModal
        type="cashflow"
        visible={methodModal === "cashflow"}
        onClose={() => setMethodModal(null)}
        onUse={applyCashflowOrder}
        C={C}
      />
      {STRATEGIES.map((s) => (
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
      ))}
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
  headerTitle: { fontSize: 28, fontWeight: "700", letterSpacing: -0.5 },
  headerSub: { fontSize: 16, marginTop: 2 },
  scroll: { padding: 16, gap: 12 },
  ahaMoment: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    padding: 16,
  },
  ahaMomentTitle: { color: "rgba(255,255,255,0.95)", fontSize: 14 },
  ahaMomentSaving: { color: "#fff", fontSize: 24, fontWeight: "800" },
  ahaMomentSub: { color: "rgba(255,255,255,0.88)", fontSize: 13 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingHorizontal: 2,
    marginTop: 4,
  },
  strategyCards: { gap: 10 },
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
  bestBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: Colors.buttonGreenDark,
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
  stratLabel: { fontSize: 16, fontWeight: "700" },
  stratDesc: { fontSize: 15, marginTop: 2, lineHeight: 20 },
  stratDivider: { height: StyleSheet.hairlineWidth, marginVertical: 10 },
  stratStats: { flexDirection: "row", justifyContent: "space-between" },
  stratStat: {},
  stratStatLabel: { fontSize: 13, textTransform: "uppercase", letterSpacing: 0.4 },
  stratStatValue: { fontSize: 15, fontWeight: "700", marginTop: 2 },
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
  sliderQuickBtns: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
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
  orderArrows: { flexDirection: "column", gap: 0 },
  consolidationCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  consolidationHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  consolidationIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  consolidationTitle: { fontSize: 16, fontWeight: "700" },
  consolidationSub: { fontSize: 13, marginTop: 2 },
  consolidationRateLabel: { fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  rateChips: { flexDirection: "row", gap: 8 },
  rateChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  rateChipText: { fontSize: 14, fontWeight: "600" },
  consolidationResults: {
    flexDirection: "row",
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  consolidationStat: { flex: 1, alignItems: "center", gap: 2 },
  consolidationStatLabel: { fontSize: 12, textTransform: "uppercase", letterSpacing: 0.4 },
  consolidationStatValue: { fontSize: 18, fontWeight: "800" },
  consolidationStatDelta: { fontSize: 12, fontWeight: "600" },
  consolidationDivider: { width: StyleSheet.hairlineWidth },
  consolidationCTA: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderRadius: 10,
  },
  consolidationCTAText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  consolidationDisclaimer: { fontSize: 12, textAlign: "center" },
  compTable: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  compHeader: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  compHeaderCell: { flex: 1, fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  compRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  compRowLabel: { flexDirection: "row", alignItems: "center", gap: 6 },
  compCell: { flex: 1, fontSize: 14 },
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

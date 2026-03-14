import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  Pressable,
  Modal,
  useColorScheme,
  Platform,
  Alert,
  Dimensions,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { withAppUtmParams } from "@/lib/utm";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Colors from "@/constants/colors";
import { useDebts } from "@/context/DebtContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useNotifications } from "@/context/NotificationContext";
import {
  Debt,
  DebtType,
  debtTypeLabel,
  debtTypeIcon,
  estimatePayoffDate,
  monthsToText,
} from "@/lib/calculations";
import { DebtForm } from "@/components/DebtForm";
import { ProgressRing } from "@/components/ProgressRing";
import { NotificationBell } from "@/components/NotificationBell";
import { RecommendationBar } from "@/components/RecommendationBar";

const DEBT_TYPE_COLORS: Record<DebtType, string> = {
  creditCard: "#3498DB",
  personalLoan: "#9B59B6",
  studentLoan: "#E67E22",
  medical: "#E74C3C",
  auto: "#1ABC9C",
  taxDebt: "#F39C12",
  businessDebt: "#2C3E50",
  collectionAccount: "#C0392B",
  repossessedVehicle: "#7F8C8D",
  businessCreditCard: "#16A085",
  securedBusinessDebt: "#8E44AD",
  other: "#95A5A6",
};

const DEBT_TYPE_COLORS_DARK: Partial<Record<DebtType, string>> = {
  businessDebt: "#A9B6C2",
  collectionAccount: "#E57373",
  securedBusinessDebt: "#CE93D8",
};

function getDebtTypeColor(type: DebtType, isDark: boolean): string {
  return (
    (isDark ? DEBT_TYPE_COLORS_DARK[type] : undefined) ??
    DEBT_TYPE_COLORS[type] ??
    Colors.primary
  );
}


const UNSECURED_TYPES: DebtType[] = [
  "creditCard", "personalLoan", "studentLoan", "medical", "other",
];

function SmartMatchCarousel({
  totalBalance,
  fmt,
  isDark,
  C,
}: {
  totalBalance: number;
  fmt: (n: number) => string;
  isDark: boolean;
  C: typeof Colors.light;
}) {
  const screenW = Dimensions.get("window").width;
  const cardW = screenW - 40;
  return (
    <View style={{ marginBottom: 4 }}>
      <Text style={[styles.carouselLabel, { color: C.textSecondary }]}>Smart Match</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingRight: 4 }}
      >
        <View
          style={[
            styles.smCard,
            {
              width: cardW,
              backgroundColor: C.surface,
              borderColor: isDark ? "rgba(46,204,113,0.22)" : "rgba(46,204,113,0.35)",
            },
          ]}
        >
          <View style={styles.smCardHeader}>
            <View style={[styles.smBadge, { backgroundColor: Colors.primary + "18" }]}>
              <Ionicons name="flash" size={12} color={Colors.primary} />
              <Text style={[styles.smBadgeText, { color: Colors.primary }]}>Personalized Match</Text>
            </View>
          </View>
          <Text style={[styles.smHeadline, { color: C.text }]}>
            Consolidate Your {fmt(totalBalance)} Debt
          </Text>
          <Text style={[styles.smBody, { color: C.textSecondary }]}>
            See if a lower-interest loan could reduce your monthly payments. No guarantee — explore options to compare.
          </Text>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              Linking.openURL(withAppUtmParams("https://www.curadebt.com/debtpps"));
            }}
            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1, alignSelf: "flex-start" }]}
          >
            <View style={styles.smCTA}>
              <Text style={styles.smCTAText}>Check My Options →</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function SmartLinkBar({
  linkType,
  C,
  isDark,
}: {
  linkType: "highApr" | "largeBal";
  C: typeof Colors.light;
  isDark: boolean;
}) {
  const isHighApr = linkType === "highApr";
  const label = isHighApr
    ? "High Interest. See if a lower-rate loan could replace this."
    : "Large Balance. Check if you qualify for a consolidation loan.";
  const cta = isHighApr ? "Check Rates →" : "View Options →";

  const url = "https://www.curadebt.com/debtpps";

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Linking.openURL(withAppUtmParams(url));
      }}
      style={({ pressed }) => [
        styles.smartLink,
        {
          backgroundColor: isDark ? "rgba(46,204,113,0.08)" : "rgba(46,204,113,0.07)",
          borderColor: isDark ? "rgba(46,204,113,0.22)" : "rgba(46,204,113,0.3)",
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Ionicons name="information-circle-outline" size={15} color={Colors.primary} style={{ marginTop: 1 }} />
      <Text style={[styles.smartLinkText, { color: C.textSecondary }]}>{label} </Text>
      <Text style={styles.smartLinkCTA}>{cta}</Text>
    </Pressable>
  );
}

function DebtCardItem({
  debt,
  onDelete,
  C,
  isDark,
  fmt,
  smartLinkType,
}: {
  debt: Debt;
  onDelete: () => void;
  C: typeof Colors.light;
  isDark: boolean;
  fmt: (n: number) => string;
  smartLinkType?: "highApr" | "largeBal";
}) {
  const translateX = useSharedValue(0);
  const deleteWidth = 80;
  const typeColor = getDebtTypeColor(debt.debtType, isDark);

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onChange((e) => {
      translateX.value = Math.min(0, Math.max(-deleteWidth, e.translationX));
    })
    .onEnd(() => {
      if (translateX.value < -deleteWidth / 2) {
        translateX.value = withTiming(-deleteWidth);
      } else {
        translateX.value = withTiming(0);
      }
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleDelete = () => {
    translateX.value = withTiming(0);
    runOnJS(onDelete)();
  };

  const payoffDate = estimatePayoffDate(debt);
  const monthsLeft = Math.max(
    0,
    (payoffDate.getFullYear() - new Date().getFullYear()) * 12 +
      payoffDate.getMonth() -
      new Date().getMonth()
  );

  const isTaxNoPlan =
    debt.debtType === "taxDebt" &&
    (debt.minimumPayment <= 0 || debt.taxPaymentPlan !== true);

  return (
    <>
    <View style={[styles.swipeContainer, smartLinkType && { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }]}>
      <View style={[styles.deleteBg, { backgroundColor: Colors.danger }]}>
        <Pressable onPress={handleDelete} style={styles.deleteAction}>
          <Ionicons name="trash" size={22} color="#fff" />
        </Pressable>
      </View>

      <GestureDetector gesture={pan}>
        <Animated.View style={animStyle}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(`/debt/${debt.id}`);
            }}
            style={({ pressed }) => [
              styles.debtCard,
              {
                backgroundColor: C.surface,
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                shadowColor: isDark ? "#000" : typeColor,
                opacity: pressed ? 0.95 : 1,
              },
            ]}
          >
            <View style={styles.debtCardTop}>
              <View
                style={[
                  styles.debtTypeIcon,
                  { backgroundColor: typeColor + "18" },
                ]}
              >
                <Ionicons
                  name={debtTypeIcon(debt.debtType) as any}
                  size={20}
                  color={typeColor}
                />
              </View>
              <View style={styles.debtCardInfo}>
                <Text style={[styles.debtName, { color: C.text }]} numberOfLines={1}>
                  {debt.name}
                </Text>
                <View style={styles.debtTypeRow}>
                  <Text style={[styles.debtTypeBadge, { color: typeColor }]}>
                    {debtTypeLabel(debt.debtType)}
                    {debt.isSecured ? " • Secured" : ""}
                  </Text>
                  {debt.debtType === "taxDebt" && (
                    <View style={styles.govBadge}>
                      <Text style={styles.govBadgeText}>🏛️ GOV</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.debtBalanceWrap}>
                <Text style={[styles.debtBalance, { color: C.text }]}>
                  {fmt(debt.balance)}
                </Text>
                {!isTaxNoPlan && (
                  <Text style={[styles.debtApr, { color: C.textSecondary }]}>
                    {debt.apr}% APR
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.debtCardDividerRow}>
              <View style={[styles.debtCardDivider, { backgroundColor: C.border }]} />
              <View style={styles.debtCardChevronWrap}>
                <Ionicons name="chevron-forward" size={14} color={C.textSecondary} />
              </View>
            </View>

            <View style={styles.debtCardBottom}>
              {!isTaxNoPlan && (
                <View style={styles.debtStat}>
                  <Text style={[styles.debtStatLabel, { color: C.textSecondary }]}>
                    Min. Payment
                  </Text>
                  <Text style={[styles.debtStatValue, { color: C.text }]}>
                    {debt.debtType === "taxDebt" && debt.minimumPayment <= 0
                      ? "—"
                      : `${fmt(debt.minimumPayment)}/mo`}
                  </Text>
                </View>
              )}
              {/* Tax debt: show due date only when on payment plan with a monthly amount (otherwise there isn't a real due date) */}
              {!(
                debt.debtType === "taxDebt" &&
                (debt.minimumPayment <= 0 || debt.taxPaymentPlan !== true)
              ) && (
              <View style={styles.debtStat}>
                <Text style={[styles.debtStatLabel, { color: C.textSecondary }]}>
                  Due Date
                </Text>
                <Text style={[styles.debtStatValue, { color: C.text }]}>
                  {ordinal(debt.dueDate)}
                </Text>
              </View>
              )}
              <View
                style={[
                  styles.debtStat,
                  {
                    alignItems: "flex-end",
                    flex:
                      debt.debtType === "taxDebt" && isTaxNoPlan
                        ? 1
                        : undefined,
                  },
                ]}
              >
                {isTaxNoPlan ? (
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      Linking.openURL(withAppUtmParams("https://www.curadebt.com/taxpps"));
                    }}
                    hitSlop={8}
                  >
                    <Text style={[styles.debtStatLabel, { color: C.textSecondary }]}>
                      See if you may qualify for the Fresh Start Initiative →
                    </Text>
                  </Pressable>
                ) : (
                  <>
                    <Text style={[styles.debtStatLabel, { color: C.textSecondary }]}>
                      Payoff Est.
                    </Text>
                    <Text style={[styles.debtStatValue, { color: C.text }]}>
                      {monthsToText(monthsLeft)}
                    </Text>
                  </>
                )}
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
    {smartLinkType && (
      <SmartLinkBar linkType={smartLinkType} C={C} isDark={isDark} />
    )}
    </>
  );
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default function DebtsScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { debts, totalBalance, totalMinimums, payments, addDebt, deleteDebt, selectedStrategy, setSelectedStrategy, customOrder } =
    useDebts();
  const principalPaid = payments.reduce((s, p) => s + (p.isMissed ? 0 : p.amount), 0);
  const { fmt } = useCurrency();
  const { setDebts } = useNotifications();

  useEffect(() => {
    setDebts(debts.map((d) => ({ id: d.id, name: d.name, minimumPayment: d.minimumPayment, dueDate: d.dueDate })));
  }, [debts]);

  const [formVisible, setFormVisible] = useState(false);
  const [addDebtPromptDismissed, setAddDebtPromptDismissed] = useState(true);
  const [customSubMode, setCustomSubMode] = useState<"tsunami" | "highestPayment">("highestPayment");

  useEffect(() => {
    AsyncStorage.getItem("debtpath_add_more_dismissed").then((val) => {
      if (val !== "true") setAddDebtPromptDismissed(false);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem("debtpath_custom_sub").then((val) => {
        if (val === "tsunami" || val === "highestPayment") setCustomSubMode(val);
      });
    }, [])
  );

  const dismissAddDebtPrompt = useCallback(async () => {
    setAddDebtPromptDismissed(true);
    await AsyncStorage.setItem("debtpath_add_more_dismissed", "true");
  }, []);

  const openAdd = () => {
    setFormVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const strategyDisplayName = (s: string) => {
    if (s === "snowball") return "Snowball (Lowest Balance)";
    if (s === "avalanche") return "Avalanche (Highest APR)";
    if (s === "custom") return customSubMode === "tsunami" ? "Tsunami (Custom Order)" : "Highest Payment First";
    return "Custom";
  };

  const SCREEN_W = Dimensions.get("window").width;

  const handleDelete = (debt: Debt) => {
    Alert.alert(
      "Delete Debt",
      `Remove "${debt.name}" from your list?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteDebt(debt.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const handleSave = async (data: Omit<Debt, "id" | "dateAdded">) => {
    await addDebt(data);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setFormVisible(false);
  };

  const webTopPad = Platform.OS === "web" ? 67 : 0;

  const totalOriginal = totalBalance + principalPaid;
  const pctPaid = totalOriginal > 0 ? (principalPaid / totalOriginal) * 100 : 0;

  const totalUnsecuredBalance = debts
    .filter((d) => !d.isSecured || UNSECURED_TYPES.includes(d.debtType))
    .reduce((s, d) => s + d.balance, 0);
  const showSmartMatch = totalUnsecuredBalance > 5000;

  const smartLinkDebtId = (() => {
    const highApr = debts.find((d) => d.apr > 18 && !d.isSecured);
    if (highApr) return { id: highApr.id, type: "highApr" as const };
    const largeBal = debts.find((d) => d.balance > 5000 && !d.isSecured);
    if (largeBal) return { id: largeBal.id, type: "largeBal" as const };
    return null;
  })();

  const showAddDebtPrompt = !addDebtPromptDismissed && debts.length < 2;

  const listHeader =
    debts.length > 0 ? (
      <>
        {showAddDebtPrompt && (
          <View style={[styles.addPromptCard, { backgroundColor: C.surface, borderColor: C.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.addPromptTitle, { color: C.text }]}>Is this all of it?</Text>
              <Text style={[styles.addPromptBody, { color: C.textSecondary }]}>
                Your Debt-Free Date is only accurate if we have the full picture.
              </Text>
            </View>
            <Pressable
              onPress={() => {
                dismissAddDebtPrompt();
                openAdd();
              }}
              style={[styles.addPromptBtn, { backgroundColor: Colors.primary }]}
            >
              <Text style={styles.addPromptBtnText}>{"➕ Add Another Debt"}</Text>
            </Pressable>
          </View>
        )}

        <RecommendationBar />

        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/(tabs)/strategy");
          }}
          style={[styles.strategyLabelRow, { flexDirection: "row", alignItems: "center" }]}
          hitSlop={8}
        >
          <Text style={[styles.strategyLabelText, { color: C.text }]}>
            {"Sorting Strategy: " + strategyDisplayName(selectedStrategy)}
          </Text>
          <View style={{ backgroundColor: "#2E7D32", borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 8 }}>
            <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "700" }}>Change ›</Text>
          </View>
        </Pressable>

        {selectedStrategy === "custom" && customSubMode === "tsunami" && (
          <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: isDark ? "#0D2B1A" : "#F0FFF4", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginHorizontal: 0, marginBottom: 4, borderWidth: 1, borderColor: isDark ? "#1A4D2E" : "#A7F3D0" }}>
            <Text style={{ fontSize: 13, color: isDark ? "#6EE7A0" : "#065F46" }}>
              Tap Change › to reorder your debts
            </Text>
          </View>
        )}
      </>
    ) : null;

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: Platform.OS === "web" ? webTopPad : insets.top + 4,
            backgroundColor: C.background,
            borderBottomColor: C.border,
          },
        ]}
      >
        <View style={styles.headerIconRow}>
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
          <View style={styles.headerActions}>
            <NotificationBell />
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/settings");
              }}
              hitSlop={12}
            >
              <Ionicons name="settings-outline" size={24} color={C.text} />
            </Pressable>
          </View>
        </View>

        <View style={styles.headerMainRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerBalanceLabel, { color: C.textSecondary }]}>Total Balance</Text>
            <Text
              style={[styles.headerBalance, { color: C.text }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {fmt(totalBalance)}
            </Text>
            {debts.length > 0 && (
              <Text style={[styles.headerSub, { color: C.textSecondary }]}>
                {debts.length} {debts.length === 1 ? "Account" : "Accounts"} •{" "}
                {fmt(totalMinimums)}/mo Minimums
              </Text>
            )}
          </View>

          {debts.length > 0 && (
            <View style={styles.headerRingWrap}>
              <ProgressRing
                size={56}
                strokeWidth={5}
                progress={pctPaid / 100}
                color={Colors.progressGreen}
                trackColor={isDark ? "rgba(46,204,113,0.18)" : "rgba(46,204,113,0.2)"}
              />
              <View style={styles.headerRingCenter}>
                <Text style={[styles.headerRingPct, { color: Colors.progressGreen }]}>
                  {Math.round(pctPaid)}%
                </Text>
                <Text style={[styles.headerRingLabel, { color: C.textSecondary }]}>Paid</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      <FlatList
        data={
          selectedStrategy === "custom" && customOrder.length > 0
            ? ([
                ...customOrder.map((id) => debts.find((d) => d.id === id)).filter(Boolean),
                ...debts.filter((d) => !customOrder.includes(d.id)),
              ] as typeof debts)
            : [...debts].reverse()
        }
        keyExtractor={(d) => d.id}
        ListHeaderComponent={listHeader}
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.listContent,
          debts.length === 0 && styles.emptyListContent,
          Platform.OS === "web" && { paddingBottom: 34 },
          debts.length > 0 && { paddingBottom: 100 },
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <DebtCardItem
            debt={item}
            onDelete={() => handleDelete(item)}
            C={C}
            isDark={isDark}
            fmt={fmt}
            smartLinkType={
              smartLinkDebtId?.id === item.id ? smartLinkDebtId.type : undefined
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: Colors.primary + "15" }]}>
              <Ionicons name="card-outline" size={48} color={Colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: C.text }]}>
              Add Your First Debt
            </Text>
            <Text style={[styles.emptyBody, { color: C.textSecondary }]}>
              Track all your debts in one place and watch your path to financial freedom unfold.
            </Text>
            <Pressable onPress={openAdd}>
              <LinearGradient
                colors={[Colors.buttonGreen, Colors.buttonGreenDark]}
                style={styles.emptyBtn}
              >
                <Ionicons name="add" size={18} color="#fff" />
                <Text style={styles.emptyBtnText}>Add Debt</Text>
              </LinearGradient>
            </Pressable>
          </View>
        }
      />

      <Pressable
        onPress={openAdd}
        style={[
          styles.fab,
          {
            right: 20,
            bottom: Math.max(insets.bottom, 16) + 72,
            backgroundColor: C.surface,
            shadowColor: isDark ? "#000" : Colors.primary,
          },
        ]}
        hitSlop={8}
      >
        <LinearGradient
          colors={[Colors.buttonGreen, Colors.buttonGreenDark]}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={22} color="#fff" />
          <Text style={styles.fabLabel}>Add Debt</Text>
        </LinearGradient>
      </Pressable>

      <Modal
        visible={formVisible}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setFormVisible(false)}
      >
        <DebtForm
          initial={undefined}
          onSave={handleSave}
          onCancel={() => setFormVisible(false)}
        />
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "column",
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerIconRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  headerBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  headerBrandIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },
  headerBrandName: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  headerMainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerBalanceLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  headerBalance: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  headerRingWrap: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  headerRingCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: 56,
    height: 56,
  },
  headerRingPct: {
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 14,
  },
  headerRingLabel: {
    fontSize: 9,
    fontWeight: "600",
  },
  headerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  headerIconBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  ctaCardsWrap: {
    paddingHorizontal: 0,
    paddingTop: 12,
    paddingBottom: 4,
  },
  carouselLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 4,
  },
  smCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 4,
  },
  smCardHeader: {
    marginBottom: 10,
  },
  smBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  smBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  smHeadline: {
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 21,
    marginBottom: 6,
  },
  smBody: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  smCTA: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  smCTAText: {
    color: "#05130A",
    fontSize: 14,
    fontWeight: "700",
  },
  recCard: {
    width: 220,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 6,
    minHeight: 160,
  },
  recIcon: {
    fontSize: 22,
  },
  recHeadline: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 18,
  },
  recBody: {
    fontSize: 12,
    lineHeight: 17,
    flexShrink: 1,
  },
  recCTA: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  recCTAText: {
    color: "#05130A",
    fontSize: 12,
    fontWeight: "700",
  },
  smartLink: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginHorizontal: 0,
    marginTop: -2,
    marginBottom: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderTopWidth: 0,
    borderRadius: 12,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  smartLinkText: {
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
    flexShrink: 1,
  },
  smartLinkCTA: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary,
    flexShrink: 0,
  },
  fab: {
    position: "absolute",
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    height: 52,
    borderRadius: 26,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  fabLabel: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  swipeContainer: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 16,
  },
  deleteBg: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteAction: {
    width: 80,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  debtCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 5,
  },
  debtCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  debtTypeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  debtCardInfo: { flex: 1 },
  debtTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexWrap: "wrap",
  },
  govBadge: {
    backgroundColor: "#F39C1220",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  govBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#7C5A00",
  },
  debtName: {
    fontSize: 16,
    fontWeight: "600",
  },
  debtTypeBadge: {
    fontSize: 13,
    marginTop: 2,
  },
  debtBalanceWrap: { alignItems: "flex-end" },
  debtBalance: {
    fontSize: 18,
    fontWeight: "700",
  },
  debtApr: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },
  debtCardDivider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  debtCardDividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  debtCardChevronWrap: {
    paddingLeft: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  debtCardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  debtStat: {
    gap: 2,
  },
  debtStatLabel: {
    fontSize: 13,
    letterSpacing: 0.2,
  },
  debtStatValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  empty: {
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  emptyBody: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  emptyBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  addPromptCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    marginTop: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  addPromptTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  addPromptBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  addPromptBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  addPromptBtnText: {
    color: "#05130A",
    fontSize: 15,
    fontWeight: "700",
  },
  recoCarousel: {
    marginTop: 4,
    marginBottom: 4,
  },
  recoCarouselCard: {
    height: 100,
    borderRadius: 16,
    borderWidth: 1,
  },
  strategyLabelRow: {
    paddingVertical: 6,
    paddingHorizontal: 2,
    marginBottom: 4,
    justifyContent: "center",
  },
  strategyLabelText: {
    fontSize: 13,
    color: "#444444",
  },
  strategyOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  strategySheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    gap: 12,
  },
  strategySheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  strategyOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  strategyOptionText: {
    fontSize: 15,
    fontWeight: "600",
  },
});

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
  Platform,
  LayoutAnimation,
  UIManager,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Fonts } from "@/constants/fonts";
import Colors from "@/constants/colors";
import { useDebts } from "@/context/DebtContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useNotifications } from "@/context/NotificationContext";
import {
  Debt,
  DebtType,
  debtTypeLabel,
} from "@/lib/calculations";
import { WelcomeSetupBanner } from "@/components/WelcomeSetupBanner";
import { DebtForm } from "@/components/DebtForm";
import { DexCoin } from "@/components/DexCoin";
import { DEX_SCREEN_MAP } from "@/constants/dexScreenMap";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ── Colours ───────────────────────────────────────────────────────────────────
const BG    = "#F4EFE5";
/** Plan tab hero gradient — reused for debts summary card */
const PLAN_HERO_COLORS = ["#1A0A00", "#2E1408", "#1A0A00"] as const;
const DARK  = "#1A1A1A";
const AMBER = "#E8A020";
const BLUE  = "#2563EB";
const MUTED = Colors.light.textSecondary;
const BORDER = "#EDE7DA";

// Some tooling only reliably exposes WarmContrast via the default export.
const WarmContrast = (Colors as any).WarmContrast ?? {
  textMuted: "#171412",
  textOnYellowBold: "#2A2014",
};


// ── APR badge ─────────────────────────────────────────────────────────────────
function aprStyle(apr: number) {
  if (apr > 15) return { bg: "#fde8e8", color: "#c0392b" };
  if (apr > 10) return { bg: "#fef3cd", color: "#856404" };
  return { bg: "#d4edda", color: "#155724" };
}

function debtEmoji(type: DebtType): string {
  const map: Partial<Record<DebtType, string>> = {
    creditCard: "💳", businessCreditCard: "💳",
    studentLoan: "🎓", auto: "🚗",
    medical: "🏥", taxDebt: "📋",
    personalLoan: "💵", other: "📄",
    collectionAccount: "⚠️", repossessedVehicle: "🚗",
    securedBusinessDebt: "🔐", businessDebt: "💼",
  };
  return map[type] ?? "📄";
}

// ── Debt type options for the edit modal ─────────────────────────────────────
const DEBT_TYPE_OPTIONS: { label: string; value: DebtType }[] = [
  { label: "Credit Card",    value: "creditCard" },
  { label: "Student Loan",   value: "studentLoan" },
  { label: "Auto Loan",      value: "auto" },
  { label: "Medical",        value: "medical" },
  { label: "Personal Loan",  value: "personalLoan" },
  { label: "Tax Debt",       value: "taxDebt" },
  { label: "Other",          value: "other" },
];

// ── Inline edit modal (bottom sheet) ─────────────────────────────────────────
interface EditModalProps {
  visible: boolean;
  title: string;
  initial: Partial<Debt>;
  onSave: (data: Omit<Debt, "id" | "dateAdded">) => void | Promise<void>;
  onCancel: () => void;
}

function EditModal({ visible, title, initial, onSave, onCancel }: EditModalProps) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onCancel}>
      <DebtForm
        initial={initial}
        title={title}
        onCancel={onCancel}
        onSave={onSave}
      />
    </Modal>
  );
}

// ── Delete confirm modal ──────────────────────────────────────────────────────
function DeleteModal({
  visible,
  debtName,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  debtName: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
      <View style={delStyles.overlay}>
        <View style={delStyles.box}>
          <Text style={delStyles.icon}>🗑️</Text>
          <Text style={delStyles.title}>Remove this debt?</Text>
          <Text style={delStyles.sub}>Remove {debtName} from your payoff plan?</Text>
          <View style={delStyles.btns}>
            <Pressable style={delStyles.cancelBtn} onPress={onCancel}>
              <Text style={delStyles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={delStyles.confirmBtn} onPress={onConfirm}>
              <Text style={delStyles.confirmText}>Remove</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Accordion Debt Card ───────────────────────────────────────────────────────
function DebtCard({
  debt,
  isOpen,
  onToggle,
  onEdit,
  onAdjust,
  onDelete,
  onMarkPaid,
  fmt,
  allPayments,
  plannedMonthPayment,
}: {
  debt: Debt;
  isOpen: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onAdjust: () => void;
  onDelete: () => void;
  onMarkPaid: () => void;
  fmt: (n: number) => string;
  allPayments: Array<{ debtId: string; amount: number; isMissed: boolean }>;
  /** First-month payment from current Methods strategy (min + extra to target); omit if not in plan. */
  plannedMonthPayment?: number;
}) {
  const paid = allPayments.filter((p) => p.debtId === debt.id && !p.isMissed).reduce((s, p) => s + p.amount, 0);
  const origBal = debt.balance + paid;
  const pct = origBal > 0 ? Math.min(100, Math.round((paid / origBal) * 100)) : 0;
  const a = aprStyle(debt.apr);
  const emoji = debtEmoji(debt.debtType);
  const showsPlanPay =
    plannedMonthPayment != null &&
    plannedMonthPayment > debt.minimumPayment + 0.01;

  return (
    <View style={s.card}>
      {/* Green progress bar */}
      <View style={s.progTrack}>
        <View style={[s.progFill, { width: `${Math.max(1, pct)}%` as any }]} />
      </View>

      {/* Main row */}
      <View style={s.cardMain}>
        <Pressable
          style={{ flex: 1 }}
          onPress={() => router.push(`/debt/${debt.id}?tab=progress` as any)}
          accessibilityRole="button"
          accessibilityLabel={`Open ${debt.name} details`}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={s.cardIcon}>
              <Text style={{ fontSize: 24 }}>{emoji}</Text>
            </View>
            <View style={s.cardInfo}>
              <Text style={s.cardName} numberOfLines={1}>
                {debt.name}
              </Text>
              <Text style={s.cardSub}>
                {debtTypeLabel(debt.debtType)}
                {" · "}
                {showsPlanPay && plannedMonthPayment != null
                  ? `${fmt(plannedMonthPayment)}/mo plan (${fmt(debt.minimumPayment)} min)`
                  : `${fmt(debt.minimumPayment)}/mo min`}
              </Text>
            </View>
            <View style={s.cardRight}>
              <Text style={s.cardBalance}>{fmt(debt.balance)}</Text>
              <View style={[s.aprBadge, { backgroundColor: a.bg }]}>
                <Text style={[s.aprText, { color: a.color }]}>{debt.apr}% APR</Text>
              </View>
            </View>
          </View>
        </Pressable>

        <Pressable
          onPress={onToggle}
          accessibilityRole="button"
          accessibilityLabel={isOpen ? `Collapse ${debt.name}` : `Expand ${debt.name} actions`}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
        >
          <Text style={[s.chevron, isOpen && s.chevronOpen]}>›</Text>
        </Pressable>
      </View>

      {/* Action row */}
      {isOpen && (
        <>
          <View style={s.actions}>
            <Pressable style={[s.actionBtn, s.btnEdit]} onPress={onEdit}>
              <Text style={[s.actionText, { color: "#1a56db" }]}>✏️ Edit Debt</Text>
            </Pressable>
            <Pressable style={[s.actionBtn, s.btnAdjust]} onPress={onAdjust}>
              <Text style={[s.actionText, { color: "#856404" }]}>📊 Adjust</Text>
            </Pressable>
            <Pressable style={[s.actionBtn, s.btnDelete]} onPress={onDelete}>
              <Text style={[s.actionText, { color: "#b91c1c" }]}>🗑️ Delete</Text>
            </Pressable>
          </View>

          {/* Client expectation: show Log Payment / Mark Paid from the expanded debt card */}
          <Pressable style={({ pressed }) => [s.markPaidBtn, { opacity: pressed ? 0.9 : 1 }]} onPress={onMarkPaid}>
            <Ionicons name="checkmark-done-circle" size={20} color="#FFF5E4" />
            <Text style={s.markPaidText}>Mark Paid / Log payment</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function DebtsScreen() {
  const insets = useSafeAreaInsets();
  const {
    debts,
    totalBalance,
    payments,
    addDebt,
    updateDebt,
    deleteDebt,
    selectedStrategy,
    customOrder,
    welcomeSkipped,
    activeResult,
    extraPayment,
  } = useDebts();

  const { fmt } = useCurrency();
  const { setDebts } = useNotifications();

  const [openCard, setOpenCard]         = useState<string | null>(null);
  const [sortAsc, setSortAsc]           = useState(false);
  const [customSubMode, setCustomSubMode] = useState<"tsunami" | "highestPayment">("highestPayment");

  // Edit modal state
  const [editVisible, setEditVisible]   = useState(false);
  const [editTarget, setEditTarget]     = useState<Debt | null>(null);
  const [editMode, setEditMode]         = useState<"add" | "edit" | "adjust">("add");

  // Delete modal state
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleteTarget, setDeleteTarget]   = useState<Debt | null>(null);

  useEffect(() => {
    setDebts(
      debts.map((d) => ({ id: d.id, name: d.name, minimumPayment: d.minimumPayment, dueDate: d.dueDate }))
    );
  }, [debts]);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem("debtpath_custom_sub").then((val) => {
        if (val === "tsunami" || val === "highestPayment") setCustomSubMode(val);
      });
    }, [])
  );

  // Sort
  const sortedDebts: Debt[] = (() => {
    if (sortAsc) return [...debts].sort((a, b) => a.balance - b.balance);
    if (selectedStrategy === "custom" && customOrder.length > 0) {
      return [
        ...(customOrder.map((id: string) => debts.find((d) => d.id === id)).filter(Boolean) as Debt[]),
        ...debts.filter((d) => !customOrder.includes(d.id)),
      ];
    }
    if (selectedStrategy === "snowball") return [...debts].sort((a, b) => a.balance - b.balance);
    if (selectedStrategy === "avalanche") return [...debts].sort((a, b) => b.apr - a.apr);
    return [...debts].reverse();
  })();

  const totalMinPmt = debts.reduce((sum, d) => sum + d.minimumPayment, 0);
  const avgApr = debts.length > 0
    ? Math.round((debts.reduce((s, d) => s + d.apr, 0) / debts.length) * 10) / 10
    : 0;

  const planPayByDebtId = useMemo(() => {
    const m = new Map<string, number>();
    const snap = activeResult.snapshots[0];
    if (!snap) return m;
    for (const row of snap.debtBreakdown) {
      m.set(row.debtId, row.payment);
    }
    return m;
  }, [activeResult]);

  const planMonth1Total = useMemo(() => {
    const snap = activeResult.snapshots[0];
    if (!snap) return 0;
    return snap.debtBreakdown.reduce((s, r) => s + r.payment, 0);
  }, [activeResult]);

  const toggleCard = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenCard((prev) => (prev === id ? null : id));
  };

  const openAdd = () => {
    setEditTarget(null);
    setEditMode("add");
    setEditVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };
  const openEdit = (debt: Debt) => {
    setEditTarget(debt);
    setEditMode("edit");
    setOpenCard(null);
    setEditVisible(true);
  };
  const openAdjust = (debt: Debt) => {
    setEditTarget(debt);
    setEditMode("adjust");
    setOpenCard(null);
    setEditVisible(true);
  };
  const openDelete = (debt: Debt) => {
    setDeleteTarget(debt);
    setOpenCard(null);
    setDeleteVisible(true);
  };

  const openMarkPaid = (debt: Debt) => {
    setOpenCard(null);
    router.push(`/debt/${debt.id}?tab=transactions&openMarkPaid=1`);
  };

  const handleSave = async (data: Omit<Debt, "id" | "dateAdded">) => {
    if (editTarget) {
      await updateDebt?.(editTarget.id, data);
    } else {
      await addDebt({ ...data, dueDate: data.dueDate ?? 1, dateAdded: new Date().toISOString() } as any);
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEditVisible(false);
    setEditTarget(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteDebt(deleteTarget.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setDeleteVisible(false);
    setDeleteTarget(null);
  };

  const modalTitle =
    editMode === "add" ? "Add Debt"
    : editMode === "adjust" ? `Adjust Payment - ${editTarget?.name ?? ""}`
    : `Edit Debt - ${editTarget?.name ?? ""}`;

  const paddingTop = Platform.OS !== "web" ? insets.top + 10 : 52;
  // The tab bar is `position: absolute` (see `app/(tabs)/_layout.tsx`),
  // so we reserve extra vertical space at the bottom to keep the "+ Add a Debt"
  // button fully visible above it.
  const TAB_BAR_SPACER = 88;

  return (
    <View style={[s.screen, { paddingTop }]}>
      {/* ── Header ── */}
      <View style={s.header}>
        {/* Spacer to keep header centered (no back button on Debts tab). */}
        <View style={s.backSpacer} />
        <Text style={s.headerTitle}>My Debts</Text>
        <DexCoin size={36} mood={DEX_SCREEN_MAP.debtsHeader.mood} motion={DEX_SCREEN_MAP.debtsHeader.motion} />
      </View>

      <FlatList
        data={sortedDebts}
        keyExtractor={(d) => d.id}
        style={{ flex: 1 }}
        contentContainerStyle={[
          s.listContent,
          sortedDebts.length === 0 && s.emptyContent,
          { paddingBottom: 8 + TAB_BAR_SPACER + Math.max(insets.bottom, 16) },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {welcomeSkipped && debts.length === 0 && <WelcomeSetupBanner />}
            {/* ── Total card (same dark brown gradient as Plan tab hero) ── */}
            <LinearGradient
              colors={PLAN_HERO_COLORS}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.6, y: 1 }}
              style={s.totalCard}
            >
              <Text style={s.totalLabel}>Total Debt</Text>
              <Text style={s.totalAmount}>{fmt(totalBalance)}</Text>
              <View style={s.statsRow}>
                <View style={s.stat}>
                  <Text style={s.statVal}>{debts.length} debt{debts.length !== 1 ? "s" : ""}</Text>
                  <Text style={s.statLbl}>Accounts</Text>
                </View>
                <View style={s.stat}>
                  <Text style={s.statVal}>
                    {extraPayment > 0 && activeResult.snapshots.length > 0
                      ? `${fmt(planMonth1Total)}/mo`
                      : `${fmt(totalMinPmt)}/mo`}
                  </Text>
                  <Text style={s.statLbl}>
                    {extraPayment > 0 && activeResult.snapshots.length > 0
                      ? "Plan payment"
                      : "Min. payment"}
                  </Text>
                </View>
                <View style={s.stat}>
                  <Text style={s.statVal}>{avgApr}%</Text>
                  <Text style={s.statLbl}>Avg. APR</Text>
                </View>
              </View>
            </LinearGradient>

            {/* ── Section header ── */}
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>
                {debts.length} account{debts.length !== 1 ? "s" : ""}
              </Text>
              <Pressable onPress={() => setSortAsc((v) => !v)} hitSlop={8}>
                <Text style={s.sortBtn}>Sort by balance ↕</Text>
              </Pressable>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <DebtCard
            debt={item}
            isOpen={openCard === item.id}
            onToggle={() => toggleCard(item.id)}
            onEdit={() => openEdit(item)}
            onAdjust={() => openAdjust(item)}
            onDelete={() => openDelete(item)}
            onMarkPaid={() => openMarkPaid(item)}
            fmt={fmt}
            allPayments={payments as any}
            plannedMonthPayment={planPayByDebtId.get(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <Text style={s.emptyEmoji}>💳</Text>
            <Text style={s.emptyTitle}>No debts yet</Text>
            <Text style={s.emptySub}>Tap "+ Add a Debt" below to get started.</Text>
          </View>
        }
      />

      {/* ── Add button ── */}
      <View style={[s.addWrap, { paddingBottom: Math.max(insets.bottom, 16) + TAB_BAR_SPACER }]}>
        <Pressable
          style={({ pressed }) => [s.addBtn, { opacity: pressed ? 0.88 : 1 }]}
          onPress={openAdd}
        >
          <Text style={s.addBtnText}>+ Add a Debt</Text>
        </Pressable>
      </View>

      {/* ── Edit / Add / Adjust modal ── */}
      <EditModal
        visible={editVisible}
        title={modalTitle}
        initial={editTarget ?? {}}
        onSave={handleSave}
        onCancel={() => { setEditVisible(false); setEditTarget(null); }}
      />

      {/* ── Delete confirm modal ── */}
      <DeleteModal
        visible={deleteVisible}
        debtName={deleteTarget?.name ?? ""}
        onCancel={() => { setDeleteVisible(false); setDeleteTarget(null); }}
        onConfirm={handleConfirmDelete}
      />
    </View>
  );
}

// ── Main styles ───────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },

  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingBottom: 12, gap: 10,
  },
  backBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: "#E8E1D4",
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  // Invisible spacer that replaces the back button.
  backSpacer: {
    width: 34, height: 34,
    flexShrink: 0,
  },
  headerTitle: {
    flex: 1, textAlign: "center",
    fontSize: 20, fontFamily: Fonts.extraBold,
    fontWeight: "800", color: DARK, letterSpacing: -0.3,
  },

  listContent: { paddingHorizontal: 16, paddingBottom: 8 },
  emptyContent: { flexGrow: 1 },

  // Total card (gradient background set by LinearGradient)
  totalCard: {
    borderRadius: 22,
    padding: 22, marginBottom: 16,
  },
  totalLabel: {
    fontSize: 13, fontFamily: Fonts.extraBold, fontWeight: "700",
    letterSpacing: 1, color: "#FFF5E4", textTransform: "uppercase", marginBottom: 4,
  },
  totalAmount: {
    fontSize: 36, fontFamily: Fonts.black, fontWeight: "900",
    color: "#FFF5E4", letterSpacing: -1, marginBottom: 10,
  },
  statsRow: { flexDirection: "row", gap: 16 },
  stat: { flex: 1 },
  statVal: { fontSize: 17, fontFamily: Fonts.extraBold, fontWeight: "800", color: "#FFF5E4" },
  statLbl: {
    fontSize: 12, fontFamily: Fonts.semiBold, fontWeight: "600",
    color: "#FFF5E4", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 1,
  },

  // Section header
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingVertical: 5, marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15, fontFamily: Fonts.extraBold, fontWeight: "800",
    color: MUTED, letterSpacing: 0.8, textTransform: "uppercase",
  },
  sortBtn: {
    fontSize: 13, fontFamily: Fonts.bold, fontWeight: "700",
    color: BLUE, paddingHorizontal: 8, paddingVertical: 4,
  },

  // Cards
  card: {
    backgroundColor: "#fff", borderRadius: 18,
    overflow: "hidden", borderWidth: 1.5,
    borderColor: BORDER, marginBottom: 10,
  },
  progTrack: { height: 4, backgroundColor: BORDER, overflow: "hidden" },
  progFill: { height: "100%", backgroundColor: "#22c55e" },
  cardMain: {
    flexDirection: "row", alignItems: "center",
    gap: 14, padding: 18,
  },
  cardIcon: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: BG, alignItems: "center",
    justifyContent: "center", flexShrink: 0,
  },
  cardInfo: { flex: 1, minWidth: 0 },
  cardName: {
    fontSize: 18, fontFamily: Fonts.extraBold, fontWeight: "800", color: DARK,
  },
  cardSub: {
    fontSize: 13, fontFamily: Fonts.semiBold, fontWeight: "600",
    color: MUTED, marginTop: 1,
  },
  cardRight: { alignItems: "flex-end", flexShrink: 0 },
  cardBalance: { fontSize: 18, fontFamily: Fonts.black, fontWeight: "900", color: DARK },
  aprBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, marginTop: 3 },
  aprText: { fontSize: 12, fontFamily: Fonts.bold, fontWeight: "700" },
  chevron: {
    fontSize: 22, color: "#ccc", marginLeft: 6,
    lineHeight: 24,
  },
  chevronOpen: { transform: [{ rotate: "90deg" }] },

  // Actions
  actions: {
    flexDirection: "row", gap: 8,
    paddingHorizontal: 14, paddingBottom: 14,
  },
  actionBtn: { flex: 1, paddingVertical: 11, borderRadius: 14, alignItems: "center" },
  btnEdit:   { backgroundColor: "#e8f0fe" },
  btnAdjust: { backgroundColor: "#fff3cd" },
  btnDelete: { backgroundColor: "#fee2e2" },
  actionText: { fontSize: 14, fontFamily: Fonts.extraBold, fontWeight: "800" },

  // Add button
  addWrap: { paddingHorizontal: 16, paddingTop: 8, backgroundColor: BG },
  addBtn: {
    backgroundColor: BLUE, borderRadius: 16,
    paddingVertical: 18, alignItems: "center", justifyContent: "center",
  },
  addBtnText: {
    fontSize: 18, fontFamily: Fonts.extraBold, fontWeight: "800", color: "#FFF5E4",
  },

  // Log payment button shown under expanded debt card
  markPaidBtn: {
    marginTop: 10,
    marginHorizontal: 12,
    marginBottom: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: BLUE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  markPaidText: {
    fontSize: 16,
    fontFamily: Fonts.extraBold,
    fontWeight: "800",
    color: "#FFF5E4",
  },

  // Empty
  emptyWrap: {
    flex: 1, alignItems: "center", justifyContent: "center",
    paddingHorizontal: 32, paddingVertical: 70,
  },
  emptyEmoji: { fontSize: 64, marginBottom: 18 },
  emptyTitle: {
    fontSize: 26, fontFamily: Fonts.extraBold, fontWeight: "800",
    color: DARK, marginBottom: 8,
  },
  emptySub: {
    fontSize: 17, fontFamily: Fonts.semiBold, fontWeight: "600",
    color: MUTED, textAlign: "center", lineHeight: 22,
  },
});

// ── Edit modal styles ─────────────────────────────────────────────────────────
const editStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: {
    backgroundColor: BG,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20,
  },
  sheetTitle: {
    fontSize: 17, fontFamily: Fonts.extraBold, fontWeight: "900",
    color: DARK, textAlign: "center", marginBottom: 16,
  },
  label: {
    fontSize: 12, fontFamily: Fonts.extraBold, fontWeight: "800",
    color: MUTED, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5,
  },
  input: {
    backgroundColor: "#fff", borderRadius: 12,
    borderWidth: 1.5, borderColor: "#DDD6C8",
    paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 15, fontFamily: Fonts.bold, fontWeight: "700",
    color: DARK, marginBottom: 12,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  inputError: { borderColor: "#DC2626" },
  errorText: {
    marginTop: -6,
    marginBottom: 10,
    fontSize: 11.5,
    fontFamily: Fonts.semiBold,
    color: "#DC2626",
    lineHeight: 14,
  },
  warnText: {
    marginTop: -4,
    marginBottom: 10,
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: WarmContrast.textOnYellowBold,
    lineHeight: 14,
  },
  inputText: { fontSize: 15, fontFamily: Fonts.bold, fontWeight: "700", color: DARK },
  row: { flexDirection: "row", gap: 10 },
  dropdown: {
    backgroundColor: "#fff", borderRadius: 12,
    borderWidth: 1.5, borderColor: "#DDD6C8",
    marginTop: -8, marginBottom: 12, overflow: "hidden",
  },
  dropItem: { paddingHorizontal: 14, paddingVertical: 11 },
  dropItemActive: { backgroundColor: "#EFF6FF" },
  dropItemText: { fontSize: 14, fontFamily: Fonts.semiBold, fontWeight: "600", color: DARK },
  btns: { flexDirection: "row", gap: 10, marginTop: 6 },
  cancelBtn: {
    flex: 1, padding: 13, borderRadius: 12,
    backgroundColor: "#EDE7DA", alignItems: "center",
  },
  cancelText: { fontSize: 15, fontFamily: Fonts.extraBold, fontWeight: "800", color: MUTED },
  saveBtn: {
    flex: 2, padding: 13, borderRadius: 12,
    backgroundColor: BLUE, alignItems: "center",
  },
  saveText: { fontSize: 15, fontFamily: Fonts.extraBold, fontWeight: "800", color: "#FFF5E4" },
});

// ── Delete modal styles ───────────────────────────────────────────────────────
const delStyles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center", justifyContent: "center",
  },
  box: {
    backgroundColor: BG, borderRadius: 20,
    padding: 24, marginHorizontal: 20,
    alignItems: "center", width: "85%",
  },
  icon:    { fontSize: 36, marginBottom: 10 },
  title:   { fontSize: 17, fontFamily: Fonts.extraBold, fontWeight: "900", color: DARK, marginBottom: 6 },
  sub:     { fontSize: 14, fontFamily: Fonts.semiBold, fontWeight: "600", color: MUTED, marginBottom: 20, textAlign: "center" },
  btns:    { flexDirection: "row", gap: 10, width: "100%" },
  cancelBtn: {
    flex: 1, padding: 13, borderRadius: 12,
    backgroundColor: "#EDE7DA", alignItems: "center",
  },
  cancelText: { fontSize: 15, fontFamily: Fonts.extraBold, fontWeight: "800", color: MUTED },
  confirmBtn: {
    flex: 1, padding: 13, borderRadius: 12,
    backgroundColor: "#EF4444", alignItems: "center",
  },
  confirmText: { fontSize: 15, fontFamily: Fonts.extraBold, fontWeight: "800", color: "#FFF5E4" },
});

// ─── ImpactCounter — Live $0.50/day impact card ───────────────────────────────
// 3 big Nunito ExtraBold numbers: Trust Blue · Freedom Green · Dex Orange
// Dex copy changes dynamically based on the user's actual daily extra amount
// All calculations use user's real balance and APR — never hypothetical

import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors, { D } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useIsDark } from "@/context/ThemeContext";
import { useDebts } from "@/context/DebtContext";
import { useCurrency } from "@/context/CurrencyContext";
import { runStrategy } from "@/lib/calculations";

const TRUST_BLUE  = "#C07820";
const FREE_GREEN  = "#C07820";
const DEX_ORANGE  = "#E8600A";

function daysBetween(a: Date, b: Date): number {
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86_400_000));
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

interface ImpactCounterProps {
  compact?: boolean;
}

export function ImpactCounter({ compact = false }: ImpactCounterProps) {
  const { debts, payments, extraPayment } = useDebts();
  const { fmt } = useCurrency();
  const isDark = useIsDark();

  const data = useMemo(() => {
    if (debts.length === 0) {
      return null;
    }

    // ── Extra paid this calendar month ──────────────────────────────────────
    const now        = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const daysElapsed = Math.max(1, now.getDate());

    const extraThisMonth = payments
      .filter((p) => !p.isMissed && new Date(p.date) >= monthStart)
      .reduce((sum, p) => {
        const debt   = debts.find((d) => d.id === p.debtId);
        const minPay = debt?.minimumPayment ?? 0;
        return sum + Math.max(0, p.amount - minPay);
      }, 0);

    // ── Weighted APR across all debts ────────────────────────────────────────
    const totalBalance  = debts.reduce((s, d) => s + d.balance, 0);
    const weightedAPR   = totalBalance > 0
      ? debts.reduce((s, d) => s + d.balance * d.apr, 0) / totalBalance
      : 0;

    // ── Strategy results ─────────────────────────────────────────────────────
    const baseline  = runStrategy(debts, 0, "avalanche");
    const withExtra = runStrategy(debts, extraPayment, "avalanche");

    // ── Interest avoided: extra × (APR/365) × days remaining ─────────────────
    const daysRemaining  = Math.max(0, daysBetween(now, withExtra.payoffDate));
    const effectiveExtra = extraThisMonth > 0 ? extraThisMonth : extraPayment;

    const interestAvoided = effectiveExtra > 0
      ? effectiveExtra * (weightedAPR / 100 / 365) * daysRemaining
      : Math.max(0, baseline.totalInterestPaid - withExtra.totalInterestPaid);

    // ── Days shaved off payoff ────────────────────────────────────────────────
    const rawDaysSaved   = daysBetween(withExtra.payoffDate, baseline.payoffDate);
    const avgMonthlyPay  = Math.max(1, debts.reduce((s, d) => s + d.minimumPayment, 0));
    const approxDays     = Math.max(1, Math.round(effectiveExtra / avgMonthlyPay * 30));
    const daysSaved      = rawDaysSaved > 0 ? rawDaysSaved : (effectiveExtra > 0 ? approxDays : 0);
    const monthsSaved    = Math.max(1, Math.round(daysSaved / 30));

    // ── Daily rate for Dex copy ───────────────────────────────────────────────
    const dailyLogged    = extraThisMonth / daysElapsed;
    const dailyGlobal    = extraPayment / 30;
    const dailyRate      = dailyLogged > 0 ? dailyLogged : dailyGlobal;

    // ── Dex copy ──────────────────────────────────────────────────────────────
    let dexCopy: string;
    if (effectiveExtra === 0) {
      dexCopy = "Primary goal: making every minimum payment on time. That alone prevents late fees. Stay consistent.";
    } else if (dailyRate <= 0.50) {
      const amt = dailyRate > 0 ? fmt(dailyRate) : fmt(0.50);
      dexCopy = `Just ${amt}/day - about one skipped soda. That saves ${monthsSaved}+ months and ${fmt(interestAvoided)} in interest.`;
    } else {
      dexCopy = `${fmt(dailyRate)}/day gives back ${monthsSaved}+ months and saves ${fmt(interestAvoided)} in interest. Keep going!`;
    }

    return {
      extraThisMonth,
      interestAvoided,
      daysSaved,
      newPayoffDate: withExtra.payoffDate,
      dexCopy,
      hasImpact: effectiveExtra > 0,
    };
  }, [debts, payments, extraPayment]);

  if (!data || debts.length === 0) return null;

  const { extraThisMonth, interestAvoided, daysSaved, newPayoffDate, dexCopy, hasImpact } = data;

  const cardBg     = isDark ? "#2C2014" : "#FFFFFF";
  const borderCol  = isDark ? "rgba(192,120,32,0.30)" : "rgba(192,120,32,0.35)";
  const labelCol   = isDark ? "rgba(255,255,255,0.45)" : "#8A6840";
  const dateCol    = isDark ? "rgba(255,255,255,0.7)"  : "#5A4020";
  const dexTextCol = isDark ? "#D4935A" : DEX_ORANGE;
  const dividerCol = isDark ? "rgba(192,120,32,0.20)" : "rgba(192,120,32,0.22)";

  return (
    <View style={[styles.card, compact && styles.cardCompact, { backgroundColor: cardBg, borderColor: borderCol }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerIcon]}>⚡</Text>
        <Text style={[styles.headerTitle, { color: isDark ? "#FFFFFF" : TRUST_BLUE }]}>
          Live Impact
        </Text>
        {hasImpact && (
          <View style={[styles.livePill, { borderColor: TRUST_BLUE + "50", backgroundColor: TRUST_BLUE + "15" }]}>
            <View style={[styles.liveDot, { backgroundColor: FREE_GREEN }]} />
            <Text style={[styles.livePillText, { color: TRUST_BLUE }]}>LIVE</Text>
          </View>
        )}
      </View>

      {/* 3 Stats Row */}
      <View style={styles.statsRow}>
        {/* 1: Extra paid this month — Trust Blue */}
        <View style={styles.statCol}>
          <Text
            style={[styles.statNumber, compact && styles.statNumberCompact, { color: TRUST_BLUE }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.55}
          >
            {fmt(extraThisMonth)}
          </Text>
          <Text style={[styles.statLabel, { color: labelCol }]}>extra{"\n"}this month</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: dividerCol }]} />

        {/* 2: Interest avoided — Freedom Green */}
        <View style={styles.statCol}>
          <Text
            style={[styles.statNumber, compact && styles.statNumberCompact, { color: FREE_GREEN }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.55}
          >
            {fmt(interestAvoided)}
          </Text>
          <Text style={[styles.statLabel, { color: labelCol }]}>interest{"\n"}avoided</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: dividerCol }]} />

        {/* 3: Days shaved — Dex Orange */}
        <View style={styles.statCol}>
          <Text
            style={[styles.statNumber, compact && styles.statNumberCompact, { color: DEX_ORANGE }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.55}
          >
            {daysSaved > 0 ? `${daysSaved.toLocaleString()}d` : "-"}
          </Text>
          <Text style={[styles.statLabel, { color: labelCol }]}>days{"\n"}shaved off</Text>
        </View>
      </View>

      {/* Debt-free date anchor */}
      <View style={[styles.dateRow, { borderTopColor: dividerCol }]}>
        <Text style={[styles.datePre, { color: labelCol }]}>📅 Debt-free date  </Text>
        <Text style={[styles.dateValue, { color: FREE_GREEN }]}>
          {formatShortDate(newPayoffDate)}
        </Text>
      </View>

      {/* Dex copy — hidden in compact mode */}
      {!compact && (
        <View style={[styles.dexCopyWrap, { borderLeftColor: DEX_ORANGE, backgroundColor: isDark ? "#130B05" : "#FFF5EE" }]}>
          <Text style={[styles.dexCopyText, { color: dexTextCol }]}>
            🦊 {dexCopy}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  cardCompact: {
    padding: 12,
    marginBottom: 10,
  },
  statNumberCompact: {
    fontSize: 20,
    lineHeight: 26,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  headerIcon: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    fontWeight: "700",
    flex: 1,
    letterSpacing: 0.2,
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    borderWidth: 1,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  livePillText: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "stretch",
    marginBottom: 14,
  },
  statCol: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 4,
  },
  statNumber: {
    fontSize: 28,
    fontFamily: Fonts.black,
    fontWeight: "900",
    letterSpacing: -0.5,
    lineHeight: 34,
    fontVariant: ["tabular-nums"],
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: Fonts.semiBold,
    fontWeight: "600",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    lineHeight: 14,
  },
  divider: {
    width: 1,
    marginHorizontal: 2,
    borderRadius: 1,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
    marginBottom: 12,
    borderTopWidth: 1,
  },
  datePre: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    fontWeight: "600",
  },
  dateValue: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  dexCopyWrap: {
    borderLeftWidth: 3,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dexCopyText: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    fontWeight: "600",
    lineHeight: 18,
  },
});

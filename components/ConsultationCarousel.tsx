import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Platform,
} from "react-native";
import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { LinearGradient } from "expo-linear-gradient";
import { useDebts } from "@/context/DebtContext";
import { useCurrency } from "@/context/CurrencyContext";
import { isBusinessDebtType } from "@/lib/calculations";
import { RECOMMENDATION_MIN_BALANCE } from "@/lib/MonetizationRules";
import { withAppUtmParams } from "@/lib/utm";

type Card = {
  id: string;
  icon: string;
  title: string;
  desc: string;
  cta: string;
  url: string;
  gradient: [string, string];
};

const MAX_CARDS = 3;

const LIGHT_HEADING = Colors.light.textSecondary;
const LIGHT_DESC = Colors.light.textTertiary;

function openURL(url: string) {
  // Keep this simple: all callers use http(s) links.
  // `withAppUtmParams` is applied at build-time.
  Linking.openURL(url).catch(() => {});
}

export function ConsultationCarousel() {
  const { debts, totalUnsecuredBalance } = useDebts();
  const { fmt } = useCurrency();

  const cards = useMemo<Card[]>(() => {
    const out: Card[] = [];

    const taxDebtBalanceTotal = debts
      .filter((d) => d.debtType === "taxDebt")
      .reduce((s, d) => s + (d.balance ?? 0), 0);

    const businessTotal = debts
      .filter((d) => isBusinessDebtType(d.debtType))
      .reduce((s, d) => s + (d.balance ?? 0), 0);

    const highAprBalance = debts
      .filter((d) => (d.apr || 0) >= 18)
      .reduce((s, d) => s + (d.balance ?? 0), 0);

    // Tax card only when there is real tax-type debt over the recommendation threshold (not context flags alone).
    if (taxDebtBalanceTotal >= RECOMMENDATION_MIN_BALANCE) {
      out.push({
        id: "tax",
        icon: "🏛️",
        title: "Tax debt relief may be available.",
        desc: "IRS and state tax balances may qualify for resolution programs. A free eval takes 5 minutes.",
        cta: "Free tax relief consultation",
        url: "https://www.curadebt.com/taxpps",
        gradient: ["#E67E22", "#F39C12"],
      });
    }

    if (businessTotal >= RECOMMENDATION_MIN_BALANCE) {
      out.push({
        id: "business",
        icon: "🏢",
        title: "Business debt restructuring options exist.",
        desc: "MCA and business debt may have restructuring options that reduce your monthly burden.",
        cta: "Explore business debt options",
        url: "https://www.curadebt.com/biz",
        gradient: [Colors.buttonGreen, Colors.buttonGreenDark],
      });
    }

    if (
      highAprBalance >= RECOMMENDATION_MIN_BALANCE &&
      totalUnsecuredBalance >= RECOMMENDATION_MIN_BALANCE
    ) {
      out.push({
        id: "highApr",
        icon: "📉",
        title: `Could you pay less than ${fmt(totalUnsecuredBalance)}?`,
        desc: "Your cards average high APR. A debt specialist may identify options to reduce what you owe. Free to explore.",
        cta: "Free debt relief consultation",
        url: "https://www.curadebt.com/debtpps",
        gradient: ["#C07820", "#F5C030"],
      });
    }

    const canShowGenericConsolidation = totalUnsecuredBalance >= RECOMMENDATION_MIN_BALANCE;
    if (canShowGenericConsolidation && out.length < MAX_CARDS && !out.some((c) => c.id === "consolidation")) {
      out.push({
        id: "consolidation",
        icon: "💡",
        title: "Could a lower-rate loan help?",
        desc: "Consolidating at a lower rate could reduce your monthly interest. Worth a free check.",
        cta: "Explore consolidation options",
        url: "https://www.curadebt.com/debtpps",
        gradient: ["#1A6FC4", "#0D5BAE"],
      });
    }

    return out.slice(0, MAX_CARDS);
  }, [debts, totalUnsecuredBalance, fmt]);

  if (cards.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.header}>Free consultations</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroller}
        decelerationRate="fast"
      >
        {cards.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => openURL(withAppUtmParams(c.url))}
            style={({ pressed }) => [styles.card, { opacity: pressed ? 0.9 : 1 }]}
          >
            <View style={styles.cardInner}>
              <View style={styles.iconWrap}>
                <Text style={{ fontSize: 17 }}>{c.icon}</Text>
              </View>
              <Text style={styles.title} numberOfLines={2}>
                {c.title}
              </Text>
              <Text style={styles.desc} numberOfLines={3}>
                {c.desc}
              </Text>
              <View style={styles.ctaRow}>
                <LinearGradient colors={c.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaBtn}>
                  <Text style={styles.ctaText}>{c.cta}</Text>
                  <Text style={styles.ctaArrow}>→</Text>
                </LinearGradient>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
    width: "100%",
    paddingLeft: 18,
    paddingRight: 0,
  },
  header: {
    fontSize: 14,
    fontFamily: Fonts.extraBold,
    fontWeight: "700",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: LIGHT_HEADING,
    marginBottom: 8,
  },
  scroller: {
    paddingRight: 18,
    gap: 12,
    alignItems: "stretch",
  },
  card: {
    width: 280,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E0D8CE",
    overflow: "hidden",
    // Make cards a bit taller for better readability on Home.
    minHeight: 220,
  },
  cardInner: {
    paddingHorizontal: 14,
    paddingVertical: 16,
    gap: 7,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#FAFAF8",
    borderWidth: 1,
    borderColor: "#E4DFD6",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 14,
    fontFamily: Fonts.extraBold,
    fontWeight: "900",
    color: "#1A0A00",
    lineHeight: 19,
  },
  desc: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    fontWeight: "600",
    color: LIGHT_DESC,
    lineHeight: 18,
  },
  ctaRow: {
    marginTop: 4,
  },
  ctaBtn: {
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ctaText: {
    fontSize: 13,
    fontFamily: Fonts.extraBold,
    fontWeight: "900",
    color: "#FFFFFF",
    flexShrink: 1,
    marginRight: 8,
  },
  ctaArrow: {
    fontSize: 15,
    color: "#FFFFFF",
    fontFamily: Fonts.black,
  },
});


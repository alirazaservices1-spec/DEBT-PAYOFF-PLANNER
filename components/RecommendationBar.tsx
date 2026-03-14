/**
 * Horizontal recommendation strip — full card including CTA stays inside the box (no clipping).
 */
import React from "react";
import { View, Text, ScrollView, Pressable, useColorScheme, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import Colors from "@/constants/colors";
import { useDebts } from "@/context/DebtContext";
import { getRecommendations } from "@/lib/MonetizationRules";
import { withAppUtmParams } from "@/lib/utm";
import type { Debt } from "@/lib/calculations";

const AFFILIATE_URLS: Record<string, string> = {
  TAX_RELIEF: "https://lp.curadebt.com/irs-fresh-start/",
  BUSINESS_RELIEF: "https://www.curadebt.com/biz",
  CONSOLIDATION: "https://www.curadebt.com/debtpps",
  DEBT_RELIEF: "https://lp.curadebt.com/curadebtlp/index.html",
};

export function RecommendationBar({ debts: debtsProp }: { debts?: Debt[] } = {}) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const { debts: ctxDebts } = useDebts();
  const debts = debtsProp ?? ctxDebts;

  const recDebts = debts.map((d) => ({
    id: d.id,
    name: d.name,
    balance: d.balance,
    apr: d.apr,
    category: d.debtType,
    debtType: d.debtType,
    isSecured: d.isSecured,
  }));
  const recs = getRecommendations(recDebts, "dashboard");
  if (recs.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <Text
        style={[
          styles.sectionHeader,
          { color: C.textSecondary },
        ]}
      >
        PERSONALIZED RECOMMENDATIONS:
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {recs.map((r) => {
          const url = AFFILIATE_URLS[r.affiliateKey] ?? AFFILIATE_URLS.DEBT_RELIEF;
          const linkText = r.linkText ?? "Check if you qualify.";
          return (
            <Pressable
              key={r.id}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: isDark ? "rgba(46,204,113,0.12)" : "rgba(46,204,113,0.1)",
                  borderColor: isDark ? "rgba(46,204,113,0.25)" : "rgba(46,204,113,0.35)",
                  opacity: pressed ? 0.88 : 1,
                },
              ]}
            >
              <View style={styles.cardInner}>
                <View style={styles.iconAndTextRow}>
                  <Text style={styles.inlineIcon}>{r.icon}</Text>
                  <View style={styles.bodyWrap}>
                    <Text style={[styles.bodyText, { color: C.text }]} numberOfLines={5}>
                      {r.body}{" "}
                      <Text
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          Linking.openURL(withAppUtmParams(url));
                        }}
                        style={[styles.inlineLink, { color: Colors.primary }]}
                      >
                        {linkText}
                      </Text>
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 10,
    // No maxHeight — was clipping bottom of card (CTA half outside)
  },
  sectionHeader: {
    fontSize: 12,
    letterSpacing: 1.2,
    fontWeight: "600",
    textTransform: "uppercase",
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 6,
  },
  scrollContent: {
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "flex-start",
  },
  card: {
    width: 280,
    maxWidth: "85%",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardInner: {
    paddingLeft: 14,
    paddingRight: 16,
    paddingTop: 12,
    paddingBottom: 14,
  },
  iconAndTextRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 6,
  },
  inlineIcon: {
    fontSize: 16,
    marginTop: 1,
  },
  bodyWrap: {
    flex: 1,
    minWidth: 0,
  },
  bodyText: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 17,
  },
  inlineLink: {
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});

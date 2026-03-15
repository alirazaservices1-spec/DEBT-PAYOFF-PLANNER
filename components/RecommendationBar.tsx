/**
 * Horizontal recommendation strip — full card including CTA stays inside the box.
 * Cards can be permanently dismissed (stored in AsyncStorage).
 */
import React, { useEffect, useRef, useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, useColorScheme, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useDebts } from "@/context/DebtContext";
import { getRecommendations } from "@/lib/MonetizationRules";
import { withAppUtmParams } from "@/lib/utm";
import type { Debt } from "@/lib/calculations";

const HIDDEN_KEY = "@hidden_rec_cards";

const MEANS_TEST_URL = "https://lp.curadebt.com/bankruptcy-means-test/";

const AFFILIATE_URLS: Record<string, string> = {
  TAX_RELIEF: "https://lp.curadebt.com/irs-fresh-start/",
  BUSINESS_RELIEF: "https://www.curadebt.com/biz",
  CONSOLIDATION: "https://www.curadebt.com/debtpps",
  DEBT_RELIEF: "https://lp.curadebt.com/curadebtlp/index.html",
  MEANS_TEST: MEANS_TEST_URL,
};

async function loadHiddenIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(HIDDEN_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveHiddenIds(ids: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(HIDDEN_KEY, JSON.stringify(ids));
  } catch {}
}

function DismissibleCard({
  id,
  icon,
  body,
  linkText,
  url,
  isDark,
  C,
  onDismiss,
}: {
  id: string;
  icon: string;
  body: string;
  linkText: string;
  url: string;
  isDark: boolean;
  C: typeof Colors.light;
  onDismiss: (id: string) => void;
}) {
  const opacity = useSharedValue(1);
  const scaleY = useSharedValue(1);
  const width = useSharedValue(280);
  const marginRight = useSharedValue(10);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scaleY: scaleY.value }],
    width: width.value,
    marginRight: marginRight.value,
    overflow: "hidden",
  }));

  const handleDismiss = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    opacity.value = withTiming(0, { duration: 200 });
    scaleY.value = withTiming(0, { duration: 250 });
    width.value = withSpring(0, { damping: 20, stiffness: 200 });
    marginRight.value = withTiming(0, { duration: 250 }, (finished) => {
      if (finished) runOnJS(onDismiss)(id);
    });
  }, [id, onDismiss]);

  return (
    <Animated.View style={containerStyle}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: isDark ? "rgba(46,204,113,0.12)" : "rgba(46,204,113,0.1)",
            borderColor: isDark ? "rgba(46,204,113,0.25)" : "rgba(31,78,140,0.30)",
            width: 280,
          },
        ]}
      >
        <View style={styles.cardInner}>
          <View style={styles.topRow}>
            <View style={styles.iconAndTextRow}>
              <Text style={styles.inlineIcon}>{icon}</Text>
              <View style={styles.bodyWrap}>
                <Text style={[styles.bodyText, { color: C.text }]} numberOfLines={5}>
                  {body}{" "}
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
            <Pressable
              onPress={handleDismiss}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
              style={styles.dismissBtn}
            >
              <Text style={[styles.dismissText, { color: C.textSecondary }]}>✕</Text>
            </Pressable>
          </View>
          <Pressable onPress={handleDismiss} style={[styles.doneBtn, { borderColor: C.border }]}>
            <Text style={[styles.doneBtnText, { color: C.textSecondary }]}>Done — Hide this</Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

export function RecommendationBar({ debts: debtsProp }: { debts?: Debt[] } = {}) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const { debts: ctxDebts } = useDebts();
  const debts = debtsProp ?? ctxDebts;

  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadHiddenIds().then((ids) => {
      setHiddenIds(ids);
      setLoaded(true);
    });
  }, []);

  const recDebts = debts.map((d) => ({
    id: d.id,
    name: d.name,
    balance: d.balance,
    apr: d.apr,
    category: d.debtType,
    debtType: d.debtType,
    isSecured: d.isSecured,
  }));

  const allRecs = getRecommendations(recDebts, "dashboard");
  const visibleRecs = allRecs.filter((r) => !hiddenIds.includes(r.id));

  const handleDismiss = useCallback(async (id: string) => {
    const updated = [...hiddenIds, id];
    setHiddenIds(updated);
    await saveHiddenIds(updated);
  }, [hiddenIds]);

  if (!loaded || visibleRecs.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.sectionHeader, { color: C.textSecondary }]}>
        PERSONALIZED RECOMMENDATIONS:
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {visibleRecs.map((r) => {
          const url = AFFILIATE_URLS[r.affiliateKey] ?? AFFILIATE_URLS.DEBT_RELIEF;
          const linkText = r.linkText ?? "Check if you qualify.";
          return (
            <DismissibleCard
              key={r.id}
              id={r.id}
              icon={r.icon}
              body={r.body}
              linkText={linkText}
              url={url}
              isDark={isDark}
              C={C}
              onDismiss={handleDismiss}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 12,
    letterSpacing: 1.2,
    fontFamily: Fonts.semiBold, fontWeight: "600",
    textTransform: "uppercase",
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 6,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "flex-start",
  },
  card: {
    maxWidth: "95%",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardInner: {
    paddingLeft: 14,
    paddingRight: 10,
    paddingTop: 12,
    paddingBottom: 10,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  iconAndTextRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
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
    fontFamily: Fonts.semiBold, fontWeight: "600",
    lineHeight: 17,
  },
  inlineLink: {
    fontFamily: Fonts.bold, fontWeight: "700",
    textDecorationLine: "underline",
  },
  dismissBtn: {
    paddingLeft: 8,
    paddingTop: 2,
  },
  dismissText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold, fontWeight: "600",
  },
  doneBtn: {
    alignSelf: "flex-start",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 2,
  },
  doneBtnText: {
    fontSize: 11,
    fontFamily: Fonts.semiBold, fontWeight: "600",
  },
});

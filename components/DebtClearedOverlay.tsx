import { Fonts } from "@/constants/fonts";
import React, { useEffect, useRef } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  Share,
  Animated as RNAnimated,
} from "react-native";
import {
  default as ReAnimated,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  Easing,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useGame } from "@/context/GameContext";
import { useDebts } from "@/context/DebtContext";
import { runStrategy } from "@/lib/calculations";
import { DexDayComplete } from "@/components/DexDayComplete";
import { LinearGradient } from "expo-linear-gradient";

type Particle = { x: number; y: number; delay: number; color: string; size: number; isCircle: boolean; rotation: number };
const COLORS = ["#F2C040", "#D08A10", "#EF9F27", "#2D5BE3", "#85B7EB", "#1D9E6A", "#5DCAA5", "#E07060", "#FFFFFF", "#C4A878", "#FAC775", "#E87070"];
function makeParticles(n: number): Particle[] {
  return Array.from({ length: n }, (_, i) => ({
    x: Math.random() * 390,
    y: Math.random() * -250,
    delay: Math.random() * 800,
    color: COLORS[i % COLORS.length],
    size: 4 + Math.random() * 8.5,
    isCircle: Math.random() > 0.5,
    rotation: Math.random() * 360,
  }));
}
const PARTICLES = makeParticles(60);

function Confetti({ p }: { p: Particle }) {
  const ty = useSharedValue(p.y);
  const op = useSharedValue(0);
  const rot = useSharedValue(p.rotation);
  useEffect(() => {
    op.value  = withDelay(p.delay, withTiming(1, { duration: 250 }));
    ty.value  = withDelay(p.delay, withTiming(940, { duration: 2600, easing: Easing.out(Easing.quad) }));
    rot.value = withDelay(p.delay, withRepeat(withTiming(p.rotation + 360, { duration: 700 }), -1, false));
  }, []);
  const s = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [{ translateY: ty.value }, { rotate: `${rot.value}deg` }],
  }));
  return (
    <ReAnimated.View
      style={[
        s,
        {
          position: "absolute",
          left: p.x,
          top: 0,
          width: p.size,
          height: p.isCircle ? p.size : p.size * 0.8,
          backgroundColor: p.color,
          borderRadius: p.isCircle ? p.size / 2 : 2,
        },
      ]}
    />
  );
}

interface Props {
  visible: boolean;
  debtName?: string;
  totalInterestSaved?: number;
  monthsAhead?: number;
  onDismiss: () => void;
}

export function DebtClearedOverlay({ visible, debtName, totalInterestSaved: propInterestSaved, monthsAhead: propMonthsAhead, onDismiss }: Props) {
  const { streakCount } = useGame();
  const { debts } = useDebts();
  const streakDays = Math.max(1, streakCount ?? 0);

  const baseline = runStrategy(debts, 0, "avalanche");
  const optimized = runStrategy(debts, 0, "avalanche");
  const totalInterestSaved = propInterestSaved ?? Math.max(0, baseline.totalInterestPaid - optimized.totalInterestPaid);
  const monthsAhead = propMonthsAhead ?? Math.max(0, baseline.totalMonths - optimized.totalMonths);

  const sparkle = useRef(new RNAnimated.Value(0)).current;
  const dexFloat = useRef(new RNAnimated.Value(0)).current;
  const riseIn = useRef(new RNAnimated.Value(0)).current;

  const nextDebt =
    debts.find((d) => d.name !== debtName && d.balance > 0) ??
    debts.find((d) => d.balance > 0) ??
    null;
  const nextDebtName = nextDebt?.name ?? "Next Debt";
  const nextDebtBalance = nextDebt?.balance ?? 0;
  const nextDebtMonths = nextDebt ? Math.min(999, runStrategy([nextDebt], 0, "avalanche").totalMonths) : 0;
  const nextDebtProgress = nextDebt && nextDebt.balance > 0 ? 0.28 : 0.12;
  const litDots = Math.max(0, Math.min(14, streakDays));

  useEffect(() => {
    if (visible) {
      sparkle.setValue(0);
      riseIn.setValue(0);
      RNAnimated.timing(riseIn, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.timing(sparkle, { toValue: 1, duration: 1000, useNativeDriver: true }),
          RNAnimated.timing(sparkle, { toValue: 0, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
      RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.timing(dexFloat, { toValue: 1, duration: 850, useNativeDriver: true }),
          RNAnimated.timing(dexFloat, { toValue: 0, duration: 850, useNativeDriver: true }),
        ])
      ).start();
    }
    return () => {
      sparkle.stopAnimation();
      dexFloat.stopAnimation();
    };
  }, [visible]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I just paid off ${debtName ? `"${debtName}"` : "a debt"} on DebtPath. Debt-free momentum!`,
      });
    } catch (_) {}
  };

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onDismiss}>
      <View style={styles.container}>
        <View style={styles.phone}>
          <View style={styles.appBg}>
            <View style={styles.appStatusBar}>
              <Text style={styles.appStatusText}>5:03</Text>
              <Text style={styles.appStatusBrand}>DEBTPATH</Text>
              <Text style={styles.appStatusText}>47%</Text>
            </View>
            <View style={styles.appBody}>
              <Text style={styles.appHeading}>Settings</Text>
              <Text style={styles.appSub}>Preferences & account</Text>
              <View style={styles.appRow}>
                <View style={styles.appRowIcon}><Text style={styles.appRowIconText}>🏆</Text></View>
                <View>
                  <Text style={styles.appRowText}>Streak milestones</Text>
                  <Text style={styles.appRowSub}>Day 1 · Day 3 · Day 7 · Day 14</Text>
                </View>
              </View>
              <View style={styles.appRow}>
                <View style={styles.appRowIcon}><Text style={styles.appRowIconText}>⚡</Text></View>
                <View>
                  <Text style={styles.appRowText}>Quick reward toasts</Text>
                  <Text style={styles.appRowSub}>+50 XP · Freeze save +75 XP</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.scrim} />

          <View style={styles.overlay}>
            <LinearGradient
              colors={["#FFF8E8", "#F4EDD8", "#F8F4EC", "#FFFFFF"]}
              locations={[0, 0.6, 0.85, 1]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.hero}
            >
              <View style={styles.burstRing} />
              <View style={styles.burstRing2} />

              <View style={StyleSheet.absoluteFill} pointerEvents="none">
                {PARTICLES.map((p, i) => <Confetti key={i} p={p} />)}
              </View>

              <View style={styles.dexWrap}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <RNAnimated.Text
                    key={i}
                    style={[
                      styles.star,
                      STAR_POS[i],
                      {
                        opacity: sparkle.interpolate({ inputRange: [0, 1], outputRange: [0.25, 1] }),
                        transform: [{ scale: sparkle.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.2] }) }],
                      },
                    ]}
                  >
                    {"✦"}
                  </RNAnimated.Text>
                ))}
                <RNAnimated.View style={[styles.dexShadow, { transform: [{ scaleX: dexFloat.interpolate({ inputRange: [0, 1], outputRange: [1, 0.5] }) }] }]} />
                <RNAnimated.View style={{ transform: [{ translateY: dexFloat.interpolate({ inputRange: [0, 1], outputRange: [0, -18] }) }, { scale: dexFloat.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }] }}>
                  <DexDayComplete state="congratulating" />
                </RNAnimated.View>
              </View>

              <RNAnimated.View style={{ opacity: riseIn, transform: [{ scale: riseIn.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }, { translateY: riseIn.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}>
                <View style={styles.headlineWrap}>
                  <Text style={styles.headlinePre}>{"🎉 Congratulations!"}</Text>
                  <Text style={styles.headline}>
                    DEBT{"\n"}
                    <Text style={styles.headlineEm}>FREE</Text>
                  </Text>
                </View>
              </RNAnimated.View>

              <View style={styles.clearedPill}>
                <View style={styles.checkCircle}>
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                </View>
                <Text style={styles.clearedPillText}>{`"${debtName ?? "Chase Card"}" is done!`}</Text>
              </View>
            </LinearGradient>

            <View style={styles.bottom}>
              <View style={styles.xpRow}>
                <View style={styles.xpChip}>
                  <Text style={styles.chipIcon}>⚡</Text>
                  <Text style={styles.chipVal}>+150 XP</Text>
                  <Text style={styles.chipDesc}>Debt cleared</Text>
                </View>
                <View style={styles.xpChip}>
                  <Text style={styles.chipIcon}>🔥</Text>
                  <Text style={styles.chipVal}>+25 XP</Text>
                  <Text style={styles.chipDesc}>Streak bonus</Text>
                </View>
                <View style={styles.xpChip}>
                  <Text style={styles.chipIcon}>🎖️</Text>
                  <Text style={styles.chipVal}>Badge</Text>
                  <Text style={styles.chipDesc}>Debt Slayer</Text>
                </View>
              </View>

              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <View style={styles.infoIconBox}><Text style={styles.infoIconTxt}>🔥</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoTitle}>{`${streakDays}-day streak — keep it alive!`}</Text>
                    <Text style={styles.infoSub}>Log your next action before midnight</Text>
                    <View style={styles.streakDots}>
                      {Array.from({ length: 16 }, (_, i) => (
                        <View key={i} style={[styles.dot, i >= litDots && styles.dotDim]} />
                      ))}
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <View style={styles.infoIconBox}><Text style={styles.infoIconTxt}>🎯</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nextTargetKicker}>Next target</Text>
                    <Text style={styles.infoTitle}>{nextDebtName || "Student Loan"}</Text>
                    <Text style={styles.infoSub}>
                      {`$${Math.round(nextDebtBalance).toLocaleString("en-US")} remaining · est. ${Math.max(1, nextDebtMonths || monthsAhead || 8)} months`}
                    </Text>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${Math.round(nextDebtProgress * 100)}%` }]} />
                    </View>
                  </View>
                </View>
              </View>

              <Pressable style={styles.ctaBtn} onPress={onDismiss}>
                <Text style={styles.ctaText}>Continue to next debt {"\u2192"}</Text>
              </Pressable>

              <View style={styles.bottomFooter}>
                <View style={styles.shareRow}>
                  <Pressable style={styles.shareBtn} onPress={handleShare}>
                    <Ionicons name="share-social-outline" size={14} color="#7A6030" />
                    <Text style={styles.shareBtnText}>Share win</Text>
                  </Pressable>
                  <Pressable style={styles.shareBtn} onPress={handleShare}>
                    <Ionicons name="download-outline" size={14} color="#7A6030" />
                    <Text style={styles.shareBtnText}>Save certificate</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const STAR_POS = [
  { top: 10, left: 30, fontSize: 18 },
  { top: 0, left: 100, fontSize: 13 },
  { top: 10, right: 28, fontSize: 18 },
  { top: 55, left: 10, fontSize: 13 },
  { top: 55, right: 8, fontSize: 13 },
] as const;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#BFB49A", padding: 0 },
  phone: {
    width: "100%",
    height: "100%",
    borderRadius: 0,
    borderWidth: 0,
    overflow: "hidden",
    backgroundColor: "#F4EDD8",
  },
  appBg: { ...StyleSheet.absoluteFillObject, backgroundColor: "#F4EDD8" },
  appStatusBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 16, paddingHorizontal: 26 },
  appStatusText: { fontSize: 14, fontFamily: Fonts.bold, color: "#1C1F2E" },
  appStatusBrand: { fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase", color: "#1C1F2E", fontFamily: Fonts.bold },
  appBody: { paddingHorizontal: 24, paddingTop: 18 },
  appHeading: { fontFamily: Fonts.extraBold, fontSize: 30, color: "#1C1F2E", marginBottom: 4 },
  appSub: { fontFamily: Fonts.semiBold, fontSize: 15, color: "#1C1F2E", marginBottom: 16 },
  appRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: "rgba(208,138,16,0.1)" },
  appRowIcon: { width: 34, height: 34, borderRadius: 9, backgroundColor: "rgba(208,138,16,0.1)", alignItems: "center", justifyContent: "center" },
  appRowIconText: { fontSize: 16 },
  appRowText: { fontFamily: Fonts.semiBold, fontSize: 15, color: "#1C1F2E" },
  appRowSub: { fontFamily: Fonts.regular, fontSize: 13, color: "#1C1F2E" },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15,10,2,0.55)",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
  },
  hero: {
    width: "100%",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 24,
    position: "relative",
    zIndex: 6,
  },
  burstRing: {
    position: "absolute",
    top: 52,
    left: "50%",
    width: 180,
    height: 180,
    borderRadius: 999,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(208,138,16,0.18)",
    marginLeft: -90,
  },
  burstRing2: {
    position: "absolute",
    top: 68,
    left: "50%",
    width: 152,
    height: 152,
    borderRadius: 999,
    backgroundColor: "rgba(242,192,64,0.09)",
    marginLeft: -76,
  },
  dexWrap: { marginTop: 44, width: 150, alignItems: "center", justifyContent: "center", position: "relative", zIndex: 6 },
  dexShadow: { position: "absolute", bottom: 0, width: 90, height: 12, borderRadius: 999, backgroundColor: "rgba(160,100,8,0.18)" },
  star: { position: "absolute", color: "#D08A10", zIndex: 7 },
  headlineWrap: { alignItems: "center", marginTop: 6, zIndex: 7 },
  headlinePre: { fontFamily: Fonts.bold, fontSize: 13, color: "#D08A10", letterSpacing: 2.2, textTransform: "uppercase", marginBottom: 2 },
  headline: {
    fontFamily: Fonts.serif,
    fontSize: 70,
    lineHeight: 72,
    textAlign: "center",
    color: "#1C1F2E",
    letterSpacing: -2,
  },
  headlineEm: { fontStyle: "italic", color: "#C88008" },
  clearedPill: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#1D9E6A",
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 18,
    zIndex: 7,
  },
  checkCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" },
  clearedPillText: { fontFamily: Fonts.bold, fontSize: 16, color: "#FFFFFF" },
  bottom: { width: "100%", flex: 1, backgroundColor: "#FFFFFF", paddingHorizontal: 16, paddingTop: 10, alignItems: "center" },
  xpRow: { width: "100%", flexDirection: "row", gap: 8, marginTop: 0 },
  xpChip: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9F6EE",
    borderWidth: 1.5,
    borderColor: "rgba(208,138,16,0.16)",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  chipIcon: { fontSize: 21 },
  chipVal: { fontFamily: Fonts.extraBold, fontSize: 14.5, color: "#C88008", marginTop: 2 },
  chipDesc: { fontFamily: Fonts.semiBold, fontSize: 12, color: "#1C1F2E" },
  infoCard: {
    width: "100%",
    marginTop: 9,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(208,138,16,0.12)",
    overflow: "hidden",
    backgroundColor: "#FDFAF2",
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  infoIconBox: { width: 38, height: 38, borderRadius: 11, backgroundColor: "#F4EDD8", alignItems: "center", justifyContent: "center" },
  infoIconTxt: { fontSize: 19 },
  infoTitle: { fontFamily: Fonts.bold, fontSize: 15, color: "#1C1F2E" },
  infoSub: { fontFamily: Fonts.semiBold, fontSize: 13, color: "#1C1F2E", marginTop: 2 },
  nextTargetKicker: { fontFamily: Fonts.bold, fontSize: 12, color: "#1C1F2E", letterSpacing: 1.3, textTransform: "uppercase", marginBottom: 2 },
  streakDots: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 5 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#F2C040" },
  dotDim: { backgroundColor: "rgba(208,138,16,0.18)" },
  progressTrack: { width: "100%", height: 5, borderRadius: 5, backgroundColor: "rgba(208,138,16,0.12)", marginTop: 8, overflow: "hidden" },
  progressFill: { height: 5, borderRadius: 5, backgroundColor: "#D08A10" },
  ctaBtn: { width: "100%", marginTop: 10, backgroundColor: "#2D5BE3", borderRadius: 16, paddingVertical: 16, alignItems: "center", justifyContent: "center" },
  ctaText: { fontFamily: Fonts.extraBold, fontSize: 17, color: "#FFFFFF" },
  bottomFooter: { width: "100%", marginTop: 9, alignItems: "center", paddingBottom: 0 },
  shareRow: { width: "100%", flexDirection: "row", gap: 10 },
  shareBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "#F9F6EE",
    borderWidth: 1.5,
    borderColor: "rgba(208,138,16,0.16)",
    borderRadius: 13,
    paddingVertical: 11,
    paddingHorizontal: 10,
  },
  shareBtnText: { fontFamily: Fonts.semiBold, fontSize: 15, color: "#1C1F2E" },
});

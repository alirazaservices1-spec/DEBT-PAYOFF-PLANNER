import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  Dimensions,
  BackHandler,
  Platform,
  ScrollView,
  Modal,
} from "react-native";
import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGame, STREAK_MILESTONES, XP_REWARDS } from "@/context/GameContext";
import { Fonts } from "@/constants/fonts";
import { useDebts } from "@/context/DebtContext";
import {
  markDayCompleteAcknowledgedToday,
  setHomeWrappedFeedbackPending,
} from "@/lib/dayCompleteGate";
import { scheduleNextDayActivitiesReminderAfterAck } from "@/lib/dayActivitiesReminder";
import { useStreakReminder } from "@/context/StreakReminderContext";
import { DexDayComplete, DexDCState } from "@/components/DexDayComplete";
import { getDailyQuote } from "@/constants/dailyQuotes";
import { LEVELS_DATA } from "@/constants/levelsData";

const { width: SCREEN_W } = Dimensions.get("window");

// ─── Colors ───────────────────────────────────────────────────────────────────
const BG        = "#1B1050";
const PURPLE_LT = "#C0A8FF";
const AMBER     = "#F5C842";
const AMBER_BTN = "#C07820";
const WHITE     = "#FFFFFF";
const ROW_BG    = "rgba(255,255,255,0.09)";
const BADGE_BG  = "rgba(255,255,255,0.10)";
const BADGE_BD  = "rgba(255,255,255,0.22)";

// ─── Message data (Dex state + headline per day) ──────────────────────────────
interface Message {
  dex: DexDCState;
  headlinePlain: string;
  headlineEm: string;
}

const MESSAGES: Message[] = [
  { dex: "congratulating", headlinePlain: "You crushed it",    headlineEm: "today!"           },
  { dex: "letsGo",         headlinePlain: "Every payment",     headlineEm: "moves the needle." },
  { dex: "crushingIt",     headlinePlain: "You're",            headlineEm: "executing."        },
  { dex: "highFive",       headlinePlain: "Show up &",         headlineEm: "keep winning."     },
  { dex: "believeInYou",   headlinePlain: "Keep the",          headlineEm: "streak alive."     },
  { dex: "keepGoing",      headlinePlain: "Nothing can",       headlineEm: "shake you."        },
  { dex: "youveGotThis",   headlinePlain: "This is your",      headlineEm: "identity now."     },
  { dex: "imWithYou",      headlinePlain: "You came back today.", headlineEm: "That's real progress." },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getDayOfYear(): number {
  const now = new Date();
  return Math.floor(
    (Date.now() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  );
}

// ─── Confetti ─────────────────────────────────────────────────────────────────
const CONFETTI_PIECES = [
  { leftPct: 0.12, topPx: 40, color: AMBER,     w: 9,  h: 9,  dur: 3200, delay: 100 },
  { leftPct: 0.26, topPx: 20, color: "#7DE8B0",  w: 6,  h: 13, dur: 3500, delay: 300 },
  { leftPct: 0.56, topPx: 28, color: "#FF8080",  w: 10, h: 6,  dur: 2900, delay: 50  },
  { leftPct: 0.72, topPx: 12, color: PURPLE_LT,  w: 8,  h: 8,  dur: 3600, delay: 400 },
  { leftPct: 0.86, topPx: 40, color: WHITE,       w: 9,  h: 9,  dur: 3000, delay: 200 },
  { leftPct: 0.06, topPx: 80, color: AMBER,       w: 6,  h: 11, dur: 3300, delay: 650 },
  { leftPct: 0.44, topPx: 8,  color: "#FF8080",   w: 8,  h: 6,  dur: 2800, delay: 150 },
  { leftPct: 0.91, topPx: 60, color: "#7DE8B0",   w: 7,  h: 7,  dur: 3400, delay: 500 },
];

function ConfettiPiece({ leftPct, topPx, color, w, h, dur, delay }: typeof CONFETTI_PIECES[0]) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: dur, delay, useNativeDriver: true, easing: Easing.linear }).start();
  }, []);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 340] });
  const rotate     = anim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "500deg"] });
  const opacity    = anim.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 1, 0] });
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: SCREEN_W * leftPct, top: topPx }}>
      <Animated.View style={{ width: w, height: h, borderRadius: 2, backgroundColor: color, transform: [{ translateY }, { rotate }], opacity }} />
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function DayCompleteScreen() {
  const insets = useSafeAreaInsets();
  const { totalXp, streakCount, hasStreakShield, level } = useGame();
  const { streakReminderEnabled } = useStreakReminder();
  const { debts } = useDebts();
  const { debtId, previewDex } = useLocalSearchParams<{ closeTo?: string; debtId?: string; previewDex?: string }>();
  const [showDefinitions, setShowDefinitions] = React.useState(false);

  // Pick today's message and quote
  const dayOfYear = getDayOfYear();
  const defaultMsg = MESSAGES[dayOfYear % MESSAGES.length];
  const previewDexState: DexDCState | null =
    previewDex &&
    [
      "congratulating",
      "letsGo",
      "crushingIt",
      "highFive",
      "believeInYou",
      "keepGoing",
      "youveGotThis",
      "imWithYou",
    ].includes(previewDex)
      ? (previewDex as DexDCState)
      : null;
  const msg: Message = previewDexState
    ? { dex: previewDexState, headlinePlain: "Missed a day?", headlineEm: "I'm with you." }
    : defaultMsg;
  const quote     = getDailyQuote(dayOfYear).text;

  // Debt name for the personalised line
  const debt = debtId ? debts.find((d) => d.id === debtId) : debts[0];
  const debtLabel = debt?.name ?? "freedom";

  // ── Navigation ──
  const handleSeeTomorrow = async () => {
    try {
      await markDayCompleteAcknowledgedToday();
      await scheduleNextDayActivitiesReminderAfterAck(streakCount, streakReminderEnabled);
      if (Platform.OS !== "web") { BackHandler.exitApp(); return; }
      await setHomeWrappedFeedbackPending("success");
      router.replace("/(tabs)/dashboard");
    } catch {
      await setHomeWrappedFeedbackPending("error");
      router.replace("/(tabs)/dashboard");
    }
  };

  const handleGoToMenu = async () => {
    try {
      await markDayCompleteAcknowledgedToday();
      await scheduleNextDayActivitiesReminderAfterAck(streakCount, streakReminderEnabled);
      await setHomeWrappedFeedbackPending("success");
      router.replace("/(tabs)/dashboard");
    } catch {
      await setHomeWrappedFeedbackPending("error");
      router.replace("/(tabs)/dashboard");
    }
  };

  // ── Entrance animations ──
  const badgeAnim = useRef(new Animated.Value(0)).current;
  const dexAnim   = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const cardAnim  = useRef(new Animated.Value(0)).current;
  const totalAnim = useRef(new Animated.Value(0)).current;
  const ctaAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fadeUp = (a: Animated.Value, delay: number) =>
      Animated.timing(a, { toValue: 1, duration: 500, delay, useNativeDriver: true, easing: Easing.out(Easing.cubic) });
    const popIn = (a: Animated.Value, delay: number) =>
      Animated.spring(a, { toValue: 1, delay, useNativeDriver: true, damping: 10, stiffness: 200 });

    Animated.parallel([
      popIn(badgeAnim, 100),
      popIn(dexAnim,   200),
      fadeUp(titleAnim, 820),
      fadeUp(cardAnim,  1000),
      fadeUp(totalAnim, 1200),
      fadeUp(ctaAnim,   1400),
    ]).start();
  }, []);

  const streakForDisplay = Math.max(streakCount, 1);
  const xpEarned = XP_REWARDS.LOG_PAYMENT + XP_REWARDS.DAILY_STREAK;
  const upcomingStreakBonuses = Object.entries(STREAK_MILESTONES)
    .map(([day, xp]) => ({ day: Number(day), xp }))
    .filter((m) => Number.isFinite(m.day) && m.day > streakForDisplay)
    .sort((a, b) => a.day - b.day)
    .slice(0, 2);
  const freezeBonusChips = [
    { key: "life-happens", title: "Life Happens", value: "Pause up to 7 days" },
    !hasStreakShield && streakForDisplay < 30
      ? { key: "shield-unlock", title: "Day 30", value: "Unlock shield" }
      : null,
    { key: "shield-save", title: "Shield save", value: `+${XP_REWARDS.STREAK_FREEZE} XP` },
  ].filter((chip): chip is { key: string; title: string; value: string } => chip !== null);
  const currentLevelIdx = Math.max(0, LEVELS_DATA.findIndex((l) => l.level === level));
  const upcomingLevels = LEVELS_DATA.slice(currentLevelIdx + 1, currentLevelIdx + 3).map((l) => ({
    key: `lvl-${l.level}`,
    title: `Level ${l.level} ${l.icon}`,
    value: `${Math.max(0, l.minXp - totalXp)} XP to ${l.name}`,
  }));

  return (
    <View style={styles.screen}>
      <View style={styles.glowTop}    pointerEvents="none" />
      <View style={styles.glowBottom} pointerEvents="none" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 36 }]}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* ── Badges ── */}
        <Animated.View style={[styles.badgesRow, {
          opacity: badgeAnim,
          transform: [{ scale: badgeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }],
        }]}>
          <View style={styles.tbadge}>
            <Text style={[styles.tbadgeText, { color: AMBER }]}>🔥 {streakForDisplay} Day Streak</Text>
          </View>
          <View style={styles.tbadge}>
            <Text style={[styles.tbadgeText, { color: "#80EEC0" }]}>⚡ +{xpEarned} XP</Text>
          </View>
        </Animated.View>

        {/* ── Dex ── */}
        <Animated.View style={[styles.dexWrap, {
          opacity: dexAnim,
          transform: [{ scale: dexAnim.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }) }],
        }]}>
          <DexDayComplete state={msg.dex} />
        </Animated.View>

        {/* ── Headline ── */}
        <Animated.Text style={[styles.headline, {
          opacity: titleAnim,
          transform: [{ translateY: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
        }]}>
          {msg.headlinePlain}{"\n"}
          <Text style={styles.headlineEm}>{msg.headlineEm}</Text>
        </Animated.Text>

        {/* ── Total XP strip ── */}
        <Animated.View style={[styles.totalStrip, {
          opacity: totalAnim,
          transform: [{ translateY: totalAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
        }]}>
          <View style={styles.totalLeft}>
            <Text style={styles.totalLbl}>TOTAL XP EARNED</Text>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
              <Text style={styles.totalNum}>{totalXp.toLocaleString()}</Text>
              <Text style={styles.totalNumSup}>XP</Text>
            </View>
          </View>
          <View style={styles.totalRight}>
            <Text style={styles.totalFire}>🔥</Text>
            <Text style={styles.totalStreakNum}>{streakForDisplay}</Text>
            <Text style={styles.totalStreakLbl}>DAY STREAK</Text>
          </View>
        </Animated.View>

        {/* ── Quote cards (stacked to avoid cut-off) ── */}
        <Animated.View style={[
          styles.quoteStack,
          {
            opacity: cardAnim,
            transform: [{ translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
          }
        ]}>
          <View style={styles.quoteCardTop}>
            <Text style={styles.quoteOpenQuote}>{"\u201C"}</Text>
            <Text style={styles.quoteText}>{quote}</Text>
          </View>

          <View style={styles.quoteCloserCard}>
            <Text style={styles.closerLine}>
              {"You're one day closer to "}
              <Text style={styles.closerDebt}>{debtLabel}.</Text>
            </Text>
          </View>
        </Animated.View>

        {/* ── Upcoming streak bonuses ── */}
        {(upcomingStreakBonuses.length > 0 || freezeBonusChips.length > 0 || upcomingLevels.length > 0) && (
          <Animated.View style={[styles.upcomingWrap, {
            opacity: totalAnim,
            transform: [{ translateY: totalAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
          }]}>
            <Text style={styles.upcomingTitle}>Upcoming streak bonuses</Text>
            <View style={styles.upcomingRow}>
              {upcomingStreakBonuses.map((m) => (
                <View key={m.day} style={styles.upcomingChip}>
                  <Text style={styles.upcomingChipDay}>Day {m.day}</Text>
                  <Text style={styles.upcomingChipXp}>+{m.xp} XP</Text>
                </View>
              ))}
              {freezeBonusChips.map((chip) => (
                <View key={chip.key} style={styles.upcomingChip}>
                  <Text style={styles.upcomingChipDay}>{chip.title}</Text>
                  <Text style={styles.upcomingChipXp}>{chip.value}</Text>
                </View>
              ))}
            </View>
            {upcomingLevels.length > 0 && (
              <>
                <Text style={[styles.upcomingTitle, { marginTop: 12 }]}>Upcoming levels</Text>
                <View style={styles.upcomingRow}>
                  {upcomingLevels.map((lvl) => (
                    <View key={lvl.key} style={styles.upcomingChip}>
                      <Text style={styles.upcomingChipDay}>{lvl.title}</Text>
                      <Text style={styles.upcomingChipXp}>{lvl.value}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
            <Pressable
              onPress={() => setShowDefinitions(true)}
              accessibilityRole="button"
              accessibilityLabel="Open definitions"
              hitSlop={10}
              style={styles.defsLinkWrap}
            >
              <Text style={styles.defsLinkText}>What do these mean?</Text>
            </Pressable>
          </Animated.View>
        )}

        {/* ── CTA ── */}
        <Animated.View style={[styles.ctaWrap, {
          opacity: ctaAnim,
          transform: [{ translateY: ctaAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
        }]}>
          <Pressable
            onPress={handleSeeTomorrow}
            accessibilityRole="button"
            accessibilityLabel="See you tomorrow"
            style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
          >
            <Text style={styles.btnText}>See you tomorrow 👋</Text>
          </Pressable>
          <View style={styles.skipRow}>
            <Text style={styles.skipText}>All done for today? </Text>
            <Pressable
              onPress={handleGoToMenu}
              accessibilityRole="button"
              accessibilityLabel="Skip to dashboard"
              hitSlop={12}
            >
              <Text style={styles.skipLink}>Skip</Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>

      {/* ── Confetti overlay ── */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {CONFETTI_PIECES.map((c, i) => <ConfettiPiece key={i} {...c} />)}
      </View>

      <Modal
        visible={showDefinitions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDefinitions(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowDefinitions(false)} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Quick definitions</Text>
            <Text style={styles.modalItem}><Text style={styles.modalItemLabel}>Streak bonus:</Text> Extra XP rewards you earn when you hit milestone days.</Text>
            <Text style={styles.modalItem}><Text style={styles.modalItemLabel}>Life Happens (pause):</Text> Lets you miss a day without breaking your streak, up to 7 times.</Text>
            <Text style={styles.modalItem}><Text style={styles.modalItemLabel}>Shield:</Text> Unlocks at day 30 and protects your streak for one missed day.</Text>
            <Text style={styles.modalItem}><Text style={styles.modalItemLabel}>Shield save:</Text> XP bonus you get when your shield protects a missed day.</Text>
            <Text style={styles.modalItem}><Text style={styles.modalItemLabel}>Upcoming levels:</Text> How much XP you need to reach the next level names.</Text>
            <Pressable onPress={() => setShowDefinitions(false)} style={styles.modalBtn}>
              <Text style={styles.modalBtnText}>Got it</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG, overflow: "hidden" },

  glowTop: {
    position: "absolute", top: 0, left: 0, right: 0, height: "60%",
    backgroundColor: "transparent", borderRadius: 9999,
    shadowColor: "rgba(120,90,255,1)", shadowOffset: { width: 0, height: 0 },
    shadowRadius: 200, shadowOpacity: 0.35,
  },
  glowBottom: {
    position: "absolute", bottom: 0, right: 0, width: "80%", height: "50%",
    backgroundColor: "transparent",
    shadowColor: "rgba(80,60,200,1)", shadowOffset: { width: 0, height: 0 },
    shadowRadius: 180, shadowOpacity: 0.22,
  },

  scroll: { flex: 1, width: "100%" },
  scrollContent: { flexGrow: 1, paddingHorizontal: 22, alignItems: "center" },

  // ── Badges ──
  badgesRow: {
    width: "100%", flexDirection: "row", justifyContent: "space-between", marginBottom: 20,
  },
  tbadge: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: BADGE_BG, borderWidth: 1.5, borderColor: BADGE_BD,
    borderRadius: 100, paddingVertical: 11, paddingHorizontal: 18,
  },
  tbadgeText: {
    fontFamily: Fonts.bold,
    fontSize: 15,   // ↑ was 13 — larger for low vision
    lineHeight: 18,
  },

  // ── Dex ──
  dexWrap: {
    width: 170, height: 190,
    alignItems: "center", justifyContent: "center",
    marginBottom: 8,
  },

  // ── Headline ──
  headline: {
    fontFamily: Fonts.serif,
    fontSize: 40,   // ↑ was 36
    color: WHITE,
    textAlign: "center",
    lineHeight: 46,
    marginBottom: 18,
    marginTop: 4,
  },
  headlineEm: { fontStyle: "italic", color: PURPLE_LT },

  // ── Quote cards (stacked to avoid cut-off) ──
  quoteStack: {
    width: "100%",
    flexDirection: "column",
    marginBottom: 20,
  },
  quoteCardTop: {
    width: "100%",
    backgroundColor: ROW_BG,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.16)",  // ↑ was 0.13 — higher contrast
    borderRadius: 20,
    padding: 22,
    paddingHorizontal: 20,
    overflow: "hidden",
    position: "relative",
  },
  quoteOpenQuote: {
    position: "absolute", top: -10, left: 12,
    fontFamily: Fonts.serif,
    fontSize: 80,   // ↑ was 72
    color: "rgba(192,168,255,0.22)",
    lineHeight: 88, zIndex: 0,
  },
  quoteText: {
    fontFamily: Fonts.serif,
    fontSize: 19,   // ↑ was 17
    lineHeight: 30, // ↑ was 27
    color: WHITE,
    fontStyle: "italic",
    zIndex: 1,
    marginTop: 10,
  },
  quoteDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginVertical: 14,
  },
  quoteCloserCard: {
    width: "100%",
    backgroundColor: ROW_BG,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 20,
    padding: 18,
    marginTop: 12,
  },
  closerLine: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,   // good size, accessible
    lineHeight: 22,
    color: "rgba(255,255,255,0.75)",  // ↑ was no such line
  },
  closerDebt: {
    color: AMBER,
    fontFamily: Fonts.bold,
  },

  // ── Total strip ──
  totalStrip: {
    width: "100%",
    backgroundColor: ROW_BG,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 20,
    padding: 18,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  totalLeft: { flexDirection: "column" },
  totalLbl: {
    fontFamily: Fonts.bold,
    fontSize: 12,   // ↑ was 11
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.58)",  // ↑ was 0.4
    marginBottom: 4,
  },
  totalNum: {
    fontFamily: Fonts.serif,
    fontSize: 44,   // ↑ was 42
    color: WHITE,
    lineHeight: 50,
  },
  totalNumSup: {
    fontFamily: Fonts.bold,
    fontSize: 16,   // ↑ was 15
    color: "rgba(255,255,255,0.58)",
  },
  totalRight: { alignItems: "center", gap: 2 },
  totalFire:      { fontSize: 28, lineHeight: 32 },  // ↑ was 26
  totalStreakNum: {
    fontFamily: Fonts.serif,
    fontSize: 30,   // ↑ was 28
    color: AMBER,
    lineHeight: 34,
  },
  totalStreakLbl: {
    fontFamily: Fonts.bold,
    fontSize: 12,   // ↑ was 11
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.58)",
  },
  upcomingWrap: {
    width: "100%",
    backgroundColor: ROW_BG,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 20,
    padding: 14,
    marginBottom: 20,
  },
  upcomingTitle: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.58)",
    marginBottom: 10,
  },
  upcomingRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    width: "100%",
  },
  upcomingChip: {
    width: "48.5%",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  upcomingChipDay: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    textAlign: "center",
    color: "rgba(255,255,255,0.78)",
    marginBottom: 2,
  },
  upcomingChipXp: {
    fontFamily: Fonts.extraBold,
    fontSize: 13,
    lineHeight: 16,
    textAlign: "center",
    color: "#80EEC0",
  },
  defsLinkWrap: {
    alignSelf: "flex-start",
    marginTop: 12,
    paddingVertical: 4,
  },
  defsLinkText: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: "rgba(255,255,255,0.88)",
    textDecorationLine: "underline",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  modalCard: {
    backgroundColor: "#2A1C67",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.18)",
    padding: 16,
  },
  modalTitle: {
    fontFamily: Fonts.extraBold,
    fontSize: 18,
    color: WHITE,
    marginBottom: 10,
  },
  modalItem: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 7,
  },
  modalItemLabel: {
    fontFamily: Fonts.extraBold,
    color: WHITE,
  },
  modalBtn: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: AMBER_BTN,
    alignItems: "center",
    paddingVertical: 11,
  },
  modalBtnText: {
    fontFamily: Fonts.extraBold,
    fontSize: 15,
    color: WHITE,
  },

  // ── CTA ──
  ctaWrap: { width: "100%", alignItems: "center" },
  btn: {
    width: "100%",
    backgroundColor: AMBER_BTN,
    borderRadius: 18,
    paddingVertical: 22,  // ↑ was 20 — bigger tap target
    alignItems: "center",
    shadowColor: "rgba(192,120,32,1)",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 28,
    elevation: 8,
    marginBottom: 18,
  },
  btnPressed: { opacity: 0.88 },
  btnText: {
    fontFamily: Fonts.extraBold,
    fontSize: 18,   // ↑ was 16
    color: WHITE,
    letterSpacing: 0.15,
  },
  skipRow: { flexDirection: "row", alignItems: "center" },
  skipText: {
    fontFamily: Fonts.regular,
    fontSize: 15,   // ↑ was 14
    color: "rgba(255,255,255,0.60)",  // ↑ was 0.45
  },
  skipLink: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",  // ↑ was 0.75
    textDecorationLine: "underline",
  },
});

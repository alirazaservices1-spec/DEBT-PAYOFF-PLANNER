// ─── DexCard — Dex mascot + typed speech bubble ───────────────────────────────
// Speech bubble: white fill, 1px #E8600A border, 16px radius, left-pointing tail
// Typewriter: 40ms per character, cursor blinks while typing
// Bubble entrance: scale 0.8→1.0 spring
// Dex is tappable: bounce animation + random encouraging message
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  useColorScheme,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGame, DexState } from "@/context/GameContext";
import { useDebts } from "@/context/DebtContext";
import { DexMascot } from "@/components/DexMascot";
import { FlameIcon } from "@/components/FlameIcon";
import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

// ─── State → default message ──────────────────────────────────────────────────
const DEX_MESSAGES: Record<DexState, string> = {
  idle:                 "Ready to tackle your debt today? Let's go! 💪",
  happy:               "That payment just earned you XP! You're building momentum. 🎉",
  celebrating:         "You're absolutely crushing it right now! 🔥",
  worried:             "Hey, no judgment here — let's get back on track together! 🤍",
  sleeping:            "Welcome back! Even rest days count. Let's pick it back up. 🌟",
  encouraging:         "Every payment matters. You've got this, no matter how small. 👊",
  onboarding_clipboard:"Let me show you how this all works — I'm your debt coach! 📋",
  surprised:           "Whoa — bonus XP incoming! You earned a little extra today. ✨",
};

// ─── 8 tappable encouraging messages ─────────────────────────────────────────
const TAP_MESSAGES = [
  "You're doing amazing — keep going! 🌟",
  "Every payment counts. You've got this! 💪",
  "Small steps lead to big wins. Stay strong!",
  "Progress, not perfection. Keep it up! ✨",
  "You're closer than you think! 🎯",
  "Debt freedom is earned one payment at a time. 🏆",
  "I believe in you! One step at a time. 🦊",
  "No judgment here — just keep moving forward! 🌈",
];

// ─── Daily tips ───────────────────────────────────────────────────────────────
const TIPS = [
  "Paying $10 extra per month can save hundreds in interest.",
  "The avalanche method saves the most money — hit high APR debts first.",
  "Even small extra payments make a big difference over time.",
  "Automating minimums avoids late fees and protects your credit.",
  "Paying bi-weekly instead of monthly can shave months off your payoff date.",
  "Every dollar not spent on interest is a dollar toward your future.",
  "Celebrating small wins keeps you motivated — you're doing great!",
];

const TIP_KEY = "@debtfree_tip_v1";

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

function useDailyTip() {
  const [tip, setTip] = useState(TIPS[0]);
  useEffect(() => {
    AsyncStorage.getItem(TIP_KEY).then((raw) => {
      const today = getTodayStr();
      let index = 0;
      if (raw) {
        try {
          const stored = JSON.parse(raw) as { index: number; date: string };
          if (stored.date === today) {
            index = stored.index;
          } else {
            index = (stored.index + 1) % TIPS.length;
            AsyncStorage.setItem(TIP_KEY, JSON.stringify({ index, date: today }));
          }
        } catch {
          AsyncStorage.setItem(TIP_KEY, JSON.stringify({ index: 0, date: today }));
        }
      } else {
        AsyncStorage.setItem(TIP_KEY, JSON.stringify({ index: 0, date: today }));
      }
      setTip(TIPS[index]);
    });
  }, []);
  return tip;
}

// ─── Typewriter hook ───────────────────────────────────────────────────────────
function useTypewriter(fullText: string, charDelay = 40) {
  const [displayed, setDisplayed] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setDisplayed("");
    setIsTyping(true);
    let i = 0;
    timerRef.current = setInterval(() => {
      i++;
      setDisplayed(fullText.slice(0, i));
      if (i >= fullText.length) {
        clearInterval(timerRef.current!);
        timerRef.current = null;
        setIsTyping(false);
      }
    }, charDelay);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fullText]);

  return { displayed, isTyping };
}

// ─── Speech bubble component ───────────────────────────────────────────────────
interface BubbleProps {
  message: string;
}
function SpeechBubble({ message }: BubbleProps) {
  const { displayed, isTyping } = useTypewriter(message, 38);

  // Spring entrance: scale 0.8 → 1.0 when message changes
  const bubbleScale = useRef(new Animated.Value(0.8)).current;
  useEffect(() => {
    bubbleScale.setValue(0.8);
    Animated.spring(bubbleScale, {
      toValue: 1,
      friction: 6,
      tension: 320,
      useNativeDriver: false,
    }).start();
  }, [message]);

  // Cursor blink while typing
  const cursorOpacity = useRef(new Animated.Value(1)).current;
  const blinkRef = useRef<Animated.CompositeAnimation | null>(null);
  useEffect(() => {
    if (blinkRef.current) blinkRef.current.stop();
    if (!isTyping) { cursorOpacity.setValue(0); return; }
    blinkRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, { toValue: 0, duration: 380, useNativeDriver: false }),
        Animated.timing(cursorOpacity, { toValue: 1, duration: 380, useNativeDriver: false }),
      ])
    );
    blinkRef.current.start();
    return () => blinkRef.current?.stop();
  }, [isTyping]);

  return (
    <Animated.View style={[styles.bubbleWrap, { transform: [{ scale: bubbleScale }] }]}>
      {/* Left-pointing tail */}
      <View style={styles.bubbleTailBorder} />
      <View style={styles.bubbleTailInner} />

      {/* Bubble body */}
      <View style={styles.bubble}>
        <Text style={styles.bubbleText} numberOfLines={3}>
          {displayed}
          {isTyping && (
            <Animated.Text style={[styles.cursor, { opacity: cursorOpacity }]}>
              |
            </Animated.Text>
          )}
        </Text>
      </View>
    </Animated.View>
  );
}

// ─── DexCard main ─────────────────────────────────────────────────────────────
const GRACE_DAYS = 3;
const SLEEP_DAYS = 7;
function daysBetween(a: Date, b: Date) {
  return Math.floor((b.getTime() - a.getTime()) / 86400000);
}

export function DexCard() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;

  const { dexState, dexOverrideMessage, triggerDex, prevLastOpenedAt, celebration } = useGame();
  const { debts, payments } = useDebts();
  const tip = useDailyTip();

  // Tap state
  const [tapMessage, setTapMessage] = useState<string | null>(null);
  const tapScale = useRef(new Animated.Value(1)).current;
  const initialStateSet = useRef(false);

  // ── Set initial Dex state on mount ────────────────────────────────────────
  useEffect(() => {
    if (initialStateSet.current) return;
    initialStateSet.current = true;
    const now = new Date();
    if (prevLastOpenedAt) {
      const prev = new Date(prevLastOpenedAt);
      if (daysBetween(prev, now) >= SLEEP_DAYS) {
        triggerDex("sleeping", 6000);
        return;
      }
    }
    const paid = payments.filter((p) => !p.isMissed);
    if (paid.length > 0) {
      const last = paid.reduce((a, b) => new Date(a.date) > new Date(b.date) ? a : b);
      if (daysBetween(new Date(last.date), now) >= GRACE_DAYS) {
        triggerDex("encouraging", 6000);
        return;
      }
    }
  }, []);

  useEffect(() => {
    if (celebration.type === "level_up" || celebration.type === "debt_cleared") {
      triggerDex("celebrating", 4000);
    }
  }, [celebration.type]);

  // Clear tap message when dex state changes externally
  useEffect(() => {
    setTapMessage(null);
  }, [dexState]);

  // ── Tap handler ───────────────────────────────────────────────────────────
  const handleTap = useCallback(() => {
    const msg = TAP_MESSAGES[Math.floor(Math.random() * TAP_MESSAGES.length)];
    setTapMessage(msg);

    // Bounce spring
    Animated.sequence([
      Animated.timing(tapScale, { toValue: 0.86, duration: 70, useNativeDriver: false }),
      Animated.spring(tapScale, { toValue: 1, friction: 4, tension: 380, useNativeDriver: false }),
    ]).start();
  }, []);

  const displayMessage = tapMessage
    ?? dexOverrideMessage
    ?? (debts.length === 0 ? "Add a debt to start your payoff journey! 🌱" : DEX_MESSAGES[dexState]);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: C.surface,
          borderColor: isDark ? C.border : "rgba(0,0,0,0.06)",
        },
      ]}
    >
      <View style={styles.row}>
        {/* Tappable mascot; when worried, show small flame (Dex holding/protecting it per brief) */}
        <Pressable onPress={handleTap} style={styles.mascotCol}>
          <View style={styles.mascotWrap}>
            {dexState === "worried" && (
              <View style={styles.heldFlame} pointerEvents="none">
                <FlameIcon streakDays={1} atRisk size={28} />
              </View>
            )}
            <Animated.View style={{ transform: [{ scale: tapScale }] }}>
              <DexMascot state={dexState} size={72} />
            </Animated.View>
          </View>
          <Text style={[styles.tapHint, { color: C.textSecondary }]}>tap me</Text>
        </Pressable>

        {/* Speech bubble */}
        <View style={styles.bubbleCol}>
          <View style={styles.nameBadge}>
            <Text style={styles.nameText}>DEX</Text>
          </View>
          <SpeechBubble message={displayMessage} />
        </View>
      </View>

      {/* Daily tip below */}
      <Text style={[styles.tip, { color: C.textSecondary }]}>
        💡 {tip}
      </Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const BUBBLE_BORDER = "#E8600A";

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 12,
    elevation: 5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  mascotCol: {
    alignItems: "center",
    width: 80,
  },
  mascotWrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  heldFlame: {
    position: "absolute",
    bottom: 8,
    left: -4,
    zIndex: 1,
  },
  tapHint: {
    fontSize: 9,
    fontFamily: Fonts.semiBold,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginTop: -4,
    opacity: 0.6,
  },
  bubbleCol: {
    flex: 1,
    gap: 6,
  },
  nameBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  nameText: {
    fontSize: 8,
    fontFamily: Fonts.extraBold,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.9,
  },

  // ── Speech bubble ────────────────────────────────────────────────────────
  bubbleWrap: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },

  // Left-pointing tail — outer (border color)
  bubbleTailBorder: {
    width: 0,
    height: 0,
    borderTopWidth: 9,
    borderTopColor: "transparent",
    borderRightWidth: 11,
    borderRightColor: BUBBLE_BORDER,
    borderBottomWidth: 9,
    borderBottomColor: "transparent",
    marginTop: 4,
    zIndex: 2,
  },
  // Left tail inner (white fill, slightly smaller)
  bubbleTailInner: {
    position: "absolute",
    left: 1,
    width: 0,
    height: 0,
    borderTopWidth: 7,
    borderTopColor: "transparent",
    borderRightWidth: 9,
    borderRightColor: "#FFFFFF",
    borderBottomWidth: 7,
    borderBottomColor: "transparent",
    marginTop: 4,
    zIndex: 3,
  },

  bubble: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BUBBLE_BORDER,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 9,
    zIndex: 1,
    minHeight: 50,
    justifyContent: "center",
  },
  bubbleText: {
    fontSize: 13.5,
    fontFamily: Fonts.regular,
    fontWeight: "400",
    lineHeight: 20,
    color: "#1A0A00",
  },
  cursor: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: BUBBLE_BORDER,
    lineHeight: 20,
  },

  // ── Tip ──────────────────────────────────────────────────────────────────
  tip: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    fontWeight: "400",
    lineHeight: 16,
    marginTop: 10,
    paddingHorizontal: 4,
  },
});

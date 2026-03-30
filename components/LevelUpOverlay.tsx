import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Fonts } from "@/constants/fonts";
import { getLevelName } from "@/constants/levelNames";

interface Props {
  visible: boolean;
  level: number;
  onDismiss: () => void;
  /** XP from the action that pushed them over the threshold (when available). */
  recentXpGained?: number;
}

const CONFETTI_COLORS = [
  "#F5C842", "#E8960A", "#4CAF50", "#2196F3",
  "#E91E63", "#9C27B0", "#FF5722", "#00BCD4",
];

type CPiece = { id: number; x: number; color: string; size: number; round: boolean };

function ConfettiPiece({ piece }: { piece: CPiece }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 1400 + Math.random() * 800,
      delay: Math.random() * 700,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, []);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-10, 500] });
  const opacity    = anim.interpolate({ inputRange: [0, 0.75, 1], outputRange: [1, 1, 0] });
  const rotate     = anim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "720deg"] });
  return (
    <Animated.View style={{
      position: "absolute",
      left: `${piece.x}%` as any,
      top: 0,
      width: piece.size,
      height: piece.size,
      borderRadius: piece.round ? piece.size / 2 : 2,
      backgroundColor: piece.color,
      opacity,
      transform: [{ translateY }, { rotate }],
    }} />
  );
}

function Confetti() {
  const [pieces] = useState<CPiece[]>(() =>
    Array.from({ length: 36 }, (_, i) => ({
      id: i,
      x: 2 + Math.random() * 96,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 6 + Math.random() * 8,
      round: Math.random() > 0.45,
    }))
  );
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map(p => <ConfettiPiece key={p.id} piece={p} />)}
    </View>
  );
}

function TrophyBounce() {
  const bounce = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: -8, duration: 600, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(bounce, { toValue: 0, duration: 600, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    ).start();
  }, []);
  return (
    <Animated.Text style={{ fontSize: 52, transform: [{ translateY: bounce }] }}>
      🏆
    </Animated.Text>
  );
}

const LEVEL_SUB: Record<number, string> = {
  2:  "You crossed 100 XP. Dex is absolutely pumped right now. You're building real momentum.",
  3:  "You've been fighting hard for your debt-free future. The habit is forming - keep going.",
  4:  "Warrior status achieved. You're in the top tier. The debt doesn't stand a chance.",
  5:  "Champion! You've proven you can do this. The finish line is getting closer every day.",
  6:  "Debt Crusher unlocked. You're demolishing balances and Dex is beyond proud of you.",
  7:  "Interest Slayer! The math is on your side. Every payment is costing your debt money now.",
  8:  "Balance Buster! You're tearing through these debts. The snowball is massive now.",
  9:  "Payoff Pro! You could teach this. You're living the debt-free life others only dream of.",
  10: "DEBT DESTROYER. You made it. You are the definition of financial discipline. Legend status.",
};

export function LevelUpOverlay({ visible, level, onDismiss, recentXpGained }: Props) {
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const cardAnim     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      backdropAnim.setValue(0);
      cardAnim.setValue(0);
      Animated.parallel([
        Animated.timing(backdropAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(cardAnim, { toValue: 1, useNativeDriver: true, tension: 55, friction: 8 }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(cardAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const backdropOpacity = backdropAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.6] });
  const cardScale       = cardAnim.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1] });
  const cardTranslateY  = cardAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] });
  const cardOpacity     = cardAnim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 1] });

  const levelName = getLevelName(level);
  const subText   = LEVEL_SUB[level] ?? `Level ${level} unlocked! Keep climbing - Dex is cheering every step.`;

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onDismiss}>
      <View style={s.container}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: "#000", opacity: backdropOpacity }]} />
        <Confetti />

        <Animated.View style={[
          s.card,
          {
            opacity: cardOpacity,
            transform: [{ scale: cardScale }, { translateY: cardTranslateY }],
          },
        ]}>
          {/* Eyebrow badge */}
          <View style={s.badge}>
            <Text style={s.badgeText}>NICE WORK</Text>
          </View>

          {/* Trophy icon */}
          <View style={s.iconWrap}>
            <TrophyBounce />
          </View>

          {/* Level number */}
          <Text style={s.levelNum}>Level {level}</Text>

          {/* Level name */}
          <Text style={s.levelName}>{levelName}</Text>

          {typeof recentXpGained === "number" && recentXpGained > 0 ? (
            <Text style={s.xpHighlight}>+{recentXpGained} XP - well done!</Text>
          ) : null}

          {/* Divider */}
          <View style={s.divider} />

          {/* Description */}
          <Text style={s.description}>{subText}</Text>

          {/* CTA button */}
          <Pressable
            onPress={onDismiss}
            style={({ pressed }) => [s.btn, { opacity: pressed ? 0.85 : 1 }]}
          >
            <Text style={s.btnText}>Continue →</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 28,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 20,
  },
  badge: {
    backgroundColor: "#FFF3CC",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 20,
  },
  badgeText: {
    fontFamily: Fonts.extraBold,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2.5,
    color: "#B87A00",
    textTransform: "uppercase",
  },
  iconWrap: {
    marginBottom: 16,
  },
  levelNum: {
    fontFamily: Fonts.black,
    fontSize: 34,
    fontWeight: "900",
    color: "#111111",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  levelName: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    fontWeight: "700",
    color: "#B87A00",
    marginBottom: 8,
    textAlign: "center",
  },
  xpHighlight: {
    fontFamily: Fonts.black,
    fontSize: 16,
    fontWeight: "900",
    color: "#2C7A43",
    textAlign: "center",
    marginBottom: 12,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#F0EDE8",
    marginBottom: 16,
  },
  description: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    fontWeight: "600",
    color: "#444444",
    lineHeight: 21,
    textAlign: "center",
    marginBottom: 24,
  },
  btn: {
    width: "100%",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    backgroundColor: "#E8960A",
  },
  btnText: {
    fontFamily: Fonts.black,
    fontSize: 15,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
});

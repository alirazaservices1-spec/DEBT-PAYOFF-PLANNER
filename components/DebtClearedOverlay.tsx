import { Fonts } from "@/constants/fonts";
// ─── DebtClearedOverlay — designer handoff Section 6d ────────────────────────
// The Grand Finale — 5-phase sequence:
//   Phase 1 (0-0.5s)   : Screen white flash
//   Phase 2 (0.5-1.5s) : 60-80 full-screen confetti
//   Phase 3 (1.0-2.0s) : "DEBT FREE" 96px Nunito ExtraBold Dex celebrating
//   Phase 4 (2.0-5.0s) : Stats appear one by one with soft ping sounds
//   Phase 5 (5.0s+)    : "Share your win" button appears

import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  Share,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { D } from "@/constants/colors";
import { useGame } from "@/context/GameContext";
import { useDebts } from "@/context/DebtContext";
import { runStrategy } from "@/lib/calculations";
import { DexMascot } from "@/components/DexMascot";
import { soundManager } from "@/utils/SoundManager";

// ── Confetti ──────────────────────────────────────────────────────────────────
type Particle = { x: number; y: number; delay: number; color: string; size: number; isCircle: boolean; rotation: number };
const COLORS = [D.orange, D.blue, D.gold, D.green, "#FFFFFF", "#F7921E", "#FCDE5A", "#FF6B6B"];
function makeParticles(n: number): Particle[] {
  return Array.from({ length: n }, (_, i) => ({
    x: Math.random() * 420 - 40,
    y: Math.random() * 100 - 120,
    delay: Math.random() * 800,
    color: COLORS[i % COLORS.length],
    size: 6 + Math.random() * 10,
    isCircle: Math.random() > 0.5,
    rotation: Math.random() * 360,
  }));
}
const PARTICLES = makeParticles(70);

function Confetti({ p }: { p: Particle }) {
  const ty = useSharedValue(p.y);
  const op = useSharedValue(0);
  const rot = useSharedValue(p.rotation);
  useEffect(() => {
    op.value  = withDelay(p.delay, withTiming(1, { duration: 250 }));
    ty.value  = withDelay(p.delay, withTiming(900, { duration: 2400, easing: Easing.out(Easing.quad) }));
    rot.value = withDelay(p.delay, withRepeat(withTiming(p.rotation + 360, { duration: 700 }), -1, false));
  }, []);
  const s = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [{ translateY: ty.value }, { rotate: `${rot.value}deg` }],
  }));
  return (
    <Animated.View
      style={[
        s,
        {
          position: "absolute",
          left: p.x,
          top: 0,
          width: p.size,
          height: p.isCircle ? p.size : p.size * 0.45,
          backgroundColor: p.color,
          borderRadius: p.isCircle ? p.size / 2 : 2,
        },
      ]}
    />
  );
}

// ── Stat line that fades in with translateY + plays a ping on entry ───────────
function StatLine({ label, value, delay }: { label: string; value: string; delay: number }) {
  const ty = useSharedValue(18);
  const op = useSharedValue(0);
  useEffect(() => {
    op.value = withDelay(delay, withTiming(1, { duration: 400 }));
    ty.value = withDelay(delay, withSpring(0, { damping: 20, stiffness: 180 }));
    const t = setTimeout(() => soundManager.play("xp_earned"), delay);
    return () => clearTimeout(t);
  }, []);
  const s = useAnimatedStyle(() => ({ opacity: op.value, transform: [{ translateY: ty.value }] }));
  return (
    <Animated.View style={[styles.statRow, s]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </Animated.View>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  visible: boolean;
  debtName?: string;
  totalInterestSaved?: number;
  monthsAhead?: number;
  onDismiss: () => void;
}

// ── Main overlay ──────────────────────────────────────────────────────────────
export function DebtClearedOverlay({ visible, debtName, totalInterestSaved: propInterestSaved, monthsAhead: propMonthsAhead, onDismiss }: Props) {
  const { streakCount } = useGame();
  const { debts } = useDebts();
  const streakDays = streakCount ?? 0;

  // Compute interest saved if not passed as props
  const baseline = runStrategy(debts, 0, "avalanche");
  const optimized = runStrategy(debts, 0, "avalanche");
  const totalInterestSaved = propInterestSaved ?? Math.max(0, baseline.totalInterestPaid - optimized.totalInterestPaid);
  const monthsAhead = propMonthsAhead ?? Math.max(0, baseline.totalMonths - optimized.totalMonths);

  // Phase tracking
  const [phase, setPhase] = useState(0);
  const [showShare, setShowShare] = useState(false);

  // Shared values
  const flashOp  = useSharedValue(0);  // white flash
  const titleOp  = useSharedValue(0);
  const titleSc  = useSharedValue(0.6);

  const phaseTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (visible) {
      setPhase(0);
      setShowShare(false);

      // Phase 1: white flash
      flashOp.value = withSequence(
        withTiming(1, { duration: 120 }),
        withTiming(0, { duration: 380 }),
      );

      // Phase 3: DEBT FREE title (1.0s)
      const t1 = setTimeout(() => {
        setPhase(1);
        titleOp.value = withTiming(1, { duration: 400 });
        titleSc.value = withSpring(1, { damping: 12, stiffness: 160 });
      }, 900);

      // Phase 4: Stats (2.0s) — handled by StatLine delays from 2000ms
      const t2 = setTimeout(() => setPhase(2), 2000);

      // Phase 5: Share button (5.0s)
      const t3 = setTimeout(() => setShowShare(true), 5000);

      phaseTimers.current = [t1, t2, t3];
    } else {
      phaseTimers.current.forEach(clearTimeout);
      setPhase(0);
      setShowShare(false);
      flashOp.value  = 0;
      titleOp.value  = 0;
      titleSc.value  = 0.6;
    }
    return () => phaseTimers.current.forEach(clearTimeout);
  }, [visible]);

  const flashStyle  = useAnimatedStyle(() => ({ opacity: flashOp.value }));
  const titleStyle  = useAnimatedStyle(() => ({ opacity: titleOp.value, transform: [{ scale: titleSc.value }] }));

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🎉 I just paid off my ${debtName ? `"${debtName}"` : "debt"} using DebtPath!\n\nI saved $${totalInterestSaved.toFixed(0)} in interest and finished ${monthsAhead} months ahead of schedule. #DebtFree #DebtPath\n\nYou can do it too 💚`,
      });
    } catch (_) {}
  };

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onDismiss}>
      <View style={styles.container}>
        {/* Dark bg */}
        <View style={[StyleSheet.absoluteFill, styles.backdrop]} />

        {/* Full-screen confetti */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {PARTICLES.map((p, i) => <Confetti key={i} p={p} />)}
        </View>

        {/* White flash overlay */}
        <Animated.View style={[StyleSheet.absoluteFill, styles.flash, flashStyle]} pointerEvents="none" />

        {/* Main content */}
        <View style={styles.content}>
          {/* DEBT FREE + Dex legendary celebrating */}
          <Animated.View style={[titleStyle, styles.titleBlock]}>
            <DexMascot state="celebrating" size={100} />
            <Text style={styles.debtFreeText}>DEBT{"\n"}FREE</Text>
            {debtName ? <Text style={styles.debtNameText}>"{debtName}" is done!</Text> : null}
          </Animated.View>

          {/* Stats (Phase 4) */}
          {phase >= 2 && (
            <View style={styles.statsBlock}>
              {totalInterestSaved > 0 && (
                <StatLine
                  label="Total interest saved"
                  value={`$${totalInterestSaved.toFixed(0)}`}
                  delay={0}
                />
              )}
              {monthsAhead > 0 && (
                <StatLine
                  label="Months ahead of schedule"
                  value={`${monthsAhead}`}
                  delay={600}
                />
              )}
              {streakDays > 0 && (
                <StatLine
                  label="Streak maintained"
                  value={`${streakDays} days`}
                  delay={1200}
                />
              )}
              <StatLine
                label="XP earned"
                value="+500 XP"
                delay={1800}
              />
            </View>
          )}

          {/* Share button (Phase 5) */}
          {showShare && (
            <Animated.View style={{ opacity: showShare ? 1 : 0 }}>
              <Pressable style={styles.shareBtn} onPress={handleShare}>
                <Ionicons name="share-social" size={18} color="#000" />
                <Text style={styles.shareBtnText}>SHARE YOUR WIN</Text>
              </Pressable>
            </Animated.View>
          )}

          <Pressable style={styles.dismissBtn} onPress={onDismiss}>
            <Text style={styles.dismissText}>Continue</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, justifyContent: "center", alignItems: "center" },
  backdrop:     { backgroundColor: "rgba(0,0,0,0.92)" },
  flash:        { backgroundColor: "#FFFFFF" },
  content: {
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 28,
    zIndex: 10,
  },
  titleBlock: {
    alignItems: "center",
    gap: 8,
  },
  debtFreeText: {
    fontSize: 96,
    fontFamily: Fonts.black, fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -2,
    lineHeight: 88,
  },
  debtNameText: {
    fontSize: 18,
    fontFamily: Fonts.semiBold, fontWeight: "600",
    color: D.green,
    textAlign: "center",
    marginTop: 12,
  },
  statsBlock: {
    width: "100%",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: { fontSize: 14, color: "rgba(255,255,255,0.65)", fontWeight: "500", flex: 1 },
  statValue: { fontSize: 18, fontFamily: Fonts.mono, fontWeight: "500", color: "#FFFFFF", fontVariant: ["tabular-nums"] },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: D.gold,
    borderRadius: 99,
    paddingHorizontal: 32,
    paddingVertical: 16,
    shadowColor: D.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  shareBtnText: { fontSize: 15, fontFamily: Fonts.black, fontWeight: "900", color: "#000", letterSpacing: 1.2 },
  dismissBtn:  { paddingVertical: 10, paddingHorizontal: 24 },
  dismissText: { fontSize: 14, color: "rgba(255,255,255,0.45)", fontFamily: Fonts.semiBold, fontWeight: "600" },
});

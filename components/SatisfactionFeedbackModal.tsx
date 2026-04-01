/**
 * SatisfactionFeedbackModal
 * 3-screen flow: Check-in → Feedback → Thank-you
 * Design reference: attached_assets/Pasted--DOCTYPE-html…txt
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Circle,
  Ellipse,
  Path,
  Rect,
  Defs,
  RadialGradient,
  Stop,
  Text as SvgText,
} from "react-native-svg";

import { Fonts } from "@/constants/fonts";
import { useGame } from "@/context/GameContext";
import { appendFeedbackLog } from "@/lib/submitAppFeedback";
import { markFeedbackShown, FeedbackTrigger } from "@/lib/satisfactionFeedbackGate";

// ─── Design tokens (match HTML reference) ────────────────────────────────────
const NAVY = "#1C1F2E";
const AMBER = "#D08A10";
const AMBER_L = "#F2C040";
const AMBER_D = "#8A5000";
const MUTED = "#8A7A50";
const CARD_BG = "#FDFAF2";

type Step = "checkin" | "feedback" | "thanks";

type Props = { visible: boolean; onClosed: () => void; trigger?: FeedbackTrigger };

// ─── SVG mascots ─────────────────────────────────────────────────────────────

/** Screen 1 & 3: happy/warm → nod ±3° */
function usNodAnim() {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 730, useNativeDriver: true }),
        Animated.timing(v, { toValue: -1, duration: 730, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 740, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return v.interpolate({ inputRange: [-1, 0, 1], outputRange: ["-3deg", "0deg", "3deg"] });
}

/** Screen 2: worried → float 0 → −6px */
function useFloatAnim() {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return v.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
}

function DexHappy() {
  const rot = usNodAnim();
  return (
    <Animated.View style={{ transform: [{ rotate: rot }] }}>
      <Svg width={88} height={106} viewBox="0 0 120 145" style={{ overflow: "visible" }}>
        <Defs>
          <RadialGradient id="ap_b" cx="38%" cy="32%" r="65%">
            <Stop offset="0%" stopColor="#F5C840" /><Stop offset="55%" stopColor="#D49010" /><Stop offset="100%" stopColor="#A46208" />
          </RadialGradient>
          <RadialGradient id="ap_e" cx="40%" cy="38%" r="60%">
            <Stop offset="0%" stopColor="#C07010" /><Stop offset="100%" stopColor="#7A4800" />
          </RadialGradient>
          <RadialGradient id="ap_c" cx="38%" cy="35%" r="62%">
            <Stop offset="0%" stopColor="#FFDF60" /><Stop offset="100%" stopColor="#C89010" />
          </RadialGradient>
        </Defs>
        <Ellipse cx="60" cy="135" rx="26" ry="5" fill="rgba(0,0,0,0.07)" />
        <Circle cx="26" cy="36" r="13" fill="url(#ap_e)" /><Circle cx="94" cy="36" r="13" fill="url(#ap_e)" />
        <Circle cx="26" cy="36" r="7" fill="#5A3400" opacity="0.5" /><Circle cx="94" cy="36" r="7" fill="#5A3400" opacity="0.5" />
        <Circle cx="60" cy="72" r="47" fill="#8A5800" opacity="0.2" /><Circle cx="60" cy="70" r="47" fill="url(#ap_b)" />
        <Path d="M102 68 Q114 54 110 40" stroke="#9A6200" strokeWidth="10" strokeLinecap="round" fill="none" />
        <Ellipse cx="106" cy="38" rx="11" ry="8" fill="url(#ap_b)" stroke="#9A6200" strokeWidth="1.2" />
        <Rect x="102" y="26" width="9" height="14" rx="4.5" fill="url(#ap_b)" stroke="#9A6200" strokeWidth="1.2" />
        <SvgText x="112" y="22" fontSize="9" fill="#FFD030" opacity="0.9">✦</SvgText>
        <Ellipse cx="13" cy="74" rx="11" ry="7" fill="url(#ap_b)" stroke="#9A6200" strokeWidth="1.2" rotation="-10" originX="13" originY="74" />
        <Ellipse cx="40" cy="65" rx="18" ry="19" fill="white" /><Ellipse cx="80" cy="65" rx="18" ry="19" fill="white" />
        <Circle cx="40" cy="67" r="12" fill="#1A1A2E" /><Circle cx="80" cy="67" r="12" fill="#1A1A2E" />
        <Circle cx="45" cy="61" r="4.5" fill="white" opacity="0.9" /><Circle cx="85" cy="61" r="4.5" fill="white" opacity="0.9" />
        <Path d="M26 46 L44 44" stroke="#7A4800" strokeWidth="2.5" strokeLinecap="round" />
        <Path d="M76 44 L94 46" stroke="#7A4800" strokeWidth="2.5" strokeLinecap="round" />
        <Ellipse cx="28" cy="77" rx="9" ry="5.5" fill="#E87070" opacity="0.18" />
        <Ellipse cx="92" cy="77" rx="9" ry="5.5" fill="#E87070" opacity="0.18" />
        <Path d="M36 87 Q60 104 84 87" fill="none" stroke="#7A4800" strokeWidth="3.2" strokeLinecap="round" />
        <Rect x="29" y="113" width="22" height="12" rx="6" fill="#C4A878" /><Rect x="69" y="113" width="22" height="12" rx="6" fill="#C4A878" />
        <Circle cx="14" cy="88" r="13" fill="url(#ap_c)" stroke="#A07010" strokeWidth="1.8" />
        <SvgText x="14" y="93" textAnchor="middle" fontWeight="600" fontSize="13" fill="#7A5000">$</SvgText>
      </Svg>
    </Animated.View>
  );
}

function DexWorried() {
  const ty = useFloatAnim();
  return (
    <Animated.View style={{ transform: [{ translateY: ty }] }}>
      <Svg width={72} height={86} viewBox="0 0 120 145" style={{ overflow: "visible" }}>
        <Defs>
          <RadialGradient id="wo_b" cx="38%" cy="32%" r="65%">
            <Stop offset="0%" stopColor="#DBA830" /><Stop offset="55%" stopColor="#B07810" /><Stop offset="100%" stopColor="#884800" />
          </RadialGradient>
          <RadialGradient id="wo_e" cx="40%" cy="38%" r="60%">
            <Stop offset="0%" stopColor="#A86010" /><Stop offset="100%" stopColor="#6A3800" />
          </RadialGradient>
          <RadialGradient id="wo_c" cx="38%" cy="35%" r="62%">
            <Stop offset="0%" stopColor="#FFDF60" /><Stop offset="100%" stopColor="#C89010" />
          </RadialGradient>
        </Defs>
        {/* teardrop */}
        <Ellipse cx="104" cy="48" rx="5" ry="7" fill="rgba(80,160,240,0.75)" stroke="rgba(50,120,200,0.4)" strokeWidth="1" />
        <Ellipse cx="103" cy="46" rx="2" ry="2.5" fill="rgba(180,220,255,0.7)" />
        <Ellipse cx="60" cy="135" rx="26" ry="5" fill="rgba(0,0,0,0.07)" />
        <Circle cx="26" cy="36" r="13" fill="url(#wo_e)" /><Circle cx="94" cy="36" r="13" fill="url(#wo_e)" />
        <Circle cx="26" cy="36" r="7" fill="#5A3400" opacity="0.5" /><Circle cx="94" cy="36" r="7" fill="#5A3400" opacity="0.5" />
        <Circle cx="60" cy="72" r="47" fill="#7A4800" opacity="0.2" /><Circle cx="60" cy="70" r="47" fill="url(#wo_b)" />
        <Ellipse cx="13" cy="76" rx="11" ry="7" fill="url(#wo_b)" stroke="#9A6200" strokeWidth="1.2" rotation="-6" originX="13" originY="76" />
        <Ellipse cx="107" cy="76" rx="11" ry="7" fill="url(#wo_b)" stroke="#9A6200" strokeWidth="1.2" rotation="6" originX="107" originY="76" />
        <Ellipse cx="40" cy="65" rx="18" ry="19" fill="white" /><Ellipse cx="80" cy="65" rx="18" ry="19" fill="white" />
        <Circle cx="40" cy="67" r="12" fill="#1A1A2E" /><Circle cx="80" cy="67" r="12" fill="#1A1A2E" />
        <Circle cx="45" cy="61" r="4.5" fill="white" opacity="0.9" /><Circle cx="85" cy="61" r="4.5" fill="white" opacity="0.9" />
        <Path d="M24 50 L44 44" stroke="#6A3800" strokeWidth="3" strokeLinecap="round" />
        <Path d="M76 44 L96 50" stroke="#6A3800" strokeWidth="3" strokeLinecap="round" />
        <Path d="M44 91 Q60 84 76 91" fill="none" stroke="#7A4800" strokeWidth="3" strokeLinecap="round" />
        <Rect x="29" y="113" width="22" height="12" rx="6" fill="#C4A878" /><Rect x="69" y="113" width="22" height="12" rx="6" fill="#C4A878" />
        <Circle cx="14" cy="88" r="13" fill="url(#wo_c)" stroke="#A07010" strokeWidth="1.8" />
        <SvgText x="14" y="93" textAnchor="middle" fontWeight="600" fontSize="13" fill="#7A5000">$</SvgText>
      </Svg>
    </Animated.View>
  );
}

function DexWarm() {
  const rot = usNodAnim();
  return (
    <Animated.View style={{ transform: [{ rotate: rot }] }}>
      <Svg width={88} height={106} viewBox="0 0 120 145" style={{ overflow: "visible" }}>
        <Defs>
          <RadialGradient id="pr_b" cx="38%" cy="32%" r="65%">
            <Stop offset="0%" stopColor="#F4C240" /><Stop offset="55%" stopColor="#D08A10" /><Stop offset="100%" stopColor="#A06008" />
          </RadialGradient>
          <RadialGradient id="pr_e" cx="40%" cy="38%" r="60%">
            <Stop offset="0%" stopColor="#C07010" /><Stop offset="100%" stopColor="#7A4800" />
          </RadialGradient>
          <RadialGradient id="pr_c" cx="38%" cy="35%" r="62%">
            <Stop offset="0%" stopColor="#FFDF60" /><Stop offset="100%" stopColor="#C89010" />
          </RadialGradient>
        </Defs>
        <Ellipse cx="60" cy="135" rx="26" ry="5" fill="rgba(0,0,0,0.07)" />
        <Circle cx="26" cy="36" r="13" fill="url(#pr_e)" /><Circle cx="94" cy="36" r="13" fill="url(#pr_e)" />
        <Circle cx="26" cy="36" r="7" fill="#5A3400" opacity="0.5" /><Circle cx="94" cy="36" r="7" fill="#5A3400" opacity="0.5" />
        <Circle cx="60" cy="72" r="47" fill="#8A5800" opacity="0.18" /><Circle cx="60" cy="70" r="47" fill="url(#pr_b)" />
        <Path d="M18 72 Q6 58 10 44" stroke="#9A6200" strokeWidth="10" strokeLinecap="round" fill="none" />
        <Ellipse cx="10" cy="43" rx="10" ry="8" fill="url(#pr_b)" stroke="#9A6200" strokeWidth="1.2" />
        <Path d="M102 72 Q114 80 112 94" stroke="#9A6200" strokeWidth="10" strokeLinecap="round" fill="none" />
        <Ellipse cx="112" cy="95" rx="10" ry="8" fill="url(#pr_b)" stroke="#9A6200" strokeWidth="1.2" rotation="15" originX="112" originY="95" />
        <SvgText x="96" y="66" fontSize="11" fill="#E05060" opacity="0.8">♥</SvgText>
        <Ellipse cx="40" cy="63" rx="17" ry="18" fill="white" /><Ellipse cx="80" cy="63" rx="17" ry="18" fill="white" />
        <Circle cx="40" cy="65" r="11" fill="#1A1A2E" /><Circle cx="80" cy="65" r="11" fill="#1A1A2E" />
        <Circle cx="44" cy="60" r="4" fill="white" opacity="0.9" /><Circle cx="84" cy="60" r="4" fill="white" opacity="0.9" />
        <Path d="M25 47 Q33 43 43 46" fill="none" stroke="#7A4800" strokeWidth="2.8" strokeLinecap="round" />
        <Path d="M77 46 Q87 43 95 47" fill="none" stroke="#7A4800" strokeWidth="2.8" strokeLinecap="round" />
        <Ellipse cx="27" cy="76" rx="9" ry="5.5" fill="#E87070" opacity="0.2" /><Ellipse cx="93" cy="76" rx="9" ry="5.5" fill="#E87070" opacity="0.2" />
        <Path d="M35 86 Q60 106 85 86" fill="none" stroke="#7A4800" strokeWidth="3.2" strokeLinecap="round" />
        <Rect x="29" y="115" width="22" height="12" rx="6" fill="#C4A878" /><Rect x="69" y="115" width="22" height="12" rx="6" fill="#C4A878" />
        <Circle cx="14" cy="88" r="13" fill="url(#pr_c)" stroke="#A07010" strokeWidth="1.8" />
        <SvgText x="14" y="93" textAnchor="middle" fontWeight="600" fontSize="13" fill="#7A5000">$</SvgText>
      </Svg>
    </Animated.View>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function SatisfactionFeedbackModal({ visible, onClosed, trigger }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: winH } = useWindowDimensions();
  const { streakCount, totalXp } = useGame();

  const [step, setStep] = useState<Step>("checkin");
  const [sentiment, setSentiment] = useState<"love" | "ok" | "off" | null>(null);
  const [chips, setChips] = useState<Set<string>>(() => new Set());
  const [otherNote, setOtherNote] = useState("");
  const [context, setContext] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);

  const barAnim = useRef(new Animated.Value(1)).current;

  // reset on each open
  useEffect(() => {
    if (!visible) return;
    setStep("checkin");
    setSentiment(null);
    setChips(new Set());
    setOtherNote("");
    setContext("");
    setEmail("");
    setConsent(false);
  }, [visible]);

  // auto-dismiss after thanks
  const finish = useCallback(async () => {
    await markFeedbackShown(trigger);
    onClosed();
  }, [onClosed, trigger]);

  useEffect(() => {
    if (step !== "thanks" || !visible) return;
    barAnim.setValue(1);
    Animated.timing(barAnim, { toValue: 0, duration: 2500, useNativeDriver: false }).start();
    const t = setTimeout(() => void finish(), 2700);
    return () => clearTimeout(t);
  }, [step, visible, finish]);

  const toggleChip = (label: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setChips((prev) => {
      const n = new Set(prev);
      n.has(label) ? n.delete(label) : n.add(label);
      return n;
    });
  };

  // ── Handlers ──
  const onLove = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSentiment("love");
    void appendFeedbackLog({ source: "post_day1", sentiment: "love" });
    setStep("thanks");
  };

  const onNotGreat = (s: "ok" | "off") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSentiment(s);
    setStep("feedback");
  };

  const submitFeedback = async () => {
    if (!consent) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await appendFeedbackLog({
      source: "post_day1",
      sentiment: sentiment ?? "off",
      categories: Array.from(chips),
      otherNote: otherNote.trim() || undefined,
      context: context.trim() || undefined,
      email: email.trim() || undefined,
      consent: true,
      consentTimestamp: new Date().toISOString(),
    });
    setStep("thanks");
  };

  const skipFeedback = async () => {
    await appendFeedbackLog({ source: "post_day1", sentiment: sentiment ?? "off" });
    setStep("thanks");
  };

  const dismiss = async () => {
    await markFeedbackShown(trigger);
    onClosed();
  };

  const barWidth = barAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });
  // Explicit height is required: ScrollView collapses to 0 without a defined parent height in RN
  const cardH = Math.min(winH * 0.92, 720);

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
      <View style={s.overlay}>
        {Platform.OS === "ios" ? (
          <BlurView intensity={28} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(28,31,46,0.52)" }]} />
        )}
        {/* tap-outside dismisses only on checkin screen */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={step === "checkin" ? dismiss : undefined}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={[s.centerBox, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 10 }]}
        >
          {/* ── Card: explicit height so inner ScrollViews have room ── */}
          <View style={[s.card, { height: cardH }]}>

            {/* App bar */}
            <View style={s.abar}>
              <View style={s.badgeStreak}>
                <Text style={s.badgeStreakTxt}>🔥 {streakCount}</Text>
              </View>
              <Text style={s.awm}>Debt-Free</Text>
              <View style={s.badgeXp}>
                <Text style={s.badgeXpTxt}>⚡ {totalXp.toLocaleString()}</Text>
              </View>
            </View>

            {/* ── SCREEN 1: Check-in ── */}
            {step === "checkin" && (
              <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={s.popup}
              >
                <DexHappy />
                <Text style={s.popHl}>{"How's it going\nso far?"}</Text>
                <Text style={s.popBody}>Takes 2 seconds. Helps us improve.</Text>
                <View style={s.popDiv} />
                <View style={s.sentBtns}>
                  {(
                    [
                      { emoji: "😄", label: "Loving it", handler: onLove },
                      { emoji: "😐", label: "It's okay", handler: () => onNotGreat("ok") },
                      { emoji: "😕", label: "Something's off", handler: () => onNotGreat("off") },
                    ] as const
                  ).map(({ emoji, label, handler }) => (
                    <Pressable
                      key={label}
                      style={({ pressed }) => [s.sentBtn, pressed && s.sentBtnPressed]}
                      onPress={handler}
                    >
                      <Text style={s.sentEmoji}>{emoji}</Text>
                      <Text style={s.sentLabel}>{label}</Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={s.hint}>Your honest answer helps us fix things</Text>
                <Pressable onPress={dismiss} style={s.notNow}>
                  <Text style={s.notNowTxt}>Not now</Text>
                </Pressable>
              </ScrollView>
            )}

            {/* ── SCREEN 2: Feedback form ── */}
            {step === "feedback" && (
                <ScrollView
                  style={{ flex: 1 }}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={[s.popup, s.popupSm, { paddingBottom: insets.bottom + 12 }]}
                >
                  {/* Back button */}
                  <Pressable
                    onPress={() => setStep("checkin")}
                    style={s.backRow}
                    hitSlop={8}
                  >
                    <Text style={s.backArrow}>←</Text>
                    <Text style={s.backTxt}>Back</Text>
                  </Pressable>

                  <DexWorried />

                  <Text style={[s.popHl, s.popHlSm]}>
                    {"Help us fix it.\n"}
                    <Text style={s.popHlEm}>{"What happened?"}</Text>
                  </Text>

                  {/* Issue chips */}
                  <Text style={s.chipsLbl}>What was the issue?</Text>
                  <View style={s.chipsCol}>
                    {["Something broke", "Too confusing", "Payments or streak wrong"].map((c) => (
                      <Pressable
                        key={c}
                        onPress={() => toggleChip(c)}
                        style={[s.chipFull, chips.has(c) && s.chipOn]}
                      >
                        <Text style={[s.chipTxt, chips.has(c) && s.chipTxtOn]}>{c}</Text>
                      </Pressable>
                    ))}
                  </View>

                  {/* Other */}
                  <Text style={[s.chipsLbl, { marginTop: 4 }]}>Something else?</Text>
                  <TextInput
                    value={otherNote}
                    onChangeText={setOtherNote}
                    placeholder="Describe it briefly…"
                    placeholderTextColor="rgba(80,60,20,0.38)"
                    style={s.inputLine}
                  />

                  {/* Context */}
                  <Text style={[s.chipsLbl, { marginTop: 4 }]}>What were you trying to do?</Text>
                  <TextInput
                    value={context}
                    onChangeText={setContext}
                    placeholder={`e.g. "I logged a payment but my streak didn't update"`}
                    placeholderTextColor="rgba(80,60,20,0.40)"
                    style={s.textArea}
                    multiline
                  />

                  <View style={s.popDiv} />

                  {/* Email */}
                  <Text style={s.chipsLbl}>
                    {"Your email "}
                    <Text style={s.emailSub}>{"— so we can reply when it's fixed"}</Text>
                  </Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@email.com (optional)"
                    placeholderTextColor="rgba(80,60,20,0.38)"
                    style={s.inputLine}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />

                  {/* Consent */}
                  <View style={s.consentRow}>
                    <Pressable
                      onPress={() => setConsent((c) => !c)}
                      hitSlop={8}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: consent }}
                    >
                      <View style={[s.cb, consent && s.cbOn]}>
                        {consent && <Text style={s.cbMark}>✓</Text>}
                      </View>
                    </Pressable>
                    <Text style={s.consentLbl}>
                      {"I agree to share this feedback and my email with the Debt-Free team. "}
                      <Text onPress={() => router.push("/privacy")} style={s.consentLink}>
                        Privacy Policy
                      </Text>
                    </Text>
                  </View>

                  <Pressable
                    style={[s.btnP, { marginTop: 4 }, !consent && { opacity: 0.38 }]}
                    onPress={submitFeedback}
                    disabled={!consent}
                  >
                    <Text style={s.btnPTxt}>Send to the team →</Text>
                  </Pressable>
                  <Pressable style={s.btnS} onPress={skipFeedback}>
                    <Text style={s.btnSTxt}>Skip</Text>
                  </Pressable>
                </ScrollView>
            )}

            {/* ── SCREEN 3: Thank-you ── */}
            {step === "thanks" && (
              <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[s.popup, { alignItems: "center" }]}
              >
                <DexWarm />
                <Text style={s.popHl}>
                  {"Got it.\n"}
                  <Text style={s.popHlEm}>Thank you.</Text>
                </Text>
                <Text style={s.popBody}>
                  {"We read every message and fix real issues. If you left your email, we'll reply."}
                </Text>

                {/* Green thank-you card */}
                <View style={s.tyCard}>
                  <Text style={s.tyHl}>Your feedback matters.</Text>
                  <Text style={s.tyBody}>
                    {"We read every message. If you left your email, we'll reply when it's fixed."}
                  </Text>
                </View>

                <Text style={s.closingTxt}>
                  {"Closing automatically…\n"}
                  <Text style={s.closingEm}>Thank you for helping us improve.</Text>
                </Text>

                {/* Amber drain bar */}
                <View style={s.barWrap}>
                  <Animated.View style={[s.barFill, { width: barWidth }]} />
                </View>
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "center", alignItems: "center" },
  centerBox: {
    width: "100%",
    maxWidth: 460,
    paddingHorizontal: 14,
    justifyContent: "center",
  },

  // card shell
  card: {
    width: "100%",
    backgroundColor: CARD_BG,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "rgba(208,138,16,0.15)",
    shadowColor: "#1C1F2E",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.2,
    shadowRadius: 36,
    elevation: 16,
    overflow: "hidden",
  },

  // top bar — matches .abar from HTML
  abar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(208,138,16,0.12)",
    backgroundColor: CARD_BG,
  },
  badgeStreak: {
    backgroundColor: "#FFF5E0",
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  badgeStreakTxt: { fontFamily: Fonts.bold, fontSize: 11, color: "#9A5800" },
  awm: { fontFamily: Fonts.serif, fontStyle: "italic", fontSize: 13, color: NAVY },
  badgeXp: {
    backgroundColor: "#EDE7F6",
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  badgeXpTxt: { fontFamily: Fonts.bold, fontSize: 11, color: "#4A2BA0" },

  // popup content — matches .popup from HTML (padding: 18px 12px 14px, gap: 9px)
  popup: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 18,
    alignItems: "center",
    gap: 9,
  },
  popupSm: { gap: 8 },

  popHl: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    color: NAVY,
    textAlign: "center",
    lineHeight: 30,
  },
  popHlSm: { fontSize: 18 },
  popHlEm: { fontStyle: "italic", color: AMBER_D },

  popBody: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#111111",
    textAlign: "center",
    lineHeight: 22,
  },

  popDiv: {
    width: "100%",
    height: 1,
    backgroundColor: "rgba(208,138,16,0.14)",
  },

  // sentiment buttons
  sentBtns: { width: "100%", gap: 7 },
  sentBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "white",
    borderWidth: 1.5,
    borderColor: "#C8B88A",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 13,
  },
  sentBtnPressed: { backgroundColor: "#FFF8EC", borderColor: AMBER },
  sentEmoji: { fontSize: 18 },
  sentLabel: { fontFamily: Fonts.semiBold, fontSize: 14, color: NAVY },

  hint: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: "#111111",
    textAlign: "center",
  },
  notNow: { paddingVertical: 6, paddingHorizontal: 12 },
  notNowTxt: { fontFamily: Fonts.semiBold, fontSize: 15, color: "#111111" },

  backRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  backArrow: {
    fontSize: 18,
    color: AMBER_D,
    lineHeight: 22,
    fontFamily: Fonts.semiBold,
  },
  backTxt: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: AMBER_D,
  },

  // chips — matches .chips-lbl / .chip-full from HTML
  chipsLbl: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    letterSpacing: 0.9,
    textTransform: "uppercase",
    color: "#3A2000",
    alignSelf: "flex-start",
  },
  emailSub: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    textTransform: "none",
    letterSpacing: 0,
    color: "#5A3800",
    fontWeight: "500",
  },
  chipsCol: { width: "100%", gap: 6 },
  chipFull: {
    width: "100%",
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: "#C8B88A",
    borderRadius: 12,
    backgroundColor: "white",
  },
  chipOn: { backgroundColor: AMBER, borderColor: AMBER },
  chipTxt: { fontFamily: Fonts.semiBold, fontSize: 13, color: NAVY },
  chipTxtOn: { color: "white" },

  // inputs
  inputLine: {
    width: "100%",
    borderWidth: 1.5,
    borderColor: "#C0A870",
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 9,
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: NAVY,
    backgroundColor: "white",
  },
  textArea: {
    width: "100%",
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: "#C0A870",
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 9,
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: NAVY,
    backgroundColor: "white",
    textAlignVertical: "top",
  },

  // consent
  consentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    width: "100%",
    marginTop: 2,
  },
  cb: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: MUTED,
    marginTop: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  cbOn: { backgroundColor: AMBER, borderColor: AMBER },
  cbMark: { color: "white", fontSize: 9, fontFamily: Fonts.bold, lineHeight: 10 },
  consentLbl: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: MUTED,
    lineHeight: 16,
  },
  consentLink: { color: AMBER_D, fontFamily: Fonts.semiBold },

  // buttons — match .btn-p / .btn-s from HTML
  btnP: {
    width: "100%",
    borderRadius: 13,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: AMBER,
    shadowColor: AMBER_D,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  btnPTxt: { fontFamily: Fonts.bold, fontSize: 13, color: "white" },
  btnS: {
    width: "100%",
    borderRadius: 13,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#EDE4D0",
    borderWidth: 1.5,
    borderColor: "#C8B48A",
  },
  btnSTxt: { fontFamily: Fonts.semiBold, fontSize: 12, color: "#5A4820" },

  // thank-you card — .ty-card.ty-green-light
  tyCard: {
    width: "100%",
    borderRadius: 13,
    padding: 14,
    backgroundColor: "#D4F5E2",
    borderWidth: 1.5,
    borderColor: "rgba(32,160,96,0.3)",
    alignItems: "center",
    gap: 6,
  },
  tyHl: {
    fontFamily: Fonts.serif,
    fontStyle: "italic",
    fontSize: 16,
    color: NAVY,
    textAlign: "center",
  },
  tyBody: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: "#3A3A3A",
    textAlign: "center",
    lineHeight: 19,
  },

  closingTxt: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: "#7A6030",
    textAlign: "center",
    lineHeight: 19,
  },
  closingEm: { color: AMBER_D, fontFamily: Fonts.semiBold },

  barWrap: {
    width: "100%",
    height: 3,
    backgroundColor: "rgba(208,138,16,0.12)",
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: { height: "100%", backgroundColor: AMBER, borderRadius: 2 },
});

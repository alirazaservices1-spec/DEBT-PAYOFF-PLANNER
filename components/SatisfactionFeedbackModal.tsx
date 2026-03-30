import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import * as StoreReview from "expo-store-review";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DexCoin } from "@/components/DexCoin";
import { Fonts } from "@/constants/fonts";
import { appendFeedbackLog } from "@/lib/submitAppFeedback";
import { markPostDay1SatisfactionComplete } from "@/lib/satisfactionFeedbackGate";

const NAVY = "#1C1F2E";
const PAGE = "#FDFAF2";
const AMBER = "#D08A10";
const AMBER_D = "#8A5000";
const MUTED = "#8A7A50";

const FEEDBACK_CHIPS = ["Something broke", "Too confusing", "Payments or streak wrong"] as const;

type Step = "checkin" | "review" | "feedback" | "thanks";

type Props = {
  visible: boolean;
  onClosed: () => void;
};

export function SatisfactionFeedbackModal({ visible, onClosed }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: winH } = useWindowDimensions();

  const [step, setStep] = useState<Step>("checkin");
  const [thanksKind, setThanksKind] = useState<"happy" | "feedback">("happy");
  const [sentiment, setSentiment] = useState<"love" | "ok" | "off" | null>(null);
  const [chips, setChips] = useState<Set<string>>(() => new Set());
  const [otherNote, setOtherNote] = useState("");
  const [context, setContext] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setStep("checkin");
    setThanksKind("happy");
    setSentiment(null);
    setChips(new Set());
    setOtherNote("");
    setContext("");
    setEmail("");
    setConsent(false);
  }, [visible]);

  const finish = useCallback(async () => {
    await markPostDay1SatisfactionComplete();
    onClosed();
  }, [onClosed]);

  useEffect(() => {
    if (step !== "thanks" || !visible) return;
    const t = setTimeout(() => {
      void finish();
    }, 2600);
    return () => clearTimeout(t);
  }, [step, finish, visible]);

  const toggleChip = (label: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setChips((prev) => {
      const n = new Set(prev);
      if (n.has(label)) n.delete(label);
      else n.add(label);
      return n;
    });
  };

  const onLove = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSentiment("love");
    setStep("review");
  };

  const onNotGreat = (s: "ok" | "off") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSentiment(s);
    setStep("feedback");
  };

  const requestReview = async () => {
    try {
      if (await StoreReview.hasAction()) {
        await StoreReview.requestReview();
      }
    } catch {
      /* quota / simulator */
    }
    await appendFeedbackLog({
      source: "post_day1",
      sentiment: "love",
      requestedReview: true,
    });
    setThanksKind("happy");
    setStep("thanks");
  };

  const skipReview = async () => {
    await appendFeedbackLog({
      source: "post_day1",
      sentiment: "love",
      requestedReview: false,
    });
    setThanksKind("happy");
    setStep("thanks");
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
    });
    setThanksKind("feedback");
    setStep("thanks");
  };

  const dismissCheckin = async () => {
    await markPostDay1SatisfactionComplete();
    onClosed();
  };

  const maxModalH = Math.min(winH * 0.88, 620);

  const card = (
      <View style={[styles.card, { maxHeight: maxModalH }]}>
        {step === "checkin" && (
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={{ alignItems: "center", marginBottom: 10 }}>
              <DexCoin mood="overjoyed" motion="nod" size={88} />
            </View>
            <Text style={styles.popHl}>
              How&apos;s it going{"\n"}so far?
            </Text>
            <Text style={styles.popBody}>Takes 2 seconds. Helps us improve.</Text>
            <View style={styles.div} />
            <View style={styles.sentCol}>
              <Pressable style={({ pressed }) => [styles.sentBtn, pressed && { opacity: 0.92 }]} onPress={onLove}>
                <Text style={styles.sentEmoji}>😄</Text>
                <Text style={styles.sentLabel}>Loving it</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.sentBtn, pressed && { opacity: 0.92 }]}
                onPress={() => onNotGreat("ok")}
              >
                <Text style={styles.sentEmoji}>😐</Text>
                <Text style={styles.sentLabel}>It&apos;s okay</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.sentBtn, pressed && { opacity: 0.92 }]}
                onPress={() => onNotGreat("off")}
              >
                <Text style={styles.sentEmoji}>😕</Text>
                <Text style={styles.sentLabel}>Something&apos;s off</Text>
              </Pressable>
            </View>
            <Text style={styles.hint}>Your honest answer helps us fix things</Text>
            <Pressable onPress={dismissCheckin} style={styles.notNow}>
              <Text style={styles.notNowText}>Not now</Text>
            </Pressable>
          </ScrollView>
        )}

        {step === "review" && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ alignItems: "center", marginBottom: 8 }}>
              <DexCoin mood="proud" motion="nod" size={80} />
            </View>
            <Text style={styles.popHl}>Glad you&apos;re enjoying it</Text>
            <Text style={styles.popBody}>
              If you have a moment, a quick App Store rating helps others find DebtPath.
            </Text>
            <View style={styles.div} />
            <Pressable style={styles.btnPrimary} onPress={requestReview}>
              <Text style={styles.btnPrimaryText}>Rate DebtPath</Text>
            </Pressable>
            <Pressable style={styles.btnSecondary} onPress={skipReview}>
              <Text style={styles.btnSecondaryText}>Maybe later</Text>
            </Pressable>
          </ScrollView>
        )}

        {step === "feedback" && (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={insets.bottom + 12}
            style={{ flex: 1 }}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: insets.bottom + 8 }}
            >
              <View style={{ alignItems: "center", marginBottom: 6 }}>
                <DexCoin mood="thinking" motion="float" size={72} />
              </View>
              <Text style={[styles.popHl, { fontSize: 17 }]}>
                Help us fix it.{"\n"}
                <Text style={{ fontFamily: Fonts.serif, fontStyle: "italic", color: AMBER_D }}>What happened?</Text>
              </Text>
              <Text style={styles.chipsLbl}>What was the issue?</Text>
              {FEEDBACK_CHIPS.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => toggleChip(c)}
                  style={[styles.chipFull, chips.has(c) && styles.chipFullOn]}
                >
                  <Text style={[styles.chipFullText, chips.has(c) && styles.chipFullTextOn]}>{c}</Text>
                </Pressable>
              ))}
              <Text style={[styles.chipsLbl, { marginTop: 8 }]}>Something else?</Text>
              <TextInput
                value={otherNote}
                onChangeText={setOtherNote}
                placeholder="Describe it briefly..."
                placeholderTextColor="rgba(80,60,20,0.38)"
                style={styles.inputLine}
              />
              <Text style={[styles.chipsLbl, { marginTop: 8 }]}>What were you trying to do?</Text>
              <TextInput
                value={context}
                onChangeText={setContext}
                placeholder='e.g. "I logged a payment but my streak did not update"'
                placeholderTextColor="rgba(80,60,20,0.38)"
                style={styles.textArea}
                multiline
              />
              <View style={styles.div} />
              <Text style={styles.chipsLbl}>
                Your email{" "}
                <Text style={{ fontWeight: "500", textTransform: "none", letterSpacing: 0, color: "#5A3800", fontSize: 11 }}>
                  — optional; we can reply when it&apos;s fixed
                </Text>
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@email.com"
                placeholderTextColor="rgba(80,60,20,0.38)"
                style={styles.inputLine}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View style={styles.consentRow}>
                <Pressable onPress={() => setConsent((c) => !c)} hitSlop={8} accessibilityRole="checkbox" accessibilityState={{ checked: consent }}>
                  <View style={[styles.cb, consent && styles.cbOn]}>{consent ? <Text style={styles.cbMark}>✓</Text> : null}</View>
                </Pressable>
                <View style={{ flex: 1 }}>
                  <Text style={styles.consentLbl}>
                    I agree to share this feedback
                    {email.trim() ? " and my email" : ""} with the team to help fix issues.{" "}
                    <Text onPress={() => router.push("/privacy")} style={styles.consentLink}>
                      Privacy Policy
                    </Text>
                  </Text>
                </View>
              </View>
              <Pressable
                style={[styles.btnPrimary, !consent && { opacity: 0.45 }]}
                onPress={submitFeedback}
                disabled={!consent}
              >
                <Text style={styles.btnPrimaryText}>Send to the team →</Text>
              </Pressable>
              <Pressable
                style={styles.btnSecondary}
                onPress={async () => {
                  await markPostDay1SatisfactionComplete();
                  onClosed();
                }}
              >
                <Text style={styles.btnSecondaryText}>Skip</Text>
              </Pressable>
            </ScrollView>
          </KeyboardAvoidingView>
        )}

        {step === "thanks" && (
          <View style={{ alignItems: "center" }}>
            <DexCoin mood={thanksKind === "feedback" ? "encouraging" : "congratulating"} motion="nod" size={88} />
            <Text style={[styles.popHl, { marginTop: 12 }]}>Got it.{"\n"}Thank you.</Text>
            <Text style={styles.popBody}>
              {thanksKind === "feedback"
                ? "We read every message and fix real issues. If you left your email, we’ll reply."
                : "Thanks for being here. Keep crushing those goals."}
            </Text>
            {thanksKind === "feedback" && (
              <View style={styles.tyCard}>
                <Text style={styles.tyHl}>Your feedback matters.</Text>
                <Text style={styles.tyBody}>We read every message. If you left your email, we’ll reply when it’s fixed.</Text>
              </View>
            )}
            <Text style={styles.closing}>Closing automatically…</Text>
          </View>
        )}
      </View>
  );

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
      <View style={styles.overlay}>
        {Platform.OS === "ios" ? (
          <BlurView intensity={28} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(28,31,46,0.55)" }]} />
        )}
        <Pressable style={StyleSheet.absoluteFill} onPress={step === "checkin" ? dismissCheckin : undefined} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={[styles.centerBox, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }]}
        >
          {card}
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centerBox: {
    width: "100%",
    maxWidth: 400,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  card: {
    width: "100%",
    backgroundColor: PAGE,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.5,
    borderColor: "rgba(208,138,16,0.15)",
    shadowColor: "#1C1F2E",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  popHl: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    color: NAVY,
    textAlign: "center",
    lineHeight: 28,
    marginBottom: 6,
  },
  popBody: {
    fontSize: 13,
    color: "#4A3820",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 4,
  },
  div: {
    width: "100%",
    height: 1,
    backgroundColor: "rgba(208,138,16,0.14)",
    marginVertical: 12,
  },
  sentCol: { gap: 8, width: "100%" },
  sentBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1.5,
    borderColor: "#C8B88A",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
  },
  sentEmoji: { fontSize: 20 },
  sentLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: NAVY,
  },
  hint: {
    marginTop: 10,
    fontSize: 11,
    color: "rgba(138,122,80,0.55)",
    textAlign: "center",
  },
  notNow: { marginTop: 14, alignSelf: "center", padding: 8 },
  notNowText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: MUTED,
  },
  chipsLbl: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#3A2000",
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  chipFull: {
    width: "100%",
    borderWidth: 1.5,
    borderColor: "#C8B88A",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 6,
    backgroundColor: "#fff",
  },
  chipFullOn: {
    backgroundColor: AMBER,
    borderColor: AMBER,
  },
  chipFullText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: NAVY,
  },
  chipFullTextOn: { color: "#fff" },
  inputLine: {
    width: "100%",
    borderWidth: 1.5,
    borderColor: "#C0A870",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: NAVY,
    marginBottom: 4,
  },
  textArea: {
    width: "100%",
    minHeight: 72,
    borderWidth: 1.5,
    borderColor: "#C0A870",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: NAVY,
    textAlignVertical: "top",
  },
  consentRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginTop: 10, marginBottom: 8 },
  cb: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#8A7A50",
    marginTop: 2,
  },
  cbOn: {
    backgroundColor: AMBER,
    borderColor: AMBER,
    alignItems: "center",
    justifyContent: "center",
  },
  cbMark: { color: "#fff", fontSize: 11, fontFamily: Fonts.bold, lineHeight: 12 },
  consentLbl: {
    flex: 1,
    fontSize: 11,
    color: MUTED,
    lineHeight: 17,
  },
  consentLink: {
    color: AMBER_D,
    fontFamily: Fonts.semiBold,
  },
  btnPrimary: {
    width: "100%",
    backgroundColor: AMBER,
    borderRadius: 13,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
    shadowColor: AMBER_D,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  btnPrimaryText: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: "#fff",
  },
  btnSecondary: {
    width: "100%",
    borderRadius: 13,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
    backgroundColor: "#EDE4D0",
    borderWidth: 1.5,
    borderColor: "#C8B48A",
  },
  btnSecondaryText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: "#5A4820",
  },
  tyCard: {
    width: "100%",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#D4F5E2",
    borderWidth: 1.5,
    borderColor: "rgba(32,160,96,0.3)",
    marginTop: 12,
    alignItems: "center",
  },
  tyHl: {
    fontFamily: Fonts.serif,
    fontSize: 17,
    fontStyle: "italic",
    color: NAVY,
    marginBottom: 4,
  },
  tyBody: {
    fontSize: 12,
    color: "#3A3A3A",
    textAlign: "center",
    lineHeight: 18,
  },
  closing: {
    marginTop: 14,
    fontSize: 11,
    color: "#7A6030",
    textAlign: "center",
  },
});

import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Fonts } from "@/constants/fonts";
import {
  miniIconForAnim,
  type OnboardingMiniCelebrationConfig,
} from "@/lib/onboardingMiniCelebrations";
import { soundManager } from "@/utils/SoundManager";

type Props = {
  visible: boolean;
  config: OnboardingMiniCelebrationConfig | null;
  onComplete: () => void;
};

const { width: SW } = Dimensions.get("window");

/**
 * Lightweight Tier 1 (Micro) / Tier 2 (Small) moment — mirrors HTML prototype:
 * icon pop + floating pill; tier 2 adds flash + banner + slam line.
 */
export function MiniCelebrationOverlay({ visible, config, onComplete }: Props) {
  const iconScale = useRef(new Animated.Value(0)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;
  const pillY = useRef(new Animated.Value(12)).current;
  const pillOp = useRef(new Animated.Value(0)).current;
  const flashOp = useRef(new Animated.Value(0)).current;
  const bannerY = useRef(new Animated.Value(-80)).current;
  const bannerOp = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishedRef = useRef(false);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    onComplete();
  };

  useEffect(() => {
    if (!visible || !config) {
      finishedRef.current = false;
      iconScale.setValue(0);
      pillOp.setValue(0);
      pillY.setValue(12);
      flashOp.setValue(0);
      bannerY.setValue(-80);
      bannerOp.setValue(0);
      return;
    }

    finishedRef.current = false;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    soundManager.play(config.sound);

    if (config.tier >= 2) {
      Animated.sequence([
        Animated.timing(flashOp, { toValue: 0.35, duration: 120, useNativeDriver: true }),
        Animated.timing(flashOp, { toValue: 0, duration: 280, useNativeDriver: true }),
      ]).start();
    }

    iconRotate.setValue(0);
    Animated.parallel([
      Animated.spring(iconScale, { toValue: 1, friction: 6, tension: 140, useNativeDriver: true }),
      config.anim === "coin"
        ? Animated.timing(iconRotate, { toValue: 1, duration: 700, useNativeDriver: true })
        : Animated.timing(iconRotate, { toValue: 0, duration: 1, useNativeDriver: true }),
    ]).start();

    Animated.sequence([
      Animated.delay(config.tier >= 2 ? 220 : 280),
      Animated.parallel([
        Animated.timing(pillOp, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(pillY, { toValue: -6, duration: 550, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();

    if (config.tier >= 2 && config.slam) {
      Animated.sequence([
        Animated.delay(380),
        Animated.parallel([
          Animated.timing(bannerOp, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.spring(bannerY, { toValue: 0, friction: 9, tension: 120, useNativeDriver: true }),
        ]),
      ]).start();
    }

    timerRef.current = setTimeout(finish, config.durationMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot choreography per open
  }, [visible, config]);

  if (!visible || !config) return null;

  const iconEmoji = config.icon ?? miniIconForAnim(config.anim);
  const spin = iconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Modal transparent visible animationType="none" onRequestClose={finish}>
      <Pressable style={styles.backdrop} onPress={finish} accessibilityLabel="Dismiss celebration">
        <Animated.View pointerEvents="none" style={[styles.flash, { opacity: flashOp }]} />

        <View style={styles.center} pointerEvents="box-none">
          {config.tier >= 2 && config.slam && (
            <Animated.View
              style={[
                styles.banner,
                {
                  opacity: bannerOp,
                  transform: [{ translateY: bannerY }],
                },
              ]}
            >
              <Text style={styles.bannerSlam}>{config.slam}</Text>
              {config.sub ? <Text style={styles.bannerSub}>{config.sub}</Text> : null}
            </Animated.View>
          )}

          <Animated.View
            style={[
              styles.iconWrap,
              {
                transform: [{ scale: iconScale }, { rotate: config.anim === "coin" ? spin : "0deg" }],
              },
            ]}
          >
            <Text style={styles.iconEmoji}>{iconEmoji}</Text>
          </Animated.View>

          <Animated.View
            style={{
              opacity: pillOp,
              transform: [{ translateY: pillY }],
              marginTop: 14,
            }}
          >
            <View style={styles.pill}>
              <Text style={styles.pillText}>{config.pillText}</Text>
            </View>
          </Animated.View>

          <Text style={styles.tapHint}>Tap anywhere to continue</Text>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(28, 31, 46, 0.55)",
    justifyContent: "center",
    alignItems: "center",
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(208, 138, 16, 0.25)",
  },
  center: {
    alignItems: "center",
    paddingHorizontal: 24,
    maxWidth: SW - 32,
  },
  banner: {
    backgroundColor: "#FDFAF2",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: "rgba(208, 138, 16, 0.25)",
    width: "100%",
    maxWidth: 320,
  },
  bannerSlam: {
    fontFamily: Fonts.black,
    fontSize: 16,
    color: "#1C1F2E",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  bannerSub: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: "#8A7A50",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 17,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: "rgba(253, 250, 242, 0.95)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(208, 138, 16, 0.35)",
  },
  iconEmoji: {
    fontSize: 40,
  },
  pill: {
    backgroundColor: "#4A2BA0",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 14,
    shadowColor: "#4A2BA0",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  pillText: {
    fontFamily: Fonts.extraBold,
    fontSize: 12,
    color: "#FFFFFF",
    textAlign: "center",
  },
  tapHint: {
    marginTop: 22,
    fontFamily: Fonts.bold,
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
});

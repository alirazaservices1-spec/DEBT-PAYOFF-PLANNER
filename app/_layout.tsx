import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { View, Text, StyleSheet, Image, Appearance, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { Asset } from "expo-asset";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { DebtProvider, useDebts } from "@/context/DebtContext";
import { useGame } from "@/context/GameContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { GameProvider } from "@/context/GameContext";
import { GoalProvider } from "@/context/GoalContext";
import { StreakReminderProvider } from "@/context/StreakReminderContext";
import { WeeklySummaryProvider } from "@/context/WeeklySummaryContext";
import { DesignBriefNotificationsProvider } from "@/context/DesignBriefNotificationsContext";
import { CelebrationHost } from "@/components/CelebrationHost";
import { SatisfactionFeedbackModal } from "@/components/SatisfactionFeedbackModal";
import { incrementSessionCount, hasTriggerFired } from "@/lib/satisfactionFeedbackGate";
import { soundManager } from "@/utils/SoundManager";
import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useFonts } from "expo-font";
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from "@expo-google-fonts/nunito";
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
} from "@expo-google-fonts/jetbrains-mono";
import { DMSerifDisplay_400Regular } from "@expo-google-fonts/dm-serif-display";

// Force light mode at the iOS/Android native level so native components
// (BlurView, status bar, etc.) never paint with the system dark appearance
// on first mount — even when the device is in system dark mode.
if (Platform.OS !== "web") {
  Appearance.setColorScheme("light");
}

// Keep the native splash visible until our app shell is fully ready.
SplashScreen.preventAutoHideAsync().catch(() => {});

// We now rely entirely on the native splash (configured in app.json) and no longer
// render a JS splash screen, so the icon appears immediately with no extra fade.

function calDaysAway(prevDate: string | null): number {
  if (!prevDate) return 0;
  const fromStr = new Date(prevDate).toISOString().split("T")[0];
  const toStr = new Date().toISOString().split("T")[0];
  const msA = new Date(fromStr).getTime();
  const msB = new Date(toStr).getTime();
  return Math.round((msB - msA) / (1000 * 60 * 60 * 24));
}

function AppNavigator() {
  const { onboardingDone, debts } = useDebts();
  const { prevLastOpenedAt } = useGame();
  const router = useRouter();
  const segments = useSegments();
  const redirected = useRef(false);
  const welcomeShown = useRef(false);
  const homeShown = useRef(false);
  const [ready, setReady] = useState(true);
  const debtsRef = useRef(debts);
  const [session5FeedbackVisible, setSession5FeedbackVisible] = useState(false);
  const sessionCountedRef = useRef(false);

  useEffect(() => {
    debtsRef.current = debts;
  }, [debts]);

  // Session-5 feedback trigger: increment once per app launch when onboarded
  useEffect(() => {
    if (!onboardingDone || sessionCountedRef.current) return;
    sessionCountedRef.current = true;
    void (async () => {
      const count = await incrementSessionCount();
      if (count === 5) {
        const alreadyFired = await hasTriggerFired("session_5");
        if (!alreadyFired) {
          setTimeout(() => setSession5FeedbackVisible(true), 1800);
        }
      }
    })();
  }, [onboardingDone]);

  useEffect(() => {
    const inOnboarding   = segments[0] === "onboarding";
    const inWelcomeBack  = segments[0] === "welcome-back";
    const inMainMenu     = segments[0] === "main-menu";
    const inDayComplete  = segments[0] === "day-complete";

    // 1. Not onboarded → send to onboarding
    if (!onboardingDone && !inOnboarding) {
      if (!redirected.current) {
        redirected.current = true;
        router.replace("/onboarding");
        // Avoid blank screen if the redirect doesn't trigger a second render.
        setReady(true);
      }
      return;
    }

    // 2. Onboarded + been away 3+ days → show welcome-back first
    if (onboardingDone && !inWelcomeBack && !welcomeShown.current) {
      const daysAway = calDaysAway(prevLastOpenedAt);
      if (daysAway >= 3) {
        welcomeShown.current = true;
        router.replace("/welcome-back");
        // Avoid blank screen if the redirect doesn't trigger a second render.
        setReady(true);
        return;
      }
    }

    // 3. Already in main-menu or day-complete — mark home as shown and be ready
    if (inMainMenu || inDayComplete) {
      homeShown.current = true;
      setReady(true);
      return;
    }

    // 4. First landing after onboarding (every app open) → show tabbed Home
    // Avoid redirect flicker when we set onboardingDone from within the onboarding flow
    // and immediately route to another screen (e.g. `/day-complete`).
    if (onboardingDone && !homeShown.current && !inWelcomeBack && !inOnboarding) {
      homeShown.current = true;
      router.replace("/(tabs)/dashboard");
      // Avoid blank screen if the redirect doesn't trigger a second render.
      setReady(true);
      return;
    }

    setReady(true);
  }, [onboardingDone, segments, prevLastOpenedAt]);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as any;
      if (data?.type === "interest_saved_weekly") {
        void soundManager.play("interest_saved");
      } else if (data?.type === "variable_bonus") {
        void soundManager.play("variable_bonus");
      }
      if (data?.type === "streak_reminder") {
        const candidate =
          debtsRef.current.find((d: any) => (d.balance ?? 0) > 0) ?? debtsRef.current[0];

        const debtId = candidate?.id;
        if (debtId) {
          router.push(`/debt/${debtId}?tab=transactions&openMarkPaid=1`);
        } else {
          // If there are no debts yet, just take them to the debts tab.
          router.push("/(tabs)/dashboard");
        }
      } else if (data?.type === "day_activities_reminder") {
        router.push("/day-complete");
      }
    });
    return () => sub.remove();
  }, []);

  if (!ready) return null;

  return (
    <>
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="onboarding"
        options={{ headerShown: false, gestureEnabled: false, animation: "none" }}
      />
      <Stack.Screen
        name="debt/[id]"
        options={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="privacy"
        options={{ headerShown: false, animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="settings"
        options={{ headerShown: false, animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="terms"
        options={{ headerShown: false, animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="welcome-back"
        options={{ headerShown: false, gestureEnabled: false, animation: "fade" }}
      />
      <Stack.Screen
        name="levels"
        options={{ headerShown: false, animation: "slide_from_bottom" }}
      />
      <Stack.Screen
        name="day-complete"
        options={{ headerShown: false, animation: "slide_from_bottom", gestureEnabled: false }}
      />
      <Stack.Screen
        name="main-menu"
        options={{ headerShown: false, animation: "fade", gestureEnabled: false }}
      />
      <Stack.Screen name="+not-found" />
    </Stack>
    <SatisfactionFeedbackModal
      visible={session5FeedbackVisible}
      trigger="session_5"
      onClosed={() => setSession5FeedbackVisible(false)}
    />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
    DMSerifDisplay_400Regular,
  });

  // Until fonts are ready, keep the native splash visible.
  useEffect(() => {
    if (fontsLoaded) {
      // Preload the app icon image so it appears instantly on onboarding splash
      Asset.fromModule(require("@/assets/images/iconApp.png")).downloadAsync().catch(() => {});
      soundManager.preload().catch(() => {});
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <KeyboardProvider>
            <ThemeProvider>
              <CurrencyProvider>
                <NotificationProvider>
                  <DebtProvider>
                    <DesignBriefNotificationsProvider>
                      <GameProvider>
                        <GoalProvider>
                          <StreakReminderProvider>
                            <WeeklySummaryProvider>
                              <AppNavigator />
                              <CelebrationHost />
                            </WeeklySummaryProvider>
                          </StreakReminderProvider>
                        </GoalProvider>
                      </GameProvider>
                    </DesignBriefNotificationsProvider>
                  </DebtProvider>
                </NotificationProvider>
              </CurrencyProvider>
            </ThemeProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { View, Text, StyleSheet, Image, useColorScheme } from "react-native";
import * as Notifications from "expo-notifications";
import { Asset } from "expo-asset";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { DebtProvider, useDebts } from "@/context/DebtContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { GameProvider } from "@/context/GameContext";
import { GoalProvider } from "@/context/GoalContext";
import { StreakReminderProvider } from "@/context/StreakReminderContext";
import { WeeklySummaryProvider } from "@/context/WeeklySummaryContext";
import { DesignBriefNotificationsProvider } from "@/context/DesignBriefNotificationsContext";
import { CelebrationHost } from "@/components/CelebrationHost";
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

// Keep the native splash visible until our app shell is fully ready.
SplashScreen.preventAutoHideAsync().catch(() => {});

// We now rely entirely on the native splash (configured in app.json) and no longer
// render a JS splash screen, so the icon appears immediately with no extra fade.

function AppNavigator() {
  const { onboardingDone } = useDebts();
  const router = useRouter();
  const segments = useSegments();
  const redirected = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const inOnboarding = segments[0] === "onboarding";

    if (!onboardingDone && !inOnboarding) {
      if (!redirected.current) {
        redirected.current = true;
        router.replace("/onboarding");
      }
      return;
    }

    setReady(true);
  }, [onboardingDone, segments]);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as any;
      if (data?.type === "streak_reminder") {
        router.push("/(tabs)/dashboard?openLog=1");
      }
    });
    return () => sub.remove();
  }, []);

  if (!ready) return null;

  return (
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
      <Stack.Screen name="+not-found" />
    </Stack>
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

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

const THEME_KEY = "@debtfree_theme";

export type ThemePreference = "light" | "dark" | "system";

interface ThemeContextValue {
  themePreference: ThemePreference;
  setThemePreference: (pref: ThemePreference) => Promise<void>;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>("light");

  const isDark =
    themePreference === "dark" ? true :
    themePreference === "light" ? false :
    systemScheme === "dark";

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(THEME_KEY);
      if (saved !== "light") {
        // Overwrite any legacy "system"/"dark" value (or first launch) so the
        // preference is always "light" — dark mode has been removed from the app.
        await AsyncStorage.setItem(THEME_KEY, "light");
      }
      // State already defaults to "light" so no setState needed here.
    })();
  }, []);

  const setThemePreference = useCallback(async (pref: ThemePreference) => {
    setThemePreferenceState(pref);
    await AsyncStorage.setItem(THEME_KEY, pref);
  }, []);

  const value: ThemeContextValue = { themePreference, setThemePreference, isDark };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemePreference() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemePreference must be used within ThemeProvider");
  return ctx;
}

export function useIsDark(): boolean {
  const ctx = useContext(ThemeContext);
  if (!ctx) return false;
  return ctx.isDark;
}

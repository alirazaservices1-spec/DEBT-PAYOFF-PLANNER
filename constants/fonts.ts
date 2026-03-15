// Font family names — loaded in _layout.tsx via useFonts
// Nunito: body, display, buttons
// JetBrains Mono: all numbers, dates, amounts
export const Fonts = {
  regular:    "Nunito_400Regular",
  semiBold:   "Nunito_600SemiBold",
  bold:       "Nunito_700Bold",
  extraBold:  "Nunito_800ExtraBold",
  black:      "Nunito_900Black",
  mono:       "JetBrainsMono_400Regular",
  monoMedium: "JetBrainsMono_500Medium",
};

// Apply to StyleSheet: fontFamily: Fonts.bold
// Numbers always use: fontFamily: Fonts.mono

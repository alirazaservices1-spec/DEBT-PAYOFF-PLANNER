// Font family names — loaded in _layout.tsx via useFonts
// Nunito: body, display, buttons
// JetBrains Mono: all numbers, dates, amounts
// DM Serif Display: headings, large display numbers (matches HTML design reference)
export const Fonts = {
  regular:    "Nunito_400Regular",
  semiBold:   "Nunito_600SemiBold",
  bold:       "Nunito_700Bold",
  extraBold:  "Nunito_800ExtraBold",
  black:      "Nunito_900Black",
  mono:       "JetBrainsMono_400Regular",
  monoMedium: "JetBrainsMono_500Medium",
  serif:      "DMSerifDisplay_400Regular",
};

// Apply to StyleSheet: fontFamily: Fonts.bold
// Numbers always use: fontFamily: Fonts.mono

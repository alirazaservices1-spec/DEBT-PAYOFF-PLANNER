const PRIMARY = "#2ECC71";
const PRIMARY_DARK = "#27AE60";
const ACCENT = "#1ABC9C";
// Doc 2.4: "Green colors for debts getting smaller" (progress visualization)
const PROGRESS_GREEN = "#22C55E";
// WCAG AA-safe greens for white text on buttons (contrast ratios: buttonGreen=4.95:1, buttonGreenDark=7.68:1)
const BUTTON_GREEN = "#1A7A3F";
const BUTTON_GREEN_DARK = "#145A2E";

export default {
  primary: PRIMARY,
  primaryDark: PRIMARY_DARK,
  accent: ACCENT,
  progressGreen: PROGRESS_GREEN,
  buttonGreen: BUTTON_GREEN,
  buttonGreenDark: BUTTON_GREEN_DARK,
  danger: "#E74C3C",
  warning: "#F39C12",
  light: {
    // High-contrast, Duolingo-inspired light theme
    text: "#05130A",
    textSecondary: "#234332",
    background: "#FFFFFF",
    surface: "#FFFFFF",
    surfaceSecondary: "#F0FAF3",
    border: "#C9DFD2",
    tint: PRIMARY,
    tabIconDefault: "#446856",
    tabIconSelected: PRIMARY,
    card: "#FFFFFF",
    cardShadow: "rgba(46,204,113,0.14)",
  },
  dark: {
    // White/light text on dark backgrounds — no grey-on-black
    text: "#FFFFFF",
    textSecondary: "#E5E5E5",
    background: "#050A07",
    surface: "#0D1710",
    surfaceSecondary: "#152219",
    border: "#284033",
    tint: PRIMARY,
    tabIconDefault: "#C4E1D1",
    tabIconSelected: PRIMARY,
    card: "#101C14",
    cardShadow: "rgba(46,204,113,0.20)",
  },
};

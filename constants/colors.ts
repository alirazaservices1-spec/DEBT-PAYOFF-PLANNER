// ─── DebtPath Official Color System ───────────────────────────────────────────
// Theme: Warm Amber/Brown — matches onboarding flow
// RULES:
//   Red (#E24B4A) = streak at risk ONLY — never debt balance, never payment due
//   Interest saved = always Freedom Green
//   Debt balance = neutral text color — never red
//   Amber (#C07820 light / #E8A030 dark) = primary actions, navigation, brand
//   Freedom Green = payoff date, extra payment wins, interest saved
//   Achievement Gold = milestones, badges, level-up — use sparingly

// ─── Named color tokens (official export) ─────────────────────────────────────
export const Colors = {
  // Dex Orange — streak flame, celebration moments, urgency
  orange:      "#E8600A",
  orangeLight: "#FFF0E5",
  orangeDark:  "#B34A05",

  // Amber — primary brand color, navigation, action buttons
  amber:      "#C07820",
  amberLight: "#FDF3E3",
  amberDark:  "#8A5010",
  amberDarkMode: "#E8A030",

  // Trust Blue — XP bars, level indicators (kept for functional elements)
  blue:      "#1F4E8C",
  blueLight: "#EEF4FB",
  blueDark:  "#163A6A",

  // Freedom Green — interest saved, extra payment wins, debt-free date
  green:      "#1E7A45",
  greenLight: "#EBF7F0",
  greenDark:  "#155533",

  // Achievement Gold — milestones, badges, trophies (use sparingly)
  gold:      "#D4A017",
  goldLight: "#FFF8E1",

  // Risk Red — streak at risk ONLY (max 2 screens)
  red: "#E24B4A",

  // Warm dark backgrounds
  bg:  "#1C1610",
  bg2: "#2C2014",
  bg3: "#2A2018",
  bg4: "#302818",

  // Borders
  border:  "#3A2A18",
  border2: "#4A3828",

  // Text
  text:  "#F0E8D0",
  text2: "#C09050",
  text3: "#9A7240",
};

// ─── D alias — keeps existing component imports working ───────────────────────
export const D = {
  orange:  Colors.orange,
  orangeL: Colors.orangeLight,
  orangeD: Colors.orangeDark,
  blue:    Colors.blue,
  blueL:   Colors.blueLight,
  blueD:   Colors.blueDark,
  green:   Colors.green,
  greenL:  Colors.greenLight,
  greenD:  Colors.greenDark,
  gold:    Colors.gold,
  goldL:   Colors.goldLight,
  red:     Colors.red,
  bg:      Colors.bg,
  bg2:     Colors.bg2,
  bg3:     Colors.bg3,
  bg4:     Colors.bg4,
  border:  Colors.border,
  border2: Colors.border2,
  text:    Colors.text,
  text2:   Colors.text2,
  text3:   Colors.text3,
  // Flame tier colors
  flameTier1:     Colors.orange,
  flameTier2Core: "#FCDE5A",
  flameTier3Base: "#D85000",
  flameTier5White:"#FFF5E0",
};

/**
 * Warm/light contrast tokens (WCAG-style thinking).
 * Use these for text placed on cream/yellow panels (e.g. `#F7F2EA`, `#EDE8DC`, `#FFF8EE`, `#FEF3C7`).
 */
export const WarmContrast = {
  // Section labels / eyebrows on warm cream (dark enough for WCAG on beige/yellow)
  brandAccent: "#3D2E26",
  // Secondary body / hints on cream — warm brown
  textMuted: "#3D2E26",
  // Placeholder text on cream inputs
  textPlaceholder: "#45403C",
  // Body text on butter yellow
  textOnYellow: "#1A1612",
  // Small badges / caps on butter yellow
  textOnYellowBold: "#2A2014",
} as const;

// ─── Theme objects — used by screens: const C = isDark ? Colors.dark : Colors.light
const dark = {
  text:             "#F0E8D0",
  textSecondary:    "#C09050",
  textTertiary:     "#9A7240",
  background:       "#1C1610",
  surface:          "#2C2014",
  surfaceSecondary: "#2A2018",
  card:             "#2C2014",
  border:           "rgba(232,160,48,0.22)",
  border2:          "rgba(232,160,48,0.40)",
  tint:             "#E8A030",
  tabIconDefault:   "#9A7240",
  tabIconSelected:  "#E8A030",
  cardShadow:       "rgba(0,0,0,0.50)",
};

const light = {
  /** Warm brown-black on cream — consistent with onboarding / debt flow */
  text:             "#1A0F08",
  textSecondary:    "#3D2E26",
  textTertiary:     "#5C4A38",
  background:       "#FAFAF8",
  surface:          "#FFFFFF",
  /** Lighter than old #F2EFE8 so brown text isn’t needed on panels */
  surfaceSecondary: "#FAFAF7",
  card:             "#FFFFFF",
  border:           "rgba(192,120,32,0.22)",
  border2:          "rgba(192,120,32,0.40)",
  tint:             "#C07820",
  tabIconDefault:   "#454039",
  tabIconSelected:  "#C07820",
  cardShadow:       "rgba(192,120,32,0.15)",
};

// ─── Default export — backward compat (Colors.primary, Colors.dark, etc.) ─────
export default {
  // Amber as the primary brand color (replaces green for nav/buttons)
  primary:         Colors.amber,
  primaryDark:     Colors.amberDark,
  accent:          Colors.amber,
  progressGreen:   Colors.amber,       // All progress indicators use amber
  buttonGreen:     Colors.amber,       // Action buttons use amber
  buttonGreenDark: Colors.amberDark,   // Button press state
  danger:          Colors.red,
  warning:         Colors.orange,
  // Direct access to design tokens
  orange:  Colors.orange,
  blue:    Colors.blue,
  green:   Colors.green,
  gold:    Colors.gold,
  red:     Colors.red,
  amber:     Colors.amber,
  amberDark: Colors.amberDark,
  // Theme objects
  WarmContrast,
  dark,
  light,
};

// ─── DebtPath Official Color System ───────────────────────────────────────────
// Source: Visual, Animation & Sound Design Brief
// RULES:
//   Red (#E24B4A) = streak at risk ONLY — never debt balance, never payment due
//   Interest saved = always Freedom Green
//   Debt balance = neutral text color — never red
//   Trust Blue = XP bars, level indicators, primary action buttons, navigation
//   Freedom Green = payoff date, extra payment wins, interest saved
//   Achievement Gold = milestones, badges, level-up — use sparingly

// ─── Named color tokens (official export) ─────────────────────────────────────
export const Colors = {
  // Dex Orange — streak flame, celebration moments, urgency
  orange:      "#E8600A",
  orangeLight: "#FFF0E5",
  orangeDark:  "#B34A05",

  // Trust Blue — XP bars, level indicators, primary action buttons, navigation
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

  // Dark backgrounds (neutral — no green tint)
  bg:  "#0E0F11",
  bg2: "#161719",
  bg3: "#1E2023",
  bg4: "#262A2E",

  // Borders
  border:  "#2E3338",
  border2: "#3A4048",

  // Text
  text:  "#F0F1F3",
  text2: "#A8ADB5",
  text3: "#626870",
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

// ─── Theme objects — used by screens: const C = isDark ? Colors.dark : Colors.light
const dark = {
  text:             Colors.text,        // #F0F1F3
  textSecondary:    Colors.text2,       // #A8ADB5
  textTertiary:     Colors.text3,       // #626870
  background:       Colors.bg,          // #0E0F11
  surface:          Colors.bg2,         // #161719
  surfaceSecondary: Colors.bg3,         // #1E2023
  card:             Colors.bg2,
  border:           Colors.border,      // #2E3338
  border2:          Colors.border2,     // #3A4048
  tint:             Colors.blue,        // Trust Blue for nav/actions
  tabIconDefault:   Colors.text3,       // #626870
  tabIconSelected:  Colors.blue,        // Trust Blue
  cardShadow:       "rgba(0,0,0,0.50)",
};

const light = {
  text:             "#111318",
  textSecondary:    "#484E5A",
  textTertiary:     "#8C939F",
  background:       "#F7F8FA",
  surface:          "#FFFFFF",
  surfaceSecondary: "#EFF2F6",
  card:             "#FFFFFF",
  border:           "#DDE2E8",
  border2:          "#C8CDD6",
  tint:             Colors.blue,
  tabIconDefault:   "#8C939F",
  tabIconSelected:  Colors.blue,
  cardShadow:       "rgba(0,0,0,0.08)",
};

// ─── Default export — backward compat (Colors.primary, Colors.dark, etc.) ─────
export default {
  // Mapped from old names → new design system
  primary:         Colors.green,       // Freedom Green for positive progress
  primaryDark:     Colors.greenDark,
  accent:          Colors.blue,        // Trust Blue for XP/engagement
  progressGreen:   Colors.green,       // Payoff ring stays Freedom Green
  buttonGreen:     Colors.green,
  buttonGreenDark: Colors.greenDark,
  danger:          Colors.red,
  warning:         Colors.orange,
  // Direct access to design tokens
  orange:  Colors.orange,
  blue:    Colors.blue,
  green:   Colors.green,
  gold:    Colors.gold,
  red:     Colors.red,
  // Theme objects
  dark,
  light,
};

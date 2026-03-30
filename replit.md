# DebtPath — Payoff Planner & Tracker

A comprehensive debt management app built with Expo React Native and Express backend. Targets elderly users (65+) with Duolingo-inspired design, WCAG AA/AAA contrast compliance, and big bold typography.

## Design System (Designer Handoff — Milestone 2 + Color/Typography Overhaul)

- **Fonts**: Nunito (400/600/700/800/900) + JetBrains Mono (400/500) via @expo-google-fonts — loaded in _layout.tsx with useFonts
- **Colors**: `constants/colors.ts` exports `Colors` object (orange=#E8600A, blue=#1F4E8C, green=#1E7A45, gold=#D4A017, red=#E24B4A) and `D` alias. Dark backgrounds: bg=#0E0F11, surface=#161719, neutral (not green-tinted). Old hex greens replaced globally.
- **Font constants**: `constants/fonts.ts` — `Fonts.regular/semiBold/bold/extraBold/black/mono`. All stylesheets in all screens and components now use Nunito for text and JetBrains Mono for ALL numbers (debt balances, XP, streak count, dates, amounts).
- **Typography rules**: fontWeight 900→Fonts.black, 800→Fonts.extraBold, 700→Fonts.bold, 600→Fonts.semiBold. Numbers (currency, counts, percentages) use Fonts.mono regardless of weight.
- **FlameIcon**: `components/FlameIcon.tsx` — 5-tier SVG flame (react-native-svg) animated with React Native Animated, scales by streak tier
- **XPProgressBar**: Blue gradient (#1F4E8C→#4B9EF8), 14px, white particle dot at leading edge, 1.4s cubic-bezier transition
- **StreakWidget**: Uses FlameIcon (5 SVG tiers) instead of Ionicons
- **ImpactCounter**: `components/ImpactCounter.tsx` — $0.50/day extra payment impact widget on dashboard (extra this month, interest avoided, days shaved, debt-free date)
- **SoundManager**: `utils/SoundManager.ts` — expo-av based sound system. Pre-generates 9 WAV files in `assets/sounds/` (payment_logged, xp_earned, streak_maintained, level_up, milestone, streak_at_risk, variable_bonus, interest_saved, debt_paid_off). Preloads all sounds at app start via `soundManager.preload()` in `_layout.tsx`. `soundManager.play(name)` used in GameContext, dashboard, and DebtClearedOverlay. `soundManager.setEnabled(bool)` with AsyncStorage persistence. Sound toggle in Settings screen. `debt_paid_off` bypasses iOS silent mode.

## Architecture

- **Frontend**: Expo Router (React Native) with file-based routing, running on web via Metro bundler
- **Backend**: Express.js (TypeScript) serving REST API on port 5000
- **Dev Proxy**: Express server proxies non-API requests to Metro bundler (port 8081) in development
- **State**: React Context + AsyncStorage for local persistence
- **Database**: PostgreSQL via `pg` Pool (Replit built-in, DATABASE_URL env var)
- **Styling**: React Native StyleSheet with dark/light mode support

## Replit Workflows

- **Start application** (webview, port 5000): Runs Express backend (`NODE_ENV=development PORT=5000 tsx server/index.ts`). In dev mode, Express proxies all non-API requests to Metro bundler on port 8081.
- **Start Frontend** (console, port 8081): Runs Expo Metro bundler (`npx expo start --web --port 8081`). Restart after dependency changes. HMR handles most code changes automatically.

## Deployment

- Target: autoscale
- Build: `npm run server:build && node scripts/build.js` (bundles server + builds Expo static)
- Run: `node server_dist/index.js`

## App Structure

```
app/
  _layout.tsx       - Root layout with providers: CurrencyProvider, NotificationProvider, DebtProvider
  onboarding.tsx    - 9-screen Duolingo-style onboarding: Splash → Dex Intro → Question Intro → Q1/Q2/Q3 → Celebration (CLAIM +100 XP) → Streak Born → Streak Goal Picker
  settings.tsx      - Settings screen with appearance + currency picker
  levels.tsx        - Levels/Progress screen: Dex mascot, shimmer hero card, all 7 levels list (done/current/locked), dream goal banner, motivational nudge, CTA. Navigated to by tapping the XP bar in dashboard.
  day-complete.tsx  - Day Complete celebration screen: confetti, jumping Dex, ⭐⭐⭐ stars, XP breakdown card, total XP + streak banner. Navigated to automatically after logging a payment.
  (tabs)/
    index.tsx         - Debts tab: add, edit, delete, view debts + notification bell icon
    strategy.tsx      - Strategy tab: Snowball, Avalanche, Custom + consolidation scenario
    plan.tsx          - Payoff Plan tab: month-by-month list + calendar view (toggle)
    dashboard.tsx     - Dashboard tab: progress, what-if, CTA cards
    calculators.tsx   - Calculators tab: Payoff+Extra, Monthly Payment, Refinance

components/
  DebtForm.tsx          - Add/edit debt form (type picker, validation, haptics)
  LeadForm.tsx          - Lead capture form (CTA conversion)
  CTACards.tsx          - Revenue trigger cards (5 triggers)
  NotificationBell.tsx  - Bell icon with badge + reminder panel modal
  ProgressRing.tsx      - Animated SVG progress ring
  KeyboardAwareScrollViewCompat.tsx - Cross-platform keyboard-aware scroll

context/
  DebtContext.tsx         - Global debt state + calculations + onboardingDone flag
  CurrencyContext.tsx     - Multi-currency support (9 currencies), useCurrency hook
  NotificationContext.tsx - In-app payment reminder engine, useNotifications hook
  ThemeContext.tsx        - Dark/light/system theme preference

lib/
  calculations.ts - Pure JS calculation engine (Snowball/Avalanche/Custom)
  query-client.ts - API client using EXPO_PUBLIC_DOMAIN env var

server/
  index.ts        - Express server (port 5000); dev mode proxies to Metro on 8081
  routes.ts       - Lead API endpoints, PostgreSQL persistence
  templates/      - Landing page HTML for production static builds
```

## Gamification System (Milestone 2 — Step 1)

### GameContext (`context/GameContext.tsx`)
Global XP + level engine persisted in AsyncStorage (`@debtfree_game_v1`).

**XP Rewards:**
- `LOG_PAYMENT` → +50 XP
- `PAY_OFF_DEBT` → +500 XP
- `COMPLETE_ONBOARDING` → +100 XP
- `HIT_MILESTONE` → +200 XP
- `DAILY_STREAK` → +25 XP

**Level thresholds:** 0, 200, 500, 1000, 2000, 4000 (then +3000/level after)

**API:** `useGame()` exposes `totalXp`, `level`, `currentLevelXp`, `nextLevelXp`, `progress`, `awardXp(event, meta?)`, `celebration`, `dismissCelebration`.

### Celebration Overlays
- `CelebrationHost` — mounts both overlays at root level; auto-dismisses after 3 s or on tap
- `LevelUpOverlay` — full-screen confetti + animated level badge for level-up events
- `DebtClearedOverlay` — pulsing ring + checkmark for `PAY_OFF_DEBT` events

### XPProgressBar (`components/XPProgressBar.tsx`)
Shown at the top of the Dashboard tab. Displays current level badge, animated fill bar, and XP needed for next level.

### Dex Mascot System (Milestone 2 — Step 2)

`components/DexMascot.tsx` — SVG-drawn animated character using `react-native-svg` + Reanimated.
- **TODO**: Replace `<DexArtwork>` SVG with the final Lottie file when ready. All Reanimated motion logic stays unchanged.
- 5 states with distinct animation loops: `idle` (slow bob), `happy` (spring bounce), `celebrating` (jump + rotate wiggle), `encouraging` (gentle tilt), `sleeping` (slow drift + Zzz)
- Accepts `state: DexState` and `size?: number` props

`components/DexCard.tsx` — Dashboard card that houses Dex + contextual speech bubble.
- Computes initial state on mount from `prevLastOpenedAt` (7+ days → sleeping) and payment history (3+ days → encouraging)
- Reacts to `celebration.type` changes (level_up / debt_cleared → celebrating)
- `happy` is triggered externally by the dashboard's log-payment handler via `triggerDex("happy")`

**GameContext additions**: `dexState: DexState`, `triggerDex(state, durationMs?)`, `prevLastOpenedAt`, `totalXpRef` for synchronous XP reads. `awardXp` auto-triggers `celebrating` on debt payoff and level up.

### Integration Points for Future Steps
- Call `awardXp("LOG_PAYMENT")` when a payment is logged
- Call `awardXp("PAY_OFF_DEBT", { debtName })` when a debt is paid off
- Call `awardXp("COMPLETE_ONBOARDING")` when onboarding completes
- Call `awardXp("HIT_MILESTONE")` at payoff milestones
- Call `awardXp("DAILY_STREAK")` from the streak system

## Key Features

- **5 Tabs**: Debts, Strategy, Plan, Calculators, Tracking
- **Currency**: 9 currencies (USD, PKR, EUR, GBP, AED, SAR, CAD, AUD, INR) — persisted in AsyncStorage
- **Notifications**: In-app payment reminders based on debt due dates; bell icon with badge; reminder prefs (1/3/7 days before)
- **Calculators**: Payoff + Extra Payments, Monthly Payment, Refinance — all real-time
- **Calendar View**: Plan tab toggles between list amortization and calendar grid showing debt due dates
- **Smart CTAs**: 4 trigger types (APR ≥18%, tax debt, business debt, balance ≥$10K/$24K)
- **Strategy**: Snowball, Avalanche, Custom drag-and-drop order + consolidation scenario
- **Onboarding**: 3-step onboarding gated by `onboardingDone` flag

## Development

The `npm run dev` script runs:
1. Metro bundler (Expo dev server) on port 8081
2. Express server on port 5000, which proxies all non-/api requests to Metro

The Replit webview shows port 5000, so the full app is visible through the Express proxy.

## Production Build

Production uses a static Expo build:
1. `node scripts/build.js` - Starts Metro, downloads bundles for iOS/Android, creates static-build/
2. `npm run server:build` - Bundles the Express server with esbuild
3. `node server_dist/index.js` - Serves static files + API on port 5000

## Currency Pattern

All monetary displays use `fmt(n)` from `useCurrency()` hook instead of raw `formatCurrency()` from calculations.ts. The `fmtFull(n)` provides 2-decimal formatting.

## Notification Pattern

`useNotifications()` provides `reminders`, `pendingCount`, `dismiss`, `dismissAll`, `updatePrefs`, and `setDebts`. The `index.tsx` (Debts tab) syncs the debt list to the notification context via `useEffect`.

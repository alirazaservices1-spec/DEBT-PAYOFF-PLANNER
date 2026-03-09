# DebtFree - Payoff Planner & Tracker

A comprehensive debt management app built with Expo React Native and Express backend. Targets elderly users (65+) with Duolingo-inspired design, WCAG AA/AAA contrast compliance, and big bold typography.

## Architecture

- **Frontend**: Expo Router (React Native) with file-based routing, running on web via Metro bundler
- **Backend**: Express.js (TypeScript) serving REST API on port 5000
- **Dev Proxy**: Express server proxies non-API requests to Metro bundler (port 8081) in development
- **State**: React Context + AsyncStorage for local persistence
- **Database**: PostgreSQL via `pg` Pool (Replit built-in)
- **Styling**: React Native StyleSheet with dark/light mode support

## App Structure

```
app/
  _layout.tsx       - Root layout with providers: CurrencyProvider, NotificationProvider, DebtProvider
  onboarding.tsx    - 3-step onboarding flow (value prop → add debt → payoff reveal)
  settings.tsx      - Settings screen with appearance + currency picker
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

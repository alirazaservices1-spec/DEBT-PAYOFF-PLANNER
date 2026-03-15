# DebtPath — Missing Items (Design Brief + Chat)

Single checklist of what is **still missing or partial** after comparing the app to the **Design Brief** and to the **Eric P / Ali Raza chat**. Use this for Phase 2 and follow-up builds.

---

## A. From the Design Brief (see DESIGN_BRIEF_AUDIT.md for full audit)

### Still missing or partial

| Item | Status | Where / Notes |
|------|--------|----------------|
| **Flame spark particles (100+ day)** | Missing | Brief: 2–4 active particles from upper third of flame; 0.6–1.0s fade. `FlameIcon.tsx` — add small circles/particles for 100+ tier. |
| **Dex holding flame (worried)** | Partial | Dex has worried state; brief wants integrated “Dex holding flame” asset. Either add small flame in Dex worried view or use combined Lottie. |
| **Dex vocalization (optional)** | **Done** | Short dex_approval / dex_concern / dex_surprise (&lt;0.4s); Settings toggle "Dex vocalization"; plays on happy/celebrating, worried, surprised. |
| **Lottie / PNG assets** | Partial | Brief lists Lottie JSON for Dex states and flame tiers + PNG @2x/@3x for notifications. App uses SVG/Reanimated; no Dex icon for push. |
| **Dex as notification icon** | Missing | Push uses emoji/text; no Dex asset as notification icon. |
| **Streak maintained (8PM) notification** | Partial | Brief: “Your X-day streak is safe!” when they *have* logged. App only sends “streak at risk” when not logged; no positive “streak maintained” push. |
| **Interest-saved weekly (Sunday) — brief copy** | Check | Brief: “You saved $X in interest this week. Your debt-free date: [date]”. Confirm weekly summary notification uses interest-saved copy (not just payment total). |
| **Payoff date moved — push** | Check | Brief: push when extra payment moves date. Confirm DesignBriefNotificationsContext or equivalent fires this. |
| **Variable bonus day — scheduled notification** | Check | Brief: “Bonus day! Log any payment today for 3x XP”. Confirm scheduled notification exists for bonus days. |
| **7-day re-engagement — push** | Check | Brief: “Dex misses you. Your streak is paused, not gone.” Confirm 7-day inactive triggers this push. |
| **Contrast / tap targets / font scaling** | Partial | Brief: 4.5:1 contrast, 44pt tap targets, Dynamic Type to Accessibility Large. Not fully audited. |

### Already done (session fixes)

- Interest bar label: “Interest you have kept in your pocket” — **Done** (`InterestSavingsBar.tsx`).
- Streak at risk copy: “Your X-day streak ends at midnight. One tap saves it.” — **Done** (`StreakReminderContext.tsx`).
- Reduce motion: **Done** (`useReduceMotion`, `PaymentSuccessEffects`, `LevelUpOverlay`).
- Dex worried + small flame, 100+ spark particles, notification copy/contexts — implemented per session notes; verify in app.

---

## B. From the Chat (Eric P / Ali Raza)

### Implemented (no action)

| Chat request | Status |
|--------------|--------|
| Recommendation cards: “Done / Hide” after submitting once | **Done** — `RecommendationBar.tsx`: “Done — Hide this”, dismiss saves to AsyncStorage, cards filtered by `hiddenIds`. |
| If &gt;$15k debt: “Because you have $__ in debt you may want to check the means test” + link | **Done** — `MonetizationRules.ts`: `totalDebt > 15000` → means_test card with that copy; `RecommendationBar` uses `MEANS_TEST` URL (lp.curadebt.com/bankruptcy-means-test/). |
| Strategy descriptions: avoid “least amount of interest” | **Done** — No such phrase in codebase; Ali confirmed softened. |
| Snowball vs Avalanche formulas | **Done** — Ali confirmed correct; same engine, different order. |
| Personal goal tab: goal name, amount, “save $X/day… in X days”, daily motivational reminders | **Done** — `goal.tsx`, `GoalContext.tsx`: goal name/amount, result card with daily save and days to goal, daily reminder notifications with rotating messages. |
| Sounds for version 2 | **Done** — SoundManager, WAVs, payment success sound (Sucess.wav). |
| Loading screen: app name visible | **Done** — `_layout.tsx` SplashLoader: logo + “DebtPath” + “Your Payoff Planner”. |

### Partial or to confirm

| Chat request | Status | Action |
|--------------|--------|--------|
| **Loading: “logo in middle, name at bottom” (like Duolingo)** | Partial | Current: logo and name are vertically centered together. If “name at bottom” means name at bottom of *screen*, consider moving app name to bottom (e.g. `position: absolute; bottom: 48`) so logo is more centered and name sits at foot like Duolingo. |
| **Email notifications (“come back… like Duolingo”)** | Partial | Settings has “EMAIL NOTIFICATIONS” (address, weekly summary, streak at risk, milestone toggles); prefs stored. **No backend that actually sends emails** (e.g. streak at risk, weekly recap, re-engagement). Server only has leads API. To match Duolingo-style “we email you to come back”, need: email delivery (SendGrid/Mailgun/etc.) and jobs/cron for streak-at-risk, weekly summary, 7-day re-engagement. |

### Not in code (external / process)

- **Storyblocks** for characters/icons — asset source; no code change.
- **Duolingo screenshots / doc** for modeling — reference only.
- **IRS interest compounds daily** — Eric mentioned; if any calc still uses monthly compounding for tax debt, align with daily.

---

## C. Consolidated “To Do” List (priority order)

1. **Email delivery** — If email notifications are required: add backend (or serverless) to send emails for streak at risk, weekly summary, payoff date moved, variable bonus day, 7-day re-engagement, using stored email prefs.
2. **Splash layout** — Optionally move app name to bottom of screen (Duolingo-style) in `_layout.tsx` SplashLoader.
3. **Flame 100+ particles** — Add 2–4 spark particles in `FlameIcon.tsx` for 100+ day tier.
4. **Dex holding flame** — Integrate small flame in Dex worried state or provide combined asset.
5. ~~**Dex vocalization (optional)**~~ — Done: short sounds + Settings toggle.
6. **Notification types/copy** — Confirm and implement any missing: streak maintained (8PM), interest-saved weekly (Sunday) with brief copy, payoff-date-moved, variable bonus day, 7-day re-engagement; use “ends at midnight” for streak risk (already in place).
7. **Dex/notification icon** — Provide Dex static asset for push notification icon.
8. **Accessibility** — Audit contrast 4.5:1, 44pt tap targets, Dynamic Type to Accessibility Large.

---

## D. File reference

| Area | Files |
|------|--------|
| Design audit | `DESIGN_BRIEF_AUDIT.md` |
| Recommendations + means test | `components/RecommendationBar.tsx`, `lib/MonetizationRules.ts` |
| Splash / loading | `app/_layout.tsx` (SplashLoader) |
| Email prefs | `app/settings.tsx` (EMAIL NOTIFICATIONS section) |
| Goal + daily reminders | `app/goal.tsx`, `context/GoalContext.tsx` |
| Notifications | `context/StreakReminderContext.tsx`, `context/DesignBriefNotificationsContext.tsx`, `context/WeeklySummaryContext.tsx` |
| Flame | `components/FlameIcon.tsx` |
| Dex | `components/DexMascot.tsx`, `components/DexCard.tsx` |
| Sounds | `utils/SoundManager.ts`, `assets/sounds/*.wav` |
| Reduce motion | `hooks/useReduceMotion.ts`, `PaymentSuccessEffects.tsx`, `LevelUpOverlay.tsx` |

---

*Generated from Design Brief + chat review. Update as items are completed.*

# DebtPath: Motivational Messages, Tiers, and Points

This document summarizes the current in-app messaging and XP system so QA/client can verify behavior quickly.

**Machine-readable matrix (XP, modals, SFX, Dex):** see [`game_rewards_matrix.csv`](game_rewards_matrix.csv) in this folder.

## 1) Motivational Messages

### A) Daily reminder notifications (`GoalContext`)

When user has a goal (`{goal}` replaced with goal name):

1. Keep going! You're one day closer to {goal}. Stay on track with your debt payoff today.
2. Every dollar you put toward debt is a dollar closer to {goal}. You've got this!
3. Small steps, big results. Your goal of {goal} is within reach - keep paying it down!
4. Don't stop now! {goal} is waiting for you. Log a payment and stay on track.
5. You're building momentum toward {goal}. One payment at a time - keep it going!
6. Financial freedom and {goal} are closer than you think. Great job staying the course!

General fallback reminders (no goal):

1. Stay on track with your debt payoff today. Every payment counts!
2. Reminder: one payment at a time is all it takes. Keep going!
3. You're doing great. Log a payment today and stay on your debt-free path.
4. Small consistent payments lead to big results. Keep it up!
5. Debt-free is the goal. You're one step closer - log today's payment.
6. Stay focused and consistent. Your future self will thank you!

### B) Main menu rotating Dex motivation (`main-menu`)

- You showed up today. That's how dreams get built.
- Every payment is one step closer to your dream (or debt freedom fallback).
- Streak encouragement message with current day streak.
- Small steps daily beat big leaps rarely.
- Next-level XP progress encouragement.
- Debt freedom encouragement and check-in prompts.

### C) Onboarding / Day-1 motivational copy (`onboarding`)

- Commit/encouragement copy around Day 1 setup and task completion.
- Dex reaction status lines while completing Day 1 tasks.
- Streak commitment messaging for 7/14/30/60 day commitments.

## 2) Tiers / Levels

Primary user level tiers (`constants/levelsData.ts`):

1. Level 1: Seedling (0-199 XP)
2. Level 2: Bronze Starter (200-499 XP)
3. Level 3: Momentum Builder (500-999 XP)
4. Level 4: Gold Saver (1000-1999 XP)
5. Level 5: Diamond Warrior (2000-3999 XP)
6. Level 6: Freedom Champion (4000-6999 XP)
7. Level 7: Debt-Free Legend (7000+ XP)

## 3) XP / Points: What Gives Points

Core XP events (`context/GameContext.tsx`):

- `LOG_PAYMENT`: +50 XP
- `PAY_OFF_DEBT`: +500 XP
- `COMPLETE_ONBOARDING`: +100 XP
- `HIT_MILESTONE`: +200 XP
- `DAILY_STREAK`: +25 XP
- `DAILY_SAVING`: +20 XP
- `NO_SPEND`: +15 XP
- `SOCIAL_SHARE`: +10 XP
- `BONUS_CHECK`: +10 XP

### Extra XP rules

- First-ever payment bonus: +100 XP (on first `LOG_PAYMENT`)
- "Showed up today" bonus shown in day-complete flow: +10 XP
- Payment bonus-day effect in payment success flow: +50 XP when bonus triggers

### Streak milestone bonus XP (`STREAK_MILESTONES`)

- 3 days: +75 XP
- 7 days: +150 XP
- 14 days: +300 XP
- 30 days: +500 XP
- 60 days: +750 XP
- 100 days: +1000 XP

### Onboarding commitment bonus XP (`COMMITS_DATA` in onboarding)

- 7-day commitment: +25 bonus XP
- 14-day commitment: +60 bonus XP
- 30-day commitment: +150 bonus XP
- 60-day commitment: +400 bonus XP

### Day-1 task XP in onboarding

- Task 1: +25 XP
- Task 2: +25 XP
- Task 3: +50 XP
- Task 4: +100 XP

## 4) QA Verification Checklist (Quick)

1. Log a payment -> confirm +50 XP (and first-payment +100 once only).
2. Complete daily streak check-in -> confirm +25 XP.
3. Hit streak day 3/7/14/30/60/100 -> confirm corresponding bonus XP.
4. Pay off a debt -> confirm +500 XP event.
5. Hit milestone -> confirm +200 XP.
6. Confirm level-up thresholds match tier table above.
7. Verify reminder notification body rotates through listed messages.


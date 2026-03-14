# First prompt — client fixes (Eric P / DebtPath)

Use this as the **single master brief** when continuing work or handing off.

---

## Where to recheck (screen + location)

| What changed | Screen / route | Where to look |
|--------------|----------------|---------------|
| Removed `*` from feature bullets | **Onboarding** → Step 1 **Overview** tab | Bullet list under hero (no asterisks at end of lines). |
| “How it works →” instead of Learn more | **Onboarding** → Step 1, below **Add A Debt** | Secondary text link under the green button. |
| Tax: nickname placeholder IRS / State | **Add/Edit Debt** (modal) | **Nickname** field when **Category = Tax Debt**. |
| Tax: no “Tax Rate %” for tax debt | **Add/Edit Debt** | Scroll past balance — **Tax Rate %** block **hidden** when category is Tax Debt; still shown for credit card, etc. |
| Tax: payment plan toggle + optional APR/min/due | **Add/Edit Debt** | After balance, **“On IRS/state payment plan”** switch. Off → no APR/Min/Due fields. On → same fields as other debts. |
| APR error “Please estimate if unsure” | **Add/Edit Debt** | Submit with bad/missing APR (when APR is required) — error summary/footer message. |
| No delay after saving debt | **Onboarding** Step 3 or **Debts** tab after **Save Debt** | Modal should close / list updates immediately (no long “Saving…” hang). |
| Min/Due show **—** for tax without plan | **Debts** tab (home list) | Debt card **bottom row**: Min. Payment & Due Date show dash for tax debt with $0 min. |
| Compact horizontal recommendations (~50px) | **Debts** tab | **Top of list** (above debt cards): horizontal scroll chips — icon + short title + “Tap to learn more”. |
| Distinct rec copy ($10k, 15%, tax $5k, biz $10k) | **Debts** tab | Same strip — which chips appear depends on your debt mix (add tax $5k+, biz $10k+, etc. to verify). |
| Tax excluded from strategy sim | **Strategy** tab | With tax-only or tax+no plan: interest/months should match **non-tax** debts only; notice card explains it. |
| Tax notice copy updated | **Strategy** tab | Yellow/amber **Tax debt & payoff order** card when any tax debt exists. |
| “How it works →” on strategy cards | **Strategy** tab | Each strategy card bottom link (was “Learn More →”). |
| Only one “Recommended” when Avalanche clearly wins | **Strategy** tab | Compare Snowball vs Avalanche — badge only if interest savings ≥ **$50**; otherwise no star badge. |
| Month row hint line | **Plan** tab → amortization list | Expand a **month** — under month name, line about minimums + extra to first in order. |
| Calendar skips tax w/o payment | **Plan** tab → **Calendar** view | Tax debt with $0 min should **not** create due-date dots. |

**Quick navigation (Expo app):**
- Onboarding: first launch or clear app data → `/onboarding`
- Debts list: **Debts** tab → `app/(tabs)/index.tsx`
- Add debt: **+** or onboarding **Add A Debt** → full-screen **DebtForm**
- Strategy: **Strategy** tab → `app/(tabs)/strategy.tsx`
- Plan: **Plan** tab → amortization + calendar → `app/(tabs)/plan.tsx`

---

## Copy & UX (summary)
- **Onboarding first screen:** Remove trailing `*` from feature bullets.
- **Onboarding link:** “Learn more…” → **“How it works →”**
- **Strategy cards:** “Learn More →” → **“How it works →”**
- **Tax debt nickname hints:** e.g. IRS debt, State tax debt.
- **Tax debt:** Remove “income tax bracket” field for tax debt; tax rate block only for non–tax-deductible contexts (mortgage/student loan style).
- **Tax debt optional fields:** Monthly payment, APR, due date **only if** user is on IRS/state payment plan → toggle **“On IRS/state payment plan”**.
- **Main list:** For tax debt **without** a payment plan, show **—** for Min. Payment and Due Date (no fake due date).
- **APR errors:** Append **“Please estimate if unsure.”** where APR validation fails.
- **After add debt:** No noticeable delay — persist in background after optimistic UI update.

## Recommendation engine (distinct, not same card repeated)
- **$10k+ total debt** → Free debt relief consultation / qualify for debt relief.
- **15%+ APR or $10k+** → Qualify for lower interest rate.
- **$5k+ tax debt** → Free tax debt consultation / tax debt relief.
- **$10k+ business/MCA** → Free business debt consultation / business debt relief.
- **UI:** Personalized strip = **horizontal scroll**, **minimal text**, **~50px tall**, top of **Debts** screen.

## Strategy / formulas
- **Problem:** Multiple debts + large tax balance with no plan made every strategy show the same interest/timeline.
- **Fix:** **Exclude tax debt from payoff simulation** unless it has a payment plan (min payment > 0 and plan toggle). Avalanche/Snowball then reflect real revolving debts only.
- **Recommended badge:** Only when **Avalanche** clearly beats Snowball by **≥ $50** interest; otherwise no badge (avoids “all best” confusion).

## Payoff plan
- **Plan tab:** Each month row expands to **per-debt payment / principal / interest**; short line added: follow minimums + extra to first in strategy order.
- **Calendar:** Skip tax debts with no monthly payment so no bogus due dates.

## Files touched (reference)
- `app/onboarding.tsx` — bullets, link label
- `components/DebtForm.tsx` — tax plan toggle, conditional APR/min/due, tax rate hidden for tax debt, placeholders
- `lib/calculations.ts` — `debtsEligibleForStrategy`, `runStrategy` filter
- `lib/MonetizationRules.ts` — thresholds + distinct copy
- `app/(tabs)/index.tsx` — compact rec bar, due date/min dash for tax
- `app/(tabs)/strategy.tsx` — How it works, tax notice, recommended badge logic
- `app/(tabs)/plan.tsx` — calendar skip tax w/o plan, month hint line
- `context/DebtContext.tsx` — add/update debt persist without blocking

## Tests to add (suggested)
- DebtForm: tax without plan → save with 0 min/APR; with plan → validate APR/min/due.
- `debtsEligibleForStrategy`: tax $25k min 0 excluded; same with min > 0 included.
- `getRecommendations`: balances/APR thresholds return distinct headers/bodies.
- Strategy: two credit cards different APR → avalanche interest < snowball; badge only when spread ≥ 50.

## Novice-friendly follow-ups
- Optional **“Print / share this month’s plan”** PDF with dates and amounts per debt.
- **First 3 months expanded by default** on plan tab.
- Tooltip or one-tap **“How it works”** modal on strategy screen (already opens from card).

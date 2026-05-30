---
phase: 05-social-modules-polish
reviewed: 2024-05-24T14:30:00Z
depth: standard
files_reviewed:
  - src/app/tribunal/page.tsx
  - src/app/hall-of-fame/page.tsx
  - src/app/page.tsx
  - src/lib/actions.ts
  - README.md
findings:
  critical: 3
  warning: 4
  info: 2
  total: 9
status: issues_found
---

# Phase 5: Code Review Report

**Reviewed:** 2024-05-24
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

## Summary

The Phase 5 implementation successfully introduces the social and polish modules (Tribunal, Hall of Fame, and News Feed) and integrates them into the dashboard. The "LosguRise" theme is consistently applied across the new components with appropriate typography and iconography.

However, several **Critical** security and logic issues were identified, particularly around the GuriCoin (GC) economy and the authentication mechanism. The transaction logic is prone to race conditions, and server actions lack necessary authorization checks. Additionally, a critical typo in the Tribunal form prevents new reports from being submitted correctly.

## Critical Issues

### CR-01: Incorrect Event Handling in Tribunal Form

**File:** `src/app/tribunal/page.tsx:89`
**Issue:** The `onChange` handler for the "Acusado" (Accused) select field incorrectly attempts to access `e.target_id` instead of `e.target.value`. This will result in `target_id` being `undefined` in the form state, causing report submissions to fail or be invalid.
**Fix:**
```typescript
onChange={(e) => setFormData({...formData, target_id: e.target.value})}
```

### CR-02: Race Condition in Economy Transactions

**File:** `src/lib/actions.ts:168, 194`
**Issue:** The `creditGC` and `debitGC` functions implement a "read-calculate-write" pattern. If multiple transactions occur simultaneously for the same user (e.g., winning multiple bets or buying items quickly), one transaction might overwrite another, leading to incorrect balances.
**Fix:** Use an atomic update query directly in Supabase/Postgres.
```typescript
const { error: updateError } = await supabase
  .rpc('increment_balance', { user_id: userId, amount: amount });
// Or using standard update:
// .update({ balance: sql`balance + ${amount}` }) // if supported by your client/driver
```

### CR-03: Lack of Authorization in Server Actions

**File:** `src/lib/actions.ts`
**Issue:** Server actions like `creditGC`, `debitGC`, `placeBet`, and `settleEvent` accept a `userId` as an argument but do not verify if the currently authenticated user has the right to perform these actions. A malicious user could call these actions directly with any `userId` to manipulate balances.
**Fix:** Validate the user's session server-side using `supabase.auth.getUser()` and ensure the `userId` matches the authenticated user, or that the user has admin privileges for administrative actions (like `settleEvent`).

## Warnings

### WR-01: Insecure Authentication Pattern

**File:** `src/app/page.tsx:16`, `src/app/tribunal/page.tsx:21`
**Issue:** The application relies on `localStorage.getItem('user')` for authentication. This is easily spoofed by any user via the browser console, allowing them to impersonate any member of LosguRise.
**Fix:** Use proper Supabase Auth with sessions/cookies. Verify the session on every protected page and server action.

### WR-02: Missing Tribunal Settlement Logic

**File:** `src/app/tribunal/page.tsx`, `src/lib/actions.ts`
**Issue:** The README claims that if a majority votes "Culpable", the system debita automatically the multa. However, there is no implementation of this logic. Reports remain "OPEN" indefinitely unless manually changed in the database, and no GC deduction occurs.
**Fix:** Implement a `settleTribunalReport` function or a database trigger/cron job that evaluates votes after `expires_at` and applies the `fine_amount` to the `target_id`'s balance.

### WR-03: Non-Atomic Settlement Loop

**File:** `src/lib/actions.ts:285`
**Issue:** `settleEvent` iterates through winning bets and awaits `creditGC` for each. If the process crashes mid-loop, some users will be paid while others won't, and the event status might not be updated to `SETTLED`, leading to potential double-payouts on retry.
**Fix:** Perform the settlement inside a single PostgreSQL transaction or use a stored procedure to ensure atomicity.

### WR-04: Unchecked Supabase Responses

**File:** `src/app/tribunal/page.tsx:41, 46`
**Issue:** The `loadData` function in the Tribunal page destructures `data` but does not handle potential `error` from the Supabase queries. This can lead to silent failures where the UI shows stale or empty data.
**Fix:** Always check for `error` and provide feedback to the user or log it appropriately.

## Info

### IN-01: Dynamic Tailwind Classes

**File:** `src/app/hall-of-fame/page.tsx:24, 25`
**Issue:** Classes like `bg-${color}-500/20` and `text-${color}-500` are constructed dynamically. Tailwind's JIT compiler might not detect these classes if they aren't used elsewhere in the project, leading to missing styles.
**Fix:** Use a mapping object or safelist the possible color classes in `tailwind.config.ts`.
```typescript
const colorMap = {
  yellow: 'bg-yellow-500/20 text-yellow-500',
  blue: 'bg-blue-500/20 text-blue-500',
  // ...
};
```

### IN-02: Inefficient Hall of Fame Data Fetching

**File:** `src/lib/actions.ts:348`
**Issue:** `getHallOfFameData` fetches all profiles, all stats, and all transactions to compute leaderboards in memory. This will not scale as the user base or transaction history grows.
**Fix:** Use Supabase's aggregation functions or create a View in PostgreSQL that pre-calculates these rankings.

---

_Reviewed: 2024-05-24T14:30:00Z_
_Reviewer: gsd-code-reviewer_
_Depth: standard_

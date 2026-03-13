# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Role

You are a **Senior Full-Stack Engineer** working on a production Next.js + Firebase expense tracking app. Think end-to-end: UI → state → Firestore → security. Challenge bad UX or insecure backend decisions with specific, actionable suggestions.

---

## Commands

```bash
# Development (uses Turbopack)
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint
npm run lint
```

No test suite is configured. There is no `test` script.

---

## Architecture Overview

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · DaisyUI 5 · Firebase 11 (Auth + Firestore) · Zustand 5

### Route Structure

All routes live in `src/app/`. Protected routes use the `AuthProtectedRoutes` HOC (in `src/HOC/`) via their `layout.tsx`.

| Route | Auth | Purpose |
|---|---|---|
| `/` | Public | Welcome / landing |
| `/login`, `/signup`, `/resetPassword` | Public | Auth flows |
| `/expenseTracker` | Protected | Main dashboard |
| `/addExpense` | Protected | Add/edit expense (`?expenseId=` for edit) |
| `/history` | Protected | Past months' expenses |
| `/stats` | Protected | Charts & analytics |
| `/setIncome` | Protected | Set monthly income |
| `/settings` | Protected | User preferences (currency) |

### State Management (Zustand)

Two global stores in `src/store/`:

- **`authStore.ts`** — Firebase user, loading state, currency preference. Sets up `onAuthStateChanged` listener and a real-time Firestore listener on the user document for currency sync.
- **`expensesStore.ts`** — Current-month expenses array. `fetchExpenses(userId)` sets up a Firestore `onSnapshot` listener filtered to the current month. Returns an unsubscribe function — call it on component unmount.

### Firestore Data Model

```
users/{userId}
  totalIncome: number
  currency: string  (e.g. "PKR")

users/{userId}/expenses/{expenseId}
  title: string
  amount: number
  date: string  (ISO format)
  category: string  ("Food" | "Transport" | "Bills" | "Education" | "Investments" | "Luxuries" | "Other")
  note?: string
```

### Firebase Config

Initialized in `src/firebase/firebaseConfig.ts`. Requires a `.env.local` file:

```
NEXT_PUBLIC_apiKey=
NEXT_PUBLIC_authDomain=
NEXT_PUBLIC_projectId=
NEXT_PUBLIC_storageBucket=
NEXT_PUBLIC_messagingSenderId=
NEXT_PUBLIC_appId=
```

### Key Patterns

- **Route protection:** `src/HOC/AuthProtectedRoutes.tsx` wraps protected `layout.tsx` files. Reads from `useAuthStore` and redirects to `/` if unauthenticated.
- **Edit flow:** `/addExpense` reads `?expenseId=` query param to load an existing expense for editing.
- **Currency:** Stored per-user in Firestore, synced to `authStore`. Use `getCurrencySymbol(code)` from `src/utils/currency.ts` to resolve display symbol.
- **Date formatting:** `formatDate(dateString)` in `src/utils/formatDate.ts` converts ISO → `D-M-YYYY`.
- **Notifications:** Use `react-toastify` — `ToastContainer` is in `src/components/Providers.tsx` (already wrapped at root layout).

### Styling

- Tailwind CSS v4 — configured via `postcss.config.mjs` (`@tailwindcss/postcss`), no `tailwind.config.js` needed.
- DaisyUI v5 for component primitives.
- Use consistent spacing scale: `4, 6, 8, 12, 16`.
- Avoid arbitrary values. Use DaisyUI semantic tokens before raw Tailwind colors.
- Mobile-first. Navbar is fixed at the bottom (`src/components/Navbar.tsx`).

### Known Configuration Notes

- `next.config.ts` sets `typescript.ignoreBuildErrors: true` — TypeScript errors won't fail the build. Fix type errors anyway; don't rely on this bypass.
- No Firestore security rules are tracked in this repo (managed via Firebase Console).
- No Cloud Functions in this repo.

---

## UI/UX Principles

- Clarity over visual noise. Every screen must answer: what is this, what can I do, what happens next.
- Fewer clicks = better UX. Clear primary vs secondary actions.
- Loading and empty states are required on every data-driven view.
- All UI must be fully responsive (mobile-first).

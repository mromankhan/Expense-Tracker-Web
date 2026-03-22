"use client";
import { auth, db } from "@/firebase/firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { create } from "zustand";

type UseAuthStoreType = {
  user: User | null;
  loading: boolean;
  currency: string;
  setCurrency: (currency: string) => void;
};

export const useAuthStore = create<UseAuthStoreType>((set) => ({
  user: null,
  loading: true,
  currency: "PKR",
  setCurrency: (currency: string) => set({ currency }),
}));

// Listen to auth state changes and fetch user currency from Firestore
let unsubscribeUserDoc: (() => void) | null = null;

// Sync a lightweight cookie for proxy.ts route protection.
// This cookie is NOT sensitive — it's only used for server-side redirect logic.
// Real auth is enforced by Firebase on every Firestore/Auth API call.
const setAuthCookie = () => {
  if (typeof document === "undefined") return;
  document.cookie = "spendwise-auth=1; path=/; SameSite=Lax; max-age=604800"; // 7 days
};

const clearAuthCookie = () => {
  if (typeof document === "undefined") return;
  document.cookie = "spendwise-auth=; path=/; SameSite=Lax; expires=Thu, 01 Jan 1970 00:00:00 GMT";
};

onAuthStateChanged(auth, (user) => {
  if (user) {
    useAuthStore.setState({ user, loading: false });
    setAuthCookie();

    // Clean up any previous listener before attaching a new one
    if (unsubscribeUserDoc) unsubscribeUserDoc();

    const userDocRef = doc(db, "users", user.uid);
    unsubscribeUserDoc = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.currency) {
          useAuthStore.setState({ currency: data.currency });
        }
      }
    }, () => {
      // Listener failed (e.g. security rules denied) — keep last known currency
    });
  } else {
    if (unsubscribeUserDoc) {
      unsubscribeUserDoc();
      unsubscribeUserDoc = null;
    }
    clearAuthCookie();
    useAuthStore.setState({ user: null, loading: false, currency: "PKR" });
  }
});

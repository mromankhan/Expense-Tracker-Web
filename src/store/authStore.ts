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
onAuthStateChanged(auth, (user) => {
  if (user) {
    useAuthStore.setState({ user, loading: false });

    // Listen for user document changes (currency)
    const userDocRef = doc(db, "users", user.uid);
    onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.currency) {
          useAuthStore.setState({ currency: data.currency });
        }
      }
    });
  } else {
    useAuthStore.setState({ user: null, loading: false, currency: "PKR" });
  }
});

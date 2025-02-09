"use client";
import { auth } from "@/firebase/firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import { create } from "zustand";

// UserType ki definition
type UseAuthStoreType = {
  user: User | null;          // Firebase user object
  loading: boolean;           // Auth loading state
};

// Zustand Store
export const useAuthStore = create<UseAuthStoreType>((set) => ({
  user: null,                // Initialize with null
  loading: true,             // Initial loading state
}));

// Initialize and listen to auth state changes
onAuthStateChanged(auth, (user) => {
  const authStore = useAuthStore.getState();  // Zustand store state
  if (user) {
    console.log("User logged in:", user);
    useAuthStore.setState({ user, loading: false });
  } else {
    console.log("No user logged in");
    useAuthStore.setState({ user: null, loading: false });
  }
});

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
export const useAuthStore = create<UseAuthStoreType>(() => ({
  user: null,                // Initialize with null
  loading: true,             // Initial loading state
}));

// Initialize and listen to auth state changes
onAuthStateChanged(auth, (user) => {
  // const authStore = useAuthStore.getState();  // Zustand store state
  if (user) {
    // console.log("User logged in:", user);  for checking
    useAuthStore.setState({ user, loading: false });
  } else {
    // console.log("No user logged in");  for checking
    useAuthStore.setState({ user: null, loading: false });
  }
});







// "use client";
// import { auth } from "@/firebase/firebaseConfig";
// import { onAuthStateChanged, User } from "firebase/auth";
// import { useEffect } from "react";
// import { create } from "zustand";

// // UserType ki definition
// type UseAuthStoreType = {
//   user: User | null;
//   loading: boolean;
//   setUser: (user: User | null) => void;
//   setLoading: (loading: boolean) => void;
// };

// // Zustand Store (Proper Way)
// export const useAuthStore = create<UseAuthStoreType>((set) => ({
//   user: null,
//   loading: true,
//   setUser: (user) => set({ user }),
//   setLoading: (loading) => set({ loading }),
// }));

// // Auth state listener ko ek React component me wrap karo
// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const setUser = useAuthStore((state) => state.setUser);
//   const setLoading = useAuthStore((state) => state.setLoading);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       setUser(user);
//       setLoading(false);
//     });

//     return () => unsubscribe(); // Cleanup listener on unmount
//   }, [setUser, setLoading]);

//   return <>{children}</>;
// }

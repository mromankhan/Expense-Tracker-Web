"use client";
import { db } from "@/firebase/firebaseConfig";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { create } from "zustand";

type ExpenseStoreType = {
  expenses: Expense[];
  loading: boolean;
  fetchExpenses: (userId: string) => () => void;
};

type Expense = {
  id: string;
  title: string;
  amount: number;
  category: string;
  note?: string;
  date: string;
};

const useExpenseStore = create<ExpenseStoreType>((set) => ({
  expenses: [],
  loading: false,

  fetchExpenses: (userId: string) => {
    if (!userId) return () => {}; // If no user, return empty function

    set({ loading: true });

    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

    const qRef = collection(db, "users", userId, "expenses");
    const q = query(
      qRef,
      where("date", ">=", startOfMonth.toISOString()),
      where("date", "<=", endOfMonth.toISOString())
    );

    // **Real-time listener**
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        set({ expenses: [], loading: false });
        return;
      }

      const expensesData: Expense[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title || "",
        amount: doc.data().amount || 0,
        category: doc.data().category || "Misc",
        note: doc.data().note || "",
        date: doc.data().date || new Date().toISOString(),
      }));

      set({ expenses: expensesData, loading: false });
    });

    return unsubscribe; // Now returning the unsubscribe function
  },
}));

export default useExpenseStore;












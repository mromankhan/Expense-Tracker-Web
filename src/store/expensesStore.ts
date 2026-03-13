"use client";
import { db } from "@/firebase/firebaseConfig";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { create } from "zustand";
import { TransactionType } from "@/types/transactionType";

type ExpenseStoreType = {
  expenses: TransactionType[];
  loading: boolean;
  fetchExpenses: (userId: string) => () => void;
};

const useExpenseStore = create<ExpenseStoreType>((set) => ({
  expenses: [],
  loading: false,

  fetchExpenses: (userId: string) => {
    if (!userId) return () => {};

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

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        set({ expenses: [], loading: false });
        return;
      }

      const expensesData: TransactionType[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title || "",
        amount: doc.data().amount || 0,
        category: doc.data().category || "Misc",
        note: doc.data().note || "",
        date: doc.data().date || new Date().toISOString(),
      }));

      set({ expenses: expensesData, loading: false });
    });

    return unsubscribe;
  },
}));

export default useExpenseStore;

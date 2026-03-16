"use client";
import { db } from "@/firebase/firebaseConfig";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
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
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const startOfMonth = `${year}-${month}-01`;
    const lastDay = new Date(year, currentDate.getMonth() + 1, 0).getDate();
    const endOfMonth = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;

    const qRef = collection(db, "users", userId, "expenses");
    const q = query(
      qRef,
      where("date", ">=", startOfMonth),
      where("date", "<=", endOfMonth),
      orderBy("date", "desc")
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
    }, () => {
      set({ expenses: [], loading: false });
    });

    return unsubscribe;
  },
}));

export default useExpenseStore;

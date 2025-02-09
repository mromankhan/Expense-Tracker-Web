"use client";
import { db } from "@/firebase/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { create } from "zustand";


type ExpenseStoreType = {
  expenses: Expense[];
  loading: boolean;
  fetchExpenses: (userId: string) => void
}


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

  fetchExpenses: async (userId: string) => {
    set({ loading: true });
    try {
      const currrentDate = new Date();
      const startOfMonth = new Date(currrentDate.getFullYear(), currrentDate.getMonth(), 1);
      const endOfMonth = new Date(currrentDate.getFullYear(), currrentDate.getMonth() + 1, 0, 23, 59, 59);
      const qRef = collection(db, "users", userId, "expenses");
      const q = query(qRef,
        where("date", ">=", startOfMonth.toISOString()),
        where("date", "<=", endOfMonth.toISOString()),
      );
      const querySnap = await getDocs(q);
      const expensesData: Expense[] = querySnap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || "",          // Ensure title exists
          amount: data.amount || 0,         // Ensure amount exists
          category: data.category || "Misc",// Default category
          note: data.note || "",            // Optional field
          date: data.date || new Date().toISOString(), // Default to current date
        };
      });
      set({ expenses: expensesData })
    } catch (e) {
      console.error("Error fetching expenses:", e);
    } finally {
      set({ loading: false });
    }
  }
}))

export default useExpenseStore;
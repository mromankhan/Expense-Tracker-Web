"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/firebase/firebaseConfig";
import { doc, getDoc, updateDoc, collection, addDoc } from "firebase/firestore";
import { useAuthStore } from "@/store/authStore";
import { ToastContainer, toast } from "react-toastify";
import { Loader2 } from "lucide-react";

interface Expense {
  id?: string;
  title: string;
  amount: number;
  category: string;
  note: string;
  date: string;
}

export default function CreateExpense() {
  const searchParams = useSearchParams();
  const expenseId = searchParams.get("expenseId"); // Query se ID le rahe hain
  const user = useAuthStore((store) => store.user);
  const userId = user?.uid;
  const [loading, setLoading] = useState(false);
  const [expenseData, setExpenseData] = useState<Expense>({
    title: "",
    amount: 0,
    category: "Food",
    note: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (expenseId) {
      const fetchExpense = async () => {
        try {
          const docRef = doc(db, "users", userId!, "expenses", expenseId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setExpenseData(docSnap.data() as Expense);
          }
        } catch (e) {
          void e;
          // console.error("Error fetching expense:", e); // for dev
        }
      };
      fetchExpense();
    }
  }, [expenseId, userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!expenseData.title || !expenseData.amount) {
      toast.error("Please fill all fields!");
      return;
    }

    try {
      if (expenseId) {
        // If editing existing expense
        const expenseRef = doc(db, "users", userId!, "expenses", expenseId);
        await updateDoc(expenseRef, expenseData as Partial<Expense>);
        toast.success("Expense updated successfully!");
      } else {
        // If adding a new expense
        const docRef = collection(db, "users", userId!, "expenses");
        await addDoc(docRef, expenseData);
        toast.success("Expense added successfully!");
      }

      setExpenseData({ title: "", amount: 0, category: "Food", note: "", date: new Date().toISOString().split("T")[0] });
    } catch (e) {
      void e;
      // console.error("Error saving expense:", e); // for dev
      toast.error("Something went wrong! Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-5">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mb-24">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {expenseId ? "Edit Expense" : "Add Expense"}
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Title:</label>
          <input
            type="text"
            value={expenseData.title}
            onChange={(e) => setExpenseData({ ...expenseData, title: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Amount:</label>
          <input
            type="number"
            value={expenseData.amount}
            onChange={(e) => setExpenseData({ ...expenseData, amount: Number(e.target.value) })}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Category:</label>
          <select
            value={expenseData.category}
            onChange={(e) => setExpenseData({ ...expenseData, category: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Bills">Bills</option>
            <option value="Education">Education</option>
            <option value="Investments">Investments</option>
            <option value="Luxuries">Luxuries</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Date:</label>
          <input
            type="date"
            value={expenseData.date}
            onChange={(e) => setExpenseData({ ...expenseData, date: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">Note (Optional):</label>
          <textarea
            value={expenseData.note}
            onChange={(e) => setExpenseData({ ...expenseData, note: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            rows={3}
          />
        </div>

        <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-md">
          {loading ? <div className="flex justify-center items-center"><Loader2 className="animate-spin size-6" /></div> : expenseId ? "Update Expense" : "Add Expense"}
        </button>
        <ToastContainer position="top-center" />
      </form>
    </div>
  );
}
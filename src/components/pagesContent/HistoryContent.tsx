"use client";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { TransactionType } from "@/types/transactionType";
import { GiWallet } from "react-icons/gi";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";

const HistoryContent = () => {
  const { user } = useAuthStore();
  const [expenses, setExpenses] = useState<TransactionType[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchLastMonthExpenses = async (userId: string) => {
    if (!userId) return;

    // firstly check local storage
    const cachedExpenses = localStorage.getItem(`lastMonthExpenses_${userId}`);
    if (cachedExpenses) {
      const { expenses, totalAmount, timestamp } = JSON.parse(cachedExpenses);

      // valid data for 1 day in local storage
      const oneDay = 24 * 60 * 60 * 1000;
      if (Date.now() - timestamp < oneDay) {
        setExpenses(expenses);
        setTotalAmount(totalAmount);
        return;
      }
    }

    // if chache is expired then fetch from firebase
    setLoading(true);
    try {
      const today = new Date();
      const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);

      const q = query(
        collection(db, `users/${userId}/expenses`),
        where("date", ">=", firstDayOfLastMonth.toISOString().split("T")[0]),
        where("date", "<=", lastDayOfLastMonth.toISOString().split("T")[0])
      );

      const querySnapshot = await getDocs(q);
      const expensesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title || "Unknown",
        date: doc.data().date || new Date().toISOString(),
        amount: doc.data().amount || 0,
        category: doc.data().category || "Food",
      }));

      const totalExpenses = expensesData.reduce((acc, curr) => acc + curr.amount, 0);

      // save data in local storage
      localStorage.setItem(
        `lastMonthExpenses_${userId}`,
        JSON.stringify({ expenses: expensesData, totalAmount: totalExpenses, timestamp: Date.now() })
      );

      setExpenses(expensesData);
      setTotalAmount(totalExpenses);
    } catch (e) {
      void e;
      // console.error("Error fetching last month's expenses:", e); // for dev
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      fetchLastMonthExpenses(user.uid);
    }
  }, [user?.uid]);

  return (
    <>
      <div className="flex flex-col items-center min-h-screen py-12 bg-gray-100 relative">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
          <h2 className="text-2xl font-semibold">Previous Month&apos;s Expenses</h2>
          <p className="text-gray-500 text-md font-bold mt-2">Total expenses: ${totalAmount}</p>
        </div>

        <div className="w-full sm:w-full md:w-3/4 lg:w-1/2 mt-6 lg:mt-0">
          <div className="w-full mx-auto p-4">
            <div className="flex justify-center items-center mb-4">
              <h3 className="text-lg font-semibold">Transactions</h3>
            </div>

            <ul>
              {loading ? (
                <div className="flex justify-center items-center">
                  <Loader2 className="animate-spin size-16" />
                </div>
              ) : expenses.length > 0 ? (
                expenses.map((expense) => (
                  <li key={expense.id} className="flex items-center justify-between bg-gray-100 p-4 rounded-lg mb-4 shadow-md">
                    <GiWallet />
                    <div className="flex-1 ml-4">
                      <h4 className="text-base font-medium">{expense.title}</h4>
                      <p className="text-sm text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
                    </div>
                    <div className={`text-lg font-semibold mr-5 ${expense.amount < 0 ? "text-red-500" : "text-green-500"}`}>
                      {expense.amount < 0 ? `- $${Math.abs(expense.amount)}` : `+ $${expense.amount}`}
                    </div>
                  </li>
                ))
              ) : (
                <p className="text-center text-gray-500">No expenses found for last month.</p>
              )}
            </ul>
          </div>
        </div>
      </div>
      <Navbar />
    </>
  );
};

export default HistoryContent;

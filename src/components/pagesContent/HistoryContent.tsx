"use client";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { TransactionType } from "@/types/transactionType";
import { Loader2, Wallet, History } from "lucide-react";
import Navbar from "@/components/Navbar";
import { formatDate } from "@/utils/formatDate";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const HistoryContent = () => {
  const { user } = useAuthStore();
  const currency = useAuthStore((state) => state.currency);
  const [expenses, setExpenses] = useState<TransactionType[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchLastMonthExpenses = async (userId: string) => {
    if (!userId) return;

    const cachedExpenses = localStorage.getItem(`lastMonthExpenses_${userId}`);
    if (cachedExpenses) {
      const { expenses, totalAmount, timestamp } = JSON.parse(cachedExpenses);

      const oneDay = 24 * 60 * 60 * 1000;
      if (Date.now() - timestamp < oneDay) {
        setExpenses(expenses);
        setTotalAmount(totalAmount);
        return;
      }
    }

    setLoading(true);
    try {
      const today = new Date();
      const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);

      const q = query(
        collection(db, `users/${userId}/expenses`),
        where("date", ">=", firstDayOfLastMonth.toISOString().split("T")[0]),
        where("date", "<=", lastDayOfLastMonth.toISOString().split("T")[0]),
        orderBy("date", "desc"),
        limit(100)
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

      localStorage.setItem(
        `lastMonthExpenses_${userId}`,
        JSON.stringify({ expenses: expensesData, totalAmount: totalExpenses, timestamp: Date.now() })
      );

      setExpenses(expensesData);
      setTotalAmount(totalExpenses);
    } catch {
      toast.error("Failed to load history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      fetchLastMonthExpenses(user.uid);
    }
  }, [user?.uid]);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Food: "bg-orange-100 text-orange-700",
      Transport: "bg-blue-100 text-blue-700",
      Bills: "bg-red-100 text-red-700",
      Education: "bg-green-100 text-green-700",
      Investments: "bg-purple-100 text-purple-700",
      Luxuries: "bg-pink-100 text-pink-700",
      Other: "bg-gray-100 text-gray-700",
    };
    return colors[category] ?? "bg-gray-100 text-gray-700";
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-28">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-5 pt-8 pb-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <History size={20} className="text-purple-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Previous Month</h1>
                <p className="text-sm text-gray-500">Expense history</p>
              </div>
            </div>

            <Card className="border border-purple-100 bg-purple-50 shadow-none rounded-xl">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-purple-600 mb-1">Total Spent Last Month</p>
                <p className="text-2xl font-bold text-purple-900">{totalAmount} <span className="text-base font-medium">{currency}</span></p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Transaction List */}
        <div className="max-w-2xl mx-auto px-5 mt-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Transactions</h3>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="animate-spin size-10 text-purple-600" />
            </div>
          ) : expenses.length > 0 ? (
            <ul className="space-y-3">
              {expenses.map((expense) => (
                <li key={expense.id}>
                  <Card className="border border-gray-100 shadow-sm rounded-xl">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                            <Wallet size={18} className="text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 truncate">{expense.title}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs text-gray-400">{formatDate(expense.date)}</p>
                              {expense.category && (
                                <Badge className={`text-xs px-2 py-0 rounded-full font-medium border-0 ${getCategoryColor(expense.category)}`}>
                                  {expense.category}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className={`text-sm font-bold shrink-0 ml-2 ${expense.amount < 0 ? "text-red-500" : "text-green-600"}`}>
                          {expense.amount < 0 ? `- ${Math.abs(expense.amount)}` : `+ ${expense.amount}`} {currency}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <History size={28} className="text-gray-400" />
              </div>
              <h4 className="text-base font-semibold text-gray-700 mb-1">No history found</h4>
              <p className="text-sm text-gray-400">No expenses recorded for last month.</p>
            </div>
          )}
        </div>
      </div>
      <Navbar />
    </>
  );
};

export default HistoryContent;

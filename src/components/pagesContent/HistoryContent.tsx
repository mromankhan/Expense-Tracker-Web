"use client";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { TransactionType } from "@/types/transactionType";
import {
  Loader2,
  Utensils,
  Car,
  Receipt,
  GraduationCap,
  TrendingUp,
  Gem,
  HelpCircle,
  CalendarDays,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { formatDate } from "@/utils/formatDate";
import { toast } from "react-toastify";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Food: <Utensils size={16} />,
  Transport: <Car size={16} />,
  Bills: <Receipt size={16} />,
  Education: <GraduationCap size={16} />,
  Investments: <TrendingUp size={16} />,
  Luxuries: <Gem size={16} />,
  Other: <HelpCircle size={16} />,
};

const CATEGORY_ICON_BG: Record<string, string> = {
  Food: "bg-orange-100 text-orange-600",
  Transport: "bg-blue-100 text-blue-600",
  Bills: "bg-red-100 text-red-600",
  Education: "bg-green-100 text-green-600",
  Investments: "bg-purple-100 text-purple-600",
  Luxuries: "bg-pink-100 text-pink-600",
  Other: "bg-gray-100 text-gray-500",
};

const CATEGORY_COLORS: Record<string, string> = {
  Food: "bg-orange-100 text-orange-700 border-orange-200",
  Transport: "bg-blue-100 text-blue-700 border-blue-200",
  Bills: "bg-red-100 text-red-700 border-red-200",
  Education: "bg-green-100 text-green-700 border-green-200",
  Investments: "bg-purple-100 text-purple-700 border-purple-200",
  Luxuries: "bg-pink-100 text-pink-700 border-pink-200",
  Other: "bg-gray-100 text-gray-700 border-gray-200",
};

const HistoryContent = () => {
  const { user } = useAuthStore();
  const currency = useAuthStore((state) => state.currency);
  const [expenses, setExpenses] = useState<TransactionType[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchLastMonthExpenses = async (userId: string) => {
    if (!userId) return;

    const cached = localStorage.getItem(`lastMonthExpenses_${userId}`);
    if (cached) {
      const { expenses, totalAmount, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
        setExpenses(expenses);
        setTotalAmount(totalAmount);
        return;
      }
    }

    setLoading(true);
    try {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);

      const q = query(
        collection(db, `users/${userId}/expenses`),
        where("date", ">=", firstDay.toISOString().split("T")[0]),
        where("date", "<=", lastDay.toISOString().split("T")[0]),
        orderBy("date", "desc"),
        limit(100)
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        title: d.data().title || "Unknown",
        date: d.data().date || new Date().toISOString(),
        amount: d.data().amount || 0,
        category: d.data().category || "Other",
      }));

      const total = data.reduce((acc, curr) => acc + curr.amount, 0);
      localStorage.setItem(
        `lastMonthExpenses_${userId}`,
        JSON.stringify({ expenses: data, totalAmount: total, timestamp: Date.now() })
      );

      setExpenses(data);
      setTotalAmount(total);
    } catch {
      toast.error("Failed to load history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.uid) fetchLastMonthExpenses(user.uid);
  }, [user?.uid]);

  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const monthLabel = lastMonth.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <>
      <div className="min-h-screen bg-background pb-28">
        {/* Gradient Header */}
        <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 px-5 pt-8 pb-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-5">
              <div className="size-10 bg-white/20 rounded-xl flex items-center justify-center">
                <CalendarDays size={20} className="text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary-foreground">History</h1>
                <p className="text-sm text-primary-foreground/70">{monthLabel}</p>
              </div>
            </div>

            <div className="bg-white/15 rounded-2xl px-4 py-4">
              <p className="text-xs font-semibold text-primary-foreground/70 uppercase tracking-wide mb-1">
                Total Spent Last Month
              </p>
              <p className="text-3xl font-extrabold text-primary-foreground">
                {totalAmount}{" "}
                <span className="text-lg font-semibold text-primary-foreground/80">
                  {currency}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="max-w-2xl mx-auto px-5 mt-6">
          <h3 className="text-base font-semibold text-foreground mb-4">Transactions</h3>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="animate-spin size-10 text-primary" />
            </div>
          ) : expenses.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {expenses.map((expense) => {
                const iconBg = CATEGORY_ICON_BG[expense.category] ?? CATEGORY_ICON_BG.Other;
                return (
                  <li key={expense.id}>
                    <Card className="border border-border shadow-sm rounded-2xl bg-card">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div
                              className={`size-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
                            >
                              {CATEGORY_ICONS[expense.category] ?? (
                                <HelpCircle size={16} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-foreground truncate">
                                {expense.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(expense.date)}
                                </p>
                                {expense.category && (
                                  <Badge
                                    className={`text-[10px] px-2 py-0 rounded-full font-medium border ${
                                      CATEGORY_COLORS[expense.category] ??
                                      CATEGORY_COLORS.Other
                                    }`}
                                  >
                                    {expense.category}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <span
                            className={`text-sm font-bold shrink-0 ml-2 ${
                              expense.amount < 0 ? "text-red-500" : "text-green-600"
                            }`}
                          >
                            {expense.amount < 0
                              ? `- ${Math.abs(expense.amount)}`
                              : expense.amount}{" "}
                            {currency}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <CalendarDays size={28} className="text-primary" />
              </div>
              <h4 className="text-base font-semibold text-foreground mb-1">
                No history found
              </h4>
              <p className="text-sm text-muted-foreground">
                No expenses recorded for last month.
              </p>
            </div>
          )}
        </div>
      </div>
      <Navbar />
    </>
  );
};

export default HistoryContent;

"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/firebase/firebaseConfig";
import { TransactionType } from "@/types/transactionType";
import Navbar from "./Navbar";
import useExpenseStore from "@/store/expensesStore";
import { useAuthStore } from "@/store/authStore";
import { signOut } from "firebase/auth";
import { toast } from "react-toastify";
import {
  LogOut,
  MoreVertical,
  TrendingDown,
  TrendingUp,
  Wallet,
  Utensils,
  Car,
  Receipt,
  GraduationCap,
  Gem,
  HelpCircle,
} from "lucide-react";
import { MdDelete, MdEdit } from "react-icons/md";
import { formatDate } from "@/utils/formatDate";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Food: <Utensils size={16} />,
  Transport: <Car size={16} />,
  Bills: <Receipt size={16} />,
  Education: <GraduationCap size={16} />,
  Investments: <TrendingUp size={16} />,
  Luxuries: <Gem size={16} />,
  Other: <HelpCircle size={16} />,
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

const CATEGORY_ICON_BG: Record<string, string> = {
  Food: "bg-orange-100 text-orange-600",
  Transport: "bg-blue-100 text-blue-600",
  Bills: "bg-red-100 text-red-600",
  Education: "bg-green-100 text-green-600",
  Investments: "bg-purple-100 text-purple-600",
  Luxuries: "bg-pink-100 text-pink-600",
  Other: "bg-gray-100 text-gray-500",
};

export default function Dashboard() {
  const user = useAuthStore((store) => store.user);
  const currency = useAuthStore((store) => store.currency);
  const { expenses, fetchExpenses, loading } = useExpenseStore();
  const router = useRouter();
  const [incomeAmount, setIncomeAmount] = useState<number | null>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const userUid = user?.uid;

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, expense) => sum + expense.amount, 0),
    [expenses]
  );
  const remainIncome = incomeAmount !== null ? incomeAmount - totalExpenses : null;
  const spendPercent =
    incomeAmount && incomeAmount > 0
      ? Math.min(100, Math.round((totalExpenses / incomeAmount) * 100))
      : 0;

  const deleteExpns = async (userId: string, deleteId: string) => {
    try {
      await deleteDoc(doc(db, "users", userId, "expenses", deleteId));
    } catch {
      toast.error("Failed to delete the expense. Please try again.");
    }
  };

  useEffect(() => {
    if (!userUid) return;
    const unsubscribe = fetchExpenses(userUid);
    return () => unsubscribe();
  }, [userUid, fetchExpenses]);

  useEffect(() => {
    if (!userUid) return;
    const unsubscribe = onSnapshot(doc(db, "users", userUid), (docSnap) => {
      if (docSnap.exists()) setIncomeAmount(docSnap.data().totalIncome ?? null);
    });
    return () => unsubscribe();
  }, [userUid]);

  const handleSignout = async () => {
    setLogoutLoading(true);
    try {
      await signOut(auth);
      router.push("/");
    } catch {
      toast.error("Logout failed. Please try again.");
    } finally {
      setLogoutLoading(false);
    }
  };

  const username = user?.email?.split("@")[0] ?? "User";
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <>
      <div className="min-h-screen bg-background pb-28">
        {/* Gradient Header */}
        <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 px-5 pt-8 pb-8">
          <div className="max-w-2xl mx-auto">
            {/* User row */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-primary-foreground/70 text-sm font-medium">Hello,</p>
                <h1 className="text-2xl font-bold text-primary-foreground capitalize">
                  {username}
                </h1>
              </div>
              <Avatar className="size-11 ring-2 ring-white/30">
                <AvatarFallback className="bg-white/20 text-primary-foreground font-bold text-base">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Budget progress */}
            {incomeAmount !== null && incomeAmount > 0 && (
              <div className="bg-white/15 rounded-2xl px-4 py-3 mb-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-primary-foreground/80">
                    Budget Used
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      spendPercent >= 90 ? "text-red-300" : "text-primary-foreground"
                    }`}
                  >
                    {spendPercent}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${spendPercent}%` }}
                  />
                </div>
                <p className="text-xs text-primary-foreground/60 mt-1.5">
                  {totalExpenses} / {incomeAmount} {currency} spent
                </p>
              </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/15 rounded-2xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp size={13} className="text-green-300" />
                  <span className="text-[10px] font-semibold text-primary-foreground/70 uppercase tracking-wide">
                    Income
                  </span>
                </div>
                <p className="text-sm font-bold text-primary-foreground truncate">
                  {incomeAmount !== null ? incomeAmount : "—"}
                </p>
                <p className="text-[10px] text-primary-foreground/60">{currency}</p>
              </div>

              <div className="bg-white/15 rounded-2xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Wallet size={13} className="text-blue-200" />
                  <span className="text-[10px] font-semibold text-primary-foreground/70 uppercase tracking-wide">
                    Left
                  </span>
                </div>
                <p
                  className={`text-sm font-bold truncate ${
                    remainIncome !== null && remainIncome < 0
                      ? "text-red-300"
                      : "text-primary-foreground"
                  }`}
                >
                  {remainIncome !== null ? remainIncome : "—"}
                </p>
                <p className="text-[10px] text-primary-foreground/60">{currency}</p>
              </div>

              <div className="bg-white/15 rounded-2xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingDown size={13} className="text-red-300" />
                  <span className="text-[10px] font-semibold text-primary-foreground/70 uppercase tracking-wide">
                    Spent
                  </span>
                </div>
                <p className="text-sm font-bold text-primary-foreground truncate">
                  {totalExpenses}
                </p>
                <p className="text-[10px] text-primary-foreground/60">{currency}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="max-w-2xl mx-auto px-5 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-foreground">Transactions</h3>
            <button
              onClick={handleSignout}
              disabled={logoutLoading}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut size={14} />
              {logoutLoading ? "Logging out…" : "Logout"}
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-border">
                  <Skeleton className="size-11 rounded-xl shrink-0" />
                  <div className="flex-1 flex flex-col gap-2">
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                  </div>
                  <Skeleton className="h-4 w-16 rounded" />
                </div>
              ))}
            </div>
          ) : expenses && expenses.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {expenses.map((expense: TransactionType) => {
                const iconBg = CATEGORY_ICON_BG[expense.category] ?? CATEGORY_ICON_BG.Other;
                return (
                  <li key={expense.id}>
                    <Card className="border border-border shadow-sm rounded-2xl hover:shadow-md transition-shadow duration-200 bg-card">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div
                              className={`size-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
                            >
                              {CATEGORY_ICONS[expense.category] ?? (
                                <Wallet size={16} />
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
                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`text-sm font-bold ${
                                expense.amount < 0 ? "text-red-500" : "text-green-600"
                              }`}
                            >
                              {expense.amount < 0
                                ? `- ${Math.abs(expense.amount)}`
                                : expense.amount}{" "}
                              {currency}
                            </span>
                            <DropdownMenu>
                              <DropdownMenuTrigger className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                                <MoreVertical size={15} className="text-muted-foreground" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-32">
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(`/addExpense?expenseId=${expense.id}`)
                                  }
                                  className="flex items-center gap-2"
                                >
                                  <MdEdit size={15} /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => deleteExpns(userUid!, expense.id!)}
                                  className="flex items-center gap-2 text-destructive focus:text-destructive"
                                >
                                  <MdDelete size={15} /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
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
                <Wallet size={28} className="text-primary" />
              </div>
              <h4 className="text-base font-semibold text-foreground mb-1">
                No expenses yet
              </h4>
              <p className="text-sm text-muted-foreground mb-5">
                Start tracking by adding your first expense.
              </p>
              <Button
                onClick={() => router.push("/addExpense")}
                size="sm"
                className="rounded-xl gap-2"
              >
                Add Expense
              </Button>
            </div>
          )}
        </div>
      </div>
      <Navbar />
    </>
  );
}

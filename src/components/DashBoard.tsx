"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/firebase/firebaseConfig';
import { TransactionType } from "@/types/transactionType";
import Navbar from './Navbar';
import useExpenseStore from '@/store/expensesStore';
import { useAuthStore } from '@/store/authStore';
import { signOut } from 'firebase/auth';
import { toast } from 'react-toastify';
import { Loader2, MoreVertical, TrendingDown, TrendingUp, Wallet, LogOut, Plus } from 'lucide-react';
import { MdDelete, MdEdit } from 'react-icons/md';
import { formatDate } from '@/utils/formatDate';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Dashboard() {
  const user = useAuthStore((store) => store.user);
  const currency = useAuthStore((store) => store.currency);
  const { expenses, fetchExpenses, loading } = useExpenseStore();
  const router = useRouter();
  const [incomeAmount, setIncomeAmount] = useState<number | null>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const userUid = user?.uid;

  // Compute totalExpenses from the expenses array - no extra Firestore listener needed
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  const remainIncome = incomeAmount !== null ? incomeAmount - totalExpenses : null;

  // Delete expense
  const deleteExpns = async (userId: string, deleteId: string) => {
    try {
      const deleteRef = doc(db, "users", userId, "expenses", deleteId);
      await deleteDoc(deleteRef);
    } catch {
      toast.error("Failed to delete the expense. Please try again.");
    }
  };

  // Fetch expenses with real-time updates
  useEffect(() => {
    if (!userUid) return;
    const unsubscribe = fetchExpenses(userUid);
    return () => unsubscribe();
  }, [userUid, fetchExpenses]);

  // Listen for income changes
  useEffect(() => {
    if (!userUid) return;

    const incomeRef = doc(db, "users", userUid);
    const unsubscribe = onSnapshot(incomeRef, (docSnap) => {
      if (docSnap.exists()) {
        setIncomeAmount(docSnap.data().totalIncome ?? null);
      }
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
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-sm text-gray-500 font-medium">Hello,</p>
                <h1 className="text-2xl font-bold text-gray-900">{user?.email?.split("@")[0] ?? "User"}</h1>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => router.push("/addExpense")}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-9 px-4 text-sm font-medium shadow-sm"
                >
                  <Plus size={16} className="mr-1" /> Add
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                    <MoreVertical size={20} className="text-gray-500" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={() => router.push("/history")}>
                      Previous Expenses
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/settings")}>
                      Settings
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="border border-green-100 bg-green-50 shadow-none rounded-xl">
                <CardContent className="p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingUp size={14} className="text-green-600" />
                    <span className="text-xs font-medium text-green-700">Income</span>
                  </div>
                  <p className="text-sm font-bold text-green-800 truncate">
                    {incomeAmount !== null ? `${incomeAmount}` : "—"}
                  </p>
                  <p className="text-xs text-green-600">{currency}</p>
                </CardContent>
              </Card>

              <Card className="border border-purple-100 bg-purple-50 shadow-none rounded-xl">
                <CardContent className="p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Wallet size={14} className="text-purple-600" />
                    <span className="text-xs font-medium text-purple-700">Remaining</span>
                  </div>
                  <p className={`text-sm font-bold truncate ${remainIncome !== null && remainIncome < 0 ? "text-red-700" : "text-purple-800"}`}>
                    {remainIncome !== null ? `${remainIncome}` : "—"}
                  </p>
                  <p className="text-xs text-purple-600">{currency}</p>
                </CardContent>
              </Card>

              <Card className="border border-red-100 bg-red-50 shadow-none rounded-xl">
                <CardContent className="p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingDown size={14} className="text-red-600" />
                    <span className="text-xs font-medium text-red-700">Expenses</span>
                  </div>
                  <p className="text-sm font-bold text-red-800 truncate">{totalExpenses}</p>
                  <p className="text-xs text-red-600">{currency}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="max-w-2xl mx-auto px-5 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-gray-900">Transactions</h3>
            <button
              onClick={handleSignout}
              disabled={logoutLoading}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              {logoutLoading
                ? <Loader2 className="size-4 animate-spin" />
                : <><LogOut size={15} /> Logout</>
              }
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="animate-spin size-10 text-purple-600" />
            </div>
          ) : expenses && expenses.length > 0 ? (
            <ul className="space-y-3">
              {expenses.map((expense: TransactionType) => (
                <li key={expense.id}>
                  <Card className="border border-gray-100 shadow-sm rounded-xl hover:shadow-md transition-shadow duration-200">
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
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-sm font-bold ${expense.amount < 0 ? 'text-red-500' : 'text-green-600'}`}>
                            {expense.amount < 0 ? `- ${Math.abs(expense.amount)}` : `+ ${expense.amount}`} {currency}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                              <MoreVertical size={16} className="text-gray-400" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-32">
                              <DropdownMenuItem
                                onClick={() => router.push(`/addExpense?expenseId=${expense.id}`)}
                                className="flex items-center gap-2"
                              >
                                <MdEdit size={16} /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => deleteExpns(userUid!, expense.id!)}
                                className="flex items-center gap-2 text-red-500 focus:text-red-500"
                              >
                                <MdDelete size={16} /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <Wallet size={28} className="text-gray-400" />
              </div>
              <h4 className="text-base font-semibold text-gray-700 mb-1">No expenses yet</h4>
              <p className="text-sm text-gray-400">Start tracking by adding your first expense.</p>
            </div>
          )}
        </div>
      </div>
      <Navbar />
    </>
  );
}

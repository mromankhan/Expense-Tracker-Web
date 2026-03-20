"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "@/firebase/firebaseConfig";
import { doc, getDoc, updateDoc, collection, addDoc } from "firebase/firestore";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-toastify";
import { Loader2, ArrowLeft, Utensils, Car, Receipt, GraduationCap, TrendingUp, Gem, HelpCircle } from "lucide-react";
import { TransactionType } from "@/types/transactionType";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "Food", icon: Utensils, color: "text-orange-600 bg-orange-50 border-orange-200" },
  { value: "Transport", icon: Car, color: "text-blue-600 bg-blue-50 border-blue-200" },
  { value: "Bills", icon: Receipt, color: "text-red-600 bg-red-50 border-red-200" },
  { value: "Education", icon: GraduationCap, color: "text-green-600 bg-green-50 border-green-200" },
  { value: "Investments", icon: TrendingUp, color: "text-purple-600 bg-purple-50 border-purple-200" },
  { value: "Luxuries", icon: Gem, color: "text-pink-600 bg-pink-50 border-pink-200" },
  { value: "Other", icon: HelpCircle, color: "text-gray-500 bg-gray-50 border-gray-200" },
];

export default function AddExpenseForm() {
  const searchParams = useSearchParams();
  const expenseId = searchParams.get("expenseId");
  const router = useRouter();
  const user = useAuthStore((store) => store.user);
  const currency = useAuthStore((store) => store.currency);
  const userId = user?.uid;
  const [loading, setLoading] = useState(false);
  const [expenseData, setExpenseData] = useState<Omit<TransactionType, "id">>({
    title: "",
    amount: 0,
    category: "Food",
    note: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (expenseId && userId) {
      const fetchExpense = async () => {
        try {
          const docSnap = await getDoc(doc(db, "users", userId, "expenses", expenseId));
          if (docSnap.exists()) setExpenseData(docSnap.data() as Omit<TransactionType, "id">);
        } catch {
          toast.error("Failed to load expense. Please try again.");
        }
      };
      fetchExpense();
    }
  }, [expenseId, userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseData.title || !expenseData.amount) {
      toast.error("Please fill all fields!");
      return;
    }
    setLoading(true);
    try {
      if (expenseId) {
        await updateDoc(doc(db, "users", userId!, "expenses", expenseId), { ...expenseData });
        toast.success("Expense updated successfully!");
      } else {
        await addDoc(collection(db, "users", userId!, "expenses"), expenseData);
        toast.success("Expense added successfully!");
      }
      setExpenseData({ title: "", amount: 0, category: "Food", note: "", date: new Date().toISOString().split("T")[0] });
    } catch {
      toast.error("Something went wrong! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/8 via-background to-background pb-28">
      {/* Header */}
      <div className="bg-card border-b border-border px-5 pt-8 pb-5">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <h1 className="text-2xl font-bold text-foreground">
            {expenseId ? "Edit Expense" : "Add Expense"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {expenseId ? "Update your expense details" : "Record a new transaction"}
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              type="text"
              id="title"
              value={expenseData.title}
              onChange={(e) => setExpenseData({ ...expenseData, title: e.target.value })}
              placeholder="e.g. Grocery Shopping"
              className="h-11 rounded-xl"
              required
            />
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="amount">Amount ({currency})</Label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                {currency}
              </span>
              <Input
                type="number"
                id="amount"
                value={expenseData.amount || ""}
                onChange={(e) => setExpenseData({ ...expenseData, amount: Number(e.target.value) })}
                placeholder="0"
                className="h-11 rounded-xl pl-12"
                required
              />
            </div>
          </div>

          {/* Category - icon grid */}
          <div className="flex flex-col gap-2">
            <Label>Category</Label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map(({ value, icon: Icon, color }) => {
                const selected = expenseData.category === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setExpenseData({ ...expenseData, category: value })}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all duration-150",
                      selected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border bg-card hover:border-muted-foreground/30"
                    )}
                  >
                    <div
                      className={cn(
                        "size-8 rounded-xl flex items-center justify-center",
                        selected ? "bg-primary text-primary-foreground" : color
                      )}
                    >
                      <Icon size={15} />
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-medium leading-tight text-center",
                        selected ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {value}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="date">Date</Label>
            <Input
              type="date"
              id="date"
              value={expenseData.date}
              onChange={(e) => setExpenseData({ ...expenseData, date: e.target.value })}
              className="h-11 rounded-xl"
              required
            />
          </div>

          {/* Note */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note">
              Note{" "}
              <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <Textarea
              id="note"
              value={expenseData.note}
              onChange={(e) => setExpenseData({ ...expenseData, note: e.target.value })}
              placeholder="Add any additional notes…"
              className="rounded-xl resize-none"
              rows={3}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="w-full rounded-xl font-semibold shadow-md shadow-primary/20 mt-1"
          >
            {loading ? (
              <Loader2 className="animate-spin size-5" />
            ) : expenseId ? (
              "Update Expense"
            ) : (
              "Add Expense"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

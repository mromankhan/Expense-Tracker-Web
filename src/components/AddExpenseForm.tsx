"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/firebase/firebaseConfig";
import { doc, getDoc, updateDoc, collection, addDoc } from "firebase/firestore";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import { TransactionType } from "@/types/transactionType";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AddExpenseForm() {
  const searchParams = useSearchParams();
  const expenseId = searchParams.get("expenseId");
  const user = useAuthStore((store) => store.user);
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
          const docRef = doc(db, "users", userId, "expenses", expenseId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setExpenseData(docSnap.data() as Omit<TransactionType, "id">);
          }
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
        const expenseRef = doc(db, "users", userId!, "expenses", expenseId);
        await updateDoc(expenseRef, { ...expenseData });
        toast.success("Expense updated successfully!");
      } else {
        const docRef = collection(db, "users", userId!, "expenses");
        await addDoc(docRef, expenseData);
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
    <div className="flex justify-center items-start min-h-screen bg-gray-50 p-5 pb-28 pt-8">
      <Card className="w-full max-w-md shadow-lg border border-gray-100 rounded-2xl">
        <CardHeader className="text-center pb-2 pt-8">
          <CardTitle className="text-2xl font-bold text-gray-900">
            {expenseId ? "Edit Expense" : "Add Expense"}
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            {expenseId ? "Update your expense details" : "Record a new transaction"}
          </p>
        </CardHeader>
        <CardContent className="px-8 pb-8 pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Title</Label>
              <Input
                type="text"
                value={expenseData.title}
                onChange={(e) => setExpenseData({ ...expenseData, title: e.target.value })}
                placeholder="e.g. Grocery Shopping"
                className="h-11 border-gray-200 focus:border-purple-400 focus:ring-purple-400 rounded-lg"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Amount</Label>
              <Input
                type="number"
                value={expenseData.amount}
                onChange={(e) => setExpenseData({ ...expenseData, amount: Number(e.target.value) })}
                placeholder="e.g. 500"
                className="h-11 border-gray-200 focus:border-purple-400 focus:ring-purple-400 rounded-lg"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Category</Label>
              <Select
                value={expenseData.category}
                onValueChange={(value) => { if (value) setExpenseData({ ...expenseData, category: value }); }}
              >
                <SelectTrigger className="h-11 border-gray-200 rounded-lg focus:ring-purple-400">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Transport">Transport</SelectItem>
                  <SelectItem value="Bills">Bills</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Investments">Investments</SelectItem>
                  <SelectItem value="Luxuries">Luxuries</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Date</Label>
              <Input
                type="date"
                value={expenseData.date}
                onChange={(e) => setExpenseData({ ...expenseData, date: e.target.value })}
                className="h-11 border-gray-200 focus:border-purple-400 focus:ring-purple-400 rounded-lg"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Note <span className="text-gray-400 font-normal">(Optional)</span></Label>
              <Textarea
                value={expenseData.note}
                onChange={(e) => setExpenseData({ ...expenseData, note: e.target.value })}
                placeholder="Add any additional notes..."
                className="border-gray-200 focus:border-purple-400 focus:ring-purple-400 rounded-lg resize-none"
                rows={3}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200 mt-2"
            >
              {loading
                ? <Loader2 className="animate-spin size-5 mx-auto" />
                : expenseId ? "Update Expense" : "Add Expense"
              }
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

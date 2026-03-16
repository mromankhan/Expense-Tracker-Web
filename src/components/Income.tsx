"use client";
import { db } from "@/firebase/firebaseConfig";
import { useAuthStore } from "@/store/authStore";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

const Income = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const currency = useAuthStore((state) => state.currency);
  const [income, setIncome] = useState<string>("");

  const saveIncome = async () => {
    if (!user?.uid) {
      toast.error("User not found!");
      return;
    }

    const salary = Number(income);
    if (isNaN(salary) || salary <= 0) {
      toast.error("Please enter a valid income!");
      return;
    }

    try {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, { totalIncome: salary });

      toast.success("Income updated successfully!");
      setTimeout(() => router.push("/expenseTracker"), 1500);
    } catch {
      toast.error("Sorry! Can't update income. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-5">
      <Card className="w-full max-w-md shadow-lg border border-gray-100 rounded-2xl">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet size={22} className="text-purple-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Set Your Income</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Enter your monthly income in {currency}
          </p>
        </CardHeader>
        <CardContent className="px-8 pb-8 pt-4">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="income" className="text-sm font-medium text-gray-700">
                Monthly Income ({currency})
              </Label>
              <Input
                type="number"
                id="income"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                placeholder="e.g. 50000"
                className="h-11 border-gray-200 focus:border-purple-400 focus:ring-purple-400 rounded-lg"
                required
              />
            </div>
            <Button
              onClick={saveIncome}
              disabled={!income}
              className={`w-full h-11 rounded-lg font-medium transition-all duration-200 ${
                income
                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Save Income
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Income;

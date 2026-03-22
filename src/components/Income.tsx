"use client";
import { db } from "@/firebase/firebaseConfig";
import { useAuthStore } from "@/store/authStore";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Wallet, TrendingUp } from "lucide-react";

const Income = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const currency = useAuthStore((state) => state.currency);
  const [income, setIncome] = useState<string>("");
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), { totalIncome: salary });
      toast.success("Income updated successfully!");
      setTimeout(() => router.push("/expenseTracker"), 1200);
    } catch {
      toast.error("Sorry! Can't update income. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-primary/8 via-background to-background p-5">
      <Card className="w-full max-w-md border-0 shadow-xl shadow-purple-100/60 rounded-3xl">
        <CardHeader className="text-center pb-0 pt-8 px-8">
          <div className="size-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/30">
            <Wallet size={24} className="text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Set Your Income</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Enter your monthly income so we can track your budget
          </p>
        </CardHeader>

        <CardContent className="px-8 pb-8 pt-6">
          <div className="flex flex-col gap-4">
            {/* Income input */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="income">Monthly Income ({currency})</Label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                  {currency}
                </span>
                <Input
                  type="number"
                  id="income"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  placeholder="50000"
                  className="h-11 rounded-xl pl-12"
                  required
                />
              </div>
            </div>

            {/* Tips */}
            <div className="bg-accent rounded-xl px-4 py-3 flex items-start gap-3">
              <TrendingUp size={16} className="text-accent-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-accent-foreground leading-relaxed">
                Setting your income helps us show how much budget you have remaining each month.
              </p>
            </div>

            <Button
              onClick={saveIncome}
              disabled={!income || loading}
              size="lg"
              className="w-full rounded-xl font-semibold shadow-md shadow-primary/20 mt-1"
            >
              {loading ? "Saving…" : "Save Income"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Income;

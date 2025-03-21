"use client";
import { db } from "@/firebase/firebaseConfig";
import { useAuthStore } from "@/store/authStore";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Income = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
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
    } catch (e) {
      void e;
      toast.error("Sorry! Can't update income. Please try again.");
    }
  };

  return (
    <>
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="mb-4 text-2xl">Please Enter Your Income</h1>
          <div className="mb-4 w-full max-w-md mx-auto p-8 bg-white shadow-lg rounded-lg flex flex-col">
            <label htmlFor="income" className="block text-sm font-medium text-gray-700 mb-1">
              Income:
            </label>
            <input
              type="number"
              id="income"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
              required
            />
            <button
              onClick={saveIncome}
              disabled={!income}
              className={`mt-5 px-4 py-3 rounded-md transition duration-300 ${
                income ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-400 text-gray-700 cursor-not-allowed"
              }`}
            >
              Enter
            </button>
          </div>
        </div>
        <ToastContainer position="top-center" />
      </div>
    </>
  );
};

export default Income;
"use client";

import { db } from "@/firebase/firebaseConfig";
import { useAuthStore } from "@/store/authStore";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";


const Income = () => {

  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [income, setIncome] = useState(0)

  const saveIncome = async (salary: number, userId: string) => {
    try {
      const docRef = doc(db, "users", userId);
      await updateDoc(docRef, {
        totalIncome: Number(salary)
      })
      // console.log("income updated sucessfull");  for checking
      router.push("/expenseTracker")
    } catch (e) {
      console.log("update income error is", e);
      toast.error("Sorry! Can't update income! Please Try Again")
    }
  }

  return (
    <>
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="mb-4 text-2xl">Please Enter Your Income</h1>
          <div className="mb-4 w-full max-w-md mx-auto p-8 bg-white shadow-lg rounded-lg flex justify-center flex-col">
            <label htmlFor="income" className="block text-sm font-medium text-gray-700 mb-1">Income:</label>
            <input type="number" id="income" onChange={(e) => setIncome(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2
        focus:ring-blue-500 transition duration-300" required />
            <button onClick={() => {
              if (user?.uid) { saveIncome(income, user.uid) }
              else {
                toast.error("User not found!");
              }
            }}
              className="bg-blue-600 text-white px-4 py-3 mt-5 rounded-md hover:bg-blue-700
        transition duration-300">Enter</button>
          </div>
        </div>
        <ToastContainer position="top-center" />
      </div>
    </>
  )
}

export default Income
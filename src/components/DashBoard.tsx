"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, deleteDoc, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';
import { TransactionType } from "@/types/transactionType";
import Navbar from './Navbar';
import  useExpenseStore from '@/store/expensesStore';
import { useAuthStore } from '@/store/authStore';
import { GiWallet } from "react-icons/gi";
import { RiDeleteBin6Fill } from "react-icons/ri";



export default function Dashboard() {

  const user = useAuthStore((store) => store.user);
  const userUid = user?.uid;
  const { expenses, fetchExpenses, loading } = useExpenseStore();
  const router = useRouter();

  const [totalExpenses, setTotalExpenses] = useState(0);
  const [incomeAmount, setIncomeAmount] = useState<number | null>(null);

  const hasFetchedData = useRef(false)


  // delete expense function
  const deleteExpns = async (userId:string, deleteId: string) => {
    try {
      const deleteRef = doc(db, "users", userId, "expenses", deleteId)
      await deleteDoc(deleteRef)
      fetchExpenses(userUid!)
      console.log("expense deleted sucessfully")
    } catch (e) {
      console.error("Error deleting expense:", e);
      alert("Failed to delete the expense. Please try again.");
    }
  }


  // fetch income from firebase
  const fetchTotalIncome = async (userId: string) => {
   try {
     const docRef = doc(db, "users", userId);
     const snap = await getDoc(docRef)
     if (snap.exists()) {
       const data = snap.data();
       return data.totalIncome || 0;
     } else {
       console.log("no such document");
       return null;
     }
   } catch (e) {
     console.log("Error fetching income:", e);
     return null;
   }
 }
 

 const getIncome = async () => {
  if(userUid && !hasFetchedData.current){
   const fetchedIncome = await fetchTotalIncome(userUid!);
   setIncomeAmount(fetchedIncome);
  }}


 // fetch total expenses from firebase
 const calculateTotalExpenses = async (userId: string) => {
   try {
     const expensesCollRef = collection(db, "users", userId, "expenses");
     const snap = await getDocs(expensesCollRef);
     let totalExpenses = 0;
     snap.forEach((doc) => {
       const data = doc.data();
       totalExpenses += data.amount || 0;
     })
     return totalExpenses;
   } catch (e) {
     console.log("fetch total expense error is:", e);
     return 0;
   }
 }


 const fetchTotalExpensesAmount = async () => {
   const total = await calculateTotalExpenses(userUid!);
   setTotalExpenses(total)
 }


 
 useEffect(() => {
  if (userUid) {
    fetchExpenses(userUid);
    fetchTotalExpensesAmount();
  }
}, [userUid]);

  useEffect(() => {
    if (userUid && !hasFetchedData.current) {
      getIncome();
      hasFetchedData.current = true
    }
  }, [userUid]);


  const dateFormater = () => {
    
  }

  return (
    <>
      <div className="min-h-screen bg-gray-100 items-start p-5 relative lg:flex lg:flex-row lg:justify-around lg:items-start md:flex md:flex-col md:items-center sm:flex sm:flex-col sm:items-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Total Income: {incomeAmount} PKR</h2>
          </div>

          {/* set your income function */}
          <div className="mb-2">
            <h2 className="text-xl font-semibold">Remain Income: {incomeAmount! - totalExpenses} PKR</h2>
          </div>

          {/* add expense & set income buttons */}
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Total Expenses: {totalExpenses} PKR</h2>
          </div>
          <div className="flex justify-between">
            <button
              onClick={() => { router.push("/addExpense") }}
              className="bg-blue-600 text-white px-2 py-2 rounded-md hover:bg-blue-700 transition duration-300 sm:mr-4"
            >
              Add Expense
            </button>

          </div>
        </div>


        {/* section 2 */}
        <div className='lg:w-1/2 md:w-full sm:w-full mt-6 lg:mt-0'>
          <div className="w-[100%] mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Transactions</h3>
            </div>
           
            <ul>
              {loading ? "Loading..." : expenses && expenses.length > 0 ? (
                expenses.map((expence: TransactionType) => (
                  <li key={expence.id} className="flex items-center justify-between bg-gray-100 p-4 rounded-lg mb-4 shadow-md">
                    <GiWallet />
                    <div className="flex-1 ml-4">
                      <h4 className="text-base font-medium">{expence.title}</h4>
                      <p className="text-sm text-gray-500">{expence.date}</p>
                    </div>
                    <div className={`text-lg font-semibold mr-5 ${expence.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {expence.amount < 0 ? `- ${Math.abs(expence.amount)}` : `+ ${expence.amount}`}
                    </div>
                    <RiDeleteBin6Fill className='cursor-pointer' onClick={() => deleteExpns(userUid!, expence.id)} height={30} width={30} />
                  </li>
                ))
              ) : (
                <p>No expenses found.</p>
              )}
            </ul>

          </div>
        </div>
      </div>

      <Navbar />

    </>
  );
};



 {/* <ul>
              {expenses.map((expense: TransactionType) => (
                <li key={expense.id} className="flex items-center justify-between bg-gray-100 p-4 rounded-lg mb-4 shadow-md">
                 <GiWallet />
                  <div className="flex-1 ml-4">
                    <h4 className="text-base font-medium">{expense.title}</h4>
                    <p className="text-sm text-gray-500">{expense.date}</p>
                  </div>
                  <div className={`text-lg font-semibold ${expense.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {expense.amount < 0 ? `- ${Math.abs(expense.amount)}` : `+ ${expense.amount}`}
                  </div>
                </li>
              ))}
            </ul> */}

































































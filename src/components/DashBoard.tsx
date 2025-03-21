"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
import { auth, db } from '@/firebase/firebaseConfig';
import { TransactionType } from "@/types/transactionType";
import Navbar from './Navbar';
import useExpenseStore from '@/store/expensesStore';
import { useAuthStore } from '@/store/authStore';
import { GiWallet } from "react-icons/gi";
import { signOut } from 'firebase/auth';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Loader2, MoreVertical } from 'lucide-react';
import { MdDelete, MdEdit } from 'react-icons/md';


export default function Dashboard() {

  const user = useAuthStore((store) => store.user);
  const { expenses, fetchExpenses, loading } = useExpenseStore();
  const router = useRouter();
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [incomeAmount, setIncomeAmount] = useState<number | null>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const userUid = user?.uid;


  // delete expense function
  const deleteExpns = async (userId: string, deleteId: string) => {
    try {
      const deleteRef = doc(db, "users", userId, "expenses", deleteId);
      await deleteDoc(deleteRef);
    } catch (e) {
      toast.error("Failed to delete the expense. Please try again.")
      void e;
      // console.error("Error deleting expense:", e); for dev
    }
  }

  useEffect(() => {
    const unsubscribe = fetchExpenses(userUid!); // Fetch with real-time updates
    return () => unsubscribe(); // Properly cleanup listener
  }, [user?.uid]);

  useEffect(() => {
    if (!userUid) return;

    // Reference to user's income document
    const incomeRef = doc(db, "users", userUid);

    // Real-time listener
    const unsubscribe = onSnapshot(incomeRef, (docSnap) => {
      if (docSnap.exists()) {
        setIncomeAmount(docSnap.data().totalIncome); // Update state with new income
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [userUid]); // Re-run if userUid changes


  useEffect(() => {
    if (!userUid) return;

    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

    const expensesCollRef = collection(db, "users", userUid, "expenses");
    const q = query(
      expensesCollRef,
      where("date", ">=", startOfMonth.toISOString()),
      where("date", "<=", endOfMonth.toISOString())
    );

    // **Real-time listener**
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let total = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        total += data.amount || 0;
      });

      setTotalExpenses(total);
    });

    return () => unsubscribe(); // Cleanup listener
  }, [userUid, expenses]);



  const handleSignout = async () => {
    setLogoutLoading(true);
    try {
      await signOut(auth);
      // console.log("Logout Sucessfully"); for dev
      router.push("/")
    } catch (e) {
      void e;
      // console.error("Logout error is", e); for dev
    } finally {
      setLogoutLoading(false);
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  };


  return (
    <>
      <ToastContainer position='top-center' />
      <div className="min-h-screen bg-gray-100 items-start p-5 relative lg:flex lg:flex-row lg:justify-around lg:items-start md:flex md:flex-col md:items-center sm:flex sm:flex-col sm:items-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
          <div className="mb-4 flex justify-between">
            <h2 className="text-xl font-semibold">Total Income: {incomeAmount} PKR</h2>

            <div className="dropdown dropdown-bottom dropdown-end transition-all">
              <div tabIndex={0} role="button" className="m-1"><MoreVertical size={20} /></div>
              <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-40 p-2 shadow-lg dark:bg-zinc-900">
                <li aria-label='Previous Month Expenses' onClick={() => { router.push("/history") }}><a>Previous Expenses</a></li>
                <li aria-label='Additional Settings' onClick={() => { router.push("/settings") }}><a>Additional Settings</a></li>
              </ul>
            </div>
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
            <button onClick={() => { router.push("/addExpense") }} className="bg-blue-600 text-white px-2 py-2 rounded-md hover:bg-blue-700 transition duration-300 sm:mr-4">
              Add Expense
            </button>
            <button onClick={handleSignout} disabled={logoutLoading} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 sm:mr-4">
              Logout
              {/* {logoutLoading ? <span className="flex justify-center items-center"><Loader2 className="size-6 animate-spin" /></span> : "Logout"} */}
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
              {loading ? <div className="flex justify-center items-center"><Loader2 className='animate-spin size-16' /></div> : expenses && expenses.length > 0 ? (
                expenses.map((expense: TransactionType) => (
                  <li key={expense.id} className="flex items-center justify-between bg-gray-100 p-4 rounded-lg mb-4 shadow-md">
                    <GiWallet />
                    <div className="flex-1 ml-4">
                      <h4 className="text-base font-medium">{expense.title}</h4>
                      <p className="text-sm text-gray-500">{formatDate(expense.date)}</p>
                    </div>
                    <div className={`text-lg font-semibold mr-5 ${expense.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {expense.amount < 0 ? `- ${Math.abs(expense.amount)}` : `+ ${expense.amount}`}
                    </div>
                    {/* <RiDeleteBin6Fill className='cursor-pointer' onClick={() => deleteExpns(userUid!, expence.id!)} height={30} width={30} /> */}
                    <div className="dropdown dropdown-bottom dropdown-end transition-all">
                      <div tabIndex={0} role="button" className="m-1"><MoreVertical size={20} /></div>
                      <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-32 p-2 shadow-sm dark:bg-zinc-900">
                        <li aria-label='Edit Expense' onClick={() => { router.push(`/addExpense?expenseId=${expense.id}`) }}><a><MdEdit size={18} /> Edit</a></li>
                        <li aria-label='Delete Expense' onClick={() => { deleteExpns(userUid!, expense.id!) }}><a><MdDelete size={18} /> Delete</a></li>
                      </ul>
                    </div>
                  </li>
                ))
              ) : (
                <p>You have not any Expense of this Month</p>
              )}
            </ul>
          </div>
        </div>
      </div>
      <Navbar />
    </>
  );
};
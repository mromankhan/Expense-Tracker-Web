"use client";
import React, { useState } from 'react';
import { db } from '@/firebase/firebaseConfig';
import { collection, addDoc } from "firebase/firestore"
import { useAuthStore } from '@/store/authStore'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AddExpense() {

  const user = useAuthStore((store) => store.user)
  // console.log("current user is:", user);  for checking

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false)

  // Add Expences in firestore
  const userId = user?.uid;
  // console.log(userId);  for checking

  const addExpns = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const newExpence = { title, amount, category, note, date };
    if (!title || !amount) {
      toast.error("Please fill all Fields!");
      return;
    } else {
      try {
        const docRef = collection(db, "users", userId!, "expenses");
        await addDoc(docRef, newExpence)
        // console.log(`Expence added ${newExpence}`);  for checking
        toast.success("Expense added successfully!");
        setTitle("");
        setAmount(0);
        setCategory("Food");
        setNote("");
      } catch (e) {
        console.log("add expense error is:", e);
      }
    }
    setLoading(false);
  }


  return (
    <>
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-5 mb-20">
        <form onSubmit={addExpns} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Add Expense</h2>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title:</label>
            <input
              type="text"
              id="title"
              placeholder='xyz'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount:</label>
            <input
              type="number"
              id="amount"
              placeholder='123'
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category:</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Bills">Bills</option>
              <option value="Education">Education</option>
              <option value="Investments">Investments</option>
              <option value="Luxuries">Luxuries</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date:</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">Note (Optional):</label>
            <textarea
              id="note"
              value={note}
              placeholder='xyz'
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300" onClick={addExpns} disabled={loading}>{loading ? "Loading..." : "Add Expense"}</button>
          <ToastContainer position='top-center' />
        </form>
      </div>
      {/* <Navbar /> */}
    </>
  );
};





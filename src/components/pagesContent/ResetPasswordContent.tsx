"use client";
import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/firebase/firebaseConfig';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

const ResetPasswordContent = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      setEmail("");
      toast.success("Password Reset Link Sent Successfully! Please Check Your Email.");
      setTimeout(() => {
        router.push("/login");
      }, 5000);
    } catch {
      toast.error("Sorry! Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 transition duration-500">
      <div className="w-full max-w-sm p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Reset Password</h2>
        <form onSubmit={handlePasswordReset}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value) }}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white mb-3 px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
          >
            Send Reset Link
          </button>
          <button
            type="button"
            className="w-full bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition duration-300"
            onClick={() => { router.push("/login") }}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordContent;

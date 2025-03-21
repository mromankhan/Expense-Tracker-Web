"use client";
import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/firebase/firebaseConfig';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';

const ResetPasswordContent = () => {

    const router = useRouter();
    const [email, setEmail] = useState("");

    const handlePasswordReset = async () => {
        try {
            setEmail("");
            await sendPasswordResetEmail(auth, email)
            toast.success("Password Reset Link Sent Successfully! Please Check Your Email.");
            setTimeout(() => {
                router.push("/login");
            }, 5000);
        } catch (e) {
            toast.error("Sorry! Something went Wrong Please Try Again Later!");
            void e;
            // console.log(e) for checking
        }
    }

    return (
        <>
            <ToastContainer position='top-center' />
            <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 transition duration-500">
                <div className="w-full max-w-sm p-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">Reset Password</h2>
                    <form>
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email:
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value) }}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-300 transition duration-300"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white mb-3 px-4 py-2 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition duration-300"
                            onClick={handlePasswordReset}
                        >
                            Send Reset Link
                        </button>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition duration-300"
                            onClick={() => { router.push("/login") }}
                        >
                            Cancel
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}

export default ResetPasswordContent
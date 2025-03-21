"use client";
import Navbar from '@/components/Navbar'
import { AlertCircle, Loader2 } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { auth } from '@/firebase/firebaseConfig'
import { useState } from 'react';

import React from 'react'

const SettingsContent = () => {

    const [loading, setLoading] = useState(false)

    const router = useRouter();
    const handleSignout = async () => {
        setLoading(true);
        try {
            await signOut(auth);
            // console.log("Logout Sucessfully"); // for dev
            router.push("/")
        } catch (e) {
            void e;
            // console.error("Logout error is", e); // for dev
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className='flex justify-center items-center h-screen'>
                <div className="flex justify-center items-center flex-col bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
                    <h1 className="text-2xl font-semibold text-gray-800">Settings</h1>
                    <p className="text-gray-600">Update your account settings here.</p>
                    <button onClick={() => { router.push("/setIncome") }} className="my-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 sm:mr-4">
                        Reset Income
                    </button>
                    <button onClick={() => { router.push("/resetPassword") }} className="mb-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 sm:mr-4">
                        Reset Password
                    </button>
                    <button onClick={handleSignout} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 sm:mr-4">
                        {loading ? <span className="flex justify-center items-center"><Loader2 className="size-6 animate-spin" /></span> : <span><AlertCircle className='inline pr-1' size={25} /> Logout</span>}
                    </button>
                </div>
            </div>
            <Navbar />
        </>
    )
}

export default SettingsContent
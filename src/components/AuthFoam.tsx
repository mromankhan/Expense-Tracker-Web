"use client";
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';


type PropsTypes = {
  signup?: boolean,
  loading: boolean,
  func: (email: string, password: string) => void;
}

const AuthFoam = ({ signup, func, loading }: PropsTypes) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    func(email, password);
    // console.log('Email:', email); // for dev
    // console.log('Password:', password); // for dev
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100 p-5">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">{signup ? "Welcome" : "Login"}</h2>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder='xyz@gmail.com'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password:</label>
          <input
            type="password"
            id="password"
            placeholder='Password123'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <Link href="/resetPassword" className='text-[#2563eb] hover:text-[#2a68ee] dark:text-[#3b82f6] dark:hover:text-[#60a5fa]'><p className='mt-2'>{!signup ? "Forget Password" : ""}</p></Link>
        </div>
        <button type="submit" disabled={loading} className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300">{loading ? <div className="flex justify-center items-center"><Loader2 className="animate-spin size-6" /></div> : signup ? "Create Account" : "Login"}</button>
        <div className="flex justify-center items-center mt-5">
          <p className="text-gray-700 dark:text-gray-300">{signup ? "Already have an Account?" : "Don't have an Account?"} <Link href={signup ? "/login" : "/signup"} className='text-[#2563eb] hover:text-[#2a68ee] dark:text-[#3b82f6] dark:hover:text-[#60a5fa]'>{signup ? "Login" : "Create Account"}</Link></p>
        </div>
      </form>
    </div>
  );
};

export default AuthFoam;

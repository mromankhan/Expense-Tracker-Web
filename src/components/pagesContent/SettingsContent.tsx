"use client";
import Navbar from '@/components/Navbar';
import { AlertCircle, Loader2 } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/firebase/firebaseConfig';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { CURRENCY_OPTIONS } from '@/utils/currency';

const SettingsContent = () => {
  const [loading, setLoading] = useState(false);
  const [currencyLoading, setCurrencyLoading] = useState(false);
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const currency = useAuthStore((state) => state.currency);
  const setCurrency = useAuthStore((state) => state.setCurrency);

  const handleSignout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      router.push("/");
    } catch {
      toast.error("Logout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCurrencyChange = async (newCurrency: string) => {
    if (!user?.uid || newCurrency === currency) return;

    setCurrencyLoading(true);
    try {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, { currency: newCurrency });
      setCurrency(newCurrency);
      toast.success(`Currency updated to ${newCurrency}`);
    } catch {
      toast.error("Failed to update currency. Please try again.");
    } finally {
      setCurrencyLoading(false);
    }
  };

  return (
    <>
      <div className='flex justify-center items-center h-screen'>
        <div className="flex justify-center items-center flex-col bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
          <h1 className="text-2xl font-semibold text-gray-800">Settings</h1>
          <p className="text-gray-600 mb-4">Update your account settings here.</p>

          {/* Currency Selector */}
          <div className="w-full mb-4">
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
              Currency:
            </label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              disabled={currencyLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CURRENCY_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button onClick={() => { router.push("/setIncome") }} className="my-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 w-full">
            Reset Income
          </button>
          <button onClick={() => { router.push("/resetPassword") }} className="mb-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 w-full">
            Reset Password
          </button>
          <button onClick={handleSignout} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 w-full">
            {loading ? <span className="flex justify-center items-center"><Loader2 className="size-6 animate-spin" /></span> : <span><AlertCircle className='inline pr-1' size={25} /> Logout</span>}
          </button>
        </div>
      </div>
      <Navbar />
    </>
  );
}

export default SettingsContent;

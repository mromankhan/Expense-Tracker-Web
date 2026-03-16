"use client";
import Navbar from '@/components/Navbar';
import { AlertCircle, KeyRound, Loader2, LogOut, Wallet } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/firebase/firebaseConfig';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { CURRENCY_OPTIONS } from '@/utils/currency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

  const handleCurrencyChange = async (newCurrency: string | null) => {
    if (!newCurrency || !user?.uid || newCurrency === currency) return;

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
      <div className="min-h-screen bg-gray-50 pb-28">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-5 pt-8 pb-6">
          <div className="max-w-lg mx-auto">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your account preferences</p>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-5 mt-6 space-y-4">
          {/* Preferences Card */}
          <Card className="border border-gray-100 shadow-sm rounded-2xl">
            <CardHeader className="pb-2 pt-5 px-6">
              <CardTitle className="text-base font-semibold text-gray-900">Preferences</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="currency" className="text-sm font-medium text-gray-700">
                  Currency
                </Label>
                <Select
                  value={currency}
                  onValueChange={handleCurrencyChange}
                  disabled={currencyLoading}
                >
                  <SelectTrigger id="currency" className="h-11 border-gray-200 rounded-lg focus:ring-purple-400">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.code} value={opt.code}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Account Card */}
          <Card className="border border-gray-100 shadow-sm rounded-2xl">
            <CardHeader className="pb-2 pt-5 px-6">
              <CardTitle className="text-base font-semibold text-gray-900">Account</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-5 space-y-3">
              <Button
                onClick={() => router.push("/setIncome")}
                variant="outline"
                className="w-full h-11 rounded-xl border-gray-200 text-gray-700 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 justify-start gap-3 font-medium transition-all duration-200"
              >
                <Wallet size={18} className="text-purple-500" />
                Reset Income
              </Button>

              <Separator className="bg-gray-100" />

              <Button
                onClick={() => router.push("/resetPassword")}
                variant="outline"
                className="w-full h-11 rounded-xl border-gray-200 text-gray-700 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 justify-start gap-3 font-medium transition-all duration-200"
              >
                <KeyRound size={18} className="text-purple-500" />
                Reset Password
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border border-red-100 shadow-sm rounded-2xl">
            <CardHeader className="pb-2 pt-5 px-6">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <AlertCircle size={17} className="text-red-500" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-5">
              <Button
                onClick={handleSignout}
                disabled={loading}
                className="w-full h-11 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all duration-200"
              >
                {loading
                  ? <Loader2 className="size-5 animate-spin mx-auto" />
                  : <span className="flex items-center gap-2"><LogOut size={17} /> Logout</span>
                }
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <Navbar />
    </>
  );
}

export default SettingsContent;

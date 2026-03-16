"use client";
import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/firebase/firebaseConfig';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';

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
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-5">
      <Card className="w-full max-w-sm shadow-lg border border-gray-100 rounded-2xl">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound size={22} className="text-purple-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Reset Password</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Enter your email and we&apos;ll send a reset link
          </p>
        </CardHeader>
        <CardContent className="px-8 pb-8 pt-4">
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="xyz@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 border-gray-200 focus:border-purple-400 focus:ring-purple-400 rounded-lg"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200"
            >
              Send Reset Link
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 rounded-lg font-medium border-gray-200 text-gray-600 hover:bg-gray-50"
              onClick={() => router.push("/login")}
            >
              Back to Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default ResetPasswordContent;

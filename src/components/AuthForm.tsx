"use client";
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type PropsTypes = {
  signup?: boolean,
  loading: boolean,
  func: (email: string, password: string) => void;
}

const AuthForm = ({ signup, func, loading }: PropsTypes) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    func(email, password);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-5">
      <Card className="w-full max-w-md shadow-lg border border-gray-100 rounded-2xl">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-purple-600 text-xl font-bold">E</span>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {signup ? "Create Account" : "Welcome Back"}
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            {signup ? "Sign up to start tracking expenses" : "Sign in to your account"}
          </p>
        </CardHeader>
        <CardContent className="px-8 pb-8 pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="xyz@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 border-gray-200 focus:border-purple-400 focus:ring-purple-400 rounded-lg"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
              <Input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 border-gray-200 focus:border-purple-400 focus:ring-purple-400 rounded-lg"
                required
              />
              {!signup && (
                <Link href="/resetPassword" className="text-sm text-purple-600 hover:text-purple-700 block mt-1">
                  Forgot Password?
                </Link>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200 mt-2"
            >
              {loading
                ? <Loader2 className="animate-spin size-5 mx-auto" />
                : signup ? "Create Account" : "Sign In"
              }
            </Button>

            <p className="text-center text-sm text-gray-500 pt-2">
              {signup ? "Already have an account? " : "Don't have an account? "}
              <Link
                href={signup ? "/login" : "/signup"}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                {signup ? "Sign In" : "Create Account"}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthForm;

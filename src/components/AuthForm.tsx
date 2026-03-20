"use client";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type PropsTypes = {
  signup?: boolean;
  loading: boolean;
  func: (email: string, password: string) => void;
};

const AuthForm = ({ signup, func, loading }: PropsTypes) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    func(email, password);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-primary/8 via-background to-background p-5">
      <Card className="w-full max-w-md border-0 shadow-xl shadow-purple-100/60 rounded-3xl">
        <CardHeader className="text-center pb-0 pt-8 px-8">
          <div className="size-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/30">
            <span className="text-primary-foreground text-2xl font-black">E</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {signup ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            {signup ? "Start your financial journey today" : "Sign in to your account"}
          </p>
        </CardHeader>

        <CardContent className="px-8 pb-8 pt-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                {!signup && (
                  <Link href="/resetPassword" className="text-xs text-primary hover:underline">
                    Forgot Password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              size="lg"
              className="w-full rounded-xl mt-1 font-semibold shadow-md shadow-primary/20"
            >
              {loading ? (
                <Loader2 className="animate-spin size-5" />
              ) : signup ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {signup ? "Already have an account? " : "Don't have an account? "}
              <Link
                href={signup ? "/login" : "/signup"}
                className="text-primary font-semibold hover:underline"
              >
                {signup ? "Sign In" : "Sign Up"}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthForm;

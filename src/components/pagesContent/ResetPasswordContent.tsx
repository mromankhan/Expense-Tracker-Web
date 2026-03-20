"use client";
import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { KeyRound, ArrowLeft, Mail } from "lucide-react";

const ResetPasswordContent = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
      toast.success("Reset link sent! Please check your email.");
      setTimeout(() => router.push("/login"), 5000);
    } catch {
      toast.error("Sorry! Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-primary/8 via-background to-background p-5">
      <Card className="w-full max-w-sm border-0 shadow-xl shadow-purple-100/60 rounded-3xl">
        <CardHeader className="text-center pb-0 pt-8 px-8">
          <div className="size-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/30">
            <KeyRound size={24} className="text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            {sent
              ? "Check your inbox for the reset link"
              : "We'll send a reset link to your email"}
          </p>
        </CardHeader>

        <CardContent className="px-8 pb-8 pt-6">
          {sent ? (
            <div className="flex flex-col gap-4 text-center">
              <div className="size-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
                <Mail size={24} className="text-green-600" />
              </div>
              <p className="text-sm text-muted-foreground">
                A reset link was sent to{" "}
                <span className="font-semibold text-foreground">{email}</span>.
                Redirecting to login…
              </p>
            </div>
          ) : (
            <form onSubmit={handlePasswordReset} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  type="email"
                  id="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 rounded-xl"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full rounded-xl font-semibold shadow-md shadow-primary/20"
              >
                Send Reset Link
              </Button>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={14} />
                Back to Login
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordContent;

"use client";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
import { toast } from 'react-toastify';
import { useState } from "react";

const LoginContent = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/expenseTracker");
    } catch {
      toast.error("Invalid Email or Password");
    } finally {
      setLoading(false);
    }
  };

  return <AuthForm func={login} loading={loading} />;
}

export default LoginContent;

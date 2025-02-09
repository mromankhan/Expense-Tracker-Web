"use client";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";
import { useRouter } from 'next/navigation';
import AuthFoam from '@/components/AuthFoam';


export default function Login() {
  const router = useRouter();

  const login = async (email: string, password: string) => {
    try {
      let userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userData = userCredential.user;
      router.push("/expenseTracker");
      console.log("user login sucessfull", userData);
    } catch (e) {
      console.log("login func error is:", e);
    }
  }

  return (
    <>
      <AuthFoam func={login} />
    </>
  );
};








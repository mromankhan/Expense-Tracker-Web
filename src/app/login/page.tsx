"use client";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";
import { useRouter } from 'next/navigation';
import AuthFoam from '@/components/AuthFoam';


export default function Login() {
  const router = useRouter();

  const login = async (email: string, password: string) => {
    try {
      // const userCredential = await signInWithEmailAndPassword(auth, email, password);  for checking
      await signInWithEmailAndPassword(auth, email, password);
      // const userData = userCredential.user; for checking
      router.push("/expenseTracker");
      // console.log("user login sucessfull", userData); for checking
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








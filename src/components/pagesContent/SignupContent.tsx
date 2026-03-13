"use client";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/firebase/firebaseConfig";
import { useRouter } from 'next/navigation';
import { doc, setDoc } from "firebase/firestore";
import AuthForm from "@/components/AuthForm";
import { useState } from "react";
import { toast } from 'react-toastify';

const SignupContent = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function saveUserInFirestore(email: string, uid: string) {
    try {
      if (!db) throw new Error("Firestore DB not initialized");

      const user = { email, uid, currency: "PKR" };
      const docRef = doc(db, "users", uid);
      await setDoc(docRef, user, { merge: true });
    } catch {
      // Silently handle Firestore save error
    }
  }

  const signup = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userData = userCredential.user;
      await saveUserInFirestore(email, userData.uid);
      router.push("/setIncome");
    } catch {
      toast.error("Invalid Credentials");
    } finally {
      setLoading(false);
    }
  };

  return <AuthForm signup={true} func={signup} loading={loading} />;
}

export default SignupContent;

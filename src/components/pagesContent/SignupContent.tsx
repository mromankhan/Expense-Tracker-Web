"use client";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/firebase/firebaseConfig";
import { useRouter } from 'next/navigation';
import { doc, setDoc } from "firebase/firestore";
import AuthFoam from "@/components/AuthFoam";
import { useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import React from 'react'

const SignupContent = () => {

  const [loading, setLoading] = useState(false)
  const router = useRouter();

  // save user in firestore function
  async function saveUserInFirestore(email: string, uid: string) {
    try {
      if (!db) throw new Error("Firestore DB not initialized");

      const user = { email, uid };
      const docRef = doc(db, "users", uid);
      await setDoc(docRef, user, { merge: true });

      // console.log("User successfully saved in Firestore"); // for dev
    }
    catch (e) {
      void e;
      // console.error("Error saving user to Firestore:", e); // for dev
    }
  }

  // signup function
  const signup = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userData = userCredential.user;
      await saveUserInFirestore(email, userData.uid);
      // console.log("user created sucessfull", userData); //for dev
      router.push("/setIncome");
    } catch (e) {
      void e;
      // console.log("signup error is:", e); //for dev
      toast.error("Invalid Credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <ToastContainer position='top-center' />
      <AuthFoam signup={true} func={signup} loading={loading} />
    </>
  );
}

export default SignupContent
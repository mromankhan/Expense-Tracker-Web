"use client";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/firebase/firebaseConfig";
import { useRouter } from 'next/navigation';
import { doc, setDoc } from "firebase/firestore";
import AuthFoam from "@/components/AuthFoam";


export default function Signup() {
  const router = useRouter();

  // save user in firestore function
  const saveUserInFirestore = async (email: string, uid: string) => {
    const user = { email, uid };
    const docRef = doc(db, "users", uid);
    await setDoc(docRef, user);
    router.push("/setIncome");
  }

  const signup = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userData = userCredential.user;
      saveUserInFirestore(email, userData.uid);
      // console.log("user created sucessfull", userData); for checking
    } catch (e) {
      console.log("signup error is:", e);
    }
  }


  return (
    <>
      <AuthFoam signup={true} func={signup} />
    </>
  );
};


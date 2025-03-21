"use client";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";
import { useRouter } from 'next/navigation';
import AuthFoam from '@/components/AuthFoam';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState } from "react";

const LoginContent = () => {

    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            // const userCredential = await signInWithEmailAndPassword(auth, email, password);  for dev
            await signInWithEmailAndPassword(auth, email, password);
            // const userData = userCredential.user; for dev
            router.push("/expenseTracker");
            // console.log("user login sucessfull", userData); for dev
        } catch (e) {
            toast.error("Invalid Email or Password")
            void e;
            // console.log("login func error is:", e); for dev
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <ToastContainer position='top-center' />
            <AuthFoam func={login} loading={loading} />
        </>
    );
}

export default LoginContent
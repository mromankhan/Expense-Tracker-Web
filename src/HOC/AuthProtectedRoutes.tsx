"use client";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type AuthProtectedRoutesType = {
    children: React.ReactNode;
}

const AuthProtectedRoutes = ({ children }: AuthProtectedRoutesType) => {
    const { user, loading } = useAuthStore((state) => state);
    const router = useRouter();
    const [checkingAuth, setCheckingAuth] = useState(true); // Local loading state

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/");
            }
            setCheckingAuth(false);
        }
    }, [user, loading, router]);

    if (checkingAuth) return <div className="h-screen flex justify-center items-center"><Loader2 className="size-16 animate-spin" /></div>;

    return <>{children}</>;
}

export default AuthProtectedRoutes;

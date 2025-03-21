import AuthProtectedRoutes from "@/HOC/AuthProtectedRoutes";
import { ReactNode } from "react";

type StatsLayoutType = {
    children: ReactNode;
}
export default function Stats({ children }: StatsLayoutType){
    return (
        <AuthProtectedRoutes>
            {children}
        </AuthProtectedRoutes>
    )
}
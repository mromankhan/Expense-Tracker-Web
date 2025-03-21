import AuthProtectedRoutes from "@/HOC/AuthProtectedRoutes";
import { ReactNode } from "react";

type HistoryLayoutType = {
    children: ReactNode;
}

export default function History({children}: HistoryLayoutType){
    return (
        <AuthProtectedRoutes>
            {children}
        </AuthProtectedRoutes>
    )
}
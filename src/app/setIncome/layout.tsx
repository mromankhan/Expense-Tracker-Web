import AuthProtectedRoutes from "@/HOC/AuthProtectedRoutes";
import { ReactNode } from "react";

type SetIncomeLayoutType = {
    children: ReactNode;
}

export default function setIncome({ children }: SetIncomeLayoutType) {
    return (
        <AuthProtectedRoutes>
            {children}
        </AuthProtectedRoutes>
    )
}
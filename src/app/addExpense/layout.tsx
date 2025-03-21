import AuthProtectedRoutes from "@/HOC/AuthProtectedRoutes";
import { ReactNode } from "react"

type AddExpenceType = {
    children: ReactNode;
}

export default function addExpence({ children }: AddExpenceType) {
    return (
        <AuthProtectedRoutes>
            {children}
        </AuthProtectedRoutes>
    )
}
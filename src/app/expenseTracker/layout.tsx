import AuthProtectedRoutes from "@/HOC/AuthProtectedRoutes";
import { ReactNode } from "react"

type ExpenseTrackerLayoutType = {
    children: ReactNode;
}

export default function ExpenceTracker({ children }: ExpenseTrackerLayoutType){
    return (
        <AuthProtectedRoutes>
            {children}
        </AuthProtectedRoutes>
    )
}
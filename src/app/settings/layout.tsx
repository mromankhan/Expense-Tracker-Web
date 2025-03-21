import AuthProtectedRoutes from "@/HOC/AuthProtectedRoutes";
import { ReactNode } from "react";

type SettingsLayoutType ={
    children: ReactNode;
}

export default function Settings({ children }: SettingsLayoutType){
    return (
        <AuthProtectedRoutes>
            {children}
        </AuthProtectedRoutes>
    )
}
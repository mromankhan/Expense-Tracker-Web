"use client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ChatAgent from "@/components/ChatAgent";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useTheme } from "next-themes";

function DynamicToast() {
  const { resolvedTheme } = useTheme();
  return (
    <ToastContainer
      position="top-center"
      theme={resolvedTheme === "dark" ? "dark" : "light"}
    />
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <ChatAgent />
      <DynamicToast />
    </ThemeProvider>
  );
}

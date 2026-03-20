"use client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ChatAgent from "@/components/ChatAgent";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ChatAgent />
      <ToastContainer position="top-center" />
    </>
  );
}

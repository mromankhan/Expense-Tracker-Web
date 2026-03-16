"use client";
import Link from "next/link";
import { FaHome, FaChartBar, FaPlus } from "react-icons/fa";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex justify-around items-center py-3 md:py-4 z-50">
      <Link
        href="/expenseTracker"
        className={`flex flex-col items-center gap-1 px-6 py-1 rounded-xl transition-all duration-200 ${
          pathname === "/expenseTracker"
            ? "text-purple-600"
            : "text-gray-400 hover:text-purple-500"
        }`}
      >
        <FaHome size={22} />
        <span className="text-xs font-medium">Home</span>
      </Link>

      <Link
        href="/addExpense"
        className="bg-purple-600 hover:bg-purple-700 p-4 rounded-full shadow-lg shadow-purple-300 -mt-8 transform transition-all duration-200 hover:scale-110 flex items-center justify-center"
      >
        <FaPlus size={22} color="white" />
      </Link>

      <Link
        href="/stats"
        className={`flex flex-col items-center gap-1 px-6 py-1 rounded-xl transition-all duration-200 ${
          pathname === "/stats"
            ? "text-purple-600"
            : "text-gray-400 hover:text-purple-500"
        }`}
      >
        <FaChartBar size={22} />
        <span className="text-xs font-medium">Stats</span>
      </Link>
    </nav>
  );
}

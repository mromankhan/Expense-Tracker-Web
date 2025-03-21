"use client";
import Link from "next/link";
import { FaHome, FaChartBar, FaPlus } from "react-icons/fa";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 w-full bg-white shadow-lg flex justify-around items-center py-4 md:py-6">
      <Link
        href="/expenseTracker"
        className={`flex flex-col items-center ${
          pathname === "/expenseTracker" ? "text-purple-600" : "text-gray-600"
        } hover:text-purple-600`}
      >
        <FaHome size={24} />
        <span className="text-xs md:text-sm">Home</span>
      </Link>

      <Link href="/addExpense">
        <button className="bg-purple-500 p-4 rounded-full shadow-2xl -mt-10 md:-mt-12 transform transition-all hover:scale-110">
          <FaPlus size={24} color="white" />
        </button>
      </Link>

      <Link
        href="/stats"
        className={`flex flex-col items-center ${
          pathname === "/stats" ? "text-purple-600" : "text-gray-600"
        } hover:text-purple-600`}
      >
        <FaChartBar size={24} />
        <span className="text-xs md:text-sm">Stats</span>
      </Link>
    </nav>
  );
}
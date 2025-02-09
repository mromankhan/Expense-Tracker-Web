"use client";
import Link from "next/link";
import { FaHome, FaChartBar, FaFileAlt, FaUserCircle, FaPlus } from "react-icons/fa";

export default function Navbar() {
  return (
    <nav className="fixed bottom-0 w-full bg-white shadow-lg flex justify-around items-center py-4 md:py-6">
      {/* Home Icon */}
      <Link href={"/expenseTracker"} className="flex flex-col items-center text-gray-600 hover:text-purple-600">
        <FaHome size={24} />
        <span className="text-xs md:text-sm">Home</span>
      </Link>
      
      {/* Add Button (Center) */}
      <Link href={"/addExpense"}>
      <button className="bg-purple-500 p-4 rounded-full shadow-2xl -mt-10 md:-mt-12 transform transition-all hover:scale-110">
        <FaPlus size={24} color="white" />
      </button>
      </Link>

      {/* Stats Icon */}
      <Link href={"/stats"} className="flex flex-col items-center text-gray-600 hover:text-purple-600">
        <FaChartBar size={24} />
        <span className="text-xs md:text-sm">Stats</span>
      </Link>


      {/* Files Icon */}
      {/* <Link href="#" className="flex flex-col items-center text-gray-600 hover:text-purple-600">
        <FaFileAlt size={24} />
        <span className="text-xs md:text-sm">Files</span>
      </Link> */}

      {/* Profile Icon */}
      {/* <Link href="#" className="flex flex-col items-center text-gray-600 hover:text-purple-600">
        <FaUserCircle size={24} />
        <span className="text-xs md:text-sm">Profile</span>
      </Link> */}
    </nav>
  );
};

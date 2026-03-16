"use client";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function Home() {
  const router = useRouter();
  const getStart = () => {
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <main className="text-center px-6 py-12 flex flex-col items-center">
        <div className="relative w-72 h-44 mx-auto mb-8">
          <Image
            src="/welcome-img.webp"
            alt="Welcome"
            height={700}
            width={700}
            className="rounded-2xl shadow-lg object-cover"
            priority
          />
        </div>

        <div className="mb-2 inline-flex items-center gap-2 bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full">
          Smart Expense Tracking
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mt-3 mb-3 tracking-tight">
          Expense Tracker
        </h1>

        <p className="text-lg text-gray-500 mb-8 max-w-xs">
          Take control of your finances. Track every expense with ease.
        </p>

        <Button
          onClick={getStart}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-base rounded-xl shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105"
        >
          Get Started
        </Button>
      </main>
    </div>
  );
}

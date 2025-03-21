"use client";
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Home() {

  const router = useRouter();
  const getStart = () => {
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <main className="text-center p-6">
        <div className="relative w-72 h-44 mx-auto">
          {/* Replace with your own image path */}
          <Image
            src="/welcome-img.webp"
            alt="Welcome"
            // layout="fill"
            height={700}
            width={700}
            // objectFit="contain"
            className='rounded-xl'
            priority
          />
        </div>

        <h1 className="text-4xl font-bold text-gray-800 my-2">
          Welcome
        </h1>

        <p className="text-xl text-gray-600 mb-4">
          Track your expenses with ease
        </p>

        <button onClick={getStart} className="bg-blue-600 text-white px-3 py-3 rounded-md hover:bg-blue-700 transition duration-300 sm:mr-4">
        Start Now
        </button>
      </main>
    </div>
  );
}
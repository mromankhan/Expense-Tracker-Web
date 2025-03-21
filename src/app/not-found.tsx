import Link from 'next/link';

export default function Custom404() {

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center px-6 py-16 bg-white rounded-lg shadow-xl max-w-md mx-auto">
                <h1 className="text-6xl font-bold text-gray-800 mb-2">404</h1>
                <div className="w-16 h-1 bg-blue-500 mx-auto mb-6"></div>

                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
                <p className="text-gray-600 mb-8">
                    Oops! The page you are looking for doesn&apos;t exist or has been moved.
                </p>

                <Link href="/" className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-300">
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
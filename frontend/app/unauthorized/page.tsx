'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function UnauthorizedPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
      <div className="bg-red-100 text-red-700 p-4 rounded-full mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16">
          <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
        </svg>
      </div>

      <h1 className="text-3xl font-bold mb-4 text-center">Access Denied</h1>

      <p className="text-gray-600 mb-8 text-center max-w-md">
        You don&apos;t have permission to access this page. This area is restricted to authorized users only.
      </p>

      <div className="space-y-4">
        <Link
          href="/"
          className="block text-center bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
        >
          Go to Homepage
        </Link>

        {user ? (
          <Link
            href="/dashboard"
            className="block text-center text-blue-600 hover:underline"
          >
            Go to Dashboard
          </Link>
        ) : (
          <Link
            href="/login"
            className="block text-center text-blue-600 hover:underline"
          >
            Login
          </Link>
        )}
      </div>
    </div>
  );
}

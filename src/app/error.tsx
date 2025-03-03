'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold mb-6">Something went wrong</h1>
        <p className="mb-8 text-gray-400">
          We apologize for the inconvenience. An unexpected error has occurred.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

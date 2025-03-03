'use client';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-16 w-16 border-t-4 border-b-4 border-indigo-500 rounded-full animate-spin"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 border-t-4 border-b-4 border-indigo-300 rounded-full animate-spin animation-delay-150"></div>
          </div>
        </div>
        <p className="mt-4 text-xl font-medium text-white">Loading...</p>
      </div>
    </div>
  );
}

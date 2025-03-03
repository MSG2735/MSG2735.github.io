'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import GameBoard from '@/components/game/GameBoard';

export default function GamePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const username = localStorage.getItem('blackjack-username');
    if (!username) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto pt-4 pb-[7rem] px-4 flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-yellow-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg">Loading game...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="w-full max-w-6xl mx-auto pt-8 pb-[7rem] px-4">
      <GameBoard />
    </div>
  );
} 
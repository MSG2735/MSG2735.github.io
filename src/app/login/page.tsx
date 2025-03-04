'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const savedUsername = localStorage.getItem('blackjack-username');
    if (savedUsername) {
      router.push('/game');
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!username) {
      setError('Please enter a username');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    // Generate random 4-digit player ID
    const playerId = Math.floor(1000 + Math.random() * 9000);
    
    // Save username and player ID to localStorage
    localStorage.setItem('blackjack-username', username);
    localStorage.setItem('blackjack-player-id', playerId.toString());
    
    // Simulate loading for better UX
    setTimeout(() => {
      setIsLoading(false);
      router.push('/game');
    }, 1000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 min-h-[80vh] flex items-center justify-center">
      <motion.div 
        className="bg-black/30 p-8 rounded-xl backdrop-blur-sm shadow-xl w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-6 text-center">Welcome to Blackjack</h1>
        <p className="text-gray-300 mb-8 text-center">Choose a username to start playing</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="Enter your username"
            />
          </div>
          
          {error && (
            <motion.div 
              className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.div>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
              isLoading 
                ? 'bg-yellow-700 cursor-not-allowed' 
                : 'bg-yellow-600 hover:bg-yellow-500 active:bg-yellow-700'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Logging in...</span>
              </div>
            ) : (
              'Start Playing'
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
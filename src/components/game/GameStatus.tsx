'use client';

import { useGame } from '@/lib/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function GameStatus() {
  const { gameState, gameStats } = useGame();
  const { message, gamePhase, player, gameResult } = gameState;
  const { wins, losses, pushes, blackjacks, winRate, profit } = gameStats;
  const [showBalance, setShowBalance] = useState(true);
  
  // Load display balance setting from localStorage
  useEffect(() => {
    const displayBalance = localStorage.getItem('blackjack-displayBalance');
    setShowBalance(displayBalance !== 'false');
  }, []);
  
  // Get status color based on game result
  const getMessageColor = () => {
    if (!gameResult) {
      // Check if message includes "split" or is about playing a specific hand
      if (message.toLowerCase().includes('split') || 
          (message.toLowerCase().includes('playing') && message.toLowerCase().includes('hand'))) {
        return 'text-orange-500';
      }
      
      // Check for win/loss messages that don't have a gameResult set (like in split hands)
      if (message.toLowerCase().includes('(+$')) {
        return 'text-green-500';
      }
      if (message.toLowerCase().includes('(-$')) {
        return 'text-red-500';
      }
      if (message.toLowerCase().includes('push')) {
        return 'text-yellow-500';
      }
      
      return 'text-white';
    }
    
    switch (gameResult) {
      case 'win':
      case 'blackjack':
        return 'text-green-500';
      case 'lose':
        return 'text-red-500';
      case 'push':
        return 'text-yellow-500';
      default:
        return 'text-white';
    }
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto mb-2">
      <div className="flex justify-between items-center">
        {/* Game message */}
        <AnimatePresence mode="wait">
          <motion.div
            key={message}
            className={`text-2xl font-bold ${getMessageColor()}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {message}
          </motion.div>
        </AnimatePresence>
        
        {/* Player balance */}
        {showBalance && (
          <motion.div 
            className="flex gap-2 items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-yellow-500 text-black px-4 py-2 rounded-lg flex items-center gap-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-6 h-6"
              >
                <path d="M12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
                <path fillRule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 14.625v-9.75zM8.25 9.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM18.75 9a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V9.75a.75.75 0 00-.75-.75h-.008zM4.5 9.75A.75.75 0 015.25 9h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75V9.75z" clipRule="evenodd" />
                <path d="M2.25 18a.75.75 0 000 1.5c5.4 0 10.63.722 15.6 2.075 1.19.324 2.4-.558 2.4-1.82V18.75a.75.75 0 00-.75-.75H2.25z" />
              </svg>
              <span className="text-xl font-bold">${player.balance}</span>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Game stats */}
      <div className="mt-2 grid grid-cols-5 gap-3 bg-black/20 p-3 rounded-lg">
        <div className="text-center">
          <div className="text-sm text-gray-400">Wins</div>
          <div className="text-xl font-bold text-green-500">{wins}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-400">Losses</div>
          <div className="text-xl font-bold text-red-500">{losses}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-400">Blackjacks</div>
          <div className="text-xl font-bold text-yellow-500">{blackjacks}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-400">Win Rate</div>
          <div className="text-xl font-bold">{winRate.toFixed(1)}%</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-400">Profit</div>
          <div className={`text-xl font-bold ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {profit >= 0 ? '+$' + profit : '-$' + Math.abs(profit)}
          </div>
        </div>
      </div>
    </div>
  );
} 
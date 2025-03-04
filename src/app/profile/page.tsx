'use client';

import { useGame } from '@/lib/GameContext';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { gameState, gameStats, matchHistory, purchaseHistory, dispatch } = useGame();
  const { player } = gameState;
  const { wins, losses, pushes, blackjacks, winRate, profit } = gameStats;
  const router = useRouter();
  
  const [addFundsAmount, setAddFundsAmount] = useState(100);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [username, setUsername] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Check if user is logged in and set username from localStorage
  useEffect(() => {
    setMounted(true);
    const storedUsername = localStorage.getItem('blackjack-username');
    const storedPlayerId = localStorage.getItem('blackjack-player-id');
    if (!storedUsername) {
      router.push('/login');
    } else {
      setUsername(storedUsername);
      setPlayerId(storedPlayerId);
    }
  }, [router]);

  // Handle adding funds
  const handleAddFunds = () => {
    // In a real app, this would integrate with a payment processor
    // For now, we'll just update the balance directly
    dispatch({ type: 'ADD_FUNDS', payload: addFundsAmount });
    
    // Show success message
    setSuccessMessage('Funds added successfully! (Demo mode)');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Handle logout
  const handleLogout = () => {
    if (showLogoutConfirm) {
      // Reset all game data in the context
      dispatch({ type: 'RESET_ALL_DATA' });
      dispatch({ type: 'RESET_STATS' });
      dispatch({ type: 'CLEAR_HISTORY' });
      
      // Clear ALL localStorage
      localStorage.clear();
      
      // Redirect to the login page
      router.push('/login');
    } else {
      // Show confirmation first
      setShowLogoutConfirm(true);
    }
  };

  // Get result color based on game result
  const getResultColor = (result: string) => {
    switch (result) {
      case 'win': return 'text-green-500';
      case 'blackjack': return 'text-yellow-500';
      case 'push': return 'text-blue-500';
      case 'lose': return 'text-red-500';
      default: return 'text-white';
    }
  };

  // Get card display value
  const getCardDisplay = (rank: string, suit: string) => {
    const suitSymbol = {
      'hearts': '♥',
      'diamonds': '♦',
      'clubs': '♣',
      'spades': '♠'
    }[suit] || '';
    
    const suitColor = suit === 'hearts' || suit === 'diamonds' ? 'text-red-500' : 'text-white';
    
    return (
      <span className={suitColor}>
        {rank}{suitSymbol}
      </span>
    );
  };
  
  // If not mounted yet, show a simple loading state to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="w-full max-w-4xl mx-auto py-8 px-4">
        <div className="bg-black/30 p-6 rounded-xl backdrop-blur-sm shadow-xl">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="text-center">
              <svg className="animate-spin h-10 w-10 text-yellow-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-lg">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <motion.div 
        className="bg-black/30 p-6 rounded-xl backdrop-blur-sm shadow-xl relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logout Button in top right */}
        <div className="absolute top-6 right-6">
          <motion.button 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              showLogoutConfirm 
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' 
                : 'bg-black/40 text-white hover:bg-black/60 border border-yellow-500/30 hover:border-yellow-500/50'
            }`}
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={1.5} 
              stroke="currentColor" 
              className="w-5 h-5"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" 
              />
            </svg>
            {showLogoutConfirm ? 'Confirm Logout' : 'Logout'}
          </motion.button>
          
          {showLogoutConfirm && (
            <motion.p 
              className="text-red-500 mt-2 text-sm absolute right-0 bg-black/60 px-3 py-1 rounded-md shadow-md"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              Warning: This will reset ALL your game data including your username. Click again to confirm logout.
            </motion.p>
          )}
        </div>

        <h1 className="text-3xl font-bold mb-6 border-b border-white/20 pb-4">
          My Profile
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Player Info */}
          <div className="col-span-1">
            <div className="bg-black/40 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-yellow-500 text-black p-3 rounded-full">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="currentColor" 
                    className="w-8 h-8"
                  >
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{username || 'Player'}</h2>
                  <p className="text-gray-400">Player ID: {playerId || 'N/A'}</p>
                </div>
              </div>
              
              {/* Balance Display */}
              <div className="bg-black/30 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-400 mb-1">Current Balance</div>
                <div className="text-3xl font-bold text-yellow-400">${player.balance}</div>
              </div>
              
              {/* Add Funds Form */}
              <div className="border-t border-white/10 pt-4">
                <h3 className="text-lg font-bold mb-4">Add Funds</h3>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[100, 200, 500, 1000].map(amount => (
                    <button
                      key={amount}
                      className={`px-3 py-1 rounded text-sm ${
                        addFundsAmount === amount 
                          ? 'bg-yellow-500 text-black font-bold' 
                          : 'bg-white/10'
                      }`}
                      onClick={() => setAddFundsAmount(amount)}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
                
                <button
                  className="btn btn-primary w-full"
                  onClick={handleAddFunds}
                >
                  Add ${addFundsAmount}
                </button>
                
                {showSuccess && (
                  <motion.p 
                    className="text-green-500 mt-2 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {successMessage}
                  </motion.p>
                )}
              </div>
              
              {/* Purchase History */}
              <div className="border-t border-white/10 pt-4 mt-4">
                <h3 className="text-lg font-bold mb-4">Purchase History</h3>
                
                {purchaseHistory.length === 0 ? (
                  <div className="text-center py-2 text-gray-400">
                    <p>No purchase history yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {purchaseHistory.map((purchase) => (
                      <motion.div 
                        key={purchase.id}
                        className="bg-black/30 rounded-lg p-4 border-l-4 border-yellow-500 border-opacity-70"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <div className="text-green-500 font-bold text-lg">
                            +${purchase.amount}
                          </div>
                          <div className="bg-black/20 px-2 py-1 rounded text-gray-400 text-xs">
                            {purchase.date instanceof Date 
                              ? formatDistanceToNow(purchase.date, { addSuffix: true }) 
                              : formatDistanceToNow(new Date(purchase.date), { addSuffix: true })}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          Transaction ID: {purchase.id.substring(0, 8)}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Statistics */}
          <div className="col-span-2">
            <h2 className="text-2xl font-bold mb-4">Game Statistics</h2>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-black/40 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Total Games</div>
                <div className="text-3xl font-bold">{wins + losses + pushes}</div>
              </div>
              
              <div className="bg-black/40 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Wins</div>
                <div className="text-3xl font-bold text-green-500">{wins}</div>
              </div>
              
              <div className="bg-black/40 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Losses</div>
                <div className="text-3xl font-bold text-red-500">{losses}</div>
              </div>
              
              <div className="bg-black/40 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Pushes</div>
                <div className="text-3xl font-bold text-blue-500">{pushes}</div>
              </div>
              
              <div className="bg-black/40 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Blackjacks</div>
                <div className="text-3xl font-bold text-yellow-500">{blackjacks}</div>
              </div>
              
              <div className="bg-black/40 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Win Rate</div>
                <div className="text-3xl font-bold">{winRate.toFixed(1)}%</div>
              </div>
            </div>
            
            {/* Profit/Loss */}
            <div className="bg-black/40 rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Total Profit/Loss</div>
                  <div className={`text-3xl font-bold ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {profit >= 0 ? '+$' + profit : '-$' + Math.abs(profit)}
                  </div>
                </div>
                
                <div className={`text-sm ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {profit >= 0 ? '▲' : '▼'} {Math.abs(profit / (wins + losses + pushes || 1)).toFixed(2)} per game
                </div>
              </div>
            </div>
            
            {/* Match History */}
            <div className="bg-black/40 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-bold mb-4">Match History</h3>
              
              {matchHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>No match history yet. Play some games to see your history here!</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {matchHistory.map((match) => (
                    <motion.div 
                      key={match.id}
                      className="bg-black/30 rounded-lg p-4 border-l-4 border-opacity-70"
                      style={{ 
                        borderColor: 
                          match.result === 'win' ? '#10B981' : 
                          match.result === 'blackjack' ? '#F59E0B' : 
                          match.result === 'push' ? '#3B82F6' : 
                          '#EF4444' 
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <span className={`font-bold capitalize ${getResultColor(match.result)}`}>
                            {match.result === 'blackjack' ? 'Blackjack!' : match.result}
                          </span>
                          <span className="text-gray-400 text-sm ml-2">
                            {match.date instanceof Date 
                              ? formatDistanceToNow(match.date, { addSuffix: true }) 
                              : formatDistanceToNow(new Date(match.date), { addSuffix: true })}
                          </span>
                        </div>
                        <div className={`font-bold ${match.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {match.profit >= 0 ? '+' : ''}{match.profit}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div>
                          <div className="text-sm text-gray-400 mb-1">Your Hand</div>
                          <div className="flex flex-wrap gap-2">
                            {match.playerCards.map((card, i) => (
                              <div key={i} className="bg-white/10 px-2 py-1 rounded text-sm">
                                {getCardDisplay(card.rank, card.suit)}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-gray-400 mb-1">Dealer&apos;s Hand</div>
                          <div className="flex flex-wrap gap-2">
                            {match.dealerCards.map((card, i) => (
                              <div key={i} className="bg-white/10 px-2 py-1 rounded text-sm">
                                {getCardDisplay(card.rank, card.suit)}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-sm">
                        <span className="text-gray-400">Bet: </span>
                        <span className="font-medium">${match.bet}</span>
                        <span className="text-gray-400 ml-4">Payout: </span>
                        <span className="font-medium">${match.payout}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-4">
              <Link href="/game">
                <button className="btn btn-primary">Play Game</button>
              </Link>
              <Link href="/settings">
                <button className="btn btn-secondary">Game Settings</button>
              </Link>
              
              {showSuccess && (
                <motion.p 
                  className="text-green-500 mt-2 text-sm w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {successMessage}
                </motion.p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
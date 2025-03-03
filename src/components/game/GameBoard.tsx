'use client';

import { useGame } from '@/lib/GameContext';
import Hand from './Hand';
import GameControls from './GameControls';
import GameStatus from './GameStatus';
import { motion } from 'framer-motion';

export default function GameBoard() {
  const { gameState } = useGame();
  const { dealer, player, currentHandIndex, gamePhase, gameResult } = gameState;
  
  // Function to get the appropriate divider text based on game state
  const getDividerText = () => {
    if (gamePhase === 'betting') {
      return 'Place Your Bet';
    } else if (gamePhase === 'gameOver') {
      // For split hands, show the detailed message
      if (player.hands.length > 1) {
        return gameState.message;
      }
      
      // For single hand, show the standard result
      if (gameResult) {
        switch(gameResult) {
          case 'blackjack':
            return 'Blackjack!';
          case 'win':
            return 'You Win!';
          case 'lose':
            return 'Dealer Wins';
          case 'push':
            return 'Push - Tie Game';
          default:
            return 'Game Over';
        }
      }
      return 'Game Over';
    } else {
      // Default text during gameplay
      return 'Good Luck!';
    }
  };
  
  // Get the appropriate color for the divider based on game result
  const getDividerColor = () => {
    if (gamePhase !== 'gameOver' || !gameResult) return 'bg-yellow-500';
    
    switch(gameResult) {
      case 'blackjack':
        return 'bg-yellow-400';
      case 'win':
        return 'bg-green-500';
      case 'lose':
        return 'bg-red-500';
      case 'push':
        return 'bg-blue-500';
      default:
        return 'bg-yellow-500';
    }
  };
  
  return (
    <motion.div 
      className="w-full max-w-4xl mx-auto bg-black/30 p-4 rounded-xl backdrop-blur-sm shadow-xl"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col gap-2 min-h-[650px]">
        {/* Game status */}
        <GameStatus />
        
        {/* Dealer's area */}
        <div className="p-3 rounded-lg bg-black/20 border border-yellow-500/50">
          <Hand hand={dealer} isDealer={true} />
        </div>
        
        {/* Table felt divider */}
        <div className="border-t-4 border-dotted border-yellow-500/30 relative flex justify-center items-center py-1">
          <motion.div 
            className={`${getDividerColor()} text-black px-6 py-1 rounded-full font-bold text-center shadow-lg mt-1 ${player.hands.length > 1 && gamePhase === 'gameOver' ? 'text-xs' : 'text-base'}`}
            key={getDividerText()} // Force animation to restart when text changes
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            {getDividerText()}
          </motion.div>
        </div>
        
        {/* Player's area */}
        <div className="p-3 rounded-lg bg-black/20 border border-yellow-500/50 mb-0">
          {player.hands.length === 2 ? (
            // Horizontal layout for exactly two hands (first split)
            <div className="flex flex-row justify-center gap-4">
              {player.hands.map((hand, index) => (
                <Hand 
                  key={index}
                  hand={hand}
                  currentHand={index === currentHandIndex && gamePhase === 'playerTurn'}
                />
              ))}
            </div>
          ) : (
            // Vertical layout for one hand or more than two hands
            <div className="flex flex-col items-center">
              {player.hands.map((hand, index) => (
                <Hand 
                  key={index}
                  hand={hand}
                  currentHand={index === currentHandIndex && gamePhase === 'playerTurn'}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Game controls - with fixed height container */}
        <div className="h-[180px] flex items-start justify-center">
          <GameControls />
        </div>
      </div>
    </motion.div>
  );
}
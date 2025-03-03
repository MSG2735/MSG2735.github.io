'use client';

import { useGame } from '@/lib/GameContext';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { canDoubleDown, canSplit, defaultSettings } from '@/lib/gameUtils';
import Chip from './Chip';

export default function GameControls() {
  const { gameState, dispatch, settings } = useGame();
  const { gamePhase, player, currentHandIndex } = gameState;
  const [betAmount, setBetAmount] = useState(0);
  
  // Define available actions based on game phase
  const isBettingPhase = gamePhase === 'betting';
  const isPlayerTurn = gamePhase === 'playerTurn';
  const isDealerTurn = gamePhase === 'dealerTurn';
  const isGameOver = gamePhase === 'gameOver';
  
  // Show action buttons during player turn and dealer turn
  const showActionButtons = isPlayerTurn || isDealerTurn;
  
  // Get current hand
  const currentHand = player.hands[currentHandIndex];
  
  // Check if actions are available
  const canDouble = isPlayerTurn && 
                    currentHand && 
                    canDoubleDown(
                      currentHand, 
                      player.balance, 
                      settings || { ...defaultSettings, allowDoubleAfterSplit: true }
                    );
  const canSplitHand = isPlayerTurn && canSplit(currentHand) && player.balance >= currentHand.bet;
  
  // Chip values
  const chipValues = [5, 10, 25, 50, 100];
  
  // Handle chip click
  const handleChipClick = (value: number) => {
    if (player.balance >= value) {
      setBetAmount(prev => prev + value);
    }
  };
  
  // Handle place bet
  const handlePlaceBet = () => {
    if (betAmount > 0 && betAmount <= player.balance) {
      dispatch({ type: 'PLACE_BET', payload: betAmount });
      dispatch({ type: 'DEAL_INITIAL_CARDS' });
      setBetAmount(0);
    }
  };
  
  // Handle clear bet
  const handleClearBet = () => {
    setBetAmount(0);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Betting controls */}
      {isBettingPhase && (
        <motion.div 
          className="flex flex-col gap-1 w-full h-full justify-end pb-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Chips for betting */}
          <div className="flex justify-center gap-3 mb-2">
            {chipValues.map((value) => (
              <Chip 
                key={value} 
                value={value} 
                onClick={() => handleChipClick(value)}
                disabled={player.balance < value}
              />
            ))}
          </div>
          
          {/* Bet input and controls */}
          <div className="flex items-center justify-center gap-4">
            <div className="relative">
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                className="bg-white/10 border border-white/20 rounded-md px-4 py-2 w-32 text-center text-xl"
                min={0}
                max={player.balance}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl">$</span>
            </div>
            
            <button 
              className="btn btn-primary"
              onClick={handlePlaceBet}
              disabled={betAmount <= 0 || betAmount > player.balance}
            >
              Place Bet
            </button>
            
            <button 
              className="btn btn-secondary"
              onClick={handleClearBet}
              disabled={betAmount <= 0}
            >
              Clear
            </button>
          </div>
        </motion.div>
      )}
      
      {/* Game action controls - visible during player turn and dealer turn */}
      {showActionButtons && (
        <motion.div 
          className="flex flex-col gap-4 w-full h-full justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {isDealerTurn && (
            <div className="text-yellow-500 font-bold mb-1 flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Dealer is playing...
            </div>
          )}
          
          <div className="flex justify-center gap-3">
            <button 
              className="btn btn-primary w-24"
              onClick={() => dispatch({ type: 'HIT' })}
              disabled={!isPlayerTurn}
            >
              Hit
            </button>
            
            <button 
              className="btn btn-primary w-24"
              onClick={() => dispatch({ type: 'STAND' })}
              disabled={!isPlayerTurn}
            >
              Stand
            </button>
            
            <button 
              className={`btn w-36 ${canDouble ? 'btn-primary' : 'btn-disabled'}`}
              onClick={canDouble ? () => dispatch({ type: 'DOUBLE_DOWN' }) : undefined}
              disabled={!canDouble}
            >
              Double Down
            </button>
            
            <button 
              className={`btn w-24 ${canSplitHand ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-600' : 'btn-disabled'}`}
              onClick={canSplitHand ? () => dispatch({ type: 'SPLIT' }) : undefined}
              disabled={!canSplitHand}
            >
              Split
            </button>
          </div>
        </motion.div>
      )}
      
      {/* Game over controls */}
      {isGameOver && (
        <motion.div 
          className="flex justify-center w-full h-full items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button 
            className="btn btn-primary"
            onClick={() => dispatch({ type: 'NEW_GAME' })}
          >
            New Game
          </button>
        </motion.div>
      )}
      
      {/* Placeholder for when no controls are visible to maintain height */}
      {!isBettingPhase && !showActionButtons && !isGameOver && (
        <div className="h-full w-full"></div>
      )}
    </div>
  );
} 
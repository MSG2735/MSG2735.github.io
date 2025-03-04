'use client';

import { createContext, useContext, useReducer, ReactNode, useEffect, useState, useCallback } from 'react';
import { GameState, GameStats, GameSettings, ActionType, Hand, Card, MatchHistoryEntry, PurchaseHistoryEntry } from '@/types/game';
import { createDeck, dealCard, calculateHandValue, isBlackjack, isBusted, determineWinner, defaultSettings } from './gameUtils';
import { soundManager } from './soundEffects';

// Initial game state
const initialGameState: GameState = {
  deck: [],
  dealer: {
    cards: [],
    bet: 0,
    doubleDown: false,
    insurance: false,
    insuranceBet: 0,
    isStanding: false,
    isBusted: false,
    isBlackjack: false,
    isSplit: false,
  },
  player: {
    hands: [
      {
        cards: [],
        bet: 0,
        doubleDown: false,
        insurance: false,
        insuranceBet: 0,
        isStanding: false,
        isBusted: false,
        isBlackjack: false,
        isSplit: false,
      },
    ],
    balance: 1000,
    name: 'Player',
    id: '1',
  },
  currentHandIndex: 0,
  gamePhase: 'betting',
  message: 'Place your bet to start the game.',
  gameResult: null,
  handResults: null,
  lastBetAmount: 0,
};

// Initial game statistics
const initialGameStats: GameStats = {
  wins: 0,
  losses: 0,
  pushes: 0,
  blackjacks: 0,
  winRate: 0,
  profit: 0,
};

// Initial match history
const initialMatchHistory: MatchHistoryEntry[] = [];

// Initial purchase history
const initialPurchaseHistory: PurchaseHistoryEntry[] = [];

// Context types
type GameContextType = {
  gameState: GameState;
  gameStats: GameStats;
  matchHistory: MatchHistoryEntry[];
  purchaseHistory: PurchaseHistoryEntry[];
  settings: GameSettings;
  dispatch: (action: GameAction) => void;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
};

// Action types
type GameAction =
  | { type: 'DEAL_INITIAL_CARDS' }
  | { type: 'PLACE_BET'; payload: number }
  | { type: 'HIT' }
  | { type: 'STAND' }
  | { type: 'DOUBLE_DOWN' }
  | { type: 'SPLIT' }
  | { type: 'INSURANCE' }
  | { type: 'SURRENDER' }
  | { type: 'DEALER_PLAY' }
  | { type: 'EVALUATE_HANDS' }
  | { type: 'NEW_GAME' }
  | { type: 'CLEAR_BET' }
  | { type: 'UPDATE_BALANCE'; payload: number }
  | { type: 'ADD_FUNDS'; payload: number }
  | { type: 'RESET_ALL_DATA' }
  | { type: 'RESET_STATS' }
  | { type: 'CLEAR_HISTORY' };

// Match history action types
type MatchHistoryAction =
  | { type: 'ADD_MATCH'; payload: MatchHistoryEntry }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'LOAD_HISTORY'; payload: MatchHistoryEntry[] };

// Purchase history action types
type PurchaseHistoryAction =
  | { type: 'ADD_PURCHASE'; payload: PurchaseHistoryEntry }
  | { type: 'CLEAR_PURCHASES' }
  | { type: 'LOAD_PURCHASES'; payload: PurchaseHistoryEntry[] };

// Stats action types
type StatsAction =
  | { type: 'EVALUATE_HANDS'; gameState?: GameState }
  | { type: 'NEW_GAME' }
  | { type: 'LOAD_STATS'; payload: GameStats }
  | { type: 'RESET_STATS' };

// Settings action types
type SettingsAction = { type: 'UPDATE_SETTINGS'; payload: Partial<GameSettings> };

// Create the context
const GameContext = createContext<GameContextType | undefined>(undefined);

// Game reducer function
import { handleBetPhase, handleInitialDeal, handleHit, handleStand, handleDoubleDown, handleSplit, handleDealerPlay, handleEvaluateHands, handleNewGame } from './gameReducers';

// Game reducer function
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'PLACE_BET':
      return handleBetPhase(state, action.payload);
    case 'DEAL_INITIAL_CARDS':
      return handleInitialDeal(state);
    case 'HIT':
      return handleHit(state);
    case 'STAND':
      return handleStand(state);
    case 'DOUBLE_DOWN':
      return handleDoubleDown(state);
    case 'SPLIT':
      return handleSplit(state);
    case 'DEALER_PLAY':
      return handleDealerPlay(state);
    case 'EVALUATE_HANDS':
      return handleEvaluateHands(state);
    case 'NEW_GAME':
      return handleNewGame(state);
    case 'CLEAR_BET':
      return {
        ...state,
        player: {
          ...state.player,
          hands: [{
            ...initialGameState.player.hands[0],
            bet: 0
          }]
        },
        gamePhase: 'betting',
        message: 'Place your bet to start the game.'
      };
    case 'UPDATE_BALANCE':
      return {
        ...state,
        player: {
          ...state.player,
          balance: action.payload
        }
      };
    case 'ADD_FUNDS':
      return {
        ...state,
        player: {
          ...state.player,
          balance: state.player.balance + action.payload
        }
      };
    case 'RESET_ALL_DATA':
      return initialGameState;
    default:
      return state;
  }
}

// Stats reducer function
function statsReducer(state: GameStats, action: StatsAction): GameStats {
  switch (action.type) {
    case 'EVALUATE_HANDS': {
      if (!action.gameState) return state;
      
      const { player, dealer, gameResult } = action.gameState;
      
      // Extract current stats
      let { wins, losses, pushes, blackjacks, winRate, profit } = state;
      
      // Get game settings from localStorage or use defaults
      const gameSettings = typeof window !== 'undefined' && 
        localStorage.getItem('blackjack-settings') ? 
        JSON.parse(localStorage.getItem('blackjack-settings') || '{}') : 
        defaultSettings;
      
      // For split hands, evaluate each hand individually
      if (player.hands.length > 1) {
        player.hands.forEach(hand => {
          const { result, payout } = determineWinner(hand, dealer, gameSettings);
          const handProfit = payout - hand.bet;
          
          if (result === 'win') {
            wins++;
            profit = handProfit;
          } else if (result === 'lose') {
            losses++;
            profit = handProfit;
          } else if (result === 'push') {
            pushes++;
          } else if (result === 'blackjack') {
            wins++;
            blackjacks++;
            profit = handProfit;
          }
        });
      } else {
        // Single hand evaluation
        if (!gameResult) return state;
        
        const currentHand = player.hands[0];
        const { result: handResult, payout } = determineWinner(currentHand, dealer, gameSettings);
        const handProfit = payout - currentHand.bet;
        
        if (handResult === 'win') {
          wins++;
          profit = handProfit;
        } else if (handResult === 'lose') {
          losses++;
          profit = handProfit;
        } else if (handResult === 'push') {
          pushes++;
        } else if (handResult === 'blackjack') {
          wins++;
          blackjacks++;
          profit = handProfit;
        }
      }
      
      // Calculate win rate
      const totalGames = wins + losses + pushes;
      winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
      
      return {
        wins,
        losses,
        pushes,
        blackjacks,
        winRate,
        profit,
      };
    }
    
    case 'NEW_GAME':
      return state;
      
    case 'LOAD_STATS': {
      const { wins, losses, pushes, blackjacks, profit } = action.payload;
      const totalGames = wins + losses + pushes;
      const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
      
      return {
        wins,
        losses,
        pushes,
        blackjacks,
        winRate,
        profit,
      };
    }
    
    case 'RESET_STATS':
      return initialGameStats;
    
    default:
      return state;
  }
}

// Settings reducer
function settingsReducer(state: GameSettings, action: SettingsAction): GameSettings {
  switch (action.type) {
    case 'UPDATE_SETTINGS':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

// Match history reducer
function matchHistoryReducer(state: MatchHistoryEntry[], action: MatchHistoryAction): MatchHistoryEntry[] {
  switch (action.type) {
    case 'ADD_MATCH':
      return [action.payload, ...state];
    case 'CLEAR_HISTORY':
      return [];
    case 'LOAD_HISTORY':
      return action.payload;
    default:
      return state;
  }
}

// Purchase history reducer
function purchaseHistoryReducer(state: PurchaseHistoryEntry[], action: PurchaseHistoryAction): PurchaseHistoryEntry[] {
  switch (action.type) {
    case 'ADD_PURCHASE':
      return [action.payload, ...state];
    case 'CLEAR_PURCHASES':
      return [];
    case 'LOAD_PURCHASES':
      return action.payload;
    default:
      return state;
  }
}

// Game provider component
export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, dispatch] = useReducer(gameReducer, getInitialGameState());
  const [gameStats, statsDispatch] = useReducer(statsReducer, getInitialGameStats());
  const [matchHistory, matchHistoryDispatch] = useReducer(matchHistoryReducer, getInitialMatchHistory());
  const [purchaseHistory, purchaseHistoryDispatch] = useReducer(purchaseHistoryReducer, getInitialPurchaseHistory());
  const [settings, settingsDispatch] = useReducer(settingsReducer, getInitialSettings());
  const [initialized, setInitialized] = useState(false);

  // Create a dispatch function that includes the current settings
  const dispatchWithSettings = useCallback((action: GameAction) => {
    if (action.type === 'ADD_FUNDS') {
      // Create a purchase history entry
      const purchaseEntry: PurchaseHistoryEntry = {
        id: Date.now().toString(),
        date: new Date(),
        amount: action.payload
      };
      
      // Add to purchase history
      purchaseHistoryDispatch({ type: 'ADD_PURCHASE', payload: purchaseEntry });
    }
    
    dispatch(action);
  }, [dispatch]);
  
  // Helper functions to get initial state from localStorage
  function getInitialGameState(): GameState {
    if (typeof window !== 'undefined') {
      try {
        // Try to load the full game state first
        const savedGameState = localStorage.getItem('blackjack-game-state');
        if (savedGameState) {
          const parsedState = JSON.parse(savedGameState) as GameState;
          
          // Convert dates in the state if needed
          return parsedState;
        }
        
        // Fallback to just loading the balance if full state isn't available
        const savedBalance = localStorage.getItem('blackjack-balance');
        if (savedBalance) {
          const balance = parseInt(savedBalance);
          return {
            ...initialGameState,
            player: {
              ...initialGameState.player,
              balance
            }
          };
        }
      } catch (error) {
        console.error('Error loading game state from localStorage:', error);
      }
    }
    return initialGameState;
  }
  
  function getInitialGameStats(): GameStats {
    if (typeof window !== 'undefined') {
      try {
        const savedStats = localStorage.getItem('blackjack-stats');
        if (savedStats) {
          return JSON.parse(savedStats) as GameStats;
        }
      } catch (error) {
        console.error('Error loading stats from localStorage:', error);
      }
    }
    return initialGameStats;
  }
  
  function getInitialMatchHistory(): MatchHistoryEntry[] {
    if (typeof window !== 'undefined') {
      try {
        const savedHistory = localStorage.getItem('blackjack-history');
        if (savedHistory) {
          const history = JSON.parse(savedHistory) as MatchHistoryEntry[];
          // Convert string dates back to Date objects
          return history.map(entry => ({
            ...entry,
            date: new Date(entry.date)
          }));
        }
      } catch (error) {
        console.error('Error loading match history from localStorage:', error);
      }
    }
    return initialMatchHistory;
  }
  
  function getInitialSettings(): GameSettings {
    if (typeof window !== 'undefined') {
      try {
        const savedSettings = localStorage.getItem('blackjack-settings');
        if (savedSettings) {
          // Parse saved settings
          const parsedSettings = JSON.parse(savedSettings) as GameSettings;
          
          // Ensure all settings exist, using defaults for any missing ones
          return {
            ...defaultSettings,
            ...parsedSettings,
            // Override with user preferences from localStorage if they exist
            autoStandOn21: localStorage.getItem('blackjack-autoStandOn21') !== 'false',
            keepBetBetweenRounds: localStorage.getItem('blackjack-keepBetBetweenRounds') !== 'false'
          };
        }
      } catch (error) {
        console.error('Error loading settings from localStorage:', error);
      }
    }
    return defaultSettings;
  }
  
  function getInitialPurchaseHistory(): PurchaseHistoryEntry[] {
    if (typeof window !== 'undefined') {
      try {
        const savedHistory = localStorage.getItem('blackjack-purchase-history');
        if (savedHistory) {
          const history = JSON.parse(savedHistory) as PurchaseHistoryEntry[];
          // Convert string dates back to Date objects
          return history.map(entry => ({
            ...entry,
            date: new Date(entry.date)
          }));
        }
      } catch (error) {
        console.error('Error loading purchase history from localStorage:', error);
      }
    }
    return initialPurchaseHistory;
  }
  
  // Mark as initialized after first render
  useEffect(() => {
    setInitialized(true);
  }, []);
  
  // Update stats when game is evaluated
  useEffect(() => {
    if (gameState.gamePhase === 'evaluating') {
      dispatch({ type: 'EVALUATE_HANDS' });
    }
  }, [gameState.gamePhase]);
  
  // Make dealer play when it's dealer's turn
  useEffect(() => {
    if (gameState.gamePhase === 'dealerTurn') {
      const timer = setTimeout(() => {
        dispatch({ type: 'DEALER_PLAY' });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [gameState.gamePhase]);
  
  // Update stats when game is over
  useEffect(() => {
    if (gameState.gamePhase === 'gameOver') {
      // Create match history entry for each hand
      gameState.player.hands.forEach((hand, index) => {
        const gameSettings = typeof window !== 'undefined' && 
          localStorage.getItem('blackjack-settings') ? 
          JSON.parse(localStorage.getItem('blackjack-settings') || '{}') : 
          defaultSettings;
          
        const { result, payout } = determineWinner(hand, gameState.dealer, gameSettings);
        const profit = payout - hand.bet;
        
        const matchEntry: MatchHistoryEntry = {
          id: `${Date.now()}-${index}`,
          date: new Date(),
          result,
          playerCards: [...hand.cards],
          dealerCards: [...gameState.dealer.cards],
          bet: hand.bet,
          payout,
          profit,
        };
        
        matchHistoryDispatch({ type: 'ADD_MATCH', payload: matchEntry });
      });
      
      // Update stats only once per game
      statsDispatch({ type: 'EVALUATE_HANDS', gameState });
    }
  }, [gameState.gamePhase]);
  
  // Save game state to localStorage
  useEffect(() => {
    if (initialized) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('blackjack-game-state', JSON.stringify(gameState));
        localStorage.setItem('blackjack-stats', JSON.stringify(gameStats));
        localStorage.setItem('blackjack-settings', JSON.stringify(settings));
        localStorage.setItem('blackjack-history', JSON.stringify(matchHistory));
        localStorage.setItem('blackjack-purchase-history', JSON.stringify(purchaseHistory));
      }
    }
  }, [gameState, gameStats, settings, matchHistory, purchaseHistory, initialized]);
  
  // Handle reset actions
  const handleReset = () => {
    // Reset game state
    dispatch({ type: 'RESET_ALL_DATA' });
    
    // Reset stats
    statsDispatch({ type: 'RESET_STATS' });
    matchHistoryDispatch({ type: 'CLEAR_HISTORY' });
    purchaseHistoryDispatch({ type: 'CLEAR_PURCHASES' });
  };
  
  // Listen for reset action
  useEffect(() => {
    if (gameState === initialGameState) {
      handleReset();
    }
  }, [gameState]);
  
  return (
    <GameContext.Provider
      value={{
        gameState,
        gameStats,
        matchHistory,
        purchaseHistory,
        settings,
        dispatch: dispatchWithSettings,
        updateSettings: (newSettings) => settingsDispatch({ type: 'UPDATE_SETTINGS', payload: newSettings }),
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

// Hook to use the game context
export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

function getOrdinalSuffix(num: number): string {
  if (num === 1) return 'st';
  if (num === 2) return 'nd';
  if (num === 3) return 'rd';
  return 'th';
}

// Helper functions for calculating payouts and profits
function calculatePayout(hand: Hand, result: string, settings: GameSettings): number {
  if (result === 'win') {
    return hand.bet * 2;
  } else if (result === 'blackjack') {
    return hand.bet * (1 + settings.blackjackPayout);
  } else if (result === 'push') {
    return hand.bet;
  } else {
    return 0;
  }
}

function calculateProfit(hand: Hand, result: string, settings: GameSettings): number {
  if (result === 'win') {
    return hand.bet;
  } else if (result === 'blackjack') {
    return hand.bet * settings.blackjackPayout;
  } else if (result === 'push') {
    return 0;
  } else {
    return -hand.bet;
  }
}
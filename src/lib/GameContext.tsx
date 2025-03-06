'use client';

import { createContext, useContext, useReducer, ReactNode, useEffect, useState, useCallback } from 'react';
import { GameState, GameStats, GameSettings, ActionType, Hand, Card, MatchHistoryEntry, PurchaseHistoryEntry } from '@/types/game';
import { createDeck, dealCard, calculateHandValue, isBlackjack, isBusted, determineWinner, defaultSettings } from './gameUtils';
import { soundManager } from './soundEffects';
import { authService, gameStateService, gameStatsService, matchHistoryService, purchaseHistoryService, gameSettingsService } from './supabaseService';

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
            profit += handProfit;
          } else if (result === 'lose') {
            losses++;
            profit += handProfit; // This will be negative since payout is 0
          } else if (result === 'push') {
            pushes++;
            // No change to profit for push (player gets bet back)
          } else if (result === 'blackjack') {
            wins++;
            blackjacks++;
            profit += handProfit;
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
          profit += handProfit;
        } else if (handResult === 'lose') {
          losses++;
          profit += handProfit; // This will be negative since payout is 0
        } else if (handResult === 'push') {
          pushes++;
          // No change to profit for push (player gets bet back)
        } else if (handResult === 'blackjack') {
          wins++;
          blackjacks++;
          profit += handProfit;
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
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  const [gameStats, statsDispatch] = useReducer(statsReducer, initialGameStats);
  const [matchHistory, matchHistoryDispatch] = useReducer(matchHistoryReducer, initialMatchHistory);
  const [purchaseHistory, purchaseHistoryDispatch] = useReducer(purchaseHistoryReducer, initialPurchaseHistory);
  const [settings, settingsDispatch] = useReducer(settingsReducer, defaultSettings);
  const [initialized, setInitialized] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
  
  // Load user data from Supabase
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        // Check if user is authenticated
        const { user, error } = await authService.getCurrentUser();
        if (error || !user) {
          // If not authenticated, check for localStorage data for migration
          checkForLocalStorageData();
          setIsLoading(false);
          return;
        }

        setUserId(user.id);

        // Load game state
        const { gameState: loadedGameState } = await gameStateService.loadGameState(user.id);
        if (loadedGameState) {
          dispatch({ type: 'RESET_ALL_DATA' }); // Reset first to avoid merge issues
          // Update player info
          dispatch({ 
            type: 'UPDATE_BALANCE', 
            payload: loadedGameState.player.balance 
          });
          // Load the rest of the state
          // We're not directly setting the state to avoid issues with the reducer
          if (loadedGameState.gamePhase !== 'betting') {
            // Restore the game in progress
            dispatch({ type: 'PLACE_BET', payload: loadedGameState.player.hands[0].bet });
            dispatch({ type: 'DEAL_INITIAL_CARDS' });
            // Additional actions based on game phase would go here
          }
        }

        // Load game stats
        const { gameStats: loadedStats } = await gameStatsService.getGameStats(user.id);
        if (loadedStats) {
          statsDispatch({ type: 'LOAD_STATS', payload: loadedStats });
        }

        // Load match history
        const { matchHistory: loadedMatchHistory } = await matchHistoryService.getMatchHistory(user.id);
        if (loadedMatchHistory) {
          matchHistoryDispatch({ type: 'LOAD_HISTORY', payload: loadedMatchHistory });
        }

        // Load purchase history
        const { purchaseHistory: loadedPurchaseHistory } = await purchaseHistoryService.getPurchaseHistory(user.id);
        if (loadedPurchaseHistory) {
          purchaseHistoryDispatch({ type: 'LOAD_PURCHASES', payload: loadedPurchaseHistory });
        }

        // Load game settings
        const { gameSettings: loadedSettings } = await gameSettingsService.getGameSettings(user.id);
        if (loadedSettings) {
          settingsDispatch({ type: 'UPDATE_SETTINGS', payload: loadedSettings });
        }

        setInitialized(true);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Function to check for localStorage data for migration
  const checkForLocalStorageData = () => {
    if (typeof window === 'undefined') return;

    try {
      // Check if there's localStorage data to migrate later
      const hasLocalData = [
        'blackjack-game-state',
        'blackjack-stats',
        'blackjack-history',
        'blackjack-settings',
        'blackjack-purchase-history'
      ].some(key => localStorage.getItem(key));

      if (hasLocalData) {
        console.log('Local data found for potential migration');
        // We'll migrate this data when the user logs in
      }
    } catch (error) {
      console.error('Error checking localStorage data:', error);
    }
  };

  // Function to migrate localStorage data to Supabase
  const migrateLocalStorageToSupabase = async (userId: string) => {
    if (typeof window === 'undefined') return;

    try {
      // Migrate game state
      const localGameState = localStorage.getItem('blackjack-game-state');
      if (localGameState) {
        const gameState = JSON.parse(localGameState) as GameState;
        await gameStateService.saveGameState(userId, gameState);
      }

      // Migrate stats
      const localStats = localStorage.getItem('blackjack-stats');
      if (localStats) {
        const gameStats = JSON.parse(localStats) as GameStats;
        await gameStatsService.updateGameStats(userId, gameStats);
      }

      // Migrate settings
      const localSettings = localStorage.getItem('blackjack-settings');
      if (localSettings) {
        const gameSettings = JSON.parse(localSettings) as GameSettings;
        await gameSettingsService.updateGameSettings(userId, gameSettings);
      }

      // Migrate match history
      const localHistory = localStorage.getItem('blackjack-history');
      if (localHistory) {
        const history = JSON.parse(localHistory) as MatchHistoryEntry[];
        for (const entry of history) {
          await matchHistoryService.addMatchEntry(userId, entry);
        }
      }

      // Migrate purchase history
      const localPurchaseHistory = localStorage.getItem('blackjack-purchase-history');
      if (localPurchaseHistory) {
        const purchaseHistory = JSON.parse(localPurchaseHistory) as PurchaseHistoryEntry[];
        for (const entry of purchaseHistory) {
          await purchaseHistoryService.addPurchase(userId, entry.amount);
        }
      }

      // Clear localStorage after migration
      localStorage.removeItem('blackjack-game-state');
      localStorage.removeItem('blackjack-stats');
      localStorage.removeItem('blackjack-settings');
      localStorage.removeItem('blackjack-history');
      localStorage.removeItem('blackjack-purchase-history');
      localStorage.removeItem('blackjack-username');
      localStorage.removeItem('blackjack-player-id');
      localStorage.removeItem('blackjack-balance');

      console.log('Migration from localStorage to Supabase complete');
    } catch (error) {
      console.error('Error migrating localStorage data to Supabase:', error);
    }
  };
  
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
  
  // Save game state to Supabase
  useEffect(() => {
    const saveData = async () => {
      if (initialized && userId) {
        try {
          // Save game state
          await gameStateService.saveGameState(userId, gameState);
          
          // Save game stats
          await gameStatsService.updateGameStats(userId, gameStats);
          
          // Save game settings
          await gameSettingsService.updateGameSettings(userId, settings);
          
          // Match history and purchase history are saved individually when they occur
        } catch (error) {
          console.error('Error saving data to Supabase:', error);
        }
      }
    };
    
    saveData();
  }, [gameState, gameStats, settings, initialized, userId]);
  
  // Handle reset actions
  const handleReset = async () => {
    // Reset game state
    dispatch({ type: 'RESET_ALL_DATA' });
    
    // Reset stats
    statsDispatch({ type: 'RESET_STATS' });
    matchHistoryDispatch({ type: 'CLEAR_HISTORY' });
    purchaseHistoryDispatch({ type: 'CLEAR_PURCHASES' });
    
    // If user is logged in, reset data in Supabase too
    if (userId) {
      try {
        // Reset game stats
        await gameStatsService.updateGameStats(userId, initialGameStats);
        
        // Reset game state
        await gameStateService.saveGameState(userId, initialGameState);
        
        // Reset game settings
        await gameSettingsService.updateGameSettings(userId, defaultSettings);
        
        // Note: We don't clear match history or purchase history in the database
        // as those are valuable historical records
      } catch (error) {
        console.error('Error resetting data in Supabase:', error);
      }
    }
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
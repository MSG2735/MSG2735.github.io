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
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'PLACE_BET': {
      const bet = action.payload;
      if (bet <= 0 || bet > state.player.balance) {
        return {
          ...state,
          message: 'Invalid bet amount.',
        };
      }

      soundManager?.play('placeBet');
      
      // Create a new hand with the bet
      const newHand: Hand = {
        cards: [],
        bet,
        doubleDown: false,
        insurance: false,
        insuranceBet: 0,
        isStanding: false,
        isBusted: false,
        isBlackjack: false,
        isSplit: false,
      };

      return {
        ...state,
        player: {
          ...state.player,
          hands: [newHand],
          balance: state.player.balance - bet,
        },
        currentHandIndex: 0,
        gamePhase: 'playerTurn',
        message: 'Dealing cards...',
        gameResult: null,
      };
    }
    
    case 'DEAL_INITIAL_CARDS': {
      // Generate a new shuffled deck
      let newDeck = createDeck(6);
      
      // Deal two cards to the player and two to the dealer
      let playerCard1: Card;
      let dealerCard1: Card;
      let playerCard2: Card;
      let dealerCard2: Card;
      
      [playerCard1, newDeck] = dealCard(newDeck, true);
      soundManager?.play('cardSlide');
      [dealerCard1, newDeck] = dealCard(newDeck, true);
      soundManager?.play('cardSlide');
      [playerCard2, newDeck] = dealCard(newDeck, true);
      soundManager?.play('cardSlide');
      [dealerCard2, newDeck] = dealCard(newDeck, false);
      soundManager?.play('cardSlide');
      
      // Update player's and dealer's hands
      const playerHand = {
        ...state.player.hands[0],
        cards: [playerCard1, playerCard2],
        isBlackjack: isBlackjack({ cards: [playerCard1, playerCard2] } as Hand),
      };
      
      const dealerHand: Hand = {
        cards: [dealerCard1, dealerCard2],
        bet: 0,
        doubleDown: false,
        insurance: false,
        insuranceBet: 0,
        isStanding: false,
        isBusted: false,
        isBlackjack: isBlackjack({ cards: [dealerCard1, dealerCard2] } as Hand),
        isSplit: false,
      };
      
      // Check if player has blackjack
      const playerHasBlackjack = playerHand.isBlackjack;
      const dealerHasBlackjack = dealerHand.isBlackjack;
      
      let gamePhase = state.gamePhase;
      // Check if the hand can be split
      const canSplitInitialHand = playerCard1.rank === playerCard2.rank;
      let message = canSplitInitialHand ? 'Hit, stand, double down, or split.' : 'Hit, stand, or double down.';
      let gameResult: 'win' | 'lose' | 'push' | 'blackjack' | null = null;
      
      // If player has blackjack, move to dealer's turn
      if (playerHasBlackjack) {
        if (dealerHasBlackjack) {
          gamePhase = 'gameOver';
          message = 'Both have blackjack - Push (Bet returned)';
          gameResult = 'push';
        } else {
          const blackjackPayout = playerHand.bet * 1.5;
          gamePhase = 'gameOver';
          message = `Blackjack! (+$${Math.floor(blackjackPayout)})`;
          gameResult = 'blackjack';
        }
      } else if (dealerHasBlackjack) {
        gamePhase = 'gameOver';
        message = `Dealer has blackjack (-$${playerHand.bet})`;
        gameResult = 'lose';
      } else {
        gamePhase = 'playerTurn';
      }
      
      return {
        ...state,
        deck: newDeck,
        player: {
          ...state.player,
          hands: [playerHand],
        },
        dealer: dealerHand,
        gamePhase,
        message,
        gameResult,
      };
    }
    
    case 'HIT': {
      const currentHandIndex = state.currentHandIndex;
      const currentHand = state.player.hands[currentHandIndex];
      
      // Deal a new card to the player
      let newCard: Card;
      let newDeck = [...state.deck];
      [newCard, newDeck] = dealCard(newDeck, true);
      soundManager?.play('revealCard');
      
      // Add the card to the player's hand
      const updatedCards = [...currentHand.cards, newCard];
      
      // Check if player busted
      const updatedHand: Hand = {
        ...currentHand,
        cards: updatedCards,
        isBusted: isBusted({ ...currentHand, cards: updatedCards }),
      };
      
      // Update player's hands
      const updatedHands = [...state.player.hands];
      updatedHands[currentHandIndex] = updatedHand;
      
      // Determine next game phase
      let gamePhase = state.gamePhase;
      let message = state.message;
      
      if (updatedHand.isBusted) {
        // Check if all hands are busted or standing
        const allHandsBustedOrStanding = updatedHands.every(hand => hand.isBusted || hand.isStanding);
        
        if (allHandsBustedOrStanding) {
          // Check if all hands are busted
          const allHandsBusted = updatedHands.every(hand => hand.isBusted);
          
          if (allHandsBusted) {
            gamePhase = 'evaluating';
            message = `All hands busted (-$${updatedHands.reduce((sum, hand) => sum + hand.bet, 0)})`;
          } else {
            gamePhase = 'dealerTurn';
            message = 'Busted - Dealer\'s turn';
          }
        } else {
          // Move to the next hand if available
          const nextHandIndex = currentHandIndex + 1;
          if (nextHandIndex < updatedHands.length) {
            gamePhase = 'playerTurn';
            message = `Playing ${nextHandIndex + 1}${getOrdinalSuffix(nextHandIndex + 1)} hand. Hit, stand, or double down.`;
          } else {
            gamePhase = 'dealerTurn';
            message = 'Dealer\'s turn.';
          }
        }
      } else {
        // Check if hand value is 21
        const { total } = calculateHandValue(updatedHand);
        if (total === 21) {
          updatedHands[currentHandIndex] = { ...updatedHand, isStanding: true };
          
          // Check if all hands are standing or busted
          const allHandsStandingOrBusted = updatedHands.every(hand => hand.isStanding || hand.isBusted);
          
          if (allHandsStandingOrBusted) {
            gamePhase = 'dealerTurn';
            message = 'Player stands with 21. Dealer\'s turn.';
          } else {
            // Move to the next hand
            const nextHandIndex = currentHandIndex + 1;
            if (nextHandIndex < updatedHands.length) {
              gamePhase = 'playerTurn';
              message = `Playing ${nextHandIndex + 1}${getOrdinalSuffix(nextHandIndex + 1)} hand. Hit, stand, or double down.`;
            }
          }
        } else {
          message = 'Hit or Stand?';
        }
      }
      
      return {
        ...state,
        deck: newDeck,
        player: {
          ...state.player,
          hands: updatedHands,
        },
        currentHandIndex: gamePhase === 'playerTurn' && (message.includes('Playing') && message.includes('hand'))
          ? currentHandIndex + 1 
          : currentHandIndex,
        gamePhase,
        message,
      };
    }
    
    case 'STAND': {
      const currentHandIndex = state.currentHandIndex;
      const updatedHands = [...state.player.hands];
      
      // Play the card slide sound when standing
      soundManager?.play('cardSlide');
      
      // Mark the current hand as standing
      updatedHands[currentHandIndex] = {
        ...updatedHands[currentHandIndex],
        isStanding: true,
      };
      
      // Check if all hands are standing or busted
      const allHandsStandingOrBusted = updatedHands.every(hand => hand.isStanding || hand.isBusted);
      
      // Determine next game phase
      let gamePhase = state.gamePhase;
      let message = state.message;
      let nextHandIndex = currentHandIndex;
      
      if (allHandsStandingOrBusted) {
        gamePhase = 'dealerTurn';
        message = 'Dealer\'s turn.';
      } else {
        // Move to the next hand
        nextHandIndex = currentHandIndex + 1;
        if (nextHandIndex < updatedHands.length) {
          gamePhase = 'playerTurn';
          message = `Playing ${nextHandIndex + 1}${getOrdinalSuffix(nextHandIndex + 1)} hand. Hit, stand, or double down.`;
        } else {
          gamePhase = 'dealerTurn';
          message = 'Dealer\'s turn.';
        }
      }
      
      return {
        ...state,
        player: {
          ...state.player,
          hands: updatedHands,
        },
        gamePhase,
        message,
        currentHandIndex: nextHandIndex,
      };
    }
    
    case 'DOUBLE_DOWN': {
      const currentHandIndex = state.currentHandIndex;
      const currentHand = state.player.hands[currentHandIndex];
      const bet = currentHand.bet;
      
      // Check if player can double down
      if (currentHand.cards.length !== 2) {
        return {
          ...state,
          message: 'Can only double down on first two cards.',
        };
      }
      
      // Check if player has enough balance
      if (state.player.balance < bet) {
        return {
          ...state,
          message: 'Not enough balance to double down.',
        };
      }
      
      // If this is a split hand, check if doubling after split is allowed
      if (currentHand.isSplit && !defaultSettings.allowDoubleAfterSplit) {
        return {
          ...state,
          message: 'Doubling down after split is not allowed.',
        };
      }
      
      // Deal one more card to the player
      let newCard: Card;
      let newDeck = [...state.deck];
      [newCard, newDeck] = dealCard(newDeck, true);
      
      // Add the card to the player's hand and mark as standing
      const updatedCards = [...currentHand.cards, newCard];
      
      // Check if player busted
      const updatedHand: Hand = {
        ...currentHand,
        cards: updatedCards,
        bet: bet * 2, // Double the bet
        doubleDown: true,
        isStanding: true, // Player must stand after doubling down
        isBusted: isBusted({ ...currentHand, cards: updatedCards }),
      };
      
      // Update player's hands
      const updatedHands = [...state.player.hands];
      updatedHands[currentHandIndex] = updatedHand;
      
      // Determine next game phase
      let gamePhase = state.gamePhase;
      let message = state.message;
      let nextHandIndex = currentHandIndex;
      
      // Check if all hands are standing or busted
      const allHandsStandingOrBusted = updatedHands.every(hand => hand.isStanding || hand.isBusted);
      
      if (allHandsStandingOrBusted) {
        gamePhase = 'dealerTurn';
        message = 'Dealer\'s turn.';
      } else {
        // Move to the next hand
        nextHandIndex = currentHandIndex + 1;
        if (nextHandIndex < updatedHands.length) {
          gamePhase = 'playerTurn';
          message = `Playing ${nextHandIndex + 1}${getOrdinalSuffix(nextHandIndex + 1)} hand. Hit, stand, or double down.`;
        } else {
          gamePhase = 'dealerTurn';
          message = 'Dealer\'s turn.';
        }
      }
      
      return {
        ...state,
        deck: newDeck,
        player: {
          ...state.player,
          hands: updatedHands,
          balance: state.player.balance - bet, // Deduct the additional bet
        },
        gamePhase,
        message,
        currentHandIndex: nextHandIndex,
      };
    }
    
    case 'SPLIT': {
      const currentHand = state.player.hands[state.currentHandIndex];
      
      // Check if the hand can be split (has exactly 2 cards of the same rank)
      if (currentHand.cards.length !== 2 || 
          currentHand.cards[0].rank !== currentHand.cards[1].rank) {
        return {
          ...state,
          message: 'This hand cannot be split.',
        };
      }
      
      // Check if player has enough balance to place another bet
      if (state.player.balance < currentHand.bet) {
        return {
          ...state,
          message: 'Not enough balance to split.',
        };
      }
      
      // Create two new hands from the split
      const firstCard = currentHand.cards[0];
      const secondCard = currentHand.cards[1];
      
      let newDeck = [...state.deck];
      let newCard1: Card;
      let newCard2: Card;
      
      [newCard1, newDeck] = dealCard(newDeck, true);
      [newCard2, newDeck] = dealCard(newDeck, true);
      
      const firstHand: Hand = {
        cards: [firstCard, newCard1],
        bet: currentHand.bet,
        doubleDown: false,
        insurance: false,
        insuranceBet: 0,
        isStanding: false,
        isBusted: false,
        isBlackjack: false, // A split hand cannot be a blackjack
        isSplit: true,
      };
      
      const secondHand: Hand = {
        cards: [secondCard, newCard2],
        bet: currentHand.bet,
        doubleDown: false,
        insurance: false,
        insuranceBet: 0,
        isStanding: false,
        isBusted: false,
        isBlackjack: false, // A split hand cannot be a blackjack
        isSplit: true,
      };
      
      // Replace the current hand with the two new hands
      const newHands = [...state.player.hands];
      newHands.splice(state.currentHandIndex, 1, firstHand, secondHand);
      
      return {
        ...state,
        deck: newDeck,
        player: {
          ...state.player,
          hands: newHands,
          balance: state.player.balance - currentHand.bet, // Deduct the additional bet
        },
        gamePhase: 'playerTurn',
        message: 'Playing 1st hand. Hit, stand, or double down.',
      };
    }
    
    case 'DEALER_PLAY': {
      // Flip dealer's second card
      const dealerCards = state.dealer.cards.map((card, index) => {
        if (index === 1) {
          soundManager?.play('revealCard');
          return { ...card, faceUp: true };
        }
        return card;
      });
      
      let dealerHand: Hand = {
        ...state.dealer,
        cards: dealerCards,
        isBlackjack: isBlackjack({ ...state.dealer, cards: dealerCards }),
      };
      
      // Dealer must hit until 17 or higher
      let newDeck = [...state.deck];
      while (calculateHandValue(dealerHand).total < 17) {
        let newCard: Card;
        [newCard, newDeck] = dealCard(newDeck, true);
        dealerHand.cards.push(newCard);
      }
      
      // Check if dealer busted
      dealerHand.isBusted = isBusted(dealerHand);
      
      return {
        ...state,
        deck: newDeck,
        dealer: dealerHand,
        gamePhase: 'evaluating',
        message: 'Evaluating hands...',
      };
    }
    
    case 'EVALUATE_HANDS': {
      // Evaluate each player hand against the dealer
      const playerHands = state.player.hands;
      const dealerHand = state.dealer;
      
      // Calculate total winnings
      let totalPayout = 0;
      let result = state.gameResult;
      
      // Evaluate each hand
      if (playerHands.length === 1) {
        // Single hand evaluation
        const { result: handResult, payout } = determineWinner(playerHands[0], dealerHand, defaultSettings);
        totalPayout = payout;
        result = handResult;
      } else {
        // Multiple hands evaluation
        for (const hand of playerHands) {
          const { payout } = determineWinner(hand, dealerHand, defaultSettings);
          totalPayout += payout;
        }
        // For multiple hands, we don't set a specific result
        result = null;
      }
      
      let message = '';
      if (playerHands.length === 1) {
        const bet = playerHands[0].bet;
        const netWin = totalPayout - bet;
        
        switch (result) {
          case 'win':
            // soundManager?.play('playerWins');
            message = `You win (+$${netWin})`;
            break;
          case 'lose':
            // soundManager?.play('playerLoses');
            message = `You lose (-$${bet})`;
            break;
          case 'push':
            // soundManager?.play('gameTie');
            message = 'Push (Bet returned)';
            break;
          case 'blackjack':
            // soundManager?.play('playerBlackjack');
            message = `Blackjack! (+$${netWin})`;
            break;
        }
      } else {
        const totalBet = state.player.hands.reduce((sum, hand) => sum + hand.bet, 0);
        const netWin = totalPayout - totalBet;
        if (netWin > 0) {
          // soundManager?.play('playerWins');
          message = `You win (+$${netWin})`;
        } else if (netWin < 0) {
          // soundManager?.play('playerLoses');
          message = `You lose (-$${Math.abs(netWin)})`;
        } else {
          // soundManager?.play('gameTie');
          message = 'Push (Bet returned)';
        }
      }
      
      return {
        ...state,
        player: {
          ...state.player,
          balance: state.player.balance + totalPayout,
        },
        gamePhase: 'gameOver',
        message,
        gameResult: result,
      };
    }
    
    case 'NEW_GAME': {
      return {
        ...initialGameState,
        player: {
          ...initialGameState.player,
          balance: state.player.balance,
        },
      };
    }
    
    case 'CLEAR_BET': {
      // Return the bet to player's balance and reset the bet
      const currentBet = state.player.hands[0].bet;
      
      return {
        ...state,
        player: {
          ...state.player,
          hands: [
            {
              ...state.player.hands[0],
              bet: 0,
            },
          ],
          balance: state.player.balance + currentBet,
        },
        message: 'Bet cleared. Place your bet to start the game.',
      };
    }
    
    case 'UPDATE_BALANCE': {
      const newBalance = action.payload;
      
      return {
        ...state,
        player: {
          ...state.player,
          balance: newBalance,
        },
      };
    }
    
    case 'ADD_FUNDS': {
      const amount = action.payload;
      
      return {
        ...state,
        player: {
          ...state.player,
          balance: state.player.balance + amount,
        },
      };
    }
    
    case 'RESET_ALL_DATA': {
      return initialGameState;
    }
    
    case 'RESET_STATS':
    case 'CLEAR_HISTORY':
      // These are handled by other reducers
      return state;
    
    default:
      return state;
  }
}

// Stats reducer function
function statsReducer(state: GameStats, action: StatsAction): GameStats {
  switch (action.type) {
    case 'EVALUATE_HANDS': {
      if (!action.gameState) return state;
      
      const { gameResult, player, dealer } = action.gameState;
      let { wins, losses, pushes, blackjacks, profit } = state;
      
      // For split hands, evaluate each hand individually
      if (player.hands.length > 1) {
        player.hands.forEach(hand => {
          const { result, payout } = determineWinner(hand, dealer, defaultSettings);
          const handProfit = payout - hand.bet;
          
          if (result === 'win') {
            wins++;
            profit += handProfit;
          } else if (result === 'lose') {
            losses++;
            profit += handProfit;
          } else if (result === 'push') {
            pushes++;
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
        const { payout } = determineWinner(currentHand, dealer, defaultSettings);
        const handProfit = payout - currentHand.bet;
        
        if (gameResult === 'win') {
          wins++;
          profit += handProfit;
        } else if (gameResult === 'lose') {
          losses++;
          profit += handProfit;
        } else if (gameResult === 'push') {
          pushes++;
        } else if (gameResult === 'blackjack') {
          wins++;
          blackjacks++;
          profit += handProfit;
        }
      }
      
      // Calculate win rate
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
        console.error('Error loading balance from localStorage:', error);
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
          return JSON.parse(savedSettings) as GameSettings;
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
        const { result, payout } = determineWinner(hand, gameState.dealer, settings);
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
        localStorage.setItem('blackjack-game-stats', JSON.stringify(gameStats));
        localStorage.setItem('blackjack-settings', JSON.stringify(settings));
        localStorage.setItem('blackjack-history', JSON.stringify(matchHistory));
        localStorage.setItem('blackjack-purchase-history', JSON.stringify(purchaseHistory));
      }
    }
  }, [gameState.player.balance, gameStats, settings, matchHistory, purchaseHistory, initialized]);
  
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
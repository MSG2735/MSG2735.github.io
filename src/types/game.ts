export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
}

export interface Hand {
  cards: Card[];
  bet: number;
  doubleDown: boolean;
  insurance: boolean;
  insuranceBet: number;
  isStanding: boolean;
  isBusted: boolean;
  isBlackjack: boolean;
  isSplit: boolean;
}

export interface Player {
  hands: Hand[];
  balance: number;
  name: string;
  id: string;
}

export interface GameState {
  deck: Card[];
  dealer: Hand;
  player: Player;
  currentHandIndex: number;
  gamePhase: 'betting' | 'playerTurn' | 'dealerTurn' | 'evaluating' | 'gameOver';
  message: string;
  gameResult: 'win' | 'lose' | 'push' | 'blackjack' | null;
}

export interface GameStats {
  wins: number;
  losses: number;
  pushes: number;
  blackjacks: number;
  winRate: number;
  profit: number;
}

export interface MatchHistoryEntry {
  id: string;
  date: Date;
  result: 'win' | 'lose' | 'push' | 'blackjack';
  playerCards: Card[];
  dealerCards: Card[];
  bet: number;
  payout: number;
  profit: number;
}

export interface PurchaseHistoryEntry {
  id: string;
  date: Date;
  amount: number;
}

export interface GameSettings {
  deckCount: number;
  blackjackPayout: number;
  dealerStandsOnSoft17: boolean;
  allowSurrender: boolean;
  allowDoubleAfterSplit: boolean;
  minimumBet: number;
  maximumBet: number;
  volume: number; // Default: 0.5
}

export type ActionType = 
  | 'hit' 
  | 'stand' 
  | 'doubleDown' 
  | 'split' 
  | 'insurance' 
  | 'surrender' 
  | 'placeBet' 
  | 'newGame' 
  | 'clearBet'; 